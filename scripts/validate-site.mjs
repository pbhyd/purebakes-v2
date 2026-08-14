import { access, readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const mode = process.argv[2];
if (!["staging", "production"].includes(mode)) throw new Error("Usage: node scripts/validate-site.mjs staging|production");
const output = resolve("_site"); const errors = []; const pages = [];
const generatedHome = await readFile(join(output, "index.html"), "utf8");
const basePath = process.env.SITE_BASE_PATH?.replace(/\/$/, "") || (generatedHome.includes('href="/purebakes-v2/') ? "/purebakes-v2" : "");
const artifactPath = (url) => {
  const pathname = url.split(/[?#]/)[0];
  return basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`)) ? pathname.slice(basePath.length) || "/" : pathname;
};
async function walk(dir) { for (const name of await readdir(dir)) { const path = join(dir, name); (await stat(path)).isDirectory() ? await walk(path) : path.endsWith(".html") && pages.push(path); } }
await walk(output);
for (const path of pages) {
  const html = await readFile(path, "utf8"); const relative = path.slice(output.length);
  for (const [label, pattern] of [["title", /<title>[^<]+<\/title>/i], ["description", /<meta name="description" content="[^"]+">/i], ["canonical", /<link rel="canonical" href="https:\/\/purebakes\.in\/[^"]*">/i], ["robots", /<meta name="robots" content="(?:noindex, nofollow|index, follow)">/i], ["H1", /<h1[ >]/i]]) if (!pattern.test(html)) errors.push(`${relative}: missing ${label}`);
  const noindex = /<meta name="robots" content="noindex, nofollow">/i.test(html);
  if (mode === "staging" && !noindex) errors.push(`${relative}: staging page is indexable`);
  if (mode === "production" && noindex) errors.push(`${relative}: production page is noindex`);
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) { if (!/\balt="[^"]*"/i.test(image[0])) errors.push(`${relative}: image missing alt`); if (!/\bwidth="\d+"/i.test(image[0]) || !/\bheight="\d+"/i.test(image[0])) errors.push(`${relative}: image missing dimensions`); }
  for (const match of html.matchAll(/(?:src|srcset)="([^"]+)"/gi)) for (const candidate of match[1].split(",").map((part) => part.trim().split(/\s+/)[0]).filter((value) => value.startsWith("/"))) { const target = join(output, artifactPath(candidate)); try { await access(target); } catch { errors.push(`${relative}: broken asset ${candidate}`); } }
  for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) { try { JSON.parse(script[1]); } catch { errors.push(`${relative}: invalid JSON-LD`); } }
  for (const match of html.matchAll(/href="(\/[^"?#]*)(?:#([^"?]*))?(?:\?[^\"]*)?"/gi)) {
    const href = match[1]; if (href.startsWith("//")) continue;
    const logicalHref = artifactPath(href);
    const target = logicalHref === "/" ? join(output, "index.html") : logicalHref.endsWith("/") ? join(output, logicalHref, "index.html") : join(output, logicalHref);
    try {
      await access(target);
      if (match[2]) { const targetHtml = await readFile(target, "utf8"); const escaped = match[2].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); if (!new RegExp(`\\bid=[\"']${escaped}[\"']`, "i").test(targetHtml)) errors.push(`${relative}: broken anchor ${href}#${match[2]}`); }
    } catch { errors.push(`${relative}: broken internal link ${href}`); }
  }
}
const home = await readFile(join(output, "index.html"), "utf8");
if (!/fetchpriority="high"/.test(home) || /hero-custom-cake\.webp"[^>]*loading="lazy"/.test(home)) errors.push("Homepage hero loading priority is invalid");
if (!/919980213333/.test(await readFile(join(output, "assets/js/site.js"), "utf8"))) errors.push("WhatsApp helper number missing");
const robots = await readFile(join(output, "robots.txt"), "utf8");
if (mode === "staging" && !/Disallow: \//.test(robots)) errors.push("Staging robots.txt does not disallow crawling");
if (mode === "production" && /Disallow: \//.test(robots)) errors.push("Production robots.txt disallows crawling");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated ${pages.length} generated ${mode} HTML pages: metadata, indexing controls, H1s, image alt/dimensions, hero priority, and WhatsApp configuration.`);
