import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { Character3D, makeAnimState, type AnimState } from "@/game/Character3D";
import { CampusMultiplayer } from "@/game/CampusMultiplayer";
import { PlazaUpgrade3D } from "@/game/PlazaUpgrade3D";
import { findNearestPlaySpot, PLAYGROUND_COLLIDERS, Playground3D, type PlaySpot } from "@/game/Playground3D";
import { CampusArchitecture } from "@/game/CampusArchitecture";
import {
  ROOMS,
  type Activity,
  type Portal,
  type RoomDef,
  type RoomId,
  spawnPoint,
} from "@/game/rooms";
import type { Avatar } from "@/lib/avatar";
import type { Profile } from "@/hooks/use-player";

export type MovementInput = { x: number; z: number };

type WorldSceneProps = {
  roomId: RoomId;
  fromRoom: RoomId | null;
  avatar: Avatar;
  profile: Profile;
  touchRef: MutableRefObject<MovementInput>;
  onNearbyPortal: (portal: Portal | null) => void;
  onEnterPortal: (portal: Portal) => void;
  onInteract: () => void;
  onActivity: (activity: Activity) => void;
  onSelectPeer: (peer: { id: string; name: string }) => void;
  playingSpot: PlaySpot | null;
  onNearbyPlaySpot: (spot: PlaySpot | null) => void;
};

const palette = {
  ink: "#23324b",
  cream: "#fff7df",
  wood: "#a96b3c",
  leaf: "#67bd72",
  leafLight: "#9bdb8e",
  water: "#69d9e6",
  gold: "#ffd166",
};

export function WorldScene(props: WorldSceneProps) {
  const room = ROOMS[props.roomId];
  const playerPosition = useRef(spawnPoint(room.id, props.fromRoom));
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 10, 15], fov: 43, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      className="absolute inset-0"
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={[room.sky]} />
      <fog attach="fog" args={[room.sky, 28, 62]} />
      <ambientLight intensity={1.25} />
      <hemisphereLight args={["#f8fbff", "#927451", 1.05]} />
      <directionalLight
        position={[-8, 17, 9]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
      />
      <WorldFloor room={room} />
      {room.id === "plaza" ? <><PlazaUpgrade3D /><Playground3D activeSpotId={props.playingSpot?.id ?? null} /></> : <RoomDecor room={room} />}
      {room.portals.map((portal) => portal.to === "arena" ? null : (
        <PortalGate
          key={`${room.id}-${portal.to}`}
          portal={portal}
          active={props.roomId !== "plaza"}
          onEnter={() => props.onEnterPortal(portal)}
        />
      ))}
      {room.id !== "plaza" && room.activities.map((activity) => (
        <ActivityMarker
          key={`${activity.label}-${activity.x}-${activity.z}`}
          activity={activity}
          onActivate={() => props.onActivity(activity)}
        />
      ))}
      <CampusMultiplayer roomId={room.id} profile={props.profile} positionRef={playerPosition} onSelectPeer={props.onSelectPeer} />
      <PlayerController
        key={`${props.roomId}-${props.fromRoom ?? "start"}`}
        room={room}
        positionRef={playerPosition}
        fromRoom={props.fromRoom}
        avatar={props.avatar}
        displayName={props.profile.display_name}
        touchRef={props.touchRef}
        onNearbyPortal={props.onNearbyPortal}
        onInteract={props.onInteract}
        playingSpot={props.playingSpot}
        onNearbyPlaySpot={props.onNearbyPlaySpot}
      />
    </Canvas>
  );
}

function WorldFloor({ room }: { room: RoomDef }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[room.radius, 96]} />
        <meshStandardMaterial color={room.ground[0]} roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[room.id === "plaza" ? 5.2 : 3.8, room.id === "plaza" ? 7.4 : 4.1, 96]}
        />
        <meshStandardMaterial color={room.ground[1]} roughness={0.95} />
      </mesh>
      {room.id === "plaza" && (
        <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8.5, 9.05, 96]} />
          <meshStandardMaterial color="#fff4ce" roughness={1} />
        </mesh>
      )}
      {room.id === "boys" && <FootballPitch />}
      {room.id === "arena" && <mesh position={[0, 0.035, -1.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[13, 18]} /><meshStandardMaterial color="#b98555" roughness={0.82} /></mesh>}
    </group>
  );
}

