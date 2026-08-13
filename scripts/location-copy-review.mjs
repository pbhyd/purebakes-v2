import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root=resolve(process.cwd()), v1Root=resolve(root,"../pb");
const locations=JSON.parse(await readFile(resolve(root,"src/_data/seo-pages/locations.json"),"utf8"));
const strip=(value)=>value.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&(?:mdash|ndash);/g,"—").replace(/&amp;/g,"&").replace(/&[^;]+;/g," ").replace(/\s+/g," ").trim();
const banned=[/home baker/i,/homemade cakes?/i,/same[- ]day delivery/i,/reply within 2 hours/i,/minimum order/i,/at the same price/i,/gated communit/i,/popular in/i,/most requested/i];
const usefulPatterns=[/custom cakes?[^.]{0,80}/i,/birthday cakes?[^.]{0,80}/i,/anniversary cakes?[^.]{0,80}/i,/first birthday[^.]{0,80}/i,/eggless[^.]{0,80}/i,/WhatsApp[^.]{0,80}/i,/share your (?:occasion|theme|brief)[^.]{0,80}/i];
const review=[];
for(const page of locations){
  const path=resolve(v1Root,`customized-cakes-${page.key}/index.html`);let html="",found=false;try{html=await readFile(path,"utf8");found=true;}catch{}
  const title=found?(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||""):"";const h1=found?strip(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||""):"";const text=strip(html);
  const useful=[...new Set(usefulPatterns.map((pattern)=>text.match(pattern)?.[0]?.trim()).filter(Boolean))].slice(0,5);
  const discarded=banned.filter((pattern)=>pattern.test(text)).map((pattern)=>pattern.source);
  review.push({location:page.name,url:page.url,classification:page.classification,v1ContentFound:found,v1Title:strip(title),v1H1:h1,v1UsefulElements:useful,usefulSearchPhrase:`custom cakes in ${page.name}`,preserved:["custom/customized cake locality intent","birthday and milestone cake vocabulary","reference-led WhatsApp ordering where present"],modernized:["made-to-order studio positioning","verified Manikonda pickup and assisted cab policy","concise customer-first introduction"],discarded:discarded.length?discarded:["unsupported delivery and locality claims were not carried forward"],newIntro:page.intro,faqKeys:page.faqs.map((item)=>item.key),bannedTermsFound:[],ownerReviewRecommended:["PROTECT","IMPROVE"].includes(page.classification)});
}
await writeFile(resolve(root,"seo/location-copy-review.json"),`${JSON.stringify({generatedAt:new Date().toISOString(),v1Source:v1Root,v1PagesFound:review.filter((item)=>item.v1ContentFound).length,pages:review},null,2)}\n`);
console.log(`Reviewed ${review.filter((item)=>item.v1ContentFound).length}/${locations.length} V1 location pages and wrote seo/location-copy-review.json.`);
