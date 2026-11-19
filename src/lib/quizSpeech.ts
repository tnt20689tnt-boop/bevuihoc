type SpeechState = "ready" | "unsupported" | "loading-voices" | "speaking" | "paused" | "error";
let isMuted = false;
try { isMuted = typeof window !== "undefined" && window.localStorage.getItem("bevuihoc_speech_muted") === "true"; } catch { /* Storage may be unavailable in private browsing. */ }
let activeUtterance: SpeechSynthesisUtterance | null = null;
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;
let currentSource: AudioBufferSourceNode | null = null;
const audioBufferCache = new Map<string, AudioBuffer>();
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

// Unlock Web Audio synchronously on the first real user interaction.
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx?.state === "suspended") void ctx.resume();
    window.removeEventListener("pointerdown", unlockAudio);
    window.removeEventListener("touchstart", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  };
  window.addEventListener("pointerdown", unlockAudio, { passive: true });
  window.addEventListener("touchstart", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio, { passive: true });
}

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

function hasNativeVoice(locale: string): boolean {
  const synth = getSpeech();
  if (!synth) return false;
  const prefix = locale.toLowerCase().slice(0, 2);
  return synth.getVoices().some((voice) => voice.lang.toLowerCase().startsWith(prefix));
}

function releaseCloudAudio(audio: HTMLAudioElement, url: string) {
  audio.onended = null;
  audio.onerror = null;
  if (currentAudio === audio) currentAudio = null;
  if (currentAudioUrl === url) currentAudioUrl = null;
  try {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  } catch { /* Ignore browser cleanup errors. */ }
  URL.revokeObjectURL(url);
}


