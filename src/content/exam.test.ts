import { describe, expect, it } from "vitest";
import { buildExam, examPassMark, scoreExam } from "@/content/exam";

describe("WORD-style exam", () => {
  it("builds 32 questions worth 74 points for Poland", () => {
    const exam = buildExam("PL");
    expect(exam).toHaveLength(32);
    const max = exam.reduce((sum, question) => sum + question.points, 0);
    expect(max).toBe(examPassMark().max);
    expect(examPassMark().pass).toBe(68);
  });

  it("includes both true and false yes-no items", () => {
    const yesNo = buildExam("PL").filter((question) => question.kind === "yes-no");
    expect(yesNo.some((question) => question.correct === true)).toBe(true);
    expect(yesNo.some((question) => question.correct === false)).toBe(true);
  });

  it("scores only awarded points", () => {
    expect(scoreExam([{ points: 3, correct: true }, { points: 2, correct: false }])).toBe(3);
  });
});
