import { access, readdir } from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";
import { derivativePattern, readGallery, readTaxonomies, root, sourceDir } from "./gallery-lib.mjs";
const { files, records } = await readGallery(); const taxonomy = await readTaxonomies(); const errors = []; const ids = new Set(); const images = new Set();
for (const record of records) {
  if (!/^cake-\d{4,}$/.test(record.id)) errors.push(`${record.id}: invalid ID`); else if (ids.has(record.id)) errors.push(`${record.id}: duplicate ID`); ids.add(record.id);
  if (!record.image?.startsWith("/assets/images/cakes/") || dirname(record.image) !== "/assets/images/cakes") errors.push(`${record.id}: image is outside flat canonical folder`);
  if (derivativePattern.test(record.image)) errors.push(`${record.id}: generated derivative used as source`);
  if (images.has(record.image)) errors.push(`${record.id}: duplicate source image`); images.add(record.image);
  if (!record.caption?.trim()) errors.push(`${record.id}: missing caption`); if (!record.alt?.trim()) errors.push(`${record.id}: missing alt`);
  try { await access(resolve(root, `src${record.image}`)); } catch { errors.push(`${record.id}: missing file ${record.image}`); }
  for (const field of ["themes", "occasions", "flavours", "styles"]) for (const key of record[field] || []) if (!taxonomy[field][key]) errors.push(`${record.id}: invalid ${field} key ${key}`);
}
for (const file of await readdir(sourceDir, { withFileTypes: true })) if (file.isDirectory()) errors.push(`Prohibited cake source subdirectory: ${relative(sourceDir, resolve(sourceDir, file.name))}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated ${records.length} gallery records across ${files.length} JSON file(s): unique IDs/images, source files, alt/captions, flat folder, derivatives and taxonomy.`);
