import { access, readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const output = resolve("_site"); const errors = []; const pages = [];
async function walk(dir) { for (const name of await readdir(dir)) { const path = join(dir, name); (await stat(path)).isDirectory() ? await walk(path) : path.endsWith(".html") && pages.push(path); } }
await walk(output);
for (const path of pages) {
  const html = await readFile(path, "utf8"); const relative = path.slice(output.length);
  for (const [label, pattern] of [["title", /<title>[^<]+<\/title>/i], ["description", /<meta name="description" content="[^"]+">/i], ["canonical", /<link rel="canonical" href="https:\/\/purebakes\.in\/[^"]*">/i], ["robots", /<meta name="robots" content="noindex, nofollow">/i], ["H1", /<h1[ >]/i]]) if (!pattern.test(html)) errors.push(`${relative}: missing ${label}`);
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) { if (!/\balt="[^"]*"/i.test(image[0])) errors.push(`${relative}: image missing alt`); if (!/\bwidth="\d+"/i.test(image[0]) || !/\bheight="\d+"/i.test(image[0])) errors.push(`${relative}: image missing dimensions`); }
  for (const match of html.matchAll(/(?:src|srcset)="([^"]+)"/gi)) for (const candidate of match[1].split(",").map((part) => part.trim().split(/\s+/)[0]).filter((value) => value.startsWith("/"))) { const target = join(output, candidate.split(/[?#]/)[0]); try { await access(target); } catch { errors.push(`${relative}: broken asset ${candidate}`); } }
  for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) { try { JSON.parse(script[1]); } catch { errors.push(`${relative}: invalid JSON-LD`); } }
  for (const match of html.matchAll(/href="(\/[^"?#]*)(?:#([^"?]*))?(?:\?[^\"]*)?"/gi)) {
    const href = match[1]; if (href.startsWith("//")) continue;
    const target = href === "/" ? join(output, "index.html") : href.endsWith("/") ? join(output, href, "index.html") : join(output, href);
    try {
      await access(target);
      if (match[2]) { const targetHtml = await readFile(target, "utf8"); const escaped = match[2].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); if (!new RegExp(`\\bid=[\"']${escaped}[\"']`, "i").test(targetHtml)) errors.push(`${relative}: broken anchor ${href}#${match[2]}`); }
    } catch { errors.push(`${relative}: broken internal link ${href}`); }
  }
}
const home = await readFile(join(output, "index.html"), "utf8");
if (!/fetchpriority="high"/.test(home) || /hero-custom-cake\.webp"[^>]*loading="lazy"/.test(home)) errors.push("Homepage hero loading priority is invalid");
if (!/919980213333/.test(await readFile(join(output, "assets/js/site.js"), "utf8"))) errors.push("WhatsApp helper number missing");
if (!/Disallow: \//.test(await readFile(join(output, "robots.txt"), "utf8"))) errors.push("Staging robots.txt does not disallow crawling");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated ${pages.length} generated HTML pages: metadata, staging robots, H1s, image alt/dimensions, hero priority, and WhatsApp configuration.`);
