import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMyProfile } from "@/hooks/use-player";
import { AvatarBadge } from "@/components/AvatarBadge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/ho-so")({
  head: () => ({
    meta: [
      { title: "Hồ sơ của bé – Bé Học Vui" },
      { name: "description", content: "Thông tin cá nhân và nhân vật học tập của bé." },
    ],
  }),
  component: ChildProfilePage,
});

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
        <span className="text-xl">{icon}</span>{label}
      </div>
      <p className="mt-2 text-lg font-black text-slate-800">{value}</p>
    </div>
  );
}

function ChildProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useMyProfile();
  const [email, setEmail] = useState("");

  useEffect(() => {
    let alive = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (alive) setEmail(data.user?.email ?? "");
    });
    return () => { alive = false; };
  }, []);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[linear-gradient(145deg,#e8f8ff,#fff8e9)] p-5">
        <p className="font-black text-sky-800">🎒 Đang tải hồ sơ của bé…</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="grid min-h-screen place-items-center bg-[linear-gradient(145deg,#e8f8ff,#fff8e9)] p-5">
        <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="text-5xl">😥</div>
          <h1 className="mt-3 text-2xl font-black text-slate-800">Chưa tải được hồ sơ</h1>
          <p className="mt-2 text-slate-600">Bé thử tải lại nhé!</p>
          <button onClick={() => void refetch()} className="mt-5 rounded-xl bg-orange-500 px-6 py-3 font-black text-white">Thử lại</button>
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-[linear-gradient(145deg,#e8f8ff,#fff8e9)] p-5">
        <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="text-5xl">🧒</div>
          <h1 className="mt-3 text-2xl font-black text-slate-800">Bé chưa tạo hồ sơ</h1>
          <p className="mt-2 text-slate-600">Hãy tạo tên và nhân vật để bắt đầu hành trình học tập nhé!</p>
          <Link to="/nhan-vat" className="mt-5 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-black text-white">Tạo hồ sơ ngay</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_12%_0%,#d8f4ff_0%,transparent_38%),radial-gradient(ellipse_at_90%_5%,#ffedcf_0%,transparent_35%),linear-gradient(145deg,#f5fbff,#e8f8f1)] px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 text-center">
          <div className="text-5xl">🌟</div>
          <p className="mt-3 text-xs font-black uppercase tracking-[.22em] text-emerald-700">Bé Học Vui · Hồ sơ học sinh</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Hồ sơ của bé</h1>
          <p className="mt-2 text-slate-600">Đây là thông tin bé đã đăng ký khi bước vào trường học 3D.</p>
        </header>

        <section className="overflow-hidden rounded-[2rem] border-4 border-white bg-white/95 shadow-[0_24px_70px_-32px_rgba(35,74,83,.35)]">
          <div className="bg-gradient-to-r from-sky-100 via-emerald-50 to-amber-100 px-6 py-8 text-center">
            <div className="mx-auto grid h-36 w-36 place-items-center rounded-full bg-white ring-8 ring-white/70 shadow-lg">
              <AvatarBadge avatar={profile.avatar} size={124} />
            </div>
            <h2 className="mt-5 text-3xl font-black text-slate-900">{profile.display_name}</h2>
            <p className="mt-1 font-bold text-slate-600">{profile.gender === "girl" ? "👧 Bé gái" : "👦 Bé trai"} · Lớp {profile.grade}</p>
          </div>

          <div className="p-5 sm:p-8">
            <h3 className="mb-4 text-lg font-black text-slate-800">📋 Thông tin của bé</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard icon="🧒" label="Tên nhân vật" value={profile.display_name} />
              <InfoCard icon="⚧️" label="Giới tính" value={profile.gender === "girl" ? "Bé gái" : "Bé trai"} />
              <InfoCard icon="🎒" label="Lớp đang học" value={`Lớp ${profile.grade}`} />
              <InfoCard icon="📧" label="Email phụ huynh" value={email || "Chưa có thông tin"} />
            </div>
            <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              ⭐ Hồ sơ hiện lưu tên nhân vật, giới tính, lớp học và diện mạo của bé. Ngày sinh/tuổi chưa được thu thập trong biểu mẫu đăng ký hiện tại nên chưa hiển thị để tránh thông tin sai.
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/nhan-vat" className="inline-flex flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 font-black text-white shadow-[0_4px_0_#16866e]">✏️ Chỉnh sửa hồ sơ / nhân vật</Link>
              <Link to="/the-gioi" className="inline-flex flex-1 items-center justify-center rounded-2xl bg-orange-500 px-5 py-4 font-black text-white shadow-[0_4px_0_#c94c22]">🏫 Quay lại sân trường</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
