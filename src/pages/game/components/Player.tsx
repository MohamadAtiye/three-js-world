import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGame } from "../gameContext/useGame";
import { PointerLockControls } from "@react-three/drei";

const SPEED = 0.1;
const MIN_PITCH = THREE.MathUtils.degToRad(-60); // Minimum pitch in radians (e.g., -60 degrees)
const MAX_PITCH = THREE.MathUtils.degToRad(60); // Maximum pitch in radians (e.g., 60 degrees)

const TOUCH_SENSITIVITY = 0.004;

export default function Player() {
  const { playerPos, velocity } = useGame();
  const capsuleRef = useRef<THREE.Mesh>(null);

  useFrame(({ camera }) => {
    // ------------------------------------------------------------ HANDLE MIN-MAX CAMERA PITCH AND ADJUST
    {
      const currentQuaternion = camera.quaternion.clone();
      // Extract yaw (rotation around Y) and pitch (rotation around X)
      const euler = new THREE.Euler().setFromQuaternion(
        currentQuaternion,
        "YXZ"
      );
      // Limit the pitch (rotation around X axis)
      euler.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, euler.x));
      // Reapply the quaternion based on the new clamped euler angles
      camera.quaternion.setFromEuler(euler);
    }

    // ------------------------------------------------------------ update player
    const speed = Math.abs(velocity.x) + Math.abs(velocity.z);
    const relativeSpeed = speed > 1 ? 0.5 * SPEED : 1 * SPEED;

    const move = new THREE.Vector3();
    move.copy(velocity).multiplyScalar(relativeSpeed);

    if (capsuleRef.current) {
      // Get the camera's direction vector
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);

      // Prevent movement in the Y axis (no flying)
      direction.y = 0;
      direction.normalize();

      // Apply the velocity relative to the camera's direction
      const moveDirection = new THREE.Vector3();
      moveDirection.copy(direction).multiplyScalar(move.z);
      moveDirection.add(
        new THREE.Vector3()
          .crossVectors(new THREE.Vector3(0, 1, 0), direction)
          .multiplyScalar(move.x)
      );

      // Update player position
      playerPos[0] += moveDirection.x;
      playerPos[1] += moveDirection.y;
      playerPos[2] += moveDirection.z;
      capsuleRef.current.position.set(...playerPos);

      // Align the capsule's rotation to match the camera's look direction
      const lookAtTarget = new THREE.Vector3();
      lookAtTarget.copy(capsuleRef.current.position).sub(direction);
      capsuleRef.current.lookAt(lookAtTarget);
    }

    // ------------------------------------------------------------ update camera position
    {
      // -- get new camera position
      const origin = new THREE.Vector3(...playerPos);
      const offset = new THREE.Vector3(0, 1, 2);

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
    }
  });

  // for touch controls
  const { camera, gl } = useThree();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  // Variables for yaw (Y axis rotation) and pitch (X axis rotation)
  const yawRef = useRef(0); // Horizontal rotation
  const pitchRef = useRef(0); // Vertical rotation
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (touchStartRef.current && event.touches.length === 1) {
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;

        // Update yaw and pitch values based on touch input
        yawRef.current -= deltaX * TOUCH_SENSITIVITY;
        pitchRef.current -= deltaY * TOUCH_SENSITIVITY;

        // Clamp pitch (vertical rotation) to prevent flipping
        pitchRef.current = Math.max(
          MIN_PITCH,
          Math.min(MAX_PITCH, pitchRef.current)
        );

        // Create a new quaternion for the camera rotation, based on yaw and pitch
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(
          new THREE.Euler(pitchRef.current, yawRef.current, 0, "YXZ")
        );

        // Apply the quaternion to the camera to prevent rolling
        camera.quaternion.copy(quaternion);

        // Update touch start position for the next move
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };

    // Add touch event listeners
    gl.domElement.addEventListener("touchstart", handleTouchStart);
    gl.domElement.addEventListener("touchmove", handleTouchMove);
    gl.domElement.addEventListener("touchend", handleTouchEnd);

    // Clean up event listeners on component unmount
    return () => {
      gl.domElement.removeEventListener("touchstart", handleTouchStart);
      gl.domElement.removeEventListener("touchmove", handleTouchMove);
      gl.domElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [camera, gl]);

  return (
    <>
      {/* CAMERA LOCK */}
      <PointerLockControls />

      {/* PLAYER OBJECT */}
      <mesh ref={capsuleRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="blue" />
        <arrowHelper
          args={[new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0)]}
        />
      </mesh>
    </>
  );
}
