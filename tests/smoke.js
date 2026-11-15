// Headless smoke test (needs playwright). Usage: node tests/smoke.js
const {chromium}=require('playwright'),path=require('path');
(async()=>{
const b=await chromium.launch(),pg=await b.newPage({viewport:{width:800,height:360}});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../www/index.html'));
await pg.evaluate(()=>{$('nm').value='<img src=x onerror=window.__xss=1>';begin()});
const r=await pg.evaluate(()=>{
 const out={};let i=0;for(;i<W*H;i++)if(TR[i]===1)break;spawn(i);
 // time bug: speed change while modal open must not start timer
 evt();$('sp').click();out.timerWhileModal=timer!==null;closeM();out.timerAfterClose=timer!==null;
 // pause
 $('pz').click();out.pausedNoTimer=timer===null;$('pz').click();out.resumed=timer!==null;
 // attack cancel by stable id
 T[1]=500;const lr=launch(1,0,.5,i);const a=A.find(x=>x.p===1);if(a){cancelA(a.id);out.cancelOK=a.done===1}
 // long run
 for(let n=0;n<5000&&run;n++){tick();if($('mg').style.display==='flex')closeM()}
 hud();mgRender();MG.cab();out.lbHtmlSafe=!$('lb').innerHTML.includes('<img');
 out.xssNameSafe=!window.__xss;out.ticks=tk;return out});
console.log(JSON.stringify({r,errs}));
const ok=!r.timerWhileModal&&r.timerAfterClose&&r.pausedNoTimer&&r.resumed&&r.xssNameSafe&&!errs.length;
await b.close();process.exit(ok?0:1)})();
