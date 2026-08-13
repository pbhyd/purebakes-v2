# Gallery image count analysis

The live `/gallery/` HTML contains 478 `<img>` references and 473 unique image URLs. One unique URL is the PureBakes logo, leaving 472 unique cake image URLs.

The cake grid contains 476 `.g-card` records. Four excess card references come from three duplicated cake URLs:

- `cute-couple-anniversary-theme-cake.webp` appears twice.
- `chocolate-drip-birthday-cake-with-nutella-and-ferrero-toppings.webp` appears three times.
- `cute-purple-dinosaur-birthday-cake-for-kids-party-theme.webp` appears twice (with a capitalization-only caption difference).

Therefore the observed structure reconciles exactly:

```text
476 cake cards
- 4 repeated card references
= 472 unique cake images
+ 1 logo
= 473 unique image URLs on the gallery page
```

All cake cards are present in the initial server HTML. The filter/search JavaScript only hides and shows existing cards; it does not fetch additional data, paginate, or inject further images. No CSS background-image gallery inventory or alternate category endpoint was found. The visible “500+” statement is marketing copy (“cakes made”), not a count derived from grid records.

Migration can preserve the card image path, displayed caption (`.g-name`), alt attribute and current category (`.g-cat`/`data-meta`) verbatim. The three duplicate groups require explicit deduplication review; captions must not be rewritten. The logo must not become a cake record.

This is an HTML-level inventory. A later comparison with the production source image directories may find unreferenced image files, but those are not part of the current gallery page.
