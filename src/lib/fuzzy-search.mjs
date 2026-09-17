export const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu,'');
// Short queries require literal matching; longer terms allow one edit.
function oneEdit(a,b) {
 if(Math.abs(a.length-b.length)>1)return false;
 if(a===b)return true;
 if(a.length===b.length){const d=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])d.push(i);return d.length===1||(d.length===2&&d[1]===d[0]+1&&a[d[0]]===b[d[1]]&&a[d[1]]===b[d[0]]);}
 const [short,long]=a.length<b.length?[a,b]:[b,a];let i=0;while(i<short.length&&short[i]===long[i])i++;return short.slice(i)===long.slice(i+1);
}
function match(term,doc) {
 const title=normalize(doc.title),aliases=(doc.aliases||[]).map(normalize);
 if(title===term)return {score:120,reason:'名称匹配'};
 if(aliases.includes(term))return {score:110,reason:'相关名称：'+doc.aliases[aliases.indexOf(term)]};
 if(title.includes(term))return {score:100,reason:'名称包含关键词'};
 if(aliases.some(a=>a.includes(term)))return {score:90,reason:'相关名称包含关键词'};
 const containsProse=value=>/^[a-z0-9]+$/.test(term)?(String(value??'').normalize('NFKC').toLowerCase().match(/[a-z0-9]+/g)||[]).some(word=>word.includes(term)):normalize(value).includes(term);
 if(containsProse(doc.summary))return {score:70,reason:'简介匹配'};
 if(containsProse(doc.text))return {score:50,reason:'正文匹配'};
 if(term.length>=3&&term.length<=32&&!/^\d+$/.test(term))for(const candidate of [doc.title,...(doc.aliases||[])])if(oneEdit(term,normalize(candidate)))return {score:35,reason:'近似匹配：'+candidate};
 return null;
}
export function searchKnowledge(query,documents) {
 const raw=String(query??'').slice(0,100).trim();if(!normalize(raw))return [];
 const tokens=raw.split(/\s+/u).map(normalize).filter(Boolean).slice(0,12),whole=normalize(raw);
 return documents.flatMap(doc=>{const direct=match(whole,doc),parts=tokens.length>1?tokens.map(t=>match(t,doc)):[];
 const combined=parts.length&&parts.every(Boolean)?{score:Math.min(...parts.map(p=>p.score))-5,reason:'组合关键词匹配'}:null;
 const best=direct&&(!combined||direct.score>=combined.score)?direct:combined;
 return best?[{...doc,...best}]:[];}).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'zh-CN'));
}
