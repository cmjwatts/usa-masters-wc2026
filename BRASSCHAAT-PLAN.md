# Brasschaat Page Buildout Plan

_Decisions locked 2026-07-16. Supersedes UPDATE-PLAN.md §C1–C4 where they differ._

## Decisions

1. **Scope: Brasschaat page only** (`brasschaat.html`). The Belgium tournament — KHC Dragons
   Brasschaat + HC Olympia Antwerp, Aug 6–16, matches from Aug 7. USA divisions: **W55, W60,
   W65, M55, M60**. The Breda M65 page is deferred; its hub tile stays "coming soon".
2. **Data depth: full pool grids** for all 5 USA divisions (all teams' matches), same as the
   Netherlands page. Standings compute live from scores, no change to that model.
3. **Architecture: clone, don't refactor.** The Netherlands tournament goes live July 22.
   `july.html`, `js/app.js`, `js/data.js` are frozen — the Brasschaat page gets its own
   `js/data-aug.js` + `js/app-aug.js`. Consolidate into a shared config after the season.
4. **Naming:** the event is officially "2026 WMH World Cup Brasschaat" (not Brussels).
   Cities: Brasschaat + Antwerp, Belgium.
5. **No roster links on Brasschaat team cards.** USA team cards on `brasschaat.html` (and
   the Belgium division badges on the hub card) are plain, non-clickable — no links to
   `team.html` roster pages and no "roster coming soon" copy, since other teams may not
   want public roster pages. Only the W35 July flow keeps its roster links.

## Data source (blocking prerequisite)

The session environment's network policy must allowlist:

- `worldmastershockey.org` (schedule announcement + event pages)
- `masters.altiusrt.com` (live schedules/results; Brasschaat M60 is competition **499**,
  other division IDs are adjacent and need discovery)
- `dragonsmasters.com` (host club info, venue details)

Once reachable: scrape the published schedule for the 5 USA divisions from
https://worldmastershockey.org/2026/07/2026-wcschedules-bredabrasschaat-live/ and/or the
AltiusRT competition pages, and record each division's AltiusRT competition ID.
Fallback if access can't be opened: user pastes/uploads the schedule and we transcribe.

## Build tasks

Tasks T1–T6 are independent once T0 (data acquisition) is done, and are sized for parallel
subagents. T7 runs after all of them.

### T0 — Acquire schedule data (main session, needs network)
Scrape the full match schedule for W55, W60, W65, M55, M60: pools, all pool matches
(date, time, home, away, pitch/venue), knockout structure, and any new country codes not in
`TEAMS`. Save a raw intermediate (JSON/markdown) for T1. Capture AltiusRT competition IDs
for all 5 divisions for T5.

### T1 — `js/data-aug.js` (new file)
Mirror the `js/data.js` schema exactly, with `_AUG`-suffixed or separately-scoped globals so
nothing collides if both scripts ever load on one page:
- `TEAMS_AUG` — country code → `{name, flag}` (reuse codes/flags from data.js; add any new).
- `DIVISIONS_AUG` — `W55/W60/W65/M55/M60` → `{label, short}` (labels match roster.js stubs:
  "Women O55" / "WO55" etc.).
- `DIVISION_POOLS_AUG` — pool letters per division as published.
- `POOL_AUG` — positional rows `[date, time, div, home, away, pitch, hs?, as?]`.
  Pitch strings: `"DRA Pitch N"` (KHC Dragons) and `"OLY Pitch N"` (HC Olympia) so the ICS
  venue mapping in app-aug.js can key on the prefix, like ROT/VIC do today.
- `KNOCKOUT_AUG` — object rows `{d, t, div, label, p, ranks, teams?}` (copy the `R(a,b)`
  helper pattern).
- `EVENTS_AUG` — opening ceremony (Dragons, Aug 6 19:00), USA send-off, etc.
- `USA_TEAMS_AUG` — the 5 USA teams `{code, name, venue, inApp}`.
- `VIDEO_AUG`, `LINKS_AUG` as empty/minimal placeholders.
Do NOT touch `js/data.js` (the social generator re-evals it and the July page is live).

### T2 — `brasschaat.html` (new page)
Clone `july.html` and adapt:
- `<head>`: title/description/canonical/OG tags for Brasschaat (og:image can reuse
  `assets/hero.jpg` until a Belgium hero exists).
- Hero: kicker/dates "August 6–16 · Brasschaat & Antwerp 🇧🇪", countdown container, CTAs.
- Schedule section: division chips for the 5 codes + ALL; same filters (team select,
  knockout toggle, ICS button); empty `#scheduleList`.
- Standings section: chips for the 5 codes.
- USA Teams section: grid fed from `USA_TEAMS_AUG` — cards are static (name/venue only):
  no `team.html` links, no "roster coming soon" copy (decision 5).
- Venues: two static venue cards — KHC Dragons (Brasschaat) and HC Olympia (Antwerp) with
  addresses + Google Maps links (addresses from dragonsmasters.com during T0). Include the
  planned travel-from-NL note (UPDATE-PLAN travel item).
- Watch/Links: WMH watch page + AltiusRT competition links from T0.
- Scripts: `nav.js`, `roster.js`, `data-aug.js`, `results-aug.js`, `app-aug.js`.
- Footer links back to `./` and `july.html`.

### T3 — `js/app-aug.js` (new file)
Clone `js/app.js`, rename data globals to the `_AUG` ones, and re-parameterize every
Netherlands constant:
- `ALL_DIVS = ["W55","W60","W65","M55","M60"]`.
- `DATE_LABELS` for Aug 6–16.
- Countdown target: opening ceremony `Date.UTC(2026, 7, 6, 17, 0)` (19:00 CEST).
- TZ toggle: 🇧🇪 BE ↔ 🇺🇸 ET (Belgium is CEST, same UTC+2 as NL — offset math unchanged).
- ICS location mapping: `DRA` → KHC Dragons address, `OLY` → HC Olympia address.
- Ticker text: "BRASSCHAAT + ANTWERP".
- Keep `?div=CODE` query-param pre-filter behavior.

### T4 — Hub + cross-links
- `index.html`: convert the Belgium "coming soon" tile (lines ~95–108) into an active
  `hc-card` linking `brasschaat.html`. Division badges link to the schedule filter only
  (`brasschaat.html?div=W55` …) — no `team.html` roster links (decision 5). Leave the
  O65/Breda tile as coming-soon.
- `july.html:143` "Belgium and O65 tournaments" line: link Belgium to `brasschaat.html`.
- `team.html` / `js/roster.js`: leave untouched — Belgium divisions get no roster pages
  for now (decision 5), and direct `team.html?div=W55` visits keep today's stub behavior.

### T5 — Results pipeline
- `scripts/scrape-results.mjs`: add the 5 Brasschaat divisions with their AltiusRT
  competition IDs from T0, writing scores to a new `js/results-aug.js`
  (`const RESULTS_AUG = {...}`) so the July `results.js` flow is untouched. Keep the
  preserve-on-failure behavior.
- `js/results-aug.js`: commit the empty placeholder (`const RESULTS_AUG = {};`).
- `netlify.toml`: add the 5-minute must-revalidate cache rule for `/js/results-aug.js`.
- `.github/workflows/update-results.yml`: cron already covers Aug 6–16 — verify the commit
  step picks up `js/results-aug.js`.
- `scripts/generate-social.mjs` is W35/Schiedam-specific and only reads `data.js` — leave it
  alone; confirm it still runs (it must not break when results-aug.js appears).

### T6 — Rosters (deferred indefinitely)
Per decision 5, Belgium teams are not getting roster pages at launch. Revisit only if a
team asks for one; `js/roster.js` stubs stay as-is.

### T7 — QA + launch (after T1–T5)
- Serve locally, screenshot `brasschaat.html` desktop + mobile (Playwright/Chromium is
  preinstalled): schedule renders all 5 divisions, chips filter, team select works,
  standings compute (all zeros pre-tournament), tz toggle shifts times −6h, ICS downloads
  with correct venues, countdown counts to Aug 6.
- Regression-check `july.html` and `index.html` (no shared-file breakage beyond index nav).
- Cross-browser sanity via the same shared `css/styles.css` (no new CSS files; new division
  chip accent colors optional).
- Code review pass, then merge/deploy via Netlify auto-deploy.

## Subagent execution notes

Builder agents run as `sonnet` (per direction: not Fable). Suggested fan-out after T0:
T1, T2, T3 in parallel (T2/T3 agents get the T0 data summary + data.js/app.js as reference);
T4 + T5 in parallel after; T7 as a final verify agent. Each agent commits to
`claude/brussels-tournament-page-vqrzzn`.
