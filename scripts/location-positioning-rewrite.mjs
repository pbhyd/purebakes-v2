import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../src/_data/seo-pages/locations.json", import.meta.url);
const locations = JSON.parse(await readFile(file, "utf8"));
const servicePatterns = [
  (name) => `PureBakes serves celebrations in ${name} with made-to-order cakes. Cab delivery assistance can be discussed when the design and destination are suitable; the customer pays the applicable fare.`,
  (name) => `Planning a cake for ${name}? We can discuss assisted cab transportation after the design is confirmed, subject to suitability and cab availability. Applicable charges are paid by the customer.`,
  (name) => `Orders for ${name} are coordinated directly with PureBakes. Pickup details are shared during order coordination, or we can help arrange a customer-paid cab when appropriate for the cake.`,
  (name) => `PureBakes can serve a celebration in ${name} and help coordinate a suitable Uber or cab when needed. Transport depends on the cake, destination and available cab service, with the fare paid by the customer.`,
  (name) => `For a celebration in ${name}, begin with the date and cake brief. Once the design is agreed, pickup or assisted cab transportation can be coordinated; cab charges remain the customer’s responsibility.`
];

for (const [index, location] of locations.entries()) {
  location.description = `Explore real PureBakes cake designs for ${location.name} celebrations, with cab delivery assistance and helpful occasion and theme inspiration.`;
  location.serviceContext = servicePatterns[index % servicePatterns.length](location.name);
  if (/manikonda/i.test(location.intro)) {
    const replacements = {
      manikonda: "Planning a birthday, anniversary or engagement in Manikonda? Explore real PureBakes designs below, then check your date and share the colours, theme or reference you would like us to work with.",
      neopolis: "Planning a special occasion in Neopolis? PureBakes makes custom cakes for birthdays, weddings, anniversaries and family milestones. Explore the real designs below, then share your reference or preferred style when you check availability.",
      shamshabad: "Have a celebration coming up in Shamshabad? Start by checking the date, then share the cake style, colours or reference you have in mind. PureBakes will discuss the design and transportation suitability with you."
    };
    location.intro = replacements[location.key];
  }
  for (const faq of location.faqs) {
    if (faq.key.startsWith("custom-")) faq.answer = `Yes. PureBakes makes custom cakes for birthdays and other celebrations in ${location.name}. Share your required date and design direction so availability and suitable transportation can be discussed.`;
    if (faq.key === "pickup") faq.answer = "Pickup details are shared during order coordination. We can also discuss cab assistance when suitable for the cake and destination.";
  }
}

await writeFile(file, `${JSON.stringify(locations, null, 2)}\n`);
console.log(`Repositioned ${locations.length} location records without changing keys, URLs, titles, H1s, classifications or portfolio selections.`);
