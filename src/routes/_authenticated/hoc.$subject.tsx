import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";
import type { Profile } from "@/hooks/use-player";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Question = { prompt: string; choices: string[]; answer: number; hint: string };
type Subject = "math" | "vietnamese" | "english";
const SUBJECTS: Record<Subject, { title: string; emoji: string; intro: string }> = {
  math: { title: "Toán học", emoji: "🔢", intro: "Từ làm quen với số đến những phép tính thú vị." },
  vietnamese: { title: "Tiếng Việt", emoji: "📖", intro: "Học chữ, ghép vần, đọc từ và câu." },
  english: { title: "Tiếng Anh", emoji: "🌍", intro: "Học chữ cái, màu sắc, con vật và câu giao tiếp." },
};
const WORDS = [
  ["cat", "con mèo"], ["dog", "con chó"], ["apple", "quả táo"], ["book", "quyển sách"],
  ["sun", "mặt trời"], ["moon", "mặt trăng"], ["bird", "con chim"], ["fish", "con cá"],
  ["red", "màu đỏ"], ["blue", "màu xanh"], ["green", "màu xanh lá"], ["milk", "sữa"],
  ["pen", "bút mực"], ["bag", "cặp sách"], ["egg", "quả trứng"], ["cake", "bánh ngọt"],
  ["one", "số một"], ["two", "số hai"], ["three", "số ba"], ["four", "số bốn"],
  ["mother", "mẹ"], ["father", "bố"], ["school", "trường học"], ["friend", "bạn bè"],
  ["happy", "vui vẻ"], ["water", "nước"], ["flower", "bông hoa"], ["orange", "quả cam"],
];
const LETTERS = ["a", "ă", "â", "b", "c", "d", "đ", "e", "ê", "g", "h", "i", "k", "l", "m", "n", "o", "ô", "ơ", "p", "q", "r", "s", "t", "u", "ư", "v", "x", "y"];
const VI_WORDS = ["bé", "bà", "ba", "mẹ", "bố", "cá", "gà", "hoa", "nhà", "mèo", "chó", "bút", "vở", "sách", "trường", "bạn", "đẹp", "ngoan", "chăm", "học"];
const SHAPES = ["hình tròn", "hình vuông", "hình tam giác", "hình chữ nhật"];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}
function makeQuestions(subject: Subject, level: number, grade: number, seen: Set<string>): Question[] {
  // Khối lớp quyết định điểm xuất phát; mỗi 10 cấp lại tăng độ khó.
  const tier = Math.min(9, Math.floor((level - 1) / 10) + Math.max(0, grade - 1));
  const make = (prompt: string, answer: string, pool: string[], hint: string): Question => {
    const choices = shuffle([answer, ...shuffle([...new Set(pool.filter(v => v !== answer))]).slice(0, 3)]);
    return { prompt, choices, answer: choices.indexOf(answer), hint };
  };
  let questions: Question[] = [];
  if (subject === "math") {
    const max = [5, 10, 20, 30, 50, 100, 200, 500, 1000, 10000][tier]!;
    const a = 1 + Math.floor(Math.random() * Math.max(2, Math.floor(max / 2)));
    const b = 1 + Math.floor(Math.random() * Math.max(2, Math.floor(max / 2)));
    const big = Math.max(a, b), small = Math.min(a, b), sum = a + b, diff = big - small;
    const distract = (answer: number) => [String(answer + 1), String(Math.max(0, answer - 1)), String(answer + 2), String(answer + 3)];
    questions = [
      make(`${a} + ${b} bằng bao nhiêu?`, String(sum), distract(sum), `Đếm thêm ${b} bước từ ${a}.`),
      make(`Số nào lớn hơn: ${a} hay ${b}?`, String(big), [String(small), String(big + 1), String(Math.max(0, small - 1)), String(big + 2)], "So sánh giá trị của hai số nhé."),
      make(`${big} - ${small} bằng bao nhiêu?`, String(diff), distract(diff), "Lấy số lớn trừ số bé."),
      make(`Có ${a} quả táo, mẹ cho thêm ${b} quả. Có tất cả bao nhiêu quả?`, String(sum), distract(sum), "Muốn tìm tất cả, bé dùng phép cộng."),
      tier >= 6
        ? make(`${small * 2} chia 2 bằng bao nhiêu?`, String(small), [String(small + 1), String(Math.max(0, small - 1)), String(small * 2), String(small + 2)], "Chia thành hai phần bằng nhau.")
        : tier >= 4
          ? make(`${small} nhân 2 bằng bao nhiêu?`, String(small * 2), [String(small + 1), String(small * 3), String(small * 2 + 1), String(small)], "Nhân 2 là cộng số đó với chính nó.")
          : make(`Hình nào có 3 cạnh?`, "hình tam giác", SHAPES, "Hình tam giác có 3 cạnh.")
    ];
  } else if (subject === "vietnamese") {
    const letter = pick(LETTERS);
    const word = pick(VI_WORDS);
    questions = [
      make("Chữ nào đứng đầu bảng chữ cái tiếng Việt?", "a", ["b", "c", "d"], "Chữ a đứng đầu bảng chữ cái tiếng Việt."),
      make(`Đây là chữ gì: “${letter}”?`, letter, shuffle(LETTERS.filter(x => x !== letter)).slice(0, 3), "Quan sát hình dáng của chữ nhé."),
      make(`Chọn từ “${word}” được viết đúng.`, word, shuffle(VI_WORDS.filter(x => x !== word)).slice(0, 3), "Bé đọc chậm từng tiếng để nhận ra từ."),
      make("Từ nào chỉ người?", "mẹ", ["bàn", "hoa", "bút"], "Mẹ là từ chỉ người."),
      make("Cuối câu hỏi thường có dấu gì?", "dấu hỏi (?)", ["dấu chấm (.)", "dấu phẩy (,)", "dấu chấm than (!)"], "Câu hỏi kết thúc bằng dấu hỏi.")
    ];
    if (tier >= 2) questions[0] = make("Từ nào viết đúng chính tả?", "chăm chỉ", ["trăm chỉ", "chăm chĩ", "trăm chĩ"], "Từ đúng là chăm chỉ.");
    if (tier >= 4) questions[1] = make("Từ nào chỉ hoạt động?", "chạy", ["bông hoa", "màu đỏ", "hiền lành"], "Chạy là từ chỉ hoạt động.");
    if (tier >= 6) questions[2] = make("Từ trái nghĩa với “cao” là gì?", "thấp", ["dài", "to", "rộng"], "Cao và thấp là hai từ trái nghĩa.");
    if (tier >= 8) questions[3] = make("Trong câu “Lan đang đọc sách”, ai đọc sách?", "Lan", ["sách", "đang", "bạn Nam"], "Lan là người thực hiện hoạt động đọc.");
  } else {
    const pair = pick(WORDS);
    const other = pick(WORDS.filter(w => w[0] !== pair[0]));
    const pool = WORDS.map(w => w[1]);
    questions = [
      make(`“${pair[0]}” nghĩa là gì?`, pair[1], pool, `${pair[0]} có nghĩa là ${pair[1]}.`),
      make("“Hello” có nghĩa là gì?", "Xin chào", ["Tạm biệt", "Cảm ơn", "Xin lỗi"], "Hello dùng để chào hỏi."),
      make("“Thank you” có nghĩa là gì?", "Cảm ơn", ["Xin chào", "Tạm biệt", "Xin lỗi"], "Thank you nghĩa là cảm ơn."),
      make("Màu “red” là màu gì?", "Màu đỏ", ["Màu xanh", "Màu vàng", "Màu tím"], "Red nghĩa là màu đỏ."),
      make(`Từ nào có nghĩa là “${other[1]}”?`, other[0], WORDS.filter(w => w[0] !== other[0]).slice(0, 3).map(w => w[0]), `${other[0]} nghĩa là ${other[1]}.`)
    ];
    if (tier >= 2) questions[1] = make("“Good morning” nghĩa là gì?", "Chào buổi sáng", ["Chúc ngủ ngon", "Tạm biệt", "Chào buổi tối"], "Good morning là lời chào buổi sáng.");
    if (tier >= 4) questions[2] = make("Chọn câu đúng:", "I am a student.", ["I is a student.", "I are a student.", "I be a student."], "Với I, ta dùng am.");
    if (tier >= 6) questions[3] = make("“I like apples” nghĩa là gì?", "Tôi thích táo", ["Tôi ăn bánh", "Tôi có một con mèo", "Tôi đi học"], "I like nghĩa là tôi thích.");
    if (tier >= 8) questions[4] = make("Điền từ: She ___ happy.", "is", ["am", "are", "be"], "She đi với is.");
  }
  // Tránh lặp câu trong một bộ và ưu tiên câu chưa từng xuất hiện ở cấp này.
  const unique = new Map<string, Question>();
  for (const q of shuffle(questions)) if (!unique.has(q.prompt)) unique.set(q.prompt, q);
  const fresh = [...unique.values()].filter(q => !seen.has(q.prompt));
  const chosen = shuffle(fresh).slice(0, 5);
  const fallback = shuffle([...unique.values()].filter(q => !chosen.some(c => c.prompt === q.prompt)));
  while (chosen.length < 5 && fallback.length) chosen.push(fallback.pop()!);
  return shuffle(chosen);
}

