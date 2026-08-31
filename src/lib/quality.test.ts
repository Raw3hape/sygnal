import { describe, expect, it } from "vitest";
import { detectQuality, dprFor } from "@/lib/quality";

describe("quality tiers", () => {
  it("forces low quality in Focus mode even when the user picked high", () => {
    expect(detectQuality(true, "high")).toBe("low");
  });

  it("honours an explicit mid override outside Focus", () => {
    expect(detectQuality(false, "mid")).toBe("mid");
  });

  it("caps device pixel ratio by tier", () => {
    expect(dprFor("low")[1]).toBe(1);
    expect(dprFor("mid")[1]).toBe(1.5);
    expect(dprFor("high")[1]).toBe(2);
  });
});
