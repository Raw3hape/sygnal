"use client";

import { detectQuality, type QualityTier } from "@/lib/quality";
import { useProgress } from "@/lib/useProgress";

export function useQuality(): QualityTier {
  const focus = useProgress((state) => state.attentionMode) === "focus";
  const override = useProgress((state) => state.qualityOverride);
  return detectQuality(focus, override);
}
