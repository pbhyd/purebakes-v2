# PureBakes V2 — Phase 1.7 local SEO and premium-brand validation

Audit date: 13 August 2026. Analysis only. No production, GBP, DNS, URL, canonical, content, image, Eleventy or deployment change was made.

## 1. Source files analyzed

Both required exports parsed successfully.

| Role | Source | Type | Data rows | Fields | Coverage |
|---|---|---:|---:|---:|---|
| GBP Performance | `GMB insights (Performance Report) - 2025-2-14 - 2026-8-10 - 4c653c40589fc07ec42b31a054322dd0.csv` | CSV | 1 | 16 | 2025-02-14–2026-08-10, from filename; aggregate row has no date column |
| GBP Profile Information | `Ungrouped locations-20260813-182007-4c40390bf6ee90de3a8eb3f00f5f72ae.csv` | CSV | 1 | 86 | Snapshot export; no coverage period |

The machine-readable source inventory, fields and calculations are in `seo/google-business-profile-analysis.json`.

## 2. GBP performance summary

| Channel/device | Views | Share of channel |
|---|---:|---:|
| Google Search — mobile | 48,306 | 90.46% of Search |
| Google Search — desktop | 5,092 | 9.54% of Search |
| Google Maps — mobile | 13,172 | 95.81% of Maps |
| Google Maps — desktop | 576 | 4.19% of Maps |
| Search total | 53,398 | 79.52% of all views |
| Maps total | 13,748 | 20.48% of all views |
| All views | 67,146 | 100% |

Mobile generated 61,478 views (91.56%); desktop generated 5,668 (8.44%). This decisively validates mobile-first as a hard requirement, not a styling preference.

## 3. GBP conversion behaviour

| Interaction | Count | Rate per profile view |
|---|---:|---:|
| Direction requests | 1,630 | 2.43% |
| Calls | 946 | 1.41% |
| Website clicks | 377 | 0.56% |
| Food/menu clicks | 135 | 0.20% |
| Messages | 0 | 0% |
| Bookings | 0 | 0% |
| Food orders | 0 | 0% |

Directions and calls exceed website clicks, proving that GBP is an independent local conversion surface. V2 should complement it: visitors who do reach the site need immediate portfolio discovery, a clear WhatsApp path, tap-to-call, and a lightweight Maps link. Zero GBP messages/bookings does not mean there were no WhatsApp conversions; those are separate links and are not represented by these fields.

## 4. GBP profile facts and classification

- Published listing; shop code `07990579187228755015`.
- Configured name: “Pure Bakes - Homemade Customised Cakes | Wedding Cakes | First Birthday Cakes | Engagement Cakes | Trending Cakes”. Classification: `WEBSITE_PRESENTATION_SHOULD_DIFFER`. Use `PureBakes` prominently on the site; do not copy this keyword-heavy name into the header/H1.
- Primary category: Bakery. Additional categories: Cake shop, Patisserie, Cupcake shop, Dessert shop, Wedding cake shop, Chocolate artisan. Classification: `USE_AS_AUTHORITATIVE_FACT` for internal factual data; schema types still must match visible site content.
- Configured address: Nest Apartment, Sri Laxmi Nagar Colony, Manikonda, Hyderabad, Telangana 500089, India. Classification: `USE_WITH_REVIEW` because the owner must confirm public address and pickup wording.
- Phone: `099802 13333`. Classification: `USE_AS_AUTHORITATIVE_FACT`, normalized only after owner confirmation.
- Hours: 09:00–22:00 every day. Classification: `USE_WITH_REVIEW`; the current website audit says 09:00–21:00.
- Website: `https://www.purebakes.in/`. Classification: `USE_WITH_REVIEW`; update to `https://purebakes.in/` only at production cutover.
- Women-owned: Yes. Delivery, in-store pickup, kerbside pickup and takeaway: Yes. Classification: `USE_WITH_REVIEW` before prominent copy/schema.
- Social profiles: Facebook, Instagram and YouTube URLs are configured and can be centralized.
- Description already calls PureBakes a “luxury custom cake studio,” aligning with V2. Claims concerning every cake being egg/eggless, FSSAI, ingredient quality, leading classes, two-hour replies and AC-cab delivery require owner verification before use.

## 5. Data consistency issues

