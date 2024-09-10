import { useEffect, useRef, useState } from "react";
import { Mesh, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const PlayerSphere = () => {
  const sphereRef = useRef<Mesh>(null);
  const { camera } = useThree();
  const [rotation, setRotation] = useState(0); // For tracking forward direction
  const speed = 0.1;

  // Handle AWSD movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!sphereRef.current) return;

      const forward = new Vector3(0, 0, -1).applyAxisAngle(
        new Vector3(0, 1, 0),
        rotation
      );
      const right = new Vector3(1, 0, 0).applyAxisAngle(
        new Vector3(0, 1, 0),
        rotation
      );

      switch (event.key) {
        case "w":
          sphereRef.current.position.add(forward.multiplyScalar(speed));
          break;
        case "s":
          sphereRef.current.position.add(forward.multiplyScalar(-speed));
          break;
        case "a":
          sphereRef.current.position.add(right.multiplyScalar(-speed));
          break;
        case "d":
          sphereRef.current.position.add(right.multiplyScalar(speed));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rotation]);

  useFrame(() => {
    if (sphereRef.current) {
      // Update the OrbitControls target to always center on the sphere
      camera.lookAt(sphereRef.current.position);

      // Optionally, set the camera's height relative to the sphere
      camera.position.set(
        camera.position.x,
        sphereRef.current.position.y + 2,
        camera.position.z
      );
    }
  });

  return (
    <>
      <mesh ref={sphereRef} position={[0, 1, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        target={[0, 1, 0]} // Always target the player sphere
      />
    </>
  );
};

export default PlayerSphere;
