"use client";

export type QualityTier = "low" | "mid" | "high";

export type QualityPreference = QualityTier | "auto";

export function detectQuality(
  focusMode: boolean,
  override: QualityPreference = "auto",
): QualityTier {
  if (focusMode) {
    return "low";
  }
  if (override !== "auto") {
    return override;
  }
  if (typeof navigator === "undefined") {
    return "mid";
  }
  const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  if (saveData) {
    return "low";
  }
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory <= 4) {
    return "low";
  }
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    return "mid";
  }
  return "high";
}

export function dprFor(tier: QualityTier): [number, number] {
  switch (tier) {
    case "low":
      return [1, 1];
    case "mid":
      return [1, 1.5];
    case "high":
      return [1, 2];
    default: {
      const exhaustive: never = tier;
      return exhaustive;
    }
  }
}
