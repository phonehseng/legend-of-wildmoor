(() => {
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const close = (a, b, epsilon = 0.15) => Math.abs(a - b) <= epsilon;
  const look = { name: "Burial QA", skin: 0xf0cdb0, hair: 0x5a2f16, style: "short", tunic: 0xc9ccd4, cape: 0x6d7280 };
  const peerA = { id: "qa-peer-a", ready: false };
  const peerB = { id: "qa-peer-b", ready: false };

  NET.role = "host";
  NET.peers.set(peerA.id, peerA);
  NET.peers.set(peerB.id, peerB);
  netAddAvatar("qa-alice", look, peerA.id, 4, 4);
  netAddAvatar("qa-bob", { ...look, name: "Burial QA Two" }, peerB.id, 4, 4);
  const alice = NET.avatars.get("qa-alice"), bob = NET.avatars.get("qa-bob");
  check(alice && bob, "real avatar creation did not produce both remote players");

  WORLDSTATE.wardenDead = true;
  WORLDSTATE.ysoldeLifted = false;
  WORLDSTATE.ysoldeBuried = false;
  WORLDSTATE.processionRear = false;
  WORLDSTATE.processionHale = false;
  Object.assign(BURIAL, { carrier: null, phase: "idle", phaseAt: burialNow(), token: 0, drop: BODY.pos.clone(), syncT: 0, earthT: 0 });
  alice.state.pos.copy(BODY.pos); alice.target.copy(BODY.pos);
  bob.state.pos.copy(BODY.pos); bob.target.copy(BODY.pos);

  hostBurialIntent(peerA, { action: "claim" });
  check(BURIAL.carrier === alice.id && BURIAL.phase === "carry", "host did not grant the first valid claim");
  hostBurialIntent(peerB, { action: "claim" });
  check(BURIAL.carrier === alice.id, "a second player displaced the active carrier");

  netApplyState(bob, { x: bob.state.pos.x, y: bob.state.pos.y, z: bob.state.pos.z, h: 0, vx: 0, vz: 0, f: 8, w: "sword", a: -1, at: 0, hp: 4, mh: 4, yc: true });
  check(!bob.state.carry, "avatar yc hint forged burial ownership");

  alice.state.heading = 0.7;
  alice.state.vel.set(1, 0, 0);
  updateCarriedBody(0.016);
  check(BODY.mesh.visible, "remote-carried body was hidden");
  check(close(BODY.pos.x, alice.state.pos.x) && close(BODY.pos.z, alice.state.pos.z) && close(BODY.pos.y, alice.state.pos.y + 1.4), "body pose did not follow the authoritative remote carrier");

  const carriedSave = parseSaveKey(makeSaveKey());
  check(carriedSave && carriedSave.ws.ysoldeLifted === true && carriedSave.ws.ysoldeBuried === false, "carried state did not survive the real save serializer");

  WORLDSTATE.processionRear = true;
  WORLDSTATE.processionHale = true;
  alice.state.pos.copy(GRAVE); alice.target.copy(GRAVE);
  hostBurialIntent(peerA, { action: "bury" });
  check(BURIAL.phase === "bury" && BURIAL.carrier === alice.id, "valid remote graveside intent did not begin burial");

  NET.role = "guest";
  const receivedToken = BURIAL.token + 1;
  applyBurialSnapshot({ t: "yb", carrier: alice.id, phase: "bury", age: 2.25, token: receivedToken, lifted: true, x: GRAVE.x, y: GRAVE.y, z: GRAVE.z, rear: true, hale: true });
  check(BURIAL.token === receivedToken && close(burialAge(), 2.25, 0.08), "elapsed snapshot age was not reconstructed on receipt");
  P.armed=3;P.block=true;P.atk={stage:0,t:0};
  applyBurialSnapshot({t:"yb",carrier:NET.myId,phase:"carry",age:0,token:receivedToken+1,lifted:true,x:GRAVE.x,y:GRAVE.y,z:GRAVE.z,rear:true,hale:true});
  check(P.carry&&!P.armed&&!P.block&&!P.atk,"guest ownership did not cancel equipped combat state");
  applyBurialSnapshot({t:"yb",carrier:alice.id,phase:"bury",age:2.25,token:receivedToken+2,lifted:true,x:GRAVE.x,y:GRAVE.y,z:GRAVE.z,rear:true,hale:true});

  NET.role = "host";
  BURIAL.phaseAt = burialNow() - (BURIAL_SECONDS - 0.1);
  updateBurial(0.016);
  check(!WORLDSTATE.ysoldeBuried, "burial committed before the visible animation completed");
  BURIAL.phaseAt = burialNow() - (BURIAL_SECONDS + 0.1);
  updateBurial(0.016);
  check(WORLDSTATE.ysoldeBuried && BURIAL.phase === "buried" && !BODY.mesh.visible, "burial did not commit through the real completion path");

  WORLDSTATE.ysoldeBuried = false;
  WORLDSTATE.ysoldeLifted = true;
  BURIAL.carrier = alice.id; BURIAL.phase = "carry"; BURIAL.drop = alice.state.pos.clone();
  alice.state.pos.set(GRAVE.x + 9, GRAVE.y, GRAVE.z + 4);
  burialPlayersGone([alice]);
  check(!BURIAL.carrier && BURIAL.phase === "idle" && BODY.mesh.visible, "carrier disconnect did not release the body");
  check(close(BURIAL.drop.x, alice.state.pos.x) && close(BURIAL.drop.z, alice.state.pos.z), "disconnect release lost the body location");
  const releasedSave = parseSaveKey(makeSaveKey());
  check(releasedSave && releasedSave.ws.ysoldeLifted === true && releasedSave.ws.ysoldeBuried === false, "released carry context was not serializable for autosave/new join recovery");

  return {
    authoritativeCarrier: true,
    forgedAvatarHintRejected: true,
    remoteBodyPose: true,
    animationSeconds: BURIAL_SECONDS,
    elapsedSnapshot: true,
    commitAfterAnimation: true,
    disconnectRelease: true,
    saveRoundTrip: true
  };
})()
