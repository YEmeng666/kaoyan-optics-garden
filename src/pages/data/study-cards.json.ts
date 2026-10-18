import type {APIRoute} from 'astro';
import katex from 'katex';
import {studyCards} from '../../lib/study-data.mjs';
export const prerender=true;
export const GET:APIRoute=()=>new Response(JSON.stringify(studyCards.map(card=>({...card,...(card.latex?{math:katex.renderToString(card.latex,{displayMode:true,throwOnError:true,output:'htmlAndMathml'})}:{})}))),{headers:{'Content-Type':'application/json; charset=utf-8'}});
