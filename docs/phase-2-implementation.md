# PureBakes V2 — Phase 2 implementation

## Scope and outcome

Phase 2 establishes the Eleventy foundation, mobile-first design system, homepage, shared components and preservation shells for `/gallery/`, `/cakes/`, `/products/`, `/classes/`, `/terms-and-conditions/` and `404.html`. It does not migrate the 472-image gallery, generate taxonomy/location pages, deploy staging or alter production.

## Architecture

```text
src/
├── _data/                 environment, business, navigation, featured cakes, reviews
├── _includes/
│   ├── layouts/base.njk   shared document, metadata and structured data
│   └── components/        header, footer, breadcrumbs, images, analytics, dialog, controls
├── assets/css/site.css    token-led mobile-first design system
├── assets/js/site.js      progressive interactions and analytics wrapper
├── assets/images/         official logo and selected real PureBakes work
├── index.njk              homepage
├── gallery/               portfolio shell
├── cakes/                 discovery hub shell
├── classes/               preserved learning route
├── products/              preserved general products route
└── terms-and-conditions/  maintainable policy foundation
```

Eleventy outputs plain static HTML to `_site`; assets are passthrough-copied. GitHub Actions installs, builds, validates and publishes the staging artifact to GitHub Pages.

## Business data

Confirmed owner facts live once in `src/_data/business.json`: brand, positioning, phone/WhatsApp, hours, pickup, assisted cab delivery, egg options, FSSAI status, social URLs and payment policy. Pricing remains absent because the public starting-price policy was not confirmed. Editorial positioning remains in templates rather than raw factual data.

## Mobile-first design

Base CSS targets narrow mobile first; enhancements begin at 768px and 1200px. The 390px experience establishes the information hierarchy: compact header, calm hero, two actions, trust statement and photography-led discovery. Desktop expands composition without changing order or hiding SEO content. Controls respect safe areas, focus states and reduced motion.

The warm editorial system uses ivory, cream, cocoa, espresso, charcoal and restrained rose. System editorial serif/sans stacks avoid a third-party font request. Images use contained presentation where cropping could remove toppers or cake details.

## Homepage

The homepage includes an editorial hero, selected real cakes, occasion discovery, studio experience/order steps, recent work, flavour direction, genuine migrated reviews, service-area context, classes, verified social links, lower-page SEO copy and final conversion/footer. Only eight selected cake records are used. The source content explains what PureBakes offers and where it operates without JavaScript.

## Images

The official existing logo and real existing cake images were copied from indexed production paths into V2 for staging presentation. Original source paths remain documented in Phase 1 inventories; this phase does not authorize production URL migration. Responsive 540/900px WebP derivatives reduce homepage transfer. Every generated image has dimensions and alt text. The 1280×720 hero is eager/high priority; below-fold images are lazy. Portrait cakes use `object-fit: contain` to preserve composition.

## SEO and structured data

Shared layout outputs unique title/description, absolute production canonical, robots, Open Graph/Twitter metadata and a factual Bakery/LocalBusiness entity. Deep route shells include visible breadcrumbs. Staging/development use `noindex, nofollow`; production configuration uses `index, follow`. Staging sitemap output is empty; production emits implemented published routes with absolute canonical URLs. The architecture keeps exact legacy paths possible.

The one configured business is in Manikonda. No service-area page is represented as a branch. The separate owner-controlled `weddingcakeshyderabad.in` relationship remains a future cross-domain SEO decision; no canonical was changed.

## Analytics and social

GA4 `G-CTSJRZ95NF` and Clarity `xwenvndp7j` load centrally only in production when analytics are enabled. `trackEvent()` sanitizes names/parameters and safely no-ops. Implemented events include WhatsApp, availability open/continue, phone, Maps, reviews, Instagram, YouTube, classes and scroll-to-top. The exact requested date and WhatsApp message are never sent to analytics; only a non-identifying lead-time bucket is emitted.

Verified Instagram, Facebook, YouTube and Maps URLs come from audited data. No heavy social feed, YouTube embed or Maps iframe is used.

## Availability and WhatsApp

Every “Check availability” control opens one accessible native dialog asking only for a mandatory date. Submission constructs a WhatsApp message containing readable date and current page URL, then opens canonical number `919980213333`. Empty submission shows an inline error and focuses the field. The floating WhatsApp link is subtle and does not animate.

## Accessibility and performance

Semantic regions, visible H1s, native buttons/dialog/form validation, labelled controls, keyboard menu/dialog operation, focus outlines, 44px-class controls and reduced-motion support form the baseline. Minimal dependency-free JS progressively enhances the static content. There are no client frameworks, autoplay media, external font requests, map/social embeds or above-fold analytics on staging.

## Environment and GitHub Pages behavior

- Development: local URL, noindex, analytics off.
- Staging: `https://new.purebakes.in/`, noindex/nofollow, `robots.txt` disallows all, analytics off, CNAME prepared.
- Production: `https://purebakes.in/`, index/follow, canonical sitemap and analytics enabled unless explicitly disabled.

Production cutover requires replacing/removing the staging CNAME and completing the full migration gate; it is not part of Phase 2.

## Validation performed

`npm test` builds staging and validates generated titles, descriptions, production canonicals, staging robots, H1s, image alt/dimensions, hero priority and WhatsApp configuration. Production is separately built to verify index/follow and sitemap behavior. JavaScript syntax and JSON-LD parsing are checked. Internal links among implemented routes are checked from generated HTML.

Rendered browser QA could not be automated because the session’s required in-app Browser control surface was not callable. Source/CSS responsive checks cover 320, 360, 390, 430, 768, 1024, 1280 and 1440px rules, but final screenshot and live interaction approval remains a Phase 2 review item rather than a claimed pass.

## Remaining work

- Rendered-device screenshot and interaction QA when Browser control is available.
- Phase 3 full gallery extraction/migration, controlled taxonomy and real search/filter/load-more.
- Exact legacy location/occasion page generation and all 41 location content migrations.
- Full `/classes/`, `/cakes/` and `/products/` content migration.
- Owner-curated current review rating/count and review URL.
- Final legal review, production redirects, image URL strategy, wedding-domain strategy and deployment/cutover.
