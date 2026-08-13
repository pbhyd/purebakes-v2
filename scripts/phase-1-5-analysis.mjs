import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const audit = JSON.parse(await readFile("seo/current-site-audit.json", "utf8"));
const phase1Migration = JSON.parse(await readFile("seo/url-migration.json", "utf8"));
const pages = audit.pages;
const live = pages.filter((page) => page.statusCode === 200);
const dead = pages.filter((page) => page.statusCode === 404);
const normalize = (url) => { const value = new URL(url); value.search = ""; value.hash = ""; return value.href.replace(/\/$/, ""); };
const byUrl = new Map(pages.map((page) => [normalize(page.existingUrl), page]));
const liveUrls = new Set(live.map((page) => normalize(page.finalUrl)));
const sitemapUrls = new Set(pages.filter((page) => page.discoveredFrom === "sitemap").map((page) => normalize(page.existingUrl)));
const fetchedCanonicalStatuses = new Map();
await Promise.all(live.map(async (page) => {
  if (!page.canonical || new URL(page.canonical).hostname !== "purebakes.in") return;
  const key = normalize(page.canonical);
  if (byUrl.has(key) || fetchedCanonicalStatuses.has(key)) return;
  try {
    const response = await fetch(page.canonical, { redirect: "manual", headers: { "user-agent": "PureBakes-V2-SEO-Audit/1.5" } });
    fetchedCanonicalStatuses.set(key, response.status);
  } catch { fetchedCanonicalStatuses.set(key, null); }
}));
const canonicalStatus = (page) => {
  if (!page.canonical) return null;
  const canonical = byUrl.get(normalize(page.canonical));
  return canonical?.statusCode ?? fetchedCanonicalStatuses.get(normalize(page.canonical)) ?? (normalize(page.canonical) === normalize(page.finalUrl) ? 200 : null);
};
const inbound = new Map();
for (const source of live) for (const link of source.internalLinks) {
  const key = normalize(link);
  if (!inbound.has(key)) inbound.set(key, new Set());
  inbound.get(key).add(source.finalUrl);
}
const selfCanonical = (page) => normalize(page.canonical) === normalize(page.finalUrl);
const isExternalCanonical = (page) => page.canonical && new URL(page.canonical).hostname !== "purebakes.in";

const decisions = live.map((page) => {
  const targetStatus = canonicalStatus(page);
  let action = "KEEP", confidence = "HIGH", manualReviewRequired = false;
  let recommendedCanonical = page.finalUrl;
  let reason = "The live URL is already self-canonical and has no crawler-level conflict.";
  if (isExternalCanonical(page)) {
    action = "MANUAL_REVIEW"; confidence = "LOW"; manualReviewRequired = true; recommendedCanonical = null;
    reason = "The page canonicalizes to another domain. Ownership, content strategy, backlinks and traffic evidence are required before changing this relationship.";
  } else if (!selfCanonical(page) && targetStatus === 404) {
    action = "SELF_CANONICALIZE"; confidence = "MEDIUM";
    reason = "The source is live and indexable while its canonical target returns 404. Self-canonicalization is the safest crawler-supported direction, pending traffic validation.";
  } else if (!selfCanonical(page)) {
    action = "MANUAL_REVIEW"; confidence = "LOW"; manualReviewRequired = true; recommendedCanonical = null;
    reason = `The source canonical differs and its observed status is ${targetStatus ?? "unknown"}; analytics and content-equivalence evidence are required.`;
  }
  return {
    currentUrl: page.finalUrl, currentStatus: page.statusCode,
    existingCanonical: page.canonical || null, canonicalStatus: targetStatus,
    inSitemap: sitemapUrls.has(normalize(page.existingUrl)),
    internallyLinked: (inbound.get(normalize(page.finalUrl))?.size || 0) > 0,
    internalInboundLinkCount: inbound.get(normalize(page.finalUrl))?.size || 0,
    searchConsole: { clicks16m: null, impressions16m: null, clicks3m: null, impressions3m: null },
    ga4: { organicSessions: null },
    recommendedUrl: page.finalUrl, recommendedCanonical,
    action, confidence, reason, manualReviewRequired,
    phase1: phase1Migration.mappings.find((item) => normalize(item.currentUrl || item.existingUrl) === normalize(page.existingUrl)) || null
  };
});

await writeFile("seo/url-migration.json", `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  phase: "1.5",
  analyticsAvailable: { searchConsole: false, ga4: false },
  strategy: "Preserve all live URLs. Never canonicalize to a 404. Treat crawler-supported self-canonicalizations as provisional until traffic exports are reviewed.",
  mappings: decisions
}, null, 2)}\n`);

