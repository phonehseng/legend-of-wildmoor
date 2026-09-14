(async () => {
  const checks = [], check = (ok, name) => { if (!ok) throw Error(name); checks.push(name); };
  paused = false; inputLock = false; sleepT = 0; death = null; P.inv = 999;
  for (const key in keys) keys[key] = false;
  const originalYaw = camYaw, originalPitch = camPitch, originalHeading = P.heading;
  camera.position.set(0, 3, 10); camera.lookAt(0, 3, 0);
  cameraFollow.ready = true; cameraFollow.yaw = camYaw; cameraFollow.pitch = camPitch;
  const before = camera.quaternion.clone();
  steadyCameraLookAt(1 / 60, 0, 3, 20);
  check(before.angleTo(camera.quaternion) <= 0.65 / 60 + 1e-6, 'a forced half-turn is limited to 0.65 radians per second');
  const stalled = camera.quaternion.clone(); steadyCameraLookAt(2, 0, 3, 20);
  check(stalled.angleTo(camera.quaternion) <= 0.65 * 0.05 + 1e-6, 'a stalled frame cannot produce a large forced turn');
  check(camYaw === originalYaw && camPitch === originalPitch && P.heading === originalHeading, 'camera safety does not turn the character or rewrite look input');
  camera.quaternion.setFromAxisAngle(V3(0, 1, 0), Math.PI - 0.01);
  cameraFollow.rotation.copy(camera.quaternion);
  const nearWrap = camera.quaternion.clone();
  const target = V3(0, 0, -1).applyAxisAngle(V3(0, 1, 0), -Math.PI + 0.01).add(camera.position);
  steadyCameraLookAt(1 / 60, target.x, target.y, target.z);
  check(nearWrap.angleTo(camera.quaternion) <= 0.65 / 60 + 1e-6, 'crossing the angle seam takes the short arc');
  camera.position.set(0, 3, 10); camera.lookAt(0, 3, 0);
  cameraFollow.yaw = camYaw; camYaw += 0.3;
  const manual = camera.quaternion.clone();
  steadyCameraLookAt(1 / 60, Math.sin(0.3) * 10, 3, 10 - Math.cos(0.3) * 10);
  check(manual.angleTo(camera.quaternion) > 0.25, 'deliberate look input retains a responsive turn allowance');
  cameraFollow.player.copy(P.pos);
  const offset = camera.position.clone().sub(P.pos);
  P.pos.add(V3(100, -300, 220)); followCameraTravel();
  check(camera.position.clone().sub(P.pos).distanceTo(offset) < 1e-8, 'large world travel preserves the camera offset');
  const samples = [];
  const place = position => {
    P.pos.copy(position); P.vel.set(0, 0, 0); P.swim = false; P.swimVol = null;
    P.gehDive = null; P.climb = null; P.lying = false; P.grounded = true;
    visY = P.pos.y; lastSafePos.copy(P.pos); updateCurrentRoom();
  };
  const frames = (label, count) => {
    let peak = 0;
    for (let i = 0; i < count; i++) {
      const previous = camera.quaternion.clone();
      const allowance = Math.hypot(wrapAngle(camYaw - cameraFollow.yaw), camPitch - cameraFollow.pitch) + 0.65 / 60;
      update(1 / 60);
      const angle = previous.angleTo(camera.quaternion); peak = Math.max(peak, angle);
      if (angle > allowance + 1e-5) throw Error(label + ' camera turn exceeds the limit: ' + angle);
      if (![...camera.position.toArray(), ...camera.quaternion.toArray()].every(Number.isFinite)) throw Error(label + ' has a nonfinite camera');
    }
    samples.push({ label, frames: count, peakDegrees: peak * 180 / Math.PI });
  };
  camYaw = originalYaw; camPitch = originalPitch;
  place(V3(90, terrainH(90, 90), 90));
  frames('valley travel', 90);
  keys.w = true; keys.shift = true; frames('sprinting', 90); keys.w = keys.shift = false;
  const hut = interiors.find(it => !it.church && !it.keep && !it.round && it.w > 3);
  check(!!hut, 'a real village interior is available');
  place(V3(hut.cx + hut.w - 0.8, hut.y + 0.05, hut.cz)); frames('tight interior edge', 60);
  GEH.seed = 4321; await window.gehBuildWorld();
  WORLDSTATE.gehDone = true; WORLDSTATE.luciferDefeated = true;
  GEH.inPride = false; GEH.kingdom.cooldown = 0; GEH.kingdom.transit = null;
  place(GEH.kingdom.portal.clone()); frames('kingdom arrival', 1);
  const portalYaw = camYaw, portalPitch = camPitch;
  gehUpdateKingdom(0.25); check(GEH.inPride, 'real portal enters Lucifer room');
  gehUpdateKingdom(1); frames('room arrival', 90);
  check(camYaw === portalYaw && camPitch === portalPitch, 'portal transit preserves the chosen look direction');
  check(camera.position.distanceTo(P.pos) < 30, 'camera remains near the player across world travel');
  check(samples.every(s => Number.isFinite(s.peakDegrees)), 'all sampled camera motion is finite and rate limited');
  paused = true;
  return { total: checks.length, checks, samples, frames: samples.reduce((n, s) => n + s.frames, 0) };
})()
