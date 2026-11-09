import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";
import { WorldExperience } from "@/game/WorldExperience";

export const Route = createFileRoute("/_authenticated/the-gioi")({
  head: () => ({
    meta: [
      { title: "Thế Giới Học Vui – Khuôn viên trường 3D" },
      {
        name: "description",
        content:
          "Bước vào sân trường 3D, khám phá các tòa Toán, Tiếng Việt, Tiếng Anh cùng những khu vui chơi dành cho bé.",
      },
      { property: "og:title", content: "Thế Giới Học Vui – Khuôn viên trường 3D" },
      {
        property: "og:description",
        content: "Khám phá sân trường 3D đầy màu sắc với các phòng học và khu vui chơi an toàn.",
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
