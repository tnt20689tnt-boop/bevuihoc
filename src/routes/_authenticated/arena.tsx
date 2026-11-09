import { createFileRoute } from "@tanstack/react-router";
import ArenaBattle from "@/game/ArenaBattle";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/arena")({
  head: () => ({
    meta: [
      { title: "Đấu Trường Tri Thức – Bé Vui Học" },
      { name: "description", content: "Ba phòng học Toán, Tiếng Việt và Tiếng Anh dành cho học sinh." },
      { property: "og:title", content: "Đấu Trường Trí Tuệ – Bé Vui Học" },
      { property: "og:description", content: "Chọn phòng học và chinh phục thử thách kiến thức theo khối lớp." },
    ],
  }),
  component: () => <GameShell>{(profile) => <ArenaBattle currentGrade={profile.grade} profile={profile} onExit={() => window.history.back()} />}</GameShell>,
});
