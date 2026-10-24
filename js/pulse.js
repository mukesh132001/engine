/* Engine | pulse.js
   Heart rate from the phone camera. */
"use strict";

const PU={stream:null,track:null,raf:0,samples:[],state:"idle",good:[],cb:null,measureMs:0,torch:false};
const PMEAS=30000,FS=30;
const pcv=document.createElement("canvas");pcv.width=40;pcv.height=30;const pcx=pcv.getContext("2d",{willReadFrequently:true});
function today(){return new Date().toLocaleDateString("en-CA")}
function puStatus(m,bad){const e=$("#puStatus");e.textContent=m;e.classList.toggle("bad",!!bad)}
function puButtons(h){$("#puBtns").innerHTML=h}
function openPulse(cb){PU.cb=cb;$("#pulse").classList.remove("hidden");document.body.style.overflow="hidden";puReset()}
function closePulse(){stopCam();$("#pulse").classList.add("hidden");document.body.style.overflow=""}
function puReset(){$("#puBpm").textContent="--";$("#puProg").style.width="0%";drawWave([]);puStatus("Press start, then cover the back camera with your fingertip.");
  puButtons(`<button class="cta" id="puStart">Start</button>`);$("#puStart").onclick=startCam}
$("#puClose").onclick=closePulse;
addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#pulse").classList.contains("hidden"))closePulse()});
async function startCam(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){puStatus("This browser can't use the camera. Try Chrome or Safari on your phone.",true);return}
  puStatus("Opening camera…");puButtons(`<button class="cta alt" id="puStop">Cancel</button>`);$("#puStop").onclick=()=>{stopCam();puReset()};
  try{
    const st=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:320},height:{ideal:240},frameRate:{ideal:30}}});
    PU.stream=st;PU.track=st.getVideoTracks()[0];const v=$("#puVid");v.srcObject=st;try{await v.play()}catch(e){}
    PU.torch=false;try{const c=PU.track.getCapabilities&&PU.track.getCapabilities();if(c&&c.torch){await PU.track.applyConstraints({advanced:[{torch:true}]});PU.torch=true}}catch(e){}
    PU.samples=[];PU.good=[];PU.measureMs=0;PU.state="wait";PU.last=performance.now();PU.lastR=null;PU.lastEst=0;
    puStatus(`Cover the back camera${PU.torch?" and flash":""} with your fingertip.`);
    try{navigator.wakeLock&&navigator.wakeLock.request("screen").then(l=>PU.lock=l).catch(()=>{})}catch(e){}
    puLoop();
  }catch(e){stopCam();puReset();
    puStatus(e&&e.name==="NotAllowedError"?"Camera access was blocked. Allow the camera for this site in your browser settings, then try again.":"Couldn't open the camera here. Open the live site on your phone in Chrome or Safari and try again.",true)}
}
function stopCam(){cancelAnimationFrame(PU.raf);
  if(PU.track&&PU.torch){try{PU.track.applyConstraints({advanced:[{torch:false}]})}catch(e){}}
  if(PU.stream)PU.stream.getTracks().forEach(t=>t.stop());
  try{PU.lock&&PU.lock.release()}catch(e){}PU.lock=null;PU.stream=null;PU.track=null;PU.state="idle";$("#puHeart").style.transform=""}
