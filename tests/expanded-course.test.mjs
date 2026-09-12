import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=n=>JSON.parse(readFileSync(`content/${n}.json`,'utf8'));
const topics=read('supplement'),patterns=read('patterns'),formulas=read('formulas'),questions=read('questions').questions;
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);

test('每章都有可阅读专题、完整解题链路和真实年份入口',()=>{
 assert.equal(new Set(topics.map(k=>k.id)).size,topics.length);
 for(const ch of ['4','5','6','7','8']){
  assert.ok(topics.some(k=>k.chapter===ch));
  assert.ok(patterns.some(p=>p.chapter===ch));
  assert.ok(questions.some(q=>q.chapter===ch&&q.sourceKind!=='approximation'&&q.patterns.length));
 }
 for(const k of topics){
  assert.equal(k.label,'AI补充解释');assert.ok(k.source&&k.topics.length);
  assert.ok(existsSync(`content/knowledge/${k.id}.md`));
  const body=readFileSync(`content/knowledge/${k.id}.md`,'utf8');
  for(const heading of ['一句话理解','物理图像','从题目开始','适用条件','易错与检查'])assert.ok(body.includes(heading),k.id);
 }
 for(const p of patterns){
  assert.ok(p.first&&p.steps.length>=4&&p.traps.length>=2);
  assert.ok(p.example.question.includes('自拟')&&p.example.steps.length>=2&&p.example.check);
  assert.ok(p.formulas.every(id=>formulas.some(f=>f.id===id)));
  for(const id of p.formulas)assert.ok(formulas.find(f=>f.id===id).patterns.includes(p.id),`Formula filter misses ${p.id}/${id}`);
  assert.ok(p.related.every(id=>patterns.some(v=>v.id===id)));
 }
 assert.equal(questions.length,400);assert.equal(questions.filter(q=>q.sourceKind==='approximation').length,1);
});

test('新增模型算例的单位、数值与物理极限',()=>{
 close(600/1.5,400);close(1e6/400,2500);
 close(.5*Math.cos(Math.PI/6)**2*Math.cos(Math.PI/3)**2,3/32);
 close(((1-1.5)/(1+1.5))**2,.04);
 close(Math.asin(1/1.5)*180/Math.PI,41.810314895778596);
 close(Math.atan(1/1.5)*180/Math.PI,33.690067525979785);
 close(1.22*500e-9/.1,6.1e-6);close(600/(600*10),.1);
 close(.001**2/(500e-9*1),2);
 const ne=(angle)=>1/Math.sqrt(Math.cos(angle)**2/1.5**2+Math.sin(angle)**2/1.6**2);
 close(ne(0),1.5);close(ne(Math.PI/2),1.6);
 close(600e-9/(4*.01),15e-6);
 close(.5*Math.sin(Math.PI/2)**2*Math.sin(Math.PI/4)**2,.25);
 close(600e-9/(2*1.5**3*10e-12),8888.888888888889);
 close(100*.2*.05,1);close(Math.exp(-Math.log(2)/.02*.04),.25);
 close(1.5+3*.004/.5**2,1.548);close((600/450)**4,256/81);
 close(600e-9/.5e-3*1,.0012);
 const sinc=x=>x===0?1:Math.sin(x)/x;
 close(sinc(0),1);close(sinc(Math.PI),0);
});

test('无损单层膜矩阵与多次反射表达在任意厚度一致',()=>{
 // Independent complex-amplitude summation r=(r01+r12 e^(2iβ))/(1+r01 r12 e^(2iβ)).
 const abs2=z=>z[0]**2+z[1]**2;
 for(const nf of [1.2,1.5,2.1])for(const beta of [0,.3,Math.PI/2,Math.PI]){
  const n0=1,ns=2.25,c=Math.cos(beta),s=Math.sin(beta);
  // Multiply the boundary vector directly; no admittance division required.
  const B=[c,ns*s/nf],C=[ns*c,nf*s];
  const matrixR=abs2([n0*B[0]-C[0],n0*B[1]-C[1]])/abs2([n0*B[0]+C[0],n0*B[1]+C[1]]);
  const r01=(n0-nf)/(n0+nf),r12=(nf-ns)/(nf+ns);
  const sumR=abs2([r01+r12*Math.cos(2*beta),r12*Math.sin(2*beta)])/abs2([1+r01*r12*Math.cos(2*beta),r01*r12*Math.sin(2*beta)]);
  close(matrixR,sumR);assert.ok(matrixR>=0&&matrixR<=1);
  if(nf===1.5&&beta===Math.PI/2)close(matrixR,0);
 }
});
