import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { countValues, readGallery, root } from "./gallery-lib.mjs";
const { records } = await readGallery();
console.log(`Total cakes: ${records.length}`);
for (const field of ["themes", "occasions", "styles", "flavours"]) { console.log(`\n${field[0].toUpperCase()}${field.slice(1)}:`); for (const [key, count] of Object.entries(countValues(records, field))) console.log(`  ${key}: ${count}`); }
console.log(`\nMissing taxonomy:\n  No theme: ${records.filter((r) => !r.themes.length).length}\n  No occasion: ${records.filter((r) => !r.occasions.length).length}\n  No alt: ${records.filter((r) => !r.alt).length}\n  Unknown flavour: ${records.filter((r) => !r.flavours.length).length}`);
const report = { generatedAt: new Date().toISOString(), total: records.length, counts: { themes: countValues(records, "themes"), occasions: countValues(records, "occasions"), styles: countValues(records, "styles"), flavours: countValues(records, "flavours") }, gaps: { noTheme: records.filter((r) => !r.themes.length).length, noOccasion: records.filter((r) => !r.occasions.length).length, noStyle: records.filter((r) => !r.styles.length).length, noAlt: records.filter((r) => !r.alt).length, unknownFlavour: records.filter((r) => !r.flavours.length).length }, candidateThresholds: { strong: 20, useful: 8, emerging: 4 }, notes: ["Theme/style assignments are conservative caption and filename candidates for owner review.", "Occasions use reliable legacy category or explicit caption evidence.", "No flavour was inferred; all flavour classification requires owner input."] };
await writeFile(resolve(root, "seo/gallery-taxonomy-report.json"), `${JSON.stringify(report, null, 2)}\n`);
