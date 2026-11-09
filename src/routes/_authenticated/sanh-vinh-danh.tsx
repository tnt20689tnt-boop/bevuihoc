import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/sanh-vinh-danh")({
  head: () => ({
    meta: [
      { title: "Sảnh vinh danh – Thế Giới Học Tập Vui Nhộn" },
      { name: "description", content: "Sảnh vinh danh trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:title", content: "Sảnh vinh danh – Thế Giới Học Tập Vui Nhộn" },
      { property: "og:description", content: "Sảnh vinh danh trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon icon="👑" title="Sảnh vinh danh" />,
});
