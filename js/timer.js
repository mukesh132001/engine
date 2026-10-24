/* Engine | timer.js
   Interval workout timer with audio cues. */
"use strict";

const WORKOUTS={"4x4":"Norwegian 4×4","intro2":"Intro: 4 × 2 min","intro3":"Intro: 4 × 3 min","reload":"Easy intervals: 3 × 4 min","302010-2":"30-20-10: 2 blocks","302010-3":"30-20-10: 3 blocks","302010-4":"30-20-10: 4 blocks","z2-30":"Zone 2: 30 min","z2-45":"Zone 2: 45 min"};
const KCOL={easy:"var(--blue)",steady:"var(--violet)",hard:"var(--red)",warm:"var(--peach)"};
function buildTimerOptions(){const s=$("#wSel"),cur=s.value;s.innerHTML=Object.entries(WORKOUTS).map(([k,n])=>`<option value="${k}">${n}</option>`).join("");if(cur)s.value=cur;loadWorkout()}
function phases(key,warm){const P=[];const W=()=>warm&&P.push({l:"Warm up",s:300,k:"warm"});const C=()=>warm&&P.push({l:"Cool down",s:300,k:"warm"});
  W();
  if(key==="4x4"||key.startsWith("intro")||key==="reload"){const reps=key==="reload"?3:4,work=key==="intro2"?120:key==="intro3"?180:240;for(let i=0;i<reps;i++){P.push({l:`Hard ${i+1}/${reps}`,s:work,k:"hard"});if(i<reps-1)P.push({l:"Easy",s:180,k:"easy"})}}
  else if(key.startsWith("302010")){const b=+key.split("-")[1];for(let j=0;j<b;j++){for(let i=0;i<5;i++){P.push({l:`Easy, block ${j+1}`,s:30,k:"easy"},{l:"Steady",s:20,k:"steady"},{l:"All out",s:10,k:"hard"})}if(j<b-1)P.push({l:"Recover",s:150,k:"easy"})}}
  else if(key.startsWith("z2")){const m=+key.split("-")[1];P.length=0;P.push({l:"Zone 2",s:m*60,k:"easy"});return P}
  C();return P}
let T={P:[],i:0,left:0,end:0,run:false,id:null},actx=null,lock=null;
function loadWorkout(){stopT();T.P=phases($("#wSel").value,$("#wWarm").checked);T.i=0;T.left=T.P[0].s;const tot=T.P.reduce((a,p)=>a+p.s,0);
  $("#seq").innerHTML=T.P.map(p=>`<i style="flex:${p.s};background:${KCOL[p.k]}"></i>`).join("");$("#wTotal").textContent=`Total ${Math.round(tot/60)} min`;paint()}
$("#wSel").onchange=loadWorkout;$("#wWarm").onchange=loadWorkout;
function fmt(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function paint(){const p=T.P[T.i];if(!p){$("#tPh").textContent="Done";$("#tT").textContent="0:00";$("#tNx").textContent="Great work. Tick it off in your plan.";$("#tArc").style.strokeDashoffset=0;$("#tGlow").style.background="var(--violet)";return}
  $("#tPh").textContent=p.l;$("#tT").textContent=fmt(T.left);const nx=T.P[T.i+1];$("#tNx").textContent=nx?`Next: ${nx.l} ${fmt(nx.s)}`:"Last one";
  $("#tArc").style.strokeDashoffset=565.5*(1-T.left/p.s);$("#tArc").style.stroke=KCOL[p.k];$("#tGlow").style.background=KCOL[p.k]}
function beep(f,d){if(!$("#wSound").checked)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=f;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(.25,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+d);o.start();o.stop(actx.currentTime+d)}catch(e){}}
let lastSec=null;
function tick(){T.left=(T.end-Date.now())/1000;const sec=Math.ceil(T.left);
  if(sec<=3&&sec>0&&sec!==lastSec)beep(660,.12);lastSec=sec;
  if(T.left<=0){T.i++;if(T.i>=T.P.length){stopT();beep(988,.6);paint();return}T.left=T.P[T.i].s;T.end=Date.now()+T.left*1000;beep(T.P[T.i].k==="hard"?1046:523,.35)}
  paint()}
function startT(){if(T.i>=T.P.length)loadWorkout();T.end=Date.now()+T.left*1000;T.run=true;T.id=setInterval(tick,200);$("#tStart").textContent="Pause";beep(784,.2);
  try{navigator.wakeLock&&navigator.wakeLock.request("screen").then(l=>lock=l).catch(()=>{})}catch(e){}}
function stopT(){clearInterval(T.id);T.run=false;$("#tStart").textContent="Start";try{lock&&lock.release();lock=null}catch(e){}}
$("#tStart").onclick=()=>T.run?(stopT(),paint()):startT();
$("#tSkip").onclick=()=>{if(T.i<T.P.length){T.i++;T.left=T.P[T.i]?T.P[T.i].s:0;T.end=Date.now()+T.left*1000;if(T.i>=T.P.length)stopT();paint()}};
$("#tReset").onclick=loadWorkout;
