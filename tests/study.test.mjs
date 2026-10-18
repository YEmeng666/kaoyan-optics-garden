import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,rateCard,setConcept,topicProgress,buildQueue,validateState,mergeStates} from '../src/lib/study.mjs';
const now=Date.parse('2026-10-18T12:00:00Z');
const topics=[{id:'a',chapter:'4'},{id:'b',chapter:'5'}];
const cards=[{id:'f',kind:'formula',topicIds:['a','b']},{id:'q',kind:'question',topicIds:['a']},{id:'r',kind:'question',topicIds:['b']}];
test('掌握进度从自评产生，未练卡片计零，共享公式同时关联两个知识点',()=>{
 let state=emptyState();assert.equal(topicProgress(topics[0],cards,state,now).percent,0);
 state=setConcept(state,'a',3,now);assert.equal(topicProgress(topics[0],cards,state,now).percent,20);
 state=rateCard(state,'f',3,now);assert.equal(topicProgress(topics[0],cards,state,now).percent,60);assert.equal(topicProgress(topics[1],cards,state,now).percent,40);
 state=rateCard(state,'q',3,now);assert.equal(topicProgress(topics[0],cards,state,now).percent,100);
 state=rateCard(state,'q',0,now+100);assert.equal(topicProgress(topics[0],cards,state,now).percent,60);
 assert.equal(topicProgress({id:'c'},[{id:'z',kind:'question',topicIds:['c']}],rateCard(setConcept(emptyState(),'c',3,now),'z',3,now)).percent,100);
});
test('评分安排复习，连续独立完成延长间隔，遗忘重置间隔',()=>{
 let state=rateCard(emptyState(),'f',2,now);assert.equal(Date.parse(state.cards.f.dueAt)-now,86400000);
 state=rateCard(state,'f',2,now);assert.equal(Date.parse(state.cards.f.dueAt)-now,3*86400000);
 state=rateCard(state,'f',0,now);assert.equal(state.cards.f.streak,0);assert.equal(Date.parse(state.cards.f.dueAt)-now,600000);
 assert.equal(state.cards.f.reviews,3);assert.throws(()=>rateCard(state,'f',9,now));
});
test('队列优先到期、再新卡；章节、题类、知识点与薄弱筛选不会串题',()=>{
 const state=rateCard(rateCard(emptyState(),'f',1,now-2*86400000),'q',3,now);
 assert.deepEqual(buildQueue(cards,topics,state,{},now).map(c=>c.id),['f','r']);
 assert.deepEqual(buildQueue(cards,topics,state,{chapter:'4',kind:'question',scope:'all'},now).map(c=>c.id),['q']);
 assert.deepEqual(buildQueue(cards,topics,state,{topic:'b',scope:'weak'},now).map(c=>c.id),['f']);
 assert.equal(buildQueue(cards,topics,state,{topic:'missing'},now).length,0);
});
test('备份导入验证与合并保留较新记录，拒绝损坏记录和不支持的版本',()=>{
 const a=rateCard(emptyState(),'f',3,now),b=rateCard(emptyState(),'f',0,now+1000);
 assert.equal(mergeStates(a,b).cards.f.level,0);assert.equal(mergeStates(b,a).cards.f.level,0);
 assert.deepEqual(validateState(a,['f'],['a']),a);assert.deepEqual(validateState(a,[],[]),emptyState());
 assert.throws(()=>validateState({...a,version:99},['f'],['a']));
 assert.throws(()=>validateState({...a,cards:{f:{...a.cards.f,dueAt:'invalid'}}},['f'],['a']));
 assert.throws(()=>validateState({...a,cards:{f:{...a.cards.f,level:7}}},['f'],['a']));
});
