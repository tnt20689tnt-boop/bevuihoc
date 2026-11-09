import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/nhan-vat")({
  head: () => ({
    meta: [
      { title: "Tạo nhân vật – Thế Giới Học Tập Vui Nhộn" },
      { name: "description", content: "Tạo nhân vật trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:title", content: "Tạo nhân vật – Thế Giới Học Tập Vui Nhộn" },
      { property: "og:description", content: "Tạo nhân vật trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon icon="🧒" title="Tạo nhân vật" />,
});
