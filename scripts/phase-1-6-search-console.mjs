import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = "seo/input/search-console";
const sources = {
  web16m: `${root}/gsc-web-16-months.zip`,
  web3m: `${root}/gsc-web-3-months.zip.zip`,
  image16m: `${root}/gsc-image-16-months.zip`
};
const temp = await mkdtemp(join(tmpdir(), "purebakes-gsc-"));

function parseCsv(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift();
  return rows.filter((values) => values.some(Boolean)).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}
const number = (value) => Number(String(value).replace(/%$/, "")) || 0;
const load = async (key, zip) => {
  const dir = join(temp, key); execFileSync("mkdir", ["-p", dir]); execFileSync("unzip", ["-q", zip, "-d", dir]);
  const filters = parseCsv(await readFile(join(dir, "Filters.csv"), "utf8"));
  const pages = parseCsv(await readFile(join(dir, "Pages.csv"), "utf8")).map((row) => ({ url: row["Top pages"], clicks: number(row.Clicks), impressions: number(row.Impressions), ctr: number(row.CTR) / 100, position: number(row.Position) }));
  const queries = parseCsv(await readFile(join(dir, "Queries.csv"), "utf8")).map((row) => ({ query: row["Top queries"], clicks: number(row.Clicks), impressions: number(row.Impressions), ctr: number(row.CTR) / 100, position: number(row.Position) }));
  const chart = parseCsv(await readFile(join(dir, "Chart.csv"), "utf8")).map((row) => ({ date: row.Date, clicks: number(row.Clicks), impressions: number(row.Impressions), ctr: number(row.CTR) / 100, position: number(row.Position) }));
  return { key, filters, pages, queries, chart, coverage: { start: chart[0]?.date, end: chart.at(-1)?.date, days: chart.length } };
};
const data = Object.fromEntries(await Promise.all(Object.entries(sources).map(async ([key, zip]) => [key, await load(key, zip)])));
if (data.web16m.filters.find((row) => row.Filter === "Search type")?.Value !== "Web" || data.web3m.filters.find((row) => row.Filter === "Search type")?.Value !== "Web" || data.image16m.filters.find((row) => row.Filter === "Search type")?.Value !== "Image") throw new Error("Search Console export filters do not match expected datasets");

