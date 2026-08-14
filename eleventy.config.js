import { createPublicUrl, normalizeBasePath } from "./lib/public-url.js";
import galleryDiscovery from "./src/_data/galleryDiscovery.js";

export default function (eleventyConfig) {
  const basePath = normalizeBasePath(process.env.SITE_BASE_PATH);
  const publicUrl = createPublicUrl(basePath);
  const gallerySearchKeys = new Set(
    [...galleryDiscovery.occasions, ...galleryDiscovery.themes]
      .map((item) => item.key)
      .filter((key) => key !== "all"),
  );
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/leaflet/dist/leaflet.css":
      "assets/vendor/leaflet/leaflet.css",
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/leaflet/dist/leaflet.js": "assets/vendor/leaflet/leaflet.js",
  });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addFilter(
    "absoluteUrl",
    (path, base) =>
      new URL(
        path || "/",
        typeof base === "string" ? base : base?.url || "https://purebakes.in/",
      ).href,
  );
  eleventyConfig.addFilter("publicUrl", publicUrl);
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("urlencode", (value) => encodeURIComponent(value));
  eleventyConfig.addFilter("imageVariant", (path, width) =>
    path.replace(/\.webp$/i, `-${width}.webp`),
  );
  eleventyConfig.addFilter("gallerySearchUrl", (key) =>
    gallerySearchKeys.has(key)
      ? `/gallery/?search=${encodeURIComponent(key)}`
      : "/gallery/",
  );
  eleventyConfig.addFilter("galleryClientData", (records) =>
    records.map(
      ({
        id,
        image,
        caption,
        alt,
        themes,
        occasions,
        flavours,
        styles,
        keywords,
      }) => ({
        id,
        image: publicUrl(image),
        caption,
        alt,
        themes,
        occasions,
        flavours,
        styles,
        keywords,
      }),
    ),
  );
  eleventyConfig.addFilter("areaMapData", (records) =>
    records.map(({ key, name, url, classification, map }) => ({
      key,
      name,
      url: publicUrl(url),
      classification,
      lat: map?.lat,
      lng: map?.lng,
    })),
  );
  eleventyConfig.addFilter("galleryBy", (records, field, key, limit = 8) =>
    records
      .filter((record) => (record[field] || []).includes(key))
      .slice(0, limit),
  );
  eleventyConfig.addFilter("galleryByIds", (records, ids = []) =>
    ids.map((id) => records.find((record) => record.id === id)).filter(Boolean),
  );
  eleventyConfig.addFilter("occasionPortfolio", (records, page, limit = 8) => {
    const split =
      page.key === "first-birthday-boys"
        ? "first-birthday-boy"
        : page.key === "first-birthday-girls"
          ? "first-birthday-girl"
          : null;
    return records
      .filter((record) => record.occasions.includes(split || page.taxonomy))
      .slice(0, limit);
  });
  eleventyConfig.addFilter(
    "occasionPortfolioIntro",
    (key) =>
      ({
        birthday:
          "Explore real PureBakes birthday cakes created in a wide range of themes, styles and celebration formats.",
        "first-birthday-boys":
          "Explore real PureBakes first birthday cakes for boys, personalised around favourite colours, characters and playful themes.",
        "first-birthday-girls":
          "Explore real PureBakes first birthday cakes for girls, created with colours, themes and details chosen for the celebration.",
        anniversary:
          "Explore real PureBakes anniversary cakes designed for personal stories, shared memories and milestone years.",
        engagement:
          "Explore real PureBakes engagement cakes created to complement the couple, setting and celebration style.",
        wedding:
          "Explore elegant PureBakes wedding cakes designed as made-to-order centrepieces for Hyderabad celebrations.",
        "baby-shower":
          "Explore real PureBakes baby shower cakes designed around colours, themes and personal celebration details.",
      })[key],
  );
  eleventyConfig.addFilter("findByKey", (records, key) =>
    records.find((record) => record.key === key),
  );
  eleventyConfig.addTransform("environmentBasePath", function (content) {
    if (!basePath || this.page.outputPath?.endsWith(".html") !== true)
      return content;
    const rewriteAttribute = (match, name, quote, value) =>
      `${name}=${quote}${publicUrl(value)}${quote}`;
    let output = content.replace(
      /\b(href|src|action|poster)=(['"])(\/[^/'"][^'"]*|\/)\2/g,
      rewriteAttribute,
    );
    output = output.replace(
      /\bsrcset=(['"])([^'"]+)\1/g,
      (match, quote, value) => {
        const rewritten = value
          .split(",")
          .map((candidate) => {
            const parts = candidate.trim().split(/\s+/);
            parts[0] = publicUrl(parts[0]);
            return parts.join(" ");
          })
          .join(", ");
        return `srcset=${quote}${rewritten}${quote}`;
      },
    );
    return output;
  });
  eleventyConfig.addTransform("externalCustomerLinks", function (content) {
    if (this.page.outputPath?.endsWith(".html") !== true) return content;
    return content.replace(/<a\b([^>]*)>/gi, (anchor, attributes) => {
      const href = attributes.match(/\bhref=(['"])(https?:\/\/[^'"]+)\1/i)?.[2];
      if (!href) return anchor;
      let hostname;
      try {
        hostname = new URL(href.replace(/&amp;/g, "&")).hostname.toLowerCase();
      } catch {
        return anchor;
      }
      if (hostname === "purebakes.in" || hostname.endsWith(".purebakes.in"))
        return anchor;
      const cleaned = attributes
        .replace(/\s+target=(['"])[^'"]*\1/gi, "")
        .replace(/\s+rel=(['"])[^'"]*\1/gi, "");
      return `<a${cleaned} target="_blank" rel="noopener noreferrer">`;
    });
  });
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
