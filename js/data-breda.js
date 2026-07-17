// ============================================================
// 2026 WMH World Cup — BREDA (Men O65, Aug 6–16) match data
// Source: Official Breda Schedule (Version 15-Jul-2026)
// All times are LOCAL NETHERLANDS TIME (CEST). Single venue: every
// match plays at BHV Push, Breda (pitches 1, 2, 5 & 7).
//
// Globals are _BRE-suffixed (data.js / data-aug.js conventions apply):
// 1. Scores: append home & away goals to a POOL_BRE row when final —
//      ["2026-08-07","11:05","M65","USA","BEL","Pitch 5", 2,1]
//    (auto-scraped scores arrive via js/results-aug.js, key M65|H|A).
// 2. Bracket teams: set a knockout row's `teams` array once known.
// ============================================================

const TEAMS_BRE = {
  ARG: { name: "Argentina", flag: "🇦🇷" },
  AUS: { name: "Australia", flag: "🇦🇺" },
  BEL: { name: "Belgium", flag: "🇧🇪" },
  CAN: { name: "Canada", flag: "🇨🇦" },
  ENG: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  FRA: { name: "France", flag: "🇫🇷" },
  GER: { name: "Germany", flag: "🇩🇪" },
  IRL: { name: "Ireland", flag: "🇮🇪" },
  ITA: { name: "Italy", flag: "🇮🇹" },
  JPN: { name: "Japan", flag: "🇯🇵" },
  MAS: { name: "Malaysia", flag: "🇲🇾" },
  NED: { name: "Netherlands", flag: "🇳🇱" },
  NZL: { name: "New Zealand", flag: "🇳🇿" },
  RSA: { name: "South Africa", flag: "🇿🇦" },
  SCO: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  USA: { name: "United States", flag: "🇺🇸" },
  WAL: { name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
};

const DIVISIONS_BRE = {
  M65: { label: "Men O65", short: "MO65" },
};

// single-pool division → no per-pool tables (kept for app-breda.js parity)
const DIVISION_POOLS_BRE = {};

// One pool of 17 — each team plays 4 pool games (partial round robin)
const POOL_BRE = [
  // ---- Friday 7 August ----
  ["2026-08-07","09:00","M65","ENG","WAL","Pitch 1"],
  ["2026-08-07","09:15","M65","AUS","ITA","Pitch 5"],
  ["2026-08-07","09:30","M65","NZL","GER","Pitch 2"],
  ["2026-08-07","09:45","M65","SCO","FRA","Pitch 7"],
  ["2026-08-07","10:50","M65","MAS","NED","Pitch 1"],
  ["2026-08-07","11:05","M65","USA","BEL","Pitch 5"],
  // ---- Saturday 8 August ----
  ["2026-08-08","12:55","M65","RSA","ENG","Pitch 5"],
  ["2026-08-08","13:10","M65","NED","IRL","Pitch 2"],
  ["2026-08-08","13:25","M65","CAN","MAS","Pitch 7"],
  ["2026-08-08","14:30","M65","ITA","ARG","Pitch 1"],
  ["2026-08-08","14:45","M65","JPN","NZL","Pitch 5"],
  // ---- Sunday 9 August ----
  ["2026-08-09","09:00","M65","GER","SCO","Pitch 1"],
  ["2026-08-09","09:15","M65","BEL","AUS","Pitch 5"],
  ["2026-08-09","09:30","M65","IRL","JPN","Pitch 2"],
  ["2026-08-09","09:45","M65","WAL","CAN","Pitch 7"],
  ["2026-08-09","10:50","M65","FRA","USA","Pitch 1"],
  ["2026-08-09","11:05","M65","ARG","RSA","Pitch 5"],
  // ---- Monday 10 August ----
  ["2026-08-10","12:40","M65","AUS","NZL","Pitch 1"],
  ["2026-08-10","12:55","M65","SCO","MAS","Pitch 5"],
  ["2026-08-10","13:10","M65","WAL","BEL","Pitch 2"],
  ["2026-08-10","14:45","M65","FRA","NED","Pitch 5"],
  ["2026-08-10","15:00","M65","ENG","USA","Pitch 2"],
  ["2026-08-10","15:15","M65","ITA","GER","Pitch 7"],
  // ---- Tuesday 11 August ----
  ["2026-08-11","12:55","M65","JPN","ENG","Pitch 5"],
  ["2026-08-11","13:10","M65","NED","ARG","Pitch 2"],
  ["2026-08-11","13:25","M65","CAN","AUS","Pitch 7"],
  ["2026-08-11","14:30","M65","IRL","RSA","Pitch 1"],
  ["2026-08-11","14:45","M65","NZL","WAL","Pitch 5"],
  ["2026-08-11","15:00","M65","MAS","ITA","Pitch 2"],
  // ---- Wednesday 12 August ----
  ["2026-08-12","10:30","M65","BEL","JPN","Pitch 1"],
  ["2026-08-12","10:45","M65","GER","CAN","Pitch 5"],
  ["2026-08-12","11:00","M65","ARG","SCO","Pitch 2"],
  ["2026-08-12","11:15","M65","RSA","FRA","Pitch 7"],
  ["2026-08-12","12:30","M65","USA","IRL","Pitch 1"],
];

// Knockout & classification. `teams` = fill in (e.g. ["USA","NED"]) once known.
const KNOCKOUT_BRE = [
  // ---- Thursday 13 August ----
  { d:"2026-08-13", t:"09:00", div:"M65", label:"Quarterfinal 1 · 4th vs 5th of Pool A", p:"Pitch 1" },
  { d:"2026-08-13", t:"09:15", div:"M65", label:"Quarterfinal 2 · 3rd vs 6th of Pool A", p:"Pitch 5" },
  { d:"2026-08-13", t:"09:30", div:"M65", label:"Class 13–17 crossover · 15th vs 17th of Pool A", p:"Pitch 2" },
  { d:"2026-08-13", t:"11:00", div:"M65", label:"Quarterfinal 4 · 1st vs 8th of Pool A", p:"Pitch 1" },
  { d:"2026-08-13", t:"11:15", div:"M65", label:"Quarterfinal 3 · 2nd vs 7th of Pool A", p:"Pitch 5" },
  { d:"2026-08-13", t:"13:00", div:"M65", label:"Crossover · 11th vs 14th of Pool A", p:"Pitch 1" },
  { d:"2026-08-13", t:"13:15", div:"M65", label:"Crossover · 12th vs 13th of Pool A", p:"Pitch 5" },
  // ---- Saturday 15 August ----
  { d:"2026-08-15", t:"09:00", div:"M65", label:"SEMIFINAL · Winners QF4 vs QF1", p:"Pitch 1" },
  { d:"2026-08-15", t:"09:15", div:"M65", label:"SEMIFINAL · Winners QF3 vs QF2", p:"Pitch 5" },
  { d:"2026-08-15", t:"09:30", div:"M65", label:"Class 5–8 semi · Losers QF3 vs QF2", p:"Pitch 2" },
  { d:"2026-08-15", t:"09:45", div:"M65", label:"Class 5–8 semi · Losers QF4 vs QF1", p:"Pitch 7" },
  { d:"2026-08-15", t:"11:00", div:"M65", label:"Class 9–12 · 9th of Pool A vs crossover winner", p:"Pitch 1" },
  { d:"2026-08-15", t:"11:15", div:"M65", label:"Class 9–12 · 10th of Pool A vs crossover winner", p:"Pitch 5" },
  { d:"2026-08-15", t:"11:30", div:"M65", label:"Class 13/14 · Crossover losers", p:"Pitch 2" },
  { d:"2026-08-15", t:"11:45", div:"M65", label:"Class 13–17 crossover · 17th vs 16th of Pool A", p:"Pitch 7" },
  // ---- Sunday 16 August ----
  { d:"2026-08-16", t:"14:45", div:"M65", label:"Class 13–17 crossover · 16th vs 15th of Pool A", p:"Pitch 7" },
  { d:"2026-08-16", t:"16:15", div:"M65", label:"Class 7/8 · Class 5–8 semi losers", p:"Pitch 5" },
  { d:"2026-08-16", t:"16:45", div:"M65", label:"Class 11/12 · Class 9–12 losers", p:"Pitch 7" },
  { d:"2026-08-16", t:"18:00", div:"M65", label:"🏆 FINAL", p:"Pitch 1" },
  { d:"2026-08-16", t:"18:15", div:"M65", label:"Bronze medal · Class 3/4", p:"Pitch 5" },
  { d:"2026-08-16", t:"18:30", div:"M65", label:"Class 5/6 · Class 5–8 semi winners", p:"Pitch 2" },
  { d:"2026-08-16", t:"18:45", div:"M65", label:"Class 9/10 · Class 9–12 winners", p:"Pitch 7" },
];

const FINAL_RANKS_BRE = { M65: {} };

// Special events (non-match)
const EVENTS_BRE = [
  { d: "2026-08-06", t: "16:00", title: "🎉 Opening Ceremony — BHV Push", note: "The Breda O65+ tournament officially begins", venue: "push" },
];

const USA_TEAMS_BRE = [
  { code: "M65", name: "Men O65", venue: "BHV Push, Breda · Pool A", inApp: true },
];

// Per-game stream links — key "date|time|pitch" (NL time) → URL
const VIDEO_BRE = {};

const LINKS_BRE = {
  stream: "https://www.worldmastershockey.tv/",
  youtube: "https://www.youtube.com/channel/UCk6X0_aIFngcxt3HiX2Hh_w",
  schedulePdf: "https://drive.google.com/file/d/1KqjbrM43nXkRKDtKdekwDkj6Q7mECqyu/view",
  liveResults: "https://masters.altiusrt.com/",
  eventSite: "https://pushmasters.nl/",
  instagram: "https://www.instagram.com/usamastersfh/",
};
