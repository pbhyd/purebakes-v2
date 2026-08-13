# Phase 3 gallery migration

Migration date: 13 August 2026. Production was not changed.

## Reconciled inventory

The audited V1 gallery snapshot at `../pb/gallery/index.html` contained 476 server-rendered cake cards and 472 unique cake image paths. All 472 referenced files existed. The difference is four repeated references across three duplicate groups:

- `cute-couple-anniversary-theme-cake.webp`: two identical occurrences.
- `chocolate-drip-birthday-cake-with-nutella-and-ferrero-toppings.webp`: three identical occurrences.
- `cute-purple-dinosaur-birthday-cake-for-kids-party-theme.webp`: two occurrences with capitalization-only caption variation.

The migration collapses duplicate image paths deterministically. It preserves the first source caption without rewriting it. The result is 472 canonical historical records, 472 preserved captions, 472 preserved useful alt strings, zero repaired/missing alt strings and zero missing images.

## Architecture

Historical records live in `src/_data/gallery/existing-gallery.json`. Future completed monthly files use `src/_data/gallery/YYYY-MM.json`. `src/_data/gallery.js` merges completed JSON files in filename order and deliberately ignores `*.starter.json` drafts.

All manually maintained cake photographs are flat files in `src/assets/images/cakes/`; no taxonomy folders are used. The current folder contains 481 source WebPs: 472 historical gallery sources plus eight Phase 2 featured sources and one homepage hero composite. Gallery metadata references 472 canonical sources.

The build creates 360px and 720px gallery derivatives only when smaller than the original. Phase 2 featured assets also receive the widths their existing templates require. Generated files live only in `_site` and are ignored by Git. Sharp uses `withoutEnlargement`, so no source is upscaled.

All 472 historical `/img/...` URLs are emitted into `_site` as compatibility copies. The new `/assets/images/cakes/...` URLs are additive. No legacy filename was renamed and there are no unavoidable public image URL changes.

## Taxonomy

Controlled JSON vocabularies live in `themes.json`, `occasions.json`, `styles.json` and `flavours.json`. Occasion assignment uses the legacy category or explicit caption evidence. Theme and style candidates use conservative, controlled aliases. Unknown values stay empty.

No flavour was inferred. All 472 flavour arrays are empty pending reliable owner-supplied evidence. The complete counts and gaps are generated in `seo/gallery-taxonomy-report.json`.

Current gaps: 288 without a controlled theme, 16 without a reliable occasion, 350 without a style, zero without alt, and 472 with unknown flavour.

## Gallery experience

`/gallery/` remains the sole canonical gallery URL. The initial HTML contains 30 crawlable, captioned cake cards and concise supporting portfolio copy. A compact client index covers all 472 records for combined case-insensitive partial text search plus Occasion and Theme intersections. Filter/query states do not change the URL or canonical.

Thirty results are rendered at a time. Load More adds another 30. Images are lazy-loaded, dimensioned, responsive and presented with `object-fit: contain` to protect full cake compositions. The accessible native-dialog detail view supports Escape, visible close, backdrop close, focus restoration and body-scroll control.

The mandatory date flow remains unchanged. When opened from a cake detail, WhatsApp receives the selected caption and current page reference after the required date is supplied.

Analytics use the central helper: `gallery_search`, `gallery_search_no_results`, `gallery_filter`, `gallery_filter_clear`, `gallery_image_open`, `gallery_load_more`, `check_availability_open`, `check_availability_continue` and `availability_date_validation_error`. Search tracking occurs on form submission, never per keystroke. The session-only search term may be added to analytics attribution but never to the WhatsApp message.

## Image SEO and validation

`image-sitemap.xml` is generated from canonical source records and listed in `robots.txt`. It includes originals only, not derivatives. Gallery data does not invent Product schema. Existing Bakery/LocalBusiness data remains unchanged.

Validation rejects duplicate IDs/images, missing sources, missing captions/alts, invalid taxonomy, source derivatives and category subfolders. The migration report is `seo/gallery-migration-report.json`.

## Phase 4 candidate analysis

These are candidates only; Phase 3 creates no SEO landing pages. Existing URL evidence must be reconciled before publication.

- P0: Birthday (300), First Birthday (61), Anniversary (32), Engagement/Wedding (24), Floral (50), Butterfly (40). These combine substantial real inventory with existing occasion/search evidence.
- P1: Baby Shower (11), Jungle (13), Princess (10), Superhero (10), Spider-Man (8), Unicorn (8). Inventory is useful, but titles, canonical URLs and intent overlap need editorial review.
- P2: Bon Voyage (7), Bridal Shower (5), Corporate (5), Travel (7), Football (6), Cricket (5), Safari (5), Boss Baby (4), Mermaid (2), Half Birthday (6), Baby Announcement (4), Smash Cake (1). Retain as filters or enrich inventory before considering standalone pages.

No flavour page is recommended until offerings and photographed-cake flavour metadata are supplied reliably.
