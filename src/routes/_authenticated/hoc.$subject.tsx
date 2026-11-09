import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

type Question = {
  prompt: string;
  choices: string[];
  answer: number;
  hint: string;
};

type Lesson = { title: string; emoji: string; intro: string; questions: Question[] };

const LESSONS: Record<"math" | "vietnamese" | "english", Lesson> = {
  math: {
    title: "Toán học",
    emoji: "🔢",
    intro: "Cùng luyện tính toán và suy luận nhé!",
    questions: [
      { prompt: "8 + 7 bằng bao nhiêu?", choices: ["14", "15", "16", "17"], answer: 1, hint: "Tách 7 thành 2 + 5: 8 + 2 = 10, rồi cộng 5." },
      { prompt: "36 − 9 bằng bao nhiêu?", choices: ["25", "26", "27", "28"], answer: 2, hint: "36 − 10 = 26, cộng lại 1 được 27." },
      { prompt: "Hình nào có 3 cạnh?", choices: ["Hình vuông", "Hình tròn", "Hình tam giác", "Hình chữ nhật"], answer: 2, hint: "Tam giác có đúng 3 cạnh và 3 góc." },
      { prompt: "5 × 4 bằng bao nhiêu?", choices: ["15", "20", "25", "30"], answer: 1, hint: "5 × 4 là 5 được lấy 4 lần: 5 + 5 + 5 + 5." },
      { prompt: "Một giờ có bao nhiêu phút?", choices: ["30", "45", "60", "100"], answer: 2, hint: "1 giờ = 60 phút." },
    ],
  },
  vietnamese: {
    title: "Tiếng Việt",
    emoji: "📖",
    intro: "Đọc kỹ câu hỏi và chọn đáp án đúng nhé!",
    questions: [
      { prompt: "Từ nào viết đúng chính tả?", choices: ["xinh đẹp", "sinh đẹp", "xinh đep", "sinh đep"], answer: 0, hint: "Từ đúng là “xinh đẹp”." },
      { prompt: "Từ nào chỉ hoạt động?", choices: ["bông hoa", "chạy", "màu đỏ", "hiền lành"], answer: 1, hint: "“Chạy” là từ chỉ hoạt động." },
      { prompt: "Trong câu “Bé Lan đọc sách”, ai đang đọc sách?", choices: ["Bé Lan", "Quyển sách", "Cô giáo", "Bạn Nam"], answer: 0, hint: "Chủ thể thực hiện hoạt động là Bé Lan." },
      { prompt: "Từ trái nghĩa với “chăm chỉ” là gì?", choices: ["Siêng năng", "Cần cù", "Lười biếng", "Ngoan ngoãn"], answer: 2, hint: "“Lười biếng” trái nghĩa với “chăm chỉ”." },
      { prompt: "Cuối câu hỏi thường dùng dấu nào?", choices: ["Dấu chấm", "Dấu phẩy", "Dấu hỏi", "Dấu hai chấm"], answer: 2, hint: "Câu hỏi kết thúc bằng dấu hỏi (?)." },
    ],
  },
  english: {
    title: "Tiếng Anh",
    emoji: "🌍",
    intro: "Let’s practise some English!",
    questions: [
      { prompt: "What is the meaning of “apple”?", choices: ["Quả chuối", "Quả táo", "Quả cam", "Quả nho"], answer: 1, hint: "Apple means quả táo." },
      { prompt: "Choose the correct greeting in the morning.", choices: ["Good night", "Good morning", "Goodbye", "Good evening"], answer: 1, hint: "We say “Good morning” in the morning." },
      { prompt: "What colour is the sky on a clear day?", choices: ["Blue", "Green", "Pink", "Black"], answer: 0, hint: "The sky is usually blue on a clear day." },
      { prompt: "How do you say “cảm ơn” in English?", choices: ["Sorry", "Please", "Thank you", "Hello"], answer: 2, hint: "“Thank you” means “cảm ơn”." },
      { prompt: "Choose the correct sentence.", choices: ["I is a student.", "I am a student.", "I are a student.", "I be a student."], answer: 1, hint: "With “I”, we use “am”." },
    ],
  },
};

export const Route = createFileRoute("/_authenticated/hoc/$subject")({
  head: () => ({
    meta: [
      { title: "Phòng học – Bé Học Vui" },
      { name: "description", content: "Luyện tập Toán, Tiếng Việt và Tiếng Anh trong thế giới Bé Học Vui." },
    ],
  }),
  component: LessonRoom,
});

