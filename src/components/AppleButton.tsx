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
        toast.error("Đăng nhập Apple chưa thành công. Phụ huynh thử lại nhé.");
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
      // Apple brand button (black style on light card) — colors fixed by Apple's guidelines.
      // Official Apple logo artwork must come from Apple Design Resources; title-only until provided.
      className={cn(
        "inline-flex h-12 min-w-[140px] items-center justify-center gap-2 rounded-full bg-[#000000] px-4 text-[20px] font-semibold text-[#FFFFFF] shadow-sm transition hover:opacity-90 disabled:opacity-60",
        className,
      )}
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}
    >
      {busy ? "Đang mở Apple…" : label}
    </button>
  );
}
