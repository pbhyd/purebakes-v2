import { readdir, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { derivativePattern, galleryDir, readGallery, sourceDir } from "./gallery-lib.mjs";
const { records } = await readGallery(); const known = new Set(records.map((r) => basename(r.image))); const files = (await readdir(sourceDir)).filter((file) => /\.webp$/i.test(file) && !derivativePattern.test(file) && !known.has(file)).sort();
if (!files.length) { console.log("No unregistered canonical cake images found."); process.exit(0); }
const highest = Math.max(0, ...records.map((r) => Number(r.id.slice(5)) || 0)); const month = process.env.GALLERY_MONTH || new Date().toISOString().slice(0, 7); const output = resolve(galleryDir, `${month}.starter.json`);
const starters = files.map((file, index) => ({ id: `cake-${String(highest + index + 1).padStart(4, "0")}`, image: `/assets/images/cakes/${file}`, caption: "REVIEW REQUIRED", alt: "REVIEW REQUIRED", themes: [], occasions: [], flavours: [], styles: [], colours: [], keywords: [], featured: false, dateAdded: null }));
await writeFile(output, `${JSON.stringify(starters, null, 2)}\n`, { flag: "wx" }); console.log(`Created ${output} with ${starters.length} starter records. Review and rename to ${month}.json when complete.`);
