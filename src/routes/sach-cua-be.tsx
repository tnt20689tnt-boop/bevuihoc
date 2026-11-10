import {createFileRoute,Link} from "@tanstack/react-router";
import {useMemo} from "react";
import {useMyProfile} from "@/hooks/use-player";
import {useLibrary} from "@/hooks/useLibrary";
import type {Grade} from "@/game/types";
export const Route=createFileRoute("/sach-cua-be")({head:()=>({meta:[{title:"Sách Bé Đang Mượn | Bé Vui Học"},{name:"description",content:"Theo dõi sách bé đang mượn từ thư viện Bé Vui Học."}]}),component:SachCuaBe});
function SachCuaBe(){
 const {data:profile,isLoading}=useMyProfile();const grade=Math.min(5,Math.max(1,Math.round(profile?.grade??1))) as Grade;const {books,loans,returnBook,loading}=useLibrary(null);
 const entries=useMemo(()=>loans.map(loan=>({loan,book:books.find(b=>b.id===loan.book_id)})).filter((x):x is {loan:(typeof loans)[number];book:NonNullable<typeof x.book>}=>!!x.book),[loans,books]);
 if(isLoading||loading)return <main className="min-h-screen bg-amber-50 p-6 text-center font-bold">Đang tải sách của bé…</main>;
 return <main className="min-h-screen bg-gradient-to-b from-amber-50 to-sky-50 px-4 py-8"><div className="mx-auto max-w-2xl"><Link to="/the-gioi" className="font-bold text-emerald-700">← Quay lại trường học</Link><h1 className="mt-4 text-3xl font-black">📚 Sách bé đang mượn</h1><p className="text-slate-600">Danh sách sách của bé lớp {grade}</p>{entries.length===0?<div className="mt-6 rounded-2xl bg-white p-6 text-center shadow">Bé chưa mượn cuốn nào. Vào thư viện chọn sách nhé!</div>:<ul className="mt-6 space-y-3">{entries.map(({loan,book})=><li key={loan.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow"><div className="flex h-16 w-12 items-center justify-center rounded-lg text-2xl" style={{backgroundColor:book.color}}>📘</div><div className="min-w-0 flex-1"><p className="font-bold">{book.title}</p><p className="text-sm text-slate-600">Hạn trả: {new Date(loan.due_at).toLocaleDateString("vi-VN")}</p></div><button onClick={()=>void returnBook(loan.id)} className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-white">Trả</button></li>)}</ul>}</div></main>;
}