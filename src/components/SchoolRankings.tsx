import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { TopBar } from "@/components/AppShell";
import { useMyProfile } from "@/hooks/use-player";
import { supabase } from "@/integrations/supabase/client";

type RankingMode = "arena" | "leaderboard" | "honor";
type PlayerRow = { id: string; display_name: string; grade: number; points: number; correct: number; goals: number };

const config = {
  arena: { icon: "⚔️", title: "Đấu trường thi đua", subtitle: "Cùng học tập, tích lũy điểm và vươn lên trên bảng thi đua." },
  leaderboard: { icon: "🏆", title: "Bảng xếp hạng", subtitle: "Thứ hạng được tính tự động từ điểm học tập thực tế của các bé." },
  honor: { icon: "👑", title: "Sảnh vinh danh", subtitle: "Tôn vinh những bạn chăm chỉ và có thành tích học tập nổi bật." },
};

export function SchoolRankings({ mode }: { mode: RankingMode }) {
  const { data: profile } = useMyProfile();
  const page = config[mode];
  const { data, isLoading, error } = useQuery({
    queryKey: ["school-rankings", profile?.id],
    queryFn: async (): Promise<PlayerRow[]> => {
      const [{ data: profiles, error: profileError }, { data: events, error: eventError }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, grade").limit(1000),
        supabase.from("point_events").select("user_id, points, correct, goals").limit(10000),
      ]);
      if (profileError) throw profileError;
      if (eventError) throw eventError;
      const totals = new Map<string, { points: number; correct: number; goals: number }>();
      for (const event of events ?? []) {
        const current = totals.get(event.user_id) ?? { points: 0, correct: 0, goals: 0 };
        current.points += event.points ?? 0;
        current.correct += event.correct ?? 0;
        current.goals += event.goals ?? 0;
        totals.set(event.user_id, current);
      }
      return (profiles ?? [])
        .map((student) => {
          const total = totals.get(student.id) ?? { points: 0, correct: 0, goals: 0 };
          return { id: student.id, display_name: student.display_name, grade: student.grade, ...total };
        })
        .filter((student) => student.points > 0 || student.id === profile?.id)
        .sort((a, b) => b.points - a.points || b.correct - a.correct || a.display_name.localeCompare(b.display_name, "vi"))
        .slice(0, 100);
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return (
    <div className="min-h-screen bg-gradient-sky">
      <TopBar profile={profile} />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        <div className="toy-card overflow-hidden p-5 sm:p-8">
          <div className="text-center">
            <div className="text-5xl">{page.icon}</div>
            <h1 className="mt-2 text-3xl font-extrabold text-foreground">{page.title}</h1>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{page.subtitle}</p>
          </div>

          {mode === "honor" && data && data.length > 0 && (
            <div className="mt-7 grid grid-cols-3 items-end gap-2 sm:gap-4">
              {[1, 0, 2].map((index) => {
                const student = data[index];
                if (!student) return <div key={index} />;
                return (
                  <div key={student.id} className={`rounded-2xl border p-3 text-center ${index === 0 ? "border-amber-400 bg-amber-50/80 py-6" : "border-border bg-muted/40 py-4"}`}>
                    <div className="text-3xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</div>
                    <div className="mt-2 truncate font-extrabold text-foreground">{student.display_name}</div>
                    <div className="text-xs text-muted-foreground">Lớp {student.grade}</div>
                    <div className="mt-1 font-extrabold text-primary">{student.points.toLocaleString("vi-VN")} điểm</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-7 overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] gap-2 bg-muted/70 px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground sm:grid-cols-[56px_minmax(0,1fr)_100px_110px]">
              <span>Hạng</span><span>Học sinh</span><span className="text-right">Điểm</span><span className="hidden text-right sm:block">Câu đúng</span>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Đang tải bảng xếp hạng…</div>
            ) : error ? (
              <div className="p-8 text-center text-destructive">Chưa tải được dữ liệu. Bé thử tải lại trang nhé.</div>
            ) : !data?.length ? (
              <div className="p-8 text-center text-muted-foreground">Chưa có điểm học tập. Bé hãy hoàn thành bài học đầu tiên để xuất hiện trên bảng nhé!</div>
            ) : data.map((student, index) => (
              <div key={student.id} className={`grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-2 border-t border-border px-3 py-3 sm:grid-cols-[56px_minmax(0,1fr)_100px_110px] ${student.id === profile?.id ? "bg-primary/10" : "bg-card"}`}>
                <span className="text-center text-lg font-extrabold">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}</span>
                <div className="min-w-0">
                  <div className="truncate font-bold text-foreground">{student.display_name}{student.id === profile?.id ? " (Bạn)" : ""}</div>
                  <div className="text-xs text-muted-foreground">Lớp {student.grade}</div>
                </div>
                <span className="text-right font-extrabold tabular-nums text-primary">{student.points.toLocaleString("vi-VN")}</span>
                <span className="hidden text-right text-sm tabular-nums text-muted-foreground sm:block">{student.correct.toLocaleString("vi-VN")}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Điểm được cộng từ các hoạt động học tập đã lưu.</span>
            <span>Cập nhật tự động khi tải lại bảng.</span>
          </div>
          <div className="mt-7 text-center">
            <Link to="/the-gioi" className="inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-chunky">← Trở về sân trường</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
