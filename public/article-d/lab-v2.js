'use strict';
const get=id=>document.getElementById(id);
const worker=new Worker('network-worker.js');
let matrixData=null,lastState=null,currentOptions=null,pendingOptions=null,working=false,activeJob=null;
const fmt=(x,d=3)=>Number.isFinite(x)?Number(x).toFixed(d):'—';
const options=()=>({
  K:Number(get('nodes').value),N:Number(get('perPool').value),d:Number(get('choices').value),
  kind:get('topology').value,chi:Number(get('routing').value),degree:Number(get('degree').value),
  gamma:Number(get('phaseRate').value),observe:Number(get('observe').value)-1,
  seed:Number(get('randomSeed').value),step:Number(get('euler').value),matrix:matrixData
});
function check(o) {
  if(!Number.isInteger(o.K)||o.K<3||o.K>1000)throw Error('K must be an integer between 3 and 1000.');
  if(!Number.isInteger(o.N)||o.N<2||o.N>200)throw Error('N must be an integer between 2 and 200.');
  if(!Number.isInteger(o.d)||o.d<2||o.d>8)throw Error('d must be an integer between 2 and 8.');
  if(!Number.isInteger(o.observe)||o.observe<0||o.observe>=o.K)throw Error('Choose an observed pool between 1 and K.');
  if(!(o.chi>=0&&o.chi<1&&o.gamma>=0&&o.gamma<=20&&o.step>=.0001&&o.step<=.05))throw Error('Check routing, switching and Euler step bounds.');
  if(!Number.isInteger(o.seed)||o.seed<1||o.seed>999999)throw Error('Seed must be an integer between 1 and 999999.');
  if(o.kind==='matrix'&&!matrixData)throw Error('Upload a CSV matrix first.');
  if(o.kind==='sparse'&&(!Number.isInteger(o.degree)||o.degree<1||o.degree>30))throw Error('Degree cap must be an integer from 1 to 30.');
}
function setJob(kind){activeJob=kind;get('ensemble').disabled=!!kind;get('sweep').disabled=!!kind;get('cancel').disabled=!kind;get('apply').disabled=!!kind;get('play').disabled=!!kind;}
function reset(){
 if(pendingOptions)return;
 try{const o=options();check(o);pendingOptions=o;working=false;get('play').textContent='Start';get('ensembleResult').innerHTML='';get('sweepResult').innerHTML='';for(const id of ['ensembleChart','sweepChart']){const c=get(id);c.getContext('2d').clearRect(0,0,c.width,c.height);}get('ensembleStatus').textContent='Choose a comparison to start. Stop cancels the comparison; Pause above controls the network animation.';get('labMessage').textContent='Building network…';worker.postMessage({action:'reset',options:o});}
 catch(e){get('labMessage').textContent=e.message;}
}
get('topology').addEventListener('change',()=>{get('fileBlock').hidden=get('topology').value!=='matrix';get('labMessage').textContent='Select Build / reset to apply changed settings.';});
for(const id of ['nodes','perPool','choices','routing','degree','phaseRate','observe','euler','randomSeed'])get(id).addEventListener('input',()=>get('labMessage').textContent='Select Build / reset to apply changed settings.');
get('matrix').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    const str=await file.text(),rows=str.trim().split(/\r?\n/).map(line=>line.split(/[;,\t]/).map(x=>{if(!x.trim())throw Error('Empty matrix entry.');return Number(x.trim());}));
    if(rows.length<3||rows.length>1000||rows.some(row=>row.length!==rows.length||row.some(x=>!Number.isFinite(x))))throw Error('Expected a square numeric CSV matrix of order 3–1000.');
    matrixData=rows;get('nodes').value=rows.length;get('matrixName').textContent=file.name+' · '+rows.length+' × '+rows.length;get('labMessage').textContent='Matrix loaded locally. Select Build / reset.';
  }catch(err){matrixData=null;get('matrixName').textContent=err.message;}
});
get('apply').addEventListener('click',reset);
get('play').addEventListener('click',()=>{
  if(pendingOptions)return;
  if(!currentOptions){reset();return;}
  working=!working;get('play').textContent=working?'Pause':'Resume';
  worker.postMessage({action:working?'start':'pause'});
});
get('ensemble').addEventListener('click',()=>{
 if(!currentOptions||pendingOptions)return;
 const reps=Number(get('reps').value),target=Number(get('target').value);
 if(!Number.isInteger(reps)||reps<2||reps>100||!Number.isFinite(target)||target<=0||target>10){get('ensembleStatus').textContent='Choose 2–100 replicas and 0 < T ≤ 10.';return;}
 working=false;get('play').textContent='Resume';
 get('ensembleResult').innerHTML='';get('ensembleStatus').textContent='Starting the distribution comparison…';setJob('ensemble');
 worker.postMessage({action:'ensemble',options:{reps,target,step:currentOptions.step}});
});
get('sweep').addEventListener('click',()=>{
 if(!currentOptions||pendingOptions)return;
 const reps=Number(get('reps').value),target=Number(get('target').value);
 if(!Number.isInteger(reps)||reps<2||reps>100||!(target>0&&target<=10)){get('ensembleStatus').textContent='Choose 2–100 replicas and 0 < T ≤ 10.';return;}
 working=false;get('play').textContent='Resume';get('sweepResult').innerHTML='';get('ensembleStatus').textContent='Starting the N comparison…';setJob('sweep');
 worker.postMessage({action:'sweep',options:{reps,target,step:currentOptions.step}});
});
get('cancel').addEventListener('click',()=>{if(!activeJob)return;get('cancel').disabled=true;get('ensembleStatus').textContent='Stopping the comparison after the current calculation…';worker.postMessage({action:'pause'});});
function graphDraw(s) {
 const canvas=get('networkGraph'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,K=currentOptions.K;
 ctx.clearRect(0,0,w,h);
 const xy=[];
 if(K<=60){const r=Math.min(w*.36,h*.38);for(let i=0;i<K;i++){const angle=2*Math.PI*i/K-Math.PI/2;xy.push([w/2+r*Math.cos(angle),h/2+r*Math.sin(angle)]);}}
 else {const cols=Math.ceil(Math.sqrt(K*w/h)),rows=Math.ceil(K/cols);for(let i=0;i<K;i++)xy.push([25+(w-50)*(i%cols)/Math.max(1,cols-1),25+(h-50)*Math.floor(i/cols)/Math.max(1,rows-1)]);}
 for(const [i,j] of s.edges){
  const bad=i===s.down||j===s.down;
  ctx.strokeStyle=bad?'#e1c1c0':'#74b9a7';ctx.lineWidth=bad?.9:1.6;
  ctx.setLineDash(bad?[5,5]:[]);ctx.beginPath();ctx.moveTo(...xy[i]);ctx.lineTo(...xy[j]);ctx.stroke();
  if(K<=20){
   const dx=xy[j][0]-xy[i][0],dy=xy[j][1]-xy[i][1],length=Math.hypot(dx,dy);
   const ux=dx/length,uy=dy/length,tx=xy[j][0]-ux*18,ty=xy[j][1]-uy*18;
   ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(tx-ux*7-uy*4,ty-uy*7+ux*4);ctx.lineTo(tx,ty);ctx.lineTo(tx-ux*7+uy*4,ty-uy*7-ux*4);ctx.stroke();
  }
 }
 ctx.setLineDash([]);
 const radius=K<=10?14:K<=60?8:Math.max(2,Math.min(5,100/Math.sqrt(K)));
 for(let i=0;i<K;i++){
  const color=i===s.down?'#d16965':s.busyFractions[i]>=.9?'#d2a05f':'#348f78';
  ctx.fillStyle=color;ctx.beginPath();ctx.arc(xy[i][0],xy[i][1],radius,0,2*Math.PI);ctx.fill();
  if(i===s.observed){ctx.strokeStyle='#153d3d';ctx.lineWidth=3;ctx.stroke();}
  if(K<=20){ctx.fillStyle='white';ctx.font='bold 12px DM Sans,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),xy[i][0],xy[i][1]);}
 }
 get('graphNotice').textContent=s.edgeCount>12000?'Dense graph: '+s.edgeCount.toLocaleString()+' directed routes. Nodes are shown; edges are hidden to keep the display responsive.':'Directed routes: '+s.edgeCount.toLocaleString()+'. Incident routes are faded when a pool is down.';
}
function poolDraw(s){
 const node=get('smallPools');
 if(currentOptions.K>10){node.innerHTML='';get('largePoolNote').textContent='Large network: each dot is a pool. The graph, observed pool, busy share and trajectories provide the overview.';return;}
 const max=Math.max(5,...s.queues.flat());get('largePoolNote').textContent='Each bar is one queue; height represents customers.';
 node.innerHTML=s.queues.map((q,i)=>'<div class="pool '+(i===s.down?'failed':'')+'"><div class="pool-head"><span>POOL '+(i+1)+'</span><span>'+(i===s.down?'DOWN':'UP')+'</span></div><div class="queue-bars">'+q.map(v=>'<div class="queue" title="'+v+' customers" style="height:'+Math.max(2,100*v/max)+'%"></div>').join('')+'</div></div>').join('');
}
function plot(canvasId, series, labels) {
 const canvas=get(canvasId),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,L=50,R=20,T=12,B=27;
 ctx.clearRect(0,0,w,h);if(!series.length)return;
 const values=series.flatMap(p=>[p.q,p.x]),lo=Math.min(...values)-.15,hi=Math.max(...values)+.15;
 const xmin=series[0].t,xmax=Math.max(xmin+.001,...series.map(p=>p.t));
 ctx.strokeStyle='#e7eee8';ctx.font='15px sans-serif';ctx.fillStyle='#8b9c91';
 for(let k=0;k<=3;k++){const y=T+(h-T-B)*k/3;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(w-R,y);ctx.stroke();ctx.fillText(fmt(hi-(hi-lo)*k/3,1),2,y+4);}
 [['q','#5069d4'],['x','#a56de1']].forEach(([key,color])=>{ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();series.forEach((p,i)=>{const x=L+(w-L-R)*(p.t-xmin)/(xmax-xmin),y=T+(h-T-B)*(hi-p[key])/(hi-lo);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();});
 ctx.fillStyle='#8b9c91';ctx.fillText(fmt(xmin,2),L,h-5);ctx.textAlign='right';ctx.fillText(fmt(xmax,2)+'  '+labels,w-R,h-5);ctx.textAlign='start';
}
function quantiles(a,b) {
 const canvas=get('ensembleChart'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,L=50,R=20,T=8,B=25;
 ctx.clearRect(0,0,w,h);const all=a.concat(b),lo=Math.min(...all)-.1,hi=Math.max(...all)+.1;
 ctx.font='15px sans-serif';ctx.fillStyle='#71867b';
 for(let k=0;k<=3;k++){let y=T+(h-T-B)*k/3;ctx.strokeStyle='#e7eee8';ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(w-R,y);ctx.stroke();ctx.fillText(fmt(hi-(hi-lo)*k/3,1),2,y+4);}
 [[a,'#5069d4'],[b,'#a56de1']].forEach(([v,c])=>{ctx.strokeStyle=c;ctx.lineWidth=3;ctx.beginPath();v.forEach((z,i)=>{const x=L+(w-L-R)*i/(v.length-1),y=T+(h-T-B)*(hi-z)/(hi-lo);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();});
 ctx.fillStyle='#80948a';ctx.font='15px sans-serif';ctx.fillText('quantile 0',L,h-3);ctx.textAlign='right';ctx.fillText('quantile 1',w-R,h-3);ctx.textAlign='start';
}
function plotSweep(items){
 const canvas=get('sweepChart'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,L=52,R=20,T=12,B=28;
 ctx.clearRect(0,0,w,h);
 const maximum=Math.max(...items.map(x=>x.w1),1e-9),count=items.length;
 ctx.strokeStyle='#e7eee8';ctx.font='14px sans-serif';ctx.fillStyle='#71867b';
 for(let j=0;j<4;j++){const y=T+(h-T-B)*j/3;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(w-R,y);ctx.stroke();ctx.fillText(fmt(maximum*(1-j/3),2),2,y+4);}
 ctx.strokeStyle='#5069d4';ctx.fillStyle='#5069d4';ctx.lineWidth=3;ctx.beginPath();
 items.forEach((p,i)=>{const x=L+(w-L-R)*i/(count-1),y=T+(h-T-B)*(1-p.w1/maximum);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
 ctx.stroke();ctx.font='14px sans-serif';ctx.textAlign='center';
 items.forEach((p,i)=>{const x=L+(w-L-R)*i/(count-1),y=T+(h-T-B)*(1-p.w1/maximum);ctx.beginPath();ctx.arc(x,y,4,0,7);ctx.fill();ctx.fillText('N='+p.N,x,h-5);});
 ctx.textAlign='start';
}
function drawCoefficients(s){
 const c=s.coefficientDetail;
 if(!c){get('coefficientCalculations').textContent='Coefficient details are unavailable.';return;}
 const i=s.observed+1,n=currentOptions.N;
 const shown=c.incoming.slice(0,6);
 const rows=shown.map(edge=>'<tr><td>'+String(edge.pool+1)+'</td><td>'+fmt(edge.p,5)+'</td><td>'+fmt(edge.h,5)+'</td><td>'+fmt(edge.term,5)+'</td></tr>').join('');
 const extra=c.incoming.length>shown.length?'<p class="calculation-note">Showing '+shown.length+' of '+c.incoming.length+' incoming routes. The weighted sum and drift include every incoming route.</p>':'';
 const neighbors=c.outgoing.slice(0,6).map(edge=>'pool '+String(edge.pool+1)+': '+fmt(edge.p,5)).join('; ');
 const outExtra=c.outgoing.length>6?' and '+String(c.outgoing.length-6)+' more':'';
 const routes=c.active?(rows?'<table class="calculation-table"><thead><tr><th>Incoming pool j</th><th>pᵉⱼᵢ</th><th>h(Xⱼ)</th><th>pᵉⱼᵢ h(Xⱼ)</th></tr></thead><tbody>'+rows+'</tbody></table>'+extra:'<p class="calculation-note">No incoming active routes; the incoming weighted sum is zero.</p>'):'<p class="calculation-note">The pool is down; its incident routes, drift and noise are frozen.</p>';
 get('coefficientCalculations').innerHTML=
  '<div class="coefficient-grid">'+
  '<div><span>POOL AND PHASE</span><strong>'+i+' · '+(c.active?'working':'down')+'</strong><small>Hᵢ = '+(c.active?'1':'0')+'</small></div>'+
  '<div><span>CENTERING AND PHASE</span><strong>mᴺ = '+s.center+'</strong><small>θ = '+fmt(s.theta,5)+'; N = '+n+'</small></div>'+
  '<div><span>NUMERICAL STATE</span><strong>Xᵢ = '+fmt(c.x,5)+'</strong><small>gθ(Xᵢ) ≈ '+fmt(c.g,5)+'; h(Xᵢ) ≈ '+fmt(c.h,5)+'</small></div>'+
  '<div><span>ACTIVE DRIFT</span><strong>'+fmt(c.drift,5)+'</strong><small>'+(c.active?fmt(c.h,5)+' − ('+fmt(c.weightedIncoming,5)+')':'0, while the pool is down')+'</small></div>'+
  '</div>'+
  '<h4>Routing and balance</h4><p class="calculation-line">Incoming sum = '+fmt(s.inSum,5)+'; outgoing sum = '+fmt(s.outSum,5)+'. '+(c.active?'aᵢ = 1 − '+fmt(s.inSum,5)+' = <strong>'+fmt(c.arrivalReserve,5)+'</strong>; exit pᵢ₀ = 1 − '+fmt(s.outSum,5)+' = <strong>'+fmt(c.exitProbability,5)+'</strong>. External arrivals = (N−1)aᵢ = <strong>'+fmt(c.externalRate,5)+'</strong> per unit of physical time.':'These active-phase quantities are zero while the pool is down.')+'</p>'+
  (c.active?'<p class="calculation-note">Outgoing probabilities: '+(neighbors||'no active outgoing routes')+outExtra+'.</p>':'')+
  '<h4>Incoming contribution to the drift</h4>'+routes+
  '<p class="calculation-line">∑ⱼ pᵉⱼᵢh(Xⱼ) ≈ <strong>'+fmt(c.weightedIncoming,5)+'</strong>; drift ≈ <strong>'+fmt(c.drift,5)+'</strong>.</p>'+
  '<h4>Noise and switching rates</h4><p class="calculation-line">External-noise variance rate aᵢ+pᵢ₀ = '+fmt(c.vertexNoiseVariance,5)+'; incoming + outgoing route-noise variance rate = '+fmt(c.active?s.inSum+s.outSum:0,5)+'; total d⟨Mᵢ⟩/dt = <strong>'+fmt(c.bracketRate,5)+'</strong>.</p>'+
  '<p class="calculation-line">Accelerated-time rates in the current phase: αᵢ = '+fmt(c.failureRateAccelerated,5)+' (failure), βᵢ = '+fmt(c.repairRateAccelerated,5)+' (repair). Physical-time rates are αᵢ/N and βᵢ/N.</p>';
}
worker.onmessage=e=>{
 const s=e.data;
 if(s.type==='error'){setJob(null);pendingOptions=null;working=false;get('play').textContent=currentOptions?'Resume':'Start';get('labMessage').textContent=s.message;get('ensembleStatus').textContent=s.message;return;}
 if(s.type==='resetDone'){currentOptions=pendingOptions;pendingOptions=null;return;}
 if(pendingOptions)return;
 if(s.type==='sweepProgress'){get('ensembleStatus').textContent='N = '+s.N+' ('+s.index+'/'+s.total+'), replica '+s.completed+'/'+s.count+'…';return;}
 if(s.type==='sweep'){
  plotSweep(s.results);
  get('ensembleStatus').textContent='Empirical W₁ by N = dᵏ · '+s.count+' replicas at t = '+s.target+'.';
  setJob(null);get('sweepResult').innerHTML=s.results.map(p=>'<span>N = '+p.N+': <strong>'+fmt(p.w1,4)+'</strong></span>').join('');
  return;
 }
 if(s.type==='progress'){get('ensembleStatus').textContent='Completed '+s.completed+' of '+s.count+' replicas…';return;}
 if(s.type==='ensembleCancelled'){setJob(null);get('ensembleStatus').textContent='Comparison stopped. Completed results remain available.';return;}
 if(s.type==='ensemble'){
  setJob(null);quantiles(s.finite,s.diffuse);
  get('ensembleStatus').textContent=s.count+' paired replicas at t = '+s.target+'.';
  get('ensembleResult').innerHTML='<strong>Empirical W₁ = '+fmt(s.w1,4)+'</strong><span>'+s.eventCount.toLocaleString()+' queue events</span><span>Queue compute time: '+fmt(s.queueMs/1000,3)+' s</span><span>Euler compute time: '+fmt(s.diffMs/1000,3)+' s</span>';
  return;
 }
 if(s.type!=='state')return;
 lastState=s;graphDraw(s);poolDraw(s);plot('compareChart',s.series,'accelerated t');
 get('physTime').textContent=fmt(s.time,2);get('accTime').textContent=fmt(s.accel);
 get('sTime').textContent=fmt(s.accel);get('sEvents').textContent=s.events.toLocaleString();
 get('sQueueTime').textContent=fmt(s.queueMs/1000,3)+' s';get('sDiffTime').textContent=fmt(s.diffMs/1000,3)+' s';get('sSteps').textContent=s.steps.toLocaleString();
 get('sProfile').textContent=fmt(s.profileW1);get('sGap').textContent=fmt(Math.abs(s.means[s.observed]-s.center-s.diff[s.observed]));
 get('profileTail').textContent=Number.isFinite(s.profileTailBound)?Number(s.profileTailBound).toExponential(2):'outside the numerical range';
 get('selectedLabel').textContent='Pool '+(s.observed+1)+(s.observed===s.down?' · unavailable':' · available');
 get('coefficients').textContent='Pool '+(s.observed+1)+': '+(s.observed===s.down?'unavailable; drift and covariance are zero.':'aᵢ = '+fmt(s.a)+', exit pᵢ₀ = '+fmt(s.exit)+', incoming sum = '+fmt(s.inSum)+', outgoing sum = '+fmt(s.outSum)+'.')+'  mᴺ = '+s.center+', θ = '+fmt(s.theta)+'.';
 drawCoefficients(s);
 get('labMessage').textContent='Ready · maximum row sum '+fmt(s.maxRow)+', maximum column sum '+fmt(s.maxCol)+'.';updateRadiusSummary();
};
reset();

get('useNetworkBound').addEventListener('click',()=>{
 if(!lastState || !currentOptions)return;
 const aStar=1-lastState.maxCol;
 get('reserve').value=String(Math.max(1e-12,Math.min(1,aStar)));
 get('q').value=String(currentOptions.gamma);
 get('boundSyncNote').textContent='Using the base matrix: a* ≥ '+fmt(aStar)+'; q* = '+fmt(currentOptions.gamma)+'.';
 if(typeof updateBound==='function')updateBound();
});
worker.onerror=()=>{working=false;get('play').textContent='Start';get('labMessage').textContent='Could not start the worker. Open the page through the local HTTP preview.';};

function updateRadiusSummary(){if(!lastState||!lastState.distances)return;const L=Number(get('radius').value),inside=lastState.distances.filter(x=>x>=0&&x<=L).length;get('radiusSummary').textContent='Radius '+L+' around pool '+(lastState.observed+1)+' contains '+inside+' of '+currentOptions.K+' nodes in this graph.';}
get('radius').addEventListener('input',updateRadiusSummary);
