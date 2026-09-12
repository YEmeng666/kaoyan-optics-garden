import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {matchesQuestion} from '../src/lib/questions.mjs';
const read=name=>JSON.parse(readFileSync(new URL(`../content/${name}.json`,import.meta.url)));
const data=read('questions'),library=read('library'),patterns=read('patterns');
test('逐题分类对应审阅过的年份、题号与年度原件页范围',()=>{
 assert.equal(data.questions.length,400);
 assert.equal(new Set(data.questions.map(q=>q.id)).size,400);
 for(const q of data.questions){
  const year=library.years.find(y=>y.year===q.year);
  assert.ok(year&&year.year!==2017);
  assert.ok(Number.isInteger(q.questionPage)&&q.questionPage>=year.question[0]&&q.questionPage<=year.question[1],q.id);
  assert.deepEqual(q.answerPages,year.answer);
  assert.ok(['4','5','6','7','8'].includes(q.chapter));
  assert.ok(q.title&&q.topic&&q.number&&q.section);
  assert.ok(q.patterns.every(id=>patterns.some(p=>p.id===id)));
  if(q.year>=2018)assert.ok(['recall','approximation'].includes(q.sourceKind));
 }
 assert.equal(data.coverage.length,15);
 for(const row of data.coverage)assert.equal(data.questions.filter(q=>q.year===row.year).length,row.entries);
});
test('不补造缺题、不把近似题和2017示例计为真题',()=>{
 assert.ok(!data.questions.some(q=>q.id==='2023-choice-13'||q.id==='2015-calculation-6'||q.year===2017));
 const approximate=data.questions.find(q=>q.id==='2023-calculation-3');
 assert.equal(approximate.sourceKind,'approximation');assert.equal(matchesQuestion(approximate),false);
 assert.equal(matchesQuestion(approximate,{source:'approximation'}),true);
 assert.equal(data.questions.filter(q=>matchesQuestion(q)).length,399);
 assert.equal(data.questions.find(q=>q.id==='2019-calculation-4').quality,'incomplete');
 assert.equal(data.questions.find(q=>q.id==='2023-choice-4').quality,'disputed');
 assert.equal(data.questions.find(q=>q.year===2020&&q.type==='choice').number,'未编号');
});
test('年份、章节、考点和类型组合筛选定位真实条目',()=>{
 const selected=data.questions.filter(q=>matchesQuestion(q,{year:'2021',chapter:'5',type:'calculation',topic:'牛顿环'}));
 assert.deepEqual(selected.map(q=>q.id),['2021-calculation-3']);
 assert.equal(selected[0].questionPage,87);
 assert.deepEqual(data.questions.filter(q=>matchesQuestion(q,{query:'2021 牛顿环'})).map(q=>q.id),['2021-calculation-3']);
 assert.equal(data.questions.filter(q=>matchesQuestion(q,{year:'2021',chapter:'8',type:'calculation'})).length,0);
 for(const id of ['phase','young','shift','film','wedge','coating','fabry','coherence','em-calculate','slit-missing','crystal-index','absorption-fit'])assert.ok(data.questions.some(q=>matchesQuestion(q,{pattern:id})),id);
});
