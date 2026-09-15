(async()=>{
  const checks=[],check=(v,s)=>{if(!v)throw Error(s+' '+JSON.stringify({pos:P.pos,swim:P.swim,grounded:P.grounded,vel:P.vel,touch:{x:TOUCH.x,z:TOUCH.z},lying:P.lying,lock:inputLock,phase:AFTERLIFE.phase,vol:swimVolAt(P.pos.x,P.pos.z,P.pos.y).id,ground:groundAt(P.pos.x,P.pos.z,P.pos.y),pride:GEH.inPride}));checks.push(s);};
  paused=true;Voice.on=false;Voice.stop();
  // Focused world fixture. The separate full-journey report is the earned progression evidence.
  WORLDSTATE.gehUnlocked=true;WORLDSTATE.afterlife=null;WORLDSTATE.luciferDefeated=false;WORLDSTATE.gehFinaleWitnessed=false;GEH.seed=4321;
  await window.gehBuildWorld();GEH.inPride=true;GEH.prideRoom.visible=true;
  // before lucifer lets go the road ends at the hill portal, not at the kingdom; only one of the two is built.
  for(const root of [GEH.kingdomRoot,GEH.hillPortalRoot,GEH.cityRoot])if(root)root.visible=false;
  // this fixture was written when the white room sat at (cx-85, cz+60); PX/PZ carry its coordinates to wherever
  // GEH_PRIDE_X/Z put the room now, so the numbers below still name the same bank, bridge and doorway.
  const PX=GEH_PRIDE_X+85,PZ=GEH_PRIDE_Z-60;
  const move=(x,z,y=GEH.floor+9)=>{releaseKeys();P.pos.set(GEH.cx+x,y,GEH.cz+z);P.vel.set(0,0,0);P.swim=false;P.swimVol=null;P.gehDive=null;P.grounded=true;P.climb=null;P.noSwim=0;P.lying=false;sleepT=0;inputLock=false;visY=P.pos.y;lastSafePos.copy(P.pos);};
  const tick=(seconds)=>{paused=false;for(let t=0;t<seconds;t+=.025){time+=.025;update(.025,.025);}paused=true;};
  const drive=(x,z)=>{const c=Math.cos(camYaw),s=Math.sin(camYaw);TOUCH.x=x*c-z*s;TOUCH.z=x*s+z*c;};
  const river=GEH.prideWater.volume,rx=GEH.prideWater.center(PZ+63),y=GEH.floor+9;
  check(SWIM_VOLS.filter(v=>v.id==='pride-river').length===1,'one bounded river volume');
  check(Math.abs(gehH(GEH.cx+rx,GEH.cz+PZ+63)-(y-2.8))<.001,'visible profile has 2.8m collision depth');
  check(swimVolAt(GEH.cx+PX-82,GEH.cz+PZ+68,y).dry,'boss arena stays dry');
  check(swimVolAt(GEH.cx+rx,GEH.cz+PZ+63,20).id!=='pride-river','river does not affect valley above it');
  move(rx+6,PZ+63);tick(.2);check(!P.swim,'bank begins dry');
  drive(-1,0);let enterT=0;while(!P.swim&&enterT<9){tick(.1);enterT+=.1;}releaseKeys();
  check(P.swim&&P.swimVol===river,'walking from shore enters normal swim state');
  const enter={x:P.pos.x,y:P.pos.y,z:P.pos.z,air:P.air};
  const skillBefore=SK.swimming.xp,airBefore=P.air;drive(-1,0);tick(.8);releaseKeys();
  check(P.swim&&P.pos.x<enter.x-.5,'real movement propels player across water');
  check(P.air<airBefore&&Number.isFinite(P.air),'normal swimming consumes finite air');
  check(SK.swimming.xp>skillBefore,'normal swimming grants practice');
  const packet=netMyState();check(!!(packet.f&16)&&packet.y<DIVIDE,'normal player packet carries swimming below divider');
  netAddAvatar('river-qa-peer',netLook(),null,P.hp,P.maxHp);const avatar=NET.avatars.get('river-qa-peer');
  check(netApplyState(avatar,{...packet,id:'river-qa-peer'}),'remote avatar accepts river packet');
  check(avatar.state.swim&&avatar.target.y<DIVIDE,'remote avatar retains river swim pose and depth');
  const airWet=P.air;drive(1,0);let exitT=0;while((P.swim||P.pos.x<GEH.cx+rx+5.4)&&exitT<12){tick(.1);exitT+=.1;}releaseKeys();const airOnShore=P.air;tick(1);
  check(!P.swim&&P.swimVol===null&&P.grounded,'swimming onto sloped shore exits cleanly');
  check(P.air>airOnShore||P.air===100,'air recovers on dry ground');
  const dryPacket=netMyState();check(!(dryPacket.f&16)&&netApplyState(avatar,{...dryPacket,id:'river-qa-peer'})&&!avatar.state.swim,'remote avatar exits swim from ordinary packet');netRemoveAvatar('river-qa-peer');
  const bx=GEH.prideWater.center(PZ+55);move(bx-6,PZ+55);drive(1,0);let crossed=false,bridgeDry=true;for(let t=0;t<5;t+=.1){tick(.1);bridgeDry=bridgeDry&&!P.swim;if(P.pos.x>GEH.cx+bx+5.7){crossed=true;break;}}releaseKeys();check(bridgeDry,'bridge traversal stays dry');check(crossed,'bridge carries player across both banks');
  const hut=GEH.prideHut;move(hut.x-GEH.cx,hut.doorZ-GEH.cz+2);drive(0,-1);tick(1.2);releaseKeys();check(P.pos.z<hut.doorZ-.6&&Math.abs(P.pos.x-hut.doorX)<.2,'player walks through wide hut entrance');
  drive(0,1);tick(1.2);releaseKeys();check(P.pos.z>hut.doorZ+.6,'player walks back out of hut');
  const wall=V3(hut.x+3.5,y,hut.z);resolveStructs(wall,.38);check(Math.abs(wall.x-(hut.x+3.5))>.4,'hut side walls collide');
  const poses=GEH.prideChildren.map(c=>c.position.clone());time+=8;gehPrideChildren();
  check(GEH.prideChildren.every((c,i)=>c.position.distanceTo(poses[i])>.3),'all three children roam');
  let childSolid=false,childWet=false,releaseSafe=true;for(let t=0;t<60;t+=.2){time=t;gehPrideChildren();for(const c of GEH.prideChildren){const p=c.position.clone();resolveStructs(p,.2);childSolid=childSolid||p.distanceTo(c.position)>.001;childWet=childWet||gehPrideRiverAt(c.position.x,c.position.z).wet;}}
  check(!childSolid,'child play paths avoid solids throughout a minute');check(!childWet,'child play paths avoid deep river throughout a minute');
  for(let t=0;t<18;t+=.1){gehPrideChildren(t);for(const c of GEH.prideChildren)releaseSafe=releaseSafe&&c.position.y>=gehGroundAt(c.position.x,c.position.z,y+1)-.02&&(!gehPrideRiverAt(c.position.x,c.position.z).wet||c.position.y>river.top);}
  check(releaseSafe,'release routes use dry ground or the bridge');
  const flowBefore=[...GEH.prideWater.flow.instanceMatrix.array];time+=4;gehUpdateFinale(.1);check([...GEH.prideWater.flow.instanceMatrix.array].some((v,i)=>v!==flowBefore[i]),'water current highlights animate');
  move(PX-85,PZ+42);tick(.1);check(!P.swim&&!P.swimVol,'portal landing remains dry');
  window.__riverQa={move,tick,drive,checks,river,enter,enterT,exitT,PX,PZ};
  return {ok:true,checks:checks.length,uniqueChecks:[...new Set(checks)],enter,enterT,exitT,river:{top:river.top,floor:river.floor},hut};
})()
