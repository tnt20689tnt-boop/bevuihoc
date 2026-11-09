import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GoogleButton } from "@/components/GoogleButton";
import { useSession } from "@/hooks/use-player";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Đăng nhập – Thế Giới Học Tập Vui Nhộn" },
      { name: "description", content: "Phụ huynh đăng nhập bằng Google để bé vào thế giới học tập." },
      { property: "og:title", content: "Đăng nhập – Thế Giới Học Tập Vui Nhộn" },
      { property: "og:description", content: "Phụ huynh đăng nhập bằng Google để bé vào thế giới học tập." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const session = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (session) navigate({ to: "/the-gioi", replace: true });
  }, [session, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-sky px-4">
      <div className="toy-card w-full max-w-md p-8 text-center">
        <div className="animate-float text-6xl">🎒</div>
        <h1 className="mt-3 text-3xl font-extrabold">Chào mừng bé!</h1>
        <p className="mt-2 text-muted-foreground">
          Nhờ bố mẹ đăng nhập bằng Google để tạo nhân vật và lưu điểm của bé nhé.
        </p>
        <div className="mt-6 flex justify-center">
          <GoogleButton />
        </div>
        <ul className="mt-6 space-y-1 text-left text-sm text-muted-foreground">
          <li>🔒 Bé chỉ hiển thị bằng tên nhân vật, không lộ email.</li>
          <li>💬 Chỉ dùng câu chào có sẵn, không có trò chuyện tự do.</li>
          <li>⭐ Điểm số do máy chủ chấm, không ai sửa được.</li>
        </ul>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  );
}
