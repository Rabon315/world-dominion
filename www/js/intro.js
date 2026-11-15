// WORLD DOMINION — lightweight entry: skip the old canvas cinematic entirely.
(()=>{
 const menu=document.getElementById('menu');
 document.body.classList.remove('intro-run');
 if(menu){menu.classList.add('reveal');menu.style.visibility='visible';menu.style.opacity='1';menu.style.pointerEvents='auto';}
 const gate=document.getElementById('intro-gate');if(gate)gate.remove();
 const skip=document.getElementById('intro-skip');if(skip)skip.remove();
 window.Intro={start(){},skip(){},stop(){},resume(){},get phase(){return 'menu'}};
})();
