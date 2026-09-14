(async()=>{
  paused=true;Voice.on=false;Voice.stop();NET.role=null;
  WORLDSTATE.wardenDead=true;WORLDSTATE.ysoldeLifted=true;WORLDSTATE.ysoldeBuried=false;
  WORLDSTATE.processionRear=true;WORLDSTATE.processionHale=true;applyWardenAftermath();
  P.pos.set(GRAVE.x,GRAVE.y,GRAVE.z+2.1);P.vel.set(0,0,0);P.heading=Math.PI;P.grounded=true;P.swim=false;
  P.climb=null;P.gehDive=null;P.lying=false;death=null;
  beginCarry();BURIAL.phase='bury';BURIAL.phaseAt=burialNow()-2.5;
  updateBurial(0.016);updateCarriedBody(0.016);
  if(Math.abs(BODY.mesh.rotation.x+Math.PI/2)>.01)throw Error('body must lie flat in the grave');
  animateHero(P,.2,time);hero.position.copy(P.pos);hero.rotation.y=P.heading;
  camYaw=.70;camPitch=.42;camDist=7;visY=P.pos.y;lastSafePos.copy(P.pos);
  dayT=.22;dayElev=.8;paused=false;update(.016);drawHUD();drawBars(.016);paused=true;
  await new Promise(r=>setTimeout(r,8500));
  return{phase:BURIAL.phase,body:BODY.mesh.position.toArray(),player:P.pos.toArray(),kneel:P.burial};
})()
