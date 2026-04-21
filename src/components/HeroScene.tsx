import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function NeonCar() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.4;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
  });

  return (
    <group ref={ref} position={[0, -0.3, 0]}>
      {/* Car body — low-poly stylized */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[3.2, 0.6, 1.4]} />
        <meshStandardMaterial
          color="#0a1628"
          metalness={0.9}
          roughness={0.2}
          emissive="#00d9ff"
          emissiveIntensity={0.05}
        />
      </mesh>
      {/* Cabin */}
      <mesh position={[0.1, 1.0, 0]}>
        <boxGeometry args={[1.8, 0.5, 1.2]} />
        <meshStandardMaterial
          color="#001a2e"
          metalness={1}
          roughness={0.1}
          emissive="#00d9ff"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Neon underglow strip */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[3.0, 0.05, 1.3]} />
        <meshBasicMaterial color="#00f0ff" toneMapped={false} />
      </mesh>
      {/* Headlights */}
      <mesh position={[1.6, 0.55, 0.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ccffaa" toneMapped={false} />
      </mesh>
      <mesh position={[1.6, 0.55, -0.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ccffaa" toneMapped={false} />
      </mesh>
      {/* Wheels */}
      {[
        [1.1, 0.2, 0.75],
        [-1.1, 0.2, 0.75],
        [1.1, 0.2, -0.75],
        [-1.1, 0.2, -0.75],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.25, 24]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Shield() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.6;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1}>
      <mesh ref={ref} position={[2.5, 1.8, -0.5]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={1.5}
          metalness={0.8}
          roughness={0.2}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function Coin({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.x = s.clock.elapsedTime * 1.2;
  });
  return (
    <Float speed={2} floatIntensity={1.5}>
      <mesh ref={ref} position={position}>
        <cylinderGeometry args={[0.25, 0.25, 0.06, 32]} />
        <meshStandardMaterial
          color="#c8ff5a"
          emissive="#c8ff5a"
          emissiveIntensity={0.8}
          metalness={1}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function Road() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[40, 8]} />
      <meshStandardMaterial color="#070b14" metalness={0.4} roughness={0.6} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [4.5, 2.8, 5.5], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <pointLight position={[-3, 2, -2]} intensity={2} color="#00f0ff" />
        <pointLight position={[3, 1, 3]} intensity={1.5} color="#c8ff5a" />

        <NeonCar />
        <Shield />
        <Coin position={[-2.5, 1.5, 0.5]} />
        <Coin position={[-2.0, 2.4, -0.8]} />
        <Coin position={[2.8, 0.8, 1.2]} />

        <Road />
        <Sparkles count={60} scale={[10, 4, 6]} size={2} speed={0.4} color="#00f0ff" />
      </Suspense>
    </Canvas>
  );
}
