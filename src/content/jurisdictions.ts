import {
  type Jurisdiction,
  type JurisdictionId,
} from "@/engine/types";
import { assertNever } from "@/engine/geometry";

export const JURISDICTIONS: Jurisdiction[] = [
  {
    id: "PL",
    convention: "vienna",
    trafficHand: "right",
    defaultRightOfWay: "yield-to-right",
    tramPriority: "uncontrolled-over-vehicles",
    speedUnit: "metric",
    urbanDefaultSpeed: 50,
    nameKey: "jurisdiction.pl",
  },
  {
    id: "DE",
    convention: "vienna",
    trafficHand: "right",
    defaultRightOfWay: "yield-to-right",
    tramPriority: "uncontrolled-over-vehicles",
    speedUnit: "metric",
    urbanDefaultSpeed: 50,
    nameKey: "jurisdiction.de",
  },
  {
    id: "US-CA",
    convention: "mutcd",
    trafficHand: "right",
    defaultRightOfWay: "four-way-stop",
    tramPriority: "as-vehicle",
    speedUnit: "imperial",
    urbanDefaultSpeed: 25,
    nameKey: "jurisdiction.usCa",
  },
  {
    id: "RU",
    convention: "vienna",
    trafficHand: "right",
    defaultRightOfWay: "yield-to-right",
    tramPriority: "uncontrolled-over-vehicles",
    speedUnit: "metric",
    urbanDefaultSpeed: 60,
    nameKey: "jurisdiction.ru",
  },
  {
    id: "UA",
    convention: "vienna",
    trafficHand: "right",
    defaultRightOfWay: "yield-to-right",
    tramPriority: "uncontrolled-over-vehicles",
    speedUnit: "metric",
    urbanDefaultSpeed: 50,
    nameKey: "jurisdiction.ua",
  },
];

const BY_ID: Record<JurisdictionId, Jurisdiction> = {
  PL: JURISDICTIONS[0],
  DE: JURISDICTIONS[1],
  "US-CA": JURISDICTIONS[2],
  RU: JURISDICTIONS[3],
  UA: JURISDICTIONS[4],
};

export function getJurisdiction(id: JurisdictionId): Jurisdiction {
  switch (id) {
    case "PL":
    case "DE":
    case "US-CA":
    case "RU":
    case "UA":
      return BY_ID[id];
    default:
      return assertNever(id);
  }
}
