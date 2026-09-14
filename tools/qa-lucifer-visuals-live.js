(async () => {
  const checks=[],check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
  paused=true;Voice.enabled=false;Voice.stop();
  WORLDSTATE.wardenDead=WORLDSTATE.ysoldeBuried=WORLDSTATE.gehUnlocked=true;
  WORLDSTATE.gehAlmonerDown=WORLDSTATE.gehMatronDown=WORLDSTATE.gehHeapDown=WORLDSTATE.gehDone=true;
  WORLDSTATE.luciferDefeated=WORLDSTATE.gehFinaleWitnessed=false;WORLDSTATE.afterlife=null;
  WORLDSTATE.gehSeed=GEH.seed=74821;await window.gehBuildWorld();
  GEH.inPride=true;GEH.prideRoom.visible=true;GEH.kingdomRoot.visible=false;
  const e=GEH.lucifer,rig=e.luciferRig,hand=GEH.godHand;
  e.pos.set(GEH.cx-85,GEH.floor+9,GEH.cz+68);e.mesh.position.copy(e.pos);e.heading=e.mesh.rotation.y=Math.PI;e.scenePhase='hold';e.bodyScale=2.4;e.holdPause=20;e.armed=true;
  P.pos.set(GEH.cx-93,GEH.floor+9,GEH.cz+57);P.vel.set(0,0,0);P.hp=P.maxHp=20;P.inv=0;P.dodge=0;P.gehDive=null;P.climb=null;P.swim=false;P.grounded=true;
  visY=P.pos.y;lastSafePos.copy(P.pos);releaseKeys();deepK=1;gehK=1;interiorK=0;caveK=0;
  paused=false;update(1/60);paused=true;
  hand.visible=true;hand.position.set(e.pos.x,e.pos.y+1.15+e.holdPalmHeight*2.4,e.pos.z);
  check(rig.cloak&&rig.robePositions.length===792,'full game builds the long skirt and draped cloak');
  check(hand.userData.fingers.length===5&&hand.userData.palmBottom===-1.15,'full game builds the five-part hand with preserved palm contact');
  const normalsFinite=mesh=>[...mesh.geometry.attributes.position.array,...mesh.geometry.attributes.normal.array].every(Number.isFinite);
  for(const mode of ['children','run','hold','release'])for(const scale of [.62,1.2,2.4]){
    gehPoseLucifer(e,mode,scale,time+.14);check(normalsFinite(rig.robe)&&normalsFinite(rig.cloak),mode+' / '+scale+' retains finite cloth in the full game');
  }
  gehPoseLucifer(e,'hold',2.4,time);
  if(typeof gehPoseLuciferThrow==='function'){
    const supporting=rig.arms[1].palm.position.clone();e.throwPose={t:.6,side:rig.arms[0].side,target:NET.myId};gehPoseLuciferThrow(e);
    check(rig.arms[0].palm.position.y<3&&rig.arms[1].palm.position.equals(supporting),'actual throw pose lowers one hand while its partner supports');e.throwPose=null;gehPoseLucifer(e,'hold',2.4,time);
  }
  gehUpdateDivineHand(1/60);check(GEH.divineAperture.visible&&GEH.divineAperture.material.uniforms.uOpen.value===1,'full-game overhead distortion opens beneath the opaque ceiling');
  const first=GEH.divineAperture.material.uniforms.uTime.value;
  time+=.25;gehUpdateDivineHand(.25);check(GEH.divineAperture.material.uniforms.uTime.value>first,'distortion uses the advancing scene clock');
  check(GEH.divineAperture.position.y+.065<GEH.floor+30.5,'animated aperture stays on the visible side of the actual ceiling');
  camera.position.set(GEH.cx-99,GEH.floor+15,GEH.cz+51);camera.lookAt(GEH.cx-85,GEH.floor+19,GEH.cz+65);camera.fov=53;camera.updateProjectionMatrix();
  renderer.clippingPlanes=GEH_CLIP;renderer.render(scene,camera);
  const sceneStats={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures};
  hand.visible=false;gehUpdateDivineHand(0);check(!GEH.divineAperture.visible,'distortion hides when the final hand withdraws');hand.visible=true;gehUpdateDivineHand(0);
  renderer.render(scene,camera);drawHUD();drawBars(1/60);document.getElementById('fade').style.opacity=0;
  await new Promise(resolve=>setTimeout(resolve,9000));
  return {total:checks.length,checks,sceneStats,throwHelperTested:typeof gehPoseLuciferThrow==='function'};
})()
