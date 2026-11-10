import { Html } from "@react-three/drei";
import { useEffect } from "react";
import type { Portal } from "@/game/rooms";
import { ROOMS } from "@/game/rooms";

export function CampusArchitecture({ portals }: { portals: Portal[] }) {
  useEffect(() => {
    const boxes = portals.map((portal) => ({
      name: ROOMS[portal.to].short,
      minX: portal.x * 1.28 - 4.1,
      maxX: portal.x * 1.28 + 4.1,
      minZ: portal.z * 1.28 - 3.1,
      maxZ: portal.z * 1.28 + 3.1,
    }));
    boxes.push({ name: "Khu vui chơi", minX: 13, maxX: 39, minZ: 11, maxZ: 37 });
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        if (a && b && a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ) {
          console.warn(`[Campus AABB] Hai khu vực bị chồng lấn: ${a.name} / ${b.name}`);
        }
      }
    }
    const entranceCorridor = boxes.filter((box) => box.minX < 6 && box.maxX > -6 && box.maxZ > 0 && box.minZ < 30);
    if (entranceCorridor.length) console.warn("[Campus AABB] Công trình chắn trục cổng - sân:", entranceCorridor.map((box) => box.name));
  }, [portals]);
  return (
    <group>
      {/* Sân lát đá ấm và các lối đi tỏa đến từng khu học tập. */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[22, 64]} />
        <meshStandardMaterial color="#e9d7b5" roughness={0.94} />
      </mesh>
      {portals.map((portal) => {
        const x = portal.x * 1.28;
        const z = portal.z * 1.28;
        const room = ROOMS[portal.to];
        const yaw = Math.atan2(-x, -z);
        const length = Math.hypot(x, z);
        return (
          <group key={portal.to}>
            <mesh
              position={[x / 2, 0.045, z / 2]}
              rotation={[-Math.PI / 2, 0, -Math.atan2(z, x)]}
              receiveShadow
            >
              <planeGeometry args={[3.2, length]} />
              <meshStandardMaterial color="#f4e8ce" roughness={0.96} />
            </mesh>
            <SchoolBuilding position={[x, 0, z]} rotation={yaw} room={room} />
          </group>
        );
      })}
      <CampusGreenery portals={portals} />
      <CentralLandmark position={[-10, 0, 0]} />
      <EntranceGate />
    </group>
  );
}

function SchoolBuilding({
  position,
  rotation,
  room,
}: {
  position: [number, number, number];
  rotation: number;
  room: (typeof ROOMS)[keyof typeof ROOMS];
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Thân nhà thấp, mái dốc đơn giản và hiên quay vào sân. */}
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.4, 3.1, 5.2]} />
        <meshStandardMaterial color="#fff1d8" roughness={0.86} />
      </mesh>
      <mesh position={[0, 3.02, 0]} castShadow>
        <boxGeometry args={[7.65, 0.28, 5.45]} />
        <meshStandardMaterial color={room.color} roughness={0.76} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 4.15, side * 1.9]} rotation={[side * 0.4, 0, 0]} castShadow>
          <boxGeometry args={[7.9, 0.24, 3.8]} />
          <meshStandardMaterial color={room.color} roughness={0.82} />
        </mesh>
      ))}
      <mesh position={[0, 4.6, 0]} castShadow>
        <boxGeometry args={[8.1, 0.2, 0.28]} />
        <meshStandardMaterial color="#fff4da" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.82, 2.83]} castShadow>
        <boxGeometry args={[2.3, 1.65, 0.16]} />
        <meshStandardMaterial color="#80533a" roughness={0.72} />
      </mesh>
      <mesh position={[-2.35, 1.65, 2.72]}>
        <boxGeometry args={[1.35, 1.2, 0.12]} />
        <meshStandardMaterial color="#b9e5e7" roughness={0.35} metalness={0.08} />
      </mesh>
      <mesh position={[2.35, 1.65, 2.72]}>
        <boxGeometry args={[1.35, 1.2, 0.12]} />
        <meshStandardMaterial color="#b9e5e7" roughness={0.35} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.2, 3.2]} receiveShadow castShadow>
        <boxGeometry args={[3.1, 0.22, 1.25]} />
        <meshStandardMaterial color="#d6b58b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[8.15, 0.22, 6.05]} />
        <meshStandardMaterial color="#d5b28b" roughness={0.93} />
      </mesh>
      <mesh position={[0, 2.75, 2.94]}>
        <boxGeometry args={[4.45, 0.72, 0.12]} />
        <meshStandardMaterial color={room.color} roughness={0.65} />
      </mesh>
      <Html position={[0, 2.77, 3.04]} center distanceFactor={13}>
        <div
          style={{
            whiteSpace: "nowrap",
            borderRadius: 10,
            padding: "5px 12px",
            color: "#263247",
            background: "#fff9e9",
            border: `2px solid ${room.color}`,
            boxShadow: "0 3px 0 #0002",
            font: "800 16px 'Baloo 2', sans-serif",
          }}
        >
          {room.emoji} {room.short}
        </div>
      </Html>
    </group>
  );
}

