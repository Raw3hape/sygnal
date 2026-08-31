import { listSigns } from "@/content/signs";
import { getScene } from "@/content/scenes";
import { skillsFor } from "@/content/skills";
import type { JurisdictionId } from "@/engine/types";
import { assertNever } from "@/engine/geometry";

export type LessonItem =
  | {
      id: string;
      type: "sign-meaning";
      signId: string;
      choices: string[];
      correct: number;
    }
  | {
      id: string;
      type: "true-false";
      prompt: { en: string; pl: string; ru: string };
      correct: boolean;
      signId?: string;
    }
  | {
      id: string;
      type: "mcq";
      prompt: { en: string; pl: string; ru: string };
      choices: Array<{ en: string; pl: string; ru: string }>;
      correct: number;
      sceneId?: string;
    }
  | {
      id: string;
      type: "who-goes-first";
      sceneId: string;
    }
  | {
      id: string;
      type: "hazard-tap";
      sceneId: string;
      targetId: string;
    }
  | {
      id: string;
      type: "clip-choice";
      sceneId: string;
      prompt: { en: string; pl: string; ru: string };
      choices: Array<{ en: string; pl: string; ru: string }>;
      correct: number;
    };

export interface Lesson {
  id: string;
  skillId: string;
  jurisdiction: JurisdictionId;
  items: LessonItem[];
}

function shuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  let current = copy.length;
  let state = seed + 1;
  while (current > 0) {
    state = (state * 16807) % 2147483647;
    const index = state % current;
    current -= 1;
    const tmp = copy[current]!;
    copy[current] = copy[index]!;
    copy[index] = tmp;
  }
  return copy;
}

function signLessons(jurisdiction: JurisdictionId, skillId: string): Lesson[] {
  const skill = skillsFor(jurisdiction).find((node) => node.id === skillId);
  const categories = skill?.signCategories ?? [];
  const signs = listSigns(jurisdiction).filter((sign) => categories.includes(sign.category));
  if (signs.length === 0) {
    return [];
  }
  const chunks: Lesson[] = [];
  for (let offset = 0; offset < signs.length; offset += 6) {
    const group = signs.slice(offset, offset + 6);
    const items: LessonItem[] = group.flatMap((sign, index) => {
      const distractors = shuffle(
        signs.filter((other) => other.id !== sign.id),
        offset + index,
      )
        .slice(0, 3)
        .map((other) => other.id);
      const choices = shuffle([sign.id, ...distractors], offset + index + 9);
      const meaning: LessonItem = {
        id: `${sign.id}-meaning`,
        type: "sign-meaning",
        signId: sign.id,
        choices,
        correct: choices.indexOf(sign.id),
      };
      const truthful = (offset + index) % 2 === 0;
      const other = signs[(index + 3) % signs.length] ?? sign;
      const claimed = truthful || other.id === sign.id ? sign.meaning : other.meaning;
      const fact: LessonItem = {
        id: `${sign.id}-tf`,
        type: "true-false",
        signId: sign.id,
        prompt: {
          en: `This sign means: ${claimed.en}`,
          pl: `Ten znak oznacza: ${claimed.pl}`,
          ru: `Этот знак означает: ${claimed.ru}`,
        },
        correct: truthful || other.id === sign.id,
      };
      return [meaning, fact];
    });
    chunks.push({
      id: `${jurisdiction}-${skillId}-${offset}`,
      skillId,
      jurisdiction,
      items: items.slice(0, 12),
    });
  }
  return chunks;
}

