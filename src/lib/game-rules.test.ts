import { describe, expect, it } from "vitest";
import { levelFromPoints, levelProgress, pointsForLevel, POINTS_BY_DIFFICULTY } from "./game-rules";

describe("player level", () => {
  it("starts at level 1 with no points", () => {
    expect(levelFromPoints(0)).toBe(1);
  });
  it("reaches level 2 at 50 points and level 3 at 200", () => {
    expect(levelFromPoints(49)).toBe(1);
    expect(levelFromPoints(50)).toBe(2);
    expect(levelFromPoints(200)).toBe(3);
  });
  it("never goes below level 1 even after an admin correction", () => {
    expect(levelFromPoints(-30)).toBe(1);
  });
  it("reports progress toward the next level", () => {
    expect(pointsForLevel(3)).toBe(200);
    expect(levelProgress(125).ratio).toBeCloseTo(0.5);
  });
});

describe("scoring display", () => {
  it("gives 10 / 15 / 20 points for easy / medium / hard", () => {
    expect(POINTS_BY_DIFFICULTY).toEqual({ easy: 10, medium: 15, hard: 20 });
  });
});
