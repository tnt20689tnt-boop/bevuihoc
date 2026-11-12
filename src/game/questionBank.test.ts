import { describe, expect, it } from "vitest";
import { generateLessonQuestions } from "./questionBank";

describe("lesson question bank", () => {
  it.each(["math", "vietnamese", "english"] as const)(
    "%s generates distinct questions and avoids recently seen prompts",
    (subject) => {
      const seen = new Set<string>();
      const first = generateLessonQuestions(subject, 1, 1, seen, 5);
      expect(first).toHaveLength(5);
      expect(new Set(first.map((q) => q.prompt)).size).toBe(5);

      first.forEach((q) => seen.add(q.prompt));
      const second = generateLessonQuestions(subject, 1, 1, seen, 5);
      expect(second).toHaveLength(5);
      expect(second.every((q) => !seen.has(q.prompt))).toBe(true);
      expect(new Set(second.map((q) => q.prompt)).size).toBe(5);
    },
  );

  it("always puts the correct answer at the indexed choice", () => {
    const questions = generateLessonQuestions("english", 3, 2, new Set(), 5);
    for (const question of questions) {
      expect(question.choices[question.answer]).toBeTruthy();
      expect(new Set(question.choices).size).toBe(question.choices.length);
    }
  });
});
