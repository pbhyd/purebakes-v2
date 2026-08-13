import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const path = resolve("src/_data/gallery/existing-gallery.json");
const records = JSON.parse(await readFile(path, "utf8"));
for (const record of records) {
  record.occasions = record.occasions.filter((key) => !["first-birthday-boy", "first-birthday-girl"].includes(key));
  if (record.occasions.includes("first-birthday") && record.audience?.includes("boy")) record.occasions.push("first-birthday-boy");
  if (record.occasions.includes("first-birthday") && record.audience?.includes("girl")) record.occasions.push("first-birthday-girl");
}
await writeFile(path, `${JSON.stringify(records, null, 2)}\n`);
console.log("Added controlled first-birthday-boy/girl occasion keys using only existing reliable audience metadata.");
