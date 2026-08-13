import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd(); const output = path.join(root, "_site");
const expectedBasePath = process.argv[2] === "production" ? "" : "/purebakes-v2";
const read = (file) => readFile(path.join(output, file), "utf8");
const home = await read("index.html"); const gallery = await read("gallery/index.html"); const areas = await read("areas-we-serve/index.html");
const expected = (url) => `${expectedBasePath}${url}`;

const checks = [
  [home, `href="${expected("/assets/css/site.css")}"`, "stylesheet"],
  [home, `src="${expected("/assets/js/site.js")}"`, "site JavaScript"],
  [home, `href="${expected("/assets/images/brand/pure-bakes-logo-360.png")}"`, "favicon"],
  [home, `src="${expected("/assets/images/brand/pure-bakes-logo-360.png")}"`, "logo"],
  [home, `src="${expected("/assets/images/site/hero-custom-cake.webp")}"`, "homepage hero"],
  [home, `href="${expected("/gallery/")}"`, "Gallery link"],
  [home, `href="${expected("/cakes/")}"`, "Cakes link"],
  [home, `href="${expected("/faq/")}"`, "FAQ link"],
  [home, `href="${expected("/areas-we-serve/")}"`, "Areas link"],
  [gallery, `src="${expected("/assets/js/gallery.js")}"`, "Gallery JavaScript"],
  [gallery, `"image":"${expected("/assets/images/cakes/")}`, "client Gallery image data"],
  [areas, `href="${expected("/assets/vendor/leaflet/leaflet.css")}"`, "Leaflet CSS"],
  [areas, `src="${expected("/assets/js/areas-map.js")}"`, "map JavaScript"],
  [areas, `"url":"${expected("/customized-cakes-gachibowli/")}"`, "map location URL"],
  [home, `href="${expected("/birthday-cakes-in-hyderabad/")}"`, "occasion link"]
];
for (const [source, needle, label] of checks) assert(source.includes(needle), `${label} does not use expected base path: ${needle}`);

const theme = await read("cakes/themes/index.html");
assert(theme.includes(`href="${expected("/cakes/themes/unicorn-cakes/")}"`), "Theme link does not use expected base path");

for (const source of [home, gallery, areas]) {
  assert(source.includes('href="https://purebakes.in/'), "Production canonical/SEO targets must remain purebakes.in");
  assert(!source.includes("https://pbhyd.github.io"), "GitHub staging URL contaminated SEO metadata");
}

const htmlFiles = [];
async function walk(directory) { for (const entry of await readdir(directory, { withFileTypes: true })) { const file = path.join(directory, entry.name); if (entry.isDirectory()) await walk(file); else if (entry.name.endsWith(".html")) htmlFiles.push(file); } }
await walk(output);
if (!expectedBasePath) {
  for (const file of htmlFiles) assert(!(await readFile(file, "utf8")).includes("/purebakes-v2/"), `Production base-path leakage in ${path.relative(output, file)}`);
}

const whatsapp = home.match(/href="https:\/\/wa\.me\/[^"]+"/)?.[0] || "";
assert(whatsapp.includes(encodeURIComponent("https://purebakes.in/")), "WhatsApp staging reference must remain the production canonical URL");
console.log(`Base-path validation passed for ${expectedBasePath || "production root"}: representative assets, navigation, dynamic datasets, canonicals and WhatsApp references.`);
