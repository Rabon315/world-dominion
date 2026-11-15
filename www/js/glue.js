// Glue: connects intro, audio and the command center to the existing game without rewriting it.
(function(){
 const sovereign=()=>stage==='play'&&WORLD&&WORLD.mode==='sovereign';
 $('intro-gate').addEventListener('click',()=>Intro.start());$('intro-skip').onclick=()=>Intro.skip();
 // UI sounds for the classic (non-command-center) buttons
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||e.target.closest('#cc,#intro-gate,#intro-skip'))return;WDA.fx(b.closest('.title-primary,.launch-world,.opt.g')?'confirm':'click')});
 document.addEventListener('pointerover',e=>{if(e.pointerType==='mouse'&&e.target.closest&&e.target.closest('#menu button,#start button,#sys button'))WDA.fx('hover')});
 // new game / continue / load -> command center
 const _begin=begin;begin=function(){_begin();CC.enter()};
 const _ls=loadSlot;loadSlot=function(s){_ls(s);if(sovereign())CC.enter()};
 const _mc=$('mC').onclick;$('mC').onclick=function(){_mc();if(sovereign())CC.enter()};
 // monthly systems + live clock
 const _wt=worldTick;worldTick=function(){_wt();if(!WORLD||stage!=='play')return;const m=WORLD.turn%10===0;if(m){CC.monthly();WDA.fx('month')}if(CC.on){CC.clock();if(m)CC.update()}};
 const _hud=HK.hud;HK.hud=function(){_hud();CC.update()};
 // audio rows in settings
 const _sm=settingsMenu;settingsMenu=function(){_sm();const b=$('sysb'),last=b.querySelector('.opt.g'),row=(k,t,v)=>'<div class="row"><span>'+t+'</span><button class="'+(v?'on':'')+'" onclick="WDA.set'+k+'('+!v+');settingsMenu()">'+(v?'روشن':'خاموش')+'</button></div>';if(last)last.insertAdjacentHTML('beforebegin',row('Music','🎵 موسیقی',WDA.music)+row('Sfx','🔊 افکت‌های صوتی',WDA.sfxOn))};
 $('mS').onclick=settingsMenu;
 // keyboard: space = pause, esc = close panel
 addEventListener('keydown',e=>{if(!CC.on)return;if(e.code==='Escape')CC.closePanel();else if(e.code==='Space'&&stage==='play'){e.preventDefault();setPause(!paused);CC.update()}});
})();
