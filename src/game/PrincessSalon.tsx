import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Avatar } from "@/lib/avatar";
import type { Profile } from "@/hooks/use-player";

type Makeup = { lipstick: string; blush: string; shadow: string; hair: string };
type SalonAvatar = Avatar & { makeup?: Makeup; hairColor?: string; princessLooks?: Record<string, Makeup> };
type Princess = { id: string; name: string; emoji: string; skin: string; hair: string; eyes: string; crown: string; dress: string };

const PRINCESSES = [
  { id: "royal", name: "Hoàng Gia", emoji: "👑", skin: "#fcd1ba", hair: "#fbbf24", eyes: "#3b82f6", crown: "👑", dress: "#f9a8d4" },
  { id: "night", name: "Bí Ẩn", emoji: "🌙", skin: "#d29b7a", hair: "#1f2937", eyes: "#78350f", crown: "🌙", dress: "#8b5cf6" },
  { id: "mermaid", name: "Tiên Cá", emoji: "🧜‍♀️", skin: "#fef3c7", hair: "#f472b6", eyes: "#14b8a6", crown: "🐚", dress: "#22d3ee" },
  { id: "forest", name: "Rừng Xanh", emoji: "🌿", skin: "#f5d0b5", hair: "#78350f", eyes: "#a16207", crown: "🍃", dress: "#4ade80" },
  { id: "ice", name: "Băng Tuyết", emoji: "❄️", skin: "#ffe4e6", hair: "#bfdbfe", eyes: "#38bdf8", crown: "❄️", dress: "#93c5fd" },
  { id: "sakura", name: "Anh Đào", emoji: "🌸", skin: "#fbd5d5", hair: "#be185d", eyes: "#a78bfa", crown: "🌸", dress: "#fbcfe8" },
  { id: "fairy", name: "Tiên Tím", emoji: "🧚‍♀️", skin: "#f5d0fe", hair: "#a855f7", eyes: "#7c3aed", crown: "✨", dress: "#c4b5fd" },
  { id: "sun", name: "Ánh Dương", emoji: "☀️", skin: "#fcd1ba", hair: "#ea580c", eyes: "#92400e", crown: "☀️", dress: "#fbbf24" },
  { id: "arabian", name: "Ả Rập", emoji: "💎", skin: "#d6a17b", hair: "#292524", eyes: "#0f766e", crown: "💎", dress: "#14b8a6" },
  { id: "red", name: "Công Chúa Đỏ", emoji: "❤️", skin: "#f8c9b5", hair: "#991b1b", eyes: "#854d0e", crown: "❤️", dress: "#ef4444" },
  { id: "angel", name: "Thiên Thần", emoji: "🪽", skin: "#ffe4e6", hair: "#fef3c7", eyes: "#60a5fa", crown: "🪽", dress: "#fff7ed" },
  { id: "rainbow", name: "Cầu Vồng", emoji: "🌈", skin: "#fcd1ba", hair: "#c084fc", eyes: "#06b6d4", crown: "🌈", dress: "#f0abfc" },
] as const satisfies readonly Princess[];
const FIRST_PRINCESS: Princess = PRINCESSES[0];

function defaultLook(p: Princess): Makeup {
  return { lipstick: p.id === "night" ? "#be123c" : "#ff6b81", blush: "transparent", shadow: "transparent", hair: p.hair };
}

const hairColors = ["#fbbf24", "#78350f", "#1f2937", "#f472b6", "#3b82f6", "#ef4444", "#a855f7", "#10b981"];
const eyeColors = ["transparent", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];
const blushColors = ["transparent", "#fca5a5", "#fb923c", "#f472b6", "#ef4444"];
const lipColors = ["#ff0000", "#ff6b81", "#d946ef", "#f97316", "#be123c", "#c026d3"];

function initialLooks(saved: SalonAvatar): Record<string, Makeup> {
  return Object.fromEntries(PRINCESSES.map((p) => [p.id, saved.princessLooks?.[p.id] ?? {
    lipstick: p.id === "night" ? "#be123c" : "#ff6b81",
    blush: "transparent",
    shadow: "transparent",
    hair: p.id === "royal" ? (saved.makeup?.hair ?? saved.hairColor ?? p.hair) : p.hair,
  }]));
}

