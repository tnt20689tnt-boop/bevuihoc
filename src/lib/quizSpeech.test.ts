import { afterEach, describe, expect, it, vi } from "vitest";
import { naturalizeMath, speakQuizOption, stopSpeech } from "@/lib/quizSpeech";

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

  it("speaks a selected option with its letter and localized math wording", async () => {
    const utterances: FakeUtterance[] = [];
    const synthesis = {
      cancel: vi.fn(),
      getVoices: () => [],
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
