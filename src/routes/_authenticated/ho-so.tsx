import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/ho-so")({
  head: () => ({
    meta: [
      { title: "Hồ sơ của bé – Thế Giới Học Tập Vui Nhộn" },
      { name: "description", content: "Hồ sơ của bé trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:title", content: "Hồ sơ của bé – Thế Giới Học Tập Vui Nhộn" },
      { property: "og:description", content: "Hồ sơ của bé trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon icon="⭐" title="Hồ sơ của bé" />,
});
