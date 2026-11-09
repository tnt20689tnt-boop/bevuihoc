import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/thi-dau")({
  head: () => ({
    meta: [
      { title: "Thi đấu cùng bạn – Thế Giới Học Tập Vui Nhộn" },
      { name: "description", content: "Thi đấu cùng bạn trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:title", content: "Thi đấu cùng bạn – Thế Giới Học Tập Vui Nhộn" },
      { property: "og:description", content: "Thi đấu cùng bạn trong Thế Giới Học Tập Vui Nhộn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon icon="⚔️" title="Thi đấu cùng bạn" />,
});
