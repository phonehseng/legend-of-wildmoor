(() => {
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const close2 = (a, b, epsilon = 0.08) => Math.hypot(a.x - b.x, a.z - b.z) <= epsilon;
  const church = interiors.find(room => room.church);
  check(church, "the seeded world did not instantiate the abandoned church");
  check(CHURCH_CLAPPER && CHURCH_CLAPPER.id === "church:watch-clapper", "the seeded church did not instantiate its explicit clapper pickup");
  check(CHURCH_CLAPPER.mesh.children.length > 0, "the clapper pickup has no visible geometry");
  check(church.cx >= 550 && church.cx <= 650, `church center is not far east (${church.cx.toFixed(1)})`);

  const churchPickups = pickups.filter(p => p.id.startsWith("church:"));
  check(churchPickups.length >= 13, `only ${churchPickups.length} church items were built`);
  check(churchPickups.every(p => Math.hypot(p.pos.x - church.cx, p.pos.z - church.cz) < 32), "a church clue or quest item remained at the old site");
  check(Math.hypot(DISCOVERIES.emptyChurch.x - church.cx, DISCOVERIES.emptyChurch.z - church.cz) < 0.1, "church discovery marker remained at the old site");

  const door = churchPickups.find(p => p.id === "church:door");
  check(door, "church door reference clue is absent");
  const dx = door.pos.x - church.cx, dz = door.pos.z - church.cz;
  const longHalf = Math.max(church.w, church.d), alongX = church.w > church.d;
  const sign = Math.sign(alongX ? dx : dz) || 1;
  const entry = V3(church.cx + (alongX ? sign * (longHalf - 0.7) : 0), church.y + 0.25, church.cz + (alongX ? 0 : sign * (longHalf - 0.7)));
  const approach = V3(church.cx + (alongX ? sign * (longHalf + 1.4) : 0), church.y + 0.25, church.cz + (alongX ? 0 : sign * (longHalf + 1.4)));
  const entryResolved = entry.clone(), approachResolved = approach.clone();
  resolveStructs(entryResolved, 0.38); resolveStructs(approachResolved, 0.38);
  check(close2(entry, entryResolved) && close2(approach, approachResolved), "the front doorway or its first approach is blocked by a collider");
  for (let t = 0; t <= 14; t += 2) {
    const x = church.cx + (alongX ? sign * (longHalf + t) : 0), z = church.cz + (alongX ? 0 : sign * (longHalf + t));
    check(!isWater(x, z), `church entrance route crosses water at ${x.toFixed(1)}, ${z.toFixed(1)}`);
    check(Number.isFinite(terrainH(x, z)), "church entrance route has no terrain");
  }

  WORLDSTATE.hermitChurchTaken = false;
  WORLDSTATE.hermitChurchFound = false;
  WORLDSTATE.hermitChurchDone = false;
  lit = true; // 3.4: the hermit offers the beacon errand before anything else while the beacon is dark, and play cannot reach his warning without it
  WORLDSTATE.hermitWarned = true;
  WORLDSTATE.finaleStarted = false;
  WORLDSTATE.wardenDead = false;
  WORLDSTATE.ending = null;
  CHURCH_CLAPPER.taken = false;
  updateChurchQuestPickup();
  check(priorityQuest() === null, "The Last Watch incorrectly suppresses the side-errand journal");
  check(lastWatchObjective().text.startsWith("Ask the hermit"), "quest did not begin at the hermit");

  P.carry = false; P.interactCd = 0; P.pos.copy(hermitPos); P.pos.y = groundAt(P.pos.x, P.pos.z, 1e9) + 0.05;
  interact();
  check(WORLDSTATE.hermitChurchTaken, "real hermit interaction did not accept The Last Watch");
  check(!CHURCH_CLAPPER.hidden && CHURCH_CLAPPER.mesh.visible, "accepted quest did not reveal the clapper");
  check(lastWatchObjective().text.startsWith("Find the old watch-clapper"), "accepted quest objective is not the clapper errand");
  check(/far east/.test(lastWatchObjective().hint || ""), "accepted quest objective did not point east");
  renderQuestBook();
  check(document.getElementById("qb-main").textContent.includes("The Last Watch"), "The Last Watch is missing from the main journal");
  check(!document.getElementById("qb-side").textContent.includes("There is only this to do now"), "Last Watch hid the side-errand journal");

  for (const p of churchPickups) if (p !== CHURCH_CLAPPER) p.taken = true;
  P.interactCd = 0; P.pos.copy(CHURCH_CLAPPER.mesh.position);
  interact();
  check(CHURCH_CLAPPER.taken && WORLDSTATE.hermitChurchFound, "real pickup interaction did not set the shared found milestone");
  check(lastWatchObjective().text.startsWith("Return the watch-clapper"), "pickup did not advance the objective back to the hermit");
  CHURCH_CLAPPER.taken = false;
  check(!churchClapperFound(), "a non-finder was allowed to present somebody else's clapper");
  check(lastWatchObjective().text.startsWith("Return to the hermit with whoever found"), "party objective did not direct the non-finder back with the finder");

  P.interactCd = 0; P.pos.copy(hermitPos); P.pos.y = groundAt(P.pos.x, P.pos.z, 1e9) + 0.05;
  interact();
  check(!WORLDSTATE.hermitChurchDone, "a player who did not retrieve the clapper completed the hermit's quest");
  CHURCH_CLAPPER.taken = true;
  P.interactCd = 0;
  interact();
  check(WORLDSTATE.hermitChurchDone && lastWatchSatisfied(), "the actual clapper finder could not complete the hermit's quest");

  const key = makeSaveKey(), saved = parseSaveKey(key);
  check(saved && saved.ws.hermitChurchTaken && saved.ws.hermitChurchFound && saved.ws.hermitChurchDone, "church milestones failed save validation");
  WORLDSTATE.hermitChurchTaken = WORLDSTATE.hermitChurchFound = WORLDSTATE.hermitChurchDone = false;
  applySave(saved);
  check(WORLDSTATE.hermitChurchTaken && WORLDSTATE.hermitChurchFound && WORLDSTATE.hermitChurchDone, "church milestones did not restore through the real loader");

  WORLDSTATE.finaleStarted = false;
  startFinale();
  check(WORLDSTATE.finaleStarted, "completed Last Watch did not unlock the black-pool Warden finale");
  const actualClapper = CHURCH_CLAPPER;
  CHURCH_CLAPPER = null; WORLDSTATE.finaleStarted = false; WORLDSTATE.wardenDead = false; WORLDSTATE.ending = null; WORLDSTATE.hermitChurchDone = false;
  check(lastWatchSatisfied(), "a failed church site would softlock the finale");
  CHURCH_CLAPPER = actualClapper;
  WORLDSTATE.finaleStarted = true;
  check(lastWatchSatisfied(), "an existing finale save was forced to replay the new prerequisite");

  return {
    center: { x: +church.cx.toFixed(1), z: +church.cz.toFixed(1) },
    churchItems: churchPickups.length,
    dryOpenEntrance: true,
    pickupGeometry: true,
    journalKeepsErrands: true,
    finderOnlyTurnIn: true,
    saveLoad: true,
    finaleUnlock: true,
    migrationAndMissingSiteSafe: true
  };
})()
