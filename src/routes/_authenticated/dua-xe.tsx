import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/dua-xe")({
  head: () => ({
    meta: [
      { title: "Siêu Game Đua Xe 3D – Bé Học Vui" },
      { name: "description", content: "Game đua xe 3D dành cho bé trai." },
    ],
  }),
  component: () => (
    <GameShell fullBleed>
      {() => (
        <iframe
          title="Siêu Game Đua Xe 3D – Bé Học Vui"
          src="/games/dua-xe-3d/index.html"
          className="h-full w-full border-0 bg-black"
          allow="fullscreen; autoplay; orientation"
          allowFullScreen
        />
      )}
    </GameShell>
  ),
});