function clipItems(sceneId: string): LessonItem[] {
  const scene = getScene(sceneId);
  const hazard = scene.visualActors.find(
    (entry) => entry.kind === "emergency" || entry.kind === "pedestrian" || entry.kind === "tram",
  );
  const clip: LessonItem | null = scene.clip
    ? {
        id: `${sceneId}-clip`,
        type: "clip-choice",
        sceneId,
        prompt:
          sceneId.includes("emergency")
            ? {
                en: "The ambulance has lights on. What do you do?",
                pl: "Karetka ma włączone sygnały. Co robisz?",
                ru: "У скорой включены спецсигналы. Что делаете?",
              }
            : {
                en: "Watch the clip. Who should go first when it pauses?",
                pl: "Obejrzyj klip. Kto jedzie pierwszy w pauzie?",
                ru: "Смотрите клип. Кто едет первым на паузе?",
              },
        choices: sceneId.includes("emergency")
          ? [
              { en: "Keep going — you are on the priority road.", pl: "Jedziesz — jesteś na drodze z pierwszeństwem.", ru: "Едете дальше — вы на главной." },
              { en: "Yield and make room.", pl: "Ustępujesz i zjeżdżasz.", ru: "Уступаете и даёте дорогу." },
              { en: "Speed up through the junction.", pl: "Przyspieszasz przez skrzyżowanie.", ru: "Ускоряетесь через перекрёсток." },
            ]
          : [
              { en: "The vehicle the rules give priority to.", pl: "Pojazd, który ma pierwszeństwo.", ru: "Тот, кому правила дают преимущество." },
              { en: "Whoever is bigger.", pl: "Kto większy.", ru: "Кто больше." },
              { en: "Whoever arrived last.", pl: "Kto przyjechał ostatni.", ru: "Кто подъехал последним." },
            ],
        correct: sceneId.includes("emergency") ? 1 : 0,
      }
    : null;
  const tap: LessonItem | null = hazard
    ? { id: `${sceneId}-hazard`, type: "hazard-tap", sceneId, targetId: hazard.id }
    : null;
  const mcq: LessonItem = {
    id: `${sceneId}-mcq`,
    type: "mcq",
    sceneId,
    prompt: {
      en: "After this situation, who should move first?",
      pl: "Kto powinien ruszyć pierwszy?",
      ru: "Кто должен начать движение первым?",
    },
    choices: [
      { en: "The vehicle with priority.", pl: "Pojazd z pierwszeństwem.", ru: "Транспорт с преимуществом." },
      { en: "Whoever honks first.", pl: "Kto pierwszy zatrąbi.", ru: "Кто первый сигналит." },
      { en: "The largest vehicle.", pl: "Największy pojazd.", ru: "Самый большой автомобиль." },
    ],
    correct: 0,
  };
  const extras: LessonItem[] = [];
  if (clip) {
    extras.push(clip);
  }
  if (tap) {
    extras.push(tap);
  }
  if (!clip) {
    extras.push(mcq);
  }
  return extras;
}

function sceneLessons(jurisdiction: JurisdictionId, skillId: string): Lesson[] {
  const skill = skillsFor(jurisdiction).find((node) => node.id === skillId);
  if (!skill || skill.sceneIds.length === 0) {
    return [];
  }
  const items: LessonItem[] = skill.sceneIds.flatMap((sceneId) => {
    const who: LessonItem = { id: `${sceneId}-who`, type: "who-goes-first", sceneId };
    return [who, ...clipItems(sceneId)];
  });
  return [
    {
      id: `${jurisdiction}-${skillId}-scenes`,
      skillId,
      jurisdiction,
      items,
    },
  ];
}

export function lessonsFor(jurisdiction: JurisdictionId, skillId: string): Lesson[] {
  const fromSigns = signLessons(jurisdiction, skillId);
  const fromScenes = sceneLessons(jurisdiction, skillId);
  return [...fromSigns, ...fromScenes];
}

export function allLessons(jurisdiction: JurisdictionId): Lesson[] {
  return skillsFor(jurisdiction).flatMap((skill) => lessonsFor(jurisdiction, skill.id));
}

export function getLesson(jurisdiction: JurisdictionId, lessonId: string): Lesson | undefined {
  return allLessons(jurisdiction).find((lesson) => lesson.id === lessonId);
}

export function nextLessonAfter(jurisdiction: JurisdictionId, lessonId: string): Lesson | undefined {
  const lessons = allLessons(jurisdiction);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0) {
    return undefined;
  }
  return lessons[index + 1];
}

export function lessonHas3d(lesson: Lesson): boolean {
  return lesson.items.some(
    (item) =>
      item.type === "who-goes-first" ||
      item.type === "hazard-tap" ||
      item.type === "clip-choice" ||
      (item.type === "mcq" && Boolean(item.sceneId)),
  );
}

export function itemKindLabel(type: LessonItem["type"]): string {
  switch (type) {
    case "sign-meaning":
      return "sign";
    case "true-false":
      return "true-false";
    case "mcq":
      return "choice";
    case "who-goes-first":
      return "3d-order";
    case "hazard-tap":
      return "hazard";
    case "clip-choice":
      return "clip";
    default:
      return assertNever(type);
  }
}
