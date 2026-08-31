/**
 * Download official-style open-license road-sign SVGs from Wikimedia Commons.
 * Run: node scripts/fetch-official-signs.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "signs");
const MANIFEST = join(ROOT, "src", "content", "signs", "artwork-manifest.json");
const UA =
  "SygnalTrainer/1.0 (educational driving-rules PWA; fetching open-license official-style sign diagrams)";
const RETRIEVED = "2026-08-31";

/** @typedef {{ jurisdiction: string, code: string, titles: string[], standard: string }} Target */

const PL_CODES = [
  "A-1",
  "A-2",
  "A-3",
  "A-4",
  "A-5",
  "A-6a",
  "A-6b",
  "A-6c",
  "A-7",
  "A-8",
  "A-9",
  "A-10",
  "A-11",
  "A-11a",
  "A-12a",
  "A-12b",
  "A-12c",
  "A-14",
  "A-15",
  "A-16",
  "A-17",
  "A-18b",
  "A-20",
  "A-21",
  "A-24",
  "A-29",
  "A-30",
  "A-32",
  "A-33",
  "A-34",
  "B-1",
  "B-2",
  "B-5",
  "B-9",
  "B-20",
  "B-21",
  "B-22",
  "B-23",
  "B-25",
  "B-35",
  "B-36",
  "B-41",
  "C-1",
  "C-2",
  "C-4",
  "C-5",
  "C-12",
  "C-13",
  "C-16",
  "D-1",
  "D-2",
  "D-3",
  "D-6",
  "D-6b",
  "D-7",
  "D-40",
  "D-42",
  "D-43",
  "T-1",
  "T-6a",
];

const PL_SPEEDS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 140];

/** Polish catalog code → German StVO Zeichen number(s) to try. */
const PL_TO_DE = {
  "A-1": ["103-10", "103"],
  "A-2": ["103-20", "103"],
  "A-3": ["105-10", "105"],
  "A-4": ["105-20", "105"],
  "A-5": ["102"],
  "A-6a": ["102", "205"],
  "A-6b": ["102"],
  "A-6c": ["102"],
  "A-7": ["205"],
  "A-8": ["215"],
  "A-9": ["151"],
  "A-10": ["151"],
  "A-11": ["112"],
  "A-11a": ["112"],
  "A-12a": ["120"],
  "A-12b": ["121-20", "121"],
  "A-12c": ["121-10", "121"],
  "A-14": ["131"],
  "A-15": ["114"],
  "A-16": ["133-10", "133"],
  "A-17": ["136-10", "136"],
  "A-18b": ["142-10", "142"],
  "A-20": ["125"],
  "A-21": ["101"],
  "A-24": ["123"],
  "A-29": ["131"],
  "A-30": ["101"],
  "A-32": ["114"],
  "A-33": ["124"],
  "A-34": ["101"],
  "B-1": ["250"],
  "B-2": ["267"],
  "B-5": ["251"],
  "B-9": ["254"],
  "B-20": ["206"],
  "B-21": ["209", "214"],
  "B-22": ["209", "214"],
  "B-23": ["272"],
  "B-25": ["276"],
  "B-35": ["283"],
  "B-36": ["286"],
  "B-41": ["259"],
  "C-1": ["209-10", "209"],
  "C-2": ["209-20", "209"],
  "C-4": ["209-30", "209"],
  "C-5": ["209-30", "209"],
  "C-12": ["215"],
  "C-13": ["237"],
  "C-16": ["239"],
  "D-1": ["306"],
  "D-2": ["307"],
  "D-3": ["220-20", "220"],
  "D-6": ["350-10", "350"],
  "D-6b": ["237"],
  "D-7": ["330.1", "330"],
  "D-40": ["274.1"],
  "D-42": ["310"],
  "D-43": ["311"],
  "T-1": ["1004-30", "1004"],
  "T-6a": ["1002-10", "1002"],
};

