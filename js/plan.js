/* Engine | plan.js
   12-week plan builder, sports modes, and weekly check-ins. */
"use strict";

const PATTERNS={3:[[1,"H"],[3,"L"],[5,"Z"]],4:[[0,"Z"],[1,"H"],[3,"L"],[5,"Z"]],5:[[0,"L"],[1,"H"],[2,"Z"],[4,"L"],[5,"Z"]],6:[[0,"L"],[1,"H"],[2,"Z"],[3,"L"],[5,"Z"],[6,"Z"]],7:[[0,"L"],[1,"H"],[2,"Z"],[3,"L"],[4,"R"],[5,"Z"],[6,"Z"]]};
function phase(w){return w<=3?"Foundation":w===4||w===8?"Reload":w<=7?"Build":w<=11?"Peak":"Retest"}
function hardSession(w,li){
  const m=MODES[S.mode],easyLi=li<=1;
  if(w===12)return{k:"test",t:"Retest day",d:S.method==="quick"?"Time for a real test. Warm up well, then do the 12-minute run or the 1-mile walk from step 1. Log the new number in Progress.":`Warm up well, then repeat your ${METHODS[S.method].name.toLowerCase()} test. Log the new number in Progress.`};
  if(w===4||w===8)return{k:"hard",t:"Easy intervals: 3 × 4 min",d:`Hard but controlled, a notch below last week. 3 min easy between. This week lets your body catch up.`,w:"reload"};
  if(w<=3){if(easyLi){const mm=[2,3,4][w-1];return{k:"hard",t:`Intro 4×4: 4 × ${mm} min`,d:`${cap(m)} hard for ${mm} minutes, then 3 minutes easy, four times. Hard means you could hold it, but you wouldn't want to chat.`,w:mm===4?"4x4":"intro"+mm}}
    return{k:"hard",t:"Norwegian 4×4",d:`${cap(m)}: 4 minutes hard, 3 minutes easy, four rounds. Rep four should look like rep one.`,w:"4x4"}}
  const blocks=w<=7?(easyLi?(w===5?2:3):3):(easyLi?3:4);
  const is30=(w===5||w===7||w===10);
  if(is30)return{k:"hard",t:`30-20-10: ${blocks} blocks`,d:`30 s easy, 20 s steady, 10 s all-out, five times without stopping. 2 to 3 minutes easy between blocks.`,w:"302010-"+blocks};
  return{k:"hard",t:"Norwegian 4×4",d:`4 minutes hard, 3 easy, four rounds. Aim for 85 to 95% of max heart rate (${Math.round(hrMax()*.85)} to ${Math.round(hrMax()*.95)} bpm) by the end of each rep.`,w:"4x4"};
}
function sportize(o,w,reload){const sp=S.sport||"general";if(sp==="general")return o;const x=Object.assign({},o),is30=!!(o.w&&o.w.startsWith("302010"));
  if(o.k==="test")return o;
  if(sp==="football"){
    if(o.k==="hard")x.d2=(is30?"Built like the stop-start sprints of a real game. ":"Run it on a pitch or field. ")+o.d2+" Playing a match this week? The match is your hard session, so skip this one.";
    if(o.k==="z2")x.d2=o.d2+" Easy jog, bike, or swim, kept truly easy so your legs stay fresh for training.";
    if(o.k==="lift"&&!reload)x.d2=o.d2+" Add 3 sets of jumps or bounds, plus Nordic hamstring curls to protect your hamstrings.";
    if(o.k==="rec")x.d2="Easy walk or light ball work. Touches, no sprints.";}
  if(sp==="hiking"){
    if(o.k==="hard"){x.t=o.t.replace("Norwegian 4×4","Hill 4×4").replace("30-20-10:","Stair 30-20-10:");x.d2=(is30?"Use stairs or a steep hill. ":"Power-hike or run up a hill, or use a steep treadmill incline, then go easy back down. ")+o.d2}
    if(o.k==="z2"){x.t=o.t.replace("Zone 2:","Zone 2 hike:");x.d2="Hike or incline walk, easy enough to talk. "+(o.t.includes("long")?"Carry your usual pack today. ":"")+o.d2.replace("Easy enough to talk in full sentences. ","")}
    if(o.k==="lift"&&!reload)x.d2=o.d2+" Add step-ups, walking lunges, calf raises, and loaded carries for the climbs.";}
  if(sp==="hyrox"){
    if(o.k==="hard")x.d2=(is30?"Do it on the rower or SkiErg. ":"Alternate reps between running and the SkiErg or rower. ")+o.d2;
    if(o.k==="z2")x.d2=o.d2+(w%2===0?" Run this one.":" Run, row, or ski. Mix them up.");
    if(o.k==="lift"){x.t=S.gym==="home"?"Strength: bodyweight + stations":"Strength + stations";if(!reload)x.d2=o.d2+" Finish with 10 minutes of station work: wall balls, lunges, sled push or heavy carries, then run 1 km straight after."}}
  return x}
