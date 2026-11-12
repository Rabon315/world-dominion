// UI layer: DOM, input, rendering, game clock. Talks to the simulation only through dispatch() and HK hooks.
let atkHtml='',tool='a',spd=1,timer=null,lab=[],view={x:0,y:0,k:1},mgTab='eco',LY=0,tt;
const cv=$('c'),cx=cv.getContext('2d'),off=document.createElement('canvas'),ox=off.getContext('2d');let img;function allocMap(){off.width=W;off.height=H;img=ox.createImageData(W,H)}allocMap();
const bar=v=>'<div class="bar"><i style="width:'+cl(v)+'%"></i></div>';
function begin(){
 newGame({rivals:+$('nb').value,win:+$('win').value,name:$('nm').value,rg:+$('prg').value,gov:$('gov').value,aspect:innerWidth/innerHeight});
 atkHtml='';allocMap();$('start').style.display='none';$('menu').style.display='none';fit();dirty=1;toast('روی خشکی کلیک کن تا کشورت را بسازی')}
let modal=false,paused=false,sysO=false,sysKind='';
function frameTick(){tick();if(run&&SET.autosave&&tk%600===0)saveGame('auto')}
const setT=()=>{clearInterval(timer);timer=null;if(run&&!modal&&!paused&&!sysO)timer=setInterval(frameTick,100/spd)};
function setPause(v){paused=v;$('pz').textContent=v?'▶':'⏸';$('pz').classList.toggle('on',v);setT()}
HK.end=function(w){delSave('auto');modal=false;clearInterval(timer);$('mg').style.display='none';$('eb').innerHTML='<h1 class="logo">'+(w?'VICTORY':'DEFEAT')+'</h1><h3>'+(w?'👑 جهان را فتح کردی!':'💀 کشورت سقوط کرد')+'</h3><p class="mu">زمین: '+F(cnt[1]/tot*100)+'٪ • شهرها: '+F(city[1])+' • مدت: '+F(tk/10)+' ثانیه</p><button class="g" style="width:100%;padding:10px" onclick="location.reload()">بازی دوباره</button>';$('end').style.display='flex'}
function labels(){const sx=new Array(N+1).fill(0),sy=new Array(N+1).fill(0);for(let i=0;i<W*H;i++){const o=owner[i];if(o){sx[o]+=i%W;sy[o]+=i/W|0}}lab=[];for(let p=1;p<=N;p++)if(alive[p]&&cnt[p]>18)lab.push([nm[p],sx[p]/cnt[p],sy[p]/cnt[p],cnt[p]])}
function drawHud(){if(stage!=='play')return;$('s1').textContent=F(T[1]);$('s2').textContent=F(G[1]);$('s3').textContent=F(cnt[1]/tot*100)+'٪';$('s4').textContent=F(city[1]);$('s5').textContent=gameDate();$('s6').textContent=F(M.eff)+'٪';$('fl').textContent=F(fl);$('cc').textContent=F(cityCost(1));
 const o=[];for(let p=1;p<=N;p++)if(alive[p])o.push(p);o.sort((a,b)=>cnt[b]-cnt[a]);const top=o.slice(0,6);if(alive[1]&&!top.includes(1))top.push(1);
 $('lb').innerHTML='<b style="color:var(--g)">🏆 رتبه‌بندی</b>'+top.map(p=>'<div style="'+(p===1?'color:var(--g);font-weight:800':'')+'"><span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:rgb('+CL[p].map(Math.round)+')"></i> '+esc(nm[p])+'</span><span>'+F(cnt[p]/tot*100)+'٪</span></div>').join('');
 const ah=A.filter(a=>a.p===1).map(a=>'<div class="glass">⚔️ '+(a.t?esc(nm[a.t]):'زمین خالی')+' • '+F(a.tr)+' <button onclick="dispatch({t:\'cancel\',id:'+a.id+'})">لغو</button></div>').join('');if(ah!==atkHtml){atkHtml=ah;$('atks').innerHTML=ah}}
