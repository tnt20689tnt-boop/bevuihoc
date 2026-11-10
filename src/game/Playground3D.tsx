import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type PlayKind =
  | "swing" | "slide" | "seesaw" | "springRider" | "ballPit"
  | "playhouse" | "tunnel" | "climber" | "carousel" | "bench";

export type PlaySpot = {
  id: string;
  kind: PlayKind;
  position: [number, number, number];
  radius: number;
  label: string;
  icon: string;
  seatOffset: [number, number, number];
  /** Optional direction the child faces while seated. */
  facing?: number;
};

export type PlaygroundCollider = { minX: number; maxX: number; minZ: number; maxZ: number };
export const PLAYGROUND_COLLIDERS: PlaygroundCollider[] = [
  { minX: 9.2, maxX: 9.8, minZ: 7.25, maxZ: 7.75 },
  { minX: 14.55, maxX: 15.45, minZ: 6.55, maxZ: 8.55 },
  { minX: 12.1, maxX: 13.9, minZ: 4.35, maxZ: 4.65 },
  { minX: 9.7, maxX: 10.3, minZ: 11.65, maxZ: 12.35 },
  { minX: 14.9, maxX: 17.1, minZ: 10.9, maxZ: 13.1 },
  { minX: 17.1, maxX: 18.9, minZ: 4.75, maxZ: 6.25 },
  { minX: 7.25, maxX: 8.75, minZ: 5.1, maxZ: 5.9 },
  { minX: 16.4, maxX: 17.6, minZ: 8, maxZ: 9 },
  { minX: 12, maxX: 14, minZ: 14, maxZ: 16 },
  { minX: 8.5, maxX: 9.5, minZ: 14.85, maxZ: 15.15 },
];

export const PLAY_SPOTS: PlaySpot[] = [
  { id: "swing", kind: "swing", position: [9.5, 0, 7.5], radius: 1.6, label: "LÊN XÍCH ĐU", icon: "🎠", seatOffset: [0, 0.325, 0] },
  { id: "slide", kind: "slide", position: [15, 0, 7.5], radius: 1.6, label: "CHƠI CẦU TRƯỢT", icon: "🛝", seatOffset: [0, 0.1, 0.6] },
  { id: "seesaw", kind: "seesaw", position: [13, 0, 4.5], radius: 1.4, label: "CHƠI BẬP BÊNH", icon: "🐴", seatOffset: [0, 0.56, 0] },
  { id: "spring", kind: "springRider", position: [10, 0, 12], radius: 1.3, label: "LÊN THÚ NHÚN", icon: "🐰", seatOffset: [0, 0.52, 0] },
  { id: "ballpit", kind: "ballPit", position: [16, 0, 12], radius: 1.7, label: "VÀO NHÀ BÓNG", icon: "🏠", seatOffset: [0, 0.15, 0] },
  { id: "house", kind: "playhouse", position: [18, 0, 5.5], radius: 1.6, label: "VÀO NHÀ LIÊN HOÀN", icon: "🏰", seatOffset: [0, 0, 0] },
  { id: "tunnel", kind: "tunnel", position: [8, 0, 5.5], radius: 1.25, label: "CHUI ĐƯỜNG HẦM", icon: "🚇", seatOffset: [0, 0.1, 0] },
  { id: "climber", kind: "climber", position: [17, 0, 8.5], radius: 1.4, label: "LEO KHUNG", icon: "🧗", seatOffset: [0, 0.2, 0] },
  { id: "carousel", kind: "carousel", position: [13, 0, 15], radius: 1.6, label: "LÊN VÒNG QUAY", icon: "🎡", seatOffset: [0, 0.3, 0] },
  { id: "bench", kind: "bench", position: [9, 0, 15], radius: 1.0, label: "NGỒI NGHỈ", icon: "🪑", seatOffset: [0, 0.25, 0] },
];

const REST_BENCH_SPOTS: PlaySpot[] = [
  { id: "bench-yard-west", kind: "bench", position: [-8, 0, 1], radius: 1.8, label: "NGỒI NGHỈ", icon: "🪑", seatOffset: [Math.sin(0.42) * 0.95, 0.25, Math.cos(0.42) * 0.95], facing: 0.42 + Math.PI },
  { id: "bench-yard-east", kind: "bench", position: [8, 0, 1], radius: 1.8, label: "NGỒI NGHỈ", icon: "🪑", seatOffset: [Math.sin(-0.42) * 0.95, 0.25, Math.cos(-0.42) * 0.95], facing: -0.42 + Math.PI },
  { id: "bench-yard-north", kind: "bench", position: [0, 0, -10], radius: 1.8, label: "NGỒI NGHỈ", icon: "🪑", seatOffset: [0, 0.25, 0.95], facing: Math.PI },
];

