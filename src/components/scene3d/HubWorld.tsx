"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { skillsFor } from "@/content/skills";
import type { JurisdictionId } from "@/engine/types";
import type { QualityTier } from "@/lib/quality";
import { SceneCanvas } from "./SceneCanvas";

interface HubWorldProps {
  jurisdiction: JurisdictionId;
  quality: QualityTier;
  completed: Record<string, boolean>;
  labels: Record<string, string>;
  onOpenSkill: (skillId: string) => void;
}

function Building({ x, z, h, color }: { x: number; z: number; h: number; color: string }) {
  return (
    <mesh position={[x, h / 2, z]} castShadow>
      <boxGeometry args={[1.6, h, 1.6]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function HubWorld({ jurisdiction, quality, completed, labels, onOpenSkill }: HubWorldProps) {
  const skills = skillsFor(jurisdiction);
  const palettes = ["#d4a574", "#c9845a", "#e8d5b7", "#8c6a4a"];
  return (
    <SceneCanvas quality={quality} className="h-[70vh] min-h-[320px] w-full overflow-hidden rounded-3xl" cameraPosition={[14, 16, 14]}>
      <color attach="background" args={["#7eb6d9"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 18, 8]} intensity={1.3} castShadow={quality === "high"} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[22, 40]} />
        <meshStandardMaterial color="#74a36d" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[5, 28]} />
        <meshStandardMaterial color="#3a342e" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[28, 5]} />
        <meshStandardMaterial color="#3a342e" />
      </mesh>
      {Array.from({ length: 16 }, (_, index) => {
        const x = ((index % 4) - 1.5) * 4.5;
        const z = (Math.floor(index / 4) - 1.5) * 4.5;
        if (Math.abs(x) < 2.4 || Math.abs(z) < 2.4) {
          return null;
        }
        return (
          <Building
            key={index}
            x={x}
            z={z}
            h={1.4 + (index % 3) * 0.9}
            color={palettes[index % palettes.length]!}
          />
        );
      })}
      {skills.map((skill, index) => {
        const angle = (index / skills.length) * Math.PI * 2;
        const x = Math.cos(angle) * 7;
        const z = Math.sin(angle) * 7;
        const ready = skill.prerequisiteIds.every((id) => completed[id]) || skill.prerequisiteIds.length === 0;
        return (
          <mesh
            key={skill.id}
            position={[x, 0.6, z]}
            onClick={() => {
              if (ready) {
                onOpenSkill(skill.id);
              }
            }}
          >
            <cylinderGeometry args={[0.9, 0.9, 0.35, 20]} />
            <meshStandardMaterial
              color={ready ? "#f5c400" : "#6b645c"}
              emissive={ready ? "#f5c400" : "#000000"}
              emissiveIntensity={ready ? 0.4 : 0}
            />
            <Html position={[0, 1.1, 0]} center>
              <button
                type="button"
                className="rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white"
                onClick={() => {
                  if (ready) {
                    onOpenSkill(skill.id);
                  }
                }}
              >
                {labels[skill.id] ?? skill.id}
              </button>
            </Html>
          </mesh>
        );
      })}
      <OrbitControls autoRotate={quality !== "low"} autoRotateSpeed={0.4} enablePan={false} />
    </SceneCanvas>
  );
}
