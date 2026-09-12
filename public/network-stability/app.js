'use strict';
const M=NetworkMath,$=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
let graph,up,random=M.rng(12092026),timer=null,animated=false;
const get=()=>({K:+$('K').value,q:+$('q').value,gamma:+$('gamma').value,epsilon:+$('eps').value,kappa:10**+$('speed').value,k:+$('petal').value,lambda:+$('lambda').value});
function add(svg,tag,attrs,text){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;svg.append(e);return e;}
const fmt=(x,d=5)=>Number.isFinite(x)?x.toFixed(d):'not finite';
const sci=x=>Math.abs(x)>=.0001?fmt(x):x.toExponential(3);
function list(el,pairs){el.replaceChildren();for(const[a,b]of pairs){const d=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=a;dd.textContent=b;d.append(dt,dd);el.append(d);}}
function resetSeed(){random=M.rng((+$('seed').value||1)>>>0);}
function sample(){const s=get();graph=M.wheel(s.K);up=graph.points.map(()=>random()<s.q);$('stateNote').textContent='Independent Bernoulli(q) snapshot; no queue state is simulated.';render();}
function makeCase(kind){const s=get(),a=3*s.k+2;up=graph.points.map(()=>true);if(kind!=='short')up[a]=false;if(kind==='excursion'||kind==='blocked')up[0]=false;if(kind==='blocked')up[(3*s.k-1+graph.n)%graph.n+1]=false;$('stateNote').textContent='Constructed diagnostic state, not an unconditional sample.';render();}
function drawNetwork(){const s=get(),svg=$('network');svg.replaceChildren();const r=M.route(graph,up,s.k),edges=new Set(r.path.slice(1).map((v,i)=>[v,r.path[i]].sort((a,b)=>a-b).join(':')));
 add(svg,'circle',{cx:0,cy:0,r:295,fill:'none',stroke:'#272738','stroke-width':1});
 for(const[u,v]of graph.edges){const p=graph.points[u],q=graph.points[v],active=up[u]&&up[v],selected=edges.has([u,v].sort((a,b)=>a-b).join(':'));
  add(svg,'line',{x1:p.x*280,y1:p.y*280,x2:q.x*280,y2:q.y*280,stroke:selected?'#70d6d6':active?'#43435a':'#2a2734','stroke-width':selected?4.5:1.3,'stroke-dasharray':active?'none':'3 5',opacity:selected?1:active?.8:.45});}
 graph.points.forEach((p,i)=>{const sel=[r.s,r.a,r.d].includes(i),g=add(svg,'g',{class:'node',role:'button',tabindex:0,'aria-label':p.label+': '+(up[i]?'working':'unavailable')});
  add(g,'circle',{cx:p.x*280,cy:p.y*280,r:i===0?14:sel?8:5.8,fill:up[i]?'#86b8a8':'#71555f',stroke:sel?'#e5c17b':i===0?'#b798ef':'#171723','stroke-width':sel?2:1.5});
  if(i===0||sel||s.K<=14)add(g,'text',{x:p.x*310,y:i===0?-27:p.y*310+4,fill:sel?'#e5c17b':'#b9b9c9','text-anchor':'middle','font-size':i===0?20:11,'font-family':'system-ui'},p.label);
  const toggle=()=>{up[i]=!up[i];$('stateNote').textContent='Manually edited state; not an unconditional random sample.';render();};g.onclick=toggle;g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}};});
 const names={'source-off':'Source unavailable','destination-off':'Destination unavailable',blocked:'No working route',short:'Short local alternative',hub:'Rerouting through b',excursion:'Long-rim excursion'};
 $('routeKind').textContent=names[r.kind];$('routeText').textContent=r.path.length?`${r.path.map(v=>graph.points[v].label).join(' → ')} · ${r.path.length-1} edges · Euclidean length ${fmt(r.length,4)}. Only the first step is taken after this service; the route is recomputed after subsequent services.`:'No route is taken from this snapshot. An unavailable source cannot complete service; an unavailable destination or missing path causes loss at a routing attempt.';
 $('graphCaption').textContent=`Regular Euclidean family · K = ${s.K} · source module ${s.k}`;$('sizeStat').textContent=`${graph.n+1} / ${graph.edges.length}`;$('meanStat').textContent=fmt(2*graph.edges.length/(graph.n+1),3);$('maxStat').textContent=graph.n;
}
function drawPlot(){const s=get(),svg=$('plot');svg.replaceChildren();const W=860,H=370,l=56,t=30,w=775,h=283,ymax=Math.max(1.7,s.K*s.gamma*(1-s.epsilon)*4/27+25*s.K/(6*s.kappa)+.2),X=q=>l+w*q,Y=y=>t+h*(1-y/ymax),clamp=y=>Math.max(0,Math.min(ymax,y));
 for(let i=0;i<=10;i++){const q=i/10;add(svg,'line',{x1:X(q),y1:t,x2:X(q),y2:t+h,stroke:'#292937','stroke-width':1});add(svg,'text',{x:X(q),y:t+h+20,fill:'#a4a5b7','font-size':11,'text-anchor':'middle'},q.toFixed(1));}
 for(let j=0;j<=4;j++){const y=ymax*j/4;add(svg,'text',{x:l-10,y:Y(y)+4,fill:'#a4a5b7','font-size':11,'text-anchor':'end'},fmt(y,1));}
 const paths=[[],[],[]];for(let i=0;i<=400;i++){const q=.000001+(.999998*i/400),p=M.profiles(s.K,q,s.gamma,s.epsilon,s.kappa);[p.phi,p.lower,p.upper].forEach((y,j)=>paths[j].push([X(q),Y(clamp(y))]));}
 const path=a=>a.map((p,i)=>(i?'L':'M')+p.join(',')).join(' ');
 add(svg,'path',{d:path(paths[2])+' '+path([...paths[1]].reverse()).replace('M','L')+' Z',fill:'#b798ef',opacity:.16});
 for(const j of[1,2])add(svg,'path',{d:path(paths[j]),fill:'none',stroke:'#b798ef','stroke-width':1.5,'stroke-dasharray':'5 4'});
 add(svg,'path',{d:path(paths[0]),fill:'none',stroke:'#70d6d6','stroke-width':3});add(svg,'line',{x1:l,y1:Y(1),x2:l+w,y2:Y(1),stroke:'#e5c17b','stroke-width':1.5,'stroke-dasharray':'7 5'});
 add(svg,'text',{x:l+w-2,y:Y(1)-7,fill:'#e5c17b','font-size':12,'text-anchor':'end'},'capacity 1');
 add(svg,'line',{x1:X(s.q),y1:t,x2:X(s.q),y2:t+h,stroke:'#a4a5b7','stroke-dasharray':'3 5'});const p=M.profiles(s.K,s.q,s.gamma,s.epsilon,s.kappa);add(svg,'circle',{cx:X(s.q),cy:Y(p.phi),r:5,fill:'#70d6d6'});
 M.intervals(s.K).forEach(([a,b],j)=>{add(svg,'rect',{x:X(a),y:t+h+29,width:Math.max(.8,X(b)-X(a)),height:4,fill:j===1?'#b798ef':'#86b8a8'});});
 add(svg,'text',{x:l,y:16,fill:'#a4a5b7','font-size':11},'normalised input (conditional on a recurrent background)');add(svg,'text',{x:l+w,y:t+h+48,fill:'#a4a5b7','font-size':11,'text-anchor':'end'},'availability q');
 $('profileVerdict').textContent=p.lower>1?'Conditional lower bound exceeds capacity':p.upper<1?'Conditional upper bound is below capacity':'The envelopes do not separate capacity';
 list($('profileNumbers'),[['Main profile Φ',fmt(p.phi)],['Excursion bound e',sci(p.exc)],['Finite-speed error',sci(p.error)],['Lower / upper',`${fmt(p.lower)} / ${fmt(p.upper)}`]]);
 $('backgroundNote').textContent=`At this q, the sufficient background budget is ${fmt(p.background)} ${p.background<1?'<':'≥'} 1. A strict budget alone does not certify an arbitrary finite κ.`;
}
function poisson(){const s=get(),r=Math.min(M.delta(s.K)/4,1e-5),lp=M.logOccurrence(s.K,s.lambda,r),svg=$('window');svg.replaceChildren();
 add(svg,'circle',{cx:0,cy:0,r:276,fill:'#12121f',stroke:'#b798ef','stroke-width':1.2,'stroke-dasharray':'5 5'});add(svg,'text',{x:0,y:-293,fill:'#b798ef','text-anchor':'middle','font-size':13},'guard window B(0,3)');
 const ps=graph.points.map(p=>{const a=random()*2*Math.PI,u=r*Math.sqrt(random());return{x:p.x+u*Math.cos(a),y:p.y+u*Math.sin(a)};});
 for(const[u,v]of graph.edges)add(svg,'line',{x1:ps[u].x*92,y1:ps[u].y*92,x2:ps[v].x*92,y2:ps[v].y*92,stroke:'#44435c','stroke-width':.8});
 ps.forEach((p,i)=>{add(svg,'circle',{cx:graph.points[i].x*92,cy:graph.points[i].y*92,r:6,fill:'none',stroke:'#b798ef',opacity:.5});add(svg,'circle',{cx:p.x*92,cy:p.y*92,r:i===0?4:2.2,fill:'#70d6d6'});});
 const mean=s.lambda*Math.PI*(3.75**2-9);let prod=1,N=0,limit=Math.exp(-mean);while(prod>limit){prod*=random();N++;}N=Math.max(0,N-1);
 for(let j=0;j<N;j++){const rr=Math.sqrt(9+random()*(3.75**2-9)),a=2*Math.PI*random();add(svg,'circle',{cx:92*rr*Math.cos(a),cy:92*rr*Math.sin(a),r:2,fill:'#727285'});}
 $('lambdaout').textContent=fmt(s.lambda,1);list($('poissonNumbers'),[['K / prescribed points',`${s.K} / ${graph.n+1}`],['Illustrative radius r',r.toExponential(3)],['log₁₀ pK',fmt(lp/Math.LN10,2)],['Mean trials to first event',`10^${fmt(-lp/Math.LN10,2)}`]]);
}
function render(){const s=get();$('Kout').textContent=s.K;$('qout').textContent=fmt(s.q,4);$('gammaout').textContent=fmt(s.gamma,3);$('epsout').textContent=fmt(s.epsilon,3);$('speedout').textContent=s.kappa.toExponential(2);$('petalout').textContent=s.k;$('intervalNote').textContent=M.intervals(s.K).map((v,j)=>['I₋','I₀','I₊'][j]+` = [${fmt(v[0],5)}, ${fmt(v[1],5)}]`).join('; ')+'. Eventual theorem ranges, not a certificate for every slider speed.';drawNetwork();drawPlot();}
function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('K').oninput=()=>{$('petal').max=+$('K').value-1;$('petal').value=Math.min(+$('petal').value,+$('petal').max);sample();poisson();};$('q').oninput=sample;for(const id of['gamma','eps','speed','petal'])$(id).oninput=render;$('lambda').oninput=poisson;
$('sample').onclick=()=>{resetSeed();sample();};$('seed').onchange=resetSeed;$('poissonSample').onclick=poisson;
for(const b of document.querySelectorAll('[data-case]'))b.onclick=()=>makeCase(b.dataset.case);
for(const b of document.querySelectorAll('[data-interval]'))b.onclick=()=>{const range=M.intervals(get().K)[+b.dataset.interval];$('q').value=(range[0]+range[1])/2;sample();};
function tick(){if(!animated)return;const i=Math.floor(random()*up.length);up[i]=random()<get().q;$('stateNote').textContent='Spin refresh on an independent display clock. Not queue dynamics; display speed is unrelated to κ/μ.';render();timer=setTimeout(tick,Math.min(2000,-500*Math.log(Math.max(random(),1e-10))));}
$('animate').onclick=()=>{animated=!animated;$('animate').textContent=animated?'Pause refresh':'Animate refresh';if(animated)tick();else clearTimeout(timer);};
$('svgExport').onclick=()=>{const clone=$('network').cloneNode(true);clone.setAttribute('xmlns',NS);download(new XMLSerializer().serializeToString(clone),'network-snapshot.svg','image/svg+xml');};
$('jsonExport').onclick=()=>download(JSON.stringify({scope:'Geometric snapshot and conditional flux envelopes; not a stability simulation',parameters:get(),vertices:graph.points,edges:graph.edges,working:up,route:M.route(graph,up,get().k),profiles:M.profiles(get().K,get().q,get().gamma,get().epsilon,get().kappa)},null,2),'network-snapshot.json','application/json');
resetSeed();sample();poisson();window.NetworkDemo={getState:()=>({parameters:get(),graph,up:[...up]}),makeCase};
