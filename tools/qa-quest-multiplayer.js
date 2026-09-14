(async () => {
  const checks = [];
  const check = (ok, name) => { if (!ok) throw Error(name); checks.push(name); };
  const q = SIDE.find(q => /three slimes/i.test(q.title));
  check(!!q, "slime quest exists");

  const old = {
    role: NET.role,
    peers: [...NET.peers],
    avatars: [...NET.avatars],
    pos: P.pos.clone(),
    finaleStarted: WORLDSTATE.finaleStarted,
    wardenDead: WORLDSTATE.wardenDead,
    qTaken: q.taken,
    qDone: q.done,
    qSlimeRemote: q.slimeRemote,
    qSlimeRequestAt: q.slimeRequestAt,
    summons: [...questSlimeSummons]
  };
  const originalSlimes = new Set(slimes);
  const channel = sent => ({
    readyState: "open",
    send: raw => sent.push(JSON.parse(raw))
  });

  try {
    NET.peers.clear();
    NET.avatars.clear();
    questSlimeSummons.clear();
    WORLDSTATE.finaleStarted = false;
    WORLDSTATE.wardenDead = false;

    const sent = [];
    const peer = { id: "qa-peer", ready: true, ch: channel(sent) };
    const avatar = { id: "qa-player", via: peer.id, state: { pos: q.giver.pos.clone(), dead: false } };
    NET.role = "host";
    NET.peers.set(peer.id, peer);
    NET.avatars.set(avatar.id, avatar);

    avatar.state.pos.copy(q.giver.pos).add(V3(30, 0, 0));
    hostQuestSlimes(peer);
    check(slimes.filter(s => !originalSlimes.has(s)).length === 0, "host rejects a request outside the giver radius");

    avatar.state.pos.copy(q.giver.pos);
    peer.questSlimeAt = -Infinity;
    P.pos.set(q.giver.pos.x, DIVIDE - 20, q.giver.pos.z);
    hostQuestSlimes(peer);
    const spawned = slimes.filter(s => !originalSlimes.has(s));
    check(spawned.length === 3, "near bound guest creates exactly three host slimes");
    check(spawned.every(s => s.pos.y > DIVIDE), "host can summon valley quest slimes while its own player is underground");
    check(sent.some(m => m.t === "qslime" && m.ok === true), "host acknowledges the accepted request");
    check(sent.some(m => m.t === "en" && Array.isArray(m.sl)), "host broadcasts the authoritative enemy snapshot");

    peer.questSlimeAt = -Infinity;
    hostQuestSlimes(peer);
    check(slimes.filter(s => !originalSlimes.has(s)).length === 3, "repeated request reuses the player's existing batch");

    const blockedSent = [];
    const blockedPeer = { id: "qa-peer-warden", ready: true, ch: channel(blockedSent) };
    const blockedAvatar = { id: "qa-player-warden", via: blockedPeer.id, state: { pos: q.giver.pos.clone(), dead: false } };
    NET.peers.set(blockedPeer.id, blockedPeer);
    NET.avatars.set(blockedAvatar.id, blockedAvatar);
    WORLDSTATE.finaleStarted = true;
    WORLDSTATE.wardenDead = false;
    hostQuestSlimes(blockedPeer);
    check(slimes.filter(s => !originalSlimes.has(s)).length === 3, "Warden fight blocks a second player's summon");

    WORLDSTATE.finaleStarted = false;
    const guestSent = [];
    const hostPeer = { id: "host", hello: true, ready: true, ch: channel(guestSent) };
    NET.role = "guest";
    NET.peers.clear();
    NET.avatars.clear();
    NET.peers.set(hostPeer.id, hostPeer);
    q.taken = true;
    q.done = false;
    q.slimeRemote = false;
    q.slimeRequestAt = -Infinity;
    P.pos.copy(q.giver.pos);
    ensureQuestSlimes(q);
    check(guestSent.length === 1 && guestSent[0].t === "qslime", "guest sends one bounded host request");
    netHandle({id:'untrusted'}, { t: "qslime", ok: true });
    check(!q.slimeRemote, "guest ignores acknowledgement from a non-host peer");
    netHandle(hostPeer, { t: "qslime", ok: true });
    check(q.slimeRemote === true, "guest accepts acknowledgement only from its host peer");
    ensureQuestSlimes(q);
    check(guestSent.length === 1, "acknowledged guest stops retrying");

    return { checks, total: checks.length };
  } finally {
    for (let i = slimes.length - 1; i >= 0; i--) {
      if (originalSlimes.has(slimes[i])) continue;
      removeEnemy(slimes[i]);
      slimes.splice(i, 1);
    }
    questSlimeSummons.clear();
    for (const [id, batch] of old.summons) questSlimeSummons.set(id, batch);
    NET.peers.clear();
    for (const [id, peer] of old.peers) NET.peers.set(id, peer);
    NET.avatars.clear();
    for (const [id, avatar] of old.avatars) NET.avatars.set(id, avatar);
    NET.role = old.role;
    P.pos.copy(old.pos);
    WORLDSTATE.finaleStarted = old.finaleStarted;
    WORLDSTATE.wardenDead = old.wardenDead;
    q.taken = old.qTaken;
    q.done = old.qDone;
    if (old.qSlimeRemote === undefined) delete q.slimeRemote; else q.slimeRemote = old.qSlimeRemote;
    if (old.qSlimeRequestAt === undefined) delete q.slimeRequestAt; else q.slimeRequestAt = old.qSlimeRequestAt;
  }
})()
