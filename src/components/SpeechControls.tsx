import { useEffect, useState } from "react";
import {
  getSpeechStatus,
  isSpeechMuted,
  pauseSpeech,
  resumeSpeech,
  setSpeechMuted,
  speakQuiz,
  speakText,
  speakTest,
  stopSpeech,
  type SpeechDiagnostics,
} from "@/lib/quizSpeech";

type Props = {
  question: string;
  options: string[];
  text?: string;
  locale?: string;
  isMath?: boolean;
};

export function SpeechControls({ question, options, text, locale = "vi-VN", isMath = false }: Props) {
  const [muted, setMuted] = useState(isSpeechMuted());
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const [state, setState] = useState(() => getSpeechStatus().state);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<SpeechDiagnostics>(() => getSpeechStatus().diagnostics);

  useEffect(() => {
    const refresh = () => {
      const status = getSpeechStatus();
      setSpeaking(status.speaking);
      setPaused(status.paused);
      setMuted(status.isMuted);
      setSupported(status.supported);
      setState(status.state);
      setSpeechError(status.error);
      setDiagnostics(status.diagnostics);
    };
    refresh();
    const interval = window.setInterval(refresh, 250);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => () => stopSpeech(), []);

  const replay = () => {
    if (muted) return;
    if (text !== undefined) void speakText(text, locale);
    else if (question.trim() || options.length) void speakQuiz(question, options, locale, isMath);
  };

  const playbackLabel: Record<SpeechDiagnostics["playback"], string> = {
    idle: "chưa kiểm tra",
    requesting: "đang gọi API",
    starting: "đang khởi động",
    playing: "đang phát",
    played: "phát xong",
    native: "đã phát bằng giọng trình duyệt",
    blocked: "bị trình duyệt chặn",
    failed: "phát thất bại",
  };

  const toggleMute = () => {
    const next = !muted;
    setSpeechMuted(next);
    setMuted(next);
    setSpeaking(false);
    setPaused(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50/90 p-2 text-xs font-bold text-sky-950 shadow-sm" aria-label="Điều khiển giọng đọc">
      <button
        type="button"
        onClick={() => void speakTest(locale)}
        disabled={!supported || muted}
        className="rounded-xl border border-sky-300 bg-white px-3 py-2 font-extrabold text-sky-800 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        🔊 Nghe thử
      </button>
      <button
        type="button"
        onClick={replay}
        disabled={!supported || muted || (!text && !question.trim() && options.length === 0)}
        className="rounded-xl bg-sky-600 px-3 py-2 font-extrabold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        🔄 Đọc lại
      </button>
      {(speaking || paused) && (
        <button
          type="button"
          onClick={() => (paused ? resumeSpeech() : pauseSpeech())}
          className="rounded-xl bg-amber-500 px-3 py-2 font-extrabold text-white transition hover:bg-amber-600"
        >
          {paused ? "▶️ Tiếp tục" : "⏸️ Tạm dừng"}
        </button>
      )}
      <button
        type="button"
        onClick={toggleMute}
        className={`rounded-xl px-3 py-2 font-extrabold transition ${
          muted
            ? "border border-rose-300 bg-rose-100 text-rose-800"
            : "border border-emerald-300 bg-emerald-100 text-emerald-800"
        }`}
      >
        {muted ? "🔇 Giọng đọc: Đã tắt" : "🔊 Giọng đọc: Đang bật"}
      </button>
      {speechError && !muted && (
        <span role="status" className="w-full text-rose-700">Lỗi giọng đọc: {speechError}</span>
      )}
      {diagnostics.playback !== "idle" && (
        <details className="w-full rounded-lg bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-700">
          <summary className="cursor-pointer">Kiểm tra âm thanh: {playbackLabel[diagnostics.playback]}</summary>
          <p className="mt-1 break-words">
            API: {diagnostics.apiStatus === null ? "chưa gọi (dùng bộ nhớ đệm)" : `HTTP ${diagnostics.apiStatus}`} ·
            Dung lượng: {diagnostics.bytes === null ? "—" : `${diagnostics.bytes.toLocaleString("vi-VN")} byte`} ·
            Định dạng: {diagnostics.mimeType ?? diagnostics.contentType ?? "chưa nhận diện"} ·
            Giải mã: {diagnostics.decoded === null ? "không cần/không có AudioContext" : diagnostics.decoded ? "thành công" : "thất bại"}
          </p>
          {diagnostics.error && <p className="mt-1 text-rose-700">Chi tiết: {diagnostics.error}</p>}
        </details>
      )}
      {!supported ? (
        <span className="text-rose-700">Thiết bị chưa hỗ trợ đọc tự động</span>
      ) : state === "loading-audio" ? (
        <span className="ml-auto text-sky-700">Đang tạo âm thanh…</span>
      ) : state === "starting" ? (
        <span className="ml-auto text-sky-700">Đang khởi động trình phát…</span>
      ) : speaking && !paused ? (
        <span className="ml-auto animate-pulse text-sky-700">● Đang đọc...</span>
      ) : paused ? (
        <span className="ml-auto text-amber-700">Đang tạm dừng</span>
      ) : null}
    </div>
  );
}
