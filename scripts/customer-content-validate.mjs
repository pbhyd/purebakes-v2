import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import locations from "../src/_data/seo-pages/locations.json" with { type: "json" };

const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith(".html")) files.push(file);
  }
}
await walk("_site");
const banned = /canonical portfolio|portfolio inventory|tagged with this theme|preserved route|later content phase|useful search paths|approved themes|approved collection|SEO strategy|cross-domain strategy|under review|unapproved public|website does not infer|verified overview|internal taxonomy|page strategy/gi;
const violations = [];
let doubleEscaped = 0;
for (const file of files) {
  const html = await readFile(file, "utf8");
  doubleEscaped += (html.match(/&amp;amp;/g) || []).length;
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  for (const match of visible.matchAll(banned)) violations.push(`${file}: ${match[0]}`);
}
assert.equal(violations.length, 0, violations.join("\n"));
assert.equal(doubleEscaped, 0, "Generated HTML contains &amp;amp;");
assert.equal(locations.length, 41);
assert.equal(new Set(locations.map((item) => item.description)).size, 41, "Location descriptions must be unique");
assert.deepEqual(Object.fromEntries(Object.entries(Object.groupBy(locations, (item) => item.classification)).map(([key, values]) => [key, values.length])), { RETAIN: 30, IMPROVE: 6, PROTECT: 5 });
console.log(`Customer content validation passed: ${files.length} HTML files, 0 internal-language violations, 41 unique location descriptions and 0 double-escaped entities.`);
