import { useMemo } from "react";
import { Lantern } from "./Lantern";

type Props = {
  from: [number, number, number];
  to: [number, number, number];
  count: number;
  lightAtCenter?: boolean;
  poleHeight?: number;
};

export function LanternRow({
  from,
  to,
  count,
  lightAtCenter = true,
  poleHeight = 3.1,
}: Props) {
  const positions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      arr.push([
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
        from[2] + (to[2] - from[2]) * t,
      ]);
    }
    return arr;
  }, [from[0], from[1], from[2], to[0], to[1], to[2], count]);

  const centerIdx = Math.floor(count / 2);
  return (
    <group>
      {positions.map((position, i) => (
        <Lantern
          key={i}
          position={position}
          poleHeight={poleHeight}
          withLight={lightAtCenter && i === centerIdx}
          lightIntensity={7}
        />
      ))}
    </group>
  );
}
