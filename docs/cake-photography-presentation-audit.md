# Cake Photography Presentation Audit

Permanent principle: **The website is the frame. The cakes are the artwork.**

| Page family / component | Presentation before this fix | Gutter risk | Resolution |
| --- | --- | --- | --- |
| Gallery cards and client-rendered results | A later override produced the approved intrinsic 9:16 presentation, but an obsolete `600/760` + `contain` rule remained earlier in the cascade | Regression risk | Consolidated onto `.portfolio-cake-photo`: full card width, natural height, transparent image background |
| Occasion landing-page portfolios | Shared SEO cards inherited a wider `600/760` box with `object-fit: contain` and lavender background; a later override masked it | Confirmed root cause / regression risk | Fixed once in the shared SEO portfolio include and semantic photo rule |
| Theme landing-page portfolios | Same shared SEO component and cascade | Confirmed root cause / regression risk | Shared fix applied |
| All 41 location landing-page portfolios | Same shared SEO component and cascade | Confirmed root cause / regression risk | Shared fix applied |
| Homepage featured cakes | Intentional, approved editorial 4:5 crops using `object-fit: cover`; no lavender side gutters | None observed | Unchanged |
| Homepage experience and class artwork | Editorial layouts with intentional cropping, not portfolio cards | None observed | Unchanged |
| Gallery lightbox | Dark, viewport-constrained detail viewer using `contain` to show the whole cake | None; this is correct detail-view behavior | Unchanged |
| Cakes hub, theme hub, products, classes, areas hub and FAQ | Text/navigation content; no reusable portrait portfolio-photo cards | Not applicable | Unchanged |

The shared rule is deliberately scoped to `.portfolio-cake-photo`; it does not alter logos, icons, heroes, editorial imagery, or the lightbox. Responsive 360/720 derivatives, intrinsic 1080×1920 dimensions, lazy loading, decoding, alt text, captions, filenames, taxonomy, URLs, and gallery behavior are preserved.

Automated regression coverage lives in `scripts/cake-photo-validate.mjs`. It rejects the obsolete fixed-ratio patterns, checks server- and client-rendered cards, samples occasion/theme/location pages, and verifies the 472 canonical source images.
