// Resize & compress a photo for the site, following the site's image rules:
//   gallery: fits inside 1100x1100, quality 76, progressive mozjpeg (~100-200KB)
//   hero:    16:9 center crop at 1920w (q70) + 1000w mobile variant (q68)
//
// Usage:
//   node scripts/add-photos.mjs <page> <photo.jpg> [name]     one gallery photo
//   node scripts/add-photos.mjs <page> --hero <photo.jpg>     replace the page hero
//
// <page> is july, brasschaat, or breda. [name] becomes the output filename
// (e.g. "opening-ceremony" -> opening-ceremony.jpg); defaults to the input name.
// After it runs, paste the printed <figure> line inside the page's #photoStrip.
import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { basename } from 'path';

const PAGES = { july: 'assets/july', brasschaat: 'assets/belgium', breda: 'assets/breda' };
const [page, ...rest] = process.argv.slice(2);
const dir = PAGES[page];
if (!dir || rest.length === 0) {
  console.error('Usage: node scripts/add-photos.mjs <july|brasschaat|breda> [--hero] <photo.jpg> [name]');
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

if (rest[0] === '--hero') {
  const src = rest[1];
  const meta = await sharp(src).metadata();
  // center 16:9 crop
  let w = meta.width, h = Math.round(meta.width * 9 / 16), top = Math.round((meta.height - h) / 2);
  if (h > meta.height) { h = meta.height; w = Math.round(h * 16 / 9); top = 0; }
  const left = Math.round((meta.width - w) / 2);
  const crop = { left, top, width: w, height: h };
  const stem = page === 'brasschaat' ? 'hero-belgium' : `hero-${page}`;
  await sharp(src).extract(crop).resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 70, mozjpeg: true, progressive: true }).toFile(`${dir}/${stem}.jpg`);
  await sharp(src).extract(crop).resize({ width: 1000, withoutEnlargement: true })
    .jpeg({ quality: 68, mozjpeg: true, progressive: true }).toFile(`${dir}/${stem}-mobile.jpg`);
  console.log(`Wrote ${dir}/${stem}.jpg + ${stem}-mobile.jpg`);
  console.log(`If this page's hero doesn't already point at ${stem}.jpg, update the .hero-bg`);
  console.log('rules and the two <link rel="preload"> tags in the page <head>.');
} else {
  const src = rest[0];
  const name = (rest[1] || basename(src).replace(/\.[^.]+$/, ''))
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  await sharp(src)
    .resize({ width: 1100, height: 1100, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 76, mozjpeg: true, progressive: true })
    .toFile(`${dir}/${name}.jpg`);
  console.log(`Wrote ${dir}/${name}.jpg — now paste this inside #photoStrip in ${page}.html:`);
  console.log(`      <figure><img src="${dir}/${name}.jpg" alt="DESCRIBE THIS PHOTO" loading="lazy"></figure>`);
}
