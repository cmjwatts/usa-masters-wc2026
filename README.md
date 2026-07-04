# USA Masters × 2026 World Cup — Fan Hub 🏑🇺🇸

A one-page fan hub for following USA Masters Field Hockey at the 2026 WMH World Cup
(Schiedam, Netherlands · July 22 – August 1, 2026).

**Features**
- Full O35/O40 match schedule (Official Schedule V1, 1-Jul-26) with team + division filters
- USA WO35 default view, one-tap quick views for every USA Schiedam team
- NL ⇄ US Eastern time toggle
- Venue guides (HC Schiedam, HC Rotterdam, HC Alecto), kids' program info, and every official link

**Updating the schedule when V2 drops**
All match data lives in [`js/data.js`](js/data.js) — edit the `POOL` / `KNOCKOUT` arrays
(and bump the version note at the top). Nothing else needs to change.

**Automated pipeline** (`.github/workflows/update-results.yml`)
1. `scripts/scrape-results.mjs` pulls final scores from masters.altiusrt.com every 20 min
   during the tournament (fill in `COMPETITIONS` ids once Schiedam publishes) → `js/results.js`.
2. `scripts/generate-social.mjs` turns whatever is newsworthy (gameday previews, USA WO35
   results, standings, daily Team-USA recaps, countdowns) into ready-to-post Instagram
   carousels: branded 1080×1350 PNGs in `social/img/` + captions in `social/posts.json`.
3. The commit triggers a Netlify deploy, so suggestions land on
   [`/social.html`](social.html) — open it on your phone, tap **Share slides** → Instagram,
   paste the auto-copied caption, done.

Posts are additive (never regenerated/deleted automatically); to redo everything delete
`social/posts.json` + `social/img/` and run `npm run social`. Brand rules live in
[`BRAND.md`](BRAND.md). Test hooks: `SOCIAL_NOW="2026-07-23T20:00"`, `SOCIAL_RESULTS=<fake file>`.

**Stack:** plain HTML/CSS/JS, no build step (npm is only used by the social slide renderer
in CI). Deploys anywhere static (Netlify, GitHub Pages).

_Unofficial fan site. Always confirm times against [World Masters Hockey](https://worldmastershockey.org/)._
