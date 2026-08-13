import locations from "../src/_data/locations.js";

const aliases = {
  "financial-district": "Financial District, Nanakramguda",
  "hitec-city": "HITEC City",
  "lb-nagar": "L. B. Nagar",
  narsingi: "Narsingi, Gandipet mandal",
  neopolis: "Neopolis Road, Kokapet",
  raidurgam: "Raidurg",
  tolichowki: "Tolichowki"
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const selected = process.argv.length > 2 ? locations.filter((location) => process.argv.slice(2).includes(location.key)) : locations;
const results = [];
for (const [index, location] of selected.entries()) {
  const locality = aliases[location.key] || location.name;
  const query = `${locality}, Hyderabad, Telangana, India`;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "3");
  url.searchParams.set("countrycodes", "in");
  const response = await fetch(url, { headers: { "User-Agent": "PureBakes-site-maintenance/2.0 (https://purebakes.in/)" } });
  if (!response.ok) throw new Error(`${location.name}: geocoder returned ${response.status}`);
  const candidates = await response.json();
  results.push({ key: location.key, name: location.name, query, candidates: candidates.map(({ lat, lon, display_name, type, importance }) => ({ lat: Number(lat), lng: Number(lon), displayName: display_name, type, importance })) });
  if (index < selected.length - 1) await sleep(1100);
}
console.log(JSON.stringify({ source: "OpenStreetMap Nominatim", retrievedAt: new Date().toISOString(), results }, null, 2));
