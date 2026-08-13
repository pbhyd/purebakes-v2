const environment = process.env.SITE_ENV || "development";
const production = environment === "production";
const staging = environment === "staging";

export default {
  environment,
  url: process.env.SITE_URL || (production ? "https://purebakes.in/" : staging ? "https://new.purebakes.in/" : "http://localhost:8080/"),
  productionUrl: "https://purebakes.in/",
  robots: production ? "index, follow" : "noindex, nofollow",
  analyticsEnabled: production && process.env.ANALYTICS_ENABLED !== "false",
  gaMeasurementId: process.env.GA_MEASUREMENT_ID || "G-CTSJRZ95NF",
  clarityProjectId: process.env.CLARITY_PROJECT_ID || "xwenvndp7j",
  buildDate: new Date().toISOString().slice(0, 10)
};
