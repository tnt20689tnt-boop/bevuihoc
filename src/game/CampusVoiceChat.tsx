import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Users, Volume2 } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/hooks/use-player";
import type { RoomId } from "@/game/rooms";

type VoiceMember = { id: string; name: string };
type VoiceSignal = {
  target: string;
  from: string;
  kind: "offer" | "answer" | "ice";
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function CampusVoiceChat({ roomId, profile }: { roomId: RoomId; profile: Profile }) {
  const [micOn, setMicOn] = useState(false);
  const [members, setMembers] = useState<VoiceMember[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const identityRef = useRef("");
  const nameRef = useRef(profile.display_name?.trim() || "Bạn học");
  const streamRef = useRef<MediaStream | null>(null);
  const connectionsRef = useRef(new Map<string, RTCPeerConnection>());
  const audioRef = useRef(new Map<string, HTMLAudioElement>());
  const pendingIceRef = useRef(new Map<string, RTCIceCandidateInit[]>());
  nameRef.current = profile.display_name?.trim() || "Bạn học";

  useEffect(() => {
    let alive = true;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `voice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    identityRef.current = id;
    setMembers([]);
    setMessage("");

    const channel = supabase.channel(`behocvui-voice:${roomId}`, {
      config: { presence: { key: id }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    const sendSignal = async (signal: VoiceSignal) => {
      if (!alive) return;
      await channel.send({ type: "broadcast", event: "voice-signal", payload: signal });
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
      const localTrack = streamRef.current?.getAudioTracks()[0];
      if (localTrack) {
        const sender = pc.getSenders().find((item) => item.track?.kind === "audio") ??
          pc.getTransceivers().find((item) => item.receiver.track.kind === "audio")?.sender;
        if (sender) void sender.replaceTrack(localTrack);
      }
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          void sendSignal({
            target: peerId,
            from: id,
            kind: "ice",
            candidate: event.candidate.toJSON(),
          });
        }
      };
      pc.ontrack = (event) => {
        const stream = event.streams[0] ?? new MediaStream([event.track]);
        if (!alive) return;
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
        void audio.play().catch(() => {
          setMessage("Chạm bật micro để cho phép trình duyệt phát âm thanh");
        });
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          closePeer(peerId);
        }
      };
      return pc;
    };

    const makeOffer = async (peerId: string) => {
      if (!alive || id.localeCompare(peerId) >= 0 || connectionsRef.current.has(peerId)) return;
      const pc = createPeer(peerId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (pc.localDescription) {
          await sendSignal({ target: peerId, from: id, kind: "offer", description: pc.localDescription.toJSON() });
        }
      } catch {
        setMessage("Chưa kết nối được với một bạn. Hãy thử vào lại phòng.");
      }
    };

    const refreshMembers = () => {
      if (!alive) return;
      const state = channel.presenceState<{ id?: string; name?: string }>();
      const next = Object.values(state).flat().flatMap((entry) => {
        if (!entry || typeof entry.id !== "string" || entry.id === id) return [];
        return [{ id: entry.id, name: typeof entry.name === "string" ? entry.name.slice(0, 24) : "Bạn học" }];
      });
      const unique = Array.from(new Map(next.map((item) => [item.id, item])).values());
      setMembers(unique);
      const activeIds = new Set(unique.map((item) => item.id));
      for (const peerId of connectionsRef.current.keys()) {
        if (!activeIds.has(peerId)) closePeer(peerId);
      }
      for (const peer of unique) void makeOffer(peer.id);
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
          if (signal.kind === "offer" && signal.description) {
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
          setMessage("Kết nối thoại bị gián đoạn. Hãy thử tắt rồi bật micro lại.");
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
      void supabase.removeChannel(channel);
    };
  }, [roomId]);

  const toggleMicrophone = async () => {
    if (busy) return;
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
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Trình duyệt này chưa hỗ trợ micro. Hãy mở game bằng Safari hoặc Chrome.");
        }
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
        ? "Bạn chưa cấp quyền sử dụng micro. Hãy cho phép micro trong cài đặt trình duyệt."
        : detail);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setMicOn(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="pointer-events-auto absolute bottom-32 right-3 z-20 w-[min(19rem,calc(100vw-1.5rem))] rounded-2xl border border-white/80 bg-[#fffdf7]/95 p-3 shadow-xl backdrop-blur-xl sm:bottom-5 sm:left-5 sm:right-auto">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
          <Users size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-slate-800">Giao lưu bằng giọng nói</p>
          <p className="text-[11px] font-semibold text-slate-500">{members.length + 1} người trong phòng</p>
        </div>
        <Volume2 size={17} className="text-emerald-700" />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">Bạn: {nameRef.current}</span>
        {members.slice(0, 5).map((member) => (
          <span key={member.id} className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900">{member.name}</span>
        ))}
        {members.length > 5 && <span className="px-2 py-1 text-[11px] font-bold text-slate-500">+{members.length - 5}</span>}
      </div>
      <button
        type="button"
        onClick={() => void toggleMicrophone()}
        disabled={busy}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold text-white shadow-sm transition disabled:opacity-60 ${micOn ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-700 hover:bg-emerald-800"}`}
      >
        {micOn ? <MicOff size={18} /> : <Mic size={18} />}
        {busy ? "Đang kết nối..." : micOn ? "Tắt micro" : "Bật micro để trò chuyện"}
      </button>
      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        Bạn sẽ nghe các bạn trong cùng phòng. Chỉ gửi tiếng nói khi micro đang bật.
      </p>
      {message && <p role="status" className="mt-2 rounded-lg bg-amber-50 p-2 text-[11px] font-semibold text-amber-900">{message}</p>}
    </section>
  );
}
