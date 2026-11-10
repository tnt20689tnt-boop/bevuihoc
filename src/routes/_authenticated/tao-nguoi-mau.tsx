import { createFileRoute } from "@tanstack/react-router";
import { PrincessSalon } from "@/game/PrincessSalon";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/tao-nguoi-mau")({
  head: () => ({
    meta: [
      { title: "Xưởng thiết kế người mẫu – Bé Học Vui" },
      { name: "description", content: "Thiết kế người mẫu anime, phối đồ và phụ kiện." },
    ],
  }),
  component: () => <GameShell>{(profile) => <PrincessSalon profile={profile} initialMode="model" />}</GameShell>,
});
