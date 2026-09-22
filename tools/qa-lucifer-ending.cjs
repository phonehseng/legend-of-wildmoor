// The last scene: the strain that shakes the room, the blow that halves you, the hand that takes you both, and the
// two answers at the end of it. One real page on a real GPU; the finale clock is stepped by hand.
const fs = require('node:fs'), assert = require('node:assert/strict');
const { instrument, serve, loadPlaywright, browserPath } = require('./qa-game.cjs');
(async () => {
  const html = process.argv[2] || 'legend_of_wildmoor_v3.8.8.html';
  const server = await serve(instrument(fs.readFileSync(html, 'utf8').replace(/\r\n/g, '\n')));
  const browser = await loadPlaywright().chromium.launch({ executablePath: browserPath('chrome'), headless: true });
  const errors = [], checks = [];
  const page = await browser.newPage({ viewport: { width: 900, height: 550 } });
  const run = code => page.evaluate(text => window.__gameQa.run(text), code);
  const check = (label, ok) => { assert.ok(ok, label); checks.push(label); console.log('PASS: ' + label); };
  // the render loop is paused for this test, so the finale advances only when we ask it to.
  const step = seconds => run('(() => { const n = Math.round(' + seconds + ' * 60); for (let i = 0; i < n; i++) { time += 1/60; updateAfterlife(1/60); } return GEH.netFinale ? GEH.netFinale.t : -1; })()');
  try {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.waitForFunction(() => window.__gameQa, null, { timeout: 90000 });
    await run(`(async () => {
      NET.myId = 'solo'; NET.role = null; paused = true; Voice.stop();
      WORLDSTATE.gehUnlocked = true; WORLDSTATE.gehSeed = GEH.seed = 4242;
      WORLDSTATE.gehAlmonerDown = WORLDSTATE.gehMatronDown = WORLDSTATE.gehHeapDown = WORLDSTATE.gehDone = true;
      WORLDSTATE.luciferDefeated = false; WORLDSTATE.gehFinaleWitnessed = false; WORLDSTATE.afterlife = null;
      P.hp = P.maxHp = 20; P.gehDive = null; P.vel.set(0,0,0); inputLock = false; P.lying = false; sleepT = 0;
      await window.gehBuildWorld();
      P.pos.set(GEH.cx + GEH_PRIDE_X, GEH.floor + 9, GEH.cz + GEH_PRIDE_Z - 6);
      GEH.inPride = true; visY = P.pos.y; lastSafePos.copy(P.pos);
    })()`);
    console.log('World ready');

    // ---- the blow ----
    check('A full-health blow takes exactly half, unrounded', await run('gehLuciferBlow({hp:20})===10 && gehLuciferBlow({hp:9})===4.5'));
    check('Halving never quite finishes you above one heart', await run('gehLuciferBlow({hp:5})===2.5 && gehLuciferBlow({hp:1.5})===0.75'));
    check('One heart or fewer is lethal', await run('gehLuciferBlow({hp:1})===1 && gehLuciferBlow({hp:0.5})===0.5'));
    check('Twenty hearts run out in six blows, the last of them from under one', await run(`(() => {
      const seen = [];
      let hp = 20;
      while (hp > 0 && seen.length < 20) { const d = gehLuciferBlow({hp}); seen.push(hp + '-' + d); hp -= d; }
      return hp === 0 && seen.join(',') === '20-10,10-5,5-2.5,2.5-1.25,1.25-0.625,0.625-0.625';
    })()`));

    // ---- the strain ----
    await run(`const e = GEH.lucifer; gehBeginConfrontation(e); e.armed = true; e.scenePhase = 'hold'; e.bodyScale = 2.4; e.maxHp = 90;`);
    check('A fresh hold barely trembles and a broken one shakes hard', await run(`(() => {
      const e = GEH.lucifer;
      e.hp = 90; e.phase = 0; const calm = gehLuciferStrain(e);
      e.hp = 6; e.phase = 3; const hard = gehLuciferStrain(e);
      return calm > 0 && calm < 0.3 && hard > 0.9 && hard > calm * 3;
    })()`));
    check('The hand shakes with him without moving off its held position', await run(`(() => {
      const e = GEH.lucifer, hand = GEH.godHand;
      hand.visible = true; hand.position.set(e.pos.x, e.pos.y + 6, e.pos.z);
      const base = hand.position.clone();
      e.hp = 6; e.phase = 3; time += 0.6; gehUpdateDivineHand(0.016);
      const shiver = hand.userData.tremble.position.length();
      time += 0.37; gehUpdateDivineHand(0.016);
      const again = hand.userData.tremble.position.length();
      return shiver > 0.05 && again > 0.05 && Math.abs(shiver - again) > 1e-4 && hand.position.distanceTo(base) === 0;
    })()`));
    check('His own body trembles in the hold and stands still out of it', await run(`(() => {
      const e = GEH.lucifer;
      e.hp = 6; e.phase = 3; e.mesh.position.copy(e.pos); gehPoseLucifer(e, 'hold', 2.4, time);
      const strained = e.mesh.position.distanceTo(e.pos), tilt = Math.abs(e.mesh.rotation.z);
      e.mesh.position.copy(e.pos); gehPoseLucifer(e, 'children', 0.62, time);
      return strained > 0.02 && tilt > 0.01 && e.mesh.position.distanceTo(e.pos) === 0 && e.mesh.rotation.z === 0;
    })()`));
    check('The room is shaken through the camera while he strains', await run(`(() => {
      const e = GEH.lucifer; e.hp = 6; e.phase = 3; e.armed = true; e.scenePhase = 'hold';
      shake = 0; GEH.netFinale = null; gehUpdateDivineHand(0.016);
      return shake > 0.35 && GEH.prideRoom.position.length() > 0;
    })()`));

    // ---- the kids ----
    check('The children have legs that swing with the ground they cover', await run(`(() => {
      const kid = GEH.prideChildren[0];
      if (!kid.userData.legs || kid.userData.legs.length !== 2) return false;
      for (let i = 0; i < 40; i++) { time += 1 / 60; gehPrideChildren(null); }
      const walking = Math.abs(kid.userData.legs[0].rotation.x), pace = kid.userData.pace;
      const held = kid.position.clone();
      for (let i = 0; i < 120; i++) { time += 1 / 60; kid.position.copy(held); gehStepChild(kid, held.x, held.z); }
      return walking > 0.05 && pace > 0.2 && Math.abs(kid.userData.legs[0].rotation.x) < 0.02;
    })()`));
    check('Both legs swing out of phase with each other', await run(`(() => {
      const kid = GEH.prideChildren[0];
      for (let i = 0; i < 40; i++) { time += 1 / 60; gehPrideChildren(null); }
      const a = kid.userData.legs[0].rotation.x, b = kid.userData.legs[1].rotation.x;
      return Math.abs(a - b) > 0.05;
    })()`));

    // ---- the tear will not open for one ----
    check('A companion away from the tear holds the door shut', await run(`(() => {
      GEH.inPride = false; GEH.prideHeldAt = -1e9; GEH.kingdom.transit = null;
      NET.role = 'host';
      NET.peers.set('p1', { id: 'p1', ready: true });
      NET.avatars.set('mate', { id: 'mate', via: 'p1', look: { name: 'Mate' }, state: { pos: V3(GEH.cx + 200, GEH.floor + 1, GEH.cz), dead: false, hp: 20, maxHp: 20 } });
      const away = gehPrideAway();
      return away.length === 1 && away[0] === 'Mate' && gehPrideAdmit() === false && !GEH.kingdom.transit;
    })()`));
    check('The whole party at the tear opens it for everyone at once', await run(`(() => {
      const gate = GEH.kingdom.portal;
      NET.avatars.get('mate').state.pos.set(gate.x + 2, gate.y, gate.z + 2);
      GEH.kingdom.transit = null; GEH.kingdom.cooldown = 0;
      return gehPrideAway().length === 0 && gehPrideAdmit() === true && !!GEH.kingdom.transit && GEH.kingdom.transit.enter === true;
    })()`));
    await run(`NET.avatars.delete('mate'); NET.peers.delete('p1'); NET.role = null; GEH.kingdom.transit = null; GEH.inPride = true;`);

    // ---- the hand comes down ----
    await run(`(() => {
      const e = GEH.lucifer;
      document.getElementById('subs').textContent = '';
      e.armed = true; e.scenePhase = 'hold'; e.hp = 0; e.phase = 3; e.bodyScale = 2.4;
      GEH.godHand.visible = true; GEH.godHand.position.set(e.pos.x, e.pos.y + 12, e.pos.z);
      gehLuciferDown();
    })()`);
    check('He has no last word over the hand', await run(`AFTERLIFE.phase === 'release' && !document.getElementById('subs').textContent.includes('Lucifer')`));
    check('The room is still lit and both of them are still there at the start', await run(`GEH.prideDark === 0 && GEH.lucifer.mesh.visible && hero.visible`));
    await step(1.9);
    check('The hand takes Lucifer and the player together', await run(`!GEH.lucifer.mesh.visible && !hero.visible && inputLock`));
    check('The hand lifts away with them instead of staying down', await run(`GEH.godHand.position.y > GEH.lucifer.pos.y`));
    check('The white room is coming apart but is not dark yet', await run(`GEH.prideDark > 0 && GEH.prideDark < 1 && GEH.prideMats.some(m => m.color.r < m.userData.prideBase.r)`));
    await step(6.0);
    check('Nothing is left to light once the room is finished', await run(`GEH.prideDark === 1 && GEH.prideMats.every(m => m.color.r < 0.002 && m.color.g < 0.002 && m.color.b < 0.002) && !GEH.godHand.visible`));
    check('The screen is black and no question has been asked yet', await run(`document.getElementById('fade').style.opacity === '1' && !CHOICE && AFTERLIFE.phase === 'release'`));
    await step(3.0);
    check('The black is still held three seconds into it', await run(`!CHOICE && AFTERLIFE.phase === 'release'`));
    await step(2.4);
    check('The two answers arrive five seconds after the last of the light', await run(`!!CHOICE && AFTERLIFE.phase === 'choice' && !document.getElementById('choice').classList.contains('hidden')`));

    // ---- move on ----
    await run(`answerChoice(1)`);
    check('Move on queues the storybook rather than a black screen', await run(`AFTERLIFE.phase === 'modern' && AFTERLIFE.slide === 0 && !!AFTERLIFE.panel`));
    await step(1.5);
    check('The storybook survives the frames of the finale clock that follow it', await run(`AFTERLIFE.phase === 'modern' && AFTERLIFE.slide === 0 && !!document.getElementById('afterlife')`));
    await page.click('#afterlife button');
    await page.click('#afterlife button');
    check('All three slides play through', await run(`AFTERLIFE.phase === 'modern' && AFTERLIFE.slide === 2`));
    await page.click('#afterlife button');
    check('The credits roll at the end of the slideshow', await run(`AFTERLIFE.phase === 'credits' && !!document.querySelector('#afterlife .credits-roll')`));
    await page.click('#afterlife button');
    check('The road ends on a title card offering a new game or the valley', await run(`AFTERLIFE.phase === 'title' && !!document.getElementById('endNew') && !!document.getElementById('endStay')`));

    // ---- return to wildmoor from the title card ----
    await page.click('#endStay');
    check('Returning to Wildmoor gives back the body, the controls and the screen', await run(`
      WORLDSTATE.afterlife === 'stay' && AFTERLIFE.phase === null && !AFTERLIFE.panel &&
      P.pos.y > DIVIDE && hero.visible && !inputLock &&
      document.getElementById('fade').style.opacity === '0' && GEH.prideDark === 0 &&
      GEH.prideMats.every(m => Math.abs(m.color.r - m.userData.prideBase.r) < 1e-6)`));
    await step(2.0);
    check('The finished finale never reopens the question behind you', await run(`!CHOICE && AFTERLIFE.phase === null && document.getElementById('fade').style.opacity === '0' && document.getElementById('choice').classList.contains('hidden')`));

    // ---- and the other answer, taken from the choice itself ----
    await run(`(() => {
      WORLDSTATE.afterlife = null; AFTERLIFE.phase = 'release'; NET.gehFinaleLocal = true;
      GEH.netFinale.t = GEH_END_CHOICE - 0.05;
      P.pos.set(GEH.cx + GEH_PRIDE_X, GEH.floor + 9, GEH.cz + GEH_PRIDE_Z - 6); GEH.inPride = true;
    })()`);
    await step(0.3);
    check('The question is asked again on a run that never answered it', await run(`!!CHOICE && AFTERLIFE.phase === 'choice'`));
    await run(`answerChoice(0)`);
    check('Stay returns you to the valley and clears the black screen', await run(`WORLDSTATE.afterlife === 'stay' && AFTERLIFE.phase === null && P.pos.y > DIVIDE && !inputLock && document.getElementById('fade').style.opacity === '0'`));
    await step(2.0);
    check('Staying is not undone by the frames that follow it', await run(`!CHOICE && AFTERLIFE.phase === null && P.pos.y > DIVIDE && document.getElementById('fade').style.opacity === '0'`));

    check('No browser or shader errors', errors.length === 0);
    const result = { ok: true, total: checks.length, checks, errors, scope: 'One local page; the finale clock is stepped by hand rather than by the render loop' };
    fs.writeFileSync('artifacts/qa-lucifer-ending.json', JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.log(JSON.stringify({ errors }, null, 2));
    try { console.log('STATE', await run(`({phase:AFTERLIFE.phase, dark:GEH.prideDark, t:GEH.netFinale&&GEH.netFinale.t, choice:!!CHOICE, y:P.pos.y, fade:document.getElementById('fade').style.opacity})`)); } catch (_) {}
    throw error;
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
