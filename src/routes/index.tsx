import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/campus-hero.webp";
import { GoogleButton } from "@/components/GoogleButton";
import { useSession } from "@/hooks/use-player";
import { ROOMS } from "@/game/rooms";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thế Giới Học Vui – Khuôn viên 3D cho bé lớp 1–5" },
      {
        name: "description",
        content:
          "Bước qua cổng trường 3D, bé khám phá phòng Toán, Tiếng Việt, Tiếng Anh và các khu vui chơi an toàn.",
      },
      { property: "og:title", content: "Thế Giới Học Vui – Khuôn viên 3D" },
      {
        property: "og:description",
        content:
          "Khám phá sân trường 3D đầy màu sắc, học ba môn và vui chơi trong không gian an toàn.",
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

function Landing() {
  const session = useSession();
  return (
    <div className="min-h-screen bg-gradient-sky">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-sunny text-2xl shadow-chunky">
            🌈
          </span>
          <span className="font-display text-xl font-extrabold text-foreground">
            Thế Giới <span className="text-primary">Học Vui</span>
          </span>
        </div>
        {session ? (
          <Button asChild variant="game" size="lg">
            <Link to="/the-gioi">Vào thế giới</Link>
          </Button>
        ) : (
          <Button asChild variant="toy">
            <Link to="/auth">Đăng nhập</Link>
          </Button>
        )}
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-4 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 font-display text-sm font-bold text-primary shadow-chunky">
            ✨ Dành cho bé lớp 1 đến lớp 5
          </p>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] text-foreground sm:text-6xl">
            Thế Giới Học Tập
            <br />
            <span className="text-primary">Vui Nhộn</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Bước qua cổng trường, chọn một tòa nhà để khám phá. Mỗi câu Toán, Tiếng Việt hay Tiếng
            Anh đúng sẽ giúp bé gom thêm sao!
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {session ? (
              <Button asChild variant="game" size="xl">
                <Link to="/the-gioi">🚀 Vào thế giới</Link>
              </Button>
            ) : (
              <GoogleButton />
            )}
          </div>
          {!session && (
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Phụ huynh đăng nhập bằng tài khoản Google để tạo nhân vật cho bé. Bé dùng tên nhân
              vật, không hiển thị email hay tên thật.
            </p>
          )}
        </div>
        <div className="relative">
          <img
            src={heroImg}
            alt="Hai bạn nhỏ vẫy tay giữa khuôn viên trường học 3D với các tòa nhà nhiều màu sắc"
            width={1600}
            height={912}
            className="w-full rounded-[2rem] border-4 border-card shadow-soft"
          />
          <div className="absolute -bottom-5 left-6 rounded-2xl bg-card px-4 py-2 font-display font-bold shadow-chunky">
            👋 Xin chào bạn!
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-center text-3xl font-extrabold text-foreground">
          5 khu khám phá trong sân trường
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ROOM_CARDS.map((r) => (
            <div key={r.id} className="toy-card overflow-hidden">
              <img
                src={r.image}
                alt={r.name}
                loading="lazy"
                width={816}
                height={816}
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <h3 className="font-display text-lg font-bold">
                  {r.emoji} {r.short}
                </h3>
                <p className="text-sm text-muted-foreground">{r.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-3">
        {[
          [
            "🧑‍🤝‍🧑",
            "Chơi cùng bạn bè",
            "Nhìn thấy nhau, vẫy tay, chúc mừng nhau bằng câu chào có sẵn — không có trò chuyện tự do.",
          ],
          [
            "🏆",
            "Bảng xếp hạng thật",
            "Điểm được máy chủ kiểm tra. Xếp hạng theo ngày, tuần, tháng và từng lớp.",
          ],
          [
            "👑",
            "Sảnh vinh danh",
            "Top 3 mỗi kỳ được đứng trên bục vinh quang với pháo hoa rực rỡ.",
          ],
        ].map(([icon, t, d]) => (
          <div key={t} className="toy-card p-5">
            <div className="text-4xl">{icon}</div>
            <h3 className="mt-2 font-display text-xl font-bold">{t}</h3>
            <p className="text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