HK.show=function(s){if(!SET.toasts)return;const e=$('toast');e.textContent=s;e.style.display='block';clearTimeout(tt);tt=setTimeout(()=>e.style.display='none',2200)};
HK.hud=drawHud;HK.labels=labels;HK.clock=setT;
function tap(sx,sy){const x=Math.floor((sx-view.x)/view.k),y=Math.floor((sy-view.y)/view.k);if(x<0||y<0||x>=W||y>=H)return;const i=y*W+x;
 if(stage==='spawn'){if(!TR[i]||TR[i]===3)return toast('یک خشکی هموار انتخاب کن');return dispatch({t:'spawn',i})}
 if(!run||!alive[1])return;
 if(tool==='a'){const r=dispatch({t:'attack',i,r:$('ar').value/100});if(r===null)return;if(r===0)toast('سرباز کافی نداری');else if(r===-1)toast('مرز مشترک نداری و دور هم هستی!');else if(r===2)toast('🚢 نیروی دریایی پیاده شد')}
 else if(tool==='c'){if(!dispatch({t:'build',i,k:1}))toast('طلا کافی نیست یا جای نامناسب')}
 else if(tool==='f'){if(!dispatch({t:'build',i,k:2}))toast('طلا کافی نیست یا جای نامناسب')}
 else if(tool==='n'){if(!dispatch({t:'nuke',i}))return toast('طلا کافی نیست');toast('☢️ بمب اتمی!')}else if(tool==='j')dispatch({t:'air',i});else if(tool==='m')dispatch({t:'missile',i})
 hud();dirty=1}
function fit(){const w=innerWidth,h=innerHeight;view.k=Math.min(w/W,h/H)*.97;view.x=(w-W*view.k)/2;view.y=(h-H*view.k)/2}
function zoom(mx,my,f){const nk=Math.max(Math.min(innerWidth/W,innerHeight/H)*.7,Math.min(40,view.k*f)),r=nk/view.k;view.x=mx-(mx-view.x)*r;view.y=my-(my-view.y)*r;view.k=nk}
const P=new Map();let acc=0,pd=0;const dist=()=>{const a=[...P.values()];return Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])};
cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);acc=0;if(P.size===2)pd=dist()};
cv.onpointermove=e=>{const o=P.get(e.pointerId);if(!o)return;const dx=e.clientX-o[0],dy=e.clientY-o[1];P.set(e.pointerId,[e.clientX,e.clientY]);acc+=Math.abs(dx)+Math.abs(dy);
 if(P.size===2){const nd=dist();zoom(innerWidth/2,innerHeight/2,nd/pd);pd=nd;acc=99}else if(acc>8){view.x+=dx;view.y+=dy}dirty=1};
cv.onpointerup=e=>{const was=P.size===1&&acc<8;P.delete(e.pointerId);if(was)tap(e.clientX,e.clientY)};cv.onpointercancel=e=>P.delete(e.pointerId);
cv.onwheel=e=>{e.preventDefault();zoom(e.clientX,e.clientY,e.deltaY<0?1.15:.87);dirty=1};
document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tool=b.dataset.t;document.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x===b))});
$('ar').oninput=e=>$('v1').textContent=F(e.target.value)+'٪';$('wk').oninput=e=>{$('v2').textContent=F(e.target.value)+'٪';dispatch({t:'wk',v:e.target.value})};
$('sp').onclick=()=>{spd=spd===1?2:spd===2?3:1;$('sp').textContent='⏩ ×'+F(spd);setT()};
$('pz').onclick=()=>{if(run)setPause(!paused)};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&run&&stage==='play'&&SET.autosave)saveGame('auto');if(document.hidden&&run&&!paused)setPause(true)});
function paint(){const d=img.data;for(let i=0;i<W*H;i++){const t=TR[i],o=owner[i];let c=BASE[t];if(!t&&(i*7)%5===0)c=[13,30,64];if(o){const q=LY===1?RC[rg[o]]:CL[o];c=[c[0]*.38+q[0]*.62,c[1]*.38+q[1]*.62,c[2]*.38+q[2]*.62];const x=i%W;if((x>0&&owner[i-1]!==o&&TR[i-1])||(x<W-1&&owner[i+1]!==o&&TR[i+1])||(i>=W&&owner[i-W]!==o&&TR[i-W])||(i<W*(H-1)&&owner[i+W]!==o&&TR[i+W]))c=[Math.min(255,c[0]*1.5),Math.min(255,c[1]*1.5),Math.min(255,c[2]*1.5)]}
 d[i*4]=c[0];d[i*4+1]=c[1];d[i*4+2]=c[2];d[i*4+3]=255}ox.putImageData(img,0,0)}
