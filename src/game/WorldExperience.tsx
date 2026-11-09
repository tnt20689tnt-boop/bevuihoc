import { useCallback, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CampusHUD } from "@/game/CampusHUD";
import { CampusVoiceChat } from "@/game/CampusVoiceChat";
import { WorldScene, type MovementInput } from "@/game/WorldScene";
import { type Activity, type Portal, type RoomId } from "@/game/rooms";
import type { Profile } from "@/hooks/use-player";

type Direction = "up" | "down" | "left" | "right";

export function WorldExperience({ profile }: { profile: Profile }) {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<RoomId>("plaza");
  const [fromRoom, setFromRoom] = useState<RoomId | null>(null);
  const [nearbyPortal, setNearbyPortal] = useState<Portal | null>(null);
  const touchRef = useRef<MovementInput>({ x: 0, z: 0 });
  const pressedDirections = useRef(new Set<Direction>());
  const joystickInput = useRef({ x: 0, z: 0 });

  const syncMovement = useCallback(() => {
    touchRef.current = {
      x: Number(pressedDirections.current.has("right")) - Number(pressedDirections.current.has("left")) + joystickInput.current.x,
      z: Number(pressedDirections.current.has("down")) - Number(pressedDirections.current.has("up")) + joystickInput.current.z,
    };
  }, []);

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
    syncMovement();
  }, [syncMovement]);

  const setJoystick = useCallback((x: number, z: number) => {
    joystickInput.current = { x, z };
    syncMovement();
  }, [syncMovement]);

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
      />
      <CampusVoiceChat roomId={roomId} profile={profile} />
      <CampusHUD
        profile={profile}
        roomId={roomId}
        nearbyPortal={nearbyPortal}
        onEnterPortal={() => enterPortal()}
        onReturnToPlaza={returnToPlaza}
        onGoToRoom={goToRoom}
        onActivity={goToActivity}
        onMove={setJoystick}
      />
    </div>
  );
}