export function PrincessSalon({ profile }: { profile: Profile }) {
  const saved = profile.avatar as SalonAvatar;
  const [activeId, setActiveId] = useState<string>(FIRST_PRINCESS.id);
  const [looks, setLooks] = useState(() => initialLooks(saved));
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const princess: Princess = PRINCESSES.find((p) => p.id === activeId) ?? FIRST_PRINCESS;
  const look: Makeup = looks[activeId] ?? defaultLook(princess);

  function update(type: keyof Makeup, color: string) {
    setLooks((prev) => ({ ...prev, [activeId]: { ...(prev[activeId] ?? defaultLook(princess)), [type]: color } }));
    setDone(false);
  }

  function resetLook() {
    setLooks((prev) => ({ ...prev, [activeId]: { lipstick: "#ff6b81", blush: "transparent", shadow: "transparent", hair: princess.hair } }));
    setDone(false);
  }

  async function saveLooks() {
    setSaving(true);
    try {
      const nextAvatar: SalonAvatar = { ...saved, hairColor: look.hair, makeup: look, princessLooks: looks };
      const { error } = await supabase.from("profiles").update({ avatar: nextAvatar }).eq("id", profile.id);
      if (error) throw error;
      toast.success("Đã lưu 12 nàng công chúa của bé! ✨");
      setDone(true);
    } catch {
      toast.error("Chưa lưu được. Bé thử lại nhé!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex h-[calc(100dvh-4rem)] min-h-0 w-full flex-col items-center overflow-hidden bg-gradient-to-b from-pink-200 via-pink-100 to-purple-200 px-2 py-2 font-sans">
      <h1 className="mb-2 shrink-0 text-center text-xl font-extrabold text-pink-600 drop-shadow-md sm:text-3xl">👑 Tiệm Trang Điểm Công Chúa 👑</h1>
      <nav className="mb-2 flex w-full max-w-5xl shrink-0 gap-1.5 overflow-x-auto rounded-2xl bg-white/55 p-2 shadow-inner" aria-label="Chọn công chúa">
        {PRINCESSES.map((p) => (
          <button key={p.id} onClick={() => setActiveId(p.id)} aria-pressed={activeId === p.id}
            className={`flex min-w-[76px] flex-col items-center rounded-xl px-2 py-1 text-[11px] font-extrabold transition-all sm:min-w-[88px] sm:text-xs ${activeId === p.id ? "scale-105 bg-pink-500 text-white shadow-lg" : "bg-white/70 text-pink-700 hover:bg-pink-100"}`}>
            <span className="text-xl sm:text-2xl">{p.emoji}</span><span>{p.name}</span>
          </button>
        ))}
      </nav>

      <div className="relative flex min-h-0 w-full max-w-5xl flex-1 overflow-hidden rounded-2xl border-4 border-[#d4af37] bg-[#4a2c2a] shadow-2xl sm:rounded-[2rem] sm:border-8">
        <section className="relative flex w-1/2 min-w-0 items-center justify-center overflow-hidden bg-gradient-to-b from-[#fff0f5] to-[#fbcfe8]">
          <div className="pointer-events-none absolute inset-2 rounded-[48%_48%_42%_42%] border-4 border-[#d4af37] shadow-[inset_0_0_30px_rgba(0,0,0,.12)] sm:inset-4 sm:border-[10px]" />
          <svg viewBox="0 0 200 250" className="z-10 h-full w-full max-h-full translate-y-4 drop-shadow-2xl" role="img" aria-label={`Chân dung công chúa ${princess.name}`}>
            <path d="M50 100 Q30 200 50 230 Q100 250 150 230 Q170 200 150 100Z" fill={look.hair}/>
            <rect x="85" y="180" width="30" height="40" fill={princess.skin}/>
            <path d="M60 230 Q100 200 140 230 L160 250 L40 250Z" fill={princess.dress}/>
            <ellipse cx="100" cy="140" rx="45" ry="55" fill={princess.skin}/>
            <path d="M55 100 Q70 70 100 80 Q130 70 145 100 Q140 120 120 100 Q100 85 80 100 Q60 120 55 100Z" fill={look.hair}/>
            <path d="M55 100 Q50 150 40 180 Q60 170 55 100 M145 100 Q150 150 160 180 Q140 170 145 100" fill={look.hair}/>
            <path d="M70 120 Q80 115 90 120 M130 120 Q120 115 110 120" fill="none" stroke="#5c3a2a" strokeWidth="3" strokeLinecap="round"/>
            <ellipse cx="80" cy="135" rx="10" ry="14" fill="white"/><ellipse cx="120" cy="135" rx="10" ry="14" fill="white"/>
            <ellipse cx="80" cy="135" rx="6" ry="8" fill={princess.eyes}/><ellipse cx="120" cy="135" rx="6" ry="8" fill={princess.eyes}/>
            <circle cx="82" cy="133" r="2" fill="white"/><circle cx="122" cy="133" r="2" fill="white"/>
            <path d="M68 133 Q80 123 92 135 M108 135 Q120 123 132 133" fill="none" stroke="#222" strokeWidth="2"/>
            {look.shadow !== "transparent" && <><ellipse cx="80" cy="123" rx="14" ry="8" fill={look.shadow} opacity=".65"/><ellipse cx="120" cy="123" rx="14" ry="8" fill={look.shadow} opacity=".65"/></>}
            {look.blush !== "transparent" && <><ellipse cx="65" cy="155" rx="12" ry="8" fill={look.blush} opacity=".55" filter="blur(2px)"/><ellipse cx="135" cy="155" rx="12" ry="8" fill={look.blush} opacity=".55" filter="blur(2px)"/></>}
            <path d="M98 150 Q100 155 102 150" fill="none" stroke="#d1a38e" strokeWidth="2"/>
            <path d="M85 170 Q100 160 115 170 Q100 185 85 170Z" fill={look.lipstick}/>
            <text x="100" y="66" textAnchor="middle" fontSize="27">{princess.crown}</text>
            <path d="M75 70 Q100 58 125 70" fill="none" stroke="#d4af37" strokeWidth="3"/>
          </svg>
          <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-3"><i className="h-2.5 w-2.5 rounded-full bg-yellow-100 shadow-[0_0_14px_#fde047]"/><i className="h-2.5 w-2.5 rounded-full bg-yellow-100 shadow-[0_0_14px_#fde047]"/></div>
          <span className="absolute bottom-2 rounded-full bg-white/75 px-3 py-1 text-xs font-extrabold text-pink-700">{princess.emoji} {princess.name}</span>
        </section>

        <section className="flex w-1/2 min-w-0 flex-col justify-around gap-2 overflow-y-auto bg-gradient-to-b from-[#5c3a21] to-[#2a1b3d] p-2 sm:p-5">
          <div><h2 className="mb-1 text-xs font-bold text-pink-200 sm:text-sm">💇‍♀️ Màu tóc</h2><div className="flex flex-wrap gap-1.5 sm:gap-2">{hairColors.map(c => <button key={c} aria-label={`Tóc ${c}`} onClick={() => update("hair",c)} className="h-6 w-6 rounded-full border-2 border-white/70 shadow sm:h-9 sm:w-9" style={{backgroundColor:c}}/>)}</div></div>
          <div><h2 className="mb-1 text-xs font-bold text-pink-200 sm:text-sm">🎨 Phấn mắt</h2><div className="flex flex-wrap gap-1.5 sm:gap-2">{eyeColors.map(c => <button key={c} aria-label={`Mắt ${c}`} onClick={() => update("shadow",c)} className="h-6 w-6 rounded-lg border-2 border-white/70 sm:h-9 sm:w-9" style={{backgroundColor:c === "transparent" ? "#374151" : c}}>{c === "transparent" ? <span className="text-[8px] text-white">Xóa</span> : null}</button>)}</div></div>
          <div><h2 className="mb-1 text-xs font-bold text-pink-200 sm:text-sm">🌸 Má hồng</h2><div className="flex flex-wrap gap-1.5 sm:gap-2">{blushColors.map(c => <button key={c} aria-label={`Má ${c}`} onClick={() => update("blush",c)} className="h-6 w-6 rounded-full border-2 border-white/70 sm:h-9 sm:w-9" style={{backgroundColor:c === "transparent" ? "#374151" : c}}>{c === "transparent" ? <span className="text-[8px] text-white">Xóa</span> : null}</button>)}</div></div>
          <div><h2 className="mb-1 text-xs font-bold text-pink-200 sm:text-sm">💄 Son môi</h2><div className="flex flex-wrap items-end gap-2 sm:gap-3">{lipColors.map(c => <button key={c} aria-label={`Son ${c}`} onClick={() => update("lipstick",c)} className="relative h-12 w-5 transition-transform hover:-translate-y-1 sm:h-16 sm:w-7"><span className="absolute bottom-0 h-8 w-full rounded-b bg-gray-800"/><span className="absolute bottom-8 h-4 w-full rounded-t" style={{backgroundColor:c}}/></button>)}</div></div>
        </section>
      </div>

      <div className="mt-2 flex shrink-0 gap-2">
        <button onClick={resetLook} className="rounded-full border-2 border-pink-300 bg-white px-4 py-2 text-xs font-extrabold text-pink-600 shadow sm:text-sm">🔄 Làm lại nàng này</button>
        <button disabled={saving} onClick={() => void saveLooks()} className="rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg disabled:opacity-60 sm:text-sm">{saving ? "Đang lưu..." : "💖 Lưu 12 công chúa"}</button>
      </div>
      {done && <p className="mt-1 text-xs font-bold text-emerald-700">✨ Đã lưu diện mạo của 12 nàng công chúa!</p>}
    </main>
  );
}
