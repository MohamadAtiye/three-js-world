import React, { createContext, useEffect, useRef } from "react";
import { Vector3 } from "three";

interface GameContextProps {
  playerPos: [number, number, number];
  playerDir: [number, number, number];
  velocity: Vector3;
}

const GameContext = createContext<GameContextProps>({
  playerPos: [0, 1, 0],
  playerDir: [0, 0, -1],
  velocity: new Vector3(0, 0, 0),
});

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const playerPos = useRef<[number, number, number]>([0, 1, 0]);
  const playerDir = useRef<[number, number, number]>([0, 0, 1]);
  const velocity = useRef(new Vector3(0, 0, 0));

  const gameControls = useRef({
    pointerLocked: false,
  });

  // handle pointer lock change
  useEffect(() => {
    const handlePointerLockChange = () => {
      gameControls.current.pointerLocked = document.pointerLockElement !== null;
    };
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () =>
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
  }, []);

  // handle player movement
  useEffect(() => {
    const v = velocity.current;
    const onDocumentKey = (event: KeyboardEvent) => {
      if (!gameControls.current.pointerLocked) return;
      console.log(event.code, event.type);
      if (event.type === "keydown") {
        if (event.key === "w") {
          v.z = 1;
        }
        if (event.key === "s") {
          v.z = -1;
        }
        if (event.key === "a") {
          v.x = 1;
        }
        if (event.key === "d") {
          v.x = -1;
        }
      } else if (event.type === "keyup") {
        if (event.key === "w" && v.z === 1) {
          v.z = 0;
        }
        if (event.key === "s" && v.z === -1) {
          v.z = 0;
        }
        if (event.key === "a" && v.x === 1) {
          v.x = 0;
        }
        if (event.key === "d" && v.x === -1) {
          v.x = 0;
        }
      }
    };

    document.addEventListener("keydown", onDocumentKey);
    document.addEventListener("keyup", onDocumentKey);

    return () => {
      document.removeEventListener("keydown", onDocumentKey);
      document.removeEventListener("keyup", onDocumentKey);
    };
  }, []);

  return (
    <GameContext.Provider
      value={{
        playerPos: playerPos.current,
        playerDir: playerDir.current,
        velocity: velocity.current,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
