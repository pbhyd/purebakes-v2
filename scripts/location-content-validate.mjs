import { createHash } from "node:crypto";
import { access, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root=resolve(process.cwd()), output=resolve(root,"_site"), errors=[], suspicious=[];
const audit=JSON.parse(await readFile(resolve(root,"seo/location-page-audit.json"),"utf8"));
const locations=JSON.parse(await readFile(resolve(root,"src/_data/seo-pages/locations.json"),"utf8"));
const gallery=JSON.parse(await readFile(resolve(root,"src/_data/gallery/existing-gallery.json"),"utf8"));
const differentiation=JSON.parse(await readFile(resolve(root,"seo/location-content-differentiation.json"),"utf8"));
const bannedPublic=[/search visibility/i,/Search Console/i,/audited service area/i,/\blegacy\b/i,/\bmigration\b/i,/\bcanonical\b/i,/\bSEO\b/i,/\branking\b/i,/FAQ mix/i,/portfolio mix/i,/intent retained/i,/page intent/i,/internal linking/i,/this page/i]; let bannedPublicCount=0;
const galleryIds=new Set(gallery.map((item)=>item.id)); const expectedUrls=new Set(audit.pages.map((page)=>new URL(page.url).pathname));
if(locations.length!==41)errors.push(`Expected 41 location pages, found ${locations.length}`);
for(const [key,count] of Object.entries({PROTECT:5,IMPROVE:6,RETAIN:30}))if(locations.filter((item)=>item.classification===key).length!==count)errors.push(`${key} count changed`);
if(differentiation.pages.length!==41)errors.push("Differentiation report does not cover 41 pages");
const unique=(field)=>{const values=locations.map((item)=>item[field]);if(new Set(values).size!==values.length)errors.push(`Duplicate location ${field}`);};
for(const field of ["url","canonical","title","h1","description","intro"])unique(field);
const normalize=(text)=>new Set(text.toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter((word)=>word.length>3&&!new Set(["purebakes","cakes","cake","custom","page","celebration","celebrations","customers","customer","design"]).has(word)));
const jaccard=(a,b)=>{const intersection=[...a].filter((item)=>b.has(item)).length;return intersection/new Set([...a,...b]).size;};
let maxIntro={score:0,pages:[]},maxImages={score:0,pages:[]};
for(let i=0;i<locations.length;i++)for(let j=i+1;j<locations.length;j++){
  const introScore=jaccard(normalize(locations[i].intro),normalize(locations[j].intro)); if(introScore>maxIntro.score)maxIntro={score:introScore,pages:[locations[i].key,locations[j].key]}; if(introScore>=0.65)suspicious.push({type:"intro",score:introScore,pages:[locations[i].key,locations[j].key]});
  const imageScore=jaccard(new Set(locations[i].portfolioImageIds),new Set(locations[j].portfolioImageIds));if(imageScore>maxImages.score)maxImages={score:imageScore,pages:[locations[i].key,locations[j].key]};if(imageScore>=0.75)suspicious.push({type:"portfolio",score:imageScore,pages:[locations[i].key,locations[j].key]});
  const faqScore=jaccard(new Set(locations[i].faqs.map((item)=>item.key)),new Set(locations[j].faqs.map((item)=>item.key)));if(faqScore>=0.8)suspicious.push({type:"faq",score:faqScore,pages:[locations[i].key,locations[j].key]});
}
for(const page of locations){
  if(!expectedUrls.has(page.url))errors.push(`${page.key}: legacy URL changed`); if(page.canonical!==`https://purebakes.in${page.url}`)errors.push(`${page.key}: canonical is not self-referencing`);
  if(page.portfolioImageIds.length!==8||new Set(page.portfolioImageIds).size!==8)errors.push(`${page.key}: portfolio must contain 8 unique IDs`);for(const id of page.portfolioImageIds)if(!galleryIds.has(id))errors.push(`${page.key}: unknown image ${id}`);
  if(page.nearby.some((key)=>!locations.some((item)=>item.key===key)))errors.push(`${page.key}: invalid nearby link`);if(page.faqs.length<3||page.faqs.length>5)errors.push(`${page.key}: expected 3–5 FAQs`);
  const file=resolve(output,page.url.slice(1),"index.html");try{await access(file);}catch{errors.push(`${page.key}: generated legacy URL missing`);continue;}const html=await readFile(file,"utf8");
  const main=(html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1]||"").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ");for(const pattern of bannedPublic)if(pattern.test(main)){bannedPublicCount++;errors.push(`${page.key}: customer copy contains banned internal language ${pattern}`);}
  if(!html.includes(`<link rel="canonical" href="${page.canonical}">`))errors.push(`${page.key}: generated canonical mismatch`);if(!html.includes(`data-page-classification="${page.classification}"`))errors.push(`${page.key}: analytics classification missing`);
  if(new RegExp(`addressLocality\"\s*:\s*\"${page.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\"`,"i").test(html)&&page.key!=="manikonda")errors.push(`${page.key}: fake local branch schema`);
  const faqJson=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((match)=>{try{return JSON.parse(match[1]);}catch{return null;}}).find((item)=>item?.["@type"]==="FAQPage");
  if(!faqJson||faqJson.mainEntity.length!==page.faqs.length)errors.push(`${page.key}: FAQ schema count mismatch`);else for(let index=0;index<page.faqs.length;index++)if(faqJson.mainEntity[index].name!==page.faqs[index].question||faqJson.mainEntity[index].acceptedAnswer.text!==page.faqs[index].answer)errors.push(`${page.key}: FAQ schema content mismatch`);
}
for(const url of expectedUrls)if(!locations.some((item)=>item.url===url))errors.push(`Missing audited URL ${url}`);
if(suspicious.length)errors.push(`${suspicious.length} suspicious location-content pair(s) detected`);
const result={generatedAt:new Date().toISOString(),pages:locations.length,classifications:{PROTECT:5,IMPROVE:6,RETAIN:30},uniqueIntros:new Set(locations.map((item)=>item.intro)).size,distinctPortfolioSelections:new Set(locations.map((item)=>item.portfolioImageIds.join(","))).size,suspicious,maxIntroSimilarity:maxIntro,maxPortfolioOverlap:maxImages,fakeBranchSchemas:errors.filter((item)=>item.includes("fake local branch")).length,customerVisibleInternalLanguage:bannedPublicCount};
await writeFile(resolve(root,"seo/location-content-validation.json"),`${JSON.stringify(result,null,2)}\n`);
if(errors.length){console.error(errors.join("\n"));process.exit(1);}console.log(`Location content validation passed: 41 pages, 41 unique intros, 41 distinct portfolios, 0 suspicious pairs, 0 fake branch schemas; maximum image overlap ${(maxImages.score*100).toFixed(1)}%.`);
