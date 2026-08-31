import type { SignRole } from "@/engine/types";
import { resolveArtwork } from "./artwork";
import { renderSignSvg, type Glyph } from "./svg";
import type { SignCategory, SignShape, TrafficSign } from "./types";

interface Spec {
  code: string;
  category: SignCategory;
  shape: SignShape;
  glyph?: Glyph;
  role?: SignRole | "none";
  en: string;
  pl: string;
  ru: string;
  meaningEn: string;
  meaningPl: string;
  meaningRu: string;
  speed?: number;
  label?: string;
  roadText?: string;
}

function make(jurisdiction: TrafficSign["jurisdiction"], spec: Spec): TrafficSign {
  const svg = renderSignSvg(spec.shape, spec.glyph ?? "none", {
    speed: spec.speed,
    label: spec.label,
  });
  const art = resolveArtwork(jurisdiction, spec.code);
  return {
    id: `${jurisdiction}-${spec.code}`,
    code: spec.code,
    jurisdiction,
    category: spec.category,
    shape: spec.shape,
    role: spec.role ?? "none",
    name: { en: spec.en, pl: spec.pl, ru: spec.ru },
    meaning: { en: spec.meaningEn, pl: spec.meaningPl, ru: spec.meaningRu },
    svg,
    license: art.license,
    roadText: spec.roadText,
    src: art.src,
    artwork: art.kind,
  };
}

