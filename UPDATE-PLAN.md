# USA Masters Fan Hub — Update Plan v2 (2026-07-12, post-review)

**Status: EXECUTING — Phases 0–2 shipped 2026-07-13.** Live: hub at root (tournament chooser; Brasschaat 🇧🇪 + Breda as non-clickable "coming soon" tiles per Christine), July session at `july.html` (old deep links auto-redirect; `?div=X` team deep links), OG/Twitter cards on both pages, pipeline hardened (Aug 6–16 cron, total-failure alerting, per-division score preservation, `window.RESULTS_UPDATED`), `netlify.toml` cache headers. Architecture note: no separate `rotterdam.html` was needed — the existing page already covered both Window-1 venues, so it became `july.html` unchanged. Fonts load from Google Fonts (local TTFs feed only the CI social renderer); WOFF2 files staged for optional future self-hosting. **Still open:** photos (B1–B4, gated on Christine's folder), Brasschaat/Breda **schedule data** (C3 window-2 rows — gated on published schedules, due any day: WMH promised ~Jul 16), AltiusRT comp ids (D1 — placeholders extended to all 15 divisions 2026-07-17, ids still unpublished), staleness stamp UI on the schedule page (D4 site-side), "USA today" roll-up. **Shipped 2026-07-17:** `brasschaat.html` + `breda.html` (venue/travel + Belgium travel guide + "schedule coming" pattern, own OG cards `assets/og-brasschaat.png`/`og-breda.png`), hub Belgium/O65 tiles now clickable.

v1 was reviewed adversarially on 2026-07-12; this version incorporates the findings. Changes from v1 are marked **[v2]**.

---

## Goal

Turn the current single-tournament fan hub (Schiedam O35/O40) into the one-stop site for **all of USA at the 2026 Masters World Cup**, make links share well (USAFH will link to it), refresh photos with an optimized pipeline, and harden the site + automation for a traffic spike — without adding a build step or splitting into multiple sites.

## Hard calendar constraints **[v2 — this drives all sequencing]**

| Date | Event |
|---|---|
| **Now → ~Jul 21** | USAFH begins linking; peak prep window |
| **Jul 22 – Aug 1** | Window 1 LIVE: Schiedam (M/W O35, O40) + Rotterdam (M O45/O50, W O35-IMC/O45/O50) |
| **Aug 2 – 5** | Dead zone between windows — **the safe slot for structural changes** |
| **Aug 6 – 16** | Window 2 LIVE: Brasschaat 🇧🇪 (M O55/O60, W O55/O60/O65) + Breda (M O65) |

Rule: **no structural changes to live pages during a window.** Additive changes (new pages, data, social) are fine anytime.

## Confirmed context

- **Repo:** `~/Documents/Claude/claude code/usa-masters-wc2026/` — own git repo (`github.com/cmjwatts/usa-masters-wc2026`), Netlify deploy → **usamastersfh.com**. Not GFHA, not personal.
- **Stack:** plain HTML/CSS/JS, no build step (npm only for CI social renderer). This is a feature — keep it.
- **USAFH:** links to the site. Stays Christine's, stays "unofficial fan hub" (disclaimer stays as-is).
- One championship, 4 venues, 2 windows, 15 USA teams, one results system (AltiusRT). Source: usafieldhockey.com/events/2026/july/22/wmh-world-cup.

## Verified current state (code-level facts)

- `index.html` 260 lines: static HTML sections (hero, venues, kids) + JS-rendered schedule/standings (`app.js`, 387 lines). Has title/description/disclaimer; **no OG/Twitter tags**.
- Photos: 7 hardcoded slots. hero.jpg 1600×1066 @228KB; team-photo 336KB; gallery ~100KB ea. Total page ~1.2MB incl. two **TTF fonts** (not WOFF2).
- `js/data.js` (429 lines, 165 match rows): divisions W35/W40/M35/M40 full + W45/W50/M45/M50/W35I `partial: true` (USA-only). **No O55/O60/O65/M65.** No tournament/venue dimension on rows.
- `scripts/scrape-results.mjs`: `COMPETITIONS` = division → AltiusRT id, **all null** (ids unpublished). **Silent-failure bug: exits 0 on ALL errors** (lines ~85–92) — a total scrape failure still shows a green workflow.
- `scripts/generate-social.mjs` **consumes `data.js`** — any data-schema change must update it in the same commit. Test hook: `SOCIAL_NOW="2026-07-23T20:00" npm run social`.
- `.github/workflows/update-results.yml`: crons end **Aug 2** — the Aug 6–16 window is uncovered. No failure alerting.
- **No `netlify.toml` in repo** → default headers, no cache-control tuning. Netlify free tier = 100GB bandwidth/mo; at ~1.2MB/page ≈ 80K visits/mo ceiling.

## Architecture decision **[v2 — supersedes v1's `?t=` router]**

**Static page per tournament, not a JS router.** v1's `?t=<tournament>` single-page approach is rejected because (a) the tournament-specific content is static HTML — templating it means converting the page to JS-rendered DOM (bigger refactor, worse first paint, breaks hero preload), and (b) one URL = one OG card — per-tournament shares would all unfurl identically, and crawlers don't run JS.

Instead:
- `index.html` — **stays the Schiedam experience until Aug 2** (don't disturb the live page). 
- `rotterdam.html`, `brasschaat.html`, `breda.html` — copies of the page shell sharing the same `css/`/`js/`, each with a one-line config (`window.TOURNAMENT = "brasschaat"`) scoping schedule/standings/filters, its **own OG tags, hero image, venue guide, and dates**.
- `hub.html` — small landing page: choose by venue/window OR by team/age group; plus during events a "USA playing today, anywhere" roll-up.
- **Flip timing [DECIDED 2026-07-13 — Christine chose early flip, overriding the Aug 2–5 recommendation]:** hub becomes root **before Jul 22** (target ~Jul 20), sequenced flip-last: all tournament pages built + verified first, then the root swap with Schiedam moving to `schiedam.html` + redirect. Mitigations for the on-record risk (extra tap for Window-1 majority + compressed timeline): hub kept ultra-light, Schiedam/Rotterdam as the two big first tiles, redirect preserves every existing deep link.
- Cross-nav strip on every tournament page.

Four pages ≈ 4 copies of a 260-line shell. Acceptable duplication for a one-time event; zero build step, zero router, per-page OG for free.

---

## Workstreams

### A. Share-readiness (USAFH is about to link)
- **A1. OG + Twitter tags on `index.html`** (`og:title/description/image/url`, `twitter:card=summary_large_image`). v1 image: hero.jpg (note: 3:2 will crop to OG's 1.91:1 — acceptable; purpose-made 1200×630 card in Phase 1). Absolute URLs required.
- **A2.** Disclaimer unchanged.
- **A3.** Schedule V2 swap in `data.js` when published.
- **A4 [v2].** Per-page OG tags on every new tournament page as built (each shares as its own card).
- **Acceptance:** link validates in Facebook Sharing Debugger + a WhatsApp/iMessage paste test.

### B. Photo pipeline **[v2 — rebuilt: Claude curates, Christine approves]**
- **B1. Intake:** Christine provides the full picture list/folder.
- **B2. Review & selection (Claude):** score against per-slot needs — hero: ≥1600px landscape, clean area for text overlay, high energy; gallery ×3: action variety (pass/shot/celebration); team photo: everyone visible; OG card: reads at thumbnail size, faces > wide shots. Output: a contact sheet of picks per slot with rationale → **one-word approve from Christine**.
- **B3. Optimize (quality preserved, load-optimized):** resize to slot dimensions (+@2x where used), JPEG ~q80, **strip all EXIF/GPS metadata** (personal photos on a public site). Budgets: hero ≤250KB, gallery ≤120KB ea, team ≤250KB, OG card ≤300KB. Keep originals out of the repo.
- **B4. Rotating hero:** 3–5 image array + CSS crossfade (~20 lines). First image keeps the existing `<link rel=preload>`; the rest lazy-load after page load so rotation never slows first paint. Hero is a CSS background — rotation via JS class-swap, not `srcset`.
- **Acceptance:** Lighthouse mobile perf ≥90 with rotation enabled; no layout shift; EXIF verified stripped (`sips`/`exiftool` check).

### C. Hub-and-spoke build (per the architecture decision above)
- **C1. Config split:** `js/tournaments.js` — one entry per venue: name, city, country, venue(s) + addresses, window dates, divisions, AltiusRT comp ids, hero copy/photo. Add a tournament key to the data model (divisions map cleanly to venues except **W35-IMC → Rotterdam**, special-cased).
- **C2. Tournament pages:** `rotterdam.html`, `brasschaat.html`, `breda.html` from the shared shell. Brasschaat includes a **Belgium travel/venue note** (KHC Dragons Brasschaat + HC Olympia is in Antwerp; travel-from-NL basics).
- **C3. Schedule data [DECIDED 2026-07-13]: USA-only (`partial`) rows for all non-Schiedam tournaments** (existing Rotterdam pattern). Upgrade a tournament to a full grid only if its official schedule proves scrapeable. New divisions to add: M45/M50 (verify), M55, M60, W55, W60, W65, M65 — plus any new opponent codes in `TEAMS`.
- **C4. Hub page** (`hub.html`, becomes root Aug 2–5): both entry modes (by venue, by team/age group) + "USA today, anywhere" roll-up during live windows.
- **C5. Pre-flip cross-links [v2]:** banner on index pointing O45+ fans to their pages — live before Jul 22, zero risk to the current page.
- **Acceptance:** every page loads with correct scoped schedule; time toggle works; cross-nav on all pages; `npm run social` still green (see D3 coupling).

### D. Pipeline hardening + extension
- **D1. Extend `COMPETITIONS`** to all tournaments' divisions (ids land as published; `null` placeholders are the existing safe pattern).
- **D2. Cron coverage for Aug 6–16** (scrape `*/20` during games) + countdown cron for the window-2 run-up (Aug 2–5).
- **D3. Tournament-tag social output** — `generate-social.mjs` slides/captions tagged by tournament; `/social.html` groups by tournament. **Must ship in the same commit as any `data.js` schema change** (verified consumer coupling).
- **D4. Kill the silent failure [v2 — new, important]:** keep "partial failure doesn't wipe results," but **fail the workflow when all configured divisions fail** (GitHub emails on job failure → Christine knows within 20 min, not never). Add a "results updated Xm ago" staleness stamp on the site so stale scores are visible to her even if she misses the email.
- **Acceptance:** simulated total-failure run turns the workflow red; `SOCIAL_NOW` test produces correctly-tagged posts.

### E. Performance & traffic **[v2 — new workstream]**
Static hosting has **no server-scaling failure mode** — traffic volume cannot crash the site. The real constraints:
- **E1. Bandwidth ceiling [DECIDED 2026-07-13]: optimize first, wait and see.** E2–E4 cut page weight (~doubling the visit ceiling); Christine checks the Netlify dashboard mid-tournament and upgrades (~$19/mo Pro) only if usage climbs. Failure mode is an overage email, not an outage.
- **E2. Fonts → WOFF2** (Anton, Archivo Black): ~halves font bytes.
- **E3. `netlify.toml` with cache headers:** long `max-age` + `immutable` for `/assets/` (fonts/images change rarely), default revalidation for HTML/`results.js`. Cuts repeat-visitor bandwidth hard at a 20-min deploy cadence.
- **E4. Weight budget:** ≤1MB first load after photo optimization (B3) + E2.
- **E5. Verification gate before USAFH promotes:** Lighthouse mobile ≥90, share cards validated, spot-check on a real phone over cellular.

---

## Phases **[v2 — re-cut around the calendar]**

**[v3 — re-cut 2026-07-13 for the decided early flip: the structural build moves ahead of Jul 22.]**

**Phase 0 — immediately (target: Jul 14).** No inputs needed, no risk to live page:
A1 (OG tags) · D2 (cron Aug 6–16) · D4 (failure alerting + staleness stamp) · E2 (WOFF2) · E3 (netlify.toml).

**Phase 1 — the build (target: Jul 15–19):**
C1 (config split) · C2 (Rotterdam/Brasschaat/Breda pages) · C4 (hub at `hub.html`) · A4 (per-page OG) · C3 (USA-only rows, all divisions) · D3 (tournament-tagged social, same commit as schema change) · verify/complete Rotterdam USA rows · B1–B4 (photos — **gated on Christine's folder**, runs in parallel) · purpose-made OG card · E4/E5 (perf pass + verification gate).

**Phase 2 — the flip (target: ~Jul 20, only after Phase 1 verification passes):**
Hub → root · Schiedam → `schiedam.html` + redirect · root OG card becomes the hub card · full share-card + redirect + Lighthouse re-check. Buffer day Jul 21.

**Phase 3 — window 1 operations (Jul 22–Aug 1), additive only:**
Monitor pipeline (D4 alerts) · D1 (comp ids as published) · A3 (Schedule V2 swap) · Belgium travel guide final · "USA today" roll-up live.

**Phase 4 — Aug 2–5 gap:** window-2 countdown social · Brasschaat/Breda data+ids finalized · fixes from window-1 learnings.

**Phase 5 — window 2 (Aug 6–16), operations:**
Scores/social flowing for Brasschaat + Breda · post-event: archive/thank-you state.

## Decisions — DECIDED 2026-07-13
1. **C3 scope:** USA-only rows for non-Schiedam tournaments. ✔
2. **Hub flip:** early — before Jul 22 (~Jul 20), flip-last sequencing. ✔ *(Overrides the Aug 2–5 recommendation; residual risk acknowledged on the record: extra tap for Window-1 majority + compressed build timeline.)*
3. **Netlify:** optimize first, wait and see; dashboard check mid-tournament. ✔
4. **Photos:** Christine delivers a folder on this Mac. ✔ *(path still needed)*

## Remaining inputs (non-blocking except #1 for photo work)
1. **Photo folder path** (gates B1–B4).
2. AltiusRT comp ids + official window-2 schedules **when published** (safe `null` placeholders until then).
3. Netlify dashboard usage check (mid-tournament).

## Risks
- **AltiusRT markup changes mid-tournament** → scraper breaks; D4 converts this from silent to alerted within 20 min.
- **Window-2 schedules/ids late** → pages ship with venue/travel info + "schedule coming"; data slots in when available (Rotterdam pattern).
- **OG caching** — platforms cache link previews; image changes need a debugger re-scrape.
- **Traffic beyond free tier** → E1 decision; failure mode is a Netlify overage prompt, not an outage.
