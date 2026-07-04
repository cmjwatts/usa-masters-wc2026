# USA Masters Field Hockey — WO35 Brand Guideline

The brand system for **@usamastersfh** (Instagram) and **usamastersfh.com**, extracted from
the site design. Bold, kinetic, proud — "LA28 energy" applied to Team USA masters field hockey.
Everything the social generator (`scripts/generate-social.mjs`) renders follows this document;
use it too when making anything by hand (Canva, stories, print).

---

## 1. Logo

- Primary mark: `assets/logo.png` (USA Masters shield). Keep clear space ≈ the height of the
  "USA" letters on all sides. Never stretch, recolor, or put on a busy photo area.
- On dark navy backgrounds use the logo as-is; on photos, anchor it to a corner over the
  darkest region or on a navy/cream chip.
- Text lockup fallback (as in site nav): **USA** (Anton, navy) `|` **MASTERS** (Anton, red)
  with FIELD HOCKEY in small Archivo caps under USA.

## 2. Color palette

| Role | Name | Hex | Usage |
|---|---|---|---|
| Primary | Navy | `#1b3668` | Headlines on light, chips, tables |
| Depth | Deep Navy | `#0e1f42` | Dark backgrounds (social slides, footer) |
| Action | USA Red | `#e31837` | Accents, USA highlights, CTAs, ticker |
| Energy | Coral | `#ff4671` | Gradient mid-stop only |
| Spark | Gold | `#ffb25a` | Kickers, countdown numbers, key stats on dark |
| Ground | Cream | `#f7f5f0` | Light backgrounds |
| Text | Ink | `#101a30` | Body text on light |

**Sunset gradient** (the signature move): `linear-gradient(100deg, #e31837 0%, #ff4671 55%, #ffb25a 115%)`.
Use for buttons, tags, one accent bar or word per layout — never for body text or full backgrounds.

Rules of thumb: dark slides = Deep Navy background + white type + Gold accents + one gradient
element. Light layouts = Cream background + Navy type + Red accents.

## 3. Typography

| Use | Font | Style |
|---|---|---|
| Display / headlines | **Anton** | ALL CAPS, tight line-height (0.86–0.95), can be huge |
| Labels / kickers | **Archivo Black** (or Archivo 900) | ALL CAPS, letter-spacing 0.12–0.22em, small |
| Body / captions | **Archivo** (400–700) | Sentence case |

Signature moves from the site:
- Giant Anton headline with a **red period**: `MASTERS.` / `GAME DAY.` / `FULL TIME.`
- Gold kicker line above headlines: `WORLD MASTERS HOCKEY WORLD CUP · SCHIEDAM`
- Headline gradient fill (white → gold) for hero-level moments only.
- Section headers carry a thick red left border.

Font files live in `assets/fonts/` (Anton-Regular, ArchivoBlack-Regular) — same ones the
slide renderer uses, and available in Canva as "Anton" and "Archivo Black".

## 4. Photography

Christine's action shots (repo `assets/`, full set in her library): real game moments, slight
dark navy wash (`rgba(14,31,66,~0.6)`) so white type stays readable, subjects framed low with
type above. Team smiles for celebration posts, action shots for gameday/hype.

## 5. Voice & tone

Proud, punchy, warm. We're elite athletes AND moms/professionals having the time of our lives.
Short sentences. Flag emoji 🇺🇸 earns its place; don't stack five emoji.

- **Hype (gameday):** confident, kinetic. "GAME DAY. USA takes on Australia at 4:20 PM in Schiedam. 🇺🇸🏑"
- **Win:** celebrate the team, name the opponent respectfully. "FULL TIME: USA 2–1 Australia. What a way to open the World Cup. 🇺🇸"
- **Loss:** heads high, forward-looking, never excuses. "Final: England 2, USA 1. Proud fight — back on the pitch Monday vs Ireland."
- **Draw:** "All square. USA 1–1 Ireland — the pool table stays tight."
- Numbers in scores: `USA 2–1 AUS` (en dash), USA always named first in graphics, actual
  home/away order fine in captions.
- Always time-stamp for the US audience too: NL time + ET.

### Hashtags & handles
Core set (every post): `#USAMastersFH #FieldHockey #WMHWorldCup2026`
Add when relevant: `#MastersWC2026 #TeamUSA #WO35 #Schiedam #FieldHockeyFamily`
Tag: `@masterswc2026.schiedam` on tournament-wide content. Site plug: `usamastersfh.com` in bio + captions.

## 6. Instagram slide system (1080×1350 portrait)

Rendered automatically by `scripts/generate-social.mjs`; recreate in Canva with the same recipe:

1. **Background:** Deep Navy `#0e1f42`, thin sunset-gradient bar top or angled band.
2. **Header:** logo top-left, gold Archivo Black kicker top-right or under logo.
3. **Headline:** Anton, white, huge (140–220px), red period. One idea per slide.
4. **Data block:** matchup / score / table in white + gold; USA row always highlighted red.
5. **Footer bar:** `usamastersfh.com · @usamastersfh` in small Archivo caps, 60% white.

Carousel shapes:
- **Gameday:** ① GAME DAY + matchup ② details (times NL/ET, pitch) ③ how to watch
- **Result:** ① FULL TIME + score ② pool standings ③ up next
- **Recap ("Around the grounds"):** ① all USA scores of the day ② standings snapshot

## 7. Don'ts

- No gradient body text; no red text on navy (fails contrast) — red is for blocks/bars/periods.
- Don't mix in colors outside the palette (no royal blue, no pure black).
- Don't bury the score — it's the headline, not a caption detail.
- Never post opponents' scores wrong: the generator only publishes scraped finals; if in doubt, hold.
