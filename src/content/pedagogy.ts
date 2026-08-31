import { getScene } from "@/content/scenes";
import type { ExamQuestion } from "@/content/exam";
import type { LessonItem } from "@/content/lessons";
import { getSignById, type TrafficSign } from "@/content/signs";
import type { LocalizedName } from "@/content/signs/types";
import { assertNever } from "@/engine/geometry";
import type { JurisdictionId } from "@/engine/types";
import { whoGoesFirst } from "@/engine/whoGoesFirst";
import { L } from "@/lib/localeText";

export interface ItemPedagogy {
  hint: LocalizedName;
  meaning: LocalizedName;
  how: LocalizedName;
  whyCorrect: LocalizedName;
  whyWrong: LocalizedName[];
}

const VIENNA_HINT = L(
  "Look at the plate family first: triangle warns, red ring forbids, blue disc commands, yellow diamond is priority.",
  "Najpierw rodzina tarczy: trójkąt ostrzega, czerwony ring zakazuje, niebieski nakazuje, żółty romb to pierwszeństwo.",
  "Сначала семейство щитка: треугольник предупреждает, красное кольцо запрещает, синий предписывает, жёлтый ромб — приоритет.",
);

const MUTCD_HINT = L(
  "US plates: diamond warns, octagon is STOP, inverted triangle is YIELD, vertical rectangle is speed.",
  "Tarcze USA: romb ostrzega, ośmiokąt to STOP, odwrócony trójkąt to YIELD, pionowy prostokąt to prędkość.",
  "США: ромб предупреждает, восьмиугольник — STOP, перевёрнутый треугольник — YIELD, вертикальный прямоугольник — скорость.",
);

const HOW_BY_CATEGORY: Record<TrafficSign["category"], LocalizedName> = {
  warning: L(
    "It does not change who goes first. Slow down and look for that hazard until you can see it is clear.",
    "Nie zmienia pierwszeństwa. Zwolnij i szukaj zagrożenia, aż zobaczysz, że jest czysto.",
    "Не меняет очередь. Снизьте скорость и ищите эту опасность, пока не убедитесь, что путь свободен.",
  ),
  prohibitory: L(
    "The ban starts at the plate (or at the distance on a tab). You must not do the action shown — night does not switch it off.",
    "Zakaz zaczyna się od tarczy (albo od odległości na tabliczce). Czynności z piktogramu nie wolno — noc go nie wyłącza.",
    "Запрет начинается у щитка (или с расстояния на табличке). Показанное действие нельзя — ночь его не отменяет.",
  ),
  mandatory: L(
    "You must follow the path or direction on the blue disc. It is an order, not a suggestion.",
    "Musisz jechać torem z niebieskiej tarczy. To nakaz, nie propozycja.",
    "Нужно ехать путём с синего диска. Это предписание, не совет.",
  ),
  priority: L(
    "This plate changes the yield order at the next junction. Combine it with lights and people — they still outrank paint.",
    "Ta tarcza zmienia kolejność na następnym skrzyżowaniu. Światła i piesi i tak są wyżej niż farba.",
    "Этот щиток меняет очередь на следующем перекрёстке. Светофор и люди всё равно выше краски.",
  ),
  information: L(
    "It marks a place or the start of a zone (crossing, town, motorway). Match the plate to the road you are actually on.",
    "Oznacza miejsce albo początek strefy (przejście, zabudowa, autostrada). Dopasuj tarczę do drogi, na której jesteś.",
    "Обозначает место или начало зоны (переход, населённый пункт, автомагистраль). Сверьте щиток с дорогой, по которой едете.",
  ),
};

