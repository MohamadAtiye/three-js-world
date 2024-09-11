import React from "react";
import { Canvas } from "@react-three/fiber";
import SkySphere from "./components/SkySphere";
import { GroundPlane } from "./components/GroundPlane";
import { GameProvider } from "./gameContext/GameContext";
import Player from "./components/Player";
import DPad from "./components/DPad";

export default function GamePage() {
  console.log("render game");

  return (
    <GameProvider>
      <DPad />

      <Canvas style={{ height: "100vh", backgroundColor: "black" }}>
        {/* PLAYER and CAMERA */}
        <Player />

        {/* Ground Plane */}
        <GroundPlane />

        {/* Sky Sphere */}
        <SkySphere />

        {/* SOME BOXES */}
        <mesh position={[5, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>

        <mesh position={[-5, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="blue" />
        </mesh>

        <mesh position={[0, 0.5, 5]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
        <mesh position={[0, 0.5, 3]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="yellow" />
        </mesh>

        <mesh position={[0, 0.5, -5]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="cyan" />
        </mesh>
      </Canvas>
    </GameProvider>
  );
}
