import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-player";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Bé Học Vui – Thế giới trường học 3D" },
      {
        name: "description",
        content: "Đăng nhập, tạo nhân vật của bé và khám phá trường học 3D.",
      },
    ],
  }),
  component: GameEntry,
});

function GameEntry() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session === undefined) return;
    navigate({ to: session ? "/the-gioi" : "/auth", replace: true });
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