const REASON_LONG: Record<string, LocalizedName> = {
  pedestrian: L(
    "A person already on the crossing you would enter goes before any turning or through car.",
    "Pieszy już na przejściu, w które wjeżdżasz, idzie przed każdym skrętem i jazdą na wprost.",
    "Пешеход уже на переходе, куда вы въезжаете, идёт раньше любой машины.",
  ),
  emergency: L(
    "Blue lights in use: make a gap. Your priority-road plate does not beat an emergency vehicle.",
    "Włączone niebieskie: zrób lukę. Romb drogi z pierwszeństwem nie bije pojazdu uprzywilejowanego.",
    "Синие маяки включены: дайте коридор. Ромб главной не бьёт спецтранспорт.",
  ),
  alreadyInside: L(
    "Whoever is already in the junction or circulating on the roundabout is finishing their movement first.",
    "Kto już jest na skrzyżowaniu albo krąży na rondzie, dokańcza manewr pierwszy.",
    "Кто уже на перекрёстке или на кольце, заканчивает манёвр первым.",
  ),
  trafficLight: L(
    "A working signal outranks signs and yield-to-the-right. Green moves; red waits.",
    "Działająca sygnalizacja jest nad znakami i zasadą prawej ręki. Zielone jedzie, czerwone stoi.",
    "Рабочий светофор выше знаков и помехи справа. Зелёный едет, красный ждёт.",
  ),
  tram: L(
    "At this uncontrolled junction a tram outranks ordinary vehicles, even if the car is on the right.",
    "Na tym równorzędnym tramwaj ma pierwszeństwo przed zwykłymi pojazdami, nawet gdy auto jest z prawej.",
    "На этом нерегулируемом трамвай выше обычных машин, даже если авто справа.",
  ),
  priorityRoad: L(
    "The yellow diamond (or GOST 2.1) is a priority road: traffic on it goes before traffic from a yield or unsigned side.",
    "Żółty romb (albo 2.1) to droga z pierwszeństwem: jedzie przed ustąpieniem i wlotem bez tarczy.",
    "Жёлтый ромб (или 2.1) — главная: едет раньше уступающих и въезда без щитка.",
  ),
  stop: L(
    "STOP means a full halt, then go only when the way is clear. Rolling through loses to free approaches.",
    "STOP to pełny postój, potem jazda tylko gdy czysto. Przejechanie „na żywca” przegrywa z wolnym wlotem.",
    "STOP — полная остановка, затем только если путь свободен. Прокатывание проигрывает свободному направлению.",
  ),
  yield: L(
    "The inverted triangle must wait for traffic on the intersecting road, including when that road looks empty at first glance.",
    "Odwrócony trójkąt czeka na drogę poprzeczną, także gdy na pierwszy rzut oka wydaje się pusta.",
    "Перевёрнутый треугольник ждёт пересекаемую дорогу, даже если на первый взгляд она пуста.",
  ),
  fourWayStop: L(
    "All-way STOP: the first vehicle to arrive goes first; if they arrived together, yield to the right.",
    "STOP ze wszystkich stron: kto pierwszy dojechał, ten jedzie; przyremisie — ustąp z prawej.",
    "STOP со всех сторон: кто раньше подъехал, тот едет; при ничьей — уступите справа.",
  ),
  yieldToRight: L(
    "No signs, no lights: if paths would cross, wait for the vehicle on your right. Size and who honked do not count.",
    "Bez tarcz i świateł: gdy tory się przetną, czekaj na pojazd z prawej. Wielkość i klakson nie liczą się.",
    "Нет щитков и светофора: если пути пересекутся, ждите транспорт справа. Размер и гудок не считаются.",
  ),
};

function reasonLong(key: string): LocalizedName {
  const nested = key.startsWith("reason.") ? key.slice("reason.".length) : key;
  return REASON_LONG[nested] ?? REASON_LONG.yieldToRight!;
}

function hintForSign(sign: TrafficSign): LocalizedName {
  return sign.shape.startsWith("mutcd") ? MUTCD_HINT : VIENNA_HINT;
}

function howForSign(sign: TrafficSign): LocalizedName {
  if (sign.role === "stop") {
    return L(
      "Come to a complete stop, look every way, then enter only when you will not cut someone who already has the road.",
      "Zatrzymaj się całkowicie, spójrz w każdą stronę, wjedź tylko gdy nie zetniesz kogoś, kto już ma drogę.",
      "Полностью остановитесь, посмотрите во все стороны, въезжайте только если не срежете того, у кого уже есть дорога.",
    );
  }
  if (sign.role === "yield") {
    return L(
      "Slow early, be ready to stop, and only take the gap if other traffic does not have to brake for you.",
      "Zwolnij wcześnie, bądź gotów stanąć i bierz lukę tylko jeśli inni nie muszą przez ciebie hamować.",
      "Заранее снизьте скорость, будьте готовы встать и берите интервал только если другим не придётся из-за вас тормозить.",
    );
  }
  if (sign.role === "priority-road") {
    return L(
      "You still watch for people, trams, lights and emergency vehicles. The diamond only beats unsigned or yield approaches.",
      "I tak patrz na ludzi, tramwaje, światła i uprzywilejowane. Romb wygrywa tylko z wlotem bez tarczy albo z ustąpieniem.",
      "Всё равно смотрите на людей, трамваи, светофор и спецтранспорт. Ромб бьёт только въезд без щитка или с уступкой.",
    );
  }
  return HOW_BY_CATEGORY[sign.category];
}

