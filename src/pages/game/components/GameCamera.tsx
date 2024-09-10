import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";
import { PointerLockControls } from "@react-three/drei";
import { useGame } from "../gameContext/useGame";

export default function GameCamera() {
  const pivotRef = useRef<THREE.Object3D>(null);
  // const pivotOriginRef = useRef<THREE.Object3D>(null);
  const { playerPos } = useGame();
  // const { camera } = useThree();

  useFrame(({ camera }) => {
    // Update the origin to match your player's position
    const origin = new THREE.Vector3(...playerPos);

    // Create an offset vector (e.g., 3 units behind and 1 unit above the object)
    const offset = new THREE.Vector3(0, 1, 3);

    // Get the camera's rotation in world space from the controls
    const rotation = new THREE.Euler(
      camera.rotation.x,
      camera.rotation.y,
      camera.rotation.z
    );

    // Apply the rotation to the offset (rotate the offset around the origin based on the camera's rotation)
    offset.applyEuler(rotation);

    // Set the camera's position relative to the origin plus the rotated offset
    camera.position.copy(origin).add(offset);
  });

  return (
    <>
      <PointerLockControls />
    </>
  );
}
