export const FOOTBALL_DIRECTIONS = ["left", "center", "right"] as const;
export type FootballDirection = (typeof FOOTBALL_DIRECTIONS)[number];

export function isFootballDirection(value: unknown): value is FootballDirection {
  return typeof value === "string" && FOOTBALL_DIRECTIONS.some((direction) => direction === value);
}

export function isFootballGoal(
  shotDirection: FootballDirection,
  goalkeeperDirection: FootballDirection,
): boolean {
  return shotDirection !== goalkeeperDirection;
}
