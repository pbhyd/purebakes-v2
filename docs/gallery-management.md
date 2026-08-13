# Gallery management

## Monthly workflow

For each new cake:

1. Prepare one optimized WebP with an SEO-friendly, globally unique filename.
2. Copy it directly into `src/assets/images/cakes/`.
3. Run `npm run gallery:add`. The helper finds unregistered source images and creates a non-destructive `YYYY-MM.starter.json` draft.
4. Review every starter record. Replace `REVIEW REQUIRED`, add only controlled taxonomy values supported by evidence, set the real date if known, and rename the completed file to `YYYY-MM.json`.
5. Run `npm run gallery:validate`, `npm run gallery:stats` and `npm test`.
6. Commit source WebPs and JSON. Do not commit `_site`.

The owner does not create thumbnails, 360/540/720/900 files, category folders, theme copies, occasion copies, location copies or individual SEO pages. Twenty new cakes use the same steps: 20 source WebPs plus 20 JSON records, then build and deploy.

## Record format

```json
{
  "id": "cake-0473",
  "image": "/assets/images/cakes/seo-friendly-name.webp",
  "caption": "Owner-approved caption",
  "alt": "Accurate concise alt text",
  "themes": [],
  "occasions": [],
  "flavours": [],
  "styles": [],
  "colours": [],
  "keywords": [],
  "featured": false,
  "dateAdded": "2026-09-01"
}
```

IDs and image paths must be unique. Do not put generated suffixes such as `-360`, `-540`, `-720` or `-900` in `image`. Never infer flavour from photography, decoration or icing colour.

## Commands

- `npm run gallery:migrate`: repeat the audited historical extraction. Existing non-empty manual taxonomy, flags and dates survive normal reruns. `GALLERY_RECLASSIFY=1` is a migration-development-only option that discards enriched taxonomy and must not be used after owner enrichment.
- `npm run gallery:add`: create a starter file for new unregistered source images; it refuses to overwrite an existing draft.
- `npm run gallery:validate`: fail on unsafe or inconsistent gallery data.
- `npm run gallery:stats`: print inventory counts and refresh `seo/gallery-taxonomy-report.json`.
- `npm test`: validate gallery data, build staging, generate responsive/legacy outputs and validate HTML.

## Controlled taxonomy

Add a canonical key to the relevant taxonomy JSON before using it in records. Use lowercase hyphenated keys and human-friendly display names. Normalize aliases to one key—for example, Spider Man variants use `spider-man`. Empty is safer than an invented classification.

## Responsive and legacy outputs

Build-time derivatives and legacy compatibility copies are disposable `_site` files. Originals remain available at `/assets/images/cakes/filename.webp`; historical images also remain available at their audited `/img/...` URLs. Never edit or tag generated files.
