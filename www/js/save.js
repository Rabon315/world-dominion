// Persistence: save slots + settings in localStorage (survives app restarts in the Android WebView).
const KEYS={manual:'wd.save.manual.v3',auto:'wd.save.auto.v3'};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
function saveGame(slot){
 if(!TR||stage!=='play'||!run||!KEYS[slot])return false;
 const o=snapshot();o.savedAt=Date.now();o.title=nm[1];
 return store.set(KEYS[slot],JSON.stringify(o))}
function readSave(slot){
 const t=store.get(KEYS[slot]);if(!t)return null;
 try{const o=JSON.parse(t);return validSnap(o)?o:null}catch(e){return null}}
function loadGame(slot){const o=readSave(slot);return o?restore(o):false}
function saveInfo(slot){const o=readSave(slot);return o?{title:o.title||'',year:2026+Math.floor(o.tk/600),at:o.savedAt||0}:null}
function delSave(slot){store.del(KEYS[slot])}
function latestSlot(){const a=saveInfo('auto'),m=saveInfo('manual');if(a&&m)return a.at>=m.at?'auto':'manual';return a?'auto':m?'manual':null}
// ---- settings (only options that really do something)
const SKEY='wd.settings.v1',DEF={autosave:true,toasts:true,labels:true,scale:1,speed:1};
let SET=Object.assign({},DEF);
function loadSet(){
 try{const o=JSON.parse(store.get(SKEY));if(o&&typeof o==='object')for(const k in DEF)if(typeof o[k]===typeof DEF[k])SET[k]=o[k]}catch(e){}
 if(![.9,1,1.15,1.3].includes(SET.scale))SET.scale=1;if(![1,2,3].includes(SET.speed))SET.speed=1}
function saveSet(){store.set(SKEY,JSON.stringify(SET))}
