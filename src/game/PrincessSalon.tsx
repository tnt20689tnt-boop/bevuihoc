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

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({ meta: [{ title: "Salon công chúa – Bé Học Vui" }, { name: "description", content: "Trò chơi trang điểm công chúa anime 2D." }] }),
  component: SalonRoute,
});

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
                    <svg viewBox="0 0 300 350" className="h-[340px] w-[290px] max-w-[78vw]" role="img" aria-label="Gương mặt công chúa anime đang được trang điểm">
                      <defs>
                        <linearGradient id="princessSkin" x2="0" y2="1"><stop stopColor="#ffe8d9"/><stop offset="1" stopColor="#f6c9b8"/></linearGradient>
                        <linearGradient id="princessHair" x2="1" y2="1"><stop stopColor={makeup.hair}/><stop offset="1" stopColor="#35223d"/></linearGradient>
                      </defs>
                      <path d="M55 142 Q34 30 150 27 Q266 30 245 142 L258 286 Q150 337 42 286Z" fill="url(#princessHair)"/>
                      <path d="M70 140 Q70 70 150 67 Q230 70 230 140 L215 245 Q198 294 150 300 Q102 294 85 245Z" fill="url(#princessSkin)" stroke="#e7ae9f" strokeWidth="2"/>
                      <path d="M70 145 Q50 48 150 38 Q244 42 232 150 Q214 112 190 102 Q150 132 91 106Z" fill="url(#princessHair)"/>
                      <path d="M83 126 Q58 188 78 260 Q48 246 52 165Z M217 126 Q242 188 222 260 Q252 246 248 165Z" fill="url(#princessHair)"/>
                      <path d="M91 172 Q112 151 133 173" fill="none" stroke="#684052" strokeWidth="7" strokeLinecap="round"/>
                      <path d="M167 173 Q188 151 209 172" fill="none" stroke="#684052" strokeWidth="7" strokeLinecap="round"/>
                      <ellipse cx="112" cy="194" rx="20" ry="27" fill={makeup.shadow} opacity=".7"/>
                      <ellipse cx="188" cy="194" rx="20" ry="27" fill={makeup.shadow} opacity=".7"/>
                      <ellipse cx="112" cy="195" rx="11" ry="18" fill="#56344c"/><ellipse cx="188" cy="195" rx="11" ry="18" fill="#56344c"/>
                      <ellipse cx="112" cy="196" rx="6" ry="12" fill="#211d36"/><ellipse cx="188" cy="196" rx="6" ry="12" fill="#211d36"/>
                      <circle cx="116" cy="187" r="5" fill="white"/><circle cx="192" cy="187" r="5" fill="white"/>
                      <path d="M91 158 Q111 145 132 158 M168 158 Q189 145 209 158" stroke="#513342" strokeWidth="5" fill="none" strokeLinecap="round"/>
                      <ellipse cx="82" cy="226" rx="21" ry="10" fill={makeup.blush} opacity=".65"/><ellipse cx="218" cy="226" rx="21" ry="10" fill={makeup.blush} opacity=".65"/>
                      <path d="M145 207 Q137 220 148 222" stroke="#d9958b" strokeWidth="3" fill="none" strokeLinecap="round"/>
                      <path d="M130 244 Q150 232 170 244 Q150 269 130 244Z" fill={makeup.lipstick} stroke="#c65a78" strokeWidth="2"/>
                      <path d="M137 245 Q150 240 163 245" stroke="#ffdce5" strokeWidth="3" fill="none" strokeLinecap="round"/>
                      <path d="M65 123 Q150 82 235 123" stroke="#f6d78d" strokeWidth="7" fill="none"/>
                      <path d="M150 38 L158 9 L166 38 L194 42 L172 58 L178 84 L150 68 L122 84 L128 58 L106 42Z" fill="#f7d36f" stroke="#fff5c7" strokeWidth="4"/>
                      <path d="M105 300 Q150 280 195 300 L225 350 L75 350Z" fill="#f3a7c8"/>
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
