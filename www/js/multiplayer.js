// WORLD DOMINION online lobby client. Gameplay remains offline until server-authoritative simulation is migrated.
(function(){
 const KEY='wd.mp.config.v1',AUTH='wd.mp.auth.v1';
 let cfg={url:localStorage.getItem(KEY)||''},auth=null,socket=null,world=null,createdInvite='';
 try{auth=JSON.parse(localStorage.getItem(AUTH)||'null')}catch(e){}
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const base=()=>cfg.url.replace(/\/+$/,'');
 function ensure(){
  if(document.getElementById('mp-overlay'))return;
  const el=document.createElement('div');el.id='mp-overlay';el.className='ov';el.style.cssText='display:none;z-index:80';
  el.innerHTML='<section class="panel glass mp-panel"><header><div><small>WORLD DOMINION / NETWORK</small><h2>جهان آنلاین</h2><p id="mp-status">برای اتصال، آدرس سرور Render را وارد کن.</p></div><button id="mp-close">✕</button></header><label>آدرس سرور</label><input id="mp-url" placeholder="https://your-service.onrender.com"><div id="mp-auth"><div class="mp-two"><input id="mp-user" placeholder="نام کاربری"><input id="mp-email" type="email" placeholder="ایمیل"></div><input id="mp-pass" type="password" placeholder="رمز عبور (حداقل ۱۰ کاراکتر)"><div class="mp-two"><button id="mp-login">ورود</button><button id="mp-register" class="gold">ساخت حساب</button></div></div><div id="mp-worlds" hidden><div class="mp-two"><input id="mp-world-name" placeholder="نام جهان جدید"><select id="mp-mode"><option value="persistent">جهان عمومی دائمی</option><option value="private">جهان خصوصی</option></select></div><div class="mp-two"><input id="mp-capacity" type="number" min="2" max="500" value="150"><button id="mp-create" class="gold">ساخت جهان</button></div><h3>جهان‌های در دسترس</h3><div class="mp-two"><input id="mp-invite" placeholder="کد دعوت جهان خصوصی"><button id="mp-join-code">ورود با کد دعوت</button></div><div id="mp-list"></div><button id="mp-logout">خروج از حساب</button></div><div id="mp-connected" hidden><h3 id="mp-world-title"></h3><p>اتصال زنده برقرار است. چت و حضور بازیکنان فعال است.</p><div id="mp-chat"></div><div class="mp-two"><input id="mp-message" placeholder="پیام به جهان..."><button id="mp-send" class="gold">ارسال</button></div><button id="mp-leave">بازگشت به فهرست جهان‌ها</button></div></section>';
  document.body.appendChild(el);
  const $=id=>document.getElementById(id);
  $('mp-close').onclick=close;
  $('mp-url').value=cfg.url;
  $('mp-url').onchange=()=>{cfg.url=$('mp-url').value.trim();localStorage.setItem(KEY,cfg.url)};
  $('mp-login').onclick=()=>account('/api/auth/login');
  $('mp-register').onclick=()=>account('/api/auth/register');
  $('mp-create').onclick=createWorld;
  $('mp-join-code').onclick=joinByCode;
  $('mp-logout').onclick=logout;
  $('mp-send').onclick=sendChat;
  $('mp-message').onkeydown=e=>{if(e.key==='Enter')sendChat()};
  $('mp-leave').onclick=()=>{if(socket)socket.disconnect();socket=null;world=null;$('mp-connected').hidden=true;$('mp-worlds').hidden=false;listWorlds()};
 }
 const $=id=>document.getElementById(id);
 function status(s){$('mp-status').textContent=s}
 function open(){ensure();$('mp-overlay').style.display='flex';$('mp-url').value=cfg.url;if(auth){$('mp-auth').hidden=true;$('mp-worlds').hidden=false;listWorlds()}}
 function close(){const e=$('mp-overlay');if(e)e.style.display='none'}
 async function api(path,body,token){
  if(!base())throw Error('ابتدا آدرس سرور Render را وارد کن.');
  const r=await fetch(base()+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
  const j=await r.json().catch(()=>({error:'پاسخ سرور قابل خواندن نیست.'}));if(!r.ok)throw Error(j.error||('HTTP '+r.status));return j
 }
 async function account(path){
  try{
   cfg.url=$('mp-url').value.trim();localStorage.setItem(KEY,cfg.url);
   const data={email:$('mp-email').value.trim(),password:$('mp-pass').value};
   if(path.endsWith('register'))data.username=$('mp-user').value.trim();
   const r=await api(path,data);auth=r;localStorage.setItem(AUTH,JSON.stringify(auth));
   $('mp-auth').hidden=true;$('mp-worlds').hidden=false;status('خوش آمدی، '+r.user.username);listWorlds();
  }catch(e){status(e.message)}
 }
 async function listWorlds(){
  try{const r=await api('/api/worlds',null,auth.token);$('mp-list').innerHTML=r.worlds.length?r.worlds.map(w=>'<div class="mp-world"><div><b>'+esc(w.name)+'</b><small>'+esc(w.mode==='persistent'?'جهان عمومی':'جهان خصوصی')+' · '+w.players+'/'+w.max_players+' بازیکن</small></div><button data-join="'+esc(w.id)+'">ورود</button></div>').join(''):'<p>هنوز جهانی ساخته نشده است.</p>';
   $('mp-list').querySelectorAll('[data-join]').forEach(b=>b.onclick=()=>joinWorld(b.dataset.join));
  }catch(e){status(e.message)}
 }
 async function createWorld(){
  try{const r=await api('/api/worlds',{name:$('mp-world-name').value.trim()||'New World',mode:$('mp-mode').value,maxPlayers:Math.max(2,Math.min(500,+$('mp-capacity').value||150))},auth.token);createdInvite=r.world.invite_code||'';status(createdInvite?'کد دعوت جهان خصوصی: '+createdInvite:'جهان ساخته شد. در حال ورود…');await joinWorld(r.world.id)}
  catch(e){status(e.message)}
 }
 async function joinByCode(){
  try{const r=await api('/api/worlds/join-by-code',{inviteCode:$('mp-invite').value.trim()},auth.token);await connectWorld(r.world.id,r.world)}
  catch(e){status(e.message)}
 }
 async function joinWorld(id){
  try{
   const r=await api('/api/worlds/'+id+'/join',{},auth.token);await connectWorld(id,r.world);
  }catch(e){status(e.message)}
 }
 async function connectWorld(id,worldInfo){
  try{
   if(!window.io){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.socket.io/4.8.1/socket.io.min.js';s.onload=resolve;s.onerror=()=>reject(Error('کتابخانه اتصال زنده بارگذاری نشد.'));document.head.appendChild(s)})}
   socket=io(base(),{auth:{token:auth.token},transports:['websocket','polling']});
   socket.on('connect',()=>socket.emit('world:join',{worldId:id},ack=>{if(!ack.ok){status(ack.error);return}world=worldInfo;$('mp-worlds').hidden=true;$('mp-connected').hidden=false;$('mp-world-title').textContent=world.name;status('متصل به جهان آنلاین');}));
   socket.on('connect_error',e=>status('اتصال ناموفق: '+e.message));
   socket.on('world:event',e=>addChat((e.user||'؟')+': '+e.message));
   socket.on('presence:joined',e=>addChat((e.user||'بازیکن')+' وارد جهان شد.'));
   socket.on('world:state:updated',()=>addChat('وضعیت ذخیره‌شده جهان به‌روزرسانی شد.'));
   }catch(e){status(e.message)}
 }
 function addChat(t){const box=$('mp-chat');if(!box)return;const d=document.createElement('div');d.textContent=t;box.appendChild(d);while(box.children.length>60)box.firstChild.remove();box.scrollTop=box.scrollHeight}
 function sendChat(){const v=$('mp-message').value.trim();if(!v||!socket||!world)return;socket.emit('world:command',{type:'chat:message',payload:{worldId:world.id,message:v}},r=>{if(!r.ok)status(r.error)});$('mp-message').value=''}
 function logout(){if(socket)socket.disconnect();socket=null;auth=null;localStorage.removeItem(AUTH);$('mp-auth').hidden=false;$('mp-worlds').hidden=true;$('mp-connected').hidden=true;status('از حساب خارج شدی.')}
 document.addEventListener('DOMContentLoaded',()=>{
  ensure();const b=document.createElement('button');b.id='mMP';b.className='title-secondary';b.innerHTML='🌐 مولتی‌پلیر آنلاین <span>↗</span>';b.onclick=open;
  const actions=document.querySelector('#menu .title-actions');if(actions)actions.appendChild(b);
 });
 window.WDMultiplayer={open,close,get connected(){return !!socket&&socket.connected}};
})();