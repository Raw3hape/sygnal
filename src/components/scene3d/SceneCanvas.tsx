"use client";

import { Canvas } from "@react-three/fiber";
import { type ReactNode, useCallback } from "react";
import { WebGLRenderer } from "three";
import { dprFor, type QualityTier } from "@/lib/quality";

interface SceneCanvasProps {
  children: ReactNode;
  quality: QualityTier;
  className?: string;
  cameraPosition?: [number, number, number];
}

type GlProps = { canvas?: HTMLCanvasElement };

async function createRenderer(props: GlProps, quality: QualityTier): Promise<WebGLRenderer> {
  const canvas = props.canvas;
  if (typeof navigator !== "undefined" && "gpu" in navigator) {
    try {
      const { WebGPURenderer } = await import("three/webgpu");
      const renderer = new WebGPURenderer({
        canvas,
        antialias: quality !== "low",
        alpha: true,
      });
      await renderer.init();
      return renderer as unknown as WebGLRenderer;
    } catch {
      /* WebGL fallback below */
    }
  }
  return new WebGLRenderer({
    canvas,
    antialias: quality !== "low",
    alpha: true,
    powerPreference: "high-performance",
  });
}

export function SceneCanvas({
  children,
  quality,
  className,
  cameraPosition = [9, 11, 9],
}: SceneCanvasProps) {
  const dpr = dprFor(quality);
  const shadows = quality === "high";
  const gl = useCallback(
    (props: GlProps) => createRenderer(props, quality),
    [quality],
  );

  return (
    <div className={className}>
      <Canvas
        dpr={dpr}
        shadows={shadows}
        camera={{ position: cameraPosition, fov: 42 }}
        gl={gl as never}
        frameloop="always"
      >
        {children}
      </Canvas>
    </div>
  );
}
