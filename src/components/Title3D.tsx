import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedText() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <Center>
      <Text3D
        ref={meshRef}
        font="/fonts/helvetiker_regular.typeface.json"
        size={1.5}
        height={0.3}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.1}
        bevelSize={0.05}
        bevelSegments={5}
      >
        🎥 SM REVIEWS 3D
        <meshStandardMaterial
          color="#ffd700"
          metalness={0.9}
          roughness={0.2}
          emissive="#332200"
        />
      </Text3D>
    </Center>
  );
}

export const Title3D: React.FC = () => {
  return (
    <div className="w-full h-48 mb-4">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#ffd700" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
        <AnimatedText />
      </Canvas>
    </div>
  );
};
