import { Text } from "@react-three/drei";
import type { Grade, Subject, Book } from "./libraryBooks";

type Props = { position: [number, number, number]; subject: Subject; grade: Grade; books: Book[] };

const LABEL: Record<Subject, string> = { math: "TOÁN", viet: "TIẾNG VIỆT", english: "TIẾNG ANH" };
const COLORS: Record<Subject, string> = { math: "#4a90d9", viet: "#d94a4a", english: "#4ad98a" };

export function Shelf({ position, subject, grade, books }: Props) {
  const color = COLORS[subject];
  const rows = Array.from({ length: 3 }, (_, row) => books.slice(row * 2, row * 2 + 2));
  return (
    <group position={position}>
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[3.55, 2.7, 0.55]} />
        <meshStandardMaterial color="#68472f" roughness={0.82} />
      </mesh>
      {[0.08, 0.98, 1.88].map((y) => (
        <mesh key={y} position={[0, y, 0.3]}>
          <boxGeometry args={[3.45, 0.075, 0.08]} />
          <meshStandardMaterial color="#3f2c20" />
        </mesh>
      ))}
      <mesh position={[0, 2.68, 0.32]}>
        <boxGeometry args={[3.55, 0.13, 0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} />
      </mesh>
      {rows.map((rowBooks, row) => rowBooks.map((book, i) => (
        <group key={book.id} position={[(i - (rowBooks.length - 1) / 2) * 0.52, 0.48 + row * 0.9, 0.12]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.68, 0.34]} />
            <meshStandardMaterial color={book.color} roughness={0.72} />
          </mesh>
          <mesh position={[0, 0, 0.176]}>
            <boxGeometry args={[0.31, 0.52, 0.012]} />
            <meshStandardMaterial color="#fff1d5" roughness={0.9} />
          </mesh>
        </group>
      )))}
      <mesh position={[0, 3.05, 0.28]}>
        <boxGeometry args={[3.3, 0.42, 0.1]} />
        <meshStandardMaterial color="#fff4df" />
      </mesh>
      <Text position={[0, 3.05, 0.35]} fontSize={0.22} color={color} anchorX="center" anchorY="middle" outlineWidth={0.004} outlineColor="#ffffff">
        {LABEL[subject]} - LỚP {grade}
      </Text>
    </group>
  );
}
