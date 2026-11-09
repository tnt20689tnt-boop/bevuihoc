import { useCallback, useEffect, useRef, useState } from "react";
import { generateLevelQuestions, generateQuestion, type Question, type Subject } from "./learningEngine";

type Player = "p1" | "p2";
type GameState = "idle" | "playing" | "finished";
type Outcome = Player | "tie";

const QUESTION_SECONDS = 10;
const QUESTION_COUNT = 10;

function Contestant({ color, name, mood }: { color: string; name: string; mood: "happy" | "sad" | "ready" }) {
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 125" className="h-28 w-24 drop-shadow-xl" role="img" aria-label={name}>
        <path d="M20 48 Q17 9 50 9 Q83 9 80 48 L77 66 L23 66Z" fill="#4a2c2a" />
        <circle cx="50" cy="53" r="29" fill="#fcd1ba" />
        <circle cx="39" cy="49" r="3.5" fill="#202020" />
        <circle cx="61" cy="49" r="3.5" fill="#202020" />
        {mood === "happy" ? <path d="M39 64 Q50 77 61 64" stroke="#713f36" strokeWidth="3" fill="none" strokeLinecap="round" /> : mood === "sad" ? <path d="M39 70 Q50 59 61 70" stroke="#713f36" strokeWidth="3" fill="none" strokeLinecap="round" /> : <path d="M41 65 Q50 68 59 65" stroke="#713f36" strokeWidth="3" fill="none" strokeLinecap="round" />}
        <path d="M24 88 Q50 75 76 88 L86 124 H14Z" fill={color} />
        <path d="M25 94 L8 111 M75 94 L92 111" stroke="#fcd1ba" strokeWidth="9" strokeLinecap="round" />
      </svg>
      <span className="mt-1 rounded-full border border-white/20 bg-white/15 px-4 py-1 text-sm font-black text-white">{name}</span>
    </div>
  );
}

function Host() {
  return (
    <div className="flex flex-col items-center drop-shadow-lg">
      <svg viewBox="0 0 100 145" className="h-28 w-20" aria-label="Người dẫn chương trình">
        <path d="M26 51 Q23 20 50 20 Q77 20 74 51" fill="#252525" />
        <circle cx="50" cy="53" r="24" fill="#f5c9ae" />
        <circle cx="41" cy="52" r="2.5" /><circle cx="59" cy="52" r="2.5" />
        <path d="M41 64 Q50 71 59 64" stroke="#713f36" strokeWidth="2.5" fill="none" />
        <path d="M26 84 L74 84 L88 137 H12Z" fill="#be123c" />
        <path d="M45 84 L50 103 L55 84" fill="white" />
        <path d="M77 75 L85 70 L89 103" stroke="#d1d5db" strokeWidth="4" fill="none" />
        <circle cx="86" cy="68" r="7" fill="#374151" />
      </svg>
      <span className="rounded-full border border-red-300 bg-red-600 px-4 py-1 text-xs font-black tracking-widest text-white">MC</span>
    </div>
  );
}

const CROWD_COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

function Audience() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-24 items-end justify-center gap-1 overflow-hidden opacity-80 sm:h-32">
      {Array.from({ length: 28 }, (_, index) => (
        <div key={index} className="flex shrink-0 animate-bounce flex-col items-center" style={{ animationDelay: `${(index % 7) * 0.13}s`, animationDuration: "1.8s" }}>
          <span className="h-5 w-5 rounded-full bg-[#fcd1ba] sm:h-7 sm:w-7" />
          <span className="h-8 w-7 rounded-t-lg sm:h-12 sm:w-10" style={{ backgroundColor: CROWD_COLORS[index % CROWD_COLORS.length] }} />
        </div>
      ))}
    </div>
  );
}