const locationPages = live.filter((page) => page.pageType === "location");
const boilerplate = (text) => text.toLowerCase().replace(/customi[sz]ed?|cakes?|delivery|hyderabad|pure bakes|[a-z]+(?:abad|pally|pet|guda|nagar|hills|city|district)/g, " ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const locationBodies = new Map();
for (const page of locationPages) {
  const response = await fetch(page.finalUrl, { headers: { "user-agent": "PureBakes-V2-SEO-Audit/1.5" } });
  const html = await response.text();
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  const text = main.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&\w+;/g, " ").replace(/\s+/g, " ").trim();
  locationBodies.set(page.finalUrl, boilerplate(text));
}
const shingles = (text) => { const words = text.split(" "); return new Set(words.slice(0, -4).map((_, i) => words.slice(i, i + 5).join(" "))); };
const similarity = (a, b) => { const aa = shingles(a), bb = shingles(b); let overlap = 0; for (const x of aa) if (bb.has(x)) overlap++; return overlap / Math.max(1, Math.min(aa.size, bb.size)); };
const locationAudit = locationPages.map((page) => {
  let maxSimilarity = 0, mostSimilarUrl = null;
  for (const other of locationPages) if (other.finalUrl !== page.finalUrl) {
    const score = similarity(locationBodies.get(page.finalUrl), locationBodies.get(other.finalUrl));
    if (score > maxSimilarity) { maxSimilarity = score; mostSimilarUrl = other.finalUrl; }
  }
  const decision = decisions.find((item) => normalize(item.currentUrl) === normalize(page.finalUrl));
  return {
    location: page.h1.replace(/customi[sz]ed cakes?|cake delivery|in hyderabad/gi, "").trim(), url: page.finalUrl, status: page.statusCode,
    canonical: page.canonical, canonicalStatus: canonicalStatus(page), inSitemap: sitemapUrls.has(normalize(page.existingUrl)),
    searchConsoleClicks: null, searchConsoleImpressions: null, ga4OrganicSessions: null,
    contentSimilarityRisk: maxSimilarity >= 0.8 ? "HIGH" : maxSimilarity >= 0.55 ? "MEDIUM" : "LOW",
    maximumPairSimilarity: Number(maxSimilarity.toFixed(3)), mostSimilarUrl,
    recommendedAction: decision.action,
    reason: `${decision.reason} Template-normalized five-word-shingle similarity to the nearest location page is ${(maxSimilarity * 100).toFixed(1)}%.`
  };
});
await writeFile("seo/location-page-audit.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), methodology: "Visible main/body text; location/boilerplate terms normalized; nearest-page overlap of five-word shingles. This is a duplication-risk signal, not a plagiarism judgment.", pages: locationAudit }, null, 2)}\n`);

const deadCanonicalTargets = decisions.filter((item) => item.canonicalStatus === 404).map((item) => ({
  sourceUrl: item.currentUrl, sourceStatus: item.currentStatus, canonicalUrl: item.existingCanonical, canonicalStatus: 404,
  sourceSearchClicks: null, sourceSearchImpressions: null, sourceGa4Sessions: null,
  recommendedCanonical: item.currentUrl, confidence: "MEDIUM",
  reason: "Live indexable source points to a confirmed 404 canonical target; provisional self-canonicalization avoids intentional canonicalization to an error page."
}));
await writeFile("seo/dead-canonical-targets.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), targets: deadCanonicalTargets }, null, 2)}\n`);

const deadClassification = dead.map((page) => {
  const canonicalSources = live.filter((source) => source.canonical && normalize(source.canonical) === normalize(page.existingUrl)).map((source) => source.finalUrl);
  const internalSources = [...(inbound.get(normalize(page.existingUrl)) || [])];
  let category = "unknown";
  if (canonicalSources.length) category = "dead canonical target";
  else if (internalSources.length) category = "old internal link";
  else if (sitemapUrls.has(normalize(page.existingUrl))) category = "old sitemap URL";
  else if (/\/gallery\/(?:gallery\/)+|\/gallerygallery|\/undefined|\/null/.test(new URL(page.existingUrl).pathname)) category = "malformed URL";
  else if (new URL(page.existingUrl).search || /\/\/$/.test(new URL(page.existingUrl).pathname)) category = "duplicate URL variant";
  return { url: page.existingUrl, status: 404, category, canonicalSources, internalSources, inSitemap: sitemapUrls.has(normalize(page.existingUrl)), searchConsoleClicks: null, searchConsoleImpressions: null, redirectConsideration: canonicalSources.length > 0 || internalSources.length > 0 };
});
await writeFile("seo/404-url-classification.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), urls: deadClassification }, null, 2)}\n`);

const linkIssues = [];
for (const source of live) for (const target of source.internalLinks) {
  const targetPage = byUrl.get(normalize(target));
  if (targetPage?.statusCode === 404) linkIssues.push({ sourceUrl: source.finalUrl, targetUrl: target, targetStatus: 404, issue: "broken_internal_link", recommendedTarget: null });
  else if (targetPage?.statusCode === 200 && targetPage.canonical && normalize(targetPage.canonical) !== normalize(targetPage.finalUrl)) linkIssues.push({ sourceUrl: source.finalUrl, targetUrl: target, targetStatus: 200, issue: "links_to_non_self_canonical_url", declaredCanonical: targetPage.canonical, canonicalStatus: canonicalStatus(targetPage), recommendedTarget: canonicalStatus(targetPage) === 404 ? targetPage.finalUrl : null });
}
await writeFile("seo/internal-link-issues.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), issues: linkIssues }, null, 2)}\n`);

const gallery = live.find((page) => normalize(page.finalUrl) === "https://purebakes.in/gallery");
const galleryPageUrls = new Set(gallery?.images.map((image) => image.url) || []);
const isSiteBrandAsset = (url) => /\/(?:pure-bakes-logo(?:\.[a-z0-9]+)?|favicon(?:-[^/]*)?\.[a-z0-9]+)$/i.test(new URL(url).pathname);
const galleryUrls = new Set([...(galleryPageUrls || [])].filter((url) => !isSiteBrandAsset(url)));
const allImages = new Map();
for (const page of live) for (const image of page.images) {
  const item = allImages.get(image.url) || { url: image.url, classification: "unknown", referencedBy: [], altValues: [], widthValues: [], heightValues: [] };
  item.referencedBy.push(page.finalUrl); if (!item.altValues.includes(image.alt)) item.altValues.push(image.alt);
  if (!item.widthValues.includes(image.width)) item.widthValues.push(image.width); if (!item.heightValues.includes(image.height)) item.heightValues.push(image.height);
  allImages.set(image.url, item);
}
for (const item of allImages.values()) {
  const path = new URL(item.url).pathname.toLowerCase();
  if (galleryUrls.has(item.url)) item.classification = "gallery";
  else if (isSiteBrandAsset(item.url)) item.classification = "logo";
  else if (/hero/.test(path)) item.classification = "hero";
  else if (item.altValues.every((alt) => !alt)) item.classification = "decorative";
  else if (/\/img\//.test(path)) item.classification = "content";
  item.referencedBy = [...new Set(item.referencedBy)];
  item.sha256Url = createHash("sha256").update(item.url).digest("hex");
}
await writeFile("seo/image-url-inventory.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), totalUnique: allImages.size, galleryUnique: galleryUrls.size, images: [...allImages.values()] }, null, 2)}\n`);

const manual = decisions.filter((item) => item.manualReviewRequired).map((item) => ({
  url: item.currentUrl,
  problem: isExternalCanonical(live.find((page) => normalize(page.finalUrl) === normalize(item.currentUrl))) ? "Cross-domain canonical" : "Canonical preference cannot be resolved without traffic evidence",
  availableEvidence: `Source returns 200; canonical is ${item.existingCanonical}; canonical status is ${item.canonicalStatus ?? "unknown"}; Search Console and GA4 exports are unavailable.`,
  possibleOptionA: `Keep ${item.currentUrl} and make it self-canonical.`, possibleOptionB: `Retain or migrate to ${item.existingCanonical}.`,
  recommendation: "Preserve the live source pending owner and analytics review.", whyManualDecisionIsNeeded: "Traffic, backlink, ownership, or cross-domain intent can materially change the correct choice."
}));
await writeFile("seo/manual-review-required.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), items: manual }, null, 2)}\n`);

console.log(JSON.stringify({ live: live.length, dead: dead.length, decisions: decisions.reduce((out, item) => (out[item.action] = (out[item.action] || 0) + 1, out), {}), locations: locationPages.length, deadCanonicals: deadCanonicalTargets.length, linkIssues: linkIssues.length, images: allImages.size, galleryImages: galleryUrls.size, manual: manual.length }, null, 2));