const PL_CORE: Spec[] = [
  { code: "A-1", category: "warning", shape: "warning-triangle", glyph: "curve-right", en: "Dangerous right curve", pl: "Niebezpieczny zakręt w prawo", ru: "Опасный поворот направо", meaningEn: "Slow down; a sharp right curve is ahead.", meaningPl: "Zmniejsz prędkość — ostry zakręt w prawo.", meaningRu: "Снизьте скорость: впереди крутой правый поворот." },
  { code: "A-2", category: "warning", shape: "warning-triangle", glyph: "curve-left", en: "Dangerous left curve", pl: "Niebezpieczny zakręt w lewo", ru: "Опасный поворот налево", meaningEn: "Slow down; a sharp left curve is ahead.", meaningPl: "Zmniejsz prędkość — ostry zakręt w lewo.", meaningRu: "Снизьте скорость: впереди крутой левый поворот." },
  { code: "A-3", category: "warning", shape: "warning-triangle", glyph: "double-curve", en: "Double curve, first right", pl: "Dwa niebezpieczne zakręty, pierwszy w prawo", ru: "Два поворота, первый направо", meaningEn: "A sequence of curves begins with a right.", meaningPl: "Seria zakrętów, pierwszy w prawo.", meaningRu: "Серия поворотов, первый направо." },
  { code: "A-4", category: "warning", shape: "warning-triangle", glyph: "double-curve", en: "Double curve, first left", pl: "Dwa niebezpieczne zakręty, pierwszy w lewo", ru: "Два поворота, первый налево", meaningEn: "A sequence of curves begins with a left.", meaningPl: "Seria zakrętów, pierwszy w lewo.", meaningRu: "Серия поворотов, первый налево." },
  { code: "A-5", category: "warning", shape: "warning-triangle", glyph: "cross", en: "Intersection", pl: "Skrzyżowanie dróg", ru: "Перекрёсток", meaningEn: "An intersection is ahead; be ready to yield.", meaningPl: "Zbliżasz się do skrzyżowania.", meaningRu: "Впереди перекрёсток." },
  { code: "A-6a", category: "warning", shape: "warning-triangle", glyph: "side-right", en: "Junction from the right", pl: "Skrzyżowanie z drogą podporządkowaną z prawej", ru: "Примыкание справа", meaningEn: "A side road joins from the right.", meaningPl: "Droga podporządkowana wpada z prawej.", meaningRu: "Справа примыкает второстепенная дорога." },
  { code: "A-6b", category: "warning", shape: "warning-triangle", glyph: "side-left", en: "Junction from the left", pl: "Skrzyżowanie z drogą podporządkowaną z lewej", ru: "Примыкание слева", meaningEn: "A side road joins from the left.", meaningPl: "Droga podporządkowana wpada z lewej.", meaningRu: "Слева примыкает второстепенная дорога." },
  { code: "A-6c", category: "warning", shape: "warning-triangle", glyph: "cross", en: "Junctions from both sides", pl: "Skrzyżowanie z drogami podporządkowanymi", ru: "Примыкания с двух сторон", meaningEn: "Side roads join from both sides.", meaningPl: "Drogi podporządkowane z obu stron.", meaningRu: "Примыкания с обеих сторон." },
  { code: "A-7", category: "priority", shape: "yield-inverted-triangle", role: "yield", en: "Give way", pl: "Ustąp pierwszeństwa", ru: "Уступите дорогу", meaningEn: "Yield to traffic on the intersecting road.", meaningPl: "Ustąp pierwszeństwa pojazdom na drodze poprzecznej.", meaningRu: "Уступите транспортным средствам на пересекаемой дороге." },
  { code: "A-8", category: "warning", shape: "warning-triangle", glyph: "roundabout", en: "Roundabout ahead", pl: "Skrzyżowanie o ruchu okrężnym", ru: "Круговое движение", meaningEn: "A roundabout is ahead.", meaningPl: "Zbliżasz się do ronda.", meaningRu: "Впереди круговое движение." },
  { code: "A-9", category: "warning", shape: "warning-triangle", glyph: "rail", en: "Level crossing with barriers", pl: "Przejazd kolejowy z zaporami", ru: "Железнодорожный переезд со шлагбаумом", meaningEn: "A guarded rail crossing is ahead.", meaningPl: "Przejazd kolejowy z zaporami.", meaningRu: "Впереди переезд со шлагбаумом." },
  { code: "A-10", category: "warning", shape: "warning-triangle", glyph: "rail", en: "Level crossing without barriers", pl: "Przejazd kolejowy bez zapór", ru: "Железнодорожный переезд без шлагбаума", meaningEn: "An unguarded rail crossing is ahead.", meaningPl: "Przejazd kolejowy bez zapór.", meaningRu: "Впереди переезд без шлагбаума." },
  { code: "A-11", category: "warning", shape: "warning-triangle", glyph: "bump", en: "Uneven road", pl: "Nierówna droga", ru: "Неровная дорога", meaningEn: "Bumps or potholes ahead.", meaningPl: "Nierówności jezdni.", meaningRu: "Впереди неровности." },
  { code: "A-11a", category: "warning", shape: "warning-triangle", glyph: "bump", en: "Speed bump", pl: "Próg zwalniający", ru: "Лежачий полицейский", meaningEn: "A speed hump is ahead.", meaningPl: "Próg zwalniający.", meaningRu: "Впереди искусственная неровность." },
  { code: "A-12a", category: "warning", shape: "warning-triangle", glyph: "narrow", en: "Road narrows", pl: "Zwężenie jezdni", ru: "Сужение дороги", meaningEn: "The carriageway narrows.", meaningPl: "Jezdnia się zwęża.", meaningRu: "Проезжая часть сужается." },
  { code: "A-12b", category: "warning", shape: "warning-triangle", glyph: "narrow", en: "Road narrows on the right", pl: "Zwężenie prawej strony jezdni", ru: "Сужение справа", meaningEn: "The right side narrows.", meaningPl: "Zwężenie z prawej.", meaningRu: "Сужение справа." },
  { code: "A-12c", category: "warning", shape: "warning-triangle", glyph: "narrow", en: "Road narrows on the left", pl: "Zwężenie lewej strony jezdni", ru: "Сужение слева", meaningEn: "The left side narrows.", meaningPl: "Zwężenie z lewej.", meaningRu: "Сужение слева." },
  { code: "A-14", category: "warning", shape: "warning-triangle", glyph: "lights", en: "Traffic lights", pl: "Sygnały świetlne", ru: "Светофор", meaningEn: "Traffic signals ahead.", meaningPl: "Sygnalizacja świetlna.", meaningRu: "Впереди светофор." },
  { code: "A-15", category: "warning", shape: "warning-triangle", glyph: "slippery", en: "Slippery road", pl: "Śliska jezdnia", ru: "Скользкая дорога", meaningEn: "The road may be slippery.", meaningPl: "Jezdnia może być śliska.", meaningRu: "Дорога может быть скользкой." },
  { code: "A-16", category: "warning", shape: "warning-triangle", glyph: "pedestrian", en: "Pedestrians", pl: "Piesi", ru: "Пешеходы", meaningEn: "Pedestrians may be crossing.", meaningPl: "Możliwi piesi na jezdni.", meaningRu: "Возможны пешеходы." },
  { code: "A-17", category: "warning", shape: "warning-triangle", glyph: "children", en: "Children", pl: "Dzieci", ru: "Дети", meaningEn: "Children may be near the road.", meaningPl: "Dzieci w pobliżu drogi.", meaningRu: "Дети рядом с дорогой." },
  { code: "A-18b", category: "warning", shape: "warning-triangle", glyph: "deer", en: "Animals", pl: "Zwierzęta", ru: "Дикие животные", meaningEn: "Wild animals may cross.", meaningPl: "Możliwe zwierzęta na drodze.", meaningRu: "Возможен выход животных." },
  { code: "A-20", category: "warning", shape: "warning-triangle", glyph: "cross", en: "Two-way traffic", pl: "Odcinek jezdni dwukierunkowej", ru: "Двустороннее движение", meaningEn: "Two-way traffic begins.", meaningPl: "Poczatęk ruchu dwukierunkowego.", meaningRu: "Начинается двустороннее движение." },
  { code: "A-21", category: "warning", shape: "warning-triangle", glyph: "tram", en: "Tram crossing", pl: "Tramwaj", ru: "Трамвай", meaningEn: "Watch for trams.", meaningPl: "Uwaga na tramwaje.", meaningRu: "Осторожно, трамвай." },
  { code: "A-24", category: "warning", shape: "warning-triangle", glyph: "work", en: "Roadworks", pl: "Roboty na drodze", ru: "Дорожные работы", meaningEn: "Road works ahead.", meaningPl: "Roboty drogowe.", meaningRu: "Дорожные работы." },
  { code: "A-29", category: "warning", shape: "warning-triangle", glyph: "lights", en: "Signals", pl: "Sygnały świetlne", ru: "Светофорное регулирование", meaningEn: "Signal-controlled section ahead.", meaningPl: "Sygnalizacja w pobliżu.", meaningRu: "Участок со светофорами." },
  { code: "A-30", category: "warning", shape: "warning-triangle", glyph: "exclaim", en: "Other danger", pl: "Inne niebezpieczeństwo", ru: "Прочие опасности", meaningEn: "An unspecified hazard is ahead.", meaningPl: "Inne zagrożenie.", meaningRu: "Иная опасность." },
  { code: "A-32", category: "warning", shape: "warning-triangle", glyph: "ice", en: "Icy road", pl: "Oszronienie jezdni", ru: "Гололедица", meaningEn: "The surface may be icy.", meaningPl: "Jezdnia może być oblodzona.", meaningRu: "Возможна гололедица." },
  { code: "A-33", category: "warning", shape: "warning-triangle", glyph: "queue", en: "Congestion", pl: "Zator", ru: "Затор", meaningEn: "Queues may form.", meaningPl: "Możliwy korek.", meaningRu: "Возможен затор." },
  { code: "A-34", category: "warning", shape: "warning-triangle", glyph: "camera", en: "Accident", pl: "Wypadek drogowy", ru: "ДТП", meaningEn: "An accident scene is ahead.", meaningPl: "Wypadek na drodze.", meaningRu: "Впереди место ДТП." },
  { code: "B-1", category: "prohibitory", shape: "prohibitory-circle", glyph: "none", en: "No entry in both directions", pl: "Zakaz ruchu w obu kierunkach", ru: "Движение запрещено", meaningEn: "No vehicles in either direction.", meaningPl: "Zakaz ruchu pojazdów.", meaningRu: "Движение транспортных средств запрещено." },
  { code: "B-2", category: "prohibitory", shape: "prohibitory-circle", glyph: "no-entry", en: "No entry", pl: "Zakaz wjazdu", ru: "Въезд запрещён", meaningEn: "Do not enter this road.", meaningPl: "Nie wjeżdżaj.", meaningRu: "Въезд запрещён." },
  { code: "B-5", category: "prohibitory", shape: "prohibitory-circle", glyph: "none", en: "No motor vehicles", pl: "Zakaz wjazdu pojazdów silnikowych", ru: "Движение моторных ТС запрещено", meaningEn: "Motor vehicles must not enter.", meaningPl: "Pojazdy silnikowe nie wjeżdżają.", meaningRu: "Моторным ТС въезд запрещён." },
  { code: "B-9", category: "prohibitory", shape: "prohibitory-circle", glyph: "bike", en: "No bicycles", pl: "Zakaz wjazdu rowerów", ru: "Движение велосипедов запрещено", meaningEn: "Cyclists must not enter.", meaningPl: "Rowerzyści nie wjeżdżają.", meaningRu: "Велосипедам въезд запрещён." },
  { code: "B-20", category: "priority", shape: "stop-octagon", role: "stop", label: "STOP", roadText: "STOP", en: "Stop", pl: "Stop", ru: "Стоп", meaningEn: "Stop fully, then go when it is safe.", meaningPl: "Zatrzymaj się, potem jedź gdy bezpiecznie.", meaningRu: "Полная остановка, затем движение если безопасно." },
  { code: "B-21", category: "prohibitory", shape: "prohibitory-circle", glyph: "no-left", en: "No left turn", pl: "Zakaz skrętu w lewo", ru: "Поворот налево запрещён", meaningEn: "Left turns are forbidden.", meaningPl: "Nie skręcaj w lewo.", meaningRu: "Налево поворачивать нельзя." },
  { code: "B-22", category: "prohibitory", shape: "prohibitory-circle", glyph: "no-right", en: "No right turn", pl: "Zakaz skrętu w prawo", ru: "Поворот направо запрещён", meaningEn: "Right turns are forbidden.", meaningPl: "Nie skręcaj w prawo.", meaningRu: "Направо поворачивать нельзя." },
  { code: "B-23", category: "prohibitory", shape: "prohibitory-circle", glyph: "no-u", en: "No U-turn", pl: "Zakaz zawracania", ru: "Разворот запрещён", meaningEn: "U-turns are forbidden.", meaningPl: "Nie zawracaj.", meaningRu: "Разворот запрещён." },
  { code: "B-25", category: "prohibitory", shape: "prohibitory-circle", glyph: "no-overtake", en: "No overtaking", pl: "Zakaz wyprzedzania", ru: "Обгон запрещён", meaningEn: "Do not overtake.", meaningPl: "Nie wyprzedzaj.", meaningRu: "Обгон запрещён." },
  { code: "B-36", category: "prohibitory", shape: "prohibitory-circle", glyph: "no-parking", en: "No parking", pl: "Zakaz postoju", ru: "Стоянка запрещена", meaningEn: "Parking is forbidden.", meaningPl: "Nie parkuj.", meaningRu: "Стоянка запрещена." },
  { code: "B-35", category: "prohibitory", shape: "prohibitory-circle", glyph: "no-stop", en: "No stopping", pl: "Zakaz postoju i zatrzymywania", ru: "Остановка запрещена", meaningEn: "Do not stop or park.", meaningPl: "Nie zatrzymuj się.", meaningRu: "Остановка запрещена." },
  { code: "B-41", category: "prohibitory", shape: "prohibitory-circle", glyph: "pedestrian", en: "No pedestrians", pl: "Zakaz ruchu pieszych", ru: "Движение пешеходов запрещено", meaningEn: "Pedestrians must not enter.", meaningPl: "Piesi nie wchodzą.", meaningRu: "Пешеходам проход запрещён." },
  { code: "C-1", category: "mandatory", shape: "mandatory-circle", glyph: "arrow-left", en: "Turn left", pl: "Nakaz jazdy w lewo", ru: "Движение налево", meaningEn: "You must turn left.", meaningPl: "Jedź w lewo.", meaningRu: "Нужно ехать налево." },
  { code: "C-2", category: "mandatory", shape: "mandatory-circle", glyph: "arrow-right", en: "Turn right", pl: "Nakaz jazdy w prawo", ru: "Движение направо", meaningEn: "You must turn right.", meaningPl: "Jedź w prawo.", meaningRu: "Нужно ехать направо." },
  { code: "C-4", category: "mandatory", shape: "mandatory-circle", glyph: "arrow-up", en: "Ahead only", pl: "Nakaz jazdy prosto", ru: "Движение прямо", meaningEn: "You must go straight.", meaningPl: "Jedź prosto.", meaningRu: "Нужно ехать прямо." },
  { code: "C-5", category: "mandatory", shape: "mandatory-circle", glyph: "arrow-up", en: "Keep straight", pl: "Nakaz jazdy prosto", ru: "Только прямо", meaningEn: "Continue ahead only.", meaningPl: "Tylko na wprost.", meaningRu: "Только прямо." },
  { code: "C-12", category: "mandatory", shape: "mandatory-circle", glyph: "arrow-round", en: "Roundabout", pl: "Ruch okrężny", ru: "Круговое движение", meaningEn: "Drive around the roundabout.", meaningPl: "Jedź ruchem okrężnym.", meaningRu: "Двигайтесь по кругу." },
  { code: "C-13", category: "mandatory", shape: "mandatory-circle", glyph: "bike", en: "Cycle track", pl: "Droga dla rowerów", ru: "Велосипедная дорожка", meaningEn: "Cyclists must use this track.", meaningPl: "Droga dla rowerów.", meaningRu: "Велодорожка." },
  { code: "C-16", category: "mandatory", shape: "mandatory-circle", glyph: "pedestrian", en: "Pedestrian path", pl: "Droga dla pieszych", ru: "Пешеходная дорожка", meaningEn: "Pedestrians only.", meaningPl: "Tylko piesi.", meaningRu: "Только пешеходы." },
  { code: "D-1", category: "priority", shape: "priority-diamond", role: "priority-road", glyph: "priority", en: "Priority road", pl: "Droga z pierwszeństwem", ru: "Главная дорога", meaningEn: "You have priority at upcoming intersections.", meaningPl: "Masz pierwszeństwo.", meaningRu: "Вы на главной дороге." },
  { code: "D-2", category: "priority", shape: "priority-diamond", role: "end-priority-road", glyph: "end-priority", en: "End of priority road", pl: "Koniec drogi z pierwszeństwem", ru: "Конец главной дороги", meaningEn: "Priority road ends.", meaningPl: "Koniec pierwszeństwa.", meaningRu: "Главная дорога заканчивается." },
  { code: "D-3", category: "information", shape: "info-rectangle", glyph: "one-way", en: "One way", pl: "Droga jednokierunkowa", ru: "Одностороннее движение", meaningEn: "One-way street.", meaningPl: "Jednokierunkowa.", meaningRu: "Одностороннее движение." },
  { code: "D-6", category: "information", shape: "info-rectangle", glyph: "crossing", en: "Pedestrian crossing", pl: "Przejście dla pieszych", ru: "Пешеходный переход", meaningEn: "A marked crossing is here.", meaningPl: "Przejście dla pieszych.", meaningRu: "Пешеходный переход." },
  { code: "D-6b", category: "information", shape: "info-rectangle", glyph: "bike", en: "Cycle crossing", pl: "Przejazd dla rowerzystów", ru: "Переезд для велосипедистов", meaningEn: "Cyclists may cross here.", meaningPl: "Przejazd rowerowy.", meaningRu: "Велосипедный переезд." },
  { code: "D-40", category: "information", shape: "info-rectangle", label: "ZONE 30", en: "30 zone", pl: "Strefa ograniczonej prędkości", ru: "Зона 30", meaningEn: "A 30 km/h zone begins.", meaningPl: "Strefa 30 km/h.", meaningRu: "Начинается зона 30 км/ч." },
  { code: "D-42", category: "information", shape: "info-rectangle", glyph: "city", en: "Built-up area", pl: "Obszar zabudowany", ru: "Населённый пункт", meaningEn: "Built-up area begins; urban speed applies.", meaningPl: "Obszar zabudowany — 50 km/h.", meaningRu: "Населённый пункт, действует городская скорость." },
  { code: "D-43", category: "information", shape: "info-rectangle", glyph: "city", en: "End of built-up area", pl: "Koniec obszaru zabudowanego", ru: "Конец населённого пункта", meaningEn: "Urban speed rules end.", meaningPl: "Koniec obszaru zabudowanego.", meaningRu: "Конец населённого пункта." },
  { code: "D-7", category: "information", shape: "info-rectangle", glyph: "highway", en: "Motorway", pl: "Autostrada", ru: "Автомагистраль", meaningEn: "Motorway begins.", meaningPl: "Początek autostrady.", meaningRu: "Начало автомагистрали." },
  { code: "T-1", category: "information", shape: "info-rectangle", label: "400 m", en: "Distance plate", pl: "Tabliczka odległości", ru: "Табличка расстояния", meaningEn: "Distance to the hazard.", meaningPl: "Odległość do niebezpieczeństwa.", meaningRu: "Расстояние до опасности." },
  { code: "T-6a", category: "information", shape: "info-rectangle", glyph: "side-right", en: "Real layout of intersection", pl: "Rzeczywisty przebieg drogi z pierwszeństwem", ru: "Направление главной", meaningEn: "Shows which arm stays priority.", meaningPl: "Pokazuje przebieg drogi z pierwszeństwem.", meaningRu: "Показывает направление главной дороги." },
];

