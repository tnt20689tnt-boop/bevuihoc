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
};
type Props = {
  roomId: RoomId;
  profile: Profile;
  positionRef: MutableRefObject<Position>;
};

export function CampusMultiplayer({ roomId, profile, positionRef }: Props) {
  const [peers, setPeers] = useState<CampusPeer[]>([]);
  const publicNameRef = useRef<string | null>(null);
  if (!publicNameRef.current) publicNameRef.current = `Bạn học ${Math.floor(1000 + Math.random() * 9000)}`;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const identityRef = useRef("");
  const seqRef = useRef(0);
  const lastSentRef = useRef(0);
  const peersRef = useRef(peers);
  peersRef.current = peers;

  useEffect(() => {
    let alive = true;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
            seq: Number.isFinite(incoming.seq) ? incoming.seq : 0,
            roomId,
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
  }, [roomId, profile.avatar, positionRef]);

  useFrame(() => {
    const channel = channelRef.current;
    if (!channel) return;
    const now = performance.now();
    if (now - lastSentRef.current < 120) return;
    lastSentRef.current = now;
    const p = positionRef.current;
    const seq = ++seqRef.current;
    void channel.send({
      type: "broadcast",
      event: "move",
      payload: {
        id: identityRef.current,
        name: publicNameRef.current,
        avatar: profile.avatar,
        roomId,
        x: p.x,
        z: p.z,
        rot: p.ry,
        updatedAt: Date.now(),
        seq,
      },
    });
  });

  return (
    <group>
      {peers.map((peer) => (
        <RemoteCampusAvatar key={peer.id} peer={peer} />
      ))}
    </group>
  );
}

function RemoteCampusAvatar({ peer }: { peer: CampusPeer }) {
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
    <group ref={group} position={[peer.x, 0, peer.z]} rotation={[0, peer.rot, 0]}>
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
