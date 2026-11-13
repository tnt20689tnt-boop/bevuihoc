import { describe, expect, it } from "vitest";
import { getLibraryVolume, LIBRARY_VOLUMES } from "./libraryCurriculum";

describe("offline learning library", () => {
  it("ships a complete volume for every subject and grade", () => {
    expect(LIBRARY_VOLUMES).toHaveLength(15);
    for (const volume of LIBRARY_VOLUMES) {
      expect(volume.lessons).toHaveLength(10);
      expect(volume.title.trim().length).toBeGreaterThan(0);
      for (const lesson of volume.lessons) {
        expect(lesson.title.trim().length).toBeGreaterThan(0);
        expect(lesson.knowledge.trim().length).toBeGreaterThan(40);
        expect(lesson.example.trim().length).toBeGreaterThan(0);
        expect(lesson.exercises).toHaveLength(3);
        expect(lesson.guidance.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("returns the correct grade and subject volume", () => {
    expect(getLibraryVolume("math", 1).title).toContain("Toán lớp 1");
    expect(getLibraryVolume("viet", 5).lessons[0]?.title).toContain("Từ đồng nghĩa");
    expect(getLibraryVolume("english", 3).lessons).toHaveLength(10);
  });

  it("does not reuse the same chapter titles between grades for a subject", () => {
    for (const subject of ["math", "viet", "english"] as const) {
      const titles = [1, 2, 3, 4, 5].flatMap((grade) =>
        getLibraryVolume(subject, grade as 1 | 2 | 3 | 4 | 5).lessons.map((lesson) => lesson.title),
      );
      expect(new Set(titles).size).toBe(titles.length);
    }
  });
});