const SPEED_LIMITS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 140];

function speedSpecs(): Spec[] {
  return SPEED_LIMITS.flatMap((speed) => [
    {
      code: `B-33-${speed}`,
      category: "prohibitory" as const,
      shape: "prohibitory-circle" as const,
      glyph: "speed" as const,
      speed,
      en: `Speed limit ${speed}`,
      pl: `Ograniczenie prędkości ${speed}`,
      ru: `Ограничение скорости ${speed}`,
      meaningEn: `Do not exceed ${speed} km/h.`,
      meaningPl: `Nie przekraczaj ${speed} km/h.`,
      meaningRu: `Не превышайте ${speed} км/ч.`,
    },
    {
      code: `B-34-${speed}`,
      category: "prohibitory" as const,
      shape: "prohibitory-circle" as const,
      glyph: "speed" as const,
      speed,
      en: `End of ${speed} limit`,
      pl: `Koniec ograniczenia ${speed}`,
      ru: `Конец ограничения ${speed}`,
      meaningEn: `The ${speed} km/h limit ends.`,
      meaningPl: `Koniec limitu ${speed} km/h.`,
      meaningRu: `Ограничение ${speed} км/ч заканчивается.`,
    },
  ]);
}

export const POLISH_SIGNS: TrafficSign[] = [...PL_CORE, ...speedSpecs()].map((spec) =>
  make("PL", spec),
);

