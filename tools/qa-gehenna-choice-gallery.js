(async () => {
  // Repeat three times with --checkpoint between runs: children, hand, abandoned plan.
  const stage = window.__gehChoiceGalleryStage || 0;
  Voice.on = false; Voice.stop(); paused = true;
  if (!GEH.root) {
    WORLDSTATE.wardenDead = WORLDSTATE.ysoldeBuried = WORLDSTATE.gehUnlocked = true;
    WORLDSTATE.gehAlmonerDown = WORLDSTATE.gehMatronDown = WORLDSTATE.gehHeapDown = WORLDSTATE.gehDone = true;
    WORLDSTATE.luciferDefeated = WORLDSTATE.gehFinaleWitnessed = false; WORLDSTATE.afterlife = null;
    GEH.seed = 4321; await window.gehBuildWorld();
  }
  GEH.inPride = true; GEH.prideRoom.visible = true; GEH.kingdomRoot.visible = false;
  const e = GEH.lucifer;
  P.pos.set(GEH.cx - 75.5, GEH.floor + 9, GEH.cz + 57); P.vel.set(0, 0, 0);
  P.swim = false; P.swimVol = null; P.gehDive = null; P.climb = null; P.grounded = true;
  P.heading = Math.PI; P.armed = 0; P.atk = null; P.block = false;
  visY = P.pos.y; lastSafePos.copy(P.pos);
  releaseKeys(); camYaw = -1.9; camPitch = 0.16; camDist = 12;
  deepK = 1; gehK = 1; interiorK = 0; caveK = 0;
  const settleCamera = () => {
    // Let the restored trailing camera follow the real player through two seconds of game frames.
    paused = false;
    for (let frame = 0; frame < 120; frame++) update(1 / 60);
    paused = true;
  };
  if (stage === 0) {
    gehUpdateLucifer(e, P, 0, 0, 0, 0.05); gehUpdateFinale(0.05);
  } else if (stage === 1) {
    e.pos.set(GEH.cx - 85, GEH.floor + 9, GEH.cz + 68); e.heading = Math.PI;
    e.scenePhase = 'hold'; e.armed = true; e.beat = 5; e.phase = 2; e.hp = 30; e.bodyScale = 1.213333333;
    GEH.godHand.visible = true;
    gehUpdateLucifer(e, P, 0, 0, 0, 0.05); gehUpdateFinale(0.05);
    P.pos.set(GEH.cx - 90, GEH.floor + 9, GEH.cz + 58); visY = P.pos.y; lastSafePos.copy(P.pos);
    camYaw = Math.PI; camPitch = -0.12;
  } else if (stage === 2) {
    P.pos.set(GEH.cx - 90, GEH.floor + 9, GEH.cz + 58); visY = P.pos.y; lastSafePos.copy(P.pos);
    camYaw = Math.PI; camPitch = -0.12;
    settleCamera();
    gehLuciferDown(); updateAfterlife(14.7);
  } else throw Error('The choice gallery has three views');
  if (stage < 2) settleCamera();
  drawHUD(); drawBars(0.016);
  document.getElementById('fade').style.opacity = 0;
  await new Promise(resolve => setTimeout(resolve, stage < 2 ? 8500 : 1000));
  const caption = ['Lucifer with the children', 'Lucifer holds the hand', 'The plan is abandoned'][stage];
  showPlace(caption);
  window.__gehChoiceGalleryStage = stage + 1;
  return { caption, camera: camera.position.toArray(), children: GEH.prideChildren.map(c => ({ visible: c.visible, pos: c.position.toArray() })), alive: e.alive, scale: e.bodyScale };
})()
