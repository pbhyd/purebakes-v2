import data from "./seo-pages/locations.json" with { type: "json" };
import coordinates from "./locationCoordinates.json" with { type: "json" };
export default data.map((location) => ({
  ...location,
  map: coordinates[location.key],
}));
