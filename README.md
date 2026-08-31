# Sygnal

Browser PWA for interactive driving-rules training. Micro-lessons (about 90 seconds to 4 minutes), real signs, and 3D freeze-frame scenes. Not an open-world driving simulator.

Language (`en` / `pl` / `ru`) is separate from jurisdiction (`PL`, `DE`, `US-CA`, `RU`, `UA`). A Russian UI on a California road still shows STOP.

## Stack

Next.js App Router, next-intl, React Three Fiber, Zustand, ts-fsrs, Vitest.

The right-of-way engine (`whoGoesFirst`) is pure TypeScript with tests. 3D only visualizes it.

## Scripts

```bash
npm run dev
npm test
npm run test:e2e
npm run test:e2e:visual
npm run build
npm start
```

Playwright talks to `http://127.0.0.1:3000` (`next start`). Visual baselines live in `e2e/visual.spec.ts-snapshots/`; 3D canvases are masked so WebGL noise is ignored. Update them with `npm run test:e2e:update`.

Open `/en`, `/pl`, or `/ru`. Add to Home Screen uses `public/manifest.webmanifest`.

## ADHD-first

Focus mode is the default: low 3D quality, reduced motion. No hearts. “Days at the wheel” can be paused without a penalty. Exam timers are not on the main path.

Sygnal is a training aid. It does not replace a driving school or an official exam.
