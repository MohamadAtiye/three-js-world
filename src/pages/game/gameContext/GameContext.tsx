import React, { createContext, useEffect, useRef } from "react";

interface GameContextProps {
  playerPos: [number, number, number];
  playerDir: [number, number, number];
  keyMap: Record<string, boolean>;
}

const GameContext = createContext<GameContextProps>({
  playerPos: [0, 1, 0],
  playerDir: [0, 0, -1],
  keyMap: {},
});

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const playerPos = useRef<[number, number, number]>([0, 1, 0]);
  const playerDir = useRef<[number, number, number]>([0, 0, 1]);
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
  const keyMap = useRef<Record<string, boolean>>({});
  const onDocumentKey = (e: KeyboardEvent) => {
    console.log(e.code, e.type);
    if (!gameControls.current.pointerLocked) return;
    keyMap.current[e.code] = e.type === "keydown";
  };

  useEffect(() => {
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
        keyMap: keyMap.current,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
