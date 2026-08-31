import { describe, expect, it } from "vitest";
import { shouldHideTabbar, shouldHideTopbar } from "./chrome";

describe("app chrome visibility", () => {
  it("hides XP, topbar, and tab bar until a jurisdiction is chosen", () => {
    expect(shouldHideTopbar(false)).toBe(true);
    expect(shouldHideTabbar(false, "/")).toBe(true);
    expect(shouldHideTabbar(false, "/learn")).toBe(true);
  });

  it("hides the tab bar on lesson and exam after onboarding", () => {
    expect(shouldHideTabbar(true, "/lesson/PL-warning-signs-0")).toBe(true);
    expect(shouldHideTabbar(true, "/exam")).toBe(true);
    expect(shouldHideTopbar(true)).toBe(false);
  });

  it("shows chrome on the home hub after onboarding", () => {
    expect(shouldHideTopbar(true)).toBe(false);
    expect(shouldHideTabbar(true, "/")).toBe(false);
    expect(shouldHideTabbar(true, "/learn")).toBe(false);
    expect(shouldHideTabbar(true, "/settings")).toBe(false);
  });
});
