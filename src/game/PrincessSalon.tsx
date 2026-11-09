import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Avatar } from "@/lib/avatar";
import type { Profile } from "@/hooks/use-player";

type Makeup = { lipstick: string; blush: string; shadow: string; hair: string; accessory: string };
type SalonAvatar = Avatar & { makeup?: Makeup };

const palettes = {
  lipstick: [{ name: "Hồng đào", value: "#f06b91" }, { name: "Đỏ cherry", value: "#d94367" }, { name: "Hồng kẹo", value: "#ff91b7" }, { name: "Cam san hô", value: "#f28b70" }, { name: "Tím mộng mơ", value: "#ad75c9" }],
  blush: [{ name: "Phấn hồng", value: "#ff9bb4" }, { name: "Đào", value: "#ffb18e" }, { name: "Hồng baby", value: "#f6a4d0" }, { name: "Tự nhiên", value: "#e9a18b" }],
  shadow: [{ name: "Tím lilac", value: "#b99be8" }, { name: "Hồng ngọt", value: "#f3a4ca" }, { name: "Xanh ngọc", value: "#83d5d0" }, { name: "Vàng ánh kim", value: "#f4ce79" }, { name: "Nâu caramel", value: "#bd927d" }],
  hair: [{ name: "Nâu socola", value: "#5a3825" }, { name: "Đen huyền", value: "#28202a" }, { name: "Vàng mật ong", value: "#e3b04b" }, { name: "Hồng pastel", value: "#e887ad" }, { name: "Tím lavender", value: "#9877c9" }],
};

const defaults: Makeup = { lipstick: "#f06b91", blush: "#ff9bb4", shadow: "#b99be8", hair: "#5a3825", accessory: "👑" };

