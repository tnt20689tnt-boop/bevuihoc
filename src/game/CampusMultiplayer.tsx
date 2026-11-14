import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Character3D, makeAnimState, type AnimState } from "@/game/Character3D";
import { reconcilePresencePlayers, type PresenceSyncPlayer } from "@/game/multiplayerState";
import { toAvatar } from "@/lib/avatar";
import type { Profile } from "@/hooks/use-player";
import { ROOMS, type RoomId } from "@/game/rooms";

type Position = { x: number; z: number; ry: number };
type CampusPeer = PresenceSyncPlayer & {
  avatar: unknown;
  roomId: RoomId;
  grade?: number | undefined;
};
type Props = {
  roomId: RoomId;
  profile: Profile;
  positionRef: MutableRefObject<Position>;
  onSelectPeer: (peer: { id: string; name: string }) => void;
};

export function CampusMultiplayer({ roomId, profile, positionRef, onSelectPeer }: Props) {
  const [peers, setPeers] = useState<CampusPeer[]>([]);
  const [showPresenceDetails, setShowPresenceDetails] = useState(false);
  const publicNameRef = useRef(profile.display_name);
  publicNameRef.current = profile.display_name?.trim() || "Bạn học";
  const channelRef = useRef<RealtimeChannel | null>(null);
  const identityRef = useRef("");
  const seqRef = useRef(0);
  const lastSentRef = useRef(0);
  const lastSentPositionRef = useRef<Position | null>(null);
  const peersRef = useRef(peers);
  peersRef.current = peers;

  useEffect(() => {
    let alive = true;
    const id = profile.id;
    identityRef.current = id;
    setPeers([]);

    const channel = supabase.channel(`behocvui-room:${roomId}`, {
      config: { presence: { key: id }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    const refreshPresence = () => {
      if (!alive) return;
      const next = reconcilePresencePlayers(
        peersRef.current.filter((peer) => peer.roomId === roomId),
        channel.presenceState<CampusPeer>(),
        id,
        Date.now(),
      );
      setPeers(next.filter((peer) => peer.roomId === roomId && Math.hypot(peer.x, peer.z) <= ROOMS[roomId].radius + 1));
    };

    channel
      .on("presence", { event: "sync" }, refreshPresence)
      .on("presence", { event: "join" }, refreshPresence)
      .on("presence", { event: "leave" }, refreshPresence)
      .on("broadcast", { event: "move" }, ({ payload }) => {
        if (!alive || !payload || typeof payload !== "object") return;
        const incoming = payload as CampusPeer;
        if (incoming.id === id || incoming.roomId !== roomId || typeof incoming.id !== "string") return;
        if (!Number.isFinite(incoming.x) || !Number.isFinite(incoming.z) || Math.hypot(incoming.x, incoming.z) > ROOMS[roomId].radius + 1) return;
        setPeers((current) => {
          const old = current.find((peer) => peer.id === incoming.id);
          if (old && Number(old.seq ?? 0) > Number(incoming.seq ?? 0)) return current;
          const safe: CampusPeer = {
            ...incoming,
            name: typeof incoming.name === "string" ? incoming.name.slice(0, 24) : "Bạn học",
            x: Number.isFinite(incoming.x) ? incoming.x : 0,
            z: Number.isFinite(incoming.z) ? incoming.z : 0,
            rot: Number.isFinite(incoming.rot) ? incoming.rot : 0,
            updatedAt: Date.now(),
            seq: typeof incoming.seq === "number" && Number.isFinite(incoming.seq) ? incoming.seq : 0,
            roomId,
            grade: Number.isFinite(incoming.grade) ? Number(incoming.grade) : undefined,
          };
          return [...current.filter((peer) => peer.id !== safe.id), safe];
        });
      })
      .subscribe(async (status) => {
        if (!alive || status !== "SUBSCRIBED") return;
        const p = positionRef.current;
        await channel.track({
          id,
          name: publicNameRef.current,
          avatar: profile.avatar,
          grade: profile.grade,
          roomId,
          x: p.x,
          z: p.z,
          rot: p.ry,
          updatedAt: Date.now(),
          seq: 0,
        });
      });

    return () => {
      alive = false;
      if (channelRef.current === channel) channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [roomId, profile.id, profile.avatar, profile.display_name, profile.grade, positionRef]);

  useFrame(() => {
    const channel = channelRef.current;
    if (!channel) return;
    const now = performance.now();
    const p = positionRef.current;
    const previous = lastSentPositionRef.current;
    const moved = !previous || Math.hypot(p.x - previous.x, p.z - previous.z) > 0.035;
    const turned = !previous || Math.abs(Math.atan2(Math.sin(p.ry - previous.ry), Math.cos(p.ry - previous.ry))) > 0.08;
    // Avoid flooding Realtime while idle; send a heartbeat so peers can still detect us.
    if (now - lastSentRef.current < 120 || (!moved && !turned && now - lastSentRef.current < 1800)) return;
    lastSentRef.current = now;
    lastSentPositionRef.current = { x: p.x, z: p.z, ry: p.ry };
    const seq = ++seqRef.current;
    void channel.send({
      type: "broadcast",
      event: "move",
      payload: {
        id: identityRef.current,
        name: publicNameRef.current,
        avatar: profile.avatar,
        grade: profile.grade,
        roomId,
        x: p.x,
        z: p.z,
        rot: p.ry,
        updatedAt: Date.now(),
        seq,
      },
    });
  });

  const locateShelf = (x: number, z: number) => {
    const shelves = [
      { x: -5.5, z: -6.5, label: "Kệ Toán", icon: "📐" },
      { x: 0, z: -6.5, label: "Kệ Tiếng Việt", icon: "📖" },
      { x: 5.5, z: -6.5, label: "Kệ Tiếng Anh", icon: "🔤" },
    ];
    const nearest = shelves.reduce((best, shelf) =>
      Math.hypot(x - shelf.x, z - shelf.z) < Math.hypot(x - best.x, z - best.z) ? shelf : best
    );
    return Math.hypot(x - nearest.x, z - nearest.z) < 4 ? `${nearest.icon} ${nearest.label}` : "Đang khám phá sảnh";
  };

  return (
    <group>
      {roomId === "library" && (
        <Html fullscreen zIndexRange={[250, 0]}>
          <aside className="pointer-events-none fixed left-2 top-24 z-20 w-36 max-w-[42vw] sm:left-4 sm:top-28 sm:w-40">
            <section className="pointer-events-auto overflow-hidden rounded-xl border border-white/80 bg-[#fffaf0]/95 text-slate-800 shadow-lg backdrop-blur">
              <button
                type="button"
                onClick={() => setShowPresenceDetails((open) => !open)}
                aria-expanded={showPresenceDetails}
                className="flex w-full items-center justify-between gap-2 bg-emerald-700 px-2 py-2 text-left text-white"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[10px] font-black">👥 Ở THƯ VIỆN</span>
                  <span className="block text-[9px] text-emerald-100">Đang trực tuyến</span>
                </span>
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-black">{peers.length + 1}</span>
                <span className="shrink-0 text-[10px]">{showPresenceDetails ? "▲" : "▼"}</span>
              </button>
              {showPresenceDetails && (
                <div className="max-h-28 space-y-1 overflow-y-auto p-1.5">
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 p-1.5">
                    <span className="text-sm">🎓</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-extrabold">{profile.display_name || "Bạn"} (bạn)</p>
                      <p className="truncate text-[9px] text-emerald-700">Lớp {profile.grade} · {locateShelf(positionRef.current.x, positionRef.current.z)}</p>
                    </div>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  </div>
                  {peers.map((peer) => (
                    <div key={peer.id} className="flex items-center gap-1.5 rounded-lg p-1.5 hover:bg-amber-50">
                      <span className="text-sm">🧒</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-extrabold">{peer.name || "Bạn học"}</p>
                        <p className="truncate text-[9px] text-slate-500">Lớp {peer.grade ?? "—"} · {locateShelf(peer.x, peer.z)}</p>
                      </div>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    </div>
                  ))}
                  {peers.length === 0 && <p className="px-1 py-1.5 text-center text-[9px] leading-3 text-slate-500">Chưa có bạn nào khác trong thư viện.</p>}
                </div>
              )}
            </section>
          </aside>
        </Html>
      )}
      {peers.map((peer) => (
        <RemoteCampusAvatar key={peer.id} peer={peer} onSelectPeer={onSelectPeer} />
      ))}
    </group>
  );
}

function RemoteCampusAvatar({ peer, onSelectPeer }: { peer: CampusPeer; onSelectPeer: Props["onSelectPeer"] }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector3(peer.x, 0, peer.z));
  const previous = useRef(new THREE.Vector3(peer.x, 0, peer.z));
  const animation = useRef<AnimState>(makeAnimState());
  const avatar = toAvatar(peer.avatar);

  useEffect(() => {
    target.current.set(peer.x, 0, peer.z);
  }, [peer.x, peer.z]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.05);
    group.current.position.lerp(target.current, 1 - Math.exp(-14 * dt));
    const moved = group.current.position.distanceTo(previous.current) > 0.005;
    animation.current.motion = moved ? "walk" : "idle";
    if (moved) {
      group.current.rotation.y = Math.atan2(
        target.current.x - previous.current.x,
        target.current.z - previous.current.z,
      );
    }
    previous.current.copy(group.current.position);
  });

  return (
    <group
      ref={group}
      position={[peer.x, 0, peer.z]}
      rotation={[0, peer.rot, 0]}
      onClick={(event) => { event.stopPropagation(); onSelectPeer({ id: peer.id, name: peer.name || "Bạn học" }); }}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "auto"; }}
    >
      <Character3D avatar={avatar} state={animation} />
      <Html position={[0, 2.05, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <span style={{
          display: "block",
          whiteSpace: "nowrap",
          borderRadius: 10,
          padding: "3px 8px",
          color: "#26344b",
          background: "#fff9e7",
          border: "1px solid #ffffff",
          font: "800 11px 'Nunito', sans-serif",
          boxShadow: "0 2px 8px #1b2c4630",
        }}>{peer.name || "Bạn học"}</span>
      </Html>
    </group>
  );
}
