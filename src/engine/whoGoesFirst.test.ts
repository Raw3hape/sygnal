import { describe, expect, it } from "vitest";
import type { Actor, IntersectionScene } from "./types";
import { whoGoesFirst } from "./whoGoesFirst";

function car(
  id: string,
  approach: Actor["approach"],
  intent: Actor["intent"] = "straight",
  extra: Partial<Actor> = {},
): Actor {
  return { id, kind: "car", approach, intent, ...extra };
}

function scene(
  partial: Pick<IntersectionScene, "id" | "actors"> &
    Partial<Omit<IntersectionScene, "id" | "actors">>,
): IntersectionScene {
  return {
    topology: "cross",
    signs: [],
    ...partial,
  };
}

describe("whoGoesFirst PL / Vienna yield-to-right", () => {
  it("lets the vehicle on the right go first at an uncontrolled cross", () => {
    const result = whoGoesFirst(
      scene({
        id: "pl-uncontrolled-right",
        actors: [car("southbound", "south"), car("eastbound", "east")],
      }),
      "PL",
    );
    expect(result.order[0]).toBe("eastbound");
    expect(result.order[1]).toBe("southbound");
  });

  it("gives priority-road traffic precedence over a side road with yield", () => {
    const result = whoGoesFirst(
      scene({
        id: "pl-priority-road",
        signs: [
          { facing: "north", role: "priority-road" },
          { facing: "south", role: "priority-road" },
          { facing: "east", role: "yield" },
          { facing: "west", role: "yield" },
        ],
        actors: [car("priority", "north"), car("side", "east")],
      }),
      "PL",
    );
    expect(result.order[0]).toBe("priority");
    expect(result.order[1]).toBe("side");
  });

  it("makes a stop-controlled approach wait for the free road", () => {
    const result = whoGoesFirst(
      scene({
        id: "pl-stop-vs-free",
        signs: [{ facing: "east", role: "stop" }],
        actors: [car("free", "south"), car("stopped", "east")],
      }),
      "PL",
    );
    expect(result.order[0]).toBe("free");
    expect(result.order[1]).toBe("stopped");
  });

  it("makes a left-turning vehicle yield to oncoming straight traffic", () => {
    const result = whoGoesFirst(
      scene({
        id: "pl-left-vs-oncoming",
        actors: [car("straight", "south", "straight"), car("lefty", "north", "left")],
      }),
      "PL",
    );
    expect(result.order[0]).toBe("straight");
    expect(result.order[1]).toBe("lefty");
  });

  it("lets green-light traffic go before red-light traffic", () => {
    const result = whoGoesFirst(
      scene({
        id: "pl-traffic-light",
        lights: [
          { facing: "south", state: "green" },
          { facing: "north", state: "green" },
          { facing: "east", state: "red" },
          { facing: "west", state: "red" },
        ],
        actors: [car("green", "south"), car("red", "east")],
      }),
      "PL",
    );
    expect(result.order[0]).toBe("green");
    expect(result.order[1]).toBe("red");
  });

  it("gives circulating traffic priority over a yielding roundabout entry", () => {
    const result = whoGoesFirst(
      scene({
        id: "pl-roundabout",
        topology: "roundabout",
        signs: [{ facing: "south", role: "yield" }],
        actors: [
          car("inside", "west", "straight", { alreadyInIntersection: true }),
          car("entering", "south"),
        ],
      }),
      "PL",
    );
    expect(result.order[0]).toBe("inside");
    expect(result.order[1]).toBe("entering");
  });

  it("gives a tram priority over a car even when the car is on the tram's right", () => {
    const result = whoGoesFirst(
      scene({
        id: "pl-tram",
        actors: [
          { id: "tram", kind: "tram", approach: "west", intent: "straight" },
          car("car", "south"),
        ],
      }),
      "PL",
    );
    expect(result.order[0]).toBe("tram");
    expect(result.order[1]).toBe("car");
  });

  it("lets a pedestrian on the destination crosswalk go before a turning car", () => {
    const result = whoGoesFirst(
      scene({
        id: "pl-pedestrian",
        actors: [
          car("turner", "south", "right"),
          {
            id: "walker",
            kind: "pedestrian",
            approach: "east",
            intent: "straight",
          },
        ],
      }),
      "PL",
    );
    expect(result.order[0]).toBe("walker");
    expect(result.order[1]).toBe("turner");
  });

  it("lets an emergency vehicle with lights go first", () => {
    const result = whoGoesFirst(
      scene({
        id: "pl-emergency",
        signs: [
          { facing: "north", role: "priority-road" },
          { facing: "south", role: "priority-road" },
          { facing: "east", role: "yield" },
        ],
        actors: [
          car("priority", "north"),
          {
            id: "ambulance",
            kind: "emergency",
            approach: "east",
            intent: "straight",
            emergencyLights: true,
          },
        ],
      }),
      "PL",
    );
    expect(result.order[0]).toBe("ambulance");
    expect(result.order[1]).toBe("priority");
  });

  it("does not depend on UI locale — only on jurisdiction", () => {
    const s = scene({
      id: "locale-independence",
      actors: [car("southbound", "south"), car("eastbound", "east")],
    });
    expect(whoGoesFirst(s, "PL").order).toEqual(whoGoesFirst(s, "PL").order);
    expect(whoGoesFirst(s, "RU").order[0]).toBe("eastbound");
    expect(whoGoesFirst(s, "UA").order[0]).toBe("eastbound");
  });
});

describe("whoGoesFirst US-CA MUTCD", () => {
  it("at a four-way stop lets the first arrival go first", () => {
    const result = whoGoesFirst(
      scene({
        id: "us-four-way-arrival",
        fourWayStop: true,
        signs: [
          { facing: "north", role: "stop" },
          { facing: "south", role: "stop" },
          { facing: "east", role: "stop" },
          { facing: "west", role: "stop" },
        ],
        actors: [
          car("first", "south", "straight", { arrivedAtMs: 1000 }),
          car("second", "east", "straight", { arrivedAtMs: 2500 }),
        ],
      }),
      "US-CA",
    );
    expect(result.order[0]).toBe("first");
    expect(result.order[1]).toBe("second");
  });

  it("at a four-way stop with same arrival time yields to the right", () => {
    const result = whoGoesFirst(
      scene({
        id: "us-four-way-right",
        fourWayStop: true,
        signs: [
          { facing: "north", role: "stop" },
          { facing: "south", role: "stop" },
          { facing: "east", role: "stop" },
          { facing: "west", role: "stop" },
        ],
        actors: [
          car("southbound", "south", "straight", { arrivedAtMs: 1000 }),
          car("eastbound", "east", "straight", { arrivedAtMs: 1000 }),
        ],
      }),
      "US-CA",
    );
    expect(result.order[0]).toBe("eastbound");
    expect(result.order[1]).toBe("southbound");
  });

  it("treats a US streetcar as a vehicle, so it yields to the car on its right", () => {
    const result = whoGoesFirst(
      scene({
        id: "us-tram-as-vehicle",
        actors: [
          { id: "tram", kind: "tram", approach: "west", intent: "straight" },
          car("car", "south"),
        ],
      }),
      "US-CA",
    );
    expect(result.order[0]).toBe("car");
    expect(result.order[1]).toBe("tram");
  });
});
