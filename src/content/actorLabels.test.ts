import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import { ACTOR_COPY_IDS, isActorCopyId } from "./actorLabels";
import { SCENES } from "./scenes";

describe("actor copy ids", () => {
  it("covers every 3D scene actor id", () => {
    const known = new Set<string>(ACTOR_COPY_IDS);
    const missing = SCENES.flatMap((scene) =>
      scene.visualActors.filter((actor) => !known.has(actor.id)).map((actor) => `${scene.id}:${actor.id}`),
    );
    expect(missing).toEqual([]);
  });

  it("rejects unknown ids", () => {
    expect(isActorCopyId("eastbound")).toBe(true);
    expect(isActorCopyId("mystery-van")).toBe(false);
  });

  it("uses human overlay copy instead of debugger approach ids", () => {
    const actors = en.actors;
    expect(actors.eastbound.toLowerCase()).not.toBe("eastbound");
    expect(actors.southbound.toLowerCase()).not.toBe("southbound");
    expect(actors.eastbound.toLowerCase()).toMatch(/this car|that car|that bike|this bike/);
    expect(actors.southbound.toLowerCase()).toMatch(/this car|that car|that bike|this bike/);
  });
});
