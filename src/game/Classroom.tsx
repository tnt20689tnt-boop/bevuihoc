import * as THREE from "three";

type Props = {
  position: [number, number, number];
  rotationY?: number;
  width?: number;
  depth?: number;
  height?: number;
  accent?: string;
};

export function Classroom({
  position,
  rotationY = 0,
  width = 7.4,
  depth = 5.2,
  height = 3.6,
  accent = "#ffd27a",
}: Props) {
  const glassW = width * 0.42;
  const solidW = width - glassW;
  const darkMetal = "#35434b";

  return (
    <group position={position} rotation={[0, rotationY, 0]} userData={{ cameraOccluder: true }}>
      <mesh receiveShadow position={[0, 0.06, depth / 2 + 0.48]}>
        <boxGeometry args={[width + 0.8, 0.12, 1.05]} />
        <meshStandardMaterial color="#d8cbb5" roughness={0.9} />
      </mesh>

      <mesh castShadow receiveShadow position={[-glassW / 2, height / 2, 0]}>
        <boxGeometry args={[solidW, height, depth]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.84} />
      </mesh>

      <mesh castShadow position={[solidW / 2, height / 2, 0]}>
        <boxGeometry args={[glassW, height, depth]} />
        <meshPhysicalMaterial
          color="#bfe3ff"
          transmission={0.48}
          thickness={0.22}
          roughness={0.14}
          metalness={0}
          ior={1.45}
          transparent
          opacity={0.82}
        />
      </mesh>

      {[-1, 0, 1].map((k) => (
        <mesh key={`v${k}`} position={[solidW / 2 + k * (glassW / 2.2), height / 2, depth / 2 + 0.025]}>
          <boxGeometry args={[0.055, height, 0.055]} />
          <meshStandardMaterial color={darkMetal} metalness={0.82} roughness={0.28} />
        </mesh>
      ))}
      {[0.3, 0.7].map((t) => (
        <mesh key={`h${t}`} position={[solidW / 2, height * t, depth / 2 + 0.025]}>
          <boxGeometry args={[glassW, 0.055, 0.055]} />
          <meshStandardMaterial color={darkMetal} metalness={0.82} roughness={0.28} />
        </mesh>
      ))}

      <mesh castShadow position={[0, height + 0.12, 0.12]}>
        <boxGeometry args={[width + 0.75, 0.24, depth + 0.58]} />
        <meshStandardMaterial color="#34434a" roughness={0.68} metalness={0.18} />
      </mesh>


      {[-0.22, 0.22].map((t, i) => (
        <mesh key={i} position={[-glassW / 2 + t * solidW, height * 0.58, depth / 2 + 0.035]}>
          <planeGeometry args={[solidW * 0.22, height * 0.34]} />
          <meshPhysicalMaterial color="#bfe3ff" transmission={0.42} thickness={0.18} roughness={0.16} transparent opacity={0.8} />
        </mesh>
      ))}

      <mesh position={[width / 2 - glassW * 0.5, height * 0.5, depth / 2 + 0.32]}>
        <boxGeometry args={[glassW * 0.82, 0.08, 0.65]} />
        <meshStandardMaterial color="#34434a" metalness={0.28} roughness={0.58} />
      </mesh>
      {/* Một đèn hiên chiếu xuống bậc thềm, không dùng mesh emissive trực diện. */}
      <pointLight
        position={[width / 2 - glassW * 0.5, height * 0.42, depth / 2 + 0.6]}
        intensity={5}
        distance={5}
        decay={2}
        color={accent}
        castShadow={false}
      />
      {/* Đèn ngoài hiện có, giảm công suất để ánh sáng dịu hơn. */}
      <pointLight position={[0, height * 0.88, depth / 2 + 0.8]} intensity={3} distance={7} decay={2} color={accent} castShadow={false} />
    </group>
  );
}
