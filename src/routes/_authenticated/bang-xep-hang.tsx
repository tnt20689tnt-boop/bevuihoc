import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/bang-xep-hang")({
  head: () => ({
    meta: [
      { title: "Bảng xếp hạng – Thế Giới Học Tập Vui Nhộn" },
      { name: "description", content: "Bảng xếp hạng trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:title", content: "Bảng xếp hạng – Thế Giới Học Tập Vui Nhộn" },
      { property: "og:description", content: "Bảng xếp hạng trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon icon="🏆" title="Bảng xếp hạng" />,
});
