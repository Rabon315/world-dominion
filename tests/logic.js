// Headless deterministic simulation checks; no browser or network required.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const ctx=vm.createContext({console,Math,Date,JSON,Array,Uint8Array,Float32Array,Number,String,Object,Set,Map,Promise,innerWidth:1280,innerHeight:720,document:{getElementById(){return {style:{display:'none'},textContent:'',innerHTML:'',add(){}}}},setTimeout(){},clearTimeout(){},setT(){},mgTab:'eco'});
for(const f of ['rng.js','common.js','state.js','save.js','sim.js','mgmt.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../www/js',f),'utf8'),ctx,{filename:f});
vm.runInContext(`newGame({rivals:7,win:80,name:'آزمایش',rg:3,gov:'جمهوری',aspect:1.8,seed:12345}); let start=0;for(;start<W*H;start++)if(TR[start]===1)break;spawn(start);`,ctx);
assert.equal(vm.runInContext('stage',ctx),'play');
const before=vm.runInContext('M.gdp',ctx),pop=vm.runInContext('M.pop',ctx);
vm.runInContext(`for(let i=0;i<1200;i++)tick();`,ctx);
assert(vm.runInContext('M.gdp',ctx)>before,'GDP should evolve');
assert(vm.runInContext('M.pop',ctx)!==pop,'population should respond to economic conditions');
assert(vm.runInContext('Number.isFinite(M.unemp)&&Number.isFinite(M.infl)&&M.budget.education>=0',ctx));
vm.runInContext(`G[1]=10000;M.rs={id:'ind1',p:0,t:25};for(let i=0;i<300;i++)tick();`,ctx);
assert(vm.runInContext('!!M.tech.ind1',ctx),'research should complete');
assert(vm.runInContext('validSnap(snapshot())',ctx),'save snapshot should validate');
console.log('PASS: deterministic game start, annual economy, population, research, and save validation');
