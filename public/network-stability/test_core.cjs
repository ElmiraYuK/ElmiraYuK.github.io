/* Run with: node test_core.cjs. Finite regressions, not an all-K proof. */
'use strict';const assert=require('node:assert/strict'),M=require('./core.js');
let routes=0,randomCases=0,profileCases=0;const rnd=M.rng(741852);
for(const K of[9,10,11,16,30,36]){const g=M.wheel(K);assert.equal(g.points.length,3*K+1);assert.equal(g.edges.length,6*K);assert.equal(g.adj[0].length,3*K);assert(2*g.edges.length/g.points.length<4);assert(M.delta(K)>0);
 for(let k=0;k<K;k++){const s=3*k+1,a=s+1,d=s+2,up=g.points.map(()=>true);
  assert.deepEqual(M.route(g,up,k).path,[s,a,d]);routes++;
  up[a]=false;assert.deepEqual(M.route(g,up,k).path,[s,0,d]);routes++;
  up[0]=false;const r=M.route(g,up,k);assert.equal(r.kind,'excursion');assert.equal(r.path.length-1,3*K-2);assert(r.length>2);routes++;
  up[(3*k-1+g.n)%g.n+1]=false;assert.equal(M.route(g,up,k).kind,'blocked');routes++;
 }
 for(let i=0;i<200;i++){const k=i%K,q=.02+.96*rnd(),up=g.points.map(()=>rnd()<q),r=M.route(g,up,k);assert.equal(new Set(r.path).size,r.path.length);
  for(let j=1;j<r.path.length;j++){assert(up[r.path[j]]);assert(g.adj[r.path[j-1]].some(([v])=>v===r.path[j]));}
  const expected=!up[r.s]?'source-off':!up[r.d]?'destination-off':up[r.a]?'short':up[0]?'hub':up.every((on,v)=>v===0||v===r.a||on)?'excursion':'blocked';assert.equal(r.kind,expected);randomCases++;
 }
 for(const q of[.01,.15,.65,.91,.999]){const p=M.profiles(K,q,.9,.03,1000);assert(Math.abs(p.A-.873*K)<1e-12);assert(Math.abs(p.error-25*K/6000)<1e-12);assert(p.lower<=p.phi&&p.phi<=p.upper);assert(p.exc>=0);profileCases++;}
 const it=M.intervals(K);assert(it[0][1]<it[1][0]&&it[1][1]<it[2][0]);assert(M.logOccurrence(K,1,1e-5)<0);
}
assert.throws(()=>M.wheel(2));assert.throws(()=>M.profiles(11,1,.9,.03,1000));
const a=M.rng(12),b=M.rng(12);for(let i=0;i<50;i++)assert.equal(a(),b());
console.log(JSON.stringify({status:'PASS',diagnostic_routes:routes,random_states:randomCases,profile_cases:profileCases,scope:'Geometry and programme regressions only; not proof of queue stability.'},null,2));
