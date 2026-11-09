import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { WorldExperience } from "@/game/WorldExperience";
import { defaultAvatar } from "@/lib/avatar";
import type { Profile } from "@/hooks/use-player";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Bé Học Vui – Thế giới trường học 3D" },
      {
        name: "description",
        content: "Bước thẳng vào khuôn viên trường học 3D, tự do di chuyển, khám phá lớp học và gặp gỡ bạn bè.",
      },
      { property: "og:title", content: "Bé Học Vui – Thế giới trường học 3D" },
      {
        property: "og:description",
        content: "Khám phá sân trường 3D, các phòng học và hoạt động dành cho học sinh tiểu học.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GameEntry,
});

function GameEntry() {
  const [profile] = useState<Profile>(() => ({
    id: `guest-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`,
    display_name: "Bạn nhỏ",
    gender: "boy",
    grade: 1,
    avatar: defaultAvatar("boy"),
  }));

  return (
    <main className="h-dvh min-h-[480px] w-full overflow-hidden bg-sky-100">
      <WorldExperience profile={profile} />
    </main>
  );
}
