import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import config from "../src/_data/galleryDiscovery.js";
import { filterGallery, findKnown, normalizeSearch } from "../src/assets/js/gallery-discovery-core.js";

const records = JSON.parse(await readFile(resolve("src/_data/gallery/existing-gallery.json"), "utf8")); const errors = [];
const expectedOccasions = ["all", "wedding", "anniversary", "birthday", "first-birthday-boy", "first-birthday-girl", "bridal-shower", "baby-shower", "half-birthday", "bon-voyage", "corporate", "smash-cake", "baby-announcement"];
const expectedThemes = ["butterfly", "floral", "jungle", "princess", "superhero", "spider-man", "unicorn", "animal", "car"];
if (records.length !== 472) errors.push(`Expected 472 records, found ${records.length}`);
if (config.occasions.map((item) => item.key).join() !== expectedOccasions.join()) errors.push("Curated occasion order changed");
if (config.themes.map((item) => item.key).join() !== expectedThemes.join()) errors.push("Curated theme order changed");
const count = (key) => filterGallery(records, { query: key, item: findKnown(config, key) }).length;
const boy = count("first-birthday-boy"), girl = count("first-birthday-girl"), first = records.filter((item) => item.occasions.includes("first-birthday")).length;
if (boy !== 32 || girl !== 27 || first - boy - girl !== 2) errors.push(`Reliable first-birthday split changed: ${boy} boy, ${girl} girl, ${first - boy - girl} unclassified`);
for (const key of expectedThemes) if (!count(key)) errors.push(`Curated theme has no records: ${key}`);
if (filterGallery(records, { query: "term-that-cannot-match-purebakes-987654", item: null }).length !== 0) errors.push("Unknown search zero-result behavior failed");
if (normalizeSearch(" First Birthday – Boy ") !== "first-birthday-boy") errors.push("URL normalization failed");
if (findKnown(config, "unicorn")?.key !== "unicorn") errors.push("Known URL state restoration failed");
if (filterGallery(records, { query: "", item: null }).length !== 472) errors.push("All Cakes reset failed");
const source = await readFile(resolve("src/assets/js/gallery.js"), "utf8");
if ((source.match(/function closeGalleryDetail\s*\(/g) || []).length !== 1) errors.push("Lightbox does not have one authoritative close function");
for (const mechanism of ['data-cake-dialog-close', '"cancel"', 'event.target === dialog']) if (!source.includes(mechanism)) errors.push(`Lightbox close mechanism missing: ${mechanism}`);
const template = await readFile(resolve("src/gallery/index.njk"), "utf8");
for (const token of ['aria-expanded="false"', 'aria-controls="gallery-explore"', 'aria-pressed=', 'gallery-discovery-data']) if (!template.includes(token)) errors.push(`Gallery accessibility/state token missing: ${token}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Gallery UX validation passed: 472 All Cakes; ${boy} boy, ${girl} girl, ${first - boy - girl} unclassified first birthdays; Unicorn ${count("unicorn")}; Butterfly ${count("butterfly")}; single-state, reset, URL and lightbox structure checks.`);
