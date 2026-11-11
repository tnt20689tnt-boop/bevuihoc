import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Html } from "@react-three/drei";

/**
 * Renders normal page UI (panels, popups) from inside the 3D scene.
 * The drei <Html> anchor is a zero-size, click-through point, and the content
 * is portalled to <body> so it is always full-screen and never blocks taps on
 * 3D objects such as the library shelves.
 */
export function ScreenOverlay({ children }: { children: ReactNode }) {
  return (
    <Html style={{ width: 0, height: 0, pointerEvents: "none" }} zIndexRange={[0, 0]}>
      {typeof document === "undefined" ? null : createPortal(children, document.body)}
    </Html>
  );
}
