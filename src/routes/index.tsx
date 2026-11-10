import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-player";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Bé Học Vui - Trường Học & Khu Vui Chơi 3D" },
      {
        name: "description",
        content:
          "Khám phá trường học 3D và khu vui chơi tương tác dành cho bé với xích đu, cầu trượt, nhà bóng và nhiều trò chơi hấp dẫn.",
      },
      { name: "robots", content: "index, follow" },
      {
        property: "og:title",
        content: "Bé Học Vui - Trường Học & Khu Vui Chơi 3D",
      },
      {
        property: "og:description",
        content: "Khám phá trường học 3D và khu vui chơi tương tác dành cho bé.",
      },
      { property: "og:url", content: "https://bevuihoc.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://bevuihoc.lovable.app/" }],
  }),
  component: GameEntry,
});

function GameEntry() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session === undefined) return;
    navigate({ to: session ? "/nhan-vat" : "/auth", replace: true });
  }, [session, navigate]);

  return (
    <main className="grid h-dvh min-h-[360px] place-items-center bg-[linear-gradient(145deg,#e8f7ff,#fff4d8)]">
      <div className="text-center">
        <div className="animate-bounce text-6xl">🎒</div>
        <p className="mt-4 font-display text-xl font-extrabold text-slate-700">Đang mở cổng trường…</p>
      </div>
    </main>
  );
}