function frame(){requestAnimationFrame(frame);const dpr=devicePixelRatio||1;if(cv.width!==Math.round(innerWidth*dpr)){cv.width=Math.round(innerWidth*dpr);cv.height=Math.round(innerHeight*dpr);dirty=1}
 if(!TR||!dirty)return;dirty=0;if(owner)paint();cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#050814';cx.fillRect(0,0,cv.width,cv.height);cx.setTransform(view.k*dpr,0,0,view.k*dpr,view.x*dpr,view.y*dpr);cx.imageSmoothingEnabled=false;cx.drawImage(off,0,0);
 if(stage==='play'){for(let i=0;i<W*H;i++){const b=bld[i];if(!b)continue;const x=i%W,y=i/W|0;if(b===1){cx.fillStyle='#ffd34d';cx.fillRect(x-.2,y-.2,1.4,1.4);cx.fillStyle='#3a2a00';cx.fillRect(x+.2,y+.2,.6,.6)}else{cx.fillStyle='#fff';cx.fillRect(x-.1,y-.1,1.2,1.2);cx.fillStyle='#4a5a90';cx.fillRect(x+.25,y+.25,.5,.5)}}
  cx.textAlign='center';cx.textBaseline='middle';cx.lineJoin='round';for(const l of SET.labels?lab:[]){const s=Math.max(2.4,Math.min(8,Math.sqrt(l[3])*.5));cx.font='800 '+s+'px Vazirmatn,Tahoma,sans-serif';cx.lineWidth=s*.18;cx.strokeStyle='rgba(5,8,20,.85)';cx.strokeText(l[0],l[1],l[2]);cx.fillStyle='#fff';cx.fillText(l[0],l[1],l[2])}if(LY===2){cx.strokeStyle='rgba(224,185,74,.55)';cx.lineWidth=.3;cx.beginPath();for(let a=1;a<3;a++){cx.moveTo(a*W/3,0);cx.lineTo(a*W/3,H);cx.moveTo(0,a*H/3);cx.lineTo(W,a*H/3)}cx.stroke();cx.fillStyle='rgba(255,255,255,.75)';cx.font='800 4px Vazirmatn,Tahoma,sans-serif';PVN.forEach((n,i)=>cx.fillText(n,(i%3+.5)*W/3,(Math.floor(i/3)+.12)*H/3))}}}
RL.forEach((r,i)=>$('prg').add(new Option(r,i)));$('prg').value=3;
$('bs').onclick=()=>dispatch({t:'ship'});$('mgb2').onclick=()=>{if(stage==='play')mgRender()};$('ly').onclick=()=>{LY=(LY+1)%3;toast(['🗺️ لایه: سیاسی','⛪ لایه: دین','🏛️ لایه: استان‌ها'][LY]);dirty=1};
addEventListener('resize',()=>{if(TR)fit();dirty=1});frame();

// ================= menus, save/load, settings, Android back button =================
function applySettings(){document.documentElement.style.setProperty('--ui',SET.scale);spd=SET.speed;$('sp').textContent='⏩ ×'+F(spd);dirty=1}
function sysOpen(h,kind){$('sysb').innerHTML=h;$('sys').style.display='flex';sysO=true;sysKind=kind;setT()}
function sysClose(){$('sys').style.display='none';sysO=false;sysKind='';setT()}
function fmtSave(i){return i?(i.title+' • سال '+F(i.year)+' • '+new Date(i.at).toLocaleString('fa-IR')):'—'}
function refreshMenu(){const sl=latestSlot(),i=sl&&saveInfo(sl);$('mC').style.display=sl?'block':'none';$('mi').textContent=i?'آخرین ذخیره: '+fmtSave(i):'';
 $('mX').style.display=capApp()?'block':'none'}
function showMenu(){$('start').style.display='none';$('menu').style.display='flex';refreshMenu()}
function capApp(){try{return window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App||null}catch(e){return null}}
function pauseMenu(){if(stage!=='play'||!run)return;saveGame('auto');
 sysOpen('<h3>⏸ توقف</h3><button class="opt g" onclick="sysClose()">▶ ادامه</button><button class="opt" onclick="doSave()">💾 ذخیره‌ی بازی</button><button class="opt" onclick="loadMenu()">📂 بارگذاری</button><button class="opt" onclick="settingsMenu()">⚙️ تنظیمات</button><button class="opt" onclick="toMenu()">🏠 منوی اصلی</button>','pause')}
