// WORLD DOMINION — cinematic intro and living main-menu background.
// Timeline is synced to WDA.intro(): the title "hit" lands at HIT seconds after the tap.
const Intro=(()=>{
 const HIT=19.35,cv=document.createElement('canvas'),cx=cv.getContext('2d');cv.id='intro-cv';document.body.insertBefore(cv,document.body.firstChild);
 const map=new Image(),logo=new Image();let mapOK=false;map.onload=()=>{mapOK=true};map.src='assets/world-map.jpg';logo.src='assets/wd-logo.png';
 const HOT=[[.1767,.3599],[.1678,.5642],[.3048,.8366],[.3887,.1556],[.5194,.3268],[.4814,.3988],[.6095,.3113],[.5654,.463],[.4947,.5642],[.4594,.6712],[.6228,.6809],[.5786,.8852],[.6493,.5214],[.6254,.3988],[.7023,.3794],[.7465,.5486],[.8525,.3794],[.8613,.642],[.7951,.2179],[.9382,.4436],[.9364,.9339],[.9611,.8132],[.2491,.7821],[.2624,.6187],[.6034,.4669],[.6608,.5992],[.7792,.5837],[.826,.4864],[.5654,.2296],[.5848,.4183],[.3286,.749],[.8392,.5934]];
 const LINES=[[0,'جهان در آستانه‌ی یک تغییر بزرگ است…',.9,3.6],[4,'قدرت‌ها برمی‌خیزند. اتحادها شکل می‌گیرند.',4,7.4],[8,'و آینده هنوز نوشته نشده است.',8,11.4],[12.2,'تو، فرمانده‌ی یک ارتش نیستی. تو معمار آینده‌ی یک ملتی.',12.2,16.4]];
 let phase='gate',t0=0,w=0,h=0,dpr=1,raf=0,running=true,flash=0,shock=-9,revealed=false,played=false;
 const stars=Array.from({length:240},()=>({a:Math.random()*6.283,d:Math.random(),s:Math.random()*1.4+.3,tw:Math.random()*6}));
 const dust=Array.from({length:70},()=>({x:Math.random(),y:Math.random(),s:Math.random()*1.8+.5,v:Math.random()*.03+.01,p:Math.random()*6}));
 const COARSE=matchMedia('(pointer:coarse)').matches;const grain=document.createElement('canvas');grain.width=grain.height=140;{const g=grain.getContext('2d'),d=g.createImageData(140,140);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0)}
 const arcs=[];function newArc(){const a=HOT[Math.random()*HOT.length|0];let b;do{b=HOT[Math.random()*HOT.length|0]}while(b===a||Math.hypot(a[0]-b[0],a[1]-b[1])<.18);arcs.push({a,b,t:0,sp:.12+Math.random()*.1,life:1})}
 const ease=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3),sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
 function resize(){dpr=Math.min(qp().dpr,devicePixelRatio||1);w=innerWidth;h=innerHeight;cv.width=w*dpr;cv.height=h*dpr}
 // cover-fit mapping of normalized map coords -> screen, with zoom z around focus f
 function mp(z,fx,fy,driftX,driftY){const iw=1132,ih=514,base=w<h?Math.max(w/iw,h*.55/ih):Math.max(w/iw,h/ih),s=base*z,dw=iw*s,dh=ih*s;let ox=w/2-fx*dw+driftX,oy=h/2-fy*dh+driftY;ox=dw>=w?Math.min(0,Math.max(w-dw,ox)):(w-dw)/2;oy=dh>=h?Math.min(0,Math.max(h-dh,oy)):(h-dh)/2;return{s,ox,oy,dw,dh,P:(x,y)=>[ox+x*dw,oy+y*dh]}}
 // draw only the visible part of the map image (much faster and sharper than scaling the whole picture)
 function drawCrop(c,img,M,vw,vh){const sw=img.naturalWidth||img.width,sh=img.naturalHeight||img.height,x0=Math.max(0,M.ox),y0=Math.max(0,M.oy),x1=Math.min(vw,M.ox+M.dw),y1=Math.min(vh,M.oy+M.dh);if(x1<=x0||y1<=y0)return;c.drawImage(img,(x0-M.ox)/M.dw*sw,(y0-M.oy)/M.dh*sh,(x1-x0)/M.dw*sw,(y1-y0)/M.dh*sh,x0,y0,x1-x0,y1-y0)}
 function draw(now){
  raf=requestAnimationFrame(draw);if(!running)return;
  const t=phase==='intro'?(now-t0)/1000:phase==='menu'?HIT+(now-t0)/1000:0;
  cx.setTransform(dpr,0,0,dpr,0,0);cx.fillStyle='#01040a';cx.fillRect(0,0,w,h);
  const inIntro=phase==='intro'&&t<HIT,menu=phase==='menu'||(phase==='intro'&&t>=HIT);
  // camera shake ahead of the hit
  let sx=0,sy=0;if(phase==='intro'&&t>14.5&&t<HIT){const a=sm(14.5,HIT,t)*5;sx=(Math.random()-.5)*a;sy=(Math.random()-.5)*a}
  cx.save();cx.translate(sx,sy);
  // stars / warp
  const warp=phase==='intro'&&t<4.2?1-sm(2.6,4.2,t):0,cxm=w/2,cym=h/2;
  for(const s of stars){s.d+=(.0006+warp*.012);if(s.d>1)s.d=0;const r=s.d*Math.max(w,h)*.75,x=cxm+Math.cos(s.a)*r,y=cym+Math.sin(s.a)*r,al=(phase==='gate'?.5:.85)*Math.min(1,s.d*3)*(.6+.4*Math.sin(now/600+s.tw));
   cx.fillStyle='rgba(215,225,255,'+al+')';if(warp>.05){cx.strokeStyle='rgba(215,225,255,'+al*.8+')';cx.lineWidth=s.s*.7;cx.beginPath();cx.moveTo(x,y);cx.lineTo(cxm+Math.cos(s.a)*(r-warp*60*s.d),cym+Math.sin(s.a)*(r-warp*60*s.d));cx.stroke()}else cx.fillRect(x,y,s.s,s.s)}
  // Earth map
  if(mapOK&&(phase!=='gate')){
   let z,fx,fy,al,dx=0,dy=0;
   if(inIntro){const k=ease((t-2.6)/15.5);z=2.2-1.05*k;fx=.66-.06*k;fy=.46;al=sm(2.9,6.4,t)*(1-.0*sm(17,19,t))}
   else{const m=(now-t0)/1000;z=1.14+.025*Math.sin(m*.11);fx=.6+.012*Math.sin(m*.07);fy=.46;al=1;dx=Math.sin(m*.05)*10}
   const M=mp(z,fx,fy,dx,dy);cx.save();cx.globalAlpha=al*(inIntro?1:.82);cx.imageSmoothingQuality='high';drawCrop(cx,map,M,w,h);cx.restore();
   // arcs + pings
   if(al>.5){if(arcs.length<(inIntro?Math.min(16,Math.max(0,(t-6.5)*1.6)|0):7)&&Math.random()<.06)newArc();
    cx.save();cx.globalCompositeOperation='lighter';
    for(let i=arcs.length-1;i>=0;i--){const A=arcs[i];A.t+=A.sp/60;if(A.t>1.35){arcs.splice(i,1);continue}const p=Math.min(1,A.t),[x1,y1]=M.P(...A.a),[x2,y2]=M.P(...A.b),mx=(x1+x2)/2,my=(y1+y2)/2-Math.hypot(x2-x1,y2-y1)*.28;
     const fade=A.t>1?1-(A.t-1)/.35:1;cx.strokeStyle='rgba(255,205,110,'+.55*fade+')';cx.lineWidth=1.4;cx.beginPath();
     for(let k=0;k<=24;k++){const u=k/24*p,q=(1-u)*(1-u),r=2*u*(1-u),s2=u*u,x=q*x1+r*mx+s2*x2,y=q*y1+r*my+s2*y2;k?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke();if(qp().fx>=2){cx.lineWidth=4;cx.globalAlpha=.2*fade;cx.stroke();cx.globalAlpha=1;cx.lineWidth=1.4}
     const u=p,q=(1-u)*(1-u),r=2*u*(1-u),s2=u*u;cx.fillStyle='rgba(255,240,190,'+fade+')';cx.beginPath();cx.arc(q*x1+r*mx+s2*x2,q*y1+r*my+s2*y2,2.4,0,6.283);cx.fill();
     cx.beginPath();cx.arc(x1,y1,3,0,6.283);cx.fill();const ring=(now/900+i)%1;cx.strokeStyle='rgba(255,210,120,'+(1-ring)*.5*fade+')';cx.lineWidth=1;cx.beginPath();cx.arc(x2,y2,3+ring*16,0,6.283);cx.stroke()}
    cx.restore()}
   // sun flare top-right
   const fl=inIntro?sm(8,17,t):1,g=cx.createRadialGradient(w*.86,h*.12,0,w*.86,h*.12,Math.max(w,h)*.42);g.addColorStop(0,'rgba(255,214,140,'+.5*fl+')');g.addColorStop(.25,'rgba(255,170,70,'+.13*fl+')');g.addColorStop(1,'rgba(255,170,70,0)');cx.fillStyle=g;cx.globalCompositeOperation='lighter';cx.fillRect(0,0,w,h);cx.globalCompositeOperation='source-over'}
  // dust
  cx.save();cx.globalCompositeOperation='lighter';for(const d of dust){d.y-=d.v/60;if(d.y<-.02){d.y=1.02;d.x=Math.random()}const a=(phase==='gate'?.3:.55)*(.5+.5*Math.sin(now/700+d.p));cx.fillStyle='rgba(255,200,100,'+a+')';cx.beginPath();cx.arc(d.x*w+Math.sin(now/1500+d.p)*8,d.y*h,d.s,0,6.283);cx.fill()}cx.restore();
  // vignette + readability for menu
  const vg=cx.createRadialGradient(w/2,h*.45,Math.min(w,h)*.15,w/2,h/2,Math.max(w,h)*.75);vg.addColorStop(0,menu?'rgba(1,5,12,.35)':'rgba(1,5,12,0)');vg.addColorStop(1,'rgba(1,3,8,.92)');cx.fillStyle=vg;cx.fillRect(-10,-10,w+20,h+20);
  if(menu){const lg=cx.createLinearGradient(0,h*.55,0,h);lg.addColorStop(0,'rgba(1,4,10,0)');lg.addColorStop(1,'rgba(1,4,10,.86)');cx.fillStyle=lg;cx.fillRect(0,h*.55,w,h*.45)}
  cx.restore();
  // shockwave + flash at the hit
  if(phase==='intro'&&!revealed&&t>=HIT){revealed=true;flash=1;shock=now;reveal()}
  if(phase==='intro'&&t>=HIT+2.4){phase='menu';t0=now}
  if(shock>0){const e=(now-shock)/1000;if(e<2.2){cx.save();cx.globalCompositeOperation='lighter';for(let k=0;k<3;k++){const r=(e-k*.12)*Math.max(w,h)*.6;if(r<0)continue;cx.strokeStyle='rgba(255,210,120,'+Math.max(0,.55-e*.26)+')';cx.lineWidth=3-k;cx.beginPath();cx.arc(w/2,h*.4,r,0,6.283);cx.stroke()}cx.restore()}}
  if(flash>0){cx.fillStyle='rgba(255,236,190,'+flash*.9+')';cx.fillRect(0,0,w,h);flash=Math.max(0,flash-.035)}
  // letterbox
  if(phase==='intro'){const bar=h*.115*sm(.2,1.4,t)*(1-sm(HIT,HIT+1.6,t));cx.fillStyle='#000';cx.fillRect(0,0,w,bar);cx.fillRect(0,h-bar,w,bar)}
  // fade-in from black at start + film grain
  if(phase==='intro'){cx.fillStyle='rgba(0,0,0,'+(1-sm(0,1.2,t))*.9+')';cx.fillRect(0,0,w,h)}
  if(phase!=='gate'&&(!COARSE||qp().fx>=3)){cx.save();cx.globalAlpha=.045;cx.globalCompositeOperation='overlay';const ox=Math.random()*140,oy=Math.random()*140;for(let x=-140;x<w;x+=140)for(let y=-140;y<h;y+=140)cx.drawImage(grain,x+ox,y+oy);cx.restore()}
  // subtitles
  if(phase==='intro'&&t<HIT-1){const l=LINES.find(L=>t>=L[2]&&t<=L[3]);const el=document.getElementById('intro-sub');if(l){if(el.dataset.k!==String(l[2])){el.dataset.k=l[2];el.textContent=l[1];el.classList.remove('on');void el.offsetWidth;el.classList.add('on')}}else el.classList.remove('on')}
  else{const el=document.getElementById('intro-sub');if(el)el.classList.remove('on')}
 }
 function splitTitle(){document.querySelectorAll('.hero-logo').forEach(e=>{if(e.dataset.split)return;e.dataset.split=1;const mk=(s,c)=>[...s].map((ch,i)=>'<i style="--i:'+i+'">'+ch+'</i>').join('');e.innerHTML='<span class="ln1">'+mk('WORLD')+'</span><br><span class="ln2">'+mk('DOMINION')+'</span>'})}
 function reveal(){document.body.classList.remove('intro-run');const m=document.getElementById('menu');m.classList.add('reveal');const sk=document.getElementById('intro-skip');if(sk)sk.style.display='none'}
 function start(){
  if(played)return;played=true;const gate=document.getElementById('intro-gate');WDA.unlock();WDA.fx('confirm');gate.classList.add('go');setTimeout(()=>gate.remove(),900);
  const seen=sessionStorage.getItem('wdIntro');
  if(seen||location.hash==='#skip'){phase='menu';t0=performance.now();document.body.classList.remove('intro-run');revealed=true;reveal();WDA.titleHitNow();WDA.menu();flash=.6;shock=performance.now();return}
  sessionStorage.setItem('wdIntro','1');phase='intro';t0=performance.now()+150;document.getElementById('intro-skip').style.display='block';WDA.intro()}
 function skip(){if(phase!=='intro'||revealed)return;WDA.cut();WDA.titleHitNow();t0=performance.now()-HIT*1000}
 function stop(){running=false;cancelAnimationFrame(raf);cv.style.display='none'}function resume(){running=true;cv.style.display='block';cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}
 splitTitle();resize();addEventListener('resize',resize);document.body.classList.add('intro-run');raf=requestAnimationFrame(draw);
 return{start,skip,stop,resume,get phase(){return phase}}})();
