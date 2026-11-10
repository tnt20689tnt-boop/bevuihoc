import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-player";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Bé Vui Học - Học Online Toán, Tiếng Anh Lớp 1 Đến Lớp 5" },
      {
        name: "description",
        content:
          "Nền tảng học online thông minh dành cho trẻ từ lớp 1 đến lớp 5. Cung cấp tài liệu, bài tập tương tác môn Toán và Tiếng Anh giúp bé vừa học vừa vui.",
      },
      {
        property: "og:title",
        content: "Bé Vui Học - Học Online Toán, Tiếng Anh Lớp 1-5",
      },
      {
        property: "og:description",
        content:
          "Nền tảng học online thông minh cho trẻ tiểu học. Tài liệu và bài tập tương tác Toán, Tiếng Anh.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bevuihoc.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://bevuihoc.lovable.app/" },
    ],
  }),
  component: EntryRedirect,
});

function EntryRedirect() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session === undefined) return;
    void navigate({ to: session ? "/the-gioi" : "/auth", replace: true });
  }, [session, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(145deg,#e8f8ff,#fff8e9)] px-5">
      <div className="text-center">
        <div className="animate-bounce text-6xl">🎒</div>
        <p className="mt-4 text-lg font-black text-emerald-800">Đang mở Bé Học Vui…</p>
      </div>
    </main>
  );
}
