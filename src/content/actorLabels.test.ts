import { describe, expect, it } from "vitest";
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
});
