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
const resultsAugPath = new URL("../js/results-aug.js", import.meta.url);

// Load whatever a results file currently has (if anything) so a division
// that fails to scrape this run keeps its last-known scores instead of
// disappearing from the output.
function loadExistingResults(path, constName) {
  if (!existsSync(path)) return {};
  try {
    const text = readFileSync(path, "utf8");
    const match = text.match(new RegExp(`const ${constName} = (\\{[\\s\\S]*?\\});`));
    return match ? JSON.parse(match[1]) : {};
  } catch {
    return {};
  }
}

// division -> AltiusRT competition id (discovered 2026-07-17 from
// masters.altiusrt.com/competitions/<id>; each page names its division).
// Window 1 (Jul 22 – Aug 1) -> js/results.js (RESULTS, read by july.html):
const COMPETITIONS = {
  W35: 478, // 2026 WC Schiedam W35
  W40: 479, // 2026 WC Schiedam W40
  M35: 480, // 2026 WC Schiedam M35
  M40: 481, // 2026 WC Schiedam M40
  W45: 482, // 2026 World Cup Rotterdam W45
  W50: 483, // 2026 World Cup Rotterdam W50
  M45: 484, // 2026 World Cup Rotterdam M45
  M50: 485, // 2026 World Cup Rotterdam M50
  W35I: 486, // 2026 Rotterdam IMC W35/40
};
// Window 2 (Aug 6–16) -> js/results-aug.js (RESULTS_AUG, read by brasschaat.html):
const COMPETITIONS_AUG = {
  W55: 494, // 2026 World Cup Brasschaat W55
  W60: 495, // 2026 World Cup Brasschaat W60
  W65: 496, // 2026 World Cup Brasschaat W65
  M55: 498, // 2026 World Cup Brasschaat M55
  M60: 499, // 2026 World Cup Brasschaat M60
  M65: 506, // 2026 World Cup Breda M65
};

// Team codes used in js/data.js, with names AltiusRT might display.
const TEAM_NAMES = {
  ARG: ["argentina"], AUS: ["australia"], AUSB: ["australia b", "aus b"],
  BAN: ["bangladesh"],
  BEL: ["belgium"], CAN: ["canada"], CHI: ["chile"], CZE: ["czech republic", "czechia"],
  ENG: ["england"], ESP: ["spain"], FRA: ["france"], GER: ["germany"],
  GHA: ["ghana"], HKG: ["hong kong", "hong-kong", "hong kong china"], IND: ["india"],
  IRL: ["ireland"], ITA: ["italy"], JPN: ["japan"], KEN: ["kenya"], MAS: ["malaysia"],
  PAK: ["pakistan"],
  // IMC sides (Rotterdam W35/40 IMC, comp 486). AltiusRT displays them as
  // short codes + age group, e.g. "ALL W35 v USAB W35 (WIMC35)" — observed
  // in the 2026-07-23 scrape logs. USA's IMC side shows as "USAB W35" but
  // is keyed USA to match js/data.js.
  ALL35: ["alliance o35", "alliance 35", "alliance", "all w35"],
  ALLP40: ["alliance purple o40", "alliance purple", "allp w40"],
  ALLB40: ["alliance blue o40", "alliance blue", "allb w40"],
  ARGB40: ["argentina b o40", "argentina b 40", "argb w40"],
  AUSB35: ["australia b o35", "australia b 35", "ausb w35"],
  NED: ["netherlands"], NZL: ["new zealand"], PAR: ["paraguay"],
  RSA: ["south africa"],
  RSAB: ["south africa b", "rsa b", "rsa imc 35", "rsa imc 40", "rsa imc"],
  SCO: ["scotland"],
  SGP: ["singapore"], SRI: ["sri lanka"], URU: ["uruguay"],
  USA: ["united states", "usa", "usab w35"], WAL: ["wales"], ZIM: ["zimbabwe"],
};

