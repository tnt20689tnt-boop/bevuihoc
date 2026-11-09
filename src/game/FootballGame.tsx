import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/hooks/use-player";
import { toast } from "sonner";

type Direction = "left" | "center" | "right";

const directions: { id: Direction; label: string; arrow: string }[] = [
  { id: "left", label: "Góc trái", arrow: "↖" },
  { id: "center", label: "Chính giữa", arrow: "↑" },
  { id: "right", label: "Góc phải", arrow: "↗" },
];

export function FootballGame({ profile }: { profile: Profile }) {
  const [goals, setGoals] = useState(0);
  const [shots, setShots] = useState(0);
  const [points, setPoints] = useState(0);
  const [direction, setDirection] = useState<Direction>("center");
  const [keeper, setKeeper] = useState<Direction | null>(null);
  const [result, setResult] = useState<"goal" | "saved" | null>(null);
  const [shooting, setShooting] = useState(false);
  const [saving, setSaving] = useState(false);

  async function shoot() {
    if (shooting || saving) return;
    setShooting(true);
    setResult(null);
    const keeperDirection = directions[Math.floor(Math.random() * directions.length)]!.id;
    setKeeper(keeperDirection);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    const scored = direction !== keeperDirection;
    setShots((value) => value + 1);
    setResult(scored ? "goal" : "saved");

    if (scored) {
      try {
        setSaving(true);
        const { error } = await supabase.from("point_events").insert({
          user_id: profile.id,
          grade: profile.grade,
          points: 10,
          correct: 1,
          goals: 1,
          reason: "football_goal",
          note: "Ghi bàn trong trò chơi Sút bóng",
        });
        if (error) throw error;
        setGoals((value) => value + 1);
        setPoints((value) => value + 10);
        toast.success("Ghi bàn! Bé được cộng 10 điểm ⚽");
      } catch {
        toast.error("Bóng đã vào lưới nhưng chưa lưu được điểm. Bé thử lại sau nhé!");
      } finally {
        setSaving(false);
      }
    }
    await new Promise((resolve) => window.setTimeout(resolve, 950));
    setResult(null);
    setKeeper(null);
    setShooting(false);
  }

  function resetGame() {
    if (shooting || saving) return;
    setGoals(0);
    setShots(0);
    setPoints(0);
    setResult(null);
    setKeeper(null);
    setDirection("center");
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] overflow-hidden bg-[linear-gradient(180deg,#dff4ff_0%,#f2fbff_34%,#dff4d7_100%)] p-3 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-700">Mini game bóng đá</p>
            <h1 className="text-3xl font-black text-emerald-950 sm:text-4xl">⚽ Sút bóng ghi bàn</h1>
            <p className="font-semibold text-emerald-800">Chào {profile.display_name}! Chọn góc sút để đánh bại thủ môn nhé.</p>
          </div>
          <Link to="/the-gioi" className="rounded-2xl border-2 border-white bg-white/90 px-4 py-3 font-extrabold text-emerald-800 shadow-lg">← Về sân trường</Link>
        </header>

        <section className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow"><div className="text-xs font-bold text-slate-500">BÀN THẮNG</div><div className="text-3xl font-black text-emerald-700 tabular-nums">{goals}</div></div>
          <div className="rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow"><div className="text-xs font-bold text-slate-500">LẦN SÚT</div><div className="text-3xl font-black text-sky-700 tabular-nums">{shots}</div></div>
          <div className="rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow"><div className="text-xs font-bold text-slate-500">ĐIỂM NHẬN ĐƯỢC</div><div className="text-3xl font-black text-amber-600 tabular-nums">{points}</div></div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border-[6px] border-white bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-300 shadow-[0_20px_60px_#176c4930]">
          <div className="relative h-[330px] overflow-hidden sm:h-[420px]" style={{ background: "linear-gradient(#8bd4ff 0%,#d8f3ff 42%,#76c96b 42%,#3b9d50 100%)" }}>
            <div className="absolute inset-x-0 top-[42%] h-[58%]" style={{ background: "repeating-linear-gradient(90deg,#55b85a 0px,#55b85a 65px,#4eaa53 65px,#4eaa53 130px)" }} />
            <div className="absolute left-1/2 top-[43%] h-[46%] w-[min(76%,620px)] -translate-x-1/2 border-4 border-white/80 border-b-0">
              <div className="absolute inset-x-0 top-0 h-3 border-b-4 border-white/70" />
              <div className="absolute inset-y-0 left-1/2 border-l-2 border-dashed border-white/40" />
              <div className="absolute inset-x-[18%] bottom-0 h-[35%] rounded-t-[50%] border-2 border-b-0 border-white/60" />
            </div>
            <div className="absolute left-1/2 top-[38%] z-10 h-[30%] w-[min(68%,520px)] -translate-x-1/2">
              <div className="absolute inset-0 border-[9px] border-b-[7px] border-white bg-white/10 shadow-[0_8px_0_#c7e6f5] sm:border-[12px] sm:border-b-[9px]" />
              <div className="absolute inset-0 grid grid-cols-3">
                {directions.map((d) => <div key={d.id} className="border-r border-dashed border-white/50 last:border-0" />)}
              </div>
              <div className="absolute -bottom-2 left-1/2 z-20 -translate-x-1/2 text-5xl drop-shadow-lg transition-all duration-300 sm:text-6xl" style={{ transform: keeper ? `translateX(${keeper === "left" ? "-115%" : keeper === "right" ? "15%" : "-50%"}) rotate(${keeper === "left" ? "-28deg" : keeper === "right" ? "28deg" : "0deg"})` : "translateX(-50%)" }}>🧤</div>
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-4xl drop-shadow">🧍</div>
            </div>
            <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 text-5xl drop-shadow-xl transition-all duration-500 sm:text-6xl" style={{ transform: shooting ? `translate(${direction === "left" ? "-125px" : direction === "right" ? "125px" : "0px"}, -210px) scale(.55)` : "translate(0,0) scale(1)" }}>⚽</div>
            {result && <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/15"><div className={`rounded-3xl border-4 border-white px-8 py-5 text-center text-4xl font-black text-white shadow-2xl ${result === "goal" ? "bg-emerald-600" : "bg-orange-500"}`}>{result === "goal" ? "VÀO!!! 🎉" : "THỦ MÔN CẢN ĐƯỢC! 💪"}<div className="mt-2 text-base">{result === "goal" ? "+10 điểm" : "Thử cú sút khác nhé!"}</div></div></div>}
            <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-xs font-black text-emerald-900 shadow">SÂN VẬN ĐỘNG BÉ HỌC VUI</div>
          </div>
          <div className="bg-emerald-950/95 p-4 text-center text-white sm:p-6">
            <h2 className="text-lg font-black sm:text-xl">Bé muốn sút vào góc nào?</h2>
            <div className="mx-auto mt-3 grid max-w-xl grid-cols-3 gap-2">
              {directions.map((d) => <button key={d.id} type="button" disabled={shooting || saving} onClick={() => setDirection(d.id)} className={`rounded-2xl border-2 px-2 py-3 font-black transition disabled:opacity-50 ${direction === d.id ? "border-amber-300 bg-amber-300 text-emerald-950 shadow-lg" : "border-white/30 bg-white/10 text-white hover:bg-white/20"}`}><span className="block text-3xl">{d.arrow}</span><span className="text-sm">{d.label}</span></button>)}
            </div>
            <button type="button" disabled={shooting || saving} onClick={() => void shoot()} className="mt-4 w-full max-w-xl rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-400 px-6 py-4 text-xl font-black text-emerald-950 shadow-[0_5px_0_#b7791f] transition active:translate-y-1 active:shadow-none disabled:opacity-60">{saving ? "Đang lưu điểm..." : shooting ? "Đang sút..." : "⚽ SÚT BÓNG NGAY!"}</button>
            <button type="button" disabled={shooting || saving} onClick={resetGame} className="mt-3 rounded-xl px-4 py-2 text-sm font-bold text-emerald-100 underline decoration-emerald-300 underline-offset-4 disabled:opacity-50">Chơi lại lượt tính điểm</button>
            <p className="mt-3 text-xs text-emerald-100/80">Mỗi bàn thắng được cộng 10 điểm vào bảng xếp hạng. Hãy chọn góc sút thật khéo!</p>
          </div>
        </section>
      </div>
    </main>
  );
}
