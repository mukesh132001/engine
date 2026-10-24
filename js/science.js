/* Engine | science.js
   VO2 max formulas, ratings, engine age, and progress projections. */
"use strict";

function ai(age){return clamp(Math.floor((age-20)/10),0,5)}
function cuts(){const n=NORMS[S.sex],i=ai(S.age);return {f:n[40][i],g:n[60][i],e:n[80][i],s:n[95][i]}}
function ratingIdx(v){const c=cuts();return v>=c.s?4:v>=c.e?3:v>=c.g?2:v>=c.f?1:0}
function pct(v){const c=cuts();
  if(v<c.f) return clamp(40-(c.f-v)/(c.g-c.f)*20,1,39);
  if(v<c.g) return 40+(v-c.f)/(c.g-c.f)*20;
  if(v<c.e) return 60+(v-c.g)/(c.e-c.g)*20;
  if(v<c.s) return 80+(v-c.e)/(c.s-c.e)*15;
  return clamp(95+(v-c.s)/(c.s-c.e)*15,95,99);}
function fitAge(v){const n=NORMS[S.sex],mids=[25,35,45,55,65,75],med=mids.map((_,i)=>(n[40][i]+n[60][i])/2);
  if(v>=med[0]) return clamp(Math.round(25-(v-med[0])/((med[0]-med[1])/10)),18,90);
  if(v<=med[5]) return clamp(Math.round(75+(med[5]-v)/((med[4]-med[5])/10)),18,90);
  for(let i=0;i<5;i++){if(v<=med[i]&&v>=med[i+1]) return Math.round(mids[i]+(med[i]-v)/(med[i]-med[i+1])*10)}
  return S.age;}
function hrMax(){return Math.round(208-.7*S.age)}
function eff(){let s=0;HABITS.forEach(h=>{const a=S.habits[h.id];if(a!=null)s+=h.o[a][1]});return Math.max(.55,1-s/100)}
function ceiling(){return S.vo2*(1+HEADROOM[ratingIdx(S.vo2)])}
function kOf(p,e){return PACE[p].k*(e==null?eff():e)}
function proj(t,p,e){const C=ceiling();return C-(C-S.vo2)*Math.exp(-kOf(p,e)*t)}
function weeksTo(T,p,e){const C=ceiling();if(T>=C)return Infinity;if(T<=S.vo2)return 0;return Math.ceil(-Math.log((C-T)/(C-S.vo2))/kOf(p,e))}

function calcVO2(){
  const m=S.method,x=S.inputs,imp=S.unit==="imperial";
  if(m==="quick"){const w=+x.waist,r=+x.rhr;if(!w||!r)throw"Enter your waist size and resting heart rate.";const cm=imp?w*2.54:w;if(cm<50||cm>170)throw"Check your waist measurement.";if(r<30||r>120)throw"That resting heart rate looks unusual. Check the number and try again.";
    const pai=(+x.freq||0)*(+x.int||1)*(+x.dur||.1); // Nes et al. 2011, HUNT Study
    return S.sex==="m"?100.27-.296*S.age-.369*cm-.155*r+.226*pai:74.74-.247*S.age-.259*cm-.114*r+.198*pai}
  if(m==="cooper"){let d=+x.dist;if(!d)throw"Enter the distance you covered.";const meters=imp?d*1609.34:d*1000;return (meters-504.9)/44.73}
  if(m==="mile15"){const t=(+x.min||0)+(+x.sec||0)/60;if(!t)throw"Enter your finish time.";return 3.5+483/t}
  if(m==="walk"){const w=+x.wt,t=(+x.min||0)+(+x.sec||0)/60,hr=+x.hr;if(!w||!t||!hr)throw"Enter your weight, walk time, and finishing heart rate.";const lb=imp?w:w*2.20462;return 132.853-.0769*lb-.3877*S.age+6.315*(S.sex==="m"?1:0)-3.2649*t-.1565*hr}
  if(m==="rhr"){const r=+x.rhr;if(!r)throw"Enter your resting heart rate.";if(r<30||r>120)throw"That resting heart rate looks unusual. Check the number and try again.";return 15.3*hrMax()/r}
  if(m==="known"){const v=+x.vo2;if(!v)throw"Enter your VO2 max.";return v}
}
