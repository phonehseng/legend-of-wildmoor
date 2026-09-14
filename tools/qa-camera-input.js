(() => {
  const checks = [], check = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
  const before = { paused, inputLock, noLock, camYaw, camPitch, sens };
  const move = (x, y) => {
    const event = new MouseEvent('mousemove');
    Object.defineProperties(event, { movementX: { value: x }, movementY: { value: y } });
    window.dispatchEvent(event);
  };
  try {
    paused = false; inputLock = false; noLock = true; sens = 1; camYaw = 0; camPitch = 0.4;
    check(started && !gameplayOverlayOpen(), 'normal gameplay receives look input');
    move(10, 5);
    check(Math.abs(camYaw + 0.028) < 1e-9 && Math.abs(camPitch - 0.411) < 1e-9, 'normal mouse movement keeps its original sensitivity');
    const yaw = camYaw, pitch = camPitch;
    move(2000, 0); move(0, -2000);
    check(camYaw === yaw && camPitch === pitch, 'large pointer recentering jumps cannot rotate the view or movement direction');
    move(Infinity, 0); move(0, -Infinity);
    check(camYaw === yaw && camPitch === pitch, 'nonfinite movement is ignored');
    sens = 5; move(100, 0);
    check(camYaw === yaw, 'high sensitivity cannot amplify one anomalous event into a sudden turn');
    move(1, 1);
    check(Math.abs(camYaw - yaw + 0.014) < 1e-9 && Math.abs(camPitch - pitch - 0.011) < 1e-9, 'ordinary high-sensitivity input still works');
    return { checks, total: checks.length };
  } finally {
    paused = before.paused; inputLock = before.inputLock; noLock = before.noLock;
    camYaw = before.camYaw; camPitch = before.camPitch; sens = before.sens;
  }
})()
