import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";

const GAME_URL = "https://plix.gg/vi/games/barbee-fashion-influencer";
const PRIMARY_PROXY = "https://api.allorigins.win/raw?url=" + encodeURIComponent(GAME_URL);
const BACKUP_PROXY = "https://corsproxy.io/?" + encodeURIComponent(GAME_URL);

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [{ title: "Barbee Fashion – Salon Bé Học Vui" }],
  }),
  component: SalonRoute,
});

function SalonRoute() {
  return (
    <GameShell fullBleed>
      {() => <SalonGame />}
    </GameShell>
  );
}

function SalonGame() {
  const [src, setSrc] = useState(PRIMARY_PROXY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAttempt = (nextSrc: string, nextAttempt: number) => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    setError(false);
    setAttempt(nextAttempt);
    setSrc(nextSrc);
    timer.current = setTimeout(() => {
      setLoading(false);
      setError(true);
    }, 12000);
  };

  useEffect(() => {
    timer.current = setTimeout(() => {
      setLoading(false);
      setError(true);
    }, 12000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleLoad = () => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(false);
    setError(false);
  };

  const reload = () => startAttempt(attempt === 0 ? PRIMARY_PROXY : src, attempt);
  const tryBackup = () => startAttempt(BACKUP_PROXY, 1);

  return (
    <main className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#1a1a2e] text-white">
      <header className="z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#ff6b9d] to-[#c44569] px-4 py-3 shadow-lg">
        <div className="text-base font-black sm:text-lg">💖 Barbee Fashion – Salon Công Chúa</div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={tryBackup} className="rounded-lg border border-white/40 bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25">⚡ Thử Proxy dự phòng</button>
          <button type="button" onClick={reload} className="rounded-lg border border-white/40 bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25">🔄 Tải lại</button>
          <a href={GAME_URL} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/40 bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25">↗ Mở tab riêng</a>
          <a href="/the-gioi" className="rounded-lg border border-white/40 bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25">🏫 Về trường</a>
        </div>
      </header>

      <section className="relative min-h-0 flex-1 bg-black">
        <iframe
          key={src}
          title="Barbee Fashion"
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          allow="fullscreen; gamepad"
          allowFullScreen
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
        />

        {loading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1a1a2e] px-5 text-center">
            <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-pink-300/30 border-t-pink-400" />
            <h2 className="text-xl font-black">Đang kết nối Barbee Fashion…</h2>
            <p className="mt-2 max-w-lg text-sm text-white/75">Đang thử tải trò chơi trong phòng Salon. Vui lòng chờ trong giây lát.</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#1a1a2e]/95 p-5 text-center">
            <div className="max-w-xl rounded-2xl border-2 border-rose-400 bg-rose-500/10 p-6 shadow-xl">
              <div className="text-3xl">⚠️</div>
              <h2 className="mt-2 text-xl font-black text-rose-300">Không thể nhúng trò chơi</h2>
              <p className="mt-3 text-sm leading-6 text-white/90">Plix.gg hoặc dịch vụ Proxy có thể chặn iframe. Nút mở tab riêng sẽ đưa bé đến trang game gốc. Proxy không thể bảo đảm vượt chính sách chống nhúng của website.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={tryBackup} className="rounded-xl bg-pink-500 px-4 py-3 font-bold text-white">Thử Proxy dự phòng</button>
                <a href={GAME_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white px-4 py-3 font-bold text-pink-700">Chơi ở tab riêng ↗</a>
                <button type="button" onClick={reload} className="rounded-xl border border-white/40 px-4 py-3 font-bold text-white">Thử tải lại</button>
              </div>
            </div>
          </div>
        )}
      </section>
      <p className="shrink-0 bg-[#251c35] px-3 py-1.5 text-center text-[11px] text-white/65">Trò chơi được cung cấp bởi Plix.gg. Nếu nhà phát hành chặn nhúng, hãy mở ở tab riêng.</p>
    </main>
  );
}