function PlazaDecor() {
  const trees: [number, number, number][] = [
    [-12, -9, 1.05],
    [-11, 8, 0.9],
    [11, -8, 0.95],
    [12, 8, 1.08],
    [-7, -13, 0.82],
    [7, -13, 0.82],
    [-7, 13, 0.82],
    [7, 13, 0.82],
  ];
  return (
    <group>
      <CampusArchitecture portals={ROOMS.plaza.portals} />
      {trees.map(([x, z, scale], i) => (
        <Tree key={i} x={x} z={z} scale={scale} />
      ))}
      <Bench position={[-8, 0, 1]} rotation={0.42} />
      <Bench position={[8, 0, 1]} rotation={-0.42} />
      <Bench position={[0, 0, -10]} rotation={Math.PI} />
      <FlowerBed position={[-4.7, 0, -5]} />
      <FlowerBed position={[4.7, 0, -5]} />
      <FlowerBed position={[-12, 0, -1]} />
      <FlowerBed position={[12, 0, -1]} />
      <GardenShrubs />
      <FountainWater />
      <FloatingBubbles />
    </group>
  );
}

function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 1.5, 9]} />
        <meshStandardMaterial color="#98623d" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <sphereGeometry args={[0.85, 18, 14]} />
        <meshStandardMaterial color={palette.leaf} roughness={0.9} />
      </mesh>
      <mesh position={[-0.42, 1.48, 0.12]} castShadow>
        <sphereGeometry args={[0.47, 16, 12]} />
        <meshStandardMaterial color={palette.leafLight} roughness={0.9} />
      </mesh>
      <mesh position={[0.42, 1.42, -0.12]} castShadow>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshStandardMaterial color="#51ad65" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.62, 0.7, 0.14, 24]} />
        <meshStandardMaterial color="#d9c28e" roughness={0.96} />
      </mesh>
    </group>
  );
}

function Bench({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2.1, 0.16, 0.62]} />
        <meshStandardMaterial color={palette.wood} roughness={0.8} />
      </mesh>
      {[
        [-0.72, 0.25, 0],
        [0.72, 0.25, 0],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x ?? 0, y ?? 0, z ?? 0]} castShadow>
          <boxGeometry args={[0.15, 0.5, 0.42]} />
          <meshStandardMaterial color="#71482f" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.76, -0.25]} castShadow>
        <boxGeometry args={[2.1, 0.62, 0.14]} />
        <meshStandardMaterial color={palette.wood} roughness={0.8} />
      </mesh>
    </group>
  );
}

function FlowerBed({ position }: { position: [number, number, number] }) {
  const flowers = ["#ff7894", "#ffd166", "#a98bfa", "#ffffff"];
  return (
    <group position={position}>
      <mesh position={[0, 0.14, 0]} receiveShadow>
        <cylinderGeometry args={[1.35, 1.45, 0.28, 24]} />
        <meshStandardMaterial color="#c78b5c" roughness={0.95} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.85, 0.45, Math.sin(a) * 0.7]} castShadow>
            <sphereGeometry args={[0.23, 12, 10]} />
            <meshStandardMaterial
              color={flowers[i % flowers.length] ?? "#ffffff"}
              roughness={0.62}
            />
          </mesh>
        );
      })}
    </group>
  );
}