function missingSign(): TrafficSign {
  return {
    id: "missing",
    code: "?",
    jurisdiction: "PL",
    category: "warning",
    shape: "warning-triangle",
    role: "none",
    name: L("Unknown plate", "Nieznana tarcza", "Неизвестный щиток"),
    meaning: L("This plate is missing from the pack.", "Brak tarczy w pakiecie.", "Щитка нет в пакете."),
    svg: "<svg xmlns='http://www.w3.org/2000/svg'></svg>",
    license: "none",
    artwork: "fallback",
  };
}

function signOrMissing(id: string | undefined): TrafficSign {
  return (id ? getSignById(id) : undefined) ?? missingSign();
}

function wrongPlate(choice: TrafficSign, wanted: TrafficSign): LocalizedName {
  return L(
    `That plate is ${choice.name.en} (${choice.code}): ${choice.meaning.en} It is not ${wanted.name.en}.`,
    `To jest ${choice.name.pl} (${choice.code}): ${choice.meaning.pl} To nie jest ${wanted.name.pl}.`,
    `Это ${choice.name.ru} (${choice.code}): ${choice.meaning.ru} Это не ${wanted.name.ru}.`,
  );
}

function whoPedagogy(sceneId: string, jurisdiction: JurisdictionId): ItemPedagogy {
  const scene = getScene(sceneId);
  const ranking = whoGoesFirst(scene, jurisdiction);
  const lines = ranking.order.map((id, index) => {
    const detail = reasonLong(ranking.reasonKeys[id] ?? "reason.yieldToRight");
    return {
      en: `${index + 1}. ${id} — ${detail.en}`,
      pl: `${index + 1}. ${id} — ${detail.pl}`,
      ru: `${index + 1}. ${id} — ${detail.ru}`,
    };
  });
  const whyCorrect = L(
    `Engine order: ${lines.map((line) => line.en).join(" ")}`,
    `Kolejność silnika: ${lines.map((line) => line.pl).join(" ")}`,
    `Порядок движка: ${lines.map((line) => line.ru).join(" ")}`,
  );
  return {
    hint: L(
      "Name the rule, don't guess size: people, lights, plates, then yield to the right.",
      "Nazwij przepis, nie zgaduj po gabarycie: ludzie, światła, tarcze, potem ustąp z prawej.",
      "Назовите правило, не гадайте по размеру: люди, светофор, щитки, затем помеха справа.",
    ),
    meaning: L(
      "Who may enter the conflict zone first, according to this country's code.",
      "Kto pierwszy może wjechać w strefę kolizji według przepisów tego kraju.",
      "Кто первым может въехать в зону конфликта по кодексу этой страны.",
    ),
    how: L(
      "Tap vehicles in the order they are allowed to go. Wrong order usually means you skipped a person, a light, a plate, or the right-hand rule.",
      "Dotykaj pojazdów w kolejności, w jakiej wolno im jechać. Zły porządek zwykle znaczy, że pominąłeś człowieka, światło, tarczę albo prawą rękę.",
      "Нажимайте транспорт в том порядке, в каком ему можно ехать. Неверный порядок обычно значит, что вы пропустили человека, свет, щиток или помеху справа.",
    ),
    whyCorrect,
    whyWrong: [
      L(
        "That sequence skips the ranking below. Size, speed and who honked do not move anyone up the list.",
        "Ta kolejność pomija ranking poniżej. Wielkość, prędkość i klakson nikogo nie przesuwają.",
        "Эта последовательность пропускает рейтинг ниже. Размер, скорость и гудок никого не поднимают.",
      ),
    ],
  };
}

