import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd(); const output = path.join(root, "_site");
const files = [];
async function walk(directory) { for (const entry of await readdir(directory, { withFileTypes: true })) { const file = path.join(directory, entry.name); if (entry.isDirectory()) await walk(file); else if (entry.name.endsWith(".html")) files.push(file); } }
await walk(output);

const violations = []; let structuredManikonda = 0; let exactAddressExposure = 0; let visibleMarrichettu = 0;
for (const file of files) {
  const html = await readFile(file, "utf8"); const relative = path.relative(output, file);
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
  for (const json of scripts) { if (/"addressLocality"\s*:\s*"Manikonda"/i.test(json)) structuredManikonda++; if (/streetAddress|"geo"\s*:|postalCode/i.test(json)) exactAddressExposure++; }
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  if (/marrichettu/i.test(visible)) visibleMarrichettu++;
  const positioningPatterns = [/(?:pickup|studio|based|made|collect(?:ion)?)[^.]{0,60}Manikonda/i, /Manikonda[^.]{0,60}(?:pickup|studio|handover)/i];
  for (const pattern of positioningPatterns) if (pattern.test(visible)) violations.push({ page: relative, pattern: pattern.source });
}

assert.equal(violations.length, 0, `Customer-facing Manikonda positioning remains: ${JSON.stringify(violations)}`);
assert.equal(visibleMarrichettu, 0, "Marrichettu remains in generated customer-facing content");
assert.equal(exactAddressExposure, 0, "Precise address or geo fields are publicly exposed");
assert.equal(structuredManikonda, files.length, "Expected one preserved locality-only LocalBusiness entity on every generated page");

const audit = {
  generatedAt: new Date().toISOString(),
  methodology: "Source contexts were classified before rewriting; generated visible text and JSON-LD were validated after rewriting.",
  before: { customerFacingMarketingContexts: 163, breakdown: { locationDataFieldsAndFaqAnswers: 148, sharedTemplatesAndBusinessData: 15 } },
  after: { prohibitedCustomerFacingManikondaPositioning: violations.length, visibleMarrichettuOccurrences: visibleMarrichettu, exactPrivateAddressFields: exactAddressExposure, justifiedManikondaLocalityIdentity: "Preserved on the canonical Manikonda service-area page, nearby-area links, its service-area map pin, and locality-only LocalBusiness JSON-LD." },
  discoveries: [
    { source: "src/_data/seo-pages/locations.json", context: "41 descriptions, service contexts, three introductions and location FAQ answers", classification: "customer-facing", occurrenceContexts: 148, action: "rewritten", reason: "Lead with locality service and conditional cab assistance rather than pickup geography." },
    { source: "src/index.njk", context: "Experience, Hyderabad service and SEO copy sections", classification: "customer-facing", occurrenceContexts: 3, action: "rewritten", reason: "Homepage now leads with Hyderabad-wide service." },
    { source: "src/areas-we-serve/index.njk + src/assets/js/areas-map.js", context: "Metadata, intro, legend, pickup card, directory framing and Manikonda popup", classification: "customer-facing", occurrenceContexts: 6, action: "rewritten", reason: "All pins now mean service areas; public pickup marker and landmark removed." },
    { source: "src/faq/index.njk + src/_data/business.json", context: "Pickup and service-area answers consumed by FAQ/footer", classification: "customer-facing", occurrenceContexts: 2, action: "rewritten", reason: "Pickup details are coordinated privately; service coverage is Hyderabad-wide." },
    { source: "src/seo-location-pages.njk", context: "Ordering and service-information sections", classification: "customer-facing", occurrenceContexts: 2, action: "rewritten", reason: "Shared location template no longer advertises pickup geography." },
    { source: "src/terms-and-conditions/index.njk", context: "Metadata and pickup/cab policy", classification: "customer-facing", occurrenceContexts: 2, action: "rewritten", reason: "Preserve payment and transport policy without public pickup locality." },
    { source: "src/_includes/layouts/base.njk", context: "LocalBusiness PostalAddress.addressLocality", classification: "structured-data", occurrenceContexts: 1, action: "preserved", reason: "Locality-only entity identity is technically valid, exposes no exact address or geo, and may support GBP consistency." },
    { source: "src/_data/business.json", context: "pickup.locality", classification: "technical", occurrenceContexts: 1, action: "preserved", reason: "Internal verified business locality; display string was separately rewritten." },
    { source: "src/_data/locationCoordinates.json", context: "Manikonda locality and Puppalaguda source notes", classification: "internal-only", occurrenceContexts: 2, action: "preserved", reason: "Coordinate provenance; no private location and not rendered as pickup information." },
    { source: "docs/, seo/ and scripts/", context: "Historical audits, validation and maintenance documentation", classification: "internal-only", action: "preserved-or-updated", reason: "Internal evidence may legitimately describe the previous state." }
  ],
  structuredData: { type: ["Bakery", "LocalBusiness"], address: { addressLocality: "Manikonda", addressRegion: "Telangana", addressCountry: "IN" }, exactStreetAddress: false, geo: false, telephone: "+919980213333", serviceArea: null, url: "https://purebakes.in/", decision: "Preserved pending owner/GBP consistency review." }
};
await writeFile(path.join(root, "seo/public-location-positioning-audit.json"), `${JSON.stringify(audit, null, 2)}\n`);
console.log(`Positioning validation passed across ${files.length} HTML files: 0 prohibited Manikonda marketing, 0 visible Marrichettu, ${structuredManikonda} locality-only schema occurrences preserved.`);
