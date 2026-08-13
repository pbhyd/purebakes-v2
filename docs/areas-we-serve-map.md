# Areas We Serve interactive map

## Architecture

The page uses locally hosted Leaflet 1.9.4 with OpenStreetMap raster tiles. Leaflet fits the existing static Eleventy architecture, requires no API key, and avoids a framework or site-wide JavaScript bundle. Its CSS and JavaScript are included only when `pageSlug` is `areas-we-serve`; map creation and tile requests are delayed by `IntersectionObserver` until the map approaches the viewport.

OpenStreetMap attribution remains visible. Runtime external requests are limited to the tiles needed for the visible initial Hyderabad bounds and later user pan/zoom activity. Google Maps, an API key, routing, distances, ETAs, polygons and directions are not used.

## Data and coordinates

`src/_data/seo-pages/locations.json` remains the canonical source for the 41 names, keys, classifications and preserved URLs. `src/_data/locationCoordinates.json` is a coordinate layer keyed by those canonical keys; `src/_data/locations.js` joins them for templates. This prevents a second URL list.

Coordinates represent general locality centres, not customer addresses or a PureBakes address. They were resolved on 13 August 2026 primarily with OpenStreetMap Nominatim queries for `[locality], Hyderabad, Telangana, India`. Kokapet was cross-checked with Wikidata Q6426560, Narsingi with OpenStreetMap node 2935018015, and Neopolis with the public HMDA-project location published by Neopolis.one. Records carrying `review` explain ambiguous results or centre proxies. Fifteen records are flagged for transparent review: Dilsukhnagar, Financial District, Kokapet, Kompally, LB Nagar, Manikonda, Narsingi, Puppalaguda, Tellapur, Neopolis, Shamshabad, Bachupally, Nizampet, Punjagutta and Tarnaka. All remain inside the validated Hyderabad-region bounds. The Manikonda coordinate is explicitly an approximate public locality marker.

Manikonda is one of the 41 established service areas and therefore receives the same purple service-area marker as every other locality. It is not identified as a pickup point or business location. Puppalaguda shares an OSM locality result with Manikonda and receives a small display-only offset to keep both controls usable; the stored source coordinate remains unchanged.

## Semantics, privacy and SEO

Purple pins mean “Area We Serve”; they never represent branches, studios, shops or guaranteed delivery zones. No radius or service polygon is drawn. The LocalBusiness JSON-LD exposes only Manikonda, Telangana and India—no street address or geo coordinates—and the 41 location pages remain WebPages.

The map is progressive enhancement. All 41 preserved location URLs remain ordinary server-rendered links below it, so navigation and crawling work with JavaScript or tiles disabled. The map explicitly says the pins are established discovery pages rather than the limit of service. The hub’s canonical, title, H1 and breadcrumbs remain stable, and map state creates no query URLs.

## Accessibility and interaction

The map region has an accessible label; markers have textual titles, keyboard support and real popup links. The complete HTML directory remains the primary accessible alternative. Scroll-wheel zoom is disabled to reduce desktop scroll trapping, while normal page scrolling remains available on touch devices. Reduced-motion CSS removes Leaflet zoom transitions.

Analytics semantics:

- `service_area_map_loaded`: successful lazy initialization.
- `service_area_pin_click`: a pin was selected.
- `service_area_page_click`: a real destination link was selected, with `source` equal to `map_popup` or `location_list`.

Events contain controlled slug, name and classification values—never coordinates, pickup details or customer information. Pan and zoom are intentionally not instrumented.

## Performance and maintenance

The build reports the exact local Leaflet asset sizes through `npm run areas:validate`. Tile count depends on viewport and browser pixel density and must be measured during rendered QA; no tile is requested before lazy initialization. If Leaflet or tiles fail, the map retains a clear fallback directing visitors to the static list.

For a future owner-approved location, add the canonical location record through the existing location-page workflow and one keyed coordinate record with its source/review note. The same joined record then drives its SEO page, map marker and Areas We Serve link. Run `npm run areas:validate` before review.
