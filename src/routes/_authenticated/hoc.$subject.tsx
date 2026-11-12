import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";
import type { Profile } from "@/hooks/use-player";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateGradeQuestions } from "@/game/gradeQuestionBank";

type Question = { prompt: string; choices: string[]; answer: number; hint: string };
type Subject = "math" | "vietnamese" | "english";
const SUBJECTS: Record<Subject, { title: string; emoji: string; intro: string }> = {
  math: { title: "Toán học", emoji: "🔢", intro: "Từ làm quen với số đến những phép tính thú vị." },
  vietnamese: { title: "Tiếng Việt", emoji: "📖", intro: "Học chữ, ghép vần, đọc từ và câu." },
  english: { title: "Tiếng Anh", emoji: "🌍", intro: "Học chữ cái, màu sắc, con vật và câu giao tiếp." },
};
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
const normalizeQuestion = (value: string) =>
  value.normalize("NFC").toLocaleLowerCase("vi").replace(/\s+/g, " ").trim();

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
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const seenBySubject = useRef(new Map<string, Set<string>>());
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [savingPoints, setSavingPoints] = useState(false);
  const question = questions[index];
  const answered = selected !== null;
  const correct = selected === question?.answer;

  async function startLevel(value: number) {
    // Theo dõi câu đã dùng xuyên suốt 100 Level của môn này, không chỉ trong một Level.
    const seen = seenBySubject.current.get(subject) ?? new Set<string>();
    const storageKey = `bevuihoc:seen-practice-prompts:${subject}`;
    if (seen.size === 0) {
      try {
        const saved = window.localStorage.getItem(storageKey);
        const savedPrompts: unknown = saved ? JSON.parse(saved) : [];
        if (Array.isArray(savedPrompts)) {
          savedPrompts.forEach((prompt) => {
            if (typeof prompt === "string") seen.add(prompt);
          });
        }
      } catch (storageError) {
        console.warn("Không đọc được lịch sử câu hỏi đã dùng:", storageError);
      }
    }
    setLoadingQuestions(true);
    setQuestions([]);
    setLevel(value);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setEarnedPoints(0);
    setFinished(false);

    let onlineQuestions: Question[] = [];
    try {
      type OnlineQuestionRow = {
        id: string;
        question_text: string;
        options: { key: string; text: string }[];
        correct_answer: string;
        topic: string | null;
      };
      const getPracticeQuestions = supabase.rpc as unknown as (
        functionName: string,
        args: {
          p_subject: string;
          p_grade: number;
          p_level: number;
          p_count: number;
        },
      ) => Promise<{ data: OnlineQuestionRow[] | null; error: { message: string } | null }>;
      const { data, error } = await getPracticeQuestions("get_practice_questions", {
        p_subject: subject === "vietnamese" ? "viet" : subject,
        p_grade: profile.grade,
        p_level: value,
        p_count: 5,
      });
      if (error) throw error;
      const onlineRows = data ?? [];
      const usedThisSet = new Set<string>();
      onlineQuestions = onlineRows.flatMap((row) => {
        const promptKey = normalizeQuestion(row.question_text);
        const sourceOptions = Array.isArray(row.options) ? row.options : [];
        const correctText = sourceOptions.find((option) => option.key === row.correct_answer)?.text;
        if (
          !row.question_text ||
          seen.has(promptKey) ||
          usedThisSet.has(promptKey) ||
          sourceOptions.length !== 4 ||
          !correctText ||
          new Set(sourceOptions.map((option) => option.text)).size !== 4
        ) return [];
        usedThisSet.add(promptKey);
        const choices = shuffle(sourceOptions.map(option => option.text));
        return [{
          prompt: row.question_text,
          choices,
          answer: choices.indexOf(correctText),
          hint: row.topic ? `Chủ đề: ${row.topic}. Hãy đọc kỹ câu hỏi và suy nghĩ từng đáp án.` : "Bé hãy đọc kỹ câu hỏi và thử lại nhé.",
        }];
      });
      onlineQuestions.forEach((question) => seen.add(normalizeQuestion(question.prompt)));
    } catch (error) {
      console.error("Không tải được ngân hàng câu hỏi online:", error);
      toast.error("Chưa tải được ngân hàng online. Hệ thống sẽ dùng bộ câu hỏi theo lớp và Level.");
    } finally {
      setLoadingQuestions(false);
    }

    // Ngân hàng online hiện là nguồn bổ sung; bộ sinh tạo đủ 5 câu riêng cho lớp và Level.
    const generated = generateGradeQuestions(
      subject,
      profile.grade,
      value,
      Math.max(0, 5 - onlineQuestions.length),
      seen,
    );
    const selectedQuestions = [...onlineQuestions, ...generated].slice(0, 5);
    if (selectedQuestions.length < 5) {
      toast.error("Chưa tạo đủ câu hỏi mới cho Level này. Vui lòng thử lại.");
    }
    seenBySubject.current.set(subject, seen);
    setQuestions(shuffle(selectedQuestions));
  }
  function chooseAnswer(choice: number) {
    if (answered || finished || !question || level === null) return;
    setSelected(choice);
    if (choice === question.answer) {
      setScore(v => v + 1); setSavingPoints(true);
      void supabase.rpc("award_lesson_points", {
        p_note: `${meta.title} - cấp ${level} - câu ${index + 1}`,
      }).then(({ error }) => {
        setSavingPoints(false);
        if (error) {
          toast.error(`Chưa lưu được điểm: ${error.message}`);
        } else {
          setEarnedPoints(v => v + 10);
          toast.success("+10 điểm học tập ⭐");
        }
      }, () => {
        setSavingPoints(false);
        toast.error("Chưa lưu được điểm. Bé thử lại nhé!");
      });
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
                {Array.from({ length: 100 }, (_, i) => i + 1).map(n => <button key={n} disabled={loadingQuestions} onClick={() => void startLevel(n)} className={`aspect-square rounded-xl border-2 text-base font-black shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:rounded-2xl sm:text-lg ${n <= 10 ? "border-green-200 bg-green-50 text-green-800 hover:border-green-400" : n <= 30 ? "border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-400" : n <= 60 ? "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400" : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800 hover:border-fuchsia-400"}`}>{n}</button>)}
              </div>
              <p className="mt-5 rounded-2xl bg-secondary/70 p-4 text-center text-sm font-semibold text-muted-foreground">Bé có thể chọn bất kỳ cấp nào. Mỗi cấp có 5 câu hỏi; trả lời đúng được cộng 10 điểm.</p>
            </div>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary p-3">
                <div><p className="text-xs font-bold uppercase text-muted-foreground">Đang luyện tập</p><p className="text-xl font-black">Cấp độ {level} / 100</p></div>
                <div className="text-right"><p className="text-2xl font-black text-primary">⭐ {score}/5</p><p className="text-xs font-bold text-muted-foreground">+{earnedPoints} điểm đã lưu</p></div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${questions.length === 0 ? 0 : finished ? 100 : ((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}/></div>
              {loadingQuestions && <p className="mt-4 rounded-xl bg-secondary p-3 text-center font-semibold text-muted-foreground">Đang tải câu hỏi đúng môn, lớp và cấp độ…</p>}
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
              ) : question ? (
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
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
