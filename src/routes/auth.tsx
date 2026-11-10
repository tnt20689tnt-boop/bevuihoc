import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GoogleButton } from "@/components/GoogleButton";
import { AppleButton } from "@/components/AppleButton";
import { useSession } from "@/hooks/use-player";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Đăng nhập – Bé Học Vui" },
      { name: "description", content: "Phụ huynh đăng nhập để bé tạo nhân vật và bước vào trường học 3D." },
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
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_15%_10%,#d8f4ff_0%,transparent_38%),radial-gradient(ellipse_at_90%_0%,#fff0c9_0%,transparent_38%),linear-gradient(145deg,#f5fbff,#e8f8f1)] px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#83b9a7 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
      <section className="relative w-full max-w-[460px] overflow-hidden rounded-[2rem] border-4 border-white bg-white/95 p-7 text-center shadow-[0_28px_80px_-28px_rgba(35,74,83,.38)] sm:p-10">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-300" />
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-gradient-to-br from-amber-200 to-orange-300 text-5xl shadow-[0_7px_0_#d98e43]">🎒</div>
        <p className="mt-7 text-xs font-black uppercase tracking-[.24em] text-emerald-700">BÉ HỌC VUI · TRƯỜNG HỌC 3D</p>
        <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Chào mừng trở lại!</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">Phụ huynh đăng nhập trước, sau đó bé tự chọn tên, kiểu tóc, trang phục và tạo nhân vật của mình.</p>
        <div className="my-7 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-left">
          <p className="font-extrabold text-emerald-950">🌟 Hành trình của bé</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-600">
            <div className="rounded-xl bg-white p-3"><span className="block text-2xl">🔐</span>Đăng nhập</div>
            <div className="rounded-xl bg-white p-3"><span className="block text-2xl">🧒</span>Tạo nhân vật</div>
            <div className="rounded-xl bg-white p-3"><span className="block text-2xl">🏫</span>Vào trường</div>
          </div>
        </div>
        <div className="space-y-3">
          <GoogleButton className="w-full justify-center" label="Đăng nhập bằng Google" />
          <AppleButton className="w-full justify-center" />
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">Tài khoản phụ huynh dùng để lưu hồ sơ và thành tích. Bé xuất hiện trong game bằng tên nhân vật.</p>
      </section>
    </main>
  );
}
