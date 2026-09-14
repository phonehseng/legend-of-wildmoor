(async () => {
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  await window.gehBuildWorld();
  if (!GEH.kingdomRoot) gehBuildKingdom();
  check(GEH.kingdomRoot && GEH.kingdom, "still kingdom did not build");
  const fixtures = GEH.lampPos.filter(p => p.kingdom === true);
  check(GEH_LAMPS.length === 8, `reusable Gehenna light pool changed size (${GEH_LAMPS.length})`);
  check(fixtures.length === 8, `kingdom registered ${fixtures.length} route fixtures instead of eight`);
  check(!GEH.kingdomRoot.getObjectByName("gehenna-kingdom-light-pools"), "fake light discs must not float beyond the raised road");
  check(fixtures.some(p => Math.hypot(p.x - (GEH.cx + 136), p.z - (GEH.cz + 8)) < 10), "kingdom approach has no fixture");
  check(fixtures.some(p => Math.hypot(p.x - (GEH.cx + 80), p.z - (GEH.cz + 78)) < 15), "central avenue has no fixture");
  check(fixtures.some(p => Math.hypot(p.x - (GEH.cx + 48), p.z - (GEH.cz + 78)) < 9), "tower door has no fixture");

  GEH.inPride = false;
  WORLDSTATE.gehUnlocked = true;
  gehK = 1;
  dayT = 0.75;
  P.pos.set(GEH.cx + 136, GEH.kingdom.y + 0.08, GEH.cz + 3);
  P.vel.set(0, 0, 0); P.heading = 0; P.lookY = 0;
  camYaw = Math.PI; camPitch = 0.11; camDist = 12;
  await new Promise(resolve => setTimeout(resolve, 900));
  check(GEH_LAMPS.some(light => light.intensity > 0), "route fixtures never occupied the reusable light pool");
  return { poolSlots: GEH_LAMPS.length, routeFixtures: fixtures.length, approach: true, centralAvenue: true, towerDoor: true };
})()
