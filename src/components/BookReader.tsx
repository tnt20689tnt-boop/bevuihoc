import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as typedSupabase } from "@/integrations/supabase/client";
import { createLibraryPdf } from "@/game/libraryPdf";
import type { Book } from "@/game/types";
import { ScreenOverlay } from "@/game/ScreenOverlay";

const supabase = typedSupabase as unknown as SupabaseClient;
type Props = { bookId: string; book?: Book; onClose: () => void };
type ContentRow = {
  title: string;
  content_html: string | null;
  content_pdf_url: string | null;
  file_url: string | null;
  subject: Book["subject"];
  grade: Book["grade"];
};

function safeResourceUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function isPdf(value: string | null | undefined): boolean {
  return !!value && /\.pdf(?:$|[?#])/i.test(value);
}

export function BookReader({ bookId, book, onClose }: Props) {
  const [row, setRow] = useState<ContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    supabase
      .from("library_books")
      .select("title,content_html,content_pdf_url,file_url,subject,grade")
      .eq("id", bookId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError("Chưa tải được nội dung sách. Bé thử lại nhé.");
        else setRow(data as ContentRow | null);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookId]);

  useEffect(() => {
    const subject = row?.subject ?? book?.subject;
    const grade = row?.grade ?? book?.grade;
    const hasPdf = isPdf(row?.content_pdf_url) || isPdf(row?.file_url ?? book?.file_url);
    const hasHtml = !!row?.content_html || (!!row?.file_url && !isPdf(row.file_url));
    if (!subject || !grade || hasPdf || hasHtml || loading) {
      setGeneratedPdf(null);
      return;
    }
    let active = true;
    let url: string | null = null;
    createLibraryPdf(subject, grade, row?.title ?? book?.title)
      .then((value) => {
        url = value;
        if (active) setGeneratedPdf(value);
        else URL.revokeObjectURL(value);
      })
      .catch(() => {
        if (active) setError("Chưa tạo được PDF offline trên thiết bị này.");
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [row, book, loading, error]);

  const pdfValue = row?.content_pdf_url ?? (isPdf(row?.file_url) ? row?.file_url : book?.file_url);
  const pdf = isPdf(pdfValue) ? safeResourceUrl(pdfValue) : null;
  const htmlFile = row?.file_url && !isPdf(row.file_url) ? safeResourceUrl(row.file_url) : null;
  const html = row?.content_html
    ? "<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; font-src https: data:\"><style>body{font-family:Arial,sans-serif;color:#263238;line-height:1.8;padding:22px;max-width:760px;margin:auto}h1,h2,h3{color:#176b55}img{max-width:100%;height:auto}p,li{font-size:18px}</style></head><body>" +
      row.content_html +
      "</body></html>"
    : undefined;
  const title = row?.title ?? book?.title ?? "Đọc sách";

  return (
    <ScreenOverlay>
      <div className="fixed inset-0 z-[10000] flex flex-col bg-white text-slate-900" style={{ pointerEvents: "auto" }}>
        <header className="flex shrink-0 items-center justify-between border-b bg-emerald-50 p-3">
          <button onClick={onClose} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-bold">← Đóng</button>
          <span className="max-w-[65%] truncate text-sm font-extrabold">📖 {title}</span>
          <span className="w-12" />
        </header>
        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-2">
          {loading ? (
            <p className="p-5 text-center">Đang tải nội dung sách…</p>
          ) : pdf ? (
            <iframe title="Đọc sách PDF" src={pdf + "#toolbar=1&navpanes=1&view=FitH"} className="h-full min-h-[75vh] w-full rounded-lg border bg-white" />
          ) : generatedPdf ? (
            <iframe title="Đọc sách PDF offline" src={generatedPdf + "#toolbar=1&navpanes=1&view=FitH"} className="h-full min-h-[75vh] w-full rounded-lg border bg-white" />
          ) : html ? (
            <iframe title="Nội dung sách" srcDoc={html} sandbox="" className="h-full min-h-[75vh] w-full rounded-lg border bg-white" />
          ) : htmlFile ? (
            <iframe title="Nội dung tài liệu" src={htmlFile} sandbox="allow-same-origin" className="h-full min-h-[75vh] w-full rounded-lg border bg-white" />
          ) : error ? (
            <p className="p-5 text-center text-red-600">{error}</p>
          ) : (
            <p className="p-5 text-center text-slate-600">Sách này chưa có file đọc phù hợp.</p>
          )}
        </div>
      </div>
    </ScreenOverlay>
  );
}