function CampusGreenery({ portals }: { portals: Portal[] }) {
  const trees: [number, number][] = [
    [-12, -11],
    [-6, -17],
    [7, -17],
    [13, -10],
    [-15, 4],
    [15, 4],
    [-12, 13],
    [11, 13],
    [-5, 17],
    [5, 17],
  ];
  const available = trees.filter(([x, z]) =>
    portals.every((portal) => Math.hypot(x - portal.x * 1.28, z - portal.z * 1.28) > 5.1),
  );
  return (
    <group>
      {available.map(([x, z], i) => (
        <Tree key={`${x}-${z}-${i}`} x={x} z={z} />
      ))}
      {[
        [-9, -2, 0],
        [9, -2, 0],
        [-4, 8, 0],
        [4, 8, 0],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x ?? 0, 0.16, z ?? 0]} receiveShadow>
          <cylinderGeometry args={[1.05, 1.15, 0.3, 20]} />
          <meshStandardMaterial color="#c98b62" roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.29, 1.8, 9]} />
        <meshStandardMaterial color="#8c5b3a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[1.05, 14, 12]} />
        <meshStandardMaterial color="#579c59" roughness={0.94} />
      </mesh>
      <mesh position={[-0.48, 1.78, 0.12]} castShadow>
        <sphereGeometry args={[0.62, 12, 10]} />
        <meshStandardMaterial color="#79b96a" roughness={0.94} />
      </mesh>
    </group>
  );
}

function CentralLandmark({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.15, 40]} />
        <meshStandardMaterial color="#d7b987" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[1.75, 1.9, 0.2, 32]} />
        <meshStandardMaterial color="#fff0ce" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[1.3, 1.45, 0.12, 32]} />
        <meshStandardMaterial color="#54c6dc" roughness={0.3} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.76, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.4, 0.78, 20]} />
        <meshStandardMaterial color="#f4c858" roughness={0.52} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.34, 16, 12]} />
        <meshStandardMaterial
          color="#66d7e8"
          emissive="#27a8bd"
          emissiveIntensity={0.16}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[0, 1.68, 0]}>
        <sphereGeometry args={[0.12, 14, 10]} />
        <meshStandardMaterial color="#eaffff" emissive="#a7f5ff" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function EntranceGate() {
  return (
    <group position={[0, 0, 21.2]}>
      <mesh position={[-3.1, 1.8, 0]} castShadow>
        <boxGeometry args={[0.42, 3.6, 0.5]} />
        <meshStandardMaterial color="#d88b54" roughness={0.8} />
      </mesh>
      <mesh position={[3.1, 1.8, 0]} castShadow>
        <boxGeometry args={[0.42, 3.6, 0.5]} />
        <meshStandardMaterial color="#d88b54" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[6.8, 0.55, 0.7]} />
        <meshStandardMaterial color="#477e59" roughness={0.78} />
      </mesh>
      <Html position={[0, 3.52, 0.4]} center distanceFactor={12}>
        <div
          style={{
            whiteSpace: "nowrap",
            borderRadius: 10,
            padding: "6px 14px",
            color: "#fff9e9",
            background: "#477e59",
            font: "800 17px 'Baloo 2', sans-serif",
            boxShadow: "0 4px 0 #2d573b",
          }}
        >
          CHÀO MỪNG ĐẾN TRƯỜNG
        </div>
      </Html>
    </group>
  );
}
