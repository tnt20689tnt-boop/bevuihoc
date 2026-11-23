import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Profile } from "@/hooks/use-player";
import { supabase } from "@/integrations/supabase/client";
import { CLOTH_COLORS, defaultAvatar, type Avatar } from "@/lib/avatar";
import { Character3D, makeAnimState, type AnimState } from "./Character3D";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";

type Zone = "clothes" | "hair" | "glasses" | "clips" | "headwear" | "shoes";
type Option = { id: string; name: string; emoji: string; color: string; mapped: string };

const ZONES: { id: Zone; label: string; icon: string; caption: string }[] = [
  { id: "clothes", label: "Quần áo", icon: "👗", caption: "10 bộ váy công chúa" },
  { id: "hair", label: "Tóc", icon: "💇‍♀️", caption: "10 kiểu tóc anime" },
  { id: "glasses", label: "Kính", icon: "👓", caption: "10 loại kính" },
  { id: "clips", label: "Kẹp tóc", icon: "🎀", caption: "10 loại kẹp tóc" },
  { id: "headwear", label: "Mũ & vương miện", icon: "👑", caption: "10 phụ kiện đội đầu" },
  { id: "shoes", label: "Giày", icon: "👠", caption: "10 kiểu giày" },
];

const clothes: Option[] = [
  ["princess-pink", "Công chúa hồng", "🌸", "#ff76ad", "dress"],
  ["lavender-dream", "Mộng tím", "💜", "#aa8cff", "dress"],
  ["blue-swan", "Thiên nga xanh", "🦢", "#72b9ff", "skirt"],
  ["sunshine", "Nắng vàng", "🌞", "#ffd05a", "dress"],
  ["mint-garden", "Vườn bạc hà", "🌿", "#70d8bd", "skirt"],
  ["ruby-party", "Dạ tiệc ruby", "❤️", "#ee5579", "dress"],
  ["cloud-bow", "Nơ mây", "☁️", "#f6f4ff", "overall"],
  ["star-uniform", "Đồng phục sao", "⭐", "#6478e8", "uniform"],
  ["peach-fairy", "Tiên đào", "🍑", "#ffad87", "dress"],
  ["rainbow-stage", "Cầu vồng sân khấu", "🌈", "#ed78d3", "skirt"],
].map(([id, name, emoji, color, mapped]) => ({ id, name, emoji, color, mapped }));

const hair: Option[] = [
  ["silky-long", "Dài mượt", "✨", "#3a211b", "long"],
  ["twin-stars", "Hai bím sao", "🌟", "#e4a14a", "pigtails"],
  ["royal-ponytail", "Đuôi ngựa hoàng gia", "🎗️", "#6d3d25", "ponytail"],
  ["rose-bun", "Búi hoa hồng", "🌹", "#9b552d", "bun"],
  ["fairy-bob", "Bob tiên nữ", "🧚", "#e878ac", "bob"],
  ["night-long", "Dài đêm sao", "🌌", "#242d69", "long"],
  ["candy-pigtails", "Bím kẹo ngọt", "🍬", "#d871d4", "pigtails"],
  ["ocean-ponytail", "Đuôi ngựa biển", "🌊", "#4e8fd7", "ponytail"],
  ["golden-bun", "Búi vàng óng", "👸", "#e7c05a", "bun"],
  ["cherry-bob", "Bob cherry", "🍒", "#8f354a", "bob"],
].map(([id, name, emoji, color, mapped]) => ({ id, name, emoji, color, mapped }));

const glasses: Option[] = [
  ["heart", "Tim hồng", "💗", "#ff6ea8", "glasses"],
  ["round", "Tròn cổ điển", "🔴", "#7a4b8f", "glasses"],
  ["star", "Sao lấp lánh", "⭐", "#e7ae35", "star"],
  ["butterfly", "Bướm tím", "🦋", "#9d75e8", "glasses"],
  ["flower", "Hoa nhỏ", "🌼", "#f2b849", "glasses"],
  ["pink-cat", "Mèo con", "🐱", "#f58ba8", "glasses"],
  ["blue-gem", "Đá xanh", "💎", "#4eb9dd", "glasses"],
  ["pearl", "Ngọc trai", "🤍", "#e8d9e8", "glasses"],
  ["rainbow", "Cầu vồng", "🌈", "#d98fd6", "glasses"],
  ["moon", "Trăng bạc", "🌙", "#b6c6ed", "glasses"],
].map(([id, name, emoji, color, mapped]) => ({ id, name, emoji, color, mapped }));

const clips: Option[] = [
  ["bow-pink", "Nơ hồng", "🎀", "#ff6fa8", "bow"],
  ["bow-blue", "Nơ xanh", "🎗️", "#68b7ed", "bow"],
  ["rose", "Hoa hồng", "🌹", "#e84b70", "flower"],
  ["daisy", "Cúc trắng", "🌼", "#f5d65f", "flower"],
  ["star-gold", "Sao vàng", "⭐", "#f5c843", "star"],
  ["star-silver", "Sao bạc", "✦", "#c9d8ec", "star"],
  ["pearl-clip", "Ngọc trai", "🫧", "#f3e9ef", "headband"],
  ["butterfly-clip", "Bướm bay", "🦋", "#a985e9", "flower"],
  ["cherry-clip", "Cặp cherry", "🍒", "#de4b68", "bow"],
  ["crystal-clip", "Pha lê", "💠", "#77d1df", "star"],
].map(([id, name, emoji, color, mapped]) => ({ id, name, emoji, color, mapped }));

