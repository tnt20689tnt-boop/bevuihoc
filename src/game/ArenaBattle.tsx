import { useState } from "react";
import { generateQuestion, type Question, type Subject } from "./learningEngine";

type Room = {
  subject: Subject;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  board: string;
  activities: string[];
};

const ROOMS: Room[] = [
  { subject: "math", title: "PHÒNG TOÁN HỌC", subtitle: "Khám phá những con số và thử thách tư duy", emoji: "➗", color: "from-sky-500 to-blue-700", board: "BẢNG CON SỐ", activities: ["Phép cộng – trừ", "Bảng nhân – chia", "Hình học & tư duy"] },
  { subject: "vietnamese", title: "PHÒNG TIẾNG VIỆT", subtitle: "Làm quen chữ cái, từ ngữ và những câu chuyện", emoji: "📖", color: "from-emerald-500 to-green-700", board: "GÓC TIẾNG VIỆT", activities: ["Chính tả", "Từ đồng nghĩa – trái nghĩa", "Đọc hiểu & ngữ pháp"] },
  { subject: "english", title: "PHÒNG TIẾNG ANH", subtitle: "Học từ vựng và mẫu câu tiếng Anh thật vui", emoji: "🔤", color: "from-orange-500 to-rose-600", board: "ENGLISH CORNER", activities: ["Từ vựng", "Mẫu câu cơ bản", "Đọc hiểu tiếng Anh"] },
];

type Props = { currentGrade: number; onExit?: () => void };

