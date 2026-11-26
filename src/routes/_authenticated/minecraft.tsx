import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/minecraft")({
  head: () => ({
    meta: [
      { title: "Vương Quốc Khối Kỳ Diệu 3D – Bé Học Vui" },
      {
        name: "description",
        content: "Game xây dựng thế giới khối 3D dành cho bé trai.",
      },
    ],
  }),
  component: () => (
    <GameShell fullBleed>
      {() => (
        <iframe
          title="Vương Quốc Khối Kỳ Diệu 3D – Bé Học Vui"
          src="/games/minecraft/index.html"
          className="h-full w-full border-0 bg-sky-950"
          allow="fullscreen; autoplay; orientation"
          allowFullScreen
        />
      )}
    </GameShell>
  ),
});
