import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {searchKnowledge} from '../src/lib/fuzzy-search.mjs';
const aliases=JSON.parse(readFileSync('content/search-aliases.json','utf8'));
const docs=Object.entries(aliases).map(([id,aliases])=>({id,title:aliases[0],aliases,summary:'',text:readFileSync(`content/knowledge/${id}.md`,'utf8')}));
test('别名、缩写、全角输入、错字和组合关键词定位已有知识',()=>{
 for(const [q,id] of [['迈克尔逊','instruments'],['Ｆ－Ｐ','instruments'],['Michelson','instruments'],['相干长渡','coherence'],['相长度','coherence'],['相干度长','coherence'],['布鲁斯特','critical-brewster'],['半波电压','electro-optic'],['琼斯 矩阵','waveplates-jones'],['单缝 缺级','single-multiple-slits']])assert.equal(searchKnowledge(q,docs)[0]?.id,id,q);
});
test('精确匹配优先；空输入、无关词和过短错字不捏造结果',()=>{
 assert.equal(searchKnowledge('相干长度',[{id:'fuzzy',title:'相干长渡'},...docs])[0].id,'coherence');
 for(const q of ['', '   ', '？！', '红烧牛肉面', 'xx', '<script>alert(1)</script>'])assert.deepEqual(searchKnowledge(q,docs),[],q);
 assert.ok(searchKnowledge('相干',docs).some(d=>d.id==='coherence'));
 for(const doc of docs)assert.ok(doc.text.length>0);
});
