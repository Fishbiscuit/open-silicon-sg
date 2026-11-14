import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../src/hero.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../out/site-preview.html',import.meta.url),'utf8');
const DATA=JSON.parse(html.match(/id="hero-data"[^>]*>(.*?)<\/script>/s)[1]);
const timing=vm.runInNewContext(source.slice(source.indexOf('  const OBJECT_SPEED'),source.indexOf('  // Each button covers'))+';({BEAT,AT,OPEN_AT,TOTAL,SOURCE_END,objectTime})',{DATA});
test('each object completes its choreography before the next slot starts',()=>{
  DATA.beats.forEach((_,i)=>{
    assert.equal(timing.AT[i],i*timing.BEAT);
    assert.equal(timing.objectTime(i,timing.BEAT),timing.SOURCE_END[i]);
    assert.ok(timing.objectTime(i,timing.BEAT/2)<timing.SOURCE_END[i]);
  });
  assert.equal(timing.OPEN_AT,DATA.beats.length*timing.BEAT);
});
// Exercise the shipped clock independently of the SVG renderer.
function clock(){
  const frames=new Map();let serial=0;
  const c={document:{hidden:false},stage:{classList:{toggle(){}}},render(){},finale(){c.done=true;},
    t:0,last:null,frame:0,playing:true,visible:true,done:false,waiting:false,TOTAL:timing.TOTAL,
    requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial;},cancelAnimationFrame:id=>frames.delete(id)};
  vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf('  function tick(now)'),source.indexOf('  const setPlaying'))+';this.run=run;',c);
  return {c,frames,frame(now){const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn(now));}};
}
for(const fps of [60,10,4])test(`opening follows elapsed time at ${fps} fps`,()=>{
  const p=clock();p.c.run();p.frame(0);for(let i=1;i<=fps*2;i++)p.frame(i*1000/fps);
  assert.ok(Math.abs(p.c.t-2)<1e-8);assert.equal(p.frames.size,1);
});
test('opening excludes hidden time and does not resume offscreen',()=>{
  const p=clock();p.c.run();p.frame(0);p.frame(100);p.c.document.hidden=true;p.c.run();assert.equal(p.frames.size,0);
  p.c.visible=false;p.c.document.hidden=false;p.c.run();assert.equal(p.frames.size,0);
  p.c.visible=true;p.c.run();p.frame(10000);assert.equal(p.c.t,.1);p.frame(10100);assert.equal(p.c.t,.2);
});
