(async()=>{
  const church=interiors.find(it=>it.church);if(!church)throw Error('church missing');
  Voice.on=false;Voice.stop();paused=true;
  WORLDSTATE.hermitWarned=true;WORLDSTATE.hermitChurchTaken=true;WORLDSTATE.hermitChurchDone=false;
  const door=pickups.find(p=>p.id==='church:door').pos;
  const dx=door.x-church.cx,dz=door.z-church.cz,d=Math.hypot(dx,dz);
  P.pos.set(church.cx+dx/d*24,0,church.cz);P.pos.y=groundAt(P.pos.x,P.pos.z,church.y+2)+.05;
  P.vel.set(0,0,0);P.swim=false;P.swimVol=null;P.grounded=true;P.climb=null;P.gehDive=null;
  camYaw=Math.PI/2;camPitch=.03;camDist=5;P.heading=camYaw+Math.PI;visY=P.pos.y;lastSafePos.copy(P.pos);
  dayT=.20;dayElev=.8;tracked=null;
  paused=false;for(let i=0;i<100;i++)update(.016);drawHUD();drawBars(.016);paused=true;
  await new Promise(r=>setTimeout(r,8500));showPlace('the abandoned church');
  return{church:[church.cx,church.y,church.cz],player:P.pos.toArray(),camera:camera.position.toArray()};
})()