function germanPlateName(sign: TrafficSign): TrafficSign {
  switch (sign.code) {
    case "A-1":
      return {
        ...sign,
        name: {
          en: "Dangerous left curve",
          pl: "Niebezpieczny zakręt w lewo",
          ru: "Опасный поворот налево",
        },
        meaning: {
          en: "Slow down; a sharp left curve is ahead (StVO Zeichen 103-10).",
          pl: "Zmniejsz prędkość — ostry zakręt w lewo (Zeichen 103-10).",
          ru: "Снизьте скорость: крутой левый поворот (Zeichen 103-10).",
        },
      };
    case "A-2":
      return {
        ...sign,
        name: {
          en: "Dangerous right curve",
          pl: "Niebezpieczny zakręt w prawo",
          ru: "Опасный поворот направо",
        },
        meaning: {
          en: "Slow down; a sharp right curve is ahead (StVO Zeichen 103-20).",
          pl: "Zmniejsz prędkość — ostry zakręt w prawo (Zeichen 103-20).",
          ru: "Снизьте скорость: крутой правый поворот (Zeichen 103-20).",
        },
      };
    case "A-3":
      return {
        ...sign,
        name: {
          en: "Double curve, first left",
          pl: "Dwa zakręty, pierwszy w lewo",
          ru: "Два поворота, первый налево",
        },
        meaning: {
          en: "A sequence of curves begins with a left (StVO Zeichen 105-10).",
          pl: "Seria zakrętów, pierwszy w lewo (Zeichen 105-10).",
          ru: "Серия поворотов, первый налево (Zeichen 105-10).",
        },
      };
    case "A-4":
      return {
        ...sign,
        name: {
          en: "Double curve, first right",
          pl: "Dwa zakręty, pierwszy w prawo",
          ru: "Два поворота, первый направо",
        },
        meaning: {
          en: "A sequence of curves begins with a right (StVO Zeichen 105-20).",
          pl: "Seria zakrętów, pierwszy w prawo (Zeichen 105-20).",
          ru: "Серия поворотов, первый направо (Zeichen 105-20).",
        },
      };
    default:
      return sign;
  }
}

export const GERMAN_SIGNS: TrafficSign[] = POLISH_SIGNS.map((sign) =>
  make("DE", {
    code: sign.code,
    category: sign.category,
    shape: sign.shape,
    role: sign.role,
    glyph: "exclaim",
    en: sign.name.en,
    pl: sign.name.pl,
    ru: sign.name.ru,
    meaningEn: sign.meaning.en,
    meaningPl: sign.meaning.pl,
    meaningRu: sign.meaning.ru,
    speed:
      sign.code.startsWith("B-33-") || sign.code.startsWith("B-34-")
        ? Number(sign.code.split("-")[2])
        : undefined,
    roadText: sign.roadText,
  }),
)
  .map((sign, index) => ({
    ...sign,
    svg: sign.src ? sign.svg : (POLISH_SIGNS[index]?.svg ?? sign.svg),
  }))
  .map(germanPlateName);
