import {Html,Text} from "@react-three/drei";
import type {Grade,Subject,Book} from "./types";
type Props={position:[number,number,number];subject:Subject;grade:Grade;books:Book[];borrowedIds:Set<string>;onSelectBook:(book:Book)=>void;onSelectShelf:()=>void};
const LABEL:Record<Subject,string>={math:"TOÁN",viet:"TIẾNG VIỆT",english:"TIẾNG ANH"};
const COLORS:Record<Subject,string>={math:"#4a90d9",viet:"#d94a4a",english:"#4ad98a"};
export function Shelf({position,subject,grade,books,borrowedIds,onSelectBook,onSelectShelf}:Props){
 const color=COLORS[subject],rows=Array.from({length:3},(_,r)=>books.slice(r*2,r*2+2));
 return <group position={position} scale={1.5} onClick={e=>{e.stopPropagation();onSelectShelf();}} onPointerOver={()=>{document.body.style.cursor="pointer";}} onPointerOut={()=>{document.body.style.cursor="default";}}>
 <mesh position={[0,1.35,0]} castShadow onClick={e=>{e.stopPropagation();onSelectShelf();}} onPointerOver={()=>{document.body.style.cursor="pointer";}} onPointerOut={()=>{document.body.style.cursor="default";}}><boxGeometry args={[3.55,2.7,.55]}/><meshStandardMaterial color="#68472f" roughness={.82}/></mesh>
 {[.08,.98,1.88].map(y=><mesh key={y} position={[0,y,.3]}><boxGeometry args={[3.45,.075,.08]}/><meshStandardMaterial color="#3f2c20"/></mesh>)}
 <mesh position={[0,2.68,.32]}><boxGeometry args={[3.55,.13,.1]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.18}/></mesh>
 {rows.map((row,r)=>row.map((book,i)=>{const active=borrowedIds.has(book.id);return <group key={book.id} position={[(i-(row.length-1)/2)*.52,.48+r*.9,.12]} onClick={e=>{e.stopPropagation();onSelectBook(book);}} onPointerOver={()=>{document.body.style.cursor="pointer";}} onPointerOut={()=>{document.body.style.cursor="default";}}>
 <mesh castShadow><boxGeometry args={[.42,.68,.34]}/><meshStandardMaterial color={book.color} emissive={active?"#ffd27a":"#000000"} emissiveIntensity={active ? 0.8 : 0}/></mesh><mesh position={[0,0,.176]}><boxGeometry args={[.31,.52,.012]}/><meshStandardMaterial color="#fff1d5"/></mesh></group>;}))}
 <mesh position={[0,3.05,.28]} onClick={e=>{e.stopPropagation();onSelectShelf();}}><boxGeometry args={[3.3,.42,.1]}/><meshStandardMaterial color="#fff4df"/></mesh><Text position={[0,3.05,.35]} fontSize={.22} color={color} anchorX="center" anchorY="middle">{LABEL[subject]} - LỚP {grade}</Text>
 <Html position={[0,3.55,.38]} center distanceFactor={7} zIndexRange={[50,0]} style={{pointerEvents:"auto"}}><button type="button" onClick={e=>{e.stopPropagation();onSelectShelf();}} style={{border:"2px solid white",borderRadius:12,padding:"5px 12px",background:color,color:"white",font:"900 12px Nunito,sans-serif",whiteSpace:"nowrap",boxShadow:"0 3px 9px #0004",cursor:"pointer"}}>📚 CHẠM ĐỂ XEM TÀI LIỆU</button></Html>
 </group>;
}