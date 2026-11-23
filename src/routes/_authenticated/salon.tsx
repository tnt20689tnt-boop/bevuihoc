import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/salon")({
  head: () => ({
    meta: [{ title: "Salon thời trang – Bé Học Vui" }],
  }),
  component: () => (
    <GameShell>
      {() => (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="max-w-xl rounded-3xl border bg-card p-8 text-center shadow-xl">
            <div className="mb-4 text-6xl">👗</div>
            <h1 className="text-2xl font-black">Salon thời trang</h1>
            <p className="mt-3 text-muted-foreground">
              Phòng salon vẫn được giữ lại. Khu vực bên trong đang được làm mới và sẽ sớm mở lại.
            </p>
          </div>
        </div>
      )}
    </GameShell>
  ),
});
