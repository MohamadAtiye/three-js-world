import { useEffect, useRef } from "react";
import { Euler, Matrix4, Mesh, PerspectiveCamera, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "three-stdlib"; // Import the OrbitControls type
import { OrbitControls as DreiOrbitControls } from "@react-three/drei"; // The component from drei
import { useGame } from "../gameContext/useGame";

const SPEED = 0.1; // Movement speed
const CAMERA_DISTANCE = 3; // Fixed distance for the orbit camera

export function PlayerSphere() {
  const { playerPos } = useGame();

  // for sphere movement controls
  const moving = useRef<{ front: number; side: number }>({ front: 0, side: 0 });
  const sphereRef = useRef<Mesh>(null); // Reference to the floating sphere

  // camera controls
  const cameraRef = useRef<PerspectiveCamera>(null); // Reference to the camera
  const orbitControlsRef = useRef<OrbitControls>(null); // Properly typed reference to OrbitControls

  useFrame(({ camera }) => {
    // get current player position
    const [x, y, z] = playerPos;
    const pos = new Vector3(x, y, z);

    ////////////////////////////////////////-- get forward and side directions
    // Get camera direction
    const direction = new Vector3();
    camera.getWorldDirection(direction);

    // Make direction parallel to the ground
    direction.y = 0; // Ignore vertical direction
    direction.normalize(); // Normalize direction for consistent movement
    // get perpendicular vector for side movement
    const perpendicular = direction.clone().cross(new Vector3(0, 1, 0));

    ////////////////////////////////////////-- calculate sphere location
    // half speed if moving diagonally
    const movement =
      Math.abs(moving.current.front) + Math.abs(moving.current.side);
    const speedModifier = SPEED * (movement > 1 ? 0.5 : movement > 0 ? 1 : 0);

    let newPos = pos.add(
      direction.clone().multiplyScalar(speedModifier * moving.current.front)
    );
    newPos.add(
      perpendicular.multiplyScalar(speedModifier * moving.current.side)
    );

    ////////////////////////////////////////-- apply sphere location
    playerPos[0] = newPos.x;
    playerPos[1] = newPos.y;
    playerPos[2] = newPos.z;

    if (sphereRef.current) {
      sphereRef.current.position.set(...playerPos);

      // Calculate the direction from the sphere to the camera
      const sphereToCamera = camera.position
        .clone()
        .sub(sphereRef.current.position);
      sphereToCamera.y = 0; // Make sure rotation is only horizontal
      sphereToCamera.normalize();

      // Calculate the rotation to face the camera
      if (speedModifier) {
        const rotation = new Euler(0, 0, 0, "XYZ");
        rotation.setFromRotationMatrix(
          new Matrix4().lookAt(
            camera.position,
            new Vector3(
              sphereRef.current.position.x,
              sphereRef.current.position.y + 1,
              sphereRef.current.position.z
            ),
            new Vector3(0, 1, 0)
          )
        );
        sphereRef.current.rotation.copy(rotation);
      }
    }

    ////////////////////////////////////////-- calculate camera location
    if (orbitControlsRef.current) {
      // Update OrbitControls to follow the sphere

      orbitControlsRef.current.target.set(newPos.x, newPos.y + 1, newPos.z);
      orbitControlsRef.current.update();
    }
  });

  // Handle key down and key up events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "w") {
        moving.current.front = 1;
      }
      if (event.key === "s") {
        moving.current.front = -1;
      }
      if (event.key === "d") {
        moving.current.side = 1;
      }
      if (event.key === "a") {
        moving.current.side = -1;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "w" && moving.current.front === 1) {
        moving.current.front = 0;
      }
      if (event.key === "s" && moving.current.front === -1) {
        moving.current.front = 0;
      }
      if (event.key === "d" && moving.current.side === 1) {
        moving.current.side = 0;
      }
      if (event.key === "a" && moving.current.side === -1) {
        moving.current.side = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <>
      {/* <OrbitControls /> */}
      <mesh ref={sphereRef} position={[2, 1, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="blue" />
        <arrowHelper args={[new Vector3(0, 0, -1), new Vector3(0, 0, 0)]} />
      </mesh>

      {/* Camera */}
      <perspectiveCamera ref={cameraRef} position={[0, 3, CAMERA_DISTANCE]} />

      {/* Orbit Controls */}
      <DreiOrbitControls
        ref={orbitControlsRef}
        camera={cameraRef.current ?? undefined}
        enableDamping
        dampingFactor={0.1}
        minDistance={CAMERA_DISTANCE}
        maxDistance={CAMERA_DISTANCE}
        enablePan={false}
        rotateSpeed={0.4}
        maxPolarAngle={Math.PI * 0.9} // Limit vertical rotation
        minPolarAngle={Math.PI * 0.1} // Limit vertical rotation
        // maxPolarAngle={Math.PI / 2.1} // Limit vertical rotation
      />
    </>
  );
}
