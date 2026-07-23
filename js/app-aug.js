// ============================================================
// USA Masters WC2026 — Brasschaat & Antwerp page (Aug 6–16)
// Fork of js/app.js wired to the _AUG data globals (js/data-aug.js);
// the July page and its files are frozen during the live window.
// Consolidate into a shared config after the season.
// ============================================================

const ALL_DIVS = ["W55", "W60", "W65", "M55", "M60"];

const pitchLabel = (p) => (typeof p === "number" ? `Pitch ${p}` : p);

const state = {
  tz: localStorage.getItem("wc-tz") || "NL", // NL = European local (CEST), ET = US Eastern
  team: "USA",
  divs: new Set(ALL_DIVS), // default: every USA division
  showKO: true,
  standDiv: "W55",
};

const $ = (sel) => document.querySelector(sel);
const DATE_LABELS = {
  "2026-08-03": ["Monday", "August 3", "Training day"],
  "2026-08-04": ["Tuesday", "August 4", "Training day"],
  "2026-08-05": ["Wednesday", "August 5", "Training day"],
  "2026-08-06": ["Thursday", "August 6", "Opening Ceremony"],
  "2026-08-07": ["Friday", "August 7", "Pool play · Day 1"],
  "2026-08-08": ["Saturday", "August 8", "Pool play · Day 2"],
  "2026-08-09": ["Sunday", "August 9", "Pool play · Day 3"],
  "2026-08-10": ["Monday", "August 10", "Pool play · Day 4"],
  "2026-08-11": ["Tuesday", "August 11", "Pool play · Day 5"],
  "2026-08-12": ["Wednesday", "August 12", "Pool play · Final day"],
  "2026-08-13": ["Thursday", "August 13", "Quarterfinals & crossovers"],
  "2026-08-14": ["Friday", "August 14", "Knockout rounds"],
  "2026-08-15": ["Saturday", "August 15", "Semifinals & classification"],
  "2026-08-16": ["Sunday", "August 16", "FINALS DAY"],
};

// ---- time helpers (12-hour everywhere — easier for US fans) ----
function to12h(h, m) {
  const suffix = h >= 12 ? "PM" : "AM";
  let h12 = h % 12; if (h12 === 0) h12 = 12;
  return { main: `${h12}:${String(m).padStart(2, "0")}`, suffix };
}
function displayTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  if (state.tz === "NL") {
    const t = to12h(h, m);
    return { main: t.main, sub: `${t.suffix} BE` };
  }
  let eh = h - 6; // CEST -> EDT
  let dayNote = "";
  if (eh < 0) { eh += 24; dayNote = " (-1d)"; }
  const t = to12h(eh, m);
  return { main: t.main, sub: `${t.suffix} ET${dayNote}` };
}

function teamName(code) {
  const t = TEAMS_AUG[code];
  return t ? `${t.flag} ${t.name}` : code;
}

// In the schedule, USA squads read "US <division>" (e.g. US WO55) so
// multi-team views make clear which team is playing.
function teamNameIn(code, div) {
  if (code === "USA") return `${TEAMS_AUG.USA.flag} US ${DIVISIONS_AUG[div].short}`;
  return teamName(code);
}

// ---- schedule filtering ----
function poolRow(r) {
  let [d, t, div, h, a, p, hs, as] = r;
  // auto-scraped scores (js/results-aug.js) fill in unless hand-entered
  if (hs == null && typeof RESULTS_AUG !== "undefined") {
    const auto = RESULTS_AUG[`${div}|${h}|${a}`] || RESULTS_AUG[`${div}|${a}|${h}`]?.slice().reverse();
    if (auto) [hs, as] = auto;
  }
  return { d, t, div, h, a, p, hs, as, type: "pool" };
}

function koVisible(row) {
  if (state.team === "ALL") return true;
  // matchup already known → only show for those teams
  if (row.teams && row.teams.length) return row.teams.includes(state.team);
  // multi-pool brackets carry no rank ranges → show the full bracket path
  const rank = FINAL_RANKS_AUG[row.div]?.[state.team];
  if (rank != null && row.ranks) return row.ranks.includes(rank);
  return true;
}