function doSave(){toast(saveGame('manual')?'💾 بازی ذخیره شد':'ذخیره ناموفق بود (حافظه‌ی دستگاه پر است؟)')}
function loadMenu(){const m=saveInfo('manual'),a=saveInfo('auto');
 sysOpen('<h3>📂 بارگذاری</h3><button class="opt" '+(m?'':'disabled style="opacity:.45"')+' onclick="loadSlot(\'manual\')">ذخیره‌ی دستی<br><small class="mu">'+esc(fmtSave(m))+'</small></button><button class="opt" '+(a?'':'disabled style="opacity:.45"')+' onclick="loadSlot(\'auto\')">ذخیره‌ی خودکار<br><small class="mu">'+esc(fmtSave(a))+'</small></button><button class="opt" onclick="backFromSub()">↩ بازگشت</button>','load')}
function loadSlot(slot){
 if(!loadGame(slot)){sysClose();if(stage==='play')pauseMenu();return toast('فایل ذخیره خراب یا ناسازگار است؛ بازی فعلی دست‌نخورده ماند')}
 atkHtml='';allocMap();for(const id of ['menu','start','end','mg','sys'])$(id).style.display='none';sysO=false;modal=false;paused=false;$('pz').textContent='⏸';$('pz').classList.remove('on');
 fit();labels();hud();applySettings();setT();toast('📂 بازی بارگذاری شد')}
function toMenu(){saveGame('auto');location.reload()}
function settingsMenu(){
 const tg=(k,t)=>'<div class="row"><span>'+t+'</span><button class="'+(SET[k]?'on':'')+'" onclick="setOpt(\''+k+'\','+!SET[k]+')">'+(SET[k]?'روشن':'خاموش')+'</button></div>';
 const ch=(k,t,vs,ls)=>'<div class="row"><span>'+t+'</span></div><div class="row">'+vs.map((v,i)=>'<button class="'+(SET[k]===v?'on':'')+'" onclick="setOpt(\''+k+'\','+v+')">'+ls[i]+'</button>').join('')+'</div>';
 sysOpen('<h3>⚙️ تنظیمات</h3>'+tg('autosave','ذخیره‌ی خودکار (هر سال بازی و هنگام خروج از برنامه)')+tg('toasts','اعلان‌های روی صفحه (تاریخچه در «اخبار» می‌ماند)')+tg('labels','نام کشورها روی نقشه')+ch('scale','اندازه‌ی رابط',[.9,1,1.15,1.3],['کوچک','عادی','بزرگ','خیلی بزرگ'])+ch('speed','سرعت پیش‌فرض بازی',[1,2,3],['×۱','×۲','×۳'])+'<button class="opt g" onclick="backFromSub()">↩ بازگشت</button>','settings')}
function setOpt(k,v){SET[k]=v;saveSet();applySettings();settingsMenu()}
function backFromSub(){if(stage==='play'&&run)pauseMenu();else sysClose()}
$('mn').onclick=pauseMenu;
$('bt').onclick=()=>{const b=$('bot');b.style.display=b.style.display==='none'?'flex':'none'};
$('mC').onclick=()=>{const sl=latestSlot();if(!sl)return;if(!loadGame(sl))return toast('فایل ذخیره خراب است');for(const id of ['menu','start','end','mg','sys'])$(id).style.display='none';atkHtml='';allocMap();fit();labels();hud();applySettings();setT()};
$('mN').onclick=()=>{$('menu').style.display='none';$('start').style.display='flex'};
$('mS').onclick=settingsMenu;
$('mX').onclick=()=>{const a=capApp();if(a)a.exitApp()};
(function(){const a=capApp();if(!a||!a.addListener)return;try{a.addListener('backButton',()=>{
 if(sysO){if(sysKind==='pause')sysClose();else backFromSub()}
 else if($('mg').style.display==='flex')closeM();
 else if($('end').style.display==='flex'){}
 else if($('start').style.display==='flex')showMenu();
 else if(stage==='play'&&run)pauseMenu();
 else if(stage==='menu')a.exitApp()})}catch(e){}})();
loadSet();applySettings();refreshMenu();
