import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
const close=(a,b,tolerance=1e-9)=>assert.ok(Math.abs(a-b)<=tolerance*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Independent numerical checks of worked examples',()=>{
 close((Math.sqrt(4)+Math.sqrt(9))**2,25);close((Math.sqrt(4)-Math.sqrt(9))**2,1);close((25-1)/(25+1),12/13);
 close(600e-9*1.5/.0003,.003);close(3*600e-9*1.5/.0003,.009);
 close(2*.00015/600e-9,500);close(600e-9/(4*1.5),100e-9,1e-15);
 close(600e-9/(2*.001),.0003);close(Math.sqrt(2.25),1.5);
 close(3e8/(2*.001),150e9);close(Math.PI*Math.sqrt(.9)/.1,29.8037647974,1e-10);
 close((600e-9)**2/.1e-9,.0036);
});
test('Physical limits: phase, visibility and Fabry–Perot',()=>{
 const intensity=(i,j,d)=>i+j+2*Math.sqrt(i*j)*Math.cos(d);
 close(intensity(1,1,Math.PI),0);close(intensity(1,1,0),4);
 for(const R of [0,.2,.9]){const F=4*R/(1-R)**2;close(1/(1+F*Math.sin(0)**2),1);assert.ok(1/(1+F)<=1);}
 for(const ratio of [.01,.5,1,10,100]){const v=2*Math.sqrt(ratio)/(1+ratio);assert.ok(v>=0&&v<=1);}
});
test('Every knowledge reference resolves to a real Markdown file',()=>{
 const patterns=JSON.parse(readFileSync('content/patterns.json','utf8'));
 for(const p of patterns)assert.ok(existsSync(`content/knowledge/${p.knowledge}.md`));
 const extra=JSON.parse(readFileSync('content/supplement.json','utf8'));
 assert.equal(readdirSync('content/knowledge').filter(f=>f.endsWith('.md')).length,7+extra.length);
});
