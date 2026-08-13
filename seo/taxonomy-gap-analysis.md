# Taxonomy gap analysis

## Directly migratable

- Existing image path, caption and alt text from each gallery card.
- Existing displayed collection/category and `data-meta` value.
- Coarse occasion membership where the existing category is explicit (anniversary, first birthday, engagement/wedding, baby shower, bridal shower, bon voyage, corporate, baby announcement, half birthday and smash cake).
- Dietary wording exactly as stored, with a warning: `egg or eggless` describes availability and is not a flavour.

## Candidate inference

Candidate values may be proposed from captions, alt text and filenames for human review:

- Themes such as Spider-Man, butterfly, jungle, unicorn, football and cricket.
- Styles such as floral, vintage, minimalist, heart shape, drip and multi-tier.
- Tier count only when explicitly stated (“two tier”, “three tier”).
- Occasion where the category is generic but the caption explicitly names one.
- Audience only where explicit and non-sensitive (“kids”, “baby”, “adult”).

Inference must use a controlled alias map (`spiderman`, `spider-man`, `spider man` → one key) and preserve the source strings separately. Inferred tags should remain unpublished until reviewed.

## Manual validation required

- Flavour: appearance and decorative chocolate brands do not prove sponge/filling flavour.
- Egg/eggless status for a specific photographed cake.
- Ambiguous character, sport, profession or lifestyle themes.
- Audience when inferred from colour, decoration or gender stereotypes.
- Tier count when perspective or separators are unclear.
- Whether two cards sharing an image represent intentional collection membership or accidental duplication.

No flavour metadata should be invented from the photograph, caption or filename. New flavour landing pages require an owner-confirmed offered-flavour list and sufficient real inventory.
