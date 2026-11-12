import { describe, expect, it } from "vitest";
import { generateLevelQuestions, generateQuestion, type Subject } from "./learningEngine";

const subjects: Subject[] = ["math", "vietnamese", "english"];

describe("learning question engine quality guards", () => {
  it("generates four distinct choices and includes the correct answer", () => {
    for (const subject of subjects) {
      for (let grade = 1; grade <= 5; grade++) {
        for (const level of [1, 10, 20, 21, 40, 41, 60, 61, 80, 100]) {
          for (let sample = 0; sample < 10; sample++) {
            const question = generateQuestion(subject, grade, level);
            expect(question.question.trim().length).toBeGreaterThan(0);
            expect(question.options).toHaveLength(4);
            expect(new Set(question.options).size).toBe(4);
            expect(question.options).toContain(question.correctAnswer);
            expect(question.explanation.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("never asks the meaningless greater-than-or-equal comparison in grade 1", () => {
    for (let level = 41; level <= 60; level++) {
      for (let sample = 0; sample < 100; sample++) {
        const question = generateQuestion("math", 1, level);
        expect(question.question.toLocaleLowerCase("vi")).not.toContain("lớn hơn hoặc bằng");
      }
    }
  });

  it("does not repeat exact question text inside one generated level set", () => {
    for (const subject of subjects) {
      for (let grade = 1; grade <= 5; grade++) {
        for (const level of [1, 25, 50, 75, 100]) {
          const questions = generateLevelQuestions(subject, grade, level, 5);
          const normalized = questions.map((item) =>
            item.question.normalize("NFC").toLocaleLowerCase("vi")
              .replace(/[.,!?;:]/g, "").replace(/\s+/g, " ").trim(),
          );
          expect(new Set(normalized).size).toBe(normalized.length);
        }
      }
    }
  });
});
