// ============================================================
// One-off tournament wrap-up post — final placings for all nine
// USA teams at the 2026 World Cup Schiedam/Rotterdam leg.
//
// Run once after the tournament: node scripts/generate-wrapup.mjs
// Renders three branded slides (BRAND.md §6) into social/img/ and
// prepends the post to social/posts.json (skips if already there).
//
// Placings sourced from js/results.js classification games plus the
// bracket labels in js/data.js; the WO40 7th/8th shootout (0–0 vs
// Spain, USA win 2–1 on SO) is from USA Field Hockey's wrap story,
// 1-Aug-26 — shootout scores never reach the AltiusRT score cell
// the scraper reads.
// ============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const p = (...s) => path.join(ROOT, ...s);

// ---------- final standings (best finish first) ----------
const WRAP = [
  { div: "W35 IMC", place: "SILVER MEDALISTS", medal: true, cap: "🥈 W35 IMC — Silver medalists" },
  { div: "MO35",    place: "5TH PLACE",  cap: "MO35 — 5th place" },
  { div: "WO35",    place: "7TH PLACE",  cap: "WO35 — 7th place" },
  { div: "WO40",    place: "7TH PLACE",  cap: "WO40 — 7th place" },
  { div: "MO45",    place: "8TH PLACE",  cap: "MO45 — 8th place" },
  { div: "WO45",    place: "12TH PLACE", cap: "WO45 — 12th place" },
  { div: "MO40",    place: "13TH PLACE", cap: "MO40 — 13th place" },
  { div: "WO50",    place: "15TH PLACE", cap: "WO50 — 15th place" },
  { div: "MO50",    place: "17TH PLACE", cap: "MO50 — 17th place" },
];

// USA games actually played: pool rows with a score + scraped USA KO keys
const loadConsts = (file, names) =>
  new Function("window", `${readFileSync(file, "utf8")}; return {${names}};`)({});
const { POOL } = loadConsts(p("js/data.js"), "POOL");
const { RESULTS } = loadConsts(p("js/results.js"), "RESULTS");
const GAMES =
  POOL.filter(([, , div, h, a]) =>
    (h === "USA" || a === "USA") &&
    (RESULTS[`${div}|${h}|${a}`] || RESULTS[`${div}|${a}|${h}`])).length +
  Object.keys(RESULTS).filter((k) => {
    const parts = k.split("|");
    return parts[1] === "KO" && (parts[4] === "USA" || parts[5] === "USA");
  }).length;

// ---------- slide helpers (same recipe as generate-social.mjs) ----------
const NAVY_DEEP = "#0e1f42", NAVY = "#1b3668", RED = "#e31837", GOLD = "#ffb25a", CREAM = "#f7f5f0";
const LOGO64 = readFileSync(p("assets/logo.png")).toString("base64");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const T = (x, y, size, fill, text, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.f || "Anton"}" font-size="${size}" fill="${fill}"` +
  (o.ls ? ` letter-spacing="${o.ls}"` : "") + (o.a ? ` text-anchor="${o.a}"` : "") +
  (o.op ? ` opacity="${o.op}"` : "") + `>${o.raw ? text : esc(text)}</text>`;
const AB = "Archivo Black";

function frame(kicker, inner) {
  return `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0.35">
<stop offset="0" stop-color="${RED}"/><stop offset="0.55" stop-color="#ff4671"/><stop offset="1" stop-color="${GOLD}"/>
</linearGradient></defs>
<rect width="1080" height="1350" fill="${NAVY_DEEP}"/>
<rect width="1080" height="16" fill="url(#g)"/>
<rect x="64" y="56" width="338" height="110" fill="${CREAM}" rx="16"/>
<image x="88" y="75" width="290" height="73.6" preserveAspectRatio="xMinYMin meet" href="data:image/png;base64,${LOGO64}"/>
${T(64, 262, 26, GOLD, kicker.toUpperCase(), { f: AB, ls: 6 })}
${inner}
<rect x="64" y="1256" width="952" height="4" fill="${RED}"/>
${T(64, 1308, 24, "#ffffff", "USAMASTERSFH.COM", { f: AB, ls: 4, op: 0.75 })}
${T(1016, 1308, 24, "#ffffff", "@USAMASTERSFH", { f: AB, ls: 4, a: "end", op: 0.75 })}
</svg>`;
}
const headline = (y, words, size = 170) =>
  T(64, y, size, "#fff", `${esc(words)}<tspan fill="${RED}">.</tspan>`, { raw: true });

