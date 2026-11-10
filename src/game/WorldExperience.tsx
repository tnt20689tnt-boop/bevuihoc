import { useCallback, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CampusHUD } from "@/game/CampusHUD";
import { WorldScene, type MovementInput } from "@/game/WorldScene";
import type { PlaySpot } from "@/game/Playground3D";
import { type Activity, type Portal, type RoomId } from "@/game/rooms";
import type { Profile } from "@/hooks/use-player";

type Direction = "up" | "down" | "left" | "right";

export function WorldExperience({ profile }: { profile: Profile }) {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<RoomId>("plaza");
  const [fromRoom, setFromRoom] = useState<RoomId | null>(null);
  const [nearbyPortal, setNearbyPortal] = useState<Portal | null>(null);
  const [nearbyPlaySpot, setNearbyPlaySpot] = useState<PlaySpot | null>(null);
  const [playingSpot, setPlayingSpot] = useState<PlaySpot | null>(null);
  const touchRef = useRef<MovementInput>({ x: 0, z: 0 });
  const pressedDirections = useRef(new Set<Direction>());

  const enterPortal = useCallback(
    (portal?: Portal) => {
      const destination = portal ?? nearbyPortal;
      if (!destination) return;
      setFromRoom(roomId);
      setRoomId(destination.to);
      setNearbyPortal(null);
      setNearbyPlaySpot(null);
      setPlayingSpot(null);
      pressedDirections.current.clear();
      touchRef.current = { x: 0, z: 0 };
    },
    [nearbyPortal, roomId],
  );

  const startPlay = useCallback((spot: PlaySpot) => {
    pressedDirections.current.clear();
    touchRef.current = { x: 0, z: 0 };
    setNearbyPlaySpot(null);
    setPlayingSpot(spot);
  }, []);

  const exitPlay = useCallback(() => {
    setPlayingSpot(null);
    setNearbyPlaySpot(null);
    pressedDirections.current.clear();
    touchRef.current = { x: 0, z: 0 };
  }, []);

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
    setNearbyPlaySpot(null);
    setPlayingSpot(null);
    pressedDirections.current.clear();
    touchRef.current = { x: 0, z: 0 };
  }, [roomId]);

  const goToRoom = useCallback(
    (destination: RoomId) => {
      if (destination === "plaza") {
        returnToPlaza();
        return;
      }
      enterPortal({ to: destination, x: 0, z: 0 });
    },
    [enterPortal, returnToPlaza],
  );

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-sky-100">
      <WorldScene
        roomId={roomId}
        fromRoom={fromRoom}
        avatar={profile.avatar}
        profile={profile}
        touchRef={touchRef}
        onNearbyPortal={setNearbyPortal}
        onEnterPortal={enterPortal}
        onInteract={() => enterPortal()}
        onActivity={goToActivity}
        playingSpot={playingSpot}
        onNearbyPlaySpot={setNearbyPlaySpot}
      />
      {nearbyPlaySpot && !playingSpot && roomId === "plaza" && (
        <button type="button" onClick={() => startPlay(nearbyPlaySpot)} style={{ position: "absolute", zIndex: 40, left: "50%", bottom: "max(24px, env(safe-area-inset-bottom))", transform: "translateX(-50%)", minWidth: 230, minHeight: 60, padding: "14px 24px", border: "3px solid #fff", borderRadius: 999, color: "#fff", background: "linear-gradient(135deg,#ff6bcb,#7c4dff)", boxShadow: "0 8px 24px #7c4dff66", font: "900 18px Baloo 2, sans-serif", cursor: "pointer" }}>
          {nearbyPlaySpot.icon} {nearbyPlaySpot.label}
        </button>
      )}
      {playingSpot && (
        <button type="button" onClick={exitPlay} style={{ position: "absolute", zIndex: 41, top: "max(16px, env(safe-area-inset-top))", right: 16, minHeight: 48, padding: "10px 18px", border: "2px solid #fff", borderRadius: 999, color: "#fff", background: "#e85d75", boxShadow: "0 5px 15px #0003", font: "900 15px Baloo 2, sans-serif", cursor: "pointer" }}>
          ✖ THOÁT CHƠI
        </button>
      )}
      <CampusHUD
        profile={profile}
        roomId={roomId}
        nearbyPortal={nearbyPortal}
        onEnterPortal={() => enterPortal()}
        onReturnToPlaza={returnToPlaza}
        onGoToRoom={goToRoom}
        onActivity={goToActivity}
        onDirection={setDirection}
      />
    </div>
  );
}
