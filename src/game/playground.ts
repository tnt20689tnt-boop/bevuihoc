// Playground rules: equipment placement, colliders, proximity and ride poses.
// Plain TypeScript (no React / three.js) so the 3D scene only draws this state.
import type { Motion } from "@/game/Character3D";

export type PlayKind =
  | "swing"
  | "slide"
  | "seesaw"
  | "spring"
  | "ballPit"
  | "playHouse"
  | "tunnel"
  | "climb"
  | "merry"
  | "bench";

export type Collider =
  | { kind: "circle"; x: number; z: number; r: number }
  | { kind: "box"; x: number; z: number; w: number; d: number; yaw: number };

export type Equipment = {
  id: string;
  kind: PlayKind;
  /** Display name, e.g. "Xích đu đôi". */
  name: string;
  icon: string;
  /** Text on the big play button, e.g. "LÊN XÍCH ĐU". */
  action: string;
  x: number;
  z: number;
  yaw: number;
  variant?: "rabbit" | "duck";
  collider: Collider;
  /** Where the child stands after leaving the ride (world space). */
  exit: { x: number; z: number };
};

export type PlayInfo = Pick<Equipment, "id" | "name" | "icon" | "action">;

export type PlayPose = {
  x: number;
  y: number;
  z: number;
  /** Facing angle (rotation.y). */
  ry: number;
  /** Lean forward/back around the character's own side axis. */
  tiltX: number;
  motion: Motion;
  /** True when ry jumps between path segments and should be eased. */
  smoothTurn: boolean;
};

/** Player body radius used for every collision check. */
export const PLAYER_RADIUS = 0.52;
/** How close (to the edge of a ride) the child must be for the play button. */
export const INTERACT_RANGE = 1.5;
/** Feet-origin offset when the character sits on a surface. */
export const SIT_OFFSET = -0.13;
/** Seconds used to glide the character onto the ride. */
export const ENTER_BLEND = 0.45;
/** Seconds used to glide the character back onto the ground after exiting. */
export const EXIT_BLEND = 0.3;

// ---------- geometry shared by the 3D models and the poses ----------
export const SWING = { topY: 2.6, rope: 1.95, seatX: 0.8, halfWidth: 2.1, seatThickness: 0.08 };
export const SLIDE = { platformY: 1.8, chuteTopZ: -0.75, chuteEndZ: 2.6, chuteEndY: 0.35, ladderZ: -2.85, platformZ: -1.15 };
export const SEESAW = { pivotY: 0.55, halfLength: 1.7, seatX: 1.45 };
export const SPRING = { bodyY: 0.42, seatY: 0.38 };
export const MERRY = { radius: 1.5, topY: 0.32, seatRadius: 1.05 };
export const BALL_PIT = { size: 3, wallH: 0.55 };
export const PLAY_HOUSE = { deckY: 1.3, towers: [-2.4, 0, 2.6], towerHalf: 0.6, slideEndX: 5.0 };
export const TUNNEL = { radius: 0.75, halfLength: 1.7 };
export const CLIMB = { halfWidth: 1.2, height: 2.1 };
export const BENCH = { seatY: 0.58 };

// ---------- math helpers ----------
export function toWorld(x0: number, z0: number, yaw: number, lx: number, lz: number) {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return { x: x0 + lx * c + lz * s, z: z0 - lx * s + lz * c };
}

/** Distance from a point to the edge of a collider footprint (0 when inside). */
export function distanceToCollider(x: number, z: number, collider: Collider): number {
  if (collider.kind === "circle") return Math.max(0, Math.hypot(x - collider.x, z - collider.z) - collider.r);
  const dx = x - collider.x;
  const dz = z - collider.z;
  const c = Math.cos(collider.yaw);
  const s = Math.sin(collider.yaw);
  const lx = dx * c - dz * s;
  const lz = dx * s + dz * c;
  const qx = Math.max(Math.abs(lx) - collider.w / 2, 0);
  const qz = Math.max(Math.abs(lz) - collider.d / 2, 0);
  return Math.hypot(qx, qz);
}

/**
 * 3D distance from the character (feet position) to the closest point of the
 * ride's footprint, which sits on the ground (y = 0).
 */
