import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";
import { PrincessWardrobe3D } from "@/game/PrincessWardrobe3D";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [
      { title: "Salon Anime 3D – Bé Học Vui" },
      {
        name: "description",
        content:
          "Game thời trang salon anime 3D với 10 váy, 10 kiểu tóc, kính, kẹp tóc, vương miện và giày.",
      },
      { property: "og:title", content: "Salon Anime 3D – Bé Học Vui" },
      {
        property: "og:description",
        content: "Tự phối diện mạo công chúa với bộ sưu tập 60 món đồ xinh xắn.",
      },
    ],
  }),
  component: () => <GameShell>{(profile) => <PrincessWardrobe3D profile={profile} />}</GameShell>,
});
