import type { AppLocale, JurisdictionId, SignRole } from "@/engine/types";

export const SIGN_CATEGORIES = [
  "warning",
  "prohibitory",
  "mandatory",
  "priority",
  "information",
] as const;
export type SignCategory = (typeof SIGN_CATEGORIES)[number];

export const SIGN_SHAPES = [
  "warning-triangle",
  "yield-inverted-triangle",
  "stop-octagon",
  "prohibitory-circle",
  "mandatory-circle",
  "priority-diamond",
  "info-rectangle",
  "mutcd-diamond",
  "mutcd-yield",
  "mutcd-stop",
  "mutcd-speed-rect",
  "mutcd-do-not-enter",
] as const;
export type SignShape = (typeof SIGN_SHAPES)[number];

export interface LocalizedName {
  en: string;
  pl: string;
  ru: string;
}

export interface TrafficSign {
  id: string;
  code: string;
  jurisdiction: JurisdictionId;
  category: SignCategory;
  shape: SignShape;
  role: SignRole | "none";
  name: LocalizedName;
  meaning: LocalizedName;
  svg: string;
  license: string;
  roadText?: string;
  src?: string;
  artwork: "official" | "fallback";
}

export function pickLocalized(value: LocalizedName, locale: AppLocale): string {
  switch (locale) {
    case "en":
      return value.en;
    case "pl":
      return value.pl;
    case "ru":
      return value.ru;
    default: {
      const exhaustive: never = locale;
      return exhaustive;
    }
  }
}

export function nameFor(sign: TrafficSign, locale: AppLocale): string {
  return pickLocalized(sign.name, locale);
}

export function meaningFor(sign: TrafficSign, locale: AppLocale): string {
  return pickLocalized(sign.meaning, locale);
}
