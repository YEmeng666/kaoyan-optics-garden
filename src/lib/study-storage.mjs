import {STORAGE_KEY,emptyState,validateState,mergeStates} from './study.mjs';
export function createStudyStore(cardIds,topicIds){
 function read(){
  const raw=localStorage.getItem(STORAGE_KEY);
  return raw?validateState(JSON.parse(raw),cardIds,topicIds):emptyState();
 }
 return {read,update(transform){const state=transform(read());localStorage.setItem(STORAGE_KEY,JSON.stringify(state));window.dispatchEvent(new Event('study-change'));return state;},import(input){const incoming=validateState(input,cardIds,topicIds);return this.update(current=>mergeStates(current,incoming));}};
}
