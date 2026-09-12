import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash,webcrypto} from 'node:crypto';
import {identifySource,pdfPageUrl} from '../src/lib/library.mjs';
const catalog=JSON.parse(readFileSync(new URL('../content/library.json',import.meta.url)));
test('年度试题与答案页范围有效、连续，无占位通知混入',()=>{
 assert.equal(catalog.sources.length,8);
 assert.equal(new Set(catalog.sources.map(s=>s.sha256)).size,8);
 assert.equal(catalog.years.filter(y=>y.kind!=='example').length,15);
 for(const [key,id] of [['question','exam'],['answer','answers']]){
  const source=catalog.sources.find(s=>s.id===id);let end=14;
  for(const y of catalog.years){const [start,last]=y[key];assert.equal(start,end+1);assert.ok(last>=start&&last<=source.pages);end=last;}
 }
 assert.equal(catalog.years.find(y=>y.year===2017).kind,'example');
 assert.deepEqual(catalog.years.at(-1).answer,[80,86]);
 assert.equal(catalog.missing.find(y=>y.year===2024).answerPlaceholder,88);
 assert.ok(!catalog.years.some(y=>y.year>=2024));
 assert.ok(catalog.sources.every(s=>!s.file&&!s.aliases&&s.permission==='private-local'));
});
test('只匹配内容正确的 PDF，同名错版拒绝，改名副本可识别',async()=>{
 const bytes=new TextEncoder().encode('%PDF-1.7 local fixture');
 const source={id:'test',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
 const file={name:'改名.pdf',size:bytes.length,arrayBuffer:async()=>bytes.buffer};
 const digest=bytes=>webcrypto.subtle.digest('SHA-256',bytes);
 assert.equal((await identifySource(file,[source],digest)).id,'test');
 const wrong=new TextEncoder().encode('%PDF-1.7 wrong fixture');
 assert.equal(await identifySource({...file,arrayBuffer:async()=>wrong.buffer},[source],digest),null);
 assert.equal(await identifySource({...file,size:3,arrayBuffer:async()=>{throw Error('must not read')}},[source],digest),null);
 assert.equal(await identifySource({...file,arrayBuffer:async()=>new TextEncoder().encode('not a pdf').buffer},[source],digest),null);
});
test('仅生成本机 blob 的合法 PDF 页链接',()=>{
 assert.equal(pdfPageUrl('blob:https://local.test/id',80,88),'blob:https://local.test/id#page=80');
 for(const page of [0,-1,89,1.5,NaN])assert.throws(()=>pdfPageUrl('blob:local',page,88));
 assert.throws(()=>pdfPageUrl('https://remote.test/file.pdf',1,88));
});
