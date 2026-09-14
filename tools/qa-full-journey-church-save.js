(() => {
  const checks=[],check=(v,label)=>{if(!v)throw Error(label);checks.push(label);};
  const lore=pickups.find(p=>p.id==='church:hale2');
  check(lore&&lore.label.length>200,'ordinary church lore exceeds legacy 200-character found bound');
  P.pos.copy(lore.mesh.position);P.vel.set(0,0,0);P.swim=false;P.climb=null;P.grounded=true;visY=P.pos.y;lastSafePos.copy(P.pos);updateCurrentRoom();
  const wasPaused=paused;paused=false;
  for(let i=0;i<20&&!lore.taken;i++){P.interactCd=0;interact();}
  paused=wasPaused;
  check(lore.taken,'read church page through real proximity interaction');
  check(FOUND.includes(lore.label),'full church lore entered normal found inventory');
  const key=makeSaveKey(),saved=parseSaveKey(key);
  check(!!saved,'earned church save parses');
  const clean=String(lore.label).replace(/[<>&"'`]/g,'');
  check(saved.found.includes(clean),'save parser preserves entire sanitized lore text');
  check(saved.picked.includes(lore.id),'save keeps stable church pickup id');
  check(applySave(saved),'earned church save applies');
  const again=parseSaveKey(makeSaveKey());
  check(again&&again.picked.includes(lore.id),'church pickup survives repeat save round-trip');
  check(pickups.find(p=>p.id===lore.id).taken,'loaded page cannot be collected twice');
  const malformed=JSON.parse(JSON.stringify(again));malformed.found.push('x'.repeat(2001));
  const raw=JSON.stringify(malformed);let encoded='';for(let i=0;i<raw.length;i++)encoded+=String.fromCharCode(raw.charCodeAt(i)^((i*7+13)&31));
  check(!parseSaveKey('WM1-'+btoa(unescape(encodeURIComponent(encoded)))),'found text above 2000 characters remains rejected');
  return {checks,total:checks.length,loreId:lore.id,loreLength:lore.label.length,keyBytes:key.length};
})()
