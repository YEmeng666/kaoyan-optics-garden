import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import katex from 'katex';
import {createHash} from 'node:crypto';
const read=name=>JSON.parse(readFileSync(new URL(`../content/${name}.json`,import.meta.url),'utf8'));
const patterns=read('patterns'),formulas=read('formulas'),course=read('course');
const cloud=read('cloud-library');
const publicPdfs=new Map(cloud.files.map(f=>[`public/materials/${f.file}`,f]));
assert.ok(patterns.length>=8);assert.equal(course.chapters.length,5);
for(const list of [patterns,formulas]){assert.equal(new Set(list.map(v=>v.id)).size,list.length);for(const v of list){assert.equal(v.permission,'public');assert.ok(v.source);}}
for(const p of patterns){assert.ok(p.first&&p.steps.length>=4&&p.example.answer);assert.ok(course.chapters.some(c=>c.id===p.chapter));for(const id of p.formulas)assert.ok(formulas.some(f=>f.id===id),`Unknown formula ${id}`);for(const id of p.related)assert.ok(patterns.some(p=>p.id===id));}
for(const f of formulas){assert.ok(f.conditions&&f.symbols&&f.trap);katex.renderToString(f.latex,{throwOnError:true});for(const id of f.patterns)assert.ok(patterns.some(p=>p.id===id));}
function walk(path){for(const e of readdirSync(path,{withFileTypes:true})){const next=`${path}/${e.name}`;if(e.isDirectory())walk(next);else{if(publicPdfs.has(next)){const file=readFileSync(next),expected=publicPdfs.get(next);assert.equal(file.length,expected.bytes);assert.equal(createHash('sha256').update(file).digest('hex'),expected.sha256,`Changed public PDF ${next}`);}else assert.ok(!/\.(pdf|docx|zip|pem|key)$/i.test(e.name),`Private file ${next}`);if(/\.(json|md|mjs|astro|css|svg|txt)$/i.test(e.name)){const text=readFileSync(next,'utf8');assert.ok(!/\ufffd/.test(text));assert.ok(!/[CD]:[\\/](Users|book)/.test(text),`Local path leak ${next}`);assert.ok(!/(?:gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,}|sk-proj-[A-Za-z0-9_-]{20,})/.test(text),`Credential-like text ${next}`);}}}}
if(cloud.ready)for(const name of publicPdfs.keys())assert.ok(readFileSync(name).length,`Missing public PDF ${name}`);
for(const folder of ['content','src','public'])walk(folder);
console.log(`Validated ${patterns.length} patterns, ${formulas.length} formulas, 5 chapters; references, math and public content checks passed.`);
