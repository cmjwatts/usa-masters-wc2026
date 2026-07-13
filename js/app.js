// ============================================================
// USA Masters WC2026 hub — rendering & filters
// ============================================================

const ALL_DIVS = ["W35", "W40", "M35", "M40", "W45", "W50", "M45", "M50", "W35I"];

// pitch cell: Schiedam pitches are numbers; Rotterdam ones carry their venue
const pitchLabel = (p) => (typeof p === "number" ? `Pitch ${p}` : p);

const state = {
  tz: localStorage.getItem("wc-tz") || "NL", // NL (CEST) or ET (US Eastern, -6h)
  team: "USA",
  divs: new Set(["W35"]), // multi-select; all four = "All"
  showKO: true,
  standDiv: "W35",
};

const $ = (sel) => document.querySelector(sel);
const DATE_LABELS = {
  "2026-07-20": ["Monday", "July 20", "Practice day"],
  "2026-07-21": ["Tuesday", "July 21", "Practice day"],
  "2026-07-22": ["Wednesday", "July 22", "Opening day"],
  "2026-07-23": ["Thursday", "July 23", "Pool play · Day 1"],
  "2026-07-24": ["Friday", "July 24", "Pool play · Day 2"],
  "2026-07-25": ["Saturday", "July 25", "Pool play · Day 3"],
  "2026-07-26": ["Sunday", "July 26", "Pool play · Day 4"],
  "2026-07-27": ["Monday", "July 27", "Pool play · Day 5"],
  "2026-07-28": ["Tuesday", "July 28", "Pool play · Final day"],
  "2026-07-29": ["Wednesday", "July 29", "Quarterfinals + Dutch Party"],
  "2026-07-30": ["Thursday", "July 30", "Crossovers"],
  "2026-07-31": ["Friday", "July 31", "Semifinals"],
  "2026-08-01": ["Saturday", "August 1", "FINALS DAY"],
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
    return { main: t.main, sub: `${t.suffix} NL` };
  }
  let eh = h - 6; // CEST -> EDT
  let dayNote = "";
  if (eh < 0) { eh += 24; dayNote = " (-1d)"; }
  const t = to12h(eh, m);
  return { main: t.main, sub: `${t.suffix} ET${dayNote}` };
}

function teamName(code) {
  const t = TEAMS[code];
  return t ? `${t.flag} ${t.name}` : code;
}

// ---- schedule filtering ----
function poolRow(r) {
  let [d, t, div, h, a, p, hs, as] = r;
  // auto-scraped scores (js/results.js) fill in unless hand-entered in data.js
  if (hs == null && typeof RESULTS !== "undefined") {
    const auto = RESULTS[`${div}|${h}|${a}`] || RESULTS[`${div}|${a}|${h}`]?.slice().reverse();
    if (auto) [hs, as] = auto;
  }
  return { d, t, div, h, a, p, hs, as, type: "pool" };
}

function koVisible(row) {
  if (state.team === "ALL") return true;
  // matchup already known → only show for those teams
  if (row.teams && row.teams.length) return row.teams.includes(state.team);
  // pool rank known → hide games that rank can't reach
  const rank = FINAL_RANKS[row.div]?.[state.team];
  if (rank != null) return row.ranks.includes(rank);
  // nothing known yet → show the full bracket path
  return true;
}

function matchesFiltered() {
  const rows = [];
  for (const r of POOL) {
    const m = poolRow(r);
    if (!state.divs.has(m.div)) continue;
    if (state.team !== "ALL" && m.h !== state.team && m.a !== state.team) continue;
    rows.push(m);
  }
  if (state.showKO) {
    for (const k of KNOCKOUT) {
      if (!state.divs.has(k.div)) continue;
      if (!koVisible(k)) continue;
      rows.push({ ...k, type: "ko" });
    }
    for (const ev of EVENTS) {
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
  if ([...state.divs].some((d) => DIVISIONS[d].partial)) {
    html += `<div class="partial-note">🇺🇸 Rotterdam divisions (O45 · O50 · IMC) show <strong>USA games and key knockout rounds only</strong> — full grids in the <a href="${LINKS.schedulePdfRotterdam}" target="_blank" rel="noopener">official Rotterdam PDF ↗</a></div>`;
  }
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
          ? `${teamName(r.teams[0])}<span class="vs">vs</span>${teamName(r.teams[1])} <span class="m-note">${r.label}</span>`
          : `${r.label}${state.team !== "ALL" ? `<span class="m-note">Bracket game — opponents decided by standings</span>` : ""}`;
        const usa = named && r.teams.includes("USA");
        html += `<div class="match-row is-ko ${usa ? "is-usa" : ""}">${timeCell}<div class="m-div d-${r.div}">${DIVISIONS[r.div].short}</div><div class="m-label">${title}</div><div class="m-pitch">${pitchLabel(r.p)}</div></div>`;
      } else {
        const usa = r.h === "USA" || r.a === "USA";
        const name = (c) => `<span class="${c === "USA" ? "usa-name" : ""}">${teamName(c)}</span>`;
        const score = r.hs != null ? `<b class="m-score">${r.hs}–${r.as}</b>` : `<span class="vs">vs</span>`;
        const vid = VIDEO[`${r.d}|${r.t}|${r.p}`];
        const watch = vid ? `<a class="m-watch" href="${vid}" target="_blank" rel="noopener">▶ Watch</a>` : "";
        html += `<div class="match-row ${usa ? "is-usa" : ""}">${timeCell}<div class="m-div d-${r.div}">${DIVISIONS[r.div].short}</div><div class="m-match">${name(r.h)}${score}${name(r.a)}</div><div class="m-pitch">${pitchLabel(r.p)}${watch}</div></div>`;
      }
    }
    html += `</div>`;
  }
  list.innerHTML = html;
}

