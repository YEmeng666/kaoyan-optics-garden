export const STORAGE_KEY='optics-garden-study-v1';
export const LEVELS=['未掌握','需提示','基本掌握','熟练掌握'];
const DAY=86400000;
export const emptyState=()=>({version:1,cards:{},concepts:{}});
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const validDate=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
export function validateState(input,cardIds,topicIds){
 if(!object(input)||input.version!==1||!object(input.cards)||!object(input.concepts))throw new Error('不是受支持的学习记录文件');
 const state=emptyState(),allowedCards=new Set(cardIds),allowedTopics=new Set(topicIds);
 for(const [id,r] of Object.entries(input.cards)){
  if(!allowedCards.has(id))continue;
  if(!object(r)||![0,1,2,3].includes(r.level)||!Number.isInteger(r.reviews)||r.reviews<1||r.reviews>100000||!Number.isInteger(r.streak)||r.streak<0||r.streak>100000||!validDate(r.updatedAt)||!validDate(r.dueAt))throw new Error('卡片记录格式损坏');
  state.cards[id]={level:r.level,reviews:r.reviews,streak:r.streak,updatedAt:r.updatedAt,dueAt:r.dueAt};
 }
 for(const [id,r] of Object.entries(input.concepts)){
  if(!allowedTopics.has(id))continue;
  if(!object(r)||![0,1,2,3].includes(r.level)||!validDate(r.updatedAt))throw new Error('知识点记录格式损坏');
  state.concepts[id]={level:r.level,updatedAt:r.updatedAt};
 }
 return state;
}
export function mergeStates(a,b){
 const merged=emptyState();
 for(const kind of ['cards','concepts'])for(const state of [a,b])for(const [id,r] of Object.entries(state[kind]))if(!merged[kind][id]||Date.parse(r.updatedAt)>Date.parse(merged[kind][id].updatedAt))merged[kind][id]=r;
 return merged;
}
export function rateCard(state,id,level,now=Date.now()){
 if(![0,1,2,3].includes(level))throw new Error('无效的自评');
 const previous=state.cards[id],streak=level>=2?(previous?.streak||0)+1:0;
 const interval=level===0?10/1440:level===1?1:level===2?[1,3,7,14,30][Math.min(streak-1,4)]:[3,7,14,30,60][Math.min(streak-1,4)];
 return {...state,cards:{...state.cards,[id]:{level,streak,reviews:(previous?.reviews||0)+1,updatedAt:new Date(now).toISOString(),dueAt:new Date(now+interval*DAY).toISOString()}}};
}
export function setConcept(state,id,level,now=Date.now()){
 if(![0,1,2,3].includes(level))throw new Error('无效的掌握程度');
 return {...state,concepts:{...state.concepts,[id]:{level,updatedAt:new Date(now).toISOString()}}};
}
export function topicProgress(topic,cards,state,now=Date.now()){
 const related=cards.filter(c=>c.topicIds.includes(topic.id));
 const mean=kind=>{const list=related.filter(c=>c.kind===kind);return list.length?list.reduce((sum,c)=>sum+(state.cards[c.id]?.level||0)/3,0)/list.length:null;};
 const concept=(state.concepts[topic.id]?.level||0)/3,formula=mean('formula'),question=mean('question');
 const dimensions=[[concept,20],[formula,40],[question,40]].filter(([value])=>value!==null);
 const percent=Math.round(100*dimensions.reduce((sum,[value,weight])=>sum+value*weight,0)/dimensions.reduce((sum,[,weight])=>sum+weight,0));
 const due=related.filter(c=>state.cards[c.id]&&Date.parse(state.cards[c.id].dueAt)<=now).length;
 const learned=related.filter(c=>state.cards[c.id]).length;
 return {percent,due,learned,total:related.length,concept,formula,question};
}
export function buildQueue(cards,topics,state,{topic='',chapter='',kind='all',scope='due',limit=20}={},now=Date.now()){
 const allowed=new Set(topics.filter(t=>(!topic||t.id===topic)&&(!chapter||t.chapter===chapter)).map(t=>t.id));
 return cards.filter(c=>(kind==='all'||c.kind===kind)&&c.topicIds.some(id=>allowed.has(id))).filter(c=>{
  const r=state.cards[c.id];return scope==='all'||(scope==='weak'?!!r&&r.level<2:!r||Date.parse(r.dueAt)<=now);
 }).sort((a,b)=>{
  const ra=state.cards[a.id],rb=state.cards[b.id];
  const priority=r=>!r?1:Date.parse(r.dueAt)<=now?0:2;
  return priority(ra)-priority(rb)||(ra?.level||0)-(rb?.level||0)||(ra?Date.parse(ra.dueAt):0)-(rb?Date.parse(rb.dueAt):0)||a.id.localeCompare(b.id);
 }).slice(0,Math.max(1,Math.min(100,Number(limit)||20)));
}
