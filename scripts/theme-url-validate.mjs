import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import themes from "../src/_data/seo-pages/themePages.json" with { type: "json" };

const mode = process.argv[2] === "production" ? "production" : "staging";
const output = "_site";
const publicBasePath = process.env.SITE_BASE_PATH || "";
const expected = ["/floral-cakes/", "/butterfly-cakes/", "/jungle-theme-cakes/", "/princess-cakes/", "/superhero-cakes/", "/spiderman-cakes/", "/unicorn-cakes/"];
const old = expected.map((url) => `/cakes/themes${url}`);
assert.deepEqual(themes.map((item) => item.url), expected, "Theme URL source of truth does not match the seven root-level routes");
await access(join(output, "cakes/themes/index.html"));

const htmlFiles = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith(".html")) htmlFiles.push(file);
  }
}
await walk(output);
const combined = (await Promise.all(htmlFiles.map((file) => readFile(file, "utf8")))).join("\n");
for (const [index, url] of expected.entries()) {
  const page = join(output, url, "index.html");
  await access(page);
  const html = await readFile(page, "utf8");
  assert(html.includes(`<link rel="canonical" href="https://purebakes.in${url}">`), `Incorrect canonical for ${url}`);
  assert(html.includes(`href="${publicBasePath}/cakes/themes/">Cake Themes</a>`), `Cake Themes breadcrumb missing for ${url}`);
  assert(!combined.includes(old[index]), `Old theme URL remains in generated HTML: ${old[index]}`);
  try { await access(join(output, old[index], "index.html")); assert.fail(`Old theme page was generated: ${old[index]}`); } catch (error) { if (error.code !== "ENOENT") throw error; }
}
assert.equal(new Set(themes.map((item) => item.url)).size, 7, "Duplicate theme URL");
assert.equal(new Set(themes.map((item) => `https://purebakes.in${item.url}`)).size, 7, "Duplicate theme canonical");
if (mode === "production") {
  const sitemap = await readFile(join(output, "sitemap.xml"), "utf8");
  for (const url of expected) assert(sitemap.includes(`<loc>https://purebakes.in${url}</loc>`), `Sitemap missing ${url}`);
  for (const url of old) assert(!sitemap.includes(url), `Sitemap contains old theme URL ${url}`);
  assert(sitemap.includes("<loc>https://purebakes.in/cakes/themes/</loc>"), "Theme hub missing from sitemap");
  assert(!combined.includes("/purebakes-v2/"), "Production contains staging base-path leakage");
}
assert(!combined.includes("&amp;amp;"), "Generated HTML contains a double-escaped entity");
console.log(`Theme URL validation passed for ${mode}: 7 root pages and canonicals, 0 old pages/references, hub and Cake Themes breadcrumbs preserved.`);