export function distance3DToEquipment(p: { x: number; y: number; z: number }, eq: Equipment): number {
  return Math.hypot(distanceToCollider(p.x, p.z, eq.collider), p.y);
}

const smooth01 = (u: number) => {
  const k = Math.min(1, Math.max(0, u));
  return k * k * (3 - 2 * k);
};
const ramp = (t: number, seconds: number) => smooth01(t / seconds);

// ---------- equipment list ----------
type LocalShape = { cx: number; cz: number; w: number; d: number } | { r: number };

function place(
  base: Omit<Equipment, "collider" | "exit">,
  shape: LocalShape,
  exitLocal: [number, number],
): Equipment {
  let collider: Collider;
  if ("r" in shape) {
    collider = { kind: "circle", x: base.x, z: base.z, r: shape.r };
  } else {
    const c = toWorld(base.x, base.z, base.yaw, shape.cx, shape.cz);
    collider = { kind: "box", x: c.x, z: c.z, w: shape.w, d: shape.d, yaw: base.yaw };
  }
  return { ...base, collider, exit: toWorld(base.x, base.z, base.yaw, exitLocal[0], exitLocal[1]) };
}

const HALF_PI = Math.PI / 2;

/** Playground area (world space) inside the low fence. Entrance faces the yard (west side). */
export const PLAYGROUND_AREA = { minX: 13.5, maxX: 32.5, minZ: 3.5, maxZ: 24, entranceMinZ: 11, entranceMaxZ: 15.5 };

export const PLAY_EQUIPMENT: Equipment[] = [
  place({ id: "swing", kind: "swing", name: "Xích đu đôi", icon: "🎠", action: "LÊN XÍCH ĐU", x: 17.5, z: 7, yaw: 0 },
    { cx: 0, cz: 0, w: 4.6, d: 1.6 }, [-SWING.seatX, 2.0]),
  place({ id: "merry", kind: "merry", name: "Vòng quay vui vẻ", icon: "🎡", action: "CHƠI VÒNG QUAY", x: 23.5, z: 7.5, yaw: 0 },
    { r: MERRY.radius + 0.1 }, [0, 2.4]),
  place({ id: "slide", kind: "slide", name: "Cầu trượt cầu vồng", icon: "🛝", action: "CHƠI CẦU TRƯỢT", x: 29.5, z: 7.5, yaw: 0 },
    { cx: 0, cz: 0.15, w: 1.3, d: 6.3 }, [-1.5, 3.3]),
  place({ id: "seesaw", kind: "seesaw", name: "Bập bênh", icon: "🐴", action: "CHƠI BẬP BÊNH", x: 18, z: 14, yaw: 0 },
    { cx: 0, cz: 0, w: 3.6, d: 0.9 }, [SEESAW.seatX, 1.3]),
  place({ id: "spring-rabbit", kind: "spring", variant: "rabbit", name: "Thú nhún Thỏ hồng", icon: "🐰", action: "LÊN THÚ NHÚN", x: 22.4, z: 14, yaw: 0 },
    { r: 0.6 }, [0.25, 1.15]),
  place({ id: "spring-duck", kind: "spring", variant: "duck", name: "Thú nhún Vịt vàng", icon: "🦆", action: "LÊN THÚ NHÚN", x: 25, z: 14, yaw: 0 },
    { r: 0.6 }, [0.25, 1.15]),
  place({ id: "ball-pit", kind: "ballPit", name: "Nhà bóng", icon: "🏠", action: "VÀO NHÀ BÓNG", x: 29.5, z: 15, yaw: -HALF_PI },
    { cx: 0, cz: 0, w: 3.2, d: 3.2 }, [0, 2.4]),
  place({ id: "tunnel", kind: "tunnel", name: "Đường hầm cầu vồng", icon: "🌈", action: "CHUI ĐƯỜNG HẦM", x: 16.8, z: 20.5, yaw: 0 },
    { cx: 0, cz: 0, w: 3.6, d: 1.7 }, [0, 1.9]),
  place({ id: "play-house", kind: "playHouse", name: "Nhà chơi liên hoàn", icon: "🏰", action: "VÀO NHÀ LIÊN HOÀN", x: 23, z: 20.5, yaw: 0 },
    { cx: 1.1, cz: 0.15, w: 8.6, d: 2.1 }, [-2.4, 2.2]),
  place({ id: "climb", kind: "climb", name: "Khung leo trèo", icon: "🧗", action: "LEO KHUNG", x: 30.8, z: 20.5, yaw: -HALF_PI },
    { cx: 0, cz: 0, w: 2.6, d: 0.8 }, [0, 1.4]),
  place({ id: "bench-play-1", kind: "bench", name: "Ghế nghỉ khu vui chơi", icon: "🪑", action: "NGỒI NGHỈ", x: 15, z: 9.6, yaw: HALF_PI },
    { cx: 0, cz: 0, w: 2.2, d: 0.8 }, [0, 1.2]),
  place({ id: "bench-play-2", kind: "bench", name: "Ghế nghỉ khu vui chơi", icon: "🪑", action: "NGỒI NGHỈ", x: 15, z: 17.4, yaw: HALF_PI },
    { cx: 0, cz: 0, w: 2.2, d: 0.8 }, [0, 1.2]),
  // Benches around the fountain in the central yard.
  place({ id: "bench-yard-west", kind: "bench", name: "Ghế đá sân trường", icon: "🪑", action: "NGỒI NGHỈ", x: -6.5, z: 0, yaw: HALF_PI },
    { cx: 0, cz: 0, w: 2.2, d: 0.8 }, [0, 1.2]),
  place({ id: "bench-yard-east", kind: "bench", name: "Ghế đá sân trường", icon: "🪑", action: "NGỒI NGHỈ", x: 6.5, z: 0, yaw: -HALF_PI },
    { cx: 0, cz: 0, w: 2.2, d: 0.8 }, [0, 1.2]),
  place({ id: "bench-yard-north", kind: "bench", name: "Ghế đá sân trường", icon: "🪑", action: "NGỒI NGHỈ", x: 0, z: -6.8, yaw: 0 },
    { cx: 0, cz: 0, w: 2.2, d: 0.8 }, [0, 1.2]),
];