// ---- standings (computed from POOL scores; 3-1-0 points) ----
function computeStandings(div) {
  const table = {};
  const ensure = (c) => (table[c] ??= { code: c, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, Pts: 0 });
  for (const r of POOL) {
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
    TEAMS[x.code].name.localeCompare(TEAMS[y.code].name));
}

function renderStandings() {
  const rows = computeStandings(state.standDiv);
  const played = rows.some((r) => r.P > 0);
  const note = (played
    ? `Unofficial — computed from results entered on this site. Confirm on <a href="https://masters.altiusrt.com/" target="_blank" rel="noopener">AltiusRT</a>.`
    : `Pool play starts July 23 — the table fills in as results come in. Official live standings will also post on <a href="https://masters.altiusrt.com/" target="_blank" rel="noopener">AltiusRT</a>.`)
    + ` Rotterdam divisions (O45/O50/IMC): standings on AltiusRT & the <a href="${LINKS.schedulePdfRotterdam}" target="_blank" rel="noopener">official PDF</a>.`;
  $("#standingsNote").innerHTML = note;
  $("#standingsTable").innerHTML = `
    <table class="stand-table">
      <thead><tr><th>#</th><th class="st-team">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
      <tbody>${rows.map((r, i) => `
        <tr class="${r.code === "USA" ? "st-usa" : ""}">
          <td>${i + 1}</td>
          <td class="st-team">${teamName(r.code)}</td>
          <td>${r.P}</td><td>${r.W}</td><td>${r.D}</td><td>${r.L}</td>
          <td>${r.GF}</td><td>${r.GA}</td><td>${r.GF - r.GA > 0 ? "+" : ""}${r.GF - r.GA}</td>
          <td><b>${r.Pts}</b></td>
        </tr>`).join("")}
      </tbody>
    </table>`;
}

// ---- filters ----
function buildTeamSelect() {
  const sel = $("#teamSel");
  const codes = new Set();
  // dropdown only lists teams with complete schedules (Schiedam divisions);
  // Rotterdam teams are reachable via the USA quick-view chips
  POOL.forEach(([, , div, h, a]) => {
    if (DIVISIONS[div].partial) return;
    codes.add(h); codes.add(a);
  });
  const sorted = [...codes].sort((a, b) => TEAMS[a].name.localeCompare(TEAMS[b].name));
  sel.innerHTML =
    `<option value="ALL">All teams</option>` +
    sorted.map((c) => `<option value="${c}" ${c === "USA" ? "selected" : ""}>${TEAMS[c].flag} ${TEAMS[c].name}</option>`).join("");
  sel.addEventListener("change", () => { state.team = sel.value; syncChips(); renderSchedule(); });
}

