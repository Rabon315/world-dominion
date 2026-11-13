// Simulation core: map generation, combat, growth, AI, commands. No DOM access.
// The UI plugs in through HK (hooks) and talks to the game through dispatch().
const HK={show(){},hud(){},labels(){},end(){},clock(){}};
function toast(s){LOG.unshift([gameDate(),s]);if(LOG.length>60)LOG.length=60;HK.show(s)}
function hud(){HK.hud();if(typeof renderCommandDashboard==='function')renderCommandDashboard()}
function hsl(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return[f(0)*255,f(8)*255,f(4)*255]}
function vn(){const G=34,v=Array.from({length:G*G},R),s=t=>t*t*(3-2*t);return(x,y)=>{const x0=Math.floor(x)%G,y0=Math.floor(y)%G,fx=s(x-Math.floor(x)),fy=s(y-Math.floor(y)),x1=(x0+1)%G,y1=(y0+1)%G,a=v[y0*G+x0],b=v[y0*G+x1],c=v[y1*G+x0],d=v[y1*G+x1];return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy}}
function gen(){
 // Stylized equirectangular world: recognizable continent silhouettes, then seeded terrain variation.
 const landmasses=[
 [[.035,.22],[.075,.13],[.15,.09],[.22,.12],[.27,.18],[.31,.25],[.29,.32],[.25,.36],[.235,.44],[.20,.49],[.16,.45],[.13,.39],[.09,.36],[.06,.29]],
 [[.235,.49],[.28,.48],[.32,.54],[.335,.62],[.32,.72],[.30,.81],[.28,.91],[.25,.85],[.235,.74],[.22,.63]],
 [[.31,.075],[.36,.055],[.395,.085],[.39,.145],[.35,.18],[.32,.145]],
 [[.405,.245],[.435,.19],[.49,.17],[.535,.19],[.565,.24],[.55,.30],[.51,.33],[.475,.31],[.445,.34],[.415,.30]],
 [[.455,.34],[.51,.33],[.56,.37],[.585,.45],[.57,.56],[.545,.67],[.51,.76],[.485,.68],[.465,.57],[.44,.46]],
 [[.525,.17],[.59,.12],[.67,.13],[.735,.17],[.80,.15],[.875,.19],[.95,.24],[.975,.31],[.94,.37],[.89,.39],[.855,.35],[.82,.42],[.775,.43],[.74,.38],[.70,.42],[.665,.37],[.625,.39],[.59,.34],[.555,.31]],
 [[.61,.39],[.655,.38],[.69,.43],[.68,.51],[.65,.55],[.625,.49]],
 [[.70,.43],[.75,.42],[.78,.48],[.765,.55],[.735,.56],[.71,.51]],
 [[.77,.69],[.83,.66],[.89,.69],[.93,.76],[.91,.84],[.86,.88],[.80,.85],[.77,.78]],
 [[.96,.48],[.985,.46],[.995,.52],[.98,.57],[.955,.55]],
 [[.08,.52],[.12,.51],[.145,.55],[.13,.59],[.095,.58]],
 [[.37,.46],[.39,.45],[.405,.49],[.39,.52]],
 [[.90,.55],[.92,.54],[.935,.58],[.915,.60]]
 ];
 const inside=(x,y,p)=>{let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c}return c};
 const n=vn(),t=new Uint8Array(W*H);let land=0;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const u=(x+.5)/W,v=(y+.5)/H;let isLand=landmasses.some(p=>inside(u,v,p));if(!isLand){t[y*W+x]=0;continue}const h=.55*n(u*11,v*11)+.3*n(u*22,v*22)+.15*n(u*40,v*40);const q=h<.34?1:h<.68?2:3;t[y*W+x]=q;land++}
 tot=land;return t
}
function newGame(cfg){
 seed=(cfg.seed>>>0)||(Date.now()>>>0);seedRng(seed);
 W=Math.max(150,Math.min(210,Math.round(95*(cfg.aspect||1.79))));H=95;
 A=[];F_=[];tk=0;aid=0;LOG.length=0;N=cfg.rivals+1;win=cfg.win;TR=gen();owner=new Uint8Array(W*H);bld=new Uint8Array(W*H);const z=()=>new Array(N+1).fill(0);cnt=z();city=z();T=z();G=z();wk=z().map(()=>.5);alive=z().map(()=>true);ag=z().map(()=>.2+R()*.6);
 const pool=[...NAMES].filter(x=>x!==(cfg.name||'').trim()).sort(()=>R()-.5);nm=['',(cfg.name||'کشور من').trim().slice(0,32),...pool];CL=[null,(cfg.color&&cfg.color.length===3?cfg.color:[224,185,74])];for(let p=2;p<=N;p++)CL.push(hsl((p*137)%360,62,52));
 initM(cfg);initWorld(cfg);
 ps=z().map(()=>Math.floor(R()*3));aRel=[];aAl=[];for(let a=0;a<=N;a++){aRel.push(new Array(N+1).fill(50));aAl.push(new Array(N+1).fill(0))}
 for(let a=2;a<=N;a++)for(let b=a+1;b<=N;b++){const v=cl(50+(rg[a]===rg[b]?10:-5)+Math.round((R()-.5)*20));aRel[a][b]=v;aRel[b][a]=v}
 stage='spawn';dirty=1}
