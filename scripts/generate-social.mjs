// ============================================================
// Social content generator — runs after scrape-results.mjs.
//
// Reads js/data.js + js/results.js, figures out what's newsworthy
// for USA teams right now (WO35 gameday previews, after-game result
// posts for WO35 & MO35, standings, daily all-USA recaps, event
// days), then:
//   1. renders branded 1080x1350 carousel slides -> social/img/*.png
//   2. appends post suggestions (caption + slides) -> social/posts.json
//   3. writes the posts added this run -> social-new.json (untracked;
//      the workflow emails them to the social team)
// social.html serves them phone-friendly at usamastersfh.com/social.html
//
// Posts are additive: once generated they're never removed or
// re-rendered (edit/delete social/posts.json entries by hand if needed;
// FORCE_RENDER=1 re-renders images). Brand rules: see BRAND.md.
//
// Test hooks: SOCIAL_NOW="2026-07-23T20:00" (NL time),
//             SOCIAL_RESULTS=path/to/fake-results.js
// ============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const p = (...s) => path.join(ROOT, ...s);

// ---------- load site data (plain const declarations, no exports) ----------
// A stub `window` is passed in scope: the scraper's results files carry
// `window.RESULTS_UPDATED = ...` lines that would otherwise throw in Node.
const loadConsts = (file, names) =>
  new Function("window", `${readFileSync(file, "utf8")}; return {${names}};`)({});
const { TEAMS, DIVISIONS, POOL, KNOCKOUT, EVENTS } = loadConsts(
  p("js/data.js"), "TEAMS, DIVISIONS, POOL, KNOCKOUT, EVENTS");
const { RESULTS } = loadConsts(
  process.env.SOCIAL_RESULTS || p("js/results.js"), "RESULTS");

// ---------- time (everything in NL local time, compared as strings) ----------
const NL_NOW = process.env.SOCIAL_NOW ||
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam", dateStyle: "short", timeStyle: "short",
  }).format(new Date()).replace(" ", "T");
const TODAY = NL_NOW.slice(0, 10);

const dayNum = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 86400000;
const prevDay = (d) => {
  const t = new Date((dayNum(d) - 1) * 86400000);
  return t.toISOString().slice(0, 10);
};
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const prettyDate = (d) =>
  `${WEEKDAYS[new Date(d).getUTCDay()]}, ${MONTHS[+d.slice(5,7)-1]} ${+d.slice(8,10)}`;
