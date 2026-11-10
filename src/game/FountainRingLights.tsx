import { Lantern } from "./Lantern";

type Props = {
  center: [number, number, number];
  radius?: number;
  count?: number;
};

export function FountainRingLights({
  center,
  radius = 3.2,
  count = 8,
}: Props) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const position: [number, number, number] = [
          center[0] + Math.cos(angle) * radius,
          center[1],
          center[2] + Math.sin(angle) * radius,
        ];
        return (
          <Lantern
            key={i}
            position={position}
            poleHeight={1.25}
            shadeRadius={0.24}
            withLight={i === 0}
            lightIntensity={5}
          />
        );
      })}
      <pointLight
        position={[center[0], center[1] + 0.8, center[2]]}
        color="#ffb86b"
        intensity={2.5}
        distance={7}
        decay={2}
        castShadow={false}
      />
    </group>
  );
}
