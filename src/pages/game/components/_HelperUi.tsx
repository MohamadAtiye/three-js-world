"use client";
import React from "react";
import styled from "styled-components";

const InstructionsPanel = styled.div`
  color: white;
  position: absolute;
  left: 50%;
  top: 10px;
  margin-left: -220px;
  font-family: monospace;
  z-index: 100;
`;

const MenuPanel = styled.div`
  position: absolute;
  background-color: rgba(255, 255, 255, 0.25);
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 100;
}`;

const StartButton = styled.button`
  height: 50px;
  width: 200px;
  margin: -25px -100px;
  position: relative;
  top: 50%;
  left: 50%;
  font-size: 32px;
`;

interface HelperIUProps {
  pointerLocked: boolean;
}
export default function HelperIU({ pointerLocked }: HelperIUProps) {
  return (
    <>
      <InstructionsPanel>
        W A S D to move capsule
        <br />
        Mousemove to rotate
        <br />
        Mousewheel to dolly in/out
      </InstructionsPanel>

      {!pointerLocked && (
        <MenuPanel>
          <StartButton
            onClick={() => {
              document.body.requestPointerLock();
            }}
          >
            Start
          </StartButton>
        </MenuPanel>
      )}
    </>
  );
}
