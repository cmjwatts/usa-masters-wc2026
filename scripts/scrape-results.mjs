// ============================================================
// AltiusRT results scraper — writes js/results.js
//
// Fills in COMPETITIONS below once the 2026 World Cup Schiedam
// competitions appear on https://masters.altiusrt.com/competitions
// (they publish shortly before the event; each division gets an id).
// Until then this script exits quietly and the workflow is a no-op.
//
// Run locally: node scripts/scrape-results.mjs
// ============================================================

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const resultsPath = new URL("../js/results.js", import.meta.url);

// Load whatever js/results.js currently has (if anything) so a division
// that fails to scrape this run keeps its last-known scores instead of
// disappearing from the output.
function loadExistingResults() {
  if (!existsSync(resultsPath)) return {};
  try {
    const text = readFileSync(resultsPath, "utf8");
    const match = text.match(/const RESULTS = (\{[\s\S]*?\});/);
    return match ? JSON.parse(match[1]) : {};
  } catch {
    return {};
  }
}

// division -> AltiusRT competition id (e.g. 512). null = not published yet.
// Schiedam (O35/O40) + Rotterdam (O45/O50; USA games only are on the site,
// but scraped scores merge by div|home|away so extras are harmless).
// Window 2 (Aug 6–16): Brasschaat/Antwerp (O55/O60 + W O65) + Breda (M O65).
const COMPETITIONS = {
  W35: null,
  W40: null,
  M35: null,
  M40: null,
  W45: null,
  W50: null,
  M45: null,
  M50: null,
  W35I: null, // 35/40W IMC competition
  W55: null,
  W60: null,
  W65: null,
  M55: null,
  M60: null,
  M65: null, // Breda
};

// Team codes used in js/data.js, with names AltiusRT might display.
const TEAM_NAMES = {
  ARG: ["argentina"], AUS: ["australia"], AUSB: ["australia b"],
  BEL: ["belgium"], CAN: ["canada"], CHI: ["chile"], CZE: ["czech republic", "czechia"],
  ENG: ["england"], ESP: ["spain"], FRA: ["france"], GER: ["germany"],
  GHA: ["ghana"], HKG: ["hong kong", "hong-kong", "hong kong china"], IND: ["india"],
  IRL: ["ireland"], ITA: ["italy"], KEN: ["kenya"], MAS: ["malaysia"],
  NED: ["netherlands"], NZL: ["new zealand"], PAR: ["paraguay"],
  RSA: ["south africa"], RSAB: ["south africa b"], SCO: ["scotland"],
  SGP: ["singapore"], SRI: ["sri lanka"], URU: ["uruguay"],
  USA: ["united states", "usa"], WAL: ["wales"], ZIM: ["zimbabwe"],
};

function toCode(text) {
  const t = text.trim().toLowerCase();
  for (const [code, names] of Object.entries(TEAM_NAMES)) {
    if (t === code.toLowerCase() || names.includes(t)) return code;
  }
  return null;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

async function scrapeDivision(div, id) {
  const url = `https://masters.altiusrt.com/competitions/${id}/matches`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (usa-masters-wc2026 fan hub)" } });
  if (!res.ok) throw new Error(`${div}: HTTP ${res.status} from ${url}`);
  const html = await res.text();

  const results = {};
  // Each match is a <tr>; cells hold team names and a "N - N" score.
  for (const row of html.split(/<tr[\s>]/).slice(1)) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => stripTags(m[1]));
    if (!cells.length) continue;
    const scoreCell = cells.find((c) => /^\d{1,2}\s*-\s*\d{1,2}$/.test(c));
    if (!scoreCell) continue; // unplayed or not a match row
    const codes = cells.map(toCode).filter(Boolean);
    if (codes.length < 2) continue;
    const [hs, as] = scoreCell.split("-").map((n) => parseInt(n, 10));
    // key format consumed by app.js: div|HOME|AWAY
    results[`${div}|${codes[0]}|${codes[1]}`] = [hs, as];
  }
  return results;
}

const all = loadExistingResults();
let configuredCount = 0;
let succeededCount = 0;
for (const [div, id] of Object.entries(COMPETITIONS)) {
  if (!id) continue;
  configuredCount++;
  try {
    const divResults = await scrapeDivision(div, id);
    // Replace this division's slice of the existing data with the fresh
    // scrape (so corrected/removed matches don't linger), but only once
    // we know the scrape actually succeeded.
    for (const key of Object.keys(all)) {
      if (key.startsWith(`${div}|`)) delete all[key];
    }
    Object.assign(all, divResults);
    succeededCount++;
    console.log(`${div}: ok`);
  } catch (e) {
    console.error(`${div}: ${e.message} (keeping previous results)`);
    // partial failure must not wipe/regress this division's existing
    // entries in `all` — they were loaded above and are left untouched.
  }
}

if (configuredCount === 0) {
  console.log("No competition ids configured yet — nothing to do.");
  process.exit(0);
}

if (succeededCount === 0) {
  console.error(
    `ERROR: ${configuredCount} division(s) configured but 0 scrapes succeeded — ` +
      `AltiusRT scraping is completely broken. Leaving js/results.js untouched.`
  );
  process.exit(1);
}

const updatedAt = new Date().toISOString();
const banner = `// AUTO-GENERATED by scripts/scrape-results.mjs — do not edit by hand.
// Source: masters.altiusrt.com · updated ${updatedAt}
`;
writeFileSync(
  resultsPath,
  `${banner}const RESULTS = ${JSON.stringify(all, null, 2)};\nwindow.RESULTS_UPDATED = "${updatedAt}";\n`
);
console.log(`Wrote ${Object.keys(all).length} results to js/results.js`);