/** Polish catalog code → GOST / DSTU diagram number. */
const PL_TO_GOST = {
  "A-1": "1.11.1",
  "A-2": "1.11.2",
  "A-3": "1.12.1",
  "A-4": "1.12.2",
  "A-5": "1.6",
  "A-6a": "1.21",
  "A-6b": "1.21",
  "A-6c": "1.6",
  "A-7": "2.4",
  "A-8": "1.7",
  "A-9": "1.1",
  "A-10": "1.2",
  "A-11": "1.16",
  "A-11a": "1.17",
  "A-12a": "1.20.1",
  "A-12b": "1.20.2",
  "A-12c": "1.20.3",
  "A-14": "1.8",
  "A-15": "1.15",
  "A-16": "1.22",
  "A-17": "1.23",
  "A-18b": "1.27",
  "A-20": "1.21",
  "A-21": "1.5",
  "A-24": "1.25",
  "A-29": "1.8",
  "A-30": "1.33",
  "A-32": "1.15",
  "A-33": "1.32",
  "A-34": "1.33",
  "B-1": "3.2",
  "B-2": "3.1",
  "B-5": "3.3",
  "B-9": "3.9",
  "B-20": "2.5",
  "B-21": "3.18.2",
  "B-22": "3.18.1",
  "B-23": "3.19",
  "B-25": "3.20",
  "B-35": "3.27",
  "B-36": "3.28",
  "B-41": "3.10",
  "C-1": "4.1.3",
  "C-2": "4.1.2",
  "C-4": "4.1.1",
  "C-5": "4.1.1",
  "C-12": "4.3",
  "C-13": "4.4.1",
  "C-16": "4.5.1",
  "D-1": "2.1",
  "D-2": "2.2",
  "D-3": "5.5",
  "D-6": "5.19.1",
  "D-6b": "4.4.1",
  "D-7": "5.1",
  "D-40": "5.31",
  "D-42": "5.23.1",
  "D-43": "5.24.1",
  "T-1": "8.1.1",
  "T-6a": "8.13",
};

const US_CODES = [
  "R1-1",
  "R1-2",
  "R5-1",
  "R3-1",
  "R3-2",
  "R4-7",
  "R6-1",
  "W1-1",
  "W1-2",
  "W2-1",
  "W3-1",
  "W3-3",
  "W4-1",
  "W8-1",
  "W8-5",
  "W10-1",
  "W11-1",
  "W11-2",
  "W11-3",
  "S1-1",
];

const US_SPEEDS = [25, 30, 35, 40, 45, 50, 55, 65];

function plTitles(code) {
  return [`File:PL road sign ${code}.svg`];
}

function deTitles(zeichen) {
  return [`File:Zeichen ${zeichen}.svg`];
}

function ruTitles(gost) {
  return [`File:RU road sign ${gost}.svg`, `File:${gost} Russian road sign.svg`];
}

function uaTitles(code) {
  return [`File:UA road sign ${code}.svg`];
}

function usTitles(code) {
  return [`File:MUTCD ${code}.svg`];
}

/** @type {Target[]} */
const targets = [];

for (const code of PL_CODES) {
  targets.push({
    jurisdiction: "PL",
    code,
    titles: plTitles(code),
    standard: "Poland: Rozporządzenie w sprawie znaków i sygnałów drogowych (Vienna Convention implementation)",
  });
}
for (const speed of PL_SPEEDS) {
  targets.push({
    jurisdiction: "PL",
    code: `B-33-${speed}`,
    titles: [
      `File:PL road sign B-33-${speed}.svg`,
      `File:PL road sign B-33 (${speed}).svg`,
      "File:PL road sign B-33.svg",
    ],
    standard: "Poland: B-33 speed limit (Rozporządzenie)",
  });
  targets.push({
    jurisdiction: "PL",
    code: `B-34-${speed}`,
    titles: [
      `File:PL road sign B-34-${speed}.svg`,
      `File:PL road sign B-34 (${speed}).svg`,
      "File:PL road sign B-34.svg",
    ],
    standard: "Poland: B-34 end of speed limit (Rozporządzenie)",
  });
}

for (const [plCode, zeichenList] of Object.entries(PL_TO_DE)) {
  targets.push({
    jurisdiction: "DE",
    code: plCode,
    titles: zeichenList.flatMap(deTitles),
    standard: "Germany: StVO / VzKat (Vienna Convention implementation)",
  });
}
for (const speed of PL_SPEEDS) {
  targets.push({
    jurisdiction: "DE",
    code: `B-33-${speed}`,
    titles: deTitles(`274-${speed}`).concat(deTitles("274")),
    standard: "Germany: StVO Zeichen 274",
  });
  targets.push({
    jurisdiction: "DE",
    code: `B-34-${speed}`,
    titles: deTitles(`278-${speed}`).concat(deTitles("278")),
    standard: "Germany: StVO Zeichen 278",
  });
}

