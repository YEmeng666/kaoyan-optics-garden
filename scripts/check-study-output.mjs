import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync('dist/study/index.html','utf8');
const catalog=JSON.parse(html.match(/<script\b(?=[^>]*id="study-progress-catalog")[^>]*>([\s\S]*?)<\/script>/)[1]);
const cards=JSON.parse(readFileSync('dist/data/study-cards.json','utf8'));
assert.equal(catalog.topics.length,29);assert.equal(cards.length,90);
assert.equal(cards.filter(c=>c.kind==='formula').length,32);
assert.equal(cards.filter(c=>c.kind==='question').length,58);
assert.equal(new Set(cards.map(c=>c.id)).size,90);
assert.equal(html.split('id="study-progress-catalog"').length-1,1);
for(const card of cards){assert.ok(card.topicIds.length,card.id);assert.ok(card.topicIds.every(id=>catalog.topics.some(t=>t.id===id)),card.id);if(card.kind==='formula')assert.ok(card.math.includes('katex')&&card.conditions&&card.trap,card.id);else assert.ok(card.steps.every(s=>s.action&&s.why)&&card.answer&&card.check,card.id);}
for(const topic of catalog.topics){
 assert.equal(cards.filter(c=>c.kind==='question'&&c.topicIds.includes(topic.id)).length,2,topic.id);
 const file=`dist/knowledge/${topic.id}/index.html`;assert.ok(existsSync(file));const page=readFileSync(file,'utf8');assert.ok(page.includes(`data-study-topic="${topic.id}"`),topic.id);assert.ok(page.includes('data-concept-level'),topic.id);
}
console.log('Study output verified: all 29 topics, 32 formula cards and 58 worked/practice cards, math, explanations and progress controls.');
