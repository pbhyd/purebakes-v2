import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");
const css = await read("src/assets/css/site.css");
const portfolio = await read("src/_includes/components/seo-portfolio.njk");
const galleryTemplate = await read("src/gallery/index.njk");
const galleryScript = await read("src/assets/js/gallery.js");

assert.match(css, /\.portfolio-cake-photo\{display:block;width:100%;height:auto;max-width:none;background:transparent\}/, "Shared cake-photo rule must preserve intrinsic proportions and fill card width");
assert.doesNotMatch(css, /\.(?:gallery-card|seo-cake-grid) img\{[^}]*(?:aspect-ratio|object-fit|height:)[^}]*\}/, "Legacy fixed-ratio/fit rules must not return on portfolio cards");
assert.doesNotMatch(css, /aspect-ratio:600\/760/, "The obsolete 600:760 cake-photo ratio must not return");

for (const [label, source] of [["SEO portfolio", portfolio], ["server-rendered Gallery", galleryTemplate]]) {
  assert.match(source, /class="portfolio-cake-photo"/, `${label} must use the shared semantic class`);
  assert.match(source, /360w,[^\n]+720w/, `${label} must retain 360/720 responsive sources`);
  assert.match(source, /width="1080" height="1920"/, `${label} must retain intrinsic dimensions`);
  assert.match(source, /loading="lazy" decoding="async"/, `${label} must retain deferred decoding/loading`);
}
assert.match(galleryScript, /image\.className = "portfolio-cake-photo"/, "Client-rendered Gallery cards must use the shared semantic class");
assert.match(galleryScript, /image\.width = 1080; image\.height = 1920/, "Client-rendered Gallery cards must retain intrinsic dimensions");

const representativePages = [
  "gallery/index.html",
  "birthday-cakes-in-hyderabad/index.html",
  "first-birthday-cakes-for-boys-in-hyderabad/index.html",
  "anniversary-cakes-in-hyderabad/index.html",
  "cakes/themes/floral-cakes/index.html",
  "customized-cakes-lb-nagar/index.html",
  "customized-cakes-financial-district/index.html",
  "customized-cakes-kokapet/index.html"
];
for (const file of representativePages) {
  const html = await read(`_site/${file}`);
  assert.match(html, /class="portfolio-cake-photo"/, `${file} must render full-width cake photography`);
  assert.match(html, /360w,[^>]+720w/, `${file} must render responsive photo sources`);
  assert.match(html, /width="1080" height="1920"/, `${file} must render intrinsic dimensions`);
}

const homepage = await read("_site/index.html");
assert.doesNotMatch(homepage, /cake-card[^]*?portfolio-cake-photo/, "Homepage's approved editorial crop must remain separate from portfolio treatment");

const sourceImages = (await readdir(path.join(root, "src/assets/images/cakes"))).filter((name) => name.endsWith(".webp") && !/-\d+\.webp$/.test(name));
assert.equal(sourceImages.length, 472, "Canonical gallery source count must remain 472");

console.log(`Cake photography validation passed: ${representativePages.length} rendered pages, ${sourceImages.length} canonical sources.`);
