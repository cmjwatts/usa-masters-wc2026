// ============================================================
// USA Masters WC2026 hub — rendering & filters
// ============================================================

const state = {
  tz: localStorage.getItem("wc-tz") || "NL", // NL (CEST) or ET (US Eastern, -6h)
  team: "USA",
  div: "W35",
  showKO: true,
};

const $ = (sel) => document.querySelector(sel);
const DATE_LABELS = {
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

// ---- time helpers ----
function displayTime(hhmm) {
  if (state.tz === "NL") return { main: hhmm, sub: "NL" };
  const [h, m] = hhmm.split(":").map(Number);
  let eh = h - 6; // CEST -> EDT
  let suffix = "AM";
  let dayNote = "";
  if (eh < 0) { eh += 24; dayNote = " (-1d)"; }
  if (eh >= 12) { suffix = "PM"; }
  let h12 = eh % 12; if (h12 === 0) h12 = 12;
  return { main: `${h12}:${String(m).padStart(2, "0")}`, sub: `${suffix} ET${dayNote}` };
}

function teamName(code) {
  const t = TEAMS[code];
  return t ? `${t.flag} ${t.name}` : code;
}

// ---- schedule rendering ----
function matchesFiltered() {
  const rows = [];
  for (const [d, t, div, h, a, p] of POOL) {
    if (state.div !== "ALL" && div !== state.div) continue;
    if (state.team !== "ALL" && h !== state.team && a !== state.team) continue;
    rows.push({ d, t, div, h, a, p, type: "pool" });
  }
  if (state.showKO) {
    for (const [d, t, div, label, p] of KNOCKOUT) {
      if (state.div !== "ALL" && div !== state.div) continue;
      // when a team is selected, knockout opponents are unknown — keep rows for that division as "path to the final"
      rows.push({ d, t, div, label, p, type: "ko" });
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
  for (const day of Object.keys(byDay).sort()) {
    const [wd, date, tag] = DATE_LABELS[day] || ["", day, ""];
    html += `<div class="day-block"><div class="day-head"><h3>${wd} ${date}</h3><small>${tag}</small></div>`;
    for (const r of byDay[day]) {
      const tt = displayTime(r.t);
      const timeCell = `<div class="m-time">${tt.main}<small>${tt.sub}</small></div>`;
      if (r.type === "event") {
        html += `<div class="match-row is-event">${timeCell}<div class="m-label">${r.title}<span class="m-note">${r.note}</span></div></div>`;
      } else if (r.type === "ko") {
        const tbd = state.team !== "ALL" ? `<span class="m-note">Bracket game — opponents decided by standings</span>` : "";
        html += `<div class="match-row is-ko">${timeCell}<div class="m-div d-${r.div}">${DIVISIONS[r.div].short}</div><div class="m-label">${r.label}${tbd}</div><div class="m-pitch">Pitch ${r.p}</div></div>`;
      } else {
        const usa = r.h === "USA" || r.a === "USA";
        const name = (c) => `<span class="${c === "USA" ? "usa-name" : ""}">${teamName(c)}</span>`;
        html += `<div class="match-row ${usa ? "is-usa" : ""}">${timeCell}<div class="m-div d-${r.div}">${DIVISIONS[r.div].short}</div><div class="m-match">${name(r.h)}<span class="vs">vs</span>${name(r.a)}</div><div class="m-pitch">Pitch ${r.p}</div></div>`;
      }
    }
    html += `</div>`;
  }
  list.innerHTML = html;
}

// ---- filters ----
function buildTeamSelect() {
  const sel = $("#teamSel");
  const codes = new Set();
  POOL.forEach(([, , , h, a]) => { codes.add(h); codes.add(a); });
  const sorted = [...codes].sort((a, b) => TEAMS[a].name.localeCompare(TEAMS[b].name));
  sel.innerHTML =
    `<option value="ALL">All teams</option>` +
    sorted.map((c) => `<option value="${c}" ${c === "USA" ? "selected" : ""}>${TEAMS[c].flag} ${TEAMS[c].name}</option>`).join("");
  sel.addEventListener("change", () => { state.team = sel.value; syncChips(); renderSchedule(); });
}

function syncChips() {
  document.querySelectorAll("#divChips .chip").forEach((c) => c.classList.toggle("active", c.dataset.div === state.div));
  document.querySelectorAll("#usaChips .chip").forEach((c) =>
    c.classList.toggle("active", state.team === "USA" && c.dataset.div === state.div));
}

function initFilters() {
  document.querySelectorAll("#divChips .chip").forEach((c) =>
    c.addEventListener("click", () => { state.div = c.dataset.div; syncChips(); renderSchedule(); }));
  document.querySelectorAll("#usaChips .chip").forEach((c) =>
    c.addEventListener("click", () => {
      state.team = "USA"; state.div = c.dataset.div;
      $("#teamSel").value = "USA"; syncChips(); renderSchedule();
    }));
  $("#showKO").addEventListener("change", (e) => { state.showKO = e.target.checked; renderSchedule(); });
}

// ---- timezone toggle ----
function initTz() {
  const btn = $("#tzToggle");
  const apply = () => {
    btn.querySelectorAll("span").forEach((s) => s.classList.toggle("on", s.dataset.tz === state.tz));
    $("#tzLabel").textContent = state.tz === "NL" ? "Netherlands time (CEST)" : "US Eastern time";
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
      ${t.star ? `<span class="t-star">⭐</span>` : ""}
      <h3>🇺🇸 ${t.name}</h3>
      <p class="t-venue">${t.venue}</p>
      <p class="t-cta">${t.inApp ? "Tap to see their schedule ↑" : "Schedule posts separately →"}</p>
    </div>`).join("");
  grid.querySelectorAll(".team-card[data-div]").forEach((card) =>
    card.addEventListener("click", () => {
      state.team = "USA"; state.div = card.dataset.div;
      $("#teamSel").value = "USA"; syncChips(); renderSchedule();
      $("#schedule").scrollIntoView({ behavior: "smooth" });
    }));
}

// ---- ticker ----
function initTicker() {
  const items = "GO USA 🇺🇸 · SCHIEDAM 2026 · JULY 22 – AUG 1 · WOMEN O35 · WORLD MASTERS HOCKEY · ";
  $("#ticker").textContent = (items + items).repeat(2);
}

buildTeamSelect();
initFilters();
initTz();
initCountdown();
renderTeams();
initTicker();
syncChips();
renderSchedule();
