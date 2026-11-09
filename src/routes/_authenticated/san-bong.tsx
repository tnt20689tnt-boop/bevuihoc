import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";
import { FootballGame } from "@/game/FootballGame";

export const Route = createFileRoute("/_authenticated/san-bong")({
  head: () => ({
    meta: [
      { title: "Sút bóng ghi bàn – Bé Học Vui" },
      { name: "description", content: "Trò chơi sút bóng penalty 2D dành cho bé." },
      { property: "og:title", content: "Sút bóng ghi bàn – Bé Học Vui" },
      { property: "og:description", content: "Chọn góc sút, vượt qua thủ môn và ghi bàn." },
    ],
  }),
  component: () => <GameShell>{(profile) => <FootballGame profile={profile} />}</GameShell>,
});
