/* Discrete network and Euler approximation to Theorem 1.
 * Public API is shared by the Web Worker and Node verification. */
(function (root) {
'use strict';
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return (((z ^ (z >>> 14)) >>> 0) + .5) / 4294967296;
  };
}
function normal(random) {
  return Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
}
function graph(kind, K, chi, degree, random, matrix) {
  const rows = Array.from({length: K}, () => []);
  const add = (i,j,p) => { if (i !== j && p > 0) rows[i].push([j,p]); };
  if (kind === 'matrix') {
    if (!matrix || matrix.length !== K || matrix.some(row => row.length !== K))
      throw new Error('Matrix must be K × K.');
    for (let i=0;i<K;i++) for(let j=0;j<K;j++) {
      const p=Number(matrix[i][j]);
      if (!Number.isFinite(p) || p < 0 || (i===j && p!==0)) throw new Error('Matrix entries must be nonnegative and the diagonal must be zero.');
      add(i,j,p);
    }
  } else if (kind === 'complete') {
    for(let i=0;i<K;i++) for(let j=0;j<K;j++) if(i!==j) add(i,j,chi/(K-1));
  } else if (kind === 'ring') {
    for(let i=0;i<K;i++) { add(i,(i+1)%K,chi/2); add(i,(i+K-1)%K,chi/2); }
  } else if (kind === 'tandem') {
    for(let i=0;i<K-1;i++) add(i,i+1,chi);
  } else if (kind === 'sparse') {
    // Symmetric random graph with bounded degree; rejected edges keep the degree bound.
    const sets=Array.from({length:K},()=>new Set());
    const cap=Math.min(Math.max(1,degree),K-1);
    for(let i=0;i<K-1;i++) if(sets[i].size<cap && sets[i+1].size<cap) {sets[i].add(i+1);sets[i+1].add(i);}
    for(let k=0;k<K*cap*4;k++) {
      const i=Math.floor(random()*K),j=Math.floor(random()*K);
      if(i!==j && sets[i].size<cap && sets[j].size<cap) {sets[i].add(j);sets[j].add(i);}
    }
    for(let i=0;i<K;i++) for(const j of sets[i]) add(i,j,chi/Math.max(sets[i].size,sets[j].size));
  } else throw new Error('Unknown topology.');
  const row=new Float64Array(K),col=new Float64Array(K);
  for(let i=0;i<K;i++) for(const [j,p] of rows[i]) {row[i]+=p;col[j]+=p;}
  const maxRow=Math.max(...row),maxCol=Math.max(...col);
  if(maxRow>=1-1e-12 || maxCol>=1-1e-12)
    throw new Error('Each row and column sum must be strictly less than 1.');
  return {rows,K,maxRow,maxCol,edgeCount:rows.reduce((a,r)=>a+r.length,0)};
}
function phase(graph, down) {
  const {K,rows}=graph, incoming=new Float64Array(K),outgoing=new Float64Array(K),active=Array.from({length:K},()=>[]);
  for(let i=0;i<K;i++) if(i!==down) for(const [j,p] of rows[i]) if(j!==down) {
    active[i].push([j,p]); outgoing[i]+=p; incoming[j]+=p;
  }
  const a=Float64Array.from(incoming,(v,i)=>i===down?0:1-v);
  const exit=Float64Array.from(outgoing,(v,i)=>i===down?0:1-v);
  return {active,a,exit,incoming,outgoing};
}
function r(w,d) {
  let v=0;
  for(let j=1;j<=60;j++) { const z=w*Math.pow(d,j); if(z>40) break; v+=Math.exp(-z); }
  for(let j=0;j>=-100;j--) { const z=w*Math.pow(d,j); if(z<1e-14) break; v+=Math.expm1(-z); }
  return v;
}
function omega(x,d) {
  const k=Math.floor(x), f=x-k;
  let lo=-8,hi=8;
  for(let n=0;n<50;n++){const mid=(lo+hi)/2;if(r(Math.exp(mid),d)>f)lo=mid;else hi=mid;}
  return Math.exp((lo+hi)/2)*Math.pow(d,-k);
}
function buildG(d,theta) {
  const w=new Float64Array(1001);
  for(let i=0;i<=1000;i++) w[i]=omega(i/1000,d);
  return x=>{
    const k=Math.floor(x),z=(x-k)*1000,i=Math.min(999,Math.floor(z)),f=z-i;
    return (d-1)*Math.pow(d,theta-k)*(w[i]*(1-f)+w[i+1]*f);
  };
}
function newModel(options, providedG) {
  const {K,N,d,chi,gamma,seed}=options;
  const random=rng(seed ^ 0x9e3779b9);
  const initialRandom=rng(seed ^ 0x243f6a88);
  const graphRandom=rng(seed ^ 0xb7e15162);
  const diffusionRandom=rng(seed ^ 0xdeadbeef);
  if(!(K>=3&&K<=1000&&N>=2&&N<=200&&d>=2&&d<=8&&chi>=0&&chi<1&&gamma>=0)) throw new Error('Parameters are outside supported ranges.');
  const net=options.net||graph(options.kind,K,chi,options.degree||4,graphRandom,options.matrix);
  const down=K-1, ph=phase(net,down), rawLog=Math.log(N)/Math.log(d);
  const logValue=Math.abs(rawLog-Math.round(rawLog))<1e-12?Math.round(rawLog):rawLog;
  const center=Math.floor(logValue), theta=logValue-center, w=omega(0,d);
  const queues=new Int32Array(K*N), busy=[],pos=new Int32Array(K*N).fill(-1);
  const setBusy=(id,on)=>{ if(on && pos[id]<0){pos[id]=busy.length;busy.push(id);}else if(!on && pos[id]>=0){const k=pos[id],last=busy.pop();pos[id]=-1;if(k<busy.length){busy[k]=last;pos[last]=k;}} };
  const x=new Float64Array(K), means=new Float64Array(K);
  // A profile-based initial condition, clipped at zero for the finite system.
  for(let i=0;i<K;i++) for(let j=0;j<N;j++) {
    const z=Math.floor(Math.log(-Math.log(initialRandom())/w)/Math.log(d));
    const q=Math.max(0,center+z), id=i*N+j;
    queues[id]=q;means[i]+=q/N;if(q>0&&i!==down)setBusy(id,true);
  }
  for(let i=0;i<K;i++)x[i]=means[i]-center;
  return {options,net,ph,down,queues,busy,pos,setBusy,x,means,random,diffusionRandom,g:providedG||buildG(d,theta),
    center,theta,time:0,events:0,arrivals:0,exits:0,switches:0,queueMs:0,diffMs:0,steps:0};
}
function setPhase(m,down) {
  const N=m.options.N;
  for(let j=0;j<N;j++) if(m.queues[down*N+j]>0)m.setBusy(down*N+j,false);
  const old=m.down;
  m.down=down;
  for(let j=0;j<N;j++) if(m.queues[old*N+j]>0)m.setBusy(old*N+j,true);
  m.ph=phase(m.net,down);
}
function arrival(m,i) {
  const {N,d}=m.options;let id=i*N+Math.floor(m.random()*N);
  for(let k=1;k<d;k++){const q=i*N+Math.floor(m.random()*N);if(m.queues[q]<m.queues[id])id=q;}
  if(m.queues[id]++===0)m.setBusy(id,true);
  m.means[i]+=1/N;
}
function nextEvent(m) {
  const {K,N,gamma}=m.options, random=m.random;
  let arrivalRate=0;
  for(let i=0;i<K;i++) arrivalRate+=(N-1)*m.ph.a[i];
  const switchRate=gamma/N,total=arrivalRate+m.busy.length+switchRate;
  const dt=-Math.log(random())/total, u=random()*total;
  return {dt,u,arrivalRate,total};
}
function applyEvent(m,e) {
  const {K,N,chi}=m.options, random=m.random;
  if(e.u<e.arrivalRate){
    let v=e.u,i=0;for(;i<K;i++){v-=(N-1)*m.ph.a[i];if(v<0)break;}
    arrival(m,Math.min(i,K-1));m.arrivals++;
  } else if(e.u<e.arrivalRate+m.busy.length){
    const id=m.busy[Math.floor(e.u-e.arrivalRate)],i=Math.floor(id/N);
    if(--m.queues[id]===0)m.setBusy(id,false);
    m.means[i]-=1/N;
    let p=random(),j=-1;
    for(const [dest,w] of m.ph.active[i]){p-=w;if(p<0){j=dest;break;}}
    if(j<0)m.exits++;else arrival(m,j);
  } else {
    let down=Math.floor(random()*(K-1));if(down>=m.down)down++;
    setPhase(m,down);m.switches++;
  }
  m.events++;
}
function diffusionStep(m,physicalDt) {
  if(physicalDt<=0)return;
  const {K,N}=m.options, dt=physicalDt/N, sq=Math.sqrt(dt);
  const h=new Float64Array(K),change=new Float64Array(K);
  for(let i=0;i<K;i++)if(i!==m.down){
    h[i]=m.g(m.x[i])-1;
    change[i]=h[i]*dt+Math.sqrt(m.ph.a[i]+m.ph.exit[i])*sq*normal(m.diffusionRandom);
  }
  for(let i=0;i<K;i++) if(i!==m.down) for(const [j,p] of m.ph.active[i]) {
    const z=Math.sqrt(p)*sq*normal(m.diffusionRandom);
    change[i]-=z;change[j]+=z;
    change[j]-=p*h[i]*dt;
  }
  for(let i=0;i<K;i++)if(i!==m.down) {
    m.x[i]+=change[i];
    if(!Number.isFinite(m.x[i]) || Math.abs(m.x[i])>1000) throw new Error('Euler approximation became unstable. Reduce the time step or change parameters.');
  }
  m.steps++;
}
function integrate(m,physicalDt,maxStep) {
  let remaining=physicalDt;
  while(remaining>1e-14) {
    const part=Math.min(remaining,maxStep*m.options.N),t=performance.now();
    diffusionStep(m,part);m.diffMs+=performance.now()-t;remaining-=part;
  }
}
function advance(m,count,maxStep=0.01,target=Infinity) {
  let elapsed=0,pending=0;
  for(let k=0;k<count && m.time<target;k++){
    const t0=performance.now(),e=nextEvent(m);
    m.queueMs+=performance.now()-t0;
    const dt=Math.min(e.dt,target-m.time);
    pending+=dt;m.time+=dt;elapsed+=dt;
    if(e.dt>dt)break;
    const phaseChange=e.u>=e.arrivalRate+m.busy.length;
    if(phaseChange){integrate(m,pending,maxStep);pending=0;}
    const t2=performance.now();applyEvent(m,e);m.queueMs+=performance.now()-t2;
  }
  integrate(m,pending,maxStep);
  return elapsed;
}
function W1Sorted(a,b) {
  if(a.length!==b.length || !a.length) throw new Error('Samples must have equal positive size.');
  const x=[...a].sort((u,v)=>u-v),y=[...b].sort((u,v)=>u-v);
  return x.reduce((s,v,i)=>s+Math.abs(v-y[i]),0)/x.length;
}
function profileW1Stats(m,i) {
  const {N,d}=m.options,x=m.means[i]-m.center,w=omega(x,d),counts=[];
  if (!Number.isFinite(w) || w <= 0) throw new Error('Profile calculation exceeds numerical range.');
  for(let j=0;j<N;j++)counts.push(m.queues[i*N+j]-m.center);
  const lo=Math.min(-20,...counts)-30,hi=Math.max(20,...counts)+30;
  let z=0;
  for(let j=lo;j<=hi;j++){
    const emp=counts.reduce((n,v)=>n+(v>=j),0)/N;
    z+=Math.abs(emp-Math.exp(-w*Math.pow(d,j)));
  }
  const left=w*Math.pow(d,lo-1)/(1-1/d);
  const a=w*Math.pow(d,hi+1);
  const right=Math.exp(-a)/(-Math.expm1(-(d-1)*a));
  return {value:z,tailBound:left+(Number.isFinite(right)?right:Infinity)};
}
function profileW1(m,i) { return profileW1Stats(m,i).value; }
function observedCoefficients(m,i) {
  const {K,N,gamma}=m.options;
  const active=i!==m.down;
  const x=m.x[i], g=m.g(x), h=g-1;
  const incoming=[];
  if(active)for(let j=0;j<K;j++)for(const [target,p] of m.ph.active[j]){
    if(target===i){const hj=m.g(m.x[j])-1;incoming.push({pool:j,p,h:hj,term:p*hj});}
  }
  const weightedIncoming=incoming.reduce((sum,edge)=>sum+edge.term,0);
  return {
    active,x,g,h,weightedIncoming,drift:active?h-weightedIncoming:0,
    incoming:incoming.sort((a,b)=>b.p-a.p),
    outgoing:active?m.ph.active[i].map(([pool,p])=>({pool,p})).sort((a,b)=>b.p-a.p):[],
    externalRate:active?(N-1)*m.ph.a[i]:0,
    arrivalReserve:active?m.ph.a[i]:0,
    exitProbability:active?m.ph.exit[i]:0,
    vertexNoiseVariance:active?m.ph.a[i]+m.ph.exit[i]:0,
    bracketRate:active?2:0,
    failureRateAccelerated:active?gamma/(K-1):0,
    repairRateAccelerated:active?0:gamma
  };
}
const api={rng,normal,graph,phase,r,omega,buildG,newModel,setPhase,nextEvent,applyEvent,diffusionStep,advance,W1Sorted,profileW1,profileW1Stats,observedCoefficients};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.NetworkLab=api;
})(typeof globalThis!=='undefined'?globalThis:this);