export function PrincessSalon({ profile }: { profile: Profile }) {
  const saved = profile.avatar as SalonAvatar;
  const [makeup, setMakeup] = useState<Makeup>(saved.makeup ?? defaults);
  const [tab, setTab] = useState<keyof typeof palettes>("lipstick");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function saveLook() {
    setSaving(true);
    const nextAvatar = { ...saved, hairColor: makeup.hair, accessory: "none", makeup };
    try {
      const { error } = await supabase.from("profiles").update({ avatar: nextAvatar }).eq("id", profile.id);
      if (error) throw error;
      toast.success("Đã lưu diện mạo công chúa của bé! ✨");
      setDone(true);
    } catch {
      toast.error("Chưa lưu được. Bé thử lại nhé!");
    } finally {
      setSaving(false);
    }
  }

  function randomLook() {
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
    setMakeup({
      lipstick: pick(palettes.lipstick).value,
      blush: pick(palettes.blush).value,
      shadow: pick(palettes.shadow).value,
      hair: pick(palettes.hair).value,
      accessory: pick(["👑", "🌸", "🎀", "✨"]),
    });
    setDone(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-hidden rounded-b-[2rem] bg-[radial-gradient(ellipse_at_15%_5%,#fff_0%,transparent_32%),linear-gradient(135deg,#ffe7f1,#f4e9ff_52%,#fff1d9)] p-3 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-pink-600">Princess beauty studio</p><h1 className="text-3xl font-black text-fuchsia-950 sm:text-4xl">💄 Salon Công Chúa</h1><p className="font-semibold text-fuchsia-800/75">Chọn màu xinh xắn và tự tay trang điểm cho nàng công chúa anime!</p></div>
          <Link to="/the-gioi" className="rounded-2xl border-2 border-white bg-white/85 px-4 py-3 font-extrabold text-fuchsia-800 shadow-lg">← Về sân trường</Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
          <section className="relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-gradient-to-b from-violet-100 via-pink-100 to-amber-50 p-4 shadow-[0_18px_50px_#9d5a9b30] sm:p-6">
            <div className="absolute left-5 top-5 text-2xl">✨</div><div className="absolute right-7 top-8 text-3xl">🌷</div>
            <div className="mx-auto max-w-[520px] rounded-[48%_48%_38%_38%] border-[12px] border-amber-200 bg-gradient-to-b from-[#fff9f0] to-[#f9dce9] p-3 shadow-[inset_0_0_0_5px_#fff,0_12px_25px_#b77a8b40]">
              <div className="relative grid min-h-[390px] place-items-center overflow-hidden rounded-[48%_48%_35%_35%] bg-[radial-gradient(ellipse_at_50%_38%,#fff_0%,#ffe7f0_56%,#e7d8ff_100%)]">
                <div className="absolute left-7 top-8 text-2xl">✦</div><div className="absolute right-8 top-14 text-xl">✧</div>
                <div className="relative mt-3">
                  <div className="absolute -left-4 top-12 z-0 h-56 w-20 rounded-[50%] bg-[#8b5a45]" style={{ background: makeup.hair }} />
                  <div className="absolute -right-4 top-12 z-0 h-56 w-20 rounded-[50%] bg-[#8b5a45]" style={{ background: makeup.hair }} />
                  <div className="relative z-10">
                    <svg viewBox="0 0 360 430" className="h-[390px] w-[330px] max-w-[82vw] drop-shadow-[0_14px_18px_#8b567344]" role="img" aria-label="Công chúa anime với mái tóc dài và đôi mắt long lanh">
                      <defs>
                        <linearGradient id="pSkin" x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#fff0df"/><stop offset=".58" stopColor="#ffddcf"/><stop offset="1" stopColor="#efb9ae"/></linearGradient>
                        <linearGradient id="pHair" x1="0" y1="0" x2="1" y2="1"><stop stopColor={makeup.hair}/><stop offset=".48" stopColor={makeup.hair}/><stop offset="1" stopColor="#241b38"/></linearGradient>
                        <linearGradient id="pShine" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".9"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
                        <linearGradient id="pDress" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffe0f0"/><stop offset="1" stopColor="#c68bdf"/></linearGradient>
                        <radialGradient id="pIris"><stop stopColor="#8c5a9c"/><stop offset=".55" stopColor="#573c79"/><stop offset="1" stopColor="#25233e"/></radialGradient>
                        <filter id="pBlur"><feGaussianBlur stdDeviation="5"/></filter>
                      </defs>
                      <ellipse cx="180" cy="410" rx="120" ry="15" fill="#a77baf" opacity=".18"/>
                      {/* long flowing hair */}
                      <path d="M69 177 Q24 57 105 30 Q178 -9 255 30 Q342 75 293 202 Q328 285 285 374 Q265 402 238 367 L122 382 Q78 410 66 350 Q39 266 69 177Z" fill="url(#pHair)" stroke="#55334f" strokeWidth="3"/>
                      <path d="M89 112 Q57 35 131 26 Q80 81 105 153 Q69 222 94 324 Q58 283 68 195Z" fill={makeup.hair} opacity=".8"/>
                      <path d="M267 100 Q318 48 290 164 Q322 262 272 350 Q291 248 249 175Z" fill="#fff" opacity=".13"/>
                      <path d="M105 45 Q147 7 197 34 Q126 29 111 112" fill="none" stroke="url(#pShine)" strokeWidth="9" strokeLinecap="round" opacity=".7"/>
                      {/* ears and face */}
                      <ellipse cx="91" cy="215" rx="19" ry="29" fill="#f6c8b9"/>
                      <ellipse cx="269" cy="215" rx="19" ry="29" fill="#f6c8b9"/>
                      <path d="M103 132 Q105 72 180 70 Q255 72 257 132 L249 248 Q238 315 180 330 Q122 315 111 248Z" fill="url(#pSkin)" stroke="#e9b2a5" strokeWidth="2"/>
                      <ellipse cx="90" cy="219" rx="9" ry="15" fill="#f4b8ac"/><ellipse cx="270" cy="219" rx="9" ry="15" fill="#f4b8ac"/>
                      {/* fringe */}
                      <path d="M91 153 Q70 58 151 49 Q221 28 272 98 Q286 130 257 164 Q252 112 220 103 Q190 149 147 122 Q120 116 103 168Z" fill="url(#pHair)" stroke="#55334f" strokeWidth="2"/>
                      <path d="M113 104 Q134 53 178 57 Q144 72 139 119 M190 55 Q236 59 251 112" fill="none" stroke="#fff" strokeOpacity=".24" strokeWidth="7" strokeLinecap="round"/>
                      {/* brows */}
                      <path d="M119 177 Q145 158 163 176 M198 176 Q218 158 241 177" fill="none" stroke="#694356" strokeWidth="5" strokeLinecap="round"/>
                      {/* eyeshadow */}
                      <path d="M113 197 Q141 176 166 197 Q141 215 113 197 M194 197 Q219 176 247 197 Q219 215 194 197" fill={makeup.shadow} opacity=".72"/>
                      {/* big anime eyes */}
                      <path d="M113 202 Q139 180 165 204 Q159 238 139 240 Q117 235 113 202Z" fill="#fff"/>
                      <path d="M195 204 Q221 180 247 202 Q243 235 221 240 Q201 238 195 204Z" fill="#fff"/>
                      <ellipse cx="140" cy="213" rx="15" ry="23" fill="url(#pIris)"/><ellipse cx="220" cy="213" rx="15" ry="23" fill="url(#pIris)"/>
                      <ellipse cx="140" cy="219" rx="8" ry="13" fill="#211c39"/><ellipse cx="220" cy="219" rx="8" ry="13" fill="#211c39"/>
                      <circle cx="146" cy="201" r="7" fill="#fff"/><circle cx="226" cy="201" r="7" fill="#fff"/>
                      <circle cx="133" cy="224" r="3.5" fill="#c9b5ff"/><circle cx="213" cy="224" r="3.5" fill="#c9b5ff"/>
                      <path d="M112 201 Q137 177 166 199 M194 199 Q222 177 248 201" fill="none" stroke="#483047" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M119 194 l-7 -7 M128 188 l-4 -9 M239 194 l8 -7 M230 188 l4 -9" stroke="#483047" strokeWidth="3" strokeLinecap="round"/>
                      {/* cheeks and nose */}
                      <ellipse cx="112" cy="253" rx="23" ry="11" fill={makeup.blush} opacity=".55" filter="url(#pBlur)"/>
                      <ellipse cx="248" cy="253" rx="23" ry="11" fill={makeup.blush} opacity=".55" filter="url(#pBlur)"/>
                      <path d="M180 222 Q173 241 181 245" fill="none" stroke="#d99d91" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M166 270 Q180 259 194 270 Q182 286 180 284 Q174 284 166 270Z" fill={makeup.lipstick}/>
                      <path d="M170 270 Q180 266 190 270" fill="none" stroke="#ffe7ed" strokeWidth="3" strokeLinecap="round"/>
                      <path d="M171 292 Q180 296 189 292" fill="none" stroke="#d9958c" strokeWidth="2" strokeLinecap="round"/>
                      {/* neck and dress */}
                      <path d="M157 314 L157 348 L203 348 L203 314" fill="url(#pSkin)"/>
                      <path d="M104 430 Q112 359 158 343 L180 364 L202 343 Q250 359 258 430Z" fill="url(#pDress)" stroke="#fff" strokeWidth="4"/>
                      <path d="M157 346 L180 372 L203 346" fill="none" stroke="#fff" strokeWidth="5"/>
                      <path d="M180 372 L168 393 L180 411 L192 393Z" fill="#f7d36f" stroke="#fff4c4" strokeWidth="3"/>
                      <path d="M109 391 Q180 420 251 391" fill="none" stroke="#fff" strokeWidth="4" opacity=".7"/>
                      {/* crown */}
                      <path d="M122 82 L112 31 L148 58 L180 12 L212 58 L248 31 L238 84Z" fill="#f7d36f" stroke="#fff4c4" strokeWidth="5" strokeLinejoin="round"/>
                      <path d="M126 79 Q180 93 234 79" fill="none" stroke="#d89a42" strokeWidth="5"/>
                      <circle cx="180" cy="54" r="9" fill="#ff8db7" stroke="#fff" strokeWidth="3"/>
                      <circle cx="143" cy="65" r="6" fill="#9ce5e3" stroke="#fff" strokeWidth="2"/>
                      <circle cx="217" cy="65" r="6" fill="#9ce5e3" stroke="#fff" strokeWidth="2"/>
                      {/* sparkles */}
                      <path d="M57 135 l5 13 13 5 -13 5 -5 13 -5 -13 -13 -5 13 -5Z M302 186 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4Z" fill="#ffe18a" stroke="#fff" strokeWidth="2"/>
                    </svg>
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-amber-200 px-4 py-1 text-2xl shadow-lg">{makeup.accessory}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-[-2px] w-[86%] rounded-b-[2rem] border-x-8 border-b-8 border-amber-300 bg-gradient-to-b from-[#d9a5c4] to-[#a66d9c] p-4 text-center text-white shadow-xl">
              <div className="text-xs font-black uppercase tracking-[.3em] text-pink-100">Gương trang điểm</div><div className="mt-1 font-black">Công chúa {profile.display_name}</div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2"><button onClick={randomLook} className="rounded-xl bg-white px-4 py-2 font-extrabold text-fuchsia-800 shadow">🎲 Phối đồ ngẫu nhiên</button><button onClick={() => { setMakeup(defaults); setDone(false); }} className="rounded-xl bg-white/75 px-4 py-2 font-extrabold text-slate-700 shadow">↺ Làm lại</button></div>
          </section>

          <section className="rounded-[2rem] border-4 border-white bg-white/90 p-4 shadow-[0_18px_50px_#9d5a9b24] sm:p-5">
            <div className="mb-4 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-pink-100 text-2xl">🪞</span><div><h2 className="text-xl font-black text-fuchsia-950">Bàn trang điểm</h2><p className="text-sm font-semibold text-slate-500">Chạm món đồ bé muốn dùng nhé</p></div></div>
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#fff0f6] p-2">
              {([{ id: "lipstick", label: "💋 Son môi" }, { id: "blush", label: "🌸 Má hồng" }, { id: "shadow", label: "👁️ Phấn mắt" }, { id: "hair", label: "💇 Màu tóc" }] as const).map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`rounded-xl px-3 py-3 text-sm font-black transition ${tab === item.id ? "bg-fuchsia-600 text-white shadow-md" : "bg-white text-fuchsia-800"}`}>{item.label}</button>)}
            </div>
            <div className="rounded-2xl border-2 border-pink-100 bg-gradient-to-br from-rose-50 to-violet-50 p-4">
              <h3 className="mb-3 font-black text-fuchsia-950">{tab === "lipstick" ? "Chọn màu son" : tab === "blush" ? "Chọn phấn má" : tab === "shadow" ? "Chọn màu mắt" : "Chọn màu tóc"}</h3>
              <div className="grid grid-cols-2 gap-2">
                {palettes[tab].map(item => <button key={item.value} onClick={() => { setMakeup(current => ({ ...current, [tab]: item.value })); setDone(false); }} className={`flex items-center gap-2 rounded-xl border-2 p-2 text-left text-sm font-bold ${makeup[tab] === item.value ? "border-fuchsia-500 bg-white shadow" : "border-white bg-white/60"}`}><span className="h-8 w-8 shrink-0 rounded-full border-2 border-white shadow" style={{ background: item.value }}/>{item.name}{makeup[tab] === item.value && <span className="ml-auto text-fuchsia-600">✓</span>}</button>)}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border-2 border-amber-100 bg-amber-50 p-4"><h3 className="mb-2 font-black text-amber-900">👑 Phụ kiện công chúa</h3><div className="flex flex-wrap gap-2">{["👑", "🌸", "🎀", "✨", "🦋", "💎"].map(item => <button key={item} onClick={() => { setMakeup(current => ({ ...current, accessory: item })); setDone(false); }} className={`grid h-12 w-12 place-items-center rounded-xl border-2 bg-white text-2xl ${makeup.accessory === item ? "border-amber-400 shadow-md" : "border-white"}`}>{item}</button>)}</div></div>
            <button disabled={saving} onClick={() => void saveLook()} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-600 px-5 py-4 text-lg font-black text-white shadow-[0_5px_0_#9d347e] disabled:opacity-60">{saving ? "Đang lưu..." : "💖 Lưu diện mạo công chúa"}</button>
            {done && <p className="mt-3 text-center font-bold text-emerald-700">✨ Đã lưu phong cách của bé!</p>}
            <p className="mt-3 text-center text-xs font-semibold text-slate-400">Bé có thể đổi màu son, phấn má, phấn mắt và tóc bất cứ lúc nào.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
