import { afterEach, describe, expect, it, vi } from "vitest";
import { detectLocale, naturalizeMath, speakQuizOption, stopSpeech } from "@/lib/quizSpeech";

class FakeUtterance {
  lang = "";
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  constructor(readonly text: string) {}
}

describe("quiz speech", () => {
  afterEach(() => {
    stopSpeech();
    vi.unstubAllGlobals();
  });

  it("naturalizes arithmetic expressions for children", () => {
    expect(naturalizeMath("3 + 4 = ?")).toBe("3 cộng 4 bằng mấy?");
  });

  it("reads elementary measurement units and keeps question punctuation natural", () => {
    expect(naturalizeMath("5 cm²; 3 + 4 = ?")).toContain("5 xăng ti mét vuông");
    expect(naturalizeMath("3 + 4 = ?")).toBe("3 cộng 4 bằng mấy?");
  });

  it("reads elementary fractions, decimals and measurement units naturally", () => {
    expect(naturalizeMath("3/4")).toBe("3 phần 4");
    expect(naturalizeMath("2,5 kg")).toBe("2 phẩy 5 ki lô gam");
    expect(naturalizeMath("12 km; 5 m²; 250 ml")).toContain("12 ki lô mét");
    expect(naturalizeMath("5 m²")).toBe("5 mét vuông");
  });

  it("detects Vietnamese instructions inside English lessons", () => {
    expect(detectLocale("Choose the correct answer", "english")).toBe("en-US");
    expect(detectLocale("Chọn đáp án đúng", "english")).toBe("vi-VN");
  });

  it("speaks a selected option with its letter and localized math wording", async () => {
    const utterances: FakeUtterance[] = [];
    const synthesis = {
      cancel: vi.fn(),
      getVoices: () => [] as SpeechSynthesisVoice[],
      resume: vi.fn(),
      speak: (utterance: FakeUtterance) => {
        utterances.push(utterance);
        queueMicrotask(() => utterance.onend?.());
      },
      pending: false,
      speaking: false,
    };
    vi.stubGlobal("window", { speechSynthesis: synthesis, setTimeout, clearTimeout });
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    speakQuizOption("3 × 4", 2, "vi-VN", true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(utterances).toHaveLength(1);
    expect(utterances[0]?.text).toBe("Đáp án C. 3 nhân 4");
    expect(utterances[0]?.lang).toBe("vi-VN");
  });
});
