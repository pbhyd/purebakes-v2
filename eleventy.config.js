import { createPublicUrl, normalizeBasePath } from "./lib/public-url.js";

export default function (eleventyConfig) {
  const basePath = normalizeBasePath(process.env.SITE_BASE_PATH);
  const publicUrl = createPublicUrl(basePath);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "node_modules/leaflet/dist/leaflet.css": "assets/vendor/leaflet/leaflet.css" });
  eleventyConfig.addPassthroughCopy({ "node_modules/leaflet/dist/leaflet.js": "assets/vendor/leaflet/leaflet.js" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addFilter("absoluteUrl", (path, base) => new URL(path || "/", typeof base === "string" ? base : base?.url || "https://purebakes.in/").href);
  eleventyConfig.addFilter("publicUrl", publicUrl);
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("urlencode", (value) => encodeURIComponent(value));
  eleventyConfig.addFilter("imageVariant", (path, width) => path.replace(/\.webp$/i, `-${width}.webp`));
  eleventyConfig.addFilter("galleryClientData", (records) => records.map(({ id, image, caption, alt, themes, occasions, flavours, styles, keywords }) => ({ id, image: publicUrl(image), caption, alt, themes, occasions, flavours, styles, keywords })));
  eleventyConfig.addFilter("areaMapData", (records) => records.map(({ key, name, url, classification, map }) => ({ key, name, url: publicUrl(url), classification, lat: map?.lat, lng: map?.lng })));
  eleventyConfig.addFilter("galleryBy", (records, field, key, limit = 8) => records.filter((record) => (record[field] || []).includes(key)).slice(0, limit));
  eleventyConfig.addFilter("galleryByIds", (records, ids = []) => ids.map((id) => records.find((record) => record.id === id)).filter(Boolean));
  eleventyConfig.addFilter("occasionPortfolio", (records, page, limit = 8) => { const split = page.key === "first-birthday-boys" ? "first-birthday-boy" : page.key === "first-birthday-girls" ? "first-birthday-girl" : null; return records.filter((record) => record.occasions.includes(split || page.taxonomy)).slice(0, limit); });
  eleventyConfig.addFilter("findByKey", (records, key) => records.find((record) => record.key === key));
  eleventyConfig.addTransform("environmentBasePath", function (content) {
    if (!basePath || this.page.outputPath?.endsWith(".html") !== true) return content;
    const rewriteAttribute = (match, name, quote, value) => `${name}=${quote}${publicUrl(value)}${quote}`;
    let output = content.replace(/\b(href|src|action|poster)=(['"])(\/[^/'"][^'"]*|\/)\2/g, rewriteAttribute);
    output = output.replace(/\bsrcset=(['"])([^'"]+)\1/g, (match, quote, value) => {
      const rewritten = value.split(",").map((candidate) => {
        const parts = candidate.trim().split(/\s+/); parts[0] = publicUrl(parts[0]); return parts.join(" ");
      }).join(", ");
      return `srcset=${quote}${rewritten}${quote}`;
    });
    return output;
  });
  return { dir: { input: "src", output: "_site", includes: "_includes", data: "_data" }, htmlTemplateEngine: "njk", markdownTemplateEngine: "njk" };
}
