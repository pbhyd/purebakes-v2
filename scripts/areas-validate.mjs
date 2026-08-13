import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import locations from "../src/_data/locations.js";
import canonicalLocations from "../src/_data/seo-pages/locations.json" with { type: "json" };

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");
assert.equal(locations.length, 41, "Expected 41 service-area records");
assert.equal(canonicalLocations.length, 41, "Canonical location source must remain at 41 records");

const keys = new Set(); const destinations = new Set(); const coordinates = new Map();
for (const location of locations) {
  assert(!keys.has(location.key), `Duplicate location key: ${location.key}`); keys.add(location.key);
  assert(!destinations.has(location.url), `Duplicate destination: ${location.url}`); destinations.add(location.url);
  assert.equal(location.url, canonicalLocations.find((item) => item.key === location.key)?.url, `${location.key} map URL drifted from canonical data`);
  assert(Number.isFinite(location.map?.lat) && Number.isFinite(location.map?.lng), `${location.key} is missing coordinates`);
  assert(location.map.lat >= 17.2 && location.map.lat <= 17.6 && location.map.lng >= 78.2 && location.map.lng <= 78.65, `${location.key} is outside the Hyderabad-region validation bounds`);
  const coordinateKey = `${location.map.lat},${location.map.lng}`;
  const duplicate = coordinates.get(coordinateKey);
  assert(!duplicate || new Set([duplicate, location.key]).size === 2 && [duplicate, location.key].sort().join(",") === "manikonda,puppalaguda", `Unintended duplicate coordinates: ${duplicate} and ${location.key}`);
  coordinates.set(coordinateKey, location.key);
}

const template = await read("src/areas-we-serve/index.njk"); const script = await read("src/assets/js/areas-map.js"); const base = await read("src/_includes/layouts/base.njk");
assert.match(template, /Don’t see your area\?/, "Areas page must explain that pins are not the service boundary");
assert.match(template, /350\+ KM/, "Areas page must include the approved long-distance trust story");
assert.doesNotMatch(`${template}\n${script}`, /Get Directions|Open in Maps|Navigate to|streetAddress|house number|Marrichettu|pickupIcon|PureBakes Pickup/i, "Pickup-location or directions UI must not be added");
assert.match(script, /icon: serviceIcon, title: `\$\{location\.name\} — Area We Serve`/, "All 41 pins must share service-area semantics");
assert.match(base, /pageSlug == "areas-we-serve"[^]*leaflet\.js/, "Leaflet must be page-scoped");

const html = await read("_site/areas-we-serve/index.html");
const basePath = process.env.SITE_BASE_PATH || (html.includes("/purebakes-v2/") ? "/purebakes-v2" : "");
const staticLinks = [...html.matchAll(/<a href="(\/[^" ]*customized-cakes-[^"]+\/)" data-area-page-link/g)].map((match) => basePath && match[1].startsWith(`${basePath}/`) ? match[1].slice(basePath.length) : match[1]);
assert.equal(staticLinks.length, 41, "Generated page must retain 41 static fallback links");
assert.equal(new Set(staticLinks).size, 41, "Generated static fallback links must be unique");
for (const destination of destinations) assert(staticLinks.includes(destination), `Missing static destination ${destination}`);
assert.match(html, /<link rel="canonical" href="https:\/\/purebakes\.in\/areas-we-serve\/">/, "Areas hub canonical changed");
assert.match(html, /"addressLocality":"Manikonda"/, "Structured data locality must remain Manikonda");
assert.doesNotMatch(html, /streetAddress|"geo"|Get Directions|Marrichettu|PureBakes Pickup/i, "Generated public HTML exposes prohibited pickup detail");

for (const file of ["_site/index.html", "_site/gallery/index.html", "_site/customized-cakes-gachibowli/index.html"]) {
  assert.doesNotMatch(await read(file), /leaflet|areas-map/i, `${file} must not load map assets`);
}

const leafletJsBytes = (await stat(new URL("../_site/assets/vendor/leaflet/leaflet.js", import.meta.url))).size;
const leafletCssBytes = (await stat(new URL("../_site/assets/vendor/leaflet/leaflet.css", import.meta.url))).size;
console.log(`Areas validation passed: 41/41 coordinates, destinations and static links; Leaflet ${leafletJsBytes} B JS + ${leafletCssBytes} B CSS, page-only and lazy initialized.`);