const headwear: Option[] = [
  ["tiara", "Vương miện", "👑", "#f7c84e", "headband"],
  ["sun-crown", "Vương miện nắng", "🌞", "#f3a83b", "headband"],
  ["flower-crown", "Vòng hoa", "🌺", "#e976a6", "flower"],
  ["witch-hat", "Mũ phù thủy", "🧙‍♀️", "#6f50a8", "cap"],
  ["beret", "Mũ beret", "🧢", "#e889a9", "cap"],
  ["straw-hat", "Mũ đi biển", "👒", "#e9bd69", "cap"],
  ["winter-hood", "Mũ tuyết", "❄️", "#b8dfff", "headband"],
  ["bunny-ears", "Tai thỏ", "🐰", "#f4b1cd", "headband"],
  ["cat-ears", "Tai mèo", "🐱", "#8a6ad4", "headband"],
  ["crystal-crown", "Vương miện pha lê", "💎", "#78d7df", "headband"],
].map(([id, name, emoji, color, mapped]) => ({ id, name, emoji, color, mapped }));

const shoes: Option[] = [
  ["pink-heels", "Guốc hồng", "👠", "#f06c9e", "#f06c9e"],
  ["glass-slipper", "Giày thủy tinh", "🥿", "#c7eaff", "#c7eaff"],
  ["ruby-heels", "Guốc ruby", "👠", "#c9375b", "#c9375b"],
  ["star-sneakers", "Giày sao", "👟", "#f4c84f", "#f4c84f"],
  ["lavender-boots", "Boot tím", "🥾", "#8c70db", "#8c70db"],
  ["mint-sandals", "Sandal bạc hà", "🩴", "#64ccb8", "#64ccb8"],
  ["blue-ballet", "Giày múa xanh", "🩰", "#71a9ed", "#71a9ed"],
  ["peach-pumps", "Giày đào", "👡", "#f59d7e", "#f59d7e"],
  ["golden-royal", "Giày vàng", "👑", "#e4b52e", "#e4b52e"],
  ["rainbow-shoes", "Giày cầu vồng", "🌈", "#e779c3", "#e779c3"],
].map(([id, name, emoji, color, mapped]) => ({ id, name, emoji, color, mapped }));

const OPTIONS: Record<Zone, Option[]> = { clothes, hair, glasses, clips, headwear, shoes };

function SuppliedModel() {
  const { scene } = useGLTF("/female_custom_poses.glb");
  const model = useMemo(() => scene.clone(), [scene]);
  return (
    <primitive
      object={model}
      position={[2.35, 0.05, -0.9]}
      rotation={[0, Math.PI, 0]}
      scale={1.65}
    />
  );
}

function Showroom({ avatar, anim }: { avatar: Avatar; anim: React.MutableRefObject<AnimState> }) {
  const sparkles = useMemo(
    () => new Float32Array(Array.from({ length: 180 }, (_, i) => (((i * 47) % 160) - 80) / 10)),
    [],
  );
  const points = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (points.current) points.current.rotation.y = clock.elapsedTime * 0.04;
  });
  return (
    <Canvas shadows camera={{ position: [0, 3.4, 8.8], fov: 40 }}>
      <color attach="background" args={["#f4e7ff"]} />
      <ambientLight intensity={1.8} color="#fff2fb" />
      <directionalLight
        castShadow
        position={[4, 8, 5]}
        intensity={2.5}
        color="#fff2cc"
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 3, 2]} intensity={12} distance={11} color="#e5a9ff" />
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkles, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#fff6ae" size={0.08} transparent opacity={0.85} />
      </points>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[6.5, 48]} />
        <meshStandardMaterial color="#f9eaf6" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.5, -3]} receiveShadow>
        <boxGeometry args={[13, 5, 0.25]} />
        <meshStandardMaterial color="#fff8ff" />
      </mesh>
      <mesh position={[0, 0.15, -1.15]}>
        <cylinderGeometry args={[2.4, 2.4, 0.2, 48]} />
        <meshStandardMaterial color="#e8b8ee" emissive="#f4c8ff" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, 1.65, -2.83]}>
        <boxGeometry args={[3.3, 2.5, 0.05]} />
        <meshStandardMaterial color="#d0a7e7" metalness={0.4} roughness={0.18} />
      </mesh>
      <Character3D avatar={avatar} state={anim} castShadow />
      <SuppliedModel />
      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={12}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.05}
        target={[0.8, 1.1, -0.9]}
      />
    </Canvas>
  );
}

