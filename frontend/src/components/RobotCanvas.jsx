// frontend/src/components/RobotCanvas.jsx
// ============================================================
// BUYUKUSED FLOATING ROBOT
// ============================================================

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ============================================================
// ROBOT BODY
// ============================================================

function RobotBody() {
  const robot = useRef();
  const leftArm = useRef();
  const rightArm = useRef();
  const head = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Floating movement
    if (robot.current) {
      robot.current.position.y =
        Math.sin(time * 1.8) * 0.08;
    }

    // Gentle head movement
    if (head.current) {
      head.current.rotation.y =
        Math.sin(time * 0.7) * 0.12;

      head.current.rotation.z =
        Math.sin(time * 0.9) * 0.03;
    }

    // Gentle arm movement
    if (leftArm.current) {
      leftArm.current.rotation.z =
        0.15 + Math.sin(time * 1.5) * 0.08;
    }

    if (rightArm.current) {
      rightArm.current.rotation.z =
        -0.15 - Math.sin(time * 1.5) * 0.08;
    }
  });

  return (
    <group ref={robot} position={[0, -0.3, 0]}>

      {/* =====================================================
          BODY
      ===================================================== */}

      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.15, 1.35, 0.75]} />
        <meshStandardMaterial
          color="#111827"
          metalness={0.75}
          roughness={0.25}
        />
      </mesh>

      {/* =====================================================
          CHEST PANEL
      ===================================================== */}

      <mesh position={[0, 0.05, 0.39]}>
        <boxGeometry args={[0.7, 0.65, 0.04]} />
        <meshStandardMaterial
          color="#2563eb"
          emissive="#2563eb"
          emissiveIntensity={0.35}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>

      {/* Chest logo/light */}
      <mesh position={[0, 0.05, 0.43]}>
        <circleGeometry args={[0.14, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1}
        />
      </mesh>

      {/* =====================================================
          NECK
      ===================================================== */}

      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.25, 32]} />
        <meshStandardMaterial
          color="#6b7280"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* =====================================================
          HEAD
      ===================================================== */}

      <group
        ref={head}
        position={[0, 1.2, 0]}
      >

        <mesh>
          <boxGeometry args={[1.05, 0.8, 0.85]} />
          <meshStandardMaterial
            color="#e5e7eb"
            metalness={0.55}
            roughness={0.2}
          />
        </mesh>

        {/* Face screen */}
        <mesh position={[0, 0, 0.44]}>
          <boxGeometry args={[0.75, 0.48, 0.03]} />
          <meshStandardMaterial
            color="#020617"
            emissive="#020617"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* =================================================
            LEFT EYE
        ================================================= */}

        <mesh position={[-0.2, 0.03, 0.47]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={2}
          />
        </mesh>

        {/* =================================================
            RIGHT EYE
        ================================================= */}

        <mesh position={[0.2, 0.03, 0.47]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={2}
          />
        </mesh>

        {/* =================================================
            ANTENNA
        ================================================= */}

        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry
            args={[0.035, 0.035, 0.25, 16]}
          />

          <meshStandardMaterial
            color="#9ca3af"
            metalness={0.8}
          />
        </mesh>

        <mesh position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.09, 24, 24]} />

          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={2}
          />
        </mesh>

      </group>

      {/* =====================================================
          LEFT ARM
      ===================================================== */}

      <group
        ref={leftArm}
        position={[-0.7, 0.25, 0]}
      >

        <mesh>
          <boxGeometry args={[0.25, 1.0, 0.3]} />

          <meshStandardMaterial
            color="#374151"
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>

        {/* Hand */}
        <mesh position={[0, -0.58, 0]}>
          <sphereGeometry args={[0.18, 24, 24]} />

          <meshStandardMaterial
            color="#9ca3af"
            metalness={0.7}
          />
        </mesh>

      </group>

      {/* =====================================================
          RIGHT ARM
      ===================================================== */}

      <group
        ref={rightArm}
        position={[0.7, 0.25, 0]}
      >

        <mesh>
          <boxGeometry args={[0.25, 1.0, 0.3]} />

          <meshStandardMaterial
            color="#374151"
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>

        {/* Hand */}
        <mesh position={[0, -0.58, 0]}>
          <sphereGeometry args={[0.18, 24, 24]} />

          <meshStandardMaterial
            color="#9ca3af"
            metalness={0.7}
          />
        </mesh>

      </group>

      {/* =====================================================
          LEFT LEG
      ===================================================== */}

      <mesh position={[-0.32, -1.05, 0]}>
        <boxGeometry args={[0.32, 0.85, 0.38]} />

        <meshStandardMaterial
          color="#374151"
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      {/* =====================================================
          RIGHT LEG
      ===================================================== */}

      <mesh position={[0.32, -1.05, 0]}>
        <boxGeometry args={[0.32, 0.85, 0.38]} />

        <meshStandardMaterial
          color="#374151"
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

    </group>
  );
}

// ============================================================
// ROBOT CANVAS
// ============================================================

export default function RobotCanvas() {

  return (
    <Canvas
      camera={{
        position: [0, 0.4, 5],
        fov: 42,
      }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
      }}
    >

      {/* Background lighting */}

      <ambientLight intensity={1.2} />

      <directionalLight
        position={[4, 6, 5]}
        intensity={2}
      />

      <pointLight
        position={[-4, 2, 4]}
        intensity={1}
      />

      {/* Robot */}

      <RobotBody />

      {/* Controls */}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />

    </Canvas>
  );
}