function detailRows(y, rows) {
  return rows.map(([label, value], i) => {
    const yy = y + i * 108;
    return `<rect x="64" y="${yy}" width="8" height="72" fill="${RED}"/>` +
      T(100, yy + 30, 26, GOLD, label.toUpperCase(), { f: AB, ls: 4 }) +
      T(100, yy + 74, 46, "#fff", value);
  }).join("");
}

// ① THAT'S A WRAP + tournament totals
const slideWrap = () =>
  frame("WMH World Cup · Schiedam & Rotterdam",
    headline(560, "THAT'S A WRAP", 140) +
    T(64, 650, 40, "#fff", "JULY 22 - AUGUST 1, 2026 · NETHERLANDS", { op: 0.9 }) +
    detailRows(760, [
      ["USA teams", "9"],
      ["Games played", String(GAMES)],
      ["W35 IMC", "Silver medalists"],
    ]) +
    T(64, 1180, 60, GOLD, "PROUD OF EVERY SHIELD"));

// ② final standings — one row per team, the medal row highlighted red
function slideTally() {
  let y = 578;
  let out = headline(430, "FINAL STANDINGS", 110) +
    T(64, 500, 26, GOLD, "ALL NINE USA TEAMS", { f: AB, ls: 3 });
  for (const r of WRAP) {
    out += `<rect x="64" y="${y - 42}" width="170" height="60" fill="${r.medal ? RED : NAVY}" rx="10"/>` +
      T(149, y, 28, "#fff", r.div, { a: "middle" }) +
      T(290, y, 48, GOLD, r.place);
    y += 78;
  }
  return frame("Tournament wrap · usamastersfh.com", out);
}

// ③ leg 2 hand-off
const slideLeg2 = () =>
  frame("The World Cup isn't over yet",
    headline(430, "UP NEXT", 150) +
    detailRows(540, [
      ["Leg 2", "Brasschaat & Breda"],
      ["Dates", "August 7-16"],
      ["USA teams", "W55 · W60 · W65 · M55 · M60 · M65"],
      ["Follow along", "usamastersfh.com"],
    ]) +
    T(64, 1150, 56, GOLD, "SEE YOU IN BELGIUM"));

// ---------- caption ----------
const caption = `🇺🇸 THAT'S A WRAP — 2026 WMH WORLD CUP, SCHIEDAM & ROTTERDAM

Nine USA teams. Ten days. ${GAMES} games.

${WRAP.map((r) => r.cap).join("\n")}

So proud of every athlete who wore the shield. 🇺🇸

Six more USA teams take the pitch in Brasschaat & Breda starting August 7.

All scores & standings: usamastersfh.com

#USAMastersFH #FieldHockey #WMHWorldCup2026 #TeamUSA #MastersWC2026 @masterswc2026.schiedam`;

// ---------- render + prepend to posts.json ----------
const post = {
  id: "wrap-2026-08-01",
  type: "recap",
  date: "2026-08-03",
  title: "Tournament wrap — every USA team's final place",
  caption,
  created: new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam", dateStyle: "short", timeStyle: "short",
  }).format(new Date()).replace(" ", "T"),
};

const postsPath = p("social/posts.json");
const existing = existsSync(postsPath) ? JSON.parse(readFileSync(postsPath, "utf8")) : [];
if (existing.some((x) => x.id === post.id)) {
  console.log(`${post.id} already in posts.json — nothing to do.`);
  process.exit(0);
}

mkdirSync(p("social/img"), { recursive: true });
const fontOpts = {
  fitTo: { mode: "width", value: 1080 },
  font: {
    fontFiles: [p("assets/fonts/Anton-Regular.ttf"), p("assets/fonts/ArchivoBlack-Regular.ttf")],
    loadSystemFonts: false,
    defaultFontFamily: "Anton",
  },
};
post.images = [slideWrap(), slideTally(), slideLeg2()].map((svg, i) => {
  const file = `social/img/${post.id}-${i + 1}.png`;
  writeFileSync(p(file), new Resvg(svg, fontOpts).render().asPng());
  return file;
});

writeFileSync(postsPath, JSON.stringify([post, ...existing], null, 2) + "\n");
console.log(`Added ${post.id} (${post.images.length} slides).`);
