import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGame } from "../gameContext/useGame";
import { PointerLockControls } from "@react-three/drei";
import {
  DEFAULT_CAMERA_OFFSET,
  GRAVITY,
  GROUND_LEVEL,
  MAX_CAMERA_MULTIPLIER,
  MIN_CAMERA_MULTIPLIER,
} from "../constants";
import { getTouchDistance, isPinch } from "../utils/touchUtils";

const SPEED = 0.1;
const MIN_PITCH = THREE.MathUtils.degToRad(-60); // Minimum pitch in radians (e.g., -60 degrees)
const MAX_PITCH = THREE.MathUtils.degToRad(60); // Maximum pitch in radians (e.g., 60 degrees)

const TOUCH_SENSITIVITY = 0.004;

export default function Player() {
  const { playerPos, velocity, cameraOffset, playerJump, gameControls } =
    useGame();
  const capsuleRef = useRef<THREE.Mesh>(null);

  // reusable vectors
  const yUpVectorRef = useRef(new THREE.Vector3(0, 1, 0)); // Add this ref at the top
  const cameraEulerRef = useRef(new THREE.Euler());
  const moveVecRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const moveDirectionRef = useRef(new THREE.Vector3());
  const crossVecRef = useRef(new THREE.Vector3());
  const lookAtTargetRef = useRef(new THREE.Vector3());
  const offsetRef = useRef(new THREE.Vector3(0, 0.5, 2));

  // render Loop to calculate player position and rotation, and camera position
  useFrame(({ camera }) => {
    // ------------------------------------------------------------ HANDLE MIN-MAX CAMERA PITCH AND ADJUST

    const cameraEuler = cameraEulerRef.current;
    // reset the camera euler value
    cameraEuler.setFromQuaternion(camera.quaternion, "YXZ");
    // Limit the pitch (rotation around X axis)
    cameraEuler.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, cameraEuler.x));
    // Reapply the quaternion based on the new clamped euler angles
    camera.quaternion.setFromEuler(cameraEuler);

    // ------------------------------------------------------------ update player

    // handle jumping
    if (playerJump.isJumping) {
      playerPos.y += playerJump.velocity;
      playerJump.velocity -= GRAVITY; // Apply gravity

      // Stop jumping when player reaches the ground
      // TODO: Add collision detection
      if (playerPos.y <= GROUND_LEVEL) {
        playerPos.y = GROUND_LEVEL;
        playerJump.isJumping = false;
        playerJump.velocity = 0;
      }
    }

    // limit diagonal magnitude and multiply by speed constant
    const moveVec = moveVecRef.current;
    moveVec.copy(velocity);
    const magnitudeSquared = moveVec.x ** 2 + moveVec.z ** 2;
    if (magnitudeSquared > 1) {
      moveVec.divideScalar(Math.sqrt(magnitudeSquared));
    }
    moveVec.multiplyScalar(SPEED);

    // apply position and rotation to player
    if (capsuleRef.current) {
      // get the camera's direction vector
      const direction = directionRef.current;
      camera.getWorldDirection(direction);

      // Prevent movement in the Y axis (no flying)
      direction.y = 0;
      direction.normalize();

      // Apply the velocity relative to the camera's direction
      const moveDirection = moveDirectionRef.current;
      const crossVec = crossVecRef.current;
      moveDirection.copy(direction).multiplyScalar(moveVec.z);

      crossVec.crossVectors(yUpVectorRef.current, direction);
      moveDirection.add(crossVec.multiplyScalar(moveVec.x));

      // Update and Apply player position
      playerPos.add(moveDirection);
      capsuleRef.current.position.x = playerPos.x;
      capsuleRef.current.position.y = playerPos.y;
      capsuleRef.current.position.z = playerPos.z;
      // capsuleRef.current.position.copy(playerPos);

      // Align the capsule's rotation to match the camera's look direction
      const lookAtTarget = lookAtTargetRef.current;
      lookAtTarget.x = playerPos.x;
      lookAtTarget.y = playerPos.y;
      lookAtTarget.z = playerPos.z;
      lookAtTarget.sub(direction);
      capsuleRef.current.lookAt(lookAtTarget);
    }

    // ------------------------------------------------------------ update camera position

    // Set the camera's position relative to the origin plus the rotated offset
    const offset = offsetRef.current;
    offset.copy(cameraOffset).applyEuler(cameraEuler);
    camera.position.copy(playerPos).add(offset);
  });

  // for wheel zoom and touch rotation controls and zoom //
  const { camera, gl } = useThree();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  // Variables for yaw (Y axis rotation) and pitch (X axis rotation)
  const yawRef = useRef(0); // Horizontal rotation
  const pitchRef = useRef(0); // Vertical rotation
  useEffect(() => {
    let initialPinchDistance = 0;

    const handleCameraChange = (delta: number) => {
      gameControls.cameraOffsetMultiplier += delta * 0.005;
      gameControls.cameraOffsetMultiplier = Math.max(
        MIN_CAMERA_MULTIPLIER,
        Math.min(MAX_CAMERA_MULTIPLIER, gameControls.cameraOffsetMultiplier)
      );

      cameraOffset
        .set(...DEFAULT_CAMERA_OFFSET.toArray())
        .multiplyScalar(gameControls.cameraOffsetMultiplier);
    };

    const onDocumentMouseWheel = (event: WheelEvent) => {
      if (event.target !== gl.domElement) return;
      handleCameraChange(event.deltaY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();

      // check 2 fingers on this canvas for pinching
      if (isPinch(event)) {
        initialPinchDistance = getTouchDistance(event.touches);
        return;
      }

      const touch = Array.from(event.touches).find(
        (t) => t.target === event.currentTarget
      );
      if (touch) {
        // const touch = event.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();

      // check 2 fingers on this canvas for pinching
      if (isPinch(event)) {
        const currentPinchDistance = getTouchDistance(event.touches);
        const pinchDelta = initialPinchDistance - currentPinchDistance;
        handleCameraChange(pinchDelta); // Zoom in/out based on pinch gesture
        initialPinchDistance = currentPinchDistance; // Update for the next move
        return;
      }

      const touch = Array.from(event.touches).find(
        (t) => t.target === event.currentTarget
      );
      if (touchStartRef.current && touch) {
        // const touch = event.touches[0];
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
    document.addEventListener("wheel", onDocumentMouseWheel);

    // Clean up event listeners on component unmount
    return () => {
      gl.domElement.removeEventListener("touchstart", handleTouchStart);
      gl.domElement.removeEventListener("touchmove", handleTouchMove);
      gl.domElement.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("wheel", onDocumentMouseWheel);
    };
  }, [camera, cameraOffset, gameControls, gl]);

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
