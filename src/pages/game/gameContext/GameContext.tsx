import React, { createContext, useEffect, useRef } from "react";
import { Vector3 } from "three";
import { GROUND_LEVEL, JUMP_FORCE } from "../constants";

interface GameContextProps {
  playerPos: Vector3;
  playerDir: [number, number, number];
  velocity: Vector3;
  cameraOffset: Vector3;
  playerJump: {
    isJumping: boolean;
    velocity: number;
  };
}

const GameContext = createContext<GameContextProps>({
  playerPos: new Vector3(0, 1, 0),
  playerDir: [0, 0, -1],
  velocity: new Vector3(0, 0, 0),
  cameraOffset: new Vector3(0, 0.5, 2),
  playerJump: {
    isJumping: false,
    velocity: 0,
  },
});

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const playerPos = useRef<Vector3>(new Vector3(0, 1, 0));
  const playerDir = useRef<[number, number, number]>([0, 0, 1]);
  const velocity = useRef(new Vector3(0, 0, 0));
  const cameraOffset = useRef(new Vector3(0, 0.5, 2));

  // Define state to track if the player is jumping
  const playerJump = useRef({
    isJumping: false,
    velocity: 0,
  });

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
        switch (event.code) {
          case "KeyW":
            v.z = 1;
            break;
          case "KeyS":
            v.z = -1;
            break;
          case "KeyA":
            v.x = 1;
            break;
          case "KeyD":
            v.x = -1;
            break;
          case "Space":
            if (
              !playerJump.current.isJumping &&
              playerPos.current.y <= GROUND_LEVEL
            ) {
              // Trigger jump when space is pressed and player is on the ground
              playerJump.current.isJumping = true;
              playerJump.current.velocity = JUMP_FORCE;
            }
            break;
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
        cameraOffset: cameraOffset.current,
        playerJump: playerJump.current,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
