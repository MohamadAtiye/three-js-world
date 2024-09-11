import React, { useState, useEffect, useRef } from "react";
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
  transition: transform 0.2s ease, background-color 0.1s ease;

  &:active {
    transform: scale(0.95);
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

export default function DPad() {
  const { velocity, playerJump, playerPos, jump } = useGame();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0.1);

  const isMoving = useRef(false);

  useEffect(() => {
    const { x, y } = position;
    velocity.z = Math.min(Math.max(y, -1), 1);
    velocity.x = Math.min(Math.max(-x, -1), 1);

    // Calculate the magnitude of the velocity vector
    const magnitudeSquared = velocity.x ** 2 + velocity.z ** 2;
    if (magnitudeSquared > 1) {
      velocity.divideScalar(Math.sqrt(magnitudeSquared));
    }
  }, [position, velocity]);

  const handleMove = (clientX: number, clientY: number, rect: DOMRect) => {
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((rect.top - clientY) / rect.height) * 2 + 1;

    setPosition({ x, y });
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!isMoving.current) return;
    const touch = Array.from(event.touches).find(
      (t) => t.target === event.currentTarget
    );
    if (touch) {
      const rect = event.currentTarget.getBoundingClientRect();
      handleMove(touch.clientX, touch.clientY, rect);
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isMoving.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    handleMove(event.clientX, event.clientY, rect);
  };

  const handleEnd = () => {
    setPosition({ x: 0, y: 0 });
    velocity.set(0, 0, 0);
    setOpacity(0.1);
    isMoving.current = false;
  };

  const handleStart = (event: React.TouchEvent | React.MouseEvent) => {
    event.stopPropagation();
    isMoving.current = true;
    setOpacity(1);
  };

  const handleJumpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    jump();
  };

  const innerCircleStyle = {
    position: "absolute" as "absolute",
    left: `calc(50% - ${velocity.x * 50}%)`,
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
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
          onMouseDown={handleStart}
          onMouseMove={handleMouseMove}
          onMouseUp={handleEnd}
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
