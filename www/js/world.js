/* WORLD DOMINION — sovereign simulation core (replacement gameplay layer).
   The strategic map is built from sovereign regions, not conquerable pixel cells. */
const REGION_SEEDS=[
 ['آمریکای شمالی',.17,.28],['آمریکای مرکزی',.22,.48],['آمریکای جنوبی',.29,.68],['گرینلند',.30,.14],
 ['اروپای شمالی',.49,.20],['اروپای غربی',.46,.30],['اروپای شرقی',.55,.29],['مدیترانه',.50,.39],
 ['شمال آفریقا',.48,.48],['غرب آفریقا',.44,.58],['شرق آفریقا',.53,.61],['جنوب آفریقا',.50,.75],
 ['خاورمیانه',.60,.42],['قفقاز',.59,.33],['آسیای مرکزی',.66,.31],['جنوب آسیا',.68,.48],
 ['شرق آسیا',.79,.32],['جنوب شرق آسیا',.79,.52],['سیبری',.77,.18],['ژاپن و کره',.87,.36],
 ['استرالیا',.85,.75],['اقیانوسیه',.94,.66],['آند',.27,.58],['کارائیب',.28,.43],
 ['آناتولی',.57,.39],['شبه‌جزیره عربستان',.62,.50],['هند و گنگ',.70,.51],['چین مرکزی',.78,.40],
 ['اسکاندیناوی',.52,.13],['بالکان',.53,.35],['آمازون',.32,.64],['جنوب چین',.80,.47]
];
const WORLD_PALETTE=['#c5a35a','#4c8f9c','#9a6c89','#71966e','#9b825c','#6e7fb0','#ad795b','#638d86','#a28dba','#87965a','#bd9a68','#6683a1'];
function initWorld(cfg){
 const countries=[{id:1,name:cfg.name||'کشور من',flag:cfg.identity?.flag||'🏳️',color:cfg.identity?.color||'#d8ae49',capital:cfg.identity?.capital||'پایتخت',gov:cfg.gov||'جمهوری',gdp:412,pop:89,stability:65,legitimacy:58,industry:42,science:35,army:38,treasury:42,relations:{},alliances:[],sanctions:[],trade:[],alive:true,player:true}];
 const pool=[...NAMES].filter(n=>n!==countries[0].name).sort(()=>R()-.5);for(let i=2;i<=Math.min(cfg.rivals+1,21);i++){countries.push({id:i,name:pool[i-2]||('کشور '+i),flag:'🏳️',color:WORLD_PALETTE[(i-2)%WORLD_PALETTE.length],capital:'پایتخت ملی',gov:['جمهوری','فدرال','پادشاهی'][i%3],gdp:180+R()*900,pop:8+R()*260,stability:42+R()*45,legitimacy:40+R()*45,industry:20+R()*65,science:15+R()*60,army:15+R()*75,treasury:20+R()*120,relations:{},alliances:[],sanctions:[],trade:[],alive:true,player:false})}
 const regions=REGION_SEEDS.map((r,i)=>({id:i,name:r[0],x:r[1],y:r[2],owner:0,development:25+Math.round(R()*55),population:2+R()*55,resources:['انرژی','غلات','فلزات','فناوری','آب'][i%5],infrastructure:20+Math.round(R()*45),stability:50+Math.round(R()*40)}));
 WORLD={year:2026,month:1,turn:0,selected:0,selectedCountry:2,countries,regions,events:[],policies:[],score:0,mode:'sovereign',history:['نظم جهانی جدید در سال ۲۰۲۶ آغاز شد.']};
 for(let i=0;i<countries.length;i++)for(let j=0;j<countries.length;j++)if(i!==j) countries[i].relations[j+1]=45+Math.round(R()*25);
}
function startWorld(regionIndex){if(!WORLD)return;const r=WORLD.regions[regionIndex];if(!r)return;WORLD.regions.forEach((x,i)=>x.owner=0);r.owner=1;r.development=Math.max(65,r.development);r.infrastructure=Math.max(55,r.infrastructure);let order=WORLD.regions.map((x,i)=>i).filter(i=>i!==regionIndex).sort(()=>R()-.5),idx=0;for(let c=2;c<=WORLD.countries.length;c++){const count=c<=5?2:1;for(let k=0;k<count&&idx<order.length;k++)WORLD.regions[order[idx++]].owner=c}WORLD.selected=regionIndex;stage='play';run=true;WORLD.history.unshift('پایتخت '+WORLD.countries[0].capital+' در منطقه '+r.name+' تأسیس شد.');HK.clock();toast('کشور تأسیس شد؛ حالا سیاست‌گذاری و اداره جهان را آغاز کن');hud();dirty=1}
function worldCountry(id){return WORLD?.countries.find(c=>c.id===id)}
function worldTick(){if(!WORLD)return;WORLD.turn++;if(WORLD.turn%10!==0){dirty=1;return}WORLD.month++;if(WORLD.month>12){WORLD.month=1;WORLD.year++}
 for(const c of WORLD.countries){if(!c.alive)continue;const owned=WORLD.regions.filter(r=>r.owner===c.id);const dev=owned.length?owned.reduce((s,r)=>s+r.development,0)/owned.length:0;const infra=owned.length?owned.reduce((s,r)=>s+r.infrastructure,0)/owned.length:0;
 c.gdp=Math.max(10,c.gdp*(1+(c.industry*.0007)+(c.science*.00025)-.012));c.treasury+=c.gdp*(.012+(c.player?M.tax/1000:.025));c.stability=cl(c.stability+(c.legitimacy-c.stability)*.025+(infra-40)*.003- Math.max(0,c.army-55)*.002);c.pop=Math.max(1,c.pop*(1.0007+dev*.000002));
 if(!c.player&&WORLD.turn%3===0){if(c.treasury>45&&R()<.48){c.industry=cl(c.industry+1,0,100);c.science=cl(c.science+(R()<.35?1:0),0,100);c.stability=cl(c.stability+1,0,100)}const others=WORLD.countries.filter(o=>o.id!==c.id&&o.alive);const target=others.sort((a,b)=>(c.relations[b.id]||50)-(c.relations[a.id]||50))[0];if(target&&R()<.08){c.relations[target.id]=cl((c.relations[target.id]||50)+4,0,100);if(c.relations[target.id]>78&&!c.alliances.includes(target.id)){c.alliances.push(target.id);target.alliances.push(c.id);WORLD.history.unshift(c.name+' و '+target.name+' پیمان همکاری امضا کردند.')}}}
 }
 if(WORLD.turn%12===0){const p=worldCountry(1);const stability=p.stability;if(stability<22){WORLD.events.unshift({title:'بحران مشروعیت',text:'نارضایتی عمومی دولت را در آستانه بحران قرار داده است.'});p.legitimacy=cl(p.legitimacy+3,0,100)}else if(R()<.22){WORLD.events.unshift({title:'فرصت سرمایه‌گذاری',text:'یک موج سرمایه‌گذاری می‌تواند اقتصاد را تقویت کند.'});p.gdp*=1.025}WORLD.events=WORLD.events.slice(0,8);WORLD.history.unshift('گزارش سال '+WORLD.year+': تولید ناخالص داخلی '+p.gdp.toFixed(1)+' میلیارد دلار.');WORLD.history=WORLD.history.slice(0,40)}
 M.gdp=worldCountry(1).gdp*1e9;M.pop=worldCountry(1).pop*1e6;M.hp=worldCountry(1).stability;M.rep=worldCountry(1).legitimacy;M.eff=Math.round((M.hp+M.rep)/2);G[1]=worldCountry(1).treasury;T[1]=worldCountry(1).army;HK.labels();hud();dirty=1;
}
function worldAction(action){const me=worldCountry(1),target=worldCountry(WORLD.selectedCountry);if(!me)return false;const cost={invest:18,research:22,reform:12,trade:8,diplomacy:5,sanction:10}[action]||0;if(me.treasury<cost){toast('بودجه کافی نیست');return false}me.treasury-=cost;
 if(action==='invest'){me.industry=cl(me.industry+7,0,100);me.gdp*=1.025;WORLD.regions.filter(r=>r.owner===1).forEach(r=>{r.infrastructure=cl(r.infrastructure+5,0,100);r.development=cl(r.development+3,0,100)});WORLD.history.unshift('طرح ملی توسعه زیرساخت و صنعت اجرا شد.');toast('سرمایه‌گذاری ملی انجام شد')}
 if(action==='research'){me.science=cl(me.science+8,0,100);me.gdp*=1.01;WORLD.history.unshift('بودجه پژوهش افزایش یافت؛ ظرفیت فناوری رشد کرد.');toast('سرمایه‌گذاری علمی انجام شد')}
 if(action==='reform'){me.legitimacy=cl(me.legitimacy+9,0,100);me.stability=cl(me.stability+6,0,100);M.tax=cl(M.tax-1,0,60);WORLD.history.unshift('بسته اصلاحات حکمرانی و خدمات عمومی تصویب شد.');toast('اصلاحات حکمرانی اجرا شد')}
 if(action==='trade'&&target&&target.id!==1){me.gdp*=1.025;target.gdp*=1.012;me.relations[target.id]=cl((me.relations[target.id]||50)+8,0,100);WORLD.history.unshift('توافق تجاری با '+target.name+' امضا شد.');toast('توافق تجاری امضا شد')}
 if(action==='diplomacy'&&target&&target.id!==1){me.relations[target.id]=cl((me.relations[target.id]||50)+15,0,100);WORLD.history.unshift('رایزنی دیپلماتیک با '+target.name+' انجام شد.');toast('روابط دیپلماتیک بهبود یافت')}
 if(action==='sanction'&&target&&target.id!==1){target.gdp*=.94;me.relations[target.id]=cl((me.relations[target.id]||50)-18,0,100);WORLD.history.unshift('تحریم اقتصادی علیه '+target.name+' اعمال شد.');toast('تحریم اقتصادی اعمال شد')}
 dirty=1;hud();return true}
