import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
const root = resolve(process.cwd()); const cakes = resolve(root, "src/assets/images/cakes"); const galleryFile = resolve(root, "src/_data/gallery/existing-gallery.json"); const featuredFile = resolve(root, "src/_data/featuredCakes.json");
const gallery = JSON.parse(await readFile(galleryFile, "utf8")); const featured = JSON.parse(await readFile(featuredFile, "utf8")); const digest = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const canonicalHashes = new Map(); for (const record of gallery) canonicalHashes.set(await digest(resolve(root, `src${record.image}`)), record);
const matches = [];
for (const item of featured) { const duplicate = canonicalHashes.get(await digest(resolve(root, `src${item.image}`))); if (!duplicate) throw new Error(`${item.image} is distinct; manual review required`); duplicate.featured = true; matches.push({ removed: item.image, canonical: duplicate.image, id: duplicate.id }); await rm(resolve(root, `src${item.image}`)); }
await writeFile(galleryFile, `${JSON.stringify(gallery, null, 2)}\n`); await rm(featuredFile);
const siteDir = resolve(root, "src/assets/images/site"); await mkdir(siteDir, { recursive: true }); const oldHero = resolve(cakes, "hero-custom-cake.webp"); const newHero = resolve(siteDir, "hero-custom-cake.webp"); try { await rename(oldHero, newHero); } catch (error) { if (error.code !== "ENOENT") throw error; }
await writeFile(resolve(root, "seo/phase-4-source-image-cleanup.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), featuredDuplicatesFound: matches.length, matches, heroComposite: { from: "/assets/images/cakes/hero-custom-cake.webp", to: "/assets/images/site/hero-custom-cake.webp", historicalGalleryUrlAffected: false }, canonicalCakeSourceCount: gallery.length }, null, 2)}\n`);
console.log(`Marked ${matches.length} canonical gallery records featured, removed ${matches.length} duplicate sources, and moved the hero composite to images/site.`);
