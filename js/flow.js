/* Engine | flow.js
   Onboarding steps 1 to 4, and the result reveal. */
"use strict";

function show(id){["intro","flow","dash"].forEach(v=>$("#"+v).classList.toggle("hidden",v!==id));$("#restartBtn").classList.toggle("hidden",id!=="dash");scrollTo(0,0)}
function step(n){$$(".step").forEach(s=>s.classList.toggle("hidden",+s.dataset.step!==n));$$(".stepper span").forEach((s,i)=>s.classList.toggle("on",i<n));
  if(n===2)renderLeaks(); if(n===3)renderGoal(); if(n===4)renderWeekSetup(); scrollTo(0,0)}
$("#startBtn").onclick=()=>{show("flow");step(1)};
$("#homeBtn").onclick=()=>{S.start?(show("dash"),tab("engine")):show("intro")};
$("#restartBtn").onclick=()=>{if(confirm("Start over? This clears your results, plan, and progress on this device.")){S=fresh();save();initStep1();show("intro")}};
$$("[data-back]").forEach(b=>b.onclick=()=>step(+b.dataset.back));

/* step 1 */
function seg(el,val,cb){$$(el+" button").forEach(b=>{b.setAttribute("aria-pressed",b.dataset.v===val);b.onclick=()=>{$$(el+" button").forEach(x=>x.setAttribute("aria-pressed",x===b));cb(b.dataset.v)}})}
function initStep1(){
  seg("#sexSeg",S.sex,v=>{S.sex=v});
  seg("#unitSeg",S.unit,v=>{S.unit=v;renderFields()});
  $("#age").value=S.age||"";
  $("#methods").innerHTML=Object.entries(METHODS).map(([k,m])=>`<button class="method" data-m="${k}" aria-pressed="${k===S.method}"><b>${m.name}</b><small>${m.tag}</small></button>`).join("");
  $$(".method").forEach(b=>b.onclick=()=>{S.method=b.dataset.m;S.inputs={};$$(".method").forEach(x=>x.setAttribute("aria-pressed",x===b));renderFields()});
  renderFields();
  if(S.vo2)showResult();else{$("#resultBox").classList.add("hidden");$("#next1").classList.add("hidden")}
}
function fld(id,label,ph,w){return `<div class="field" style="max-width:${w||180}px"><label for="f_${id}">${label}</label><input id="f_${id}" data-k="${id}" type="number" inputmode="decimal" step="any" placeholder="${ph}" value="${S.inputs[id]??""}"></div>`}
function renderFields(){
  const imp=S.unit==="imperial",m=S.method;$("#howto").textContent=METHODS[m].how;let h="";
  if(m==="quick")h=fld("waist",`Waist (${imp?"inches":"cm"})`,imp?"34":"86",150)+fld("rhr","Resting heart rate (bpm)","64",200)+`<div class="field" style="flex:0 0 auto"><label>&nbsp;</label><button class="cta alt" id="camRhr" type="button" style="padding:11px 20px;font-size:16px">Measure with camera</button></div>`+Object.entries(PAQ).map(([k,[q,o]])=>{if(S.inputs[k]==null)S.inputs[k]=o[0][0];return `<div class="field" style="min-width:200px"><label for="f_${k}">${q}</label><select id="f_${k}" data-k="${k}">${o.map(([v,l])=>`<option value="${v}" ${String(S.inputs[k])===v?"selected":""}>${l}</option>`).join("")}</select></div>`}).join("");
  if(m==="cooper")h=fld("dist",`Distance (${imp?"miles":"km"})`,imp?"1.5":"2.4");
  if(m==="mile15")h=fld("min","Minutes","12",120)+fld("sec","Seconds","30",120);
  if(m==="walk")h=fld("wt",`Weight (${imp?"lb":"kg"})`,imp?"165":"75",150)+fld("min","Minutes","15",120)+fld("sec","Seconds","0",120)+fld("hr","Heart rate at finish (bpm)","130",220);
  if(m==="rhr")h=fld("rhr","Resting heart rate (bpm)","62",220)+`<div class="field" style="flex:0 0 auto"><label>&nbsp;</label><button class="cta alt" id="camRhr" type="button" style="padding:11px 20px;font-size:16px">Measure with camera</button></div>`;
  if(m==="known")h=fld("vo2","VO2 max (ml/kg/min)","42",220);
  $("#methodFields").innerHTML=h;
  $$("#methodFields input").forEach(i=>i.oninput=()=>{S.inputs[i.dataset.k]=i.value});
  $$("#methodFields select").forEach(i=>i.onchange=()=>{S.inputs[i.dataset.k]=i.value});
  const cb=$("#camRhr");if(cb)cb.onclick=()=>openPulse(b=>{S.inputs.rhr=String(b);const f=$("#f_rhr");if(f)f.value=b;toast(`Resting heart rate: ${b} bpm`)});
}
$("#calcBtn").onclick=()=>{
  const e=$("#err1");e.textContent="";
  S.age=+$("#age").value;
  if(!S.sex){e.textContent="Choose female or male so we can compare you with the right norms.";return}
  if(!S.age||S.age<16||S.age>90){e.textContent="Enter an age between 16 and 90.";return}
  let v;try{v=calcVO2()}catch(m){e.textContent=m;return}
  if(!isFinite(v)||v<12||v>90){e.textContent="That result is outside the realistic range (12 to 90). Double-check your numbers.";return}
  S.vo2=r1(v);S.target=null;save();showResult();setHeat();reveal();
};
function showResult(){
  const v=S.vo2,ri=ratingIdx(v),p=Math.round(pct(v)),fa=fitAge(v),diff=fa-S.age;
  const young=S.age<20?`<p class="soft" style="font-size:14px">Norms start at age 20, so you're compared with 20 to 29 year olds.</p>`:"";
  $("#resultBox").innerHTML=`<div><div class="bignum">${v.toFixed(1)}</div><div class="unit">ml of oxygen per kg per minute</div></div>
  <div><h3>${RATINGS[ri]} for your age</h3><p class="soft" style="margin-top:6px">Better than about ${p}% of ${S.sex==="m"?"men":"women"} your age.</p>
  <div class="track"><i style="left:0%"></i></div><div class="track-labels"><span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span><span>Superior</span></div>
  ${S.method==="quick"?`<div class="callout" style="margin:14px 0 0;font-size:14.5px">Quick estimate. When you are ready, a 12-minute run or 1-mile walk gives you a sharper number.</div>`:""}<div class="facts"><div><b>${fa}</b><span>Engine age${diff===0?", right on your age":diff<0?`, ${-diff} years younger`:`, ${diff} years older`}</span></div><div><b>${hrMax()}</b><span>Estimated max heart rate</span></div></div>${young}</div>`;
  $("#resultBox").classList.remove("hidden");$("#next1").classList.remove("hidden");
  requestAnimationFrame(()=>requestAnimationFrame(()=>{$("#resultBox .track i").style.left=clamp(p,1,99)+"%"}));
  countUp($("#resultBox .bignum"),v);
}
function countUp(el,to,D=1400){if(!el)return;if(reduce){el.textContent=to.toFixed(1);return}const t0=performance.now();el.textContent="0.0";(function f(n){const k=Math.min(1,(n-t0)/D),e=1-Math.pow(1-k,3);el.textContent=(to*e).toFixed(1);if(k<1)requestAnimationFrame(f)})(t0)}
let RVT=[];
function engineLine(fa){const d=fa-S.age;return d<0?`Your engine is ${-d} year${d===-1?"":"s"} younger than you.`:d>0?`Your engine is ${d} year${d===1?"":"s"} older than you. That's the gap we close.`:`Your engine matches your age. Time to pull ahead.`}
function reveal(){const v=S.vo2,el=$("#reveal");
  $("#rvNum").textContent="0.0";$("#rvRate").textContent=`${RATINGS[ratingIdx(v)]} for ${S.sex==="m"?"men":"women"} your age`;
  $("#rvAge").textContent=engineLine(fitAge(v));$("#rvNote").textContent=S.method==="quick"?"Quick estimate. A real test later will sharpen it.":"";
  RVT.forEach(clearTimeout);el.className="reveal";void el.offsetWidth;el.classList.add("on");document.body.style.overflow="hidden";heatTarget=1;
  if(reduce){$("#rvNum").textContent=v.toFixed(1);el.classList.add("s1","s2","s3");draw();$("#rvGo").focus();return}
  countUp($("#rvNum"),v,1900);
  RVT=[setTimeout(()=>el.classList.add("s1"),2000),setTimeout(()=>el.classList.add("s2"),2900),setTimeout(()=>{el.classList.add("s3");$("#rvGo").focus()},3800)];
}
function closeReveal(){RVT.forEach(clearTimeout);$("#reveal").className="reveal hidden";document.body.style.overflow="";setHeat();const r=$("#resultBox");r&&r.scrollIntoView({behavior:reduce?"auto":"smooth",block:"center"})}
$("#rvGo").onclick=closeReveal;
addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#reveal").classList.contains("hidden"))closeReveal()});
$("#next1").onclick=()=>step(2);

