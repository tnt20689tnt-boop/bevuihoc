import { useRef, useState } from "react";
import { DoorOpen, Map, Move, X } from "lucide-react";
import { ROOMS, ROOM_IDS, type Activity, type Portal, type RoomId } from "@/game/rooms";
import type { Profile } from "@/hooks/use-player";


type CampusHUDProps = {
  profile: Profile;
  roomId: RoomId;
  nearbyPortal: Portal | null;
  onEnterPortal: () => void;
  onReturnToPlaza: () => void;
  onGoToRoom: (id: RoomId) => void;
  onActivity: (activity: Activity) => void;
  onMove: (x: number, z: number) => void;
};

export function CampusHUD({
  profile,
  roomId,
  nearbyPortal,
  onEnterPortal,
  onReturnToPlaza,
  onGoToRoom,
  onActivity,
  onMove,
}: CampusHUDProps) {
  const [mapOpen, setMapOpen] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const pointerId = useRef<number | null>(null);

  const moveJoystick = (clientX: number, clientY: number) => {
    const base = joystickRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const max = rect.width * 0.34;
    let dx = clientX - (rect.left + rect.width / 2);
    let dy = clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    if (distance > max) {
      dx = (dx / distance) * max;
      dy = (dy / distance) * max;
    }
    setKnob({ x: dx, y: dy });
    onMove(dx / max, dy / max);
  };

  const stopJoystick = () => {
    pointerId.current = null;
    setKnob({ x: 0, y: 0 });
    onMove(0, 0);
  };
  const room = ROOMS[roomId];

  const chooseRoom = (id: RoomId) => {
    setMapOpen(false);
    if (id !== roomId) onGoToRoom(id);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <section className="pointer-events-auto absolute left-3 top-3 max-w-[min(76vw,21rem)] rounded-2xl border border-white/80 bg-[#fffdf7]/90 px-3 py-2.5 shadow-[0_12px_32px_-14px_rgba(29,48,73,.48)] backdrop-blur-lg sm:left-5 sm:top-5 sm:max-w-sm sm:px-4 sm:py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-xl"
            aria-hidden="true"
          >
            {room.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-emerald-700">
              Khuôn viên học vui
            </p>
            <h1 className="truncate font-display text-base font-extrabold leading-tight text-slate-800 sm:text-lg">
              {room.name}
            </h1>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="max-w-full truncate rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
            👋 {profile.display_name}
          </span>
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-900">
            Lớp {profile.grade}
          </span>
        </div>
      </section>

      <div className="pointer-events-auto absolute right-3 top-3 flex gap-2 sm:right-5 sm:top-5">
        <button
          type="button"
          onClick={() => setMapOpen((open) => !open)}
          aria-expanded={mapOpen}
          aria-controls="campus-room-map"
          className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-[#fffdf7]/90 px-3 py-2.5 text-sm font-extrabold text-emerald-900 shadow-lg backdrop-blur-lg transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {mapOpen ? <X size={17} /> : <Map size={17} />}
          <span className="hidden sm:inline">Sơ đồ</span>
        </button>
        {roomId !== "plaza" && (
          <button
            type="button"
            onClick={onReturnToPlaza}
            className="rounded-xl border border-white/80 bg-[#fffdf7]/90 px-3 py-2.5 text-sm font-extrabold text-slate-700 shadow-lg backdrop-blur-lg transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:px-4"
          >
            <span className="hidden sm:inline">↩ Về sảnh</span>
            <span className="sm:hidden">↩ Sảnh</span>
          </button>
        )}
      </div>

      {mapOpen && (
        <section
          id="campus-room-map"
          aria-label="Chọn phòng"
          className="pointer-events-auto absolute right-3 top-[4.2rem] w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-white/80 bg-[#fffdf7]/95 p-3 shadow-xl backdrop-blur-xl sm:right-5 sm:top-[4.7rem]"
        >
          <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-extrabold text-slate-800">
            <Map size={16} className="text-emerald-700" /> Chọn điểm đến
          </h2>
          <div className="grid gap-1.5">
            {ROOM_IDS.map((id) => {
              const destination = ROOMS[id];
              const active = id === roomId;
              return (
                <button
                  key={id}
                  type="button"
                  aria-current={active ? "location" : undefined}
                  onClick={() => chooseRoom(id)}
                  className={`flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${active ? "bg-emerald-100 text-emerald-950" : "text-slate-700 hover:bg-sky-50"}`}
                >
                  <span className="text-lg" aria-hidden="true">
                    {destination.emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">
                    {destination.name}
                  </span>
                  {active && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                      Đang ở đây
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {room.activities.length > 0 && (
        <section
          aria-label="Hoạt động trong phòng"
          className="pointer-events-auto absolute left-3 top-[7.7rem] flex max-w-[min(78vw,21rem)] flex-col gap-1.5 sm:left-5 sm:top-[8rem]"
        >
          {room.activities.map((activity) => (
            <button
              key={`${activity.label}-${activity.to}`}
              type="button"
              onClick={() => onActivity(activity)}
              className="flex items-center gap-2 rounded-xl border border-white/80 bg-[#fffdf7]/90 px-3 py-2 text-left text-xs font-extrabold text-slate-800 shadow-md backdrop-blur-lg transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 sm:text-sm"
            >
              <span aria-hidden="true">{activity.icon}</span>
              <span className="truncate">{activity.label}</span>
            </button>
          ))}
        </section>
      )}

      <div className="pointer-events-auto absolute bottom-6 left-5 select-none md:hidden">
        <div
          ref={joystickRef}
          role="application"
          aria-label="Cần điều khiển di chuyển"
          className="grid h-[7.5rem] w-[7.5rem] touch-none place-items-center rounded-full border-2 border-white/80 bg-[#fffdf7]/45 shadow-[0_10px_28px_-12px_rgba(29,48,73,.5)] backdrop-blur-md"
          onPointerDown={(event) => {
            event.preventDefault();
            pointerId.current = event.pointerId;
            event.currentTarget.setPointerCapture(event.pointerId);
            moveJoystick(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (pointerId.current === event.pointerId) moveJoystick(event.clientX, event.clientY);
          }}
          onPointerUp={(event) => {
            if (pointerId.current === event.pointerId) stopJoystick();
          }}
          onPointerCancel={stopJoystick}
          onLostPointerCapture={stopJoystick}
          onContextMenu={(event) => event.preventDefault()}
        >
          <div className="pointer-events-none grid h-12 w-12 place-items-center rounded-full border border-white bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_5px_14px_rgba(16,80,55,.38)] transition-transform duration-75" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}>
            <span className="h-3 w-3 rounded-full border-2 border-white/90 bg-white/30" />
          </div>
        </div>
        <p className="mt-2 w-[7.5rem] text-center text-[9px] font-extrabold tracking-wide text-slate-700 drop-shadow-sm">
          KÉO ĐỂ DI CHUYỂN
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-5 right-4 hidden items-center gap-2 rounded-xl border border-white/80 bg-[#fffdf7]/85 px-3 py-2 text-xs font-bold text-slate-700 shadow-lg backdrop-blur-lg md:flex">
        <Move size={15} className="text-emerald-700" /> Di chuyển: WASD / ↑↓←→{" "}
        <span className="text-slate-400">·</span> E: Ngồi ghế / tương tác
      </div>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("campus-interact"))}
        className="pointer-events-auto absolute bottom-8 right-5 rounded-2xl border-2 border-white/90 bg-[#fffdf7]/95 px-4 py-3 text-sm font-extrabold text-emerald-900 shadow-lg backdrop-blur-lg md:hidden"
      >
        🪑 Ngồi / đứng
      </button>

      {nearbyPortal && (
        <div className="pointer-events-auto absolute bottom-48 left-1/2 w-[min(88vw,25rem)] -translate-x-1/2 rounded-2xl border border-white/90 bg-[#fffdf7]/95 p-3 shadow-[0_16px_40px_-16px_rgba(29,48,73,.55)] backdrop-blur-xl sm:bottom-8 sm:p-4">
          <div className="flex items-center gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-2xl"
              aria-hidden="true"
            >
              {ROOMS[nearbyPortal.to].emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                Bạn đang ở gần cổng
              </p>
              <p className="truncate text-sm font-extrabold text-slate-800">
                {nearbyPortal.to === "plaza"
                  ? "Trở về sảnh trung tâm"
                  : `Khám phá ${ROOMS[nearbyPortal.to].short}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onEnterPortal}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-extrabold text-white shadow-[0_3px_0_#14532d] transition hover:bg-emerald-800 active:translate-y-0.5 active:shadow-none sm:text-sm"
            >
              <DoorOpen size={15} /> Vào cổng <span className="hidden sm:inline">· E</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

