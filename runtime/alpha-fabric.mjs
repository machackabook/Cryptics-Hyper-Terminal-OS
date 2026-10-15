// Nexus α-Fabric v1 — local CPU math, no network/sensors/physical holographic propagation.
// Do not conflate alphaOpacity, alphaTransmission, and lambdaReg.
const finite=(x)=>{if(typeof x!=='number'||!Number.isFinite(x))throw TypeError('finite scalar required');return x;};
const unit=x=>{finite(x);if(x<0||x>1)throw RangeError('alpha must be in [0,1]');return x;};
export const softThreshold=(x,cutoff)=>{finite(x);finite(cutoff);if(cutoff<0)throw RangeError('cutoff');return Math.sign(x)*Math.max(0,Math.abs(x)-cutoff);};
export function alphaComposite(fg,bg,alphaOpacity){
 const a=unit(alphaOpacity);
 if(!Array.isArray(fg)||!Array.isArray(bg)||fg.length!==3||bg.length!==3)throw TypeError('RGB expected');
 return fg.map((v,i)=>unit(v)*a+unit(bg[i])*(1-a));
}
export function complexWave(amplitude,phaseRadians,alphaTransmission=1){
 finite(amplitude);finite(phaseRadians);const a=unit(alphaTransmission);
 if(amplitude<0)throw RangeError('amplitude');
 return {real:amplitude*a*Math.cos(phaseRadians),imag:amplitude*a*Math.sin(phaseRadians)};
}
export function sparseIsta(A,y,lambdaReg,{iterations=150}={}){
 finite(lambdaReg);if(lambdaReg<0)throw RangeError('regularization');
 if(!Number.isInteger(iterations)||iterations<1||iterations>5000)throw RangeError('iterations');
 if(!Array.isArray(A)||!A.length||!Array.isArray(A[0])||!A[0].length||A.length>500||A[0].length>500)throw RangeError('A matrix');
 const m=A.length,n=A[0].length;
 if(!Array.isArray(y)||y.length!==m||m*n*iterations>5e6)throw RangeError('ISTA dimensions/budget');
 let norm2=0;
 for(let i=0;i<m;i++){
  if(!Array.isArray(A[i])||A[i].length!==n)throw RangeError('ragged A');
  finite(y[i]);for(const v of A[i]){finite(v);norm2+=v*v;}
 }
 if(norm2<=0)throw RangeError('A zero');
 const step=1/norm2,x=Array(n).fill(0);
 for(let k=0;k<iterations;k++){
  const residual=A.map((row,i)=>row.reduce((sum,v,j)=>sum+v*x[j],0)-y[i]);
  const gradient=Array(n).fill(0);
  A.forEach((row,i)=>row.forEach((v,j)=>gradient[j]+=v*residual[i]));
  for(let j=0;j<n;j++)x[j]=softThreshold(x[j]-step*gradient[j],step*lambdaReg);
 }
 const error=A.reduce((total,row,i)=>total+(row.reduce((sum,v,j)=>sum+v*x[j],0)-y[i])**2,0);
 return {coefficients:x,objective:0.5*error+lambdaReg*x.reduce((s,v)=>s+Math.abs(v),0),iterations,algorithm:'ISTA_PSI_IDENTITY'};
}
export function kompressor(samples,bits=8){
 if(!Array.isArray(samples)||samples.length>2e6||!Number.isInteger(bits)||bits<1||bits>16)throw RangeError('samples/bits');
 const max=2**bits-1,q=samples.map(x=>Math.round(unit(x)*max));
 const mse=samples.length?samples.reduce((s,x,i)=>s+(x-q[i]/max)**2,0)/samples.length:0;
 return {quantized:q,bits,mse,codec:'UNIFORM_LOSSY_SCALAR'};
}
export function tensalltensions(grid){
 if(!Array.isArray(grid)||!grid.length||!Array.isArray(grid[0])||!grid[0].length||grid.length>1024||grid[0].length>1024)throw RangeError('grid');
 const h=grid.length,w=grid[0].length;
 if(h*w>250000)throw RangeError('pixel budget');
 grid.forEach(row=>{if(!Array.isArray(row)||row.length!==w)throw RangeError('ragged');row.forEach(finite);});
 let maxEdgeLoad=0;
 const field=grid.map((row,y)=>row.map((v,x)=>{
  const dx=x+1<w?grid[y][x+1]-v:0,dy=y+1<h?grid[y+1][x]-v:0;
  const edge=Math.hypot(dx,dy);maxEdgeLoad=Math.max(maxEdgeLoad,edge);return edge;
 }));
 return {field,maxEdgeLoad,meaning:'gradient diagnostic, not physical tension'};
}
export function hatchetchopman(coefficients,{tileSize=64,epsilon=1e-3}={}){
 if(!Array.isArray(coefficients)||coefficients.length>2e6||!Number.isInteger(tileSize)||tileSize<1||tileSize>4096||finite(epsilon)<0)throw RangeError('tile/pruning input');
 coefficients.forEach(finite);
 const tiles=[];let removed=0;
 for(let i=0;i<coefficients.length;i+=tileSize){
  const values=coefficients.slice(i,i+tileSize).map(v=>{if(Math.abs(v)<=epsilon){removed++;return 0;}return v;});
  tiles.push({start:i,coefficients:values});
 }
 return {tiles,removed,kept:coefficients.length-removed,strategy:'hard_threshold_tile'};
}