function matchesFiltered() {
  const rows = [];
  for (const r of POOL_AUG) {
    const m = poolRow(r);
    if (!state.divs.has(m.div)) continue;
    if (state.team !== "ALL" && m.h !== state.team && m.a !== state.team) continue;
    rows.push(m);
  }
  if (state.showKO) {
    for (const k of KNOCKOUT_AUG) {
      if (!state.divs.has(k.div)) continue;
      if (!koVisible(k)) continue;
      rows.push({ ...k, type: "ko" });
    }
    for (const ev of EVENTS_AUG) {
      rows.push({ d: ev.d, t: ev.t, title: ev.title, note: ev.note, type: "event" });
    }
  }
  rows.sort((x, y) => (x.d + x.t).localeCompare(y.d + y.t));
  return rows;
}

function renderSchedule() {
  const list = $("#scheduleList");
  const rows = matchesFiltered();
  if (!rows.length) {
    list.innerHTML = `<div class="empty-state">No matches for this filter — try “All” divisions.</div>`;
    return;
  }
  const byDay = {};
  rows.forEach((r) => (byDay[r.d] ??= []).push(r));
  let html = "";
  for (const day of Object.keys(byDay).sort()) {
    const [wd, date, tag] = DATE_LABELS[day] || ["", day, ""];
    html += `<div class="day-block"><div class="day-head"><h3>${wd} ${date}</h3><small>${tag}</small></div>`;
    for (const r of byDay[day]) {
      const tt = displayTime(r.t);
      const timeCell = `<div class="m-time">${tt.main}<small>${tt.sub}</small></div>`;
      if (r.type === "event") {
        html += `<div class="match-row is-event">${timeCell}<div class="m-label">${r.title}<span class="m-note">${r.note}</span></div></div>`;
      } else if (r.type === "ko") {
        const named = r.teams && r.teams.length;
        const title = named
          ? `${teamNameIn(r.teams[0], r.div)}<span class="vs">vs</span>${teamNameIn(r.teams[1], r.div)} <span class="m-note">${r.label}</span>`
          : `${r.label}${state.team !== "ALL" ? `<span class="m-note">Bracket game — opponents decided by standings</span>` : ""}`;
        const usa = named && r.teams.includes("USA");
        html += `<div class="match-row is-ko ${usa ? "is-usa" : ""}">${timeCell}<div class="m-div d-${r.div}">${DIVISIONS_AUG[r.div].short}</div><div class="m-label">${title}</div><div class="m-pitch">${pitchLabel(r.p)}</div></div>`;
      } else {
        const usa = r.h === "USA" || r.a === "USA";
        const name = (c) => `<span class="${c === "USA" ? "usa-name" : ""}">${teamNameIn(c, r.div)}</span>`;
        const vid = VIDEO_AUG[`${r.d}|${r.t}|${r.p}`];
        const watch = vid ? `<a class="m-watch" href="${vid}" target="_blank" rel="noopener">▶ Watch</a>` : "";
        // finished games swap the pitch for a "Final" + score block
        const right = r.hs != null
          ? `<div class="m-pitch m-result"><span class="final-tag">Final</span><b class="m-score">${r.hs}–${r.as}</b>${watch}</div>`
          : `<div class="m-pitch">${pitchLabel(r.p)}${watch}</div>`;
        html += `<div class="match-row ${usa ? "is-usa" : ""}">${timeCell}<div class="m-div d-${r.div}">${DIVISIONS_AUG[r.div].short}</div><div class="m-match">${name(r.h)}<span class="vs">vs</span>${name(r.a)}</div>${right}</div>`;
      }
    }
    html += `</div>`;
  }
  list.innerHTML = html;
}

