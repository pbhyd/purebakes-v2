import sharp from "sharp";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { readGallery, root } from "./gallery-lib.mjs";
const { records } = await readGallery(); let derivatives = 0; let legacyCopies = 0;
for (const record of records) {
  const source = resolve(root, `src${record.image}`); const outputOriginal = resolve(root, `_site${record.image}`); await mkdir(dirname(outputOriginal), { recursive: true }); await copyFile(source, outputOriginal);
  const metadata = await sharp(source).metadata();
  for (const width of [360, 720]) if (metadata.width > width) { const target = outputOriginal.replace(/\.webp$/i, `-${width}.webp`); await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(target); derivatives++; }
  if (record.legacyImageUrl) { const path = new URL(record.legacyImageUrl).pathname; const target = resolve(root, `_site${path}`); await mkdir(dirname(target), { recursive: true }); await copyFile(source, target); legacyCopies++; }
}
console.log(`Generated ${derivatives} responsive derivatives and ${legacyCopies} legacy URL compatibility copies; no source image was upscaled.`);
