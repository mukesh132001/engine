/* Engine | dashboard.js
   Dashboard tabs: My engine and the 12-week plan. */
"use strict";

function tab(id){$$(".tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===id));$$("[data-panel]").forEach(p=>p.classList.toggle("hidden",p.dataset.panel!==id));if(id==="progress")renderProgress();if(id==="pulse")renderPulseTab()}
$$(".tabs button").forEach(b=>b.onclick=()=>tab(b.dataset.tab));
function curWeek(){if(!S.start)return 1;const d=(Date.now()-new Date(S.start+"T00:00:00").getTime())/864e5;return clamp(Math.floor(d/7)+1,1,12)}
function renderDash(){renderEngine();renderPlan();buildTimerOptions();setHeat()}
function renderEngine(){
  const v=S.vo2,fa=fitAge(v),w=weeksTo(S.target,S.pace),L=leakItems();
  const latest=S.log.length?S.log[S.log.length-1].v:v;
  $('[data-panel="engine"]').innerHTML=`
  <div class="card"><div class="cg"></div>
    <div class="ctop"><span>Engine${SPORTS[S.sport||"general"].tag?" "+SPORTS[S.sport||"general"].tag:""}</span><span style="font-weight:500;font-size:14px;opacity:.85">${RATINGS[ratingIdx(latest)]} for age ${S.age}</span></div>
    <div class="cn">${latest.toFixed(1)}</div><div style="opacity:.85;margin-top:8px">VO2 max, ml/kg/min</div>
    <div class="cgrid"><div><b>${fitAge(latest)}</b><span>Engine age (real age ${S.age})</span></div><div><b>${S.target.toFixed(1)}</b><span>${latest>=S.target?"Target reached. Set a new one with Edit my answers.":`Target, ${fmtW(w)} at a ${PACE[S.pace].name.toLowerCase()} pace`}</span></div><div><b>${Math.round(eff()*100)}%</b><span>Engine efficiency</span></div></div>
  </div>
  <div class="row" style="margin-top:14px;gap:10px"><button class="cta" id="shareBtn">Share my card</button>${ciWeek()?`<button class="cta alt" id="goCi">Week ${ciWeek()} check-in</button>`:""}</div><p class="soft" style="font-size:14px;margin-top:8px" id="shareNote">Makes a 1080×1920 image for Instagram or TikTok stories.</p>
  <div class="two">
    <div class="glass"><h3 style="margin-bottom:10px">Your heart rate zones</h3><div class="zones">
      <div><span>Zone 2, easy</span><b>${Math.round(hrMax()*.6)}–${Math.round(hrMax()*.7)} bpm</b></div>
      <div><span>4×4 hard reps</span><b>${Math.round(hrMax()*.85)}–${Math.round(hrMax()*.95)} bpm</b></div>
      <div><span>Estimated max</span><b>${hrMax()} bpm</b></div></div>
      <p class="soft" style="font-size:14px;margin-top:10px">No heart rate monitor? Zone 2 means you can talk in full sentences. Hard reps mean only a few words at a time.</p></div>
    <div class="glass"><h3 style="margin-bottom:10px">${L.length?"Fix this first":"Your habits"}</h3>
      ${L.length?`<p><b>${L[0].h.name}.</b> ${L[0].h.fix}</p>${L.length>1?`<p class="soft" style="font-size:15px">Then: ${L.slice(1,3).map(x=>x.h.name.toLowerCase()).join(", ")}.</p>`:""}`:`<p>No leaks found. Keep sleeping well, keep the hard day hard and the easy days easy.</p>`}
      <button class="mini" id="editBtn" style="margin-top:6px">Edit my answers</button></div>
  </div>`;
  $('[data-panel="engine"]').insertAdjacentHTML("beforeend",challengeHTML());bindChallenge();
  $("#editBtn").onclick=()=>{show("flow");initStep1();step(1)};
  $("#shareBtn").onclick=()=>openStudio("result");const g=$("#goCi");if(g)g.onclick=()=>{tab("plan");scrollTo(0,0)};
}
function renderPlan(){
  const P=buildPlan(),cw=curWeek();
  $('[data-panel="plan"]').innerHTML=`<h2 style="margin-bottom:10px">Your 12 weeks</h2><p class="soft">${S.sport&&S.sport!=="general"?SPORTS[S.sport].line+" ":""}${S.days} days a week, ${MODELABEL[S.mode].toLowerCase()}, ${PACE[S.pace].name.toLowerCase()} pace. Weeks 4 and 8 are lighter on purpose so your body can absorb the work. Tick sessions off as you go.</p>`+checkinHTML()+
  P.map(W=>{const n=W.days.filter((_,i)=>S.done[`w${W.w}d${i}`]).length;return `<div class="week"><button aria-expanded="${W.w===cw}" data-w="${W.w}"><div><h3>Week ${W.w}${W.w===cw?" (this week)":""}</h3><span class="ph">${W.ph}</span></div><span class="prog">${n} of ${W.days.length} done</span></button>
  <div class="days ${W.w===cw?"":"hidden"}">${adjBanner(W)}${W.days.map((D,i)=>{const key=`w${W.w}d${i}`,dn=!!S.done[key];return `<div class="day ${dn?"done":""}"><input type="checkbox" data-key="${key}" ${dn?"checked":""} aria-label="Mark ${DAYS[D.d]} done"><span class="dn">${DAYS[D.d]}</span><div><h4><span class="dot k-${D.k}"></span>${D.t}</h4><p>${D.d2||D.d}</p></div>${D.w?`<button class="mini" data-wo="${D.w}">Open timer</button>`:"<span></span>"}</div>`}).join("")}</div></div>`}).join("");
  $$('[data-panel="plan"] .week > button').forEach(b=>b.onclick=()=>{const o=b.getAttribute("aria-expanded")==="true";b.setAttribute("aria-expanded",!o);b.nextElementSibling.classList.toggle("hidden",o)});
  $$('[data-panel="plan"] input[data-key]').forEach(c=>c.onchange=()=>{c.checked?S.done[c.dataset.key]=1:delete S.done[c.dataset.key];save();const wk=c.closest(".week");c.closest(".day").classList.toggle("done",c.checked);const all=wk.querySelectorAll("input[data-key]"),n=[...all].filter(x=>x.checked).length;wk.querySelector(".prog").textContent=`${n} of ${all.length} done`});
  bindCheckin();
  $$('[data-panel="plan"] [data-wo]').forEach(b=>b.onclick=()=>{$("#wSel").value=b.dataset.wo;loadWorkout();tab("timer");scrollTo(0,0)});
}
