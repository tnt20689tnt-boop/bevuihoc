import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/hooks/use-player";
import {
  CLOTH_COLORS,
  EYES,
  HAIR_COLORS,
  HAIR_STYLES,
  MOUTHS,
  OUTFITS,
  type Avatar,
} from "@/lib/avatar";
import { Character3D, makeAnimState, type AnimState } from "./Character3D";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";

type RoomId =
  "lobby" | "spa" | "makeup" | "hair" | "closet" | "face" | "accessories" | "nails" | "photo";
type Room = { id: RoomId; name: string; icon: string; color: string; description: string };

const ROOMS: Room[] = [
  {
    id: "lobby",
    name: "Sảnh lấp lánh",
    icon: "✨",
    color: "#f5a6d9",
    description: "Chọn một căn phòng để bắt đầu makeover.",
  },
  {
    id: "spa",
    name: "Phòng spa",
    icon: "🫧",
    color: "#9fe5df",
    description: "Làm sạch, đắp mặt nạ và thư giãn trước khi trang điểm.",
  },
  {
    id: "makeup",
    name: "Phòng makeup",
    icon: "💄",
    color: "#ffb5c8",
    description: "Chọn son, phấn mắt, má hồng và kẻ mắt anime.",
  },
  {
    id: "closet",
    name: "Phòng váy áo",
    icon: "👗",
    color: "#f7c56b",
    description: "Thử váy công chúa, đồng phục và những bộ đồ đáng yêu.",
  },
  {
    id: "hair",
    name: "Phòng tóc",
    icon: "💇‍♀️",
    color: "#c9a7ff",
    description: "Đổi kiểu tóc và màu tóc theo phong cách anime.",
  },
  {
    id: "face",
    name: "Phòng mắt môi",
    icon: "💄",
    color: "#ff9eb4",
    description: "Tạo đôi mắt long lanh và biểu cảm thật xinh.",
  },
  {
    id: "accessories",
    name: "Phòng phụ kiện",
    icon: "👑",
    color: "#8ed7d0",
    description: "Chọn vương miện, nơ, hoa và những món đồ phép thuật.",
  },
  {
    id: "nails",
    name: "Phòng làm móng",
    icon: "💅",
    color: "#dba7ff",
    description: "Sơn móng, gắn đá và chọn màu móng thật lấp lánh.",
  },
  {
    id: "photo",
    name: "Phòng chụp ảnh",
    icon: "📸",
    color: "#9fc5ff",
    description: "Lưu lại diện mạo công chúa hoàn hảo.",
  },
];

const ACCESSORY_OPTIONS = [
  { id: "none", label: "Không", icon: "🌙" },
  { id: "bow", label: "Nơ sao", icon: "🎀" },
  { id: "headband", label: "Băng đô", icon: "🌸" },
  { id: "flower", label: "Hoa hồng", icon: "🌹" },
  { id: "glasses", label: "Kính tim", icon: "💗" },
  { id: "star", label: "Kẹp sao", icon: "⭐" },
];

function Sparkles3D() {
  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.035;
  });
  const positions = useMemo(() => {
    const values: number[] = [];
    for (let i = 0; i < 110; i++)
      values.push(
        (((i * 37) % 120) - 60) / 10,
        1 + ((i * 61) % 62) / 10,
        (((i * 19) % 90) - 45) / 10,
      );
    return new Float32Array(values);
  }, []);
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#fff5b8" size={0.075} transparent opacity={0.85} />
    </points>
  );
}

