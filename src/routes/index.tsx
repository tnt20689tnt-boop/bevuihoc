import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/campus-hero.webp";
import { GoogleButton } from "@/components/GoogleButton";
import { useSession } from "@/hooks/use-player";
import { ROOMS } from "@/game/rooms";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bé Học Vui – Thành phố học tập 3D" },
      {
        name: "description",
        content:
          "Khám phá ngôi trường 3D, học Toán, Tiếng Việt, Tiếng Anh và vui chơi an toàn cùng bạn bè.",
      },
      { property: "og:title", content: "Bé Học Vui – Thành phố học tập 3D" },
      {
        property: "og:description",
        content: "Một thế giới 3D đầy màu sắc để học sinh tiểu học vừa học vừa khám phá.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const ROOM_CARDS = (["math", "vietnamese", "english", "girls", "boys"] as const).map(
  (id) => ROOMS[id],
);

const HIGHLIGHTS = [
  { icon: "🧑‍🤝‍🧑", title: "Gặp gỡ bạn bè", text: "Cùng khám phá sân trường 3D và nhìn thấy các bạn đang học." },
  { icon: "🧠", title: "Học qua trò chơi", text: "Câu hỏi ngắn, gợi ý dễ hiểu và phần thưởng sau mỗi thử thách." },
  { icon: "🛡️", title: "Không gian an toàn", text: "Ưu tiên biệt danh, tương tác có kiểm soát và không chat tự do." },
];

