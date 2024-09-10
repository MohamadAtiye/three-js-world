import React, { useState, useEffect, useRef } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Euler, Matrix4, Vector3 } from "three";

const SPEED = 0.1; // Movement speed
const ROTATION_SPEED = 0.005; // Rotation speed
const MIN_PITCH = -Math.PI / 3; // Min vertical rotation (radians)
const MAX_PITCH = Math.PI / 3; // Max vertical rotation (radians)

export function PlayerCamera() {
  const cameraPositionRef = useRef<[number, number, number]>([0, 1, 0]);
  const cameraRotationRef = useRef<Euler>(new Euler(0, 0, 0));

  const keys = useRef<Set<string>>(new Set());
  const mouseDown = useRef<boolean>(false);
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);

  console.log("render camera");

  // Handle camera movement
  useFrame(({ camera }) => {
    const [x, y, z] = cameraPositionRef.current;

    let newX = x;
    let newZ = z;

    // Get camera direction
    const direction = new Vector3();
    camera.getWorldDirection(direction);

    // Make direction parallel to the ground
    direction.y = 0; // Ignore vertical direction
    direction.normalize(); // Normalize direction for consistent movement

    if (keys.current.has("w")) {
      newX += direction.x * SPEED;
      newZ += direction.z * SPEED;
    }
    if (keys.current.has("s")) {
      newX -= direction.x * SPEED;
      newZ -= direction.z * SPEED;
    }
    if (keys.current.has("d")) {
      newX -= direction.z * SPEED;
      newZ += direction.x * SPEED;
    }
    if (keys.current.has("a")) {
      newX += direction.z * SPEED;
      newZ -= direction.x * SPEED;
    }

    cameraPositionRef.current = [newX, y, newZ];

    // Apply camera rotation
    camera.rotation.order = "YXZ";
    camera.rotation.set(
      cameraRotationRef.current.x,
      cameraRotationRef.current.y,
      0
    ); // Keep roll (z-axis) at 0
    camera.position.set(newX, y, newZ);
  });

  // Handle key down and key up events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keys.current.add(event.key);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle mouse drag for rotation
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      mouseDown.current = true;
      lastMousePosition.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      mouseDown.current = false;
      lastMousePosition.current = null;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (mouseDown.current && lastMousePosition.current) {
        const dx = event.clientX - lastMousePosition.current.x;
        const dy = event.clientY - lastMousePosition.current.y;

        // setCameraRotation((prevRotation) => {
        const newRotation = cameraRotationRef.current.clone();
        newRotation.y -= dx * ROTATION_SPEED;
        newRotation.x = Math.max(
          MIN_PITCH,
          Math.min(MAX_PITCH, newRotation.x - dy * ROTATION_SPEED)
        );
        cameraRotationRef.current = newRotation;

        lastMousePosition.current = { x: event.clientX, y: event.clientY };
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <PerspectiveCamera makeDefault position={cameraPositionRef.current} />;
}
