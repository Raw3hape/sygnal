import { describe, expect, it } from "vitest";
import { listSigns } from "@/content/signs";

describe("sign catalogs", () => {
  it("includes at least 80 Polish signs with trilingual names", () => {
    const pl = listSigns("PL");
    expect(pl.length).toBeGreaterThanOrEqual(80);
    for (const sign of pl) {
      expect(sign.code.length).toBeGreaterThan(0);
      expect(sign.svg.includes("<svg")).toBe(true);
      expect(sign.name.en.length).toBeGreaterThan(0);
      expect(sign.name.pl.length).toBeGreaterThan(0);
      expect(sign.name.ru.length).toBeGreaterThan(0);
      expect(sign.license).toBeTruthy();
      expect(sign.artwork === "official" || sign.artwork === "fallback").toBe(true);
      if (sign.src) {
        expect(sign.src.startsWith("/signs/")).toBe(true);
        expect(sign.artwork).toBe("official");
      }
    }
  });

  it("uses MUTCD diamond warnings for the US pack and Vienna triangles for PL", () => {
    const usYield = listSigns("US-CA").find((s) => s.role === "yield");
    const plYield = listSigns("PL").find((s) => s.role === "yield");
    expect(usYield?.shape).toBe("mutcd-yield");
    expect(plYield?.shape).toBe("yield-inverted-triangle");
    const usWarning = listSigns("US-CA").find((s) => s.category === "warning");
    const plWarning = listSigns("PL").find((s) => s.category === "warning");
    expect(usWarning?.shape).toBe("mutcd-diamond");
    expect(plWarning?.shape).toBe("warning-triangle");
  });

  it("uses MUTCD Do Not Enter, not a Vienna disc, for R5-1", () => {
    const sign = listSigns("US-CA").find((item) => item.code === "R5-1");
    expect(sign?.shape).toBe("mutcd-do-not-enter");
  });

  it("keeps STOP wording on US signs even though names are translated", () => {
    const stop = listSigns("US-CA").find((s) => s.role === "stop");
    expect(stop?.roadText).toBe("STOP");
    expect(stop?.name.ru).toMatch(/стоп/i);
  });

  it("uses official Commons artwork for core Polish plates including yield and priority", () => {
    const pl = listSigns("PL");
    const yieldSign = pl.find((sign) => sign.role === "yield");
    const priority = pl.find((sign) => sign.role === "priority-road");
    expect(yieldSign?.artwork).toBe("official");
    expect(yieldSign?.src).toBe("/signs/PL/A-7.svg");
    expect(priority?.artwork).toBe("official");
    expect(priority?.src).toBe("/signs/PL/D-1.svg");
    const official = pl.filter((sign) => sign.artwork === "official");
    expect(official.length).toBeGreaterThan(70);
  });

  it("uses MUTCD public-domain STOP and YIELD plates for California", () => {
    const stop = listSigns("US-CA").find((sign) => sign.role === "stop");
    const yieldSign = listSigns("US-CA").find((sign) => sign.role === "yield");
    expect(stop?.artwork).toBe("official");
    expect(yieldSign?.artwork).toBe("official");
  });

  it("labels Polish A-1 as a right curve to match the official plate", () => {
    const a1 = listSigns("PL").find((sign) => sign.code === "A-1");
    expect(a1?.name.en).toMatch(/right/i);
    const deA1 = listSigns("DE").find((sign) => sign.code === "A-1");
    expect(deA1?.name.en).toMatch(/left/i);
    const ruA1 = listSigns("RU").find((sign) => sign.code === "A-1");
    expect(ruA1?.name.en).toMatch(/right/i);
  });
});