function FountainWater() {
  const jets = useRef<(THREE.Mesh | null)[]>([]);
  const droplets = useRef<(THREE.Mesh | null)[]>([]);
  const ripples = useRef<(THREE.Mesh | null)[]>([]);
  const dropletSeeds = Array.from({ length: 20 }, (_, i) => ({
    angle: (i / 20) * Math.PI * 2,
    radius: 0.72 + (i % 4) * 0.13,
    speed: 0.7 + (i % 5) * 0.12,
    phase: (i % 7) / 7,
  }));
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    jets.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.scale.y = 0.78 + Math.sin(t * 3.1 + i * 1.7) * 0.12;
      mesh.rotation.z = Math.sin(t * 1.8 + i) * 0.035;
    });
    droplets.current.forEach((mesh, i) => {
      if (!mesh) return;
      const seed = dropletSeeds[i];
      if (!seed) return;
      const phase = (t * seed.speed + seed.phase) % 1;
      const y = 1.92 - phase * 1.35;
      const spread = seed.radius + Math.sin(phase * Math.PI) * 0.2;
      mesh.position.set(Math.cos(seed.angle) * spread, y, Math.sin(seed.angle) * spread);
      const size = 0.045 + Math.sin(phase * Math.PI) * 0.025;
      mesh.scale.setScalar(size);
    });
    ripples.current.forEach((mesh, i) => {
      if (!mesh) return;
      const phase = (t * 0.48 + i * 0.34) % 1;
      mesh.scale.setScalar(0.45 + phase * 1.3);
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = (1 - phase) * 0.42;
    });
  });
  return (
    <group position={[0, 0.35, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(node) => { jets.current[i] = node; }}
          position={[0, 0.82, 0]}
          rotation={[Math.sin((i / 4) * Math.PI * 2) * 0.22, 0, Math.cos((i / 4) * Math.PI * 2) * 0.22]}
        >
          <cylinderGeometry args={[0.055, 0.075, 1.5, 10]} />
          <meshStandardMaterial color="#baf7ff" emissive="#4ad8f0" emissiveIntensity={0.5} transparent opacity={0.82} roughness={0.18} />
        </mesh>
      ))}
      {dropletSeeds.map((seed, i) => (
        <mesh key={i} ref={(node) => { droplets.current[i] = node; }}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#d8fbff" emissive="#65dff2" emissiveIntensity={0.28} roughness={0.12} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(node) => { ripples.current[i] = node; }}
          position={[0, 0.13 + i * 0.012, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.62, 0.72, 40]} />
          <meshStandardMaterial color="#baf7ff" transparent opacity={0.4} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function GardenShrubs() {
  const shrubs: [number, number, string][] = [
    [-13.5, -5, "#4d9b62"], [-13.2, -3.9, "#78bd70"], [-12.7, -5.8, "#66ad68"],
    [13.5, -5, "#4d9b62"], [13.2, -3.9, "#78bd70"], [12.7, -5.8, "#66ad68"],
    [-9.2, 12.8, "#6eaf68"], [-7.9, 13.2, "#4d9b62"],
    [9.2, 12.8, "#6eaf68"], [7.9, 13.2, "#4d9b62"],
  ];
  return (
    <group>
      {shrubs.map(([x, z, color], i) => (
        <mesh key={i} position={[x, 0.42 + (i % 3) * 0.06, z]} castShadow>
          <sphereGeometry args={[0.62, 14, 12]} />
          <meshStandardMaterial color={color} roughness={0.94} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 16.1, 0, 0]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, 0.5, -5 + i * 3]} castShadow>
              <cylinderGeometry args={[0.055, 0.055, 1, 8]} />
              <meshStandardMaterial color="#d5a45f" roughness={0.72} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function FloatingBubbles() {
  return (
    <group>
      {[
        [-4, 3.4, 3, "⭐"],
        [4, 3.1, 2.5, "🌼"],
        [-7, 2.6, -2, "✦"],
        [7, 3.2, -1, "☁️"],
      ].map(([x, y, z, icon], i) => (
        <Html key={i} position={[Number(x), Number(y), Number(z)]} center distanceFactor={13}>
          <span style={{ fontSize: 26, filter: "drop-shadow(0 4px 5px #0003)" }}>
            {String(icon)}
          </span>
        </Html>
      ))}
    </group>
  );
}

function RoomDecor({ room }: { room: RoomDef }) {
  if (room.id === "arena") return <ArenaRoomDecor />;
  return (
    <group>
      <mesh position={[0, 1.65, -10.5]} castShadow>
        <boxGeometry args={[7.2, 3.4, 0.5]} />
        <meshStandardMaterial color={room.color} roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.65, -10.19]}>
        <boxGeometry args={[6.65, 2.85, 0.08]} />
        <meshStandardMaterial color={room.id === "boys" ? "#e9fff2" : "#fffdf2"} roughness={0.8} />
      </mesh>
      <Html position={[0, 2.25, -10.05]} center distanceFactor={10}>
        <div
          style={{
            width: 280,
            textAlign: "center",
            color: palette.ink,
            font: "800 24px 'Baloo 2', sans-serif",
            textShadow: "0 1px 0 white",
          }}
        >
          {room.emoji} {room.short}
        </div>
      </Html>
      {room.id === "math" && <MathProps />}
      {room.id === "vietnamese" && <VietnameseProps />}
      {room.id === "english" && <EnglishProps />}
      {room.id === "girls" && <GirlsProps />}
      {room.id === "boys" && <GoalProps />}
      <RoomPlants />
    </group>
  );
}


function ArenaRoomDecor() {
  const seatColumns = [-3.8, 0, 3.8];
  return (
    <group>
      <mesh position={[-6.55, 2, -1.5]} castShadow><boxGeometry args={[0.35, 4, 18]} /><meshStandardMaterial color="#f2dfbd" /></mesh>
      <mesh position={[6.55, 2, -1.5]} castShadow><boxGeometry args={[0.35, 4, 18]} /><meshStandardMaterial color="#f2dfbd" /></mesh>
      <mesh position={[0, 2, -10.45]} castShadow><boxGeometry args={[13.4, 4, 0.35]} /><meshStandardMaterial color="#f2dfbd" /></mesh>
      <mesh position={[-4.1, 2, 7.45]} castShadow><boxGeometry args={[5.2, 4, 0.35]} /><meshStandardMaterial color="#f2dfbd" /></mesh>
      <mesh position={[4.1, 2, 7.45]} castShadow><boxGeometry args={[5.2, 4, 0.35]} /><meshStandardMaterial color="#f2dfbd" /></mesh>
      <mesh position={[0, 3.82, 7.45]}><boxGeometry args={[3, 0.36, 0.35]} /><meshStandardMaterial color="#f2dfbd" /></mesh>
      <mesh position={[0, 4.25, -1.5]} rotation={[0.18, 0, 0]}><boxGeometry args={[13.8, 0.28, 18.8]} /><meshStandardMaterial color="#a94f35" transparent opacity={0.25} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 4.65, -1.5]}><boxGeometry args={[14, 0.22, 0.35]} /><meshStandardMaterial color="#7e3e2b" /></mesh>
      <mesh position={[0, 2.45, -10.12]} castShadow><boxGeometry args={[8.5, 2.5, 0.28]} /><meshStandardMaterial color="#75462e" /></mesh>
      <mesh position={[0, 2.45, -9.94]}><boxGeometry args={[8.05, 2.05, 0.08]} /><meshStandardMaterial color="#173d55" emissive="#0b2638" emissiveIntensity={0.25} /></mesh>
      <Html position={[0, 2.7, -9.86]} center distanceFactor={10}><div style={{ width: 420, textAlign: "center", color: "#fff5d8", font: "900 28px 'Baloo 2',sans-serif", textShadow: "0 2px 4px #0008" }}>🏆 ĐẤU TRƯỜNG TRI THỨC<div style={{ marginTop: 6, fontSize: 16, color: "#ffdf8b" }}>TOÁN HỌC • TIẾNG VIỆT • TIẾNG ANH</div></div></Html>
      <mesh position={[0, 0.55, -7.3]} castShadow><boxGeometry args={[2.2, 1.1, 1.25]} /><meshStandardMaterial color="#b66b36" /></mesh>
      <mesh position={[0, 1.16, -7.3]} castShadow><boxGeometry args={[2.35, 0.16, 1.35]} /><meshStandardMaterial color="#f2c66d" /></mesh>
      <Html position={[0, 1.35, -7.25]} center distanceFactor={11}><div style={{ color: "#fff8e8", font: "900 15px 'Baloo 2',sans-serif", textShadow: "0 1px 3px #000" }}>MC</div></Html>
      {seatColumns.map((x, col) => [0, 1, 2].map((row) => (
        <group key={String(col) + "-" + String(row)} position={[x, 0, 1.1 + row * 1.75]}>
          <mesh position={[0, 0.55, 0]} castShadow><boxGeometry args={[1.25, 0.18, 0.85]} /><meshStandardMaterial color={["#4c91c8", "#e2a64b", "#59a77a"][col] ?? "#4c91c8"} /></mesh>
          <mesh position={[0, 1.05, -0.34]} castShadow><boxGeometry args={[1.25, 0.9, 0.14]} /><meshStandardMaterial color={["#4c91c8", "#e2a64b", "#59a77a"][col] ?? "#4c91c8"} /></mesh>
        </group>
      )))}
      {[-4.5, 0, 4.5].map((x) => <group key={x} position={[x, 3.45, 2.4]}><mesh><sphereGeometry args={[0.22, 16, 12]} /><meshStandardMaterial color="#ffe5a0" emissive="#ffbf55" emissiveIntensity={0.8} /></mesh><pointLight position={[0, -0.2, 0]} color="#ffe0a0" intensity={0.55} distance={5} /></group>)}
    </group>
  );
}

function MathProps() {
  return (
    <group position={[0, 0, -6]}>
      {[
        [-3, "➕"],
        [0, "7"],
        [3, "×"],
      ].map(([x, label], i) => (
        <LetterCube
          key={i}
          x={Number(x)}
          label={String(label)}
          color={["#72b7f2", "#ffcf63", "#ff8d9e"][i] ?? "#72b7f2"}
        />
      ))}
    </group>
  );
}

function VietnameseProps() {
  return (
    <group position={[0, 0.8, -6]}>
      <mesh position={[-0.68, 0.35, 0]} rotation={[0, 0, -0.12]} castShadow>
        <boxGeometry args={[1.65, 0.16, 1.35]} />
        <meshStandardMaterial color="#fff3cf" roughness={0.75} />
      </mesh>
      <mesh position={[0.68, 0.35, 0]} rotation={[0, 0, 0.12]} castShadow>
        <boxGeometry args={[1.65, 0.16, 1.35]} />
        <meshStandardMaterial color="#fff9e9" roughness={0.75} />
      </mesh>
      <Html position={[0, 1.05, 0.05]} center distanceFactor={10}>
        <div style={{ color: "#a34d6c", font: "800 34px 'Baloo 2', sans-serif" }}>Ă Â Ê</div>
      </Html>
    </group>
  );
}

function EnglishProps() {
  return (
    <group position={[0, 0, -6]}>
      {[
        [-2.4, "A", "#ff8d9e"],
        [0, "B", "#66cfa0"],
        [2.4, "C", "#73b5f5"],
      ].map(([x, label, color], i) => (
        <LetterCube key={i} x={Number(x)} label={String(label)} color={String(color)} />
      ))}
    </group>
  );
}

function LetterCube({ x, label, color }: { x: number; label: string; color: string }) {
  return (
    <group position={[x, 0.85, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.55, 1.55, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <Html position={[0, 0, 0.74]} center distanceFactor={9}>
        <span
          style={{
            color: "#ffffff",
            font: "900 42px 'Baloo 2', sans-serif",
            textShadow: "0 2px 5px #0004",
          }}
        >
          {label}
        </span>
      </Html>
    </group>
  );
}

function GirlsProps() {
  return (
    <group position={[0, 0, -6]}>
      <mesh position={[-2.2, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 0.16, 32]} />
        <meshStandardMaterial color="#f5bfd5" roughness={0.58} />
      </mesh>
      <mesh position={[-2.2, 2.1, -0.35]} castShadow>
        <boxGeometry args={[0.2, 1.8, 0.2]} />
        <meshStandardMaterial color="#d9ad87" roughness={0.7} />
      </mesh>
      <mesh position={[-2.2, 2.2, -0.23]}>
        <boxGeometry args={[1.25, 1.5, 0.08]} />
        <meshStandardMaterial color="#ffc9df" metalness={0.18} roughness={0.3} />
      </mesh>
      <FlowerBed position={[2.1, 0, 0.2]} />
      <Html position={[0, 1.3, 0.2]} center distanceFactor={10}>
        <div style={{ color: "#ce4e86", font: "800 25px 'Baloo 2', sans-serif" }}>
          ✨ Tự chọn phong cách ✨
        </div>
      </Html>
    </group>
  );
}

function FootballPitch() {
  return (
    <group position={[0, 0.025, -1]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 16]} />
        <meshStandardMaterial color="#67bd72" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[3.2, 3.28, 48]} />
        <meshStandardMaterial color="#f5fff0" />
      </mesh>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#f5fff0" />
      </mesh>
    </group>
  );
}

function GoalProps() {
  return (
    <group position={[0, 0, -8.4]}>
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 2.4, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 2.34, 0]} castShadow>
        <boxGeometry args={[4.5, 0.18, 0.18]} />
        <meshStandardMaterial color="#ffffff" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.45, -0.08]}>
        <sphereGeometry args={[0.42, 24, 20]} />
        <meshStandardMaterial color="#fffefa" roughness={0.56} />
      </mesh>
    </group>
  );
}

