export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addFilter("absoluteUrl", (path, base) => new URL(path || "/", typeof base === "string" ? base : base?.url || "https://purebakes.in/").href);
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("urlencode", (value) => encodeURIComponent(value));
  return { dir: { input: "src", output: "_site", includes: "_includes", data: "_data" }, htmlTemplateEngine: "njk", markdownTemplateEngine: "njk" };
}
