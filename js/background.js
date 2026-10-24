/* Engine | background.js
   Animated grainy heat-map background. */
"use strict";

const cv=$("#field"),cx=cv.getContext("2d");let heat=.35,heatTarget=.35;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const blobs=Array.from({length:6},(_,i)=>({x:Math.random(),y:Math.random(),r:.35+Math.random()*.35,sx:(Math.random()-.5)*.00025,sy:(Math.random()-.5)*.00025,c:i}));
function size(){cv.width=Math.ceil(innerWidth/6);cv.height=Math.ceil(innerHeight/6)}
size();addEventListener("resize",size);
function mix(a,b,t){return a.map((v,i)=>Math.round(v+(b[i]-v)*t))}
function palette(){
  const cool=[[40,90,255],[90,60,240],[30,170,255],[120,70,255],[255,90,120],[60,120,255]];
  const hot =[[255,60,60],[255,120,60],[120,60,255],[255,40,100],[255,170,90],[60,110,255]];
  return cool.map((c,i)=>mix(c,hot[i],heat));}
function draw(){
  heat+=(heatTarget-heat)*.02;
  const w=cv.width,h=cv.height,p=palette();cx.clearRect(0,0,w,h);
  cx.globalCompositeOperation="lighter";
  blobs.forEach(b=>{if(!reduce){b.x+=b.sx;b.y+=b.sy;if(b.x<-.1||b.x>1.1)b.sx*=-1;if(b.y<-.1||b.y>1.1)b.sy*=-1}
    const R=b.r*Math.max(w,h),g=cx.createRadialGradient(b.x*w,b.y*h,0,b.x*w,b.y*h,R),c=p[b.c];
    g.addColorStop(0,`rgba(${c},.55)`);g.addColorStop(.5,`rgba(${c},.18)`);g.addColorStop(1,`rgba(${c},0)`);
    cx.fillStyle=g;cx.fillRect(0,0,w,h)});
  cx.globalCompositeOperation="source-over";
  if(!reduce)requestAnimationFrame(draw)}
draw();
function setHeat(){if(S.vo2&&S.sex&&S.age)heatTarget=.15+ratingIdx(S.vo2)*.21;if(reduce)draw()}
