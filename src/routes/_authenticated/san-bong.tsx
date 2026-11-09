import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/san-bong")({
  head: () => ({
    meta: [
      { title: "Sân bóng Toán học – Thế Giới Học Tập Vui Nhộn" },
      { name: "description", content: "Sân bóng Toán học trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:title", content: "Sân bóng Toán học – Thế Giới Học Tập Vui Nhộn" },
      { property: "og:description", content: "Sân bóng Toán học trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon icon="⚽" title="Sân bóng Toán học" />,
});
