import { getScene } from "@/content/scenes";
import { whoGoesFirst } from "@/engine/whoGoesFirst";
import type { JurisdictionId } from "@/engine/types";
import type { LessonItem } from "./lessons";
import { assertNever } from "@/engine/geometry";

export interface GradeResult {
  correct: boolean;
  expected: unknown;
}

function sameOrder(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function hasLessonAnswer(item: LessonItem, answer: unknown): boolean {
  switch (item.type) {
    case "sign-meaning":
    case "mcq":
    case "clip-choice":
      return typeof answer === "number";
    case "true-false":
      return typeof answer === "boolean";
    case "hazard-tap":
      return typeof answer === "string" && answer.length > 0;
    case "who-goes-first":
      return Array.isArray(answer) && answer.length > 0;
    default:
      return assertNever(item);
  }
}

export function gradeItem(
  item: LessonItem,
  answer: unknown,
  jurisdiction: JurisdictionId,
): GradeResult {
  switch (item.type) {
    case "sign-meaning":
    case "mcq":
    case "clip-choice":
      return { correct: answer === item.correct, expected: item.correct };
    case "true-false":
      return { correct: answer === item.correct, expected: item.correct };
    case "hazard-tap":
      return { correct: answer === item.targetId, expected: item.targetId };
    case "who-goes-first": {
      const scene = getScene(item.sceneId);
      const expected = whoGoesFirst(scene, jurisdiction).order;
      return {
        correct: Array.isArray(answer) && sameOrder(answer, expected),
        expected,
      };
    }
    default:
      return assertNever(item);
  }
}
