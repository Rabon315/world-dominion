/* WORLD DOMINION — war system.
   RULE: you can only attack a country that SHARES A BORDER with you (neighbour).
   Flip WAR_NEIGHBORS_ONLY to false if you ever want to allow attacks on any country. */
const WAR_NEIGHBORS_ONLY=true;
// Region adjacency (land borders + short sea crossings). Indices follow REGION_SEEDS in world.js.
const REGION_ADJ=[[0,1],[0,3],[0,23],[1,23],[1,22],[22,2],[22,30],[2,30],[23,22],[4,28],[4,5],[4,6],[5,6],[5,7],[6,29],[7,29],[7,24],[29,24],[6,13],[6,14],[6,18],[6,28],
 [7,8],[8,9],[8,10],[9,10],[9,11],[10,11],[8,12],[8,25],[10,25],[12,24],[12,13],[12,25],[12,14],[12,15],[13,24],[13,14],[14,15],[14,16],[14,18],[14,27],[15,26],[26,27],[26,17],
 [16,27],[16,18],[16,19],[27,31],[31,17],[17,20],[17,21],[20,21],[19,21]];
const REGION_NB=(()=>{const a=Array.from({length:32},()=>[]);for(const [x,y] of REGION_ADJ){a[x].push(y);a[y].push(x)}return a})();
const War=(()=>{
 const cl_=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
 const COST={declare:20,battle:12};
 const wc=id=>WORLD&&WORLD.countries.find(c=>c.id===id);
 function ensure(){
  const W=WORLD;if(!W||W.mode!=='sovereign')return false;
  W.wars=W.wars||[];W.truces=W.truces||{};
  if(stage==='play'&&!W.warInit){
   // Give every unclaimed region to a nearby AI state, so every border has a real neighbour.
   const ai=c=>c>1;let guard=0,left=W.regions.filter(r=>!r.owner);
   while(left.length&&guard++<40){
    for(const r of left){const c=REGION_NB[r.id].map(j=>W.regions[j].owner).filter(ai);if(c.length)r.owner=c[Math.floor(R()*c.length)]}
    left=W.regions.filter(r=>!r.owner);
    if(left.length&&guard>20){for(const r of left){let b=null,d=1e9;for(const o of W.regions)if(o.owner>1){const k=Math.hypot(o.x-r.x,o.y-r.y);if(k<d){d=k;b=o}}if(b)r.owner=b.owner}}
   }
   const cap=W.regions.find(r=>r.owner===1);if(cap)W.capital=cap.id;
   W.warInit=true;
  }
  return true}
 const regs=id=>WORLD.regions.filter(r=>r.owner===id);
 function isNeighbor(a,b){if(!WORLD)return false;for(const r of WORLD.regions){if(r.owner!==a)continue;for(const j of REGION_NB[r.id])if(WORLD.regions[j].owner===b)return true}return false}
 function neighbors(id){const s=new Set();for(const r of WORLD.regions){if(r.owner!==id)continue;for(const j of REGION_NB[r.id]){const o=WORLD.regions[j].owner;if(o&&o!==id)s.add(o)}}return[...s]}
 function find(id){ensure();return WORLD.wars.find(w=>(w.a===1&&w.b===id)||(w.b===1&&w.a===id))}
 function power(c){const t=c.player?((WORLD.techs||{}).mil||0):0,mn=c.player&&typeof M!=='undefined'&&M.cab&&M.cab.def?1+M.cab.def.comp*.02:1;return c.army*(1+c.industry*.004+c.science*.003+t*.03)*(.55+c.stability/220)*mn}
 function canDeclare(id){
  ensure();const me=wc(1),en=wc(id);
  if(!me||!en||id===1)return{ok:false,reason:'هدف نامعتبر'};
  if(!en.alive)return{ok:false,reason:'این کشور دیگر وجود ندارد'};
  if(find(id))return{ok:false,reason:'در حال جنگ هستید'};
  if((me.alliances||[]).includes(id))return{ok:false,reason:'متحد شماست'};
  if(WAR_NEIGHBORS_ONLY&&!isNeighbor(1,id))return{ok:false,reason:'همسایه‌ی شما نیست؛ مرز مشترک ندارید'};
  const tr=WORLD.truces[id];if(tr&&tr>WORLD.turn)return{ok:false,reason:'آتش‌بس تا '+Math.ceil((tr-WORLD.turn)/10)+' ماه دیگر'};
  if(me.treasury<COST.declare)return{ok:false,reason:'بودجه کافی نیست ($'+COST.declare+'B)'};
  return{ok:true,reason:''}}
 function news(t,ev){WORLD.history.unshift(t);if(ev)WORLD.events.unshift({title:ev[0],text:ev[1]||t});WORLD.events=WORLD.events.slice(0,8)}
 function declare(id){const c=canDeclare(id);if(!c.ok)return{ok:false,msg:c.reason};
  const me=wc(1),en=wc(id);me.treasury-=COST.declare;WORLD.wars.push({a:1,b:id,since:WORLD.turn,score:0});
  me.relations[id]=3;en.relations[1]=3;me.legitimacy=cl_(me.legitimacy-3);
  for(const ally of(en.alliances||[])){if(ally!==1&&me.relations[ally]!=null)me.relations[ally]=cl_(me.relations[ally]-15)}
  news('جنگ علیه '+en.name+' آغاز شد.',['اعلان جنگ','نیروهای '+me.name+' و '+en.name+' در مرز رو‌در‌رو شدند.']);
  return{ok:true,msg:'⚔️ جنگ با '+en.name+' آغاز شد'}}
 // pick a border region of `def` that touches `att` (never the capital while the player has other regions)
 function pickBorder(att,def){
  const c=[];for(const r of WORLD.regions){if(r.owner!==def)continue;if(REGION_NB[r.id].some(j=>WORLD.regions[j].owner===att))c.push(r)}
  let pool=c;if(def===1&&c.length>1&&regs(1).length>1){const nc=c.filter(r=>r.id!==WORLD.capital);if(nc.length)pool=nc}
  return pool.length?pool[Math.floor(R()*pool.length)]:null}
 function transfer(r,to){const from=wc(r.owner),dst=wc(to);if(!from||!dst)return;
  const tot=regs(from.id).reduce((s,x)=>s+x.population,0)||1,sh=Math.min(.6,r.population/tot);
  const popMove=from.pop*sh;from.pop=Math.max(1,from.pop-popMove);dst.pop+=popMove;
  const g=from.gdp*Math.min(.35,sh*.6);from.gdp=Math.max(10,from.gdp-g);dst.gdp+=g*.8;
  r.owner=to;r.stability=cl_(r.stability-12)}
 function afterWar(){
  for(const c of WORLD.countries){if(!c.alive||c.player)continue;if(!regs(c.id).length){c.alive=false;
   WORLD.wars=WORLD.wars.filter(w=>w.a!==c.id&&w.b!==c.id);for(const o of WORLD.countries)o.alliances=(o.alliances||[]).filter(x=>x!==c.id);
   const me=wc(1);me.treasury+=c.treasury*.4;me.gdp+=c.gdp*.1;
   news(c.name+' به‌طور کامل تسخیر شد و از نقشه حذف گردید.',['سقوط '+c.name,'این کشور دیگر وجود ندارد.']);
   if(WORLD.selectedCountry===c.id){const n=WORLD.countries.find(x=>x.alive&&x.id!==1);WORLD.selectedCountry=n?n.id:1}}}
  if(!regs(1).length&&run){news('پایتخت سقوط کرد؛ کشور از میان رفت.',['شکست کامل','تمام مناطق کشور از دست رفت.']);run=false;try{HK.end(false)}catch(e){}}}
 function battle(id){
  const w=find(id),me=wc(1),en=wc(id);if(!w||!me||!en)return{ok:false,msg:'جنگی در جریان نیست'};
  if(me.treasury<COST.battle)return{ok:false,msg:'بودجه کافی نیست ($'+COST.battle+'B)'};
  me.treasury-=COST.battle;
  const P=power(me)*(.85+R()*.3),E=power(en)*1.08*(.85+R()*.3),win=P>E,ratio=P/Math.max(1,E);let txt;
  if(win){en.army=cl_(en.army-cl_(5+ratio*3+R()*3,4,16));en.stability=cl_(en.stability-4);me.army=cl_(me.army-(1.5+R()*2));w.score=cl_(w.score+18+ratio*6,-100,100);txt='✅ پیروزی در نبرد با '+en.name+' — برتری '+Math.min(999,Math.round(ratio*100)).toLocaleString('fa-IR')+'٪'}
  else{me.army=cl_(me.army-(4+R()*3));me.stability=cl_(me.stability-3);me.legitimacy=cl_(me.legitimacy-1.5);en.army=cl_(en.army-1);w.score=cl_(w.score-(16+R()*8),-100,100);txt='❌ عقب‌نشینی در برابر '+en.name+' — نیروها آسیب دیدند'}
  if(w.score>=40){const r=pickBorder(1,id);if(r){transfer(r,1);w.score-=40;txt+=' • منطقه‌ی «'+r.name+'» تسخیر شد';news('ارتش '+me.name+' منطقه‌ی '+r.name+' را از '+en.name+' تصرف کرد.',['تصرف '+r.name,'مرزهای کشور گسترش یافت.'])}}
  else if(w.score<=-60){const r=pickBorder(id,1);if(r){transfer(r,id);w.score+=40;txt+=' • منطقه‌ی «'+r.name+'» از دست رفت';news(en.name+' منطقه‌ی '+r.name+' را از شما گرفت.',['از دست رفتن '+r.name,'دشمن از مرز عبور کرد.'])}}
  WORLD.warReport={win,text:txt,turn:WORLD.turn};afterWar();return{ok:true,msg:txt}}
 function endWar(id,months){WORLD.wars=WORLD.wars.filter(w=>!((w.a===1&&w.b===id)||(w.b===1&&w.a===id)));WORLD.truces[id]=WORLD.turn+months*10}
 function peace(id){const w=find(id),me=wc(1),en=wc(id);if(!w||!en)return{ok:false,msg:'جنگی در جریان نیست'};
  const ch=cl_(.3+(w.score>=20?.4:0)+(en.stability<40?.2:0)-(w.score<=-30?.3:0),.05,.95);
  if(R()<ch){endWar(id,24);me.relations[id]=30;en.relations[1]=30;news('آتش‌بس با '+en.name+' برقرار شد.',['آتش‌بس','جنگ با '+en.name+' متوقف شد.']);return{ok:true,msg:'🕊️ آتش‌بس برقرار شد'}}
  return{ok:false,msg:'دشمن آتش‌بس را نپذیرفت'}}
 function surrender(id){const w=find(id),me=wc(1),en=wc(id);if(!w||!en)return{ok:false,msg:'جنگی در جریان نیست'};
  const tribute=Math.min(me.treasury,Math.max(10,me.treasury*.2));me.treasury-=tribute;en.treasury+=tribute;me.legitimacy=cl_(me.legitimacy-8);me.stability=cl_(me.stability-4);
  endWar(id,36);news('تسلیم و پرداخت غرامت به '+en.name+'.',['تسلیم','غرامت جنگی پرداخت شد.']);return{ok:true,msg:'🏳️ جنگ با پرداخت غرامت پایان یافت'}}
 function enemyOffensive(w,en){const me=wc(1),id=en.id,P=power(en)*(.85+R()*.3),E=power(me)*1.08*(.85+R()*.3);
  if(P>E){me.army=cl_(me.army-(3+R()*2));me.stability=cl_(me.stability-3);en.army=cl_(en.army-1);w.score=cl_(w.score-14,-100,100);WORLD.warReport={win:false,text:'⚠️ '+en.name+' حمله کرد و نیروهای شما عقب نشستند',turn:WORLD.turn}}
  else{en.army=cl_(en.army-4);me.army=cl_(me.army-1);w.score=cl_(w.score+10,-100,100);WORLD.warReport={win:true,text:'🛡️ حمله‌ی '+en.name+' دفع شد',turn:WORLD.turn}}
  if(w.score<=-60){const r=pickBorder(id,1);if(r){transfer(r,id);w.score+=40;news(en.name+' منطقه‌ی '+r.name+' را تصرف کرد.',['از دست رفتن '+r.name,'دشمن پیشروی کرد.'])}}
  afterWar()}
 function monthly(){
  if(!ensure())return;const W=WORLD,me=wc(1);if(!me)return;
  for(const k in W.truces)if(W.truces[k]<=W.turn)delete W.truces[k];
  for(const w of W.wars.slice()){if(w.a!==1&&w.b!==1)continue;const id=w.a===1?w.b:w.a,en=wc(id);if(!en||!en.alive){W.wars=W.wars.filter(x=>x!==w);continue}
   me.treasury=Math.max(0,me.treasury-4);me.stability=cl_(me.stability-.5);me.legitimacy=cl_(me.legitimacy-.25);me.gdp*=.997;en.gdp*=.995;
   if(R()<.4)enemyOffensive(w,en)}
  if(W.turn%30===0){
   // AI aggression: strong, hostile neighbours may declare war on the player
   for(const c of W.countries){if(c.player||!c.alive||find(c.id))continue;
    if(c.army>58&&(me.relations[c.id]||50)<30&&isNeighbor(c.id,1)&&!(me.alliances||[]).includes(c.id)&&!(W.truces[c.id]>W.turn)&&R()<.2){
     W.wars.push({a:c.id,b:1,since:W.turn,score:0});news(c.name+' به شما اعلان جنگ داد.',['اعلان جنگ از سوی '+c.name,'دشمن در مرز مستقر شد.']);break}}
   // living world: a strong AI state occasionally takes a border region from a weaker AI neighbour
   if(W.turn%60===0&&R()<.5){const ai=W.countries.filter(c=>!c.player&&c.alive),a=ai[Math.floor(R()*ai.length)];
    if(a){const nb=neighbors(a.id).filter(i=>i!==1).map(wc).filter(c=>c&&c.alive&&regs(c.id).length>1&&power(c)*1.5<power(a));
     if(nb.length){const d=nb[Math.floor(R()*nb.length)],r=pickBorder(a.id,d.id);if(r){transfer(r,a.id);d.relations[a.id]=5;a.relations[d.id]=5;news(a.name+' منطقه‌ی '+r.name+' را از '+d.name+' تصرف کرد.')}}}}}
  W.wars=W.wars.filter(w=>{const x=wc(w.a),y=wc(w.b);return x&&y&&x.alive&&y.alive})}
 return{ensure,isNeighbor,neighbors,find,power,canDeclare,declare,battle,peace,surrender,monthly,COST}
})();