async function playCloudTts(text: string, token: number): Promise<void> {
  if (token !== runToken || isMuted || !text.trim()) return;
  try {
    const ctx = getAudioContext();
    const cacheKey = text.trim();
    let buffer = audioBufferCache.get(cacheKey);

    if (!buffer) {
      const response = await fetch("/api/public/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 400) }),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(detail || `Cloud TTS failed (${response.status})`);
      }
      if (token !== runToken || isMuted) return;
      const bytes = await response.arrayBuffer();
      if (!bytes.byteLength) throw new Error("Máy chủ không trả về dữ liệu âm thanh.");
      if (ctx) {
        buffer = await ctx.decodeAudioData(bytes.slice(0));
        if (audioBufferCache.size >= 40) audioBufferCache.clear();
        audioBufferCache.set(cacheKey, buffer);
      } else {
        // Fallback for browsers without Web Audio support.
        const blob = new Blob([bytes], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudio = audio;
        currentAudioUrl = url;
        speechState = "speaking";
        await new Promise<void>((resolve, reject) => {
          const cleanup = () => {
            audio.onended = null;
            audio.onerror = null;
            if (currentAudio === audio) currentAudio = null;
            if (currentAudioUrl === url) currentAudioUrl = null;
            URL.revokeObjectURL(url);
          };
          audio.onended = () => { cleanup(); resolve(); };
          audio.onerror = () => { cleanup(); reject(new Error("Không phát được tệp giọng đọc AI.")); };
          audio.play().catch((error: unknown) => {
            cleanup();
            reject(error instanceof Error ? error : new Error("Trình duyệt chưa cho phép phát âm thanh."));
          });
        });
        if (token === runToken) speechState = "ready";
        return;
      }
    }

    if (token !== runToken || isMuted || !buffer || !ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    if (token !== runToken || isMuted) return;
    speechState = "speaking";
    lastSpeechError = null;

    await new Promise<void>((resolve) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer!;
      source.connect(ctx.destination);
      currentSource = source;
      source.onended = () => {
        if (currentSource === source) currentSource = null;
        if (token === runToken) speechState = "ready";
        resolve();
      };
      source.start(0);
    });
  } catch (error) {
    if (token === runToken) {
      speechState = "error";
      lastSpeechError = error instanceof Error ? error.message : "Không tạo hoặc phát được giọng đọc AI.";
    }
  }
}

export function getSpeechStatus() {
  const synth = getSpeech();
  return {
    supported: Boolean((synth && typeof SpeechSynthesisUtterance !== "undefined") || typeof window !== "undefined"),
    state: speechState,
    error: lastSpeechError,
    voices: synth?.getVoices().length ?? 0,
    speaking: Boolean(synth?.speaking || currentAudio),
    paused: Boolean(synth?.paused || currentAudio?.paused),
    isMuted,
  };
}

export function stopSpeech() {
  runToken += 1;
  const synth = getSpeech();
  if (synth && (activeUtterance || synth.speaking || synth.pending)) {
    try { synth.cancel(); } catch (error) {
      lastSpeechError = error instanceof Error ? error.message : String(error);
    }
  }
  if (currentAudio && currentAudioUrl) releaseCloudAudio(currentAudio, currentAudioUrl);
  if (currentSource) {
    try { currentSource.stop(); currentSource.disconnect(); } catch { /* Already stopped. */ }
    currentSource = null;
  }
  activeUtterance = null;
  speechState = "ready";
}

export function primeSpeech(locale = "vi-VN") {
  if (isMuted) return;
  const sample = locale.startsWith("en") ? "Audio is ready." : "Âm thanh đã sẵn sàng.";
  void speakOne(sample, locale, runToken);
}


async function speakOne(text: string, locale: string, token: number): Promise<void> {
  if (isMuted || token !== runToken || !text.trim()) return;

  // Cloud TTS first: this avoids silently trusting a browser voice that may
  // report onend even when the device produces no audible output.
  try {
    await playCloudTts(text, token);
    if (token !== runToken || isMuted) return;
    if (speechState !== "error") return;
  } catch (error) {
    if (token === runToken) {
      speechState = "error";
      lastSpeechError = error instanceof Error ? error.message : "Không phát được giọng đọc AI.";
    }
  }

  // Native speech is a real fallback if the cloud service or audio decoder fails.
  const synth = getSpeech();
  if (!synth || typeof SpeechSynthesisUtterance === "undefined" || !hasNativeVoice(locale)) return;
  if (token !== runToken || isMuted) return;

  await new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = selectVoice(synth.getVoices(), locale);
    if (voice) utterance.voice = voice;

    activeUtterance = utterance;
    speechState = "speaking";
    lastSpeechError = null;
    const finish = (error?: string) => {
      if (activeUtterance === utterance) activeUtterance = null;
      if (token === runToken) {
        speechState = error ? "error" : "ready";
        lastSpeechError = error ?? null;
      }
      resolve();
    };
    utterance.onend = () => finish();
    utterance.onerror = (event) => finish("Giọng đọc dự phòng của trình duyệt lỗi: " + event.error);
    try {
      synth.cancel();
      synth.speak(utterance);
      synth.resume();
    } catch (error) {
      finish(error instanceof Error ? error.message : "Không khởi động được giọng đọc trình duyệt.");
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
    .replace(/(\d+)\s*km²/gi, "$1 ki lô mét vuông")
    .replace(/(\d+)\s*hm²/gi, "$1 héc tô mét vuông")
    .replace(/(\d+)\s*dam²/gi, "$1 đề ca mét vuông")
    .replace(/(\d+)\s*dm²/gi, "$1 đề xi mét vuông")
    .replace(/(\d+)\s*cm²/gi, "$1 xăng ti mét vuông")
    .replace(/(\d+)\s*mm²/gi, "$1 mi li mét vuông")
    .replace(/(\d+)\s*m²/gi, "$1 mét vuông")
    .replace(/(\d+)\s*dm³/gi, "$1 đề xi mét khối")
    .replace(/(\d+)\s*cm³/gi, "$1 xăng ti mét khối")
    .replace(/(\d+)\s*m³/gi, "$1 mét khối")
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
  const ctx = getAudioContext();
  if (ctx?.state === "running") { void ctx.suspend(); speechState = "paused"; }
  const synth = getSpeech();
  if (synth?.speaking && !synth.paused) {
    try { synth.pause(); speechState = "paused"; } catch { /* Browser may reject pause. */ }
  }
}

export function resumeSpeech() {
  const ctx = getAudioContext();
  if (ctx?.state === "suspended") { void ctx.resume(); speechState = "speaking"; }
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
  if (activeUtterance || currentAudio || synth?.speaking || synth?.pending) stopSpeech();
  const sample = locale.startsWith("en")
    ? "Hello! The sound is working."
    : "Xin chào! Âm thanh đang hoạt động tốt.";
  void speakOne(sample, locale, runToken);
}


export async function speakQuiz(question: string, options: string[], locale = "vi-VN", math = false) {
  stopSpeech();
  if (isMuted) return;
  const token = runToken;
  const isEnglish = locale.toLowerCase().startsWith("en");
  const activeLocale = isEnglish ? "en-US" : "vi-VN";
  const spokenQuestion = math && !isEnglish ? naturalizeMath(question) : question;
  const letters = ["A", "B", "C", "D"];
  const optionsText = options.map((option, index) => {
    const clean = (option ?? "").replace(/^([A-D])\.\s*/, "");
    const spoken = math && !isEnglish ? naturalizeMath(clean) : clean;
    return isEnglish
      ? `Option ${letters[index] ?? index + 1}: ${spoken}`
      : `Đáp án ${letters[index] ?? index + 1}: ${spoken}`;
  }).join(". ");
  const fullText = isEnglish
    ? `Question: ${spokenQuestion}. ${optionsText}`
    : `Câu hỏi: ${spokenQuestion}. ${optionsText}`;
  await speakOne(fullText, activeLocale, token);
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
