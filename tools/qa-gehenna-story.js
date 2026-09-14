(async () => {
  const checks = [];
  const check = (ok, name) => { if (!ok) throw Error(name); checks.push(name); };
  const captureSpeech = action => {
    const original = Voice.say, calls = [];
    Voice.say = (line, actor) => { calls.push({ line, pitch: actor.pitch, rate: actor.rate }); return true; };
    try { action(); return calls; } finally { Voice.say = original; }
  };
  const move = pos => {
    P.pos.copy(pos); P.vel.set(0, 0, 0); P.swim = false; P.gehDive = null;
    P.climb = null; P.grounded = true; visY = P.pos.y; lastSafePos.copy(P.pos);
  };
  paused = true;
  WORLDSTATE.gehAlmonerDown = WORLDSTATE.gehMatronDown = WORLDSTATE.gehHeapDown = WORLDSTATE.gehDone = false;
  WORLDSTATE.luciferDefeated = false; WORLDSTATE.afterlife = null;
  GEH.seed = 4321;
  await window.gehBuildWorld();
  GEH.inPride = false;
  move(V3(GEH.cx + 25, GEH.floor + 1, GEH.cz));
  check(gehennaObjective().text === "Slay the Almoner, the demonic beast", "intake orders the Almoner's death");
  WORLDSTATE.gehAlmonerDown = true;
  check(/^Slay the Matron/.test(gehennaObjective().text), "second chapter names the Matron");
  check(/Strike the four seated/.test(gehennaObjective().hint), "Matron objective explains how to wake the four");
  WORLDSTATE.gehMatronDown = true;
  check(/^Slay the Unclaimed/.test(gehennaObjective().text), "third chapter names the Unclaimed");
  WORLDSTATE.gehHeapDown = true;
  check(gehennaObjective().text === "Slay the Kindly One" && /Clerk/.test(gehennaObjective().hint), "last account routes through the Clerk");
  check(gehennaObjective().target === GEH.clerkPos, "Clerk stage arrow uses the desk before the sister exists");
  WORLDSTATE.gehDone = true;
  const kingdomTarget = gehennaObjective().target;
  check(kingdomTarget.x === GEH.cx + 48 && kingdomTarget.z === GEH.cz + 78, "final road leads to the kingdom centre");
  const residents = GEH.kingdomResidents || [];
  check(residents.length === 8, "kingdom contains eight quiet residents");
  const first = residents[0];
  move(first.pos.clone().add(V3(0, 0, 1)));
  GEH_SCRIPT.tick(0.016);
  check(first.prompt && first.prompt.visible, "nearby resident has a readable prompt");
  const residentSpeech = captureSpeech(() => {
    check(GEH_SCRIPT.interact() && first.beat === 1, "resident delivers its first short line");
    const firstLine = document.querySelector("#subs").lastElementChild.textContent;
    check(GEH_SCRIPT.interact() && first.beat === 2, "resident has a second, shorter response");
    check(document.querySelector("#subs").lastElementChild.textContent !== firstLine, "resident responses vary on return");
  });
  check(residentSpeech.length === 0, "kingdom residents remain text-only");
  first.pos.x += 0.75;
  GEH_SCRIPT.tick(0.016);
  check(first.prompt.position.x === first.pos.x, "dialogue prompt follows a pushed resident");
  GEH.inPride = true;
  GEH_SCRIPT.tick(0.016);
  check(residents.every(r => !r.prompt.visible), "kingdom prompts do not show through the impossible room");
  const lucifer = GEH.lucifer;
  move(lucifer.pos.clone().add(V3(0, 0, -3)));
  lucifer.armed = false; lucifer.beat = 0;
  const luciferSpeech = captureSpeech(() => {
    for (let i = 0; i < 5; i++) check(gehInteractLucifer(), "Lucifer dialogue beat " + (i + 1));
  });
  check(luciferSpeech.length === 5 && luciferSpeech.every(v => Number.isFinite(v.pitch) && Number.isFinite(v.rate)), "Lucifer alone requests configured text-to-speech for all five lines");
  check(luciferSpeech.some(v => /Ysolde/.test(v.line) && /no one here by that name/.test(v.line)), "Lucifer directly answers the search for Ysolde");
  check(luciferSpeech.some(v => /life after life/.test(v.line) && /Wildmoor/.test(v.line)) && luciferSpeech.some(v => /Once I turn that hand away/.test(v.line)), "Lucifer explains a future plan to prevent repeated suffering");
  check(lucifer.beat === 5 && !lucifer.armed && !CHOICE, "Lucifer's plea ends before combat and without a player choice");
  check(lucifer.scenePhase === "omen" && lucifer.alive && lucifer.phase === 0, "dialogue starts the omen before any hold stage is broken");
  check(!gehInteractLucifer(), "the running confrontation cannot be started twice by interacting");
  check(/^Slay Lucifer/.test(gehennaObjective().text) && gehennaObjective().target === lucifer.pos, "quest keeps the slay order while following Lucifer");
  return { checks, total: checks.length };
})()