const etTime = (hhmm) => { // NL (CEST) -> US Eastern = -6h, 12-hour clock
  let [h, m] = hhmm.split(":").map(Number);
  h = (h - 6 + 24) % 24;
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
};
const nlTime = (hhmm) => hhmm; // already local
// results are keyed DIV|HOME|AWAY with no date, so a pool score would collide
// with a knockout rematch vs the same team — never post a result before the
// game could plausibly have ended (~80 min after push back)
const gameOver = (d, t) => {
  let [h, m] = t.split(":").map(Number);
  m += 80; h += Math.floor(m / 60); m %= 60;
  return NL_NOW >= `${d}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// ---------- results helpers ----------
// scraper keys: "DIV|HOME|AWAY" -> [homeScore, awayScore]; check both orders
function scoreFor(div, home, away) {
  if (RESULTS[`${div}|${home}|${away}`]) return RESULTS[`${div}|${home}|${away}`];
  const rev = RESULTS[`${div}|${away}|${home}`];
  return rev ? [rev[1], rev[0]] : null;
}
// USA-first orientation: returns { us, them, opp } or null
function usaScore(div, home, away) {
  const s = scoreFor(div, home, away);
  if (!s) return null;
  return home === "USA" ? { us: s[0], them: s[1], opp: away } : { us: s[1], them: s[0], opp: home };
}
const outcome = ({ us, them }) => (us > them ? "W" : us < them ? "L" : "D");

const usaGames = (d) => POOL.filter(([, , div, h, a]) => div === d && (h === "USA" || a === "USA"));
const W35_USA_GAMES = usaGames("W35");
// after-game result posts cover these divisions; gameday previews stay WO35-only
const RESULT_DIVS = ["W35", "M35"];

// single-pool standings for a division from whatever results exist
function standings(div) {
  const table = {};
  const row = (c) => (table[c] ??= { code: c, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0 });
  for (const [, , d, h, a] of POOL) if (d === div) { row(h); row(a); }
  for (const [, , d, h, a] of POOL) {
    if (d !== div) continue;
    const s = scoreFor(div, h, a);
    if (!s) continue;
    const H = row(h), A = row(a);
    H.P++; A.P++; H.GF += s[0]; H.GA += s[1]; A.GF += s[1]; A.GA += s[0];
    if (s[0] > s[1]) { H.W++; A.L++; } else if (s[0] < s[1]) { A.W++; H.L++; } else { H.D++; A.D++; }
  }
  return Object.values(table)
    .map((t) => ({ ...t, GD: t.GF - t.GA, Pts: t.W * 3 + t.D }))
    .sort((x, y) => y.Pts - x.Pts || y.GD - x.GD || y.GF - x.GF || x.code.localeCompare(y.code));
}

// next USA game in a division strictly after a given "date|time"
function nextGame(div, afterDateTime) {
  for (const [d, t, , h, a, pitch] of usaGames(div)) {
    if (`${d}|${t}` > afterDateTime) {
      return { date: d, time: t, opp: h === "USA" ? a : h, pitch, label: null };
    }
  }
  const ko = KNOCKOUT.filter((k) => k.div === div && `${k.d}|${k.t}` > afterDateTime)
    .sort((x, y) => `${x.d}|${x.t}`.localeCompare(`${y.d}|${y.t}`));
  const mine = ko.find((k) => k.teams?.includes("USA"));
  if (mine) {
    return { date: mine.d, time: mine.t, opp: mine.teams.find((c) => c !== "USA"),
             pitch: mine.p, label: mine.label.split("·")[0].trim() };
  }
  const qf = ko.find((k) => /quarter/i.test(k.label));
  return qf ? { date: qf.d, time: null, opp: null, pitch: null, label: "Quarterfinals" } : null;
}

// ============================================================
// SVG slide builders (see BRAND.md §6)
// ============================================================
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

function matchBlock(y, opp, big = true) {
  const oppName = TEAMS[opp]?.name?.toUpperCase() || opp;
  const s = big ? 96 : 72;
  return [
    T(64, y, s, "#fff", "USA"),
    T(64 + (big ? 230 : 175), y, s * 0.55, GOLD, "VS"),
    T(64 + (big ? 340 : 260), y, s, "#fff", oppName.length > 12 ? opp : oppName),
    T(64, y + 46, 26, GOLD, "UNITED STATES · WOMEN O35", { f: AB, ls: 3, op: 0.9 }),
  ].join("");
}

function detailRows(y, rows) {
  return rows.map(([label, value], i) => {
    const yy = y + i * 108;
    return `<rect x="64" y="${yy}" width="8" height="72" fill="${RED}"/>` +
      T(100, yy + 30, 26, GOLD, label.toUpperCase(), { f: AB, ls: 4 }) +
      T(100, yy + 74, 46, "#fff", value);
  }).join("");
}

function slideGameday(g) {
  const [date, time, , h, a, pitch] = g;
  const opp = h === "USA" ? a : h;
  return frame("World Masters Hockey World Cup · Schiedam",
    headline(560, "GAME DAY", 200) +
    T(64, 640, 40, "#fff", prettyDate(date).toUpperCase(), { op: 0.9 }) +
    matchBlock(840, opp) +
    detailRows(950, [
      ["Push back", `${nlTime(time)} NL · ${etTime(time)} ET`],
      ["Where", `Pitch ${pitch} · HC Schiedam`],
    ]));
}

function slideDetails(g) {
  const [date, time, , h, a, pitch] = g;
  const opp = h === "USA" ? a : h;
  return frame("USA WO35 · Pool A",
    headline(430, "THE DETAILS", 130) +
    detailRows(520, [
      ["Matchup", `USA vs ${TEAMS[opp]?.name || opp}`],
      ["Date", prettyDate(date)],
      ["Push back", `${nlTime(time)} NL · ${etTime(time)} ET`],
      ["Pitch", `Pitch ${pitch} · HC Schiedam, Park Harga`],
      ["Live scores", "usamastersfh.com"],
    ]));
}

function slideWatch() {
  return frame("Follow every minute",
    headline(430, "HOW TO WATCH", 120) +
    detailRows(520, [
      ["Stream", "worldmastershockey.tv"],
      ["Highlights", "WMH on YouTube"],
      ["Live scores", "masters.altiusrt.com"],
      ["Schedule + standings", "usamastersfh.com"],
    ]) +
    T(64, 1150, 60, GOLD, "LET'S GO USA!"));
}

function slideScore(div, date, opp, sc, label) {
  const head = { W: "USA WIN", L: "FULL TIME", D: "ALL SQUARE" }[outcome(sc)];
  const oppName = TEAMS[opp]?.name?.toUpperCase() || opp;
  return frame(`USA ${DIVISIONS[div].short} · ${label || "Pool A"} · ${prettyDate(date)}`,
    headline(500, head, 170) +
    `<rect x="64" y="640" width="952" height="300" fill="${NAVY}" rx="24"/>` +
    T(114, 750, 64, "#fff", "USA") +
    T(114, 880, 40, CREAM, "UNITED STATES", { op: 0.7 }) +
    T(966, 750, 64, "#fff", opp, { a: "end" }) +
    T(966, 880, 40, CREAM, oppName, { a: "end", op: 0.7 }) +
    T(540, 830, 150, GOLD, `${sc.us} - ${sc.them}`, { a: "middle" }) +
    (outcome(sc) === "W"
      ? T(64, 1070, 56, GOLD, "ANOTHER ONE FOR THE STARS AND STRIPES")
      : outcome(sc) === "D"
        ? T(64, 1070, 56, GOLD, "EVERY POINT COUNTS IN POOL A")
        : T(64, 1070, 56, GOLD, "HEADS HIGH. ON TO THE NEXT ONE")));
}

function slideStandings(div, highlightDate) {
  const tbl = standings(div).filter((t) => t.P > 0 || true);
  const usaIdx = tbl.findIndex((t) => t.code === "USA");
  const shown = tbl.slice(0, 8);
  const extra = usaIdx >= 8 ? [{ ...tbl[usaIdx], rank: usaIdx + 1 }] : [];
  const rows = shown.map((t, i) => ({ ...t, rank: i + 1 })).concat(extra);
  let y = 560;
  let out = headline(430, "POOL A", 130) +
    T(64, 510, 26, GOLD, `${DIVISIONS[div].label.toUpperCase()} · AFTER ${prettyDate(highlightDate).toUpperCase()}`, { f: AB, ls: 3 }) +
    T(770, 545, 24, CREAM, "P", { f: AB, a: "middle", op: 0.6 }) +
    T(870, 545, 24, CREAM, "GD", { f: AB, a: "middle", op: 0.6 }) +
    T(975, 545, 24, CREAM, "PTS", { f: AB, a: "middle", op: 0.6 });
  for (const t of rows) {
    const usa = t.code === "USA";
    if (usa) out += `<rect x="52" y="${y - 10}" width="976" height="66" fill="${RED}" rx="12"/>`;
    out += T(88, y + 36, 40, usa ? "#fff" : GOLD, String(t.rank)) +
      T(160, y + 36, 40, "#fff", `${t.code}  ${TEAMS[t.code]?.name || ""}`.slice(0, 24)) +
      T(770, y + 36, 40, "#fff", String(t.P), { a: "middle" }) +
      T(870, y + 36, 40, "#fff", (t.GD > 0 ? "+" : "") + t.GD, { a: "middle" }) +
      T(975, y + 36, 40, usa ? "#fff" : GOLD, String(t.Pts), { a: "middle" });
    y += 72;
    if (extra.length && t.rank === 8) { out += T(88, y + 20, 40, CREAM, "···", { op: 0.5 }); y += 52; }
  }
  return frame("Live standings · usamastersfh.com", out);
}

function slideUpNext(div, next) {
  const rows = [];
  if (next.opp) rows.push(["Opponent", TEAMS[next.opp]?.name || next.opp]);
  if (next.label) rows.push(["Round", next.label]);
  rows.push(["Date", prettyDate(next.date)]);
  if (next.time) rows.push(["Push back", `${nlTime(next.time)} NL · ${etTime(next.time)} ET`]);
  if (next.pitch) rows.push(["Where", `Pitch ${next.pitch} · HC Schiedam`]);
  return frame(`USA ${DIVISIONS[div].short}`,
    headline(430, "UP NEXT", 150) + detailRows(540, rows) +
    T(64, 1150, 56, GOLD, "SEE YOU THERE"));
}

const RES_WORD = { W: "Win", D: "Draw", L: "Loss" };

function slideRecap(date, rows) {
  let y = 600;
  let out = headline(430, "USA TODAY", 140) +
    T(64, 500, 30, GOLD, prettyDate(date).toUpperCase(), { f: AB, ls: 3 });
  for (const r of rows) {
    out += `<rect x="64" y="${y - 44}" width="150" height="60" fill="${r.res === "W" ? RED : NAVY}" rx="10"/>` +
      T(139, y, 34, "#fff", DIVISIONS[r.div].short, { a: "middle" }) +
      T(250, y, 48, "#fff", `USA ${r.us} - ${r.them} ${r.opp}`) +
      T(1000, y, 48, r.res === "W" ? GOLD : CREAM, RES_WORD[r.res].toUpperCase(), { a: "end" });
    y += 100;
  }
  return frame("Team USA in Schiedam & Rotterdam", out);
}

function slideEvent(ev) {
  const title = ev.title.replace(/^[^\w]+\s*/, "");
  return frame("World Masters Hockey World Cup · Schiedam",
    headline(500, title.length > 18 ? title.split("—")[0].trim() : title,
      title.length > 14 ? 96 : 150) +
    detailRows(640, [
      ["Date", prettyDate(ev.d)],
      ["Time", `${ev.t} NL`],
      ["Details", ev.note.length > 44 ? ev.note.slice(0, 42) + "…" : ev.note],
    ]));
}

// ---------- captions ----------
const TAGS = "#USAMastersFH #FieldHockey #WMHWorldCup2026 #TeamUSA";
const flag = (c) => TEAMS[c]?.flag || "";
const name = (c) => TEAMS[c]?.name || c;

const capGameday = (g) => {
  const [date, time, , h, a, pitch] = g;
  const opp = h === "USA" ? a : h;
  return `GAME DAY 🇺🇸🏑

USA WO35 takes on ${name(opp)} ${flag(opp)} — ${prettyDate(date)}.

🕐 ${time} NL / ${etTime(time)} ET
📍 Pitch ${pitch} · HC Schiedam
📺 worldmastershockey.tv
📊 Live scores & schedule: usamastersfh.com

Let's go USA!

${TAGS} #WO35 @masterswc2026.schiedam`;
};

