import { beforeEach, describe, expect, it } from "vitest";
import { createArenaQuestionSet } from "./arenaQuestionBank";

describe("Arena question bank", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates ten questions with all three subjects represented for every grade", () => {
    for (let grade = 1; grade <= 5; grade++) {
      const questions = createArenaQuestionSet(grade, 10);
      expect(questions).toHaveLength(10);
      expect(new Set(questions.map((question) => question.subject))).toEqual(
        new Set(["math", "vietnamese", "english"]),
      );
      for (const question of questions) {
        expect(question.grade).toBe(grade);
        expect(question.question.trim().length).toBeGreaterThan(0);
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
        expect(question.options).toContain(question.correctAnswer);
        expect(question.explanation.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("does not repeat a question in the same match", () => {
    for (let grade = 1; grade <= 5; grade++) {
      const questions = createArenaQuestionSet(grade, 10);
      const normalized = questions.map((question) =>
        question.question.normalize("NFC").toLocaleLowerCase("vi")
          .replace(/[“”"'.,!?;:]/g, "").replace(/\\s+/g, " ").trim(),
      );
      expect(new Set(normalized).size).toBe(questions.length);
    }
  });

  it("remembers previously asked question text for the same grade", () => {
    const first = createArenaQuestionSet(3, 10);
    const second = createArenaQuestionSet(3, 10);
    const firstKeys = new Set(first.map((question) =>
      question.subject + ":" + question.question.normalize("NFC").toLocaleLowerCase("vi")
        .replace(/[“”"'.,!?;:]/g, "").replace(/\\s+/g, " ").trim(),
    ));
    const secondKeys = second.map((question) =>
      question.subject + ":" + question.question.normalize("NFC").toLocaleLowerCase("vi")
        .replace(/[“”"'.,!?;:]/g, "").replace(/\\s+/g, " ").trim(),
    );
    expect(secondKeys.some((key) => firstKeys.has(key))).toBe(false);
  });
});
