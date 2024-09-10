import React from "react";
import { TextureLoader } from "three";
import { RepeatWrapping } from "three";
import { Plane } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";

export function GroundPlane() {
  // Load the checker texture from the public folder
  const texture = useLoader(TextureLoader, "/checker.png");

  // Set the texture wrapping and repeat it 50 times (to cover the 100x100 area with 2x2 units)
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(50, 50);

  return (
    <Plane
      position={[0, 0, 0]} // Position the plane at the origin
      rotation={[-Math.PI / 2, 0, 0]} // Rotate to be horizontal
      args={[100, 100]} // Size of the plane (100x100 units)
    >
      <meshStandardMaterial map={texture} />
    </Plane>
  );
}

// export function GroundPlane() {
//   const gridSize = 100; // Define the size of the ground (100x100 squares)

//   const tiles = [];
//   for (let i = 0; i < gridSize; i++) {
//     for (let j = 0; j < gridSize; j++) {
//       // Alternate between light and dark gray based on position
//       const isLightGray = (i + j) % 2 === 0;
//       const color = isLightGray ? "lightgray" : "darkgray";

//       // Create a plane for each square
//       tiles.push(
//         <mesh
//           key={`${i}-${j}`}
//           position={[i - gridSize / 2, -0.5, j - gridSize / 2]} // Position based on grid
//           rotation={[-Math.PI / 2, 0, 0]} // Rotate to make it horizontal
//         >
//           <planeGeometry args={[1, 1]} />
//           <meshStandardMaterial color={color} />
//         </mesh>
//       );
//     }
//   }
//   return <>{tiles}</>;
// }
