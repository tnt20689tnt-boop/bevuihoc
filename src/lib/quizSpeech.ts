type SpeechState = "ready" | "unsupported" | "loading-voices" | "speaking" | "error";
let activeUtterance: SpeechSynthesisUtterance | null = null;
let runToken = 0;
let speechState: SpeechState = "ready";
let lastSpeechError: string | null = null;
let unlockInstalled = false;
const getSpeech = (): SpeechSynthesis | null => {
  try {
    return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  } catch {
    return null;
  }
};

function selectVoice(voices: SpeechSynthesisVoice[], locale: string) {
  const normalized = locale.toLowerCase();
  return voices.find((voice) => voice.lang.toLowerCase() === normalized)
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(normalized.slice(0, 2)))
    ?? voices[0];
}

function installGestureUnlock() {
  if (unlockInstalled || typeof document === "undefined") return;
  unlockInstalled = true;
  const unlock = () => {
    const synth = getSpeech();
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") return;
    try {
      // A short, muted utterance inside the user's first tap unlocks speech on iOS Safari.
      const utterance = new SpeechSynthesisUtterance(" ");
      utterance.volume = 0;
      utterance.rate = 1;
      synth.speak(utterance);
      synth.resume();
    } catch (error) {
      lastSpeechError = error instanceof Error ? error.message : String(error);
      speechState = "error";
    }
    document.removeEventListener("pointerdown", unlock, true);
    document.removeEventListener("touchend", unlock, true);
    document.removeEventListener("keydown", unlock, true);
  };
  document.addEventListener("pointerdown", unlock, true);
  document.addEventListener("touchend", unlock, true);
  document.addEventListener("keydown", unlock, true);
}
if (typeof document !== "undefined") installGestureUnlock();

export function getSpeechStatus() {
  const synth = getSpeech();
  return {
    supported: Boolean(synth && typeof SpeechSynthesisUtterance !== "undefined"),
    state: speechState,
    error: lastSpeechError,
    voices: synth?.getVoices().length ?? 0,
    speaking: Boolean(synth?.speaking),
  };
}

export function stopSpeech() {
  runToken += 1;
  const synth = getSpeech();
  if (synth) {
    try { synth.cancel(); } catch (error) {
      lastSpeechError = error instanceof Error ? error.message : String(error);
    }
  }
  activeUtterance = null;
  if (speechState === "speaking") speechState = "ready";
}

export function primeSpeech(locale = "vi-VN") {
  const synth = getSpeech();
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
    speechState = "unsupported";
    lastSpeechError = "Trình duyệt không hỗ trợ đọc văn bản.";
    return;
  }
  try {
    // Called directly by a real user gesture (e.g. pressing Ready/Start).
    const utterance = new SpeechSynthesisUtterance(locale.startsWith("en") ? "Audio is ready." : "Âm thanh đã sẵn sàng.");
    utterance.lang = locale;
    utterance.rate = 0.9;
    utterance.volume = 0.65;
    const voices = synth.getVoices();
    const voice = selectVoice(voices, locale);
    if (voice) utterance.voice = voice;
    activeUtterance = utterance;
    utterance.onend = () => { if (activeUtterance === utterance) activeUtterance = null; };
    utterance.onerror = (event) => {
      if (activeUtterance === utterance) activeUtterance = null;
      lastSpeechError = event.error || "Không phát được âm thanh.";
      speechState = "error";
    };
    synth.speak(utterance);
    synth.resume();
    speechState = "speaking";
    lastSpeechError = null;
  } catch (error) {
    activeUtterance = null;
    speechState = "error";
    lastSpeechError = error instanceof Error ? error.message : String(error);
  }
}