function blob(p,i,r){const x0=i%W,y0=i/W|0;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=x0+dx,y=y0+dy;if(x<0||y<0||x>=W||y>=H||dx*dx+dy*dy>r*r+1)continue;const j=y*W+x;if(TR[j]&&!owner[j]){owner[j]=p;cnt[p]++}}}
function spawn(i){if(WORLD){const r=nearestWorldRegion(i%W,i/W|0,true);return startWorld(r<0?Math.floor(WORLD.regions.length/2):r)}const pts=[i];blob(1,i,3);T[1]=150;for(let p=2;p<=N;p++){for(let k=0;k<600;k++){const j=Math.floor(R()*W*H);if(!TR[j]||TR[j]===3||owner[j])continue;if(pts.some(q=>Math.abs(q%W-j%W)<13&&Math.abs((q/W|0)-(j/W|0))<13))continue;pts.push(j);blob(p,j,3);T[p]=150;break}if(!cnt[p]){alive[p]=false}}
 stage='play';run=true;HK.clock();toast('بازی شروع شد! به زمین‌های خالی اطراف حمله کن')}
function take(p,i){const o=owner[i];if(o&&o!==p){const l=G[o]/Math.max(1,cnt[o])*.6+(bld[i]===1?30:0);G[o]=Math.max(0,G[o]-l);G[p]+=l}if(o){cnt[o]--;if(bld[i]===1)city[o]--}if(bld[i]===2)bld[i]=0;owner[i]=p;cnt[p]++;if(bld[i]===1)city[p]++;if(o&&cnt[o]<=0)die(o)}
function die(o){alive[o]=false;T[o]=0;A=A.filter(a=>a.p!==o);toast('💀 '+nm[o]+' سقوط کرد');if(o===1)finish(false)}
function hasB(p,t){for(let i=0;i<W*H;i++)if(owner[i]===t&&TR[i]&&adj(i,p))return true;return false}
function adj(i,p){const x=i%W;return(x>0&&owner[i-1]===p)||(x<W-1&&owner[i+1]===p)||(i>=W&&owner[i-W]===p)||(i<W*(H-1)&&owner[i+W]===p)}
function near(p,s){const sx=s%W,sy=s/W|0,rr=32+(p===1?fl*12:0);for(let i=0;i<W*H;i++)if(owner[i]===p&&Math.abs(i%W-sx)<=rr&&Math.abs((i/W|0)-sy)<=rr)return true;return false}
function launch(p,t,r,seed){let a=Math.floor(T[p]*r);if(a<10)return 0;if(p===1&&t){if(ally[t]){ally[t]=0;M.rep=Math.max(0,M.rep-8);toast('🤝 اتحاد شکسته شد؛ اعتبار افت کرد')}rel[t]=0;truce[t]=0;M.rep=Math.max(0,M.rep-.5);for(let x=2;x<=N;x++)if(x!==t&&aAl[x][t]){rel[x]=Math.max(0,rel[x]-10);if(ally[x]){ally[x]=0;toast('😠 '+nm[x]+' به‌خاطر حمله به متحدش اتحاد را شکست')}}}else if(p>1&&t>1){aRel[p][t]=0;aRel[t][p]=0;aAl[p][t]=0;aAl[t][p]=0}
 if(!hasB(p,t)){if(seed==null||!near(p,seed))return -1;if(a<60)return 0;T[p]-=a;a-=30;const x0=seed%W,y0=seed/W|0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=x0+dx,y=y0+dy;if(x<0||y<0||x>=W||y>=H)continue;const j=y*W+x;if(TR[j]&&owner[j]===t)take(p,j)}A.push({id:++aid,p,t,tr:a});return 2}
 T[p]-=a;A.push({id:++aid,p,t,tr:a});return 1}
