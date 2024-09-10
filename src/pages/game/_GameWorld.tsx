"use client";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PointerLockControls } from "@react-three/drei";
import HelperIU from "./components/_HelperUi";

export default function GameWorld() {
  // CAMERA POINTER LOCK
  const [pointerLocked, setPointerLocked] = useState(false);
  const handlePointerLockChange = () => {
    setPointerLocked(document.pointerLockElement !== null);
  };
  useEffect(() => {
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () =>
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
  }, []);

  // PLAYER MOVEMENT
  const keyMap = useRef<Record<string, boolean>>({});
  const onDocumentKey = (e: KeyboardEvent) => {
    console.log(e.code, e.type);
    keyMap.current[e.code] = e.type === "keydown";
  };

  useEffect(() => {
    if (pointerLocked) {
      document.addEventListener("keydown", onDocumentKey);
      document.addEventListener("keyup", onDocumentKey);
    } else {
      document.removeEventListener("keydown", onDocumentKey);
      document.removeEventListener("keyup", onDocumentKey);
    }
  }, [pointerLocked]);

  return (
    <div>
      <HelperIU pointerLocked={pointerLocked} />
      <Canvas style={{ height: "100vh", backgroundColor: "black" }}>
        <PointerLockControls />

        <gridHelper args={[10, 10]} />

        <Scene keyMap={keyMap.current} />
      </Canvas>
    </div>
  );
}

/////////////////////////////////////////////////////////////////////////////////////
// const SPEED = 0.01;
// const Scene: React.FC<{ keyMap: Record<string, boolean> }> = ({ keyMap }) => {
//   const capsuleRef = useRef<THREE.Mesh>(null);
//   const pivotRef = useRef<THREE.Object3D>(null);
//   const { camera } = useThree();
//   const inputVelocity = useRef(new THREE.Vector3());
//   const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
//   const quaternion = useRef(new THREE.Quaternion());

//   console.log("render scene");

//   useEffect(() => {
//     camera.position.set(0, 0.5, 3);
//   }, [camera]);

//   useFrame(() => {
//     const velocity = new THREE.Vector3();

//     // Reset velocity to 0
//     velocity.set(0, 0, 0);
//     if (keyMap["KeyW"]) velocity.z = -10 * SPEED;
//     if (keyMap["KeyS"]) velocity.z = 10 * SPEED;
//     if (keyMap["KeyA"]) velocity.x = -10 * SPEED;
//     if (keyMap["KeyD"]) velocity.x = 10 * SPEED;

//     // Apply camera rotation to the movement direction
//     euler.current.set(0, camera.rotation.y, 0);
//     quaternion.current.setFromEuler(euler.current);
//     velocity.applyQuaternion(quaternion.current);

//     // Update capsule position
//     if (capsuleRef.current) {
//       capsuleRef.current.position.add(velocity);
//     }

//     // Smoothly update camera to follow the capsule
//     if (capsuleRef.current && pivotRef.current) {
//       capsuleRef.current.getWorldPosition(camera.position);
//       camera.position.add(new THREE.Vector3(0, 1.5, -3)); // Offset the camera position
//       pivotRef.current.position.lerp(camera.position, 0.1); // Smooth interpolation
//     }
//   });

//   return (
//     <>
//       <mesh ref={capsuleRef} position={[0, 1.5, 0]}>
//         <capsuleGeometry />
//         <meshBasicMaterial color={0x00ff00} wireframe />
//       </mesh>

//       <object3D ref={pivotRef}>
//         <primitive object={camera} />
//       </object3D>
//     </>
//   );
// };

const SPEED = 0.01;
const Scene: React.FC<{ keyMap: Record<string, boolean> }> = ({ keyMap }) => {
  const capsuleRef = useRef<THREE.Mesh>(null);
  const pivotRef = useRef<THREE.Object3D>(null);
  const { camera } = useThree();
  const inputVelocity = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.set(0, 0.5, 3);
  }, [camera]);

  useFrame(() => {
    const velocity = new THREE.Vector3();

    velocity.set(0, 0, 0);
    if (keyMap["KeyW"]) velocity.z = -10 * SPEED; // delta;
    if (keyMap["KeyS"]) velocity.z = 10 * SPEED; //delta;
    if (keyMap["KeyA"]) velocity.x = -10 * SPEED; //delta;
    if (keyMap["KeyD"]) velocity.x = 10 * SPEED; //delta;
    // if (moveRight.current) velocity.x = 10 * delta;

    if (capsuleRef.current) {
      const euler = new THREE.Euler(0, camera.rotation.y, 0);
      velocity.applyEuler(euler);
      capsuleRef.current.position.add(velocity);

      // camera
      if (pivotRef.current) {
        pivotRef.current.position.lerp(capsuleRef.current.position, 0.1);
      }
    }
  });

  return (
    <>
      <mesh ref={capsuleRef} position={[0, 1.5, 0]}>
        <capsuleGeometry />
        <meshBasicMaterial color={0x00ff00} wireframe />
      </mesh>

      <object3D ref={pivotRef}>
        <object3D position={[0, 1, 10]}>
          <object3D>
            <object3D>
              <primitive object={camera} />
            </object3D>
          </object3D>
        </object3D>
      </object3D>
    </>
  );
};
