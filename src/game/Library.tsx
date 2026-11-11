import {useCallback,useMemo,useState} from "react";
import {Text} from "@react-three/drei";
import {Shelf} from "./Shelf";
import {ReadingTable} from "./ReadingTable";
import {useLibrary} from "@/hooks/useLibrary";
import {BookPopup} from "@/components/BookPopup";
import {BookReader} from "@/components/BookReader";
import {LibraryLearningPanel} from "@/game/LibraryLearningPanel";
import type {Book,Grade,Subject} from "./types";
type Props={currentGrade:Grade};
export function Library({currentGrade}:Props){
 const {books,loans,borrowBook,returnBook}=useLibrary(currentGrade);const [selected,setSelected]=useState<Book|null>(null);const [readingBookId,setReadingBookId]=useState<string|null>(null);const [requestedSubject,setRequestedSubject]=useState<Subject|null>(null);
 const shelves:{subject:Subject;x:number}[]=[{subject:"math",x:-8.5},{subject:"viet",x:0},{subject:"english",x:8.5}];
 const handleRequestHandled=useCallback(()=>setRequestedSubject(null),[]);
 const visible=useMemo(()=>books.filter(b=>b.grade===currentGrade),[books,currentGrade]);const borrowed=useMemo(()=>new Set(loans.map(l=>l.book_id)),[loans]);
 const loan=selected?loans.find(l=>l.book_id===selected.id):undefined;const active=selected?(books.find(b=>b.id===selected.id)??selected):null;
 return <group>
 <LibraryLearningPanel grade={currentGrade} requestedSubject={requestedSubject} onRequestHandled={handleRequestHandled}/>
 <mesh position={[0,.025,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[48,44]}/><meshStandardMaterial color="#b68b61" roughness={.86}/></mesh>
 <mesh position={[0,2.25,-22]} userData={{ cameraOccluder: true }}><boxGeometry args={[48,4.5,.22]}/><meshStandardMaterial color="#eee6d8"/></mesh>
 {[-1,1].map(s=><mesh key={s} position={[s*24,2.25,0]} userData={{ cameraOccluder: true }}><boxGeometry args={[.22,4.5,44]}/><meshStandardMaterial color="#eee6d8"/></mesh>)}
 {[-1,1].map(s=><mesh key={s} position={[s*18.5,2.25,21.88]} userData={{ cameraOccluder: true }}><boxGeometry args={[11,4.5,.22]}/><meshStandardMaterial color="#eee6d8"/></mesh>)}
 {/* Keep the ceiling open so the wide follow camera can see the player and the full library. */}
 <mesh position={[0,4.05,21.88]}><boxGeometry args={[3.2,.22,.28]}/><meshStandardMaterial color="#8d5d3d"/></mesh>
 <Text position={[0,3.5,21.78]} fontSize={.48} color="#70482d" anchorX="center" anchorY="middle">THƯ VIỆN BÉ VUI HỌC</Text>
 <Text position={[0,3.08,21.78]} fontSize={.19} color="#8b674b" anchorX="center" anchorY="middle">MỖI CUỐN SÁCH - MỘT HÀNH TRÌNH KHÁM PHÁ</Text>
 {shelves.map(s=><Shelf key={s.subject} position={[s.x,0,-15]} subject={s.subject} grade={currentGrade} books={visible.filter(b=>b.subject===s.subject)} borrowedIds={borrowed} onSelectBook={setSelected} onSelectShelf={()=>setRequestedSubject(s.subject)}/>)}
 <ReadingTable position={[0,0,8]}/><pointLight position={[0,4,0]} intensity={2.1} distance={46} color="#fff0d4"/><pointLight position={[0,3,28]} intensity={1.0} distance={32} color="#ffe2ad"/>
 {active&&<BookPopup book={active} loan={loan} onClose={()=>setSelected(null)} onBorrow={borrowBook} onReturn={returnBook} onRead={id=>{setReadingBookId(id);setSelected(null);}}/>}{readingBookId&&<BookReader bookId={readingBookId} onClose={()=>setReadingBookId(null)}/>}
 </group>;
}