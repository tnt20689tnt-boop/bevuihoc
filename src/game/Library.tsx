import {useMemo,useState} from "react";
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
 const shelves:{subject:Subject;x:number}[]=[{subject:"math",x:-11},{subject:"viet",x:0},{subject:"english",x:11}];
 const visible=useMemo(()=>books.filter(b=>b.grade===currentGrade),[books,currentGrade]);const borrowed=useMemo(()=>new Set(loans.map(l=>l.book_id)),[loans]);
 const loan=selected?loans.find(l=>l.book_id===selected.id):undefined;const active=selected?(books.find(b=>b.id===selected.id)??selected):null;
 return <group>
 <LibraryLearningPanel grade={currentGrade} requestedSubject={requestedSubject} onRequestHandled={()=>setRequestedSubject(null)}/>
 <mesh position={[0,.025,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[40,36]}/><meshStandardMaterial color="#b68b61" roughness={.86}/></mesh>
 <mesh position={[0,2.25,-18]} userData={{ cameraOccluder: true }}><boxGeometry args={[40,4.5,.22]}/><meshStandardMaterial color="#eee6d8"/></mesh>
 {[-1,1].map(s=><mesh key={s} position={[s*20,2.25,0]} userData={{ cameraOccluder: true }}><boxGeometry args={[.22,4.5,36]}/><meshStandardMaterial color="#eee6d8"/></mesh>)}
 {[-1,1].map(s=><mesh key={s} position={[s*15.9,2.25,17.88]} userData={{ cameraOccluder: true }}><boxGeometry args={[8.2,4.5,.22]}/><meshStandardMaterial color="#eee6d8"/></mesh>)}
 <mesh position={[0,4.62,0]} userData={{ cameraOccluder: true }}><boxGeometry args={[40.5,.3,36.5]}/><meshStandardMaterial color="#6b4932"/></mesh>
 <mesh position={[0,4.05,17.88]}><boxGeometry args={[3.2,.22,.28]}/><meshStandardMaterial color="#8d5d3d"/></mesh>
 <Text position={[0,3.5,17.78]} fontSize={.48} color="#70482d" anchorX="center" anchorY="middle">THƯ VIỆN BÉ VUI HỌC</Text>
 <Text position={[0,3.08,17.78]} fontSize={.19} color="#8b674b" anchorX="center" anchorY="middle">MỖI CUỐN SÁCH - MỘT HÀNH TRÌNH KHÁM PHÁ</Text>
 {shelves.map(s=><Shelf key={s.subject} position={[s.x,0,-13.5]} subject={s.subject} grade={currentGrade} books={visible.filter(b=>b.subject===s.subject)} borrowedIds={borrowed} onSelectBook={setSelected} onSelectShelf={()=>setRequestedSubject(s.subject)}/>)}
 <ReadingTable position={[0,0,5.5]}/><pointLight position={[0,4,0]} intensity={1.8} distance={38} color="#fff0d4"/><pointLight position={[0,3,14]} intensity={.8} distance={22} color="#ffe2ad"/>
 {active&&<BookPopup book={active} loan={loan} onClose={()=>setSelected(null)} onBorrow={borrowBook} onReturn={returnBook} onRead={id=>{setReadingBookId(id);setSelected(null);}}/>}{readingBookId&&<BookReader bookId={readingBookId} onClose={()=>setReadingBookId(null)}/>}
 </group>;
}