function OptionCard({
  option,
  active,
  onClick,
}: {
  option: Option;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border-2 p-2 text-left transition hover:-translate-y-1 hover:shadow-lg ${active ? "border-fuchsia-500 bg-fuchsia-100 shadow-md" : "border-white bg-white/85"}`}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl shadow-inner"
          style={{ background: option.color }}
        >
          {option.emoji}
        </span>
        <span className="min-w-0 text-xs font-black leading-tight text-fuchsia-900">
          {option.name}
        </span>
      </div>
      {active && (
        <span className="absolute right-1 top-1 rounded-full bg-fuchsia-500 px-1.5 text-[10px] font-black text-white">
          ✓
        </span>
      )}
    </button>
  );
}

export function PrincessWardrobe3D({ profile }: { profile: Profile }) {
  const initial = profile.avatar.gender === "girl" ? profile.avatar : defaultAvatar("girl");
  const [avatar, setAvatar] = useState<Avatar>(initial);
  const [zone, setZone] = useState<Zone>("clothes");
  const [selected, setSelected] = useState<Record<Zone, string>>({
    clothes: "princess-pink",
    hair: "silky-long",
    glasses: "heart",
    clips: "bow-pink",
    headwear: "tiara",
    shoes: "pink-heels",
  });
  const [saving, setSaving] = useState(false);
  const anim = useRef<AnimState>(makeAnimState());
  const activeOptions = OPTIONS[zone];

  function choose(option: Option) {
    setSelected((value) => ({ ...value, [zone]: option.id }));
    setAvatar((value) => {
      if (zone === "clothes")
        return {
          ...value,
          outfit: option.mapped,
          topColor: option.color,
          bottomColor: option.color,
        };
      if (zone === "hair") return { ...value, hair: option.mapped, hairColor: option.color };
      if (zone === "shoes") return { ...value, shoeColor: option.mapped };
      return { ...value, accessory: option.mapped };
    });
    anim.current.motion = "dance";
    window.setTimeout(() => {
      anim.current.motion = "idle";
    }, 520);
    sfx.pop();
  }

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ avatar }).eq("id", profile.id);
      if (error) throw error;
      toast.success("Đã lưu bộ đồ công chúa! ✨");
      sfx.correct();
    } catch {
      toast.error("Chưa lưu được, bé thử lại nhé!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[radial-gradient(circle_at_top,#fff8ff,#f5dcf5_44%,#d5d9ff)] p-2 font-sans sm:p-4">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-[1500px] flex-col overflow-hidden rounded-[2rem] border-4 border-white/80 bg-white/30 shadow-[0_24px_80px_rgba(117,68,159,.26)] backdrop-blur">
        <header className="flex flex-wrap items-center gap-3 border-b border-white/70 bg-white/65 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/the-gioi";
            }}
            className="rounded-full bg-white px-3 py-2 text-sm font-black text-fuchsia-700 shadow"
          >
            ← Thế giới
          </button>
          <div className="min-w-[220px] flex-1 text-center">
            <p className="text-xs font-black uppercase tracking-[.3em] text-fuchsia-400">
              Dreamy Princess Atelier
            </p>
            <h1 className="text-2xl font-black text-fuchsia-900 sm:text-4xl">
              ✨ Salon Anime 3D ✨
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-black text-white shadow-lg disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "💖 Lưu diện mạo"}
          </button>
        </header>
        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_440px]">
          <section className="relative min-h-[430px] overflow-hidden">
            <Showroom avatar={avatar} anim={anim} />
            <div className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-white/75 px-4 py-2 text-xs font-black text-fuchsia-800 shadow">
              Bục giữa: avatar tùy chỉnh · bục phải: model GLB của bé
            </div>
          </section>
          <aside className="flex max-h-[58dvh] flex-col overflow-y-auto border-t border-white/80 bg-white/65 p-3 lg:max-h-none lg:border-l lg:border-t-0 lg:p-5">
            <div className="mb-3 rounded-2xl bg-white/85 p-3 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-fuchsia-400">
                Phòng makeover
              </p>
              <p className="mt-1 text-sm font-bold text-slate-500">
                Mỗi khu có đúng 10 lựa chọn xinh xắn. Chạm vào món đồ để thử ngay.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ZONES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setZone(item.id)}
                  className={`rounded-2xl border-2 p-3 text-left transition ${zone === item.id ? "border-fuchsia-400 bg-fuchsia-100 shadow-md" : "border-white bg-white/75 hover:bg-pink-50"}`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="mt-1 block text-sm font-black text-fuchsia-900">
                    {item.label}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-500">{item.caption}</span>
                </button>
              ))}
            </div>
            <div className="my-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-fuchsia-900">
                {ZONES.find((item) => item.id === zone)?.icon}{" "}
                {ZONES.find((item) => item.id === zone)?.label}
              </h2>
              <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-black text-fuchsia-700">
                10 món
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activeOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  active={selected[zone] === option.id}
                  onClick={() => choose(option)}
                />
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-fuchsia-100 to-pink-100 p-3 text-center">
              <p className="text-xs font-black text-fuchsia-800">
                ✨ Bộ sưu tập của bé đang lấp lánh ✨
              </p>
              <p className="mt-1 text-[11px] font-bold text-slate-500">
                Model GLB được đặt ở bục riêng để bé ngắm các pose 3D.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

useGLTF.preload("/female_custom_poses.glb");
