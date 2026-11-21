importScripts('network-core.js');
let model=null,running=false,generation=0,points=[],observed=0,distances=[];
function send(type, data={}) { postMessage({type,...data}); }
function state() {
  const m=model,{K,N}=m.options;
  const means=Array.from(m.means),diff=Array.from(m.x);
  const busyFractions=Array.from({length:K},(_,i)=>{let n=0;for(let j=0;j<N;j++)if(m.queues[i*N+j]>0)n++;return n/N;});
  const queues=K<=10?Array.from({length:K},(_,i)=>Array.from(m.queues.slice(i*N,(i+1)*N))):[];
  const edgeCount=m.net.edgeCount;
  let edges=[];
  if(edgeCount<=12000) for(let i=0;i<K;i++)for(const [j,p] of m.net.rows[i])edges.push([i,j,p]);
  const inSum=m.ph.incoming[observed],outSum=m.ph.outgoing[observed],down=observed===m.down;
  const profile=NetworkLab.profileW1Stats(m,observed);
  const coefficientDetail=NetworkLab.observedCoefficients(m,observed);
  send('state',{time:m.time,accel:m.time/N,events:m.events,switches:m.switches,
    means,diff,queues,busyFractions,down:m.down,edges,edgeCount,theta:m.theta,center:m.center,coefficientDetail,
    profileW1:profile.value,profileTailBound:profile.tailBound,a:down?0:m.ph.a[observed],exit:down?0:m.ph.exit[observed],
    inSum,outSum,queueMs:m.queueMs,diffMs:m.diffMs,steps:m.steps,
    maxRow:m.net.maxRow,maxCol:m.net.maxCol,
    series:points.slice(-500),observed,distances});
}
function tick(token) {
  if(!running||token!==generation)return;
  try {
    NetworkLab.advance(model,100,Number(model.options.step));
    points.push({t:model.time/model.options.N, q:model.means[observed]-model.center, x:model.x[observed]});
    state();
    setTimeout(()=>tick(token),50);
  } catch(e){running=false;send('error',{message:e.message});}
}
function graphDistances(net,root) {
  const reverse=Array.from({length:net.K},()=>[]);
  for(let i=0;i<net.K;i++)for(const [j] of net.rows[i])reverse[j].push(i);
  const dist=new Int32Array(net.K).fill(-1),queue=new Int32Array(net.K);
  dist[root]=0;queue[0]=root;
  for(let head=0,tail=1;head<tail;head++){
    const i=queue[head];
    for(const [j] of net.rows[i])if(dist[j]<0){dist[j]=dist[i]+1;queue[tail++]=j;}
    for(const j of reverse[i])if(dist[j]<0){dist[j]=dist[i]+1;queue[tail++]=j;}
  }
  return Array.from(dist);
}
function reset(opts) {
  running=false;generation++;
  model=NetworkLab.newModel(opts);
  observed=Math.max(0,Math.min(opts.K-1,Number(opts.observe)||0));
  distances=graphDistances(model.net,observed);
  points=[{t:0,q:model.means[observed]-model.center,x:model.x[observed]}];
  send('resetDone');
  state();
}
async function ensemble(opts) {
  running=false;generation++;
  const count=Number(opts.reps),target=Number(opts.target)*model.options.N;
  if(!(count>=2&&count<=100&&target>0))throw Error('Choose 2–100 replicas and a positive horizon.');
  const finite=[],diffuse=[],N=model.options.N,base=model.options.seed;
  let queueMs=0,diffMs=0,eventCount=0,iterations=0;
  for(let k=0;k<count;k++){
    const m=NetworkLab.newModel({...model.options,net:model.net,seed:base+7919*(k+1)},model.g);
    while(m.time<target){
      NetworkLab.advance(m,m.net.edgeCount>12000?20:100,Number(opts.step),target);
      iterations++;
      await new Promise(resolve=>setTimeout(resolve,0));
      if(running || opts.token!==generation){send('ensembleCancelled');return;}
    }
    finite.push(m.means[observed]-m.center);diffuse.push(m.x[observed]);
    queueMs+=m.queueMs;diffMs+=m.diffMs;eventCount+=m.events;
    send('progress',{completed:k+1,count});
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  finite.sort((a,b)=>a-b);diffuse.sort((a,b)=>a-b);
  send('ensemble',{finite,diffuse,w1:NetworkLab.W1Sorted(finite,diffuse),
    count,target:Number(opts.target),queueMs,diffMs,eventCount});
}
async function sweep(opts) {
  running=false;const token=++generation;
  const count=Number(opts.reps),target=Number(opts.target);
  if(!(count>=2&&count<=100&&target>0&&target<=10)) throw Error('Choose 2–100 replicas and a positive horizon.');
  const d=model.options.d, sizes=[];
  for(let n=d;n<=200;n*=d)sizes.push(n);
  if(sizes.length<2)throw Error('This d has fewer than two powers within the supported N range.');
  const results=[];
  for(const N of sizes) {
    const g=NetworkLab.buildG(d,0),finite=[],diffuse=[];
    let queueMs=0,diffMs=0;
    for(let k=0;k<count;k++){
      const m=NetworkLab.newModel({...model.options,N,net:model.net,seed:model.options.seed+7919*(k+1)},g);
      while(m.time<target*N){
        NetworkLab.advance(m,m.net.edgeCount>12000?20:100,Number(opts.step),target*N);
        await new Promise(resolve=>setTimeout(resolve,0));
        if(token!==generation){send('ensembleCancelled');return;}
      }
      finite.push(m.means[observed]-m.center);diffuse.push(m.x[observed]);
      queueMs+=m.queueMs;diffMs+=m.diffMs;
      send('sweepProgress',{N,completed:k+1,count,index:results.length+1,total:sizes.length});
    }
    results.push({N,w1:NetworkLab.W1Sorted(finite,diffuse),queueMs,diffMs});
  }
  send('sweep',{results,count,target});
}
onmessage=async e=>{
  try {
    const {action,options={}}=e.data;
    if(action==='reset')reset(options);
    if(action==='start'){if(!model)throw Error('Reset the model first.');if(!running){running=true;generation++;tick(generation);}}
    if(action==='pause'){running=false;generation++;send('paused');}
    if(action==='ensemble'){options.token=++generation;await ensembleStart(options);}
    if(action==='sweep')await sweep(options);
  }catch(err){running=false;send('error',{message:err.message});}
};
async function ensembleStart(opts) {
  // ensemble owns the current generation and responds to pause or reset.
  const token=opts.token; generation=token-1;
  await ensemble({...opts,token});
}
