import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type LanternProps = {
  position: [number, number, number];
  poleHeight?: number;
  shadeRadius?: number;
  color?: string;
  withLight?: boolean;
  lightIntensity?: number;
};

export function Lantern({
  position,
  poleHeight = 2.6,
  shadeRadius = 0.35,
  color = "#ffcf80",
  withLight = false,
  lightIntensity = 6,
}: LanternProps) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.getElapsedTime();
    lightRef.current.intensity =
      lightIntensity * (0.94 + Math.sin(t * 1.7 + position[0]) * 0.06);
  });

  return (
    <group position={position}>
      <mesh castShadow position={[0, poleHeight / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.07, poleHeight, 8]} />
        <meshStandardMaterial color="#2a2118" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.16, 10]} />
        <meshStandardMaterial color="#1f1a14" roughness={0.9} />
      </mesh>
      <mesh position={[0, poleHeight, 0]} castShadow>
        <cylinderGeometry args={[shadeRadius * 0.55, shadeRadius, shadeRadius * 0.9, 12, 1, true]} />
        <meshStandardMaterial color="#8c542c" roughness={0.58} metalness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, poleHeight - 0.08, 0]}>
        <sphereGeometry args={[shadeRadius * 0.45, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
      <sprite position={[0, poleHeight - 0.08, 0]} scale={[1.6, 1.6, 1]}>
        <spriteMaterial
          color={color}
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {withLight && (
        <pointLight
          ref={lightRef}
          position={[0, poleHeight - 0.1, 0]}
          color={color}
          intensity={lightIntensity}
          distance={9}
          decay={2}
          castShadow={false}
        />
      )}
    </group>
  );
}
