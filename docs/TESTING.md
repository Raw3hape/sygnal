# Testing

Unit tests are Vitest. Browser tests are Playwright against `next start` on `http://127.0.0.1:3000`.

Agent map: [`../AGENTS.md`](../AGENTS.md).

## Unit (Vitest)

```bash
npm test              # vitest run
npm run test:watch    # vitest
```

Config: `vitest.config.mts` (`environment: "node"`, `include: src/**/*.test.ts(x)`). Engine and content tests colocated with source (`whoGoesFirst.test.ts`, `lessons.test.ts`, `signs.test.ts`, …).

```bash
npx tsc --noEmit
npm run lint
```

## E2E (Playwright)

`playwright.config.ts` starts `npm run start -- --port 3000` (`reuseExistingServer: true`). **Build first** or the webServer will serve a stale/missing production bundle:

```bash
npm run build
npm run test:e2e
```

Specs in `e2e/`:

| File | Covers |
| --- | --- |
| `onboarding-learn.spec.ts` | Locale/jurisdiction onboarding, learn lock path, 2D grade |
| `exam-i18n.spec.ts` | 32 questions, no timer, locale ≠ pack |
| `priority-3d.spec.ts` | Who-goes-first via actor **buttons**, hub skill button, drive canvas |
| `visual.spec.ts` | Full-page screenshots (desktop + Pixel 7) |

Seeded progress: `e2e/helpers.ts` writes localStorage key `sygnal-progress` (Zustand persist payload). Keep that key and `{ state, version }` shape if you change the store.

Actor overlays are `getByRole("button", { name })`. Wait for them; they can lag the `<canvas>`.

## Visual snapshots

```bash
npm run test:e2e:visual
npm run test:e2e:update
```

Baselines: `e2e/visual.spec.ts-snapshots/`. 3D tests **mask** `page.locator("canvas")` so WebGL/WebGPU noise is ignored (Playwright paints the mask magenta in the diff — that is not a missing texture).

`beforeShot` waits for fonts/images and uses `reducedMotion: "reduce"`. `maxDiffPixelRatio` is `0.03`.

Do not update snapshots unless the intentional UI changed. Unrelated chrome diffs belong with the UI change, not with docs.