export function equipmentById(id: string): Equipment | undefined {
  return PLAY_EQUIPMENT.find((eq) => eq.id === id);
}

export function toPlayInfo(eq: Equipment): PlayInfo {
  return { id: eq.id, name: eq.name, icon: eq.icon, action: eq.action };
}

/** The closest ride within reach of the child, or null when none is close enough. */
export function nearestEquipment(
  p: { x: number; y?: number; z: number },
  list: Equipment[] = PLAY_EQUIPMENT,
  range = INTERACT_RANGE,
): Equipment | null {
  let best: Equipment | null = null;
  let bestDistance = Infinity;
  const point = { x: p.x, y: p.y ?? 0, z: p.z };
  for (const eq of list) {
    const distance = distance3DToEquipment(point, eq);
    if (distance <= range && distance < bestDistance) {
      best = eq;
      bestDistance = distance;
    }
  }
  return best;
}

// ---------- ride motion shared by models and poses ----------
export const swingAngle = (t: number) => 0.6 * Math.sin(2.2 * t) * ramp(t, 1.5);
export const seesawTilt = (t: number) => 0.3 * Math.sin(2.1 * t) * ramp(t, 1);
export const springMotion = (t: number) => {
  const k = ramp(t, 0.8);
  return { bounce: 0.07 * Math.abs(Math.sin(5 * t)) * k, rock: 0.2 * Math.sin(5 * t) * k };
};
/** Platform angle; eases in so the ride starts from rest. */
export const merryAngle = (t: number) => (1.3 * t * t) / (t + 1);

// ---------- path sampling for multi-step rides ----------
type Key = { p: [number, number, number]; dur: number; motion: Motion; ry?: number; tilt?: number };

