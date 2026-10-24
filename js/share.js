/* Engine | share.js
   Share studio and story card images. */
"use strict";

const SITE=location.hostname.endsWith("github.io")?location.origin+location.pathname.replace(/index\.html$/,""):"https://mukesh132001.github.io/engine/";
const SITE_SHORT=SITE.replace(/^https?:\/\//,"").replace(/\/$/,"");
const CD='"Bricolage Grotesque", Arial, sans-serif',CB='"Instrument Sans", Arial, sans-serif';
let ST={canvas:null,type:"result"};
function canBA(){return S.log.length>1&&S.log[S.log.length-1].v>S.log[0].v}
function openStudio(type){const el=$("#studio");el.classList.remove("hidden");document.body.style.overflow="hidden";
  const types=[["result","My result"]];if(canBA())types.push(["ba","Before & after"]);if(S.challenge&&chWeek()>=1)types.push(["ch","Challenge update"]);
  if(!types.find(t=>t[0]===type))type="result";
  $("#stTabs").innerHTML=types.length>1?types.map(([k,l])=>`<button class="chip" data-st="${k}" aria-pressed="${k===type}">${l}</button>`).join(""):"";
  $$("#stTabs .chip").forEach(b=>b.onclick=()=>openStudio(b.dataset.st));
  $("#stNote").textContent="Sized for Instagram and TikTok stories, with your link on it.";renderCard(type)}
function closeStudio(){$("#studio").classList.add("hidden");document.body.style.overflow=""}
async function renderCard(type){ST.type=type;const im=$("#stImg");im.style.opacity=.4;try{await document.fonts.ready}catch(e){}
  const c=drawCard(type);ST.canvas=c;im.src=c.toDataURL("image/png");im.style.opacity=1}
function dl(b){const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=`engine-${ST.type}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);
  $("#stNote").textContent="Saved to your downloads. On a phone you can also press and hold the image to save it."}
$("#stShare").onclick=()=>ST.canvas&&ST.canvas.toBlob(async b=>{if(!b)return;const f=new File([b],`engine-${ST.type}.png`,{type:"image/png"});
  try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:"My engine",text:"How big is your engine? "+SITE});return}}catch(e){if(e&&e.name==="AbortError")return}dl(b)},"image/png");
$("#stDl").onclick=()=>ST.canvas&&ST.canvas.toBlob(b=>b&&dl(b),"image/png");
$("#stClose").onclick=closeStudio;
addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#studio").classList.contains("hidden"))closeStudio()});
function rr(x,X,Y,W,H,r){x.beginPath();if(x.roundRect)x.roundRect(X,Y,W,H,r);else x.rect(X,Y,W,H);x.fill()}
function wrapText(x,t,X,Y,maxW,lh,maxLines){const words=String(t).split(/\s+/);let line="",n=0;
  for(let i=0;i<words.length;i++){const test=line?line+" "+words[i]:words[i];if(x.measureText(test).width>maxW&&line){x.fillText(line,X,Y+n*lh);n++;line=words[i];if(n===maxLines-1){const rest=words.slice(i).join(" ");let r=rest;while(x.measureText(r+"…").width>maxW&&r.length)r=r.slice(0,-1);x.fillText(r===rest?r:r+"…",X,Y+n*lh);return n+1}}else line=test}
  x.fillText(line,X,Y+n*lh);return n+1}
function drawCard(type){
  const c=document.createElement("canvas");c.width=1080;c.height=1920;const x=c.getContext("2d");
  const blobs=type==="ba"?[[200,380,950,"255,80,40"],[960,900,800,"255,40,110"],[400,1700,1000,"110,50,255"],[1000,300,500,"255,170,90"],[80,1250,600,"60,120,255"]]
    :type==="ch"?[[900,380,900,"60,120,255"],[150,800,800,"255,60,70"],[600,1650,1000,"110,50,255"],[980,1300,550,"255,170,90"]]
    :[[180,420,900,"255,70,50"],[950,700,800,"60,120,255"],[540,1650,1000,"110,50,255"],[880,1250,600,"255,40,110"],[120,1100,500,"255,170,90"]];
  x.fillStyle="#05040f";x.fillRect(0,0,1080,1920);x.globalCompositeOperation="lighter";
  blobs.forEach(([px,py,r,col])=>{const g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,`rgba(${col},.75)`);g.addColorStop(.5,`rgba(${col},.25)`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.fillRect(0,0,1080,1920)});
  x.globalCompositeOperation="source-over";
  const vg=x.createRadialGradient(540,960,450,540,960,1300);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,.5)");x.fillStyle=vg;x.fillRect(0,0,1080,1920);
  const im=x.getImageData(0,0,1080,1920),d=im.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*40;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(im,0,0);
  const sp=SPORTS[S.sport||"general"],L=S.log,first=L.length?L[0]:{v:S.vo2,d:S.start||today()},last=L.length?L[L.length-1]:first;
  x.fillStyle="#fff";x.font=`800 64px ${CD}`;x.fillText("Engine"+(sp.tag?" "+sp.tag:""),90,170);
  if(type==="result"){const fa=fitAge(last.v),diff=fa-S.age;
    x.globalAlpha=.85;x.font=`500 42px ${CB}`;x.fillText("My VO2 max",90,560);x.globalAlpha=1;
    x.font=`800 360px ${CD}`;x.fillText(last.v.toFixed(1),70,890);
    x.font=`700 58px ${CD}`;x.fillText(`${RATINGS[ratingIdx(last.v)]} for age ${S.age}`,90,1010);
    x.font=`500 46px ${CB}`;x.fillText(diff<0?`Engine age ${fa}, ${-diff} years younger than me`:diff>0?`Engine age ${fa}. Working on it.`:`Engine age ${fa}, right on my age`,90,1090);
    const wk=weeksTo(S.target,S.pace),hit=last.v>=S.target;x.font=`800 120px ${CD}`;x.fillText(hit?"Goal smashed":`Goal ${S.target.toFixed(1)}`,90,1340);
    x.font=`500 42px ${CB}`;x.fillText(hit?`Passed my ${S.target.toFixed(1)} target. New one loading.`:isFinite(wk)?`About ${wk} weeks away`:"In it for the long game",90,1410)}
  if(type==="ba"){const wk=Math.max(1,Math.round((new Date(last.d+"T00:00:00")-new Date(first.d+"T00:00:00"))/6048e5)),g=last.v-first.v,pc=Math.round(g/first.v*100),fa0=fitAge(first.v),fa1=fitAge(last.v);
    x.globalAlpha=.85;x.font=`600 48px ${CB}`;x.fillText(`Week 0 → Week ${wk}`,90,420);
    x.globalAlpha=.45;x.font=`800 190px ${CD}`;x.fillText(first.v.toFixed(1),80,640);x.globalAlpha=1;
    x.font=`800 340px ${CD}`;x.fillText(last.v.toFixed(1),70,960);
    x.font=`800 96px ${CD}`;x.fillText(`+${g.toFixed(1)} VO2 max`,90,1120);
    x.font=`500 44px ${CB}`;x.fillText(`My body uses ${pc}% more oxygen than it did.`,90,1190);
    x.font=`700 58px ${CD}`;x.fillText(fa1<fa0?`Engine age ${fa0} → ${fa1}`:`Engine age ${fa1}`,90,1310);
    const mx=last.v*1.1;[[first.v,"Week 0",.5,1430],[last.v,`Week ${wk}`,1,1550]].forEach(([v,l,a,y])=>{x.globalAlpha=a;const w=900*v/mx,gr=x.createLinearGradient(90,0,90+w,0);
      gr.addColorStop(0,"#52b9ff");gr.addColorStop(.6,"#7d60ff");gr.addColorStop(1,"#ff3d58");x.fillStyle=gr;rr(x,90,y,w,46,23);x.fillStyle="#fff";x.font=`500 34px ${CB}`;x.fillText(l,90,y-14);x.globalAlpha=1})}
  if(type==="ch"){const ch=S.challenge,w=clamp(chWeek()||1,1,12),P=buildPlan(),pw=curWeek(),days=P[pw-1].days,dn=days.filter((_,i)=>S.done[`w${pw}d${i}`]).length;
    x.globalAlpha=.85;x.font=`600 44px ${CB}`;x.fillText("12-week engine challenge",90,420);x.globalAlpha=1;
    x.font=`800 92px ${CD}`;const lines=wrapText(x,ch.n,90,530,900,100,2);
    const top=530+lines*100+40;x.font=`600 56px ${CB}`;x.fillText("Week",90,top+60);
    x.font=`800 380px ${CD}`;x.fillText(String(w),70,top+400);const nw=x.measureText(String(w)).width;x.globalAlpha=.6;x.font=`800 120px ${CD}`;x.fillText("/12",90+nw+10,top+400);x.globalAlpha=1;
    x.font=`700 56px ${CD}`;x.fillText(`${dn} of ${days.length} sessions done this week`,90,top+520);
    x.font=`500 44px ${CB}`;x.fillText(`VO2 max ${last.v.toFixed(1)}${L.length>1&&last.v>first.v?`, up ${(last.v-first.v).toFixed(1)} so far`:""}`,90,top+595);
    const sw=(900-11*12)/12;for(let i=0;i<12;i++){x.fillStyle=i<w?"#ff3d58":"rgba(255,255,255,.22)";rr(x,90+i*(sw+12),top+650,sw,22,11)}
    x.fillStyle="#fff";x.globalAlpha=.85;x.font=`500 40px ${CB}`;x.fillText(`${ch.me}, week ${w}`,90,top+750);x.globalAlpha=1}
  x.fillStyle="#fff";x.font=`700 50px ${CD}`;x.fillText(type==="ch"?"Join us. Find your starting engine:":"How big is your engine?",90,1715);
  x.globalAlpha=.8;x.font=`500 38px ${CB}`;x.fillText(SITE_SHORT,90,1780);x.globalAlpha=1;
  return c}
