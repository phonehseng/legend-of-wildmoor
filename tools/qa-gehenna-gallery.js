(async () => {
  // Run this fixture three times in one browser, placing --checkpoint between runs.
  const stage = window.__gehGalleryStage || 0;
  Voice.on = false; Voice.stop(); paused = true;
  if (!GEH.root) {
    WORLDSTATE.wardenDead = WORLDSTATE.ysoldeBuried = WORLDSTATE.gehUnlocked = true;
    WORLDSTATE.gehAlmonerDown = WORLDSTATE.gehMatronDown = WORLDSTATE.gehHeapDown = WORLDSTATE.gehDone = true;
    GEH.seed = 4321;
    await window.gehBuildWorld();
  }
  const move = (x, z, yaw, pitch) => {
    P.pos.set(GEH.cx+x, GEH.floor+9, GEH.cz+z); P.vel.set(0,0,0);
    P.swim=false; P.swimVol=null; P.gehDive=null; P.climb=null; P.grounded=true;
    P.heading=yaw+Math.PI; P.armed=0; P.atk=null; P.block=false;
    visY=P.pos.y; lastSafePos.copy(P.pos); camYaw=yaw; camPitch=pitch; camDist=12;
  };
  const e=GEH.lucifer;
  if (stage===0) {
    move(102,78,Math.PI/2,.32);
  } else if(stage===1) {
    move(-83,46,Math.PI,.12);
    GEH.inPride=true; GEH.prideRoom.visible=true; GEH.kingdomRoot.visible=false;
  } else if(stage===2) {
    GEH.inPride=true; e.scenePhase='hold'; e.armed=true; e.beat=5;
    e.pos.set(GEH.cx-85,GEH.floor+9,GEH.cz+68); e.heading=Math.PI;
    e.hp=e.maxHp; e.bodyScale=2.4; GEH.godHand.visible=true;
    gehUpdateLucifer(e,P,0,0,0,.05);
    move(-85,50,Math.PI,-.06);
  } else throw Error('The gallery has three views');
  const freeze = () => {
    deepK=1; gehK=1; interiorK=0; caveK=0;
    releaseKeys(); paused=false;
    // Settle the restored trailing camera through normal game frames before freezing the scene.
    for(let frame=0;frame<120;frame++) update(1/60);
    drawHUD(); drawBars(.016); paused=true;
  };
  freeze();
  // Render using the live game camera and lighting. No model-only replacement scene.
  await new Promise(resolve=>setTimeout(resolve,8500));
  const caption=['The Still Kingdom','The Impossible Room','Lucifer holds the hand'][stage];
  showPlace(caption);
  window.__gehGalleryStage=stage+1;
  return {caption, player:P.pos.toArray(),camera:camera.position.toArray(),drawCalls:renderer.info.render.calls};
})()
