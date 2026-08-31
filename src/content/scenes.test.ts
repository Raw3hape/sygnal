import { describe, expect, it } from "vitest";
import { SCENES, scriptedClipCount } from "@/content/scenes";

describe("3D scenes", () => {
  it("has unique ids and at least ten scripted clips", () => {
    const ids = SCENES.map((scene) => scene.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(scriptedClipCount()).toBeGreaterThanOrEqual(10);
  });

  it("keeps US, RU and UA packs as separate scene sets", () => {
    expect(SCENES.some((scene) => scene.jurisdiction === "US-CA" && scene.fourWayStop)).toBe(true);
    expect(SCENES.some((scene) => scene.jurisdiction === "RU" && scene.visualActors.some((actor) => actor.kind === "tram"))).toBe(true);
    expect(SCENES.some((scene) => scene.jurisdiction === "UA" && scene.id.startsWith("ua-"))).toBe(true);
  });
});
