import { resolveArtwork } from "./artwork";
import { POLISH_SIGNS } from "./pl";
import type { TrafficSign } from "./types";

function withPackArtwork(sign: TrafficSign): TrafficSign {
  const art = resolveArtwork(sign.jurisdiction, sign.code);
  return {
    ...sign,
    src: art.src,
    license: art.license,
    artwork: art.kind,
  };
}

function relabel(
  jurisdiction: TrafficSign["jurisdiction"],
  source: TrafficSign[],
): TrafficSign[] {
  return source.map((sign) => ({
    ...sign,
    id: `${jurisdiction}-${sign.code}`,
    jurisdiction,
    src: undefined,
    artwork: "fallback" as const,
  }));
}

/** RU uses Vienna/GOST shapes; codes stay as the shared Vienna-style set for lessons. */
export const RUSSIAN_SIGNS: TrafficSign[] = relabel("RU", POLISH_SIGNS)
  .map((sign) => {
    if (sign.role === "priority-road") {
      return {
        ...sign,
        code: "2.1",
        name: { en: "Main road", pl: "Droga główna", ru: "Главная дорога" },
      };
    }
    if (sign.role === "yield") {
      return {
        ...sign,
        code: "2.4",
        name: { en: "Give way", pl: "Ustąp", ru: "Уступите дорогу" },
      };
    }
    if (sign.role === "stop") {
      return {
        ...sign,
        code: "2.5",
        name: { en: "Stop", pl: "Stop", ru: "Движение без остановки запрещено" },
      };
    }
    return sign;
  })
  .map(withPackArtwork);

export const UKRAINIAN_SIGNS: TrafficSign[] = relabel("UA", POLISH_SIGNS).map(withPackArtwork);