function nearFort(i,t){const x=i%W,y=i/W|0;for(const f of F_)if(bld[f]===2&&owner[f]===t&&Math.abs(f%W-x)<=6&&Math.abs((f/W|0)-y)<=6)return true;return false}
function stepA(){if(tk%50===0)F_=F_.filter(f=>bld[f]===2);for(const a of A){const p=a.p,t=a.t;if(!alive[p]||a.done)continue;const c=[];for(let i=0;i<W*H;i++)if(owner[i]===t&&TR[i]&&adj(i,p))c.push(i);if(!c.length){a.done=1;continue}
 let n=Math.min(c.length,1+Math.floor(a.tr/50),30);while(n-->0&&a.tr>0){const i=c[Math.floor(R()*c.length)];if(owner[i]!==t)continue;let cost=3*MUL[TR[i]];if(t){cost+=T[t]/Math.max(1,cnt[t])*.8;if(nearFort(i,t))cost*=1.8;T[t]=Math.max(0,T[t]-cost*.5)}cost*=cmul[p]/(t?dm[t]:1);if(cost>a.tr){a.done=1;break}a.tr-=cost;take(p,i)}}
 A=A.filter(a=>{if(!a.done&&a.tr>1)return true;if(alive[a.p])T[a.p]+=Math.max(0,a.tr);return false})}
function grow(){for(let p=1;p<=N;p++){if(!alive[p])continue;const cap=80+cnt[p]*12+city[p]*200;T[p]=Math.max(0,T[p]+(.012*T[p]*(1-T[p]/cap)+.05)*(1-wk[p]*.6)*pm[p]);G[p]+=(cnt[p]*.05*wk[p]+city[p]*.3)*gm[p]}}
function neigh(p){const m=new Array(N+1).fill(0);for(let i=0;i<W*H;i++)if(owner[i]===p){const x=i%W,q=[x>0?i-1:-1,x<W-1?i+1:-1,i>=W?i-W:-1,i<W*(H-1)?i+W:-1];for(const j of q)if(j>=0&&TR[j]&&owner[j]!==p)m[owner[j]]++}return m}
const cityCost=p=>120+city[p]*30;
function build(p,i,k){if(owner[i]!==p||bld[i]||!TR[i])return false;const c=k===1?cityCost(p):60;if(G[p]<c)return false;G[p]-=c;bld[i]=k;if(k===1)city[p]++;else F_.push(i);return true}
const PERS=['توسعه‌طلب','تاجر','مدافع'];
function isBorder(i,p){const x=i%W;return(x>0&&TR[i-1]&&owner[i-1]!==p)||(x<W-1&&TR[i+1]&&owner[i+1]!==p)||(i>=W&&TR[i-W]&&owner[i-W]!==p)||(i<W*(H-1)&&TR[i+W]&&owner[i+W]!==p)}
function ensAlly(p,o){return A.some(a=>a.p===o&&a.t>1&&aAl[p][a.t])||(ally[p]&&A.some(a=>a.p===1&&a.t===o))}
function think(p){if(!alive[p])return;const ty=ps[p];
 if(G[p]>cityCost(p)+20&&city[p]<(ty===1?12:9)){for(let k=0;k<40;k++){const i=Math.floor(R()*W*H);if(owner[i]===p&&!bld[i]&&!adj(i,0)&&build(p,i,1))break}}
 if(ty===2&&G[p]>cityCost(p)*.7&&F_.filter(f=>bld[f]===2&&owner[f]===p).length<6){for(let k=0;k<40;k++){const i=Math.floor(R()*W*H);if(owner[i]===p&&!bld[i]&&TR[i]&&isBorder(i,p)&&build(p,i,2))break}}
 if(A.filter(a=>a.p===p).length>=2||T[p]<50)return;const nb=neigh(p);if(nb[0]>0&&R()<(ty===0?.85:ty===1?.6:.7)){launch(p,0,.3+R()*.2);return}
 const k=ty===0?.5:ty===1?.7:.65;let b=0,bs=1e9;
 for(let o=1;o<=N;o++)if(o!==p&&alive[o]&&nb[o]>0&&!(o>1&&(aAl[p][o]||aRel[p][o]>80))&&!(o===1&&(ally[p]||truce[p]>tk||rel[p]>78))&&(T[p]*k>T[o]*(1-ag[p]*.3)||(ensAlly(p,o)&&T[p]*.35>T[o]))){const s=T[o]/Math.max(1,cnt[o]);if(s<bs){bs=s;b=o}}
 if(b)launch(p,b,ty===2?.4:.5)}