export function pedagogyForItem(item: LessonItem, jurisdiction: JurisdictionId): ItemPedagogy {
  switch (item.type) {
    case "sign-meaning": {
      const wanted = signOrMissing(item.signId);
      return {
        hint: hintForSign(wanted),
        meaning: wanted.meaning,
        how: howForSign(wanted),
        whyCorrect: L(
          `Yes: ${wanted.name.en} (${wanted.code}). ${wanted.meaning.en}`,
          `Tak: ${wanted.name.pl} (${wanted.code}). ${wanted.meaning.pl}`,
          `Да: ${wanted.name.ru} (${wanted.code}). ${wanted.meaning.ru}`,
        ),
        whyWrong: item.choices.map((choiceId) => wrongPlate(signOrMissing(choiceId), wanted)),
      };
    }
    case "true-false": {
      const sign = signOrMissing(item.signId);
      const yesWrong = L(
        `The sentence does not match this plate. ${sign.name.en} actually means: ${sign.meaning.en}`,
        `Zdanie nie pasuje do tej tarczy. ${sign.name.pl} naprawdę oznacza: ${sign.meaning.pl}`,
        `Фраза не про этот щиток. ${sign.name.ru} на самом деле означает: ${sign.meaning.ru}`,
      );
      const noWrong = L(
        `The sentence is exactly what this plate does. ${sign.meaning.en}`,
        `Zdanie to dokładnie to, co robi ta tarcza. ${sign.meaning.pl}`,
        `Фраза ровно про то, что делает щиток. ${sign.meaning.ru}`,
      );
      return {
        hint: L(
          "Read the whole sentence. Does it describe THIS plate, or a different one?",
          "Przeczytaj całe zdanie. Czy opisuje TĘ tarczę, czy inną?",
          "Прочитайте всю фразу. Это про ЭТОТ щиток или про другой?",
        ),
        meaning: sign.meaning,
        how: howForSign(sign),
        whyCorrect: item.correct
          ? L(
              `The wording matches ${sign.name.en}. ${sign.meaning.en}`,
              `Brzmienie zgadza się z ${sign.name.pl}. ${sign.meaning.pl}`,
              `Формулировка совпадает с ${sign.name.ru}. ${sign.meaning.ru}`,
            )
          : yesWrong,
        whyWrong: item.correct ? [noWrong, noWrong] : [yesWrong, yesWrong],
      };
    }
    case "mcq":
    case "clip-choice": {
      const correctChoice = item.choices[item.correct]!;
      const sceneHint = item.sceneId?.includes("emergency")
        ? L(
            "Blue lights beat a priority-road diamond. Make room; do not race the junction.",
            "Niebieskie światła biją romb drogi z pierwszeństwem. Zrób miejsce, nie ścigaj się przez skrzyżowanie.",
            "Синие маяки бьют ромб главной. Дайте место, не гонитесь через перекрёсток.",
          )
        : L(
            "Ask who the code names, not who is bigger or louder.",
            "Pytaj, kogo wskazuje przepis, nie kto jest większy albo głośniejszy.",
            "Спросите, кого называет кодекс, а не кто больше или громче.",
          );
      return {
        hint: sceneHint,
        meaning: L(
          "The right move is the one the plates, lights and yield rules require — not the one that feels bold.",
          "Właściwy ruch to ten, którego wymagają tarcze, światła i ustąpienie — nie ten, który wygląda odważnie.",
          "Верный ход — тот, который требуют щитки, свет и уступка, а не тот, что кажется смелым.",
        ),
        how: item.sceneId
          ? whoPedagogy(item.sceneId, jurisdiction).how
          : HOW_BY_CATEGORY.priority,
        whyCorrect: L(
          `That choice matches the rule: ${correctChoice.en}`,
          `Ten wybór zgadza się z przepisem: ${correctChoice.pl}`,
          `Этот выбор совпадает с правилом: ${correctChoice.ru}`,
        ),
        whyWrong: item.choices.map((choice, index) =>
          index === item.correct
            ? L(
                "This is the rule-following option.",
                "To opcja zgodna z przepisem.",
                "Это вариант по правилу.",
              )
            : L(
                `"${choice.en}" is a common trap: speed, size or the left side do not create priority.`,
                `„${choice.pl}” to częsta pułapka: prędkość, gabaryt ani lewa strona nie dają pierwszeństwa.`,
                `«${choice.ru}» — частая ловушка: скорость, размер и левая сторона не дают преимущества.`,
              ),
        ),
      };
    }
    case "who-goes-first":
      return whoPedagogy(item.sceneId, jurisdiction);
    case "hazard-tap": {
      const scene = getScene(item.sceneId);
      const ranking = whoGoesFirst(scene, jurisdiction);
      const target = scene.visualActors.find((actor) => actor.id === item.targetId);
      const reason = reasonLong(ranking.reasonKeys[item.targetId] ?? "reason.pedestrian");
      return {
        hint: L(
          "The developing hazard is the actor that changes the order: a person, a tram, or lights on an emergency vehicle.",
          "Rozwijające się zagrożenie to ktoś, kto zmienia kolejność: człowiek, tramwaj albo sygnały uprzywilejowanego.",
          "Развивающаяся опасность — тот, кто меняет очередь: человек, трамвай или маяки спецтранспорта.",
        ),
        meaning: L(
          `Tap ${item.targetId} — that is the conflict you must resolve first.`,
          `Dotknij ${item.targetId} — to konflikt, który musisz rozwiązać jako pierwszy.`,
          `Нажмите ${item.targetId} — это конфликт, который нужно решить первым.`,
        ),
        how: reason,
        whyCorrect: L(
          `Yes, ${target?.kind ?? item.targetId} changes the order. ${reason.en}`,
          `Tak, ${target?.kind ?? item.targetId} zmienia kolejność. ${reason.pl}`,
          `Да, ${target?.kind ?? item.targetId} меняет очередь. ${reason.ru}`,
        ),
        whyWrong: [
          L(
            "The car that looks ordinary is not the developing hazard. Look for the person, tram or emergency lights.",
            "Zwykłe auto nie jest rozwijającym się zagrożeniem. Szukaj człowieka, tramwaju albo błyskających świateł.",
            "Обычная машина — не развивающаяся опасность. Ищите человека, трамвай или проблесковые маяки.",
          ),
        ],
      };
    }
    default:
      return assertNever(item);
  }
}

