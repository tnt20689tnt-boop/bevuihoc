// Tiny synthesized sound kit (no downloads). Respects the global mute switch.
import { useSettings } from "@/stores/settings";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (useSettings.getState().muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.18) {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noise(start: number, dur: number, vol = 0.12) {
  const a = audio();
  if (!a) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 1200;
  const g = a.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(a.destination);
  src.start(a.currentTime + start);
}

export const sfx = {
  click: () => tone(660, 0, 0.08, "triangle", 0.12),
  pop: () => {
    tone(520, 0, 0.07, "sine", 0.15);
    tone(880, 0.05, 0.08, "sine", 0.12);
  },
  correct: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.08, 0.22, "triangle", 0.16));
  },
  // Gentle "try again" — never harsh
  wrong: () => {
    tone(392, 0, 0.18, "sine", 0.12);
    tone(330, 0.14, 0.25, "sine", 0.1);
  },
  kick: () => {
    tone(140, 0, 0.12, "square", 0.12);
    noise(0, 0.08, 0.15);
  },
  goal: () => {
    noise(0, 1.4, 0.18);
    [392, 523, 659, 784].forEach((f, i) => tone(f, 0.1 + i * 0.12, 0.4, "triangle", 0.14));
  },
  save: () => {
    noise(0, 0.5, 0.1);
    tone(300, 0, 0.3, "sine", 0.1);
  },
  whistle: () => {
    tone(2200, 0, 0.18, "sine", 0.1);
    tone(2400, 0.2, 0.3, "sine", 0.1);
  },
  fanfare: () => {
    const notes = [523, 523, 523, 659, 784, 659, 784, 1046];
    const times = [0, 0.15, 0.3, 0.45, 0.75, 0.95, 1.1, 1.35];
    notes.forEach((f, i) => {
      const at = times[i] ?? 0;
      tone(f, at, 0.35, "triangle", 0.16);
      tone(f / 2, at, 0.35, "sine", 0.08);
    });
    noise(1.35, 1.2, 0.12);
  },
  emote: () => tone(990, 0, 0.1, "sine", 0.1),
};

export function speak(text: string, lang: "en-US" | "vi-VN" = "en-US") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  if (useSettings.getState().muted) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.85;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(lang.slice(0, 2)));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
  return true;
}

export async function celebrate(kind: "small" | "big" = "small") {
  if (typeof window === "undefined") return;
  const confetti = (await import("canvas-confetti")).default;
  if (kind === "small") {
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 }, scalar: 0.9 });
    return;
  }
  const end = Date.now() + 1800;
  const frame = () => {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } });
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

export async function fireworks() {
  if (typeof window === "undefined") return;
  const confetti = (await import("canvas-confetti")).default;
  let n = 0;
  const id = window.setInterval(() => {
    confetti({
      particleCount: 60,
      startVelocity: 30,
      spread: 360,
      ticks: 70,
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.3 },
      colors: ["#ffd166", "#ff7a59", "#ff6fa8", "#4cc38a", "#3fa7f5", "#ffffff"],
    });
    if (++n > 8) window.clearInterval(id);
  }, 350);
}