function adjOf(w){const c=S.checkins&&S.checkins[w-1];if(!c||w===12)return null;
  if(c.hard==="crushed"||c.sleep==="poor"||c.sessions==="few")return"ease";
  if(c.sessions==="all"&&c.hard==="easy")return"push";return null}
function adjWhy(w){const c=S.checkins[w-1],r=[];if(c.hard==="crushed")r.push("the hard session flattened you");if(c.sleep==="poor")r.push("sleep was rough");if(c.sessions==="few")r.push("you missed most sessions");return r.join(", ")}
function adjBanner(W){if(!W.adj)return"";return W.adj==="ease"?`<div class="adj ease">Lighter week after your week ${W.w-1} check-in: ${adjWhy(W.w)}. Shorter Zone 2 and an easier hard day.</div>`:`<div class="adj push">Stepped up after your week ${W.w-1} check-in: every session done and the hard day felt easy.</div>`}
function tweakHard(hs,adj){if(!adj||!hs.w||hs.w==="reload")return hs;const h=Object.assign({},hs);
  if(hs.w.startsWith("302010-")){let b=+hs.w.split("-")[1];b=adj==="ease"?Math.max(2,b-1):Math.min(4,b+1);h.w="302010-"+b;h.t=`30-20-10: ${b} blocks`}
  else if(adj==="ease"){if(hs.w==="4x4"){h.w="reload";h.t="Easier 4×4: 3 × 4 min"}else{h.w="intro2";h.t="Intro 4×4: 4 × 2 min"}h.d="Same idea, less volume this week. Controlled effort, 3 minutes easy between reps."}
  else{if(hs.w==="intro2"){h.w="intro3";h.t="Intro 4×4: 4 × 3 min";h.d="Moved up a level because last week felt easy. Hard for 3 minutes, 3 minutes easy, four times."}
    else if(hs.w==="intro3"){h.w="4x4";h.t="Norwegian 4×4";h.d="Moved up to the full version. 4 minutes hard, 3 minutes easy, four rounds."}
    else h.d=hs.d+" You're adapting fast: aim for the top of your heart rate range on the last two reps."}
  return h}
