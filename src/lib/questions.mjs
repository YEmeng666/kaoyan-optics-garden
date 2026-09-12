export const typeLabels={choice:'选择题',short:'简答题',calculation:'计算题',mixed:'计算／简答／作图综合'};
export const sourceLabels={compilation:'汇编版',recall:'回忆版',approximation:'汇编近似题 · 非真题'};
export function matchesQuestion(q, state={}) {
 const source=state.source||'past';
 if(source==='past'&&q.sourceKind==='approximation')return false;
 if(!['past','all'].includes(source)&&q.sourceKind!==source)return false;
 if(state.year&&String(q.year)!==state.year)return false;
 if(state.chapter&&q.chapter!==state.chapter)return false;
 if(state.type&&q.type!==state.type)return false;
 if(state.topic&&q.topic!==state.topic)return false;
 if(state.pattern&&!q.patterns.includes(state.pattern))return false;
 const query=(state.query||'').trim().toLowerCase();
 return !query||query.split(/\s+/).every(term=>`${q.year} ${q.section} ${q.number} ${q.title} ${q.topic} ${q.notes.join(' ')}`.toLowerCase().includes(term));
}