function toCode(text) {
  // Drop any trailing parenthetical, e.g. "IRL (Pool A)" -> "IRL".
  const t = text.replace(/\s*\(.*\)\s*$/, "").trim().toLowerCase();
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
  // Each match is a <tr> like:
  //   003 | 23 Jul 2026 09:00 | RSA v IRL (Pool A) | 0 - 1 | Complete | Pitch 3 | ...
  // Both teams live in ONE cell ("HOME v AWAY (Pool X)"), scores are "N - N",
  // and in-progress games also show a score — so gate on the status cell.
  for (const row of html.split(/<tr[\s>]/).slice(1)) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => stripTags(m[1]));
    if (cells.length < 5) continue; // header/nav rows
    const teamsCell = cells.find((c) => /\sv\s/.test(c));
    if (!teamsCell) continue;
    const scoreCell = cells.find((c) => /^\d{1,2}\s*-\s*\d{1,2}(\s*\(.*\))?$/.test(c));
    if (!scoreCell) continue; // unplayed ("-")
    // Only final scores: skip live games ("Half Time 30'+", "3rd Quarter", …).
    // Finished games show "Complete", then move to "Official" once confirmed.
    if (!cells.some((c) => /^(complete|full ?time|official)/i.test(c))) continue;
    const [home, away] = teamsCell.split(/\sv\s/);
    const codes = [toCode(home), toCode(away)];
    if (!codes[0] || !codes[1]) {
      // A finished game we can't attribute means TEAM_NAMES is missing the
      // display name AltiusRT uses — log it so the mapping can be fixed.
      console.log(`${div}: dropping completed match — unmatched team name(s) in "${teamsCell}"`);
      continue;
    }
    const [hs, as] = scoreCell.match(/\d{1,2}/g).map((n) => parseInt(n, 10));
    // key format consumed by app.js: div|HOME|AWAY
    results[`${div}|${codes[0]}|${codes[1]}`] = [hs, as];
  }
  return results;
}

// Scrape one group of divisions into one results file. Returns
// {configured, succeeded}; only writes the file when ≥1 division scraped OK
// (a total failure leaves the previous file untouched).
async function scrapeGroup(competitions, path, constName, updatedVar, label) {
  const all = loadExistingResults(path, constName);
  let configured = 0;
  let succeeded = 0;
  for (const [div, id] of Object.entries(competitions)) {
    if (!id) continue;
    configured++;
    try {
      const divResults = await scrapeDivision(div, id);
      // Replace this division's slice of the existing data with the fresh
      // scrape (so corrected/removed matches don't linger), but only once
      // we know the scrape actually succeeded.
      for (const key of Object.keys(all)) {
        if (key.startsWith(`${div}|`)) delete all[key];
      }
      Object.assign(all, divResults);
      succeeded++;
      console.log(`${div}: ok`);
    } catch (e) {
      console.error(`${div}: ${e.message} (keeping previous results)`);
      // partial failure must not wipe/regress this division's existing
      // entries in `all` — they were loaded above and are left untouched.
    }
  }
  if (configured > 0 && succeeded > 0) {
    const updatedAt = new Date().toISOString();
    const banner = `// AUTO-GENERATED by scripts/scrape-results.mjs — do not edit by hand.
// Source: masters.altiusrt.com · updated ${updatedAt}
`;
    writeFileSync(
      path,
      `${banner}const ${constName} = ${JSON.stringify(all, null, 2)};\nwindow.${updatedVar} = "${updatedAt}";\n`
    );
    console.log(`Wrote ${Object.keys(all).length} results to ${label}`);
  }
  return { configured, succeeded };
}

const july = await scrapeGroup(COMPETITIONS, resultsPath, "RESULTS", "RESULTS_UPDATED", "js/results.js");
const aug = await scrapeGroup(COMPETITIONS_AUG, resultsAugPath, "RESULTS_AUG", "RESULTS_AUG_UPDATED", "js/results-aug.js");

const configuredCount = july.configured + aug.configured;
const succeededCount = july.succeeded + aug.succeeded;

if (configuredCount === 0) {
  console.log("No competition ids configured yet — nothing to do.");
  process.exit(0);
}

if (succeededCount === 0) {
  console.error(
    `ERROR: ${configuredCount} division(s) configured but 0 scrapes succeeded — ` +
      `AltiusRT scraping is completely broken. Leaving results files untouched.`
  );
  process.exit(1);
}