function gostTargets(jurisdiction, standard) {
  for (const [plCode, gost] of Object.entries(PL_TO_GOST)) {
    const titles = jurisdiction === "RU" ? ruTitles(gost) : uaTitles(gost).concat(uaTitles(plCode));
    targets.push({ jurisdiction, code: plCode, titles, standard });
  }
  for (const speed of PL_SPEEDS) {
    const start = jurisdiction === "RU" ? `3.24-${speed}` : `3.29-${speed}`;
    const end = jurisdiction === "RU" ? `3.25-${speed}` : `3.31-${speed}`;
    targets.push({
      jurisdiction,
      code: `B-33-${speed}`,
      titles: jurisdiction === "RU" ? ruTitles(start).concat(ruTitles("3.24")) : uaTitles(start).concat(uaTitles("3.29")),
      standard,
    });
    targets.push({
      jurisdiction,
      code: `B-34-${speed}`,
      titles: jurisdiction === "RU" ? ruTitles(end).concat(ruTitles("3.25")) : uaTitles(end).concat(uaTitles("3.31")),
      standard,
    });
  }
}

gostTargets("RU", "Russia: GOST R 52290 / Vienna Convention");
gostTargets("UA", "Ukraine: DSTU 4100 / Vienna Convention");

// RU catalog remaps priority codes
for (const [code, gost] of [
  ["2.1", "2.1"],
  ["2.4", "2.4"],
  ["2.5", "2.5"],
]) {
  targets.push({
    jurisdiction: "RU",
    code,
    titles: ruTitles(gost),
    standard: "Russia: GOST R 52290",
  });
}

for (const code of US_CODES) {
  targets.push({
    jurisdiction: "US-CA",
    code,
    titles: usTitles(code),
    standard: "United States: FHWA MUTCD (US government work, public domain); California follows MUTCD",
  });
}
for (const speed of US_SPEEDS) {
  targets.push({
    jurisdiction: "US-CA",
    code: `R2-1-${speed}`,
    titles: [
      `File:MUTCD R2-1 (${speed}).svg`,
      `File:MUTCD_R2-1_${speed}.svg`,
      `File:Speed limit ${speed} sign.svg`,
      "File:MUTCD R2-1.svg",
    ],
    standard: "United States: FHWA MUTCD R2-1",
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiQuery(titles) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    redirects: "1",
    titles: titles.join("|"),
  });
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { "User-Agent": UA },
    });
    if (res.status === 429 || res.status === 503) {
      const wait = Number(res.headers.get("retry-after") ?? 8) * 1000 * (attempt + 1);
      console.error(`rate-limited ${res.status}, waiting ${wait}ms`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      throw new Error(`Commons API ${res.status}`);
    }
    return res.json();
  }
  throw new Error("Commons API 429 persisted");
}

async function download(url) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429 || res.status === 503) {
      await sleep(4000 * (attempt + 1));
      continue;
    }
    if (!res.ok) {
      throw new Error(`download ${res.status} ${url}`);
    }
    return res.text();
  }
  throw new Error(`download rate-limited ${url}`);
}

function firstExistingPage(data, requestedTitles) {
  const pages = Object.values(data.query?.pages ?? {});
  const normalized = new Map();
  for (const page of pages) {
    if (!page.missing && page.imageinfo?.[0]?.url) {
      normalized.set(page.title.replace(/ /g, "_").toLowerCase(), page);
      normalized.set(page.title.toLowerCase(), page);
    }
  }
  const redirects = data.query?.redirects ?? [];
  const redirectMap = new Map(
    redirects.map((r) => [r.from.replace(/ /g, "_").toLowerCase(), r.to]),
  );
  for (const title of requestedTitles) {
    const key = title.replace(/ /g, "_").toLowerCase();
    const dest = redirectMap.get(key) ?? title;
    const destKey = dest.replace(/ /g, "_").toLowerCase();
    const page =
      normalized.get(destKey) ||
      pages.find(
        (p) =>
          !p.missing &&
          p.imageinfo?.[0] &&
          p.title.replace(/ /g, "_").toLowerCase() === destKey,
      );
    if (page?.imageinfo?.[0]?.mime === "image/svg+xml") {
      return page;
    }
    if (page?.imageinfo?.[0]?.url?.includes(".svg")) {
      return page;
    }
  }
  return pages.find((p) => !p.missing && p.imageinfo?.[0]?.mime === "image/svg+xml") ?? null;
}

function licenseOf(page) {
  const meta = page.imageinfo?.[0]?.extmetadata ?? {};
  const shortName = meta.LicenseShortName?.value ?? "unknown";
  const licenseUrl = meta.LicenseUrl?.value ?? "";
  const artist = meta.Artist?.value?.replace(/<[^>]+>/g, "") ?? "";
  return { shortName, licenseUrl, artist };
}

