import { useEffect, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Avatar } from "@/lib/avatar";

export type Emote = "wave" | "laugh" | "clap" | "dance" | "surprised" | "cheer";
export type Motion = "idle" | "walk" | "run" | "jump" | "kick" | "dive" | "sit";
export type AnimState = { motion: Motion; emote: Emote | null; emoteUntil: number };

export const makeAnimState = (): AnimState => ({ motion: "idle", emote: null, emoteUntil: 0 });

export const EMOTES: { id: Emote; label: string; icon: string }[] = [
  { id: "wave", label: "Vẫy tay", icon: "👋" },
  { id: "laugh", label: "Cười", icon: "😄" },
  { id: "clap", label: "Vỗ tay", icon: "👏" },
  { id: "dance", label: "Nhảy vui", icon: "💃" },
  { id: "surprised", label: "Ngạc nhiên", icon: "😮" },
  { id: "cheer", label: "Cổ vũ", icon: "🎉" },
];

const IDLE = makeAnimState();
const R = 0.55; // roughness: soft clay

function Mat({ c }: { c: string }) {
  return <meshStandardMaterial color={c} roughness={R} />;
}

const EYE = "#2a2340";

function Eye({ x, kind }: { x: number; kind: Avatar["eyes"] | "closed" }) {
  if (kind === "happy" || kind === "closed") {
    return (
      <mesh position={[x, -0.02, 0.405]}>
        <torusGeometry args={[0.05, 0.015, 8, 16, Math.PI]} />
        <Mat c={EYE} />
      </mesh>
    );
  }
  const r = kind === "sparkle" ? 0.072 : 0.058;
  return (
    <group position={[x, -0.02, 0.39]}>
      <mesh scale={[1, 1.15, 0.6]}>
        <sphereGeometry args={[r, 16, 12]} />
        <meshStandardMaterial color={EYE} roughness={0.2} />
      </mesh>
      <mesh position={[r * 0.35, r * 0.4, r * 0.55]}>
        <sphereGeometry args={[r * 0.32, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {kind === "sparkle" && (
        <mesh position={[-r * 0.3, -r * 0.35, r * 0.55]}>
          <sphereGeometry args={[r * 0.18, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
}

function Mouth({ kind }: { kind: Avatar["mouth"] }) {
  const lip = "#8a2c40";
  if (kind === "open")
    return (
      <mesh position={[0, -0.17, 0.375]} scale={[0.8, 1, 0.4]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <Mat c={lip} />
      </mesh>
    );
  if (kind === "grin")
    return (
      <mesh position={[0, -0.14, 0.395]}>
        <circleGeometry args={[0.085, 18, Math.PI, Math.PI]} />
        <meshStandardMaterial color={lip} side={THREE.DoubleSide} />
      </mesh>
    );
  return (
    <group>
      <mesh position={[0, -0.13, 0.39]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.065, 0.016, 8, 16, Math.PI]} />
        <Mat c={lip} />
      </mesh>
      {kind === "tongue" && (
        <mesh position={[0, -0.2, 0.37]} scale={[1, 0.7, 0.5]}>
          <sphereGeometry args={[0.035, 10, 8]} />
          <Mat c="#ff6f8b" />
        </mesh>
      )}
    </group>
  );
}

function Hair({ a }: { a: Avatar }) {
  const c = a.hairColor;
  const cap = (
    <mesh rotation={[-0.22, 0, 0]} position={[0, 0.02, -0.01]}>
      <sphereGeometry args={[a.hair === "buzz" ? 0.43 : 0.455, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      <Mat c={c} />
    </mesh>
  );
  switch (a.hair) {
    case "spiky":
      return (
        <group>
          {cap}
          {[
            [0, 0.46, 0.05, 0],
            [0.2, 0.4, 0.1, -0.5],
            [-0.2, 0.4, 0.1, 0.5],
            [0.1, 0.42, -0.2, -0.3],
            [-0.1, 0.42, -0.2, 0.3],
            [0, 0.38, 0.28, 0],
          ].map(([x = 0, y = 0, z = 0, rz = 0], i) => (
            <mesh key={i} position={[x, y, z]} rotation={[z > 0.2 ? 0.6 : 0, 0, rz]}>
              <coneGeometry args={[0.1, 0.24, 8]} />
              <Mat c={c} />
            </mesh>
          ))}
        </group>
      );
    case "curly":
      return (
        <group>
          {cap}
          {Array.from({ length: 10 }).map((_, i) => {
            const ang = (i / 10) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(ang) * 0.32, 0.3 + (i % 2) * 0.06, Math.sin(ang) * 0.3 - 0.03]}>
                <sphereGeometry args={[0.13, 12, 10]} />
                <Mat c={c} />
              </mesh>
            );
          })}
        </group>
      );
    case "side":
      return (
        <group>
          {cap}
          <mesh position={[0.12, 0.26, 0.27]} rotation={[0.3, 0, -0.5]} scale={[1.7, 0.55, 0.7]}>
            <sphereGeometry args={[0.15, 14, 10]} />
            <Mat c={c} />
          </mesh>
        </group>
      );
    case "buzz":
      return cap;
    case "long":
      return (
        <group>
          {cap}
          <mesh position={[0, -0.18, -0.12]} scale={[1.08, 1.4, 0.72]}>
            <sphereGeometry args={[0.42, 20, 16]} />
            <Mat c={c} />
          </mesh>
          <mesh position={[0, 0.24, 0.3]} scale={[1.5, 0.45, 0.6]}>
            <sphereGeometry args={[0.18, 14, 10]} />
            <Mat c={c} />
          </mesh>
        </group>
      );
    case "pigtails":
      return (
        <group>
          {cap}
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh position={[s * 0.47, -0.08, -0.06]}>
                <sphereGeometry args={[0.17, 14, 12]} />
                <Mat c={c} />
              </mesh>
              <mesh position={[s * 0.4, 0.04, -0.04]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <Mat c="#ff4f8b" />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.24, 0.3]} scale={[1.5, 0.45, 0.6]}>
            <sphereGeometry args={[0.18, 14, 10]} />
            <Mat c={c} />
          </mesh>
        </group>
      );
    case "ponytail":
      return (
        <group>
          {cap}
          <mesh position={[0, 0.18, -0.43]}>
            <sphereGeometry args={[0.13, 12, 10]} />
            <Mat c={c} />
          </mesh>
          <mesh position={[0, -0.12, -0.5]} rotation={[0.25, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.3, 6, 12]} />
            <Mat c={c} />
          </mesh>
          <mesh position={[0, 0.24, 0.3]} scale={[1.5, 0.45, 0.6]}>
            <sphereGeometry args={[0.18, 14, 10]} />
            <Mat c={c} />
          </mesh>
        </group>
      );
    case "bun":
      return (
        <group>
          {cap}
          <mesh position={[0, 0.46, -0.1]}>
            <sphereGeometry args={[0.18, 14, 12]} />
            <Mat c={c} />
          </mesh>
          <mesh position={[0, 0.24, 0.3]} scale={[1.5, 0.45, 0.6]}>
            <sphereGeometry args={[0.18, 14, 10]} />
            <Mat c={c} />
          </mesh>
        </group>
      );
    case "bob":
      return (
        <group>
          {cap}
          <mesh position={[0, -0.04, -0.08]} scale={[1.1, 0.92, 0.95]}>
            <sphereGeometry args={[0.45, 22, 16]} />
            <Mat c={c} />
          </mesh>
          <mesh position={[0, 0.24, 0.3]} scale={[1.6, 0.45, 0.6]}>
            <sphereGeometry args={[0.18, 14, 10]} />
            <Mat c={c} />
          </mesh>
        </group>
      );
    default:
      return (
        <group>
          {cap}
          <mesh position={[0, 0.25, 0.3]} scale={[1.3, 0.45, 0.6]}>
            <sphereGeometry args={[0.18, 14, 10]} />
            <Mat c={c} />
          </mesh>
        </group>
      );
  }
}

function Accessory({ id }: { id: string }) {
  switch (id) {
    case "bow":
      return (
        <group position={[0.24, 0.33, 0.1]} rotation={[0, 0, -0.4]}>
          <mesh position={[-0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.08, 0.16, 10]} />
            <Mat c="#ff4f8b" />
          </mesh>
          <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.08, 0.16, 10]} />
            <Mat c="#ff4f8b" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.045, 10, 8]} />
            <Mat c="#ff2f72" />
          </mesh>
        </group>
      );
    case "headband":
      return (
        <mesh rotation={[-0.35, 0, 0]} position={[0, 0.02, 0]}>
          <torusGeometry args={[0.46, 0.035, 8, 28, Math.PI]} />
          <Mat c="#ff4f8b" />
        </mesh>
      );
    case "flower":
      return (
        <group position={[0.27, 0.3, 0.14]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.05, Math.sin((i / 5) * Math.PI * 2) * 0.05, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <Mat c="#ffd166" />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <Mat c="#ff7a59" />
          </mesh>
        </group>
      );
    case "star":
      return (
        <mesh position={[0.27, 0.32, 0.12]} rotation={[0, 0, 0.3]}>
          <octahedronGeometry args={[0.08]} />
          <meshStandardMaterial color="#ffd166" emissive="#ffb703" emissiveIntensity={0.3} />
        </mesh>
      );
    case "cap":
      return (
        <group>
          <mesh rotation={[-0.15, 0, 0]} position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.47, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <Mat c="#e84a4a" />
          </mesh>
          <mesh position={[0, 0.1, 0.42]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[0.46, 0.035, 0.3]} />
            <Mat c="#c43838" />
          </mesh>
        </group>
      );
    case "glasses":
      return (
        <group position={[0, -0.02, 0.43]}>
          {[-0.15, 0.15].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <torusGeometry args={[0.085, 0.014, 8, 20]} />
              <Mat c="#2a2340" />
            </mesh>
          ))}
          <mesh>
            <boxGeometry args={[0.07, 0.015, 0.015]} />
            <Mat c="#2a2340" />
          </mesh>
        </group>
      );
    case "headphones":
      return (
        <group>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.47, 0.03, 8, 28, Math.PI]} />
            <Mat c="#2f3e66" />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
              <Mat c="#3fa7f5" />
            </mesh>
          ))}
        </group>
      );
    default:
      return null;
  }
}

