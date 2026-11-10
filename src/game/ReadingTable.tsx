type Props = { position: [number, number, number] };

export function ReadingTable({ position }: Props) {
  return (
    <group position={position}>
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[1.35, 1.35, 0.12, 32]} />
        <meshStandardMaterial color="#9a6844" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.39, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 0.72, 12]} />
        <meshStandardMaterial color="#63432e" />
      </mesh>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => (
        <group key={angle} position={[Math.cos(angle) * 1.85, 0, Math.sin(angle) * 1.85]} rotation={[0, -angle, 0]}>
          <mesh position={[0, 0.48, 0]} castShadow>
            <boxGeometry args={[0.58, 0.1, 0.58]} />
            <meshStandardMaterial color="#805638" />
          </mesh>
          <mesh position={[0, 0.78, -0.23]} castShadow>
            <boxGeometry args={[0.58, 0.58, 0.1]} />
            <meshStandardMaterial color="#805638" />
          </mesh>
          {[-0.2, 0.2].map((x) => [-0.2, 0.2].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.24, z]}>
              <boxGeometry args={[0.07, 0.48, 0.07]} />
              <meshStandardMaterial color="#63432e" />
            </mesh>
          )))}
        </group>
      ))}
    </group>
  );
}
