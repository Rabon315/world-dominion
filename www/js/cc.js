// WORLD DOMINION — Command Center: mockup-style dashboard on top of the sovereign simulation (WORLD).
// Adds: photoreal map w/ regional hotspots, resource bar, country panel, widgets, 13 menu panels,
// ministers (cabinet effects), technology, historic decisions and a "living world" event generator.
const CC=(()=>{
 const HOT=[[.1767,.3599],[.1678,.5642],[.3048,.8366],[.3887,.1556],[.5194,.3268],[.4814,.3988],[.6095,.3113],[.5654,.463],[.4947,.5642],[.4594,.6712],[.6228,.6809],[.5786,.8852],[.6493,.5214],[.6254,.3988],[.7023,.3794],[.7465,.5486],[.8525,.3794],[.8613,.642],[.7951,.2179],[.9382,.4436],[.9364,.9339],[.9611,.8132],[.2491,.7821],[.2624,.6187],[.6034,.4669],[.6608,.5992],[.7792,.5837],[.826,.4864],[.5654,.2296],[.5848,.4183],[.3286,.749],[.8392,.5934]];
 const IW=1132,IH=514,mapImg=new Image();let mapOK=false;mapImg.onload=()=>{mapOK=true};mapImg.src='assets/world-map.jpg';
 const NAV=[['dash','📊','داشبورد'],['me','🏳️','کشور من'],['eco','🪙','اقتصاد'],['pop','👥','جمعیت'],['pol','🏛️','سیاست داخلی'],['min','🏢','وزارتخانه‌ها'],['army','⚔️','ارتش'],['dip','🕊️','دیپلماسی'],['tech','⚛️','فناوری'],['infra','🏭','زیرساخت'],['news','🌐','اخبار جهان'],['hist','🕰️','تاریخچه'],['set','⚙️','تنظیمات']];
 const MINS=[['eco','وزیر اقتصاد','رشد اقتصادی','🪙'],['def','وزیر دفاع','بودجه‌ی دفاعی و ارتش','🛡️'],['for','وزیر خارجه','روابط بین‌الملل','🕊️'],['edu','وزیر آموزش','توسعه‌ی علمی','🎓'],['hlt','وزیر بهداشت','رفاه و جمعیت','⚕️'],['int','وزیر کشور','ثبات سیاسی','🏛️']];
 const TECHS=[['ener','انرژی نو','⚡',30,'رشد GDP +۰٫۰۶٪ ماهانه برای هر سطح'],['ai','هوش مصنوعی','🤖',45,'صنعت +۱ هر ۶ ماه برای هر سطح'],['med','پزشکی نوین','⚕️',25,'ثبات +۱٫۵ و رشد جمعیت'],['agri','کشاورزی هوشمند','🌾',25,'رضایت مردم +۱٫۲ هر سطح'],['mil','فناوری دفاعی','🛰️',35,'قدرت ارتش +۴ هر سطح'],['fin','اقتصاد دیجیتال','💳',40,'درآمد خزانه +۶٪ هر سطح']];
 const $=id=>document.getElementById(id),F=n=>Math.round(n).toLocaleString('fa-IR'),F1=n=>(Math.round(n*10)/10).toLocaleString('fa-IR'),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
 let el={},on=false,view={z:1,x:0,y:0},cw=0,ch=0,dpr=1,hover=-1,panel='',prev=null,raf=0,drag=null,pinch=0,widgetsOpen=false,t0=performance.now();
 const MON=['دی','بهمن','اسفند','فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر'];
 function dateStr(){const W=WORLD;if(!W)return'—';try{const d=new Date(Date.UTC(W.year,W.month-1,1+(W.turn%10)*3));return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(d)}catch(e){return W.year+'/'+W.month}}
 function clockStr(){const m=((WORLD?WORLD.turn:0)*83+1305)%1440;return String(Math.floor(m/60)).padStart(2,'0').replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])+':'+String(m%60).padStart(2,'0').replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])}
 const me=()=>WORLD&&WORLD.countries[0],cty=id=>WORLD&&WORLD.countries.find(c=>c.id===id),sel=()=>cty(WORLD.selectedCountry)||me();
 const bar=(v,c)=>'<div class="cbar"><i style="width:'+clamp(v)+'%;'+(c?'background:'+c:'')+'"></i></div>';
 const delta=(a,b)=>b?((a-b)/b*100):0,arrow=d=>'<em class="'+(d>=0?'up':'dn')+'">'+(d>=0?'▲':'▼')+' '+(d>=0?'+':'')+F1(d)+'٪</em>';
 // ================= DOM =================
 function build(){
  const d=document.createElement('div');d.id='ccroot';d.innerHTML=`
  <header class="cc-top">
   <div class="cc-logo"><img src="assets/wd-logo.png" alt=""><div><b>WORLD<br>DOMINION</b><small>THE WORLD IS YOURS TO SHAPE</small></div></div>
   <button class="cc-burger" id="cc-burger">☰</button>
   <div class="cc-res" id="cc-res"></div>
   <div class="cc-time"><div class="cc-date"><span id="cc-date"></span><b id="cc-clock"></b></div>
    <div class="cc-speed"><button id="cc-pause" class="round" title="توقف / ادامه">⏸</button><button id="cc-ff" class="round" title="سرعت">⏩</button><span class="pill" id="cc-x">×۱</span><button id="cc-snd" class="round sm" title="صدا">🔊</button></div></div>
  </header>
  <nav class="cc-nav" id="cc-nav">${NAV.map(n=>`<button data-nav="${n[0]}"><i>${n[1]}</i><span>${n[2]}</span></button>`).join('')}</nav>
  <section class="cc-map" id="cc-map"><canvas id="ccmap"></canvas>
   <div class="compass"><svg viewBox="-50 -50 100 100"><circle r="36" fill="none" stroke="#d7b05a" stroke-width="1.2" opacity=".8"/><path d="M0-44 8-8 44 0 8 8 0 44-8 8-44 0-8-8Z" fill="#e8c368" opacity=".9"/><path d="M0-44 4-4-4-4Z M44 0 4 4 4-4Z" fill="#fff4c9"/><text y="-37" text-anchor="middle" fill="#f0d68a" font-size="11" font-family="Inter,sans-serif">N</text></svg></div>
   <div class="tip" id="cc-tip"></div><div class="hint" id="cc-hint"></div>
   <div class="zoom"><button id="cc-zi">+</button><button id="cc-zo">−</button><button id="cc-zr">⌂</button></div></section>
  <aside class="cc-side" id="cc-side"></aside>
  <section class="cc-widgets" id="cc-widgets">
   <article class="w w-news"><h4><span>مشاهده‌ی هفته</span><b>🌐 اخبار جهان</b></h4><div id="w-news"></div></article>
   <article class="w w-eco"><h4><span id="w-ecot"></span><b>📈 روند اقتصاد جهانی</b></h4><canvas id="w-chart" width="360" height="110"></canvas></article>
   <article class="w w-army"><h4><span></span><b>🛡️ وضعیت ارتش</b></h4><div class="army"><img src="assets/army.jpg" alt=""><div id="w-army"></div></div></article>
   <article class="w w-ev"><h4><span></span><b>❗ رویدادهای مهم</b></h4><div id="w-ev"></div></article>
  </section>
  <footer class="cc-act" id="cc-act">
   <div class="act-logo"><img src="assets/wd-logo.png" alt=""></div>
   <button data-act="invest"><i>🏗️</i><span>ساخت‌وساز</span><small id="a-invest"></small></button>
   <button data-act="deals"><i>🤝</i><span>معاملات بین‌المللی</span></button>
   <button data-act="play" class="main"><i>🌍</i><span id="a-play">ادامه بازی</span></button>
   <button data-act="decide"><i>🏛️</i><span>تصمیمات تاریخی</span></button>
   <button data-act="research"><i>🔬</i><span>تحقیقات</span><small id="a-res"></small></button>
  </footer>
  <button class="cc-wtoggle" id="cc-wt">📊</button>
  <div class="cc-modal" id="cc-modal"><div class="cc-sheet" id="cc-sheet"></div></div>`;
  document.body.appendChild(d);for(const k of['ccmap','cc-tip','cc-hint','cc-res','cc-side','cc-sheet','cc-modal','cc-map'])el[k]=$(k);el['cc']=d;
  // events
  d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;WDA.fx('click');
   if(b.dataset.nav)return navTo(b.dataset.nav);if(b.dataset.act)return act(b.dataset.act);if(b.dataset.do)return doIt(b.dataset.do,b.dataset.a,b.dataset.b)});
  d.addEventListener('pointerover',e=>{if(e.pointerType==='mouse'&&e.target.closest('button'))WDA.fx('hover')});
  $('cc-pause').onclick=()=>{if(stage!=='play')return;setPause(!paused);syncSpeed()};
  $('cc-ff').onclick=()=>{if(stage!=='play')return;spd=spd===1?2:spd===2?3:1;SET.speed=spd;saveSet();$('sp').textContent='⏩ ×'+F(spd);if(paused)setPause(false);setT();syncSpeed()};
  $('cc-snd').onclick=()=>{const v=!(WDA.music||WDA.sfxOn);WDA.setMusic(v);WDA.setSfx(v);$('cc-snd').textContent=v?'🔊':'🔇'};
  $('cc-burger').onclick=()=>d.classList.toggle('navopen');$('cc-wt').onclick=()=>{widgetsOpen=!widgetsOpen;d.classList.toggle('wopen',widgetsOpen)};
  $('cc-zi').onclick=()=>zoom(1.3);$('cc-zo').onclick=()=>zoom(1/1.3);$('cc-zr').onclick=()=>{view={z:1,x:0,y:0}};
  $('cc-modal').addEventListener('click',e=>{if(e.target.id==='cc-modal')closePanel()});
  const m=el['ccmap'],pts=new Map();let moved=0;
  m.onpointerdown=e=>{m.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;if(pts.size===2){const a=[...pts.values()];pinch=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])}};
  m.onpointermove=e=>{const o=pts.get(e.pointerId),r=m.getBoundingClientRect();if(!o){hover=pick(e.clientX-r.left,e.clientY-r.top);return}const dx=e.clientX-o[0],dy=e.clientY-o[1];pts.set(e.pointerId,[e.clientX,e.clientY]);moved+=Math.abs(dx)+Math.abs(dy);
   if(pts.size===2){const a=[...pts.values()],nd=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pinch)zoom(nd/pinch);pinch=nd;moved=99}else if(moved>7){view.x+=dx;view.y+=dy;clampView()}};
  m.onpointerup=e=>{const r=m.getBoundingClientRect(),was=pts.size===1&&moved<8;pts.delete(e.pointerId);pinch=0;if(was)click(e.clientX-r.left,e.clientY-r.top)};
  m.onpointercancel=e=>pts.delete(e.pointerId);
  m.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.15:.87,e.offsetX,e.offsetY)},{passive:false});
  addEventListener('resize',fit);
 }
 // ================= map geometry =================
 function geo(){const base=Math.max(cw/IW,ch/IH),s=base*view.z,dw=IW*s,dh=IH*s;return{s,dw,dh,ox:(cw-dw)/2+view.x,oy:(ch-dh)/2+view.y}}
 function clampView(){const base=Math.max(cw/IW,ch/IH),dw=IW*base*view.z,dh=IH*base*view.z,mx=Math.max(0,(dw-cw)/2),my=Math.max(0,(dh-ch)/2);view.x=clamp(view.x,-mx,mx);view.y=clamp(view.y,-my,my)}
 function zoom(f,px=cw/2,py=ch/2){const g=geo(),nz=clamp(view.z*f,1,4.5),k=nz/view.z;view.x=(view.x-(px-cw/2))*k+(px-cw/2);view.y=(view.y-(py-ch/2))*k+(py-ch/2);view.z=nz;clampView()}
 const P=(i,g)=>[g.ox+HOT[i][0]*g.dw,g.oy+HOT[i][1]*g.dh];
 function pick(x,y){const g=geo();let b=-1,bd=1e9;for(let i=0;i<HOT.length;i++){const[px,py]=P(i,g),d=Math.hypot(px-x,py-y);if(d<bd){bd=d;b=i}}return bd<Math.max(26,g.s*58)?b:-1}
 function click(x,y){const i=pick(x,y);if(i<0||!WORLD)return;
  if(stage==='spawn'){WDA.fx('confirm');startWorld(i);WDA.game();return}
  WDA.fx('click');dispatch({t:'world-select',region:i});update()}
 function fit(){if(!on)return;dpr=Math.min(qp().dpr,devicePixelRatio||1);const r=el['cc-map'].getBoundingClientRect();cw=Math.max(10,r.width);ch=Math.max(10,r.height);const c=el['ccmap'];c.width=cw*dpr;c.height=ch*dpr;clampView()}
 // ================= map drawing =================
 function drawMap(now){
  raf=requestAnimationFrame(drawMap);if(!on||document.hidden)return;const q=qp();if(now-(drawMap.l||0)<1000/q.fps-3)return;adaptQ(now-(drawMap.l||now),q);drawMap.l=now;if(!cw)fit();
  const c=el['ccmap'].getContext('2d'),g=geo(),t=(now-t0)/1000;c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.fillStyle='#02060e';c.fillRect(0,0,cw,ch);
  if(mapOK)c.drawImage(mapImg,g.ox,g.oy,g.dw,g.dh);
  if(WORLD){const mine=me();
   // ownership glow
   c.save();c.globalCompositeOperation='lighter';
   WORLD.regions.forEach((r,i)=>{const o=cty(r.owner),[x,y]=P(i,g),rad=(16+Math.sqrt(r.population)*3.4)*Math.max(.8,g.s*1.05);const col=o?o.color:'#6c8196';
    c.drawImage(glowSprite(col,r.owner===1?.55:.34),x-rad,y-rad,rad*2,rad*2)});c.restore();
   // alliance / sanction arcs
   const cap=id=>{const k=WORLD.regions.findIndex(r=>r.owner===id);return k};const seen=new Set();
   for(const a of WORLD.countries)for(const bId of(a.alliances||[])){const key=Math.min(a.id,bId)+'-'+Math.max(a.id,bId);if(seen.has(key))continue;seen.add(key);arc(c,g,cap(a.id),cap(bId),t,'#ffd47a',.5)}
   if(mine)for(const s of(mine.sanctions||[]))arc(c,g,cap(1),cap(s),t,'#ff6a5a',.55);
   if(mine)for(const tr of(mine.trade||[]))arc(c,g,cap(1),cap(tr),t,'#7be0c8',.42);
   for(const w of(WORLD.wars||[]))arc(c,g,cap(w.a),cap(w.b),t,'#ff3b30',.9);
   // markers
   WORLD.regions.forEach((r,i)=>{const[x,y]=P(i,g),o=cty(r.owner),isMe=r.owner===1,isSel=i===WORLD.selected,hv=i===hover;
    if(stage==='spawn'){const p=(t*.9+i*.13)%1;c.strokeStyle='rgba(255,215,120,'+(1-p)*.7+')';c.lineWidth=1.4;c.beginPath();c.arc(x,y,6+p*22,0,6.283);c.stroke()}
    c.fillStyle=isMe?'#ffe39a':o?o.color:'#8ea3b8';c.strokeStyle='rgba(2,6,14,.9)';c.lineWidth=2;c.beginPath();c.arc(x,y,isMe?5.4:3.6,0,6.283);c.stroke();c.fill();
    if(isMe&&mine&&WORLD.regions.findIndex(q=>q.owner===1)===i){c.save();c.translate(x,y);c.rotate(Math.PI/4);c.strokeStyle='#ffe9a8';c.lineWidth=1.6;c.strokeRect(-8,-8,16,16);c.restore();const p=(t*.7)%1;c.strokeStyle='rgba(255,226,150,'+(1-p)*.8+')';c.beginPath();c.arc(x,y,8+p*26,0,6.283);c.stroke()}
    if(isSel||hv){c.save();c.translate(x,y);c.rotate(t*.6);c.strokeStyle=isSel?'#ffd77a':'rgba(255,255,255,.7)';c.lineWidth=1.8;c.setLineDash([5,6]);c.beginPath();c.arc(0,0,13,0,6.283);c.stroke();c.restore()}
    if(g.s>.95&&(view.z>1.5||isSel||hv||isMe)){c.font='800 '+Math.max(9,Math.min(13,9+view.z))+'px Vazirmatn,Tahoma,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle='rgba(2,6,14,.85)';c.fillStyle='#f6efd8';const tx=(o?o.name:'بی‌طرف');c.strokeText(r.name,x,y-12);c.fillText(r.name,x,y-12);c.font='600 10px Vazirmatn,Tahoma,sans-serif';c.fillStyle='#d9b660';c.strokeText(tx,x,y+19);c.fillText(tx,x,y+19)}});
   // tooltip position
   const tip=el['cc-tip'],ri=hover>=0&&stage==='play'?hover:WORLD.selected;
   if(stage==='play'&&ri>=0){const o=cty(WORLD.regions[ri].owner)||null,[x,y]=P(ri,g);tip.style.display='flex';tip.style.transform='translate('+Math.round(Math.min(cw-150,Math.max(8,x+16)))+'px,'+Math.round(Math.min(ch-50,Math.max(8,y-26)))+'px)';const html='<span class="fl">'+(o?o.flag:'🏳️')+'</span><b>'+esc(o?o.name:'منطقه‌ی بی‌طرف')+'</b>';if(tip.dataset.h!==html){tip.innerHTML=html;tip.dataset.h=html}}else tip.style.display='none'}
  // light sweep + vignette
  const sw=((t/9)%1.4-.2)*cw;const sg=c.createLinearGradient(sw-90,0,sw+90,0);sg.addColorStop(0,'rgba(255,215,130,0)');sg.addColorStop(.5,'rgba(255,215,130,.07)');sg.addColorStop(1,'rgba(255,215,130,0)');if(SET.fx&&qp().fx>=1){c.fillStyle=sg;c.fillRect(0,0,cw,ch)}
  const vk=cw+'x'+ch;if(!drawMap.v||drawMap.v.k!==vk){const vc=document.createElement('canvas');vc.width=Math.ceil(cw);vc.height=Math.ceil(ch);vc.k=vk;const v=vc.getContext('2d'),vg=v.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*.35,cw/2,ch/2,Math.max(cw,ch)*.78);vg.addColorStop(0,'rgba(2,6,14,0)');vg.addColorStop(1,'rgba(2,6,14,.72)');v.fillStyle=vg;v.fillRect(0,0,cw,ch);drawMap.v=vc}c.drawImage(drawMap.v,0,0,cw,ch)}
 const _gs={};function glowSprite(col,a){const k=col+a;let s=_gs[k];if(!s){s=document.createElement('canvas');s.width=s.height=128;const g=s.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,hexA(col,a));gr.addColorStop(1,hexA(col,0));g.fillStyle=gr;g.fillRect(0,0,128,128);_gs[k]=s}return s}
 function hexA(h,a){const n=parseInt((h||'#888888').replace('#','').padEnd(6,'8').slice(0,6),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'}
 function arc(c,g,i,j,t,col,al){if(i<0||j<0)return;const[x1,y1]=P(i,g),[x2,y2]=P(j,g),mx=(x1+x2)/2,my=(y1+y2)/2-Math.hypot(x2-x1,y2-y1)*.25;c.save();c.globalCompositeOperation='lighter';c.strokeStyle=hexA(col,al);c.setLineDash([7,7]);c.lineDashOffset=-t*14;c.beginPath();c.moveTo(x1,y1);c.quadraticCurveTo(mx,my,x2,y2);if(SET.fx&&qp().fx>=2){c.lineWidth=4;c.globalAlpha=.25;c.stroke();c.globalAlpha=1}c.lineWidth=1.4;c.stroke();c.setLineDash([]);const u=(t*.18+(i+j)*.07)%1,q=(1-u)*(1-u),r=2*u*(1-u),s=u*u;c.fillStyle='#fff6d6';c.beginPath();c.arc(q*x1+r*mx+s*x2,q*y1+r*my+s*y2,2.4,0,6.283);c.fill();c.restore()}
 // ================= UI updates =================
 function update(){
  if(!on||!WORLD)return;const m=me();if(!m)return;
  const sp=stage==='spawn';el['cc'].classList.toggle('spawn',sp);
  el['cc-hint'].style.display=sp?'block':'none';if(sp)el['cc-hint'].innerHTML='<b>پایتخت کشورت را روی نقشه انتخاب کن</b><small>روی یکی از نقطه‌های درخشان بزن؛ هوش مصنوعی بقیه‌ی جهان را پر می‌کند</small>';
  const pv=prev||m,R=[['🪙','خزانه','$'+F1(m.treasury)+'B',delta(m.treasury,pv.treasury)],['🏛️','تولید ناخالص','$'+F(m.gdp)+'B',delta(m.gdp,pv.gdp)],['🏭','صنعت',F(m.industry)+'٪',delta(m.industry,pv.industry)],['🔬','پژوهش',F(m.science)+' امتیاز',delta(m.science,pv.science)],['👥','جمعیت',F1(m.pop)+'M',delta(m.pop,pv.pop)]];
  el['cc-res'].innerHTML=R.map(r=>'<div class="chip"><i>'+r[0]+'</i><div><b>'+r[2]+'</b><small>'+r[1]+'</small>'+arrow(r[3])+'</div></div>').join('');
  $('cc-date').textContent=dateStr();$('cc-clock').textContent=clockStr();syncSpeed();
  side();widgets();$('a-invest').textContent='$۱۸B';$('a-res').textContent='$۲۲B';
  if(panel)renderPanel()}
 function syncSpeed(){$('cc-pause').textContent=paused?'▶':'⏸';$('cc-pause').classList.toggle('on',paused);$('cc-x').textContent='×'+F(spd);$('a-play').textContent=paused?'ادامه بازی':'توقف بازی';$('cc-snd').textContent=(WDA.music||WDA.sfxOn)?'🔊':'🔇'}
 function side(){
  const c=stage==='spawn'?me():sel(),mine=c.id===1,h=(c.hist||{}).leg||[];
  el['cc-side'].innerHTML=`<div class="s-head"><div class="flag" style="--c:${c.color}">${c.flag||'🏳️'}</div><div><h3>${esc(c.name)}</h3><p>★ پایتخت: ${esc(c.capital)}</p></div></div>
  <div class="s-rows">
   <div><i>👥</i><span>جمعیت</span><b>${F1(c.pop)}M</b>${arrow(delta(c.pop,(c.hist&&c.hist.pop&&c.hist.pop.slice(-2)[0])||c.pop))}</div>
   <div><i>🪙</i><span>تولید ناخالص داخلی</span><b>$${F(c.gdp)}B</b>${arrow(delta(c.gdp,(c.hist&&c.hist.gdp&&c.hist.gdp.slice(-2)[0])||c.gdp))}</div>
   <div><i>🏛️</i><span>خزانه</span><b>$${F(c.treasury)}B</b>${arrow(mine&&prev?delta(c.treasury,prev.treasury):0)}</div>
   <div><i>🛡️</i><span>ثبات سیاسی</span><b>${F(c.stability)}٪</b></div></div>${bar(c.stability,'linear-gradient(90deg,#2e9d4e,#76e08c)')}
  <div class="s-sat"><div class="ring" style="--p:${clamp(c.legitimacy)}"><b>${F(c.legitimacy)}٪</b></div><div class="spark"><h5>${mine?'رضایت مردم':'مشروعیت دولت'}</h5><canvas id="s-spark" width="160" height="70"></canvas></div></div>
  ${mine?'<div class="s-note">هر تصمیم تو روی این اعداد اثر می‌گذارد. ثبات و رضایت پایین یعنی بحران.</div>':`<div class="s-rel">رابطه‌ی ما: <b>${F((me().relations[c.id]||50))}</b> ${bar(me().relations[c.id]||50,'linear-gradient(90deg,#c9a13b,#ffe08a)')}<div class="s-btns"><button data-do="act" data-a="diplomacy">🕊️ مذاکره</button><button data-do="act" data-a="trade">🤝 تجارت</button><button data-do="act" data-a="sanction">⛔ تحریم</button><button data-do="ally">🛡️ اتحاد</button><button data-do="war" class="warb">⚔️ جنگ</button></div></div>`}`;
  spark($('s-spark'),h.length>1?h:[c.legitimacy-2,c.legitimacy-1,c.legitimacy],'#4be07a')}
 function spark(cv,arr,col,fill=true){if(!cv)return;const c=cv.getContext('2d'),w=cv.width,h=cv.height;c.clearRect(0,0,w,h);if(arr.length<2)return;const mn=Math.min(...arr),mx=Math.max(...arr),sp=Math.max(1e-6,mx-mn);const pts=arr.map((v,i)=>[i/(arr.length-1)*(w-8)+4,h-8-(v-mn)/sp*(h-18)]);
  c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=1;for(let i=1;i<4;i++){c.beginPath();c.moveTo(0,i*h/4);c.lineTo(w,i*h/4);c.stroke()}
  if(fill){const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,col+'55');g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.moveTo(pts[0][0],h);pts.forEach(p=>c.lineTo(p[0],p[1]));c.lineTo(pts[pts.length-1][0],h);c.fill()}
  c.strokeStyle=col;c.lineWidth=2;c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.fillStyle=col;for(const p of pts.slice(-1))c.fillRect(p[0]-2.5,p[1]-2.5,5,5)}
 const NEWS_ICON=[[/پیمان|اتحاد/,'🤝','#4a7bd0'],[/تحریم/,'⛔','#c0463c'],[/انرژی|نفت/,'🛢️','#c28a2e'],[/انتخابات/,'🗳️','#5a86c8'],[/بحران|تنش|سقوط/,'⚠️','#c0463c'],[/فناوری|پژوهش|علمی/,'🔬','#6a5fc8'],[/تجارت|اقتصاد|رشد/,'📈','#3e9a62']];
 const ni=t=>NEWS_ICON.find(x=>x[0].test(t))||[0,'🌐','#4b6a8c'];
 function widgets(){
  const W=WORLD,hs=W.history.slice(0,3);$('w-news').innerHTML=hs.map((t,i)=>{const n=ni(t);return'<div class="nrow"><i style="--c:'+n[2]+'">'+n[1]+'</i><p>'+esc(t)+'</p><time>'+(i?F(i)+' ماه پیش':'اکنون')+'</time></div>'}).join('')||'<p class="mu">خبری نیست</p>';
  const gh=W.gdpHist||[],tot=W.countries.reduce((s,c)=>s+c.gdp,0);$('w-ecot').innerHTML='<b>$'+F1(tot/1000)+'T</b> '+arrow(gh.length>1?delta(gh[gh.length-1],gh[gh.length-2]):0);spark($('w-chart'),gh.length>1?gh:[tot*.98,tot],'#f1c75a');
  const m=me(),ac=W.countries.filter(c=>c.alive);const rank=ac.slice().sort((a,b)=>b.army-a.army).findIndex(c=>c.id===1)+1;const bud=m.gdp*.012*(.5+m.army/60);
  $('w-army').innerHTML='<div class="kv"><span>قدرت ارتش</span><b>'+F(m.army)+' <small>/۱۰۰</small></b></div><div class="kv"><span>نیروهای فعال (برآورد)</span><b>'+F1(m.pop*m.army/100*.045)+'M</b></div><div class="kv"><span>بودجه‌ی نظامی (برآورد)</span><b>$'+F1(bud)+'B</b></div><div class="kv"><span>رتبه در جهان</span><b>'+F(rank)+' از '+F(ac.length)+'</b></div>';
  const ev=W.events.slice(0,3);$('w-ev').innerHTML=(ev.length?ev:[{title:'آرامش نسبی',text:'رویداد مهمی ثبت نشده است.'}]).map((e,i)=>'<div class="erow"><i class="'+(/بحران|تنش/.test(e.title)?'red':'amb')+'">'+(/بحران|تنش/.test(e.title)?'⚠':'!')+'</i><div><b>'+esc(e.title)+'</b><small>'+esc(e.text)+'</small></div></div>').join('')}
 // ================= navigation / panels =================
 function navTo(k){el['cc'].classList.remove('navopen');document.querySelectorAll('#cc-nav button').forEach(b=>b.classList.toggle('on',b.dataset.nav===k));
  if(stage!=='play')return toast('اول پایتخت کشورت را روی نقشه انتخاب کن');
  if(k==='dash'){closePanel();return}openPanel(k)}
 function openPanel(k){panel=k;WDA.fx('open');modal=true;setT();el['cc-modal'].classList.add('open');renderPanel()}
 function closePanel(){if(!panel&&!el['cc-modal'].classList.contains('open'))return;panel='';el['cc-modal'].classList.remove('open');modal=false;setT();WDA.fx('close');document.querySelectorAll('#cc-nav button').forEach(b=>b.classList.toggle('on',b.dataset.nav==='dash'))}
 const head=(t,ic)=>'<div class="sh"><h2>'+ic+' '+t+'</h2><button data-do="close">✕</button></div>';
 const kv=(a,b,c)=>'<div class="pk"><span>'+a+'</span><b>'+b+'</b>'+(c!=null?bar(c):'')+'</div>';
 function renderPanel(){const m=me(),W=WORLD,S=el['cc-sheet'],top=S.scrollTop;let h='';
  const own=W.regions.map((r,i)=>[r,i]).filter(x=>x[0].owner===1);
  switch(panel){
  case'set':h=settingsHTML();break;
  case'me':h=head('کشور من','🏳️')+'<div class="pg">'+kv('نام',esc(m.name))+kv('پایتخت',esc(m.capital))+kv('نوع حکومت',esc(m.gov))+kv('تولید ناخالص داخلی','$'+F(m.gdp)+'B')+kv('خزانه','$'+F1(m.treasury)+'B')+kv('مناطق تحت کنترل',F(own.length))+kv('ثبات سیاسی',F(m.stability)+'٪',m.stability)+kv('مشروعیت',F(m.legitimacy)+'٪',m.legitimacy)+'</div><h3>رتبه‌بندی قدرت جهانی</h3>'+W.countries.filter(c=>c.alive).sort((a,b)=>worldPower(b)-worldPower(a)).slice(0,8).map((c,i)=>'<div class="rk '+(c.id===1?'me':'')+'"><b>'+F(i+1)+'</b><span>'+(c.flag||'')+' '+esc(c.name)+'</span><em>'+F(worldPower(c))+'</em></div>').join('');break;
  case'eco':h=head('اقتصاد','🪙')+'<div class="pg">'+kv('تولید ناخالص داخلی','$'+F(m.gdp)+'B')+kv('خزانه','$'+F1(m.treasury)+'B')+kv('صنعت',F(m.industry)+'٪',m.industry)+kv('پژوهش و علم',F(m.science)+'٪',m.science)+kv('نرخ مالیات',F(M.tax)+'٪',M.tax*1.6)+'</div><div class="rowb"><button data-do="tax" data-a="-3">− کاهش مالیات</button><button data-do="tax" data-a="3">+ افزایش مالیات</button></div><p class="mu">مالیات بالاتر یعنی درآمد بیشتر، اما رضایت و رشد کمتر.</p><h3>اقدامات اقتصادی</h3><div class="acts">'+actBtn('invest','🏗️ سرمایه‌گذاری صنعتی','۱۸','صنعت +۷، GDP +۲٫۵٪')+actBtn('research','🔬 بودجه‌ی پژوهش','۲۲','علم +۸، GDP +۱٪')+actBtn('reform','⚖️ اصلاحات حکمرانی','۱۲','مشروعیت +۹، ثبات +۶، مالیات −۱')+'</div><canvas id="p-chart" width="520" height="130"></canvas>';break;
  case'pop':h=head('جمعیت و رفاه','👥')+'<div class="pg">'+kv('جمعیت',F1(m.pop)+' میلیون')+kv('رضایت مردم',F(m.legitimacy)+'٪',m.legitimacy)+kv('ثبات',F(m.stability)+'٪',m.stability)+'</div><h3>مناطق من</h3>'+own.map(([r])=>'<div class="rk"><span>'+esc(r.name)+'</span><em>'+F1(r.population)+'M • توسعه '+F(r.development)+'٪</em></div>').join('');break;
  case'pol':h=head('سیاست داخلی','🏛️')+'<div class="pg">'+kv('نوع حکومت',esc(m.gov))+kv('ثبات',F(m.stability)+'٪',m.stability)+kv('مشروعیت',F(m.legitimacy)+'٪',m.legitimacy)+'</div><div class="acts">'+actBtn('reform','⚖️ اصلاحات حکمرانی','۱۲','مشروعیت +۹، ثبات +۶')+'<button data-do="media"><b>📺 کمپین رسانه‌ای</b><small>هزینه $۱۰B • مشروعیت +۵</small></button></div><p class="mu">وزیر کشور و وزیر بهداشت روی ثبات اثر دارند (بخش وزارتخانه‌ها).</p>';break;
  case'min':h=head('وزارتخانه‌ها و شورای ملی','🏢')+'<p class="mu">هر وزیر در حوزه‌ی خودش اثر ماهانه می‌گذارد. شایستگی بالاتر = اثر بیشتر.</p>'+MINS.map(([k,t,d,ic])=>{const c=M.cab[k],cd=M.cd[k]||[];return'<div class="mn"><div class="mh"><i>'+ic+'</i><div><b>'+t+'</b><small>'+d+'</small></div>'+(c?'<span class="st">'+'★'.repeat(c.comp)+'☆'.repeat(5-c.comp)+'</span>':'')+'</div>'+(c?'<div class="mc"><span>'+esc(c.name)+'</span><button data-do="fire" data-a="'+k+'">برکناری</button></div>':'<div class="cands">'+cd.map((x,i)=>'<button data-do="hire" data-a="'+k+'" data-b="'+i+'"><b>'+esc(x.name)+'</b><small>'+'★'.repeat(x.comp)+'</small></button>').join('')+'</div>')+'</div>'}).join('');break;
  case'army':h=head('ارتش','⚔️')+'<div class="pg">'+kv('قدرت ارتش',F(m.army)+'٪',m.army)+kv('نیروهای فعال (برآورد)',F1(m.pop*m.army/100*.045)+' میلیون')+kv('بودجه‌ی نظامی (برآورد)','$'+F1(m.gdp*.012*(.5+m.army/60))+'B')+'</div><div class="acts"><button data-do="army" data-a="6"><b>⬆️ تقویت ارتش</b><small>هزینه $۲۰B • ارتش +۶، ثبات −۱</small></button><button data-do="army" data-a="-6"><b>⬇️ کاهش هزینه‌های دفاعی</b><small>ارتش −۶، خزانه +$۸B</small></button></div><p class="mu">جنگ تنها راه موفقیت نیست؛ ارتش بزرگ هزینه و فشار روی ثبات دارد.</p>'+warHTML();break;
  case'dip':h=head('دیپلماسی و معاملات','🕊️')+W.countries.filter(c=>c.id!==1&&c.alive).sort((a,b)=>(m.relations[b.id]||50)-(m.relations[a.id]||50)).map(c=>{const r=m.relations[c.id]||50,al=(m.alliances||[]).includes(c.id);return'<div class="dp"><div class="dh"><span>'+(c.flag||'🏳️')+' <b>'+esc(c.name)+'</b>'+(al?' <u>متحد</u>':'')+'</span><em>'+F(r)+'</em></div>'+bar(r,r>70?'linear-gradient(90deg,#c9a13b,#ffe08a)':r<35?'#c0463c':'')+'<div class="s-btns"><button data-do="act" data-a="diplomacy" data-b="'+c.id+'">🕊️ مذاکره</button><button data-do="act" data-a="trade" data-b="'+c.id+'">🤝 تجارت</button><button data-do="act" data-a="sanction" data-b="'+c.id+'">⛔ تحریم</button><button data-do="ally" data-b="'+c.id+'">🛡️ اتحاد</button></div></div>'}).join('');break;
  case'tech':{W.techs=W.techs||{};h=head('فناوری','⚛️')+'<p class="mu">پژوهش: '+F(m.science)+' • خزانه: $'+F1(m.treasury)+'B — هر سطح هزینه و حداقل علم لازم دارد.</p>'+TECHS.map(([k,n,ic,base,ef])=>{const lv=W.techs[k]||0,cost=Math.round(base*(1+lv*.9)),need=15+lv*18;return'<div class="mn"><div class="mh"><i>'+ic+'</i><div><b>'+n+'</b><small>'+ef+'</small></div><span class="st">سطح '+F(lv)+'/۳</span></div>'+(lv>=3?'<p class="mu">به حداکثر رسیده</p>':'<button class="buy" data-do="tech" data-a="'+k+'" '+(m.treasury<cost||m.science<need?'disabled':'')+'>ارتقا • $'+F(cost)+'B • علم ≥ '+F(need)+'</button>')+'</div>'}).join('');break}
  case'infra':h=head('زیرساخت و مناطق','🏭')+own.map(([r,i])=>'<div class="dp"><div class="dh"><b>'+esc(r.name)+'</b><em>منبع: '+esc(r.resources)+'</em></div>'+kv('زیرساخت',F(r.infrastructure)+'٪',r.infrastructure)+kv('توسعه',F(r.development)+'٪',r.development)+'<button class="buy" data-do="build" data-a="'+i+'" '+(m.treasury<10?'disabled':'')+'>🏗️ ساخت‌وساز • $۱۰B</button></div>').join('');break;
  case'news':h=head('اخبار جهان','🌐')+W.history.slice(0,30).map((t,i)=>{const n=ni(t);return'<div class="nrow big"><i style="--c:'+n[2]+'">'+n[1]+'</i><p>'+esc(t)+'</p></div>'}).join('');break;
  case'hist':h=head('تاریخچه','🕰️')+'<div class="pg">'+kv('سال',F(W.year))+kv('ماه‌های سپری‌شده',F(Math.floor(W.turn/10)))+kv('تصمیمات تاریخی',F((W.decided||[]).length))+'</div><h3>تصمیمات تاریخی تو</h3>'+((W.decided||[]).slice().reverse().map(d=>'<div class="rk"><span>'+esc(d[1])+'</span><em>'+esc(d[0])+'</em></div>').join('')||'<p class="mu">هنوز تصمیم تاریخی نگرفته‌ای.</p>')+'<h3>گزارش‌های سالانه</h3>'+W.history.filter(t=>/^گزارش/.test(t)).slice(0,10).map(t=>'<div class="rk"><span>'+esc(t)+'</span></div>').join('');break}
  S.innerHTML=h;S.scrollTop=top;if(panel==='eco')spark($('p-chart'),(m.hist&&m.hist.gdp)||[m.gdp,m.gdp],'#f1c75a')}

 // ================= adaptive quality =================
 function adaptQ(dt,q){if(!SET.autoq||SET.quality<=0||dt<=0||dt>250)return;adaptQ.s=(adaptQ.s||0)+dt;adaptQ.n=(adaptQ.n||0)+1;
  if(adaptQ.n>=90){const avg=adaptQ.s/adaptQ.n;adaptQ.s=adaptQ.n=0;if(avg>(1000/q.fps)*1.7){SET.quality--;saveSet();fit();toast('⚙️ برای روان‌تر شدن بازی، کیفیت روی «'+qp().n+'» تنظیم شد')}}}
 // ================= settings panel =================
 let stab=0,pendLoad='';
 const STABS=['🎨 گرافیک','🔊 صدا','🎮 بازی','💾 ذخیره','ℹ️ درباره'];
 const sgm=(k,t,d,vs,ls)=>'<div class="srow col"><div><b>'+t+'</b><small>'+d+'</small></div><div class="seg">'+vs.map((v,i)=>'<button class="'+(SET[k]===v?'on':'')+'" data-do="sset" data-a="'+k+'" data-b="'+v+'">'+ls[i]+'</button>').join('')+'</div></div>';
 const tgl=(t,d,on,act,key,val)=>'<div class="srow"><div><b>'+t+'</b><small>'+d+'</small></div><button class="tg'+(on?' on':'')+'" data-do="'+act+'" data-a="'+key+'" data-b="'+val+'" aria-label="'+t+'"><i></i></button></div>';
 function settingsHTML(){
  const tabs='<div class="stabs">'+STABS.map((n,i)=>'<button class="'+(stab===i?'on':'')+'" data-do="stab" data-a="'+i+'">'+n+'</button>').join('')+'</div>';let b='';
  if(stab===0){const q=qp();b=sgm('quality','کیفیت گرافیک','وضوح رندر نقشه و جلوه‌های نورانی؛ «اولترا» به گوشی قوی نیاز دارد',[0,1,2,3],QP.map(x=>x.n))+'<div class="sinfo">وضوح رندر ×'+F1(Math.min(q.dpr,devicePixelRatio||1))+' • سقف فریم '+F(q.fps)+' fps</div>'+tgl('تنظیم خودکار کیفیت','اگر بازی روی دستگاهت لگ کند، کیفیت خودکار پایین می‌آید',SET.autoq,'sset','autoq',!SET.autoq)+tgl('جلوه‌های نورانی نقشه','کمان‌های درخشان و موج نور',SET.fx,'sset','fx',!SET.fx)}
  else if(stab===1){b=tgl('🎵 موسیقی','موسیقی پس‌زمینه‌ی بازی',WDA.music,'aud','music',!WDA.music)+tgl('🔊 افکت‌های صوتی','صدای دکمه‌ها و رویدادها',WDA.sfxOn,'aud','sfx',!WDA.sfxOn)}
  else if(stab===2){b=tgl('ذخیره‌ی خودکار','هر ۳ ماه بازی، پس از هر اقدام مهم و هنگام خروج',SET.autosave,'sset','autosave',!SET.autosave)+tgl('اعلان‌های روی صفحه','پیام‌های کوتاه بالای صفحه',SET.toasts,'sset','toasts',!SET.toasts)+sgm('scale','اندازه‌ی رابط','اندازه‌ی متن و دکمه‌ها',[.9,1,1.15,1.3],['کوچک','عادی','بزرگ','خیلی بزرگ'])+sgm('speed','سرعت بازی','سرعت گذر زمان',[1,2,3],['×۱','×۲','×۳'])}
  else if(stab===3){const SL=[['auto','ذخیره‌ی خودکار',0],['manual','ذخیره‌ی سریع',1],['s1','اسلات ۱',1],['s2','اسلات ۲',1],['s3','اسلات ۳',1]];
   b=SL.map(([k,t,w])=>{const i=saveInfo(k);return'<div class="slot"><div><b>'+t+'</b><small>'+(i?esc(fmtSave(i))+(i.regions?' • '+F(i.regions)+' منطقه':''):'خالی')+'</small></div><div class="sb">'+(w?'<button data-do="slot" data-a="save" data-b="'+k+'">💾 ذخیره</button>':'')+'<button '+(pendLoad===k?'class="warnb" ':'')+'data-do="slot" data-a="load" data-b="'+k+'" '+(i?'':'disabled')+'>'+(pendLoad===k?'⚠️ تأیید':'📂 بارگذاری')+'</button>'+(w&&i?'<button data-do="slot" data-a="del" data-b="'+k+'">🗑️</button>':'')+'</div></div>'}).join('')+'<button class="buy" data-do="sexit">🏠 ذخیره و خروج به منوی اصلی</button>'}
  else{let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf('wd.')===0)n+=(localStorage.getItem(k)||'').length}}catch(e){}
   b='<div class="pg">'+kv('نسخه','۱٫۳')+kv('فضای ذخیره‌سازی بازی',F1(n/1024)+' کیلوبایت')+kv('کشور',esc(me().name))+'</div><p class="mu">پیشرفت بازی روی حافظه‌ی همین دستگاه ذخیره می‌شود و با بستن برنامه از بین نمی‌رود. پاک‌کردن اطلاعات برنامه یا حذف آن، ذخیره‌ها را هم پاک می‌کند.</p>'}
  return head('تنظیمات','⚙️')+tabs+'<div class="sbody">'+b+'</div>'}
 // ================= war panel =================
 function warHTML(){
  War.ensure();const W=WORLD,mm=me();let h='<h3>⚔️ جنگ و نبرد</h3><p class="mu">فقط به کشورهای <b>همسایه</b> (دارای مرز مشترک) می‌توانی حمله کنی؛ حمله به متحدان و کشورهای دور ممکن نیست.</p>';
  const rp=W.warReport;if(rp&&W.turn-rp.turn<80)h+='<div class="war-rep '+(rp.win?'win':'lose')+'">'+esc(rp.text)+'</div>';
  const key=x=>(x.w?4:0)+(x.nb?2:0)+(x.c.id===W.selectedCountry?1:0);
  const list=W.countries.filter(c=>c.id!==1&&c.alive).map(c=>({c,nb:War.isNeighbor(1,c.id),w:War.find(c.id),al:(mm.alliances||[]).includes(c.id)})).sort((a,b)=>key(b)-key(a));
  return h+list.map(({c,nb,w,al})=>{const pm=War.power(mm),pe=War.power(c),adv=Math.round(pm/(pm+pe)*100),cd=War.canDeclare(c.id);
   const tags=(w?'<u class="t-war">در جنگ</u>':'')+(nb?'<u class="t-nb">همسایه</u>':'<u class="t-far">دور</u>')+(al?'<u class="t-al">متحد</u>':'')+(W.truces&&W.truces[c.id]>W.turn?'<u class="t-tr">آتش‌بس</u>':'');let btn;
   if(w){const sc=w.score;btn='<div class="wscore"><span>پیشروی جنگ</span>'+bar(50+sc/2,sc>=0?'linear-gradient(90deg,#c9a13b,#58e08b)':'#c0463c')+'</div><div class="s-btns"><button class="atk" data-do="battle" data-b="'+c.id+'">⚔️ حمله ($'+War.COST.battle+'B)</button><button data-do="peace" data-b="'+c.id+'">🕊️ آتش‌بس</button><button data-do="surrender" data-b="'+c.id+'">🏳️ تسلیم</button></div>'}
   else btn=cd.ok?'<button class="atk buy" data-do="declare" data-b="'+c.id+'">⚔️ اعلام جنگ ($'+War.COST.declare+'B)</button>':'<button class="buy" disabled>🚫 '+esc(cd.reason)+'</button>';
   return'<div class="dp wc'+(c.id===W.selectedCountry?' sel':'')+'"><div class="dh"><span>'+(c.flag||'🏳️')+' <b>'+esc(c.name)+'</b> '+tags+'</span><em>ارتش '+F(c.army)+'٪</em></div><div class="adv"><span>برتری تقریبی شما</span><b>'+F(adv)+'٪</b></div>'+bar(adv,adv>=50?'linear-gradient(90deg,#c9a13b,#58e08b)':'#c0463c')+btn+'</div>'}).join('')}
 const actBtn=(a,t,c,d)=>'<button data-do="act" data-a="'+a+'"><b>'+t+'</b><small>هزینه $'+c+'B • '+d+'</small></button>';
 function doIt(k,a,b){const m=me();
  if(k==='close')return closePanel();
  if(k==='act'){if(b)dispatch({t:'world-select',region:Math.max(0,WORLD.regions.findIndex(r=>r.owner==+b))});dispatch({t:'world-action',action:a});WDA.fx('coin')}
  else if(k==='ally'){const id=b?+b:WORLD.selectedCountry,t=cty(id);if(!t||id===1)return;if((m.relations[id]||50)<75||(m.alliances||[]).includes(id))return toast((m.alliances||[]).includes(id)?'از قبل متحد هستید':'برای اتحاد، رابطه باید بالای ۷۵ باشد');if(m.treasury<15)return toast('بودجه کافی نیست');m.treasury-=15;m.alliances.push(id);t.alliances.push(1);WORLD.history.unshift('اتحاد راهبردی با '+t.name+' امضا شد.');toast('🛡️ اتحاد با '+t.name);WDA.fx('confirm')}
  else if(k==='tax'){dispatch({t:'tax',v:M.tax+(+a)});m.legitimacy=clamp(m.legitimacy-(+a>0?1.2:-1.2));m.treasury+=+a*1.4}
  else if(k==='media'){if(m.treasury<10)return toast('بودجه کافی نیست');m.treasury-=10;m.legitimacy=clamp(m.legitimacy+5);toast('📺 کمپین رسانه‌ای اجرا شد')}
  else if(k==='army'){const v=+a;if(v>0){if(m.treasury<20)return toast('بودجه کافی نیست');m.treasury-=20;m.army=clamp(m.army+v);m.stability=clamp(m.stability-1)}else{m.army=clamp(m.army+v);m.treasury+=8}}
  else if(k==='hire'){M.cab[a]=M.cd[a][+b];toast('👔 '+M.cab[a].name+' وزیر شد');WDA.fx('confirm')}
  else if(k==='fire'){M.cab[a]=null}
  else if(k==='tech'){WORLD.techs=WORLD.techs||{};const T=TECHS.find(x=>x[0]===a),lv=WORLD.techs[a]||0,cost=Math.round(T[3]*(1+lv*.9)),need=15+lv*18;if(m.treasury<cost||m.science<need||lv>=3)return;m.treasury-=cost;WORLD.techs[a]=lv+1;m.science=clamp(m.science+3);WORLD.history.unshift('فناوری «'+T[1]+'» به سطح '+F(lv+1)+' رسید.');toast('🔬 '+T[1]+' • سطح '+F(lv+1));WDA.fx('confirm')}
  else if(k==='build'){const r=WORLD.regions[+a];if(!r||m.treasury<10)return;m.treasury-=10;r.infrastructure=clamp(r.infrastructure+8);r.development=clamp(r.development+4);toast('🏗️ ساخت‌وساز در '+r.name);WDA.fx('coin')}
  else if(k==='dec'){applyDecision(+a,+b);return}
  else if(k==='war'){const id=b?+b:WORLD.selectedCountry;if(id&&id!==1)WORLD.selectedCountry=id;navTo('army');return}
  else if(k==='declare'||k==='battle'||k==='peace'||k==='surrender'){War.ensure();const r=War[k](+b);toast(r.msg);WDA.fx(r.ok?'confirm':'click')}
  else if(k==='stab'){stab=+a;renderPanel();return}
  else if(k==='sset'){SET[a]=b==='true'?true:b==='false'?false:+b;saveSet();applySettings();if(a==='quality'){adaptQ.s=adaptQ.n=0;fit()}syncSpeed();renderPanel();return}
  else if(k==='aud'){const v=b==='true';if(a==='music')WDA.setMusic(v);else WDA.setSfx(v);renderPanel();return}
  else if(k==='sexit'){toMenu();return}
  else if(k==='slot'){if(a==='save'){const ok=saveGame(b);toast(ok?'💾 بازی ذخیره شد':'ذخیره ناموفق بود (حافظه‌ی دستگاه پر است؟)');if(ok)WDA.fx('confirm')}
   else if(a==='del'){delSave(b);toast('🗑️ اسلات پاک شد')}
   else if(a==='load'){if(pendLoad!==b){pendLoad=b;toast('برای تأیید دوباره بزن؛ بازی فعلی جایگزین می‌شود');renderPanel();return}pendLoad='';closePanel();loadSlot(b);prev=null;update();return}
   pendLoad='';renderPanel();return}
  hud();update();autoSaveSoon()}
 function act(a){if(stage!=='play')return toast('اول پایتخت کشورت را روی نقشه انتخاب کن');
  if(a==='invest'){dispatch({t:'world-action',action:'invest'});WDA.fx('coin');update()}
  else if(a==='research'){dispatch({t:'world-action',action:'research'});WDA.fx('coin');update()}
  else if(a==='deals')navTo('dip');
  else if(a==='decide')openDecision(true);
  else if(a==='play'){setPause(!paused);syncSpeed();WDA.fx('confirm')}}
 // ================= historic decisions (spec §20) =================
 const DEC=[
  {id:'crisis',title:'بحران اقتصادی کشور',text:'درآمد کشور کاهش یافته و بیکاری بالا می‌رود. دولت باید تصمیم بگیرد.',when:m=>m.treasury<40||m.stability<50,opts:[
   ['کاهش هزینه‌های دولتی','خزانه +$۲۰B • ثبات −۶','پس از یک سال: رشد پایدارتر (GDP +۲٪)',m=>{m.treasury+=20;m.stability-=6},m=>{m.gdp*=1.02}],
   ['سرمایه‌گذاری در صنعت','هزینه $۱۵B • صنعت +۶','پس از یک سال: GDP +۴٪',m=>{m.treasury-=15;m.industry+=6},m=>{m.gdp*=1.04}],
   ['دریافت وام خارجی','خزانه +$۳۵B','پس از یک سال: بدهی −$۱۸B و مشروعیت −۴',m=>{m.treasury+=35},m=>{m.treasury-=18;m.legitimacy-=4}],
   ['اصلاح مالیات','مشروعیت +۳ • خزانه +$۸B','پس از یک سال: رشد اقتصادی کندتر (GDP −۱٪)',m=>{m.legitimacy+=3;m.treasury+=8},m=>{m.gdp*=.99}],
   ['حمایت مالی از مردم','هزینه $۱۸B • ثبات +۸','پس از یک سال: مشروعیت +۵',m=>{m.treasury-=18;m.stability+=8},m=>{m.legitimacy+=5}]]},
  {id:'energy',title:'بحران انرژی جهانی',text:'قیمت انرژی جهش کرده و زنجیره‌های تأمین تحت فشارند.',when:()=>true,opts:[
   ['یارانه‌ی انرژی','هزینه $۱۶B • ثبات +۵','پس از یک سال: فشار بودجه (خزانه −$۶B)',m=>{m.treasury-=16;m.stability+=5},m=>{m.treasury-=6}],
   ['سرمایه‌گذاری در انرژی نو','هزینه $۲۴B • علم +۴','پس از یک سال: GDP +۳٪',m=>{m.treasury-=24;m.science+=4},m=>{m.gdp*=1.03}],
   ['قرارداد بلندمدت با متحدان','هزینه $۸B • روابط +۶','پس از یک سال: ثبات +۴',m=>{m.treasury-=8;for(const k in m.relations)m.relations[k]=clamp(m.relations[k]+3)},m=>{m.stability+=4}],
   ['بی‌عملی و انتظار','بدون هزینه • GDP −۲٪','پس از یک سال: مشروعیت −۴',m=>{m.gdp*=.98},m=>{m.legitimacy-=4}]]},
  {id:'science',title:'جهش علمی',text:'گروهی از دانشمندان پیشنهاد یک برنامه‌ی ملی علمی را داده‌اند.',when:m=>m.science>25,opts:[
   ['برنامه‌ی ملی علم و فناوری','هزینه $۲۸B • علم +۱۰','پس از یک سال: صنعت +۵',m=>{m.treasury-=28;m.science+=10},m=>{m.industry+=5}],
   ['همکاری علمی بین‌المللی','هزینه $۱۲B • علم +۵ • روابط +۴','پس از یک سال: GDP +۱٫۵٪',m=>{m.treasury-=12;m.science+=5;for(const k in m.relations)m.relations[k]=clamp(m.relations[k]+2)},m=>{m.gdp*=1.015}],
   ['تمرکز بر صنعت فعلی','هزینه $۱۰B • صنعت +۴','پس از یک سال: علم −۲',m=>{m.treasury-=10;m.industry+=4},m=>{m.science-=2}]]},
  {id:'summit',title:'اجلاس جهانی صلح و تجارت',text:'قدرت‌های بزرگ در یک اجلاس بی‌سابقه گرد هم می‌آیند.',when:()=>true,opts:[
   ['میزبانی اجلاس','هزینه $۲۰B • مشروعیت +۶','پس از یک سال: روابط جهانی +۵',m=>{m.treasury-=20;m.legitimacy+=6},m=>{for(const k in m.relations)m.relations[k]=clamp(m.relations[k]+5)}],
   ['مشارکت محدود','هزینه $۶B • روابط +۳','پس از یک سال: GDP +۱٪',m=>{m.treasury-=6;for(const k in m.relations)m.relations[k]=clamp(m.relations[k]+3)},m=>{m.gdp*=1.01}],
   ['تحریم اجلاس و تمرکز داخلی','ثبات +۳','پس از یک سال: روابط −۵',m=>{m.stability+=3},m=>{for(const k in m.relations)m.relations[k]=clamp(m.relations[k]-5)}]]}];
 function openDecision(manual){const m=me();if(!m||WORLD.decisionOpen)return;const pool=DEC.filter(d=>d.when(m));const d=pool[Math.floor(R()*pool.length)]||DEC[1];WORLD.decisionOpen=d.id;WDA.fx('alert');modal=true;setT();panel='';
  el['cc-sheet'].innerHTML=head(d.title,'🏛️')+'<p class="dtext">'+d.text+'</p>'+d.opts.map((o,i)=>'<button class="dopt" data-do="dec" data-a="'+DEC.indexOf(d)+'" data-b="'+i+'"><b>'+o[0]+'</b><small>الان: '+o[1]+'</small><small class="lt">بعداً: '+o[2]+'</small></button>').join('')+(manual?'<button class="dopt skip" data-do="close">بعداً تصمیم می‌گیرم</button>':'');
  el['cc-modal'].classList.add('open','decision')}
 function applyDecision(di,oi){const m=me(),d=DEC[di],o=d.opts[oi];if(!o)return;m.treasury=Math.max(0,m.treasury);o[3](m);for(const k of['stability','legitimacy','industry','science','army'])m[k]=clamp(m[k]);m.treasury=Math.max(0,m.treasury);
  (WORLD.pending=WORLD.pending||[]).push({due:WORLD.turn+120,di,oi});(WORLD.decided=WORLD.decided||[]).push([dateStr(),d.title+' ← '+o[0]]);WORLD.history.unshift('تصمیم تاریخی: '+d.title+' — '+o[0]);WORLD.decisionOpen=null;el['cc-modal'].classList.remove('open','decision');modal=false;setT();WDA.fx('confirm');toast('✅ '+o[0]);hud();update()}
 // ================= monthly systems: histories, ministers, tech, living world =================
 function monthly(){const W=WORLD,m=me();if(!W||!m)return;
  prev=Object.assign({},W._last||m);W._last={treasury:m.treasury,gdp:m.gdp,industry:m.industry,science:m.science,pop:m.pop};
  (W.gdpHist=W.gdpHist||[]).push(W.countries.reduce((s,c)=>s+c.gdp,0));if(W.gdpHist.length>30)W.gdpHist.shift();
  for(const c of W.countries){c.hist=c.hist||{leg:[],gdp:[],pop:[]};c.hist.leg.push(c.legitimacy);c.hist.gdp.push(c.gdp);c.hist.pop.push(c.pop);for(const k in c.hist)if(c.hist[k].length>24)c.hist[k].shift()}
  // ministers
  const cb=k=>M.cab&&M.cab[k]?M.cab[k].comp:0;
  m.gdp*=1+cb('eco')*.0007;m.science=clamp(m.science+cb('edu')*.06);m.army=clamp(m.army+(cb('def')?(cb('def')-2.5)*.05:0));m.stability=clamp(m.stability+cb('int')*.12+cb('hlt')*.05);m.legitimacy=clamp(m.legitimacy+cb('hlt')*.08);
  for(const o of W.countries)if(o.id!==1)m.relations[o.id]=clamp((m.relations[o.id]||50)+cb('for')*.12);
  // technology
  const t=W.techs||{};m.gdp*=1+(t.ener||0)*.0006;m.stability=clamp(m.stability+(t.med||0)*.04);m.legitimacy=clamp(m.legitimacy+(t.agri||0)*.04);m.treasury+=m.gdp*.0004*(t.fin||0)*1.5;if(W.turn%60===0)m.industry=clamp(m.industry+(t.ai||0));
  // stability hits to the player from heavy tax already handled by core; clamp
  for(const k of['stability','legitimacy','industry','science','army'])m[k]=clamp(m[k]);m.treasury=Math.max(0,m.treasury);
  // pending long-term consequences
  W.pending=(W.pending||[]).filter(p=>{if(W.turn<p.due)return true;const o=DEC[p.di].opts[p.oi];o[4](m);for(const k of['stability','legitimacy','industry','science'])m[k]=clamp(m[k]);m.treasury=Math.max(0,m.treasury);W.history.unshift('پیامد بلندمدت: '+DEC[p.di].title+' — '+o[0]);W.events.unshift({title:'پیامد تصمیم گذشته',text:o[2].replace('پس از یک سال: ','')});return false});
  liveWorld();
  if(W.turn%60===0&&W.turn>0&&!W.decisionOpen&&R()<.8)openDecision(false);
  WORLD.events=WORLD.events.slice(0,8);if(W.history.length>60)W.history.length=60}
 // living world: AI countries act on their own; conditions create new scenarios (spec §19, §22)
 function liveWorld(){const W=WORLD,ai=W.countries.filter(c=>!c.player&&c.alive);if(ai.length<2||R()>.62)return;const a=pk(ai),b=pk(ai.filter(x=>x!==a)),sorted=ai.slice().sort((x,y)=>y.gdp-x.gdp);let k=R();
  const ev=(t,txt)=>{W.history.unshift(t);if(txt){W.events.unshift({title:txt[0],text:txt[1]});WDA.fx('alert')}};
  if(k<.2){a.gdp*=1.05;a.science=clamp(a.science+3);ev(a.name+' با سرمایه‌گذاری علمی به رشد سریع رسید.')}
  else if(k<.36){a.relations[b.id]=clamp((a.relations[b.id]||50)+14);b.relations[a.id]=a.relations[b.id];if(!a.alliances.includes(b.id)&&a.relations[b.id]>75){a.alliances.push(b.id);b.alliances.push(a.id);ev('اتحاد '+a.name+' و '+b.name+' شکل گرفت.')}else ev(a.name+' و '+b.name+' توافق تجاری امضا کردند.')}
  else if(k<.5){a.relations[b.id]=clamp((a.relations[b.id]||50)-22);b.relations[a.id]=a.relations[b.id];a.alliances=a.alliances.filter(x=>x!==b.id);b.alliances=b.alliances.filter(x=>x!==a.id);ev('تنش دیپلماتیک میان '+a.name+' و '+b.name+' بالا گرفت.',['تنش دیپلماتیک',a.name+' و '+b.name])}
  else if(k<.62){a.gdp*=.95;a.stability=clamp(a.stability-8);ev(a.name+' دچار بحران انرژی شد و اقتصادش افت کرد.',['بحران انرژی در '+a.name,'قیمت‌ها و تجارت جهانی تحت تأثیر قرار گرفتند.'])}
  else if(k<.74&&a.stability<45){a.stability=clamp(a.stability+10);ev('انتخابات زودهنگام در '+a.name+' برگزار شد.')}
  else if(k<.86){const m=me();m.gdp*=1.006;ev('اقتصاد جهانی رشد کرد؛ تجارت '+a.name+' با '+b.name+' رونق یافت.')}
  else if(sorted[0]&&sorted[0]!==a&&a.gdp>sorted[0].gdp*.9){ev(a.name+' در آستانه‌ی تبدیل‌شدن به قدرت اقتصادی نخست جهان است.',['ظهور قدرت اقتصادی',a.name])}
  else{a.industry=clamp(a.industry+3);ev(a.name+' بخش صنعت خود را گسترش داد.')}}
 const pk=a=>a[Math.floor(R()*a.length)];
 function enter(){if(on)return;on=true;if(!el.cc)build();el['cc'].style.display='grid';document.body.classList.add('cc-on');fit();raf=requestAnimationFrame(drawMap);Intro.stop();if(WDA.ready)WDA.game();update()}
 function leave(){on=false;cancelAnimationFrame(raf);if(el.cc)el['cc'].style.display='none';document.body.classList.remove('cc-on')}
 return{enter,leave,update,monthly,clock(){if(!on)return;$('cc-clock').textContent=clockStr()},get on(){return on},closePanel,fit,openDecision}
})();
