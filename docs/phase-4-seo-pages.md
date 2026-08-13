# Phase 4 SEO pages

Phase 4 generated a static, internally linked SEO content network without changing production, DNS, GBP, redirects or the approved visual direction.

## Pages and URL preservation

- Seven occasion pages use existing legacy PureBakes paths: birthday, first birthday for boys, first birthday for girls, anniversary, engagement, wedding and baby shower.
- Seven genuinely new theme pages use `/cakes/themes/`, supported by a new theme hub at `/cakes/themes/`.
- All 41 audited location pages retain exactly the existing `customized-cakes-*` URL. Classification remains 5 PROTECT, 6 IMPROVE and 30 RETAIN.
- `/areas-we-serve/` is the incoming-link hub for every location page and explicitly describes one Manikonda pickup studio with service areas—not branches.
- `/faq/` contains 16 visible, verified answers and matching FAQPage structured data.
- `/cakes/` now links occasions, approved themes and the full gallery. No flavour or style page was created.

## Content and portfolio architecture

Occasion and theme pages derive their static image selections directly from gallery taxonomy. Location pages use a concise representative real-cake selection. Captions and canonical image filenames remain unchanged. New monthly records automatically become eligible for their tagged collections without template edits.

Page copy is stored in JSON data, separate from reusable Nunjucks layouts. Each page has a unique title, description, H1, self-canonical, breadcrumbs, visible content, image collection, contextual links, relevant FAQs and availability CTA.

## Source-image cleanup

All eight Phase 2 featured sources were SHA-256-identical duplicates of historical gallery sources. Their canonical gallery records are now marked `featured: true`, and the eight duplicate files/data records were removed. The homepage hero composite is a design asset rather than one reusable cake photograph, so it moved from `assets/images/cakes/` to `assets/images/site/`. The canonical cake folder now contains exactly 472 source WebPs—one per migrated cake. Historical filenames and `/img/...` compatibility URLs were not changed.

## Internal links and validation

The network follows Cakes → occasions/themes → Gallery, with relevant cross-links between themes and occasions. Areas We Serve links all locations; location pages link popular cake collections, nearby audited locations and the portfolio. FAQ links to ordering destinations, themes, areas and classes. The footer links FAQ and Areas We Serve globally.

`npm run seo:validate` performs a production build and checks required metadata, self-canonicals, sitemap membership, internal links, duplicate titles/descriptions/canonicals and orphan pages. It writes `seo/v2-generated-page-inventory.json`. Location migration evidence is in `seo/location-migration-report.json`.

## Structured data and analytics

The existing factual Bakery/LocalBusiness entity remains sitewide. Visible page FAQs emit matching FAQPage JSON-LD. No portfolio example is represented as a Product SKU. Theme, occasion and location page events use the central helper with controlled page context. WhatsApp conversion tracking includes page type/slug and never sends the requested date or message.

## Sitemap and freshness

The production sitemap contains the explicit published Phase 4 inventory and no filters, drafts or staging URLs. Build-time dates are no longer used as blanket `lastmod`; entries omit `lastmod` until a meaningful content date is available. The canonical 472-image sitemap remains unchanged.

## Deferred gaps

- Flavour pages remain deferred because reliable flavour metadata is zero.
- Style pages remain deferred because classification coverage is insufficient.
- P2 theme pages remain filters/inventory candidates only.
- The wedding-domain decision remains deferred; see `docs/wedding-domain-seo-strategy.md`.
- No individual cake pages or full location redesigns were created.
