import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { TopBar } from "@/components/AppShell";
import { useMyProfile } from "@/hooks/use-player";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Arena results are not in the generated database types yet.
const untypedSupabase = supabase as unknown as SupabaseClient;

type RankingMode = "arena" | "leaderboard" | "honor";
type ArenaMatchRow = { match_id: string; player_a: string; player_b: string; winner: string | null; score_a: number; score_b: number; total_questions: number; grade: number; duration_seconds: number; created_at: string };
const formatDuration = (s: number) => s >= 60 ? `${Math.floor(s / 60)} phút ${s % 60} giây` : `${s} giây`;
type PlayerRow = { id: string; display_name: string; grade: number; points: number; correct: number; goals: number };

const config = {
  arena: { icon: "⚔️", title: "Đấu trường thi đua", subtitle: "Xem lịch sử từng trận, tỉ số và người chiến thắng của con." },
  leaderboard: { icon: "🏆", title: "Bảng xếp hạng", subtitle: "Thứ hạng được tính tự động từ điểm học tập thực tế của các bé." },
  honor: { icon: "👑", title: "Sảnh vinh danh", subtitle: "Tôn vinh những bạn chăm chỉ và có thành tích học tập nổi bật." },
};

export function SchoolRankings({ mode }: { mode: RankingMode }) {
  const { data: profile } = useMyProfile();
  const page = config[mode];
  const { data, isLoading, error } = useQuery({
    queryKey: ["school-rankings", profile?.id],
    enabled: mode !== "arena" && !!profile?.id,
    queryFn: async (): Promise<PlayerRow[]> => {
      const { data: rows, error: rankingError } = await supabase.rpc("get_school_ranking", { p_limit: 100 });
      if (rankingError) throw rankingError;
      return (rows ?? []).map((row) => ({
        id: row.id,
        display_name: row.display_name,
        grade: row.grade,
        points: Number(row.points ?? 0),
        correct: Number(row.correct ?? 0),
        goals: Number(row.goals ?? 0),
      }));
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: arenaMatches, isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ["arena-match-history", profile?.id],
    refetchInterval: 15000,
    enabled: mode === "arena" && !!profile?.id,
    queryFn: async () => {
      const { data, error } = await untypedSupabase.rpc("get_arena_matches", { p_limit: 50 });
      if (error) throw error;
      return (data ?? []) as ArenaMatchRow[];
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

          {mode === "arena" && (
            <section className="mt-7">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground">📋 Lịch sử thi đấu</h2>
                  <p className="text-sm text-muted-foreground">Các trận đấu 1v1 trực tiếp mới nhất của toàn trường.</p>
                </div>
                <span className="text-xs text-muted-foreground">Tự cập nhật mỗi 15 giây</span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border">
                {matchesLoading ? (
                  <div className="p-6 text-center text-muted-foreground">Đang tải kết quả thi đấu…</div>
                ) : matchesError ? (
                  <div className="p-6 text-center text-destructive">Chưa tải được lịch sử. Bé thử tải lại trang nhé.</div>
                ) : !arenaMatches?.length ? (
                  <div className="p-6 text-center text-muted-foreground">Chưa có trận đấu nào được lưu. Sau khi hoàn thành trận đầu tiên, kết quả và người chiến thắng sẽ xuất hiện ở đây.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {arenaMatches.map((match) => {
                      const draw = !match.winner;
                      const d = new Date(match.created_at);
                      return (
                        <div key={match.match_id} className="bg-card p-4">
                          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">⚔️ Trận đối kháng 1v1 • Lớp {match.grade}</div>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0 text-lg font-extrabold text-foreground">
                              <span className={draw ? "" : "text-primary"}>{draw ? "🤝 " : "👑 "}{match.player_a}{draw ? "" : " (Thắng)"}</span>
                              <span className="mx-2 text-muted-foreground">✕</span>
                              <span>{match.player_b}</span>
                            </div>
                            <div className="text-2xl font-black tabular-nums text-primary">{match.score_a} – {match.score_b}</div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>📅 {d.toLocaleDateString("vi-VN")} {d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                            <span>✅ {match.player_a}: {match.score_a}/{match.total_questions} câu</span>
                            <span>✅ {match.player_b}: {match.score_b}/{match.total_questions} câu</span>
                            <span>⏱️ {match.duration_seconds > 0 ? formatDuration(match.duration_seconds) : "—"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

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