// ---- standings (computed from POOL_AUG scores; 3-1-0 points) ----
function computeStandings(div) {
  const table = {};
  const ensure = (c) => (table[c] ??= { code: c, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, Pts: 0 });
  for (const r of POOL_AUG) {
    const { div: d, h, a, hs, as } = poolRow(r);
    if (d !== div) continue;
    const H = ensure(h), A = ensure(a);
    if (hs == null || as == null) continue;
    H.P++; A.P++; H.GF += hs; H.GA += as; A.GF += as; A.GA += hs;
    if (hs > as) { H.W++; A.L++; H.Pts += 3; }
    else if (hs < as) { A.W++; H.L++; A.Pts += 3; }
    else { H.D++; A.D++; H.Pts++; A.Pts++; }
  }
  return Object.values(table).sort((x, y) =>
    y.Pts - x.Pts || (y.GF - y.GA) - (x.GF - x.GA) || y.GF - x.GF ||
    TEAMS_AUG[x.code].name.localeCompare(TEAMS_AUG[y.code].name));
}

function renderStandings() {
  const rows = computeStandings(state.standDiv);
  const played = rows.some((r) => r.P > 0);
  const note = played
    ? `Unofficial — computed from results entered on this site. Confirm on <a href="https://masters.altiusrt.com/" target="_blank" rel="noopener">AltiusRT</a>.`
    : `Pool play starts August 7 — tables fill in as results come in. Official live standings will also post on <a href="https://masters.altiusrt.com/" target="_blank" rel="noopener">AltiusRT</a>.`;
  $("#standingsNote").innerHTML = note;
  const table = (rows2, heading) => `
    ${heading ? `<h3 class="pool-head">${heading}</h3>` : ""}
    <table class="stand-table">
      <thead><tr><th>#</th><th class="st-team">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
      <tbody>${rows2.map((r, i) => `
        <tr class="${r.code === "USA" ? "st-usa" : ""}">
          <td>${i + 1}</td>
          <td class="st-team">${teamName(r.code)}</td>
          <td>${r.P}</td><td>${r.W}</td><td>${r.D}</td><td>${r.L}</td>
          <td>${r.GF}</td><td>${r.GA}</td><td>${r.GF - r.GA > 0 ? "+" : ""}${r.GF - r.GA}</td>
          <td><b>${r.Pts}</b></td>
        </tr>`).join("")}
      </tbody>
    </table>`;
  const pools = DIVISION_POOLS_AUG[state.standDiv];
  if (pools) {
    // multi-pool division: one table per round-robin pool (USA's pool first)
    const byCode = Object.fromEntries(rows.map((r) => [r.code, r]));
    const letters = Object.keys(pools).sort((a, b) =>
      pools[b].includes("USA") - pools[a].includes("USA") || a.localeCompare(b));
    $("#standingsTable").innerHTML = letters.map((letter) => {
      const teams = pools[letter];
      const poolRows = rows.length
        ? teams.map((c) => byCode[c]).filter(Boolean)
        : teams.map((c) => ({ code: c, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, Pts: 0 }));
      return table(poolRows, `Pool ${letter}${teams.includes("USA") ? " 🇺🇸" : ""}`);
    }).join("");
  } else {
    $("#standingsTable").innerHTML = table(rows);
  }
}

// ---- filters ----
function buildTeamSelect() {
  const sel = $("#teamSel");
  const codes = new Set();
  POOL_AUG.forEach(([, , , h, a]) => { codes.add(h); codes.add(a); });
  const sorted = [...codes].sort((a, b) => TEAMS_AUG[a].name.localeCompare(TEAMS_AUG[b].name));
  sel.innerHTML =
    `<option value="ALL">All teams</option>` +
    sorted.map((c) => `<option value="${c}" ${c === "USA" ? "selected" : ""}>${TEAMS_AUG[c].flag} ${TEAMS_AUG[c].name}</option>`).join("");
  sel.addEventListener("change", () => { state.team = sel.value; syncChips(); renderSchedule(); });
}

