import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";

const GAME_URL = "https://plix.gg/vi/games/barbee-fashion-influencer";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [{ title: "Barbee Fashion – Salon Bé Học Vui" }],
  }),
  component: SalonRoute,
});

function SalonRoute() {
  return (
    <GameShell fullBleed>
      {() => (
        <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#1a1a2e]">
          <iframe
            title="Barbee Fashion"
            src="/games/fashion-designer-3d/index.html"
            className="h-full w-full border-0"
            allow="fullscreen"
            allowFullScreen
          />
          <div className="absolute left-3 top-3 z-30 flex flex-wrap gap-2">
            <a
              href="/the-gioi"
              className="rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-pink-700 shadow-lg transition hover:bg-pink-100"
            >
              🏫 Trở về trường
            </a>
            <a
              href={GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-pink-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-pink-700"
            >
              🎮 Mở game ở tab riêng
            </a>
          </div>
        </div>
      )}
    </GameShell>
  );
}
