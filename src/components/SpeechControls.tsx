import { useEffect, useState } from "react";
import {
  getSpeechStatus,
  isSpeechMuted,
  pauseSpeech,
  resumeSpeech,
  setSpeechMuted,
  speakQuiz,
  speakTest,
  stopSpeech,
} from "@/lib/quizSpeech";

type Props = {
  question: string;
  options: string[];
  locale?: string;
  isMath?: boolean;
};

export function SpeechControls({ question, options, locale = "vi-VN", isMath = false }: Props) {
  const [muted, setMuted] = useState(isSpeechMuted());
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      const status = getSpeechStatus();
      setSpeaking(status.speaking);
      setPaused(status.paused);
      setMuted(status.isMuted);
      setSupported(status.supported);
      setSpeechError(status.error);
    };
    refresh();
    const interval = window.setInterval(refresh, 250);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => () => stopSpeech(), []);

  const replay = () => {
    if (!muted) void speakQuiz(question, options, locale, isMath);
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
        onClick={() => speakTest(locale)}
        disabled={!supported || muted}
        className="rounded-xl border border-sky-300 bg-white px-3 py-2 font-extrabold text-sky-800 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        🔊 Nghe thử
      </button>
      <button
        type="button"
        onClick={replay}
        disabled={!supported || muted}
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
      {!supported ? (
        <span className="text-rose-700">Thiết bị chưa hỗ trợ đọc tự động</span>
      ) : speaking && !paused ? (
        <span className="ml-auto animate-pulse text-sky-700">● Đang đọc...</span>
      ) : paused ? (
        <span className="ml-auto text-amber-700">Đang tạm dừng</span>
      ) : null}
    </div>
  );
}
