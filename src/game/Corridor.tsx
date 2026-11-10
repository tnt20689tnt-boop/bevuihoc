import { useMemo } from "react";
import * as THREE from "three";

type Props = {
  from: [number, number, number];
  to: [number, number, number];
  width?: number;
  accent?: string;
};

export function Corridor({
  from,
  to,
  width = 3,
  accent = "#ffd27a",
}: Props) {
  const { length, mid, angle } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const center = a.clone().add(b).multiplyScalar(0.5);
    return {
      length: len,
      mid: center.toArray() as [number, number, number],
      angle: Math.atan2(dir.x, dir.z),
    };
  }, [from, to]);

  return (
    <group position={mid} rotation={[0, angle, 0]}>
      {/* Mặt đường */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#b8b0a4" roughness={0.95} />
      </mesh>

      {/* Hai đèn tường thấp, ánh sáng hướng xuống mặt đường */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (width / 2 - 0.08), 0.25, 0]}>
          <mesh>
            <boxGeometry args={[0.12, 0.18, 0.4]} />
            <meshStandardMaterial color="#2a2118" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.08, 0.02, 0.3]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* Ánh sáng chính: một pointLight cao, mềm, phủ hành lang */}
      <pointLight
        position={[0, 4.5, 0]}
        intensity={18}
        distance={Math.max(1, length * 0.75)}
        decay={2}
        color="#ffe9c4"
        castShadow={false}
      />

      {/* Ánh sáng phụ thấp, ấm, hắt mặt đường */}
      <pointLight
        position={[0, 0.6, 0]}
        intensity={4}
        distance={Math.max(1, length * 0.5)}
        decay={2}
        color={accent}
        castShadow={false}
      />
    </group>
  );
}
