<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Sygnal — agent guide

Primary entry for coding agents. Humans: [`README.md`](./README.md). Architecture diagrams: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md). Test commands: [`docs/TESTING.md`](./docs/TESTING.md). Sign licenses: [`ATTRIBUTION.md`](./ATTRIBUTION.md).

Work from this repo. Do not invent tribal knowledge (jurisdiction packs, locale split, engine vs 3D).

## Product facts

- Training PWA for road signs and right-of-way. Not a driving simulator.
- **Locale ≠ jurisdiction.** URL locale is UI language. `jurisdictionId` in Zustand selects signs, scenes, skills, lessons, and exam.
- Default jurisdiction is `PL`. Default attention mode is `focus` (forces low 3D quality).
- No lives / hearts. Crowns on a skill are `min(5, completedLessonIds.length)`, not a fail-out mechanic.
- “Days at the wheel” (`drivingDays`) can be paused (`paused: true`) with no penalty.
- Exam is 32 WORD-style questions, 74 points, pass at 68. No countdown timer on the main path.

## Repo map

| Path | Role |
| --- | --- |
| `src/engine/whoGoesFirst.ts` | **Engine of record** for tap-order / who-goes-first |
| `src/engine/geometry.ts` | Approaches, `assertNever`, path destinations |
| `src/engine/types.ts` | `JurisdictionId`, `AppLocale`, scene/actor unions |
| `src/content/lessons.ts` | Lesson items (2D + 3D types) |
| `src/content/exam.ts` | `buildExam`, `examPassMark` (68 / 74) |
| `src/content/scenes.ts` | Freeze-frame junctions (`VisualScene`) |
| `src/content/pedagogy.ts` | Hints / why-correct / why-wrong copy |
| `src/content/skills.ts` | Skill graph per jurisdiction |
| `src/content/jurisdictions.ts` | Pack metadata (Vienna vs MUTCD, tram rule, speed unit) |
| `src/content/signs/` | Catalogs + artwork resolution |
| `src/content/grade.ts` | `gradeItem` (2D keys vs engine order) |
| `src/app/[locale]/` | Routes: `/`, `/learn`, `/lesson/[lessonId]`, `/hub`, `/exam`, `/drive`, `/settings` |
| `src/components/` | UI. `scene3d/` is visualization only |
| `src/lib/useProgress.ts` | Zustand persist key `sygnal-progress` |
| `src/proxy.ts` | next-intl middleware (Next.js 16 `proxy`, not `middleware.ts`) |
| `src/i18n/` | `routing.ts` (`localePrefix: "always"`), `request.ts`, `navigation.ts` |
| `messages/{en,pl,ru}.json` | UI chrome + nested domain strings |
| `public/signs/{PL,DE,US-CA,RU,UA}/*.svg` | Official plates |
| `scripts/fetch-official-signs.mjs` | Re-fetch plates + rewrite the manifest |
| `e2e/` | Playwright. Visual baselines in `e2e/visual.spec.ts-snapshots/` |

`@/` maps to `src/` (`tsconfig.json`).

## Engine of record

`whoGoesFirst(scene, jurisdictionId)` in `src/engine/whoGoesFirst.ts` returns `{ order: string[], reasonKeys }`. Rank vector (lower wins): pedestrian → emergency with lights → already in junction → traffic light → tram (if pack says so) → sign role → four-way arrival time → yield-to-the-right → left vs oncoming.

**3D never decides the answer.** `IntersectionSceneView` draws `VisualScene` from `src/content/scenes.ts`. `gradeItem` for `who-goes-first` compares the learner’s tap order to `whoGoesFirst(...).order`.

Exam **abc** items that include a `sceneId` are still multiple-choice with a canned `correct` index (not tap-order). Pedagogy may still call the engine to explain the picture.

## Content

- Signs: `src/content/signs/pl.ts` (PL + DE), `us.ts` (US-CA), `ru.ts` (RU + UA). `listSigns` / `getSign` / `getSignById` in `index.ts`.
- Artwork: `artwork.ts` reads `artwork-manifest.json`. `SignSvg` prefers `sign.src` (`/signs/{jurisdiction}/{code}.svg`); otherwise inline geometry from `svg.ts`.
- Lessons: `lessonsFor(jurisdiction, skillId)` builds `sign-meaning` + `true-false` chunks from catalog categories, and a `*-scenes` lesson (`who-goes-first`, optional `clip-choice` / `hazard-tap` / `mcq`) from `skill.sceneIds`.
- Some DE/RU/UA skills still reference PL scene ids (shared clips). That is intentional until those packs have their own scenes — do not “fix” by deleting them.
- Sign names/meanings and many prompts are `LocalizedName` `{ en, pl, ru }` on content objects (`localeText` / `pickLocalized`), not only `messages/*.json`.

