import { useState } from "react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export function AppleButton({ className, label = "Đăng nhập bằng Apple" }: { className?: string; label?: string }) {
  const [busy, setBusy] = useState(false);

  async function go() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) {
        toast.error("Đăng nhập Apple chưa thành công. Phụ huynh thử lại nhé.");
        setBusy(false);
        return;
      }
      if (result.redirected) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Apple chưa được bật trong cài đặt đăng nhập của dự án. Vui lòng bật Apple trong Lovable Cloud rồi thử lại.");
        setBusy(false);
        return;
      }
      window.location.assign("/nhan-vat");
    } catch (error) {
      console.error("Apple sign-in failed", error);
      toast.error("Không kết nối được Apple. Phụ huynh thử lại nhé.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={busy}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-4 text-[15px] font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60",
        className,
      )}
    >
      <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.37 12.23c.02 2.1 1.84 2.8 1.86 2.81-.02.05-.29 1-.96 1.98-.58.84-1.18 1.68-2.12 1.7-.93.02-1.23-.55-2.3-.55-1.06 0-1.4.53-2.28.57-.91.03-1.6-.91-2.18-1.75-1.19-1.72-2.1-4.86-.88-6.98.61-1.05 1.7-1.72 2.88-1.74.9-.02 1.75.61 2.3.61.54 0 1.56-.75 2.63-.64.45.02 1.72.18 2.54 1.36-.07.04-1.52.89-1.5 2.63ZM14.65 6.98c.48-.58.8-1.38.71-2.18-.69.03-1.52.46-2.02 1.04-.44.51-.83 1.32-.73 2.1.77.06 1.56-.39 2.04-.96Z" />
      </svg>
      {busy ? "Đang mở Apple…" : label}
    </button>
  );
}
