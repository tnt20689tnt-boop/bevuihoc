import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Mic, MicOff, Phone, PhoneOff, Users, Volume2 } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/hooks/use-player";
import type { RoomId } from "@/game/rooms";

type VoiceMember = { id: string; name: string };
type VoiceSignal = {
  target: string;
  from: string;
  kind: "invite" | "accept" | "decline" | "cancel" | "offer" | "answer" | "ice" | "leave";
  name?: string;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function CampusVoiceChat({ roomId, profile, selectedPeer, onPeerInviteHandled }: {
  roomId: RoomId;
  profile: Profile;
  selectedPeer: VoiceMember | null;
  onPeerInviteHandled: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [members, setMembers] = useState<VoiceMember[]>([]);
  const [incoming, setIncoming] = useState<VoiceMember[]>([]);
  const [outgoing, setOutgoing] = useState<string[]>([]);
  const [active, setActive] = useState<string[]>([]);
  const [micOn, setMicOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const identityRef = useRef("");
  const nameRef = useRef(profile.display_name?.trim() || "Bạn học");
  const streamRef = useRef<MediaStream | null>(null);
  const connectionsRef = useRef(new Map<string, RTCPeerConnection>());
  const audioRef = useRef(new Map<string, HTMLAudioElement>());
  const pendingIceRef = useRef(new Map<string, RTCIceCandidateInit[]>());
  const activeRef = useRef(new Set<string>());
  nameRef.current = profile.display_name?.trim() || "Bạn học";

  const sendSignal = async (signal: VoiceSignal) => {
    await channelRef.current?.send({ type: "broadcast", event: "voice-signal", payload: signal });
  };

  const closePeer = (peerId: string) => {
    const pc = connectionsRef.current.get(peerId);
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.close();
      connectionsRef.current.delete(peerId);
    }
    const audio = audioRef.current.get(peerId);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      audio.remove();
      audioRef.current.delete(peerId);
    }
    pendingIceRef.current.delete(peerId);
  };

  const createPeer = (peerId: string) => {
    const existing = connectionsRef.current.get(peerId);
    if (existing) return existing;
    const pc = new RTCPeerConnection(ICE_SERVERS);
    connectionsRef.current.set(peerId, pc);
    pc.addTransceiver("audio", { direction: "sendrecv" });
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      const sender = pc.getSenders().find((item) => item.track?.kind === "audio") ??
        pc.getTransceivers().find((item) => item.receiver.track.kind === "audio")?.sender;
      if (sender) void sender.replaceTrack(track);
    }
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        void sendSignal({ target: peerId, from: identityRef.current, kind: "ice", candidate: event.candidate.toJSON() });
      }
    };
    pc.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      let audio = audioRef.current.get(peerId);
      if (!audio) {
        audio = document.createElement("audio");
        audio.autoplay = true;
        audio.setAttribute("playsinline", "true");
        audio.style.display = "none";
        document.body.appendChild(audio);
        audioRef.current.set(peerId, audio);
      }
      audio.srcObject = stream;
      void audio.play().catch(() => setMessage("Chạm vào màn hình để cho phép phát âm thanh"));
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        closePeer(peerId);
        activeRef.current.delete(peerId);
        setActive(Array.from(activeRef.current));
      }
    };
    return pc;
  };

  const makeOffer = async (peerId: string) => {
    const pc = createPeer(peerId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (pc.localDescription) {
        await sendSignal({ target: peerId, from: identityRef.current, kind: "offer", description: pc.localDescription.toJSON() });
      }
    } catch {
      setMessage("Chưa kết nối được. Hãy thử mời lại bạn này.");
    }
  };

  useEffect(() => {
    let alive = true;
    const id = profile.id;
    identityRef.current = id;
    activeRef.current.clear();
    setMembers([]);
    setIncoming([]);
    setOutgoing([]);
    setActive([]);
    setMessage("");

    const channel = supabase.channel(`behocvui-voice:${roomId}`, {
      config: { presence: { key: id }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    const refreshMembers = () => {
      if (!alive) return;
      const state = channel.presenceState<{ id?: string; name?: string }>();
      const next = Object.values(state).flat().flatMap((entry) => {
        if (!entry || typeof entry.id !== "string" || entry.id === id) return [];
        return [{ id: entry.id, name: typeof entry.name === "string" ? entry.name.slice(0, 24) : "Bạn học" }];
      });
      const unique = Array.from(new Map(next.map((item) => [item.id, item])).values());
      setMembers(unique);
      const present = new Set(unique.map((item) => item.id));
      for (const peerId of connectionsRef.current.keys()) {
        if (!present.has(peerId)) {
          closePeer(peerId);
          activeRef.current.delete(peerId);
        }
      }
      setActive(Array.from(activeRef.current));
      setIncoming((list) => list.filter((person) => present.has(person.id)));
      setOutgoing((list) => list.filter((peerId) => present.has(peerId)));
    };

    channel
      .on("presence", { event: "sync" }, refreshMembers)
      .on("presence", { event: "join" }, refreshMembers)
      .on("presence", { event: "leave" }, refreshMembers)
      .on("broadcast", { event: "voice-signal" }, async ({ payload }) => {
        if (!alive || !payload || typeof payload !== "object") return;
        const signal = payload as VoiceSignal;
        if (signal.target !== id || typeof signal.from !== "string" || signal.from === id) return;
        try {
          if (signal.kind === "invite") {
            const inviter = members.find((item) => item.id === signal.from);
            setIncoming((list) => list.some((item) => item.id === signal.from) ? list : [
              ...list, { id: signal.from, name: signal.name || inviter?.name || "Bạn học" },
            ]);
            setExpanded(true);
          } else if (signal.kind === "accept") {
            setOutgoing((list) => list.filter((peerId) => peerId !== signal.from));
            activeRef.current.add(signal.from);
            setActive(Array.from(activeRef.current));
            await makeOffer(signal.from);
          } else if (signal.kind === "decline" || signal.kind === "cancel" || signal.kind === "leave") {
            setOutgoing((list) => list.filter((peerId) => peerId !== signal.from));
            setIncoming((list) => list.filter((item) => item.id !== signal.from));
            activeRef.current.delete(signal.from);
            setActive(Array.from(activeRef.current));
            closePeer(signal.from);
            if (signal.kind === "decline") setMessage("Bạn ấy chưa nhận lời trò chuyện.");
          } else if (signal.kind === "offer" && signal.description) {
            if (!activeRef.current.has(signal.from)) return;
            const pc = createPeer(signal.from);
            await pc.setRemoteDescription(signal.description);
            const queued = pendingIceRef.current.get(signal.from) ?? [];
            pendingIceRef.current.delete(signal.from);
            for (const candidate of queued) await pc.addIceCandidate(candidate);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            if (pc.localDescription) {
              await sendSignal({ target: signal.from, from: id, kind: "answer", description: pc.localDescription.toJSON() });
            }
          } else if (signal.kind === "answer" && signal.description) {
            const pc = connectionsRef.current.get(signal.from);
            if (!pc || pc.remoteDescription) return;
            await pc.setRemoteDescription(signal.description);
            const queued = pendingIceRef.current.get(signal.from) ?? [];
            pendingIceRef.current.delete(signal.from);
            for (const candidate of queued) await pc.addIceCandidate(candidate);
          } else if (signal.kind === "ice" && signal.candidate) {
            const pc = connectionsRef.current.get(signal.from);
            if (pc?.remoteDescription) await pc.addIceCandidate(signal.candidate);
            else {
              const queued = pendingIceRef.current.get(signal.from) ?? [];
              queued.push(signal.candidate);
              pendingIceRef.current.set(signal.from, queued);
            }
          }
        } catch {
          setMessage("Kết nối thoại bị gián đoạn. Hãy thử mời lại bạn.");
        }
      })
      .subscribe(async (status) => {
        if (!alive || status !== "SUBSCRIBED") return;
        await channel.track({ id, name: nameRef.current, joinedAt: Date.now() });
        refreshMembers();
      });

    return () => {
      alive = false;
      if (channelRef.current === channel) channelRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      for (const peerId of Array.from(connectionsRef.current.keys())) closePeer(peerId);
      activeRef.current.clear();
      void supabase.removeChannel(channel);
    };
  }, [roomId, profile.id]);

  const invite = async (person: VoiceMember) => {
    if (outgoing.includes(person.id) || active.includes(person.id)) return;
    setOutgoing((list) => [...list, person.id]);
    await sendSignal({ target: person.id, from: identityRef.current, kind: "invite", name: nameRef.current });
  };

  useEffect(() => {
    if (!selectedPeer || selectedPeer.id === profile.id) return;
    setExpanded(true);
    void invite(selectedPeer);
    onPeerInviteHandled();
  }, [selectedPeer?.id]);

  const acceptInvite = async (person: VoiceMember) => {
    setIncoming((list) => list.filter((item) => item.id !== person.id));
    activeRef.current.add(person.id);
    setActive(Array.from(activeRef.current));
    setExpanded(true);
    await sendSignal({ target: person.id, from: identityRef.current, kind: "accept" });
  };

  const declineInvite = async (person: VoiceMember) => {
    setIncoming((list) => list.filter((item) => item.id !== person.id));
    await sendSignal({ target: person.id, from: identityRef.current, kind: "decline" });
  };

  const leaveCall = async (peerId: string) => {
    activeRef.current.delete(peerId);
    setActive(Array.from(activeRef.current));
    closePeer(peerId);
    await sendSignal({ target: peerId, from: identityRef.current, kind: "leave" });
    if (activeRef.current.size === 0) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setMicOn(false);
    }
  };

  const toggleMicrophone = async () => {
    if (busy || active.length === 0) return;
    setBusy(true);
    setMessage("");
    try {
      if (micOn) {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        for (const pc of connectionsRef.current.values()) {
          const sender = pc.getSenders().find((item) => item.track?.kind === "audio") ??
            pc.getTransceivers().find((item) => item.receiver.track.kind === "audio")?.sender;
          if (sender) await sender.replaceTrack(null);
        }
        setMicOn(false);
      } else {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Trình duyệt này chưa hỗ trợ micro. Hãy mở game bằng Safari hoặc Chrome.");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false,
        });
        streamRef.current = stream;
        for (const pc of connectionsRef.current.values()) {
          const sender = pc.getSenders().find((item) => item.track?.kind === "audio") ??
            pc.getTransceivers().find((item) => item.receiver.track.kind === "audio")?.sender;
          if (sender) await sender.replaceTrack(stream.getAudioTracks()[0] ?? null);
        }
        setMicOn(true);
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Không thể truy cập micro";
      setMessage(detail.includes("Permission") || detail.includes("denied")
        ? "Bạn chưa cấp quyền micro. Hãy cho phép micro trong cài đặt trình duyệt."
        : detail);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setMicOn(false);
    } finally {
      setBusy(false);
    }
  };

  const activeNames = active.map((id) => members.find((item) => item.id === id)?.name || "Bạn học");

  return (
    <section className={`pointer-events-auto absolute bottom-32 right-3 z-20 ${expanded ? "w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-white/80 bg-[#fffdf7]/95 p-3 shadow-xl backdrop-blur-xl" : "rounded-full border border-white/80 bg-[#fffdf7]/95 p-1.5 shadow-lg backdrop-blur-xl"} sm:bottom-5 sm:left-5 sm:right-auto`}>
      {expanded ? (
        <>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><Users size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-slate-800">Giao lưu bằng giọng nói</p>
              <p className="text-[11px] font-semibold text-slate-500">{members.length + 1} người trong phòng</p>
            </div>
            <Volume2 size={17} className="text-emerald-700" />
            <button type="button" onClick={() => setExpanded(false)} aria-label="Thu gọn" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100"><ChevronDown size={19} /></button>
          </div>

          {incoming.length > 0 && (
            <div className="mt-3 space-y-2">
              {incoming.map((person) => (
                <div key={person.id} className="rounded-xl border border-amber-200 bg-amber-50 p-2.5">
                  <p className="text-sm font-bold text-slate-800">{person.name} muốn nói chuyện với bạn</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => void acceptInvite(person)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white"><Phone size={14} /> Chấp nhận</button>
                    <button type="button" onClick={() => void declineInvite(person)} className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-600">Từ chối</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {active.length > 0 && (
            <div className="mt-3 rounded-xl bg-emerald-50 p-2.5">
              <p className="text-xs font-extrabold text-emerald-900">Đang trò chuyện với: {activeNames.join(", ")}</p>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" onClick={() => void toggleMicrophone()} disabled={busy} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold text-white disabled:opacity-60 ${micOn ? "bg-rose-600" : "bg-emerald-700"}`}>
                  {micOn ? <MicOff size={17} /> : <Mic size={17} />}
                  {busy ? "Đang xử lý..." : micOn ? "Tắt mic" : "Bật mic"}
                </button>
                <button type="button" onClick={() => active.forEach((peerId) => void leaveCall(peerId))} aria-label="Kết thúc trò chuyện" className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-700"><PhoneOff size={18} /></button>
              </div>
            </div>
          )}

          <div className="mt-3 max-h-44 space-y-1 overflow-y-auto">
            <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Người đang ở trong phòng</p>
            {members.map((person) => (
              <div key={person.id} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{person.name}</span>
                {active.includes(person.id) ? (
                  <span className="text-[11px] font-bold text-emerald-700">Đang gọi</span>
                ) : outgoing.includes(person.id) ? (
                  <span className="text-[11px] font-bold text-amber-700">Đã gửi lời mời</span>
                ) : (
                  <button type="button" onClick={() => void invite(person)} className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-800">Mời nói chuyện</button>
                )}
              </div>
            ))}
            {members.length === 0 && <p className="px-2 py-3 text-xs text-slate-500">Chưa có người chơi nào khác trong phòng.</p>}
          </div>
          {message && <p role="status" className="mt-2 rounded-lg bg-amber-50 p-2 text-[11px] font-semibold text-amber-900">{message}</p>}
        </>
      ) : (
        <div className="flex items-center gap-1.5">
          {active.length > 0 && (
            <button type="button" onClick={() => void toggleMicrophone()} aria-label={micOn ? "Tắt mic" : "Bật mic"} className={`grid h-10 w-10 place-items-center rounded-full text-white ${micOn ? "bg-rose-600" : "bg-emerald-700"}`}>
              {micOn ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
          )}
          <button type="button" onClick={() => setExpanded(true)} aria-label="Mở giao lưu thoại nhóm" className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-extrabold text-slate-700">
            <Users size={15} />{incoming.length > 0 ? "Lời mời" : active.length > 0 ? "Đang gọi" : "Gọi"}<ChevronUp size={15} className="text-slate-500" />
            {incoming.length > 0 && <span className="h-2 w-2 rounded-full bg-rose-500" />}
          </button>
        </div>
      )}
    </section>
  );
}
