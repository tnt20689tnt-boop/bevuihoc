import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [{ title: "Công Chúa Beauty & Fashion Studio 3D – Bé Vui Học" }],
  }),
  component: SalonRoute,
});

function SalonRoute() {
  const [activeGame, setActiveGame] = useState<"fashion" | "makeup">("fashion");

  const games = {
    fashion: {
      label: "Game thời trang",
      src: "/games/fashion-designer-3d/index.html",
      title: "Công Chúa Beauty & Fashion Studio 3D",
    },
    makeup: {
      label: "Game trang điểm",
      src: "/games/makeup-studio/index.html",
      title: "Tiệm Mơ – Game trang điểm",
    },
  } as const;

  const game = games[activeGame];

  return (
    <GameShell fullBleed>
      {() => (
        <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#fdf2f8]">
          <iframe
            title={game.title}
            src={game.src}
            className="h-full w-full border-0"
            allow="fullscreen"
            allowFullScreen
          />
          <div className="absolute left-3 top-3 z-30 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2">
            <a
              href="/the-gioi"
              className="rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-pink-700 shadow-lg transition hover:bg-pink-100"
            >
              Trở về trường
            </a>
            <div className="flex rounded-full bg-white/95 p-1 shadow-lg" aria-label="Chọn game trong salon">
              {(Object.keys(games) as Array<keyof typeof games>).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveGame(key)}
                  className={`rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                    activeGame === key
                      ? "bg-pink-600 text-white shadow"
                      : "text-pink-700 hover:bg-pink-100"
                  }`}
                  aria-pressed={activeGame === key}
                >
                  {games[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
