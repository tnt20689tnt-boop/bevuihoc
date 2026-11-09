import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/the-gioi")({
  head: () => ({
    meta: [
      { title: "Thế giới online – Thế Giới Học Tập Vui Nhộn" },
      { name: "description", content: "Thế giới online trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:title", content: "Thế giới online – Thế Giới Học Tập Vui Nhộn" },
      { property: "og:description", content: "Thế giới online trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon icon="🌍" title="Thế giới online" />,
});
