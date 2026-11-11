import {useEffect,useState} from "react";
import {Html} from "@react-three/drei";
import type {SupabaseClient} from "@supabase/supabase-js";
import {supabase as typedSupabase} from "@/integrations/supabase/client";
// Library tables are not in the generated types yet; use an untyped client.
const supabase=typedSupabase as unknown as SupabaseClient;
type Props={bookId:string;onClose:()=>void};
type ContentRow={title:string;content_html:string|null;content_pdf_url:string|null};
function safePdfUrl(value:string|null){if(!value)return null;try{const u=new URL(value);return u.protocol==="https:"?u.toString():null;}catch{return null;}}
export function BookReader({bookId,onClose}:Props){
 const [row,setRow]=useState<ContentRow|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let active=true;setLoading(true);setError("");supabase.from("library_books").select("title,content_html,content_pdf_url").eq("id",bookId).maybeSingle().then(({data,error})=>{if(!active)return;if(error)setError("Chưa tải được nội dung sách. Bé thử lại nhé.");else setRow(data as ContentRow|null);setLoading(false);});return()=>{active=false;};},[bookId]);
 const pdf=safePdfUrl(row?.content_pdf_url??null);
 const srcDoc=row?.content_html?("<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; font-src https: data:\"><style>body{font-family:Arial,sans-serif;color:#263238;line-height:1.8;padding:22px;max-width:760px;margin:auto}h1,h2,h3{color:#176b55}img{max-width:100%;height:auto}p,li{font-size:18px}</style></head><body>"+row.content_html+"</body></html>"):undefined;
 return <Html fullscreen zIndexRange={[200,0]}><div className="fixed inset-0 z-[10000] flex flex-col bg-white text-slate-900" style={{pointerEvents:"auto"}}>
 <header className="flex shrink-0 items-center justify-between border-b bg-emerald-50 p-3"><button onClick={onClose} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-bold">← Đóng</button><span className="max-w-[65%] truncate text-sm font-extrabold">📖 {row?.title??"Đọc sách"}</span><span className="w-12"/></header>
 <div className="min-h-0 flex-1 overflow-auto p-3">{loading?<p className="p-5 text-center">Đang tải nội dung sách…</p>:error?<p className="p-5 text-center text-red-600">{error}</p>:pdf?<iframe title="Đọc sách PDF" src={pdf} sandbox="allow-same-origin" className="h-full min-h-[70vh] w-full rounded-lg border"/>:srcDoc?<iframe title="Nội dung sách" srcDoc={srcDoc} sandbox="" className="h-full min-h-[70vh] w-full rounded-lg border"/>:<p className="p-5 text-center text-slate-600">Sách này chưa có nội dung đọc online.</p>}</div>
 </div></Html>;
}