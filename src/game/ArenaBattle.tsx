import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Character3D, makeAnimState } from "@/game/Character3D";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/hooks/use-player";
import { toAvatar, type Avatar } from "@/lib/avatar";
import { generateQuestion, type Question, type Subject } from "./learningEngine";

type Phase = "waiting" | "countdown" | "playing";
type ArenaPlayer = {
  id: string;
  name: string;
  avatar: unknown;
  grade: number;
  joinedAt: number;
  ready: boolean;
};
type GameMessage = { startsAt: number; question: Question; questionIndex: number };
type Props = { currentGrade: number; profile: Profile; onExit?: () => void };

const SUBJECTS: Subject[] = ["math", "vietnamese", "english"];
const subjectName: Record<Subject, string> = {
  math: "Toán học",
  vietnamese: "Tiếng Việt",
  english: "Tiếng Anh",
};

function randomQuestion(grade: number): Question {
  const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)] ?? "math";
  return generateQuestion(subject, grade, 50);
}

function PlayerPodium({ player, index }: { player: ArenaPlayer; index: number }) {
  const x = (index % 4 - 1.5) * 2.25;
  const z = index < 4 ? 1.25 : -2.3;
  const avatar: Avatar = toAvatar(player.avatar);
  const animation = useRef(makeAnimState());
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.88, 0.36, 32]} />
        <meshStandardMaterial color={index === 0 ? "#e8b84f" : "#5f91c5"} metalness={0.16} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.64, 0.72, 0.08, 32]} />
        <meshStandardMaterial color="#f9e1a4" metalness={0.12} roughness={0.4} />
      </mesh>
      <group position={[0, 0.44, 0]}>
        <Character3D avatar={avatar} state={animation} />
      </group>
      <Html position={[0, 2.55, 0]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
        <div style={{ whiteSpace: "nowrap", borderRadius: 999, border: "2px solid #fff4d0", background: "rgba(18,39,72,.94)", color: "#fff8df", padding: "4px 12px", font: "900 12px Nunito,sans-serif", boxShadow: "0 3px 10px #0005" }}>
          {player.name}{player.ready ? " • SẴN SÀNG ✓" : " • ĐANG CHỜ"}
        </div>
      </Html>
    </group>
  );
}

function ArenaStage({ players }: { players: ArenaPlayer[] }) {
  return (
    <div className="h-[280px] w-full overflow-hidden rounded-3xl border-4 border-amber-200/70 bg-gradient-to-b from-sky-200 to-indigo-300 shadow-inner sm:h-[340px]">
      <Canvas shadows camera={{ position: [0, 7.5, 13.5], fov: 42 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#b7dff5"]} />
        <ambientLight intensity={1.35} />
        <hemisphereLight args={["#ffffff", "#98734f", 1.1]} />
        <directionalLight position={[-5, 10, 7]} intensity={2} castShadow />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
          <planeGeometry args={[18, 12]} />
          <meshStandardMaterial color="#d5b17d" roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.08, -4.1]} castShadow>
          <boxGeometry args={[11, 0.16, 0.35]} />
          <meshStandardMaterial color="#8a4e32" />
        </mesh>
        <mesh position={[0, 2.05, -4.28]}>
          <boxGeometry args={[8.5, 2.8, 0.18]} />
          <meshStandardMaterial color="#173d55" emissive="#0b2638" emissiveIntensity={0.3} />
        </mesh>
        <Html position={[0, 2.35, -4.12]} center distanceFactor={11}>
          <div style={{ width: 390, textAlign: "center", color: "#fff1c7", font: "1000 24px Nunito,sans-serif", textShadow: "0 2px 4px #0009" }}>🏆 ĐẤU TRƯỜNG TRI THỨC</div>
        </Html>
        {players.slice(0, 8).map((player, index) => <PlayerPodium key={player.id} player={player} index={index} />)}
      </Canvas>
    </div>
  );
}