function LessonRoom() {
  const { subject } = Route.useParams();
  const lesson: Lesson = (LESSONS as Record<string, Lesson | undefined>)[subject] ?? LESSONS.math;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question: Question = lesson.questions[index] ?? (lesson.questions[0] as Question);
  const answered = selected !== null;
  const correct = selected === question.answer;

  function chooseAnswer(choice: number) {
    if (answered || finished) return;
    setSelected(choice);
    if (choice === question.answer) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (index === lesson.questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  return (
    <main className="min-h-screen bg-gradient-sky px-4 py-8 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link to="/the-gioi" className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 font-bold shadow-chunky hover:-translate-y-0.5">
          ← Trở về sân trường
        </Link>
        <section className="toy-card mt-6 overflow-hidden p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-extrabold uppercase tracking-wider text-primary">Lớp học vui nhộn</p>
              <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{lesson.emoji} {lesson.title}</h1>
              <p className="mt-2 text-muted-foreground">{lesson.intro}</p>
            </div>
            <div className="rounded-2xl bg-secondary px-4 py-3 text-center">
              <div className="text-2xl">⭐</div>
              <div className="font-display text-xl font-extrabold">{score}/{lesson.questions.length}</div>
              <div className="text-xs font-bold text-muted-foreground">Số câu đúng</div>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${finished ? 100 : ((index + (answered ? 1 : 0)) / lesson.questions.length) * 100}%` }} />
          </div>

          {finished ? (
            <div className="py-10 text-center">
              <div className="text-6xl">{score === lesson.questions.length ? "🏆" : score >= 3 ? "🌟" : "💪"}</div>
              <h2 className="mt-4 text-3xl font-extrabold">Hoàn thành rồi!</h2>
              <p className="mt-2 text-lg text-muted-foreground">Bé trả lời đúng <strong className="text-primary">{score}/{lesson.questions.length}</strong> câu.</p>
              <p className="mt-1 text-muted-foreground">{score === lesson.questions.length ? "Xuất sắc! Bé đã trả lời đúng tất cả." : "Cố gắng thêm nhé, mỗi lần luyện tập bé sẽ tiến bộ hơn!"}</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button onClick={restart} className="rounded-xl bg-primary px-6 py-3 font-display font-extrabold text-primary-foreground shadow-chunky">Học lại</button>
                <Link to="/the-gioi" className="rounded-xl border-2 border-border bg-card px-6 py-3 font-display font-extrabold">Về sân trường</Link>
              </div>
            </div>
          ) : (
            <div className="mt-7">
              <p className="text-sm font-extrabold text-primary">CÂU {index + 1} / {lesson.questions.length}</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-snug">{question.prompt}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {question.choices.map((choice, choiceIndex) => {
                  const isCorrect = answered && choiceIndex === question.answer;
                  const isWrong = answered && selected === choiceIndex && !correct;
                  return (
                    <button
                      key={choice}
                      onClick={() => chooseAnswer(choiceIndex)}
                      disabled={answered}
                      className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left font-bold transition ${isCorrect ? "border-green-500 bg-green-50 text-green-800" : isWrong ? "border-red-400 bg-red-50 text-red-800" : "border-border bg-card hover:-translate-y-0.5 hover:border-primary"} ${answered && !isCorrect && !isWrong ? "opacity-60" : ""}`}
                    >
                      <span className="mr-3 inline-grid h-8 w-8 place-items-center rounded-full bg-muted text-sm">{String.fromCharCode(65 + choiceIndex)}</span>
                      {choice}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div className={`mt-5 rounded-2xl p-4 ${correct ? "bg-green-100 text-green-900" : "bg-amber-100 text-amber-900"}`}>
                  <p className="font-extrabold">{correct ? "🎉 Chính xác! Bé giỏi quá!" : "🌱 Chưa đúng, mình cùng học nhé!"}</p>
                  <p className="mt-1 text-sm">{question.hint}</p>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button onClick={nextQuestion} disabled={!answered} className="rounded-xl bg-primary px-6 py-3 font-display font-extrabold text-primary-foreground shadow-chunky disabled:cursor-not-allowed disabled:opacity-40">
                  {index === lesson.questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo →"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
