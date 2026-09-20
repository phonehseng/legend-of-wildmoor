const fs=require('node:fs'),assert=require('node:assert/strict');
const {instrument,serve,loadPlaywright,browserPath}=require('./qa-game.cjs');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
  const file=process.argv[2]||'legend_of_peanits_v3.3.1.html';
  const server=await serve(instrument(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')));
  const browser=await loadPlaywright().chromium.launch({executablePath:browserPath('edge'),headless:true});
  const pages=[],checks=[],errors=[];
  const run=(i,source)=>pages[i].evaluate(code=>window.__gameQa.run(code),source);
  const check=(ok,label)=>{assert.ok(ok,label);checks.push(label);};
  try{
    for(let i=0;i<2;i++){
      const page=await browser.newPage();pages.push(page);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
      await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>window.__gameQa,null,{timeout:90000});
      await run(i,`NET.myId='fairy${i}';NET.role='${i?'guest':'host'}';P.pos.set(0,20,${i*2});P.hp=P.maxHp=10;setInterval(()=>updateNet(.05),50);Voice.on=false;`);
    }
    await run(0,'talkFairyQueen();for(const c of FAIRY.children.slice(0,5))rescueFairy(c)');
    const offer=await run(0,`(async()=>{const p=netPeer('guest');p.pc.setConfiguration({iceServers:[]});netCreateChannels(p);await p.pc.setLocalDescription(await p.pc.createOffer());await netGathered(p.pc);return p.pc.localDescription.toJSON()})()`);
    const answer=await run(1,`(async()=>{const p=netPeer('host');p.pc.setConfiguration({iceServers:[]});p.pc.ondatachannel=e=>netWire(p,e.channel);await p.pc.setRemoteDescription(${JSON.stringify(offer)});await p.pc.setLocalDescription(await p.pc.createAnswer());await netGathered(p.pc);return p.pc.localDescription.toJSON()})()`);
    await run(0,`NET.peers.get('guest').pc.setRemoteDescription(${JSON.stringify(answer)})`);
    for(const page of pages)await page.waitForFunction(()=>window.__gameQa.run('NET.avatars.size===1'),null,{timeout:20000});
    await wait(700);
    check(await run(1,'FAIRY.found===0&&!FAIRY.accepted&&!FAIRY.quest.taken&&P.maxHp===10'),'late guest inherits no fairy rescues, acceptance or rose heart');
    check(await run(1,'FAIRY.children.slice(0,5).every(c=>!c.found&&c.mesh.visible)'),'host rescues leave the same fairies available to the guest');
    await run(1,'talkFairyQueen();rescueFairy(FAIRY.children[0])');await wait(700);
    check(await run(1,'FAIRY.found===1&&FAIRY.accepted&&P.maxHp===10'),'guest can accept and rescue independently');
    check(await run(0,'FAIRY.found===5&&FAIRY.hearts===1&&P.maxHp===11'),'guest rescue leaves host progress and reward unchanged');
    await run(1,'for(const c of FAIRY.children.slice(1,5))rescueFairy(c)');await wait(700);
    check(await run(1,'FAIRY.found===5&&FAIRY.hearts===1&&P.maxHp===11'),'guest earns its own fifth-rescue heart');
    check(await run(0,'FAIRY.found===5&&P.maxHp===11'),'same five children on both clients never combine into ten');
    check(await run(0,'parseSaveKey(makeSaveKey()).fairy.kids.length===5')&&await run(1,'parseSaveKey(makeSaveKey()).fairy.kids.length===5'),'each portable save keeps its own rescued IDs');
    check(errors.length===0,'no JavaScript or shader errors');
    console.log(JSON.stringify({ok:true,checks,errors,scope:'two complete local WebRTC game clients'},null,2));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
