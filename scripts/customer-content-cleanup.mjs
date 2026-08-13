import { readFile, writeFile } from "node:fs/promises";

const file = "src/_data/seo-pages/locations.json";
const locations = JSON.parse(await readFile(file, "utf8"));
const descriptions = {
  "ameerpet": "Discover made-to-order PureBakes cakes for birthdays, family occasions and workplace celebrations in Ameerpet.",
  "banjara-hills": "Explore design-led PureBakes cakes for birthdays, anniversaries and milestone celebrations in Banjara Hills.",
  "begumpet": "Find real PureBakes cake inspiration for family milestones, office occasions and celebrations around Begumpet.",
  "dilsukhnagar": "Explore personalised PureBakes cakes for birthdays, engagements and family celebrations across Dilsukhnagar.",
  "financial-district": "Discover refined PureBakes cakes for corporate occasions, family milestones and celebrations in the Financial District.",
  "gachibowli": "Browse real PureBakes cakes for workplace milestones, birthdays and family celebrations across Gachibowli.",
  "hayathnagar": "Explore made-to-order PureBakes cakes for birthdays, anniversaries and family occasions in Hayathnagar.",
  "hitec-city": "Find PureBakes cakes for team milestones, employee birthdays and family celebrations around HITEC City.",
  "jubilee-hills": "Explore elegant, design-led PureBakes cakes for milestone birthdays, engagements and celebrations in Jubilee Hills.",
  "kokapet": "Discover personalised PureBakes cakes for birthdays and family milestones across Kokapet’s newer residential communities.",
  "kompally": "Browse real PureBakes cake designs for first birthdays, anniversaries and family celebrations in Kompally.",
  "kondapur": "Explore made-to-order PureBakes cakes for family celebrations and workplace occasions across Kondapur.",
  "kukatpally": "Find real PureBakes cakes for birthdays, anniversaries and celebrations across Kukatpally’s residential and commercial neighbourhoods.",
  "lb-nagar": "Explore personalised PureBakes cakes for birthdays, anniversaries and family celebrations across LB Nagar.",
  "madhapur": "Discover PureBakes cakes for workplace celebrations, milestone birthdays and family occasions in Madhapur’s business corridor.",
  "manikonda": "Browse made-to-order PureBakes cakes for birthdays, engagements and family milestones in Manikonda.",
  "miyapur": "Explore real PureBakes cake inspiration for first birthdays, anniversaries and family occasions across Miyapur.",
  "nallagandla": "Discover personalised PureBakes cakes for birthdays, baby showers and family milestones in Nallagandla.",
  "nanakramguda": "Find refined PureBakes cakes for office occasions, birthdays and family celebrations around Nanakramguda.",
  "narsingi": "Explore made-to-order PureBakes cakes for birthdays, engagements and celebrations in Narsingi’s growing residential communities.",
  "patancheru": "Browse real PureBakes cakes for first birthdays, anniversaries and family celebrations across Patancheru.",
  "puppalaguda": "Discover personalised PureBakes cakes for birthdays, baby showers and milestone celebrations in Puppalaguda.",
  "secunderabad": "Explore real PureBakes cakes for birthdays, engagements and family milestones across established Secunderabad neighbourhoods.",
  "somajiguda": "Find elegant PureBakes cakes for anniversaries, office occasions and intimate celebrations in Somajiguda.",
  "tellapur": "Browse made-to-order PureBakes cakes for first birthdays, baby showers and family celebrations in Tellapur.",
  "uppal": "Explore personalised PureBakes cakes for family milestones and workplace celebrations across Uppal.",
  "vanasthalipuram": "Discover real PureBakes cake designs for birthdays, anniversaries and family occasions in Vanasthalipuram.",
  "neopolis": "Find contemporary PureBakes cake inspiration for birthdays, engagements and family milestones in Neopolis.",
  "raidurgam": "Explore PureBakes cakes for team celebrations, birthdays and family occasions around Raidurgam’s business corridor.",
  "shamshabad": "Browse made-to-order PureBakes cakes for family milestones, venue events and celebrations along the Shamshabad airport corridor.",
  "bachupally": "Discover personalised PureBakes cakes for children’s birthdays, baby showers and family milestones in Bachupally.",
  "himayatnagar": "Explore real PureBakes cakes for family celebrations, student milestones and intimate occasions in Himayatnagar.",
  "khairatabad": "Find made-to-order PureBakes cakes for workplace occasions, birthdays and family milestones in Khairatabad.",
  "malkajgiri": "Browse personalised PureBakes cakes for first birthdays, anniversaries and family celebrations across Malkajgiri.",
  "mehdipatnam": "Explore real PureBakes cakes for birthdays, engagements and family milestones around Mehdipatnam.",
  "moosapet": "Discover made-to-order PureBakes cakes for family birthdays and workplace celebrations in Moosapet.",
  "nacharam": "Find PureBakes cake inspiration for family occasions, team milestones and celebrations across Nacharam.",
  "nizampet": "Explore personalised PureBakes cakes for first birthdays, baby showers and family milestones in Nizampet.",
  "punjagutta": "Browse real PureBakes cakes for office occasions, anniversaries and family celebrations in Punjagutta.",
  "tarnaka": "Discover made-to-order PureBakes cakes for family celebrations, graduations and academic milestones around Tarnaka.",
  "tolichowki": "Explore personalised PureBakes cakes for birthdays, engagements and family celebrations across Tolichowki."
};

if (locations.length !== 41 || Object.keys(descriptions).length !== 41) throw new Error("Expected 41 location descriptions");
for (const location of locations) {
  location.description = descriptions[location.key];
  if (!location.description) throw new Error(`Missing description for ${location.key}`);
  if (location.areaContext?.text) {
    location.areaContext.text = location.areaContext.text
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => !/\b(?:cab|delivery|transport(?:ation)?)\b/i.test(sentence))
      .join(" ");
  }
}
await writeFile(file, `${JSON.stringify(locations, null, 2)}\n`);
console.log("Rewrote 41 location descriptions and separated locality context from transport details.");