const capResult = (div, date, opp, sc, label) => {
  const line = { W: `What a way to spend a ${WEEKDAYS[new Date(date).getUTCDay()]} in Schiedam. 🇺🇸`,
                 L: `Proud fight from our group — heads high, eyes forward.`,
                 D: `The pool stays tight. Every point matters.` }[outcome(sc)];
  const head = { W: "USA WIN 🇺🇸", L: "FULL TIME", D: "ALL SQUARE" }[outcome(sc)];
  return `${head}${label ? ` — ${label.toUpperCase()}` : ""}

USA ${DIVISIONS[div].short} ${sc.us}–${sc.them} ${name(opp)} ${flag(opp)}

${line}

📊 Standings & what's next: usamastersfh.com

${TAGS} #${DIVISIONS[div].short}`;
};

const capRecap = (date, rows) =>
  `🇺🇸 TEAM USA IN SCHIEDAM & ROTTERDAM — ${prettyDate(date)}\n\n` +
  rows.map((r) => `${DIVISIONS[r.div].short}: USA ${r.us}–${r.them} ${name(r.opp)} (${RES_WORD[r.res]})`).join("\n") +
  `\n\nAll scores & standings: usamastersfh.com\n\n${TAGS}`;

const capEvent = (ev) => `${ev.title}

${ev.note}

${prettyDate(ev.d)} · ${ev.t} NL

${TAGS} @masterswc2026.schiedam`;

