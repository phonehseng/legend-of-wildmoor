(() => {
  const checks = [], check = (ok,label) => { if(!ok) throw Error(label); checks.push(label); };
  paused = true; netEndGehennaSession(); NET.role = 'host'; NET.peers.clear(); NET.avatars.clear(); P.pos.set(0,PLATEAU,0); death = null;
  const sl = slimes[0]; sl.alive = true; sl.hp = sl.maxHp; sl.pos.copy(P.pos).add(V3(10,0,0));
  WORLDSTATE.gehSeed=73891; GEH_NET_FLAGS.forEach(k=>WORLDSTATE[k]=false);
  const old = netEnemySnapshot(); sl.alive=false; sl.hp=0; WORLDSTATE.luciferDefeated=true;
  const current = netEnemySnapshot();
  check(Number.isSafeInteger(old.seq) && current.seq > old.seq, 'host enemy snapshots carry a monotonic sequence');
  for(const m of [old,current]) { m.g=[]; m.x=[]; m.b=null; }
  NET.role='guest'; NET.mirroring=false;
  const peer={id:'host',hello:true,ready:true,ch:{readyState:'open',send(){}}}; NET.peers.set('host',peer);
  netHandle(peer,{...old,seq:undefined});
  check(!NET.mirroring && peer.enemySeqSeen===undefined, 'missing sequence is rejected before mirror setup or enemy mutations');
  sl.alive=true; sl.hp=sl.maxHp; WORLDSTATE.luciferDefeated=false;
  const cachedVictory=()=>NET.gehState&&NET.gehState.ws[GEH_NET_FLAGS.indexOf('luciferDefeated')]===true;
  netHandle(peer,current); check(!sl.alive && sl.hp===0 && cachedVictory() && !WORLDSTATE.luciferDefeated, 'newest authoritative death and cached finale apply without granting bystander progress');
  netHandle(peer,old); check(!sl.alive && sl.hp===0 && cachedVictory(), 'late old enemy snapshot cannot resurrect a slime or rewind cached Gehenna victory');
  const same={...old,seq:current.seq}; netHandle(peer,same);
  check(!sl.alive && sl.hp===0 && cachedVictory(), 'duplicate sequence cannot apply conflicting body state');
  dayT=.1; netHandle(peer,{t:'day',seq:7,dayT:.8}); netHandle(peer,{t:'day',seq:6,dayT:.2});
  check(dayT===.8,'late day snapshot cannot rewind the clock');
  netHandle(peer,{t:'day',seq:7,dayT:.3}); netHandle(peer,{t:'day',seq:Infinity,dayT:.4});
  check(dayT===.8,'duplicate and malformed day sequences are ignored');
  NET.role='host'; const d1=netDaySnapshot(),d2=netDaySnapshot();
  check(d2.seq===d1.seq+1,'host day snapshots share the same ordered-envelope contract');
  NET.role='guest'; const next={id:'host',hello:false,ready:true,enemySeqSeen:100,daySeqSeen:100,ch:{readyState:'open',send(){}}}; NET.peers.set('host',next);
  netHandle(next,{t:'hello',v:NET_PROTOCOL,id:'ordering-new-host',look:netLook(),hp:4,maxHp:4});
  check(next.enemySeqSeen===0&&next.daySeqSeen===0,'new host handshake resets only its connection receive counters');
  netHandle(next,{...old,seq:1}); netHandle(next,{t:'day',seq:1,dayT:.3});
  check(sl.alive&&dayT===.3,'new host session accepts its first snapshot even after a previous higher sequence');
  netHandle(next,{t:'hello',v:NET_PROTOCOL,id:'ordering-new-host',look:netLook(),hp:4,maxHp:4});
  check(next.enemySeqSeen===1&&next.daySeqSeen===1,'appearance reannouncement does not reset snapshot ordering');
  netApplyEnemies({...old,seq:undefined});
  check(sl.alive,'direct internal enemy snapshot applicator remains usable by existing closure fixtures');
  NET.role=null; NET.peers.clear(); for(const a of [...NET.avatars.values()]) netRemoveAvatar(a.id);
  return {total:checks.length,checks};
})()
