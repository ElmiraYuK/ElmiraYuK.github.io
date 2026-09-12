/* Network Stability: deterministic geometry and conditional profiles.
   Numerical visualisation only; no claim of formal or stochastic verification. */
(function(root){
'use strict';
function rng(seed){let x=seed>>>0;return function(){x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function wheel(K){
 if(!Number.isInteger(K)||K<3||K>200)throw Error('K must be an integer between 3 and 200.');
 const n=3*K,points=[{x:0,y:0,label:'b',type:'PS'}];
 for(let j=0;j<n;j++){const a=-Math.PI/2+2*Math.PI*j/n;points.push({x:Math.cos(a),y:Math.sin(a),label:['s','a','d'][j%3]+Math.floor(j/3),type:j%3===1?'IS':'PS'});}
 const edges=[];for(let j=1;j<=n;j++){edges.push([0,j]);edges.push([j,j===n?1:j+1]);}
 const adj=points.map(()=>[]);for(const[u,v]of edges){const w=Math.hypot(points[u].x-points[v].x,points[u].y-points[v].y);adj[u].push([v,w]);adj[v].push([u,w]);}
 return{K,n,points,edges,adj};
}
function shortest(graph,up,s,t){
 if(up.length!==graph.points.length)throw Error('State size does not match graph.');
 if(!up[s]||!up[t])return[];
 const d=graph.points.map(()=>Infinity),prev=graph.points.map(()=>-1),seen=new Set();d[s]=0;
 for(let i=0;i<d.length;i++){let u=-1;for(let j=0;j<d.length;j++)if(!seen.has(j)&&(u<0||d[j]<d[u]))u=j;
  if(u<0||!Number.isFinite(d[u]))break;if(u===t)break;seen.add(u);
  for(const[v,w]of graph.adj[u])if(up[v]&&!seen.has(v)&&d[u]+w<d[v]-1e-12){d[v]=d[u]+w;prev[v]=u;}
 }
 if(!Number.isFinite(d[t]))return[];const path=[];for(let v=t;v!==-1;v=prev[v]){path.push(v);if(v===s)break;}
 return path.reverse();
}
function route(graph,up,k){
 if(!Number.isInteger(k)||k<0||k>=graph.K)throw Error('Invalid module.');
 const s=3*k+1,a=s+1,d=s+2,path=shortest(graph,up,s,d);
 let kind=!up[s]?'source-off':!up[d]?'destination-off':path.length===0?'blocked':path[1]===a?'short':path[1]===0?'hub':'excursion';
 const length=path.slice(1).reduce((z,v,i)=>z+Math.hypot(graph.points[v].x-graph.points[path[i]].x,graph.points[v].y-graph.points[path[i]].y),0);
 return{path,kind,length,s,a,d};
}
function profiles(K,q,gamma,epsilon,kappa){
 if(!(q>0&&q<1&&gamma>0&&epsilon>=0&&epsilon<1&&kappa>0))throw Error('Invalid parameters.');
 const A=K*gamma*(1-epsilon),pb=q*q*(1-q),pe=Math.pow(q,3*K-2)*(1-q)**2;
 const phi=A*pb,exc=K*pe,error=25*K/(6*kappa);
 return{A,pb,pe,phi,exc,error,lower:phi-error,upper:phi+exc+error,background:gamma+exc/(1-q)};
}
function intervals(K){return[[1/(4*Math.sqrt(K)),1/(2*Math.sqrt(K))],[.6,.7],[1-1/(100*K),1-1/(200*K)]];}
function delta(K){const n=3*K,w=Math.PI/n,s=Math.sin(w),G=4*Math.sin(2*w)*s*s;
 return Math.min(.05,G/160,(2-4*s)/16,(2*(n-2)*s-2)/(4*n),s/(2*(n+1)));}
function logOccurrence(K,lambda,r){if(!(lambda>0&&r>0))throw Error('Positive intensity and radius required.');return(3*K+1)*Math.log(lambda*Math.PI*r*r)-9*lambda*Math.PI;}
const api={rng,wheel,shortest,route,profiles,intervals,delta,logOccurrence};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NetworkMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