function samplePath(keys: Key[], t: number) {
  const total = keys.reduce((sum, k) => sum + k.dur, 0);
  let tt = ((t % total) + total) % total;
  for (let i = 0; i < keys.length; i++) {
    const a = keys[i]!;
    const b = keys[(i + 1) % keys.length]!;
    if (tt <= a.dur || i === keys.length - 1) {
      const u = Math.min(1, tt / a.dur);
      const dx = b.p[0] - a.p[0];
      const dz = b.p[2] - a.p[2];
      const ry = a.ry ?? (Math.hypot(dx, dz) > 0.01 ? Math.atan2(dx, dz) : 0);
      const tiltA = a.tilt ?? 0;
      const tiltB = b.tilt ?? 0;
      return {
        x: a.p[0] + dx * u,
        y: a.p[1] + (b.p[1] - a.p[1]) * u,
        z: a.p[2] + dz * u,
        ry,
        tiltX: tiltA + (tiltB - tiltA) * u,
        motion: a.motion,
      };
    }
    tt -= a.dur;
  }
  const first = keys[0]!;
  return { x: first.p[0], y: first.p[1], z: first.p[2], ry: 0, tiltX: 0, motion: first.motion };
}

const sitY = (surface: number) => surface + SIT_OFFSET;
const CRAWL_TILT = 1.12;

const SLIDE_PATH: Key[] = [
  { p: [0, 0, SLIDE.ladderZ], dur: 1.5, motion: "jump", ry: 0 },
  { p: [0, SLIDE.platformY, -1.6], dur: 0.5, motion: "walk", ry: 0 },
  { p: [0, SLIDE.platformY, -0.95], dur: 0.35, motion: "sit", ry: 0 },
  { p: [0, sitY(SLIDE.platformY), SLIDE.chuteTopZ], dur: 1.2, motion: "sit", ry: 0 },
  { p: [0, sitY(SLIDE.chuteEndY), SLIDE.chuteEndZ], dur: 0.5, motion: "sit", ry: 0 },
  { p: [0, sitY(0.33), 2.95], dur: 0.5, motion: "jump", ry: 0 },
  { p: [0, 0, 3.3], dur: 0.7, motion: "walk" },
  { p: [-1.3, 0, 3.3], dur: 3.0, motion: "walk" },
  { p: [-1.3, 0, -2.95], dur: 0.7, motion: "walk" },
];

const DECK = PLAY_HOUSE.deckY;
const PLAY_HOUSE_PATH: Key[] = [
  { p: [-2.4, 0, 1.55], dur: 0.5, motion: "walk" },
  { p: [-2.4, 0, 0.95], dur: 1.2, motion: "jump", ry: Math.PI },
  { p: [-2.4, DECK, 0.45], dur: 0.4, motion: "walk" },
  { p: [-2.4, DECK, 0], dur: 0.3, motion: "walk", ry: HALF_PI },
  { p: [-1.8, DECK, 0], dur: 1.3, motion: "walk" }, // rope bridge
  { p: [-0.3, DECK, 0], dur: 0.45, motion: "walk" },
  { p: [0.45, DECK + 0.03, 0], dur: 0.35, motion: "walk", tilt: 0 },
  { p: [0.62, DECK + 0.03, 0], dur: 1.6, motion: "walk", tilt: CRAWL_TILT }, // crawl tube
  { p: [2.05, DECK + 0.03, 0], dur: 0.4, motion: "walk", tilt: CRAWL_TILT },
  { p: [2.7, DECK, 0], dur: 0.35, motion: "sit", tilt: 0 },
  { p: [3.2, sitY(DECK), 0], dur: 1.1, motion: "sit" }, // slide down
  { p: [PLAY_HOUSE.slideEndX, sitY(0.33), 0], dur: 0.5, motion: "jump", ry: HALF_PI },
  { p: [5.4, 0, 0.4], dur: 0.5, motion: "walk" },
  { p: [5.4, 0, 1.55], dur: 3.0, motion: "walk" },
];

const TUNNEL_PATH: Key[] = [
  { p: [-2.4, 0, 0], dur: 0.45, motion: "walk", tilt: 0 },
  { p: [-1.95, 0.12, 0], dur: 2.6, motion: "walk", tilt: CRAWL_TILT },
  { p: [1.95, 0.12, 0], dur: 0.45, motion: "walk", tilt: CRAWL_TILT },
  { p: [2.4, 0, 0], dur: 0.6, motion: "jump", ry: HALF_PI, tilt: 0 },
  { p: [2.4, 0, 1.35], dur: 3.0, motion: "walk" },
  { p: [-2.4, 0, 1.35], dur: 0.6, motion: "walk" },
];

