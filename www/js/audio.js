// WORLD DOMINION — procedural audio engine (WebAudio). No audio files: music and effects are synthesized live,
// so the app stays small and fully offline. Must be unlocked by a user gesture (WDA.unlock()).
const WDA=(()=>{
 const KEY='wd.audio.v1',pref=(()=>{try{return Object.assign({music:true,sfx:true},JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return{music:true,sfx:true}}})();
 let ctx=null,master,musicG,sfxG,rev,revSend,delay,B=null,introBus=null,mode='off',nextBar=0,bar=0,timer=null,lastHover=0,intensity=1;
 const BPM=76,BEAT=60/BPM,BAR=BEAT*4,hz=m=>440*Math.pow(2,(m-69)/12);
 // D minor: i - VI - III - VII  (Dm, Bb, F, C)
 const CH=[[50,53,57,62],[46,50,53,58],[53,57,60,65],[48,52,55,60]],ROOT=[26,22,29,24];
 function save(){try{localStorage.setItem(KEY,JSON.stringify(pref))}catch(e){}}
 function impulse(sec,decay){const r=ctx.sampleRate,n=r*sec|0,b=ctx.createBuffer(2,n,r);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay)}return b}
 function noiseBuf(sec){const n=ctx.sampleRate*sec|0,b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return b}
 let nb=null;
 function unlock(){
  if(ctx){if(ctx.state==='suspended')ctx.resume();return true}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  ctx=new AC();const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3.5;comp.attack.value=.01;comp.release.value=.3;
  master=ctx.createGain();master.gain.value=.85;master.connect(comp);comp.connect(ctx.destination);
  musicG=ctx.createGain();musicG.gain.value=pref.music?1:0;musicG.connect(master);
  sfxG=ctx.createGain();sfxG.gain.value=pref.sfx?1:0;sfxG.connect(master);
  rev=ctx.createConvolver();rev.buffer=impulse(3.4,2.4);revSend=ctx.createGain();revSend.gain.value=.55;revSend.connect(rev);const rg=ctx.createGain();rg.gain.value=.9;rev.connect(rg);rg.connect(musicG);
  delay=ctx.createDelay(1.5);delay.delayTime.value=BEAT*.75;const fb=ctx.createGain();fb.gain.value=.33,df=ctx.createBiquadFilter();df.type='lowpass';df.frequency.value=2400;delay.connect(df);df.connect(fb);fb.connect(delay);const dout=ctx.createGain();dout.gain.value=.5;df.connect(dout);dout.connect(musicG);
  nb=noiseBuf(2);B={m:musicG,r:revSend,d:delay};
  document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else ctx.resume()});
  return true}
 var df;
 const T=()=>ctx.currentTime;
 function env(g,t,a,d,peak,end=0.0001){g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(end,t+a+d)}
 // ---- instruments (all take absolute start time t)
 function pad(m,t,dur,vol=.05,bright=1100){
  const o=[],g=ctx.createGain(),f=ctx.createBiquadFilter();f.type='lowpass';f.Q.value=.6;f.frequency.setValueAtTime(260,t);f.frequency.linearRampToValueAtTime(bright,t+dur*.55);f.frequency.linearRampToValueAtTime(380,t+dur);
  for(const d of[-9,0,8]){const s=ctx.createOscillator();s.type='sawtooth';s.frequency.value=hz(m);s.detune.value=d;s.connect(f);s.start(t);s.stop(t+dur+.3);o.push(s)}
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+dur*.38);g.gain.linearRampToValueAtTime(vol*.8,t+dur*.8);g.gain.linearRampToValueAtTime(.0001,t+dur);
  f.connect(g);g.connect(B.m);g.connect(B.r)}
 function choir(m,t,dur,vol=.035){
  const g=ctx.createGain(),v=ctx.createOscillator(),vg=ctx.createGain();v.frequency.value=5.2;vg.gain.value=7;v.connect(vg);
  const f1=ctx.createBiquadFilter(),f2=ctx.createBiquadFilter();f1.type=f2.type='bandpass';f1.frequency.value=650;f2.frequency.value=1080;f1.Q.value=f2.Q.value=5;
  for(const d of[-6,5]){const s=ctx.createOscillator();s.type='sawtooth';s.frequency.value=hz(m);s.detune.value=d;vg.connect(s.detune);s.connect(f1);s.connect(f2);s.start(t);s.stop(t+dur+.3)}
  v.start(t);v.stop(t+dur+.3);f1.connect(g);f2.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+dur*.45);g.gain.linearRampToValueAtTime(.0001,t+dur);g.connect(B.m);g.connect(B.r)}
 function bass(m,t,dur,vol=.16){const g=ctx.createGain(),s=ctx.createOscillator(),s2=ctx.createOscillator(),f=ctx.createBiquadFilter();s.type='sine';s2.type='triangle';s.frequency.value=hz(m);s2.frequency.value=hz(m);f.type='lowpass';f.frequency.value=300;s.connect(f);s2.connect(f);f.connect(g);g.connect(B.m);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.06);g.gain.setTargetAtTime(.0001,t+dur*.7,dur*.2);s.start(t);s2.start(t);s.stop(t+dur+.5);s2.stop(t+dur+.5)}
 function pluck(m,t,vol=.06){const g=ctx.createGain(),s=ctx.createOscillator(),f=ctx.createBiquadFilter();s.type='triangle';s.frequency.value=hz(m);f.type='lowpass';f.frequency.setValueAtTime(3600,t);f.frequency.exponentialRampToValueAtTime(500,t+.5);s.connect(f);f.connect(g);env(g,t,.008,.7,vol);g.connect(B.m);g.connect(B.d);g.connect(B.r);s.start(t);s.stop(t+.9)}
 function bell(m,t,vol=.035){for(const[r,v]of[[1,1],[2.76,.35],[5.4,.15]]){const g=ctx.createGain(),s=ctx.createOscillator();s.type='sine';s.frequency.value=hz(m)*r;s.connect(g);env(g,t,.004,2.6/r,vol*v);g.connect(B.m);g.connect(B.r);s.start(t);s.stop(t+3)}}
 function taiko(t,vol=.5,deep=1){const s=ctx.createOscillator(),g=ctx.createGain();s.type='sine';s.frequency.setValueAtTime(130*deep,t);s.frequency.exponentialRampToValueAtTime(42,t+.28);s.connect(g);env(g,t,.004,.9,vol);g.connect(B.m);g.connect(B.r);s.start(t);s.stop(t+1.1);
  const n=ctx.createBufferSource(),nf=ctx.createBiquadFilter(),ng=ctx.createGain();n.buffer=nb;nf.type='bandpass';nf.frequency.value=420;nf.Q.value=.8;n.connect(nf);nf.connect(ng);env(ng,t,.002,.16,vol*.5);ng.connect(B.m);n.start(t,Math.random());n.stop(t+.3)}
 function hit(t,vol=.18,hp=2500){const n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();n.buffer=nb;f.type='highpass';f.frequency.value=hp;n.connect(f);f.connect(g);env(g,t,.003,.28,vol);g.connect(B.m);g.connect(B.r);n.start(t,Math.random());n.stop(t+.5)}
 function riser(t,dur,vol=.14){const n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();n.buffer=nb;n.loop=true;f.type='bandpass';f.Q.value=1.3;f.frequency.setValueAtTime(260,t);f.frequency.exponentialRampToValueAtTime(7200,t+dur);n.connect(f);f.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur*.97);g.gain.linearRampToValueAtTime(.0001,t+dur+.05);g.connect(B.m);g.connect(B.r);n.start(t);n.stop(t+dur+.2);
  const s=ctx.createOscillator(),sg=ctx.createGain();s.type='sawtooth';s.frequency.setValueAtTime(70,t);s.frequency.exponentialRampToValueAtTime(900,t+dur);const sf=ctx.createBiquadFilter();sf.type='lowpass';sf.frequency.value=1400;s.connect(sf);sf.connect(sg);sg.gain.setValueAtTime(.0001,t);sg.gain.exponentialRampToValueAtTime(vol*.35,t+dur);sg.gain.linearRampToValueAtTime(.0001,t+dur+.05);sg.connect(B.m);s.start(t);s.stop(t+dur+.2)}
 function boom(t){const s=ctx.createOscillator(),g=ctx.createGain();s.type='sine';s.frequency.setValueAtTime(95,t);s.frequency.exponentialRampToValueAtTime(26,t+1.6);s.connect(g);env(g,t,.006,3.4,.95);g.connect(B.m);g.connect(B.r);s.start(t);s.stop(t+3.6);
  const n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),ng=ctx.createGain();n.buffer=nb;f.type='lowpass';f.frequency.setValueAtTime(5000,t);f.frequency.exponentialRampToValueAtTime(220,t+2);n.connect(f);f.connect(ng);env(ng,t,.004,2.4,.5);ng.connect(B.m);ng.connect(B.r);n.start(t);n.stop(t+2.6);hit(t,.22,5200)}
 // ---- one bar of the theme (intensity 0..1: menu theme = 1, in-game ambience = lower)
 function playBar(t,i,k){
  const c=CH[i%4],r=ROOT[i%4];
  pad(c[0]+12,t,BAR*1.04,.035*k+.01);pad(c[1]+12,t,BAR*1.04,.03*k+.008);pad(c[2]+12,t,BAR*1.04,.03*k+.008);pad(c[3]+0,t,BAR*1.04,.03*k);
  bass(r,t,BAR*.98,.15*(.5+k*.5));
  if(i%2===0&&k>.5)for(const m of[c[1]+12,c[2]+12])choir(m,t,BAR*1.9,.026);
  const arp=[0,2,1,3,2,1,3,2];
  for(let s=0;s<8;s++){if(k<.6&&s%2)continue;if(k<.6&&R_()<.35)continue;pluck(c[arp[s]%4]+24,t+s*BEAT/2,.034+.03*k)}
  if(k>.5){taiko(t,.45);taiko(t+BEAT*2,.32);if(i%4===3){taiko(t+BEAT*3,.3);taiko(t+BEAT*3.5,.38)}hit(t+BEAT*1.5,.05,6000);hit(t+BEAT*3.5,.05,6000)}
  else if(i%4===0)taiko(t,.22,.85);
  if(i%2===1)bell(c[3]+36,t+BEAT*1.5,.03);if(i%4===0)bell(c[2]+36,t,.03)}
 const R_=()=>Math.random();
 function sched(){if(!ctx||mode==='off')return;const k=mode==='menu'?1:.42;while(nextBar<T()+1.6){playBar(nextBar,bar,k);nextBar+=BAR;bar++}}
 function startLoop(m,at){mode=m;if(!ctx)return;nextBar=Math.max(at||T()+.1,T()+.05);clearInterval(timer);timer=setInterval(sched,350);sched()}
 // ---- cinematic intro: returns the second (relative to call) at which the title hits
 function intro(){
  if(!ctx)return 0;const t0=T()+.15;mode='intro';clearInterval(timer);const main=B,im=ctx.createGain(),ir=ctx.createGain(),id=ctx.createGain();im.connect(musicG);ir.gain.value=.55;ir.connect(rev);id.connect(delay);introBus={m:im,r:ir,d:id};B=introBus;
  // drone
  const dg=ctx.createGain(),df2=ctx.createBiquadFilter();df2.type='lowpass';df2.Q.value=2;df2.frequency.setValueAtTime(90,t0);df2.frequency.exponentialRampToValueAtTime(900,t0+18);
  for(const[m,d]of[[26,0],[26,7],[33,-5],[38,3]]){const s=ctx.createOscillator();s.type='sawtooth';s.frequency.value=hz(m);s.detune.value=d;s.connect(df2);s.start(t0);s.stop(t0+21)}
  df2.connect(dg);dg.gain.setValueAtTime(.0001,t0);dg.gain.exponentialRampToValueAtTime(.11,t0+6);dg.gain.linearRampToValueAtTime(.16,t0+17.5);dg.gain.linearRampToValueAtTime(.0001,t0+19.2);dg.connect(B.m);dg.connect(B.r);
  // glints
  [2.2,3.6,5.1,6.3,7.7].forEach((s,i)=>bell(86+(i%3)*5,t0+s,.022));
  // heartbeat → pulse
  [4.6,5.8,7.0,8.2].forEach(s=>taiko(t0+s,.32,.9));
  for(let s=9.2;s<13.2;s+=.6)taiko(t0+s,.18+(s-9.2)*.05,.9);
  // chords
  CH[0].forEach(m=>pad(m+12,t0+7.6,7,.045));CH[1].forEach(m=>pad(m+12,t0+12.4,7,.05));
  [62,65,69].forEach(m=>choir(m+12,t0+10.5,6,.03));
  bass(26,t0+8,6,.12);bass(22,t0+12.6,6,.14);
  // riser + build
  riser(t0+13.2,5.7,.16);
  for(let s=14.4;s<19;s+=.3){hit(t0+s,.03+(s-14.4)*.012,4800)}
  taiko(t0+17.8,.5);taiko(t0+18.2,.55);taiko(t0+18.6,.65);
  // the hit
  boom(t0+19.2);bell(86,t0+19.2,.05);bell(81,t0+19.35,.04);
  CH[0].forEach(m=>pad(m+12,t0+19.2,BAR*1.2,.06));[62,65,69,74].forEach(m=>choir(m+12,t0+19.2,BAR*2,.04));
  B=main;startLoop('menu',t0+19.2+BAR*.55);
  return .15+19.2}
 function cut(){if(!ctx||!introBus)return;const b=introBus;introBus=null;for(const k of['m','r','d'])b[k].gain.setTargetAtTime(0,T(),.06);setTimeout(()=>{for(const k of['m','r','d'])try{b[k].disconnect()}catch(e){}},900);startLoop('menu',T()+.25)}
 function titleHitNow(){if(!ctx)return;boom(T()+.05)}
 // ---- UI effects
 function sfx(fn){if(!ctx||!pref.sfx)return;fn(T())}
 function tone(t,f,dur,type='sine',vol=.08,slide=0){const s=ctx.createOscillator(),g=ctx.createGain();s.type=type;s.frequency.setValueAtTime(f,t);if(slide)s.frequency.exponentialRampToValueAtTime(f*slide,t+dur);s.connect(g);env(g,t,.004,dur,vol);g.connect(sfxG);s.start(t);s.stop(t+dur+.05)}
 function whoosh(t,dur,f0,f1,vol){const n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();n.buffer=nb;f.type='bandpass';f.Q.value=1.1;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);n.connect(f);f.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur*.4);g.gain.exponentialRampToValueAtTime(.0001,t+dur);g.connect(sfxG);n.start(t,Math.random());n.stop(t+dur+.05)}
 const FX={
  click(){sfx(t=>{tone(t,880,.09,'triangle',.07);tone(t+.015,1320,.07,'sine',.04)})},
  hover(){const n=performance.now();if(n-lastHover<90)return;lastHover=n;sfx(t=>tone(t,1760,.04,'sine',.012))},
  confirm(){sfx(t=>{[0,4,7,12].forEach((s,i)=>tone(t+i*.07,hz(62+s),.35,'triangle',.07));whoosh(t,.5,400,4000,.05)})},
  open(){sfx(t=>{whoosh(t,.35,300,2600,.06);tone(t+.1,hz(74),.3,'sine',.04)})},
  close(){sfx(t=>whoosh(t,.28,2200,300,.045))},
  notify(){sfx(t=>{tone(t,hz(81),.4,'sine',.05);tone(t+.1,hz(88),.5,'sine',.04)})},
  coin(){sfx(t=>{tone(t,hz(88),.12,'square',.03);tone(t+.08,hz(93),.3,'square',.03)})},
  alert(){sfx(t=>{tone(t,330,.25,'sawtooth',.05);tone(t+.22,247,.4,'sawtooth',.05)})},
  month(){sfx(t=>tone(t,hz(69),.12,'sine',.018))}
 };
 return{
  unlock,intro,cut,titleHitNow,menu:()=>{if(ctx&&mode!=='menu'){mode='menu';startLoop('menu')}},game:()=>{if(ctx){mode='game';startLoop('game')}},stopMusic:()=>{mode='off';clearInterval(timer)},
  fx:n=>{try{FX[n]&&FX[n]()}catch(e){}},
  get music(){return pref.music},get sfxOn(){return pref.sfx},get ready(){return !!ctx},
  setMusic(v){pref.music=!!v;save();if(musicG)musicG.gain.setTargetAtTime(v?1:0,T(),.15)},
  setSfx(v){pref.sfx=!!v;save();if(sfxG)sfxG.gain.setTargetAtTime(v?1:0,T(),.05)}
 }})();