/** Procedural chibi kid. Faces +z; feet at y = 0; ~1.75 units tall. */
export function Character3D({
  avatar,
  state,
  castShadow = true,
}: {
  avatar: Avatar;
  state?: MutableRefObject<AnimState>;
  castShadow?: boolean;
}) {
  const a = avatar;
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);

  useEffect(() => {
    root.current?.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = castShadow;
    });
  }, [castShadow, avatar]);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;
    const s = state?.current ?? IDLE;
    const now = performance.now() / 1000;
    const emote = s.emote && now < s.emoteUntil ? s.emote : null;

    let f = 0;
    let amp = 0;
    if (s.motion === "walk") [f, amp] = [9, 0.55];
    if (s.motion === "run") [f, amp] = [13, 0.9];
    const ph = Math.sin(t * f);
    const tg = {
      lLx: ph * amp,
      lRx: -ph * amp,
      aLx: -ph * amp * 0.8,
      aRx: ph * amp * 0.8,
      aLz: -0.12,
      aRz: 0.12,
      bodyY: amp ? Math.abs(ph) * 0.06 : Math.sin(t * 2) * 0.012,
      bodyRy: 0,
      bodyX: 0,
      headZ: 0,
      headX: 0,
    };
    if (s.motion === "jump") Object.assign(tg, { lLx: -0.6, lRx: 0.3, aLz: -1.3, aRz: 1.3, aLx: 0, aRx: 0 });
    if (s.motion === "kick") Object.assign(tg, { lRx: -1.3, lLx: 0.2, aLx: -0.7, aRx: 0.5, aLz: -0.5 });
    if (s.motion === "dive") Object.assign(tg, { aLz: -2.6, aRz: 2.6, aLx: 0, aRx: 0, lLx: 0.4, lRx: -0.4 });
    if (s.motion === "sit") Object.assign(tg, {
      bodyY: -0.2,
      lLx: -1.18,
      lRx: -1.18,
      aLx: -0.18,
      aRx: -0.18,
      aLz: -0.18,
      aRz: 0.18,
    });
    if (s.motion === "crawl") {
      const crawlPhase = Math.sin(t * 9);
      Object.assign(tg, {
        bodyY: -0.04,
        bodyX: 1.12,
        lLx: -0.28 + crawlPhase * 0.28,
        lRx: -0.28 - crawlPhase * 0.28,
        aLx: -1.8 + crawlPhase * 0.22,
        aRx: -1.8 - crawlPhase * 0.22,
        aLz: -0.08,
        aRz: 0.08,
      });
    }

    if (emote === "wave") Object.assign(tg, { aRz: 2.7 + Math.sin(t * 12) * 0.35, aRx: 0 });
    if (emote === "clap") {
      const c = 0.35 + Math.sin(t * 18) * 0.25;
      Object.assign(tg, { aLx: -1.35, aRx: -1.35, aLz: c, aRz: -c });
    }
    if (emote === "cheer")
      Object.assign(tg, {
        aLz: -2.7 - Math.sin(t * 10) * 0.2,
        aRz: 2.7 + Math.sin(t * 10) * 0.2,
        aLx: 0,
        aRx: 0,
        bodyY: Math.abs(Math.sin(t * 9)) * 0.22,
      });
    if (emote === "dance")
      Object.assign(tg, {
        bodyRy: Math.sin(t * 6) * 0.6,
        bodyY: Math.abs(Math.sin(t * 6)) * 0.14,
        aLz: -1.3 - Math.sin(t * 6) * 0.5,
        aRz: 1.3 - Math.sin(t * 6) * 0.5,
        lLx: Math.sin(t * 6) * 0.4,
        lRx: -Math.sin(t * 6) * 0.4,
      });
    if (emote === "laugh")
      Object.assign(tg, { headZ: Math.sin(t * 14) * 0.15, headX: -0.15, aLx: -0.7, aRx: -0.7, aLz: 0.3, aRz: -0.3, bodyY: Math.abs(Math.sin(t * 14)) * 0.03 });
    if (emote === "surprised") Object.assign(tg, { aLz: -1.9, aRz: 1.9, aLx: -0.3, aRx: -0.3, headX: -0.18, bodyY: 0.05 });

    const k = 1 - Math.exp(-16 * dt);
    const lerp = (o: THREE.Object3D | null, key: "x" | "y" | "z", v: number, isRot = true) => {
      if (!o) return;
      const tgt = isRot ? o.rotation : o.position;
      tgt[key] += (v - tgt[key]) * k;
    };
    lerp(legL.current, "x", tg.lLx);
    lerp(legR.current, "x", tg.lRx);
    lerp(armL.current, "x", tg.aLx);
    lerp(armR.current, "x", tg.aRx);
    lerp(armL.current, "z", tg.aLz);
    lerp(armR.current, "z", tg.aRz);
    lerp(body.current, "y", tg.bodyY, false);
    lerp(body.current, "y", tg.bodyRy);
    lerp(body.current, "x", tg.bodyX);
    lerp(head.current, "z", tg.headZ);
    lerp(head.current, "x", tg.headX);
  });

  const legColor = a.outfit === "dress" || a.outfit === "skirt" ? a.skin : a.bottomColor;
  const topColor = a.outfit === "uniform" ? "#ffffff" : a.topColor;
  const sleeve = topColor;

  return (
    <group ref={root}>
      <group ref={body}>
        {/* legs */}
        {[
          [legL, -0.13],
          [legR, 0.13],
        ].map(([ref, x]) => (
          <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.42, 0]}>
            <mesh position={[0, -0.18, 0]}>
              <capsuleGeometry args={[0.09, 0.2, 6, 12]} />
              <Mat c={legColor} />
            </mesh>
            <mesh position={[0, -0.37, 0.05]} scale={[1, 0.7, 1.4]}>
              <sphereGeometry args={[0.1, 12, 10]} />
              <Mat c={a.shoeColor} />
            </mesh>
          </group>
        ))}
        {/* torso */}
        <mesh position={[0, 0.66, 0]}>
          <capsuleGeometry args={[0.23, 0.18, 8, 16]} />
          <Mat c={topColor} />
        </mesh>
        {(a.outfit === "dress" || a.outfit === "skirt") && (
          <mesh position={[0, 0.46, 0]}>
            <cylinderGeometry args={[0.22, 0.4, 0.34, 20, 1, true]} />
            <meshStandardMaterial
              color={a.outfit === "dress" ? a.topColor : a.bottomColor}
              roughness={R}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        {a.outfit === "uniform" && (
          <>
            <mesh position={[0, 0.47, 0]}>
              {a.gender === "girl" ? (
                <cylinderGeometry args={[0.23, 0.36, 0.28, 20, 1, true]} />
              ) : (
                <cylinderGeometry args={[0.235, 0.24, 0.18, 20]} />
              )}
              <meshStandardMaterial color={a.bottomColor} roughness={R} side={THREE.DoubleSide} />
            </mesh>
            {/* red scarf (khăn quàng đỏ) */}
            <mesh position={[0, 0.8, 0.22]} rotation={[0.25, 0, Math.PI]}>
              <coneGeometry args={[0.09, 0.22, 3]} />
              <Mat c="#e63946" />
            </mesh>
            <mesh position={[0, 0.9, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.17, 0.03, 8, 20]} />
              <Mat c="#e63946" />
            </mesh>
          </>
        )}
        {a.outfit === "overall" && (
          <>
            <mesh position={[0, 0.6, 0.18]}>
              <boxGeometry args={[0.3, 0.26, 0.1]} />
              <Mat c={a.bottomColor} />
            </mesh>
            <mesh position={[0, 0.46, 0]}>
              <cylinderGeometry args={[0.235, 0.25, 0.2, 20]} />
              <Mat c={a.bottomColor} />
            </mesh>
          </>
        )}
        {a.outfit === "hoodie" && (
          <mesh position={[0, 0.92, -0.14]} rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[0.16, 0.07, 8, 18]} />
            <Mat c={topColor} />
          </mesh>
        )}
        {a.outfit === "jersey" && (
          <mesh position={[0, 0.68, 0.2]}>
            <boxGeometry args={[0.16, 0.2, 0.08]} />
            <Mat c="#ffffff" />
          </mesh>
        )}
        {(a.outfit === "tshirt" || a.outfit === "jersey" || a.outfit === "hoodie") && (
          <mesh position={[0, 0.46, 0]}>
            <cylinderGeometry args={[0.235, 0.24, 0.16, 20]} />
            <Mat c={a.bottomColor} />
          </mesh>
        )}
        {/* arms */}
        {[
          [armL, -0.3],
          [armR, 0.3],
        ].map(([ref, x]) => (
          <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.86, 0]}>
            <mesh position={[0, -0.16, 0]}>
              <capsuleGeometry args={[0.075, 0.2, 6, 10]} />
              <Mat c={sleeve} />
            </mesh>
            <mesh position={[0, -0.33, 0]}>
              <sphereGeometry args={[0.075, 10, 8]} />
              <Mat c={a.skin} />
            </mesh>
          </group>
        ))}
        {/* head */}
        <group ref={head} position={[0, 1.32, 0]}>
          <mesh>
            <sphereGeometry args={[0.42, 32, 24]} />
            <Mat c={a.skin} />
          </mesh>
          {/* ears */}
          {[-0.41, 0.41].map((x) => (
            <mesh key={x} position={[x, -0.04, 0]} scale={[0.6, 1, 0.8]}>
              <sphereGeometry args={[0.08, 10, 8]} />
              <Mat c={a.skin} />
            </mesh>
          ))}
          <Eye x={-0.15} kind={a.eyes === "wink" ? "round" : a.eyes} />
          <Eye x={0.15} kind={a.eyes === "wink" ? "closed" : a.eyes} />
          {[-0.25, 0.25].map((x) => (
            <mesh key={x} position={[x, -0.11, 0.33]} scale={[1, 0.65, 0.4]}>
              <sphereGeometry args={[0.06, 10, 8]} />
              <meshStandardMaterial color="#ff8fab" transparent opacity={0.7} roughness={0.8} />
            </mesh>
          ))}
          <Mouth kind={a.mouth} />
          <Hair a={a} />
          <Accessory id={a.accessory} />
        </group>
      </group>
    </group>
  );
}
