import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {onlinePdfUrl} from '../src/lib/cloud-library.mjs';
const cloud=JSON.parse(readFileSync('content/cloud-library.json','utf8'));
const questions=JSON.parse(readFileSync('content/questions.json','utf8')).questions;
test('未核验云端发布时不启用不存在的直读链接',()=>{
 for(const q of questions)assert.equal(onlinePdfUrl('exam',q.questionPage,{...cloud,ready:false}),null);
 assert.equal(onlinePdfUrl('answers',80,{...cloud,ready:true}),null);
});
test('全部400条记录的汇编页码精确转换为年度PDF页码',()=>{
 const active={...cloud,ready:true};
 for(const q of questions){
  const file=cloud.files.find(f=>f.year===q.year);
  const url=new URL(onlinePdfUrl('exam',q.questionPage,active));
  assert.ok(url.pathname.endsWith(`/exams/${q.year}.pdf`),q.id);
  assert.equal(url.hash,`#page=${q.questionPage-file.sourcePages[0]+1}`,q.id);
 }
 assert.ok(onlinePdfUrl('exam',87,active).endsWith('/exams/2021.pdf#page=2'));
 assert.equal(onlinePdfUrl('exam',102,active),null);
 for(const p of [0,-1,NaN,2.5])assert.equal(onlinePdfUrl('exam',p,active),null);
 assert.equal(cloud.files.find(f=>f.year===2017).kind,'example');
});
