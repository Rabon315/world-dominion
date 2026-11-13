// Lightweight bilingual UI layer. Persian remains the default; English can be selected in Settings.
(function(){
 const dict = {
 'برای ورود به جهان لمس کن':'Tap to enter the world',
 '🎧 برای تجربه‌ی کامل، صدا را روشن کن و از هدفون استفاده کن':'🎧 Enable sound and use headphones for the full experience',
 'رد کردن ⏭':'Skip ⏭','یک جهان مستقل؛ هزاران مسیر برای تاریخ':'One independent world; a thousand paths through history',
 'جهان را اداره نکن؛ آینده‌اش را شکل بده.':'Do not just rule the world. Shape its future.',
 'شروع یک جهان تازه':'Create a New World','ادامه بازی':'Continue Game','تنظیمات':'Settings','خروج':'Exit',
 'جهان خودت را بساز':'Create Your World','کشورت را انتخاب کن یا از صفر یک ملت تازه خلق کن.':'Choose a country or create a new nation from scratch.',
 'انتخاب کشور':'Choose Country','ساخت کشور جدید':'Create New Country','کشور / هویت ملی':'Country / National Identity',
 'نام رسمی کشور':'Official Country Name','پایتخت':'Capital','نوع حکومت':'Government Type','پرچم کشور':'National Flag',
 'رنگ ملی':'National Color','گرایش فرهنگی / دین رسمی':'Culture / Official Religion','کشور مستقل':'Independent Nation',
 'کشور انتخاب‌شده':'Selected Country','حکومت':'Government','وضعیت':'Status','تعداد رقبای هوش مصنوعی':'AI Rivals',
 'شرط پیروزی':'Victory Condition','ساخت جهان و ورود به بازی':'Create World & Enter Game',
 'محل تأسیس پایتخت را در مرحله بعد مستقیماً روی نقشه انتخاب می‌کنی.':'You will choose your capital location directly on the map in the next step.',
 'در شروع بازی، نقطه استقرار کشور را روی خشکی انتخاب می‌کنی. هوش مصنوعی برای سایر کشورها جهان را پر می‌کند.':'Choose a land location for your nation. AI countries will populate the rest of the world.',
 'بازی آفلاین • ذخیره روی دستگاه • بدون نیاز به حساب کاربری':'Offline game • Saved on this device • No account required',
 'اتاق فرمان ملی':'National Command Center','حکمرانی • توسعه • روابط جهانی':'Governance • Development • Global Relations',
 'داشبورد کشور':'Country Dashboard','اقتصاد':'Economy','کابینه':'Cabinet','دیپلماسی':'Diplomacy','تاریخچه':'History',
 'توسعه ملی':'National Development','پژوهش':'Research','اصلاحات':'Reforms','تجارت':'Trade','مذاکره':'Negotiations','تحریم':'Sanctions',
 'لایه نقشه':'Map Layer','توقف':'Pause','ذخیره‌ی خودکار':'Autosave','اعلان‌های روی صفحه':'On-screen notifications',
 'نام کشورها روی نقشه':'Country names on map','اندازه‌ی رابط':'Interface Scale','کوچک':'Small','عادی':'Normal','بزرگ':'Large','خیلی بزرگ':'Extra Large',
 'روشن':'On','خاموش':'Off','بازگشت':'Back','سرعت پیش‌فرض بازی':'Default Game Speed',
 'ذخیره‌ی خودکار (هر سال بازی و هنگام خروج از برنامه)':'Autosave (each game year and when leaving the app)',
 'اعلان‌های روی صفحه (تاریخچه در «اخبار» می‌ماند)':'On-screen notifications (events remain in News)',
 'جهان در آستانه‌ی یک تغییر بزرگ است…':'The world stands on the edge of a great change…',
 'قدرت‌ها برمی‌خیزند. اتحادها شکل می‌گیرند.':'Powers rise. Alliances are forged.',
 'و آینده هنوز نوشته نشده است.':'And the future is still unwritten.',
 'تو، فرمانده‌ی یک ارتش نیستی. تو معمار آینده‌ی یک ملتی.':'You are not merely a commander. You are the architect of a nation’s future.',
 'جهان را شکل بده':'Shape the World','جهان، آن چیزی می‌شود که تو می‌سازی.':'The world becomes what you make of it.'
 };
 let lang=localStorage.getItem('wd.language')||'fa';
 const keys=Object.keys(dict).sort((a,b)=>b.length-a.length);
 const reverse=Object.fromEntries(Object.entries(dict).map(([fa,en])=>[en,fa]));
 const enKeys=Object.keys(reverse).sort((a,b)=>b.length-a.length);
 function translate(s){
  let out=s;
  if(lang==='en'){for(const k of keys){if(out===k)return dict[k];out=out.split(k).join(dict[k])}}
  else {for(const k of enKeys){if(out===k)return reverse[k];out=out.split(k).join(reverse[k])}}
  return out;
 }
 function walk(node){
  if(node.nodeType===Node.TEXT_NODE){const v=node.nodeValue;if(v&&v.trim()){const n=translate(v);if(n!==v)node.nodeValue=n}return}
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  if(node.matches('script,style,textarea,input,option'))return;
  for(const child of node.childNodes)walk(child);
 }
 function apply(){
  document.documentElement.lang=lang;document.documentElement.dir=lang==='fa'?'rtl':'ltr';
  document.body.classList.toggle('lang-en',lang==='en');
  walk(document.body);
  const sub=document.getElementById('intro-sub');if(sub&&sub.textContent)sub.textContent=translate(sub.textContent);
  document.dispatchEvent(new CustomEvent('wd:language',{detail:{language:lang}}));
 }
 const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')walk(r.target);else r.addedNodes.forEach(walk)}});
 observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
 function set(v){lang=v==='en'?'en':'fa';localStorage.setItem('wd.language',lang);apply()}
 window.WDLocale={get:()=>lang,set, t:translate, apply};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();