function speakOne(text: string, locale: string, token: number): Promise<void> {
  const synth = getSpeech();
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
    speechState = "unsupported";
    lastSpeechError = "Thiết bị hoặc trình duyệt không hỗ trợ Speech Synthesis.";
    return Promise.resolve();
  }
  if (token !== runToken || !text.trim()) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    let fallbackTimer: number | undefined;
    const finish = (error?: string) => {
      if (settled) return;
      settled = true;
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
      if (activeUtterance === utterance) activeUtterance = null;
      if (error) {
        lastSpeechError = error;
        speechState = "error";
      } else if (token === runToken) {
        speechState = "ready";
      }
      resolve();
    };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.85;
    const voices = synth.getVoices();
    const voice = selectVoice(voices, locale);
    if (voice) utterance.voice = voice;
    utterance.onend = () => finish();
    utterance.onerror = (event) => finish(event.error || "Trình duyệt từ chối phát âm thanh.");
    activeUtterance = utterance;
    speechState = "speaking";
    lastSpeechError = null;
    try {
      synth.speak(utterance);
      synth.resume();
      // Prevent a browser speech queue from leaving the next answer stuck forever.
      fallbackTimer = window.setTimeout(() => finish("Đọc quá thời gian chờ. Hãy chạm nút Nghe thử để bật lại âm thanh."), 20000);
    } catch (error) {
      finish(error instanceof Error ? error.message : String(error));
    }
  });
}

export function naturalizeMath(text: string): string {
  return text
    .replace(/(\d+)\s*\+\s*(\d+)/g, "$1 cộng $2")
    .replace(/(\d+)\s*[-−]\s*(\d+)/g, "$1 trừ $2")
    .replace(/(\d+)\s*[×x]\s*(\d+)/gi, "$1 nhân $2")
    .replace(/(\d+)\s*[÷/]\s*(\d+)/g, "$1 chia $2")
    .replace(/(\d+)\s*\/\s*(\d+)/g, "$1 phần $2")
    .replace(/=\s*\?/g, " bằng mấy?")
    .replace(/=/g, " bằng ");
}

export function speakTest(locale = "vi-VN") {
  const synth = getSpeech();
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
    speechState = "unsupported";
    lastSpeechError = "Safari chưa hỗ trợ đọc văn bản trên thiết bị này.";
    return;
  }
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(
    locale.startsWith("en") ? "Hello! The sound is working." : "Xin chào! Âm thanh đang hoạt động tốt."
  );
  utterance.lang = locale;
  utterance.rate = 0.88;
  utterance.volume = 1;
  const voice = selectVoice(synth.getVoices(), locale);
  if (voice) utterance.voice = voice;
  utterance.onend = () => { speechState = "ready"; };
  utterance.onerror = (event) => {
    speechState = "error";
    lastSpeechError = event.error || "Không phát được âm thanh.";
  };
  try {
    speechState = "speaking";
    lastSpeechError = null;
    synth.speak(utterance);
    synth.resume();
  } catch (error) {
    speechState = "error";
    lastSpeechError = error instanceof Error ? error.message : String(error);
  }
}

export async function speakQuiz(question: string, options: string[], locale = "vi-VN", math = false) {
  stopSpeech();
  const token = runToken;
  const spokenQuestion = math && locale.startsWith("vi") ? naturalizeMath(question) : question;
  await speakOne((locale.startsWith("en") ? "Question. " : "Câu hỏi. ") + spokenQuestion, locale, token);
  for (let i = 0; i < options.length; i++) {
    if (token !== runToken) return;
    const option = options[i].replace(/^([A-D])\.\s*/, "");
    await speakOne(`${locale.startsWith("en") ? "Option" : "Đáp án"} ${["A", "B", "C", "D"][i] ?? i + 1}. ${math && locale.startsWith("vi") ? naturalizeMath(option) : option}`, locale, token);
  }
}

export function speakFeedback(correct: boolean, message: string, locale = "vi-VN") {
  stopSpeech();
  const token = runToken;
  void speakOne((locale.startsWith("en") ? (correct ? "Correct! " : "Not quite. ") : (correct ? "Chính xác! " : "Chưa đúng. ")) + message, locale, token);
}

export async function speakSequence(lines: string[], locale = "vi-VN") {
  stopSpeech();
  const token = runToken;
  for (const line of lines) {
    if (token !== runToken) return;
    await speakOne(line, locale, token);
  }
}