/* step 2 */
function renderLeaks(){
  $("#questions").innerHTML=HABITS.map(h=>`<div class="q"><p>${h.q}</p><div class="chips">${h.o.map((o,i)=>`<button class="chip" data-h="${h.id}" data-i="${i}" aria-pressed="${S.habits[h.id]===i}">${o[0]}</button>`).join("")}</div></div>`).join("");
  $$("#questions .chip").forEach(c=>c.onclick=()=>{S.habits[c.dataset.h]=+c.dataset.i;$$(`#questions .chip[data-h="${c.dataset.h}"]`).forEach(x=>x.setAttribute("aria-pressed",x===c));save();updLeaks()});
  updLeaks();
}
function leakItems(){return HABITS.map(h=>{const a=S.habits[h.id];return a==null?null:{h,pts:h.o[a][1]}}).filter(x=>x&&x.pts>0).sort((a,b)=>b.pts-a.pts)}
function updLeaks(){
  const e=Math.round(eff()*100);$("#effNum").textContent=e;$("#effBar").style.width=e+"%";
  const L=leakItems(),box=$("#leakList");
  if(!L.length){box.classList.add("hidden");return}
  box.classList.remove("hidden");
  box.innerHTML=`<h3 style="margin-bottom:6px">Your biggest leaks</h3><p class="soft" style="font-size:15px">These estimates show where your effort is going to waste. Fix the top one first.</p>`+
    L.map(x=>`<div class="leak"><strong>${x.h.name}</strong><div class="lbar" style="width:${x.pts/15*100}%"></div><p>${x.h.fix}</p></div>`).join("");
}
$("#next2").onclick=()=>step(3);

