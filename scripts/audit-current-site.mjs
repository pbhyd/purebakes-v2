import { mkdir, readFile, writeFile } from "node:fs/promises";

const origin = "https://purebakes.in";
const sitemap = await readFile("/tmp/purebakes-sitemap.xml", "utf8");
const rawLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
const seedUrls = [...new Set(rawLocs.map((loc) => new URL(loc, `${origin}/`).href))];
const queue = seedUrls.map((url) => ({ url, discoveredFrom: "sitemap" }));
const queued = new Set(seedUrls);

const decode = (value = "") => value
  .replace(/<[^>]*>/g, " ")
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const attr = (html, tag, name) => {
  const re = new RegExp(`<${tag}[^>]*\\b${name}=["']([^"']*)["'][^>]*>`, "i");
  return html.match(re)?.[1] || "";
};
const meta = (html, name) => html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>|<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["'][^>]*>`, "i"))?.slice(1).find(Boolean) || "";

function pageType(path) {
  if (path === "/") return "home";
  if (path.startsWith("/customized-cakes-")) return "location";
  if (path === "/gallery/") return "gallery";
  if (/birthday|anniversary|engagement|shower|announcement|bon-voyage|smash|wedding/.test(path)) return "occasion";
  if (path.includes("eggless")) return "flavour/dietary";
  if (path.includes("baking")) return "learn/commerce";
  return "other";
}

function recommendation(path, type) {
  if (type === "location" || type === "occasion" || type === "gallery" || path === "/") return { recommendedNewUrl: path, action: "KEEP" };
  return { recommendedNewUrl: path, action: "IMPROVE" };
}

const pages = [];
for (let cursor = 0; cursor < queue.length && cursor < 250; cursor += 1) {
  const { url, discoveredFrom } = queue[cursor];
  const response = await fetch(url, { redirect: "follow", headers: { "user-agent": "PureBakes-V2-SEO-Audit/1.0" } });
  const contentType = response.headers.get("content-type") || "";
  const html = await response.text();
  if (!contentType.includes("text/html")) continue;
  const finalUrl = response.url;
  const path = new URL(finalUrl).pathname.endsWith("/") || new URL(finalUrl).pathname.includes(".") ? new URL(finalUrl).pathname : `${new URL(finalUrl).pathname}/`;
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => ({
    url: new URL(attr(match[0], "img", "src") || "/", finalUrl).href,
    alt: attr(match[0], "img", "alt"),
    width: attr(match[0], "img", "width"),
    height: attr(match[0], "img", "height"),
    loading: attr(match[0], "img", "loading")
  })).filter((image) => image.url !== `${origin}/`);
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>/gi)]
    .map((match) => { try { return new URL(match[1], finalUrl).href; } catch { return null; } })
    .filter(Boolean);
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>|<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i)?.slice(1).find(Boolean) || "";
  const robots = meta(html, "robots") || "index,follow (implicit)";
  const type = pageType(path);
  const page = {
    existingUrl: url,
    discoveredFrom,
    finalUrl,
    statusCode: response.status,
    title: decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]),
    metaDescription: decode(meta(html, "description")),
    h1: decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]),
    canonical,
    indexability: /noindex/i.test(robots) ? "noindex" : "indexable",
    robots,
    structuredData: [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/gi)].length,
    internalLinks: [...new Set(links.filter((link) => new URL(link).hostname === "purebakes.in"))],
    externalLinks: [...new Set(links.filter((link) => new URL(link).hostname !== "purebakes.in"))],
    images,
    pageType: type,
    ...recommendation(path, type)
  };
  pages.push(page);
  for (const link of page.internalLinks) {
    const candidate = new URL(link);
    candidate.search = "";
    candidate.hash = "";
    if (/\.(?:avif|css|gif|ico|jpe?g|js|json|pdf|png|svg|webp|xml)$/i.test(candidate.pathname)) continue;
    const href = candidate.href;
    if (!queued.has(href)) {
      queued.add(href);
      queue.push({ url: href, discoveredFrom: finalUrl });
    }
  }
  if (canonical) {
    const candidate = new URL(canonical, finalUrl);
    if (candidate.hostname === "purebakes.in" && !queued.has(candidate.href)) {
      queued.add(candidate.href);
      queue.push({ url: candidate.href, discoveredFrom: `${finalUrl} (canonical)` });
    }
  }
  console.log(`${response.status} ${url}`);
}

await mkdir("seo", { recursive: true });
await writeFile("seo/current-site-audit.json", `${JSON.stringify({ auditedAt: new Date().toISOString(), source: origin, sitemapUrl: `${origin}/sitemap.xml`, pages }, null, 2)}\n`);
await writeFile("seo/url-migration.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), strategy: "Preserve every live current path through initial production cutover; introduce new taxonomy paths only as additive URLs after content approval. Dead linked/canonical targets remain documented in the audit, not migration candidates.", mappings: pages.filter(({ statusCode }) => statusCode === 200).map(({ existingUrl, finalUrl, pageType, recommendedNewUrl, action }) => ({ existingUrl, finalUrl, pageType, recommendedNewUrl, action, redirectRequired: false })) }, null, 2)}\n`);
