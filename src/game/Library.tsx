import { useEffect, useMemo, useState } from "react";
import { Text } from "@react-three/drei";
import { supabase } from "@/integrations/supabase/client";
import type { Book, Grade, Subject } from "./types";
import { Shelf } from "./Shelf";
import { ReadingTable } from "./ReadingTable";

type Props = { currentGrade: Grade };

export function Library({ currentGrade }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const shelves: { subject: Subject; x: number }[] = [
    { subject: "math", x: -4.35 },
    { subject: "viet", x: 0 },
    { subject: "english", x: 4.35 },
  ];

  useEffect(() => {
    let active = true;
    const loadBooks = async () => {
      const { data, error } = await supabase
        .from("library_books")
        .select("id, title, subject, grade, color")
        .eq("is_active", true)
        .eq("grade", currentGrade)
        .order("sort_order", { ascending: true });
      if (error) {
        console.error("[Library] Không tải được danh mục sách:", error.message);
        return;
      }
      if (active && data) {
        const validBooks = data.filter(
          (book): book is typeof book & { subject: Subject; grade: Grade } =>
            ["math", "viet", "english"].includes(book.subject) &&
            book.grade >= 1 && book.grade <= 5,
        ).map((book) => ({
          id: book.id,
          title: book.title,
          subject: book.subject,
          grade: book.grade,
          color: book.color,
        }));
        setBooks(validBooks);
      }
    };
    void loadBooks();
    return () => { active = false; };
  }, [currentGrade]);

  const visibleBooks = useMemo(
    () => books.filter((book) => book.grade === currentGrade),
    [books, currentGrade],
  );

  return (
    <group>
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#b68b61" roughness={0.86} />
      </mesh>
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
          books={visibleBooks.filter((book) => book.subject === shelf.subject)}
        />
      ))}
      <ReadingTable position={[0, 0, 1.15]} />
      <pointLight position={[0, 3.7, 0]} intensity={1.8} distance={17} color="#fff0d4" />
      <pointLight position={[0, 2.7, 4.6]} intensity={0.8} distance={9} color="#ffe2ad" />
    </group>
  );
}