export function findNearestPlaySpot(position: [number, number, number], playing: boolean): PlaySpot | null {
  if (playing) return null;
  let nearest: PlaySpot | null = null;
  let best = Infinity;
  for (const spot of [...PLAY_SPOTS, ...REST_BENCH_SPOTS]) {
    const distance = Math.hypot(position[0] - spot.position[0], position[2] - spot.position[2]);
    if (distance <= spot.radius && distance < best) {
      nearest = spot;
      best = distance;
    }
  }
  return nearest;
}

export function Playground3D({ activeSpotId }: { activeSpotId: string | null }) {
  return (
    <group>
      <PlaygroundGround />
      <PlaygroundFence />
      {PLAY_SPOTS.map((spot) => (
        <group key={spot.id} position={spot.position} scale={0.5}>
          {spot.kind === "swing" && <Swing active={activeSpotId === spot.id} />}
          {spot.kind === "slide" && <Slide />}
          {spot.kind === "seesaw" && <Seesaw active={activeSpotId === spot.id} />}
          {spot.kind === "springRider" && <SpringRider active={activeSpotId === spot.id} />}
          {spot.kind === "ballPit" && <BallPit />}
          {spot.kind === "playhouse" && <Playhouse />}
          {spot.kind === "tunnel" && <Tunnel />}
          {spot.kind === "climber" && <Climber />}
          {spot.kind === "carousel" && <Carousel active={activeSpotId === spot.id} />}
          {spot.kind === "bench" && <PlayBench />}
          <Html position={[0, 3.4, 0]} center distanceFactor={15}>
            <div style={{ whiteSpace: "nowrap", borderRadius: 10, padding: "4px 9px", background: "#fffaf0e8", color: "#35435a", font: "800 12px 'Baloo 2', sans-serif", boxShadow: "0 3px 9px #0002" }}>
              {spot.icon} {spot.label.replace("LÊN ", "").replace("CHƠI ", "")}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

function PlaygroundGround() {
  return (
    <group>
      <mesh position={[9.5, 0.06, 6.75]} rotation={[0, 0.87, 0]} receiveShadow>
        <boxGeometry args={[2.4, 0.08, 9.2]} />
        <meshStandardMaterial color="#f4e8ce" roughness={0.96} />
      </mesh>
      <mesh position={[13, 0.035, 9.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial color="#a9d98a" roughness={0.98} />
      </mesh>
      <mesh position={[13, 0.045, 9.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.7, 6.95, 64]} />
        <meshStandardMaterial color="#f5c76d" roughness={0.9} />
      </mesh>
      <Html position={[13, 2.8, 9.5]} center distanceFactor={14}>
        <div style={{ background: "#fff7df", border: "3px solid #ff9fbd", borderRadius: 18, padding: "7px 18px", color: "#9d4771", font: "900 20px 'Baloo 2', sans-serif", whiteSpace: "nowrap", boxShadow: "0 5px 12px #0002" }}>
          🎈 KHU VUI CHƠI CỦA BÉ 🎈
        </div>
      </Html>
    </group>
  );
}

function PlaygroundFence() {
  const posts = useMemo(() => {
    const items: [number, number][] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      items.push([13 + Math.cos(a) * 7, 9.5 + Math.sin(a) * 7]);
    }
    return items;
  }, []);
  return (
    <group>
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.34, z]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.62, 10]} />
          <meshStandardMaterial color="#fff1d6" roughness={0.75} />
        </mesh>
      ))}
      {posts.map(([x, z], i) => {
        if (i === 14) return null;
        const [nx, nz] = posts[(i + 1) % posts.length] ?? [x, z];
        return (
          <mesh key={`rail-${i}`} position={[(x + nx) / 2, 0.36, (z + nz) / 2]} rotation={[0, -Math.atan2(nz - z, nx - x), 0]}>
            <boxGeometry args={[1.83, 0.08, 0.08]} />
            <meshStandardMaterial color="#ffb4c9" roughness={0.72} />
          </mesh>
        );
      })}
    </group>
  );
}

