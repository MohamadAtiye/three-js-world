import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useGame } from "../gameContext/useGame";
import { GROUND_LEVEL, JUMP_FORCE } from "../constants";
import styled from "styled-components";

const StyledButton = styled.button`
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.1s ease, background-color 0.1s ease;

  &:active {
    transform: scale(0.95);
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

export default function DPad() {
  const { velocity, playerJump, playerPos } = useGame();
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0.1);

  useEffect(() => {
    const { x, y } = touchPosition;
    velocity.z = Math.min(Math.max(y, -1), 1);
    velocity.x = Math.min(Math.max(-x, -1), 1);

    // Calculate the magnitude of the velocity vector
    const magnitude = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);

    // If the magnitude is greater than 1, normalize the vector
    if (magnitude > 1) {
      velocity.x /= magnitude;
      velocity.z /= magnitude;
    }
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
    setOpacity(0.1);
  };

  const handleTouchStart = () => {
    setOpacity(1);
  };

  const handleJumpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!playerJump.isJumping && playerPos.y <= GROUND_LEVEL) {
      // Trigger jump when space is pressed and player is on the ground
      playerJump.isJumping = true;
      playerJump.velocity = JUMP_FORCE;
    }
  };

  // Calculate position of the movement direction circle
  const innerCircleStyle = {
    position: "absolute" as "absolute",
    left: `calc(50% - ${velocity.x * 50}%)`, // Adjust 50px to control distance from center
    top: `calc(50% - ${velocity.z * 50}%)`,
    transform: "translate(-50%, -50%)",
    height: "30%",
    width: "30%",
    background: "rgba(255,255,255,0.3)",
    borderRadius: "50%",
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 10,
          opacity: opacity,
          transition: "opacity 0.2s ease-in-out",
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div style={{ ...innerCircleStyle, pointerEvents: "none" }} />
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 10,
        }}
      >
        <StyledButton onClick={handleJumpClick}>
          Jump
          <br />
          <span style={{ fontSize: "10px" }}>Space</span>
        </StyledButton>
      </div>
    </>
  );
}
