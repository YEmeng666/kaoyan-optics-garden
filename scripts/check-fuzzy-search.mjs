import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {searchKnowledge} from '../src/lib/fuzzy-search.mjs';
const html=readFileSync('dist/search/index.html','utf8');
assert.ok(!html.includes('id="knowledge-index"'),'Knowledge index should load on demand instead of blocking the initial page');
const docs=JSON.parse(readFileSync('dist/data/knowledge-index.json','utf8'));
assert.equal(docs.length,29);
for(const d of docs){assert.ok(d.text?.length>100,d.id);assert.ok(existsSync(`dist/knowledge/${d.id}/index.html`),d.id);}
for(const [q,id] of [['迈克尔逊','instruments'],['fp','instruments'],['相干长渡','coherence'],['琼斯 矩阵','waveplates-jones'],['单缝 缺级','single-multiple-slits'],['群速度','dispersion']])assert.equal(searchKnowledge(q,docs)[0]?.id,id,q);
assert.deepEqual(searchKnowledge('红烧牛肉面',docs),[]);
console.log('Lazy fuzzy search index: 29 topics, representative queries and destinations verified.');
