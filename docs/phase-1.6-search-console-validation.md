# PureBakes V2 — Phase 1.6 Search Console validation

Audit date: 13 August 2026. Analysis only; no production, DNS, redirect, canonical, image, content, Eleventy or deployment changes were made.

## Executive summary

Search Console validates the central Phase 1.5 direction. All 54 same-domain broken-canonical cases remain `SELF_CANONICALIZE`: their current live path families either have measured visibility with no stronger canonical-target signal, or have legitimate live content and no evidence supporting removal. Six live URLs remain `KEEP`. The cross-domain wedding page remains the only `MANUAL_REVIEW`; there are no evidence-supported redirects or merges.

The strongest migration surprise is outside the 61-page crawl: `https://www.purebakes.in/classes` earned 60 clicks and 1,428 impressions, while `/products`, `/cakes`, and two wedding URLs also have measurable value. These are now explicit guardrails and must be reconciled before Phase 2 scope is approved.

## Search Console datasets analyzed

| Export label | Filter-confirmed type | Actual coverage | Page rows | Query rows |
|---|---|---:|---:|---:|
| Web — last 16 months | Web | 2026-04-19–2026-08-11 (115 days) | 56 | 1,000 |
| Web — last 3 months | Web | 2026-05-12–2026-08-11 (92 days) | 54 | 1,000 |
| Image — last 16 months | Image | 2026-04-19–2026-08-11 (115 days) | 25 | 528 |

The “16 months” export contains only 115 days of available property data. It is historical relative to the 92-day export, but it is not 16 months of observations. Page-row sums (used for URL decisions) are 661 clicks/35,510 impressions; chart totals are 656/32,722. Search Console dimension exports can differ from chart totals, so both are retained and no false reconciliation adjustment was applied. Query exports are capped and do not include a page dimension; query-to-landing-page attribution is therefore `null`.

## Top organic landing pages

| Rank | Exact Search Console URL | Clicks | Impressions | CTR | Position |
|---:|---|---:|---:|---:|---:|
| 1 | `https://purebakes.in/` | 421 | 21,244 | 1.98% | 10.36 |
| 2 | `https://www.purebakes.in/` | 127 | 8,745 | 1.45% | 8.56 |
| 3 | `https://www.purebakes.in/classes` | 60 | 1,428 | 4.20% | 12.13 |
| 4 | `https://www.purebakes.in/products` | 12 | 885 | 1.36% | 5.76 |
| 5 | `/customized-cakes-lb-nagar/` | 7 | 183 | 3.83% | 6.08 |
| 6 | `http://purebakes.in/` | 7 | 162 | 4.32% | 13.17 |
| 7 | `https://purebakes.in/products/` | 5 | 224 | 2.23% | 5.86 |
| 8 | `https://www.purebakes.in/cakes` | 3 | 208 | 1.44% | 4.70 |
| 9 | `/customized-cakes-lb-nagar` | 3 | 109 | 2.75% | 6.64 |
| 10 | `/customized-cakes-patancheru/` | 2 | 131 | 1.53% | 7.34 |

## Top non-brand queries

The leading non-brand demand is “near me” and Hyderabad custom-cake intent. Top 20 by clicks are:

1. customized cakes near me — 19 clicks / 1,068 impressions / position 7.79
2. customised cakes near me — 18 / 744 / 6.26
3. custom cakes near me — 11 / 284 / 9.35
4. home bakers near me — 9 / 658 / 5.80
5. customised cakes hyderabad — 9 / 237 / 7.27
6. customized cake near me — 8 / 302 / 7.06
7. custom cakes hyderabad — 7 / 396 / 7.27
8. customized cakes in hyderabad — 7 / 313 / 8.42
9. cake customization near me — 6 / 227 / 6.85
10. customised cake near me — 5 / 178 / 6.61
11. online baking classes in hyderabad — 5 / 22 / 1.91
12. customized cakes online hyderabad — 4 / 630 / 14.59
13. customized cakes hyderabad — 4 / 304 / 9.14
14. customized cake — 4 / 135 / 11.81
15. customized cakes — 3 / 424 / 10.32
16. wedding cakes hyderabad — 3 / 308 / 18.67
17. customize cake near me — 3 / 274 / 7.98
18. cake customisation near me — 3 / 264 / 6.08
19. home bakers in hyderabad — 3 / 104 / 9.40
20. customised cake in hyderabad — 3 / 89 / 8.78

