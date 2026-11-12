// Headless deterministic simulation checks; no browser or network required.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const ctx=vm.createContext({console,Math,Date,JSON,Array,Uint8Array,Float32Array,Number,String,Object,Set,Map,Promise,innerWidth:1280,innerHeight:720,document:{getElementById(){return {style:{display:'none'},textContent:'',innerHTML:'',add(){}}}},setTimeout(){},clearTimeout(){},setT(){},mgTab:'eco'});
for(const f of ['rng.js','common.js','state.js','save.js','sim.js','mgmt.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../www/js',f),'utf8'),ctx,{filename:f});
vm.runInContext(`newGame({rivals:7,win:80,name:'جمهوری آفتاب',rg:3,gov:'فدرال',identity:{name:'جمهوری آفتاب',capital:'آرمان‌شهر',flag:'🏳️',gov:'فدرال',color:'#d8ae49'},color:[216,174,73],aspect:1.8,seed:12345}); let start=0;for(;start<W*H;start++)if(TR[start]===1)break;spawn(start);`,ctx);
assert.equal(vm.runInContext('stage',ctx),'play');
assert.equal(vm.runInContext('M.identity.name',ctx),'جمهوری آفتاب','custom nation identity should be part of saved game state');
assert.equal(vm.runInContext('CL[1][0]',ctx),216,'custom national color should drive map territory color');
assert(vm.runInContext('tot/(W*H)',ctx)>.2 && vm.runInContext('tot/(W*H)',ctx)<.6,'world map should contain a balanced land/ocean ratio');
const before=vm.runInContext('M.gdp',ctx),pop=vm.runInContext('M.pop',ctx);
vm.runInContext(`for(let i=0;i<1200;i++)tick();`,ctx);
assert(vm.runInContext('M.gdp',ctx)>before,'GDP should evolve');
assert(vm.runInContext('M.pop',ctx)!==pop,'population should respond to economic conditions');
assert(vm.runInContext('Number.isFinite(M.unemp)&&Number.isFinite(M.infl)&&M.budget.education>=0',ctx));
vm.runInContext(`G[1]=10000;M.rs={id:'ind1',p:0,t:25};for(let i=0;i<300;i++)tick();`,ctx);
assert(vm.runInContext('!!M.tech.ind1',ctx),'research should complete');
assert(vm.runInContext('validSnap(snapshot())',ctx),'save snapshot should validate');
console.log('PASS: custom nation identity, national color, world map generation, annual economy, population, research, and save validation');
