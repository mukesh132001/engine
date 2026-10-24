/* Engine | main.js
   Starts the app. */
"use strict";

initStep1();
if(S.start&&S.vo2&&S.target){show("dash");renderDash();tab("engine")}else show("intro");
setHeat();
checkInvite();