const canonicalPath = (raw) => { const url = new URL(raw); return url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "").toLowerCase(); };
const exactVariant = (raw) => { const url = new URL(raw); return { protocol: url.protocol, host: url.host.toLowerCase(), path: url.pathname, query: url.search, hash: url.hash }; };
const aggregate = (rows) => {
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0), clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  return { clicks, impressions, ctr: impressions ? clicks / impressions : null, position: impressions ? rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions : null };
};
const nullableMetrics = (rows) => rows.length ? aggregate(rows) : { clicks: null, impressions: null, ctr: null, position: null };
const variantsFor = (dataset, url) => dataset.pages.filter((row) => canonicalPath(row.url) === canonicalPath(url) && ["purebakes.in", "www.purebakes.in"].includes(new URL(row.url).host));
const metricsFor = (dataset, url) => aggregate(variantsFor(dataset, url));
const exactRowsFor = (dataset, url) => {
  const wanted = exactVariant(url);
  return dataset.pages.filter((row) => { const found = exactVariant(row.url); return found.protocol === wanted.protocol && found.host === wanted.host && found.path === wanted.path && found.query === wanted.query; });
};
const valueBand = ({ clicks, impressions }) => clicks >= 10 || impressions >= 1000 ? "HIGH" : clicks >= 2 || impressions >= 100 ? "MEDIUM" : clicks > 0 || impressions > 0 ? "LOW" : "NONE";
const trendFor = (historical, recent) => {
  if (historical.impressions < 20 || recent.impressions < 10) return "INSUFFICIENT_DATA";
  const expectedShare = data.web3m.coverage.days / data.web16m.coverage.days;
  const actualShare = recent.impressions / historical.impressions;
  return actualShare > expectedShare * 1.15 ? "GROWING" : actualShare < expectedShare * 0.75 ? "DECLINING" : "STABLE";
};
const audit = JSON.parse(await readFile("seo/current-site-audit.json", "utf8"));
const migration = JSON.parse(await readFile("seo/url-migration.json", "utf8"));
for (const item of migration.mappings) {
  if (!item.phase15Decision) item.phase15Decision = { action: item.action, confidence: item.confidence, recommendedUrl: item.recommendedUrl, recommendedCanonical: item.recommendedCanonical, reason: item.reason, manualReviewRequired: item.manualReviewRequired };
  delete item.phase1;
  const exactHistoricalRows = exactRowsFor(data.web16m, item.currentUrl), exactRecentRows = exactRowsFor(data.web3m, item.currentUrl);
  const historical = nullableMetrics(exactHistoricalRows), recent = nullableMetrics(exactRecentRows);
  const pathHistorical = metricsFor(data.web16m, item.currentUrl), pathRecent = metricsFor(data.web3m, item.currentUrl);
  const sourceVariants16m = variantsFor(data.web16m, item.currentUrl);
  const canonicalVariants16m = item.existingCanonical && new URL(item.existingCanonical).hostname.endsWith("purebakes.in") ? variantsFor(data.web16m, item.existingCanonical) : [];
  item.searchConsole = { clicks16m: historical.clicks, impressions16m: historical.impressions, ctr16m: historical.ctr, position16m: historical.position, rowPresent16m: exactHistoricalRows.length > 0, clicks3m: recent.clicks, impressions3m: recent.impressions, ctr3m: recent.ctr, position3m: recent.position, rowPresent3m: exactRecentRows.length > 0, pathFamily16m: { ...pathHistorical, exportedRowCount: sourceVariants16m.length }, pathFamily3m: { ...pathRecent, exportedRowCount: variantsFor(data.web3m, item.currentUrl).length }, matchedVariants16m: sourceVariants16m, matchedVariants3m: variantsFor(data.web3m, item.currentUrl), canonicalTargetVariants16m: canonicalVariants16m };
  item.seoValue = { historical: valueBand(pathHistorical), recent: valueBand(pathRecent), trend: trendFor(pathHistorical, pathRecent) };
  if (item.action === "SELF_CANONICALIZE") {
    const targetMetrics = aggregate(canonicalVariants16m);
    if (targetMetrics.clicks > pathHistorical.clicks || targetMetrics.impressions > pathHistorical.impressions * 1.5) {
      item.action = "MANUAL_REVIEW"; item.confidence = "LOW"; item.manualReviewRequired = true; item.recommendedCanonical = null;
      item.reason = "The live source has a broken canonical, but the canonical path has stronger Search Console visibility; preserve both until URL-level history and equivalence are reviewed.";
    } else {
      item.confidence = pathHistorical.impressions > 0 ? "HIGH" : "MEDIUM";
      item.reason = pathHistorical.impressions > 0 ? `The live path family earned ${pathHistorical.clicks} clicks and ${pathHistorical.impressions} impressions while the 404 canonical target has no stronger visibility. Preserve the path and consolidate variants to the recommended canonical convention.` : "The live page has no row in the available Search Console export, but is indexable, internally relevant, and points canonical to a 404. Preserve and self-canonicalize conservatively.";
    }
  }
}
migration.generatedAt = new Date().toISOString(); migration.phase = "1.6"; migration.analyticsAvailable.searchConsole = true;
migration.searchConsoleCoverage = { web16m: data.web16m.coverage, web3m: data.web3m.coverage, image16m: data.image16m.coverage, limitation: "The export labeled Last 16 months contains only the dates available in the property (19 April–11 August 2026). Query exports are global query rows, not query-page pairs." };
await writeFile("seo/url-migration.json", `${JSON.stringify(migration, null, 2)}\n`);