const CIQ=[["sessions","How many sessions did you finish?",[["all","All of them"],["most","Most"],["few","Few or none"]]],["hard","How did the hard session feel?",[["easy","Easier than expected"],["right","Hard but doable"],["crushed","It crushed me"]]],["sleep","How was your sleep?",[["good","Good"],["ok","Okay"],["poor","Poor"]]]];
function ciWeek(){const cw=curWeek();if(cw>1&&!S.checkins[cw-1])return cw-1;if(cw<12&&!S.checkins[cw])return cw;return null}
function checkinHTML(){const w=ciWeek();if(!w)return"";return `<div class="glass" id="ci" data-w="${w}" style="margin:18px 0 10px"><h3 style="margin-bottom:6px">Week ${w} check-in</h3><p class="soft" style="font-size:15px">Three taps. Week ${w+1} adjusts to how this week actually went.</p>${CIQ.map(([k,q,o])=>`<div class="q"><p>${q}</p><div class="chips">${o.map(([v,l])=>`<button class="chip" data-ci="${k}" data-v="${v}" aria-pressed="false">${l}</button>`).join("")}</div></div>`).join("")}<div class="err" id="ciE"></div><button class="cta" id="ciB" style="margin-top:10px">Update week ${w+1}</button></div>`}
function bindCheckin(){const box=$("#ci");if(!box)return;const a={};
  $$("#ci .chip").forEach(c=>c.onclick=()=>{a[c.dataset.ci]=c.dataset.v;$$(`#ci .chip[data-ci="${c.dataset.ci}"]`).forEach(x=>x.setAttribute("aria-pressed",x===c))});
  $("#ciB").onclick=()=>{if(Object.keys(a).length<3){$("#ciE").textContent="Answer all three questions.";return}const w=+box.dataset.w;S.checkins[w]=a;save();renderPlan();renderEngine();
    const nb=$(`[data-panel="plan"] .week > button[data-w="${w+1}"]`);if(nb&&nb.getAttribute("aria-expanded")!=="true")nb.click();
    const ad=adjOf(w+1);toast(ad==="ease"?`Week ${w+1} is lighter now. Recover well.`:ad==="push"?`Week ${w+1} stepped up. You earned it.`:`Week ${w+1} stays on track. Keep going.`)}}
function toast(m){let t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.setAttribute("role","status");document.body.appendChild(t)}t.textContent=m;t.className="show";clearTimeout(t._h);t._h=setTimeout(()=>t.className="",3200)}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function buildPlan(){
  const li=ratingIdx(S.vo2),base=[25,30,40,45,50][li]+({steady:-5,balanced:0,aggressive:10})[S.pace];
  const z2lo=Math.round(hrMax()*.6),z2hi=Math.round(hrMax()*.7);
  const weeks=[];
  for(let w=1;w<=12;w++){
    const ph=phase(w),reload=ph==="Reload"||ph==="Retest";
    let add=w<=3?0:w<=7?5:10;let dur=base+add;if(reload)dur=Math.round(dur*.7/5)*5;
    const adj=adjOf(w);if(adj==="ease")dur=Math.max(20,Math.round(dur*.85/5)*5);if(adj==="push")dur+=5;
    const pat=PATTERNS[S.days];const zDays=pat.filter(p=>p[1]==="Z").map(p=>p[0]);const longDay=S.days>=5?zDays[zDays.length-1]:null;
    const days=pat.map(([d,t])=>{
      if(t==="H"){const hs=tweakHard(hardSession(w,li),adj);return Object.assign({},hs,{d,d2:hs.d})}
      if(t==="Z"){const L=d===longDay&&!reload;const mins=L?dur+15:dur;return{d,k:"z2",t:`Zone 2: ${mins} min${L?" (long)":""}`,d2:`Easy enough to talk in full sentences. ${z2lo} to ${z2hi} bpm. Boring on purpose, this is where most of your engine is built.`}}
      if(t==="L"){const home=S.gym==="home";return{d,k:"lift",t:home?"Strength: bodyweight":"Strength: heavy",d2:home?(reload?"2 sets each: split squats, push-ups, table rows, glute bridges. Stop 2 reps before failure.":"3 to 4 sets each: slow split squats, push-ups, table rows, single-leg glute bridges. Make the last reps hard."):(reload?"Same lifts, half the sets. Keep the weight, drop the volume.":"Squat or deadlift, a push, and a pull. 3 to 4 sets of 4 to 6 reps, leaving 1 to 2 reps in the tank.")}}
      return{d,k:"rec",t:"Recovery walk: 30 min",d2:"Easy walk outside. Sunlight and steps, no effort."};
    });
    weeks.push({w,ph,days:days.map(o=>sportize(o,w,reload)),adj});
  }
  return weeks;
}
