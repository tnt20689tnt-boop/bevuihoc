import { useMemo } from "react";
import * as THREE from "three";

type Props = {
  from: [number, number, number];
  to: [number, number, number];
  width?: number;
  accent?: string;
  /** Number of lamps on EACH side. Default 2 (4 total). */
  lampsPerSide?: number;
};

export function Corridor({
  from,
  to,
  width = 3,
  accent = "#ffd27a",
  lampsPerSide = 2,
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

  const lampPositions = useMemo(() => {
    const result: [number, number, number][] = [];
    const count = Math.max(1, Math.floor(lampsPerSide));
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const z = (t - 0.5) * length;
      result.push([-(width / 2 + 0.9), 0, z]);
      result.push([width / 2 + 0.9, 0, z + length / (count * 4)]);
    }
    return result;
  }, [length, width, lampsPerSide]);

  return (
    <group position={mid} rotation={[0, angle, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#b8b0a4" roughness={0.95} />
      </mesh>

      {lampPositions.map((lampPosition, i) => (
        <group key={i} position={lampPosition}>
          <mesh castShadow position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 3, 8]} />
            <meshStandardMaterial color="#2a2118" roughness={0.8} />
          </mesh>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.08, 0.16, 0.18, 10]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.7} metalness={0.2} />
          </mesh>
          <mesh position={[0, 2.94, 0]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      <pointLight
        position={[0, 2.8, 0]}
        intensity={5}
        distance={Math.max(1, length * 0.6)}
        decay={2}
        color={accent}
        castShadow={false}
      />
    </group>
  );
}
