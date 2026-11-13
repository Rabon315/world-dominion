/* Premium command dashboard: presentation layer only; all decisions still use the simulation core. */
(function(){
 const $=id=>document.getElementById(id);
 const fmt=n=>Number.isFinite(+n)?new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(+n):'—';
 const set=(id,v)=>{const e=$(id);if(e)e.textContent=v};
 const tabMap={home:'overview',country:'overview',eco:'eco',pop:'pop',politics:'pol',cab:'cab',mil:'budget',dip:'dip',tech:'tech',infra:'prov',log:'log',history:'log',settings:'settings'};
 document.querySelectorAll('.wd-nav').forEach(b=>b.addEventListener('click',()=>{
   document.querySelectorAll('.wd-nav').forEach(x=>x.classList.toggle('active',x===b));
   const t=b.dataset.tab;
   if(t==='settings'){settingsMenu();return}
   if(t==='home'){mgTab='overview';mgRender();return}
   mgTab=tabMap[t]||'overview';mgRender();
 }));
 $('wd-pause')?.addEventListener('click',()=>{if(typeof setPause==='function'&&run)setPause(!paused);$('wd-pause').textContent=paused?'▶':'Ⅱ'});
 $('wd-speed')?.addEventListener('click',()=>{if($('sp'))$('sp').click();$('wd-speed').textContent='×'+fmt(spd)});
 let audioCtx=null,master=null,audioOn=false,osc=[];
 function audioStart(){
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
   if(!audioCtx){audioCtx=new AC();master=audioCtx.createGain();master.gain.value=.025;master.connect(audioCtx.destination);
     [55,82.41,110].forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=i===0?'sine':'triangle';o.frequency.value=f;g.gain.value=[.34,.13,.07][i];o.connect(g);g.connect(master);o.start();osc.push(o)});
   }
   audioCtx.resume();audioOn=true;$('wd-audio').classList.add('on');$('wd-audio').textContent='♫';
 }
 function audioStop(){if(audioCtx){audioCtx.suspend();audioOn=false;$('wd-audio').classList.remove('on');$('wd-audio').textContent='♪'}}
 $('wd-audio')?.addEventListener('click',()=>audioOn?audioStop():audioStart());
 // Browser audio must start after a user gesture. The first campaign action enables a quiet original ambient tone.
 $('mN')?.addEventListener('click',()=>{if(!audioOn)audioStart()},{once:true});
 document.addEventListener('click',e=>{if(!audioOn||!audioCtx||!master)return;if(e.target.closest('button')){
   const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(640,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(920,audioCtx.currentTime+.055);g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.035,audioCtx.currentTime+.008);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.09);o.connect(g);g.connect(master);o.start();o.stop(audioCtx.currentTime+.1);
 }});
 window.renderCommandDashboard=function(){
   if(typeof stage==='undefined'||stage!=='play'||!WORLD)return;
   const me=worldCountry(1);if(!me)return;
   set('wd-flag',me.flag||M?.identity?.flag||'🏳️');set('wd-country-name',me.name||'کشور من');set('wd-capital','پایتخت: '+(me.capital||M?.identity?.capital||'—'));
   set('wd-pop',fmt(me.pop)+' میلیون');set('wd-gdp','$'+fmt(me.gdp)+'B');set('wd-cash','$'+fmt(me.treasury)+'B');set('wd-stability',fmt(me.stability)+'٪');
   set('wd-satisfaction',fmt(me.legitimacy)+'٪');const sb=$('wd-satisfaction-bar');if(sb)sb.style.width=Math.max(0,Math.min(100,me.legitimacy))+'%';
   set('wd-power',fmt(worldPower(me))+' امتیاز');set('wd-army',fmt(me.army)+'M');set('wd-defense','$'+fmt(M?.budget?.defense||20)+'B');
   const total=WORLD.countries.filter(c=>c.alive).reduce((a,c)=>a+c.gdp,0);set('wd-world-gdp','$'+fmt(total)+'B');set('wd-world-growth','اقتصاد '+fmt(WORLD.countries.length)+' کشور');
   set('wd-date','سال '+fmt(WORLD.year)+' / ماه '+fmt(WORLD.month));set('wd-time',String(Math.floor((WORLD.turn%600)/10)).padStart(2,'0')+':'+String((WORLD.turn%10)*6).padStart(2,'0'));
   const news=(WORLD.history||[]).slice(0,3);const newsEl=$('wd-world-news');if(newsEl)newsEl.innerHTML=news.length?news.map(x=>'<div class="wd-news-item">'+String(x).replace(/[<>]/g,'')+'</div>').join(''):'<p>در انتظار گزارش‌های جهان...</p>';
   const ev=(WORLD.events||[]).slice(0,2);const evEl=$('wd-events');if(evEl)evEl.innerHTML=ev.length?ev.map(x=>'<p><b style="color:#efc66b">'+String(x.title).replace(/[<>]/g,'')+'</b><br>'+String(x.text).replace(/[<>]/g,'')+'</p>').join(''):'<p>هنوز رویداد مهمی ثبت نشده است.</p>';
   $('wd-pause').textContent=(typeof paused!=='undefined'&&paused)?'▶':'Ⅱ';$('wd-speed').textContent='×'+fmt(typeof spd!=='undefined'?spd:1);
 };
})();
