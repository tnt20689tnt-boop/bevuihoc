import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-player";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Đăng nhập – Bé Học Vui" },
      { name: "description", content: "Đăng nhập, chọn bé trai hoặc bé gái và bắt đầu tại cổng trường Bé Học Vui." },
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
