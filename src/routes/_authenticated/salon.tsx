import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";
import { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2, ArrowLeft, Sparkles, Wand2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [
      { title: "Công Chúa Beauty & Fashion Studio 3D – Bé Vui Học" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
    ],
  }),
  component: SalonRoute,
});

function SalonRoute() {
  const [activeGame, setActiveGame] = useState<"fashion" | "makeup">("fashion");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Bật / tắt Fullscreen API chuẩn cho iOS và Android
  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        }
        setIsFullScreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
        setIsFullScreen(false);
      }
    } catch {
      // Fallback chế độ tràn viền CSS nếu trình duyệt chặn API
      setIsFullScreen((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  return (
    <GameShell fullBleed>
      {() => (
        <div
          ref={containerRef}
          className={`relative w-full overflow-hidden bg-[#2a1a28] ${
            isFullScreen
              ? "fixed inset-0 z-50 h-screen h-[100dvh]"
              : "h-full min-h-0"
          }`}
          style={{
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            paddingLeft: "env(safe-area-inset-left, 0px)",
            paddingRight: "env(safe-area-inset-right, 0px)",
          }}
        >
          {/* Iframe chứa game full viền 100% */}
          <iframe
            title={game.title}
            src={game.src}
            className="h-full w-full border-0 touch-manipulation select-none"
            allow="fullscreen; autoplay"
            allowFullScreen
          />

          {/* Nút đóng / mở thanh tiện ích trên màn hình nhỏ */}
          <div className="absolute right-3 top-3 z-30 flex items-center gap-2">
            {showControls ? (
              <div className="flex items-center gap-1.5 rounded-full bg-black/70 p-1.5 shadow-2xl backdrop-blur-md border border-pink-400/30">
                {/* Nút trở về trường */}
                <a
                  href="/the-gioi"
                  className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-2 text-xs font-bold text-white transition active:scale-95 hover:bg-white/30"
                  title="Trở về trường"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Về trường</span>
                </a>

                {/* Nút chuyển giữa 2 game */}
                <div className="flex rounded-full bg-white/10 p-0.5">
                  {(Object.keys(games) as Array<keyof typeof games>).map((key) => {
                    const GIcon = games[key].icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveGame(key)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold transition active:scale-95 ${
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

                {/* Nút phóng to toàn màn hình */}
                <button
                  type="button"
                  onClick={toggleFullScreen}
                  className="grid h-8 w-8 place-items-center rounded-full bg-pink-500/80 text-white transition active:scale-95 hover:bg-pink-500"
                  title={isFullScreen ? "Thu nhỏ" : "Toàn màn hình"}
                  aria-label="Toàn màn hình"
                >
                  {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>

                {/* Nút ẩn thanh điều khiển để bé ngắm trọn vẹn */}
                <button
                  type="button"
                  onClick={() => setShowControls(false)}
                  className="rounded-full px-2 py-1 text-[11px] font-bold text-pink-300 hover:text-white"
                >
                  Ẩn
                </button>
              </div>
            ) : (
              /* Nút tròn nhỏ gọn để hiện lại khi cần */
              <button
                type="button"
                onClick={() => setShowControls(true)}
                className="flex items-center gap-1.5 rounded-full bg-pink-600/90 px-3 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md active:scale-95 border border-white/30"
              >
                <span>👑 Menu</span>
              </button>
            )}
          </div>
        </div>
      )}
    </GameShell>
  );
}
