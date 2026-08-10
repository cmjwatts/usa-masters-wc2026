// ============================================================
// Daily all-teams social slide — August tournaments.
//
// One branded 1080x1350 "USA TODAY" board covering every USA team in
// Belgium & Breda (W55, W60, W65, M55, M60 in Brasschaat/Antwerp +
// M65 in Breda): today's final scores where scraped, kickoff times for
// games still to play, rest-day rows with each idle team's next game.
//
//   node scripts/social-day-aug.mjs        -> renders today (BE time)
//   SOCIAL_NOW="2026-08-09T22:00"          -> any other day / test runs
//
// Output: social/img/aug-day-<date>-1.png + a post appended to
// social/posts.json (skipped if the id already exists; FORCE_RENDER=1
// re-renders the image). Brand rules: BRAND.md. The July generator
// (generate-social.mjs) is Schiedam-specific and untouched.
// ============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const p = (...s) => path.join(ROOT, ...s);

const loadConsts = (file, names) =>
  new Function("window", `${readFileSync(file, "utf8")}; return {${names}};`)({});
const { TEAMS_AUG, DIVISIONS_AUG, POOL_AUG, KNOCKOUT_AUG } = loadConsts(
  p("js/data-aug.js"), "TEAMS_AUG, DIVISIONS_AUG, POOL_AUG, KNOCKOUT_AUG");
const { DIVISIONS_BRE, POOL_BRE, KNOCKOUT_BRE } = loadConsts(
  p("js/data-breda.js"), "DIVISIONS_BRE, POOL_BRE, KNOCKOUT_BRE");
const { RESULTS_AUG } = loadConsts(p("js/results-aug.js"), "RESULTS_AUG");

const TEAMS = TEAMS_AUG;
const DIVISIONS = { ...DIVISIONS_AUG, ...DIVISIONS_BRE };
const POOL = [...POOL_AUG, ...POOL_BRE];
const KNOCKOUT = [...KNOCKOUT_AUG, ...KNOCKOUT_BRE];
const DIV_ORDER = ["W55", "W60", "W65", "M55", "M60", "M65"];

// ---------- time (Belgium & NL share CEST; compared as strings) ----------
const NOW = process.env.SOCIAL_NOW ||
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Brussels", dateStyle: "short", timeStyle: "short",
  }).format(new Date()).replace(" ", "T");
// a daily board posted from the US evening lands after midnight CEST —
// before 06:00 Belgium time "the day" still means yesterday
const prevDay = (d) =>
  new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) - 86400000)
    .toISOString().slice(0, 10);
const TODAY = NOW.slice(11, 16) < "06:00" ? prevDay(NOW.slice(0, 10)) : NOW.slice(0, 10);

const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const prettyDate = (d) =>
  `${WEEKDAYS[new Date(d).getUTCDay()]}, ${MONTHS[+d.slice(5,7)-1]} ${+d.slice(8,10)}`;