// AI-AI diplomacy, once per game second: relations drift, alliances form against a common strong neighbour and break when relations sour
function nAl(a){let c=0;for(let q=2;q<=N;q++)if(aAl[a][q])c++;return c}
function aiDiplo(){let st=0;for(let p=2;p<=N;p++)if(alive[p]&&(!st||T[p]>T[st]))st=p;
 for(let a=2;a<=N;a++){if(!alive[a])continue;for(let b=a+1;b<=N;b++){if(!alive[b]){aAl[a][b]=0;aAl[b][a]=0;continue}
  const war=A.some(x=>(x.p===a&&x.t===b)||(x.p===b&&x.t===a));
  let d=(50-aRel[a][b])*.01+(rg[a]===rg[b]?.03:-.01)+(aAl[a][b]?.05:0)-(war?1:0);
  if(st&&a!==st&&b!==st&&T[st]>1.3*T[a]&&T[st]>1.3*T[b])d+=.15;
  const v=cl(aRel[a][b]+d);aRel[a][b]=v;aRel[b][a]=v;
  if(!aAl[a][b]&&!war&&v>62&&nAl(a)<2&&nAl(b)<2&&R()<.08){aAl[a][b]=1;aAl[b][a]=1}else if(aAl[a][b]&&v<45){aAl[a][b]=0;aAl[b][a]=0}}}}
function tick(){if(!run)return;tk++;if(WORLD&&WORLD.mode==='sovereign'){worldTick();if(tk%10===0)mgmt();return}mgmt();grow();stepA();for(let p=2;p<=N;p++)if((tk+p*3)%20===0)think(p);if(tk%10===0)HK.labels();if(cnt[1]/tot>=win/100)finish(true);else if(alive.slice(2).every(v=>!v))finish(true);hud();dirty=1}
function finish(w){if(!run)return;run=false;HK.end(w)}
function nuke(i,r=5){const x0=i%W,y0=i/W|0,lost={};for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=x0+dx,y=y0+dy;if(x<0||y<0||x>=W||y>=H||dx*dx+dy*dy>r*r+1)continue;const j=y*W+x,o=owner[j];if(TR[j]&&o&&o!==1){lost[o]=(lost[o]||0)+1;cnt[o]--;if(bld[j]===1)city[o]--;bld[j]=0;owner[j]=0}}
 for(const o in lost){aggro(+o);T[o]*=Math.max(0,1-lost[o]/(cnt[o]+lost[o])*1.5);if(cnt[o]<=0)die(+o)}dirty=1}
function aggro(o){if(o>1){if(ally[o]){ally[o]=0;M.rep=Math.max(0,M.rep-8)}rel[o]=0;truce[o]=0}}
function airStrike(i){const o=owner[i];if(!o||o===1)return toast('روی خاک دشمن بزن');if(G[1]<150)return toast('طلا کافی نیست');G[1]-=150;aggro(o);T[o]*=.78;const x0=i%W,y0=i/W|0;for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=x0+dx,y=y0+dy;if(x<0||y<0||x>=W||y>=H)continue;const j=y*W+x;if(bld[j]===2&&owner[j]===o)bld[j]=0}toast('✈️ حمله هوایی: ۲۲٪ سربازان دشمن نابود شد');dirty=1}
function missile(i){if(G[1]<250)return toast('طلا کافی نیست');G[1]-=250;nuke(i,2);toast('🚀 موشک شلیک شد')}
function buyShip(){if(stage!=='play')return;if(G[1]<180)return toast('طلا کافی نیست');G[1]-=180;fl++;toast('🚢 ناو ساخته شد؛ برد حمله‌ی دریایی بیشتر شد');hud()}
function cancelA(id){const a=A.find(x=>x.id===id);if(a)a.done=1;hud()}
// ---- Command layer: every player action goes through dispatch(). Returns a result (see each case).
function dispatch(c){
 switch(c.t){
  case'spawn':return spawn(c.i);
  case'world-action':return worldAction(c.action);
  case'world-select':if(WORLD){WORLD.selected=c.region;const r=WORLD.regions[c.region];if(r&&r.owner>0)WORLD.selectedCountry=r.owner;dirty=1;return true}return false;
  case'attack':if(!TR[c.i]||owner[c.i]===1)return null;return launch(1,owner[c.i],c.r,c.i);
  case'build':return build(1,c.i,c.k);
  case'nuke':if(G[1]<500)return false;G[1]-=500;nuke(c.i);return true;
  case'air':return airStrike(c.i);
  case'missile':return missile(c.i);
  case'ship':return buyShip();
  case'cancel':return cancelA(c.id);
  case'tax':M.tax=cl(+c.v,0,60);return true;
  case'wk':if(wk)wk[1]=cl(+c.v,0,100)/100;return true;
  case'mg':return mgAct(c.a,c.p,c.q);
 }}
