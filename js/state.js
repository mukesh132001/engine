/* Engine | state.js
   App state saved in the browser, plus small helpers. */
"use strict";

const KEY="engine:v1";
let S=load()||fresh();
function fresh(){return {sex:null,age:null,unit:"metric",method:"quick",inputs:{},vo2:null,habits:{},target:null,pace:"balanced",days:4,mode:"run",gym:"gym",start:null,done:{},log:[],checkins:{},rhrLog:[],sport:"general"}}
function load(){try{const r=localStorage.getItem(KEY);return r?Object.assign(fresh(),JSON.parse(r)):null}catch(e){return null}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const r1=v=>Math.round(v*10)/10;
