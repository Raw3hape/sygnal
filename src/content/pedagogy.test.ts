import { describe, expect, it } from "vitest";
import { buildExam } from "@/content/exam";
import { allLessons } from "@/content/lessons";
import { pedagogyForExam, pedagogyForItem } from "@/content/pedagogy";
import { JURISDICTION_IDS } from "@/engine/types";

describe("pedagogy", () => {
  it("gives every lesson item in every jurisdiction a hint, meaning, how, why-right and why-wrong", () => {
    for (const jurisdiction of JURISDICTION_IDS) {
      for (const lesson of allLessons(jurisdiction)) {
        for (const item of lesson.items) {
          const teach = pedagogyForItem(item, jurisdiction);
          expect(teach.hint.en.length).toBeGreaterThan(12);
          expect(teach.hint.pl.length).toBeGreaterThan(12);
          expect(teach.hint.ru.length).toBeGreaterThan(12);
          expect(teach.meaning.en.length).toBeGreaterThan(8);
          expect(teach.how.en.length).toBeGreaterThan(12);
          expect(teach.whyCorrect.en.length).toBeGreaterThan(12);
          expect(teach.whyWrong.length).toBeGreaterThan(0);
          expect(teach.whyWrong[0]?.en.length).toBeGreaterThan(12);
        }
      }
    }
  });

  it("covers every exam question in every jurisdiction", () => {
    for (const jurisdiction of JURISDICTION_IDS) {
      for (const question of buildExam(jurisdiction)) {
        const teach = pedagogyForExam(question, jurisdiction);
        expect(teach.hint.en.length).toBeGreaterThan(12);
        expect(teach.whyCorrect.en.length).toBeGreaterThan(12);
        expect(teach.how.pl.length).toBeGreaterThan(8);
      }
    }
  });

  it("mixes true and false sign statements in warning lessons", () => {
    const warning = allLessons("PL").find((lesson) => lesson.id === "PL-warning-signs-0");
    const facts = warning?.items.filter((item) => item.type === "true-false") ?? [];
    expect(facts.some((item) => item.type === "true-false" && item.correct === true)).toBe(true);
    expect(facts.some((item) => item.type === "true-false" && item.correct === false)).toBe(true);
  });
});
