# PureBakes production cutover plan

This is a runbook only. Phase 5 does **not** authorize production cutover.

## Before cutover

1. Complete and sign the staging QA and owner review documents. Freeze content changes and tag the approved commit.
2. Export/screenshot current DNS, GitHub Pages custom-domain settings, GA4 real-time baseline and Search Console ownership. Preserve a restorable copy of the current production site.
3. Choose and configure an HTTP redirect-capable edge/host. DNS alone cannot implement path-level 301s. GitHub Pages does not provide a general server-side redirect rules engine; HTML meta/JavaScript redirect pages are only a last-resort fallback and are not equivalent to HTTP 301 responses.
4. Implement and test `seo/production-redirect-plan.json` in a non-production environment. Confirm every destination returns 200 and no chain exceeds one redirect.
5. Confirm the production build has indexable robots directives, production canonicals, production sitemap URLs and GA4 exactly once. Lower DNS TTL only if the DNS operator decides it is appropriate.

## Cutover window

1. Build the approved commit with `npm run build:production`; run all validators against the artifact.
2. Point the GitHub Pages custom domain to `purebakes.in` and update DNS exactly per the verified Pages configuration. Do not delete old hosting yet.
3. Activate HTTPS host/protocol/path redirects at the selected edge. Deploy the production artifact.
4. Smoke-test `/`, gallery, FAQ, one occasion, one theme, PROTECT/IMPROVE/RETAIN locations, robots, both sitemaps, deliberate 404, WhatsApp and social links.
5. Verify with raw HTTP responses: all HTTP and `www` variants converge in one hop to non-www HTTPS; approved legacy paths return a real 301 to the correct final 200 URL.

## Search and measurement

Submit only `https://purebakes.in/sitemap.xml` in the existing production Search Console property. Inspect the homepage and representative changed URLs; request indexing sparingly. Record baseline clicks, impressions, indexed pages and top landing pages before cutover, then review at 24 hours, 72 hours, 7 days, 14 days and 28 days.

In GA4 DebugView/Realtime, verify `check_availability_open`, `check_availability_continue`, `whatsapp_click`, navigation and gallery events once each without personal data. Mark `check_availability_continue` as a key event only after receipt is proven. Do not send the selected date as analytics event data.

Update the Google Business Profile website link only after production is stable. Keep the existing business name, category, address/service-area model, phone and hours unless the owner supplies verified changes; avoid keyword stuffing.

## Rollback

Rollback triggers: widespread 404/5xx, broken ordering flow, bad canonical/indexing directives, missing core assets, redirect loop, or analytics duplication. Repoint Pages/DNS to the preserved prior site or redeploy the prior tagged artifact; disable new redirect rules; retain incident timestamps and response evidence. Re-run smoke tests. Do not remove the preserved previous site or redirect configuration for at least eight weeks after a stable launch.
