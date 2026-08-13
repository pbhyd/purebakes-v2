import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { derivativePattern, galleryDir, root, sourceDir } from "./gallery-lib.mjs";

const sourceHtml = resolve(root, process.env.GALLERY_SOURCE_HTML || "../pb/gallery/index.html");
const sourceImages = resolve(root, process.env.GALLERY_SOURCE_IMAGES || "../pb/img");
const output = resolve(galleryDir, "existing-gallery.json");
const html = await readFile(sourceHtml, "utf8");
const decode = (text) => text.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
const cardPattern = /<div class='g-card'[^>]*data-title='([^']*)'[^>]*>.*?<img src='\.\.\/img\/([^']+)' alt='([^']*)'[^>]*>.*?<div class='g-name'>(.*?)<\/div><div class='g-cat'>(.*?)<\/div>/gs;
const occasionMap = { "Boy First Birthday": "first-birthday", "Girl First Birthday": "first-birthday", Anniversary: "anniversary", "Engagement · Wedding · Reception · Marriage": "engagement-wedding", "Baby Shower": "baby-shower", "Bridal Shower · Bride To Be": "bridal-shower", "Bon Voyage": "bon-voyage", Corporate: "corporate", "Baby Announcement": "baby-announcement", "Half Birthday · 6 months . Six months": "half-birthday", "Smash Cake": "smash-cake" };
const themeRules = [
  ["spider-man", /spider[ -]?man/i], ["butterfly", /butterfl(?:y|ies)/i], ["jungle", /jungle/i], ["safari", /safari/i], ["princess", /princess/i], ["unicorn", /unicorn/i], ["football", /football/i], ["cricket", /cricket/i], ["floral", /floral|\bflower|\brose/i], ["superhero", /superhero|avengers|marvel/i], ["boss-baby", /boss baby/i], ["mermaid", /mermaid/i], ["car", /\bcar\b|race car/i], ["travel", /travel|bon voyage/i], ["animal", /animal|elephant|giraffe|dinosaur/i]
];
const styleRules = [["minimal", /minimal(?:ist)?/i], ["vintage", /vintage/i], ["floral", /floral|\bflower|\brose/i], ["two-tier", /two[ -]tier/i], ["three-tier", /three[ -]tier/i], ["heart-shape", /heart[ -]shape/i], ["photo", /photo/i]];
const discovered = []; let match;
while ((match = cardPattern.exec(html))) {
  const legacyPath = decode(match[2]); const caption = decode(match[4]); const alt = decode(match[3]); const category = decode(match[5]);
  discovered.push({ legacyPath, caption, alt, category });
}
const grouped = new Map();
for (const item of discovered) { const list = grouped.get(item.legacyPath) || []; list.push(item); grouped.set(item.legacyPath, list); }
let existing = [];
try { existing = JSON.parse(await readFile(output, "utf8")); } catch {}
const prior = new Map((process.env.GALLERY_RECLASSIFY === "1" ? [] : existing).map((record) => [record.legacyImageUrl, record]));
const sorted = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
const migrated = [];
await mkdir(sourceDir, { recursive: true }); await mkdir(galleryDir, { recursive: true });
for (let index = 0; index < sorted.length; index++) {
  const [legacyPath, cards] = sorted[index]; const first = cards[0]; const file = basename(legacyPath); const legacyImageUrl = `https://purebakes.in/img/${legacyPath}`; const old = prior.get(legacyImageUrl);
  const evidence = `${file} ${first.caption} ${first.alt}`;
  const inferredThemes = themeRules.filter(([, rule]) => rule.test(evidence)).map(([key]) => key);
  const inferredStyles = styleRules.filter(([, rule]) => rule.test(evidence)).map(([key]) => key);
  const occasion = occasionMap[first.category] || (/first birthday/i.test(evidence) ? "first-birthday" : /engagement|wedding|reception|marriage/i.test(evidence) ? "engagement-wedding" : /bridal shower|bride to be|bride tribe|bridesmaid/i.test(evidence) ? "bridal-shower" : /half birthday|six months|6 months/i.test(evidence) ? "half-birthday" : /anniversary/i.test(evidence) ? "anniversary" : /birthday/i.test(evidence) ? "birthday" : []);
  const audience = old?.audience || (first.category === "Boy First Birthday" ? ["boy"] : first.category === "Girl First Birthday" ? ["girl"] : []);
  const occasionKeys = old?.occasions?.length ? old.occasions.filter((key) => !["first-birthday-boy", "first-birthday-girl"].includes(key)) : (occasion ? [occasion].flat() : []);
  if (occasionKeys.includes("first-birthday") && audience.includes("boy")) occasionKeys.push("first-birthday-boy");
  if (occasionKeys.includes("first-birthday") && audience.includes("girl")) occasionKeys.push("first-birthday-girl");
  const record = { id: old?.id || `cake-${String(index + 1).padStart(4, "0")}`, image: `/assets/images/cakes/${file}`, legacyImageUrl, caption: first.caption, alt: first.alt, themes: old?.themes?.length ? old.themes : inferredThemes, occasions: occasionKeys, flavours: old?.flavours || [], styles: old?.styles?.length ? old.styles : inferredStyles, audience, colours: old?.colours || [], keywords: old?.keywords || [], featured: old?.featured || false, dateAdded: old?.dateAdded || null };
  migrated.push(record); await copyFile(resolve(sourceImages, legacyPath), resolve(sourceDir, file));
}
for (const file of await (await import("node:fs/promises")).readdir(sourceDir)) if (derivativePattern.test(file)) await rm(resolve(sourceDir, file));
await writeFile(output, `${JSON.stringify(migrated, null, 2)}\n`);
const duplicateGroups = [...grouped.entries()].filter(([, cards]) => cards.length > 1).map(([image, cards]) => ({ image, occurrences: cards.length, captions: cards.map((card) => card.caption) }));
const taxonomyAssignments = { themes: migrated.filter((r) => r.themes.length).length, occasions: migrated.filter((r) => r.occasions.length).length, styles: migrated.filter((r) => r.styles.length).length, flavours: migrated.filter((r) => r.flavours.length).length };
const report = { generatedAt: new Date().toISOString(), sourceHtml: sourceHtml.replace(`${root}/`, ""), sourceRecordsDiscovered: discovered.length, uniqueCakeImages: grouped.size, duplicatesFound: discovered.length - grouped.size, duplicateGroups, recordsMigrated: migrated.length, captionsPreserved: migrated.length, altPreserved: migrated.filter((r) => r.alt).length, altRepaired: 0, missingAlt: migrated.filter((r) => !r.alt).length, missingImages: 0, taxonomyAssignments, taxonomyUncertainties: { noTheme: migrated.filter((r) => !r.themes.length).length, noOccasion: migrated.filter((r) => !r.occasions.length).length, noStyle: migrated.filter((r) => !r.styles.length).length, flavourOwnerReviewRequired: migrated.length }, legacyUrlsPreserved: migrated.length, canonicalUrlAdditions: migrated.length, imageUrlChanges: [], migrationExceptions: [] };
await mkdir(resolve(root, "seo"), { recursive: true }); await writeFile(resolve(root, "seo/gallery-migration-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Discovered ${discovered.length} cards; migrated ${migrated.length} unique cakes; ${discovered.length - migrated.length} duplicate references.`);