function Landing() {
  const session = useSession();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7fbff] text-slate-800">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-[34rem] bg-[radial-gradient(ellipse_at_15%_5%,#d6f2ff_0%,transparent_48%),radial-gradient(ellipse_at_85%_0%,#fff0c9_0%,transparent_42%)]" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Bé Học Vui - Trang chủ">
          <span className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-gradient-to-br from-amber-300 to-orange-400 text-3xl shadow-[0_7px_0_#d78a39]">🌈</span>
          <span>
            <span className="block font-display text-xl font-extrabold leading-none tracking-tight text-slate-900">BÉ HỌC VUI</span>
            <span className="mt-1 block text-[10px] font-extrabold uppercase tracking-[.22em] text-emerald-700">Learn · Play · Grow</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-extrabold text-slate-600 md:flex">
          <a href="#kham-pha" className="transition hover:text-emerald-700">Khám phá</a>
          <a href="#trai-nghiem" className="transition hover:text-emerald-700">Trải nghiệm</a>
          <a href="#an-toan" className="transition hover:text-emerald-700">An toàn</a>
        </nav>
        {session ? (
          <Button asChild variant="game" size="lg"><Link to="/the-gioi">Vào sân trường ↗</Link></Button>
        ) : (
          <Button asChild variant="toy"><Link to="/auth">Đăng nhập</Link></Button>
        )}
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-8 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:pb-24 lg:pt-12">
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/85 px-4 py-2 text-xs font-extrabold tracking-wide text-emerald-800 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            NGÔI TRƯỜNG 3D DÀNH CHO BÉ LỚP 1–5
          </div>
          <h1 className="mt-7 max-w-2xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-slate-900 sm:text-6xl xl:text-7xl">
            Mỗi ngày đến trường là một <span className="relative inline-block text-emerald-600">cuộc phiêu lưu<span className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-amber-300/80" /></span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Bước vào thế giới 3D đầy màu sắc. Bé tự do khám phá lớp học, giải câu đố, kết bạn và nhận những ngôi sao chăm học.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {session ? (
              <Button asChild variant="game" size="xl"><Link to="/the-gioi">🚀 Khám phá ngay</Link></Button>
            ) : <GoogleButton />}
            <a href="#kham-pha" className="rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 font-display font-extrabold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300">Xem các khu học tập ↓</a>
          </div>
          {!session && <p className="mt-4 max-w-md text-xs leading-5 text-slate-500">Phụ huynh đăng nhập để tạo nhân vật cho bé. Không hiển thị email trong thế giới trò chơi.</p>}
          <div className="mt-10 flex flex-wrap gap-6 border-t border-slate-200/80 pt-6">
            <div><strong className="block font-display text-2xl font-extrabold text-slate-900">3 môn</strong><span className="text-xs font-bold text-slate-500">Học tập cốt lõi</span></div>
            <div className="h-10 w-px bg-slate-200" />
            <div><strong className="block font-display text-2xl font-extrabold text-slate-900">5 khu</strong><span className="text-xs font-bold text-slate-500">Khám phá mỗi ngày</span></div>
            <div className="h-10 w-px bg-slate-200" />
            <div><strong className="block font-display text-2xl font-extrabold text-slate-900">3D</strong><span className="text-xs font-bold text-slate-500">Thế giới tương tác</span></div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-3xl">
          <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-emerald-200/60 via-sky-100/70 to-amber-100/70 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2.2rem] border-[7px] border-white bg-white shadow-[0_28px_80px_-30px_rgba(34,75,93,.4)]">
            <img src={heroImg} alt="Khuôn viên trường học 3D đầy màu sắc trong Bé Học Vui" width={1600} height={912} fetchPriority="high" className="aspect-[1.55] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/55 to-transparent p-5 pt-20 sm:p-7 sm:pt-24">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-xs font-extrabold text-emerald-900 shadow-lg">✨ Sân trường đang chờ bé</div>
            </div>
          </div>
          <div className="absolute -left-4 top-8 hidden -rotate-6 items-center gap-2 rounded-2xl border-4 border-white bg-amber-300 px-4 py-3 font-display font-extrabold text-amber-950 shadow-xl sm:flex">⭐ Học vui mỗi ngày</div>
          <div className="absolute -bottom-5 -right-2 flex items-center gap-3 rounded-2xl border-4 border-white bg-white px-4 py-3 shadow-xl sm:-right-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-2xl">🏆</span>
            <span><strong className="block font-display text-sm font-extrabold text-slate-900">Nỗ lực là tỏa sáng!</strong><small className="text-xs font-semibold text-slate-500">Mỗi thử thách một thành tựu</small></span>
          </div>
        </div>
      </section>

      <section id="kham-pha" className="relative z-10 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-700">THE CAMPUS</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">Một ngôi trường, thật nhiều điều hay</h2>
              <p className="mt-3 max-w-2xl text-slate-500">Chọn điểm đến yêu thích và bắt đầu hành trình của riêng bé.</p>
            </div>
            <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-extrabold text-amber-800">🎒 5 khu trải nghiệm</span>
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {ROOM_CARDS.map((room, index) => (
              <Link key={room.id} to={session ? "/the-gioi" : "/auth"} aria-label={`Khám phá khu ${room.short}`} className="group block overflow-hidden rounded-[1.6rem] border border-slate-100 bg-[#fbfdff] shadow-[0_8px_28px_-18px_rgba(29,55,75,.28)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_38px_-18px_rgba(29,55,75,.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">
                <div className="relative overflow-hidden">
                  <img src={room.image} alt={room.name} loading="lazy" width={816} height={816} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">0{index + 1}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-extrabold text-slate-900">{room.emoji} {room.short}</h3>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{room.blurb}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-extrabold text-emerald-700"><span>Khám phá khu này</span><span className="transition group-hover:translate-x-1">↗</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="trai-nghiem" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-700">LEARN BY PLAYING</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">Học mà chơi.<br />Chơi mà tiến bộ.</h2>
          <p className="mt-4 leading-7 text-slate-600">Không chỉ là những bài tập trên màn hình — bé được bước đi, khám phá và tương tác trong một khuôn viên trường học sống động.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <article key={item.title} className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-2xl">{item.icon}</span>
              <h3 className="mt-4 font-display text-lg font-extrabold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="an-toan" className="mx-5 mb-12 overflow-hidden rounded-[2rem] bg-[#173c43] text-white shadow-xl sm:mx-auto sm:max-w-7xl">
        <div className="grid items-center gap-6 px-7 py-9 sm:px-12 sm:py-12 lg:grid-cols-[1fr_auto]">
          <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-300">A SAFE PLACE TO GROW</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Mỗi bé đều có thể tỏa sáng 🌟</h2><p className="mt-3 max-w-2xl leading-7 text-emerald-50/75">Bé Học Vui hướng tới một môi trường học tập tích cực, thân thiện và phù hợp với học sinh tiểu học.</p></div>
          {session ? <Button asChild variant="game" size="xl"><Link to="/the-gioi">Vào thế giới 3D ↗</Link></Button> : <Button asChild variant="toy"><Link to="/auth">Bắt đầu hành trình ↗</Link></Button>}
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 pb-8 text-xs font-semibold text-slate-400 lg:px-8"><span>© {new Date().getFullYear()} BÉ HỌC VUI</span><span>Học tập · Khám phá · Trưởng thành</span></footer>
    </main>
  );
}
