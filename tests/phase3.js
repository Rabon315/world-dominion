// Phase-3 tests: menus/save/settings via real clicks, research, events, AI diplomacy, soak. Usage: node tests/phase3.js
const {chromium}=require('playwright'),path=require('path');
const URL='file://'+path.resolve(__dirname,'../www/index.html');
(async()=>{
const b=await chromium.launch(),ctx=await b.newContext({viewport:{width:915,height:412}}),pg=await ctx.newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const R={};const vis=id=>pg.evaluate(i=>getComputedStyle(document.getElementById(i)).display!=='none',id);
await pg.goto(URL);
R.menuShownFirst=await vis('menu')&&!await vis('start');R.noContinueYet=!await pg.isVisible('#mC');
await pg.click('#mN');R.startOpens=await vis('start');
await pg.click('button.g[onclick="begin()"]');
await pg.evaluate(()=>{let i=0;for(;i<W*H;i++)if(TR[i]===1)break;dispatch({t:'spawn',i});window.__i=i});
R.playing=await pg.evaluate(()=>stage==='play'&&run&&timer!==null);
// pause menu stops the clock, ⏸ etc.
await pg.click('#mn');R.pauseOpen=await vis('sys');R.clockStoppedInMenu=await pg.evaluate(()=>timer===null);
await pg.evaluate(()=>{G[1]=5000});
await pg.click('#sysb button:has-text("ذخیره‌ی بازی")');R.manualSaved=await pg.evaluate(()=>!!readSave('manual'));
await pg.click('#sysb button:has-text("ادامه")');R.clockResumes=await pg.evaluate(()=>timer!==null);
// advance, then load the manual save: state must go back
const before=await pg.evaluate(()=>{for(let n=0;n<300;n++)tick();return tk});
await pg.click('#mn');await pg.click('#sysb button:has-text("بارگذاری")');await pg.click('#sysb button:has-text("ذخیره‌ی دستی")');
R.loadedBack=await pg.evaluate(b=>tk<b&&run&&timer!==null&&!sysO&&G[1]>=5000,before);
// corrupt save: rejected, game untouched
await pg.evaluate(()=>{localStorage.setItem(KEYS.manual,'{"v":3,"broken":');});
const snapTk=await pg.evaluate(()=>tk);
await pg.click('#mn');await pg.click('#sysb button:has-text("بارگذاری")');
R.corruptDisabled=await pg.evaluate(()=>[...document.querySelectorAll('#sysb button')].find(x=>x.textContent.includes('ذخیره‌ی دستی')).disabled);
R.corruptNoCrash=await pg.evaluate(()=>{const ok=loadGame('manual');return ok===false});
await pg.click('#sysb button:has-text("بازگشت")');await pg.click('#sysb button:has-text("ادامه")');
// settings persist across reload
await pg.click('#mn');await pg.click('#sysb button:has-text("تنظیمات")');
await pg.click('#sysb button:has-text("بزرگ"):not(:has-text("خیلی"))');await pg.click('#sysb button:has-text("×۳")');
R.settingsApplied=await pg.evaluate(()=>SET.scale===1.15&&spd===3&&getComputedStyle(document.documentElement).getPropertyValue('--ui').trim()==='1.15');
await pg.evaluate(()=>{saveGame('auto')});
await pg.reload();
R.settingsPersist=await pg.evaluate(()=>SET.scale===1.15&&SET.speed===3&&spd===3);
R.continueVisible=await pg.isVisible('#mC');
await pg.click('#mC');R.continued=await pg.evaluate(()=>stage==='play'&&run&&!!TR&&timer!==null);
// research
const rs=await pg.evaluate(()=>{const o={};G[1]=2000;o.prereqBlocked=(mgAct('rs','ind2'),M.rs===null);mgAct('rs','ind1');o.started=M.rs&&M.rs.id==='ind1';o.paid=G[1]<=1900;
 mgAct('rs','agr1');o.oneAtATime=M.rs.id==='ind1';clearInterval(timer);
 for(let n=0;n<10*30&&M.rs;n++){tick();if($('mg').style.display==='flex')closeM()}
 o.done=!!M.tech.ind1&&M.rs===null&&M.lvl.ind===1;mgAct('rs','ind2');o.chain=M.rs&&M.rs.id==='ind2';return o});
Object.assign(R,{research:rs});
// events weighted + not repeating immediately
R.events=await pg.evaluate(()=>{const c=[0,0,0,0,0,0];M.eff=30;M.tax=40;for(let n=0;n<600;n++){M.last=-1;c[pickEv()]++}M.last=1;let rep=0;for(let n=0;n<600;n++){M.last=1;if(pickEv()===1)rep++}return{lowHappinessFavoursProtests:c[1]>c[3]*1.8,repeatSuppressed:rep<c[1]*.5,noReligionNoise:c[2]<c[3]}});
// AI diplomacy + soak with several seeds
R.soak=await pg.evaluate(()=>{const out=[];for(const sd of [1,2,3,4]){newGame({rivals:21,win:80,name:'s',rg:3,gov:'جمهوری',aspect:2.2,seed:sd});allocMap();let i=0;for(;i<W*H;i++)if(TR[i]===1)break;dispatch({t:'spawn',i});clearInterval(timer);
  let nan=false,asym=false,maxAl=0,aiWar=0,types=new Set(ps.slice(2));
  for(let n=0;n<7000&&run;n++){tick();if($('mg').style.display==='flex')closeM();if(n%60===0){dispatch({t:'attack',i,r:.4});if(T[1]<20)T[1]=100}
   if(n%100===0&&A.some(x=>x.p>1&&x.t>1))aiWar++;if(n%500===0){for(let p=1;p<=N;p++)if(!Number.isFinite(T[p])||!Number.isFinite(G[p])||!Number.isFinite(cnt[p]))nan=true;
    let al=0;for(let a=2;a<=N;a++)for(let b=2;b<=N;b++){if(aAl[a][b]!==aAl[b][a])asym=true;if(aRel[a][b]<0||aRel[a][b]>100)asym=true;if(a<b&&aAl[a][b])al++}maxAl=Math.max(maxAl,al)}}
  out.push({sd,ticks:tk,nan,asym,maxAl,aiWar,personalities:types.size})}return out});
R.aiAllianceSeen=R.soak.some(x=>x.maxAl>0)&&R.soak.every(x=>x.maxAl<=22);R.aiWarsSeen=R.soak.every(x=>x.aiWar>0);
console.log(JSON.stringify({R,errs},null,1));
const rr=R.research;
const ok=R.menuShownFirst&&R.noContinueYet&&R.startOpens&&R.playing&&R.pauseOpen&&R.clockStoppedInMenu&&R.manualSaved&&R.clockResumes&&R.loadedBack&&R.corruptDisabled&&R.corruptNoCrash&&R.settingsApplied&&R.settingsPersist&&R.continueVisible&&R.continued
 &&rr.prereqBlocked&&rr.started&&rr.paid&&rr.oneAtATime&&rr.done&&rr.chain&&R.events.lowHappinessFavoursProtests&&R.events.repeatSuppressed&&R.events.noReligionNoise
 &&R.soak.every(x=>!x.nan&&!x.asym&&x.personalities===3)&&R.aiAllianceSeen&&R.aiWarsSeen&&!errs.length;
console.log(ok?'PASS':'FAIL');await b.close();process.exit(ok?0:1)})();