// ============================================================
// Assemble posts
// ============================================================
const postsPath = p("social/posts.json");
const existing = existsSync(postsPath) ? JSON.parse(readFileSync(postsPath, "utf8")) : [];
const have = new Set(existing.map((x) => x.id));
const fresh = [];
const add = (id, type, date, title, caption, slides) => {
  if (have.has(id)) return;
  fresh.push({ id, type, date, title, caption, slides, created: NL_NOW });
};

// 1. event posts (e.g. tournament party, closing ceremonies), morning of
for (const ev of EVENTS) {
  if (TODAY === ev.d) {
    add(`event-${ev.d}-${ev.t.replace(":", "")}`, "event", ev.d,
      ev.title, capEvent(ev), [slideEvent(ev)]);
  }
}

// 2. gameday previews — from 18:00 NL the evening before
for (const g of W35_USA_GAMES) {
  const [date, , , h, a] = g;
  const opp = h === "USA" ? a : h;
  if (NL_NOW >= `${prevDay(date)}T18:00`) {
    add(`preview-${date}-${opp}`, "preview", date,
      `Game day: USA vs ${name(opp)}`, capGameday(g),
      [slideGameday(g), slideDetails(g), slideWatch()]);
  }
}

// 3. pool result posts for WO35 & MO35 (score + standings + up next)
for (const div of RESULT_DIVS) {
  for (const g of usaGames(div)) {
    const [date, time, , h, a] = g;
    const sc = usaScore(div, h, a);
    if (!sc || !gameOver(date, time)) continue;
    const slides = [slideScore(div, date, sc.opp, sc, null), slideStandings(div, date)];
    const next = nextGame(div, `${date}|${time}`);
    if (next) slides.push(slideUpNext(div, next));
    add(`result-${div}-${date}-${sc.opp}`, "result", date,
      `${DIVISIONS[div].short} full time: USA ${sc.us}–${sc.them} ${sc.opp}`,
      capResult(div, date, sc.opp, sc, null), slides);
  }
}

