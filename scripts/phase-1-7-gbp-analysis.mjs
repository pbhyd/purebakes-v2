import { readFile, writeFile } from "node:fs/promises";

const performanceFile = "seo/input/google-business-profile/performance/GMB insights (Performance Report) - 2025-2-14 - 2026-8-10 - 4c653c40589fc07ec42b31a054322dd0.csv";
const profileFile = "seo/input/google-business-profile/profile/Ungrouped locations-20260813-182007-4c40390bf6ee90de3a8eb3f00f5f72ae.csv";

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
  return rows.filter((values) => values.some((value) => value !== ""));
}
const perfRows = parseCsv(await readFile(performanceFile, "utf8"));
const profileRows = parseCsv(await readFile(profileFile, "utf8"));
const perfHeaders = perfRows[0], perfDescriptions = perfRows[1], perfData = perfRows.slice(2);
const profileHeaders = profileRows[0], profileData = profileRows.slice(1);
if (perfData.length !== 1 || profileData.length !== 1) throw new Error(`Expected one business row per export; got performance=${perfData.length}, profile=${profileData.length}`);
const object = (headers, values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
const perf = object(perfHeaders, perfData[0]), profile = object(profileHeaders, profileData[0]);
const n = (key) => perf[key] === "" ? null : Number(perf[key]);
const searchMobile = n("Google Search – Mobile"), searchDesktop = n("Google Search – Desktop"), mapsMobile = n("Google Maps – Mobile"), mapsDesktop = n("Google Maps – Desktop");
const searchViews = searchMobile + searchDesktop, mapsViews = mapsMobile + mapsDesktop, mobileViews = searchMobile + mapsMobile, desktopViews = searchDesktop + mapsDesktop, totalViews = mobileViews + desktopViews;
const interactions = { calls: n("Calls"), messages: n("Messages"), bookings: n("Bookings"), directions: n("Directions"), websiteClicks: n("Website clicks"), foodOrders: n("Food orders"), foodMenuClicks: n("Food menu clicks"), hotelBookings: n("Hotel bookings") };
const hours = Object.fromEntries(["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day) => [day.toLowerCase(), profile[`${day} hours`] || null]));
const facts = {
  shopCode: profile["Shop code"], status: profile.Status, businessName: profile["Business name"],
  address: { line1: profile["Address line 1"], locality: profile.Locality, administrativeArea: profile["Administrative area"], country: profile["Country/Region"], postcode: profile.Postcode },
  primaryPhone: profile["Primary phone"], additionalPhones: profile["Additional phones"] || null, website: profile.Website,
  primaryCategory: profile["Primary category"], additionalCategories: profile["Additional categories"].split(",").filter(Boolean), hours,
  description: profile["From the business"], openingDate: profile["Opening date"],
  social: { facebook: profile["Place page URLs: Facebook (url_facebook)"] || null, instagram: profile["Place page URLs: Instagram (url_instagram)"] || null, youtube: profile["Place page URLs: YouTube (url_youtube)"] || null },
  links: { menuOrServices: profile["Place page URLs: Menu or services link (url_menu)"] || null, orderAhead: profile["Place page URLs: Order ahead links (url_order_ahead)"] || null, texting: profile["Place page URLs: Texting number (url_text_messaging)"] || null, whatsapp: profile["Place page URLs: WhatsApp (url_whatsapp)"] || null },
  attributes: {
    womenOwned: profile["From the business: Identifies as women-owned (is_owned_by_women)"] || null,
    appointmentRequired: profile["Planning: Appointment required (requires_appointments)"] || null,
    delivery: profile["Service options: Delivery (has_delivery)"] || null,
    dineIn: profile["Service options: Dine-in (serves_dine_in)"] || null,
    inStorePickup: profile["Service options: In-store pick-up (has_in_store_pickup)"] || null,
    inStoreShopping: profile["Service options: In-store shopping (has_in_store_shopping)"] || null,
    curbsidePickup: profile["Service options: Kerbside pickup (has_curbside_pickup)"] || null,
    onsiteServices: profile["Service options: On-site services (has_onsite_services)"] || null,
    takeaway: profile["Service options: Takeaway (has_takeout)"] || null
  }
};
const factClassifications = [
  { field: "status/shopCode", classification: "USE_AS_AUTHORITATIVE_FACT", value: `${facts.status}; ${facts.shopCode}` },
  { field: "address", classification: "USE_WITH_REVIEW", value: facts.address, reason: "Use as the actual Manikonda contact/pickup location only after owner confirms public display and pickup details; never imply 41 branches." },
  { field: "phone", classification: "USE_AS_AUTHORITATIVE_FACT", value: facts.primaryPhone },
  { field: "website", classification: "USE_WITH_REVIEW", value: facts.website, reason: "Current GBP uses WWW; change to the approved non-WWW production canonical only at cutover." },
  { field: "categories", classification: "USE_AS_AUTHORITATIVE_FACT", value: [facts.primaryCategory, ...facts.additionalCategories] },
  { field: "hours", classification: "USE_WITH_REVIEW", value: facts.hours, reason: "GBP says 09:00–22:00 daily; current website audit stated 09:00–21:00." },
  { field: "businessName", classification: "WEBSITE_PRESENTATION_SHOULD_DIFFER", value: facts.businessName, reason: "Keep PureBakes as the brand; do not carry the keyword-heavy 'Homemade...' GBP title into website headings." },
  { field: "description", classification: "USE_WITH_REVIEW", value: facts.description, reason: "Premium studio wording aligns; superlatives, FSSAI, all-cake eggless availability, ingredient, delivery and response-time claims require owner evidence." },
  { field: "whatsappLinks", classification: "OWNER_REVIEW_REQUIRED", value: [facts.links.orderAhead, facts.links.whatsapp], reason: "The order-ahead link omits the country code (9980213333); the WhatsApp link uses E.164 digits (919980213333). They appear to represent the same local number, but owner confirmation is required before centralization." },
  { field: "serviceOptions", classification: "USE_WITH_REVIEW", value: facts.attributes, reason: "Translate exact GBP Yes/No attributes only after confirming customer-facing pickup/delivery process." },
  { field: "social", classification: "USE_AS_AUTHORITATIVE_FACT", value: facts.social }
];
const sourceFiles = [
  { role: "GBP_PERFORMANCE", filename: performanceFile, fileType: "CSV", rows: perfData.length, columns: perfHeaders.length, fields: perfHeaders, dateCoverage: { start: "2025-02-14", end: "2026-08-10", basis: "export filename; source has one aggregate row and no date column" } },
  { role: "GBP_PROFILE_INFORMATION", filename: profileFile, fileType: "CSV", rows: profileData.length, columns: profileHeaders.length, fields: profileHeaders, dateCoverage: null }
];
const analysis = {
  generatedAt: new Date().toISOString(), sourceFiles,
  dateCoverage: sourceFiles[0].dateCoverage,
  performance: { search: { mobile: searchMobile, desktop: searchDesktop, total: searchViews }, maps: { mobile: mapsMobile, desktop: mapsDesktop, total: mapsViews }, totalViews },
  deviceDistribution: { mobileViews, desktopViews, totalViews, mobilePercentage: mobileViews / totalViews, desktopPercentage: desktopViews / totalViews },
  interactions,
  interactionRates: Object.fromEntries(Object.entries(interactions).map(([key, value]) => [key, value == null ? null : value / totalViews])),
  profileFacts: facts, factClassifications,
  consistencyIssues: [
    { issue: "GBP website host differs from approved convention", current: facts.website, recommendedFuture: "https://purebakes.in/", actionTiming: "production cutover only; never point GBP to staging" },
    { issue: "Inconsistent WhatsApp URL formats", current: [facts.links.orderAhead, facts.links.whatsapp], recommendedFuture: "Owner-confirm the number; store 919980213333 once and generate all wa.me URLs programmatically." },
    { issue: "Hours conflict", current: { gbp: facts.hours, currentWebsiteAudit: "09:00–21:00 daily" }, recommendedFuture: "Owner-confirm before centralizing." },
    { issue: "Keyword-heavy GBP name", current: facts.businessName, recommendedFuture: "Website brand name PureBakes; premium custom cake studio positioning. GBP naming compliance/changes require separate owner review." },
    { issue: "Address versus service-area pages", current: facts.address, recommendedFuture: "Treat Manikonda as the single configured location; location pages describe service/delivery areas, not branches." }
  ],
  localSeoImplications: ["Keep all 41 location pages in scope.", "Prioritize the 5 PROTECT and 6 IMPROVE pages.", "Do not imply physical branches outside the configured Manikonda address.", "Preserve non-WWW production host and update GBP website only after cutover."],
  mobileImplications: ["Design mobile-first at 320–430px.", "Prioritize real cake photography, concise premium value, gallery discovery and WhatsApp.", "Keep tap targets large and avoid heavy map embeds/overloaded hero content.", "Test call, directions, website and WhatsApp journeys on mobile."],
  ownerReviewItems: ["Confirm canonical WhatsApp number.", "Confirm public phone and operating hours.", "Confirm address/pickup wording and delivery/service areas.", "Provide current Google rating, review count and review URL.", "Validate FSSAI/certification and all service/ingredient claims before schema or copy use.", "Decide wedding-domain relationship."]
};
await writeFile("seo/google-business-profile-analysis.json", `${JSON.stringify(analysis, null, 2)}\n`);

const priorities = JSON.parse(await readFile("seo/v2-page-priorities.json", "utf8"));
priorities.gbpEvidence = { source: performanceFile, mobileShare: analysis.deviceDistribution.mobilePercentage, mapsViews, calls: interactions.calls, directions: interactions.directions, websiteClicks: interactions.websiteClicks, application: "Evidence layer only; Search Console scores/reasoning preserved." };
priorities.phase17Adjustments = [
  { scope: "all_41_location_pages", adjustment: "KEEP_IN_SCOPE", reason: "GBP confirms strong local Search/Maps discovery; no branch implication." },
  { scope: "location_PROTECT_and_IMPROVE", adjustment: "CONTENT_PRIORITY", reason: "Search Console priority reinforced by 67,146 GBP views and 1,630 direction requests." },
  { scope: "/classes/", adjustment: "P0_GUARDRAIL", reason: "Search Console asset; GBP description independently confirms Telugu online/offline baking classes." },
  { scope: "mobile_experience", adjustment: "HARD_REQUIREMENT", reason: `${(analysis.deviceDistribution.mobilePercentage * 100).toFixed(1)}% of GBP views were mobile.` }
];
for (const item of priorities.priorities) {
  const target = `${item.url || ""} ${item.query || ""}`.toLowerCase();
  if (target.includes("classes") || target.includes("baking class")) { item.gbpLocalEvidence = "GBP profile explicitly offers online/offline Telugu baking classes."; if (item.tier !== "P0") item.tier = "P0"; }
  if (target.includes("customized-cakes-") || item.category === "LOCATION") item.gbpLocalEvidence = "GBP local discovery supports retaining service-area content; does not prove a branch.";
}
priorities.generatedAt = new Date().toISOString();
await writeFile("seo/v2-page-priorities.json", `${JSON.stringify(priorities, null, 2)}\n`);
console.log(JSON.stringify({ files: sourceFiles.map(({ role, filename, fileType, rows, columns, dateCoverage }) => ({ role, filename, fileType, rows, columns, dateCoverage })), performance: analysis.performance, deviceDistribution: analysis.deviceDistribution, interactions, profile: facts }, null, 2));
