import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [
      { title: "Salon làm đẹp – Thế Giới Học Tập Vui Nhộn" },
      { name: "description", content: "Salon làm đẹp trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:title", content: "Salon làm đẹp – Thế Giới Học Tập Vui Nhộn" },
      { property: "og:description", content: "Salon làm đẹp trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon icon="💄" title="Salon làm đẹp" />,
});
