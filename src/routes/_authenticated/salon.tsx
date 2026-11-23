import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [{ title: "Salon thời trang 3D – Bé Học Vui" }],
  }),
  component: () => (
    <GameShell fullBleed>
      {() => (
        <div className="relative h-full min-h-0 w-full overflow-hidden bg-pink-50">
          <iframe
            title="Salon tạo người mẫu 3D"
            src="/games/fashion-designer-3d/index.html"
            className="h-full w-full border-0"
            allow="fullscreen"
          />
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
