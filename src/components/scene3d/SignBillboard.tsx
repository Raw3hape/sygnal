"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { VisualScene } from "@/content/scenes";
import { getSign } from "@/content/signs";
import type { Approach } from "@/engine/types";

const APPROACH_POS: Record<Approach, [number, number, number]> = {
  south: [0, 0.35, 5.2],
  north: [0, 0.35, -5.2],
  east: [5.2, 0.35, 0],
  west: [-5.2, 0.35, 0],
};

export function SignBillboard({
  code,
  approach,
  jurisdiction,
  radius = 1.6,
  height = 1.4,
  position,
}: {
  code: string;
  approach: Approach;
  jurisdiction: VisualScene["jurisdiction"];
  radius?: number;
  height?: number;
  position?: [number, number, number];
}) {
  const sign = getSign(jurisdiction, code);
  const texture = useMemo(() => {
    if (!sign) {
      return null;
    }
    const image = new Image();
    const map = new THREE.Texture(image);
    image.onload = () => {
      map.needsUpdate = true;
      map.colorSpace = THREE.SRGBColorSpace;
    };
    image.src = sign.src ?? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sign.svg)}`;
    return map;
  }, [sign]);
  const pos = APPROACH_POS[approach];
  const offset: [number, number, number] = position ?? [
    pos[0] + (approach === "east" || approach === "west" ? 0 : radius),
    height,
    pos[2] + (approach === "north" || approach === "south" ? 0 : radius),
  ];
  return (
    <mesh position={offset}>
      <planeGeometry args={[1.45, 1.45]} />
      <meshStandardMaterial map={texture ?? undefined} transparent color={texture ? "#ffffff" : "#f5c400"} />
    </mesh>
  );
}

export { APPROACH_POS };
