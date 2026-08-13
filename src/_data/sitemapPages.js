import locations from "./locations.js";
import occasions from "./occasionPages.js";
import themes from "./themePages.js";
const core = ["/", "/gallery/", "/cakes/", "/cakes/themes/", "/areas-we-serve/", "/faq/", "/baking-classes/", "/products/", "/testimonials/", "/terms-and-conditions/"];
export default [...new Set([...core, ...locations.map((page) => page.url), ...occasions.map((page) => page.url), ...themes.map((page) => page.url)])];
