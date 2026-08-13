import { rm } from "node:fs/promises";
import { basename, resolve } from "node:path";
const output = resolve(process.cwd(), "_site");
if (basename(output) !== "_site") throw new Error(`Refusing to clean unexpected output path: ${output}`);
await rm(output, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
