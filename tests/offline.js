const {chromium}=require('playwright'),path=require('path');
(async()=>{const b=await chromium.launch(),ctx=await b.newContext({offline:true,viewport:{width:800,height:360}}),pg=await ctx.newPage();
const reqs=[],fails=[],errs=[];pg.on('request',r=>reqs.push(r.url()));pg.on('requestfailed',r=>fails.push(r.url()));pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve('../www/index.html'));await pg.evaluate(()=>begin());
const ok=await pg.evaluate(()=>{let i=0;for(;i<W*H;i++)if(TR[i]===1)break;spawn(i);for(let n=0;n<300;n++)tick();return run&&tk>=300});
console.log(JSON.stringify({offlineRuns:ok,requests:reqs,failed:fails,errs}));await b.close()})();