const titleIndex = new Map();
const uniqueTitles = [...new Set(targets.flatMap((t) => t.titles))];
for (let i = 0; i < uniqueTitles.length; i += 40) {
  const slice = uniqueTitles.slice(i, i + 40);
  let data;
  try {
    data = await apiQuery(slice);
  } catch (error) {
    console.error("API batch failed", error);
    await new Promise((r) => setTimeout(r, 1500));
    data = await apiQuery(slice);
  }
  const pages = Object.values(data.query?.pages ?? {});
  const redirects = new Map(
    (data.query?.redirects ?? []).map((r) => [r.from.toLowerCase(), r.to]),
  );
  const normalized = new Map();
  for (const page of pages) {
    if (!page.missing && page.imageinfo?.[0]) {
      normalized.set(page.title.toLowerCase(), page);
      normalized.set(page.title.replace(/_/g, " ").toLowerCase(), page);
    }
  }
  for (const title of slice) {
    const dest = redirects.get(title.toLowerCase()) ?? title;
    const page =
      normalized.get(dest.toLowerCase()) ||
      normalized.get(dest.replace(/_/g, " ").toLowerCase());
    if (page) {
      titleIndex.set(title, page);
    }
  }
  await sleep(800);
}

const manifest = {
  retrieved: RETRIEVED,
  source: "Wikimedia Commons (diagrams traced from official plates / MUTCD SHS)",
  items: {},
};

let ok = 0;
let miss = 0;

for (const target of targets) {
  const key = `${target.jurisdiction}:${target.code}`;
  const page = target.titles.map((title) => titleIndex.get(title)).find(Boolean);
  if (!page?.imageinfo?.[0]) {
    continue;
  }
  const info = page.imageinfo[0];
  const svgUrl = String(info.url).split("?")[0];
  if (!svgUrl.endsWith(".svg") && info.mime !== "image/svg+xml") {
    continue;
  }
  let svg;
  try {
    svg = await download(svgUrl);
  } catch (error) {
    console.error("download failed", key, error.message);
    continue;
  }
  if (!svg.includes("<svg")) {
    continue;
  }
  const dir = join(OUT, target.jurisdiction);
  await mkdir(dir, { recursive: true });
  const filename = `${target.code}.svg`;
  await writeFile(join(dir, filename), svg, "utf8");
  const lic = licenseOf(page);
  manifest.items[key] = {
    src: `/signs/${target.jurisdiction}/${filename}`,
    commonsTitle: page.title,
    sourceUrl: `https://commons.wikimedia.org/wiki/${page.title.replace(/ /g, "_")}`,
    fileUrl: svgUrl,
    license: lic.shortName,
    licenseUrl: lic.licenseUrl,
    artist: lic.artist.slice(0, 200),
    standard: target.standard,
    retrieved: RETRIEVED,
    bytes: svg.length,
  };
  ok += 1;
  process.stdout.write(`OK ${key} ← ${page.title}\n`);
  await sleep(80);
}

for (const target of targets) {
  const key = `${target.jurisdiction}:${target.code}`;
  if (!manifest.items[key]?.src) {
    miss += 1;
    const borrowKeys = [
      `PL:${target.code}`,
      target.jurisdiction === "UA" ? `RU:${target.code}` : `UA:${target.code}`,
    ];
    let borrowed = null;
    for (const other of borrowKeys) {
      if (manifest.items[other]?.src) {
        borrowed = other;
        break;
      }
    }
    if (borrowed && target.jurisdiction !== "US-CA") {
      const from = manifest.items[borrowed];
      const dir = join(OUT, target.jurisdiction);
      await mkdir(dir, { recursive: true });
      const filename = `${target.code}.svg`;
      const sourceFile = join(ROOT, "public", from.src.replace(/^\//, ""));
      try {
        const { copyFile } = await import("node:fs/promises");
        await copyFile(sourceFile, join(dir, filename));
        manifest.items[key] = {
          ...from,
          src: `/signs/${target.jurisdiction}/${filename}`,
          borrowedFrom: borrowed,
          standard: `${target.standard} (Vienna-family plate borrowed from ${borrowed} — jurisdiction-specific Commons file not found)`,
          gap: false,
          borrowed: true,
        };
        process.stdout.write(`BORROW ${key} ← ${borrowed}\n`);
        miss -= 1;
        ok += 1;
        continue;
      } catch {
        // fall through to gap
      }
    }
    manifest.items[key] = {
      src: null,
      license: "fallback-official-geometry",
      standard: target.standard,
      retrieved: RETRIEVED,
      gap: true,
      tried: target.titles,
    };
    process.stdout.write(`GAP ${key}\n`);
  }
}

await mkdir(dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2), "utf8");
console.log(`\nDone. official=${ok} gaps=${miss} total=${targets.length}`);
