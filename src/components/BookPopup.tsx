import {useState} from "react";
import {Html} from "@react-three/drei";
import type {Book} from "@/game/types";
import type {Loan} from "@/hooks/useLibrary";
type Props={book:Book;loan?:Loan;onClose:()=>void;onBorrow:(id:string)=>Promise<void>;onReturn:(id:string)=>Promise<void>;onRead:(id:string)=>void};
export function BookPopup({book,loan,onClose,onBorrow,onReturn,onRead}:Props){
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 const run=async(fn:()=>Promise<void>,msg:string)=>{setBusy(true);setError("");setMessage("");try{await fn();setMessage(msg);}catch(e){setError(e instanceof Error?e.message:"Có lỗi, bé thử lại nhé.");}finally{setBusy(false);}};
 const subject=book.subject==="math"?"Toán":book.subject==="viet"?"Tiếng Việt":"Tiếng Anh";
 return <Html fullscreen zIndexRange={[100,0]}><div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" style={{pointerEvents:"auto"}} onClick={onClose}><section className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl" onClick={e=>e.stopPropagation()}>
 <div className="mb-4 flex h-32 items-center justify-center rounded-xl text-5xl" style={{background:book.cover_url?"center/cover url("+book.cover_url+")":book.color}}>📚</div><h2 className="text-xl font-black">{book.title}</h2><p className="text-sm text-slate-600">{subject} · Lớp {book.grade}</p>{book.description&&<p className="mt-2 text-sm">{book.description}</p>}<p className="mt-2 text-sm font-bold text-emerald-700">Còn {book.available_copies??0}/{book.total_copies??0} cuốn</p>
 {error&&<p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}{message&&<p className="mt-2 rounded bg-green-50 p-2 text-sm text-green-700">{message}</p>}
 <div className="mt-4"><button onClick={()=>onRead(book.id)} className="w-full rounded-xl border-2 border-emerald-500 px-4 py-2 font-bold text-emerald-700">📖 Đọc thử ngay</button></div><div className="mt-3 flex gap-2">{loan?<button disabled={busy} onClick={()=>void run(()=>onReturn(loan.id),"Đã trả sách thành công!")} className="flex-1 rounded-xl bg-amber-500 p-3 font-bold text-white">{busy?"Đang xử lý…":"Trả sách"}</button>:<button disabled={busy||(book.available_copies??0)<1} onClick={()=>void run(()=>onBorrow(book.id),"Mượn sách thành công!")} className="flex-1 rounded-xl bg-emerald-600 p-3 font-bold text-white">{busy?"Đang xử lý…":(book.available_copies??0)<1?"Đã hết sách":"Mượn sách"}</button>}<button onClick={onClose} className="rounded-xl border px-4 font-bold">Đóng</button></div>
 </section></div></Html>;
}