import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";
import { WorldExperience } from "@/game/WorldExperience";

export const Route = createFileRoute("/_authenticated/the-gioi")({
  head: () => ({
    meta: [
      { title: "Thế Giới Học Vui – Sảnh khám phá 3D" },
      {
        name: "description",
        content:
          "Khám phá sảnh 3D, bước qua các cổng đến phòng Toán, Tiếng Việt, Tiếng Anh và khu vui chơi.",
      },
      { property: "og:title", content: "Thế Giới Học Vui – Sảnh khám phá 3D" },
      {
        property: "og:description",
        content: "Khám phá sảnh 3D cùng các phòng học và khu vui chơi dành cho bé.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorldRoute,
});

function WorldRoute() {
  return <GameShell fullBleed>{(profile) => <WorldExperience profile={profile} />}</GameShell>;
}