function RoomPlants() {
  return (
    <group>
      <Tree x={-10} z={-7} scale={0.75} />
      <Tree x={10} z={-7} scale={0.75} />
      <FlowerBed position={[-8, 0, 3]} />
      <FlowerBed position={[8, 0, 3]} />
    </group>
  );
}

function PortalGate({
  portal,
  active,
  onEnter,
}: {
  portal: Portal;
  active: boolean;
  onEnter: () => void;
}) {
  const destination = ROOMS[portal.to];
  const rotation = Math.atan2(-portal.x, -portal.z);
  return (
    <group position={[portal.x, 0, portal.z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.72, 40]} />
        <meshStandardMaterial color={destination.color} roughness={0.65} />
      </mesh>
      <mesh position={[-1.15, 1.27, 0]} castShadow>
        <boxGeometry args={[0.34, 2.55, 0.55]} />
        <meshStandardMaterial color={destination.color} roughness={0.58} />
      </mesh>
      <mesh position={[1.15, 1.27, 0]} castShadow>
        <boxGeometry args={[0.34, 2.55, 0.55]} />
        <meshStandardMaterial color={destination.color} roughness={0.58} />
      </mesh>
      <mesh position={[0, 2.52, 0]} castShadow>
        <torusGeometry args={[1.15, 0.18, 12, 32, Math.PI]} />
        <meshStandardMaterial color={destination.color} roughness={0.48} metalness={0.06} />
      </mesh>
      <mesh position={[0, 1.25, -0.02]}>
        <planeGeometry args={[2.0, 2.45]} />
        <meshStandardMaterial
          color={destination.color}
          transparent
          opacity={active ? 0.38 : 0.24}
          side={THREE.DoubleSide}
          emissive={destination.color}
          emissiveIntensity={0.13}
        />
      </mesh>
      <Html position={[0, 3.35, 0]} center distanceFactor={11} style={{ pointerEvents: "auto" }}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEnter();
          }}
          style={{
            minWidth: 120,
            whiteSpace: "nowrap",
            border: "2px solid #ffffffcc",
            borderRadius: 16,
            padding: "7px 12px",
            color: "#26344b",
            background: "#ffffffed",
            font: "800 15px 'Baloo 2', sans-serif",
            boxShadow: "0 5px 14px #1b2c4633",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 20, marginRight: 6 }}>{destination.emoji}</span>
          {destination.short}
          <span style={{ display: "block", font: "700 10px 'Nunito', sans-serif", opacity: 0.68 }}>
            {portal.to === "plaza" ? "Quay về sảnh" : "Chạm để khám phá"}
          </span>
        </button>
      </Html>
    </group>
  );
}

