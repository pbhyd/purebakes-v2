import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, join } from "node:path";

const mode = process.argv[2];
if (!['staging', 'production'].includes(mode)) throw new Error('Usage: node scripts/launch-validate.mjs staging|production');
const root = resolve('_site'); const errors = []; const htmlFiles = [];
async function walk(dir) { for (const name of await readdir(dir)) { const path = join(dir, name); (await stat(path)).isDirectory() ? await walk(path) : path.endsWith('.html') && htmlFiles.push(path); } }
await walk(root);
const pages = await Promise.all(htmlFiles.map(async (path) => ({ path, html: await readFile(path, 'utf8') })));
const cakeSources = (await readdir(resolve('src/assets/images/cakes'), { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith('.webp'));
if (cakeSources.length !== 472) errors.push(`Expected 472 canonical cake sources, found ${cakeSources.length}`);
if (cakeSources.some(({ name }) => /-(360|540|720|900)\.webp$/.test(name))) errors.push('Generated derivative found in canonical source folder');
if (pages.length !== 65) errors.push(`Expected 65 generated HTML files including 404, found ${pages.length}`);
for (const { path, html } of pages) {
  const rel = path.slice(root.length);
  const noindex = /<meta name="robots" content="noindex, nofollow">/i.test(html);
  const gaCount = (html.match(/googletagmanager\.com\/gtag\/js/gi) || []).length;
  if (mode === 'staging' && !noindex) errors.push(`${rel}: staging page is indexable`);
  if (mode === 'staging' && gaCount) errors.push(`${rel}: analytics present on staging`);
  if (mode === 'production' && noindex) errors.push(`${rel}: production page is noindex`);
  if (mode === 'production' && gaCount !== 1) errors.push(`${rel}: expected GA4 once, found ${gaCount}`);
  if (/https:\/\/new\.purebakes\.in/i.test(html)) errors.push(`${rel}: staging hostname leaked into page output`);
}
const robots = await readFile(join(root, 'robots.txt'), 'utf8');
if (mode === 'staging' && !/Disallow: \//.test(robots)) errors.push('Staging robots does not disallow all crawling');
if (mode === 'production' && /Disallow: \//.test(robots)) errors.push('Production robots disallows all crawling');
const siteJs = await readFile(join(root, 'assets/js/site.js'), 'utf8');
for (const token of ['check_availability_open', 'check_availability_continue', 'whatsapp_click', '919980213333']) if (!siteJs.includes(token)) errors.push(`Missing site integration token: ${token}`);
const social = JSON.parse(await readFile(resolve('src/_data/business.json'), 'utf8')).social;
for (const [network, url] of Object.entries(social)) if (!pages[0].html.includes(url) && !pages.some(({ html }) => html.includes(url))) errors.push(`Official ${network} URL absent from output`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Launch validation passed for ${mode}: ${pages.length} HTML files, 472 canonical gallery sources, environment indexing/analytics controls, social and conversion integrations.`);
