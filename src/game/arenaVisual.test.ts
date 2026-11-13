import { describe, expect, it } from "vitest";
import { createVisualPuzzles } from "./arenaQuestionBank";

describe("arena picture puzzles", () => {
  it("each puzzle has 4 distinct options including the answer", () => {
    for (let g = 1; g <= 5; g++) for (const q of createVisualPuzzles(g, 60)) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.correctAnswer);
    }
  });
});
