# Adding photos to the site

Every tournament page has a rotating photo strip (`#photoStrip`). The strip shows
3 photos and crossfades through everything in its pool, so you can keep adding
photos without changing any layout. `js/photo-strip.js` handles the rotation on
all pages — you never need to touch it.

## The rules (what the script enforces)

- **Gallery photos:** resized to fit 1100×1100, progressive JPEG ~quality 76.
  Lands at roughly 100–200 KB — safe for page speed even with many photos,
  because everything below the first three is loaded lazily.
- **Hero (header) photos:** center-cropped to 16:9, saved at 1920px wide plus a
  1000px `-mobile` variant. Both preloaded from the page `<head>`.
- Photos live in `assets/july/`, `assets/belgium/` (brasschaat), `assets/breda/`.
- Every `<img>` needs a real `alt` description (accessibility + SEO).

## Add a photo to a page's rotation

One-time setup on a new machine: `npm install`

```bash
node scripts/add-photos.mjs july "IMG_1234.jpeg" opening-ceremony
#                           ^page ^your original  ^short name for the file
```

The script prints a ready-made `<figure>` line. Paste it inside the
`<div class="photo-strip" id="photoStrip">` block in that page's HTML
(july.html / brasschaat.html / breda.html), write a short `alt` description,
done. Order matters only for the first three — those are the ones visible
before rotation starts.

If faces sit high or low in the frame, add `style="object-position:center 30%"`
(30% = show the upper part; 70% = lower part) to the `<img>` so the strip's
crop keeps them in view.

## Replace a page's header photo

Wide landscape shots work best — the crop is 16:9 and the "GO USA." text sits
over the lower-left, so a photo with sky or crowd up top reads best.

```bash
node scripts/add-photos.mjs brasschaat --hero "IMG_5678.jpeg"
```

This overwrites the existing hero files in place, so if the page already has a
photo hero (july, brasschaat) there's nothing else to do. The script prints
what to check otherwise.
