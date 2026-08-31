"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import { listSigns } from "@/content/signs";
import type { Approach, JurisdictionId } from "@/engine/types";
import type { QualityTier } from "@/lib/quality";
import { SignBillboard } from "./SignBillboard";
import { SceneCanvas } from "./SceneCanvas";

interface DriveParkProps {
  jurisdiction: JurisdictionId;
  quality: QualityTier;
  followHold: boolean;
}

const keys = new Set<string>();

const APPROACHES: Approach[] = ["north", "east", "south", "west"];

function Car({ followHold }: { followHold: boolean }) {
  const ref = useRef<Group>(null);
  const vel = useRef(0);
  const angle = useRef(0);
  const loopT = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) {
      return;
    }
    if (followHold) {
      loopT.current += delta * 0.18;
      const t = loopT.current;
      const radius = 8;
      ref.current.position.set(Math.cos(t) * radius, 0.4, Math.sin(t) * radius);
      ref.current.rotation.y = -t + Math.PI / 2;
      return;
    }
    const forward = keys.has("w") || keys.has("arrowup") ? 1 : keys.has("s") || keys.has("arrowdown") ? -1 : 0;
    const steer = keys.has("a") || keys.has("arrowleft") ? 1 : keys.has("d") || keys.has("arrowright") ? -1 : 0;
    vel.current += (forward * 8 - vel.current * 2.2) * delta;
    angle.current += steer * vel.current * 0.35 * delta;
    ref.current.rotation.y = angle.current;
    ref.current.position.x += Math.sin(angle.current) * vel.current * delta;
    ref.current.position.z += Math.cos(angle.current) * vel.current * delta;
    ref.current.position.y = 0.4;
  });

  return (
    <group ref={ref} position={[0, 0.4, 6]}>
      <mesh>
        <boxGeometry args={[1.1, 0.55, 1.9]} />
        <meshStandardMaterial color="#e8c547" />
      </mesh>
    </group>
  );
}

export function DrivePark({ jurisdiction, quality, followHold }: DriveParkProps) {
  const signs = listSigns(jurisdiction).slice(0, 8);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.add(event.key.toLowerCase());
    };
    const up = (event: KeyboardEvent) => {
      keys.delete(event.key.toLowerCase());
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return (
    <SceneCanvas quality={quality} className="h-[70vh] min-h-[320px] w-full overflow-hidden rounded-3xl" cameraPosition={[0, 14, 14]}>
      <color attach="background" args={["#9ec9e6"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[6, 16, 8]} intensity={1.1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[20, 40]} />
        <meshStandardMaterial color="#74a36d" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[6.4, 9.8, 64]} />
        <meshStandardMaterial color="#3a342e" />
      </mesh>
      {signs.map((sign, index) => {
        const t = (index / signs.length) * Math.PI * 2;
        return (
          <SignBillboard
            key={sign.id}
            code={sign.code}
            approach={APPROACHES[index % APPROACHES.length]!}
            jurisdiction={jurisdiction}
            position={[Math.cos(t) * 11, 1.2, Math.sin(t) * 11]}
          />
        );
      })}
      <Car followHold={followHold} />
      <OrbitControls enablePan={false} />
    </SceneCanvas>
  );
}