const locations = JSON.parse(await readFile("seo/location-page-audit.json", "utf8"));
for (const page of locations.pages) {
  const historicalRows = variantsFor(data.web16m, page.url), recentRows = variantsFor(data.web3m, page.url), historical = aggregate(historicalRows), recent = aggregate(recentRows); page.searchConsole = historicalRows.length ? { clicks16m: historical.clicks, impressions16m: historical.impressions, ctr16m: historical.ctr, position16m: historical.position, rowPresent16m: true, clicks3m: recentRows.length ? recent.clicks : null, impressions3m: recentRows.length ? recent.impressions : null, ctr3m: recentRows.length ? recent.ctr : null, position3m: recentRows.length ? recent.position : null, rowPresent3m: recentRows.length > 0 } : { clicks16m: null, impressions16m: null, ctr16m: null, position16m: null, rowPresent16m: false, clicks3m: null, impressions3m: null, ctr3m: null, position3m: null, rowPresent3m: false };
  page.trend = trendFor(historical, recent);
  page.seoCategory = historical.clicks >= 2 ? "PROTECT" : historical.impressions >= 50 ? "IMPROVE" : historical.impressions > 0 ? "RETAIN" : page.contentSimilarityRisk === "HIGH" ? "REVIEW" : "RETAIN";
  page.recommendedAction = "SELF_CANONICALIZE"; page.reason = `${page.reason} Search Console classification: ${page.seoCategory}; ${historicalRows.length ? `${historical.clicks} clicks and ${historical.impressions} impressions` : "no exported page row (not proof of zero value)"} in available history.`;
}
locations.generatedAt = new Date().toISOString(); locations.searchConsoleCoverage = migration.searchConsoleCoverage;
await writeFile("seo/location-page-audit.json", `${JSON.stringify(locations, null, 2)}\n`);

const hostStats = (dataset) => Object.fromEntries(["purebakes.in", "www.purebakes.in", "http://purebakes.in"].map((key) => {
  const rows = dataset.pages.filter((row) => key.startsWith("http") ? row.url.startsWith(key) : new URL(row.url).host === key && new URL(row.url).protocol === "https:");
  return [key, { ...aggregate(rows), rankingUrls: rows.length }];
}));
const duplicatedPaths = [...new Set(data.web16m.pages.map((row) => canonicalPath(row.url)))].map((path) => ({ path, variants: data.web16m.pages.filter((row) => canonicalPath(row.url) === path) })).filter((item) => item.variants.length > 1);

