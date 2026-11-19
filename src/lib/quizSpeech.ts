import { inspectAudioFormat } from "@/lib/audio-format";

type SpeechState = "ready" | "unsupported" | "loading-voices" | "loading-audio" | "starting" | "speaking" | "paused" | "error";
export type SpeechDiagnostics = {
  apiStatus: number | null;
  contentType: string | null;
  bytes: number | null;
  mimeType: string | null;
  decoded: boolean | null;
  playback: "idle" | "requesting" | "starting" | "playing" | "played" | "native" | "blocked" | "failed";
  error: string | null;
};

const emptyDiagnostics = (): SpeechDiagnostics => ({
  apiStatus: null,
  contentType: null,
  bytes: null,
  mimeType: null,
  decoded: null,
  playback: "idle",
  error: null,
});

let isMuted = false;
try { isMuted = typeof window !== "undefined" && window.localStorage.getItem("bevuihoc_speech_muted") === "true"; } catch { /* Storage may be unavailable in private browsing. */ }
let activeUtterance: SpeechSynthesisUtterance | null = null;
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;
let currentAudioPlaying = false;
let currentSource: AudioBufferSourceNode | null = null;
let currentSourcePlaying = false;
const audioBufferCache = new Map<string, AudioBuffer>();
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
      } catch {
        return null;
      }
    }
  }
  return audioCtx;
}

// Unlock Web Audio synchronously on the first real user interaction.
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx?.state === "suspended") void ctx.resume().catch((error: unknown) => {
      lastSpeechError = errorMessage(error);
      speechState = "error";
      speechDiagnostics.error = lastSpeechError;
      speechDiagnostics.playback = "blocked";
    });
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
let speechDiagnostics = emptyDiagnostics();
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
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(normalized.slice(0, 2)));
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
  audio.onplaying = null;
  if (currentAudio === audio) {
    currentAudio = null;
    currentAudioPlaying = false;
  }
  if (currentAudioUrl === url) currentAudioUrl = null;
  try {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  } catch { /* Ignore browser cleanup errors. */ }
  URL.revokeObjectURL(url);
}


function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "name" in error && error.name === "NotAllowedError") {
    return "Trình duyệt chặn phát âm thanh. Hãy chạm nút Nghe thử, kiểm tra âm lượng thiết bị rồi thử lại.";
  }
  if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
    return "Yêu cầu tạo giọng đọc quá thời gian chờ hoặc đã bị hủy. Bé thử lại nhé.";
  }
  return error instanceof Error ? error.message : "Không tạo hoặc phát được giọng đọc AI.";
}

