import { createFileRoute } from "@tanstack/react-router";
import { PrincessSalon } from "@/game/PrincessSalon";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [
      { title: "Salon công chúa – Bé Học Vui" },
      { name: "description", content: "Trò chơi trang điểm công chúa anime 2D." },
      { property: "og:title", content: "Salon công chúa – Bé Học Vui" },
      { property: "og:description", content: "Trang điểm công chúa anime trong thế giới Bé Học Vui." },
    ],
  }),
  component: () => <GameShell>{(profile) => <PrincessSalon profile={profile} />}</GameShell>,
});
