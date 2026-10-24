# Engine

Measure your VO2 max, find the habits holding you back, and follow a personal 12-week plan to grow your engine. Works with just a phone, no fitness watch needed.

**Live:** https://mukesh132001.github.io/engine/

## Features
- Six ways to estimate VO2 max, including a 60-second no-exercise estimate and camera-based resting heart rate
- Ratings and percentiles from Cooper Institute norms, plus an engine age
- Habit "leaks" check and engine efficiency score
- Goal and pace planner with projected timelines
- 12-week plan (Norwegian 4x4, 30-20-10, Zone 2, strength) with sports modes: general, football, hiking, Hyrox
- Weekly check-ins that adapt next week's plan
- Workout timer with audio cues
- Pulse check: heart rate from the phone camera
- Share studio: story cards, before and after cards, challenge updates
- 12-week challenges with invite links
- Progress tracking, saved privately in your browser

## Project structure
```
index.html          page layout (all screens and dialogs)
css/styles.css      all styling, light and dark themes
js/data.js          constants: norms, tests, habits, sports, paces
js/state.js         saved state and small helpers
js/science.js       VO2 max formulas, ratings, engine age, projections
js/background.js    animated thermal background
js/flow.js          onboarding steps 1 to 4 and the result reveal
js/plan.js          12-week plan, sports modes, weekly check-ins
js/dashboard.js     My engine and plan tabs
js/share.js         share studio and story card images
js/challenges.js    12-week challenges via invite links
js/pulse.js         camera heart rate
js/timer.js         interval workout timer
js/progress.js      retest log and chart
js/main.js          starts the app
tests/e2e_test.py   end-to-end test in headless Chrome
```
Scripts load in the order listed in `index.html`, and later files can use anything defined in earlier ones.

## Run locally
```
python3 -m http.server 8000
```
Then open http://localhost:8000. Opening `index.html` directly also works, but the camera only works on localhost or https.

## Test
```
pip install playwright && playwright install chromium
python3 tests/e2e_test.py
```

## Science
- Norms: Cooper Institute
- 12-minute run: Cooper (1968); 1.5-mile run: ACSM; 1-mile walk: Rockport (Kline et al., 1987)
- Resting heart rate estimate: Uth et al. (2004); max heart rate: Tanaka et al. (2001)
- 60-second estimate: Nes et al. (2011), HUNT Study

## Disclaimer
Engine gives estimates, not medical advice. Check with a doctor before hard intervals if you have a heart condition or haven't exercised in a long time.
