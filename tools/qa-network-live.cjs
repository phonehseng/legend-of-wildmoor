// Three complete game instances joined through real local WebRTC data channels.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { instrument, serve, loadPlaywright, browserPath } = require('./qa-game.cjs');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function main() {
  const html = process.argv[2] || 'legend_of_wildmoor_v3.8.5.html';
  const server = await serve(instrument(fs.readFileSync(html, 'utf8').replace(/\r\n/g, '\n')));
  const browser = await loadPlaywright().chromium.launch({ executablePath: browserPath('edge'), headless: true });
  const pages = [], errors = [], checks = [];
  const run = (i, source) => pages[i].evaluate(code => window.__gameQa.run(code), source);
  const check = (name, ok) => { assert.ok(ok, name); checks.push(name); };
  try {
    for (let i=0; i<3; i++) {
      const page = await browser.newPage({ viewport: { width: 800, height: 450 } }); pages.push(page);
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.waitForFunction(() => window.__gameQa, null, {timeout:90000});
      console.log(`game ${i} ready`);
      await run(i, `NET.myId='qa${i}'; NET.role='${i ? 'guest' : 'host'}'; P.pos.set(0,20,${i*2}); P.hp=P.maxHp=20; P.heading=0; P.vel.set(0,0,0); setInterval(()=>updateNet(0.05),50);`);
    }
    for (let i=1;i<3;i++) {
      const offer=await run(0, `(async()=>{const p=netPeer('guest${i}');p.pc.setConfiguration({iceServers:[]});netCreateChannels(p);await p.pc.setLocalDescription(await p.pc.createOffer());await netGathered(p.pc);return p.pc.localDescription.toJSON();})()`);
      const answer=await run(i, `(async()=>{const p=netPeer('host');p.pc.setConfiguration({iceServers:[]});p.pc.ondatachannel=e=>netWire(p,e.channel);await p.pc.setRemoteDescription(${JSON.stringify(offer)});await p.pc.setLocalDescription(await p.pc.createAnswer());await netGathered(p.pc);return p.pc.localDescription.toJSON();})()`);
      await run(0, `NET.peers.get('guest${i}').pc.setRemoteDescription(${JSON.stringify(answer)})`);
    }
    try { for (const page of pages) await page.waitForFunction(()=>window.__gameQa.run('NET.avatars.size === 2'),null,{timeout:20000}); }
    catch(e) { for(let i=0;i<pages.length;i++) console.log(i,await run(i,`JSON.stringify({role:NET.role,status:netEl('mpStatus').textContent,avatars:[...NET.avatars.keys()],peers:[...NET.peers.values()].map(p=>({id:p.id,ready:p.ready,hello:p.hello,player:p.playerId,pc:p.pc.connectionState,ch:p.ch&&p.ch.readyState}))})`)); console.log(errors); throw e; }
    check('all three real peers see the full party', true);
    check('unordered motion and reliable events both connected', await run(0, `[...NET.peers.values()].every(p=>p.motion.readyState==='open'&&p.motion.ordered===false&&p.motion.maxRetransmits===0&&p.ch.ordered)`));
    await run(1, 'P.pos.set(5,20,2); P.vel.set(0,0,0)'); await wait(500);
    check('host batches guest motion to the other guest', await run(2, `Math.abs(NET.avatars.get('qa1').state.pos.x-5)<0.1`));
    check('co-op damage is off by default', await run(0, `!NET.pvp && !netHostHit(NET.peers.get('guest1'),{to:'qa2',from:'qa1',swing:1,dmg:2})`));
    await run(0,'netSetPvp(true)'); await wait(200);
    check('host pvp choice reaches both guests', await run(1,'NET.pvp') && await run(2,'NET.pvp'));
    await run(1,'P.pos.set(0,20,2); P.heading=0'); await run(2,'P.pos.set(0,20,4); P.block=false; P.inv=0'); await wait(400);
    await run(1, `netBroadcast({t:'hit',from:NET.myId,to:'qa2',swing:2,dmg:2,kb:1})`); await wait(300);
    const hurt=await run(2,'P.hp'); check('guest-to-guest hit routed through host',hurt<20);
    await run(2,'P.inv=0'); await run(1, `netBroadcast({t:'hit',from:NET.myId,to:'qa2',swing:2,dmg:2,kb:1})`); await wait(250);
    check('replayed swing cannot damage twice',await run(2,'P.hp')===hurt);
    await run(2,'P.inv=0;P.block=true;P.heading=Math.PI;P.pos.set(0,20,4)'); await wait(300);
    await run(1,`netBroadcast({t:'hit',from:NET.myId,to:'qa2',swing:3,dmg:2,kb:1})`);await wait(300);
    check('shield facing attacker blocks',await run(2,'P.hp')===hurt);
    await run(2,'P.inv=0;P.block=true;P.heading=0');await wait(300);
    await run(1,`netBroadcast({t:'hit',from:NET.myId,to:'qa2',swing:4,dmg:2,kb:1})`);await wait(300);
    check('shield cannot block from behind',await run(2,'P.hp')<hurt);
    check('spoofed player identity ignored',await run(0,`(()=>{const p=NET.peers.get('guest1'),a=NET.avatars.get('qa2'),x=a.target.x;netHandle(p,{...netMyState(),id:'qa2',x:999});return a.target.x===x})()`));
    check('guest cannot inject boss kill credits into host',await run(0,`(()=>{const before=WORLDSTATE.wardenDead;netHandle(NET.peers.get('guest1'),{t:'ek',k:'warden'});return WORLDSTATE.wardenDead===before})()`));
    check('late old campaign does not overwrite host progress',await run(0,`(()=>{const p={mainBase:{solved:true,ws:{wardenDead:true}}};const d=netMainDelta(p,{solved:true,ws:{wardenDead:true}});return !d.solved&&!d.ws.wardenDead})()`));
    check('bounded extrapolation stops packet-loss drift',await run(0,`(()=>{const a={samples:[{at:100,pos:V3(0,0,0),vel:V3(10,0,0)}],state:{pos:V3()},tvel:V3(10,0,0),lastAt:100};netInterpolate(a,1000);const x=a.state.pos.x;netInterpolate(a,10000);return x===1&&a.state.pos.x===1})()`));
    await run(0,`netSetPvp(false);WORLDSTATE.hermitWarned=true;const q=sideQuestById('violet-stone');sideHostBegin(q,[0],NET.myId);sideBroadcast();`);
    await wait(300);
    await run(1,`P.pos.copy(pickups.find(p=>p.id==='quest:stonefold').pos);P.vel.set(0,0,0);P.interactCd=0;P.block=false;`);
    await wait(300);await run(1,'interact()');await wait(500);
    check('real guest pickup records its finder on the host',await run(0,`NET.peers.get('guest1').items.has('quest:stonefold')`));
    await run(2,`P.pos.copy(sideQuestById('violet-stone').giver.pos);P.vel.set(0,0,0);P.interactCd=0;P.block=false;`);
    await wait(300);await run(2,`sideSendRequest(sideQuestById('violet-stone'),'turnin')`);await wait(350);
    check('another guest cannot return the finder\'s stone',await run(0,`!sideQuestById('violet-stone').done`));
    await run(1,`P.pos.copy(sideQuestById('violet-stone').giver.pos);P.vel.set(0,0,0);P.interactCd=0;`);
    await wait(300);await run(1,`sideSendRequest(sideQuestById('violet-stone'),'turnin')`);await wait(500);
    check('finder hand-in completes the shared quest on all three clients',await run(0,`sideQuestById('violet-stone').done&&sideQuestById('violet-stone').rewarded`)&&await run(1,`sideQuestById('violet-stone').done&&sideQuestById('violet-stone').rewarded`)&&await run(2,`sideQuestById('violet-stone').done&&sideQuestById('violet-stone').rewarded`));
    await run(1,`NET.peers.get('host').pc.close()`); await wait(600);
    check('disconnect removes only departing player',await run(0,`NET.avatars.size===1&&NET.avatars.has('qa2')`));
    check('no runtime or shader errors',errors.length===0);
    console.log(JSON.stringify({ok:true,checks,errors,scope:'three local WebRTC game instances; not an internet latency test'},null,2));
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