const classifyQuery = (query) => {
  const q = query.toLowerCase();
  if (/pure\s*bakes?/.test(q)) return "BRAND";
  if (/class|course|learn|recipe|baking|oven|otg/.test(q)) return "BAKING_CLASSES";
  if (/near me/.test(q)) return "NEAR_ME";
  if (/birthday|wedding|anniversary|engagement|shower|voyage|farewell|smash|reception/.test(q)) return "OCCASION";
  if (/gachibowli|manikonda|kokapet|narsingi|kondapur|madhapur|hyderabad|secunderabad|nagar|hills|district|patancheru|bachupally|tarnaka|mehdipatnam/.test(q)) return "LOCATION";
  if (/spiderman|butterfly|jungle|unicorn|football|cricket|princess|dinosaur|batman|theme/.test(q)) return "THEME";
  if (/chocolate|vanilla|butterscotch|velvet|biscoff|rasmalai|forest|fruit|flavour|flavor/.test(q)) return "FLAVOUR";
  if (/design|gallery|images?|photos?|ideas?/.test(q)) return "GALLERY_DESIGN";
  if (/customi[sz]ed?|custom cake/.test(q)) return "CUSTOM_CAKES";
  return "OTHER";
};
const queries = data.web16m.queries.map((row) => {
  const category = classifyQuery(row.query);
  const dedicatedPageExists = category === "BRAND" || category === "CUSTOM_CAKES" || category === "BAKING_CLASSES" || category === "OCCASION";
  let action = "MONITOR";
  if (row.impressions >= 100 && row.ctr < 0.02 && row.position <= 20) action = dedicatedPageExists ? "OPTIMIZE_EXISTING" : "CREATE_PAGE_LATER";
  else if (category === "THEME" || category === "GALLERY_DESIGN") action = "GALLERY_CONTENT";
  else if (row.position <= 10 && row.impressions >= 25) action = "INTERNAL_LINKING";
  else if (category === "BRAND") action = "NO_ACTION";
  return { ...row, category, likelySearchIntent: { BRAND: "Find PureBakes", CUSTOM_CAKES: "Order a custom cake", NEAR_ME: "Find a nearby cake provider", LOCATION: "Find cakes in a named area", OCCASION: "Find a cake for an event", THEME: "Find a themed cake design", FLAVOUR: "Find a cake by flavour", BAKING_CLASSES: "Learn baking or find a class", GALLERY_DESIGN: "Browse cake inspiration", OTHER: "Ambiguous or unrelated" }[category], existingBestLandingPage: null, dedicatedPageExists, recommendedFutureAction: action, limitation: "The supplied export does not join query to page; landing page cannot be attributed." };
});
await writeFile("seo/search-query-opportunities.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), coverage: data.web16m.coverage, limitation: "Queries.csv is capped at 999 rows and contains no page dimension.", queries }, null, 2)}\n`);

const opportunityRows = data.web16m.pages.map((row) => ({ type: row.impressions >= 100 && row.ctr < 0.02 ? "HIGH_IMPRESSIONS_LOW_CTR" : row.position >= 4 && row.position <= 10 ? "POSITION_4_10" : row.position > 10 && row.position <= 20 ? "POSITION_11_20" : null, source: "PAGE", url: row.url, ...row })).filter((x) => x.type);
for (const row of queries) if (row.impressions >= 50 && (row.ctr < 0.02 || (row.position >= 4 && row.position <= 20))) opportunityRows.push({ type: row.ctr < 0.02 ? "HIGH_IMPRESSIONS_LOW_CTR" : row.position <= 10 ? "POSITION_4_10" : "POSITION_11_20", source: "QUERY", query: row.query, category: row.category, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position });
opportunityRows.sort((a, b) => b.impressions - a.impressions);
await writeFile("seo/seo-opportunities.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), methodology: "Prioritization aid: impressions, CTR, position and intent; not a Google ranking metric.", opportunities: opportunityRows }, null, 2)}\n`);

const highValueMap = new Map();
for (const item of migration.mappings) {
  const s = item.searchConsole.pathFamily16m, r = item.searchConsole.pathFamily3m; let classification = null;
  if (item.currentUrl === "https://purebakes.in/" || s.clicks >= 10 || s.impressions >= 1000) classification = "CRITICAL";
  else if (s.clicks >= 2 || s.impressions >= 100) classification = "HIGH";
  else if (s.clicks > 0 || s.impressions >= 20 || ["occasion", "location", "gallery"].includes(audit.pages.find((p) => canonicalPath(p.finalUrl) === canonicalPath(item.currentUrl))?.pageType)) classification = "MEDIUM";
  if (classification) highValueMap.set(canonicalPath(item.currentUrl), { url: item.currentUrl, classification, clicks16m: s.clicks, impressions16m: s.impressions, clicks3m: r.clicks, impressions3m: r.impressions, source: "live_crawl_and_search_console", reason: classification === "CRITICAL" ? "Core landing page or substantial measured organic visibility." : classification === "HIGH" ? "Meaningful measured clicks/impressions warrant exact-path protection." : "Unique business/search intent or emerging visibility warrants preservation." });
}
for (const row of data.web16m.pages) {
  if (row.clicks < 2 && row.impressions < 100) continue;
  const key = canonicalPath(row.url); if (highValueMap.has(key)) continue;
  const pathHistory = aggregate(data.web16m.pages.filter((x)=>canonicalPath(x.url)===key)), pathRecent = aggregate(data.web3m.pages.filter((x)=>canonicalPath(x.url)===key));
  const classification = pathHistory.clicks >= 10 || pathHistory.impressions >= 1000 ? "CRITICAL" : "HIGH";
  highValueMap.set(key, { url: row.url, classification, clicks16m: pathHistory.clicks, impressions16m: pathHistory.impressions, clicks3m: pathRecent.clicks, impressions3m: pathRecent.impressions, source: "search_console_only_not_in_live_61", reason: "Search Console proves organic value for a URL absent from the crawler’s 61-page migration set; investigate and preserve/redirect deliberately." });
}
const highValue = [...highValueMap.values()];
await writeFile("seo/high-value-urls.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), guardrails: highValue }, null, 2)}\n`);

const imageTotal = aggregate(data.image16m.pages), galleryImageRows = data.image16m.pages.filter((row) => canonicalPath(row.url) === "/gallery"), galleryImage = aggregate(galleryImageRows);
const imageQueries = data.image16m.queries.map((row) => ({ ...row, category: classifyQuery(row.query), opportunity: row.impressions >= 25 && row.ctr < 0.01 ? "HIGH_IMPRESSIONS_LOW_CTR" : row.position <= 20 ? "MONITOR_RANKING" : "MONITOR" }));
await writeFile("seo/image-search-opportunities.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), coverage: data.image16m.coverage, totalsFromExportedPageRows: imageTotal, gallery: { ...galleryImage, variants: galleryImageRows }, topLandingPages: [...data.image16m.pages].sort((a,b)=>b.clicks-a.clicks||b.impressions-a.impressions).slice(0,20), queries: imageQueries }, null, 2)}\n`);

const potential = [...data.web16m.pages.map((row) => ({ url: row.url, type: "existing", ...row })), ...queries.filter((q) => ["THEME","FLAVOUR","OCCASION","LOCATION","BAKING_CLASSES","GALLERY_DESIGN"].includes(q.category)).slice(0,200).map((q) => ({ query: q.query, type: "potential", category: q.category, clicks: q.clicks, impressions: q.impressions, ctr: q.ctr, position: q.position }))];
const priorities = potential.map((item) => {
  const intentBoost = ["LOCATION","OCCASION","CUSTOM_CAKES"].includes(item.category) ? 20 : ["THEME","FLAVOUR","BAKING_CLASSES","GALLERY_DESIGN"].includes(item.category) ? 12 : 5;
  const score = Math.min(100, Math.round(Math.log10(item.impressions + 1) * 18 + Math.log10(item.clicks + 1) * 15 + (item.position <= 10 ? 18 : item.position <= 20 ? 9 : 0) + intentBoost));
  return { ...item, score, tier: score >= 75 ? "P0" : score >= 55 ? "P1" : score >= 35 ? "P2" : "P3" };
}).sort((a,b)=>b.score-a.score);
await writeFile("seo/v2-page-priorities.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), disclaimer: "Internal prioritization aid, not an objective Google ranking metric.", formula: "log-scaled clicks/impressions + position band + inferred business/search intent", priorities }, null, 2)}\n`);

const manual = migration.mappings.filter((item) => item.manualReviewRequired).map((item) => ({ url: item.currentUrl, problem: item.currentUrl.includes("luxury-wedding") ? "Cross-domain canonical" : "Canonical target shows stronger Search Console evidence", availableEvidence: { searchConsole: item.searchConsole, canonical: item.existingCanonical, canonicalStatus: item.canonicalStatus }, possibleOptionA: `Self-canonicalize ${item.currentUrl}`, possibleOptionB: `Preserve/migrate canonical relationship to ${item.existingCanonical}`, recommendation: "Preserve current live URL pending owner review.", whyManualDecisionIsNeeded: "Ownership/content intent or competing measured URL signals cannot be inferred safely." }));
await writeFile("seo/manual-review-required.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), items: manual }, null, 2)}\n`);

const summary = { coverage: Object.fromEntries(Object.entries(data).map(([key,value])=>[key,value.coverage])), totals: { web16m: aggregate(data.web16m.pages), web3m: aggregate(data.web3m.pages), image16m: imageTotal }, hosts16m: hostStats(data.web16m), hosts3m: hostStats(data.web3m), duplicatedPaths, actions: migration.mappings.reduce((out,item)=>(out[item.action]=(out[item.action]||0)+1,out),{}), locationCategories: locations.pages.reduce((out,item)=>(out[item.seoCategory]=(out[item.seoCategory]||0)+1,out),{}), highValueCounts: highValue.reduce((out,item)=>(out[item.classification]=(out[item.classification]||0)+1,out),{}), topPages: [...data.web16m.pages].sort((a,b)=>b.clicks-a.clicks||b.impressions-a.impressions).slice(0,10), topNonBrandQueries: queries.filter((q)=>q.category!=="BRAND").sort((a,b)=>b.clicks-a.clicks||b.impressions-a.impressions).slice(0,20), topOpportunities: opportunityRows.slice(0,10), image: { total: imageTotal, gallery: galleryImage, topPages: [...data.image16m.pages].sort((a,b)=>b.clicks-a.clicks||b.impressions-a.impressions).slice(0,10) } };
await writeFile("seo/search-console-summary.json", `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
