type SpeechState = "ready" | "unsupported" | "loading-voices" | "speaking" | "paused" | "error";
let isMuted = false;
try { isMuted = typeof window !== "undefined" && window.localStorage.getItem("bevuihoc_speech_muted") === "true"; } catch { /* Storage may be unavailable in private browsing. */ }
let activeUtterance: SpeechSynthesisUtterance | null = null;
let runToken = 0;
let speechState: SpeechState = "ready";
let lastSpeechError: string | null = null;
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

export function getSpeechStatus() {
  const synth = getSpeech();
  return {
    supported: Boolean(synth && typeof SpeechSynthesisUtterance !== "undefined"),
    state: speechState,
    error: lastSpeechError,
    voices: synth?.getVoices().length ?? 0,
    speaking: Boolean(synth?.speaking),
    paused: Boolean(synth?.paused),
    isMuted,
  };
}

export function stopSpeech() {
  runToken += 1;
  const synth = getSpeech();
  // Avoid calling cancel() when idle: iOS Safari can silence the next utterance
  // if cancel() races with a fresh speak() from the same tap.
  if (synth && (activeUtterance || synth.speaking || synth.pending)) {
    try { synth.cancel(); } catch (error) {
      lastSpeechError = error instanceof Error ? error.message : String(error);
    }
  }
  activeUtterance = null;
  if (speechState === "speaking") speechState = "ready";
}

