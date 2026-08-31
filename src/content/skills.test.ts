import { describe, expect, it } from "vitest";
import { isUnlocked, pathNodeStatus, pathStatusLabelKey, skillsFor } from "./skills";

describe("pathNodeStatus", () => {
  it("locks a node that is not unlocked", () => {
    expect(pathNodeStatus(false, 0, 3)).toBe("locked");
    expect(pathNodeStatus(false, 3, 3)).toBe("locked");
  });

  it("marks a fully completed unlocked skill as done", () => {
    expect(pathNodeStatus(true, 3, 3)).toBe("done");
    expect(pathNodeStatus(true, 4, 3)).toBe("done");
  });

  it("keeps unlocked incomplete skills ready", () => {
    expect(pathNodeStatus(true, 0, 3)).toBe("ready");
    expect(pathNodeStatus(true, 2, 3)).toBe("ready");
    expect(pathNodeStatus(true, 0, 0)).toBe("ready");
  });

  it("maps status to existing copy keys", () => {
    expect(pathStatusLabelKey("ready")).toBe("unlocked");
    expect(pathStatusLabelKey("locked")).toBe("locked");
    expect(pathStatusLabelKey("done")).toBe("skillDone");
  });
});

describe("isUnlocked", () => {
  it("opens the first Poland skill with no prerequisites", () => {
    const [first] = skillsFor("PL");
    expect(first).toBeDefined();
    expect(isUnlocked(first!, {})).toBe(true);
  });
});
