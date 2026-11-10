import { Html } from "@react-three/drei";
import { useEffect } from "react";
import type { Portal } from "@/game/rooms";
import { portalBuildingPosition, ROOMS } from "@/game/rooms";

export function CampusArchitecture({ portals }: { portals: Portal[] }) {
  useEffect(() => {
    const boxes = portals.map((portal) => {
      const [cx, cz] = portalBuildingPosition(portal);
      const yaw = Math.atan2(-cx, -cz);
      const halfWidth = ROOMS[portal.to].id === "arena" ? 4.25 : 4.1;
      const halfDepth = ROOMS[portal.to].id === "arena" ? 2.8 : 3.1;
      const halfX = Math.abs(Math.cos(yaw)) * halfWidth + Math.abs(Math.sin(yaw)) * halfDepth;
      const halfZ = Math.abs(Math.sin(yaw)) * halfWidth + Math.abs(Math.cos(yaw)) * halfDepth;
      return { name: ROOMS[portal.to].short, minX: cx - halfX, maxX: cx + halfX, minZ: cz - halfZ, maxZ: cz + halfZ };
    });
    boxes.push({ name: "Khu vui chơi", minX: 6, maxX: 20, minZ: 2.5, maxZ: 16.5 });
    boxes.push({ name: "Đài phun nước", minX: -23.15, maxX: -16.85, minZ: -7.15, maxZ: -0.85 });
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        if (a && b && a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ) {
          console.warn(`[Campus AABB] Hai khu vực bị chồng lấn: ${a.name} / ${b.name}`);
        }
      }
    }
    const entranceCorridor = boxes.filter((box) => box.minX < 6 && box.maxX > -6 && box.maxZ > 0 && box.minZ < 26.5);
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
        const [x, z] = portalBuildingPosition(portal);
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
      <CentralLandmark position={[-20, 0, -4]} />
      <SchoolBoundary />
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
  if (room.id === "arena") return <ArenaHouse position={position} rotation={rotation} room={room} />;
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


function ArenaHouse({ position, rotation, room }: { position: [number, number, number]; rotation: number; room: (typeof ROOMS)[keyof typeof ROOMS] }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[-3.55, 1.55, 0]} castShadow receiveShadow><boxGeometry args={[0.3, 3.1, 5.2]} /><meshStandardMaterial color="#f6e7cb" roughness={0.86} /></mesh>
      <mesh position={[3.55, 1.55, 0]} castShadow receiveShadow><boxGeometry args={[0.3, 3.1, 5.2]} /><meshStandardMaterial color="#f6e7cb" roughness={0.86} /></mesh>
      <mesh position={[0, 1.55, -2.48]} castShadow receiveShadow><boxGeometry args={[7.4, 3.1, 0.25]} /><meshStandardMaterial color="#f6e7cb" roughness={0.86} /></mesh>
      <mesh position={[-2.5, 1.55, 2.63]} castShadow><boxGeometry args={[2.4, 3.1, 0.25]} /><meshStandardMaterial color="#f6e7cb" /></mesh>
      <mesh position={[2.5, 1.55, 2.63]} castShadow><boxGeometry args={[2.4, 3.1, 0.25]} /><meshStandardMaterial color="#f6e7cb" /></mesh>
      <mesh position={[0, 2.95, 2.63]} castShadow><boxGeometry args={[2.6, 0.3, 0.25]} /><meshStandardMaterial color="#f6e7cb" /></mesh>
      <mesh position={[0, 0.12, 0]} receiveShadow><boxGeometry args={[7.8, 0.24, 5.6]} /><meshStandardMaterial color="#c28b58" /></mesh>
      {[-1, 1].map((side) => <group key={side} position={[side * 1.18, 0, 2.55]} rotation={[0, side * 0.72, 0]}><mesh position={[-side * 0.53, 1.12, 0]} castShadow><boxGeometry args={[1.06, 2.22, 0.14]} /><meshStandardMaterial color="#805033" /></mesh><mesh position={[-side * 0.53, 1.12, 0.09]}><boxGeometry args={[0.82, 1.95, 0.035]} /><meshStandardMaterial color="#a66b3d" /></mesh></group>)}
      {[-1, 1].map((side) => <mesh key={side} position={[side * 2.75, 1.7, 2.78]}><boxGeometry args={[1.15, 1.2, 0.1]} /><meshStandardMaterial color="#9bd9e7" metalness={0.08} roughness={0.28} /></mesh>)}
      <mesh position={[0, 3.85, -1.25]} rotation={[0.42, 0, 0]} castShadow><boxGeometry args={[8.3, 0.28, 4.15]} /><meshStandardMaterial color="#a94f35" roughness={0.78} /></mesh>
      <mesh position={[0, 3.85, 1.25]} rotation={[-0.42, 0, 0]} castShadow><boxGeometry args={[8.3, 0.28, 4.15]} /><meshStandardMaterial color="#b95c3d" roughness={0.78} /></mesh>
      <mesh position={[0, 4.62, 0]} castShadow><boxGeometry args={[8.5, 0.24, 0.32]} /><meshStandardMaterial color="#713b2c" /></mesh>
      <mesh position={[0, 3.02, 0]} castShadow><boxGeometry args={[7.7, 0.24, 5.45]} /><meshStandardMaterial color={room.color} /></mesh>
      <mesh position={[0, 0.2, 3.35]} castShadow><boxGeometry args={[3.8, 0.24, 1.15]} /><meshStandardMaterial color="#d8b58c" /></mesh>
      <Html position={[0, 2.78, 2.98]} center distanceFactor={13}><div style={{ whiteSpace: "nowrap", borderRadius: 10, padding: "5px 14px", color: "#fff8e8", background: "#8e4b32", border: "2px solid #f1d39b", boxShadow: "0 3px 0 #0002", font: "900 17px 'Baloo 2',sans-serif" }}>🏆 NHÀ THI ĐẤU TRI THỨC</div></Html>
    </group>
  );
}