function ActivityMarker({ activity, onActivate }: { activity: Activity; onActivate: () => void }) {
  return (
    <group position={[activity.x, 0, activity.z]}>
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.28, 24]} />
        <meshStandardMaterial color={palette.gold} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.53, 1.2, 20]} />
        <meshStandardMaterial color="#f3a14a" roughness={0.55} />
      </mesh>
      <Html position={[0, 1.85, 0]} center distanceFactor={10} style={{ pointerEvents: "auto" }}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onActivate();
          }}
          style={{
            maxWidth: 190,
            whiteSpace: "nowrap",
            border: "2px solid #ffffff",
            borderRadius: 14,
            padding: "6px 11px",
            color: "#26344b",
            background: "#fff9e7",
            font: "800 13px 'Baloo 2', sans-serif",
            boxShadow: "0 4px 12px #1b2c4630",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 18, marginRight: 5 }}>{activity.icon}</span>
          {activity.label}
        </button>
      </Html>
    </group>
  );
}

function PlayerController({
  room,
  fromRoom,
  avatar,
  displayName,
  positionRef,
  touchRef,
  onNearbyPortal,
  onInteract,
  playingSpot,
  onNearbyPlaySpot,
}: {
  room: RoomDef;
  fromRoom: RoomId | null;
  avatar: Avatar;
  displayName: string;
  positionRef: MutableRefObject<ReturnType<typeof spawnPoint>>;
  touchRef: MutableRefObject<MovementInput>;
  onNearbyPortal: (portal: Portal | null) => void;
  onInteract: () => void;
  playingSpot: PlaySpot | null;
  onNearbyPlaySpot: (spot: PlaySpot | null) => void;
}) {
  const character = useRef<THREE.Group>(null);
  const position = positionRef;
  useEffect(() => {
    position.current = spawnPoint(room.id, fromRoom);
  }, [room.id, fromRoom, position]);
  const held = useRef(new Set<string>());
  const animation = useRef<AnimState>(makeAnimState());
  const activePortal = useRef<string | null>(null);
  const nearbyHandler = useRef(onNearbyPortal);
  const interactHandler = useRef(onInteract);
  const playHandler = useRef(onNearbyPlaySpot);
  const activePlayId = useRef<string | null>(null);
  const previousPlayingSpot = useRef<PlaySpot | null>(null);
  const playStartedAt = useRef(0);
  const playingRef = useRef(false);
  const { camera, gl } = useThree();
  const desiredCamera = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const cameraYaw = useRef(0);
  const cameraPitch = useRef(0.48);
  const cameraDistance = useRef(12.4);
  const smoothedCamera = useRef(new THREE.Vector3());
  const smoothedTarget = useRef(new THREE.Vector3());
  const cameraInitialized = useRef(false);
  const sitting = useRef(false);
  const benchSpots = [
    { x: -8, z: 1, rotation: 0.42 },
    { x: 8, z: 1, rotation: -0.42 },
    { x: 0, z: -10, rotation: Math.PI },
  ];

  useEffect(() => {
    nearbyHandler.current = onNearbyPortal;
  }, [onNearbyPortal]);
  useEffect(() => {
    interactHandler.current = onInteract;
  }, [onInteract]);
  useEffect(() => {
    playHandler.current = onNearbyPlaySpot;
  }, [onNearbyPlaySpot]);
  useEffect(() => {
    playingRef.current = !!playingSpot;
    if (playingSpot) {
      playStartedAt.current = performance.now() / 1000;
      position.current.x = playingSpot.position[0] + playingSpot.seatOffset[0];
      position.current.z = playingSpot.position[2] + playingSpot.seatOffset[2];
      sitting.current = false;
      animation.current.motion = playingSpot.kind === "slide" || playingSpot.kind === "springRider" ? "jump" : "idle";
      const emotes: Record<PlaySpot["kind"], AnimState["emote"]> = {
        swing: "wave", slide: "cheer", seesaw: "laugh", springRider: "cheer",
        ballPit: "laugh", playhouse: "wave", tunnel: "surprised", climber: "cheer",
        carousel: "dance", bench: "clap",
      };
      animation.current.emote = emotes[playingSpot.kind];
      animation.current.emoteUntil = performance.now() / 1000 + 3600;
      held.current.clear();
    } else if (previousPlayingSpot.current) {
      held.current.clear();
      sitting.current = false;
      position.current.x = previousPlayingSpot.current.position[0];
      position.current.z = previousPlayingSpot.current.position[2] + 2.2;
      animation.current.motion = "idle";
      animation.current.emote = null;
      animation.current.emoteUntil = 0;
    }
    previousPlayingSpot.current = playingSpot;
  }, [playingSpot, position]);


  useEffect(() => {
    let drag: { id: number; x: number; y: number } | null = null;
    const canvas = gl.domElement;
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
      try { canvas.setPointerCapture(event.pointerId); } catch { /* capture may be unavailable */ }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      cameraYaw.current -= (event.clientX - drag.x) * 0.006;
      cameraPitch.current = THREE.MathUtils.clamp(
        cameraPitch.current + (event.clientY - drag.y) * 0.004,
        0.08,
        1.22,
      );
      drag.x = event.clientX;
      drag.y = event.clientY;
    };
    const onPointerUp = () => { drag = null; };
    const onWheel = (event: WheelEvent) => {
      cameraDistance.current = THREE.MathUtils.clamp(cameraDistance.current + event.deltaY * 0.01, 5, 24);
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: true });
    const interact = () => {
      if (playingRef.current) return;
      const nearestBench = room.id === "plaza"
        ? benchSpots
            .map((bench) => ({ bench, distance: Math.hypot(positionRef.current.x - bench.x, positionRef.current.z - bench.z) }))
            .sort((a, b) => a.distance - b.distance)[0]
        : undefined;
      if (sitting.current) {
        sitting.current = false;
        animation.current.motion = "idle";
      } else if (nearestBench && nearestBench.distance < 2.7) {
        const { bench } = nearestBench;
        positionRef.current.x = bench.x + Math.sin(bench.rotation) * 0.95;
        positionRef.current.z = bench.z + Math.cos(bench.rotation) * 0.95;
        if (character.current) character.current.rotation.y = bench.rotation + Math.PI;
        sitting.current = true;
        animation.current.motion = "sit";
      } else {
        interactHandler.current();
      }
    };
    const onTouchInteract = () => interact();
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (
        ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(
          key,
        )
      ) {
        event.preventDefault();
        held.current.add(key);
      }
      if (!event.repeat && (key === "e" || key === " ")) {
        event.preventDefault();
        interact();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => held.current.delete(event.key.toLowerCase());
    const clearKeys = () => held.current.clear();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("campus-interact", onTouchInteract);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearKeys);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("campus-interact", onTouchInteract);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearKeys);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [gl]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const keys = held.current;
    const moveRight =
      Number(keys.has("d") || keys.has("arrowright")) -
      Number(keys.has("a") || keys.has("arrowleft")) + touchRef.current.x;
    const moveForward =
      Number(keys.has("w") || keys.has("arrowup")) -
      Number(keys.has("s") || keys.has("arrowdown")) - touchRef.current.z;
    const magnitude = Math.hypot(moveRight, moveForward);
    const inputRight = magnitude > 1 ? moveRight / magnitude : moveRight;
    const inputForward = magnitude > 1 ? moveForward / magnitude : moveForward;
    const sinYaw = Math.sin(cameraYaw.current);
    const cosYaw = Math.cos(cameraYaw.current);
    let dx = -sinYaw * inputForward + cosYaw * inputRight;
    let dz = -cosYaw * inputForward - sinYaw * inputRight;
    const moving = !playingSpot && Math.hypot(dx, dz) > 0.04;
    if (moving && sitting.current) sitting.current = false;
    const speed = keys.has("shift") ? 6.4 : 4.2;
    if (moving) {
      const nextX = position.current.x + dx * speed * dt;
      const nextZ = position.current.z + dz * speed * dt;
      const blocked = (x: number, z: number) => {
        if (room.id === "arena") {
          if (Math.abs(x) > 6.05 || z < -10.1) return true;
          if (z > 7.0 && Math.abs(x) > 1.45) return true;
          return false;
        }
        // Keep the circular campus boundary, but leave a clear walkable corridor
        // through the front gate so the outdoor spawn can enter the school.
        const insideFrontGate = room.id === "plaza" && z > 0 && z < 34.5 && Math.abs(x) < 4.35;
        if (Math.hypot(x, z) > room.radius - 0.8 && !insideFrontGate) return true;
        if (room.obstacles.some((obstacle) => Math.hypot(x - obstacle.x, z - obstacle.z) < obstacle.r + 0.52)) return true;
        if (room.id === "plaza") {
          const buildingHit = room.portals.some((portal) => {
            const cx = portal.x * 1.28;
            const cz = portal.z * 1.28;
            const yaw = Math.atan2(-cx, -cz);
            const halfWidth = portal.to === "arena" ? 4.25 : 4.1;
            const halfDepth = portal.to === "arena" ? 2.8 : 3.1;
            const halfX = Math.abs(Math.cos(yaw)) * halfWidth + Math.abs(Math.sin(yaw)) * halfDepth + 0.52;
            const halfZ = Math.abs(Math.sin(yaw)) * halfWidth + Math.abs(Math.cos(yaw)) * halfDepth + 0.52;
            return x > cx - halfX && x < cx + halfX && z > cz - halfZ && z < cz + halfZ;
          });
          const playHit = PLAYGROUND_COLLIDERS.some((box) => x > box.minX - 0.52 && x < box.maxX + 0.52 && z > box.minZ - 0.52 && z < box.maxZ + 0.52);
          if (buildingHit || playHit) return true;
        }
        return false;
      };
      if (!blocked(nextX, position.current.z)) position.current.x = nextX;
      if (!blocked(position.current.x, nextZ)) position.current.z = nextZ;
      animation.current.motion = keys.has("shift") ? "run" : "walk";
      const targetYaw = Math.atan2(dx, dz);
      if (character.current) {
        const currentYaw = character.current.rotation.y;
        const deltaYaw = THREE.MathUtils.euclideanModulo(targetYaw - currentYaw + Math.PI, Math.PI * 2) - Math.PI;
        character.current.rotation.y += deltaYaw * (1 - Math.exp(-12 * dt));
      }
    } else if (!playingSpot) {
      animation.current.motion = sitting.current ? "sit" : "idle";
    }
    let playerY = playingSpot?.seatOffset[1] ?? 0;
    const playElapsed = performance.now() / 1000 - playStartedAt.current;
    if (playingSpot?.kind === "swing") {
      const angle = Math.sin(playElapsed * 2.5) * 0.42;
      position.current.z = playingSpot.position[2] + Math.sin(angle) * 0.95;
      playerY = 1.275 - Math.cos(angle) * 0.95;
    } else if (playingSpot?.kind === "seesaw") {
      playerY = 0.56 + Math.sin(playElapsed * 3) * 0.11;
    } else if (playingSpot?.kind === "springRider") {
      playerY = 0.525 + Math.abs(Math.sin(playElapsed * 8)) * 0.09;
    } else if (playingSpot?.kind === "ballPit") {
      playerY = 0.15 + Math.abs(Math.sin(playElapsed * 3)) * 0.08;
    } else if (playingSpot?.kind === "slide") {
      const progress = Math.min(playElapsed / 2.4, 1);
      position.current.x = playingSpot.position[0];
      position.current.z = playingSpot.position[2] - 0.35 + progress * 1.4;
      if (character.current) character.current.rotation.y = 0;
    } else if (playingSpot?.kind === "carousel") {
      const angle = playElapsed * 1.25;
      position.current.x = playingSpot.position[0] + Math.cos(angle) * 0.575;
      position.current.z = playingSpot.position[2] + Math.sin(angle) * 0.575;
      if (character.current) character.current.rotation.y = -angle;
    }
    if (character.current) {
      character.current.position.set(position.current.x, playerY, position.current.z);
    }

    const nearestPlaySpot = room.id === "plaza"
      ? findNearestPlaySpot([position.current.x, 0, position.current.z], !!playingSpot)
      : null;
    if (nearestPlaySpot?.id !== activePlayId.current) {
      activePlayId.current = nearestPlaySpot?.id ?? null;
      playHandler.current(nearestPlaySpot);
    }

    const nearest =
      room.portals
        .map((portal) => ({
          portal,
          distance: Math.hypot(position.current.x - portal.x, position.current.z - portal.z),
        }))
        .filter((item) => item.distance < 3.45)
        .sort((a, b) => a.distance - b.distance)[0]?.portal ?? null;
    const portalId = nearest?.to ?? null;
    if (portalId !== activePortal.current) {
      activePortal.current = portalId;
      nearbyHandler.current(nearest);
    }

    // Chua Tam An style orbit camera: drag to rotate independently while moving.
    const cp = Math.cos(cameraPitch.current);
    lookTarget.current.set(position.current.x, 1.6, position.current.z);
    desiredCamera.current.set(
      position.current.x + Math.sin(cameraYaw.current) * cameraDistance.current * cp,
      1.6 + Math.sin(cameraPitch.current) * cameraDistance.current,
      position.current.z + Math.cos(cameraYaw.current) * cameraDistance.current * cp,
    );
    const followAlpha = 1 - Math.exp(-10 * dt);
    const lookAlpha = 1 - Math.exp(-14 * dt);
    if (!cameraInitialized.current) {
      smoothedCamera.current.copy(desiredCamera.current);
      smoothedTarget.current.copy(lookTarget.current);
      cameraInitialized.current = true;
    } else {
      smoothedCamera.current.lerp(desiredCamera.current, followAlpha);
      smoothedTarget.current.lerp(lookTarget.current, lookAlpha);
    }
    camera.position.copy(smoothedCamera.current);
    camera.lookAt(smoothedTarget.current);
  });

  return (
    <group ref={character} rotation={[0, position.current.ry, 0]}>
      <Character3D avatar={avatar} state={animation} />
      <Html position={[0, 2.05, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <span style={{
          display: "block",
          maxWidth: 150,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          borderRadius: 10,
          padding: "3px 9px",
          color: "#26344b",
          background: "#fff9e7",
          border: "1px solid #ffffff",
          font: "800 11px 'Nunito', sans-serif",
          boxShadow: "0 2px 8px #1b2c4630",
        }}>{displayName || "Bạn học"}</span>
      </Html>
    </group>
  );
}