/* step 3 */
function renderGoal(){
  const C=ceiling(),min=r1(S.vo2+.5),max=r1(C-.2),c=cuts();
  let def=[c.f,c.g,c.e,c.s].find(t=>t>S.vo2+.4&&t<max);if(!def)def=S.vo2+(C-S.vo2)*.5;
  if(S.target==null||S.target<min||S.target>max)S.target=r1(def);
  const r=$("#tgt");r.min=min;r.max=max;r.value=S.target;$("#tgtMin").textContent=min.toFixed(1);$("#tgtMax").textContent=max.toFixed(1)+" (realistic ceiling for now)";
  r.oninput=()=>{S.target=+r.value;updGoal()};updGoal();
}
function fmtW(w){if(!isFinite(w))return"—";if(w<=1)return"1 wk";return w+" wks"}
function updGoal(){
  const T=S.target;$("#tgtNum").textContent=T.toFixed(1);$("#tgtRating").textContent=RATINGS[ratingIdx(T)]+" for your age, engine age "+fitAge(T);
  $("#paces").innerHTML=Object.entries(PACE).map(([k,p])=>{const w=weeksTo(T,k);const mo=isFinite(w)?` (about ${Math.max(1,Math.round(w/4.3))} mo)`:"";return `<button class="pace" data-p="${k}" aria-pressed="${S.pace===k}"><b>${p.name}</b><div class="wk">${fmtW(w)}</div><small>${mo.trim()||""}</small><small style="margin-top:8px">${p.note}</small></button>`}).join("");
  $$(".pace").forEach(b=>b.onclick=()=>{S.pace=b.dataset.p;save();updGoal()});
  const now=weeksTo(T,S.pace),ideal=weeksTo(T,S.pace,1),saved=now-ideal;
  $("#leakSave").innerHTML=saved>0?`Fixing your leaks could get you there about <b>${saved} weeks sooner</b> at the ${PACE[S.pace].name.toLowerCase()} pace.`:`No leaks slowing you down. Your habits are working for you.`;
  save();
}
$("#next3").onclick=()=>step(4);

/* step 4 */
function chips(el,opts,cur,cb){$(el).innerHTML=opts.map(([v,l])=>`<button class="chip" data-v="${v}" aria-pressed="${String(cur)===String(v)}">${l}</button>`).join("");$$(el+" .chip").forEach(c=>c.onclick=()=>{$$(el+" .chip").forEach(x=>x.setAttribute("aria-pressed",x===c));cb(c.dataset.v);save()})}
function renderWeekSetup(){
  chips("#sportChips",Object.entries(SPORTS).map(([k,v])=>[k,v.name]),S.sport||"general",v=>{S.sport=v;$("#sportLine").textContent=SPORTS[v].line});$("#sportLine").textContent=SPORTS[S.sport||"general"].line;
  chips("#daysChips",[3,4,5,6,7].map(d=>[d,d+" days"]),S.days,v=>S.days=+v);
  chips("#modeChips",Object.entries(MODELABEL),S.mode,v=>S.mode=v);
  chips("#gymChips",[["gym","Gym with weights"],["home","At home, no equipment"]],S.gym,v=>S.gym=v);
}
$("#buildBtn").onclick=()=>{if(!S.start)S.start=new Date().toISOString().slice(0,10);if(!S.log.length)S.log=[{d:S.start,v:S.vo2}];save();show("dash");renderDash();tab("engine")};
