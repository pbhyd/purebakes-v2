import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const root = resolve(process.cwd());
export const galleryDir = resolve(root, "src/_data/gallery");
export const sourceDir = resolve(root, "src/assets/images/cakes");
export const derivativePattern = /-(?:360|540|720|900)\.webp$/i;

export async function readGallery() {
  const files = (await readdir(galleryDir)).filter((file) => file.endsWith(".json") && !file.endsWith(".starter.json")).sort();
  const records = [];
  for (const file of files) records.push(...JSON.parse(await readFile(resolve(galleryDir, file), "utf8")));
  return { files, records };
}

export async function readTaxonomies() {
  const result = {};
  for (const name of ["themes", "occasions", "flavours", "styles"]) result[name] = JSON.parse(await readFile(resolve(root, `src/_data/${name}.json`), "utf8"));
  return result;
}

export function countValues(records, field) {
  const counts = {};
  for (const record of records) for (const value of record[field] || []) counts[value] = (counts[value] || 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}
