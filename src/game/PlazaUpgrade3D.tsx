import { useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CampusArchitecture } from "@/game/CampusArchitecture";
import { ROOMS } from "@/game/rooms";
import { FountainRingLights } from "@/game/FountainRingLights";
import { TreeFairyLights } from "@/game/TreeFairyLights";

function LayeredTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.29, 2.5, 10]} />
        <meshStandardMaterial color="#80502f" roughness={0.94} />
      </mesh>
      {[
        [0, 2.45, 0, 1.0, "#276b3c"],
        [-0.42, 2.9, 0.12, 0.72, "#39864a"],
        [0.42, 2.88, -0.1, 0.74, "#4b9854"],
        [0, 3.38, 0, 0.62, "#65a95b"],
      ].map(([x, y, z, radius, color], index) => (
        <mesh key={index} position={[Number(x), Number(y), Number(z)]} castShadow>
          <sphereGeometry args={[Number(radius), 14, 12]} />
          <meshStandardMaterial color={String(color)} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function RotatingSeat({ position, speed }: { position: [number, number, number]; speed: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * speed) * 0.22;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.48, 0.52, 0.18, 20]} />
        <meshStandardMaterial color="#7a563d" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 0.78, 12]} />
        <meshStandardMaterial color="#b7a28a" metalness={0.45} roughness={0.38} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.62, 0.16, 24]} />
        <meshStandardMaterial color="#e8a65c" roughness={0.58} />
      </mesh>
      <mesh position={[0, 1.42, -0.48]} castShadow>
        <boxGeometry args={[1.12, 0.78, 0.14]} />
        <meshStandardMaterial color="#477e59" roughness={0.62} />
      </mesh>
    </group>
  );
}

function FountainSpray({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Points>(null);
  const count = 96;
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocity = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const speed = 0.45 + (i % 7) * 0.055;
      positions[i * 3] = Math.cos(angle) * 0.25;
      positions[i * 3 + 1] = 1.65;
      positions[i * 3 + 2] = Math.sin(angle) * 0.25;
      return new THREE.Vector3(Math.cos(angle) * speed, 1.2 + (i % 5) * 0.12, Math.sin(angle) * speed);
    });
    return { positions, velocity };
  }, []);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.getAttribute("position");
    if (!attr) return;
    const positions = attr.array as Float32Array;
    const step = Math.min(delta, 0.04);
    for (let i = 0; i < count; i++) {
      const v = data.velocity[i]!;
      positions[i * 3] = (positions[i * 3] ?? 0) + v.x * step;
      positions[i * 3 + 1] = (positions[i * 3 + 1] ?? 0) + v.y * step;
      positions[i * 3 + 2] = (positions[i * 3 + 2] ?? 0) + v.z * step;
      v.y -= 2.8 * step;
      if ((positions[i * 3 + 1] ?? 0) < 0.42) {
        const angle = Math.atan2(v.z, v.x);
        positions[i * 3] = Math.cos(angle) * 0.25;
        positions[i * 3 + 1] = 1.65;
        positions[i * 3 + 2] = Math.sin(angle) * 0.25;
        v.y = 1.2 + (i % 5) * 0.12;
      }
    }
    attr.needsUpdate = true;
  });
  return (
    <points ref={ref} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d9f8ff" size={0.075} transparent opacity={0.88} sizeAttenuation />
    </points>
  );
}

function FountainStructure() {
  return (
    <group>
      {/* Wide stone basin: make the fountain body clearly visible beneath the water. */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.55, 2.68, 0.4, 48]} />
        <meshStandardMaterial color="#e7d4b5" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.415, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.32, 48]} />
        <meshStandardMaterial color="#43c6df" metalness={0.18} roughness={0.22} transparent opacity={0.88} />
      </mesh>
      <mesh position={[0, 0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.28, 2.52, 48]} />
        <meshStandardMaterial color="#fff0d1" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.72, 0.25, 32]} />
        <meshStandardMaterial color="#d5b98f" roughness={0.68} />
      </mesh>
      {/* Sculpted central column and two tiered bowls. */}
      <mesh position={[0, 1.03, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.48, 0.9, 24]} />
        <meshStandardMaterial color="#f0dfc2" roughness={0.58} />
      </mesh>
      <mesh position={[0, 1.48, 0]} castShadow>
        <cylinderGeometry args={[0.72, 1.12, 0.24, 32]} />
        <meshStandardMaterial color="#e8d4b3" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 1.08, 32]} />
        <meshStandardMaterial color="#b9eaf0" metalness={0.16} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.82, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.34, 0.52, 20]} />
        <meshStandardMaterial color="#f4e5c9" roughness={0.55} />
      </mesh>
      <mesh position={[0, 2.12, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.68, 0.18, 28]} />
        <meshStandardMaterial color="#e8d4b3" roughness={0.55} />
      </mesh>
      <mesh position={[0, 2.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.38, 0.65, 28]} />
        <meshStandardMaterial color="#b9eaf0" metalness={0.16} roughness={0.2} />
      </mesh>
      <mesh position={[0, 2.28, 0]} castShadow>
        <sphereGeometry args={[0.2, 18, 14]} />
        <meshStandardMaterial color="#f6df9c" metalness={0.25} roughness={0.32} />
      </mesh>
    </group>
  );
}

export function PlazaUpgrade3D() {
  return (
    <group>
      <CampusArchitecture portals={ROOMS.plaza.portals} />
      <group position={[-20, 0, -4]}>
        <FountainStructure />
        <FountainSpray position={[0, 0, 0]} />
      </group>
      <FountainRingLights center={[-20, 0.02, -4]} radius={3.35} count={8} />
      <TreeFairyLights center={[-20, 2.8, -12]} radius={1.25} count={20} />
      <TreeFairyLights center={[18, 2.8, -12]} radius={1.25} count={20} />
      <RotatingSeat position={[-19, 0, -9]} speed={0.65} />
      <RotatingSeat position={[21, 0, 12]} speed={0.52} />
      <RotatingSeat position={[-9, 0, -9]} speed={0.72} />
      <RotatingSeat position={[9, 0, -9]} speed={0.58} />
      <LayeredTree position={[-20, 0, -12]} scale={0.9} />
      <LayeredTree position={[18, 0, -12]} scale={0.9} />
      
      
      <Html position={[0, 6.15, 26.95]} center distanceFactor={14}>
        <span style={{ whiteSpace: "nowrap", color: "#fff7dc", font: "900 18px sans-serif", textShadow: "0 2px 5px #25432d", letterSpacing: 1 }}>
          TRƯỜNG BÉ HỌC VUI
        </span>
      </Html>
    </group>
  );
}
