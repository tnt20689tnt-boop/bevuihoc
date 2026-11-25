import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [{ title: "Công Chúa Beauty & Fashion Studio 3D – Bé Vui Học" }],
  }),
  component: SalonRoute,
});

function SalonRoute() {
  return (
    <GameShell fullBleed>
      {() => (
        <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#fdf2f8]">
          <iframe
            title="Công Chúa Beauty & Fashion Studio 3D"
            src="/games/fashion-designer-3d/index.html"
            className="h-full w-full border-0"
            allow="fullscreen"
            allowFullScreen
          />
          <div className="absolute left-3 top-3 z-30">
            <a
              href="/the-gioi"
              className="rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-pink-700 shadow-lg transition hover:bg-pink-100"
            >
              🏫 Trở về trường
            </a>
          </div>
        </div>
      )}
    </GameShell>
  );
}