async function playCloudTts(text: string, token: number, forceFresh = false): Promise<void> {
  if (token !== runToken || isMuted || !text.trim()) return;
  speechState = "loading-audio";
  lastSpeechError = null;
  speechDiagnostics = { ...emptyDiagnostics(), playback: "requesting" };
  try {
    const ctx = getAudioContext();
    const cacheKey = text.trim();
    let buffer = ctx && !forceFresh ? audioBufferCache.get(cacheKey) : undefined;
    let bytes: ArrayBuffer | null = null;
    let mimeType: string | null = null;

    if (!buffer) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 30000);
      let response: Response;
      try {
        response = await fetch("/api/public/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "audio/*" },
          body: JSON.stringify({ text: text.slice(0, 300) }),
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeout);
      }
      const contentType = response.headers.get("content-type");
      speechDiagnostics.apiStatus = response.status;
      speechDiagnostics.contentType = contentType;
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        let detail = body.trim().slice(0, 220);
        try {
          const parsed = JSON.parse(body) as { error?: string; requestId?: string };
          detail = [parsed.error, parsed.requestId ? `mã ${parsed.requestId}` : ""].filter(Boolean).join(" · ");
        } catch { /* Keep a short plain-text server response. */ }
        throw new Error(`API giọng đọc trả HTTP ${response.status}${detail ? `: ${detail}` : "."}`);
      }
      if (token !== runToken || isMuted) return;
      bytes = await response.arrayBuffer();
      speechDiagnostics.bytes = bytes.byteLength;
      const declaredMime = contentType?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
      if (declaredMime && !declaredMime.startsWith("audio/") && declaredMime !== "application/octet-stream") {
        throw new Error(`API trả MIME ${declaredMime}, không phải dữ liệu âm thanh.`);
      }
      const format = inspectAudioFormat(new Uint8Array(bytes), contentType ?? "");
      if (!format.mimeType) throw new Error(format.error || "Không nhận diện được định dạng âm thanh.");
      mimeType = format.mimeType;
      speechDiagnostics.mimeType = mimeType;
      if (!bytes.byteLength) throw new Error("API trả về dữ liệu âm thanh rỗng.");
      if (ctx) {
        try {
          buffer = await ctx.decodeAudioData(bytes.slice(0));
          speechDiagnostics.decoded = true;
        } catch (error) {
          speechDiagnostics.decoded = false;
          throw new Error(`Không giải mã được ${mimeType}: ${errorMessage(error)}`);
        }
        if (!forceFresh) {
          if (audioBufferCache.size >= 40) audioBufferCache.clear();
          audioBufferCache.set(cacheKey, buffer);
        }
      }
    } else {
      speechDiagnostics.decoded = true;
      speechDiagnostics.mimeType = "audio (cache)";
    }

    if (token !== runToken || isMuted) return;
    if (!ctx) {
      if (!bytes || !mimeType) throw new Error("Không có dữ liệu âm thanh để gửi tới trình phát của thiết bị.");
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const audio = new Audio();
      audio.src = url;
      currentAudio = audio;
      currentAudioUrl = url;
      currentAudioPlaying = false;
      speechState = "starting";
      speechDiagnostics.playback = "starting";
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const timeout = window.setTimeout(() => finish(new Error("Trình phát không bắt đầu sau 12 giây.")), 12000);
        const cleanup = () => {
          window.clearTimeout(timeout);
          audio.onplaying = null;
          audio.onended = null;
          audio.onerror = null;
          if (currentAudio === audio) {
            currentAudio = null;
            currentAudioPlaying = false;
          }
          if (currentAudioUrl === url) currentAudioUrl = null;
          URL.revokeObjectURL(url);
        };
        const finish = (error?: Error) => {
          if (settled) return;
          settled = true;
          cleanup();
          if (token === runToken) {
            if (error) {
              const message = errorMessage(error);
              speechState = "error";
              lastSpeechError = message;
              speechDiagnostics.error = message;
              speechDiagnostics.playback = error.name === "NotAllowedError" ? "blocked" : "failed";
              reject(error);
            } else {
              speechState = "ready";
              speechDiagnostics.playback = "played";
              resolve();
            }
          } else resolve();
        };
        audio.onplaying = () => {
          if (token !== runToken) return;
          currentAudioPlaying = true;
          speechState = "speaking";
          speechDiagnostics.playback = "playing";
        };
        audio.onended = () => finish();
        audio.onerror = () => finish(new Error(`Trình phát audio lỗi (media code ${audio.error?.code ?? "không rõ"}).`));
        audio.play().catch((error: unknown) => finish(error instanceof Error ? error : new Error(String(error))));
      });
      return;
    }

    if (!buffer || !ctx) throw new Error("Không có âm thanh đã giải mã để phát.");
    if (ctx.state === "suspended") await ctx.resume();
    if (ctx.state !== "running") throw new Error(`AudioContext không chạy (trạng thái ${ctx.state}).`);
    if (token !== runToken || isMuted) return;
    speechState = "starting";
    speechDiagnostics.playback = "starting";
    await new Promise<void>((resolve, reject) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        if (currentSource === source) currentSource = null;
        currentSourcePlaying = false;
        if (token === runToken) {
          speechState = "ready";
          speechDiagnostics.playback = "played";
        }
        resolve();
      };
      try {
        source.start(0);
        currentSource = source;
        currentSourcePlaying = true;
        speechState = "speaking";
        lastSpeechError = null;
        speechDiagnostics.playback = "playing";
      } catch (error) {
        source.disconnect();
        reject(error);
      }
    });
  } catch (error) {
    if (token === runToken) {
      const message = errorMessage(error);
      speechState = "error";
      lastSpeechError = message;
      speechDiagnostics.error = message;
      speechDiagnostics.playback = error && typeof error === "object" && "name" in error && error.name === "NotAllowedError" ? "blocked" : "failed";
    }
  }
}

