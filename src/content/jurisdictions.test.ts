import { describe, expect, it } from "vitest";
import { getJurisdiction, JURISDICTIONS } from "@/content/jurisdictions";
import { LOCALES } from "@/engine/types";

describe("jurisdiction packs", () => {
  it("keeps locale independent from driving rules", () => {
    expect(LOCALES).toEqual(["en", "pl", "ru"]);
    expect(getJurisdiction("PL").id).toBe("PL");
    expect(JURISDICTIONS.every((j) => j.trafficHand === "right")).toBe(true);
  });

  it("models Poland as Vienna with yield-to-right and tram priority", () => {
    const pl = getJurisdiction("PL");
    expect(pl.convention).toBe("vienna");
    expect(pl.defaultRightOfWay).toBe("yield-to-right");
    expect(pl.tramPriority).toBe("uncontrolled-over-vehicles");
    expect(pl.speedUnit).toBe("metric");
    expect(pl.urbanDefaultSpeed).toBe(50);
  });

  it("models California as MUTCD with four-way stop default and no tram privilege", () => {
    const us = getJurisdiction("US-CA");
    expect(us.convention).toBe("mutcd");
    expect(us.defaultRightOfWay).toBe("four-way-stop");
    expect(us.tramPriority).toBe("as-vehicle");
    expect(us.speedUnit).toBe("imperial");
    expect(us.urbanDefaultSpeed).toBe(25);
  });

  it("keeps RU and UA as separate Vienna packs, not a single CIS blob", () => {
    const ru = getJurisdiction("RU");
    const ua = getJurisdiction("UA");
    expect(ru.id).not.toBe(ua.id);
    expect(ru.convention).toBe("vienna");
    expect(ua.convention).toBe("vienna");
    expect(ru.tramPriority).toBe("uncontrolled-over-vehicles");
    expect(ua.tramPriority).toBe("uncontrolled-over-vehicles");
  });
});
