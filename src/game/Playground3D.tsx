import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
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
  facing?: number;
};

export type PlaygroundCollider = { minX: number; maxX: number; minZ: number; maxZ: number };

// Only the six support posts are solid; the rest of the campus stays open.
export const PLAYGROUND_COLLIDERS: PlaygroundCollider[] = [
  { minX: -23.15, maxX: -22.85, minZ: 9.85, maxZ: 10.15 },
  { minX: -21.15, maxX: -20.85, minZ: 9.85, maxZ: 10.15 },
  { minX: 20.85, maxX: 21.15, minZ: 9.85, maxZ: 10.15 },
  { minX: 22.85, maxX: 23.15, minZ: 9.85, maxZ: 10.15 },
];

const swingCenters: [number, number, number][] = [
  [-22, 0, 10],
  [22, 0, 10],
];

// Two independent seat spots on each wide swing: six children can be seated
// across the three swings, with two seats per swing.
export const PLAY_SPOTS: PlaySpot[] = swingCenters.flatMap((center, swingIndex) =>
  [-0.38, 0.38].map((seatX, seatIndex) => ({
    id: `swing-${swingIndex + 1}-seat-${seatIndex + 1}`,
    kind: "swing" as const,
    position: [center[0] + seatX, center[1], center[2]] as [number, number, number],
    radius: 1.55,
    label: "NGỒI XÍCH ĐU",
    icon: "🎠",
    seatOffset: [0, 0.325, 0] as [number, number, number],
    facing: 0,
  })),
);

export function findNearestPlaySpot(position: [number, number, number], playing: boolean): PlaySpot | null {
  if (playing) return null;
  let nearest: PlaySpot | null = null;
  let best = Infinity;
  for (const spot of PLAY_SPOTS) {
    const distance = Math.hypot(position[0] - spot.position[0], position[2] - spot.position[2]);
    if (distance <= spot.radius && distance < best) {
      nearest = spot;
      best = distance;
    }
  }
  return nearest;
}

export function CampusSwings3D({ activeSpotId }: { activeSpotId: string | null }) {
  return (
    <group>
      {swingCenters.map((position, index) => (
        <group key={index} position={position}>
          <TwoSeatSwing active={activeSpotId?.startsWith(`swing-${index + 1}-`) ?? false} />
          <Html position={[0, 3.55, 0]} center distanceFactor={15}>
            <div style={{
              whiteSpace: "nowrap",
              borderRadius: 12,
              padding: "5px 11px",
              background: "#fffaf0ed",
              color: "#35435a",
              border: "1px solid #f3d59b",
              font: "800 13px 'Baloo 2', sans-serif",
              boxShadow: "0 3px 10px #0002",
            }}>
              🎠 XÍCH ĐU ĐÔI · 2 BÉ
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

function TwoSeatSwing({ active }: { active: boolean }) {
  const seat = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    if (seat.current) {
      const target = active ? Math.sin(clock.elapsedTime * 2.25) * 0.24 : 0;
      seat.current.rotation.x = THREE.MathUtils.damp(seat.current.rotation.x, target, 4.5, dt);
    }
  });

  return (
    <group>
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 1.5, 0]} castShadow>
          <boxGeometry args={[0.16, 3, 0.16]} />
          <meshStandardMaterial color="#b97848" roughness={0.72} metalness={0.12} />
        </mesh>
      ))}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[2.55, 0.2, 0.2]} />
        <meshStandardMaterial color="#d69a59" roughness={0.65} />
      </mesh>
      <mesh position={[-1.05, 0.08, 0]} castShadow>
        <boxGeometry args={[0.34, 0.16, 0.42]} />
        <meshStandardMaterial color="#8a5a39" />
      </mesh>
      <mesh position={[1.05, 0.08, 0]} castShadow>
        <boxGeometry args={[0.34, 0.16, 0.42]} />
        <meshStandardMaterial color="#8a5a39" />
      </mesh>
      <group ref={seat} position={[0, 2.58, 0]}>
        {[-0.68, 0.68].map((x) => (
          <mesh key={x} position={[x, -0.93, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 1.86, 8]} />
            <meshStandardMaterial color="#65788b" metalness={0.48} roughness={0.36} />
          </mesh>
        ))}
        <mesh position={[0, -1.88, 0]} castShadow>
          <boxGeometry args={[1.85, 0.18, 0.52]} />
          <meshStandardMaterial color="#f4b94f" roughness={0.52} />
        </mesh>
        <mesh position={[0, -1.75, 0.23]} castShadow>
          <boxGeometry args={[1.85, 0.12, 0.08]} />
          <meshStandardMaterial color="#d98d42" roughness={0.58} />
        </mesh>
        <mesh position={[0, -1.76, -0.23]}>
          <boxGeometry args={[1.85, 0.12, 0.08]} />
          <meshStandardMaterial color="#d98d42" roughness={0.58} />
        </mesh>
        <mesh position={[-0.38, -1.77, 0]}>
          <boxGeometry args={[0.035, 0.035, 0.42]} />
          <meshStandardMaterial color="#fff1c8" />
        </mesh>
        <mesh position={[0.38, -1.77, 0]}>
          <boxGeometry args={[0.035, 0.035, 0.42]} />
          <meshStandardMaterial color="#fff1c8" />
        </mesh>
      </group>
    </group>
  );
}
