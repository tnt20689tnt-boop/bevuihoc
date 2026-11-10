import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { Grade, Subject } from "./libraryBooks";
import type { Book } from "./libraryBooks";
import { Shelf } from "./Shelf";
import { ReadingTable } from "./ReadingTable";

type Props = { currentGrade: Grade };

export function Library({ currentGrade }: Props) {
  const shelves: { subject: Subject; x: number }[] = [
    { subject: "math", x: -4.35 },
    { subject: "viet", x: 0 },
    { subject: "english", x: 4.35 },
  ];
  return (
    <group>
      {/* Nền gỗ sáng */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#b68b61" roughness={0.86} />
      </mesh>
      {/* Tường sau và hai bên; mặt trước mở lối vào */}
      <mesh position={[0, 2.1, -6]} receiveShadow>
        <boxGeometry args={[14, 4.2, 0.22]} />
        <meshStandardMaterial color="#eee6d8" roughness={0.92} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 7, 2.1, 0]} receiveShadow>
          <boxGeometry args={[0.22, 4.2, 12]} />
          <meshStandardMaterial color="#eee6d8" roughness={0.92} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 5.05, 2.1, 6]} receiveShadow>
          <boxGeometry args={[3.9, 4.2, 0.22]} />
          <meshStandardMaterial color="#eee6d8" roughness={0.92} />
        </mesh>
      ))}
      {/* Mái và dầm gỗ */}
      <mesh position={[0, 4.28, 0]} castShadow>
        <boxGeometry args={[14.5, 0.28, 12.5]} />
        <meshStandardMaterial color="#6b4932" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.82, 5.88]}>
        <boxGeometry args={[3.2, 0.22, 0.28]} />
        <meshStandardMaterial color="#8d5d3d" />
      </mesh>
      <Text position={[0, 3.25, 5.78]} fontSize={0.48} color="#70482d" anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#fff4df">
        THƯ VIỆN BÉ VUI HỌC
      </Text>
      <Text position={[0, 2.82, 5.78]} fontSize={0.19} color="#8b674b" anchorX="center" anchorY="middle">
        MỖI CUỐN SÁCH - MỘT HÀNH TRÌNH KHÁM PHÁ
      </Text>
      {shelves.map((shelf) => (
        <Shelf
          key={shelf.subject}
          position={[shelf.x, 0, -4.75]}
          subject={shelf.subject}
          grade={currentGrade}
          books={LIBRARY_BOOKS.filter((book) => book.subject === shelf.subject && book.grade === currentGrade)}
        />
      ))}
      <ReadingTable position={[0, 0, 1.15]} />
      <pointLight position={[0, 3.7, 0]} intensity={1.8} distance={17} color="#fff0d4" />
      <pointLight position={[0, 2.7, 4.6]} intensity={0.8} distance={9} color="#ffe2ad" />
    </group>
  );
}

const LIBRARY_BOOKS: Book[] = [
  ...([1, 2, 3, 4, 5] as Grade[]).flatMap((grade) => [
    { id: `math-${grade}-1`, title: `Toán ${grade} - Tập 1`, subject: "math" as const, grade, color: "#4a90d9" },
    { id: `math-${grade}-2`, title: `Bài tập Toán ${grade}`, subject: "math" as const, grade, color: "#3477b8" },
    { id: `viet-${grade}-1`, title: `Tiếng Việt ${grade} - Tập 1`, subject: "viet" as const, grade, color: "#d94a4a" },
    { id: `viet-${grade}-2`, title: `Tiếng Việt ${grade} - Tập 2`, subject: "viet" as const, grade, color: "#b93b43" },
    { id: `english-${grade}-1`, title: `English ${grade}`, subject: "english" as const, grade, color: "#4aaf78" },
    { id: `english-${grade}-2`, title: `Vocabulary ${grade}`, subject: "english" as const, grade, color: "#328b62" },
  ]),
];
