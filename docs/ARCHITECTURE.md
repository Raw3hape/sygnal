# Architecture

Sygnal is a Next.js 16 App Router PWA. UI language and road-rule packs are independent. The TypeScript right-of-way function is the answer key; React Three Fiber only draws the scene.

Agent map: [`../AGENTS.md`](../AGENTS.md). Sign licenses: [`../ATTRIBUTION.md`](../ATTRIBUTION.md).

## Layers

```mermaid
flowchart TB
  subgraph ui [UI]
    Pages["src/app/[locale]/*"]
    Components["src/components/*"]
    Scene3D["src/components/scene3d/*"]
  end
  subgraph state [Client state]
    Store["Zustand persist: sygnal-progress"]
  end
  subgraph content [Content]
    Lessons["lessons.ts"]
    Exam["exam.ts"]
    Pedagogy["pedagogy.ts"]
    Skills["skills.ts"]
    Scenes["scenes.ts"]
    Signs["signs catalogs"]
    Packs["jurisdictions.ts"]
  end
  subgraph engine [Engine of record]
    Who["whoGoesFirst.ts"]
  end
  Pages --> Components
  Components --> Store
  Components --> Lessons
  Components --> Exam
  Components --> Pedagogy
  Lessons --> Scenes
  Lessons --> Signs
  Lessons --> Skills
  Exam --> Signs
  Exam --> Scenes
  Pedagogy --> Who
  Pedagogy --> Signs
  Scenes --> Who
  Packs --> Who
  Scene3D -.->|"draws VisualScene; does not grade"| Scenes
  Scene3D -.->|"same /signs/... SVG plates"| Signs
  Components --> Scene3D
```

Request path: `src/proxy.ts` (next-intl) → `src/app/[locale]/layout.tsx` (`NextIntlClientProvider` + `AppShell`) → page → client component. Pages are thin; logic lives in `src/components/*` and `src/content/*`.

## Locale vs jurisdiction

```mermaid
flowchart LR
  URL["URL /en /pl /ru"] --> Proxy["src/proxy.ts"]
  Proxy --> Messages["messages/{locale}.json"]
  Messages --> Chrome["Chrome, nav, teach UI"]
  Store["sygnal-progress.jurisdictionId"] --> Graph["skills.ts"]
  Store --> Catalog["listSigns(id)"]
  Store --> Scenes["scenesFor / getScene"]
  Store --> Lessons["lessonsFor / buildExam"]
  Catalog --> Plates["public/signs/{id}/*.svg"]
  Graph --> Lessons
  Scenes --> Engine["whoGoesFirst(scene, id)"]
```

| Axis | Values | Where it lives | What it changes |
| --- | --- | --- | --- |
| Locale | `en`, `pl`, `ru` | URL prefix; next-intl | Chrome strings; `LocalizedName` pick |
| Jurisdiction | `PL`, `DE`, `US-CA`, `RU`, `UA` | Zustand `jurisdictionId` | Sign catalog, skill graph, scenes, generated lessons/exam, engine pack rules |

A Polish URL with `jurisdictionId: "US-CA"` shows MUTCD plates and four-way-stop defaults, with Polish chrome (`messages/pl.json`). Covered by `e2e/exam-i18n.spec.ts`.

Pack rules (`src/content/jurisdictions.ts`): Vienna vs MUTCD, `trafficHand`, `defaultRightOfWay`, `tramPriority`, speed unit, urban default speed. `whoGoesFirst` reads this via `getJurisdiction`.

US-CA skill graph omits Vienna-only nodes (`lights`, `roundabout`, `special`). DE/RU/UA still reuse some PL `sceneIds` for shared clips.

## Lesson item data flow

```mermaid
sequenceDiagram
  participant Player as LessonPlayer
  participant Grade as gradeItem
  participant Catalog as signs / scenes
  participant Engine as whoGoesFirst
  Note over Player,Catalog: 2D (sign-meaning, true-false, mcq without scene)
  Player->>Catalog: getSignById / item.correct
  Player->>Grade: answer === item.correct
  Grade-->>Player: GradeResult
  Note over Player,Engine: who-goes-first
  Player->>Catalog: getScene(sceneId)
  Player->>Engine: whoGoesFirst(scene, jurisdictionId)
  Engine-->>Player: order actor ids
  Player->>Grade: tap order vs order
  Note over Player,Catalog: hazard-tap / clip-choice / scene mcq
  Player->>Grade: targetId or canned correct index
```

| `LessonItem.type` | Learner action | Graded against |
| --- | --- | --- |
| `sign-meaning` | Pick a plate | `item.correct` (choice index) |
| `true-false` | Yes / no | `item.correct` |
| `mcq` | Pick copy | `item.correct` (may attach `sceneId` for the picture only) |
| `who-goes-first` | Tap actor **buttons** in order | `whoGoesFirst(scene, jurisdiction).order` |
| `hazard-tap` | Tap one actor | `item.targetId` |
| `clip-choice` | MCQ after a short clip | `item.correct` |

`src/content/grade.ts` is the only grader. `src/content/pedagogy.ts` explains the same item (and calls the engine for junction copy). `ts-fsrs` updates `progress.cards` after check.

Exam (`src/content/exam.ts`): 20 yes/no + 12 abc = 32 questions, points sum to 74, pass 68. Scene abc rows are WORD-style MCQ (`correct: 0`), not tap-order, even when a 3D scene is shown.

## 3D is visualization

`SceneCanvas` tries WebGPU then WebGL. `IntersectionSceneView` places vehicles and `SignBillboard` textures (`sign.src` or data-URI fallback SVG). Actor ids are exposed as HTML buttons (`Html` from drei) so tests and learners can click them.

Do not move grading into the canvas, shaders, or animation `clipT`.

## Client persist

Key: `sygnal-progress`. Default: `jurisdictionId: "PL"`, `attentionMode: "focus"`, `qualityOverride: "auto"`. Focus forces `detectQuality` → `low` regardless of override (`src/lib/useQuality.ts`).

XP: +10 per correct item plus +10 per finished lesson (`src/lib/xp.ts`). Driving days increment on lesson complete unless `drivingDays.paused`.

## Routes

| Path | Client |
| --- | --- |
| `/[locale]` | Onboarding or home (`HomeClient`) |
| `/[locale]/learn` | Skill path (`LearnClient`) |
| `/[locale]/lesson/[lessonId]` | `LessonPlayer` |
| `/[locale]/hub` | 3D town; skill buttons |
| `/[locale]/exam` | `ExamPlayer` |
| `/[locale]/drive` | Practice loop |
| `/[locale]/settings` | Locale links, jurisdiction, Focus/Play, quality |
