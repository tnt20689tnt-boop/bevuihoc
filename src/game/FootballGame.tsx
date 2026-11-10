import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Profile } from "@/hooks/use-player";
import { takeFootballShot } from "@/game/football.functions";
import type { FootballDirection } from "@/lib/football-scoring";
import { toast } from "sonner";

const lanes: { id: FootballDirection; label: string; arrow: string }[] = [
  { id: "left", label: "GÓC TRÁI", arrow: "↖" },
  { id: "center", label: "Ở GIỮA", arrow: "↑" },
  { id: "right", label: "GÓC PHẢI", arrow: "↗" },
];

type Turn = "shooter" | "keeper";
type Outcome = { scored: boolean; byPlayer: boolean; text: string };

export function FootballGame({ profile }: { profile: Profile }) {
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState<Turn>("shooter");
  const [power, setPower] = useState(72);
  const [aim, setAim] = useState<FootballDirection>("center");
  const [keeperAim, setKeeperAim] = useState<FootballDirection>("center");
  const [keeperDirection, setKeeperDirection] = useState<FootballDirection | null>(null);
  const [shotDirection, setShotDirection] = useState<FootballDirection | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [suddenDeath, setSuddenDeath] = useState(false);

  const totalShots = (round - 1) * 2 + (turn === "keeper" ? 1 : 0);

  function advance(nextPlayerScore: number, nextOpponentScore: number) {
    if (turn === "shooter") {
      setTurn("keeper");
      setAim("center");
      setKeeperAim("center");
      return;
    }
    if (round >= 5 && nextPlayerScore !== nextOpponentScore) {
      setGameOver(true);
      toast.success(nextPlayerScore > nextOpponentScore ? "Bé chiến thắng loạt sút!" : "Đối thủ thắng lượt này, bé cố gắng lần sau nhé!");
      return;
    }
    if (round >= 5 && nextPlayerScore === nextOpponentScore) setSuddenDeath(true);
    setRound((value) => value + 1);
    setTurn("shooter");
    setAim("center");
    setKeeperAim("center");
  }

  async function playerShoot() {
    if (busy || gameOver) return;
    setBusy(true);
    setOutcome(null);
    setShotDirection(aim);
    try {
      const result = await takeFootballShot({ data: { direction: aim } });
      const nextPlayerScore = playerScore + (result.scored ? 1 : 0);
      setPlayerScore(nextPlayerScore);
      setKeeperDirection(result.goalkeeperDirection);
      setOutcome({ scored: result.scored, byPlayer: true, text: result.scored ? "BẠN GHI BÀN!" : "THỦ MÔN CẢN PHÁ!" });
      if (result.scored) {
        toast.success(`Ghi bàn! +${result.points} điểm ⚽`);
        if (result.newBadges.length) toast.success("Bé vừa nhận huy hiệu mới!");
      }
      window.setTimeout(() => {
        setOutcome(null);
        setKeeperDirection(null);
        advance(nextPlayerScore, opponentScore);
        setBusy(false);
      }, 1400);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chưa ghi nhận được cú sút. Bé thử lại nhé!");
      setShotDirection(null);
      setBusy(false);
    }
  }

  function playerSave() {
    if (busy || gameOver) return;
    setBusy(true);
    const aiShot = lanes[Math.floor(Math.random() * lanes.length)]!.id;
    setShotDirection(aiShot);
    setKeeperDirection(keeperAim);
    const saved = aiShot === keeperAim;
    const nextOpponentScore = opponentScore + (saved ? 0 : 1);
    setOpponentScore(nextOpponentScore);
    setOutcome({ scored: !saved, byPlayer: false, text: saved ? "BẠN CẢN PHÁ!" : "ĐỐI THỦ GHI BÀN!" });
    window.setTimeout(() => {
      setOutcome(null);
      setKeeperDirection(null);
      setShotDirection(null);
      advance(playerScore, nextOpponentScore);
      setBusy(false);
    }, 1400);
  }

  function restart() {
    if (busy) return;
    setPlayerScore(0);
    setOpponentScore(0);
    setRound(1);
    setTurn("shooter");
    setPower(72);
    setAim("center");
    setKeeperAim("center");
    setOutcome(null);
    setKeeperDirection(null);
    setShotDirection(null);
    setGameOver(false);
    setSuddenDeath(false);
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(ellipse_at_top,#dff5ff_0%,#b8e5fa_38%,#d6f3d0_100%)] p-3 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-700">Trò chơi sút luân lưu</p>
            <h1 className="text-3xl font-black text-emerald-950 sm:text-4xl">⚽ SÂN ĐẤU PENALTY</h1>
            <p className="font-semibold text-emerald-800">Chào {profile.display_name}! Bé vừa sút bóng, vừa làm thủ môn nhé.</p>
          </div>
          <Link to="/the-gioi" className="rounded-2xl border-2 border-white bg-white/90 px-4 py-3 font-extrabold text-emerald-800 shadow-lg">← Về sân trường</Link>
        </header>

        <section className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow"><div className="text-[10px] font-black text-slate-500 sm:text-xs">BÉ</div><div className="text-3xl font-black text-emerald-700 tabular-nums">{playerScore}</div></div>
          <div className="rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow"><div className="text-[10px] font-black text-slate-500 sm:text-xs">LƯỢT</div><div className="text-2xl font-black text-sky-700 tabular-nums">{round}/5{round > 5 ? " +" : ""}</div></div>
          <div className="rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow"><div className="text-[10px] font-black text-slate-500 sm:text-xs">ĐỐI THỦ</div><div className="text-3xl font-black text-rose-600 tabular-nums">{opponentScore}</div></div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border-[6px] border-white bg-emerald-950 shadow-[0_20px_60px_#176c4930]">
          <div className="relative h-[310px] overflow-hidden sm:h-[390px]" style={{ background: "linear-gradient(#8bd4ff 0%,#d8f3ff 39%,#76c96b 39%,#32984a 100%)" }}>
            <div className="absolute inset-x-0 bottom-0 h-[60%]" style={{ background: "repeating-linear-gradient(90deg,#55b85a 0px,#55b85a 72px,#4eaa53 72px,#4eaa53 144px)" }} />
            <div className="absolute left-1/2 top-[34%] h-[55%] w-[min(82%,680px)] -translate-x-1/2 border-4 border-white/80 border-b-0">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(90deg,transparent 49.5%,white 50%,transparent 50.5%),linear-gradient(0deg,transparent 49.5%,white 50%,transparent 50.5%)" }} />
              <div className="absolute inset-x-0 top-0 h-3 border-b-4 border-white/70" />
              <div className="absolute inset-x-[18%] bottom-0 h-[35%] rounded-t-[50%] border-2 border-b-0 border-white/60" />
              <div className="absolute inset-0 grid grid-cols-3">{lanes.map((lane) => <div key={lane.id} className="border-r border-dashed border-white/40 last:border-0" />)}</div>
            </div>
            <div className="absolute left-1/2 top-[30%] z-10 h-[31%] w-[min(68%,520px)] -translate-x-1/2">
              <div className="absolute inset-0 border-[9px] border-b-[7px] border-white bg-white/10 shadow-[0_8px_0_#c7e6f5] sm:border-[12px] sm:border-b-[9px]" />
              <div className="absolute inset-0 grid grid-cols-3">{lanes.map((lane) => <div key={lane.id} className="border-r border-dashed border-white/50 last:border-0" />)}</div>
              <div className="absolute -bottom-3 left-1/2 z-20 -translate-x-1/2 text-6xl drop-shadow-lg transition-all duration-500" style={{ transform: keeperDirection ? `translateX(${keeperDirection === "left" ? "-125%" : keeperDirection === "right" ? "25%" : "-50%"}) rotate(${keeperDirection === "left" ? "-35deg" : keeperDirection === "right" ? "35deg" : "0deg"})` : "translateX(-50%)" }}>🧤</div>
            </div>
            <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-5xl drop-shadow-xl transition-all duration-700" style={{ transform: shotDirection ? `translate(${shotDirection === "left" ? "-120px" : shotDirection === "right" ? "120px" : "0px"},-190px) scale(.55)` : "translate(0,0)" }}>⚽</div>
            <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-xs font-black text-emerald-900 shadow">SÂN VẬN ĐỘNG BÉ HỌC VUI</div>
            <div className="absolute right-3 top-3 rounded-full bg-emerald-950/75 px-3 py-1 text-xs font-black text-white">{turn === "shooter" ? "BÉ ĐANG SÚT" : "BÉ LÀM THỦ MÔN"}</div>
            {outcome && <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/25"><div className={`rounded-3xl border-4 border-white px-8 py-5 text-center text-3xl font-black text-white shadow-2xl ${outcome.scored ? "bg-emerald-600" : "bg-orange-500"}`}>{outcome.text}<div className="mt-2 text-base">{outcome.scored ? (outcome.byPlayer ? "+10 điểm" : "Đối thủ được 1 bàn") : "Pha bóng xuất sắc!"}</div></div></div>}
          </div>

          <div className="bg-emerald-950/95 p-4 text-center text-white sm:p-6">
            {gameOver ? (
              <div className="py-4"><div className="text-4xl font-black">{playerScore > opponentScore ? "🏆 BÉ CHIẾN THẮNG!" : "⚽ KẾT THÚC TRẬN!"}</div><p className="mt-2 text-emerald-100">Tỉ số cuối cùng: {playerScore} – {opponentScore}</p><button onClick={restart} className="mt-4 rounded-2xl bg-amber-300 px-8 py-3 font-black text-emerald-950">🔄 ĐÁ LẠI</button></div>
            ) : (
              <>
                <div className="mb-3"><span className="rounded-full bg-white/15 px-4 py-2 text-sm font-black">{suddenDeath ? "⚡ SÚT LUÂN LƯU SUDDEN DEATH" : `LƯỢT ${round} / 5`} · {turn === "shooter" ? "💥 NHIỆM VỤ: SÚT GHI BÀN" : "🧤 NHIỆM VỤ: CẢN PHÁ"}</span></div>
                <h2 className="text-lg font-black sm:text-xl">{turn === "shooter" ? "Chọn góc sút và lực sút!" : "Đoán hướng bóng rồi đổ người cản phá!"}</h2>
                <div className="mx-auto mt-4 grid max-w-xl grid-cols-3 gap-2">
                  {lanes.map((lane) => <button key={lane.id} type="button" disabled={busy} onClick={() => turn === "shooter" ? setAim(lane.id) : setKeeperAim(lane.id)} className={`rounded-2xl border-2 px-2 py-3 font-black transition disabled:opacity-50 ${(turn === "shooter" ? aim : keeperAim) === lane.id ? "border-amber-300 bg-amber-300 text-emerald-950 shadow-lg" : "border-white/30 bg-white/10 text-white hover:bg-white/20"}`}><span className="block text-3xl">{lane.arrow}</span><span className="text-xs">{lane.label}</span></button>)}
                </div>
                {turn === "shooter" && <div className="mx-auto mt-4 max-w-xl text-left"><div className="mb-1 flex justify-between text-sm font-bold"><span>💥 LỰC SÚT</span><span>{power}%</span></div><input aria-label="Lực sút" type="range" min="20" max="100" step="5" value={power} onChange={(event) => setPower(Number(event.target.value))} className="w-full accent-amber-300" /><div className="h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-gradient-to-r from-lime-300 via-amber-300 to-rose-400 transition-all" style={{ width: `${power}%` }} /></div></div>}
                <button type="button" disabled={busy} onClick={() => void (turn === "shooter" ? playerShoot() : playerSave())} className="mt-5 w-full max-w-xl rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-400 px-6 py-4 text-xl font-black text-emerald-950 shadow-[0_5px_0_#b7791f] transition active:translate-y-1 active:shadow-none disabled:opacity-60">{busy ? "ĐANG THỰC HIỆN..." : turn === "shooter" ? "⚽ SÚT PHẠT!" : "🧤 ĐỔ NGƯỜI CẢN PHÁ!"}</button>
                <p className="mt-3 text-xs text-emerald-100/80">Mỗi bàn thắng của bé được cộng 10 điểm. Hai bên luân phiên sút và bắt bóng; nếu hòa sẽ đá sudden death.</p>
              </>
            )}
            <button type="button" disabled={busy} onClick={restart} className="mt-3 rounded-xl px-4 py-2 text-sm font-bold text-emerald-100 underline decoration-emerald-300 underline-offset-4 disabled:opacity-50">Chơi lại từ đầu</button>
          </div>
        </section>
      </div>
    </main>
  );
}
