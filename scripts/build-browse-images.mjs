#!/usr/bin/env node
/**
 * Build the Browse-section card thumbnails.
 *
 *   node scripts/build-browse-images.mjs <source-dir>
 *
 * The card image slot is 214px tall and ~256px wide (a 312px card at the
 * 1024px content width, less 28px padding each side), so these ship at 2x
 * for retina and nothing larger — the sources are 0.7–1.4MP and would be
 * ~200KB each unprocessed, for a slot a quarter of that size.
 *
 * `fit: cover` + `position: attention` crops to the slot by keeping the
 * highest-entropy region rather than the centre: two of the three sources
 * are portrait and a centre crop cuts heads off.
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const SRC = process.argv[2];
if (!SRC) { console.error("usage: node scripts/build-browse-images.mjs <source-dir>"); process.exit(1); }

const W = 512, H = 428;            // 2x the 256x214 slot
const OUT = "public/browse";
mkdirSync(OUT, { recursive: true });

const IMAGES = [
  { src: "3.jpg",  out: "musical-acts.webp",   what: "band on a Beirut rooftop at sunset" },
  { src: "2.webp", out: "entertainers.webp",   what: "children's entertainer with balloons" },
  { src: "4.webp", out: "event-services.webp", what: "bartender at a wedding reception" },
];

for (const { src, out, what } of IMAGES) {
  const info = await sharp(join(SRC, src))
    .resize(W, H, { fit: "cover", position: sharp.strategy.attention })
    .webp({ quality: 82 })
    .toFile(join(OUT, out));
  const before = (await sharp(join(SRC, src)).metadata());
  console.log(
    `${out.padEnd(22)} ${before.width}x${before.height} -> ${info.width}x${info.height}  ` +
    `${(info.size / 1024).toFixed(0)}KB   (${what})`,
  );
}
