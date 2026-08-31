import type { JurisdictionId } from "@/engine/types";
import manifest from "./artwork-manifest.json";

export type ArtworkKind = "official" | "fallback";

interface ManifestItem {
  src?: string | null;
  license?: string;
  standard?: string;
  borrowed?: boolean;
  borrowedFrom?: string;
  gap?: boolean;
}

const ITEMS = manifest.items as Record<string, ManifestItem>;

export function artworkKey(jurisdiction: JurisdictionId, code: string): string {
  return `${jurisdiction}:${code}`;
}

export function resolveArtwork(
  jurisdiction: JurisdictionId,
  code: string,
): {
  src?: string;
  license: string;
  kind: ArtworkKind;
} {
  const item = ITEMS[artworkKey(jurisdiction, code)];
  if (item?.src) {
    const borrowed = item.borrowed
      ? ` Vienna-family plate reused from ${item.borrowedFrom} because a jurisdiction-specific Commons file was not found.`
      : "";
    return {
      src: item.src,
      license: `${item.license ?? "open"}. ${item.standard ?? ""}${borrowed}`.trim(),
      kind: "official",
    };
  }
  return {
    license:
      "Official-style geometric fallback matching Vienna Convention / MUTCD plate shapes. No Commons SVG sourced for this catalog id.",
    kind: "fallback",
  };
}

export function artworkStats(): { official: number; fallback: number } {
  let official = 0;
  let fallback = 0;
  for (const item of Object.values(ITEMS)) {
    if (item.src) {
      official += 1;
    } else {
      fallback += 1;
    }
  }
  return { official, fallback };
}
