export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "node_modules/leaflet/dist/leaflet.css": "assets/vendor/leaflet/leaflet.css" });
  eleventyConfig.addPassthroughCopy({ "node_modules/leaflet/dist/leaflet.js": "assets/vendor/leaflet/leaflet.js" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addFilter("absoluteUrl", (path, base) => new URL(path || "/", typeof base === "string" ? base : base?.url || "https://purebakes.in/").href);
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("urlencode", (value) => encodeURIComponent(value));
  eleventyConfig.addFilter("imageVariant", (path, width) => path.replace(/\.webp$/i, `-${width}.webp`));
  eleventyConfig.addFilter("galleryClientData", (records) => records.map(({ id, image, caption, alt, themes, occasions, flavours, styles, keywords }) => ({ id, image, caption, alt, themes, occasions, flavours, styles, keywords })));
  eleventyConfig.addFilter("areaMapData", (records) => records.map(({ key, name, url, classification, map }) => ({ key, name, url, classification, lat: map?.lat, lng: map?.lng })));
  eleventyConfig.addFilter("galleryBy", (records, field, key, limit = 8) => records.filter((record) => (record[field] || []).includes(key)).slice(0, limit));
  eleventyConfig.addFilter("galleryByIds", (records, ids = []) => ids.map((id) => records.find((record) => record.id === id)).filter(Boolean));
  eleventyConfig.addFilter("occasionPortfolio", (records, page, limit = 8) => { const split = page.key === "first-birthday-boys" ? "first-birthday-boy" : page.key === "first-birthday-girls" ? "first-birthday-girl" : null; return records.filter((record) => record.occasions.includes(split || page.taxonomy)).slice(0, limit); });
  eleventyConfig.addFilter("findByKey", (records, key) => records.find((record) => record.key === key));
  return { dir: { input: "src", output: "_site", includes: "_includes", data: "_data" }, htmlTemplateEngine: "njk", markdownTemplateEngine: "njk" };
}
