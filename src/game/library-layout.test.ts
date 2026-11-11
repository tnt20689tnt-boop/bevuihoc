import { describe, expect, it } from "vitest";
import { PLAZA_PORTALS, portalBuildingPosition, portalBuildingRotation } from "@/game/rooms";

const portal = (to: string) => {
  const found = PLAZA_PORTALS.find((p) => p.to === to);
  if (!found) throw new Error(`missing ${to}`);
  return found;
};

describe("library placement", () => {
  it("stands right beside the Vietnamese classroom, facing the same way", () => {
    const [lx, lz] = portalBuildingPosition(portal("library"));
    const [vx, vz] = portalBuildingPosition(portal("vietnamese"));
    expect(Math.hypot(lx - vx, lz - vz)).toBeCloseTo(9.2, 1);
    expect(portalBuildingRotation(portal("library"))).toBeCloseTo(portalBuildingRotation(portal("vietnamese")), 5);
    // Not behind it: both buildings are the same distance from the yard centre row line.
    const yaw = portalBuildingRotation(portal("vietnamese"));
    const depth = (x: number, z: number) => -(x * Math.sin(yaw) + z * Math.cos(yaw));
    expect(depth(lx, lz)).toBeCloseTo(depth(vx, vz), 3);
  });

  it("has its door in front of its own facade", () => {
    const lib = portal("library");
    const [lx, lz] = portalBuildingPosition(lib);
    expect(Math.hypot(lib.x - lx, lib.z - lz)).toBeCloseTo(4.5, 1);
  });

  it("does not overlap any other building", () => {
    const [lx, lz] = portalBuildingPosition(portal("library"));
    for (const other of PLAZA_PORTALS) {
      if (other.to === "library") continue;
      const [x, z] = portalBuildingPosition(other);
      expect(Math.hypot(lx - x, lz - z)).toBeGreaterThan(8.2);
    }
  });
});
