/* Engine | challenges.js
   12-week challenges using invite links. */
"use strict";

function b64e(o){return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function b64d(t){t=t.replace(/-/g,"+").replace(/_/g,"/");while(t.length%4)t+="=";return JSON.parse(decodeURIComponent(escape(atob(t))))}
function esc(t){return String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function nextMonday(){const d=new Date();d.setDate(d.getDate()+(8-d.getDay())%7);return d.toLocaleDateString("en-CA")}
function fmtDate(t){return new Date(t+"T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"})}
function chWeek(){if(!S.challenge)return null;return Math.floor((new Date().setHours(0,0,0,0)-new Date(S.challenge.s+"T00:00:00").getTime())/6048e5)+1}
function chLink(){const c=S.challenge;return SITE+"?c="+b64e({n:c.n,h:c.h,s:c.s})}
function challengeHTML(){const c=S.challenge;
  if(!c)return `<div class="glass" style="margin-top:20px"><h3 style="margin-bottom:6px">Start a 12-week challenge</h3><p class="soft" style="font-size:15.5px">Train alongside friends, teammates, or coworkers. Everyone starts the same Monday, follows their own plan, and posts weekly update cards to your group chat.</p>
    <div class="row" style="margin-top:10px"><div class="field"><label for="chN">Challenge name</label><input type="text" id="chN" maxlength="32" placeholder="Office engine challenge"></div><div class="field"><label for="chMe">Your first name</label><input type="text" id="chMe" maxlength="20" placeholder="Mukii"></div></div>
    <div class="err" id="chE"></div><button class="cta" id="chCreate" style="margin-top:12px">Create challenge</button></div>`;
  const w=chWeek(),days=Math.ceil((new Date(c.s+"T00:00:00")-new Date().setHours(0,0,0,0))/864e5);
  const st=w<1?`Starts ${fmtDate(c.s)}, in ${days} day${days===1?"":"s"}`:w>12?"Finished. What a 12 weeks.":`Week ${w} of 12`;
  return `<div class="glass" style="margin-top:20px"><div class="soft" style="font-size:14px">${c.h===c.me?"Your challenge":`Invited by ${esc(c.h)}`}</div>
    <h3 style="margin:4px 0 6px;font-size:28px">${esc(c.n)}</h3><p style="margin:0 0 12px;font-family:var(--display);font-size:20px;font-weight:600">${st}</p>
    <div class="seq" style="height:8px;margin:0 0 16px">${Array.from({length:12},(_,i)=>`<i style="flex:1;background:${w>i?"var(--red)":"var(--line)"}"></i>`).join("")}</div>
    <div class="row" style="gap:10px;align-items:center"><button class="cta" id="chInvite">Invite friends</button>${w>=1?`<button class="cta alt" id="chPost">Post weekly update</button>`:""}<button class="mini" id="chLeave">Leave</button></div>
    <p class="soft" id="chNote" style="font-size:14px;margin-top:12px">Drop the invite in your group chat. Everyone who joins starts on ${fmtDate(c.s)}.</p></div>`}
function bindChallenge(){const cr=$("#chCreate");
  if(cr)cr.onclick=()=>{const n=$("#chN").value.trim(),me=$("#chMe").value.trim();if(!n||!me){$("#chE").textContent="Add a challenge name and your first name.";return}
    S.challenge={n,h:me,me,s:nextMonday()};save();renderEngine();toast("Challenge created. Invite your crew.")};
  const iv=$("#chInvite");if(iv)iv.onclick=invite;
  const po=$("#chPost");if(po)po.onclick=()=>openStudio("ch");
  const lv=$("#chLeave");if(lv)lv.onclick=()=>{if(confirm("Leave this challenge? Your plan and progress stay.")){S.challenge=null;save();renderEngine()}}}
async function invite(){const url=chLink(),c=S.challenge,text=`Join my 12-week Engine challenge "${c.n}". We start ${fmtDate(c.s)}.`;
  try{if(navigator.share){await navigator.share({title:"Engine challenge",text,url});return}}catch(e){if(e&&e.name==="AbortError")return}
  try{await navigator.clipboard.writeText(text+" "+url);toast("Invite link copied");return}catch(e){}
  $("#chNote").innerHTML=`Copy this link and send it: <input type="text" readonly value="${esc(url)}" style="margin-top:8px" onclick="this.select()">`}
function checkInvite(){let c;try{const q=new URLSearchParams(location.search).get("c");if(!q)return;c=b64d(q)}catch(e){return}
  if(!c||!c.n||!c.s||!c.h)return;
  try{history.replaceState(null,"",location.pathname)}catch(e){}
  if(S.challenge&&S.challenge.n===c.n&&S.challenge.s===c.s)return;
  const el=document.createElement("div");el.className="pulse";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");
  el.innerHTML=`<div class="pulse-in" style="padding-top:calc(70px + env(safe-area-inset-top,0px))"><div class="soft">You're invited</div>
    <h2 style="font-size:clamp(40px,8vw,64px);margin:8px 0 16px">${esc(c.h)} wants you in “${esc(c.n)}”</h2>
    <p>A 12-week Engine challenge starting ${fmtDate(c.s)}. Everyone follows their own plan and shares weekly updates in the group. First, find your starting VO2 max. It takes about a minute.</p>
    <div class="field" style="max-width:260px;margin-top:18px"><label for="jMe">Your first name</label><input type="text" id="jMe" maxlength="20"></div><div class="err" id="jE"></div>
    <div class="tbtns"><button class="cta" id="jGo">Join the challenge</button><button class="cta alt" id="jNo">Not now</button></div></div>`;
  document.body.appendChild(el);document.body.style.overflow="hidden";
  const done=()=>{el.remove();document.body.style.overflow=""};
  $("#jNo").onclick=done;
  $("#jGo").onclick=()=>{const me=$("#jMe").value.trim();if(!me){$("#jE").textContent="Add your first name.";return}
    S.challenge={n:c.n,h:c.h,me,s:c.s};save();done();
    if(S.start&&S.vo2&&S.target){show("dash");renderDash();tab("engine");toast("You're in. Good luck!")}else{show("flow");initStep1();step(1);toast("You're in. First, measure your engine.")}}}
