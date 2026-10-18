import {buildQueue,rateCard,topicProgress,STORAGE_KEY} from '../lib/study.mjs';
import {createStudyStore} from '../lib/study-storage.mjs';
const $=id=>document.getElementById(id);
const {topics,cards:metadata}=JSON.parse($('study-progress-catalog').textContent);
const {knowledgeBase}=JSON.parse($('study-client-config').textContent);
const store=createStudyStore(metadata.map(c=>c.id),topics.map(t=>t.id));
const form=$('study-form'),session=$('study-session'),start=$('study-start');
let cardsPromise,queue=[],position=0,ratings=[],active=false,locked=false;
const message=text=>$('study-message').textContent=text;
function settings(){return Object.fromEntries([...form.querySelectorAll('select')].map(el=>[el.name,el.value]));}
function refresh(){try{const state=store.read(),now=Date.now();$('study-average').textContent=Math.round(topics.reduce((sum,t)=>sum+topicProgress(t,metadata,state,now).percent,0)/topics.length)+'%';$('study-due').textContent=metadata.filter(c=>state.cards[c.id]&&Date.parse(state.cards[c.id].dueAt)<=now).length+' 张';$('study-new').textContent=metadata.filter(c=>!state.cards[c.id]).length+' 张';$('study-weak').textContent=metadata.filter(c=>state.cards[c.id]?.level<2).length+' 张';$('study-eligible').textContent=`当前可练 ${buildQueue(metadata,topics,state,{...settings(),limit:100},now).length} 张`;}catch{message('无法读取学习记录：浏览器存储被禁用或记录损坏。为保护已有记录，暂停保存。请检查权限或导出备份。');start.disabled=true;}}
async function loadCards(){return cardsPromise??=fetch(form.dataset.cardsUrl).then(r=>{if(!r.ok)throw new Error('题卡加载失败');return r.json();}).catch(error=>{cardsPromise=null;throw error;});}
function textBlock(parent,label,text){const p=document.createElement('p'),strong=document.createElement('strong');strong.textContent=label+'：';p.append(strong,document.createTextNode(text));parent.append(p);}
function show(){
 const card=queue[position];if(!card){finish();return;}
 $('study-session-position').textContent=`本轮第 ${position+1} / ${queue.length} 张 · 已完成 ${ratings.length} 张`;
 $('study-session-progress').value=100*position/queue.length;
 $('study-card-kind').textContent=card.kind==='formula'?'公式背诵 · 回忆公式与条件':card.variant==='worked'?'原创例题 · 独立复现思路':'原创课后自测 · 独立解题';
 $('study-card-title').textContent=card.title;$('study-card-prompt').textContent=card.prompt;$('study-notes').value='';
 $('study-answer').hidden=true;$('study-reveal').hidden=false;$('study-hint').hidden=!card.cue;$('study-hint').open=false;$('study-card-cue').textContent=card.cue||'';
 $('study-card-source').textContent=card.source;$('study-topic-link').href=knowledgeBase+card.topicIds[0]+'/';
 $('study-answer-content').replaceChildren();document.querySelectorAll('[data-rating]').forEach(b=>b.disabled=false);locked=false;
 $('study-card-title').focus({preventScroll:true});
 session.scrollIntoView({block:'start'});
}
function reveal(){
 const card=queue[position],answer=$('study-answer-content');if(!active||!card)return;answer.replaceChildren();
 if(card.kind==='formula'){
  const math=document.createElement('div');math.className='math';math.innerHTML=card.math;answer.append(math);
  textBlock(answer,'符号',card.symbols);textBlock(answer,'适用条件',card.conditions);textBlock(answer,'易错点',card.trap);
 }else{
  textBlock(answer,'题眼',card.cue);const list=document.createElement('ol');list.className='steps';
  for(const step of card.steps){const li=document.createElement('li');textBlock(li,'做什么',step.action);textBlock(li,'为什么',step.why);if(step.result)textBlock(li,'得到',step.result);list.append(li);}answer.append(list);
  textBlock(answer,'答案',card.answer);textBlock(answer,'自检',card.check);
 }
 $('study-answer').hidden=false;$('study-reveal').hidden=true;
}
async function begin(){
 if(active){message('本轮尚未结束。请先完成或点击“结束本轮”，已保存的评分会保留。');return;}
 start.disabled=true;start.textContent='正在加载卡片…';$('study-finished').hidden=true;
 try{const cards=await loadCards();queue=buildQueue(cards,topics,store.read(),settings());position=0;ratings=[];
  if(!queue.length){message('当前筛选下没有可练卡片。可改为“全部卡片”，或选择其他章节 / 知识点。');return;}
  active=true;session.hidden=false;form.querySelectorAll('select').forEach(el=>el.disabled=true);show();message('请先独立回忆，再展开答案；每次自评立即保存。');session.scrollIntoView({block:'start',behavior:'smooth'});
 }catch{message('题卡暂时加载失败，或学习记录无法读取。请检查网络和浏览器存储后重试。');}finally{start.disabled=false;start.textContent='开始这一轮 →';}
}
function finish(){active=false;form.querySelectorAll('select').forEach(el=>el.disabled=false);session.hidden=true;$('study-finished').hidden=false;$('study-finished-summary').textContent=`已保存 ${ratings.length} 张自评，其中 ${ratings.filter(r=>r<2).length} 张需要巩固。${position<queue.length?'未评分的卡片未计入掌握进度。':''}`;refresh();}
form.addEventListener('submit',event=>{event.preventDefault();begin();});
form.addEventListener('change',event=>{if(event.target.name==='chapter'){const selected=form.elements.topic.selectedOptions[0];if(selected.value&&selected.dataset.chapter!==form.elements.chapter.value)form.elements.topic.value='';}if(event.target.name==='topic'&&event.target.value){const topic=topics.find(t=>t.id===event.target.value);form.elements.chapter.value=topic.chapter;}refresh();});
const params=new URL(location.href).searchParams;for(const key of ['chapter','topic','kind','scope']){const value=params.get(key),el=form.elements[key];if(value&&[...el.options].some(o=>o.value===value))el.value=value;}
if(form.elements.topic.value)form.elements.chapter.value=topics.find(t=>t.id===form.elements.topic.value).chapter;
$('study-reveal').addEventListener('click',reveal);$('study-stop').addEventListener('click',finish);$('study-retry').addEventListener('click',()=>{form.elements.scope.value='weak';refresh();begin();});
document.querySelectorAll('[data-rating]').forEach(button=>button.addEventListener('click',()=>{
 if(!active||locked||$('study-answer').hidden)return;locked=true;document.querySelectorAll('[data-rating]').forEach(b=>b.disabled=true);
 try{const rating=Number(button.dataset.rating),card=queue[position];const state=store.update(current=>rateCard(current,card.id,rating));ratings.push(rating);position++;message(`自评已保存，下次复习：${new Date(state.cards[card.id].dueAt).toLocaleString('zh-CN')}。`);refresh();show();}
 catch{locked=false;document.querySelectorAll('[data-rating]').forEach(b=>b.disabled=false);message('保存失败，本题还没有计分。请检查浏览器存储后重新自评。');}
}));
$('study-export').addEventListener('click',()=>{try{const raw=localStorage.getItem(STORAGE_KEY);const blob=new Blob([raw||JSON.stringify(store.read())],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`物理光学学习记录-${new Date().toLocaleDateString('sv-SE')}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('已导出记录，请妥善保存备份。');}catch{message('读取失败，无法导出。请检查浏览器存储权限。');}});
$('study-import').addEventListener('change',async event=>{const input=event.target,file=input.files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error('文件超过 2 MB');store.import(JSON.parse(await file.text()));start.disabled=false;refresh();message('已合并导入记录，同一条目保留更新时间较新的自评。');}catch(error){message(`导入未完成：${error.message}。原有记录未修改。`);}finally{input.value='';}});
window.addEventListener('storage',refresh);window.addEventListener('study-change',refresh);window.addEventListener('focus',refresh);setInterval(refresh,60000);refresh();