export function pedagogyForExam(
  question: ExamQuestion,
  jurisdiction: JurisdictionId,
): ItemPedagogy {
  if (question.sceneId) {
    const who = whoPedagogy(question.sceneId, jurisdiction);
    return {
      ...who,
      hint: L(
        "Ignore speed and the left side. Read plates, lights, then yield-to-the-right.",
        "Oleć prędkość i lewą stronę. Czytaj tarcze, światła, potem ustąp z prawej.",
        "Забудьте скорость и левую сторону. Читайте щитки, свет, затем помеху справа.",
      ),
      whyWrong: (question.choices ?? []).map((choice, index) => {
        if (index === question.correct) {
          return who.whyCorrect;
        }
        return L(
          `"${choice.en}" is not how priority is assigned.`,
          `„${choice.pl}” to nie sposób nadawania pierwszeństwa.`,
          `«${choice.ru}» — так преимущество не назначают.`,
        );
      }),
    };
  }
  const sign = signOrMissing(question.signId);
  const base: ItemPedagogy = {
    hint: hintForSign(sign),
    meaning: sign.meaning,
    how: howForSign(sign),
    whyCorrect: L(
      `The plate is ${sign.name.en} (${sign.code}): ${sign.meaning.en}`,
      `Tarcza to ${sign.name.pl} (${sign.code}): ${sign.meaning.pl}`,
      `Щиток — ${sign.name.ru} (${sign.code}): ${sign.meaning.ru}`,
    ),
    whyWrong: [],
  };
  if (question.kind === "yes-no") {
    const trap = L(
      `If you answered the other way: this plate still means ${sign.meaning.en} Wording that belongs to a different sign is a trap.`,
      `Jeśli kliknąłeś odwrotnie: ta tarcza nadal oznacza ${sign.meaning.pl} Brzmienie z innego znaku to pułapka.`,
      `Если ответили наоборот: щиток всё равно означает ${sign.meaning.ru} Формулировка от другого знака — ловушка.`,
    );
    return {
      ...base,
      whyWrong: [trap, trap],
      whyCorrect: question.correct
        ? L(
            `Yes — that is exactly ${sign.name.en}. ${sign.meaning.en}`,
            `Tak — to właśnie ${sign.name.pl}. ${sign.meaning.pl}`,
            `Да — это как раз ${sign.name.ru}. ${sign.meaning.ru}`,
          )
        : L(
            `No — this plate is ${sign.name.en}: ${sign.meaning.en} The quoted meaning belongs to another sign.`,
            `Nie — ta tarcza to ${sign.name.pl}: ${sign.meaning.pl} Podany opis należy do innego znaku.`,
            `Нет — этот щиток ${sign.name.ru}: ${sign.meaning.ru} Приведённый смысл от другого знака.`,
          ),
    };
  }
  return {
    ...base,
    whyWrong: (question.choices ?? []).map((choice, index) => {
      if (index === question.correct) {
        return base.whyCorrect;
      }
      return L(
        `"${choice.en}" would get you failed on the road: signs stay in force at night, and speeding is not a response to a plate.`,
        `„${choice.pl}” na drodze kończy się błędem: znaki działają w nocy, a przyspieszenie nie jest odpowiedzią na tarczę.`,
        `«${choice.ru}» на дороге — ошибка: знаки действуют ночью, а ускорение — не ответ на щиток.`,
      );
    }),
  };
}
