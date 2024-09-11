import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useGame } from "../gameContext/useGame";

export default function DPad() {
  const { velocity } = useGame();
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const { x, y } = touchPosition;

    let newVector = new THREE.Vector3(0, 0, 0);

    // Detecting direction based on touch position
    if (y < -0.5) newVector.z = -1; // Backward
    else if (y > 0.5) newVector.z = 1; // Forward

    if (x < -0.5) newVector.x = 1; // Left
    else if (x > 0.5) newVector.x = -1; // Right

    velocity.copy(newVector);
  }, [touchPosition, velocity]);

  const handleTouchMove = (event: React.TouchEvent) => {
    const touch = Array.from(event.touches).find(
      (t) => t.target === event.currentTarget
    );
    if (touch) {
      const rect = event.currentTarget.getBoundingClientRect();

      // Normalize touch position within the DPad area
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((rect.top - touch.clientY) / rect.height) * 2 + 1;

      setTouchPosition({ x, y });
    }
  };

  const handleTouchEnd = () => {
    setTouchPosition({ x: 0, y: 0 });
    velocity.set(0, 0, 0);
  };

  // Calculate position of the movement direction circle
  const innerCircleStyle = {
    position: "absolute" as "absolute",
    left: `calc(50% - ${velocity.x * 50}px)`, // Adjust 50px to control distance from center
    top: `calc(50% - ${velocity.z * 50}px)`,
    transform: "translate(-50%, -50%)",
    height: "30%",
    width: "30%",
    background: "rgba(255,255,255,0.3)",
    borderRadius: "50%",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        zIndex: 10,
        background: "transparent",
      }}
    >
      <div
        style={{
          height: "min(50vw,300px)",
          width: "min(50vw,300px)",
          background: "rgba(255,255,255,0.3)",
          borderRadius: "50%",
          touchAction: "none",
          position: "relative", // Ensure the circle is positioned relative to DPad
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ ...innerCircleStyle, pointerEvents: "none" }} />
      </div>
    </div>
  );
}
