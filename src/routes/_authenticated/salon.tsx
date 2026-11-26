import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2, ArrowLeft, Sparkles, Wand2, RotateCw } from "lucide-react";
import { useMyProfile } from "@/hooks/use-player";
import { LoadingScreen } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [
      { title: "Công Chúa Beauty & Fashion Studio 3D – Bé Vui Học" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
  }),
  component: SalonRoute,
});

function SalonRoute() {
  const { data: profile, isLoading } = useMyProfile();
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<"fashion" | "makeup">("fashion");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && profile === null) {
      navigate({ to: "/nhan-vat", replace: true });
    }
  }, [isLoading, profile, navigate]);

  const games = {
    fashion: {
      label: "Thời trang 3D",
      src: "/games/fashion-designer-3d/index.html",
      title: "Công Chúa Beauty & Fashion Studio 3D",
      icon: Sparkles,
    },
    makeup: {
      label: "Trang điểm",
      src: "/games/makeup-studio/index.html",
      title: "Tiệm Mơ – Game trang điểm",
      icon: Wand2,
    },
  } as const;

  const game = games[activeGame];

  // Bật toàn màn hình + Khóa xoay ngang
  const toggleFullScreenAndLandscape = async () => {
    const nextState = !isFullScreen;
    setIsFullScreen(nextState);

    try {
      if (nextState) {
        // Thử Fullscreen API chuẩn
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        }
        // Thử xoay ngang trên Android/trình duyệt hỗ trợ
        if ((screen.orientation as any)?.lock) {
          await (screen.orientation as any).lock("landscape").catch(() => {});
        } else if ((screen as any)?.lockOrientation) {
          (screen as any).lockOrientation("landscape");
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen?.().catch(() => {});
        } else if ((document as any).webkitFullscreenElement) {
          (document as any).webkitExitFullscreen?.();
        }
        if ((screen.orientation as any)?.unlock) {
          (screen.orientation as any).unlock();
        }
        setForceLandscape(false);
      }
    } catch {
      // Bỏ qua lỗi trình duyệt không hỗ trợ API
    }
  };

  if (isLoading || !profile) return <LoadingScreen text="Đang mở tiệm công chúa…" />;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-[#2a1a28] ${
        isFullScreen
          ? "fixed inset-0 z-50 h-[100dvh] w-[100dvw]"
          : "h-[100dvh] w-full"
      } ${
        forceLandscape
          ? "portrait:fixed portrait:top-0 portrait:left-full portrait:h-[100vw] portrait:w-[100vh] portrait:origin-top-left portrait:rotate-90"
          : ""
      }`}
      style={{
        paddingTop: isFullScreen ? "0px" : "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Iframe chứa game full 100% màn hình, không còn thanh menu trên */}
      <iframe
        title={game.title}
        src={game.src}
        className="h-full w-full border-0 select-none touch-manipulation"
        allow="fullscreen; autoplay; orientation"
        allowFullScreen
      />

      {/* Cụm nút điều khiển nổi ở góc phải trên */}
      <div className="absolute right-3 top-3 z-30 flex items-center gap-2">
        {showControls ? (
          <div className="flex items-center gap-1.5 rounded-full bg-black/75 p-1.5 shadow-2xl backdrop-blur-md border border-pink-400/30">
            {/* Nút trở về trường */}
            <a
              href="/the-gioi"
              className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition active:scale-95 hover:bg-white/30"
              title="Trở về trường"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Về trường</span>
            </a>

            {/* Nút chuyển đổi 2 game */}
            <div className="flex rounded-full bg-white/10 p-0.5">
              {(Object.keys(games) as Array<keyof typeof games>).map((key) => {
                const GIcon = games[key].icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveGame(key)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition active:scale-95 ${
                      activeGame === key
                        ? "bg-pink-600 text-white shadow-md"
                        : "text-pink-200 hover:text-white"
                    }`}
                  >
                    <GIcon className="h-3.5 w-3.5" />
                    <span>{games[key].label}</span>
                  </button>
                );
              })}
            </div>

            {/* Nút xoay ngang cưỡng bức (cho iPhone khi cầm dọc) */}
            <button
              type="button"
              onClick={() => setForceLandscape((prev) => !prev)}
              className={`grid h-7 w-7 place-items-center rounded-full transition active:scale-95 ${
                forceLandscape ? "bg-amber-500 text-white" : "bg-white/20 text-pink-200 hover:text-white"
              }`}
              title="Xoay ngang màn hình"
              aria-label="Xoay ngang"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>

            {/* Nút phóng to toàn màn hình */}
            <button
              type="button"
              onClick={toggleFullScreenAndLandscape}
              className="grid h-7 w-7 place-items-center rounded-full bg-pink-500 text-white transition active:scale-95 hover:bg-pink-600"
              title={isFullScreen ? "Thu nhỏ" : "Toàn màn hình"}
              aria-label="Toàn màn hình"
            >
              {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>

            {/* Nút ẩn thanh điều khiển */}
            <button
              type="button"
              onClick={() => setShowControls(false)}
              className="rounded-full px-2 py-1 text-[11px] font-bold text-pink-300 hover:text-white"
            >
              Ẩn
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="flex items-center gap-1.5 rounded-full bg-pink-600/90 px-3 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-md active:scale-95 border border-white/30"
          >
            <span>👑 Menu</span>
          </button>
        )}
      </div>
    </div>
  );
}
