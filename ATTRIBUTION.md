# Sign artwork attribution

Sygnal does not use generative drawings for traffic signs. Plates are either:

1. **Official-style open-license SVGs** from [Wikimedia Commons](https://commons.wikimedia.org/), retrieved 2026-08-31. Those diagrams are traced from current public traffic-sign plates (not folklore doodles).
2. **Geometric fallbacks** in `src/content/signs/svg.ts` that only reproduce the legally defined *shape family* (Vienna triangle / ring / diamond, MUTCD diamond / octagon / YIELD). Fallbacks are labeled in the catalog (`artwork: "fallback"`) and listed as gaps in `src/content/signs/artwork-manifest.json`.

## Standards

| Pack | Standard | Typical Commons pattern | License (as published on Commons) |
| --- | --- | --- | --- |
| Poland | Rozporządzenie w sprawie znaków i sygnałów drogowych (Vienna Convention implementation) | `PL road sign {code}.svg` | Usually public domain (`{{Polishsymbol}}` / official symbol) |
| Germany | StVO / VzKat | `Zeichen {number}.svg` | Usually public domain (official traffic sign) |
| US-CA | FHWA MUTCD (US government work); California follows MUTCD | `MUTCD {code}.svg` | Public domain |
| Russia | GOST R 52290 | `RU road sign {code}.svg` | Public domain or CC BY-SA, per file |
| Ukraine | DSTU 4100 | `UA road sign {code}.svg` | Public domain or CC BY-SA, per file |

Per-file title, license short name, source URL, and retrieval date are in `src/content/signs/artwork-manifest.json`. 3D billboards load the same `/signs/{jurisdiction}/{code}.svg` files as the 2D lessons.

Vienna-family packs may reuse a Polish or GOST official diagram when a jurisdiction-specific Commons file was not found; the manifest marks those as `borrowed`. That is still a traced official plate, not a generated picture.

## Remaining geometric fallbacks

As of 2026-08-31 the only catalog ids without a numeral-accurate Commons SVG are US MUTCD speed limits **R2-1-30 / 35 / 40 / 45 / 55 / 65**. Commons publishes a generic `MUTCD R2-1.svg` (25 mph template) and a 50 mph plate; those two are used. The other speeds use the MUTCD vertical-rectangle geometry in `svg.ts` with the correct number, labeled `artwork: "fallback"` in the catalog.

Re-fetch: `node scripts/fetch-official-signs.mjs`.
