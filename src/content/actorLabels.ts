export const ACTOR_COPY_IDS = [
  "southbound",
  "eastbound",
  "westbound",
  "priority",
  "side",
  "free",
  "stopped",
  "straight",
  "lefty",
  "green",
  "red",
  "inside",
  "entering",
  "tram",
  "car",
  "turner",
  "walker",
  "ambulance",
  "first",
  "second",
  "through",
  "yielding",
] as const;

export type ActorCopyId = (typeof ACTOR_COPY_IDS)[number];

const ACTOR_COPY_SET = new Set<string>(ACTOR_COPY_IDS);

export function isActorCopyId(id: string): id is ActorCopyId {
  return ACTOR_COPY_SET.has(id);
}

export function actorCopyKey(id: ActorCopyId): `actors.${ActorCopyId}` {
  return `actors.${id}`;
}
