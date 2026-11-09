import { useCallback, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { WorldScene, type MovementInput } from "@/game/WorldScene";
import { ROOMS, type Activity, type Portal, type RoomId } from "@/game/rooms";
import type { Profile } from "@/hooks/use-player";

type Direction = "up" | "down" | "left" | "right";

export function WorldExperience({ profile }: { profile: Profile }) {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<RoomId>("plaza");
  const [fromRoom, setFromRoom] = useState<RoomId | null>(null);
  const [nearbyPortal, setNearbyPortal] = useState<Portal | null>(null);
  const touchRef = useRef<MovementInput>({ x: 0, z: 0 });
  const pressedDirections = useRef(new Set<Direction>());
  const room = ROOMS[roomId];

  const enterPortal = useCallback(
    (portal?: Portal) => {
      const destination = portal ?? nearbyPortal;
      if (!destination) return;
      setFromRoom(roomId);
      setRoomId(destination.to);
      setNearbyPortal(null);
      pressedDirections.current.clear();
      touchRef.current = { x: 0, z: 0 };
    },
    [nearbyPortal, roomId],
  );

  const setDirection = useCallback((direction: Direction, isPressed: boolean) => {
    if (isPressed) pressedDirections.current.add(direction);
    else pressedDirections.current.delete(direction);
    touchRef.current = {
      x:
        Number(pressedDirections.current.has("right")) -
        Number(pressedDirections.current.has("left")),
      z:
        Number(pressedDirections.current.has("down")) - Number(pressedDirections.current.has("up")),
    };
  }, []);

  const goToActivity = useCallback(
    (activity: Activity) => {
      if (activity.to === "/hoc/$subject") {
        void navigate({
          to: "/hoc/$subject",
          params: { subject: activity.params?.subject ?? "math" },
        });
        return;
      }
      void navigate({ to: activity.to as never });
    },
    [navigate],
  );

  const returnToPlaza = useCallback(() => {
    if (roomId === "plaza") return;
    setFromRoom(roomId);
    setRoomId("plaza");
    setNearbyPortal(null);
    pressedDirections.current.clear();
    touchRef.current = { x: 0, z: 0 };
  }, [roomId]);

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-sky-100">
      <WorldScene
        roomId={roomId}
        fromRoom={fromRoom}
        avatar={profile.avatar}
        touchRef={touchRef}
        onNearbyPortal={setNearbyPortal}
        onEnterPortal={enterPortal}
        onInteract={() => enterPortal()}
        onActivity={goToActivity}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        <section className="pointer-events-auto absolute left-3 top-3 max-w-[min(78vw,23rem)] rounded-[1.35rem] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_14px_35px_-15px_rgba(29,48,73,.55)] backdrop-blur-xl sm:left-5 sm:top-5 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-sm">
              {room.emoji}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-extrabold uppercase tracking-[0.13em] text-slate-500">
                Thế Giới Học Vui
              </p>
              <h1 className="truncate font-display text-lg font-extrabold leading-tight text-slate-800 sm:text-xl">
                {room.name}
              </h1>
            </div>
          </div>
          <p className="mt-2 hidden text-sm leading-snug text-slate-600 sm:block">{room.blurb}</p>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="rounded-full bg-amber-100 px-2.5 py-1">👋 {profile.display_name}</span>
            <span className="rounded-full bg-sky-100 px-2.5 py-1">Lớp {profile.grade}</span>
          </div>
        </section>

        <div className="pointer-events-auto absolute right-3 top-3 flex gap-2 sm:right-5 sm:top-5">
          {roomId !== "plaza" && (
            <button
              type="button"
              onClick={returnToPlaza}
              className="rounded-2xl border border-white/80 bg-white/85 px-3 py-2.5 font-display text-sm font-extrabold text-slate-700 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white sm:px-4"
            >
              <span aria-hidden="true">↩ </span>
              <span className="hidden sm:inline">Về sảnh</span>
              <span className="sm:hidden">Sảnh</span>
            </button>
          )}
          <div className="rounded-2xl border border-white/80 bg-white/80 px-3 py-2.5 text-xs font-bold text-slate-600 shadow-lg backdrop-blur-xl sm:px-4 sm:text-sm">
            ⭐ Khám phá tự do
          </div>
        </div>

        <div className="pointer-events-auto absolute bottom-4 left-4 select-none md:hidden">
          <div
            className="grid grid-cols-3 gap-2 rounded-[1.4rem] border border-white/70 bg-white/55 p-2.5 shadow-xl backdrop-blur-xl"
            aria-label="Điều khiển di chuyển"
          >
            <span />
            <MoveButton direction="up" label="Đi lên" onChange={setDirection}>
              ▲
            </MoveButton>
            <span />
            <MoveButton direction="left" label="Đi sang trái" onChange={setDirection}>
              ◀
            </MoveButton>
            <MoveButton direction="down" label="Đi xuống" onChange={setDirection}>
              ▼
            </MoveButton>
            <MoveButton direction="right" label="Đi sang phải" onChange={setDirection}>
              ▶
            </MoveButton>
          </div>
          <p className="mt-1 text-center text-[10px] font-extrabold text-slate-700 drop-shadow-sm">
            GIỮ NÚT ĐỂ DI CHUYỂN
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-5 right-4 hidden rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 shadow-lg backdrop-blur-xl md:block">
          Di chuyển: WASD / phím mũi tên · Chạy: Shift · Tương tác: E
        </div>

        {nearbyPortal && (
          <div className="pointer-events-auto absolute bottom-7 left-1/2 w-[min(88vw,25rem)] -translate-x-1/2 rounded-[1.4rem] border border-white/80 bg-white/90 p-3 shadow-[0_18px_45px_-16px_rgba(29,48,73,.6)] backdrop-blur-xl sm:bottom-8 sm:p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-2xl">
                {ROOMS[nearbyPortal.to].emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Bạn đang ở gần cổng
                </p>
                <p className="truncate font-display text-base font-extrabold text-slate-800">
                  {nearbyPortal.to === "plaza"
                    ? "Trở về sảnh trung tâm"
                    : `Khám phá ${ROOMS[nearbyPortal.to].short}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => enterPortal()}
                className="shrink-0 rounded-xl bg-gradient-to-b from-orange-400 to-orange-500 px-3 py-2.5 font-display text-sm font-extrabold text-white shadow-[0_4px_0_#b45b32] transition active:translate-y-0.5 active:shadow-none sm:px-4"
              >
                Vào cổng <span className="hidden sm:inline">· E</span>
              </button>
            </div>
          </div>
        )}

        {!nearbyPortal && (
          <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-xs font-bold text-slate-700 shadow-lg backdrop-blur-xl sm:block">
            Đi lại gần một cổng màu để khám phá phòng
          </div>
        )}
      </div>
    </div>
  );
}

function MoveButton({
  direction,
  label,
  onChange,
  children,
}: {
  direction: Direction;
  label: string;
  onChange: (direction: Direction, isPressed: boolean) => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-12 w-12 touch-none place-items-center rounded-xl border border-white/80 bg-white/90 text-lg font-black text-slate-700 shadow-[0_4px_0_rgba(49,65,84,.18)] active:translate-y-0.5 active:shadow-none"
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onChange(direction, true);
      }}
      onPointerUp={() => onChange(direction, false)}
      onPointerCancel={() => onChange(direction, false)}
      onLostPointerCapture={() => onChange(direction, false)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
    </button>
  );
}