export function ArenaBattle({ currentGrade, onExit }: Props) {
  const [room, setRoom] = useState<Room | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [played, setPlayed] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const enterRoom = (nextRoom: Room) => {
    setRoom(nextRoom);
    setScore(0);
    setPlayed(0);
    setSelected(null);
    setShowResult(false);
    setQuestion(generateQuestion(nextRoom.subject, currentGrade, 50));
  };

  const answer = (value: string) => {
    if (!question || selected !== null) return;
    setSelected(value);
    setShowResult(true);
    setPlayed((n) => n + 1);
    if (value === question.correctAnswer) setScore((n) => n + 1);
  };

  const nextQuestion = () => {
    if (!room) return;
    setQuestion(generateQuestion(room.subject, currentGrade, 50));
    setSelected(null);
    setShowResult(false);
  };

  const backToRooms = () => {
    setRoom(null);
    setQuestion(null);
    setSelected(null);
    setShowResult(false);
  };

  const correct = !!question && selected === question.correctAnswer;

  return (
    <main className="relative min-h-[calc(100dvh-5rem)] overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-sky-950 p-4 text-white sm:p-7">
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
      <header className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[.28em] text-amber-300">BÉ VUI HỌC • LỚP {currentGrade}</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">🏆 ĐẤU TRƯỜNG TRI THỨC</h1>
          <p className="mt-1 text-sm text-sky-100/80">{room ? room.title : "Chọn lớp học mà con muốn khám phá hôm nay!"}</p>
        </div>
        {room ? (
          <button onClick={backToRooms} className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">← Chọn phòng khác</button>
        ) : onExit ? (
          <button onClick={onExit} className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">← Quay lại</button>
        ) : null}
      </header>

      {!room ? (
        <section className="relative z-10">
          <div className="mx-auto mb-7 max-w-2xl text-center">
            <div className="mb-3 text-6xl">🏫</div>
            <h2 className="text-xl font-black text-amber-200 sm:text-2xl">NGÔI TRƯỜNG TRI THỨC</h2>
            <p className="mt-2 text-sm text-sky-100">Ba cánh cửa đang chờ con. Hãy chọn một phòng để bước vào lớp và bắt đầu thử thách nhé!</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
            {ROOMS.map((item) => (
              <button key={item.subject} onClick={() => enterRoom(item)} className="group overflow-hidden rounded-3xl border-2 border-white/20 bg-white/10 text-left shadow-2xl transition hover:-translate-y-1 hover:border-amber-300/80 hover:bg-white/15">
                <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${item.color}`}>
                  <div className="absolute inset-x-5 top-5 h-2 rounded-full bg-white/25" />
                  <div className="absolute bottom-0 left-5 right-5 h-5 rounded-t-xl border-x-4 border-t-4 border-amber-100/70 bg-amber-900/30" />
                  <span className="text-7xl drop-shadow-lg transition group-hover:scale-110">{item.emoji}</span>
                  <span className="absolute right-4 top-4 rounded-full bg-black/20 px-3 py-1 text-xs font-black">LỚP {currentGrade}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black text-amber-200">{item.title}</h3>
                  <p className="mt-2 min-h-10 text-sm text-sky-100/90">{item.subtitle}</p>
                  <div className="mt-4 space-y-2">
                    {item.activities.map((activity) => <div key={activity} className="flex items-center gap-2 text-xs font-semibold text-white/80"><span className="text-emerald-300">✓</span>{activity}</div>)}
                  </div>
                  <div className="mt-5 rounded-xl bg-white/15 px-4 py-3 text-center text-sm font-black group-hover:bg-amber-300 group-hover:text-slate-950">VÀO LỚP HỌC →</div>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-7 text-center text-xs text-sky-100/60">Mỗi phòng có bộ câu hỏi riêng, tự điều chỉnh theo khối lớp của con.</p>
        </section>
      ) : (
        <section className="relative z-10 mx-auto max-w-3xl">
          <div className={`overflow-hidden rounded-3xl border-2 border-white/20 bg-gradient-to-br ${room.color} shadow-2xl`}>
            <div className="relative px-5 py-6 text-center sm:px-8">
              <div className="absolute inset-x-8 top-4 h-2 rounded-full bg-white/20" />
              <div className="mx-auto mt-4 max-w-xl rounded-2xl border-8 border-amber-900/70 bg-emerald-950 px-4 py-5 shadow-inner">
                <p className="text-xs font-black tracking-widest text-amber-200">{room.board}</p>
                <div className="mt-3 text-4xl">{room.emoji}</div>
                <p className="mt-2 text-lg font-black text-white">{room.title}</p>
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-bold">
                <span className="rounded-full bg-black/20 px-3 py-2">🎒 Lớp {currentGrade}</span>
                <span className="rounded-full bg-black/20 px-3 py-2">⭐ {score} điểm</span>
                <span className="rounded-full bg-black/20 px-3 py-2">📝 {played} câu đã làm</span>
              </div>
            </div>
            <div className="bg-slate-950/95 p-4 text-white sm:p-7">
              {question && (
                <>
                  <div className="mb-4 flex items-center justify-between gap-2 text-xs font-bold text-sky-200">
                    <span>GIỜ HỌC • LUYỆN TẬP</span><span>CÂU {played + (showResult ? 0 : 1)}</span>
                  </div>
                  <h2 className="mb-6 text-center text-xl font-black leading-relaxed sm:text-2xl">{question.question}</h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {question.options.map((option, index) => {
                      const isCorrect = showResult && option === question.correctAnswer;
                      const isWrong = showResult && selected === option && !isCorrect;
                      return <button key={`${question.id}-${index}`} onClick={() => answer(option)} disabled={showResult} className={`rounded-2xl border-2 px-4 py-4 text-left font-bold transition ${isCorrect ? "border-emerald-300 bg-emerald-500 text-white" : isWrong ? "border-rose-300 bg-rose-500 text-white" : "border-white/15 bg-white/5 hover:border-amber-300 hover:bg-white/10"} disabled:cursor-default`}>
                        <span className="mr-3 inline-grid h-8 w-8 place-items-center rounded-lg bg-white/15">{String.fromCharCode(65 + index)}</span>{option}
                      </button>;
                    })}
                  </div>
                  {showResult && (
                    <div className={`mt-5 rounded-2xl p-4 text-center ${correct ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-100"}`}>
                      <p className="text-lg font-black">{correct ? "🎉 Chính xác! Con giỏi lắm!" : "💪 Cố gắng nhé! Mình cùng học tiếp nào."}</p>
                      <p className="mt-2 text-sm">{question.explanation}</p>
                      <button onClick={nextQuestion} className="mt-4 rounded-full bg-amber-300 px-7 py-3 font-black text-slate-950 shadow-lg hover:bg-amber-200">CÂU TIẾP THEO →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button onClick={backToRooms} className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold hover:bg-white/20">🏫 Về sảnh chọn phòng</button>
            <button onClick={() => enterRoom(room)} className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold hover:bg-white/20">↻ Học lại phòng này</button>
          </div>
        </section>
      )}
    </main>
  );
}

export default ArenaBattle;