function Swing({ active }: { active: boolean }) {
  const seat = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    if (seat.current) {
      const target = active ? Math.sin(clock.elapsedTime * 2.5) * 0.42 : 0;
      seat.current.rotation.x = THREE.MathUtils.damp(seat.current.rotation.x, target, 5, dt);
    }
  });
  return (
    <group>
      {[-1.1, 1.1].map((x) => <mesh key={x} position={[x, 1.45, 0]} castShadow><boxGeometry args={[0.14, 2.9, 0.14]} /><meshStandardMaterial color="#ef6b72" /></mesh>)}
      <mesh position={[0, 2.9, 0]} castShadow><boxGeometry args={[2.6, 0.16, 0.16]} /><meshStandardMaterial color="#ef6b72" /></mesh>
      <group ref={seat} position={[0, 2.55, 0]}>
        {[-0.42, 0.42].map((x) => <mesh key={x} position={[x, -0.95, 0]}><cylinderGeometry args={[0.025, 0.025, 1.9, 8]} /><meshStandardMaterial color="#9aa5b1" /></mesh>)}
        <mesh position={[0, -1.9, 0]} castShadow><boxGeometry args={[1.1, 0.14, 0.45]} /><meshStandardMaterial color="#ffd166" /></mesh>
      </group>
    </group>
  );
}

function Slide() {
  const curve = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(0, 2.4, -0.7), new THREE.Vector3(0, 1.7, 0), new THREE.Vector3(0, 0.18, 2.1)]), []);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 24, 0.42, 10, false), [curve]);
  return (
    <group>
      <mesh position={[0, 1.05, -0.8]} castShadow><boxGeometry args={[1.7, 2.1, 1.5]} /><meshStandardMaterial color="#67b7ee" /></mesh>
      <mesh position={[0, 2.25, -1.45]} castShadow><boxGeometry args={[2.1, 0.18, 0.2]} /><meshStandardMaterial color="#ffd166" /></mesh>
      <mesh geometry={tube} position={[0, 0, 0]} castShadow><meshStandardMaterial color="#f36f91" roughness={0.48} side={THREE.DoubleSide} /></mesh>
      {[-0.72, 0.72].map((x) => <mesh key={x} position={[x, 0.75, -0.85]} castShadow><boxGeometry args={[0.12, 1.5, 1.1]} /><meshStandardMaterial color="#ffd166" /></mesh>)}
    </group>
  );
}

function Seesaw({ active }: { active: boolean }) {
  const beam = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    if (beam.current) beam.current.rotation.z = THREE.MathUtils.damp(beam.current.rotation.z, active ? Math.sin(clock.elapsedTime * 3) * 0.22 : 0, 4, dt);
  });
  return (
    <group>
      <mesh position={[0, 0.48, 0]} castShadow><coneGeometry args={[0.55, 0.95, 4]} /><meshStandardMaterial color="#f59b55" /></mesh>
      <group ref={beam} position={[0, 0.95, 0]}>
        <mesh castShadow><boxGeometry args={[3.3, 0.18, 0.42]} /><meshStandardMaterial color="#5eb8e8" /></mesh>
        {[-1.25, 1.25].map((x) => <group key={x} position={[x, 0.18, 0]}><mesh castShadow><boxGeometry args={[0.65, 0.12, 0.55]} /><meshStandardMaterial color="#ffd166" /></mesh><mesh position={[0, 0.38, 0]}><boxGeometry args={[0.12, 0.48, 0.12]} /><meshStandardMaterial color="#e96b76" /></mesh></group>)}
      </group>
    </group>
  );
}

function SpringRider({ active }: { active: boolean }) {
  const rider = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    if (rider.current) rider.current.position.y = THREE.MathUtils.damp(rider.current.position.y, active ? 0.15 + Math.sin(clock.elapsedTime * 8) * 0.14 : 0.15, 7, dt);
  });
  return (
    <group>
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.48, 0.55, 0.2, 20]} /><meshStandardMaterial color="#8ecf82" /></mesh>
      <mesh position={[0, 0.62, 0]}><torusGeometry args={[0.22, 0.055, 8, 20]} /><meshStandardMaterial color="#8c9aa8" /></mesh>
      <group ref={rider} position={[0, 0.15, 0]}>
        {Array.from({ length: 5 }).map((_, i) => <mesh key={i} position={[0, 0.2 + i * 0.11, 0]}><torusGeometry args={[0.22 - i * 0.015, 0.045, 8, 18]} /><meshStandardMaterial color="#9ca8b5" /></mesh>)}
        <mesh position={[0, 0.92, 0]} castShadow><sphereGeometry args={[0.48, 18, 14]} /><meshStandardMaterial color="#ffb2c9" /></mesh>
        <mesh position={[0, 1.25, 0.08]}><sphereGeometry args={[0.25, 16, 12]} /><meshStandardMaterial color="#ffd166" /></mesh>
      </group>
    </group>
  );
}

