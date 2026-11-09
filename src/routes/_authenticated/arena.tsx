import { createFileRoute } from "@tanstack/react-router";
import ArenaBattle from "@/game/ArenaBattle";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/arena")({
  head: () => ({
    meta: [
      { title: "Đấu Trường Tri Thức – Bé Vui Học" },
      { name: "description", content: "Đấu trường nhiều người chơi: tự động lên bục, đếm ngược và thi câu hỏi ngẫu nhiên Toán, Tiếng Việt, Tiếng Anh." },
      { property: "og:title", content: "Đấu Trường Trí Tuệ – Bé Vui Học" },
      { property: "og:description", content: "Các bé cùng lên bục thi đấu và nhận câu hỏi ngẫu nhiên." },
    ],
  }),
  component: () => <GameShell>{(profile) => <ArenaBattle currentGrade={profile.grade} profile={profile} onExit={() => window.history.back()} />}</GameShell>,
});
