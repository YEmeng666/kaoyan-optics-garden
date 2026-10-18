import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import guides from '../content/exam-type-guides.mjs';
import {buildExamTypes,filterExamTopics} from '../src/lib/exam-types.mjs';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const questions=read('content/questions.json').questions,index=read('content/exam-type-index.json');
const patterns=read('content/patterns.json');
const knowledge=[...['conditions','sources','two-beam','multiple','films','instruments','coherence'].map(id=>({id,chapter:'5',title:id})),...read('content/supplement.json')];
const topics=buildExamTypes(guides,index,questions,knowledge);
test('每条非近似题只归入一个有证据的主考法，年份和题号原样保留',()=>{
 const records=topics.flatMap(t=>t.groups.flatMap(g=>g.records));
 assert.equal(records.length,399);assert.equal(new Set(records.map(q=>q.id)).size,399);
 assert.equal(topics.length,29);assert.equal(new Set(guides.map(g=>g.id)).size,guides.length);
 for(const g of guides){assert.ok(g.asks&&g.first&&g.reason&&g.trap,g.id);for(const p of g.patterns)assert.ok(patterns.some(x=>x.id===p),p);}
 for(const q of records)assert.deepEqual(q,questions.find(original=>original.id===q.id));
 assert.ok(!records.some(q=>q.sourceKind==='approximation'));
 const actualType=id=>topics.flatMap(t=>t.groups).find(g=>g.records.some(q=>q.id===id))?.id;
 assert.equal(actualType('2023-choice-12'),'electro-optic');
 assert.equal(actualType('2014-choice-4'),'tir-field');
 assert.equal(actualType('2023-calculation-4'),'slit-polar');
 assert.equal(actualType('2016-choice-2'),'field-energy');
 assert.equal(actualType('2008-mixed-5'),'crystal-split');
 assert.equal(actualType('2021-calculation-3'),'newton');
});
test('没有直接原题的专题不借用宽泛关联伪造考例，回忆缺漏与存疑不抹除',()=>{
 for(const id of ['lorentz-index','multilayer-matrix'])assert.equal(topics.find(t=>t.id===id).groups.length,0);
 assert.equal(topics.find(t=>t.id==='sources').groups.flatMap(g=>g.records).length,1);
 const records=topics.flatMap(t=>t.groups.flatMap(g=>g.records));
 for(const id of ['2023-choice-4','2023-choice-12','2023-choice-18','2019-calculation-4'])assert.ok(records.find(q=>q.id===id).notes.length>0,id);
 assert.throws(()=>buildExamTypes(guides,{...index,assignments:[...index.assignments,index.assignments[0]]},questions,knowledge));
});
test('筛选年份与实际题型必须匹配同一道题，章节和关键字联动正确',()=>{
 const result=filterExamTopics(topics,{chapter:'7',year:'2023',type:'calculation'});
 assert.ok(result.length>0);for(const t of result){assert.equal(t.chapter,'7');for(const g of t.groups)assert.ok(g.records.some(q=>q.year===2023&&q.type==='calculation'));}
 assert.equal(filterExamTopics(topics,{chapter:'4',query:'牛顿环'}).length,0);
 assert.equal(filterExamTopics(topics,{query:'不存在的冷门词'}).length,0);
 assert.deepEqual(filterExamTopics(topics,{chapter:'9'}),[]);
});
