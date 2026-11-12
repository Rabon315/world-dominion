// Game state: everything the simulation needs lives in these variables.
// snapshot()/restore() are the ONLY serialization entry points (used for save/load and future multiplayer).
let aid=0,TR,owner,bld,cnt,city,T,G,wk,alive,ag,nm,CL,A=[],F_=[],N=0,tot=0,win=65,stage='menu',run=false,tk=0,dirty=1,seed=0; // dirty = redraw flag (not saved)
const LOG=[];let M,rg=[],rel=[],ally=[],truce=[],trade=[],sanc=[],gm=[],pm=[],cmul=[],dm=[],fl=0,ps=[],aRel=[],aAl=[];
const SNAP_VER=3;
function snapshot(){
 const o={v:SNAP_VER,seed,rng:rngS,W,H,N,tot,win,stage,run,tk,aid,fl,TR:Array.from(TR),owner:Array.from(owner),bld:Array.from(bld),M,LOG,ps,aRel,aAl,cnt,city,T,G,wk,alive,ag,nm,CL,A,F_,rg,rel,ally,truce,trade,sanc,gm,pm,cmul,dm};
 return JSON.parse(JSON.stringify(o))}
function validSnap(o){
 if(!o||o.v!==SNAP_VER||!Number.isInteger(o.W)||!Number.isInteger(o.H)||!Number.isInteger(o.N))return false;
 if(o.W<50||o.W>400||o.H<30||o.H>200||o.N<2||o.N>60)return false;
 for(const k of ['TR','owner','bld'])if(!Array.isArray(o[k])||o[k].length!==o.W*o.H)return false;
 for(const k of ['cnt','city','T','G','wk','alive','ag','CL','rg','rel','ally','truce','trade','sanc','gm','pm','cmul','dm','ps','aRel','aAl'])if(!Array.isArray(o[k])||o[k].length!==o.N+1)return false;
 if(!Array.isArray(o.nm)||o.nm.length<o.N+1)return false;
 for(const k of ['aRel','aAl'])for(const r of o[k])if(!Array.isArray(r)||r.length!==o.N+1)return false;
 if(!Array.isArray(o.A)||!Array.isArray(o.F_)||!Array.isArray(o.LOG)||!o.M||typeof o.M!=='object')return false;
 for(const k of ['tk','tot','win','rng','fl','aid','seed'])if(!Number.isFinite(o[k]))return false;
 return true}
// Returns true on success; on invalid data returns false and leaves the current game untouched.
function restore(src){
 let o;try{o=JSON.parse(JSON.stringify(src))}catch(e){return false}
 if(!validSnap(o))return false;
 W=o.W;H=o.H;N=o.N;tot=o.tot;win=o.win;stage=o.stage;run=!!o.run;tk=o.tk;aid=o.aid;fl=o.fl;seed=o.seed;rngS=o.rng;
 TR=Uint8Array.from(o.TR);owner=Uint8Array.from(o.owner);bld=Uint8Array.from(o.bld);
 cnt=o.cnt;city=o.city;T=o.T;G=o.G;wk=o.wk;alive=o.alive;ag=o.ag;nm=o.nm;CL=o.CL;A=o.A;F_=o.F_;rg=o.rg;rel=o.rel;ally=o.ally;truce=o.truce;trade=o.trade;sanc=o.sanc;gm=o.gm;pm=o.pm;cmul=o.cmul;dm=o.dm;ps=o.ps;aRel=o.aRel;aAl=o.aAl;M=o.M;
 LOG.length=0;LOG.push(...o.LOG);dirty=1;return true}
