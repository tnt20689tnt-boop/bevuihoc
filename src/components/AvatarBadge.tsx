import type { Avatar } from "@/lib/avatar";
import { cn } from "@/lib/utils";

/** Flat 2D face badge drawn from the same avatar config as the 3D character. */
export function AvatarBadge({ avatar, size = 48, className }: { avatar: Avatar; size?: number; className?: string }) {
  const a = avatar;
  const hc = a.hairColor;
  const longBack = a.hair === "long" || a.hair === "bob" || a.hair === "ponytail";
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full", className)}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="50" fill={a.topColor} opacity="0.35" />
      {longBack && <rect x="20" y="40" width="60" height={a.hair === "bob" ? 30 : 48} rx="22" fill={hc} />}
      {a.hair === "pigtails" && (
        <>
          <circle cx="16" cy="56" r="12" fill={hc} />
          <circle cx="84" cy="56" r="12" fill={hc} />
        </>
      )}
      {a.hair === "bun" && <circle cx="50" cy="14" r="12" fill={hc} />}
      {/* shirt */}
      <path d="M18 100 Q50 70 82 100 Z" fill={a.topColor} />
      {/* head */}
      <circle cx="50" cy="52" r="30" fill={a.skin} />
      {/* hair cap */}
      {a.hair !== "buzz" ? (
        <path d="M19 50 Q20 18 50 18 Q80 18 81 50 Q70 34 50 34 Q30 34 19 50 Z" fill={hc} />
      ) : (
        <path d="M22 44 Q26 22 50 22 Q74 22 78 44 Q64 34 50 34 Q36 34 22 44 Z" fill={hc} opacity="0.85" />
      )}
      {a.hair === "spiky" && <path d="M26 30 L32 12 L40 26 L50 8 L58 26 L68 12 L74 30 Z" fill={hc} />}
      {a.hair === "curly" &&
        [24, 36, 50, 64, 76].map((x) => <circle key={x} cx={x} cy={x === 50 ? 20 : 26} r="9" fill={hc} />)}
      {/* eyes */}
      {a.eyes === "happy" ? (
        <>
          <path d="M34 55 Q39 48 44 55" stroke="#2a2340" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M56 55 Q61 48 66 55" stroke="#2a2340" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="39" cy="54" r={a.eyes === "sparkle" ? 5.5 : 4.5} fill="#2a2340" />
          {a.eyes === "wink" ? (
            <path d="M56 54 Q61 50 66 54" stroke="#2a2340" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          ) : (
            <circle cx="61" cy="54" r={a.eyes === "sparkle" ? 5.5 : 4.5} fill="#2a2340" />
          )}
          <circle cx="40.5" cy="52.5" r="1.6" fill="#fff" />
          {a.eyes !== "wink" && <circle cx="62.5" cy="52.5" r="1.6" fill="#fff" />}
        </>
      )}
      {/* cheeks */}
      <circle cx="31" cy="63" r="4.5" fill="#ff8fab" opacity="0.6" />
      <circle cx="69" cy="63" r="4.5" fill="#ff8fab" opacity="0.6" />
      {/* mouth */}
      {a.mouth === "open" ? (
        <ellipse cx="50" cy="68" rx="4" ry="5" fill="#7a2638" />
      ) : a.mouth === "grin" ? (
        <path d="M41 64 Q50 76 59 64 Z" fill="#7a2638" />
      ) : (
        <path d="M43 65 Q50 71 57 65" stroke="#7a2638" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {a.mouth === "tongue" && <ellipse cx="50" cy="69.5" rx="3" ry="2.5" fill="#ff6f8b" />}
      {/* accessories */}
      {a.accessory === "bow" && (
        <g transform="translate(70 26)">
          <path d="M0 0 L-12 -8 L-12 8 Z M0 0 L12 -8 L12 8 Z" fill="#ff4f8b" />
          <circle r="3.5" fill="#ff2f72" />
        </g>
      )}
      {a.accessory === "headband" && <path d="M20 42 Q50 12 80 42" stroke="#ff4f8b" strokeWidth="6" fill="none" />}
      {a.accessory === "flower" && (
        <g transform="translate(72 30)">
          {[0, 72, 144, 216, 288].map((r) => (
            <circle key={r} cx={Math.cos((r * Math.PI) / 180) * 5} cy={Math.sin((r * Math.PI) / 180) * 5} r="4" fill="#ffd166" />
          ))}
          <circle r="3" fill="#ff7a59" />
        </g>
      )}
      {a.accessory === "cap" && (
        <>
          <path d="M20 40 Q22 14 50 14 Q78 14 80 40 Z" fill="#e84a4a" />
          <rect x="44" y="34" width="44" height="7" rx="3.5" fill="#c43838" />
        </>
      )}
      {a.accessory === "glasses" && (
        <g stroke="#2a2340" strokeWidth="2.5" fill="none">
          <circle cx="39" cy="54" r="8" />
          <circle cx="61" cy="54" r="8" />
          <path d="M47 54 L53 54" />
        </g>
      )}
      {a.accessory === "star" && (
        <path d="M70 22 l3 7 7 .5 -5.5 4.5 2 7 -6.5 -4 -6.5 4 2 -7 -5.5 -4.5 7 -.5 Z" fill="#ffd166" />
      )}
      {a.accessory === "headphones" && (
        <g>
          <path d="M18 54 Q18 16 50 16 Q82 16 82 54" stroke="#2f3e66" strokeWidth="5" fill="none" />
          <rect x="12" y="48" width="10" height="16" rx="4" fill="#3fa7f5" />
          <rect x="78" y="48" width="10" height="16" rx="4" fill="#3fa7f5" />
        </g>
      )}
    </svg>
  );
}
