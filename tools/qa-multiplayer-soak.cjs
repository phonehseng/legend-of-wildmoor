// Real local WebRTC, full game closures/renderers. No Internet latency claims.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {instrument,serve,loadPlaywright,browserPath} = require('./qa-game.cjs');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const html = path.resolve(process.argv[2] || 'legend_of_wildmoor_v3.8.7.html');
const combatOnly = process.argv.includes('--combat-only');
const minutesAt = process.argv.indexOf('--minutes');
const minutes = minutesAt < 0 ? 10 : Number(process.argv[minutesAt + 1]);
const outAt = process.argv.indexOf('--out');
const output = path.resolve(outAt < 0 ? 'artifacts/multiplayer-soak.json' : process.argv[outAt + 1]);
async function main() {
  const bytes = fs.readFileSync(html), source = bytes.toString('utf8').replace(/\r\n/g,'\n');
  const report = {html,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),scope:'full Edge clients, local WebRTC UDP; not WAN or human playtesting',combat:[],checks:[],samples:[],errors:[],events:{pvp:0,quests:0,pressure:0,reconnect:0},startedAt:new Date().toISOString()};
  const server = await serve(instrument(source));
  const browser = await loadPlaywright().chromium.launch({executablePath:browserPath('edge'),headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
  const pages = [], count = combatOnly ? 2 : 4;
  const run = (i,s) => pages[i].evaluate(source => window.__gameQa.run(source),s);
  const check = (name,ok) => {assert.ok(ok,name);report.checks.push(name);};
  const save = () => {fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));};
  const sample = async () => {
    const rows = await Promise.all(pages.map((_,i)=>run(i,`({id:NET.myId,role:NET.role,avatars:NET.avatars.size,frames:frameNo,time,started,paused,overlay:gameplayOverlayOpen(),dead:!!death,hp:P.hp,pos:P.pos.toArray(),seq:NET.seq,received:window.qaReceived,skips:window.qaSkips,heap:performance.memory?.usedJSHeapSize||null,geometry:renderer.info.memory.geometries,textures:renderer.info.memory.textures,peers:[...NET.peers.values()].map(p=>({id:p.id,ready:p.ready,state:p.pc.connectionState,reliable:p.ch?.readyState,motion:p.motion?.readyState,buffer:p.ch?.bufferedAmount||0,motionBuffer:p.motion?.bufferedAmount||0})),fairies:FAIRY.found})`)));
    report.samples.push({at:new Date().toISOString(),clients:rows});save();return rows;
  };
  const connect = async i => {
    await run(i,`NET.role='guest';NET.myId='soak${i}';`);
    const offer=await run(0,`(async()=>{const p=netPeer('guest${i}');p.pc.setConfiguration({iceServers:[]});netCreateChannels(p);await p.pc.setLocalDescription(await p.pc.createOffer());await netGathered(p.pc);return p.pc.localDescription.toJSON();})()`);
    const answer=await run(i,`(async()=>{const p=netPeer('host');p.pc.setConfiguration({iceServers:[]});p.pc.ondatachannel=e=>netWire(p,e.channel);await p.pc.setRemoteDescription(${JSON.stringify(offer)});await p.pc.setLocalDescription(await p.pc.createAnswer());await netGathered(p.pc);return p.pc.localDescription.toJSON();})()`);
    await run(0,`NET.peers.get('guest${i}').pc.setRemoteDescription(${JSON.stringify(answer)})`);
    await pages[i].waitForFunction(()=>window.__gameQa.run(`NET.peers.get('host')?.ready&&NET.avatars.size>0`),null,{timeout:25000});
  };
  const resetDefender = async (opts={}) => run(1,`death=null;P.hp=P.maxHp=20;P.pos.set(0,${opts.geh?-350:20},4);P.vel.set(0,0,0);P.inv=${opts.inv??0.3};P.dodge=${opts.dodge??0.3};P.flurry=0;P.block=${!!opts.block};P.heading=${opts.heading??Math.PI};P.carry=false;WORLDSTATE.gehSeed=777;`);
  const state = () => run(1,'({hp:P.hp,flurry:P.flurry,inv:P.inv,blocks:P.blocks})');
  const combat = async(name,setup,attack,predicate)=>{await resetDefender(setup);await wait(120);await run(0,attack);await wait(160);const value=await state();report.combat.push({name,ok:!!predicate(value),value});console.log(`${report.combat.at(-1).ok?'PASS':'KNOWN FAIL'}: ${name}`);};
  // The PvP checks are the only ones that route through netHostHit, and netHostHit judges the blow against the
  // HOST's copy of the defender (`a.target`), not against the defender's own live position. State travels on the
  // motion channel, which is deliberately unordered with maxRetransmits 0, so a fixed sleep is not a guarantee that
  // the host has caught up — and the check right before this one leaves the defender at y=-350 in Gehenna. When the
  // host still held that y, netSameRealm failed, netHostHit returned false, no `hit` was ever sent, and the suite
  // blamed the shield. Wait for the host's own view instead of sleeping. (~1 run in 5 failed on the sleep.)
  const hostSees = async (id,predicate,label) => {
    for(let i=0;i<80;i++){
      if(await run(0,`(()=>{const a=NET.avatars.get('${id}');return !!a&&(${predicate});})()`))return;
      await wait(50);
    }
    throw new Error(`host never saw ${label} for ${id}`);
  };
  const valley = pierce => `enemyStrike({kind:'warden',pos:V3(0,20,2),big:true},2,{id:'soak1',pos:V3(0,20,4)},2.1,${pierce})`;
  const geh = (pierce=false,nonlethal=false) => `netSend(NET.peers.get('guest1'),{t:'gfx',to:'soak1',seed:777,kind:'strike',x:0,y:-350,z:2,dmg:2,kb:1,pierce:${pierce},nonlethal:${nonlethal}})`;
  try {
    for(let i=0;i<count;i++) {
      const page=await browser.newPage({viewport:{width:640,height:360}});pages.push(page);
      page.on('pageerror',e=>report.errors.push({client:i,type:'pageerror',message:e.message}));
      page.on('console',m=>{if(m.type()==='error')report.errors.push({client:i,type:'console',message:m.text()});});
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.waitForFunction(()=>window.__gameQa&&!document.body.classList.contains('loading'),null,{timeout:90000});
      await page.locator('#play').click();await page.locator('#start').click();
      await page.waitForFunction(()=>window.__gameQa.snapshot().started);
      await run(i,`window.qaFreeze=true;window.qaReceived={};window.qaSkips=0;window.qaUpdate=update;update=function(dt){if(!window.qaFreeze)return window.qaUpdate(dt)};window.qaHandle=netHandle;netHandle=function(p,m){window.qaReceived[m.t]=(window.qaReceived[m.t]||0)+1;return window.qaHandle(p,m)};window.qaSend=netSend;netSend=function(p,m,s){if(NET_VOLATILE.has(m.t)&&p.motion?.bufferedAmount>262144)window.qaSkips++;return window.qaSend(p,m,s)};setInterval(()=>{if(window.qaFreeze)updateNet(.05)},50);Voice.enabled=false;NET.myId='soak${i}';NET.role='${i?'guest':'host'}';P.hp=P.maxHp=20;P.pos.set(0,20,${i*2});P.vel.set(0,0,0);P.gehDive=null;death=null;paused=false;`);
      report.checks.push(`client ${i} started actual game and renderer`);console.log(`client ${i} ready`);
    }
    for(let i=1;i<count;i++)await connect(i);
    for(const p of pages)await p.waitForFunction(n=>window.__gameQa.run(`NET.avatars.size===${n-1}`),count,{timeout:25000});
    check('all clients see the full real WebRTC party',true);
    check('protocol is 5 and channels have intended reliability',await run(0,`NET_PROTOCOL===5&&[...NET.peers.values()].every(p=>p.ch.ordered&&p.motion.readyState==='open'&&!p.motion.ordered&&p.motion.maxRetransmits===0)`));
    await run(0,`P.inv=.3;P.dodge=.3;P.flurry=0;P.block=false;enemyStrike({kind:'wraith',pos:V3(0,20,-2)},1,null);`);
    check('local melee dodge reference opens flurry',await run(0,'P.flurry===1.7'));
    await combat('remote valley melee dodge opens flurry',{},valley(false),s=>s.hp===20&&s.flurry===1.7);
    await combat('remote Warden pierce bypasses dodge immunity',{},valley(true),s=>s.hp<20&&s.flurry===0);
    await combat('remote Warden pierce preserves ordinary hit immunity',{dodge:0},valley(true),s=>s.hp===20&&s.flurry===0);
    await combat('remote Warden pierce is shield-blockable',{block:true},valley(true),s=>s.hp===20&&s.flurry===0);
    await combat('remote valley melee dodge precedes active shield',{block:true},valley(false),s=>s.hp===20&&s.flurry===1.7);
    await combat('remote valley front-facing PvE shield blocks',{block:true,inv:0,dodge:0},valley(false),s=>s.hp===20&&s.flurry===0);
    await combat('remote valley rear-facing PvE shield blocks',{block:true,inv:0,dodge:0,heading:0},valley(false),s=>s.hp===20&&s.flurry===0);
    await combat('remote valley dodge outside invulnerability grants no flurry',{inv:0},valley(false),s=>s.hp<20&&s.flurry===0);
    await combat('remote arrow dodge remains immune without melee flurry',{},`netSend(NET.peers.get('guest1'),{t:'ehit',to:'soak1',k:'arrow',x:0,z:2,dmg:1})`,s=>s.hp===20&&s.flurry===0);
    await combat('remote ordinary melee damages outside dodge',{inv:0,dodge:0},valley(false),s=>s.hp<20&&s.flurry===0);
    await combat('remote Gehenna melee dodge opens flurry',{geh:true},geh(),s=>s.hp===20&&s.flurry===1.7);
    await combat('remote Kindly nonlethal dodge opens flurry',{geh:true},geh(false,true),s=>s.hp===20&&s.flurry===1.7);
    await combat('remote Gehenna pierce damages a dodging player',{geh:true},geh(true),s=>s.hp<20&&s.flurry===0);
    await combat('remote Gehenna dodge outside invulnerability grants no flurry',{geh:true,inv:0},geh(),s=>s.hp<20&&s.flurry===0);
    await combat('remote Gehenna dodge precedes active shield',{geh:true,block:true},geh(),s=>s.hp===20&&s.flurry===1.7);
    await resetDefender({inv:0,dodge:0,block:true,heading:0});await run(0,`netSetPvp(true);P.pos.set(0,20,2);P.heading=0;P.hp=20;P.inv=0;P.dodge=0;`);
    await hostSees('soak1','a.target.y>DIVIDE&&Math.abs(a.target.z-4)<0.2&&a.state.hp===20&&!a.state.dead','the defender back in the valley');
    await pages[1].waitForFunction(()=>window.__gameQa.run('NET.pvp'),null,{timeout:5000});
    check('host pvp rule reached the defender',await run(1,'NET.pvp'));
    await run(0,`netHostHit(null,{to:'soak1',from:NET.myId,swing:1,dmg:1,kb:0})`);await wait(200);
    check('PvP still damages a rear-facing shield',await run(1,'P.hp<20'));
    await resetDefender({inv:0,dodge:0,block:true});
    await hostSees('soak1','a.target.y>DIVIDE&&a.state.hp===20','the defender restored for the facing blow');
    await run(0,`netHostHit(null,{to:'soak1',from:NET.myId,swing:2,dmg:1,kb:0})`);await wait(200);
    check('PvP still blocks with a front-facing shield',await run(1,'P.hp===20'));await run(0,'netSetPvp(false)');
    if(combatOnly){
      if(process.argv.includes('--screenshot')){
        for(let i=0;i<count;i++)await run(i,`P.pos.set(${i*2},terrainH(${i*2},90)+.2,90);P.vel.set(0,0,0);P.hp=20;P.inv=0;P.dodge=0;P.flurry=0;P.block=false;P.gehDive=null;window.qaFreeze=false;camYaw=0;camPitch=.35;`);
        await wait(5000);await pages[0].screenshot({path:path.resolve('artifacts/multiplayer-combat-party.png')});
      }
      report.ok=report.combat.every(c=>c.ok)&&!report.errors.length;return;
    }
    // Return to ordinary surface gameplay. No manual updateNet timer runs during the soak.
    for(let i=0;i<count;i++)await run(i,`P.pos.set(${i*3},terrainH(${i*3},25)+.2,25);P.vel.set(0,0,0);P.hp=P.maxHp=20;P.inv=0;P.dodge=0;P.flurry=0;P.block=false;death=null;P.gehDive=null;WORLDSTATE.gehSeed=0;WORLDSTATE.gehUnlocked=false;P.grounded=true;window.qaFreeze=false;window.qaWalk=true;setInterval(()=>{if(window.qaWalk){const n=Math.floor(performance.now()/2000)%4;keys.w=n===0;keys.d=n===1;keys.s=n===2;keys.a=n===3;P.hp=Math.max(P.hp,15);}},250);`);
    const initial=await sample(), start=Date.now();report.soakStartedAt=new Date(start).toISOString();
    await pages[0].screenshot({path:path.resolve('artifacts/multiplayer-soak-party.png')});
    // Shared quest uses actual pickup interaction and finder-gated turn-in once; repeated snapshots must not pay twice.
    await run(0,`WORLDSTATE.hermitWarned=true;sideHostBegin(sideQuestById('violet-stone'),[0],NET.myId);sideBroadcast();`);await wait(600);
    const steady = async (i,source) => run(i,`window.qaWalk=false;releaseKeys();${source}`);
    for(let i=1;i<count;i++)await steady(i,'P.vel.set(0,0,0);');
    await steady(1,`P.pos.copy(pickups.find(p=>p.id==='quest:stonefold').pos);P.interactCd=0;`);await wait(400);await run(1,'interact()');await wait(600);
    check('guest pickup records only its actual finder',await run(0,`NET.peers.get('guest1').items.has('quest:stonefold')&&!NET.peers.get('guest2').items.has('quest:stonefold')`));
    for(const i of [1,2])await steady(i,`P.pos.copy(sideQuestById('violet-stone').giver.pos);P.vel.set(0,0,0);P.interactCd=0;`);await wait(400);
    await run(2,`sideSendRequest(sideQuestById('violet-stone'),'turnin')`);await wait(350);
    check('non-finder cannot return shared quest item',await run(0,`!sideQuestById('violet-stone').done`));
    await run(1,`sideSendRequest(sideQuestById('violet-stone'),'turnin')`);await wait(600);
    for(let i=0;i<count;i++)check(`quest completion and personal payment reach client ${i}`,await run(i,`sideQuestById('violet-stone').done&&sideQuestById('violet-stone').rewarded`));
    const paid=await Promise.all(pages.map((_,i)=>run(i,'P.maxHp')));
    const fairyBase=await Promise.all(pages.map((_,i)=>run(i,'FAIRY.found')));
    for(let i=0;i<count;i++)await run(i,`window.qaWalk=true;P.pos.set(${i*3},terrainH(${i*3},25)+.2,25);P.vel.set(0,0,0);`);
    let cycle=0,reconnected=false;
    while(Date.now()-start<minutes*60000){
      await wait(10000);cycle++;
      // Repeated real reliable events alongside the unmodified frame-driven motion stream.
      await run(0,`netSetPvp(${cycle%2===1});for(let n=0;n<4;n++)sideBroadcast();`);report.events.quests+=4;
      await wait(200);
      check(`cycle ${cycle}: rules reach every guest`,(await Promise.all([1,2,3].map(i=>run(i,`NET.pvp===${cycle%2===1}`)))).every(Boolean));
      for(const i of [1,2])await steady(i,`P.pos.set(0,terrainH(0,25)+.2,${i===1?25:27});P.vel.set(0,0,0);P.heading=0;P.inv=0;P.block=false;P.hp=20;`);
      await wait(400);const before=await run(2,'P.hp');
      await run(1,`netBroadcast({t:'hit',from:NET.myId,to:'soak2',swing:${100+cycle},dmg:1,kb:0})`);report.events.pvp++;await wait(300);
      const after=await run(2,'P.hp');check(`cycle ${cycle}: PvP follows host rule`,cycle%2===1?after<before:after===before);
      await run(2,'P.inv=0');await run(1,`netBroadcast({t:'hit',from:NET.myId,to:'soak2',swing:${100+cycle},dmg:1,kb:0})`);report.events.pvp++;await wait(220);
      check(`cycle ${cycle}: replayed hit does not damage twice`,await run(2,'P.hp')===after);
      for(const i of [1,2])await run(i,'window.qaWalk=true;');
      if(cycle%3===0){
        // Bounded burst on actual RTC motion channels. netSend must observe real bufferedAmount pressure.
        const pressure=await run(0,`(()=>{const p=NET.peers.get('guest3'),pad='x'.repeat(16000),before=window.qaSkips;let peak=0;for(let n=0;n<80;n++){netSend(p,{t:'s',id:'pressure-probe',pad});peak=Math.max(peak,p.motion.bufferedAmount);}netSend(p,{t:'rules',pvp:NET.pvp});return {peak,skipped:window.qaSkips-before}})()`);
        report.events.pressure++;report.checks.push(`cycle ${cycle}: real motion burst peak ${pressure.peak}, skipped ${pressure.skipped}`);
        await wait(300);check(`cycle ${cycle}: reliable rules survive motion pressure`,await run(3,`NET.pvp===${cycle%2===1}`));
      }
      if(!reconnected&&Date.now()-start>minutes*30000){
        await run(3,`NET.peers.get('host').pc.close()`);await wait(900);
        check('disconnect removes departing player from remaining clients',(await Promise.all([0,1,2].map(i=>run(i,`NET.avatars.size===2&&!NET.avatars.has('soak3')`)))).every(Boolean));
        check('disconnected never-entered guest becomes solo without Gehenna ending',await run(3,`NET.role===null&&!WORLDSTATE.gehSeed&&!WORLDSTATE.luciferDefeated&&!WORLDSTATE.afterlife&&!AFTERLIFE.phase`));
        await connect(3);for(const p of pages)await p.waitForFunction(()=>window.__gameQa.run('NET.avatars.size===3'),null,{timeout:15000});
        report.events.reconnect++;reconnected=true;check('reconnect rebuilds exactly one avatar per party member',true);
      }
      const rows=await sample();
      for(let i=0;i<count;i++){
        check(`cycle ${cycle}: client ${i} connected finite live frame`,rows[i].avatars===3&&rows[i].started&&!rows[i].dead&&rows[i].frames>initial[i].frames&&rows[i].pos.every(Number.isFinite)&&rows[i].peers.every(p=>p.ready&&p.state==='connected'));
        check(`cycle ${cycle}: client ${i} reward is idempotent and fairies personal`,await run(i,`P.maxHp===${paid[i]}&&FAIRY.found===${fairyBase[i]}`));
      }
      assert.equal(report.errors.length,0,'runtime or shader error during soak');
      console.log(`soak ${Math.round((Date.now()-start)/1000)}s, ${cycle} activity cycles, ${report.checks.length} checks`);
    }
    const final=await sample();report.durationSeconds=(Date.now()-start)/1000;report.cycles=cycle;
    report.frameDeltas=final.map((s,i)=>s.frames-initial[i].frames);
    report.statePacketDeltas=final.map((s,i)=>(s.received.s||0)+(s.received.states||0)-(initial[i].received.s||0)-(initial[i].received.states||0));
    for(let i=0;i<count;i++)check(`client ${i} sustained actual rendering and motion traffic`,report.frameDeltas[i]>minutes*100&&report.statePacketDeltas[i]>minutes*100&&final[i].time>initial[i].time+minutes*10);
    check('soak ran for requested wall-clock duration',report.durationSeconds>=minutes*60);
    check('no uncaught runtime or shader errors',report.errors.length===0);report.ok=true;
  } catch(error){report.ok=false;report.failure=error.stack||String(error);throw error;}
  finally{report.finishedAt=new Date().toISOString();save();console.log(JSON.stringify({ok:report.ok,output,combatPassed:report.combat.filter(c=>c.ok).length,combatTotal:report.combat.length,checks:report.checks.length,durationSeconds:report.durationSeconds,events:report.events,errors:report.errors.length}));await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
