import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import sitemapPages from "../src/_data/sitemapPages.js";

const mode = process.argv[2];
if (!["staging", "production"].includes(mode)) throw new Error("Usage: node scripts/launch-validate.mjs staging|production");

const root = resolve("_site");
const errors = [];
const htmlFiles = [];
async function walk(directory) {
  for (const name of await readdir(directory)) {
    const path = join(directory, name);
    (await stat(path)).isDirectory() ? await walk(path) : path.endsWith(".html") && htmlFiles.push(path);
  }
}
await walk(root);

const pages = await Promise.all(htmlFiles.map(async (path) => ({ path, html: await readFile(path, "utf8") })));
const expectedRoutes = new Set(sitemapPages);
const expectedHtmlCount = expectedRoutes.size + 1;
const routeFor = (path) => path === join(root, "404.html") ? "/404.html" : `/${path.slice(root.length + 1).replace(/index\.html$/, "").replaceAll("\\", "/")}`;
const generatedRoutes = new Set(pages.map(({ path }) => routeFor(path)));
const cakeSources = (await readdir(resolve("src/assets/images/cakes"), { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith(".webp"));

if (cakeSources.length !== 472) errors.push(`Expected 472 canonical cake sources, found ${cakeSources.length}`);
if (cakeSources.some(({ name }) => /-(360|540|720|900)\.webp$/.test(name))) errors.push("Generated derivative found in canonical source folder");
if (pages.length !== expectedHtmlCount) errors.push(`Expected ${expectedHtmlCount} generated HTML files from ${expectedRoutes.size} sitemap routes plus 404, found ${pages.length}`);
for (const route of expectedRoutes) if (!generatedRoutes.has(route)) errors.push(`Expected route was not generated: ${route}`);
for (const route of generatedRoutes) if (route !== "/404.html" && !expectedRoutes.has(route)) errors.push(`Unexpected HTML route was generated: ${route}`);

const canonicals = new Map();
for (const { path, html } of pages) {
  const rel = path.slice(root.length);
  const noindex = /<meta name="robots" content="noindex, nofollow">/i.test(html);
  const gaCount = (html.match(/googletagmanager\.com\/gtag\/js/gi) || []).length;
  const clarityCount = (html.match(/clarity\.ms\/tag/gi) || []).length;
  if (mode === "staging" && !noindex) errors.push(`${rel}: staging page is indexable`);
  if (mode === "staging" && gaCount) errors.push(`${rel}: analytics present on staging`);
  if (mode === "staging" && clarityCount) errors.push(`${rel}: Clarity present on staging`);
  if (mode === "production" && noindex) errors.push(`${rel}: production page is noindex`);
  if (mode === "production" && !/<meta name="robots" content="index, follow">/i.test(html)) errors.push(`${rel}: production index/follow directive missing`);
  if (mode === "production" && gaCount !== 1) errors.push(`${rel}: expected GA4 once, found ${gaCount}`);
  if (mode === "production" && clarityCount !== 1) errors.push(`${rel}: expected Clarity once, found ${clarityCount}`);

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  if (!canonical) errors.push(`${rel}: canonical missing`);
  else {
    let parsed;
    try { parsed = new URL(canonical); } catch { errors.push(`${rel}: invalid canonical ${canonical}`); }
    if (parsed && (parsed.protocol !== "https:" || parsed.hostname !== "purebakes.in")) errors.push(`${rel}: non-production canonical ${canonical}`);
    if (parsed && routeFor(path) !== "/404.html" && !parsed.pathname.endsWith("/")) errors.push(`${rel}: canonical does not use a trailing slash: ${canonical}`);
    if (canonicals.has(canonical)) errors.push(`${rel}: duplicate canonical also used by ${canonicals.get(canonical)}`); else canonicals.set(canonical, rel);
  }

  for (const hostname of ["new.purebakes.in", "v21.purebakes.in", "pbhyd.github.io", "github.io", "localhost"]) {
    if (html.toLowerCase().includes(hostname)) errors.push(`${rel}: forbidden hostname leaked into page output: ${hostname}`);
  }
  if (html.includes("cake-smash-cakes-in-hyderabad")) errors.push(`${rel}: obsolete Cake Smash route leaked into page output`);
}

const robots = await readFile(join(root, "robots.txt"), "utf8");
if (mode === "staging" && !/Disallow: \//.test(robots)) errors.push("Staging robots does not disallow all crawling");
if (mode === "production" && (/Disallow: \//.test(robots) || !/Allow: \//.test(robots))) errors.push("Production robots does not explicitly allow intended crawling");

const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (mode === "staging" && sitemapUrls.length) errors.push(`Staging sitemap must be empty, found ${sitemapUrls.length} URLs`);
if (mode === "production") {
  if (sitemapUrls.length !== expectedRoutes.size) errors.push(`Expected ${expectedRoutes.size} production sitemap URLs, found ${sitemapUrls.length}`);
  if (new Set(sitemapUrls).size !== sitemapUrls.length) errors.push("Production sitemap contains duplicate URLs");
  const expectedUrls = new Set([...expectedRoutes].map((route) => new URL(route, "https://purebakes.in/").href));
  for (const url of sitemapUrls) {
    let parsed;
    try { parsed = new URL(url); } catch { errors.push(`Invalid sitemap URL: ${url}`); continue; }
    if (parsed.protocol !== "https:" || parsed.hostname !== "purebakes.in") errors.push(`Non-production sitemap URL: ${url}`);
    if (!expectedUrls.has(url)) errors.push(`Unexpected production sitemap URL: ${url}`);
  }
  for (const url of expectedUrls) if (!sitemapUrls.includes(url)) errors.push(`Production sitemap URL missing: ${url}`);
  for (const forbidden of ["cake-smash-cakes-in-hyderabad", "/recipes/", "/baking-essentials/", "v21.purebakes.in", "pbhyd.github.io", "github.io", "localhost"]) {
    if (sitemap.toLowerCase().includes(forbidden)) errors.push(`Forbidden production sitemap value: ${forbidden}`);
  }
}

const cname = (await readFile(join(root, "CNAME"), "utf8")).trim();
if (cname !== "purebakes.in") errors.push(`Expected production custom domain in CNAME, found ${cname}`);
try { await stat(join(root, "cake-smash-cakes-in-hyderabad")); errors.push("Obsolete Cake Smash output directory exists"); } catch (error) { if (error.code !== "ENOENT") throw error; }
try { await stat(join(root, "cake-smash-in-hyderabad", "index.html")); } catch { errors.push("Correct Cake Smash route is missing"); }

const siteJs = await readFile(join(root, "assets/js/site.js"), "utf8");
for (const token of ["check_availability_open", "check_availability_continue", "whatsapp_click", "919980213333", "page_path", "page_type", "page_slug", "classification", "cta_location", "page_context", "enquiry_id", "gallery_query", "cake_id", "occasion"]) {
  if (!siteJs.includes(token)) errors.push(`Missing site integration token: ${token}`);
}
for (const token of ["document.querySelector('link[rel=\"canonical\"]')?.href", "`https://purebakes.in${location.pathname}`"]) {
  if (!siteJs.includes(token)) errors.push(`Missing production WhatsApp reference protection: ${token}`);
}
if (siteJs.includes("location.origin")) errors.push("WhatsApp reference must not use location.origin");

const social = JSON.parse(await readFile(resolve("src/_data/business.json"), "utf8")).social;
for (const [network, url] of Object.entries(social)) if (!pages.some(({ html }) => html.includes(url))) errors.push(`Official ${network} URL absent from output`);

if (errors.length) { console.error([...new Set(errors)].join("\n")); process.exit(1); }
console.log(`Launch validation passed for ${mode}: ${expectedRoutes.size} sitemap routes, ${pages.length} HTML files including 404, 472 canonical gallery sources, environment indexing/analytics controls, canonical host integrity, social and conversion integrations.`);