function syncChips() {
  const isAll = state.divs.size === ALL_DIVS.length;
  document.querySelectorAll("#divChips .chip").forEach((c) => {
    if (c.dataset.div === "ALL") c.classList.toggle("active", isAll);
    else c.classList.toggle("active", !isAll && state.divs.has(c.dataset.div));
  });
  document.querySelectorAll("#usaChips .chip").forEach((c) =>
    c.classList.toggle("active", state.team === "USA" && !isAll && state.divs.size === 1 && state.divs.has(c.dataset.div)));
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
  document.querySelectorAll("#usaChips .chip").forEach((c) =>
    c.addEventListener("click", () => {
      state.team = "USA"; state.divs = new Set([c.dataset.div]);
      $("#teamSel").value = "USA"; syncChips(); renderSchedule();
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
    $("#tzLabel").textContent = state.tz === "NL" ? "Netherlands time" : "US Eastern time";
  };
  btn.addEventListener("click", () => {
    state.tz = state.tz === "NL" ? "ET" : "NL";
    localStorage.setItem("wc-tz", state.tz);
    apply(); renderSchedule();
  });
  apply();
}

// ---- countdown to Opening Ceremony (July 22, 19:00 CEST = 17:00 UTC) ----
function initCountdown() {
  const el = $("#countdown");
  const target = Date.UTC(2026, 6, 22, 17, 0, 0);
  const firstGame = Date.UTC(2026, 6, 23, 14, 20, 0); // WO35 USA v AUS 16:20 CEST
  function tick() {
    const now = Date.now();
    let diff = target - now;
    let caption = "until the Opening Ceremony";
    if (diff <= 0) {
      diff = firstGame - now;
      caption = "until USA WO35 v Australia";
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
function renderTeams() {
  const grid = $("#teamGrid");
  grid.innerHTML = USA_TEAMS.map((t) => `
    <div class="team-card ${t.star ? "star" : ""}" ${t.inApp ? `data-div="${t.code}"` : ""}>
      <h3>🇺🇸 ${t.name}</h3>
      <p class="t-venue">${t.venue}</p>
      <p class="t-cta">${t.inApp ? "Tap to see their schedule ↑" : "Schedule posts separately →"}</p>
    </div>`).join("");
  grid.querySelectorAll(".team-card[data-div]").forEach((card) =>
    card.addEventListener("click", () => {
      state.team = "USA"; state.divs = new Set([card.dataset.div]);
      $("#teamSel").value = "USA"; syncChips(); renderSchedule();
      $("#schedule").scrollIntoView({ behavior: "smooth" });
    }));
}

// ---- calendar export (.ics) ----
// Times are entered in NL time (CEST, UTC+2) and written to the file in UTC,
// so they land correctly in any calendar app regardless of the user's zone.
function icsStamp(dateStr, hhmm, addMinutes = 0) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, m] = hhmm.split(":").map(Number);
  const utc = new Date(Date.UTC(y, mo - 1, d, h - 2, m + addMinutes)); // CEST -> UTC
  return utc.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// venue depends on the pitch: ROT/VIC prefixes are the Rotterdam grounds
function icsLocation(p) {
  const s = String(p);
  if (s.startsWith("ROT")) return "HC Rotterdam\\, Hazelaarweg 2\\, 3053 PM Rotterdam\\, Netherlands";
  if (s.startsWith("VIC")) return "HC Victoria\\, Kralingseweg 226\\, 3062 CG Rotterdam\\, Netherlands";
  return "HC Schiedam\\, Olympiaweg 63\\, 3118 JD Schiedam\\, Netherlands";
}

function buildICS() {
  // Only games we KNOW: pool matches, plus knockout games once their
  // matchup has been filled in (teams array set in data.js).
  const rows = matchesFiltered().filter((r) =>
    r.type === "pool" || (r.type === "ko" && r.teams && r.teams.length));
  const events = rows.map((r) => {
    const divShort = DIVISIONS[r.div].label.replace("Women", "W").replace("Men", "M");
    const title = r.type === "ko"
      ? `${divShort} ${r.teams[0]} vs. ${r.teams[1]}`
      : `${divShort} ${r.h} vs. ${r.a}`;
    const where = String(r.p).startsWith("ROT") || String(r.p).startsWith("VIC") ? "Rotterdam" : "Schiedam";
    const desc = r.type === "ko"
      ? `${pitchLabel(r.p)} · ${r.label} · 2026 WMH Masters World Cup · ${where}`
      : `${pitchLabel(r.p)} · 2026 WMH Masters World Cup · ${where}`;
    return [
      "BEGIN:VEVENT",
      `UID:wc2026-${r.d}-${r.t.replace(":", "")}-${String(r.p).replace(/\s+/g, "") || "ev"}@usamasters`,
      `DTSTAMP:${icsStamp("2026-07-01", "12:00")}`,
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
    a.download = `wc2026-${who}-${[...state.divs].join("-")}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

// ---- ticker ----
function initTicker() {
  const items = "GO USA 🇺🇸 · NETHERLANDS 2026 · SCHIEDAM + ROTTERDAM · JULY 22 – AUG 1 · WORLD MASTERS HOCKEY · ";
  $("#ticker").textContent = (items + items).repeat(2);
}

// deep links from the hub (july.html?div=W45) land pre-filtered on that USA team
const qDiv = new URLSearchParams(location.search).get("div");
if (qDiv && DIVISIONS[qDiv]) {
  state.team = "USA";
  state.divs = new Set([qDiv]);
  state.standDiv = ["W35", "W40", "M35", "M40"].includes(qDiv) ? qDiv : state.standDiv;
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
