import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const directory = resolve("src/_data/gallery");
export default readdirSync(directory).filter((file) => file.endsWith(".json") && !file.endsWith(".starter.json")).sort().flatMap((file) => JSON.parse(readFileSync(resolve(directory, file), "utf8")));