## Official plates

- Files: `public/signs/{PL,DE,US-CA,RU,UA}/*.svg`
- Manifest: `src/content/signs/artwork-manifest.json`
- Licenses: [`ATTRIBUTION.md`](./ATTRIBUTION.md)
- Fetch: `node scripts/fetch-official-signs.mjs`

**Do not invent, generate, or restyle sign artwork.** Add catalog ids + fetch targets, or a labeled geometric fallback. Vienna packs may `borrowed` a PL/GOST plate when Commons has no jurisdiction-specific file; that is still an official diagram.

## i18n

- Locales: `en`, `pl`, `ru` (`src/engine/types.ts` `LOCALES`). Default `en`. Prefix always (`/en/...`).
- Middleware: `src/proxy.ts` → `next-intl/middleware` + `src/i18n/routing.ts`.
- Messages: `messages/{en,pl,ru}.json` must stay in lockstep.
- **Nested keys only for domain strings.** Use objects (`skills.warning-signs`, `jurisdictions.PL`, `reason.yieldToRight`, `teach.hint`). Do not add a single JSON key whose name contains `.` — next-intl treats dots as paths.
- Root-level chrome keys (`appName`, `learn`, `check`, …) already exist; keep new chrome at the root or under an existing namespace, not as `"teach.hint"` flattened.
- Navigation: `src/i18n/navigation.ts` (`Link`, `useRouter`, …). Do not use next/link for in-app locale routes.

## State

Zustand + persist, store name **`sygnal-progress`** (`src/lib/useProgress.ts`). Shape: `src/lib/progress.ts` (`jurisdictionId`, `attentionMode`, `qualityOverride`, `xp`, `collectedSignIds`, `skills`, `cards`, `drivingDays`, `onboardingComplete`).

E2E seeds this key via `e2e/helpers.ts` (`persistPayload` / `gotoSeeded`). Keep the persist name and `state` wrapper stable or update helpers.

Spaced repetition: `ts-fsrs` in `src/lib/scheduler.ts`, cards stored in `progress.cards`.

## 3D

- R3F + drei. Canvas: `src/components/scene3d/SceneCanvas.tsx` — try **WebGPU** (`three/webgpu`), then **WebGL**.
- Quality: `src/lib/quality.ts`. Focus mode → always `low`. Override is ignored while Focus is on.
- **Actor labels are HTML `<button>`s** (`Html` from drei in `IntersectionSceneView` and `HubWorld`). Playwright and learners click those buttons. Do not replace them with canvas-only picking.
- Hub / drive / lesson canvases are visualization. Mask `<canvas>` in visual snapshots (`docs/TESTING.md`).

## ADHD / UX rules

- Focus is the default. No hearts. Pauseable days. No exam timer on the main path.
- Prefer short copy. Teach panels come from `pedagogy.ts`, not ad-hoc strings in the player.

## Conventions

- Imports at the **top of the module**. No inline `import()` in function bodies except the existing R3F `dynamic(...)` / WebGPU renderer load.
- `switch` on unions/enums: handle every variant; `default` must `assertNever` / `const exhaustive: never`.
- Colocate unit tests as `src/**/*.test.ts`.

## Tests

```bash
npm test                 # Vitest
npx tsc --noEmit         # types (no standalone typecheck script)
npm run build && npm run test:e2e
npm run test:e2e:visual
npm run test:e2e:update  # refresh screenshots
```

Details: [`docs/TESTING.md`](./docs/TESTING.md).

## Do not

- Invent sign artwork or treat 3D as the answer key.
- Collapse locale into jurisdiction (or the reverse).
- Edit plan files under `/opt/cursor/artifacts`.
- Restyle the product (`globals.css`, visual chrome) unless the task is explicitly UI.
- Remove the `BEGIN:nextjs-agent-rules` block at the top of this file (`next dev` will put it back).
