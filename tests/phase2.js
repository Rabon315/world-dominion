// Phase-2 tests: determinism, snapshot/restore, command layer, aspect fit. Usage: node tests/phase2.js
const {chromium}=require('playwright'),path=require('path');
(async()=>{
const b=await chromium.launch(),pg=await b.newPage({viewport:{width:900,height:400}});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../www/index.html'));
const r=await pg.evaluate(()=>{
 const out={};
 const hash=()=>{const s=JSON.stringify(snapshot());let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(h,31)+s.charCodeAt(i))|0;return h};
 const cfg=sd=>({rivals:13,win:65,name:'t',rg:3,gov:'جمهوری',aspect:2.2,seed:sd});
 const start=sd=>{newGame(cfg(sd));allocMap();let i=0;for(;i<W*H;i++)if(TR[i]===1)break;dispatch({t:'spawn',i});clearInterval(timer);return i};
 const steps=(n,i)=>{for(let k=0;k<n&&run;k++){tick();if($('mg').style.display==='flex')closeM();if(k%40===0)dispatch({t:'attack',i,r:.4})}clearInterval(timer)};
 // aspect
 newGame(cfg(1));out.W_wide=W;newGame({...cfg(1),aspect:1.5});out.W_narrow=W;newGame({...cfg(1),aspect:5});out.W_cap=W;
 // determinism
 let i=start(777);steps(1200,i);const h1=hash();i=start(777);steps(1200,i);out.deterministic=h1===hash();
 i=start(778);steps(1200,i);out.seedMatters=h1!==hash();
 // snapshot/restore continues identically
 i=start(99);steps(600,i);const snap=snapshot();steps(500,i);const hA=hash();
 out.restoreOK=restore(JSON.parse(JSON.stringify(snap)));steps(500,i);out.restoreIdentical=hA===hash();
 // corrupt data is rejected and leaves state alone
 const before=hash();out.rejectEmpty=restore({})===false;out.rejectTrunc=restore({...snap,TR:snap.TR.slice(5)})===false;out.rejectNull=restore(null)===false;
 out.rejectBadN=restore({...snap,cnt:[1]})===false;out.stateKept=before===hash();
 // command layer guards
 start(5);out.attackOwnLand=dispatch({t:'attack',i:owner.indexOf(1),r:.5})===null;out.nukeNoGold=(G[1]=0,dispatch({t:'nuke',i:0}))===false;
 dispatch({t:'tax',v:999});out.taxClamped=M.tax===60;dispatch({t:'wk',v:30});out.wk=wk[1];
 out.noMathRandom=!/Math\.random/.test([...document.scripts].map(s=>s.src).join())
 return out});
const fs=require('fs');const src=fs.readdirSync(path.resolve(__dirname,'../www/js')).map(f=>fs.readFileSync(path.resolve(__dirname,'../www/js',f),'utf8')).join('\n');
r.noMathRandom=!/Math\.random/.test(src);
console.log(JSON.stringify({r,errs},null,1));
const ok=r.W_wide===209&&r.W_narrow===150&&r.W_cap===210&&r.deterministic&&r.seedMatters&&r.restoreOK&&r.restoreIdentical&&r.rejectEmpty&&r.rejectTrunc&&r.rejectNull&&r.rejectBadN&&r.stateKept&&r.attackOwnLand&&r.nukeNoGold&&r.taxClamped&&r.wk===.3&&r.noMathRandom&&!errs.length;
console.log(ok?'PASS':'FAIL');await b.close();process.exit(ok?0:1)})();
