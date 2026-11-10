import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  // Keep this route client-rendered to avoid SSR failures from browser-only app dependencies.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Bé Học Vui - Trường Học 3D Và Khu Vui Chơi Cho Bé" },
      {
        name: "description",
        content:
          "Bé Học Vui là thế giới trường học 3D tương tác dành cho trẻ em: khám phá lớp học, học Toán, Tiếng Việt, Tiếng Anh và vui chơi với xích đu, cầu trượt, nhà bóng.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Bé Học Vui - Trường Học 3D Và Khu Vui Chơi Cho Bé" },
      {
        property: "og:description",
        content:
          "Cùng bé khám phá trường học 3D, học tập qua trò chơi và vui chơi trong khuôn viên đầy màu sắc.",
      },
      { property: "og:url", content: "https://bevuihoc.lovable.app/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://bevuihoc.lovable.app/" }],
  }),
  component: HomePage,
});

const learningAreas = [
  {
    icon: "➕",
    title: "Toán học",
    description: "Làm quen với con số, phép tính và tư duy logic qua hoạt động tương tác.",
    cardClass: "bg-gradient-to-br from-sky-100 to-blue-50",
  },
  {
    icon: "📚",
    title: "Tiếng Việt",
    description: "Luyện đọc, nhận biết từ ngữ và phát triển khả năng ngôn ngữ.",
    cardClass: "bg-gradient-to-br from-rose-100 to-pink-50",
  },
  {
    icon: "🌍",
    title: "Tiếng Anh",
    description: "Khám phá từ vựng và kiến thức tiếng Anh theo cách gần gũi.",
    cardClass: "bg-gradient-to-br from-amber-100 to-yellow-50",
  },
];

const playgroundActivities = [
  ["🛝", "Cầu trượt"],
  ["🎠", "Vòng quay"],
  ["🪁", "Xích đu"],
  ["⚽", "Trò chơi vận động"],
  ["🏠", "Nhà vui chơi"],
  ["🧸", "Khu vui chơi khám phá"],
];

function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5fbff] text-slate-800">
      <header className="relative z-10 border-b border-sky-100 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <a href="/" className="flex items-center gap-3" aria-label="Bé Học Vui - Trang chủ">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-3xl">🎒</span>
            <span>
              <span className="block font-display text-xl font-black text-slate-900">Bé Học Vui</span>
              <span className="block text-xs font-semibold text-slate-500">Học tập · Khám phá · Vui chơi</span>
            </span>
          </a>
          <Link
            to="/auth"
            className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
          >
            Đăng nhập
          </Link>
        </div>
      </header>

      <section className="relative isolate">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_10%,#d9f3ff_0%,transparent_42%),radial-gradient(ellipse_at_90%_20%,#fff0c9_0%,transparent_38%),linear-gradient(135deg,#f4fbff,#f0fff7)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_.9fr] md:py-24">
          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-extrabold text-emerald-700">
              🌈 Thế giới học tập 3D dành cho bé
            </span>
            <h1 className="mt-6 max-w-2xl font-display text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Mỗi ngày đến trường là một <span className="text-emerald-600">chuyến phiêu lưu!</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Bé Học Vui mang đến một ngôi trường 3D đầy màu sắc, nơi trẻ có thể khám phá lớp học,
              làm quen với Toán, Tiếng Việt, Tiếng Anh và vui chơi trong khuôn viên sinh động.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="rounded-2xl bg-emerald-600 px-7 py-4 text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Bắt đầu khám phá →
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-500">Phụ huynh đăng nhập để tạo hồ sơ và lưu hành trình của bé.</p>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-sky-200 via-white to-amber-100 blur-xl" />
            <div className="relative rounded-[2.5rem] border-8 border-white bg-gradient-to-br from-sky-100 via-white to-emerald-100 p-7 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-sky-800">🏫 Ngôi trường của bé</span>
                <span className="text-3xl">☀️</span>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-rose-200 p-4 text-center"><div className="text-4xl">📖</div><p className="mt-2 text-xs font-black text-rose-900">Lớp học</p></div>
                <div className="rounded-2xl bg-amber-200 p-4 text-center"><div className="text-4xl">🛝</div><p className="mt-2 text-xs font-black text-amber-900">Sân chơi</p></div>
                <div className="rounded-2xl bg-emerald-200 p-4 text-center"><div className="text-4xl">🌳</div><p className="mt-2 text-xs font-black text-emerald-900">Khám phá</p></div>
              </div>
              <div className="mt-5 rounded-3xl bg-white/90 p-5 text-center shadow-lg">
                <div className="text-6xl">🧒🏻 👧🏻</div>
                <p className="mt-3 font-display text-xl font-black text-slate-800">Học vui mỗi ngày!</p>
                <p className="mt-1 text-sm text-slate-500">Học tập kết hợp khám phá và vận động</p>
              </div>
              <div className="mt-5 flex justify-center gap-4 text-3xl" aria-hidden="true">🌼 🦋 🌈 🌻</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 text-center">
        <div className="rounded-[2rem] bg-gradient-to-r from-sky-100 via-emerald-100 to-amber-100 px-6 py-12 sm:px-12">
          <div className="text-5xl">🎒 ✨ 🏫</div>
          <h2 className="mt-5 font-display text-3xl font-black text-slate-900 sm:text-4xl">Sẵn sàng mở cánh cổng trường chưa?</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">Phụ huynh đăng nhập để bé tạo nhân vật và bắt đầu hành trình học tập, khám phá thế giới Bé Học Vui.</p>
          <Link to="/auth" className="mt-7 inline-flex rounded-2xl bg-emerald-600 px-8 py-4 font-black text-white shadow-xl shadow-emerald-200 hover:bg-emerald-700">Bắt đầu ngay →</Link>
        </div>
      </section>

      <footer className="border-t border-sky-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p><span className="font-black text-slate-800">Bé Học Vui</span> · Thế giới học tập và vui chơi 3D</p>
          <div className="text-right">
            <p className="font-extrabold text-slate-700">Mr Toàn Prodution (TNT20689TNT)</p>
            <p className="text-xs text-slate-500">Tác giả & phát triển Bé Học Vui</p>
            <p>© {new Date().getFullYear()} Bé Học Vui. Cùng bé học hỏi mỗi ngày.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
