import { useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";

type Props = {
  center: [number, number, number];
  radius?: number;
  count?: number;
  color?: string;
};

export function TreeFairyLights({
  center,
  radius = 1.6,
  count = 20,
  color = "#ffd27a",
}: Props) {
  const points = useMemo(() => {
    // Deterministic distribution prevents lights jumping on re-render.
    return Array.from({ length: count }, (_, i) => {
      const theta = i * 2.399963;
      const y = 1 - (2 * (i + 0.5)) / count;
      const ring = Math.sqrt(1 - y * y);
      const r = radius * (0.76 + (i % 4) * 0.06);
      return [
        r * ring * Math.cos(theta),
        r * y,
        r * ring * Math.sin(theta),
      ] as [number, number, number];
    });
  }, [radius, count]);

  return (
    <group position={center}>
      <Instances limit={count} frustumCulled>
        <sphereGeometry args={[0.055, 6, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.6}
          toneMapped={false}
        />
        {points.map((position, i) => (
          <Instance key={i} position={position} />
        ))}
      </Instances>
    </group>
  );
}