export function ArenaBattle({ currentGrade, profile, onExit }: Props) {
  const [players, setPlayers] = useState<ArenaPlayer[]>([]);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [startsAt, setStartsAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [advanceAt, setAdvanceAt] = useState<number | null>(null);
  const [advanceSeconds, setAdvanceSeconds] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastQuestionAction = useRef(0);
  const questionIndexRef = useRef(0);
  const startSentRef = useRef(false);

  const self = useMemo<ArenaPlayer>(() => ({
    id: profile.id,
    name: profile.display_name || "Bạn học",
    avatar: profile.avatar,
    grade: currentGrade,
    joinedAt: 0,
    ready: false,
  }), [profile.id, profile.display_name, profile.avatar, currentGrade]);

  const applyGameStart = useCallback((message: GameMessage) => {
    setQuestion(message.question);
    setQuestionIndex(message.questionIndex);
    questionIndexRef.current = message.questionIndex;
    setSelected(null);
    setStartsAt(message.startsAt);
    setPhase("countdown");
    setCountdown(3);
    setScore(0);
    setAnswered(0);
    setAdvanceAt(null);
    setAdvanceSeconds(0);
  }, []);

  useEffect(() => {
    let alive = true;
    const channel = supabase.channel("be-vui-hoc-arena-lobby", {
      config: { presence: { key: profile.id }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    const refreshPlayers = () => {
      if (!alive) return;
      const state = channel.presenceState<ArenaPlayer>();
      const all = Object.values(state).flat();
      const unique = new Map<string, ArenaPlayer>();
      all.forEach((player) => {
        if (player?.id && player.id !== profile.id) unique.set(player.id, player);
      });
      const ownPresence = all.find((player) => player?.id === profile.id);
      unique.set(profile.id, { ...self, joinedAt: ownPresence?.joinedAt ?? Date.now(), ready: Boolean(ownPresence?.ready) });
      setPlayers([...unique.values()].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)));
    };

    channel
      .on("presence", { event: "sync" }, refreshPlayers)
      .on("presence", { event: "join" }, refreshPlayers)
      .on("presence", { event: "leave" }, refreshPlayers)
      .on("broadcast", { event: "game-start" }, ({ payload }) => {
        if (!alive || !payload || typeof payload !== "object") return;
        const message = payload as GameMessage;
        if (typeof message.startsAt === "number" && message.question?.question && Array.isArray(message.question.options)) applyGameStart(message);
      })
      .on("broadcast", { event: "answer-submitted" }, ({ payload }) => {
        if (!alive || !payload || typeof payload !== "object") return;
        const message = payload as { questionIndex?: number; advanceAt?: number };
        if (message.questionIndex === questionIndexRef.current && typeof message.advanceAt === "number") {
          setAdvanceAt((current) => current === null ? message.advanceAt! : Math.min(current, message.advanceAt!));
        }
      })
      .on("broadcast", { event: "next-question" }, ({ payload }) => {
        if (!alive || !payload || typeof payload !== "object") return;
        const message = payload as GameMessage;
        if (typeof message.startsAt === "number" && message.question?.question && Array.isArray(message.question.options)) applyGameStart(message);
      })
      .subscribe(async (status) => {
        if (!alive || status !== "SUBSCRIBED") return;
        await channel.track({ ...self, joinedAt: Date.now(), ready: false });
        refreshPlayers();
      });

    return () => {
      alive = false;
      if (channelRef.current === channel) channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [profile.id, self, applyGameStart]);

  useEffect(() => {
    if (phase !== "countdown" || startsAt === null) return;
    const update = () => {
      const left = Math.max(0, Math.ceil((startsAt - Date.now()) / 1000));
      setCountdown(left);
      if (left <= 0) setPhase("playing");
    };
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [phase, startsAt]);

  const markReady = async () => {
    if (phase !== "waiting" || players.some((player) => player.id === profile.id && player.ready)) return;
    setPlayers((current) => current.map((player) => player.id === profile.id ? { ...player, ready: true } : player));
    await channelRef.current?.track({ ...self, joinedAt: players.find((player) => player.id === profile.id)?.joinedAt ?? Date.now(), ready: true });
  };

  useEffect(() => {
    if (phase !== "waiting" || players.length < 2 || !players.every((player) => player.ready)) return;
    if (players[0]?.id !== profile.id || startSentRef.current) return;
    startSentRef.current = true;
    const message: GameMessage = {
      startsAt: Date.now() + 3000,
      question: randomQuestion(currentGrade),
      questionIndex: 1,
    };
    applyGameStart(message);
    void channelRef.current?.send({ type: "broadcast", event: "game-start", payload: message });
  }, [players, phase, profile.id, currentGrade, applyGameStart]);

  const nextQuestion = useCallback(() => {
    if (Date.now() - lastQuestionAction.current < 1200) return;
    lastQuestionAction.current = Date.now();
    const message: GameMessage = {
      startsAt: Date.now() + 3000,
      question: randomQuestion(currentGrade),
      questionIndex: questionIndexRef.current + 1,
    };
    applyGameStart(message);
    void channelRef.current?.send({ type: "broadcast", event: "next-question", payload: message });
  }, [currentGrade, applyGameStart]);

  useEffect(() => {
    if (phase !== "playing" || advanceAt === null) return;
    const update = () => setAdvanceSeconds(Math.max(0, Math.ceil((advanceAt - Date.now()) / 1000)));
    update();
    const interval = window.setInterval(update, 200);
    let timeout: number | undefined;
    if (players[0]?.id === profile.id) {
      timeout = window.setTimeout(() => {
        if (questionIndexRef.current === questionIndex) nextQuestion();
      }, Math.max(0, advanceAt - Date.now()));
    }
    return () => { window.clearInterval(interval); if (timeout !== undefined) window.clearTimeout(timeout); };
  }, [phase, advanceAt, players, profile.id, questionIndex, nextQuestion]);

  const answer = (value: string) => {
    if (!question || selected !== null || phase !== "playing" || advanceAt !== null) return;
    setSelected(value);
    setAnswered((n) => n + 1);
    if (value === question.correctAnswer) setScore((n) => n + 1);
    const deadline = Date.now() + 10000;
    setAdvanceAt(deadline);
    void channelRef.current?.send({ type: "broadcast", event: "answer-submitted", payload: { questionIndex, advanceAt: deadline } });
  };

  const leaveCompetition = () => {
    const activeChannel = channelRef.current;
    if (activeChannel) void supabase.removeChannel(activeChannel);
    channelRef.current = null;
    setPhase("waiting");
    setStartsAt(null);
    setQuestion(null);
    setSelected(null);
    setScore(0);
    setAnswered(0);
    setAdvanceAt(null);
    setAdvanceSeconds(0);
    onExit?.();
  };

  const correct = !!question && selected === question.correctAnswer;
  const subject = question ? subjectName[question.subject] : "";

  return (
    <main className="relative min-h-[calc(100dvh-5rem)] overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-sky-950 p-3 text-white sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[.25em] text-amber-300">BÉ VUI HỌC • LỚP {currentGrade}</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">🏆 ĐẤU TRƯỜNG TRI THỨC</h1>
          <p className="mt-1 text-sm text-sky-100/80">Bé vào nhà là tự động lên bục chờ thi đấu.</p>
        </div>
        {onExit && <button onClick={leaveCompetition} className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold">← Rời đấu trường</button>}
      </header>

      <ArenaStage players={players} />

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="rounded-full bg-white/10 px-4 py-2 font-bold">👦👧 {players.length} bé đang chờ</span>
        <span className="rounded-full bg-white/10 px-4 py-2 font-bold">🎲 Câu hỏi ngẫu nhiên 3 môn</span>
        <span className="rounded-full bg-white/10 px-4 py-2 font-bold">⭐ {score} điểm của con</span>
      </div>

      {phase === "waiting" && (
        <section className="mx-auto mt-5 max-w-2xl rounded-3xl border border-amber-200/30 bg-white/10 p-5 text-center">
          <div className="text-4xl">🎤</div>
          <h2 className="mt-2 text-xl font-black text-amber-200">CÁC THÍ SINH VÀO VỊ TRÍ!</h2>
          <p className="mt-2 text-sm text-sky-100">Mỗi bé phải nhấn SẴN SÀNG. Bé bấm trước sẽ đứng chờ; đủ cả 2 bé sẵn sàng, trận đấu tự động bắt đầu.</p>
          <p className="mt-3 text-sm font-black text-amber-200">{players.filter((player) => player.ready).length}/{Math.max(2, players.length)} bé đã sẵn sàng</p>
          <button onClick={markReady} disabled={players.some((player) => player.id === profile.id && player.ready)} className="mt-4 rounded-full bg-emerald-400 px-9 py-4 text-lg font-black text-slate-950 shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60">{players.some((player) => player.id === profile.id && player.ready) ? "✓ CON ĐÃ SẴN SÀNG" : "🙋 SẴN SÀNG"}</button>
        </section>
      )}

      {phase === "countdown" && (
        <section className="mx-auto mt-5 max-w-xl rounded-3xl border border-amber-200/40 bg-white/10 p-5 text-center">
          <p className="text-sm font-black tracking-widest text-amber-200">TẤT CẢ THÍ SINH SẴN SÀNG</p>
          <div className="my-2 text-7xl font-black tabular-nums text-amber-300">{countdown > 0 ? countdown : "🚀"}</div>
          <p className="font-bold">Chuẩn bị bước vào phần thi!</p>
        </section>
      )}

      {phase === "playing" && question && (
        <section className="mx-auto mt-5 max-w-3xl rounded-3xl border border-sky-200/30 bg-white/10 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black text-amber-200">
            <span>🎲 CÂU HỎI NGẪU NHIÊN • {subject.toUpperCase()}</span>
            <span>CÂU {questionIndex}</span>
          </div>
          <h2 className="mt-4 text-center text-xl font-black leading-relaxed sm:text-2xl">{question.question}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {question.options.map((option, index) => {
              const right = selected !== null && option === question.correctAnswer;
              const wrong = selected === option && !right;
              return <button key={question.id + "-" + index} onClick={() => answer(option)} disabled={selected !== null} className={`rounded-2xl border-2 px-4 py-4 text-left font-bold transition ${right ? "border-emerald-300 bg-emerald-500 text-white" : wrong ? "border-rose-300 bg-rose-500 text-white" : "border-white/20 bg-slate-950/45 hover:border-amber-300"} disabled:cursor-default`}>
                <span className="mr-3 inline-grid h-8 w-8 place-items-center rounded-lg bg-white/15">{String.fromCharCode(65 + index)}</span>{option}
              </button>;
            })}
          </div>
          {selected !== null && (
            <div className={`mt-5 rounded-2xl p-4 text-center ${correct ? "bg-emerald-500/20 text-emerald-100" : "bg-amber-500/20 text-amber-100"}`}>
              <p className="text-lg font-black">{correct ? "🎉 Chính xác! Con giỏi lắm!" : "💪 Cố gắng nhé! Cùng thử câu tiếp theo."}</p>
              <p className="mt-1 text-sm">{question.explanation}</p>
              <p className="mt-2 text-xs">Điểm của con: {score} • Đã trả lời: {answered} câu</p>
              <div className="mt-4 rounded-xl border border-amber-200/30 bg-slate-950/30 px-4 py-3">
                <p className="text-sm font-black text-amber-200">⏳ Câu tiếp theo tự động sau {advanceSeconds} giây</p>
                <p className="mt-1 text-xs text-sky-100/80">Không thí sinh nào được tự bấm chuyển câu. Cả đấu trường sẽ cùng sang câu mới.</p>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default ArenaBattle;