function puLoop(){
  PU.raf=requestAnimationFrame(puLoop);
  const v=$("#puVid");if(!v||v.readyState<2)return;
  pcx.drawImage(v,0,0,40,30);const d=pcx.getImageData(0,0,40,30).data,n=d.length/4;let r=0,g=0,b=0;
  for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2]}r/=n;g/=n;b/=n;
  if(r===PU.lastR&&g===PU.lastG)return; // same video frame
  PU.lastR=r;PU.lastG=g;const now=performance.now(),dt=now-PU.last;PU.last=now;
  const finger=r>55&&r>g*1.6&&r>b*1.6;
  if(!finger){if(PU.state!=="wait"){PU.state="wait";PU.samples=[]}
    puStatus(`Cover the back camera${PU.torch?" and flash":""} fully with your fingertip.`);drawWave([]);$("#puHeart").style.transform="";return}
  if(PU.state==="wait"){PU.state="settle";PU.settle=now;PU.samples=[];puStatus("Finger found. Hold still…")}
  PU.samples.push({t:now,r,g});while(PU.samples.length&&now-PU.samples[0].t>12000)PU.samples.shift();
  if(PU.state==="settle"&&now-PU.settle>3000)PU.state="measure";
  if(PU.state==="measure")PU.measureMs+=Math.min(dt,120);
  const est=ppgEstimate(PU.samples);drawWave(est.wave);
  if(est.wave.length){let mx=-1e9,mn=1e9;for(const x of est.wave){if(x>mx)mx=x;if(x<mn)mn=x}const k=mx>mn?(est.wave[est.wave.length-1]-mn)/(mx-mn):0;$("#puHeart").style.transform=`scale(${(1+k*.16).toFixed(3)})`}
  if(now-PU.lastEst>500&&est.bpm){PU.lastEst=now;
    if(est.q>.45){$("#puBpm").textContent=Math.round(est.bpm);if(PU.state==="measure"){PU.good.push(est.bpm);puStatus("Measuring… keep still and breathe normally.")}}
    else if(PU.state==="measure")puStatus("The signal is noisy. Press more gently and keep your hand still.")}
  if(PU.state==="measure"){const p=Math.min(1,PU.measureMs/PMEAS);$("#puProg").style.width=(p*100).toFixed(1)+"%";if(p>=1)puFinish()}
}
function ppgEstimate(S0){
  if(S0.length<20)return{q:0,wave:[]};
  const t0=S0[0].t,t1=S0[S0.length-1].t,N=Math.floor((t1-t0)/1000*FS);if(N<FS*3)return{q:0,wave:[]};
  let mr=0;for(const s of S0)mr+=s.r;mr/=S0.length;const useG=mr>248; // red saturated under bright flash
  const x=new Float64Array(N);let j=0;
  for(let i=0;i<N;i++){const t=t0+i*1000/FS;while(j<S0.length-2&&S0[j+1].t<t)j++;const a=S0[j],b=S0[j+1]||a,f=b.t===a.t?0:Math.min(1,Math.max(0,(t-a.t)/(b.t-a.t)));const va=useG?a.g:a.r,vb=useG?b.g:b.r;x[i]=va+(vb-va)*f}
  // remove slow drift (1 s centred mean), then light smoothing; invert so beats point up
  const y=new Float64Array(N),z=new Float64Array(N),hw=Math.round(FS/2),sw=2;
  for(let i=0;i<N;i++){let s=0,c=0;for(let k=Math.max(0,i-hw);k<=Math.min(N-1,i+hw);k++){s+=x[k];c++}y[i]=x[i]-s/c}
  for(let i=0;i<N;i++){let s=0,c=0;for(let k=Math.max(0,i-sw);k<=Math.min(N-1,i+sw);k++){s+=y[k];c++}z[i]=-s/c}
  const wave=Array.from(z.subarray(Math.max(0,N-FS*5)));
  if(N<FS*5)return{q:0,wave};
  const L=Math.min(N,FS*8),seg=z.subarray(N-L);let m=0;for(const v of seg)m+=v;m/=L;let v0=0;for(const v of seg)v0+=(v-m)*(v-m);if(v0<=1e-9)return{q:0,wave};
  const minL=Math.round(FS*60/200),maxL=Math.round(FS*60/40),ac=[];let best=-1,bl=minL;
  for(let l=minL;l<=maxL;l++){let s=0;for(let i=0;i<L-l;i++)s+=(seg[i]-m)*(seg[i+l]-m);const rr=s/v0*(L/(L-l));ac[l]=rr;if(rr>best){best=rr;bl=l}}
  // if a peak near half the lag is nearly as strong, the true beat is the faster one
  for(let l=minL+1;l<maxL;l++){if(ac[l]>=ac[l-1]&&ac[l]>=ac[l+1]&&ac[l]>.85*best){bl=l;best=Math.max(ac[l],.0);break}}
  let lag=bl;if(bl>minL&&bl<maxL){const a=ac[bl-1],b=ac[bl],c=ac[bl+1],den=a-2*b+c;if(den)lag=bl+.5*(a-c)/den}
  return{bpm:60*FS/lag,q:best,wave};
}
function drawWave(w){const c=$("#puWave"),x=c.getContext("2d"),W=c.width,H=c.height;x.clearRect(0,0,W,H);
  const cs=getComputedStyle(document.documentElement);
  x.strokeStyle=cs.getPropertyValue("--line");x.lineWidth=2;x.beginPath();x.moveTo(0,H/2);x.lineTo(W,H/2);x.stroke();
  if(!w||w.length<2)return;let mx=-1e9,mn=1e9;for(const v of w){if(v>mx)mx=v;if(v<mn)mn=v}const rg=mx-mn||1;
  const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,cs.getPropertyValue("--blue"));g.addColorStop(.6,cs.getPropertyValue("--violet"));g.addColorStop(1,cs.getPropertyValue("--red"));
  x.strokeStyle=g;x.lineWidth=6;x.lineJoin="round";x.lineCap="round";x.beginPath();
  w.forEach((v,i)=>{const px=i/(w.length-1)*W,py=H-14-(v-mn)/rg*(H-28);i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke()}
function puFinish(){const g=PU.good.slice().sort((a,b)=>a-b);stopCam();$("#puProg").style.width="100%";
  if(g.length<10){$("#puBpm").textContent="--";puStatus("Couldn't get a steady reading. Rest your fingertip lightly over the lens, keep still, and try again.",true);
    puButtons(`<button class="cta" id="puAgain">Try again</button>`);$("#puAgain").onclick=()=>{puReset();startCam()};return}
  const k=Math.floor(g.length*.2),core=g.slice(k,g.length-k),bpm=Math.round(core.reduce((a,b)=>a+b,0)/core.length),spread=core[core.length-1]-core[0];
  $("#puBpm").textContent=bpm;$("#puHeart").style.transform="";
  puStatus(spread<6?"Steady reading. Nice.":spread<12?"Fair reading. A second try can confirm it.":"Noisy reading. Worth trying again while sitting very still.",spread>=12);
  puButtons(`<button class="cta" id="puUse">Use ${bpm} bpm</button><button class="cta alt" id="puAgain">Try again</button>`);
  $("#puUse").onclick=()=>{const cb=PU.cb;closePulse();cb&&cb(bpm)};$("#puAgain").onclick=()=>{puReset();startCam()};
}
function sparkline(L){const w=320,h=80,vs=L.map(l=>l.v),mn=Math.min(...vs)-2,mx=Math.max(...vs)+2;
  const pts=L.map((l,i)=>`${(8+i/(L.length-1)*(w-16)).toFixed(1)},${(h-8-(l.v-mn)/(mx-mn)*(h-16)).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;margin-bottom:6px" role="img" aria-label="Resting heart rate trend"><polyline points="${pts}" fill="none" stroke="var(--red)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg>`}
function renderPulseTab(){const el=$('[data-panel="pulse"]'),L=S.rhrLog||[],last=L[L.length-1],first=L[0];let trend="";
  if(L.length>1){const dl=last.v-first.v;trend=dl<0?`Down ${-dl} bpm since your first check. A falling resting heart rate is one of the clearest signs your engine is growing.`:dl>0?`Up ${dl} bpm since your first check. Poor sleep, stress, illness, or a hard week can push it up. Watch the trend, not one morning.`:`Same as your first check. Give it a few weeks.`}
  el.innerHTML=`<h2 style="margin-bottom:10px">Pulse check</h2><p class="soft">No watch needed. Your phone camera reads your pulse through your fingertip. Check your resting heart rate each morning; over weeks, the trend shows how your engine is changing.</p>
  <div class="two"><div class="glass"><div class="soft" style="font-size:14px">Latest resting heart rate</div>
    <div style="font-family:var(--display);font-size:76px;font-weight:800;line-height:1;letter-spacing:-.035em">${last?last.v:"--"}<span style="font-size:20px;font-weight:500;color:var(--soft)"> bpm</span></div>
    ${last?`<p class="soft" style="font-size:14px;margin-top:6px">${last.d}</p>`:""}
    <button class="cta" id="puOpen" style="margin-top:14px">Check my pulse</button>${trend?`<p style="margin-top:16px;font-size:15.5px">${trend}</p>`:""}</div>
  <div class="glass"><h3 style="margin-bottom:10px">History</h3>${L.length>1?sparkline(L):""}<ul class="log">${L.slice().reverse().slice(0,10).map(l=>`<li><span>${l.d}</span><b>${l.v} bpm</b></li>`).join("")||`<li><span class="soft">No checks yet</span></li>`}</ul></div></div>`;
  $("#puOpen").onclick=()=>openPulse(b=>{const d=today();S.rhrLog=(S.rhrLog||[]).filter(x=>x.d!==d);S.rhrLog.push({d,v:b});S.rhrLog.sort((a,c)=>a.d<c.d?-1:1);save();renderPulseTab();toast(`Saved: ${b} bpm`)})}
