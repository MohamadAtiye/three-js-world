import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGame } from "../gameContext/useGame";

const SPEED = 0.1;
export default function Player() {
  const { keyMap, playerPos } = useGame();
  const capsuleRef = useRef<THREE.Mesh>(null);
  const inputVelocity = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    const velocity = inputVelocity.current;

    // Reset the velocity before calculating new movement
    velocity.set(0, 0, 0);

    // Check key input and set velocity accordingly
    if (keyMap["KeyW"]) velocity.z += SPEED;
    if (keyMap["KeyS"]) velocity.z -= SPEED;
    if (keyMap["KeyA"]) velocity.x += SPEED;
    if (keyMap["KeyD"]) velocity.x -= SPEED;

    if (capsuleRef.current) {
      // Get the camera's direction vector
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);

      // Prevent movement in the Y axis (no flying)
      direction.y = 0;
      direction.normalize();

      // Apply the velocity relative to the camera's direction
      const moveDirection = new THREE.Vector3();
      moveDirection.copy(direction).multiplyScalar(velocity.z);
      moveDirection.add(
        new THREE.Vector3()
          .crossVectors(new THREE.Vector3(0, 1, 0), direction)
          .multiplyScalar(velocity.x)
      );

      // Update player position
      capsuleRef.current.position.add(moveDirection);

      // Align the capsule's rotation to match the camera's look direction
      const lookAtTarget = new THREE.Vector3();
      lookAtTarget.copy(capsuleRef.current.position).sub(direction);
      capsuleRef.current.lookAt(lookAtTarget);

      // Update player position in the game state
      playerPos[0] = capsuleRef.current.position.x;
      playerPos[1] = capsuleRef.current.position.y;
      playerPos[2] = capsuleRef.current.position.z;
    }
  });

  return (
    <mesh ref={capsuleRef} position={[0, 1.5, 0]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color="blue" />
      <arrowHelper
        args={[new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0)]}
      />
    </mesh>
  );
}
