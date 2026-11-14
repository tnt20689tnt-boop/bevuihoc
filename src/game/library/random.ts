export type Rng = () => number;

/** Deterministic random numbers so every book prints the same content each time. */
export function seeded(seed: string): Rng {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const int = (r: Rng, min: number, max: number) => min + Math.floor(r() * (max - min + 1));

export function pick<T>(r: Rng, list: readonly T[]): T {
  return list[Math.floor(r() * list.length)] as T;
}

export function shuffle<T>(r: Rng, list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

/** Vietnamese number formatting: 12 345 (non-breaking space keeps numbers on one line). */
export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");

/** Integer value in units of 1/scale written with a Vietnamese decimal comma. */
export function dec(value: number, scale: number): string {
  const neg = value < 0;
  const v = Math.abs(value);
  const whole = Math.floor(v / scale);
  const frac = String(v % scale).padStart(String(scale).length - 1, "0").replace(/0+$/, "");
  return (neg ? "-" : "") + fmt(whole) + (frac ? "," + frac : "");
}

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}