The full 1,000-query classification is in `seo/search-query-opportunities.json`. Because no query-page export was supplied, `existingBestLandingPage` is intentionally null.

## Recent versus historical trends

The 92-day page export contains 584 of 661 page-row clicks and 32,096 of 35,510 impressions. This concentration shows that most measured visibility is recent, but the periods overlap and cannot support a conventional year-over-year or prior-period growth calculation. URL trend values use a conservative coverage-adjusted comparison and return `INSUFFICIENT_DATA` for sparse URLs.

The non-www HTTPS host recorded the same page-row totals in both exports (449 clicks/23,198 impressions), indicating its measured visibility began inside the recent window. WWW declined from 205 clicks/12,139 impressions in available history to 130/8,772 in the recent export, but still carries important legacy assets.

## Critical URLs to preserve

Four path families are `CRITICAL`: the homepage, LB Nagar location page, `/classes`, and `/products`. Thirteen are `HIGH`, including Financial District, Patancheru, Secunderabad, gallery, Bachupally, Himayatnagar, Khairatabad, Mehdipatnam, Punjagutta, Tarnaka, `/cakes`, and two legacy wedding URLs. Another 43 legitimate live paths are `MEDIUM` guardrails. Full evidence is in `seo/high-value-urls.json`.

`/classes` is especially important: it is not represented by the live crawler’s `/baking-classes/` path but is the third-highest organic landing page. Phase 2 must preserve it directly or use an evidence-backed one-to-one migration—not silently omit it.

## Broken canonical validation

- Confirmed broken same-domain canonical cases: 54
- `SELF_CANONICALIZE`: 54
- `KEEP`: 6
- `REDIRECT`: 0
- `MERGE`: 0
- `REMOVE`: 0
- `MANUAL_REVIEW`: 1

For affected paths with Search Console evidence, confidence is now `HIGH`; cases without rows remain `MEDIUM` and are preserved conservatively. Canonical-target path variants had no stronger evidence capable of overturning the decision.

## WWW versus non-WWW

| HTTPS host | Clicks | Impressions | Ranking URL rows |
|---|---:|---:|---:|
| `purebakes.in` | 449 | 23,198 | 36 |
| `www.purebakes.in` | 205 | 12,139 | 18 |

HTTP non-www adds 7 clicks and 162 impressions. Non-www HTTPS leads with 68% of HTTPS clicks and 66% of HTTPS impressions and matches the intended production host. Recommendation: permanently use `https://purebakes.in` and map every WWW/HTTP equivalent one hop to the corresponding non-www HTTPS canonical. Do not collapse the valuable `/classes` or product paths to the homepage.

## Trailing-slash findings

Search visibility is split for gallery, products and at least ten location paths. Gallery has 68 WWW no-slash impressions, 46 non-www no-slash, and 32 non-www slash impressions in Web Search; Image Search has 396 no-slash and 349 slash impressions. LB Nagar has 7/183 on slash and 3/109 without slash.

Recommendation: use trailing slashes for HTML pages because the 61 live crawl resolves to slash paths and Eleventy directory output naturally supports them. Preserve equity with one-hop redirects from no-slash variants and point canonicals, internal links and sitemap entries only to slash URLs. The homepage remains `/`.

## Location SEO findings

| Category | Count | Meaning |
|---|---:|---|
| PROTECT | 5 | LB Nagar, Patancheru, Secunderabad, Bachupally, Mehdipatnam |
| IMPROVE | 6 | Financial District, Madhapur, Himayatnagar, Khairatabad, Punjagutta, Tarnaka |
| RETAIN | 30 | Legitimate local coverage with limited or no exported evidence |
| REVIEW | 0 | None justify questioning/removal at this stage |

Khairatabad and Punjagutta are unusually strong CTR opportunities: 116 and 108 impressions around positions 4.49 and 3.98, respectively, but zero clicks. All 41 location URLs remain protected from deletion and should self-canonicalize on their existing path family.

## Occasion SEO findings

