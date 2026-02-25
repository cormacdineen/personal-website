/**
 * Optimize recommendation cover images.
 *
 * Converts any .jpg / .jpeg / .png files in public/assets/img/recommendations/
 * to 800px-wide WebP (quality 80), then deletes the originals.
 *
 * Usage: npm run rec:optimize
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/assets/img/recommendations");
const MAX_WIDTH = 800;
const QUALITY = 80;

const files = fs
  .readdirSync(DIR)
  .filter((f) => /\.(jpe?g|png)$/i.test(f));

if (files.length === 0) {
  console.log("No JPG/PNG files to convert.");
  process.exit(0);
}

for (const file of files) {
  const src = path.join(DIR, file);
  const out = path.join(DIR, file.replace(/\.(jpe?g|png)$/i, ".webp"));
  const before = fs.statSync(src).size;

  await sharp(src)
    .rotate()
    .resize(MAX_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);

  const after = fs.statSync(out).size;
  const pct = ((1 - after / before) * 100).toFixed(0);
  console.log(
    `${file} → ${path.basename(out)}  (${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB, ${pct}% smaller)`
  );

  fs.unlinkSync(src);
}

console.log(`\nConverted ${files.length} image(s). Remember to use .webp in recommendations.json.`);