// 4. knockout: WO35 preview when matchup is known; WO35 & MO35 results
for (const div of RESULT_DIVS) {
  for (const k of KNOCKOUT.filter((k) => k.div === div && k.teams?.includes("USA"))) {
    const opp = k.teams.find((c) => c !== "USA");
    const round = k.label.split("·")[0].replace(/🏆/g, "").trim();
    if (div === "W35" && NL_NOW >= `${prevDay(k.d)}T18:00`) {
      add(`ko-preview-${k.d}-${opp}`, "preview", k.d,
        `${round}: USA vs ${name(opp)}`,
        capGameday([k.d, k.t, div, "USA", opp, k.p]).replace("GAME DAY", round.toUpperCase()),
        [slideGameday([k.d, k.t, div, "USA", opp, k.p]), slideWatch()]);
    }
    const sc = usaScore(div, "USA", opp);
    if (sc && gameOver(k.d, k.t)) {
      const isFinal = /FINAL$/i.test(round);
      const isBronze = /bronze/i.test(round);
      const short = DIVISIONS[div].short;
      let title = `${short} ${round}: USA ${sc.us}–${sc.them} ${opp}`;
      let slides = [slideScore(div, k.d, opp, sc, round)];
      let caption = capResult(div, k.d, opp, sc, round);
      if (isFinal && outcome(sc) === "W") {
        caption = `WORLD CHAMPIONS. 🥇🇺🇸\n\nUSA ${short} ${sc.us}–${sc.them} ${name(opp)} in the World Cup final.\n\n${TAGS} #${short} @masterswc2026.schiedam`;
        title = `${short} WORLD CHAMPIONS 🥇`;
      } else if (isFinal) {
        caption = `SILVER MEDALISTS. 🥈🇺🇸\n\nA World Cup final. USA ${short} ${sc.us}–${sc.them} ${name(opp)}. So proud of this team.\n\n${TAGS} #${short}`;
      } else if (isBronze && outcome(sc) === "W") {
        caption = `BRONZE. 🥉🇺🇸\n\nUSA ${short} ${sc.us}–${sc.them} ${name(opp)} — we're bringing home a World Cup medal.\n\n${TAGS} #${short}`;
      }
      const next = nextGame(div, `${k.d}|${k.t}`);
      if (next && !isFinal) slides.push(slideUpNext(div, next));
      add(`ko-result-${div}-${k.d}-${opp}`, "result", k.d, title, caption, slides);
    }
  }
}

