// Four complete game clients, real local WebRTC, actual Move on choice callback.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {instrument,serve,loadPlaywright,browserPath}=require('./qa-game.cjs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 const html=process.argv[2]||'legend_of_peanits_v3.3.1.html';
 const server=await serve(instrument(fs.readFileSync(html,'utf8').replace(/\r\n/g,'\n')));
 const browser=await loadPlaywright().chromium.launch({executablePath:browserPath('edge'),headless:true});
 const pages=[],errors=[],checks=[];
 const run=(i,s)=>pages[i].evaluate(source=>window.__gameQa.run(source),s);
 const check=(name,ok)=>{assert.ok(ok,name);checks.push(name);};
 try{
  for(let i=0;i<4;i++){
   const p=await browser.newPage({viewport:{width:640,height:360}});pages.push(p);
   p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.goto(`http://127.0.0.1:${server.address().port}`);await p.waitForFunction(()=>window.__gameQa,null,{timeout:90000});
   await run(i,`paused=true;Voice.enabled=false;death=null;NET.myId='world${i}';NET.role='${i?'guest':'host'}';P.hp=P.maxHp=20;P.pos.set(${20+i*4},20,${10+i*3});P.vel.set(0,0,0);P.gehDive=null;GEH_PERSONAL_KEYS.forEach(k=>WORLDSTATE[k]=k==='gehSeed'?0:k==='afterlife'?null:false);`);
   if(i===0)await run(i,`WORLDSTATE.gehUnlocked=true;WORLDSTATE.gehSeed=57312;GEH_NET_FLAGS.forEach(k=>WORLDSTATE[k]=true);WORLDSTATE.hermitWarned=true;P.pos.set(GEH.cx,GEH.floor+1,GEH.cz);`);
   if(i===2)await run(i,`WORLDSTATE.gehUnlocked=true;WORLDSTATE.gehSeed=13579;WORLDSTATE.gehAlmonerDown=true;WORLDSTATE.luciferDefeated=true;WORLDSTATE.gehFinaleWitnessed=true;WORLDSTATE.afterlife='stay';grant(ALMONER_GIFT,()=>{P.bonus.guard=.85},true,false,'geh:almoner');window.qaPrior=JSON.stringify(Object.fromEntries(GEH_PERSONAL_KEYS.map(k=>[k,WORLDSTATE[k]])));`);
   if(i===3)await run(i,`P.pos.set(GEH.cx,GEH.floor+1,GEH.cz);`);
   await run(i,'setInterval(()=>updateNet(.05),50)');console.log(`world ${i} ready`);
  }
  for(let i=1;i<4;i++){
   const offer=await run(0,`(async()=>{const p=netPeer('guest${i}');p.pc.setConfiguration({iceServers:[]});netCreateChannels(p);await p.pc.setLocalDescription(await p.pc.createOffer());await netGathered(p.pc);return p.pc.localDescription.toJSON();})()`);
   const answer=await run(i,`(async()=>{const p=netPeer('host');p.pc.setConfiguration({iceServers:[]});p.pc.ondatachannel=e=>netWire(p,e.channel);await p.pc.setRemoteDescription(${JSON.stringify(offer)});await p.pc.setLocalDescription(await p.pc.createAnswer());await netGathered(p.pc);return p.pc.localDescription.toJSON();})()`);
   await run(0,`NET.peers.get('guest${i}').pc.setRemoteDescription(${JSON.stringify(answer)})`);
  }
  for(const p of pages)await p.waitForFunction(()=>window.__gameQa.run('NET.avatars.size===3'),null,{timeout:25000});
  check('four full clients connect through reliable and motion WebRTC channels',await run(0,`[...NET.peers.values()].every(p=>p.ch.ordered&&p.motion.readyState==='open'&&!p.motion.ordered)`));
  await wait(600);
  check('fresh Wildmoor bystander caches host finale without receiving Gehenna progress or rewards',await run(1,`NET.gehState&&NET.gehState.seed===57312&&!WORLDSTATE.gehSeed&&!GEH_NET_FLAGS.some(k=>WORLDSTATE[k])&&!WORLDSTATE.gehUnlocked&&!WORLDSTATE.afterlife&&!FOUND.some(x=>[ALMONER_GIFT,MATRON_GIFT,UNCLAIMED_GIFT].includes(x))&&!GEH.root`));
  check('prior personal Gehenna history remains intact while guest stays above',await run(2,`window.qaPrior===JSON.stringify(Object.fromEntries(GEH_PERSONAL_KEYS.map(k=>[k,WORLDSTATE[k]])))&&FOUND.includes(ALMONER_GIFT)&&P.bonus.guard===.85`));
  check('only validated underground guest is marked as a participant',await run(0,`!NET.peers.get('guest1').gehEntered&&!NET.peers.get('guest2').gehEntered&&NET.peers.get('guest3').gehEntered`));
  check('an entered guest adopts host Gehenna progress',await run(3,`NET.gehEntered&&NET.gehApplied&&WORLDSTATE.gehSeed===57312&&WORLDSTATE.luciferDefeated`));
  for(const i of [1,2])await run(i,`P.pos.set(${71+i},24,${-31-i});P.hp=17;P.vel.set(0,0,0);P.kills=4;WORLDSTATE.hermitChurchTaken=true;window.qaKept={pos:P.pos.toArray(),hp:P.hp,max:P.maxHp,kills:P.kills,found:FOUND.slice()};`);
  await run(0,`showAfterlifeChoice();answerChoice(1);`);
  for(const i of [1,2])await pages[i].waitForFunction(()=>window.__gameQa.run('NET.role===null'),null,{timeout:6000});
  await wait(300);
  check('host actual Move on callback opens only the host modern ending',await run(0,`WORLDSTATE.afterlife==='moveOn'&&AFTERLIFE.phase==='modern'`));
  check('both never-entered guests become solo and all remote actors are removed',await run(1,`NET.role===null&&!NET.avatars.size&&!NET.peers.size&&!NET.gehState&&!NET.gehShared`)&&await run(2,`NET.role===null&&!NET.avatars.size&&!NET.peers.size&&!NET.gehState&&!NET.gehShared`));
  check('fresh guest retains zero Gehenna completion seed or reward after departure',await run(1,`!WORLDSTATE.gehSeed&&!GEH_NET_FLAGS.some(k=>WORLDSTATE[k])&&!WORLDSTATE.gehUnlocked&&!WORLDSTATE.gehFinaleWitnessed&&!WORLDSTATE.afterlife&&!FOUND.some(x=>[ALMONER_GIFT,MATRON_GIFT,UNCLAIMED_GIFT].includes(x))`));
  check('earlier personal Gehenna history and gift survive departure exactly',await run(2,`window.qaPrior===JSON.stringify(Object.fromEntries(GEH_PERSONAL_KEYS.map(k=>[k,WORLDSTATE[k]])))&&FOUND.includes(ALMONER_GIFT)&&P.bonus.guard===.85`));
  for(const i of [1,2])check(`solo guest ${i} keeps current Wildmoor position health and progress without a private ending`,await run(i,`JSON.stringify(P.pos.toArray())===JSON.stringify(window.qaKept.pos)&&P.hp===window.qaKept.hp&&P.maxHp===window.qaKept.max&&P.kills===window.qaKept.kills&&JSON.stringify(FOUND)===JSON.stringify(window.qaKept.found)&&WORLDSTATE.hermitWarned&&WORLDSTATE.hermitChurchTaken&&!CHOICE&&!AFTERLIFE.phase&&guestedThisSession`));
  check('host retains the actual participant and sends no closure to them',await run(0,`NET.peers.size===1&&NET.peers.has('guest3')&&!NET.peers.get('guest3').worldCloseToken`));
  check('participant remains connected and eligible for their own personal ending',await run(3,`NET.role==='guest'&&NET.peers.get('host').ready&&NET.gehEntered&&WORLDSTATE.gehSeed===57312&&!WORLDSTATE.afterlife&&!CHOICE&&!AFTERLIFE.phase`));
  check('no runtime or shader errors',errors.length===0);
  console.log(JSON.stringify({ok:true,total:checks.length,checks,errors,scope:'four full local WebRTC game clients; actual host Move on; not an internet latency test'},null,2));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
