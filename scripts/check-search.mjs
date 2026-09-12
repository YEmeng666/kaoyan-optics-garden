// Exercise the built Pagefind index in Node, without a browser or UI automation.
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist');
globalThis.fetch=async input=>{
 const url=new URL(String(input),'http://localhost/');
 const fragment=url.pathname.slice(url.pathname.indexOf('/pagefind/')+1);
 const filename=path.resolve(root,fragment);
 assert.ok(filename.startsWith(root+path.sep));
 return new Response(await readFile(filename));
};
const pagefind=await import('../dist/pagefind/pagefind.js');
await pagefind.options({basePath:'/pagefind/',baseUrl:'/',language:'zh-cn'});
for(const [query,expected] of [['半波损失','film'],['相干长度','coherence'],['迈克耳孙','instruments'],['F-P','fabry'],['参考答案','library'],['2023','library'],['2021 牛顿环','questions'],['马吕斯','polariz'],['半波带','zone'],['半波电压','kdp'],['群速度','dispersion'],['特征矩阵','multilayer']]){
 const result=await pagefind.search(query);
 assert.ok(result.results.length,`No result for ${query}`);
 const hits=await Promise.all(result.results.slice(0,12).map(r=>r.data()));
 assert.ok(hits.some(r=>r.url.includes(expected)),`Missing expected ${expected} for ${query}`);
 console.log(`${query}: ${result.results.length} matches, expected topic found`);
}
await pagefind.destroy();
