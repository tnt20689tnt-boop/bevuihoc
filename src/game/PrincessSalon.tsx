import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Avatar } from "@/lib/avatar";
import type { Profile } from "@/hooks/use-player";

type Makeup = { lipstick: string; blush: string; shadow: string; hair: string };
type ModelLook = { hair: string; top: string; bottom: string; shoes: string; accessory: string };
type ModelSticker = { id: number; emoji: string; x: number; y: number };
type SalonAvatar = Avatar & { makeup?: Makeup; hairColor?: string; princessLooks?: Record<string, Makeup>; modelLook?: ModelLook };
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

export function PrincessSalon({ profile, initialMode = "makeup" }: { profile: Profile; initialMode?: "makeup" | "model" }) {
  const navigate = useNavigate();
  const saved = profile.avatar as SalonAvatar;
  const [activeId, setActiveId] = useState<string>(FIRST_PRINCESS.id);
  const [looks, setLooks] = useState(() => initialLooks(saved));
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [activeMode, setActiveMode] = useState<"makeup" | "model">(initialMode);
  const [modelLook, setModelLook] = useState<ModelLook>(() => saved.modelLook ?? { hair: "#8b4513", top: "#f472b6", bottom: "#8b5cf6", shoes: "#fbbf24", accessory: "👑" });
  const [stickers, setStickers] = useState<ModelSticker[]>([]);
  const [draggingSticker, setDraggingSticker] = useState<number | null>(null);
  const [modelSaving, setModelSaving] = useState(false);
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

  function addSticker(emoji: string) {
    setStickers((prev) => [...prev, { id: Date.now() + Math.random(), emoji, x: 50, y: 18 + (prev.length % 4) * 12 }]);
  }

  function moveSticker(event: React.PointerEvent<HTMLDivElement>) {
    if (draggingSticker === null) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((event.clientY - rect.top) / rect.height) * 100));
    setStickers((prev) => prev.map((sticker) => sticker.id === draggingSticker ? { ...sticker, x, y } : sticker));
  }

  async function saveModel() {
    setModelSaving(true);
    try {
      const nextAvatar: SalonAvatar = { ...saved, modelLook };
      const { error } = await supabase.from("profiles").update({ avatar: nextAvatar }).eq("id", profile.id);
      if (error) throw error;
      toast.success("Đã lưu người mẫu của bé! 💖");
    } catch {
      toast.error("Chưa lưu được người mẫu. Bé thử lại nhé!");
    } finally {
      setModelSaving(false);
    }
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
      <div className="mb-2 flex w-full max-w-5xl shrink-0 items-center gap-2">
        <button type="button" onClick={() => navigate({ to: "/the-gioi" })} className="shrink-0 rounded-xl border-2 border-white bg-white/90 px-3 py-2 text-sm font-extrabold text-pink-700 shadow-md hover:bg-white">← Trở về</button>
        <h1 className="min-w-0 flex-1 text-center text-lg font-extrabold text-pink-600 drop-shadow-md sm:text-3xl">{activeMode === "model" ? "👗 XƯỞNG THIẾT KẾ NGƯỜI MẪU 👗" : "👑 TIỆM TRANG ĐIỂM CÔNG CHÚA 👑"}</h1>
        <span className="w-[84px] shrink-0" aria-hidden="true" />
      </div>
      <div className="mb-2 flex shrink-0 gap-2">
        <button onClick={() => setActiveMode("makeup")} className={`rounded-full px-4 py-2 text-sm font-extrabold shadow ${activeMode === "makeup" ? "bg-pink-600 text-white" : "bg-white/80 text-pink-700"}`}>💄 Trang điểm</button>
        <button onClick={() => setActiveMode("model")} className={`rounded-full px-4 py-2 text-sm font-extrabold shadow ${activeMode === "model" ? "bg-fuchsia-600 text-white" : "bg-white/80 text-pink-700"}`}>👗 Tạo người mẫu</button>
      </div>
      {activeMode === "makeup" && <>
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
      </>}
      {activeMode === "model" && (
        <section className="flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-3 overflow-y-auto rounded-3xl border-4 border-pink-300 bg-gradient-to-br from-white/90 via-pink-50 to-violet-100 p-3 shadow-2xl sm:flex-row sm:p-5">
          <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center">
            <h2 className="mb-2 text-lg font-black text-fuchsia-700">✨ Sàn diễn người mẫu của bé</h2>
            <div
              className="relative flex min-h-[280px] w-full max-w-[360px] flex-1 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-[radial-gradient(circle_at_50%_25%,#fff_0%,#fce7f3_48%,#ddd6fe_100%)] shadow-inner"
              onPointerMove={moveSticker}
              onPointerUp={() => setDraggingSticker(null)}
              onPointerCancel={() => setDraggingSticker(null)}
            >
              <div className="pointer-events-none absolute bottom-5 h-8 w-36 rounded-[50%] bg-fuchsia-900/15 blur-md" />
              <svg viewBox="0 0 220 360" className="pointer-events-none z-10 h-full max-h-[390px] w-full drop-shadow-xl" role="img" aria-label="Người mẫu thời trang nhiều lớp">
                <defs>
                  <linearGradient id="modelSkin" x2="1" y2="1"><stop stopColor="#ffe0c9"/><stop offset="1" stopColor="#e9a98d"/></linearGradient>
                  <linearGradient id="modelDress" x2="1" y2="1"><stop stopColor={modelLook.top}/><stop offset="1" stopColor={modelLook.bottom}/></linearGradient>
                </defs>
                {/* Tóc phía sau */}
                <path d="M65 55 Q35 75 48 155 L45 210 Q65 230 78 180 L145 180 Q165 225 180 205 L170 85 Q160 35 110 35Z" fill={modelLook.hair}/>
                {/* Chân và giày */}
                <path d="M88 238 L84 320 Q82 335 96 335 L108 335 L112 245Z M125 238 L128 320 Q128 335 142 335 L154 335 L146 240Z" fill="url(#modelSkin)"/>
                <path d="M80 325 Q95 316 111 329 L110 345 L72 345Z M126 329 Q143 316 158 329 L166 345 L128 345Z" fill={modelLook.shoes}/>
                {/* Thân người */}
                <path d="M82 115 Q110 103 138 115 L151 220 Q110 246 69 220Z" fill="url(#modelSkin)"/>
                <path d="M82 122 Q60 125 57 190 L67 198 L91 150 M138 122 Q160 125 163 190 L153 198 L129 150" fill="none" stroke="url(#modelSkin)" strokeWidth="17" strokeLinecap="round"/>
                {/* Áo - lớp riêng */}
                <path d="M78 119 Q110 102 142 119 L151 185 Q110 202 69 185Z" fill={modelLook.top} stroke="#fff" strokeWidth="2"/>
                <path d="M92 116 Q110 135 128 116" fill="none" stroke="#fff" strokeWidth="4" opacity=".8"/>
                {/* Váy/quần - lớp riêng */}
                <path d="M70 184 Q110 198 150 184 L171 265 Q110 286 49 265Z" fill={modelLook.bottom} stroke="#fff" strokeWidth="2"/>
                <path d="M76 194 L64 260 M110 201 L110 276 M144 194 L156 260" stroke="#fff" strokeWidth="2" opacity=".45"/>
                {/* Cổ và mặt */}
                <rect x="99" y="91" width="22" height="34" rx="9" fill="url(#modelSkin)"/>
                <ellipse cx="110" cy="72" rx="39" ry="48" fill="url(#modelSkin)"/>
                <path d="M71 70 Q66 20 111 23 Q157 22 149 78 Q135 48 112 51 Q91 48 71 70Z" fill={modelLook.hair}/>
                <path d="M72 68 Q65 110 54 135 Q78 130 82 83 M148 68 Q155 110 166 135 Q142 130 138 83" fill={modelLook.hair}/>
                <ellipse cx="96" cy="76" rx="4" ry="6" fill="#49332e"/><ellipse cx="125" cy="76" rx="4" ry="6" fill="#49332e"/>
                <path d="M101 98 Q110 105 119 98" fill="none" stroke="#b85c68" strokeWidth="3" strokeLinecap="round"/>
                <text x="110" y="17" textAnchor="middle" fontSize="24">{modelLook.accessory}</text>
              </svg>
              {stickers.map((sticker) => (
                <button key={sticker.id} type="button" aria-label="Kéo sticker" onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setDraggingSticker(sticker.id); }}
                  className="absolute z-20 touch-none cursor-grab select-none text-3xl active:cursor-grabbing"
                  style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, transform: "translate(-50%, -50%)" }}>{sticker.emoji}</button>
              ))}
              <span className="pointer-events-none absolute bottom-2 rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-fuchsia-700">Chạm giữ sticker để kéo thả ✨</span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-[42%] sm:max-w-[300px]">
            <div><h3 className="mb-2 font-black text-fuchsia-800">💇 Kiểu tóc & màu tóc</h3><div className="flex flex-wrap gap-2">{["#8b4513","#1f2937","#fbbf24","#ec4899","#8b5cf6","#3b82f6","#10b981"].map(color => <button key={color} onClick={() => setModelLook(v => ({...v,hair:color}))} aria-label="Chọn màu tóc" className="h-9 w-9 rounded-full border-2 border-white shadow" style={{backgroundColor:color}} />)}</div></div>
            <div><h3 className="mb-2 font-black text-fuchsia-800">👚 Chọn áo</h3><div className="flex flex-wrap gap-2">{["#f472b6","#fb7185","#a78bfa","#60a5fa","#34d399","#fbbf24"].map(color => <button key={color} onClick={() => setModelLook(v => ({...v,top:color}))} className="h-10 w-10 rounded-xl border-2 border-white shadow" style={{backgroundColor:color}} />)}</div></div>
            <div><h3 className="mb-2 font-black text-fuchsia-800">👗 Chọn váy / quần</h3><div className="flex flex-wrap gap-2">{["#8b5cf6","#ec4899","#2563eb","#16a34a","#f97316","#db2777"].map(color => <button key={color} onClick={() => setModelLook(v => ({...v,bottom:color}))} className="h-10 w-10 rounded-xl border-2 border-white shadow" style={{backgroundColor:color}} />)}</div></div>
            <div><h3 className="mb-2 font-black text-fuchsia-800">👠 Giày dép</h3><div className="flex flex-wrap gap-2">{["#fbbf24","#f472b6","#7c3aed","#ef4444","#1f2937","#fff"].map(color => <button key={color} onClick={() => setModelLook(v => ({...v,shoes:color}))} className="h-9 w-9 rounded-full border-2 border-white shadow" style={{backgroundColor:color}} />)}</div></div>
            <div><h3 className="mb-2 font-black text-fuchsia-800">👑 Phụ kiện</h3><div className="flex flex-wrap gap-2">{["👑","🎀","🌸","✨","🦋","💎","🧢","🌺"].map(item => <button key={item} onClick={() => setModelLook(v => ({...v,accessory:item}))} className="rounded-xl bg-white px-3 py-2 text-xl shadow hover:bg-pink-100">{item}</button>)}</div></div>
            <div><h3 className="mb-2 font-black text-fuchsia-800">🧸 Sticker trang trí (kéo thả)</h3><div className="flex flex-wrap gap-2">{["💖","⭐","🌈","🦋","🌷","💫","🎵","🐱"].map(item => <button key={item} onClick={() => addSticker(item)} className="rounded-xl bg-white px-3 py-2 text-xl shadow hover:bg-pink-100">{item}</button>)}</div><button onClick={() => setStickers([])} className="mt-2 text-xs font-bold text-rose-600 underline">Xóa tất cả sticker</button></div>
            <div className="mt-auto flex gap-2"><button onClick={() => { setModelLook({hair:"#8b4513",top:"#f472b6",bottom:"#8b5cf6",shoes:"#fbbf24",accessory:"👑"}); setStickers([]); }} className="flex-1 rounded-full bg-white px-3 py-3 text-sm font-extrabold text-pink-700 shadow">🔄 Làm lại</button><button disabled={modelSaving} onClick={() => void saveModel()} className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 px-3 py-3 text-sm font-extrabold text-white shadow disabled:opacity-60">{modelSaving ? "Đang lưu..." : "💖 Lưu người mẫu"}</button></div>
          </div>
        </section>
      )}
    </main>
  );
}
