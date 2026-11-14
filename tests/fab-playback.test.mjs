import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

// Run the shipped player with a controlled frame clock and browser lifecycle.
// Use the built data so changes to station counts and copy remain valid.
const source = readFileSync(new URL('../src/figures/fab.mjs', import.meta.url), 'utf8');
const runtime = vm.runInNewContext(source.slice(source.indexOf('const FAB_JS = ')) + '\nFAB_JS;');
const html = readFileSync(new URL('../out/site-preview.html', import.meta.url), 'utf8');
const data = JSON.parse(html.match(/<script[^>]*id="fab-data"[^>]*>(.*?)<\/script>/s)[1]);
function player({reduced = false} = {}) {
  const nodes = new Map(), frames = new Map(), events = {};
  let observer, serial = 0;
  function node(key) {
    if (!nodes.has(key)) nodes.set(key, {
      dataset: {u:'1 0',fx:'0',at:'0',overlayLabel:'plan overlay'}, value:'50', style:{setProperty(){}},
      classList:{toggle(){}}, setAttribute(){}, toggleAttribute(){},
      getBoundingClientRect:()=>({width:1000,height:500}),
      querySelector:s=>node(key+' '+s), querySelectorAll:s=>list(s),
      addEventListener:(type,fn)=>events[key+':'+type]=fn,
      parentElement:{scrollWidth:100,clientWidth:100},
    });
    return nodes.get(key);
  }
  function list(s) { return Array.from({length:s==='[data-step]'?data.steps.length:13},(_,i)=>node(s+i)); }
  node('[data-fab] #fab-data').textContent = JSON.stringify(data);
  const document = {hidden:false,querySelector:node,addEventListener:(type,fn)=>events[type]=fn};
  const context = {document,window:{},matchMedia:()=>({matches:reduced}),
    IntersectionObserver:class { constructor(fn){observer=fn;} observe(){} },
    requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial;},cancelAnimationFrame:id=>frames.delete(id)};
  // Observe clock state without adding a new public production debug API.
  vm.runInNewContext(runtime.replace('window.__fab = {','window.__fab = { get time(){return t;},'),context);
  return {
    get time(){return context.window.__fab.time;}, get pending(){return frames.size;},
    total:context.window.__fab.TOTAL,
    frame(now){const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn(now));},
    visible(value){observer([{isIntersecting:value}]);},
    hidden(value){document.hidden=value;events.visibilitychange();},
    pause(){context.window.__fab.pause();},
    toggle(){events['[data-fab] [data-fab-pause]:click']();},
  };
}
for (const fps of [60,30,10,4]) test(`foreground playback follows elapsed time at ${fps} fps`,()=>{
  const p=player();p.visible(true);p.frame(0);
  for(let i=1;i<=fps*2;i++)p.frame(i*1000/fps);
  assert.ok(Math.abs(p.time-2)<1e-8);assert.equal(p.pending,1);
});
test('pause and resume discard time spent paused',()=>{
  const p=player();p.visible(true);p.frame(0);p.frame(100);p.pause();
  assert.equal(p.pending,0);p.toggle();p.frame(10000);assert.equal(p.time,.1);
  p.frame(10100);assert.equal(p.time,.2);assert.equal(p.pending,1);
});
test('tab hiding resumes without catch-up or a scroll',()=>{
  const p=player();p.visible(true);p.frame(0);p.frame(100);p.hidden(true);
  assert.equal(p.pending,0);p.hidden(false);assert.equal(p.pending,1);
  p.frame(10000);assert.equal(p.time,.1);p.frame(10100);assert.equal(p.time,.2);
});
test('offscreen time is excluded and a hidden page cannot restart it',()=>{
  const p=player();p.visible(true);p.frame(0);p.frame(100);p.visible(false);
  assert.equal(p.pending,0);p.hidden(true);p.visible(true);assert.equal(p.pending,0);
  p.hidden(false);p.frame(5000);assert.equal(p.time,.1);
});
test('a long foreground stall does not skip a caption',()=>{
  const p=player();p.visible(true);p.frame(0);p.frame(5000);assert.equal(p.time,.25);
});
test('reduced motion starts complete and does not autoplay',()=>{
  const p=player({reduced:true});p.visible(true);assert.equal(p.pending,0);assert.equal(p.time,p.total);
});
