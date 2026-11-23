import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [{ title: "Salon – Bé Học Vui" }],
  }),
  component: () => (
    <GameShell fullBleed>
      {() => (
        <div className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100">
          <div className="rounded-3xl border border-pink-200 bg-white/90 px-8 py-10 text-center shadow-xl">
            <div className="mb-3 text-5xl">💗</div>
            <h1 className="text-xl font-extrabold text-pink-700">Salon đang được làm mới</h1>
            <p className="mt-2 text-sm text-slate-600">Hiện chưa có trò chơi nào trong phòng Salon.</p>
          </div>
          <a
            href="/the-gioi"
            className="absolute left-3 top-3 z-20 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-pink-700 shadow-lg transition hover:bg-pink-100"
          >
            🏫 Trở về trường
          </a>
        </div>
      )}
    </GameShell>
  ),
});