export function ArenaBattle() {
  const [subject, setSubject] = useState<Subject>("math");
  const [grade, setGrade] = useState(2);
  const [level, setLevel] = useState(50);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Time, setP1Time] = useState(0);
  const [p2Time, setP2Time] = useState(0);
  const [p1Answer, setP1Answer] = useState<string | null>(null);
  const [p2Answer, setP2Answer] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [feedback, setFeedback] = useState("Hai thí sinh đã sẵn sàng chưa?");
  const startAt = useRef(0);
  const answersRef = useRef<{ p1: string | null; p2: string | null }>({ p1: null, p2: null });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentQuestion = questions[questionIndex];

  const stopTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (advanceRef.current) clearTimeout(advanceRef.current);
    timerRef.current = null;
    advanceRef.current = null;
  }, []);

  const winner: Outcome = p1Score > p2Score ? "p1" : p2Score > p1Score ? "p2" : p1Time < p2Time ? "p1" : p2Time < p1Time ? "p2" : "tie";

  const advanceQuestion = useCallback(() => {
    stopTimers();
    if (questionIndex >= questions.length - 1) {
      setGameState("finished");
      setFeedback("Trận đấu đã kết thúc!");
      return;
    }
    setQuestionIndex((index) => index + 1);
  }, [questionIndex, questions.length, stopTimers]);

  const beginQuestion = useCallback(() => {
    answersRef.current = { p1: null, p2: null };
    setP1Answer(null);
    setP2Answer(null);
    setExpired(false);
    setTimeLeft(QUESTION_SECONDS);
    startAt.current = Date.now();
    setFeedback("Nhanh tay chọn đáp án chính xác!");
    stopTimers();
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, QUESTION_SECONDS - Math.floor((Date.now() - startAt.current) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        stopTimers();
        setExpired(true);
        setFeedback("Hết giờ! MC công bố đáp án.");
        advanceRef.current = setTimeout(() => advanceQuestion(), 1400);
      }
    }, 150);
  }, [advanceQuestion, stopTimers]);

  useEffect(() => {
    if (gameState === "playing" && currentQuestion) beginQuestion();
    return stopTimers;
  }, [gameState, questionIndex, currentQuestion, beginQuestion, stopTimers]);

  useEffect(() => () => stopTimers(), [stopTimers]);

  const startGame = () => {
    stopTimers();
    const generated = generateLevelQuestions(subject, grade, level, QUESTION_COUNT);
    const complete = [...generated];
    while (complete.length < QUESTION_COUNT) complete.push(generateQuestion(subject, grade, level));
    setQuestions(complete.slice(0, QUESTION_COUNT));
    setQuestionIndex(0);
    setP1Score(0);
    setP2Score(0);
    setP1Time(0);
    setP2Time(0);
    answersRef.current = { p1: null, p2: null };
    setP1Answer(null);
    setP2Answer(null);
    setGameState("playing");
  };

  const handleAnswer = (player: Player, answer: string) => {
    if (gameState !== "playing" || expired || !currentQuestion || answersRef.current[player]) return;
    const elapsed = Math.min(QUESTION_SECONDS, (Date.now() - startAt.current) / 1000);
    answersRef.current[player] = answer;
    if (player === "p1") setP1Answer(answer);
    else setP2Answer(answer);

    if (answer === currentQuestion.correctAnswer) {
      if (player === "p1") {
        setP1Score((score) => score + 1);
        setP1Time((time) => time + elapsed);
      } else {
        setP2Score((score) => score + 1);
        setP2Time((time) => time + elapsed);
      }
      setFeedback(player === "p1" ? "Bạn 1 trả lời chính xác!" : "Bạn 2 trả lời chính xác!");
    } else {
      setFeedback(player === "p1" ? "Bạn 1 chưa chính xác!" : "Bạn 2 chưa chính xác!");
    }

    const other = player === "p1" ? "p2" : "p1";
    if (answersRef.current[other] !== null) {
      stopTimers();
      advanceRef.current = setTimeout(() => advanceQuestion(), 1300);
    }
  };

  const getMood = (player: Player): "happy" | "sad" | "ready" => {
    if (gameState !== "finished") return "ready";
    if (winner === "tie") return "ready";
    return winner === player ? "happy" : "sad";
  };

  return (
    <main className="relative flex min-h-[calc(100dvh-5rem)] w-full flex-col overflow-hidden rounded-2xl bg-[#090d25] font-sans text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(250,204,21,0.28),transparent_65%)]" />
      <div className="absolute inset-x-0 top-0 h-28 border-b-4 border-yellow-500/40 bg-gradient-to-b from-indigo-950 to-transparent" />
      <div className="absolute left-1/2 top-24 h-64 w-[min(90%,800px)] -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="relative z-10 flex items-center justify-between gap-2 px-4 py-3 sm:px-8">
        <div><p className="text-xs font-bold tracking-[0.25em] text-yellow-300">BÉ VUI HỌC</p><h1 className="text-lg font-black sm:text-2xl">ĐẤU TRƯỜNG TRÍ TUỆ</h1></div>
        <div className="rounded-full border border-yellow-400/40 bg-black/30 px-3 py-1 text-xs font-bold text-yellow-200">2 THÍ SINH • 10 CÂU</div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-between gap-4 px-3 pb-28 pt-1 sm:px-6 sm:pb-32">
        <div className="flex w-full items-center justify-center gap-4 sm:gap-10">
          <div className="hidden sm:block"><Contestant color="#be123c" name="MC" mood="ready" /></div>
          <div className="text-center"><Host /><p className="mt-1 text-sm font-bold text-amber-200">Sân khấu đang nóng lên!</p></div>
          <div className="hidden sm:block"><div className="rounded-2xl border border-yellow-400/30 bg-indigo-950/70 px-4 py-3 text-center"><div className="text-xs text-indigo-200">ĐANG THI ĐẤU</div><div className="text-2xl font-black text-yellow-300">{gameState === "playing" ? `${questionIndex + 1}/10` : "★"}</div></div></div>
        </div>

        {gameState === "idle" && (
          <section className="z-20 my-4 w-full max-w-xl rounded-3xl border border-yellow-300/40 bg-indigo-950/90 p-5 text-center shadow-2xl sm:p-8">
            <div className="mb-3 text-5xl">🏆</div><h2 className="text-2xl font-black text-yellow-300 sm:text-3xl">Sẵn sàng tranh tài?</h2>
            <p className="my-3 text-sm text-indigo-100">Hai thí sinh cùng trả lời một bộ câu hỏi. Mỗi câu có 10 giây, đúng được 1 điểm.</p>
            <div className="grid grid-cols-3 gap-2 text-left">
              <label className="text-xs font-bold text-indigo-200">Môn học<select value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className="mt-1 w-full rounded-xl bg-white p-2 text-sm font-bold text-slate-900"><option value="math">Toán</option><option value="vietnamese">Tiếng Việt</option><option value="english">Tiếng Anh</option></select></label>
              <label className="text-xs font-bold text-indigo-200">Khối lớp<select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="mt-1 w-full rounded-xl bg-white p-2 text-sm font-bold text-slate-900">{[1,2,3,4,5].map((n) => <option key={n} value={n}>Lớp {n}</option>)}</select></label>
              <label className="text-xs font-bold text-indigo-200">Level<input type="number" min={1} max={100} value={level} onChange={(e) => setLevel(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className="mt-1 w-full rounded-xl bg-white p-2 text-sm font-bold text-slate-900" /></label>
            </div>
            <button onClick={startGame} className="mt-5 w-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-3 text-lg font-black text-slate-950 shadow-lg transition hover:scale-[1.02]">BẮT ĐẦU THI ĐẤU</button>
          </section>
        )}

        {gameState === "playing" && currentQuestion && (
          <section className="z-20 w-full max-w-4xl rounded-3xl border border-white/20 bg-slate-950/80 p-4 text-center shadow-2xl backdrop-blur-md sm:p-6">
            <div className="mb-3 flex items-center justify-between text-xs font-bold text-indigo-100 sm:text-sm">
              <span>CÂU {questionIndex + 1} / {questions.length}</span>
              <span className={timeLeft <= 3 ? "animate-pulse text-red-400" : "text-yellow-300"}>⏱ {timeLeft} GIÂY</span>
            </div>
            <div className="mx-auto mb-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-yellow-300 transition-all" style={{ width: `${(timeLeft / QUESTION_SECONDS) * 100}%` }} /></div>
            <h2 className="mb-4 text-xl font-black leading-snug sm:text-3xl">{currentQuestion.question}</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {currentQuestion.options.map((option, index) => {
                const selectedByP1 = p1Answer === option;
                const selectedByP2 = p2Answer === option;
                const revealed = expired || p1Answer !== null && p2Answer !== null;
                const correct = revealed && option === currentQuestion.correctAnswer;
                return <div key={`${currentQuestion.id}-${index}`} className={`rounded-xl border-2 px-2 py-3 text-sm font-bold sm:px-4 sm:py-4 sm:text-lg ${correct ? "border-emerald-300 bg-emerald-500 text-white" : "border-white/15 bg-white/5 text-white"} ${selectedByP1 ? "ring-2 ring-blue-400" : ""} ${selectedByP2 ? "ring-2 ring-pink-400" : ""}`}>
                  <span className="mr-2 text-yellow-300">{String.fromCharCode(65 + index)}.</span>{option}
                  <div className="mt-1 flex justify-center gap-1">{selectedByP1 && <span className="rounded bg-blue-600 px-2 text-[10px]">BẠN 1</span>}{selectedByP2 && <span className="rounded bg-pink-600 px-2 text-[10px]">BẠN 2</span>}</div>
                </div>;
              })}
            </div>
            <p className="mt-3 min-h-5 text-sm font-bold text-yellow-200">{feedback}</p>
          </section>
        )}

        <div className="z-20 grid w-full max-w-4xl grid-cols-2 items-end gap-3 sm:gap-12">
          {(["p1", "p2"] as Player[]).map((player) => {
            const isP1 = player === "p1";
            const answer = isP1 ? p1Answer : p2Answer;
            const score = isP1 ? p1Score : p2Score;
            const color = isP1 ? "#2563eb" : "#db2777";
            return <div key={player} className="flex flex-col items-center">
              <div className={`mb-2 rounded-full border px-4 py-1 text-sm font-black shadow-lg sm:px-6 sm:py-2 sm:text-lg ${isP1 ? "border-blue-300 bg-blue-700" : "border-pink-300 bg-pink-700"}`}>{isP1 ? "BẠN 1" : "BẠN 2"} • {score} điểm</div>
              <Contestant color={color} name={isP1 ? "Thí sinh xanh" : "Thí sinh hồng"} mood={getMood(player)} />
              <div className={`mt-2 grid w-full max-w-[230px] grid-cols-4 gap-1 rounded-t-2xl border-x-4 border-t-4 p-2 shadow-2xl sm:gap-2 sm:p-3 ${isP1 ? "border-blue-300 bg-gradient-to-b from-blue-800 to-blue-950" : "border-pink-300 bg-gradient-to-b from-pink-800 to-pink-950"}`}>
                {(currentQuestion?.options ?? ["A", "B", "C", "D"]).map((option, index) => <button key={index} onClick={() => handleAnswer(player, option)} disabled={gameState !== "playing" || !!answer || expired} className={`aspect-square rounded-lg text-sm font-black transition sm:text-lg ${answer === option ? "bg-yellow-300 text-slate-950" : isP1 ? "bg-blue-500/70 text-white hover:bg-blue-400" : "bg-pink-500/70 text-white hover:bg-pink-400"} disabled:cursor-not-allowed disabled:opacity-60`}>{String.fromCharCode(65 + index)}</button>)}
              </div>
              <p className="mt-1 text-[10px] text-indigo-200 sm:text-xs">{answer ? "Đã khóa đáp án" : "Chọn A • B • C • D"}</p>
            </div>;
          })}
        </div>

        {gameState === "finished" && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-3xl border-2 border-yellow-400 bg-gradient-to-b from-indigo-900 to-slate-950 p-5 text-center shadow-2xl sm:p-8">
              <div className="text-5xl">🏆</div><h2 className="my-2 text-3xl font-black text-yellow-300">KẾT QUẢ CHUNG CUỘC</h2>
              <p className="mb-5 text-sm text-indigo-100">{winner === "tie" ? "Hai thí sinh hòa nhau!" : winner === "p1" ? "Bạn 1 là nhà vô địch!" : "Bạn 2 là nhà vô địch!"}</p>
              <div className="grid grid-cols-2 gap-3">
                {(["p1", "p2"] as Player[]).map((player) => {
                  const win = winner === player;
                  const score = player === "p1" ? p1Score : p2Score;
                  const seconds = player === "p1" ? p1Time : p2Time;
                  return <div key={player} className={`rounded-2xl border p-3 ${win ? "border-emerald-300 bg-emerald-500/15" : "border-white/20 bg-white/5"}`}><div className="text-4xl">{winner === "tie" ? "🤝" : win ? "😄" : "😢"}</div><div className="font-black">{player === "p1" ? "BẠN 1" : "BẠN 2"}</div><div className="mt-1 text-lg font-black text-yellow-200">{score} điểm</div><div className="text-xs text-indigo-200">Thời gian đúng: {seconds.toFixed(1)} giây</div>{win && <div className="mt-2 text-xs font-black text-emerald-300">CHIẾN THẮNG</div>}</div>;
                })}
              </div>
              <p className="mt-4 text-xs text-indigo-200">Nếu bằng điểm, thí sinh có tổng thời gian trả lời đúng ngắn hơn sẽ thắng.</p>
              <button onClick={() => { setGameState("idle"); setQuestions([]); }} className="mt-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-3 font-black text-slate-950">THI ĐẤU LẠI</button>
            </div>
          </div>
        )}
      </div>
      <Audience />
    </main>
  );
}

export default ArenaBattle;
