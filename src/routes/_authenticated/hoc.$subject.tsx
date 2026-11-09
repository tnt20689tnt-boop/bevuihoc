import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/hoc/$subject")({
  head: () => ({
    meta: [
      { title: "Phòng học – Thế Giới Học Tập Vui Nhộn" },
      { name: "description", content: "Phòng học trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:title", content: "Phòng học – Thế Giới Học Tập Vui Nhộn" },
      { property: "og:description", content: "Phòng học trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon icon="📚" title="Phòng học" />,
});
