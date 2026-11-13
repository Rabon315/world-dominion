// Persistence: save slots + settings in localStorage (survives app restarts in the Android WebView).
const KEYS={manual:'wd.save.manual.v3',auto:'wd.save.auto.v3',s1:'wd.save.s1.v3',s2:'wd.save.s2.v3',s3:'wd.save.s3.v3'};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
// A save only counts as successful when it can be read back identically.
function saveGame(slot){
 if(!TR||stage!=='play'||!run||!KEYS[slot])return false;
 try{
  const o=snapshot();o.savedAt=Date.now();o.title=nm[1];const s=JSON.stringify(o),k=KEYS[slot];
  const prev=store.get(k);
  if(!store.set(k,s)){ // storage full: drop the old backup and retry once
   store.del(k+'.bak');if(!store.set(k,s))return false}
  const back=store.get(k);if(!back||back.length!==s.length)return false;
  if(slot==='auto'&&prev)store.set(k+'.bak',prev); // keep the previous autosave as a safety net
  return true}catch(e){return false}}
let _ast=0;function autoSaveSoon(){if(!SET.autosave)return;clearTimeout(_ast);_ast=setTimeout(()=>{saveGame('auto')},1200)}
function readSave(slot){
 for(const key of [KEYS[slot],KEYS[slot]+'.bak']){const t=store.get(key);if(!t)continue;
  try{const o=JSON.parse(t);if(validSnap(o))return o}catch(e){}}
 return null}
function loadGame(slot){const o=readSave(slot);return o?restore(o):false}
function saveInfo(slot){const o=readSave(slot);if(!o)return null;const w=o.WORLD;return{title:o.title||'',year:w&&w.year?w.year:2026+Math.floor(o.tk/600),month:w&&w.month||0,at:o.savedAt||0,regions:w&&w.regions?w.regions.filter(r=>r.owner===1).length:0}}
function delSave(slot){store.del(KEYS[slot]);store.del(KEYS[slot]+'.bak')}
function latestSlot(){let best=null,at=-1;for(const k in KEYS){const i=saveInfo(k);if(i&&i.at>=at){at=i.at;best=k}}return best}
// ---- graphics quality presets (dpr = render resolution cap, fps = frame cap, fx = effect level)
const QP=[{n:'کم',dpr:1,fps:30,fx:0},{n:'متوسط',dpr:1.5,fps:30,fx:1},{n:'بالا',dpr:2,fps:60,fx:2},{n:'اولترا',dpr:3,fps:60,fx:3}];
const qp=()=>QP[SET.quality]||QP[2];
// ---- settings (only options that really do something)
const SKEY='wd.settings.v1',DEF={autosave:true,toasts:true,labels:true,scale:1,speed:1,quality:2,autoq:true,fx:true};
let SET=Object.assign({},DEF);
function loadSet(){
 try{const o=JSON.parse(store.get(SKEY));if(o&&typeof o==='object')for(const k in DEF)if(typeof o[k]===typeof DEF[k])SET[k]=o[k]}catch(e){}
 if(![.9,1,1.15,1.3].includes(SET.scale))SET.scale=1;if(![1,2,3].includes(SET.speed))SET.speed=1;if(![0,1,2,3].includes(SET.quality))SET.quality=2}
function saveSet(){store.set(SKEY,JSON.stringify(SET))}