const shortDay = (d) => WEEKDAYS[new Date(d).getUTCDay()].slice(0, 3);
// same guard as generate-social.mjs: never show a score before the game
// could plausibly have ended (~80 min after push back)
const gameOver = (d, t) => {
  let [h, m] = t.split(":").map(Number);
  m += 80; h += Math.floor(m / 60); m %= 60;
  return NOW >= `${d}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// ---------- results (scraper keys: "DIV|HOME|AWAY", KO: "DIV|KO|date|...") ----------
function usaScore(div, home, away) {
  const s = RESULTS_AUG[`${div}|${home}|${away}`];
  if (s) return home === "USA" ? { us: s[0], them: s[1] } : { us: s[1], them: s[0] };
  const r = RESULTS_AUG[`${div}|${away}|${home}`];
  if (r) return away === "USA" ? { us: r[0], them: r[1] } : { us: r[1], them: r[0] };
  return null;
}
function koScore(div, d, opp) {
  for (const [key, s] of Object.entries(RESULTS_AUG)) {
    if (!key.startsWith(`${div}|KO|${d}|`)) continue;
    const [h, a] = key.split("|").slice(-2);
    if (h === "USA" && a === opp) return { us: s[0], them: s[1] };
    if (h === opp && a === "USA") return { us: s[1], them: s[0] };
  }
  return null;
}
const outcome = ({ us, them }) => (us > them ? "W" : us < them ? "L" : "D");

// ---------- today's picture, one row per USA division ----------
// row: { div, kind: "result"|"fixture"|"rest", opp?, time?, sc?, res?, next? }
const usaPoolGames = (div) =>
  POOL.filter(([, , d, h, a]) => d === div && (h === "USA" || a === "USA"));
const usaKoGames = (div) =>
  KNOCKOUT.filter((k) => k.div === div && k.teams?.includes("USA"));

const rows = DIV_ORDER.map((div) => {
  const games = [
    ...usaPoolGames(div).filter(([d]) => d === TODAY)
      .map(([d, t, , h, a]) => ({ t, opp: h === "USA" ? a : h,
        sc: usaScore(div, h, a), done: gameOver(d, t) })),
    ...usaKoGames(div).filter((k) => k.d === TODAY)
      .map((k) => ({ t: k.t, opp: k.teams.find((c) => c !== "USA"),
        sc: koScore(div, k.d, k.teams.find((c) => c !== "USA")), done: gameOver(k.d, k.t) })),
  ].sort((x, y) => x.t.localeCompare(y.t));

  if (games.length) {
    // one game per team per day at these tournaments; take the first
    const g = games[0];
    return g.sc && g.done
      ? { div, kind: "result", opp: g.opp, sc: g.sc, res: outcome(g.sc) }
      : { div, kind: "fixture", opp: g.opp, time: g.t };
  }
  const next = [
    ...usaPoolGames(div).map(([d, t, , h, a]) => ({ d, t, opp: h === "USA" ? a : h })),
    ...usaKoGames(div).map((k) => ({ d: k.d, t: k.t, opp: k.teams.find((c) => c !== "USA") })),
  ].filter((g) => g.d > TODAY).sort((x, y) => `${x.d}|${x.t}`.localeCompare(`${y.d}|${y.t}`))[0];
  return { div, kind: "rest", next };
});

// Publish once per day, after every USA game has a final score — the
// 20-min workflow cron calls this all day, and the first tick where
// nothing is pending renders + posts the board. Games missing a score
// (still running, or scraper lag) show as "fixture" rows until final.
// SOCIAL_PUBLISH_PENDING=1 overrides for a manual midday board.
const unfinished = rows.filter((r) => r.kind === "fixture");
if (unfinished.length && !process.env.SOCIAL_PUBLISH_PENDING) {
  console.log(`Waiting on ${unfinished.length} unfinished USA game(s) for ${TODAY} — no board yet.`);
  process.exit(0);
}

const played = rows.filter((r) => r.kind === "result");
const wins = played.filter((r) => r.res === "W").length;
const draws = played.filter((r) => r.res === "D").length;
const closer =
  !played.length ? "ALL EYES ON TOMORROW" :
  wins === played.length ? "A PERFECT DAY FOR THE STARS AND STRIPES" :
  wins > 0 ? `${wins} WIN${wins > 1 ? "S" : ""} ON THE DAY — LET'S GO USA` :
  draws > 0 ? "EVERY POINT COUNTS" :
  "HEADS HIGH. BACK AT IT TOMORROW";

// ---------- slide (brand recipe: BRAND.md §6, cloned from generate-social.mjs) ----------
const NAVY = "#1b3668", RED = "#e31837", GOLD = "#ffb25a", CREAM = "#f7f5f0";
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
<rect width="1080" height="1350" fill="#0e1f42"/>
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

const RES_WORD = { W: "WIN", D: "DRAW", L: "LOSS" };

function slideDay() {
  let y = 640;
  let out = T(64, 460, 140, "#fff", `USA TODAY<tspan fill="${RED}">.</tspan>`, { raw: true }) +
    T(64, 530, 30, GOLD, prettyDate(TODAY).toUpperCase(), { f: AB, ls: 3 });
  for (const r of rows) {
    const won = r.res === "W";
    out += `<rect x="64" y="${y - 44}" width="150" height="60" fill="${won ? RED : NAVY}" rx="10"/>` +
      T(139, y, 34, "#fff", DIVISIONS[r.div].short, { a: "middle" });
    if (r.kind === "result") {
      out += T(250, y, 48, "#fff", `USA ${r.sc.us} - ${r.sc.them} ${r.opp}`) +
        T(1016, y, 48, won ? GOLD : CREAM, RES_WORD[r.res], { a: "end" });
    } else if (r.kind === "fixture") {
      out += T(250, y, 48, "#fff", `USA vs ${r.opp} · ${r.time} BE`) +
        T(1016, y, 40, GOLD, "TODAY", { a: "end" });
    } else {
      out += T(250, y, 40, CREAM, r.next
        ? `Rest day — next ${shortDay(r.next.d)} vs ${r.next.opp}`
        : "Rest day", { op: 0.7 });
    }
    y += 96;
  }
  out += T(64, 1200, 56, GOLD, closer);
  return frame("Team USA · Brasschaat · Antwerp · Breda", out);
}

// ---------- caption ----------
const name = (c) => TEAMS[c]?.name || c;
const flag = (c) => TEAMS[c]?.flag || "";
const CAP_WORD = { W: "Win", D: "Draw", L: "Loss" };
const capLines = rows.map((r) => {
  const short = DIVISIONS[r.div].short;
  if (r.kind === "result")
    return `${short}: USA ${r.sc.us}–${r.sc.them} ${name(r.opp)} ${flag(r.opp)} (${CAP_WORD[r.res]})`;
  if (r.kind === "fixture")
    return `${short}: vs ${name(r.opp)} ${flag(r.opp)} — ${r.time} BE, today`;
  return `${short}: rest day${r.next ? ` — next up ${name(r.next.opp)} on ${shortDay(r.next.d)}` : ""}`;
});
const capCloser =
  !played.length ? "All eyes on tomorrow." :
  wins === played.length ? "A perfect day for the Stars and Stripes. 🇺🇸" :
  wins > 0 ? "Proud of every one of these teams. On to the next one!" :
  draws > 0 ? "The pools stay tight — every point matters." :
  "Heads high across the board — all six teams keep fighting. Back at it tomorrow.";
const caption = `🇺🇸 TEAM USA — ${prettyDate(TODAY)}
WMH World Cup · Brasschaat, Antwerp & Breda

${capLines.join("\n")}

${capCloser}

All scores & standings: usamastersfh.com

#USAMastersFH #FieldHockey #WMHWorldCup2026 #TeamUSA`;

// ---------- write ----------
const id = `aug-day-${TODAY}`;
const postsPath = p("social/posts.json");
const posts = existsSync(postsPath) ? JSON.parse(readFileSync(postsPath, "utf8")) : [];

mkdirSync(p("social/img"), { recursive: true });
const img = `social/img/${id}-1.png`;
if (!existsSync(p(img)) || process.env.FORCE_RENDER) {
  writeFileSync(p(img), new Resvg(slideDay(), {
    fitTo: { mode: "width", value: 1080 },
    font: {
      fontFiles: [p("assets/fonts/Anton-Regular.ttf"), p("assets/fonts/ArchivoBlack-Regular.ttf")],
      loadSystemFonts: false,
      defaultFontFamily: "Anton",
    },
  }).render().asPng());
  console.log(`Rendered ${img}`);
}

if (!posts.some((x) => x.id === id)) {
  const post = { id, type: "recap", date: TODAY,
    title: `Team USA daily — ${prettyDate(TODAY)}`,
    caption, created: NOW, images: [img] };
  posts.unshift(post);
  writeFileSync(postsPath, JSON.stringify(posts, null, 2) + "\n");
  console.log(`Added post ${id}`);
  // join the workflow's notification email: generate-social.mjs rewrites
  // social-new.json earlier in the same run, so append rather than replace
  const newPath = p("social-new.json");
  const fresh = existsSync(newPath) ? JSON.parse(readFileSync(newPath, "utf8")) : [];
  writeFileSync(newPath, JSON.stringify([...fresh, post], null, 2) + "\n");
} else {
  console.log(`Post ${id} already exists — image ${existsSync(p(img)) ? "kept" : "missing"}.`);
}
