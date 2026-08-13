# PureBakes staging QA checklist

Use `https://new.purebakes.in` after the staging workflow succeeds. For local review, run `npm run dev` and substitute `http://localhost:8080`. Record tester, browser, device/viewport, date, result, and screenshot filename for every failure.

## Required viewport matrix

Test every representative page at **320, 360, 375, 390, and 430 px** wide first, then **768, 1024, 1280, and 1440 px**. Use browser zoom 100%. Repeat the mobile set in Safari on an iPhone and Chrome on Android when physical devices are available.

Pages: `/`, `/gallery/`, `/cakes/`, `/faq/`, `/birthday-cakes-in-hyderabad/`, `/floral-cakes/`, `/customized-cakes-lb-nagar/` (PROTECT), `/customized-cakes-financial-district/` (IMPROVE), `/customized-cakes-raidurgam/` (RETAIN), `/classes/`, `/terms-and-conditions/`, and a deliberate missing URL.

## Visual and responsive checks

- No horizontal overflow, clipped text, overlapping controls, orphaned headings, or unreadably narrow cards.
- Header, menu, announcement/trust content, footer and floating action controls remain usable; menu opens, traps no focus, closes with its control and Escape, and returns focus.
- Hero crop preserves the cake focal point; text remains legible; primary CTA is visible without crowding.
- Gallery cards retain aspect ratio without layout jumps. Open several portrait and landscape items; verify modal crop, caption, close control, previous/next controls, swipe/touch behavior and Escape.
- Gallery search, occasion/theme filters, clear state, empty state and result count agree. Refresh a filtered URL if filter state is represented in the URL.
- Availability dialog: open from header, hero, page body and floating CTA; select date; continue to WhatsApp; verify the generated message contains the chosen date and correct page context. Cancel and reopen without stale accidental state.
- FAQ disclosure controls work by mouse, touch, Enter and Space. Terms copy is calm, readable and contains no placeholder policy.
- Focus indicators are visible throughout. Tab order follows the page. No keyboard trap. Skip link reaches main content. Images have sensible spoken alternatives; decorative images are ignored.
- At 200% browser zoom, content and controls remain operable. With reduced motion enabled, animation is non-essential. Check light/dark forced-colour or high-contrast mode where available.

## Content and trust review

- Confirm spelling, punctuation, CTA wording and factual claims on every required page.
- Confirm the five PROTECT pages and six IMPROVE pages use distinct, credible copy and do not imply a local branch: LB Nagar, Patancheru, Secunderabad, Bachupally, Mehdipatnam; Financial District, Madhapur, Himayatnagar, Khairatabad, Punjagutta, Tarnaka.
- Sample RETAIN pages: Raidurgam, Nallagandla, Alwal. Confirm useful copy, Manikonda pickup clarity and no invented landmark/distance claim.
- Confirm social icons open the official Facebook, Instagram and YouTube profiles in a new tab. Confirm WhatsApp uses `+91 99802 13333`.

## Staging SEO and technical checks

- View source on `/`, a location page and gallery: canonical must use `https://purebakes.in/...`; robots meta must be `noindex, nofollow`; GA4 must be absent.
- `https://new.purebakes.in/robots.txt` must disallow `/`. Staging must not be submitted in Search Console.
- `sitemap.xml` and `image-sitemap.xml` may exist for parity but URLs must be production canonicals, never staging canonicals.
- DevTools Console: no uncaught errors. Network: no missing first-party assets, mixed content, redirect loop or unexpectedly huge original gallery image for initial cards.
- Run `npm test`, `npm run seo:validate`, and `npm run launch:validate`; attach outputs to the owner review.

## Acceptance

All P0/P1 defects are fixed and retested. P2 polish items are either fixed or recorded with an owner-approved deferral. Production cutover remains blocked until this checklist and `docs/owner-launch-review.md` are signed.