1. GBP uses WWW; the approved production convention is non-WWW HTTPS.
2. GBP’s order-ahead URL is `wa.me/9980213333`, while its WhatsApp URL is `wa.me/919980213333`. They appear to encode the same number, but only the latter is valid E.164-style formatting.
3. GBP hours (to 22:00) conflict with the current website (to 21:00).
4. The GBP name leads with “Homemade”, while the approved website position is premium custom cake studio.
5. One configured Manikonda location must not be turned into fictitious branches on 41 service-area pages.
6. The profile has no supplied review/rating export; rating and review count cannot be stated from these files.

## 6. Premium brand implications

Primary position: **Premium custom cake studio in Hyderabad**. “Luxury Custom Cakes in Hyderabad” is an SEO-safe H1 direction; the supporting promise should emphasize bespoke design, celebration, personalization and made-to-order service. “Home baker” may remain naturally in lower supporting/history content because Search Console proves demand, but it must not lead the hero, navigation, title system or visual identity.

Premium should be conveyed through real cake photography, editorial serif headings, disciplined sans-serif body type, warm ivory/cream/cocoa/charcoal colors, whitespace, restrained motion and clear service—not repetitive luxury claims. Avoid promotional clutter, generic bakery icons, dominant pink, discount language and home-bakery stereotypes.

## 7. Mobile-first implications

At 91.56% mobile GBP visibility, Phase 2 must begin at 320, 360, 375, 390 and 430px. The first viewport should contain a compact header, one real premium cake image, concise H1/value proposition, Explore Cake Designs, WhatsApp, and one accurate trust signal. It should not contain long SEO text, six badges or a heavy Maps iframe.

Mobile requirements include 44px-class tap targets, keyboard-accessible menu/filters/viewer, two-column gallery only when thumbnails remain legible, progressive rendering, responsive dimensions, no LCP lazy loading, limited third-party scripts, stable CTA placement and explicit testing of call, directions, website and WhatsApp journeys.

## 8. Homepage positioning

Recommended H1: **Luxury Custom Cakes in Hyderabad**.

Supporting direction: “Bespoke cakes designed around your celebration, freshly made to order in Hyderabad.” Use owner-verified wording before publication.

Mobile sequence: compact header → hero photography/H1/two CTAs → accurate Google trust → popular portfolio → occasions → themes → differentiators → ordering → recent cakes → flavours → genuine reviews → locations → lower SEO content → final WhatsApp CTA.

## 9. Location SEO strategy

All 41 pages remain in V2 scope: 5 `PROTECT`, 6 `IMPROVE`, 30 `RETAIN`, 0 `REVIEW`. GBP’s 13,748 Maps views and 1,630 direction requests reinforce local importance but do not attribute performance to individual service areas; Search Console remains the page-level evidence.

PROTECT and IMPROVE pages receive first editorial attention. Use “Premium Custom Cakes for Celebrations in Kokapet” or similar, while explicitly describing delivery/service rather than a store. Each page needs useful local copy, real cakes, occasion/theme links, actual ordering/delivery/pickup information, nearby areas, FAQs where useful, and WhatsApp. Never emit branch-specific LocalBusiness entities for service pages.

## 10. Google Reviews strategy

Plan one refined review module using a small owner-curated JSON dataset of genuine reviews. Store reviewer display name, excerpt, source URL and review date; keep current rating/count separately with an as-of date. Show rating/count only after obtaining a current authoritative source. Track `google_reviews_click`. Do not scrape or fabricate reviews and do not output aggregate-rating schema without factual, visible evidence.

## 11. Google Maps strategy

Centralize the actual listing/Maps URL after owner provides or confirms it. Use lightweight contextual “Directions”/“View on Google Maps” links and track `google_maps_click`; do not put a heavy iframe above the fold. Directions should lead to the single configured Manikonda location, not a location landing-page area.

## 12. Proposed `business.json`

```json
{
  "name": "PureBakes",
  "positioning": "Premium Custom Cake Studio",
  "city": "Hyderabad",
  "website": "https://purebakes.in/",
  "phone": { "display": "+91 99802 13333", "e164": "+919980213333" },
  "whatsapp": { "number": "919980213333" },
  "hours": { "timezone": "Asia/Kolkata", "weekly": {} },
  "location": { "address": {}, "mapsUrl": "", "pickup": {} },
  "serviceAreas": [],
  "categories": [],
  "services": [],
  "delivery": {},
  "social": { "facebook": "", "instagram": "", "youtube": "" },
  "certifications": []
}
```

