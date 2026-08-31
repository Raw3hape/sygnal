import { listSigns } from "@/content/signs";
import { scenesFor } from "@/content/scenes";
import type { JurisdictionId } from "@/engine/types";

export interface ExamQuestion {
  id: string;
  kind: "yes-no" | "abc";
  points: 1 | 2 | 3;
  prompt: { en: string; pl: string; ru: string };
  choices?: Array<{ en: string; pl: string; ru: string }>;
  correct: boolean | number;
  signId?: string;
  sceneId?: string;
}

const YES_NO_POINTS: Array<1 | 2 | 3> = [
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1,
];
const ABC_POINTS: Array<1 | 2 | 3> = [3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1];

export function buildExam(jurisdiction: JurisdictionId): ExamQuestion[] {
  const signs = listSigns(jurisdiction);
  const scenes = scenesFor(jurisdiction);
  const yesNo: ExamQuestion[] = YES_NO_POINTS.map((points, index) => {
    const sign = signs[index % signs.length]!;
    const other = signs[(index + 11) % signs.length]!;
    const truthful = index % 3 !== 1 || sign.id === other.id;
    const meaning = truthful ? sign.meaning : other.meaning;
    return {
      id: `${jurisdiction}-yn-${index}`,
      kind: "yes-no",
      points,
      signId: sign.id,
      prompt: {
        en: `Does this sign mean: ${meaning.en.replace(/\.$/, "")}?`,
        pl: `Czy ten znak oznacza: ${meaning.pl.replace(/\.$/, "")}?`,
        ru: `Этот знак означает: ${meaning.ru.replace(/\.$/, "")}?`,
      },
      correct: truthful,
    };
  });
  const abc: ExamQuestion[] = ABC_POINTS.map((points, index) => {
    const scene = scenes[index % Math.max(scenes.length, 1)];
    if (scene) {
      return {
        id: `${jurisdiction}-abc-scene-${index}`,
        kind: "abc",
        points,
        sceneId: scene.id,
        prompt: {
          en: "Who has priority in this situation?",
          pl: "Kto ma pierwszeństwo w tej sytuacji?",
          ru: "Кто имеет преимущество в этой ситуации?",
        },
        choices: [
          { en: "Follow the signs, lights and yield-to-the-right rules shown.", pl: "Zgodnie ze znakami, światłami i zasadą prawej ręki.", ru: "По знакам, сигналам и помехе справа." },
          { en: "The faster vehicle.", pl: "Szybszy pojazd.", ru: "Кто едет быстрее." },
          { en: "The vehicle on the left.", pl: "Pojazd z lewej.", ru: "Транспорт слева." },
        ],
        correct: 0,
      };
    }
    const sign = signs[(index + 3) % signs.length]!;
    return {
      id: `${jurisdiction}-abc-sign-${index}`,
      kind: "abc",
      points,
      signId: sign.id,
      prompt: {
        en: "What should you do?",
        pl: "Co powinieneś zrobić?",
        ru: "Что нужно сделать?",
      },
      choices: [
        { en: sign.meaning.en, pl: sign.meaning.pl, ru: sign.meaning.ru },
        { en: "Ignore the sign at night.", pl: "W nocy znak nie obowiązuje.", ru: "Ночью знак можно не учитывать." },
        { en: "Speed up.", pl: "Przyspiesz.", ru: "Прибавить скорость." },
      ],
      correct: 0,
    };
  });
  return [...yesNo, ...abc];
}

export function examPassMark(): { max: number; pass: number } {
  return { max: 74, pass: 68 };
}

export function scoreExam(answers: Array<{ points: 1 | 2 | 3; correct: boolean }>): number {
  return answers.reduce((sum, answer) => sum + (answer.correct ? answer.points : 0), 0);
}