function syncChips() {
  const isAll = state.divs.size === ALL_DIVS.length;
  document.querySelectorAll("#divChips .chip").forEach((c) => {
    if (c.dataset.div === "ALL") c.classList.toggle("active", isAll);
    else c.classList.toggle("active", !isAll && state.divs.has(c.dataset.div));
  });
}

function initFilters() {
  document.querySelectorAll("#divChips .chip").forEach((c) =>
    c.addEventListener("click", () => {
      const d = c.dataset.div;
      if (d === "ALL") {
        state.divs = new Set(ALL_DIVS);
      } else if (state.divs.size === ALL_DIVS.length) {
        state.divs = new Set([d]); // narrowing down from "All"
      } else if (state.divs.has(d)) {
        state.divs.delete(d);
        if (!state.divs.size) state.divs = new Set(ALL_DIVS); // none left → All
      } else {
        state.divs.add(d);
      }
      syncChips(); renderSchedule();
    }));
  $("#showKO").addEventListener("change", (e) => { state.showKO = e.target.checked; renderSchedule(); });
  document.querySelectorAll("#standDivChips .chip").forEach((c) =>
    c.addEventListener("click", () => {
      state.standDiv = c.dataset.div;
      document.querySelectorAll("#standDivChips .chip").forEach((x) => x.classList.toggle("active", x === c));
      renderStandings();
    }));
}

// ---- timezone toggle ----
function initTz() {
  const btn = $("#tzToggle");
  const apply = () => {
    btn.querySelectorAll("span").forEach((s) => s.classList.toggle("on", s.dataset.tz === state.tz));
    $("#tzLabel").textContent = state.tz === "NL" ? "Belgium time (CEST)" : "US Eastern time";
  };
  btn.addEventListener("click", () => {
    state.tz = state.tz === "NL" ? "ET" : "NL";
    localStorage.setItem("wc-tz", state.tz);
    apply(); renderSchedule();
  });
  apply();
}

// ---- countdown to the Opening Ceremony (Aug 6, 18:00 CEST = 16:00 UTC) ----
function initCountdown() {
  const el = $("#countdown");
  const target = Date.UTC(2026, 7, 6, 16, 0, 0);
  const firstGame = Date.UTC(2026, 7, 7, 8, 20, 0); // MO55 NZL v USA 10:20 CEST
  function tick() {
    const now = Date.now();
    let diff = target - now;
    let caption = "until the Opening Ceremony in Brasschaat";
    if (diff <= 0) {
      diff = firstGame - now;
      caption = "until USA MO55 v New Zealand";
    }
    if (diff <= 0) {
      el.innerHTML = `<span class="cd-live">🏑 IT'S GAME TIME — GO USA!</span>`;
      return;
    }
    const days = Math.floor(diff / 864e5);
    const hrs = Math.floor((diff % 864e5) / 36e5);
    const mins = Math.floor((diff % 36e5) / 6e4);
    el.innerHTML =
      `<div class="cd"><b>${days}</b><small>days</small></div>` +
      `<div class="cd"><b>${hrs}</b><small>hours</small></div>` +
      `<div class="cd"><b>${mins}</b><small>mins</small></div>` +
      `<div class="cd"><b style="font-size:1rem;max-width:150px;display:block;line-height:1.2;padding-top:8px">${caption}</b></div>`;
  }
  tick();
  setInterval(tick, 30_000);
}

// ---- USA team cards ----
// Plain schedule-filter cards only: Belgium teams get no roster pages or
// roster copy on this page (per the locked Brasschaat plan, decision 5).
function renderTeams() {
  const grid = $("#teamGrid");
  grid.innerHTML = USA_TEAMS_AUG.map((t) => `
    <div class="team-card static" data-div="${t.code}">
      <h3>🇺🇸 ${t.name}</h3>
      <p class="t-venue">${t.venue}</p>
      <p class="t-cta">Tap to see their schedule ↑</p>
    </div>`).join("");
  grid.querySelectorAll(".team-card[data-div]").forEach((card) =>
    card.addEventListener("click", () => {
      state.team = "USA"; state.divs = new Set([card.dataset.div]);
      $("#teamSel").value = "USA"; syncChips(); renderSchedule();
      $("#schedule").scrollIntoView({ behavior: "smooth" });
    }));
}

