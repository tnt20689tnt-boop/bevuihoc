import { Link } from "@tanstack/react-router";
import { TopBar } from "@/components/AppShell";
import { useMyProfile } from "@/hooks/use-player";

/** Temporary page shown while a section of the world is still being built. */
export function ComingSoon({ icon, title }: { icon: string; title: string }) {
  const { data: profile } = useMyProfile();
  return (
    <div className="flex min-h-screen flex-col bg-gradient-sky">
      <TopBar profile={profile} />
      <main className="grid flex-1 place-items-center px-4">
        <div className="toy-card max-w-md p-8 text-center">
          <div className="animate-float text-6xl">{icon}</div>
          <h1 className="mt-3 text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-muted-foreground">Khu vực này đang được xây dựng. Bé quay lại sau nhé!</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground shadow-chunky"
          >
            Về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
}
