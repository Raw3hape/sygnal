import { assertNever } from "@/engine/geometry";
import type { SignShape } from "./types";

const RED = "#e30613";
const BLUE = "#0055a5";
const YELLOW = "#f5c400";
const BLACK = "#111111";
const WHITE = "#ffffff";
const MUTCD_YELLOW = "#ffd100";
const MUTCD_RED = "#c8102e";

export type Glyph =
  | "none"
  | "curve-left"
  | "curve-right"
  | "double-curve"
  | "cross"
  | "side-right"
  | "side-left"
  | "roundabout"
  | "children"
  | "pedestrian"
  | "bike"
  | "tram"
  | "lights"
  | "slippery"
  | "bump"
  | "narrow"
  | "work"
  | "deer"
  | "ice"
  | "camera"
  | "queue"
  | "exclaim"
  | "rail"
  | "no-entry"
  | "no-left"
  | "no-right"
  | "no-u"
  | "no-overtake"
  | "no-parking"
  | "no-stop"
  | "arrow-left"
  | "arrow-right"
  | "arrow-up"
  | "arrow-round"
  | "priority"
  | "end-priority"
  | "one-way"
  | "crossing"
  | "city"
  | "highway"
  | "speed";

function glyphMarkup(glyph: Glyph, fill = BLACK): string {
  switch (glyph) {
    case "none":
      return "";
    case "curve-left":
      return `<path d="M62 28 Q78 50 50 72 Q28 88 28 70" fill="none" stroke="${fill}" stroke-width="7" stroke-linecap="round"/>`;
    case "curve-right":
      return `<path d="M38 28 Q22 50 50 72 Q72 88 72 70" fill="none" stroke="${fill}" stroke-width="7" stroke-linecap="round"/>`;
    case "double-curve":
      return `<path d="M30 30 Q45 45 50 50 Q70 70 70 78" fill="none" stroke="${fill}" stroke-width="7" stroke-linecap="round"/>`;
    case "cross":
      return `<path d="M50 22 V78 M22 50 H78" stroke="${fill}" stroke-width="8" stroke-linecap="round"/>`;
    case "side-right":
      return `<path d="M38 22 V78 M38 50 H78" stroke="${fill}" stroke-width="8" stroke-linecap="round"/>`;
    case "side-left":
      return `<path d="M62 22 V78 M62 50 H22" stroke="${fill}" stroke-width="8" stroke-linecap="round"/>`;
    case "roundabout":
      return `<circle cx="50" cy="50" r="16" fill="none" stroke="${fill}" stroke-width="7"/><path d="M50 22 L56 32 H44 Z" fill="${fill}"/>`;
    case "children":
      return `<circle cx="38" cy="38" r="6" fill="${fill}"/><path d="M38 46 L38 66 L28 80 M38 66 L48 80 M38 52 L26 58" stroke="${fill}" stroke-width="4" fill="none"/><circle cx="62" cy="36" r="6" fill="${fill}"/><path d="M62 44 L62 68 L54 80 M62 68 L72 80" stroke="${fill}" stroke-width="4" fill="none"/>`;
    case "pedestrian":
      return `<circle cx="50" cy="32" r="7" fill="${fill}"/><path d="M50 40 L50 62 L40 80 M50 62 L62 80 M50 48 L34 54" stroke="${fill}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    case "bike":
      return `<circle cx="34" cy="62" r="12" fill="none" stroke="${fill}" stroke-width="5"/><circle cx="70" cy="62" r="12" fill="none" stroke="${fill}" stroke-width="5"/><path d="M34 62 L50 40 H64 L70 62 M50 40 L46 62" stroke="${fill}" stroke-width="5" fill="none"/>`;
    case "tram":
      return `<rect x="28" y="34" width="44" height="24" rx="4" fill="${fill}"/><rect x="34" y="40" width="10" height="8" fill="${WHITE}"/><rect x="56" y="40" width="10" height="8" fill="${WHITE}"/><path d="M30 70 H70" stroke="${fill}" stroke-width="5"/>`;
    case "lights":
      return `<rect x="40" y="24" width="20" height="52" rx="6" fill="${fill}"/><circle cx="50" cy="36" r="5" fill="${RED}"/><circle cx="50" cy="50" r="5" fill="${YELLOW}"/><circle cx="50" cy="64" r="5" fill="#1f9d55"/>`;
    case "slippery":
      return `<path d="M28 70 Q40 40 50 55 Q62 72 74 42" fill="none" stroke="${fill}" stroke-width="7" stroke-linecap="round"/>`;
    case "bump":
      return `<path d="M20 70 H36 Q50 34 64 70 H80" fill="none" stroke="${fill}" stroke-width="7" stroke-linecap="round"/>`;
    case "narrow":
      return `<path d="M24 24 L40 50 L24 76 M76 24 L60 50 L76 76" stroke="${fill}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    case "work":
      return `<path d="M32 70 V46 H68 V70 M40 46 V32 H60 V46" stroke="${fill}" stroke-width="6" fill="none"/><rect x="28" y="70" width="44" height="8" fill="${fill}"/>`;
    case "deer":
      return `<path d="M30 70 L44 48 L50 32 L56 48 L70 70 M44 48 H56 M38 36 L32 24 M62 36 L68 24" stroke="${fill}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    case "ice":
      return `<path d="M50 24 L56 44 H76 L60 56 L66 76 L50 64 L34 76 L40 56 L24 44 H44 Z" fill="${fill}"/>`;
    case "camera":
      return `<rect x="28" y="38" width="44" height="28" rx="4" fill="${fill}"/><circle cx="50" cy="52" r="8" fill="${WHITE}"/><rect x="40" y="30" width="12" height="8" fill="${fill}"/>`;
    case "queue":
      return `<path d="M30 70 H70 M36 58 H64 M42 46 H58" stroke="${fill}" stroke-width="7" stroke-linecap="round"/>`;
    case "exclaim":
      return `<rect x="46" y="28" width="8" height="32" rx="2" fill="${fill}"/><circle cx="50" cy="72" r="5" fill="${fill}"/>`;
    case "rail":
      return `<path d="M28 70 H72 M34 28 V70 M66 28 V70 M28 40 H72 M28 52 H72" stroke="${fill}" stroke-width="6"/>`;
    case "no-entry":
      return `<rect x="22" y="44" width="56" height="12" rx="2" fill="${WHITE}"/>`;
    case "no-left":
      return `<path d="M64 70 V40 H40" stroke="${fill}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M50 28 L34 40 L50 52" fill="${fill}"/>`;
    case "no-right":
      return `<path d="M36 70 V40 H60" stroke="${fill}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M50 28 L66 40 L50 52" fill="${fill}"/>`;
    case "no-u":
      return `<path d="M34 70 V42 Q34 26 50 26 Q66 26 66 42 V58" fill="none" stroke="${fill}" stroke-width="8"/><path d="M66 70 L58 54 H74 Z" fill="${fill}"/>`;
    case "no-overtake":
      return `<rect x="24" y="40" width="22" height="28" rx="4" fill="${fill}"/><rect x="54" y="40" width="22" height="28" rx="4" fill="${RED}"/>`;
    case "no-parking":
      return `<text x="50" y="62" text-anchor="middle" font-size="36" font-weight="700" fill="${fill}" font-family="Arial,sans-serif">P</text>`;
    case "no-stop":
      return `<text x="50" y="62" text-anchor="middle" font-size="28" font-weight="700" fill="${fill}" font-family="Arial,sans-serif">S</text>`;
    case "arrow-left":
      return `<path d="M78 50 H36" stroke="${WHITE}" stroke-width="10"/><path d="M44 30 L18 50 L44 70 Z" fill="${WHITE}"/>`;
    case "arrow-right":
      return `<path d="M22 50 H64" stroke="${WHITE}" stroke-width="10"/><path d="M56 30 L82 50 L56 70 Z" fill="${WHITE}"/>`;
    case "arrow-up":
      return `<path d="M50 78 V36" stroke="${WHITE}" stroke-width="10"/><path d="M30 44 L50 18 L70 44 Z" fill="${WHITE}"/>`;
    case "arrow-round":
      return `<path d="M50 28 A22 22 0 1 1 28 50" fill="none" stroke="${WHITE}" stroke-width="8"/><path d="M50 16 L58 32 H42 Z" fill="${WHITE}"/>`;
    case "priority":
      return "";
    case "end-priority":
      return `<path d="M22 22 L78 78" stroke="${BLACK}" stroke-width="8"/>`;
    case "one-way":
      return `<path d="M22 50 H64" stroke="${WHITE}" stroke-width="10"/><path d="M56 30 L82 50 L56 70 Z" fill="${WHITE}"/>`;
    case "crossing":
      return `<rect x="28" y="28" width="12" height="44" fill="${fill}"/><rect x="46" y="28" width="12" height="44" fill="${WHITE}"/><rect x="60" y="28" width="12" height="44" fill="${fill}"/>`;
    case "city":
      return `<path d="M28 70 V44 L40 32 L52 44 V70 Z M52 70 V36 L70 24 V70 Z" fill="${fill}"/>`;
    case "highway":
      return `<path d="M30 74 L44 22 H56 L70 74 Z" fill="${fill}"/><path d="M50 34 V62" stroke="${WHITE}" stroke-width="5" stroke-dasharray="6 6"/>`;
    case "speed":
      return "";
    default:
      return assertNever(glyph);
  }
}

function wrap(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img">${inner}</svg>`;
}

export function renderSignSvg(
  shape: SignShape,
  glyph: Glyph,
  options?: { speed?: number; label?: string },
): string {
  const pictogram = glyphMarkup(glyph);
  const speed = options?.speed;
  const label = options?.label;

  switch (shape) {
    case "warning-triangle":
      return wrap(
        `<path d="M50 8 L92 88 H8 Z" fill="${WHITE}" stroke="${RED}" stroke-width="8" stroke-linejoin="round"/>${pictogram}`,
      );
    case "yield-inverted-triangle":
      return wrap(
        `<path d="M50 92 L8 12 H92 Z" fill="${WHITE}" stroke="${RED}" stroke-width="8" stroke-linejoin="round"/>`,
      );
    case "stop-octagon":
      return wrap(
        `<path d="M35 6 H65 L94 35 V65 L65 94 H35 L6 65 V35 Z" fill="${MUTCD_RED}" stroke="${WHITE}" stroke-width="4"/>
         <text x="50" y="58" text-anchor="middle" font-size="18" font-weight="800" fill="${WHITE}" font-family="Arial,sans-serif">${label ?? "STOP"}</text>`,
      );
    case "prohibitory-circle": {
      const slash =
        glyph === "no-left" ||
        glyph === "no-right" ||
        glyph === "no-u" ||
        glyph === "no-overtake" ||
        glyph === "no-parking" ||
        glyph === "no-stop"
          ? `<path d="M24 24 L76 76" stroke="${RED}" stroke-width="8"/>`
          : "";
      const speedText =
        speed !== undefined
          ? `<text x="50" y="62" text-anchor="middle" font-size="36" font-weight="800" fill="${BLACK}" font-family="Arial,sans-serif">${speed}</text>`
          : pictogram;
      return wrap(
        `<circle cx="50" cy="50" r="44" fill="${WHITE}" stroke="${RED}" stroke-width="8"/>${speedText}${slash}`,
      );
    }
    case "mandatory-circle":
      return wrap(
        `<circle cx="50" cy="50" r="44" fill="${BLUE}" stroke="${WHITE}" stroke-width="4"/>${pictogram}`,
      );
    case "priority-diamond":
      return wrap(
        `<path d="M50 6 L94 50 L50 94 L6 50 Z" fill="${YELLOW}" stroke="${WHITE}" stroke-width="6"/>${pictogram}`,
      );
    case "info-rectangle":
      return wrap(
        `<rect x="8" y="14" width="84" height="72" rx="6" fill="${BLUE}" stroke="${WHITE}" stroke-width="4"/>${pictogram}
         ${label ? `<text x="50" y="62" text-anchor="middle" font-size="18" font-weight="700" fill="${WHITE}" font-family="Arial,sans-serif">${label}</text>` : ""}`,
      );
    case "mutcd-diamond":
      return wrap(
        `<path d="M50 6 L94 50 L50 94 L6 50 Z" fill="${MUTCD_YELLOW}" stroke="${BLACK}" stroke-width="5"/>${pictogram}`,
      );
    case "mutcd-yield":
      return wrap(
        `<path d="M50 92 L8 12 H92 Z" fill="${WHITE}" stroke="${MUTCD_RED}" stroke-width="10" stroke-linejoin="round"/>
         <text x="50" y="48" text-anchor="middle" font-size="12" font-weight="800" fill="${MUTCD_RED}" font-family="Arial,sans-serif">YIELD</text>`,
      );
    case "mutcd-stop":
      return wrap(
        `<path d="M35 6 H65 L94 35 V65 L65 94 H35 L6 65 V35 Z" fill="${MUTCD_RED}" stroke="${WHITE}" stroke-width="4"/>
         <text x="50" y="58" text-anchor="middle" font-size="18" font-weight="800" fill="${WHITE}" font-family="Arial,sans-serif">STOP</text>`,
      );
    case "mutcd-speed-rect":
      return wrap(
        `<rect x="18" y="8" width="64" height="84" rx="4" fill="${WHITE}" stroke="${BLACK}" stroke-width="4"/>
         <text x="50" y="28" text-anchor="middle" font-size="9" font-weight="700" fill="${BLACK}" font-family="Arial,sans-serif">SPEED</text>
         <text x="50" y="40" text-anchor="middle" font-size="9" font-weight="700" fill="${BLACK}" font-family="Arial,sans-serif">LIMIT</text>
         <text x="50" y="78" text-anchor="middle" font-size="36" font-weight="800" fill="${BLACK}" font-family="Arial,sans-serif">${speed ?? 25}</text>`,
      );
    case "mutcd-do-not-enter":
      return wrap(
        `<circle cx="50" cy="50" r="44" fill="${MUTCD_RED}" stroke="${WHITE}" stroke-width="6"/>
         <rect x="18" y="42" width="64" height="16" fill="${WHITE}"/>`,
      );
    default:
      return assertNever(shape);
  }
}
