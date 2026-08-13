# PureBakes V2 — Phase 1.5 SEO validation

Audit date: 13 August 2026. This phase made no production, DNS, sitemap, redirect, content, image or deployment changes.

## Executive summary

Sixty-one live URLs were evaluated. Fifty-four live pages canonicalize to confirmed 404 targets; their provisional action is `SELF_CANONICALIZE` with medium confidence because traffic exports are absent. Six pages are already suitable crawler-level `KEEP` decisions. The wedding page is the sole manual-review case because it canonicalizes across domains to `weddingcakeshyderabad.in`.

No redirect, merge or removal is justified without Search Console/GA4 evidence. All current live URLs should remain available through Phase 2 planning.

## Analytics data available

No Search Console, GA4, CSV, Excel or separate analytics JSON export was present. Every unavailable metric is recorded as `null`, never zero.

## Analytics data missing

Required before final canonical approval:

1. Search Console Performance → Search results, type Web, exported by **Page** for last 16 months and last 3 months: Page, Clicks, Impressions, CTR, Position.
2. The same Search Console periods exported by **Query and Page**, if the interface/API permits: Query, Page, Clicks, Impressions, CTR, Position.
3. Search Console Search type **Image**, by Page and preferably Query, for the same periods.
4. GA4 Landing page report filtered to Session default channel group = Organic Search, preferably last 16 months and last 3 months: Landing page + query string, Sessions, Total users, Engaged sessions, Engagement rate, Key events.
5. Optional but valuable: external backlink export for both `purebakes.in` and `weddingcakeshyderabad.in`.

Exports must retain full URL/path values. Missing conversions are acceptable and must remain null.

## Canonical problems

Fifty-four live pages point to confirmed 404 canonical targets. This violates the core requirement that an indexable page must not intentionally canonicalize to an error URL. Twenty-eight of these targets were already represented in the Phase 1 crawl; the remainder were checked directly during Phase 1.5.

## Recommended self-canonicalizations

The 54 affected same-domain pages are provisionally recommended to retain their current live URL and use that URL as canonical. Confidence is `MEDIUM`, not high, because clicks, impressions, landing sessions and backlinks have not yet been supplied. The complete list is in `seo/dead-canonical-targets.json` and `seo/url-migration.json`.

## Redirect and merge candidates

There are zero supported redirect candidates and zero supported merge candidates. A cleaner slug is not sufficient evidence. The 404 canonical aliases should not automatically be restored or redirected until traffic/history data is checked.

## Manual review cases

One case requires owner review: `/luxury-wedding-cakes-hyderabad/` canonicalizes to the separate `weddingcakeshyderabad.in` domain. Confirm ownership and the intended division of search intent, then compare Search Console and backlink value for both domains.

## Location page findings

Forty-one live location pages were analyzed; 27 are in the sitemap and 14 are omitted. All 41 remain business-relevant and none should be removed merely for sitemap omission. Every location page currently points to a confirmed 404 `cake-delivery-{location}` canonical, so all receive a provisional `SELF_CANONICALIZE` recommendation.

Template-normalized five-word-shingle comparison marked all 41 as low duplication risk under the defined threshold. This indicates substantial sentence variation after location boilerplate is removed; it does not prove every claim is unique or useful. Each page still needs editorial/claim review before V2 migration. Method and nearest-pair scores are in `seo/location-page-audit.json`.

## Occasion findings

Twelve live occasion pages were found: anniversary, baby announcement, baby shower/Srimantham, birthday, bon voyage/farewell, bridal shower, cake smash, engagement, first birthday for boys, first birthday for girls, half birthday and wedding. Eleven point to same-domain 404 canonicals and are provisional self-canonicalization cases. Wedding is the cross-domain manual-review case. Their current gallery relationships are visible in the gallery’s category labels and should be preserved.

## Theme findings

No standalone theme-specific landing pages were found among the 61 live URLs. Themes exist only in gallery captions/filenames and general page content. Later V2 theme URLs can therefore be additive, but only after Search Console query exports are checked for unlisted/historical theme URLs and inventory is manually validated.

## Flavour findings

No true flavour-specific landing page was found. `/eggless-cakes-hyderabad/` is dietary/availability content, not a flavour page. Mentions such as chocolate, red velvet and rasmalai in gallery captions do not prove the photographed cake’s flavour and must not be converted automatically into flavour metadata.

## Sitemap strategy

V2 must generate absolute `<loc>` URLs using the active production host, include only published/indexable self-canonical pages, exclude query/filter states and staging URLs, and use content-derived `lastmod`. It must include every owner-approved location and occasion page plus approved additive taxonomy pages. Staging remains `noindex,nofollow` and its sitemap is not submitted. Implementation is deferred.

## Internal-link problems

There are 374 source-target issue occurrences: 166 links resolve to 404 and 208 point to live pages that declare a different canonical. Counts are occurrences across source pages, not unique broken targets. V2 navigation and contextual links must point directly to the approved canonical live URL. Details are in `seo/internal-link-issues.json`.

## 404 classification

All 189 discovered 404 URLs were classified: 27 appeared as canonical targets in the capped Phase 1 graph and 162 as old/broken internal-link targets. Direct Phase 1.5 checks confirmed 54 unique live-source canonical failures in total. Analytics fields remain null. No 404 is automatically approved for restoration or redirect.

## Image URL findings

The live-page inventory contains 615 unique image URLs. The gallery page contains 473 unique image URLs: 472 cake images plus one logo. Existing `/img/...` paths should remain available; optimization should create derivatives without replacing indexed originals until image Search Console evidence is reviewed. See `seo/image-url-inventory.json`.

## Gallery count explanation

There are 476 server-rendered cake cards but 472 unique cake URLs due to three duplicate image groups accounting for four repeated references. Adding the logo produces the previously reported 473 unique gallery-page URLs. No pagination or dynamic image fetch was found. Full details are in `seo/gallery-image-count-analysis.md`.

## Taxonomy gaps

Image path, caption, alt and existing category can be preserved exactly. Occasion can often migrate directly. Themes, styles and tier count can be proposed from explicit wording but require review. Flavour, dietary status, ambiguous audience and visual-only interpretations require owner validation. See `seo/taxonomy-gap-analysis.md`.

## Risks before Phase 2

- Final canonical preference is not traffic-validated.
- The wedding cross-domain intent is unresolved.
- Sitemap omissions could hide valuable location landing pages.
- Broken internal links currently reinforce dead aliases.
- Search Console Image evidence is absent, so image moves remain unsafe.
- Gallery taxonomy inference could create inaccurate or competing pages.

## Recommended Phase 2 preconditions

1. Supply the Search Console and GA4 exports listed above.
2. Decide the wedding-domain relationship after reviewing both properties.
3. Approve the evidence-enriched URL table after traffic fields are populated.
4. Confirm the owner-offered flavour list and business claims separately.
5. Keep production unchanged until a staging comparison validates every approved URL and image path.
