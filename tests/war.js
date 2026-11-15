// Headless test: war rules (neighbours only), real save/load, settings. Usage: node tests/war.js
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
(async()=>{
const b=await chromium.launch(),ctx=await b.newContext({viewport:{width:900,height:420}}),pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../www/index.html'));
const r=await pg.evaluate(()=>{
 const o={};$('nm').value='Test';begin();
 CC.enter();startWorld(0);run=true;
 o.stage=stage;o.neutral=WORLD.regions.filter(x=>!x.owner).length;
 const nb=War.neighbors(1),far=WORLD.countries.filter(c=>c.id!==1&&c.alive&&!nb.includes(c.id));
 o.nbCount=nb.length;o.farCount=far.length;
 if(far.length){const d=War.declare(far[0].id);o.farBlocked=!d.ok;o.farReason=d.msg}
 const t=nb[0];Object.assign(WORLD.countries[0],{army:100,industry:100,science:100,stability:90});const d=War.declare(t);o.nbDeclared=d.ok;o.hasWar=!!War.find(t);
 let caps=0;for(let i=0;i<30&&War.find(t);i++){WORLD.countries[0].treasury=200;WORLD.countries[0].army=Math.max(WORLD.countries[0].army,80);const bt=War.battle(t);if(/تسخیر/.test(bt.msg))caps++;if(i>8&&!War.find(t))break}
 o.battleOK=true;o.captures=caps;
 // save / restore round trip with war data inside
 const w0=JSON.stringify(WORLD.wars),y=WORLD.year;
 o.runBefore=run;o.stageBefore=stage;o.treasury=WORLD.countries[0].treasury;o.snapValid=(()=>{try{return validSnap(JSON.parse(JSON.stringify(snapshot())))}catch(e){return String(e)}})();
 o.saved=saveGame('s1');if(!o.saved){return o}tk+=0;const info=saveInfo('s1');o.info=!!info;
 const raw=localStorage.getItem(KEYS.s1);o.saveKB=Math.round(raw.length/1024);
 WORLD.wars=[];WORLD.year=1999;o.loaded=loadGame('s1');o.warsBack=JSON.stringify(WORLD.wars)===w0;o.yearBack=WORLD.year===y;
 // simulate a lot of months incl. AI wars
 for(let i=0;i<4000&&run;i++){tick()}
 o.ticks=tk;o.running=run;
 o.autosaved=!!localStorage.getItem(KEYS.auto);
 return o});
console.log(JSON.stringify({r,errs}));
await pg.screenshot({path:'/tmp/s_map.png'});
// open army panel + settings panel and screenshot
await pg.evaluate(()=>{if(!run){}CC.closePanel()});
await pg.evaluate(()=>{document.querySelector('#cc-nav [data-nav=army]').click()});await pg.waitForTimeout(500);await pg.screenshot({path:'/tmp/s_army.png'});
await pg.evaluate(()=>{document.querySelector('#cc-nav [data-nav=set]').click()});await pg.waitForTimeout(500);await pg.screenshot({path:'/tmp/s_set.png'});
await pg.evaluate(()=>{document.querySelector('[data-do=stab][data-a="3"]').click()});await pg.waitForTimeout(300);await pg.screenshot({path:'/tmp/s_save.png'});
// persistence across a real page reload
const before=await pg.evaluate(()=>localStorage.getItem(KEYS.s1)!==null);
await pg.reload();await pg.waitForTimeout(500);
const after=await pg.evaluate(()=>({has:localStorage.getItem(KEYS.s1)!==null,latest:latestSlot(),cont:$('mC').style.display}));
console.log(JSON.stringify({before,after}));
await b.close();
const ok=r.farBlocked!==false&&r.nbDeclared&&r.saved&&r.loaded&&r.warsBack&&r.yearBack&&!errs.length&&after.has;
process.exit(ok?0:1)})();
