// ============================================================
// frontend/src/components/RobotCanvas.jsx
// ============================================================

import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";

// ============================================================
// ROBOT MODEL
// ============================================================

const MODEL_URL =
  "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.gltf";

// ============================================================
// ROBOT
// ============================================================

function RobotModel() {
  const { scene, animations } = useGLTF(MODEL_URL);

  const {
    ref,
    actions,
  } = useAnimations(animations);

  // ==========================================================
  // PLAY WAVE ANIMATION
  // ==========================================================

  useEffect(() => {
    if (!actions) {
      return;
    }

    // Try Wave first
    const wave =
      actions["Wave"] ||
      actions["Idle"];

    if (!wave) {
      console.warn(
        "Robot animation not found."
      );

      return;
    }

    wave.reset();
    wave.fadeIn(0.3);
    wave.play();

    wave.setLoop(
      THREE.LoopRepeat,
      Infinity
    );

    return () => {
      wave.fadeOut(0.3);
      wave.stop();
    };
  }, [actions]);

  // ==========================================================
  // MODEL
  // ==========================================================

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={2}
      position={[0, -1.5, 0]}
    />
  );
}

// ============================================================
// PRELOAD MODEL
// ============================================================

useGLTF.preload(MODEL_URL);

// ============================================================
// CANVAS
// ============================================================

export default function RobotCanvas() {
  return (
    <Canvas
      camera={{
        position: [0, 1, 4],
        fov: 50,
      }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
      }}
    >
      {/* ====================================================
          LIGHTING
      ==================================================== */}

      <ambientLight intensity={0.8} />

      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
      />

      <directionalLight
        position={[-5, 2, -5]}
        intensity={0.4}
      />

      {/* ====================================================
          ROBOT
      ==================================================== */}

      <RobotModel />

      {/* ====================================================
          CONTROLS
      ==================================================== */}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.5}
      />
    </Canvas>
  );
}