function CampusGreenery({ portals }: { portals: Portal[] }) {
  const trees: [number, number][] = [
    [-12, -11],
    [13, -10],
  ];
  const available = trees.filter(([x, z]) =>
    portals.every((portal) => {
      const [buildingX, buildingZ] = portalBuildingPosition(portal);
      return Math.hypot(x - buildingX, z - buildingZ) > 5.1;
    }),
  );
  return (
    <group>
      {available.map(([x, z], i) => (
        <Tree key={`${x}-${z}-${i}`} x={x} z={z} />
      ))}
      {[
        [-8, 20, 0],
        [8, 20, 0],
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

function SchoolBoundary() {
  const radius = 26.5;
  const segments = Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * Math.PI * 2;
    return { angle, x: Math.sin(angle) * radius, z: Math.cos(angle) * radius };
  }).filter(({ angle }) => Math.abs(Math.atan2(Math.sin(angle), Math.cos(angle))) > 0.27);

  return (
    <group>
      {segments.map(({ angle, x, z }, i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
          <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[4.18, 2.3, 0.42]} />
            <meshStandardMaterial color="#f4e5c9" roughness={0.88} />
          </mesh>
          <mesh position={[0, 2.28, 0]} castShadow>
            <boxGeometry args={[4.22, 0.18, 0.5]} />
            <meshStandardMaterial color="#bd8050" roughness={0.78} />
          </mesh>
          <mesh position={[0, 1.72, 0.225]}>
            <boxGeometry args={[3.7, 0.12, 0.035]} />
            <meshStandardMaterial color="#d6a56d" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 32 }, (_, i) => {
        const angle = (i / 32) * Math.PI * 2;
        if (Math.abs(Math.atan2(Math.sin(angle), Math.cos(angle))) < 0.27) return null;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 1.45, 0]} castShadow>
              <boxGeometry args={[0.62, 2.9, 0.68]} />
              <meshStandardMaterial color="#e8c99c" roughness={0.82} />
            </mesh>
            <mesh position={[0, 2.98, 0]} castShadow>
              <boxGeometry args={[0.9, 0.22, 0.92]} />
              <meshStandardMaterial color="#477e59" roughness={0.72} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function EntranceGate() {
  return (
    <group position={[0, 0, 26.2]}>
      {/* Hai trụ cổng lớn ốp đá, chân đế và mái chóp */}
      {[-5.7, 5.7].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[1.9, 0.56, 1.65]} />
            <meshStandardMaterial color="#b98255" roughness={0.82} />
          </mesh>
          <mesh position={[0, 2.05, 0]} castShadow>
            <boxGeometry args={[1.48, 3.55, 1.25]} />
            <meshStandardMaterial color="#f7e8c9" roughness={0.82} />
          </mesh>
          <mesh position={[0, 3.9, 0]} castShadow>
            <boxGeometry args={[1.78, 0.28, 1.5]} />
            <meshStandardMaterial color="#477e59" roughness={0.72} />
          </mesh>
          <mesh position={[0, 4.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.86, 0.72, 4]} />
            <meshStandardMaterial color="#d99a58" roughness={0.72} />
          </mesh>
          <mesh position={[0, 2.2, 0.64]}>
            <boxGeometry args={[0.82, 1.35, 0.06]} />
            <meshStandardMaterial color="#d8b47d" roughness={0.7} />
          </mesh>
          <mesh position={[0, 2.2, 0.69]}>
            <octahedronGeometry args={[0.28]} />
            <meshStandardMaterial color="#fff0a8" emissive="#dba94b" emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}
      {/* Dầm cổng lớn và mái che */}
      <mesh position={[0, 4.05, 0]} castShadow>
        <boxGeometry args={[10.8, 0.72, 1.35]} />
        <meshStandardMaterial color="#477e59" roughness={0.74} />
      </mesh>
      <mesh position={[0, 4.48, 0]} castShadow>
        <boxGeometry args={[11.5, 0.2, 1.65]} />
        <meshStandardMaterial color="#d99a58" roughness={0.72} />
      </mesh>
      <mesh position={[0, 4.82, 0]} castShadow>
        <boxGeometry args={[9.8, 0.16, 1.3]} />
        <meshStandardMaterial color="#f7e8c9" roughness={0.78} />
      </mesh>
      <Html position={[0, 4.08, 0.72]} center distanceFactor={13}>
        <div
          style={{
            whiteSpace: "nowrap",
            borderRadius: 12,
            padding: "8px 25px",
            color: "#fff9e9",
            background: "linear-gradient(135deg,#356b4a,#579365)",
            border: "3px solid #f2d39b",
            font: "900 21px 'Baloo 2', sans-serif",
            letterSpacing: 1,
            boxShadow: "0 5px 0 #294d36, 0 8px 18px #0003",
          }}
        >
          ✦ TRƯỜNG BÉ HỌC VUI ✦
          <div style={{ font: "700 11px 'Nunito',sans-serif", letterSpacing: 2 }}>
            ƯƠM MẦM TRI THỨC · CHẮP CÁNH ƯỚC MƠ
          </div>
        </div>
      </Html>
      {/* Lối đi lát đá dẫn qua cổng */}
      <mesh position={[0, 0.045, 3.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[11.2, 7.5]} />
        <meshStandardMaterial color="#f4e8ce" roughness={0.94} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 7.4, 0, 0]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 1.1, 12]} />
            <meshStandardMaterial color="#bd8050" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <sphereGeometry args={[0.28, 14, 12]} />
            <meshStandardMaterial color="#fff0a8" emissive="#e8b95e" emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
