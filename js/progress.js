/* Engine | progress.js
   Retest log and progress chart. */
"use strict";

function renderProgress(){
  const el=$('[data-panel="progress"]');const W=Math.max(16,Math.min(52,(isFinite(weeksTo(S.target,S.pace))?weeksTo(S.target,S.pace):24)+4));
  const pts=S.log.map(l=>({x:(new Date(l.d+"T00:00:00")-new Date(S.start+"T00:00:00"))/6048e5,y:l.v}));
  const ys=[S.vo2,S.target,proj(W,S.pace),...pts.map(p=>p.y)],ymin=Math.floor(Math.min(...ys)-2),ymax=Math.ceil(Math.max(...ys)+2);
  const w=700,h=300,pad=40,X=x=>pad+x/W*(w-pad-10),Y=y=>h-pad-(y-ymin)/(ymax-ymin)*(h-pad-14);
  let path="";for(let t=0;t<=W;t+=.5)path+=(t?"L":"M")+X(t).toFixed(1)+" "+Y(proj(t,S.pace)).toFixed(1);
  let ideal="";for(let t=0;t<=W;t+=.5)ideal+=(t?"L":"M")+X(t).toFixed(1)+" "+Y(proj(t,S.pace,1)).toFixed(1);
  const grid=[];for(let y=ymin;y<=ymax;y+=Math.max(1,Math.round((ymax-ymin)/5)))grid.push(`<line x1="${pad}" x2="${w-10}" y1="${Y(y)}" y2="${Y(y)}" stroke="var(--line)"/><text x="${pad-8}" y="${Y(y)+4}" text-anchor="end" font-size="11" fill="var(--soft)">${y}</text>`);
  for(let x=0;x<=W;x+=4)grid.push(`<text x="${X(x)}" y="${h-pad+18}" text-anchor="middle" font-size="11" fill="var(--soft)">wk ${x}</text>`);
  el.innerHTML=`<h2 style="margin-bottom:10px">Progress</h2><p class="soft">Retest every 4 to 6 weeks with the same test, at the same time of day. The solid line is your projected path; the dashed line is the same path with every leak fixed.</p>
  <div class="glass" style="overflow-x:auto"><svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Projected and logged VO2 max over time">
    <defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="var(--blue)"/><stop offset=".6" stop-color="var(--violet)"/><stop offset="1" stop-color="var(--red)"/></linearGradient></defs>
    ${grid.join("")}
    <line x1="${pad}" x2="${w-10}" y1="${Y(S.target)}" y2="${Y(S.target)}" stroke="var(--red)" stroke-dasharray="2 5" stroke-width="1.5"/><text x="${w-12}" y="${Y(S.target)-6}" text-anchor="end" font-size="12" fill="var(--red)">target ${S.target.toFixed(1)}</text>
    <path d="${ideal}" fill="none" stroke="var(--soft)" stroke-width="1.5" stroke-dasharray="6 5"/>
    <path d="${path}" fill="none" stroke="url(#lg)" stroke-width="3.5" stroke-linecap="round"/>
    ${pts.map(p=>`<circle cx="${X(clamp(p.x,0,W))}" cy="${Y(p.y)}" r="6" fill="var(--ink)" stroke="var(--bg)" stroke-width="2"/>`).join("")}
  </svg></div>
  <div class="two"><div class="glass"><h3 style="margin-bottom:10px">Log a retest</h3>
    <div class="row"><div class="field"><label for="lgD">Date</label><input type="date" id="lgD" value="${new Date().toISOString().slice(0,10)}"></div><div class="field"><label for="lgV">VO2 max</label><input type="number" id="lgV" step="0.1" inputmode="decimal" placeholder="${S.vo2}"></div></div>
    <div class="err" id="lgE"></div><button class="cta" id="lgB" style="margin-top:12px">Save result</button>
    <p class="soft" style="font-size:14px;margin-top:12px">Need to recalculate from a test? Use “Edit my answers” on the My engine tab, then copy the number here.</p></div>
    <div class="glass"><h3>History</h3><ul class="log">${S.log.slice().reverse().map((l,i)=>`<li><span>${l.d}</span><b>${l.v.toFixed(1)}</b></li>`).join("")}</ul>${canBA()?`<button class="cta" id="baBtn" style="margin-top:14px">Make before &amp; after card</button>`:""}</div></div>`;
  const bb=$("#baBtn");if(bb)bb.onclick=()=>openStudio("ba");
  $("#lgB").onclick=()=>{const v=+$("#lgV").value,d=$("#lgD").value;if(!v||v<12||v>90){$("#lgE").textContent="Enter a VO2 max between 12 and 90.";return}if(!d){$("#lgE").textContent="Pick a date.";return}
    S.log.push({d,v:r1(v)});S.log.sort((a,b)=>a.d<b.d?-1:1);save();renderProgress();renderEngine();
    const isLatest=S.log[S.log.length-1].d===d;
    if(isLatest&&canBA()){toast("Your before & after card is ready");setTimeout(()=>openStudio("ba"),700)}
    else if(isLatest&&S.log.length>1)toast("Saved. Dips happen. Watch the trend, not one test.");else toast("Saved")};
}
