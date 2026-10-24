/* Engine | data.js
   Constants: fitness norms, tests, habits, sports, paces. */
"use strict";

const NORMS = { // Cooper Institute, age groups 20-29 ... 70-79
  m:{40:[41.7,40.5,38.5,35.6,32.3,29.4],60:[45.4,44,42.4,39.2,35.5,32.3],80:[51.1,48.3,46.4,43.4,39.5,36.7],95:[55.4,54,52.5,48.9,45.7,42.1]},
  f:{40:[36.1,34.4,33,30.1,27.5,25.9],60:[39.5,37.8,36.3,33,30,28.1],80:[43.9,42.4,39.7,36.7,33,30.9],95:[49.6,47.4,45.3,41.1,37.8,36.7]}
};
const RATINGS=["Poor","Fair","Good","Excellent","Superior"];
const HEADROOM=[.30,.22,.16,.10,.06];
const PACE={steady:{k:.035,name:"Steady",note:"Lower strain, easy to fit around life"},balanced:{k:.05,name:"Balanced",note:"The sweet spot for most people"},aggressive:{k:.065,name:"Aggressive",note:"More Zone 2 volume, needs good recovery"}};
const METHODS={
  quick:{name:"60-second estimate",tag:"No exercise, just a few questions",how:"Answer a few questions about your body and activity. It is the fastest way to a number and usually lands within about 5 points of a lab test. Do a real test later to sharpen it. Waist: measure around your belly at the level of your belly button, relaxed, after breathing out."},
  cooper:{name:"12-minute run",tag:"Run as far as you can in 12 minutes",how:"Warm up for 10 minutes. On a track or flat route, run as far as you can in exactly 12 minutes, then enter the distance."},
  mile15:{name:"1.5-mile run",tag:"Time a 1.5-mile (2.4 km) effort",how:"Warm up, then run 1.5 miles (2.4 km) as fast as you can hold. Enter your finish time."},
  walk:{name:"1-mile walk",tag:"Best if running isn't an option",how:"Walk 1 mile (1.6 km) as fast as you can without jogging. Check your heart rate the moment you finish."},
  rhr:{name:"Resting heart rate",tag:"Use your phone camera, no workout",how:"Measure your resting pulse with your phone camera, or type in a reading from a watch. Best done right after waking. Treat the result as a rough first guess."},
  known:{name:"I know my number",tag:"From a lab test or watch",how:"Enter the VO2 max from a lab test or your watch. Lab results are the most accurate."}
};
const HABITS=[
  {id:"sleep",q:"How much do you usually sleep?",o:[["Under 6 hours",12],["6 to 7 hours",6],["7 to 9 hours",0],["More than 9",2]],name:"Short sleep",fix:"Your body adapts while you sleep, not while you train. Keep a fixed wake-up time and protect a 7 to 9 hour window, weekends included."},
  {id:"smoke",q:"Do you smoke or vape?",o:[["Daily",15],["Now and then",6],["Never",0]],name:"Smoking or vaping",fix:"Carbon monoxide takes oxygen's seat in your blood, so your engine runs on less fuel. Cutting back is the biggest free upgrade on this list. A doctor or local quit line can help."},
  {id:"alcohol",q:"How many drinks in a typical week?",o:[["0 to 3",0],["4 to 9",5],["10 or more",10]],name:"Alcohol",fix:"Alcohol cuts deep sleep and slows recovery. Keep it away from hard-session days and the night before them."},
  {id:"sit",q:"How many hours do you sit each day?",o:[["Under 6",0],["6 to 9",4],["10 or more",8]],name:"Long sitting",fix:"Stand and walk for 2 to 3 minutes every 45 minutes. A daily 20-minute walk adds easy aerobic work without costing recovery."},
  {id:"grey",q:"How do most of your workouts feel?",o:[["A mix of easy and very hard",0],["Medium, every time",8],["I don't work out yet",0]],name:"Medium every day",fix:"Medium sessions are too tiring to recover from and too easy to force change. Go truly easy on easy days so the one hard day can be truly hard."},
  {id:"consist",q:"When you start a plan, how long does it usually last?",o:[["Months",0],["A few weeks",6],["About a week",10]],name:"Stop and start",fix:"VO2 max rewards months, not weeks. Build the plan around your busiest week, and never miss the same session twice in a row."},
  {id:"stress",q:"How stressed have you been lately?",o:[["Low",0],["Moderate",3],["High",7]],name:"High stress",fix:"Stress and hard training share one recovery budget. On rough days, swap the hard session for easy Zone 2 instead of skipping."},
  {id:"strength",q:"How often do you lift or do strength work?",o:[["2+ times a week",0],["Sometimes",3],["Never",5]],name:"No strength work",fix:"Stronger legs and tendons waste less energy at the same pace. Two short, heavy sessions a week is enough."}
];
const SPORTS={
  general:{name:"General fitness",tag:"",line:"For everyday health, energy, and a longer life."},
  football:{name:"Football",tag:"for football",line:"Repeat sprints, cover more ground, and still have legs in the last 15 minutes."},
  hiking:{name:"Hiking",tag:"for hiking",line:"Climb longer, breathe easier, and enjoy the summit instead of surviving it."},
  hyrox:{name:"Hyrox",tag:"for Hyrox",line:"Run strong between stations and recover faster after every one."}
};
const PAQ={freq:["How often do you exercise?",[["0","Rarely or never"],["1","Once a week"],["2.5","2 to 3 times a week"],["5","Almost every day"]]],
  int:["How hard, usually?",[["1","Easy, no heavy breathing"],["5","Hard, out of breath and sweaty"],["10","Close to exhaustion"]]],
  dur:["How long, usually?",[["0.1","Under 15 minutes"],["0.38","15 to 29 minutes"],["0.75","30 to 60 minutes"],["1","Over an hour"]]]};
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MODES={run:"run",bike:"bike",row:"row",swim:"swim",mix:"mixed"};
const MODELABEL={run:"Running",bike:"Cycling",row:"Rowing",swim:"Swimming",mix:"Mix it up"};