type LocalPose = Omit<PlayPose, "smoothTurn">;

function localPose(eq: Equipment, t: number): { pose: LocalPose; smoothTurn: boolean } {
  switch (eq.kind) {
    case "swing": {
      const phi = swingAngle(t);
      return {
        pose: {
          x: -SWING.seatX,
          y: sitY(SWING.topY - SWING.rope * Math.cos(phi) + SWING.seatThickness / 2),
          z: -SWING.rope * Math.sin(phi),
          ry: 0,
          tiltX: phi,
          motion: "sit",
        },
        smoothTurn: false,
      };
    }
    case "slide":
      return { pose: samplePath(SLIDE_PATH, t), smoothTurn: true };
    case "seesaw": {
      const theta = seesawTilt(t);
      return {
        pose: {
          x: SEESAW.seatX * Math.cos(theta),
          y: sitY(SEESAW.pivotY + 0.08 + SEESAW.seatX * Math.sin(theta)),
          z: 0,
          ry: -HALF_PI,
          tiltX: 0,
          motion: "sit",
        },
        smoothTurn: false,
      };
    }
    case "spring": {
      const { bounce, rock } = springMotion(t);
      const sy = SPRING.seatY;
      const sz = -0.05;
      return {
        pose: {
          x: 0,
          y: sitY(SPRING.bodyY + bounce + sy * Math.cos(rock) - sz * Math.sin(rock)),
          z: sy * Math.sin(rock) + sz * Math.cos(rock),
          ry: 0,
          tiltX: rock,
          motion: "sit",
        },
        smoothTurn: false,
      };
    }
    case "merry": {
      const a = merryAngle(t);
      const r = MERRY.seatRadius;
      return {
        pose: { x: r * Math.sin(a), y: sitY(MERRY.topY), z: r * Math.cos(a), ry: a + HALF_PI, tiltX: 0, motion: "sit" },
        smoothTurn: false,
      };
    }
    case "ballPit": {
      if (t < 0.9) {
        const u = t / 0.9;
        return {
          pose: { x: 0, y: 0.25 * Math.sin(Math.PI * u), z: 1.9 - 1.35 * u, ry: Math.PI, tiltX: 0, motion: "walk" },
          smoothTurn: true,
        };
      }
      const tt = t - 0.9;
      const a = 0.9 * tt;
      const hopping = Math.floor(tt / 1.6) % 2 === 0;
      return {
        pose: {
          x: 0.72 * Math.sin(a),
          y: hopping ? 0.22 * Math.abs(Math.sin(5 * tt)) : 0,
          z: -0.2 + 0.75 * Math.cos(a),
          ry: a + HALF_PI,
          tiltX: 0,
          motion: hopping ? "jump" : "walk",
        },
        smoothTurn: true,
      };
    }
    case "playHouse":
      return { pose: samplePath(PLAY_HOUSE_PATH, t), smoothTurn: true };
    case "tunnel":
      return { pose: samplePath(TUNNEL_PATH, t), smoothTurn: true };
    case "climb":
      return {
        pose: {
          x: 0.6 * Math.sin(0.5 * t),
          y: 1.25 * (0.5 - 0.5 * Math.cos(1.0 * t)),
          z: 0.45,
          ry: Math.PI,
          tiltX: 0,
          motion: "jump",
        },
        smoothTurn: false,
      };
    case "bench":
      return { pose: { x: 0, y: sitY(BENCH.seatY), z: 0.05, ry: 0, tiltX: 0, motion: "sit" }, smoothTurn: false };
  }
}

/** World-space pose of the character `t` seconds after starting to play on `eq`. */
export function playPose(eq: Equipment, t: number): PlayPose {
  const { pose, smoothTurn } = localPose(eq, Math.max(0, t));
  const world = toWorld(eq.x, eq.z, eq.yaw, pose.x, pose.z);
  return { ...pose, x: world.x, z: world.z, ry: eq.yaw + pose.ry, smoothTurn };
}

/**
 * Shared, per-frame play state read by the ride models so the ride and the
 * character use the same clock. `startedAt` is the R3F clock time.
 */
export const playRuntime: { activeId: string | null; startedAt: number } = { activeId: null, startedAt: 0 };
