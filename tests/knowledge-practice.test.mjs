import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import practice from '../content/knowledge-practice.mjs';
const patterns=JSON.parse(readFileSync('content/patterns.json','utf8'));
const supplement=JSON.parse(readFileSync('content/supplement.json','utf8'));
const knowledgeIds=['conditions','sources','two-beam','multiple','films','instruments','coherence',...supplement.map(k=>k.id)];

test('全部知识点内置一条例题和一道课后题，并解释每一步原因',()=>{
 assert.equal(knowledgeIds.length,29);
 assert.deepEqual(Object.keys(practice).sort(),knowledgeIds.sort());
 for(const id of knowledgeIds){
  const item=practice[id];
  const worked=item.worked??patterns.find(p=>p.id===item.pattern)?.example;
  assert.ok(worked?.question&&worked?.answer&&worked?.check,id);
  if(item.pattern){assert.equal(item.reasons.length,worked.steps.length,id);assert.ok(item.reasons.every(v=>v.length>=12),id);}
  else for(const step of worked.steps){assert.ok(step.action&&step.why&&step.result,id);}
  assert.ok(item.practice.question&&item.practice.cue&&item.practice.answer&&item.practice.check,id);
  assert.ok(item.practice.steps.length>=2,id);
  for(const step of item.practice.steps)assert.ok(step.action&&step.why&&step.result,id);
 }
});

test('代表性课后题数值与物理极限独立复核',()=>{
 const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-3*Math.max(1,Math.abs(b)),`${a} != ${b}`);
 close(500e-9*1/.25e-3,2e-3);
 close(3e8/(2*.5e-3)/1e9,300);
 close(550/(4*1.38),99.6377);
 close((600e-9)**2/(.2e-9),1.8e-3);
 close(1/Math.sqrt(.5/1.5**2+.5/1.6**2),1.54616);
 close(-Math.log(.25)/.03,46.2098);
 close((800/400)**4,16);
 close(((4/1.5-1)/(4/1.5+1))**2,.20661);
});
