import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Crown, Globe2, LogOut, Medal, Shield, Swords, Trophy, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useMyProfile, type Profile } from "@/hooks/use-player";
import { useSettings } from "@/stores/settings";
import { AvatarBadge } from "@/components/AvatarBadge";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/the-gioi", label: "Thế giới", icon: Globe2 },
  { to: "/thi-dau", label: "Thi đấu", icon: Swords },
  { to: "/arena", label: "Đấu trường", icon: Medal },
  { to: "/bang-xep-hang", label: "Xếp hạng", icon: Trophy },
  { to: "/sanh-vinh-danh", label: "Vinh danh", icon: Crown },
] as const;

export function SoundToggle({ className }: { className?: string }) {
  const muted = useSettings((s) => s.muted);
  const toggle = useSettings((s) => s.toggleMuted);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-xl border-2 border-border bg-card text-foreground shadow-chunky active:translate-y-0.5",
        className,
      )}
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
}

export function TopBar({ profile }: { profile?: Profile | null | undefined }) {
  const { data: isAdmin } = useIsAdmin();
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center gap-2 border-b-4 border-border bg-card/95 px-3 backdrop-blur">
      <Link to="/the-gioi" className="flex items-center gap-2 pr-2">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-sunny text-xl shadow-chunky">🌈</span>
        <span className="hidden font-display text-lg font-extrabold leading-none text-foreground lg:block">
          Thế Giới
          <br />
          <span className="text-primary">Học Vui</span>
        </span>
      </Link>
      <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 font-display text-sm font-bold text-muted-foreground hover:bg-muted"
            activeProps={{ className: "bg-secondary text-secondary-foreground" }}
          >
            <n.icon className="h-5 w-5" />
            <span className={n.to === "/arena" ? "inline" : "hidden sm:inline"}>{n.label}</span>
          </Link>
        ))}
        {isAdmin && (
          <Link
            to="/quan-tri"
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 font-display text-sm font-bold text-muted-foreground hover:bg-muted"
            activeProps={{ className: "bg-secondary text-secondary-foreground" }}
          >
            <Shield className="h-5 w-5" />
            <span className="hidden sm:inline">Quản trị</span>
          </Link>
        )}
      </nav>
      <SoundToggle />
      {profile && (
        <Link
          to="/ho-so"
          className="flex items-center gap-2 rounded-2xl border-2 border-border bg-card py-1 pl-1 pr-3 shadow-chunky"
        >
          <AvatarBadge avatar={profile.avatar} size={36} />
          <span className="hidden max-w-28 truncate font-display text-sm font-bold md:block">{profile.display_name}</span>
        </Link>
      )}
      <button
        type="button"
        onClick={signOut}
        aria-label="Đăng xuất"
        className="hidden h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-muted sm:grid"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </header>
  );
}

export function LoadingScreen({ text = "Đang mở cửa thế giới…" }: { text?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-sky">
      <div className="text-center">
        <div className="animate-float text-6xl">🎈</div>
        <p className="mt-3 font-display text-xl font-bold text-foreground">{text}</p>
      </div>
    </div>
  );
}

/** Page frame for signed-in game pages. Sends kids without a character to the character creator. */
export function GameShell({
  children,
  className,
  fullBleed = false,
}: {
  children: (profile: Profile) => ReactNode;
  className?: string;
  fullBleed?: boolean;
}) {
  const { data: profile, isLoading, isError, error, refetch } = useMyProfile();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && profile === null) navigate({ to: "/nhan-vat", replace: true });
  }, [isLoading, profile, navigate]);
  if (isLoading) return <LoadingScreen />;
  if (isError) {
    const message = error && typeof error === "object" && "message" in error ? String((error as { message: unknown }).message) : error instanceof Error ? error.message : String(error ?? "Không tải được hồ sơ học sinh.");
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-sky px-4">
        <div className="w-full max-w-md rounded-3xl border-4 border-white bg-card p-6 text-center shadow-xl">
          <div className="text-5xl">🛠️</div>
          <h1 className="mt-3 text-xl font-extrabold text-foreground">Chưa mở được thế giới</h1>
          <p className="mt-2 text-sm text-muted-foreground">Hệ thống chưa tải được hồ sơ của bé. Bé thử kết nối mạng rồi bấm tải lại nhé.</p>
          <p className="mt-3 break-words rounded-xl bg-muted p-3 text-left text-xs text-muted-foreground">{message}</p>
          {error && typeof error === "object" && "code" in error && <p className="mt-2 text-left text-xs font-bold text-red-700">Mã lỗi: {String((error as { code: unknown }).code)}</p>}
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 w-full rounded-xl bg-primary px-5 py-3 font-display font-extrabold text-primary-foreground shadow-chunky"
          >
            Thử tải lại
          </button>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.assign("/auth");
            }}
            className="mt-2 w-full rounded-xl border-2 border-border px-5 py-3 font-display font-bold text-foreground"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }
  if (!profile) return <LoadingScreen text="Đang chuẩn bị nhân vật…" />;
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", fullBleed && "h-dvh min-h-0 overflow-hidden")}>
      <TopBar profile={profile} />
      <main className={cn("flex-1", fullBleed ? "relative min-h-0" : "mx-auto w-full max-w-6xl px-4 py-6", className)}>
        {children(profile)}
      </main>
    </div>
  );
}

export function PageTitle({ icon, title, subtitle, right }: { icon: string; title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sun text-3xl shadow-chunky">{icon}</span>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

