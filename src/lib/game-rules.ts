// Pure game rules shared by UI. Scoring itself is decided by the database (server-validated);
// these constants only mirror it for display.

export type Subject = "math" | "vietnamese" | "english";
export type SubjectOrMixed = Subject | "mixed";
export type Difficulty = "easy" | "medium" | "hard";

export const GRADES = [1, 2, 3, 4, 5] as const;

export const SUBJECTS: Record<SubjectOrMixed, { name: string; emoji: string; tone: string }> = {
  math: { name: "Toán học", emoji: "🔢", tone: "bg-math" },
  vietnamese: { name: "Tiếng Việt", emoji: "📖", tone: "bg-viet" },
  english: { name: "Tiếng Anh", emoji: "🌍", tone: "bg-eng" },
  mixed: { name: "Trộn tất cả", emoji: "🎲", tone: "bg-grape" },
};

export const DIFFICULTIES: Record<Difficulty, { name: string; emoji: string }> = {
  easy: { name: "Dễ", emoji: "🌱" },
  medium: { name: "Trung bình", emoji: "🌟" },
  hard: { name: "Khó", emoji: "🔥" },
};

/** Points for one correct answer, by difficulty (mirrors submit_answer). */
export const POINTS_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 20 };
/** Bonus for each correct answer once the streak reaches STREAK_BONUS_FROM. */
export const STREAK_BONUS = 5;
export const STREAK_BONUS_FROM = 3;
/** Bonus for finishing a round with at least COMPLETE_MIN_ANSWERS answers. */
export const COMPLETE_BONUS = 20;
export const COMPLETE_MIN_ANSWERS = 5;

/** Player level from lifetime points: level 2 at 50, 3 at 200, 4 at 450, 5 at 800 ... */
export function levelFromPoints(points: number): number {
  const p = Math.max(0, points);
  return 1 + Math.floor(Math.sqrt(p / 50));
}

/** Points needed to reach a level. */
export function pointsForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return 50 * (l - 1) * (l - 1);
}

export function levelProgress(points: number) {
  const level = levelFromPoints(points);
  const from = pointsForLevel(level);
  const to = pointsForLevel(level + 1);
  return { level, from, to, ratio: to === from ? 1 : (points - from) / (to - from) };
}

export const LEVEL_TITLES = [
  "Mầm non",
  "Hạt giống",
  "Chồi xanh",
  "Lá non",
  "Bông hoa",
  "Ngôi sao",
  "Siêu sao",
  "Nhà vô địch",
  "Huyền thoại",
];
export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.max(0, level - 1))];
}

export const PERIODS = {
  day: "Ngày",
  week: "Tuần",
  month: "Tháng",
} as const;
export type Period = keyof typeof PERIODS;

export function formatPeriod(type: Period, start: string): string {
  const d = new Date(start + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  if (type === "day") return `Ngày ${dd}/${mm}/${d.getFullYear()}`;
  if (type === "month") return `Tháng ${mm}/${d.getFullYear()}`;
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  return `Tuần ${dd}/${mm} – ${String(end.getDate()).padStart(2, "0")}/${String(end.getMonth() + 1).padStart(2, "0")}`;
}

export const REASONS: Record<string, string> = {
  correct: "Trả lời đúng",
  goal: "Ghi bàn",
  complete: "Hoàn thành lượt chơi",
  contest: "Thi đấu",
  admin: "Điều chỉnh",
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
