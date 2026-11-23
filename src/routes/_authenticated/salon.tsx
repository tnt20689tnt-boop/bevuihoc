import { createFileRoute } from "@tanstack/react-router";
import { PrincessSalon3D } from "@/game/PrincessSalon3D";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [
      { title: "Salon công chúa – Bé Học Vui" },
      {
        name: "description",
        content:
          "Trải nghiệm salon công chúa anime 3D với spa, makeup, tóc, váy áo, phụ kiện, làm móng và studio.",
      },
      { property: "og:title", content: "Salon công chúa – Bé Học Vui" },
      {
        property: "og:description",
        content: "Khám phá salon công chúa 3D lung linh trong thế giới Bé Học Vui.",
      },
    ],
  }),
  component: () => <GameShell>{(profile) => <PrincessSalon3D profile={profile} />}</GameShell>,
});