// ---- calendar export (.ics) ----
// Times are entered in Belgium time (CEST, UTC+2) and written in UTC.
function icsStamp(dateStr, hhmm, addMinutes = 0) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, m] = hhmm.split(":").map(Number);
  const utc = new Date(Date.UTC(y, mo - 1, d, h - 2, m + addMinutes)); // CEST -> UTC
  return utc.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// venue depends on the pitch prefix: DRA = KHC Dragons, OLY = HC Olympia
function icsLocation(p) {
  const s = String(p);
  if (s.startsWith("OLY")) return "HC Olympia\\, Vogelzanglaan 6\\, 2020 Antwerpen\\, Belgium";
  return "KHC Dragons\\, Sportendreef 1\\, 2930 Brasschaat\\, Belgium";
}

function buildICS() {
  const rows = matchesFiltered().filter((r) =>
    r.type === "pool" || (r.type === "ko" && r.teams && r.teams.length));
  const events = rows.map((r) => {
    const divShort = DIVISIONS_AUG[r.div].label.replace("Women", "W").replace("Men", "M");
    const title = r.type === "ko"
      ? `${divShort} ${r.teams[0]} vs. ${r.teams[1]}`
      : `${divShort} ${r.h} vs. ${r.a}`;
    const where = String(r.p).startsWith("OLY") ? "Antwerp" : "Brasschaat";
    const desc = r.type === "ko"
      ? `${pitchLabel(r.p)} · ${r.label} · 2026 WMH Masters World Cup · ${where}`
      : `${pitchLabel(r.p)} · 2026 WMH Masters World Cup · ${where}`;
    return [
      "BEGIN:VEVENT",
      `UID:wc2026-${r.d}-${r.t.replace(":", "")}-${String(r.p).replace(/\s+/g, "") || "ev"}@usamasters`,
      `DTSTAMP:${icsStamp("2026-07-17", "12:00")}`,
      `DTSTART:${icsStamp(r.d, r.t)}`,
      `DTEND:${icsStamp(r.d, r.t, 90)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc.replace(/,/g, "\\,")}`,
      `LOCATION:${icsLocation(r.p)}`,
      "END:VEVENT",
    ].join("\r\n");
  });
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//USA Masters WC2026 Hub//EN",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

function initIcs() {
  $("#icsBtn").addEventListener("click", () => {
    const blob = new Blob([buildICS()], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const who = state.team === "ALL" ? "all-teams" : state.team;
    a.download = `wc2026-brasschaat-${who}-${[...state.divs].join("-")}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

// ---- ticker ----
function initTicker() {
  const items = "GO USA 🇺🇸 · BELGIUM 2026 · BRASSCHAAT + ANTWERP · AUG 6 – 16 · WORLD MASTERS HOCKEY · ";
  $("#ticker").textContent = (items + items).repeat(2);
}

// deep links from the hub (brasschaat.html?div=W55) land pre-filtered
const qDiv = new URLSearchParams(location.search).get("div");
if (qDiv && DIVISIONS_AUG[qDiv]) {
  state.team = "USA";
  state.divs = new Set([qDiv]);
  state.standDiv = qDiv;
  document.querySelectorAll("#standDivChips .chip").forEach((c) =>
    c.classList.toggle("active", c.dataset.div === qDiv));
}

buildTeamSelect();
initFilters();
initIcs();
initTz();
initCountdown();
renderTeams();
initTicker();
syncChips();
renderSchedule();
renderStandings();

// Arriving with a #hash: the browser's native anchor jump ran before the
// schedule was injected — re-align instantly after render.
if (location.hash) {
  const target = document.querySelector(location.hash);
  if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
}
