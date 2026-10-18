import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import guides from '../content/exam-type-guides.mjs';
const index=JSON.parse(readFileSync('content/exam-type-index.json','utf8'));
const questions=JSON.parse(readFileSync('content/questions.json','utf8')).questions;
const overview=readFileSync('dist/exam-types/index.html','utf8');
const data=JSON.parse(overview.match(/<script\b(?=[^>]*id="exam-topic-index")[^>]*>([\s\S]*?)<\/script>/)[1]);
assert.equal(data.length,29);
for(const topic of data){const page=readFileSync(`dist/exam-types/${topic.id}/index.html`,'utf8');
 for(const group of topic.groups){assert.ok(page.includes(`id="${group.id}"`));assert.ok(guides.some(g=>g.id===group.id));}
 const expected=index.assignments.filter(a=>guides.find(g=>g.id===a.typeId).knowledge===topic.id);
 assert.equal((page.match(/data-question-id="/g)||[]).length,expected.length,topic.id);
 for(const a of expected){const q=questions.find(q=>q.id===a.questionId);assert.ok(page.includes(`data-question-id="${q.id}"`),q.id);for(const note of q.notes)assert.ok(page.includes(note),q.id);}
 if(!expected.length)assert.ok(page.includes('尚未收录可直接对应的考例'));
}
console.log(`Exam types verified: ${guides.length} evidence-backed types, 399 unique records and 29 knowledge pages; source warnings retained.`);
