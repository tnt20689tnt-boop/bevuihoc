import { describe, expect, it } from "vitest";
import { generateGradeQuestions, getPracticeDifficultyBand, type PracticeSubject } from "./gradeQuestionBank";

describe("grade and 100-level practice question bank", () => {
  it("raises the language-skill band every 20 Levels", () => {
    expect([1, 20, 21, 40, 41, 60, 61, 80, 81, 100].map(getPracticeDifficultyBand))
      .toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });

  it("creates five distinct, valid questions for every subject, grade, and level without repeating prompts", () => {
    const subjects: PracticeSubject[] = ["math", "vietnamese", "english"];
    const seen = new Set<string>();
    for (const subject of subjects) {
      for (let grade = 1; grade <= 5; grade++) {
        for (let level = 1; level <= 100; level++) {
          const previouslySeen = new Set(seen);
          const questions = generateGradeQuestions(subject, grade, level, 5, seen);
          expect(questions, `${subject}, grade ${grade}, level ${level}`).toHaveLength(5);
          for (const question of questions) {
            expect(question.choices).toHaveLength(4);
            expect(new Set(question.choices).size).toBe(4);
            expect(question.answer).toBeGreaterThanOrEqual(0);
            expect(question.answer).toBeLessThan(4);
            const key = question.prompt.normalize("NFC").toLocaleLowerCase("vi").replace(/\s+/g, " ").trim();
            expect(previouslySeen.has(key)).toBe(false);
            expect(seen.has(key)).toBe(true);
          }
        }
      }
    }
  });
});
