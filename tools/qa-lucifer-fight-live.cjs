// Three real local WebRTC game instances. State fixtures isolate encounter behavior.
const fs = require('node:fs'), assert = require('node:assert/strict');
const { instrument, serve, loadPlaywright, browserPath } = require('./qa-game.cjs');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  const html = process.argv[2] || 'legend_of_peanits_v3.0.html';
  const server = await serve(instrument(fs.readFileSync(html, 'utf8').replace(/\r\n/g, '\n')));
  const browser = await loadPlaywright().chromium.launch({ executablePath: browserPath('edge'), headless: true });
  const pages = [], errors = [], checks = [];
  const run = (i, code) => pages[i].evaluate(text => window.__gameQa.run(text), code);
  const check = (label, ok) => { assert.ok(ok, label); checks.push(label); console.log('PASS: ' + label); };
  const eventually = async (i, code, label) => { await pages[i].waitForFunction(text => window.__gameQa.run(text), code, { timeout: 20000 }); check(label, true); };
  try {
    for (let i = 0; i < 3; i++) {
      const page = await browser.newPage({ viewport: { width: 900, height: 550 } }); pages.push(page);
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto('http://127.0.0.1:' + server.address().port);
      await page.waitForFunction(() => window.__gameQa, null, { timeout: 90000 });
      await run(i, `(async () => {
        NET.myId = 'fight${i}'; NET.role = '${i ? 'guest' : 'host'}'; paused = true; Voice.stop();
        WORLDSTATE.gehUnlocked = true; WORLDSTATE.gehSeed = GEH.seed = 77119;
        WORLDSTATE.gehAlmonerDown = WORLDSTATE.gehMatronDown = WORLDSTATE.gehHeapDown = WORLDSTATE.gehDone = true;
        WORLDSTATE.luciferDefeated = false; WORLDSTATE.afterlife = null;
        P.pos.set(GEH.cx + ${i === 2 ? '48' : 'GEH_PRIDE_X + ' + (i ? 4 : -4)}, GEH.floor + 9, GEH.cz + ${i === 2 ? '78' : 'GEH_PRIDE_Z - 6'});
        P.gehDive = null; P.hp = P.maxHp = 20; P.vel.set(0,0,0); P.lying = false; sleepT = 0; inputLock = false;
        await window.gehBuildWorld();
        if (${i} > 0) { netBeginGehennaSession(); NET.gehApplied = true; NET.gehEntered = true; }
        setInterval(() => updateNet(0.05), 50);
      })()`);
      console.log('Game ' + i + ' world ready');
    }
    for (let i = 1; i < 3; i++) {
      const offer = await run(0, `(async()=>{const p=netPeer('guest${i}');p.pc.setConfiguration({iceServers:[]});netCreateChannels(p);await p.pc.setLocalDescription(await p.pc.createOffer());await netGathered(p.pc);return p.pc.localDescription.toJSON();})()`);
      const answer = await run(i, `(async()=>{const p=netPeer('host');p.pc.setConfiguration({iceServers:[]});p.pc.ondatachannel=e=>netWire(p,e.channel);await p.pc.setRemoteDescription(${JSON.stringify(offer)});await p.pc.setLocalDescription(await p.pc.createAnswer());await netGathered(p.pc);return p.pc.localDescription.toJSON();})()`);
      await run(0, `NET.peers.get('guest${i}').pc.setRemoteDescription(${JSON.stringify(answer)})`);
    }
    for (let i = 0; i < 3; i++) await eventually(i, 'NET.avatars.size === 2', 'Game ' + i + ' sees both real peers');
    await eventually(0, `NET.avatars.get('fight1').seq > 0 && NET.avatars.get('fight2').seq > 0`, 'Host has current remote positions');
    await run(0, 'gehBeginConfrontation(GEH.lucifer)');
    await eventually(1, `GEH.luciferFight && GEH.luciferFight.status === 'active'`, 'Attempt state reaches the guest through the real channel');
    check('Only the two players in Pride join the initial fight', await run(0, `GEH.luciferFight.members.length===2&&!gehFightMember('fight2')`));
    await run(0, `GEH.lucifer.armed=true;GEH.lucifer.scenePhase='hold';GEH.lucifer.bodyScale=2.4;GEH.lucifer.r=2;GEH.lucifer.throwCd=0;`);
    await run(1, 'P.pos.copy(GEH.lucifer.pos).add(V3(0,0,2)); P.inv=0; P.dodge=0; P.block=false');
    await run(0, 'P.pos.copy(GEH.lucifer.pos).add(V3(10,0,0))'); await wait(350);
    await run(0, 'gehLuciferThrow(GEH.lucifer,0);gehLuciferThrow(GEH.lucifer,1.01)');
    await eventually(1, 'P.hp < 20 && P.vel.y > 10', 'Host throw damages and launches its remote target');
    check('Remote throw leaves the host unharmed', await run(0, 'P.hp === 20'));
    await run(0, `window.__oldFightSnapshot=structuredClone(netGehennaSnapshot());P.inv=0;hurtPlayer(999,GEH.lucifer.pos,1);gehFightTick(0)`);
    await eventually(1, `GEH.luciferFight.dead.includes('fight0')`, 'Host death is replicated to the guest');
    check('Dead host watches while its teammate lives', await run(0, `gehFightDead()&&GEH.luciferFight.status==='active'&&!GEH.fightMenuOpen`));
    check('Spectator change preserves a slow forced rotation', await run(0, `(()=>{gehFightSpectate(0.05);const q=camera.quaternion.clone();NET.avatars.get('fight1').state.pos.x+=12;gehFightSpectate(0.05);return q.angleTo(camera.quaternion)<=0.0276&&[...camera.position.toArray(),...camera.quaternion.toArray()].every(Number.isFinite)})()`));
    await run(1, 'P.inv=0;hurtPlayer(999,GEH.lucifer.pos,1)');
    await eventually(0, `GEH.luciferFight.status==='wipe'&&GEH.luciferFight.controller===NET.myId`, 'Two-player wipe gives the host the decision');
    await eventually(1, `GEH.luciferFight.status==='wipe'`, 'Guest receives the party wipe');
    check('Guest cannot choose a multiplayer retry', await run(1, `!gehFightChoose('retry')&&!GEH.fightMenuOpen`));
    const firstEpoch = await run(0, 'GEH.fightEpoch');
    await run(1, `netSend(NET.peers.get('host'),{t:'lf',op:'choose',action:'retry',epoch:GEH.fightEpoch,seed:WORLDSTATE.gehSeed})`); await wait(250);
    check('Host rejects an unauthorized guest retry message', await run(0, `GEH.fightEpoch===${firstEpoch}`));
    await pages[0].locator('#luciferFight [data-action="retry"]').click();
    await eventually(1, `GEH.fightEpoch===${firstEpoch+1}&&!death&&P.hp===P.maxHp&&P.stam===stamMax()`, 'Host retry revives the remote player with full resources');
    check('Retry revives the host and resets the boss', await run(0, 'P.hp===P.maxHp&&!death&&GEH.lucifer.hp===90&&GEH.lucifer.phase===0'));
    const guestHp = await run(1, 'P.hp');
    await run(0, `netSend(NET.peers.get('guest1'),{t:'lf',op:'throw',seed:WORLDSTATE.gehSeed,epoch:${firstEpoch},to:'fight1',hit:999,x:GEH.lucifer.pos.x,y:GEH.lucifer.pos.y,z:GEH.lucifer.pos.z,dmg:40});const old=structuredClone(window.__oldFightSnapshot);old.ws[4]=true;old.finale={epoch:${firstEpoch},t:18,members:['fight1']};const snap=netEnemySnapshot();snap.geh=old;netSend(NET.peers.get('guest1'),snap)`);
    await wait(350);
    check('Old throw and finale packets cannot damage or finish a retry', await run(1, `P.hp===${guestHp}&&!WORLDSTATE.luciferDefeated&&!AFTERLIFE.phase&&GEH.lucifer.hp===90`));
    await run(2, 'P.pos.copy(GEH.lucifer.pos).add(V3(0,0,3));P.vel.set(0,0,0)');
    await eventually(0, `GEH.luciferFight.members.length===3`, 'A third player entering Pride joins the active attempt');
    await run(0, 'P.inv=0;hurtPlayer(999,GEH.lucifer.pos,1)'); await run(1, 'P.inv=0;hurtPlayer(999,GEH.lucifer.pos,1)');
    await eventually(0, `GEH.luciferFight.dead.length===2&&GEH.luciferFight.status==='active'`, 'Three-player encounter continues while one companion survives');
    check('Dead host switches spectator target to the remaining player', await run(0, `gehFightSpectate(0.05);GEH.fightSpectator.target==='fight2'`));
    await run(2, 'P.inv=0;hurtPlayer(999,GEH.lucifer.pos,1)');
    await eventually(0, `GEH.luciferFight.status==='wipe'&&GEH.luciferFight.dead.length===3`, 'All three deaths are required for the three-player wipe');
    await pages[0].locator('#luciferFight [data-action="return"]').click();
    for (let i=0;i<3;i++) await eventually(i, `GEH.luciferFight.status==='idle'&&!death&&!netGehennaRoom(P.pos)&&P.pos.y<DIVIDE&&P.hp===P.maxHp`, 'Return revives game ' + i + ' on the Gehenna road');
    check('Return preserves prior quest completion in every game', (await Promise.all(pages.map((_,i)=>run(i, 'WORLDSTATE.gehDone&&WORLDSTATE.gehMatronDown&&!WORLDSTATE.luciferDefeated')))).every(Boolean));
    // A guest can be the only participant while the host remains outside the room.
    await run(2, 'P.pos.copy(GEH.lucifer.pos).add(V3(0,0,2));P.vel.set(0,0,0)'); await wait(300);
    for(let i=0;i<5;i++) { await run(0,'time+=1'); await run(2,'netGehennaRequest("lucifer")'); await wait(130); }
    await eventually(0, `GEH.luciferFight.status==='active'&&GEH.luciferFight.members.length===1&&gehFightMember('fight2')`, 'A lone guest starts an authoritative fight while the host stays outside');
    await eventually(2, 'gehFightMember()', 'Lone guest receives its attempt membership');
    const soloEpoch = await run(0,'GEH.fightEpoch');
    await run(2, 'P.inv=0;hurtPlayer(999,GEH.lucifer.pos,1)');
    await eventually(2, `GEH.luciferFight.status==='wipe'&&GEH.luciferFight.controller===NET.myId&&GEH.fightMenuOpen`, 'Lone guest receives its own solo retry choice');
    check('Uninvolved host does not receive a forced choice', await run(0,'!GEH.fightMenuOpen&&!death'));
    await pages[2].locator('#luciferFight [data-action="retry"]').click();
    await eventually(0, `GEH.fightEpoch===${soloEpoch+1}&&GEH.luciferFight.status==='active'`, 'Solo guest request is authorized and performed by the host');
    await eventually(2, '!death&&P.hp===P.maxHp', 'Solo guest is revived by the host result');
    await run(0, 'P.pos.copy(GEH.lucifer.pos).add(V3(0,0,3));P.vel.set(0,0,0)');
    await run(1, 'P.pos.copy(GEH.lucifer.pos).add(V3(2,0,3));P.vel.set(0,0,0)');
    await eventually(0, 'GEH.luciferFight.members.length===3', 'All three can participate again after a solo retry');
    await run(0, 'P.inv=0;hurtPlayer(999,GEH.lucifer.pos,1)');
    await run(1, 'P.inv=0;hurtPlayer(999,GEH.lucifer.pos,1)');
    await eventually(0, `GEH.luciferFight.dead.length===2&&GEH.luciferFight.status==='active'`, 'Last living companion keeps the attempt active before disconnection');
    await run(2, `NET.peers.get('host').pc.close()`);
    await eventually(0, `!NET.avatars.has('fight2')&&GEH.luciferFight.status==='wipe'&&GEH.luciferFight.controller===NET.myId`, 'Disconnecting the last survivor gives the host a recoverable wipe');
    await pages[0].locator('#luciferFight [data-action="retry"]').click();
    await eventually(1, `!death&&GEH.luciferFight.members.length===2`, 'Retry removes the disconnected participant and revives the remaining party');
    await run(1, 'P.inv=0;hurtPlayer(999,GEH.lucifer.pos,1)');
    await eventually(0, `GEH.luciferFight.dead.includes('fight1')`, 'Surviving host knows its companion is spectating');
    await run(0, `const e=GEH.lucifer;e.armed=true;e.scenePhase='hold';e.hp=0;e.phase=3;e.pleaStep=1;e.holdPause=.1;gehUpdateLucifer(e,{pos:P.pos},0,3,3,.2)`);
    await eventually(1, `!death&&hero.visible&&NET.gehFinaleLocal&&AFTERLIFE.phase==='release'`, 'A dead participant is revived and sees the earned party victory');
    check('Party victory releases Lucifer alive after the final child phase', await run(0, `WORLDSTATE.luciferDefeated&&GEH.lucifer.alive&&GEH.lucifer.noBar&&GEH.luciferFight.status==='won'`));
    check('No browser or shader errors', errors.length === 0);
    const result={ok:true,total:checks.length,checks,errors,scope:'Real local WebRTC with two and three encounter participants; not an internet latency test'};
    fs.writeFileSync('artifacts/qa-lucifer-fight-live.json',JSON.stringify(result,null,2)); console.log(JSON.stringify(result,null,2));
  } catch (error) {
    console.log(JSON.stringify({errors},null,2));
    for(let i=0;i<pages.length;i++) {
      try { console.log('STATE',i,await run(i,`({role:NET.role,status:netEl('mpStatus').textContent,avatars:[...NET.avatars.keys()],fight:GEH.luciferFight,peers:[...NET.peers.values()].map(p=>({id:p.id,ready:p.ready,hello:p.hello,player:p.playerId,ch:p.ch?.readyState,pc:p.pc.connectionState}))})`)); } catch (_) {}
    }
    throw error;
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error.stack || error); process.exitCode=1; });