export const Route = createFileRoute("/_authenticated/hoc/$subject")({
  head: () => ({ meta: [{ title: "Phòng học – Bé Học Vui" }, { name: "description", content: "Chọn cấp độ Toán, Tiếng Việt và Tiếng Anh từ 1 đến 100." }] }),
  component: () => <GameShell>{profile => <LessonRoom profile={profile} />}</GameShell>,
});

function LessonRoom({ profile }: { profile: Profile }) {
  const { subject: rawSubject } = Route.useParams();
  const subject: Subject = rawSubject === "vietnamese" || rawSubject === "english" ? rawSubject : "math";
  const meta = SUBJECTS[subject];
  const [level, setLevel] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const seenByLevel = useRef(new Map<string, Set<string>>());
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [savingPoints, setSavingPoints] = useState(false);
  const question = questions[index];
  const answered = selected !== null;
  const correct = selected === question?.answer;

  function startLevel(value: number) {
    const key = `${profile.grade}-${subject}-${value}`;
    const seen = seenByLevel.current.get(key) ?? new Set<string>();
    const nextSet = makeQuestions(subject, value, profile.grade, seen);
    nextSet.forEach(q => seen.add(q.prompt));
    seenByLevel.current.set(key, seen);
    setQuestions(nextSet);
    setLevel(value); setIndex(0); setSelected(null); setScore(0); setEarnedPoints(0); setFinished(false);
  }
  function chooseAnswer(choice: number) {
    if (answered || finished || !question || level === null) return;
    setSelected(choice);
    if (choice === question.answer) {
      setScore(v => v + 1); setSavingPoints(true);
      void supabase.from("point_events").insert({
        user_id: profile.id, grade: profile.grade, reason: "lesson_practice",
        points: 10, correct: 1, goals: 0, note: `${meta.title} - cấp ${level} - câu ${index + 1}`,
      }).then(({ error }) => {
        if (error) toast.error("Chưa lưu được điểm. Bé thử lại sau nhé!");
        else { setEarnedPoints(v => v + 10); toast.success("+10 điểm học tập ⭐"); }
      }).finally(() => setSavingPoints(false));
    }
  }
  function nextQuestion() {
    if (index === questions.length - 1) setFinished(true);
    else { setIndex(v => v + 1); setSelected(null); }
  }
  function backToLevels() { setLevel(null); setIndex(0); setSelected(null); setScore(0); setFinished(false); }

  return (
    <main className="min-h-screen bg-gradient-sky px-3 py-6 text-foreground sm:px-4 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/the-gioi" className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 font-bold shadow-chunky">← Trở về sân trường</Link>
          {level !== null && <button onClick={backToLevels} className="rounded-xl border-2 border-border bg-card px-4 py-2 font-bold">↩ Chọn cấp độ khác</button>}
        </div>
        <section className="toy-card mt-5 overflow-hidden p-4 sm:p-8">
          <div className="text-center">
            <div className="text-4xl">{meta.emoji}</div>
            <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{meta.title}</h1>
            <p className="mt-2 text-muted-foreground">{meta.intro}</p>
          </div>
          {level === null ? (
            <div className="mt-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-extrabold">🌟 Chọn cấp độ từ 1 đến 100</h2><span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold">Cấp 1 rất dễ · Cấp 100 thử thách</span></div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-3">
                {Array.from({ length: 100 }, (_, i) => i + 1).map(n => <button key={n} onClick={() => startLevel(n)} className={`aspect-square rounded-xl border-2 text-base font-black shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:rounded-2xl sm:text-lg ${n <= 10 ? "border-green-200 bg-green-50 text-green-800 hover:border-green-400" : n <= 30 ? "border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-400" : n <= 60 ? "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400" : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800 hover:border-fuchsia-400"}`}>{n}</button>)}
              </div>
              <p className="mt-5 rounded-2xl bg-secondary/70 p-4 text-center text-sm font-semibold text-muted-foreground">Bé có thể chọn bất kỳ cấp nào. Mỗi cấp có 5 câu hỏi; trả lời đúng được cộng 10 điểm.</p>
            </div>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary p-3">
                <div><p className="text-xs font-bold uppercase text-muted-foreground">Đang luyện tập</p><p className="text-xl font-black">Cấp độ {level} / 100</p></div>
                <div className="text-right"><p className="text-2xl font-black text-primary">⭐ {score}/5</p><p className="text-xs font-bold text-muted-foreground">+{earnedPoints} điểm đã lưu</p></div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${finished ? 100 : ((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}/></div>
              {finished ? (
                <div className="py-9 text-center">
                  <div className="text-6xl">{score === 5 ? "🏆" : score >= 3 ? "🌟" : "💪"}</div>
                  <h2 className="mt-3 text-3xl font-extrabold">Hoàn thành cấp {level}!</h2>
                  <p className="mt-2 text-lg">Bé trả lời đúng <strong className="text-primary">{score}/5</strong> câu.</p>
                  <p className="mt-1 font-extrabold text-primary">⭐ Đã tích lũy {earnedPoints} điểm.</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button onClick={() => startLevel(Math.min(100, level + 1))} disabled={level === 100} className="rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground shadow-chunky disabled:opacity-40">Cấp tiếp theo →</button>
                    <button onClick={() => startLevel(level)} className="rounded-xl border-2 border-border bg-card px-5 py-3 font-extrabold">↻ Làm lại cấp này</button>
                    <button onClick={backToLevels} className="rounded-xl border-2 border-border bg-card px-5 py-3 font-extrabold">Chọn cấp khác</button>
                  </div>
                </div>
              ) : (
                <div className="mt-7">
                  <p className="text-sm font-extrabold text-primary">CÂU {index + 1} / 5</p>
                  <h2 className="mt-3 text-2xl font-extrabold leading-snug">{question.prompt}</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {question.choices.map((choice, i) => {
                      const isCorrect = answered && i === question.answer;
                      const isWrong = answered && selected === i && !correct;
                      return <button key={`${index}-${i}`} onClick={() => chooseAnswer(i)} disabled={answered} className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left font-bold transition ${isCorrect ? "border-green-500 bg-green-50 text-green-800" : isWrong ? "border-red-400 bg-red-50 text-red-800" : "border-border bg-card hover:border-primary"} ${answered && !isCorrect && !isWrong ? "opacity-60" : ""}`}><span className="mr-3 inline-grid h-8 w-8 place-items-center rounded-full bg-muted text-sm">{String.fromCharCode(65+i)}</span>{choice}</button>;
                    })}
                  </div>
                  {answered && <div className={`mt-5 rounded-2xl p-4 ${correct ? "bg-green-100 text-green-900" : "bg-amber-100 text-amber-900"}`}><p className="font-extrabold">{correct ? "🎉 Chính xác! Bé giỏi quá!" : "🌱 Chưa đúng, mình cùng học nhé!"}</p><p className="mt-1 text-sm">{question.hint}</p></div>}
                  {savingPoints && <p className="mt-3 text-right text-sm font-semibold text-primary">Đang lưu điểm học tập…</p>}
                  <div className="mt-6 flex justify-end"><button onClick={nextQuestion} disabled={!answered} className="rounded-xl bg-primary px-6 py-3 font-extrabold text-primary-foreground shadow-chunky disabled:opacity-40">{index === 4 ? "Xem kết quả" : "Câu tiếp theo →"}</button></div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