export function primeSpeech(locale = "vi-VN") {
  if (isMuted) return;
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
  if (isMuted || token !== runToken || !text.trim()) return Promise.resolve();

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
    .replace(/(\d+)\s*\/\s*(\d+)/g, "$1 phần $2")
    .replace(/(\d+)\s*\+\s*(\d+)/g, "$1 cộng $2")
    .replace(/(\d+)\s*[-−]\s*(\d+)/g, "$1 trừ $2")
    .replace(/(\d+)\s*[×x*]\s*(\d+)/gi, "$1 nhân $2")
    .replace(/(\d+)\s*[÷:]\s*(\d+)/g, "$1 chia $2")
    .replace(/(\d+)[,.](\d+)/g, "$1 phẩy $2")
    .replace(/=\s*\?/g, " bằng mấy?")
    .replace(/=/g, " bằng ")
    .replace(/(\d+)\s*km²\b/gi, "$1 ki lô mét vuông")
    .replace(/(\d+)\s*hm²\b/gi, "$1 héc tô mét vuông")
    .replace(/(\d+)\s*dam²\b/gi, "$1 đề ca mét vuông")
    .replace(/(\d+)\s*dm²\b/gi, "$1 đề xi mét vuông")
    .replace(/(\d+)\s*cm²\b/gi, "$1 xăng ti mét vuông")
    .replace(/(\d+)\s*mm²\b/gi, "$1 mi li mét vuông")
    .replace(/(\d+)\s*m²\b/gi, "$1 mét vuông")
    .replace(/(\d+)\s*dm³\b/gi, "$1 đề xi mét khối")
    .replace(/(\d+)\s*cm³\b/gi, "$1 xăng ti mét khối")
    .replace(/(\d+)\s*m³\b/gi, "$1 mét khối")
    .replace(/(\d+)\s*km\b/gi, "$1 ki lô mét")
    .replace(/(\d+)\s*hm\b/gi, "$1 héc tô mét")
    .replace(/(\d+)\s*dam\b/gi, "$1 đề ca mét")
    .replace(/(\d+)\s*dm\b/gi, "$1 đề xi mét")
    .replace(/(\d+)\s*cm\b/gi, "$1 xăng ti mét")
    .replace(/(\d+)\s*mm\b/gi, "$1 mi li mét")
    .replace(/(\d+)\s*kg\b/gi, "$1 ki lô gam")
    .replace(/(\d+)\s*mg\b/gi, "$1 mi li gam")
    .replace(/(\d+)\s*dag\b/gi, "$1 đề ca gam")
    .replace(/(\d+)\s*dg\b/gi, "$1 đề xi gam")
    .replace(/(\d+)\s*cg\b/gi, "$1 xăng ti gam")
    .replace(/(\d+)\s*ml\b/gi, "$1 mi li lít")
    .replace(/(\d+)\s*cl\b/gi, "$1 xăng ti lít")
    .replace(/(\d+)\s*dl\b/gi, "$1 đề xi lít")
    .replace(/(\d+)\s*(g|l)\b/gi, (_m, n: string, unit: string) => unit.toLowerCase() === "g" ? n + " gam" : n + " lít")
    .replace(/(\d+)\s*°\s*C/gi, "$1 độ xê")
    .replace(/🍎/g, " quả táo ")
    .replace(/🍌/g, " quả chuối ")
    .replace(/🍊/g, " quả cam ")
    .replace(/🍉/g, " dưa hấu ")
    .replace(/🟡/g, " hình tròn vàng ")
    .replace(/🟦/g, " hình vuông xanh ")
    .replace(/🔺/g, " hình tam giác đỏ ")
    .replace(/⭐/g, " ngôi sao ")
    .replace(/🟢/g, " hình tròn xanh ")
    .replace(/🔶/g, " hình thoi cam ")
    .replace(/🐱/g, " con mèo ")
    .replace(/🐶/g, " con chó ")
    .replace(/🐰/g, " con thỏ ")
    .replace(/🐟/g, " con cá ")
    .replace(/⚖️/g, " cân đĩa ")
    .replace(/⏰|🕒/g, " đồng hồ ")
    .replace(/\[\?\]/g, " hỏi chấm ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
export function detectLocale(text: string, defaultSubject?: string): string {
  if (defaultSubject === "english" && !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) return "en-US";
  return "vi-VN";
}

export function isSpeechMuted(): boolean { return isMuted; }

export function setSpeechMuted(muted: boolean) {
  isMuted = muted;
  try { if (typeof window !== "undefined") window.localStorage.setItem("bevuihoc_speech_muted", String(muted)); } catch { /* Ignore unavailable storage. */ }
  if (muted) stopSpeech();
}

export function pauseSpeech() {
  const synth = getSpeech();
  if (synth?.speaking && !synth.paused) {
    try { synth.pause(); speechState = "paused"; } catch { /* Browser may reject pause. */ }
  }
}

export function resumeSpeech() {
  const synth = getSpeech();
  if (synth?.paused) {
    try { synth.resume(); speechState = "speaking"; } catch { /* Browser may reject resume. */ }
  }
}

export function togglePauseSpeech() {
  const synth = getSpeech();
  if (synth?.paused) resumeSpeech();
  else pauseSpeech();
}

export function speakTest(locale = "vi-VN") {
  if (isMuted) return;
  const synth = getSpeech();
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
    speechState = "unsupported";
    lastSpeechError = "Safari chưa hỗ trợ đọc văn bản trên thiết bị này.";
    return;
  }
  // Do not cancel an idle speech queue here; on iOS Safari that can swallow
  // the utterance triggered by the current tap.
  if (activeUtterance || synth.speaking || synth.pending) stopSpeech();
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
  if (isMuted) return;
  const token = runToken;
  const questionLocale = detectLocale(question, locale.startsWith("en") ? "english" : undefined);
  const spokenQuestion = math && questionLocale.startsWith("vi") ? naturalizeMath(question) : question;
  await speakOne((questionLocale.startsWith("en") ? "Question. " : "Câu hỏi: ") + spokenQuestion, questionLocale, token);
  for (let i = 0; i < options.length; i++) {
    if (token !== runToken || isMuted) return;
    const option = (options[i] ?? "").replace(/^([A-D])\.\s*/, "");
    const optionLocale = detectLocale(option, locale.startsWith("en") ? "english" : undefined);
    const spokenOption = math && optionLocale.startsWith("vi") ? naturalizeMath(option) : option;
    const prefix = optionLocale.startsWith("en") ? "Option" : "Đáp án";
    await speakOne(prefix + " " + (["A", "B", "C", "D"][i] ?? (i + 1)) + ". " + spokenOption, optionLocale, token);
  }
}

export function speakQuizOption(option: string, index: number, locale = "vi-VN", math = false) {
  if (isMuted) return;
  const letter = ["A", "B", "C", "D"][index] ?? String(index + 1);
  const activeLocale = detectLocale(option, locale.startsWith("en") ? "english" : undefined);
  const spokenOption = math && activeLocale.startsWith("vi") ? naturalizeMath(option) : option;
  const prefix = activeLocale.startsWith("en") ? "Option " + letter + "." : "Đáp án " + letter + ".";
  void speakSequence([prefix + " " + spokenOption], activeLocale);
}

export function speakFeedback(correct: boolean, message: string, locale = "vi-VN") {
  stopSpeech();
  if (isMuted) return;
  const activeLocale = detectLocale(message, locale.startsWith("en") ? "english" : undefined);
  const prefix = activeLocale.startsWith("en")
    ? (correct ? "Correct! " : "Not quite. ")
    : (correct ? "Chính xác! " : "Chưa đúng. ");
  void speakOne(prefix + message, activeLocale, runToken);
}

export async function speakSequence(lines: string[], locale = "vi-VN") {
  stopSpeech();
  const token = runToken;
  for (const line of lines) {
    if (token !== runToken) return;
    await speakOne(line, locale, token);
  }
}
