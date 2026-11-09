import { useState } from "react";
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

function makeQuestions(subject: Subject, level: number): Question[] {
  const tier = Math.floor((level - 1) / 10);
  const make = (prompt: string, answer: string, pool: string[], hint: string): Question => {
    const options = [answer, ...pool.filter(v => v !== answer)].slice(0, 4);
    while (options.length < 4) options.push(String(options.length + 1));
    const shuffled = [...options].sort((a,b) => a.localeCompare(b, "vi") * ((level % 2) ? 1 : -1));
    return { prompt, choices: shuffled, answer: shuffled.indexOf(answer), hint };
  };
  if (subject === "math") {
    const max = [5, 10, 20, 30, 50, 100, 200, 500, 1000, 10000][tier]!;
    const a = 1 + ((level * 3) % Math.max(2, Math.floor(max / 2)));
    const b = 1 + ((level * 7) % Math.max(2, Math.floor(max / 2)));
    const sum = a + b;
    const diff = Math.max(0, Math.max(a,b) - Math.min(a,b));
    const questions: Question[] = [
      make(`Số ${a} + ${b} bằng bao nhiêu?`, String(sum), [String(sum+1), String(Math.max(0,sum-1)), String(sum+2)], `Ta đếm thêm ${b} bước từ số ${a}.`),
      make(`Số lớn hơn trong hai số ${a} và ${b} là số nào?`, String(Math.max(a,b)), [String(Math.min(a,b)), String(Math.max(a,b)+1), String(Math.max(0,Math.min(a,b)-1))], "So sánh hai số, số có giá trị lớn hơn là đáp án."),
      make(`Lấy ${Math.max(a,b)} trừ ${Math.min(a,b)} còn bao nhiêu?`, String(diff), [String(diff+1), String(diff+2), String(Math.max(0,diff-1))], "Lấy số lớn trừ số bé."),
      make(`Có ${a} quả táo, thêm ${b} quả. Có tất cả bao nhiêu quả?`, String(sum), [String(sum+2), String(Math.max(0,sum-1)), String(sum+3)], "Phép cộng giúp tìm tất cả số đồ vật."),
      make(`Hình nào có 3 cạnh?`, "hình tam giác", SHAPES, "Hình tam giác có 3 cạnh.")
    ];
    if (tier >= 2) questions[4] = make(`Số ${Math.max(a,b)} - ${Math.min(a,b)} bằng bao nhiêu?`, String(diff), [String(diff+1), String(diff+2), String(Math.max(0,diff-1))], "Thực hiện phép trừ.");
    if (tier >= 4) questions[4] = make(` ${Math.min(a,b)} × 2 bằng bao nhiêu?`, String(Math.min(a,b)*2), [String(Math.min(a,b)+2), String(Math.min(a,b)*3), String(Math.min(a,b)*2+1)], "Nhân 2 là cộng số đó với chính nó.");
    if (tier >= 6) questions[4] = make(` ${Math.min(a,b)*2} ÷ 2 bằng bao nhiêu?`, String(Math.min(a,b)), [String(Math.min(a,b)+1), String(Math.max(1,Math.min(a,b)-1)), String(Math.min(a,b)*2)], "Chia 2 là tách thành hai phần bằng nhau.");
    return questions;
  }
  if (subject === "vietnamese") {
    const letter = LETTERS[(level - 1) % LETTERS.length]!;
    const word = VI_WORDS[(level - 1) % VI_WORDS.length]!;
    const nextLetter = LETTERS[level % LETTERS.length]!;
    const questions: Question[] = [
      make("Chữ nào đứng đầu bảng chữ cái tiếng Việt?", "a", ["b", "c", "d"], "Chữ a đứng đầu bảng chữ cái tiếng Việt."),
      make(`Chữ ${letter} là chữ gì?`, letter, [nextLetter, "m", "o"], "Hãy quan sát và nhận biết mặt chữ."),
      make(`Từ nào có tiếng “${word}”?`, word, ["hoa", "mèo", "bút"], "Đọc chậm từng tiếng để nhận ra từ."),
      make("Từ nào chỉ người?", "mẹ", ["bàn", "hoa", "bút"], "Mẹ là từ chỉ người."),
      make("Cuối câu hỏi thường có dấu gì?", "dấu hỏi (?)", ["dấu chấm (.)", "dấu phẩy (,)", "dấu chấm than (!)"], "Câu hỏi kết thúc bằng dấu hỏi.")
    ];
    if (tier >= 2) questions[0] = make("Từ nào viết đúng chính tả?", "chăm chỉ", ["trăm chỉ", "chăm chĩ", "trăm chĩ"], "Từ đúng là chăm chỉ.");
    if (tier >= 4) questions[1] = make("Từ nào chỉ hoạt động?", "chạy", ["bông hoa", "màu đỏ", "hiền lành"], "Chạy là từ chỉ hoạt động.");
    if (tier >= 6) questions[2] = make("Từ trái nghĩa với “cao” là gì?", "thấp", ["dài", "to", "rộng"], "Cao và thấp là hai từ trái nghĩa.");
    if (tier >= 8) questions[3] = make("Trong câu “Lan đang đọc sách”, ai đọc sách?", "Lan", ["sách", "đang", "bạn Nam"], "Lan là người thực hiện hoạt động đọc.");
    return questions;
  }
  const pair = WORDS[(level - 1) % WORDS.length]!;
  const next = WORDS[level % WORDS.length]!;
  const pool = WORDS.map(w => w[1]);
  const questions: Question[] = [
    make(`“${pair[0]}” nghĩa là gì?`, pair[1], pool, ` ${pair[0]} có nghĩa là ${pair[1]}.`),
    make("“Hello” có nghĩa là gì?", "Xin chào", ["Tạm biệt", "Cảm ơn", "Xin lỗi"], "Hello dùng để chào hỏi."),
    make("“Thank you” có nghĩa là gì?", "Cảm ơn", ["Xin chào", "Tạm biệt", "Xin lỗi"], "Thank you nghĩa là cảm ơn."),
    make("Màu “red” là màu gì?", "Màu đỏ", ["Màu xanh", "Màu vàng", "Màu tím"], "Red nghĩa là màu đỏ."),
    make(`Từ nào có nghĩa là “${next[1]}”?`, next[0], WORDS.filter(w => w[0] !== next[0]).slice(0,3).map(w => w[0]), `${next[0]} nghĩa là ${next[1]}.`)
  ];
  if (tier >= 2) questions[1] = make("“Good morning” nghĩa là gì?", "Chào buổi sáng", ["Chúc ngủ ngon", "Tạm biệt", "Chào buổi tối"], "Good morning là lời chào buổi sáng.");
  if (tier >= 4) questions[2] = make("Chọn câu đúng:", "I am a student.", ["I is a student.", "I are a student.", "I be a student."], "Với I, ta dùng am.");
  if (tier >= 6) questions[3] = make("“I like apples” nghĩa là gì?", "Tôi thích táo", ["Tôi ăn bánh", "Tôi có một con mèo", "Tôi đi học"], "I like nghĩa là tôi thích.");
  if (tier >= 8) questions[4] = make("Điền từ: She ___ happy.", "is", ["am", "are", "be"], "She đi với is.");
  return questions;
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
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [savingPoints, setSavingPoints] = useState(false);
  const questions = level ? makeQuestions(subject, level) : [];
  const question = questions[index];
  const answered = selected !== null;
  const correct = selected === question?.answer;

  function startLevel(value: number) {
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