function worldPower(c){return c.gdp*.45+c.science*2+c.stability*1.2+c.industry*1.4+c.alliances.length*12}
function drawWorldMap(ctx){if(!WORLD)return;const w=W,h=H;ctx.fillStyle='#071426';ctx.fillRect(0,0,w,h);ctx.save();ctx.globalAlpha=.22;ctx.strokeStyle='#47718d';ctx.lineWidth=.18;for(let x=0;x<w;x+=10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=10){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.restore();
 // Soft continent silhouettes as geographic context; sovereign regions are the actual selectable game objects.
 const blobs=[[.17,.28,13,10],[.27,.62,8,15],[.49,.30,8,7],[.48,.55,8,14],[.72,.31,20,12],[.85,.75,8,6]];ctx.fillStyle='#193b45';for(const [x,y,rx,ry] of blobs){ctx.beginPath();ctx.ellipse(x*w,y*h,rx,ry,-.2,0,Math.PI*2);ctx.fill()}
 WORLD.regions.forEach(r=>{const c=worldCountry(r.owner),x=r.x*w,y=r.y*h;ctx.beginPath();ctx.arc(x,y,Math.max(1.5,Math.sqrt(r.population)*.34),0,Math.PI*2);ctx.fillStyle=c?c.color:'#496174';ctx.globalAlpha=.88;ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=r.id===WORLD.selected?1.1:.35;ctx.strokeStyle=r.id===WORLD.selected?'#ffe19a':'#d9e5e8';ctx.stroke();ctx.fillStyle='#fff';ctx.font='2.1px sans-serif';ctx.textAlign='center';ctx.fillText(r.name,x,y-2.5);ctx.font='1.6px sans-serif';ctx.fillText(c?c.name.slice(0,10):'بی‌طرف',x,y+3.5)});
 ctx.fillStyle='#d9bd7c';ctx.font='2.5px sans-serif';ctx.textAlign='left';ctx.fillText('WORLD DOMINION  •  '+WORLD.year,w*.02,h*.96)}
function nearestWorldRegion(x,y,force=false){let best=0,dist=1e9;WORLD.regions.forEach(r=>{const d=Math.hypot(r.x*W-x,r.y*H-y);if(d<dist){dist=d;best=r.id}});return force||dist<12?best:-1}