Current occasion pages have modest page-level visibility: Bon Voyage has 1 click/27 impressions; anniversary, birthday and engagement each show 17 impressions around position 8.06. Wedding query demand is much larger than the crawled PureBakes wedding URL: “wedding cakes hyderabad” has 308 impressions, while legacy WWW wedding pages have 419 and 129 impressions. This reinforces manual review of the wedding-domain/content strategy.

## Learn/classes SEO findings

`https://www.purebakes.in/classes` is a critical non-cake asset with 60 clicks, 1,428 impressions, 4.2% CTR and position 12.13. Recent data contributes 20 clicks and 530 impressions. “online baking classes in hyderabad” ranks around 1.91. `/baking-classes/` itself has only eight impressions in the export. Phase 2 must reconcile these two intents/paths without discarding `/classes` equity.

## Theme and flavour opportunities

Only three exported Web queries matched the conservative theme vocabulary and four matched flavour vocabulary; exports are capped and globally aggregated. These are opportunity signals, not publication approval. Theme pages should be prioritized using query evidence plus reviewed gallery inventory. Flavour pages require owner-confirmed offerings and must not infer cake flavour from appearance or filenames.

## Gallery and Google Image Search findings

Exported Image page rows total 2 clicks and 5,367 impressions (chart: 2/5,313), average position about 50. Homepage images account for both clicks and 4,388 impressions. Gallery variants combine to 745 impressions, zero clicks and position about 57.58. This is visibility, but weak engagement/ranking—not evidence that indexed image paths may be renamed.

Recommended later improvements remain additive: preserve original paths/captions, improve weak alt text only where accurate, add semantic surrounding copy and dedicated reviewed taxonomy pages, provide an image sitemap, dimensions, responsive derivatives and optimized formats for new assets. No image was changed in this phase.

## Top SEO opportunities

1. Homepage: 21,244 exact non-www impressions, 1.98% CTR, position 10.36.
2. Consolidate WWW homepage: 8,745 impressions are split onto WWW.
3. Preserve/optimize `/classes`: 1,428 impressions, position 12.13.
4. “customized cakes near me”: 1,068 impressions, 1.78% CTR, position 7.79.
5. Preserve/reconcile `/products`: 1,109 path-family impressions split by host/slash.
6. “customised cakes near me”: 744 impressions, position 6.26.
7. “home bakers near me”: 658 impressions, 1.37% CTR, position 5.80.
8. “customized cakes online hyderabad”: 630 impressions, 0.63% CTR, position 14.59.
9. “customized cakes”: 424 impressions, 0.71% CTR, position 10.32.
10. Wedding cluster: 419 impressions on a legacy page plus 308 query impressions, with unresolved domain strategy.

Machine-readable opportunity bands, including positions 4–10 and 11–20, are in `seo/seo-opportunities.json`. The V2 priority score in `seo/v2-page-priorities.json` is explicitly an internal aid, not a Google metric.

## Recommended permanent URL convention

- Host: `purebakes.in` (non-www)
- Protocol: HTTPS
- HTML paths: lowercase with trailing slash
- Canonical: absolute self-canonical URL
- Sitemap: approved, published, indexable canonical URLs only
- Internal links: direct canonical URLs only
- Variants: one-hop HTTP→HTTPS, WWW→non-www, and no-slash→slash redirects where hosting permits
- Query/filter states: canonical to the underlying page and excluded from sitemap

## Updated migration risks

- `/classes`, `/products`, `/cakes`, cupcakes and wedding URLs have Search Console value outside the 61 live-path decision table.
- Host and slash duplication splits signals.
- The wedding cross-domain relationship remains unknown.
- Export history is only 115 days and queries are capped/not joined to pages.
- Gallery Image visibility is path-sensitive but produces no clicks yet.
- GA4 is intentionally absent: Search Console measures Google visibility; GA4 later supplies on-site behavior and conversion evidence.

## Phase 2 prerequisites

1. Owner decision on `weddingcakeshyderabad.in` and the two legacy WWW wedding pages.
2. Decide how `/classes`, `/products`, `/cakes` and other valuable legacy catalog paths relate to V2 scope.
3. Approve non-www HTTPS and trailing-slash conventions with one-hop variant redirects.
4. Treat `seo/high-value-urls.json` as a launch guardrail alongside the 61 live mappings.
5. If query-to-page attribution is desired, provide a Search Console API export grouped by query and page; it is not required to accept the current canonical conclusions.
