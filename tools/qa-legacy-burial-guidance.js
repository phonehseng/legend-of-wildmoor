(() => {
  const checks = [], profiles = [];
  const check = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
  const encode = d => {
    const raw = JSON.stringify(d); let out = '';
    for (let i = 0; i < raw.length; i++) out += String.fromCharCode(raw.charCodeAt(i) ^ ((i * 7 + 13) & 31));
    return 'WM1-' + btoa(unescape(encodeURIComponent(out)));
  };
  const baseline = parseSaveKey(makeSaveKey());
  check(!!baseline, 'Current writer supplies a valid baseline profile');
  for (const version of [3, 4]) for (const mourning of ['missing', 'false']) {
    const label = 'v' + version + ' kingMourned=' + mourning;
    const legacy = structuredClone(baseline);
    legacy.v = version;
    legacy.ws = { ...legacy.ws, wardenDead: true, ysoldeLifted: true, ysoldeBuried: true,
      gehUnlocked: false, gehDone: false, luciferDefeated: false, ending: null, afterlife: null };
    if (mourning === 'missing') delete legacy.ws.kingMourned;
    else legacy.ws.kingMourned = false;
    delete legacy.sk.blocking;
    legacy.side = Object.fromEntries(Object.entries(legacy.side || {}).map(([name, state]) => [name, state.slice(0, 2)]));
    const parsed = parseSaveKey(encode(legacy));
    check(!!parsed && parsed.v === version, label + ' passes actual legacy key parser');
    check(mourning === 'missing' ? parsed.ws.kingMourned === undefined : parsed.ws.kingMourned === false,
      label + ' reaches applySave without pre-normalizing the mourning flag');
    paused = true;
    WORLDSTATE.kingMourned = false;
    check(applySave(parsed), label + ' loads through actual applySave');
    check(WORLDSTATE.ysoldeBuried && WORLDSTATE.kingMourned, label + ' restores buried state and normalizes mourning');
    check(!gehAccessOpen(), label + ' keeps descent locked until sleep');
    const quest = priorityQuest(), guide = questGuideTarget();
    check(quest && quest.text === 'Rest in the nearest open bed' && quest.target && guide && guide.distanceTo(quest.target) < 0.001,
      label + ' priority text and guide agree on an open bed');
    P.pos.copy(guide); P.vel.set(0, 0, 0); visY = P.pos.y;
    P.gehDive = null; P.swim = false; P.climb = null; P.lying = false; P.interactCd = 0;
    sleepT = 0; inputLock = false; turnTo = null;
    updateCurrentRoom();
    check(!!bedHere(2.4), label + ' guide position reaches an interactable bed');
    paused = false;
    interact();
    check(sleepT > 0 && !!P.inBed, label + ' ordinary interaction starts sleep');
    for (let i = 0; i < 33; i++) updateSleeping(0.1);
    check(gehAccessOpen(), label + ' actual sleep opens the whirlpool');
    const after = priorityQuest();
    check(after && after.text === 'Enter the black pool portal' && after.target === POOL && questGuideTarget() === POOL,
      label + ' sleep advances both instruction and guide to the portal');
    profiles.push({ version, mourning, normalized: WORLDSTATE.kingMourned, before: quest.text, after: after.text });
  }
  paused = true;
  return { total: checks.length, checks, profiles };
})()