function RoomPortal({
  room,
  position,
  onSelect,
}: {
  room: Room;
  position: [number, number, number];
  onSelect: () => void;
}) {
  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
        sfx.pop();
      }}
    >
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[2.2, 2.7, 0.35]} />
        <meshStandardMaterial
          color={room.color}
          emissive={room.color}
          emissiveIntensity={0.16}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[0, 1.12, 0.2]}>
        <boxGeometry args={[1.65, 2.1, 0.06]} />
        <meshStandardMaterial
          color="#fff5ff"
          transparent
          opacity={0.2}
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />
      </mesh>
      <Html center position={[0, 2.85, 0]} distanceFactor={8}>
        <button
          type="button"
          className="whitespace-nowrap rounded-full border-2 border-white/80 bg-white/90 px-3 py-1.5 text-xs font-black text-fuchsia-800 shadow-lg transition hover:scale-105"
        >
          {room.icon} {room.name}
        </button>
      </Html>
    </group>
  );
}

function SalonRoomScene({
  room,
  avatar,
  anim,
  onRoom,
}: {
  room: Room;
  avatar: Avatar;
  anim: React.MutableRefObject<AnimState>;
  onRoom: (id: RoomId) => void;
}) {
  const portals = ROOMS.filter((item) => item.id !== room.id);
  return (
    <Canvas shadows camera={{ position: [0, 5.3, 10], fov: 42 }} className="h-full w-full">
      <color attach="background" args={["#f5dff5"]} />
      <ambientLight intensity={1.7} color="#fff0fb" />
      <directionalLight
        castShadow
        position={[4, 9, 5]}
        intensity={2.2}
        color="#fff4ce"
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 3, 2]} intensity={15} distance={12} color={room.color} />
      <Sparkles3D />
      <group>
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[18, 14]} />
          <meshStandardMaterial color="#f7e8f1" roughness={0.83} />
        </mesh>
        <mesh position={[0, 3.5, -4]} receiveShadow>
          <boxGeometry args={[18, 7, 0.35]} />
          <meshStandardMaterial color="#fff8fd" roughness={0.85} />
        </mesh>
        <mesh position={[-8.8, 3.5, 0]} receiveShadow>
          <boxGeometry args={[0.35, 7, 14]} />
          <meshStandardMaterial color="#ead9f4" roughness={0.9} />
        </mesh>
        <mesh position={[8.8, 3.5, 0]} receiveShadow>
          <boxGeometry args={[0.35, 7, 14]} />
          <meshStandardMaterial color="#ead9f4" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.08, -1.8]} receiveShadow>
          <cylinderGeometry args={[3.3, 3.3, 0.12, 48]} />
          <meshStandardMaterial
            color={room.color}
            roughness={0.5}
            emissive={room.color}
            emissiveIntensity={0.08}
          />
        </mesh>
        <mesh position={[0, 1.6, -3.72]}>
          <boxGeometry args={[5.2, 3.25, 0.06]} />
          <meshStandardMaterial color="#d9b6ec" metalness={0.28} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.6, -3.78]}>
          <boxGeometry args={[4.72, 2.78, 0.04]} />
          <meshStandardMaterial
            color="#dff5ff"
            transparent
            opacity={0.28}
            metalness={0.7}
            roughness={0.1}
          />
        </mesh>
        <Character3D avatar={avatar} state={anim} castShadow />
        {portals.slice(0, 4).map((item, index) => (
          <RoomPortal
            key={item.id}
            room={item}
            position={[
              index < 2 ? (index ? 5.4 : -5.4) : index === 2 ? 5.4 : -5.4,
              0,
              index < 2 ? 2.7 : -1.8,
            ]}
            onSelect={() => onRoom(item.id)}
          />
        ))}
        {room.id === "closet" && (
          <group position={[-4.7, 1.5, -2.5]}>
            <mesh>
              <boxGeometry args={[2.2, 0.18, 0.5]} />
              <meshStandardMaterial color="#d79bc3" />
            </mesh>
            {[-0.8, 0, 0.8].map((x) => (
              <mesh key={x} position={[x, 0.85, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 1.6, 8]} />
                <meshStandardMaterial color="#d6a64d" />
              </mesh>
            ))}
          </group>
        )}
        {room.id === "face" && (
          <group position={[4.2, 1.4, -2.5]}>
            <mesh>
              <boxGeometry args={[2.5, 0.18, 1.2]} />
              <meshStandardMaterial color="#f2b9cf" />
            </mesh>
            {[-0.7, 0, 0.7].map((x) => (
              <mesh key={x} position={[x, 0.4, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.55, 16]} />
                <meshStandardMaterial color={x < 0 ? "#e879a7" : "#a78bfa"} />
              </mesh>
            ))}
          </group>
        )}
        {room.id === "accessories" && (
          <group position={[4.4, 1.2, -2.5]}>
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[(i - 1) * 0.8, 0, 0]} rotation-z={i * 0.25 - 0.25}>
                <torusGeometry args={[0.32, 0.08, 10, 24]} />
                <meshStandardMaterial
                  color={["#f4c95d", "#f5a6d9", "#93c5fd"][i]}
                  emissive={["#f4c95d", "#f5a6d9", "#93c5fd"][i]}
                  emissiveIntensity={0.22}
                />
              </mesh>
            ))}
          </group>
        )}
        {(room.id === "spa" || room.id === "makeup" || room.id === "nails") && (
          <group position={[4.2, 1.2, -2.5]}>
            <mesh>
              <boxGeometry args={[2.6, 0.18, 1.2]} />
              <meshStandardMaterial color={room.color} />
            </mesh>
            {[-0.7, 0, 0.7].map((x, index) => (
              <mesh key={x} position={[x, 0.4, 0]}>
                <cylinderGeometry
                  args={[
                    room.id === "spa" ? 0.25 : 0.18,
                    room.id === "spa" ? 0.25 : 0.18,
                    0.55,
                    16,
                  ]}
                />
                <meshStandardMaterial
                  color={
                    room.id === "spa"
                      ? ["#b6f1e8", "#fff1bb", "#c9a7ff"][index]
                      : ["#e879a7", "#a78bfa", "#f4c95d"][index]
                  }
                  emissive={room.color}
                  emissiveIntensity={0.15}
                />
              </mesh>
            ))}
          </group>
        )}
      </group>
      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={15}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.1, -1]}
      />
    </Canvas>
  );
}

