import { assertNever } from "@/engine/geometry";
import type { JurisdictionId } from "@/engine/types";
import { GERMAN_SIGNS, POLISH_SIGNS } from "./pl";
import { RUSSIAN_SIGNS, UKRAINIAN_SIGNS } from "./ru";
import type { TrafficSign } from "./types";
import { US_SIGNS } from "./us";

export type { TrafficSign } from "./types";
export { meaningFor, nameFor } from "./types";

export function listSigns(jurisdiction: JurisdictionId): TrafficSign[] {
  switch (jurisdiction) {
    case "PL":
      return POLISH_SIGNS;
    case "DE":
      return GERMAN_SIGNS;
    case "US-CA":
      return US_SIGNS;
    case "RU":
      return RUSSIAN_SIGNS;
    case "UA":
      return UKRAINIAN_SIGNS;
    default:
      return assertNever(jurisdiction);
  }
}

export function getSign(jurisdiction: JurisdictionId, code: string): TrafficSign | undefined {
  return listSigns(jurisdiction).find((sign) => sign.code === code);
}

export function getSignById(id: string): TrafficSign | undefined {
  for (const jurisdiction of ["PL", "DE", "US-CA", "RU", "UA"] as const) {
    const found = listSigns(jurisdiction).find((sign) => sign.id === id);
    if (found) {
      return found;
    }
  }
  return undefined;
}
