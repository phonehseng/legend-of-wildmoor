(async () => {
  const checks = [], check = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
  const speech = () => document.querySelector("#subs").lastElementChild?.textContent || "";
  const captureVoice = action => {
    const original = Voice.say, calls = [];
    Voice.say = (line, actor) => { calls.push({ line, pitch: actor.pitch, rate: actor.rate }); return true; };
    try { action(); return calls; } finally { Voice.say = original; }
  };
  const move = pos => {
    P.pos.copy(pos); P.vel.set(0, 0, 0); P.swim = false; P.gehDive = null;
    P.climb = null; P.grounded = true; P.carry = false; visY = P.pos.y; lastSafePos.copy(P.pos);
  };
  paused = true; NET.role = null; NET.peers.clear(); NET.avatars.clear();
  Voice.stop();
  if (GEH.root) gehTeardown("world-choice fixture reset");
  if (AFTERLIFE.panel) AFTERLIFE.panel.remove();
  AFTERLIFE.panel = null;
  WORLDSTATE.gehUnlocked = true;
  WORLDSTATE.gehAlmonerDown = WORLDSTATE.gehMatronDown = WORLDSTATE.gehHeapDown = WORLDSTATE.gehDone = true;
  WORLDSTATE.luciferDefeated = WORLDSTATE.gehFinaleWitnessed = false;
  WORLDSTATE.afterlife = null; AFTERLIFE.phase = null; NET.gehFinaleLocal = false;
  GEH.seed = 4321;
  await window.gehBuildWorld();
  GEH.inPride = false;
  const residents = GEH.kingdomResidents.slice(), origins = residents.map(r => r.pos.clone()), valleyNpcs = npcs.slice();
  check(residents.length === 8, "eight kingdom residents exist before the confrontation");
  check(!GEH.prideShelter, "Pride contains no cage or tethers around the children");
  const oldReplies = [];
  for (const resident of residents) {
    move(resident.pos.clone().add(V3(0, 0, 1)));
    check(GEH_SCRIPT.interact(), "resident " + resident.id + " can speak before the confrontation");
    const first = speech(); GEH_SCRIPT.interact();
    check(resident.beat === 2 && speech() !== first, "resident " + resident.id + " has two existing replies");
    oldReplies.push(speech());
  }
  const speakerPositions = ["sweeper", "bench", "clerk", "porter", "matron", "caller", "bel", "still", "kindly", "wall"]
    .map(id => GEH_SCRIPT.netSpeaker(id)?.pos).filter(Boolean);
  const quietSeat = GEH.seats.find(s => speakerPositions.every(p => dist2D(s, p) >= 4.5) && residents.every(r => dist2D(s, r.pos) >= 3.3));
  check(!!quietSeat, "an ordinary Gehenna seat is available away from named speakers");
  move(V3(quietSeat.x, quietSeat.y, quietSeat.z));
  check(GEH_SCRIPT.interact() && /Ysolde/.test(speech()), "an ordinary Gehenna resident answers the search for Ysolde");
  check(!/reborn|reincarnat/i.test(speech()), "earlier Gehenna dialogue leaves Ysolde's fate unpronounced");

  GEH.inPride = true;
  const lucifer = GEH.lucifer;
  move(lucifer.pos.clone().add(V3(0, 0, -3)));
  const intro = captureVoice(() => {
    for (let i = 0; i < 5; i++) check(gehInteractLucifer(), "Lucifer future-plan introduction beat " + (i + 1));
  });
  check(intro.length === 5 && intro.every(v => Number.isFinite(v.pitch) && Number.isFinite(v.rate)), "all five Lucifer introduction lines request actual configured TTS");
  check(intro.some(v => /Wildmoor/.test(v.line) && /life after life/.test(v.line)), "Lucifer's spoken concern includes repeated suffering throughout Wildmoor");
  check(intro.some(v => /Once I turn that hand away/.test(v.line)) && intro.some(v => /No one would have to choose wrong again/.test(v.line)), "spoken introduction makes control a future plan following victory over the hand");
  check(intro.some(v => /Ysolde/.test(v.line)) && intro.every(v => !/reborn|reincarnat/i.test(v.line)), "Lucifer acknowledges Ysolde without explaining away her absence");
  time += 3; gehPrideChildren();
  const childrenBefore = GEH.prideChildren.map(c => c.position.clone());
  check(GEH.prideChildren.length === 3 && GEH.prideChildren.every(c => c.visible), "all three children are present before Lucifer abandons his plan");
  time += 1; gehPrideChildren();
  check(GEH.prideChildren[0].position.distanceTo(childrenBefore[0]) > .01 && GEH.prideChildren[1].position.equals(childrenBefore[1]) && GEH.prideChildren[2].position.distanceTo(childrenBefore[2]) > .01, "children already play, rest and explore before the confrontation ends");
  lucifer.armed = true; lucifer.scenePhase = "hold"; lucifer.bodyScale = 2.4; lucifer.phase = 2; lucifer.holdPause = 0;
  damageEnemy(lucifer,1000,P.pos,0,true);
  const answerVoice = captureVoice(() => {
    for (let i = 0; i < 400 && !WORLDSTATE.luciferDefeated; i++) { time += .05; gehUpdateLucifer(lucifer,P,0,0,0,.05); }
  });
  check(answerVoice.some(v => v.line === "I was going to choose for everyone. I had not asked anyone."), "Lucifer admits an unexecuted plan to choose for everyone");
  check(answerVoice.some(v => v.line === "No. I will not do that to you."), "Lucifer explicitly abandons that plan");
  check(WORLDSTATE.luciferDefeated && lucifer.alive && !lucifer.armed, "the confrontation ends without killing Lucifer");
  for (const t of [0, 3, 9, 18]) {
    gehPrideChildren(t);
    check(GEH.prideChildren.every(c => c.visible), "children remain in the scene at aftermath time " + t);
  }

  // Victory changes no resident's agency or private ending eligibility.
  AFTERLIFE.phase = null; WORLDSTATE.gehFinaleWitnessed = false; NET.gehFinaleLocal = false;
  if (GEH.netFinale) GEH.netFinale.members = [];
  NET.role = "host"; paused = false;
  move(V3(0, groundAt(0, TOWN_R + 12, 1e9) + 0.1, TOWN_R + 12));
  P.vel.set(1, 0, 2); keys.w = true;
  const control = { pos: P.pos.clone(), vel: P.vel.clone(), hp: P.hp, stam: P.stam, inputLock, scale: hero.scale.clone() };
  updateAfterlife(9);
  check(residents.every((r, i) => r.pos.equals(origins[i])), "ending the plan does not newly animate or relocate kingdom residents");
  check(residents.every(r => r.mesh.parent === GEH.kingdomRoot && r.mesh.visible) && GEH.kingdomResidents.every((r, i) => r === residents[i]), "the confrontation keeps every kingdom resident present");
  check(npcs.length === valleyNpcs.length && valleyNpcs.every(n => npcs.includes(n)), "the confrontation removes no Wildmoor NPCs");
  check(P.pos.equals(control.pos) && P.vel.equals(control.vel) && P.hp === control.hp && P.stam === control.stam && hero.scale.equals(control.scale) && inputLock === control.inputLock && keys.w && !paused && !afterlifeLocked() && !CHOICE, "shared aftermath preserves the valley host's controls and body");
  NET.role = "guest"; updateAfterlife(0);
  check(!WORLDSTATE.gehFinaleWitnessed && !NET.gehFinaleLocal && !afterlifeLocked() && !CHOICE && P.pos.equals(control.pos), "a nonparticipant guest receives victory without a private ending");
  NET.role = null; releaseKeys(); paused = true; GEH.inPride = false;
  for (let i = 0; i < residents.length; i++) {
    move(residents[i].pos.clone().add(V3(0, 0, 1)));
    check(GEH_SCRIPT.interact() && speech() === oldReplies[i] && residents[i].beat === 2, "resident " + residents[i].id + " retains existing dialogue and agency after victory");
  }
  GEH.kingdom.cooldown = 0; GEH.kingdom.transit = null;
  move(V3(GEH.cx - 85, GEH.kingdom.y, GEH.cz + 40.8));
  gehUpdateKingdom(.25); gehUpdateKingdom(.7);
  check(!GEH.inPride && GEH.kingdomRoot.visible && !GEH.prideRoom.visible && P.pos.x > GEH.cx, "Pride's return door opens after the confrontation for a nonparticipant");
  WORLDSTATE.marenFreed = true; STORY.solved = true; WORLDSTATE.blackPoolAwake = false;
  move(MAREN.pos.clone()); P.herbs = 3; P.hp = P.maxHp - 1; P.stam = 0;
  storyTalk(MAREN);
  check(P.herbs === 0 && P.hp === P.maxHp && P.stam === stamMax() && /Three moor-herbs/.test(speech()), "Maren still offers healing after the confrontation");
  storyTalk(MAREN);
  check(/where the herbs are/.test(speech()), "Maren retains her existing post-rescue story instead of newly receiving agency");
  WORLDSTATE.wardenDead = true; WORLDSTATE.ysoldeBuried = false;
  move(WICK.pos.clone()); storyTalk(WICK);
  check(/Take her body from the water/.test(speech()) && /grave/.test(speech()), "Wick's burial instructions retain priority");
  WORLDSTATE.ysoldeBuried = true; WORLDSTATE.ending = null; storyTalk(WICK);
  check(/cut wood again tomorrow/.test(speech()), "Wick retains his existing post-investigation dialogue");
  WORLDSTATE.blackPoolAwake = true; WORLDSTATE.hermitTold = false;
  move(hermitPos.clone()); paused = false; P.interactCd = 0; ARREST.phase = null;
  interact();
  check(WORLDSTATE.hermitTold && /old door under that pool/.test(speech()), "the actual hermit interaction retains his existing story progression");
  check(!afterlifeLocked() && !CHOICE && !WORLDSTATE.gehFinaleWitnessed, "Wildmoor remains playable for a nonparticipant");
  return { checks, total: checks.length };
})()
