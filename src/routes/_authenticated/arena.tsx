import { createFileRoute } from "@tanstack/react-router";
import ArenaBattle from "@/game/ArenaBattle";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/arena")({
  head: () => ({
    meta: [
      { title: "Đấu Trường Trí Tuệ – Bé Vui Học" },
      { name: "description", content: "Hai thí sinh cùng tranh tài qua các câu hỏi Toán, Tiếng Việt và Tiếng Anh." },
      { property: "og:title", content: "Đấu Trường Trí Tuệ – Bé Vui Học" },
      { property: "og:description", content: "Sân chơi kiến thức dành cho hai thí sinh." },
    ],
  }),
  component: () => <GameShell>{(profile) => <ArenaBattle currentGrade={profile.grade} onExit={() => window.history.back()} />}</GameShell>,
});