function SwatchRow({
  values,
  value,
  onChange,
  shape = "round",
}: {
  values: string[];
  value: string;
  onChange: (value: string) => void;
  shape?: "round" | "square";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((item) => (
        <button
          key={item}
          type="button"
          aria-label={`Chọn ${item}`}
          onClick={() => {
            onChange(item);
            sfx.click();
          }}
          className={`${shape === "round" ? "h-10 w-10 rounded-full" : "h-11 w-11 rounded-xl"} border-4 ${value === item ? "scale-110 border-white ring-4 ring-fuchsia-300" : "border-white/70"} shadow-md transition`}
          style={{ background: item }}
        />
      ))}
    </div>
  );
}

export function PrincessSalon3D({ profile }: { profile: Profile }) {
  const [roomId, setRoomId] = useState<RoomId>("lobby");
  const [avatar, setAvatar] = useState<Avatar>(profile.avatar);
  const [saving, setSaving] = useState(false);
  const [sparkle, setSparkle] = useState(0);
  const anim = useRef<AnimState>(makeAnimState());
  const room = ROOMS.find((item) => item.id === roomId) ?? ROOMS[0]!;

  useEffect(() => {
    anim.current.motion = "idle";
  }, [roomId]);
  function goRoom(next: RoomId) {
    anim.current.motion = "walk";
    window.setTimeout(() => {
      anim.current.motion = "idle";
      setRoomId(next);
    }, 420);
  }
  function patch(next: Partial<Avatar>) {
    setAvatar((value) => ({ ...value, ...next }));
    setSparkle((value) => value + 1);
  }
  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ avatar }).eq("id", profile.id);
      if (error) throw error;
      toast.success("Đã lưu diện mạo công chúa! ✨");
      sfx.correct();
    } catch {
      toast.error("Chưa lưu được, bé thử lại nhé!");
    } finally {
      setSaving(false);
    }
  }
  const roomOptions =
    roomId === "closet" ? OUTFITS.girl : roomId === "hair" ? HAIR_STYLES.girl : [];
  return (
    <main className="relative flex min-h-[calc(100dvh-4rem)] w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#fff6ff,#f7dff3_46%,#d8d8ff)] p-2 font-sans sm:p-4">
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col overflow-hidden rounded-[2rem] border-4 border-white/80 bg-white/30 shadow-[0_22px_70px_rgba(139,73,170,.24)] backdrop-blur-sm">
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/70 bg-white/55 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/the-gioi";
            }}
            className="rounded-full bg-white px-3 py-2 text-sm font-black text-fuchsia-700 shadow"
          >
            ← Sảnh chính
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-xs font-black uppercase tracking-[.26em] text-fuchsia-400">
              Princess Dream Studio
            </p>
            <h1 className="text-2xl font-black text-fuchsia-800 sm:text-4xl">
              ✨ Salon Công Chúa 3D ✨
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-black text-white shadow-lg disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "💖 Lưu makeover"}
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside className="order-2 flex max-h-[46dvh] w-full shrink-0 flex-col gap-3 overflow-y-auto border-t border-white/80 bg-white/60 p-3 lg:order-1 lg:max-h-none lg:w-[330px] lg:border-r lg:border-t-0 lg:p-5">
            <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-fuchsia-400">
                Đang ở
              </p>
              <h2 className="mt-1 text-xl font-black text-fuchsia-800">
                {room.icon} {room.name}
              </h2>
              <p className="mt-1 text-sm font-bold text-slate-500">{room.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ROOMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goRoom(item.id)}
                  className={`rounded-2xl border-2 px-2 py-3 text-left transition ${roomId === item.id ? "border-fuchsia-400 bg-fuchsia-100 shadow-md" : "border-white bg-white/70 hover:bg-pink-50"}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="mt-1 block text-xs font-black text-fuchsia-800">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
            {roomOptions.length > 0 && (
              <div className="rounded-2xl bg-white/80 p-3">
                <h3 className="mb-2 font-black text-fuchsia-800">
                  {roomId === "closet" ? "👗 Chọn trang phục" : "💇 Chọn kiểu tóc"}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {roomOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        patch(
                          roomId === "closet"
                            ? {
                                outfit: item.id,
                                topColor:
                                  CLOTH_COLORS[Math.floor(Math.random() * CLOTH_COLORS.length)],
                              }
                            : { hair: item.id },
                        )
                      }
                      className="rounded-xl border-2 border-white bg-pink-50 px-2 py-2 text-xs font-black text-fuchsia-800 shadow-sm hover:bg-pink-100"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {roomId === "face" && (
              <div className="space-y-3 rounded-2xl bg-white/80 p-3">
                <h3 className="font-black text-fuchsia-800">💄 Trang điểm anime</h3>
                <div>
                  <p className="mb-1 text-xs font-black text-slate-500">Đôi mắt</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EYES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => patch({ eyes: item.id })}
                        className={`rounded-full px-2 py-1 text-xs font-black ${avatar.eyes === item.id ? "bg-fuchsia-500 text-white" : "bg-pink-100 text-fuchsia-700"}`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-black text-slate-500">Biểu cảm môi</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MOUTHS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => patch({ mouth: item.id })}
                        className={`rounded-full px-2 py-1 text-xs font-black ${avatar.mouth === item.id ? "bg-fuchsia-500 text-white" : "bg-pink-100 text-fuchsia-700"}`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {roomId === "spa" && (
              <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100 p-3">
                <h3 className="mb-2 font-black text-teal-800">🫧 Nghi thức thư giãn</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["🧼 Làm sạch", "🌿 Mặt nạ", "💧 Xông hơi", "💆 Massage"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSparkle((value) => value + 1);
                        sfx.correct();
                        toast.success(`${item} hoàn tất! Da công chúa đã sẵn sàng ✨`);
                      }}
                      className="rounded-xl bg-white/80 px-2 py-3 text-xs font-black text-teal-800 shadow-sm"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {roomId === "makeup" && (
              <div className="space-y-3 rounded-2xl bg-white/80 p-3">
                <h3 className="font-black text-fuchsia-800">💄 Bàn trang điểm</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["💋 Son hồng", "🍑 Má đào", "✨ Phấn mắt", "〰️ Kẻ mắt"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSparkle((value) => value + 1);
                        sfx.pop();
                      }}
                      className="rounded-xl bg-pink-100 px-2 py-3 text-xs font-black text-fuchsia-800"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-500">
                  Phòng mắt môi bên cạnh dùng để đổi biểu cảm khuôn mặt.
                </p>
              </div>
            )}
            {roomId === "accessories" && (
              <div className="rounded-2xl bg-white/80 p-3">
                <h3 className="mb-2 font-black text-fuchsia-800">👑 Phụ kiện phép thuật</h3>
                <div className="grid grid-cols-3 gap-2">
                  {ACCESSORY_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => patch({ accessory: item.id })}
                      className={`rounded-xl p-2 text-center text-2xl ${avatar.accessory === item.id ? "bg-fuchsia-200 ring-2 ring-fuchsia-400" : "bg-pink-50"}`}
                    >
                      <span>{item.icon}</span>
                      <small className="mt-1 block text-[10px] font-black text-fuchsia-700">
                        {item.label}
                      </small>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {roomId === "nails" && (
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 p-3">
                <h3 className="mb-2 font-black text-fuchsia-800">💅 Bộ sưu tập móng</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["#ff8fab", "#c084fc", "#60a5fa", "#facc15", "#fb7185", "#ffffff"].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSparkle((value) => value + 1);
                          sfx.click();
                        }}
                        className="h-10 rounded-xl border-4 border-white shadow"
                        style={{ background: color }}
                      />
                    ),
                  )}
                </div>
                <p className="mt-2 text-xs font-bold text-slate-500">
                  Chọn màu sơn, đá lấp lánh và kiểu nail đáng yêu.
                </p>
              </div>
            )}
            {roomId === "photo" && (
              <div className="rounded-2xl bg-gradient-to-br from-indigo-100 to-pink-100 p-4 text-center">
                <div className="text-4xl">📸 ✨ 👑</div>
                <p className="mt-2 text-sm font-black text-fuchsia-800">
                  Tạo dáng thật xinh rồi nhấn “Lưu makeover” nhé!
                </p>
              </div>
            )}
            {roomId === "hair" && (
              <div className="rounded-2xl bg-white/80 p-3">
                <p className="mb-2 text-xs font-black text-slate-500">Màu tóc lấp lánh</p>
                <SwatchRow
                  values={HAIR_COLORS}
                  value={avatar.hairColor}
                  onChange={(hairColor) => patch({ hairColor })}
                />
              </div>
            )}
            {roomId === "closet" && (
              <div className="rounded-2xl bg-white/80 p-3">
                <p className="mb-2 text-xs font-black text-slate-500">Màu váy</p>
                <SwatchRow
                  values={CLOTH_COLORS}
                  value={avatar.topColor}
                  onChange={(topColor) => patch({ topColor, bottomColor: topColor })}
                  shape="square"
                />
              </div>
            )}
          </aside>
          <section className="relative order-1 min-h-[390px] flex-1 overflow-hidden lg:order-2">
            <SalonRoomScene room={room} avatar={avatar} anim={anim} onRoom={goRoom} />
            <div
              key={sparkle}
              className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 text-2xl text-yellow-300 drop-shadow-[0_0_12px_#fff]"
            >
              {sparkle > 0 ? "✦ ･ﾟ✧ ✨ ✧ﾟ･ ✦" : ""}
            </div>
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-4 py-2 text-center text-xs font-black text-fuchsia-800 shadow">
              Chạm vào cánh cửa để công chúa đi sang phòng khác ✨
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