export function getSpeechStatus() {
  const synth = getSpeech();
  const hasHtmlAudio = typeof window !== "undefined" && typeof window.Audio === "function";
  const hasWebAudio = typeof window !== "undefined" && Boolean(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  return {
    supported: hasHtmlAudio || hasWebAudio || Boolean(synth && typeof SpeechSynthesisUtterance !== "undefined"),
    state: speechState,
    error: lastSpeechError,
    diagnostics: { ...speechDiagnostics },
    voices: synth?.getVoices().length ?? 0,
    speaking: Boolean(synth?.speaking || currentAudioPlaying || currentSourcePlaying),
    paused: Boolean(synth?.paused || (currentAudio?.paused && currentAudioUrl) || (currentSourcePlaying && audioCtx?.state === "suspended")),
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
  currentAudioPlaying = false;
  currentSourcePlaying = false;
  activeUtterance = null;
  speechState = "ready";
}

export function primeSpeech(_locale = "vi-VN") {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (ctx?.state === "suspended") void ctx.resume().catch((error: unknown) => {
    lastSpeechError = errorMessage(error);
    speechState = "error";
  });
}


export function splitSpeechText(text: string, maxLength = 280): string[] {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) return [];
  const chunks: string[] = [];
  let current = "";
  for (const word of normalized.split(" ")) {
    if (word.length > maxLength) {
      if (current) chunks.push(current);
      current = "";
      let part = "";
      for (const character of Array.from(word)) {
        if (part.length + character.length > maxLength) {
          chunks.push(part);
          part = "";
        }
        part += character;
      }
      current = part;
    } else if (!current) {
      current = word;
    } else if (current.length + word.length + 1 <= maxLength) {
      current += ` ${word}`;
    } else {
      chunks.push(current);
      current = word;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function speakOne(text: string, locale: string, token: number, forceFresh = false): Promise<void> {
  if (isMuted || token !== runToken || !text.trim()) return;
  const chunks = splitSpeechText(text);
  let nativeStartAt = chunks.length;

  // AI audio is preferred; every chunk stays within the server's input limit.
  for (let index = 0; index < chunks.length; index += 1) {
    await playCloudTts(chunks[index]!, token, forceFresh);
    if (token !== runToken || isMuted) return;
    if (speechState === "error") {
      nativeStartAt = index;
      break;
    }
  }
  if (nativeStartAt === chunks.length) return;

  // Use browser TTS only when a voice for the requested language is installed.
  const synth = getSpeech();
  if (!synth || typeof SpeechSynthesisUtterance === "undefined" || !hasNativeVoice(locale)) return;
  if (token !== runToken || isMuted) return;

  for (const chunk of chunks.slice(nativeStartAt)) {
    if (token !== runToken || isMuted) return;
    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = locale;
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.volume = 1;
      const voice = selectVoice(synth.getVoices(), locale);
      if (voice) utterance.voice = voice;

      activeUtterance = utterance;
      speechState = "starting";
      speechDiagnostics.playback = "starting";
      let timeout = 0;
      const finish = (error?: string) => {
        window.clearTimeout(timeout);
        if (activeUtterance === utterance) activeUtterance = null;
        if (token === runToken) {
          speechState = error ? "error" : "ready";
          lastSpeechError = error ?? null;
          if (error) {
            speechDiagnostics.playback = "failed";
            speechDiagnostics.error = [speechDiagnostics.error, error].filter(Boolean).join("; ");
          }
        }
        resolve();
      };
      utterance.onstart = () => {
        if (token !== runToken) return;
        speechState = "speaking";
        lastSpeechError = null;
        speechDiagnostics.playback = "native";
      };
      utterance.onend = () => finish();
      utterance.onerror = (event) => finish("Giọng đọc dự phòng của trình duyệt lỗi: " + event.error);
      try {
        timeout = window.setTimeout(() => finish("Giọng đọc trình duyệt không bắt đầu trong 25 giây."), 25000);
        synth.speak(utterance);
        synth.resume();
      } catch (error) {
        finish(errorMessage(error));
      }
    });
  }
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
  if (currentAudioPlaying && currentAudio) {
    currentAudio.pause();
    currentAudioPlaying = false;
    speechState = "paused";
  }
  if (currentSourcePlaying && ctx?.state === "running") {
    void ctx.suspend().then(() => { speechState = "paused"; }).catch((error: unknown) => {
      lastSpeechError = errorMessage(error);
      speechState = "error";
    });
  }
  const synth = getSpeech();
  if (synth?.speaking && !synth.paused) {
    try { synth.pause(); speechState = "paused"; } catch { /* Browser may reject pause. */ }
  }
}

export function resumeSpeech() {
  const ctx = getAudioContext();
  if (currentAudio && currentAudioUrl && currentAudio.paused) {
    speechState = "starting";
    void currentAudio.play().catch((error: unknown) => {
      lastSpeechError = errorMessage(error);
      speechDiagnostics.error = lastSpeechError;
      speechDiagnostics.playback = error && typeof error === "object" && "name" in error && error.name === "NotAllowedError" ? "blocked" : "failed";
      speechState = "error";
    });
  }
  if (currentSourcePlaying && ctx?.state === "suspended") {
    speechState = "starting";
    void ctx.resume().then(() => {
      if (ctx.state === "running" && currentSourcePlaying) {
        speechState = "speaking";
        speechDiagnostics.playback = "playing";
      }
    }).catch((error: unknown) => {
      lastSpeechError = errorMessage(error);
      speechDiagnostics.error = lastSpeechError;
      speechDiagnostics.playback = "blocked";
      speechState = "error";
    });
  }
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

export async function speakTest(locale = "vi-VN") {
  if (isMuted) return;
  primeSpeech(locale);
  const synth = getSpeech();
  if (activeUtterance || currentAudio || synth?.speaking || synth?.pending) stopSpeech();
  const sample = locale.startsWith("en")
    ? "Hello! The sound is working."
    : "Xin chào! Âm thanh đang hoạt động tốt.";
  await speakOne(sample, locale, runToken, true);
}

export async function speakText(text: string, locale = "vi-VN") {
  stopSpeech();
  if (isMuted) return;
  primeSpeech(locale);
  await speakOne(text, locale, runToken);
}

export async function speakQuiz(question: string, options: string[], locale = "vi-VN", math = false) {
  stopSpeech();
  if (isMuted) return;
  primeSpeech(locale);
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
  primeSpeech(locale);
  const letter = ["A", "B", "C", "D"][index] ?? String(index + 1);
  const activeLocale = detectLocale(option, locale.startsWith("en") ? "english" : undefined);
  const spokenOption = math && activeLocale.startsWith("vi") ? naturalizeMath(option) : option;
  const prefix = activeLocale.startsWith("en") ? "Option " + letter + "." : "Đáp án " + letter + ".";
  void speakSequence([prefix + " " + spokenOption], activeLocale);
}

export function speakFeedback(correct: boolean, message: string, locale = "vi-VN") {
  stopSpeech();
  if (isMuted) return;
  primeSpeech(locale);
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
