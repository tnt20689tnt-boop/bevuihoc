import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/quan-tri")({
  head: () => ({
    meta: [
      { title: "Quản trị – Thế Giới Học Tập Vui Nhộn" },
      { name: "description", content: "Quản trị trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:title", content: "Quản trị – Thế Giới Học Tập Vui Nhộn" },
      { property: "og:description", content: "Quản trị trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon icon="🛡️" title="Quản trị" />,
});