// 5. daily "Team USA in Schiedam" recap once every USA game that day has a score
const usaDays = [...new Set(POOL.filter(([, , , h, a]) => h === "USA" || a === "USA").map((g) => g[0]))];
for (const date of usaDays) {
  if (date > TODAY) continue;
  const games = POOL.filter(([d, , , h, a]) => d === date && (h === "USA" || a === "USA"));
  const rows = games.map(([d, t, div, h, a]) => {
    const sc = gameOver(d, t) && usaScore(div, h, a);
    return sc && { div, ...sc, res: outcome(sc) };
  });
  if (rows.length && rows.every(Boolean)) {
    rows.sort((x, y) => (x.div === "W35" ? -1 : 0) - (y.div === "W35" ? -1 : 0));
    add(`recap-${date}`, "recap", date, `Team USA recap — ${prettyDate(date)}`,
      capRecap(date, rows), [slideRecap(date, rows), slideStandings("W35", date)]);
  }
}

// ============================================================
// Render new slides + write posts.json
// ============================================================
mkdirSync(p("social/img"), { recursive: true });
const fontOpts = {
  fitTo: { mode: "width", value: 1080 },
  font: {
    fontFiles: [p("assets/fonts/Anton-Regular.ttf"), p("assets/fonts/ArchivoBlack-Regular.ttf")],
    loadSystemFonts: false,
    defaultFontFamily: "Anton",
  },
};

let rendered = 0;
const finalize = (post) => {
  const images = post.slides.map((svg, i) => {
    const file = `social/img/${post.id}-${i + 1}.png`;
    if (!existsSync(p(file)) || process.env.FORCE_RENDER) {
      writeFileSync(p(file), new Resvg(svg, fontOpts).render().asPng());
      rendered++;
    }
    return file;
  });
  const { slides, ...rest } = post;
  return { ...rest, images };
};

const newPosts = fresh.map(finalize);
if (newPosts.length) {
  const all = [...newPosts, ...existing];
  writeFileSync(postsPath, JSON.stringify(all, null, 2) + "\n");
  console.log(`Added ${newPosts.length} post(s): ${newPosts.map((x) => x.id).join(", ")}`);
} else {
  console.log("No new social posts this run.");
}
writeFileSync(p("social-new.json"), JSON.stringify(newPosts, null, 2) + "\n");
console.log(`Rendered ${rendered} slide image(s). ${existing.length + newPosts.length} total posts.`);
