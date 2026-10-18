export function buildExamTypes(guides,index,questions,knowledge){
 const qmap=new Map(questions.map(q=>[q.id,q])),kmap=new Map(knowledge.map(k=>[k.id,k]));
 const seen=new Set();
 const groups=guides.map(g=>{
  if(!kmap.has(g.knowledge))throw new Error(`Unknown knowledge ${g.knowledge}`);
  const records=index.assignments.filter(a=>a.typeId===g.id).map(a=>{
   const q=qmap.get(a.questionId);if(!q||q.sourceKind==='approximation'||seen.has(q.id))throw new Error(`Invalid exam assignment ${a.questionId}`);
   if(q.chapter!==kmap.get(g.knowledge).chapter)throw new Error(`Chapter mismatch ${q.id}`);
   seen.add(q.id);return q;
  }).sort((a,b)=>b.year-a.year||a.id.localeCompare(b.id));
  if(!records.length)throw new Error(`No evidence for ${g.id}`);
  return {...g,records,years:[...new Set(records.map(q=>q.year))].sort((a,b)=>a-b)};
 });
 if(seen.size!==questions.filter(q=>q.sourceKind!=='approximation').length||index.assignments.length!==seen.size)throw new Error('Every regular exam record must have one primary type');
 return knowledge.map(k=>({...k,groups:groups.filter(g=>g.knowledge===k.id)})).sort((a,b)=>Number(a.chapter)-Number(b.chapter));
}
export function filterExamTopics(topics,{chapter='',query='',year='',type=''}={}){
 const tokens=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return topics.filter(t=>(!chapter||t.chapter===chapter)).flatMap(t=>{
  const groups=t.groups.filter(g=>(!year||g.records.some(q=>String(q.year)===year&&(!type||q.type===type)))&&(!type||g.records.some(q=>q.type===type&&(!year||String(q.year)===year)))&&tokens.every(term=>`${t.title} ${g.title} ${g.asks} ${g.records.map(q=>`${q.year} ${q.title}`).join(' ')}`.toLowerCase().includes(term)));
  return groups.length||(!tokens.length&&!year&&!type&&!t.groups.length)?[{...t,groups}]:[];
 });
}
