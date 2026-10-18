import practice from '../../content/knowledge-practice.mjs';
import {knowledge,patterns,formulas} from './data.mjs';

export const topicPatterns=k=>patterns.filter(p=>p.knowledge===k.id||(k.id==='sources'&&['young','film'].includes(p.id))||(k.id==='instruments'&&p.id==='fabry'));
export const studyTopics=knowledge.map(k=>({id:k.id,title:k.title,chapter:k.chapter,formulaIds:[...new Set(topicPatterns(k).flatMap(p=>p.formulas))]})).sort((a,b)=>Number(a.chapter)-Number(b.chapter));
export const studyCards=[
 ...formulas.map(f=>({id:`formula:${f.id}`,kind:'formula',title:f.title,topicIds:studyTopics.filter(t=>t.formulaIds.includes(f.id)).map(t=>t.id),prompt:`请默写“${f.title}”，说明符号含义、适用条件和一个容易误用的地方。`,latex:f.latex,symbols:f.symbols,conditions:f.conditions,trap:f.trap,source:f.source})),
 ...knowledge.flatMap(k=>{
  const record=practice[k.id],pattern=patterns.find(p=>p.id===record.pattern);
  const worked=record.worked??{question:pattern.example.question,cue:pattern.first,steps:pattern.example.steps.map((action,i)=>({action,why:record.reasons[i]})),answer:pattern.example.answer,check:pattern.example.check};
  return [['worked',worked],['practice',record.practice]].map(([variant,q])=>({id:`${variant}:${k.id}`,kind:'question',variant,title:`${k.title} · ${variant==='worked'?'例题':'课后自测'}`,topicIds:[k.id],prompt:q.question,cue:q.cue,steps:q.steps,answer:q.answer,check:q.check,source:'本站 AI 原创辅助题 · 非历年真题、非教材原题'}));
 })
];