This is a proposed shape, not an implemented file. Phone, hours, pickup, service areas, Maps URL, services and certifications remain owner-confirmation fields. Keep brand/editorial copy outside this factual object.

## 13. WhatsApp configuration

Owner-confirm `+91 99802 13333`; then store only digits `919980213333` centrally and generate `https://wa.me/919980213333?text=...` with URL-encoded contextual messages. Never duplicate hardcoded links. Track `whatsapp_click`; do not double-fire `check_availability` for the same click.

## 14. Structured data

Use one factual site-wide `Bakery`/`LocalBusiness` entity for the actual business and Manikonda location, with owner-confirmed phone, address, hours, service area, URLs and attributes. Use `BreadcrumbList` on deep pages, `FAQPage` only for visible FAQs, and `ImageObject` for real portfolio images. Do not fabricate branches, reviews, ratings, prices or offers; location pages should reference the primary business/service area, not create separate businesses.

## 15. `/classes/`, `/cakes/`, and `/products/`

- `/classes/`: P0 preserve/launch guardrail. Search Console showed 60 clicks/1,428 impressions on WWW `/classes`; GBP independently states online/offline Telugu classes. Build a premium Learn/classes destination and use one-hop host normalization—never redirect it to home.
- `/cakes/`: preserve as a Cake Discovery Hub linking occasions, themes, flavours, styles and portfolio. Search Console proved measurable legacy value.
- `/products/`: preserve as an Offerings/Product Hub compatible with legacy intent. Clarify its relationship to cakes/classes and do not redirect/remove without page/query evidence.

## 16. Gallery and image SEO

Position gallery as **Explore Our Cake Portfolio**, not an image dump. Preserve 472 unique cake paths, captions, useful alt text and categories. On mobile, prioritize fast thumbnails, strong search, simple filters, large targets, progressive loading and an accessible detail viewer.

Image Search showed 5,367 exported page-row impressions but only two clicks; gallery variants had 745 impressions and zero clicks. Future gains should come from preserved source URLs/captions, accurate alt, surrounding semantics, reviewed taxonomy pages, image sitemap, responsive derivatives and dimensions. Do not rename existing assets.

## 17. Acquisition and conversion model

Organic website: Google Search → SEO landing page → cake discovery → portfolio/theme/occasion → WhatsApp.

Local Google: Search/Maps → GBP → call/directions/website. The website complements, rather than replaces, GBP. Primary website conversion remains `whatsapp_click`; secondary events are `check_availability`, `phone_click`, `google_maps_click`, and `google_reviews_click`.

## 18. Phase 2 guardrails

- Brand: Premium/Luxury Custom Cake Studio
- Market: Hyderabad
- Primary device: Mobile
- Approach: Mobile-first, not desktop-first responsive
- Discovery: Google Search + Google Maps + Gallery
- Conversion: WhatsApp
- Visual asset: Real PureBakes photography and official owner logo
- SEO assets: ranking URLs, 41 location pages, gallery, `/classes/`, `/cakes/`, `/products/`
- Visual direction: editorial, elegant, minimal, photography-first
- Avoid: generic home-bakery aesthetic, fake branches, clutter and discount-led positioning

## 19. Remaining owner decisions

1. Confirm WhatsApp/phone number and correct order-ahead URL.
2. Resolve 21:00 versus 22:00 business hours.
3. Confirm whether/how the Manikonda address and pickup options should be displayed.
4. Confirm delivery/service areas and exact service-option wording.
5. Provide current Google rating, review count, review URL and selected genuine reviews.
6. Verify FSSAI, egg/eggless, ingredients, response-time, AC-delivery and “leading classes” claims.
7. Decide the relationship with `weddingcakeshyderabad.in`.
8. Confirm Phase 2 roles for `/products/` and legacy catalog URLs.

## 20. Exact Phase 2 prerequisites

Approve the positioning/mobile guardrails and URL roles; answer the eight owner decisions above; supply the official logo and approved hero-photo candidates; preserve the Phase 1.6 migration/high-value tables as launch gates; and confirm that staging remains `noindex,nofollow` at `new.purebakes.in`. Only then should Eleventy foundation work begin.
