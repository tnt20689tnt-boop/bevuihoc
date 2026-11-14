import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";
import type { Profile } from "@/hooks/use-player";
import { supabase } from "@/integrations/supabase/client";
import { generateLessonQuestions, loadSeenQuestionPrompts, saveSeenQuestionPrompts } from "@/game/questionBank";
import { toast } from "sonner";
import { primeSpeech, speakQuiz, speakFeedback, stopSpeech } from "@/lib/quizSpeech";

type Question = { prompt: string; choices: string[]; answer: number; hint: string };
type Subject = "math" | "vietnamese" | "english";
const SUBJECTS: Record<Subject, { title: string; emoji: string; intro: string }> = {
  math: { title: "Toán học", emoji: "🔢", intro: "Từ làm quen với số đến những phép tính thú vị." },
  vietnamese: { title: "Tiếng Việt", emoji: "📖", intro: "Học chữ, ghép vần, đọc từ và câu." },
  english: { title: "Tiếng Anh", emoji: "🌍", intro: "Học chữ cái, màu sắc, con vật và câu giao tiếp." },
};
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
  const speechLocale = subject === "english" && question && !/[À-ỹ]/i.test(question.prompt) ? "en-US" : "vi-VN";

  useEffect(() => {
    if (!question || level === null || finished) return;
    void speakQuiz(question.prompt, question.choices, speechLocale);
    return () => stopSpeech();
  }, [question?.prompt, question?.choices, level, finished, speechLocale]);

  function startLevel(value: number) {
    // Kích hoạt bộ đọc ngay trong thao tác chạm của bé (đặc biệt cần thiết trên iPhone Safari).
    primeSpeech("vi-VN");
    const key = `${profile.id}-${profile.grade}-${subject}-${value}`;
    const seen = seenByLevel.current.get(key) ?? loadSeenQuestionPrompts(key);
    let nextSet = generateLessonQuestions(subject, value, profile.grade, seen, 5);
    // Once the unseen bank for this level is exhausted, start a fresh cycle,
    // while still ensuring that the five questions in this round are unique.
    if (nextSet.length < 5) {
      const used = new Set(nextSet.map(q => q.prompt));
      const refill = generateLessonQuestions(subject, value, profile.grade, used, 5 - nextSet.length);
      nextSet = [...nextSet, ...refill];
      seen.clear();
    }
    nextSet.forEach(q => seen.add(q.prompt));
    seenByLevel.current.set(key, seen);
    saveSeenQuestionPrompts(key, seen);
    setQuestions(nextSet);
    setLevel(value); setIndex(0); setSelected(null); setScore(0); setEarnedPoints(0); setFinished(false);
  }
  function chooseAnswer(choice: number) {
    if (answered || finished || !question || level === null) return;
    setSelected(choice);
    speakFeedback(choice === question.answer, question.hint, speechLocale);
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
                {Array.from({ length: 100 }, (_, i) => i + 1).map(n => <button key={n} onClick={() => startLevel(n)} className={`aspect-square rounded-xl border-2 text-base font-black shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:rounded-2xl sm:text-lg ${n <= 10 ? "border-green-200 bg-green-50 text-green-800 hover:border-green-400" : n <= 30 ? "border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-400" : n <= 60 ? "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400" : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800 hover:border-fuchsia-400"}`}>{n}</button>)}
              </div>
              <p className="mt-5 rounded-2xl bg-secondary/70 p-4 text-center text-sm font-semibold text-muted-foreground">Bé có thể chọn bất kỳ cấp nào. Mỗi lượt có tối đa 5 câu mới; câu đã làm được ghi nhớ để hạn chế lặp lại. Trả lời đúng được cộng 10 điểm.</p>
            </div>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary p-3">
                <div><p className="text-xs font-bold uppercase text-muted-foreground">Đang luyện tập</p><p className="text-xl font-black">Cấp độ {level} / 100</p></div>
                <div className="text-right"><p className="text-2xl font-black text-primary">⭐ {score}/{questions.length}</p><p className="text-xs font-bold text-muted-foreground">+{earnedPoints} điểm đã lưu</p></div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${finished ? 100 : ((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}/></div>
              {finished ? (
                <div className="py-9 text-center">
                  <div className="text-6xl">{score === 5 ? "🏆" : score >= 3 ? "🌟" : "💪"}</div>
                  <h2 className="mt-3 text-3xl font-extrabold">Hoàn thành cấp {level}!</h2>
                  <p className="mt-2 text-lg">Bé trả lời đúng <strong className="text-primary">{score}/{questions.length}</strong> câu.</p>
                  <p className="mt-1 font-extrabold text-primary">⭐ Đã tích lũy {earnedPoints} điểm.</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button onClick={() => startLevel(Math.min(100, level + 1))} disabled={level === 100} className="rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground shadow-chunky disabled:opacity-40">Cấp tiếp theo →</button>
                    <button onClick={() => startLevel(level)} className="rounded-xl border-2 border-border bg-card px-5 py-3 font-extrabold">↻ Làm lại cấp này</button>
                    <button onClick={backToLevels} className="rounded-xl border-2 border-border bg-card px-5 py-3 font-extrabold">Chọn cấp khác</button>
                  </div>
                </div>
              ) : question ? (
                <div className="mt-7">
                  <p className="text-sm font-extrabold text-primary">CÂU {index + 1} / {questions.length}</p>
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
                  <div className="mt-6 flex justify-end"><button onClick={nextQuestion} disabled={!answered} className="rounded-xl bg-primary px-6 py-3 font-extrabold text-primary-foreground shadow-chunky disabled:opacity-40">{index === questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo →"}</button></div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
