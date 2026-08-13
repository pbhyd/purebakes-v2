# PureBakes V2 — Phase 1 audit

Audit date: 13 August 2026. Scope: public HTML reachable from the production sitemap plus homepage/gallery discovery. Production was read only; no deployment or production file was changed.

## Executive findings

- The sitemap exposes 44 URLs: 1 home, 12 occasion, 27 location, 2 learning/commerce, 1 dietary and 1 gallery page. Every sitemap URL returned HTTP 200 during the audit.
- Internal-link/canonical discovery expanded the inventory to 250 URLs before the safety cap: 61 live pages and 189 dead (404) targets. The live set includes 41 location pages, two gallery URL variants, three learning/commerce pages and a testimonials page. The sitemap is not a complete inventory.
- The sitemap is technically invalid for most entries: 43 of 44 `<loc>` values are relative rather than absolute URLs.
- 41 of the 44 sitemap pages declare a canonical whose path differs from the fetched URL. Most of those canonical targets return 404 (verified on `/anniversary-cakes`); the wedding page canonical points to `weddingcakeshyderabad.in`. This is the highest immediate SEO risk.
- All 44 pages have a title, meta description, H1 and canonical. `baking-essentials` is intentionally `noindex,follow`; the other 43 are indexable.
- Across the 61 live pages there are 1,584 image references representing 615 unique image URLs. Six non-gallery references have empty alt text.
- `/gallery/` contains 478 image elements and 473 unique image URLs in the parsed page. All gallery images have non-empty alt text and explicit 600×760 dimensions; they are lazy-loaded.
- The gallery cards are embedded directly in one large HTML document (~450 KB), not loaded from a database or API. Caption/name, alt, image path and coarse labels live in repeated card markup.
- Gallery taxonomy is too coarse for V2. The visible category labels provide occasion buckets, while `data-cat` is mostly `egg or eggless`; it does not reliably encode themes, flavours or styles. Those dimensions must be normalized from captions/filenames and manually reviewed.
- The gallery claims 500+ cakes but exposes 473 unique image URLs in its current HTML. Treat “500+” as marketing copy until the source repository/image directory is compared.

Detailed machine-readable evidence (including the 404 targets) is in `seo/current-site-audit.json`; proposed mappings include only live pages and are in `seo/url-migration.json`.

## Current taxonomy discovered

Occasion/collection labels in gallery metadata: Customised (315 cards), Boy First Birthday (32), Anniversary (32), Girl First Birthday (27), Engagement/Wedding/Reception (24), Baby Shower (11), Bon Voyage (7), Other (7), Half Birthday (6), Bridal Shower (5), Corporate (5), Baby Announcement (4), and Smash Cake (1).

Location pages use `customized-cakes-{location}` paths. The sitemap includes 27 locations; homepage discovery shows more live location pages, including Neopolis, Raidurgam, Shamshabad, Bachupally, Himayatnagar and Khairatabad.

Themes and styles occur naturally in captions/filenames (for example Spider-Man, butterfly, football, vintage, floral, heart shape and two-tier), but are not a dependable controlled field. Flavour data is largely absent from cards. `egg or eggless` is a dietary-availability assertion, not a flavour.

## URL preservation strategy

1. At production cutover, generate every currently successful public path exactly as it exists. Do not replace legacy occasion/location paths with the prettier `/cakes/` or `/locations/` hierarchy in the first release.
2. Resolve the canonical conflict before Phase 2: use Search Console landing-page/query data to choose the winning path for every pair. Until then, the safest V2 canonical is self-referential on each preserved sitemap path.
3. Add new `/themes/`, `/flavours/`, `/styles/`, `/cakes/` and `/locations/` pages only as additive pages with unique approved content. Do not mass-generate combinations.
4. Preserve `/gallery/` and every existing `/img/...` URL. Optimized derivatives may be additive; do not move or rename originals without an image migration map.
5. Keep all staging pages `noindex,nofollow`, omit staging sitemap submission, and switch canonical host/indexability only through environment configuration.
6. Before production, compare this crawl with Search Console and GA4. A crawler cannot determine which URLs rank or receive Google Images traffic.

## Gallery migration plan

Parse each `.g-card` into one immutable historical record, preserving its caption/name and alt verbatim. Retain the absolute legacy image URL in `legacyImageUrl`; initially serve that same path in V2. Derive candidate taxonomy from caption, filename and current label, but require review before publication. Duplicate image paths must collapse to one cake record only after confirming that duplicate cards are not intentional.

The final schemas are executable proposals: `gallery-item.schema.json`, `seo-page.schema.json`, and `taxonomy.schema.json` in this directory. The optional `legacyImageUrl` exists specifically to protect Google Images equity.

## Proposed Eleventy structure

```text
.
├── .github/workflows/pages.yml
├── docs/
├── scripts/
│   ├── audit-current-site.mjs
│   ├── gallery-migrate.mjs
│   ├── gallery-add.mjs
│   ├── gallery-stats.mjs
│   └── validate.mjs
├── seo/
└── src/
    ├── _data/
    │   ├── site.js
    │   ├── gallery.js
    │   ├── gallery/*.json
    │   ├── themes.json
    │   ├── occasions.json
    │   ├── flavours.json
    │   ├── styles.json
    │   ├── locations.json
    │   └── pages/{themes,occasions,flavours,styles,locations}.json
    ├── _includes/
    │   ├── layouts/{base,seo-page}.njk
    │   └── components/{header,footer,breadcrumb,cake-card,gallery-grid,seo-content,cta,related-links,analytics,whatsapp-button,scroll-top}.njk
    ├── assets/{css,js,images}/
    ├── pages/{themes,occasions,flavours,styles,locations}.njk
    ├── gallery/index.njk
    ├── index.njk
    ├── sitemap.njk
    ├── image-sitemap.njk
    └── robots.njk
```

`gallery.js` merges monthly JSON once and exposes filtered collections to every template. Page JSON owns editorial content and publication state; taxonomy JSON owns canonical keys and URLs; cake records refer only to taxonomy keys.

## Risk register and gates

| Risk | Severity | Phase 2 gate |
|---|---:|---|
| Canonicals point to different, often 404 paths | Critical | Approve a canonical winner from Search Console evidence |
| Relative `<loc>` values make sitemap invalid | High | Generate absolute canonical URLs only |
| Sitemap omits live internally linked pages | High | Reconcile crawl with Search Console and full source tree |
| Moving 473+ indexed images | High | Preserve paths or approve per-image migration |
| Automated taxonomy inference is unreliable | High | Human review before theme/flavour/style publishing |
| Gallery HTML is large and decodes many images | Medium | Build-time HTML plus progressive client rendering/thumbnails |
| Six image references lack alt | Low | Identify decorative vs meaningful during migration |
| Claims/policies/reviews may need owner evidence | Medium | Owner confirmation before carrying claims/schema forward |

## Approval needed before Phase 2

Provide exports for Search Console (pages, queries, image search where available) and GA4 organic landing pages for 7/28/90 days, plus read-only access to the current source/image directory if available. Approve whether V2 should preserve the sitemap paths as canonical or instead preserve the existing declared canonical aliases after fixing their 404s. No architectural build should begin until that choice is evidence-backed.