function BallPit() {
  const balls = useMemo(() => Array.from({ length: 64 }, (_, i) => {
    const a = i * 2.399;
    const r = 0.35 + (i % 7) * 0.22;
    return { x: Math.cos(a) * r * 1.8, z: Math.sin(a) * r * 1.45, y: 0.35 + (i % 4) * 0.22, color: ["#ff7894", "#ffd166", "#6bc8ec", "#9bdb8e", "#b99af7"][i % 5] ?? "#ff7894" };
  }), []);
  return (
    <group>
      <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[2.1, 2.1, 0.55, 32]} /><meshStandardMaterial color="#75c9e8" /></mesh>
      {balls.map((ball, i) => <mesh key={i} position={[ball.x, ball.y, ball.z]}><sphereGeometry args={[0.22, 10, 8]} /><meshStandardMaterial color={ball.color} roughness={0.45} /></mesh>)}
    </group>
  );
}

function Playhouse() {
  return (
    <group>
      <mesh position={[0, 1.1, 0]} castShadow><boxGeometry args={[3.6, 2.2, 3]} /><meshStandardMaterial color="#ffe4a8" /></mesh>
      <mesh position={[0, 2.55, 0]} castShadow><coneGeometry args={[2.45, 1.15, 4]} /><meshStandardMaterial color="#ee7891" /></mesh>
      <mesh position={[0, 0.9, 1.55]}><boxGeometry args={[1.05, 1.7, 0.08]} /><meshStandardMaterial color="#9bdbed" /></mesh>
      <mesh position={[-2.6, 0.12, 0]}><boxGeometry args={[1.8, 0.22, 1.2]} /><meshStandardMaterial color="#67b7ee" /></mesh>
      <mesh position={[-3.25, 0.55, 0]} rotation={[0, 0, -0.35]}><boxGeometry args={[0.22, 1.2, 1.2]} /><meshStandardMaterial color="#ffd166" /></mesh>
    </group>
  );
}

function Tunnel() {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.8, 0]}><cylinderGeometry args={[0.85, 0.85, 2.8, 24, 1, true, 0, Math.PI]} /><meshStandardMaterial color="#f39b5a" side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0.08, 0]}><boxGeometry args={[3.1, 0.16, 1.8]} /><meshStandardMaterial color="#8ecf82" /></mesh>
    </group>
  );
}

function Climber() {
  return (
    <group>
      {[-1, 1].map((x) => <mesh key={x} position={[x, 1.25, 0]} rotation={[0, 0, x * -0.2]}><cylinderGeometry args={[0.08, 0.08, 2.6, 10]} /><meshStandardMaterial color="#e97991" /></mesh>)}
      {Array.from({ length: 6 }).map((_, i) => <mesh key={i} position={[0, 0.35 + i * 0.36, 0]}><boxGeometry args={[2.2, 0.08, 0.12]} /><meshStandardMaterial color="#68bde8" /></mesh>)}
      <mesh position={[0, 2.6, 0]}><boxGeometry args={[2.5, 0.12, 0.16]} /><meshStandardMaterial color="#ffd166" /></mesh>
    </group>
  );
}

function Carousel({ active }: { active: boolean }) {
  const rotor = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (rotor.current) rotor.current.rotation.y += (active ? 1.25 : 0.12) * dt; });
  return (
    <group>
      <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[1.8, 1.9, 0.35, 32]} /><meshStandardMaterial color="#f4c96c" /></mesh>
      <group ref={rotor}>
        <mesh position={[0, 1.45, 0]}><cylinderGeometry args={[0.12, 0.16, 2.5, 12]} /><meshStandardMaterial color="#e97991" /></mesh>
        <mesh position={[0, 2.7, 0]}><coneGeometry args={[1.5, 0.55, 24]} /><meshStandardMaterial color="#ffd166" /></mesh>
        {[0, 1, 2, 3].map((i) => { const a = i * Math.PI / 2; return <group key={i} position={[Math.cos(a) * 1.25, 0.9, Math.sin(a) * 1.25]}><mesh><sphereGeometry args={[0.38, 14, 12]} /><meshStandardMaterial color={["#f08aa5", "#72c6e8", "#91cf82", "#b59af2"][i] ?? "#f08aa5"} /></mesh><mesh position={[0, -0.38, 0]}><cylinderGeometry args={[0.035, 0.035, 0.7, 8]} /><meshStandardMaterial color="#8e9aa7" /></mesh></group>; })}
      </group>
    </group>
  );
}

function PlayBench() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow><boxGeometry args={[2, 0.16, 0.6]} /><meshStandardMaterial color="#b87b4d" /></mesh>
      <mesh position={[0, 0.92, -0.23]} castShadow><boxGeometry args={[2, 0.75, 0.14]} /><meshStandardMaterial color="#b87b4d" /></mesh>
      {[-0.7, 0.7].map((x) => <mesh key={x} position={[x, 0.25, 0]}><boxGeometry args={[0.14, 0.5, 0.4]} /><meshStandardMaterial color="#78513b" /></mesh>)}
    </group>
  );
}
