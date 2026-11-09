import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Avatar } from "@/lib/avatar";
import type { Profile } from "@/hooks/use-player";

type Makeup = { lipstick: string; blush: string; shadow: string; eyeliner?: string; hair: string; accessory?: string };
type SalonAvatar = Avatar & { makeup?: Makeup; hairColor?: string };

const defaults = {
  lip: "#ff6b81",
  eye: "transparent",
  blush: "transparent",
  hair: "#fbbf24",
};

const hairColors = ["#fbbf24", "#78350f", "#f472b6", "#3b82f6", "#000000"];
const eyeColors = ["transparent", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];
const blushColors = ["transparent", "#fca5a5", "#fb923c", "#f472b6"];
const lipColors = ["#ff0000", "#ff6b81", "#d946ef", "#f97316", "#be123c"];

export function PrincessSalon({ profile }: { profile: Profile }) {
  const saved = profile.avatar as SalonAvatar;
  const [lipColor, setLipColor] = useState(saved.makeup?.lipstick ?? defaults.lip);
  const [eyeColor, setEyeColor] = useState(saved.makeup?.shadow ?? defaults.eye);
  const [blushColor, setBlushColor] = useState(saved.makeup?.blush ?? defaults.blush);
  const [hairColor, setHairColor] = useState(saved.makeup?.hair ?? saved.hairColor ?? defaults.hair);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const playSound = () => {};
  const handleLipChange = (color: string) => { setLipColor(color); setDone(false); playSound(); };
  const handleEyeChange = (color: string) => { setEyeColor(color); setDone(false); playSound(); };
  const handleBlushChange = (color: string) => { setBlushColor(color); setDone(false); playSound(); };
  const handleHairChange = (color: string) => { setHairColor(color); setDone(false); playSound(); };

  async function saveLook() {
    setSaving(true);
    const nextAvatar: SalonAvatar = {
      ...saved,
      hairColor,
      makeup: {
        ...(saved.makeup ?? {}),
        lipstick: lipColor,
        shadow: eyeColor,
        blush: blushColor,
        hair: hairColor,
        accessory: saved.makeup?.accessory ?? "👑",
      },
    };
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

  function resetLook() {
    setLipColor(defaults.lip);
    setEyeColor(defaults.eye);
    setBlushColor(defaults.blush);
    setHairColor(defaults.hair);
    setDone(false);
  }

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-pink-200 via-pink-100 to-purple-200 px-2 py-2 font-sans">
      <h1 className="z-10 mb-2 shrink-0 text-center text-xl font-extrabold text-pink-600 drop-shadow-md sm:text-3xl">
        👑 Tiệm Trang Điểm Công Chúa 👑
      </h1>

      <div className="relative flex min-h-0 w-full max-w-4xl flex-1 overflow-hidden rounded-2xl border-4 border-[#5c3a21] bg-[#8b5a2b] shadow-2xl sm:rounded-3xl sm:border-8">
        <section className="relative flex w-1/2 min-w-0 items-center justify-center overflow-hidden bg-gradient-to-b from-[#fdfbfb] to-[#ebedee]">
          <div className="absolute inset-2 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] border-4 border-yellow-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] sm:inset-4 sm:border-[12px]" />
          <svg viewBox="0 0 200 250" className="z-0 h-full w-full max-h-full translate-y-3 drop-shadow-xl" role="img" aria-label="Công chúa đang soi gương">
            <path d="M 50 100 Q 30 200 50 230 Q 100 250 150 230 Q 170 200 150 100 Z" fill={hairColor} />
            <rect x="85" y="180" width="30" height="40" fill="#fcd1ba" />
            <path d="M 60 230 Q 100 200 140 230 L 160 250 L 40 250 Z" fill="#f9a8d4" />
            <ellipse cx="100" cy="140" rx="45" ry="55" fill="#fcd1ba" />
            <path d="M 55 100 Q 70 70 100 80 Q 130 70 145 100 Q 140 120 120 100 Q 100 85 80 100 Q 60 120 55 100 Z" fill={hairColor} />
            <path d="M 55 100 Q 50 150 40 180 Q 60 170 55 100" fill={hairColor} />
            <path d="M 145 100 Q 150 150 160 180 Q 140 170 145 100" fill={hairColor} />
            <path d="M 70 120 Q 80 115 90 120 M 130 120 Q 120 115 110 120" fill="none" stroke="#5c3a21" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="80" cy="135" rx="10" ry="14" fill="#fff" /><ellipse cx="120" cy="135" rx="10" ry="14" fill="#fff" />
            <ellipse cx="80" cy="135" rx="6" ry="8" fill="#3b82f6" /><ellipse cx="120" cy="135" rx="6" ry="8" fill="#3b82f6" />
            <circle cx="82" cy="133" r="2" fill="#fff" /><circle cx="122" cy="133" r="2" fill="#fff" />
            <path d="M 70 135 Q 80 125 90 135 M 110 135 Q 120 125 130 135" fill="none" stroke="#000" strokeWidth="2" />
            {eyeColor !== "transparent" && <><ellipse cx="80" cy="125" rx="12" ry="6" fill={eyeColor} opacity="0.6" /><ellipse cx="120" cy="125" rx="12" ry="6" fill={eyeColor} opacity="0.6" /></>}
            {blushColor !== "transparent" && <><ellipse cx="65" cy="155" rx="12" ry="8" fill={blushColor} opacity="0.5" filter="blur(2px)" /><ellipse cx="135" cy="155" rx="12" ry="8" fill={blushColor} opacity="0.5" filter="blur(2px)" /></>}
            <path d="M 98 150 Q 100 155 102 150" fill="none" stroke="#d1a38e" strokeWidth="2" strokeLinecap="round" />
            <path d="M 85 170 Q 100 160 115 170 Q 100 185 85 170 Z" fill={lipColor} />
            <path d="M 85 170 Q 100 165 115 170" fill="none" stroke="#be123c" strokeWidth="1" />
            <path d="M 75 70 L 85 40 L 100 60 L 115 40 L 125 70 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="100" cy="50" r="4" fill="#ef4444" /><circle cx="85" cy="55" r="3" fill="#3b82f6" /><circle cx="115" cy="55" r="3" fill="#3b82f6" />
          </svg>
          <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-2 sm:top-4 sm:gap-4"><div className="h-2.5 w-2.5 rounded-full bg-yellow-200 shadow-[0_0_10px_#fde047] sm:h-4 sm:w-4" /><div className="h-2.5 w-2.5 rounded-full bg-yellow-200 shadow-[0_0_10px_#fde047] sm:h-4 sm:w-4" /></div>
        </section>

        <section className="relative flex w-1/2 min-w-0 flex-col justify-between bg-gradient-to-b from-[#fbcfe8] to-[#f472b6] p-2 pb-8 sm:p-6 sm:pb-10">
          <div>
            <h2 className="mb-1 text-xs font-bold text-white drop-shadow-md sm:mb-2 sm:text-lg">💇‍♀️ Đổi màu tóc</h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-3">{hairColors.map(color => <button key={color} aria-label={"Màu tóc " + color} onClick={() => handleHairChange(color)} className="h-6 w-6 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 sm:h-10 sm:w-10" style={{ backgroundColor: color }} />)}</div>
          </div>
          <div>
            <h2 className="mb-1 text-xs font-bold text-white drop-shadow-md sm:mb-2 sm:text-lg">🎨 Phấn mắt</h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-3">{eyeColors.map(color => <button key={color} aria-label={"Phấn mắt " + color} onClick={() => handleEyeChange(color)} className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-white shadow-lg sm:h-10 sm:w-10" style={{ backgroundColor: color === "transparent" ? "#e5e7eb" : color }}>{color === "transparent" && <span className="text-[7px] text-gray-500 sm:text-xs">Xóa</span>}</button>)}</div>
          </div>
          <div>
            <h2 className="mb-1 text-xs font-bold text-white drop-shadow-md sm:mb-2 sm:text-lg">🌸 Má hồng</h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-3">{blushColors.map(color => <button key={color} aria-label={"Má hồng " + color} onClick={() => handleBlushChange(color)} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-lg sm:h-10 sm:w-10" style={{ backgroundColor: color === "transparent" ? "#e5e7eb" : color }}>{color === "transparent" && <span className="text-[7px] text-gray-500 sm:text-xs">Xóa</span>}</button>)}</div>
          </div>
          <div>
            <h2 className="mb-1 text-xs font-bold text-white drop-shadow-md sm:mb-2 sm:text-lg">💄 Son môi</h2>
            <div className="flex items-end gap-1.5 sm:gap-4">{lipColors.map(color => <button key={color} aria-label={"Son môi " + color} onClick={() => handleLipChange(color)} className="group relative h-12 w-5 transition-transform hover:-translate-y-2 sm:h-20 sm:w-8"><span className="absolute bottom-0 h-7 w-full rounded-b-md border border-gray-600 bg-gray-800 shadow-md sm:h-12" /><span className="absolute bottom-7 h-4 w-full rounded-t-lg shadow-inner sm:bottom-12 sm:h-6" style={{ backgroundColor: color }} /><span className="absolute right-0.5 top-0 h-2 w-1 bg-white/40 sm:h-4 sm:w-2" /></button>)}</div>
          </div>
          <div className="absolute bottom-0 left-0 h-5 w-full bg-[#5c3a21] shadow-[0_-5px_15px_rgba(0,0,0,0.3)] sm:h-8" />
        </section>
      </div>

      <div className="z-10 mt-2 flex shrink-0 items-center gap-2">
        <button onClick={resetLook} className="rounded-full border-2 border-pink-300 bg-white px-4 py-2 text-sm font-bold text-pink-500 shadow-lg transition-colors hover:bg-pink-50 sm:px-6 sm:text-base">🔄 Chơi lại từ đầu</button>
        <button disabled={saving} onClick={() => void saveLook()} className="rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-2 text-sm font-bold text-white shadow-lg disabled:opacity-60 sm:px-6 sm:text-base">{saving ? "Đang lưu..." : "💖 Lưu công chúa"}</button>
      </div>
      {done && <p className="mt-1 text-xs font-bold text-emerald-700">✨ Đã lưu diện mạo công chúa!</p>}
    </div>
  );
}
