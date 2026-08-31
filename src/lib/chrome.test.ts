import { describe, expect, it } from "vitest";
import { shouldHideAppChrome } from "./chrome";

describe("shouldHideAppChrome", () => {
  it("hides XP, topbar, and tab bar until a jurisdiction is chosen", () => {
    expect(shouldHideAppChrome(false, "/")).toBe(true);
    expect(shouldHideAppChrome(false, "/learn")).toBe(true);
  });

  it("hides chrome on lesson and exam after onboarding", () => {
    expect(shouldHideAppChrome(true, "/lesson/PL-warning-signs-0")).toBe(true);
    expect(shouldHideAppChrome(true, "/exam")).toBe(true);
  });

  it("shows chrome on the home hub after onboarding", () => {
    expect(shouldHideAppChrome(true, "/")).toBe(false);
    expect(shouldHideAppChrome(true, "/learn")).toBe(false);
    expect(shouldHideAppChrome(true, "/settings")).toBe(false);
  });
});
