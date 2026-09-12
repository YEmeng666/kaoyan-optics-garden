import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist');
const base=(process.env.BASE_PATH||'/').replace(/\/$/,'');
let pages=0,links=0;
function walk(dir){for(const name of readdirSync(dir)){const file=path.join(dir,name);if(statSync(file).isDirectory())walk(file);else if(name.endsWith('.html')){pages++;const html=readFileSync(file,'utf8');assert.ok(!html.includes('katex-error'));assert.ok(!/[CD]:[\\/](Users|book)/.test(html));for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){let link=m[1].replaceAll('&amp;','&');if(/^(https?:|data:|mailto:|#)/.test(link))continue;const url=new URL(link,'https://test.invalid'+base+'/'+path.relative(root,file).replaceAll('\\','/'));let target=decodeURI(url.pathname);if(base){assert.ok(target.startsWith(base+'/'),`Missing base ${link}`);target=target.slice(base.length);}let local=path.join(root,target);assert.ok(local.startsWith(root));if(target.endsWith('/'))local=path.join(local,'index.html');assert.ok(existsSync(local),`Broken ${file}: ${link}`);links++;}assert.ok(!html.includes('电子科技大学840物理光学零基础'));}}}
walk(root);assert.ok(pages>=35);console.log(`Validated ${pages} HTML pages and ${links} local resource/link targets for base ${base||'/'}.`);
