import { describe, expect, it } from "vitest";
import {
  FOOTBALL_DIRECTIONS,
  isFootballDirection,
  isFootballGoal,
} from "./football-scoring";

describe("football shot scoring", () => {
  it("accepts only the three supported shot directions", () => {
    expect(FOOTBALL_DIRECTIONS).toEqual(["left", "center", "right"]);
    expect(isFootballDirection("left")).toBe(true);
    expect(isFootballDirection("center")).toBe(true);
    expect(isFootballDirection("right")).toBe(true);
    expect(isFootballDirection("goal")).toBe(false);
    expect(isFootballDirection(null)).toBe(false);
  });

  it("scores when the server-selected goalkeeper misses the shot direction", () => {
    expect(isFootballGoal("left", "right")).toBe(true);
    expect(isFootballGoal("center", "center")).toBe(false);
    expect(isFootballGoal("right", "left")).toBe(true);
  });
});
