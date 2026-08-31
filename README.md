# Sygnal

Browser PWA for interactive driving-rules training: short micro-lessons, official-style sign plates, and freeze-frame 3D junctions. It is not an open-world driving simulator.

**Locale is not jurisdiction.** UI language (`en` / `pl` / `ru` in the URL) is independent of the road pack (`PL`, `DE`, `US-CA`, `RU`, `UA` in client state). A Russian UI on a California pack still shows MUTCD STOP.

Sygnal is a training aid. It does not replace a driving school or an official exam.

## Stack

Next.js 16 App Router, next-intl, React Three Fiber, Zustand, ts-fsrs, Vitest, Playwright.

Right-of-way answers come from TypeScript (`src/engine/whoGoesFirst.ts`), not from the 3D scene. 3D only visualizes scenes.

Agents: start at [`AGENTS.md`](./AGENTS.md). Architecture: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md). Tests: [`docs/TESTING.md`](./docs/TESTING.md). Sign licenses: [`ATTRIBUTION.md`](./ATTRIBUTION.md).

## Scripts

```bash
npm install
npm run dev          # http://localhost:3000 — open /en, /pl, or /ru
npm test             # Vitest (engine + content)
npm run build
npm start            # production server Playwright uses
npm run test:e2e     # Playwright (needs a prior build; see docs/TESTING.md)
npm run lint
```

## Official sign plates

Do not draw or generate sign artwork. Fetch Commons / MUTCD SVGs:

```bash
node scripts/fetch-official-signs.mjs
```

Files land in `public/signs/{PL,DE,US-CA,RU,UA}/`. Per-file license and source URL: `src/content/signs/artwork-manifest.json`. Legal summary: [`ATTRIBUTION.md`](./ATTRIBUTION.md). Geometric fallbacks (shape family only) live in `src/content/signs/svg.ts` and are labeled `artwork: "fallback"`.

## PWA

`public/manifest.webmanifest` (`start_url`: `/en`, `display`: `standalone`). Icon: `public/icon.svg`. Add to Home Screen from the browser; there is no native wrapper.
