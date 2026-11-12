import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/stores/settings";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-sky px-4">
      <div className="toy-card max-w-md p-8 text-center">
        <div className="text-6xl">🧭</div>
        <h1 className="mt-2 text-5xl font-bold text-foreground">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Ôi, lạc đường rồi!</h2>
        <p className="mt-2 text-sm text-muted-foreground">Trang bé tìm không có ở đây.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground shadow-chunky"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-sky px-4">
      <div className="toy-card max-w-md p-8 text-center">
        <div className="text-5xl">🙈</div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Trang chưa tải được</h1>
        <p className="mt-2 text-sm text-muted-foreground">Có chút trục trặc. Bé thử tải lại hoặc về trang chủ nhé.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 font-display font-bold text-primary-foreground shadow-chunky"
          >
            Thử lại
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border-2 border-input bg-card px-4 py-2 font-display font-bold text-foreground"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Bé Học Vui - Trường Học & Khu Vui Chơi 3D" },
      {
        name: "description",
        content:
          "Khám phá trường học 3D và khu vui chơi tương tác dành cho bé với xích đu, cầu trượt, nhà bóng, vòng quay và nhiều hoạt động học tập vui nhộn.",
      },
      { name: "robots", content: "index, follow" },
      { name: "google-site-verification", content: "4Nw8sSOwIwbfwhg-ozFEKXwAyUBXvFODQpFTBhbc44w" },
      { name: "msvalidate.01", content: "FD1B83E613D2D338AD3F1AC7D7EBA947" },
      { property: "og:title", content: "Bé Học Vui - Trường Học & Khu Vui Chơi 3D" },
      {
        property: "og:description",
        content: "Khám phá trường học 3D và khu vui chơi tương tác dành cho bé.",
      },
      { property: "og:url", content: "https://bevuihoc.lovable.app/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#ffb347" },
    ],
    links: [
      { rel: "canonical", href: "https://bevuihoc.lovable.app/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    document.documentElement.classList.add("capacitor-native");
    if (Capacitor.getPlatform() === "ios") {
      void StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
      void StatusBar.setOverlaysWebView({ overlay: false }).catch(() => undefined);
    }

    const handleNativeTap = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest("button, [role=button], a, [data-haptic]")) {
        void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
      }
    };

    document.addEventListener("click", handleNativeTap, true);
    return () => {
      document.removeEventListener("click", handleNativeTap, true);
      document.documentElement.classList.remove("capacitor-native");
    };
  }, []);

  useEffect(() => {
    void useSettings.persist.rehydrate();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
