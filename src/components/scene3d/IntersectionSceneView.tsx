"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Mesh } from "three";
import type { VisualActor, VisualScene } from "@/content/scenes";
import { destinationOf } from "@/engine/geometry";
import type { Approach, LightState } from "@/engine/types";
import type { QualityTier } from "@/lib/quality";
import { APPROACH_POS, SignBillboard } from "./SignBillboard";
import { SceneCanvas } from "./SceneCanvas";

interface IntersectionSceneViewProps {
  scene: VisualScene;
  quality: QualityTier;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectActor?: (id: string) => void;
  playingClip?: boolean;
  highlightId?: string;
  correctOrder?: string[];
}

function lightColor(state: LightState): string {
  switch (state) {
    case "green":
      return "#1f9d55";
    case "yellow":
    case "flashing-yellow":
      return "#f5c400";
    case "red":
    case "flashing-red":
      return "#e30613";
    case "off":
      return "#4b4540";
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

function ActorMesh({
  actor,
  clipT,
  selected,
  selectable,
  highlight,
  onSelect,
  hand,
  orderLabel,
}: {
  actor: VisualActor;
  clipT: number;
  selected: boolean;
  selectable: boolean;
  highlight: boolean;
  onSelect?: (id: string) => void;
  hand: "right" | "left";
  orderLabel?: string;
}) {
  const mesh = useRef<Mesh>(null);
  const start = APPROACH_POS[actor.approach];
  const destApproach = destinationOf(actor.approach, actor.intent, hand);
  const end = APPROACH_POS[destApproach];
  const center: [number, number, number] = [0, start[1], 0];

  useFrame(() => {
    if (!mesh.current) {
      return;
    }
    const t = Math.min(1, Math.max(0, clipT));
    const from = t < 0.5 ? start : center;
    const to = t < 0.5 ? center : [end[0] * 0.35, end[1], end[2] * 0.35];
    const local = t < 0.5 ? t * 2 : (t - 0.5) * 2;
    mesh.current.position.set(
      from[0] + (to[0] - from[0]) * local,
      from[1],
      from[2] + (to[2] - from[2]) * local,
    );
  });

  const size: [number, number, number] =
    actor.kind === "tram"
      ? [1.1, 0.7, 2.6]
      : actor.kind === "pedestrian"
        ? [0.4, 1.1, 0.4]
        : actor.kind === "emergency"
          ? [1.1, 0.7, 1.8]
          : [1, 0.55, 1.7];

  return (
    <mesh
      ref={mesh}
      position={start}
      castShadow
      onClick={(event) => {
        event.stopPropagation();
        if (selectable) {
          onSelect?.(actor.id);
        }
      }}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={actor.emergencyLights && highlight ? "#3b82f6" : actor.color}
        emissive={selected || highlight ? "#f5c400" : "#000000"}
        emissiveIntensity={selected || highlight ? 0.35 : 0}
      />
      <Html position={[0, 1.1, 0]} center>
        <button
          type="button"
          className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
          onClick={(event) => {
            event.stopPropagation();
            if (selectable) {
              onSelect?.(actor.id);
            }
          }}
        >
          {orderLabel ?? actor.id}
        </button>
      </Html>
    </mesh>
  );
}

function Roads({ topology, quality }: { topology: VisualScene["topology"]; quality: QualityTier }) {
  const asphalt = "#3a342e";
  const mark = "#e8e0d0";
  const ground = (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={quality === "high"} position={[0, 0, 0]}>
      <circleGeometry args={[18, 32]} />
      <meshStandardMaterial color={quality === "low" ? "#8fbf88" : "#6fa86a"} />
    </mesh>
  );
  if (topology === "roundabout") {
    return (
      <group>
        {ground}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[2.2, 4.6, 48]} />
          <meshStandardMaterial color={asphalt} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <circleGeometry args={[2.1, 32]} />
          <meshStandardMaterial color="#5b8c5a" />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      {ground}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, topology === "t" ? 2 : 0]} receiveShadow={quality === "high"}>
        <planeGeometry args={[4.2, topology === "t" ? 12 : 16]} />
        <meshStandardMaterial color={asphalt} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[16, 4.2]} />
        <meshStandardMaterial color={asphalt} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <planeGeometry args={[0.08, topology === "t" ? 10 : 14]} />
        <meshStandardMaterial color={mark} />
      </mesh>
    </group>
  );
}

function Signal({ facing, state }: { facing: Approach; state: LightState }) {
  const pos = APPROACH_POS[facing];
  return (
    <group position={[pos[0] * 0.42, 2.1, pos[2] * 0.42]}>
      <mesh>
        <boxGeometry args={[0.28, 0.95, 0.28]} />
        <meshStandardMaterial color="#1a1714" />
      </mesh>
      <mesh position={[0, 0.15, 0.18]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={lightColor(state)} emissive={lightColor(state)} emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

export function IntersectionSceneView({
  scene,
  quality,
  selectable = false,
  selectedIds = [],
  onSelectActor,
  playingClip = false,
  highlightId,
  correctOrder,
}: IntersectionSceneViewProps) {
  const [clipT, setClipT] = useState(0);
  const pauseAt = scene.clip ? scene.clip.pauseAtMs / scene.clip.durationMs : 0.45;

  useEffect(() => {
    if (!playingClip) {
      return;
    }
    const started = performance.now();
    const duration = scene.clip?.durationMs ?? 4000;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(pauseAt, (now - started) / duration);
      setClipT(t);
      if (t < pauseAt) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playingClip, pauseAt, scene.clip?.durationMs]);

  return (
    <SceneCanvas quality={quality} className="h-full min-h-[260px] w-full overflow-hidden rounded-3xl">
      <color attach="background" args={[quality === "low" ? "#d7e6f0" : "#9ec9e6"]} />
      <ambientLight intensity={quality === "low" ? 1.1 : 0.7} />
      <directionalLight position={[8, 14, 6]} intensity={1.2} castShadow={quality === "high"} />
      <Roads topology={scene.topology} quality={quality} />
      {scene.lights?.map((light) => (
        <Signal key={light.facing} facing={light.facing} state={light.state} />
      ))}
      {scene.visualSigns.map((sign) => (
        <SignBillboard
          key={`${sign.code}-${sign.approach}`}
          code={sign.code}
          approach={sign.approach}
          jurisdiction={scene.jurisdiction}
        />
      ))}
      {scene.visualActors.map((actor) => {
        const rank = correctOrder?.indexOf(actor.id);
        return (
          <ActorMesh
            key={actor.id}
            actor={actor}
            clipT={playingClip ? clipT : 0.08}
            selected={selectedIds.includes(actor.id)}
            selectable={selectable}
            highlight={highlightId === actor.id}
            onSelect={onSelectActor}
            hand="right"
            orderLabel={rank !== undefined && rank >= 0 ? String(rank + 1) : actor.id}
          />
        );
      })}
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.15} minDistance={8} maxDistance={22} />
    </SceneCanvas>
  );
}
