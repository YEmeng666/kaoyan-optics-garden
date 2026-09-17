import type {APIRoute} from 'astro';
import aliases from '../../../content/search-aliases.json';
import {href,knowledge} from '../../lib/data.mjs';

const texts=import.meta.glob('../../../content/knowledge/*.md',{eager:true,query:'?raw',import:'default'});

export const prerender=true;

export const GET:APIRoute=()=>{
 const documents=knowledge.map(k=>({
  ...k,
  aliases:aliases[k.id as keyof typeof aliases]||[],
  url:href(`knowledge/${k.id}/`),
  text:texts[`../../../content/knowledge/${k.id}.md`]
 }));
 return new Response(JSON.stringify(documents),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=3600'}});
};
