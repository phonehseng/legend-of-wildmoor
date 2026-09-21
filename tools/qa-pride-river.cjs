const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {instrument,serve,loadPlaywright,browserPath}=require('./qa-game.cjs');
async function main(){
  const input=path.resolve(process.argv[2]||'legend_of_wildmoor_v3.8.4.html'),out=path.resolve(process.argv[3]||'artifacts/pride-river/final');fs.mkdirSync(out,{recursive:true});
  const source=fs.readFileSync(input,'utf8').replace(/\r\n/g,'\n'),errors=[],results=[];
  const server=await serve(instrument(source));const browser=await loadPlaywright().chromium.launch({executablePath:browserPath('edge'),headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(String(e.stack||e)));
    await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__gameQa&&!document.body.classList.contains('loading'),null,{timeout:90000});
    await page.locator('#play').click();await page.locator('#start').click();
    const evaluate=s=>page.evaluate(async s=>await window.__gameQa.run(s),s);
    results.push(await evaluate(fs.readFileSync(path.join(__dirname,'qa-pride-river.js'),'utf8')));
    const shot=async(name,setup)=>{results.push({shot:name,value:await evaluate(setup)});await page.waitForTimeout(400);await page.screenshot({path:path.join(out,name+'.png')});};
    await shot('01-river-swimming',`(()=>{const q=window.__riverQa;q.move(GEH.prideWater.center(q.PZ+63)+3.1,q.PZ+63,GEH.floor+8.6);q.tick(.5);return{swim:P.swim,volume:P.swimVol?.id,air:P.air,pos:P.pos};})()`);
    await shot('02-hut-and-yard',`(()=>{const q=window.__riverQa;q.move(q.PX-76,q.PZ+53);q.tick(.2);return{hut:GEH.prideHut,children:GEH.prideChildren.map(c=>({x:c.position.x,y:c.position.y,z:c.position.z}))};})()`);
    await shot('03-river-bank',`(()=>{const q=window.__riverQa;q.move(q.PX-88,q.PZ+61);q.tick(.2);return{swim:P.swim,pos:P.pos};})()`);
    results.push(await evaluate(`(()=>{
      const q=window.__riverQa,checks=[],check=(v,s)=>{if(!v)throw Error(s);checks.push(s);};
      for(const [x,z] of [[576,510],[600,600],[648,678],[GEH.cx+q.PX-82,GEH.cz+q.PZ+68]])check(swimVolAt(x,z,GEH.floor+9).dry,'non-river Gehenna remains dry');
      q.move(GEH.prideWater.center(q.PZ+63),q.PZ+63,GEH.floor+8.6);q.tick(.5);check(P.swim,'return test starts swimming');
      const save=parseSaveKey(makeSaveKey());check(save&&save.pos[1]<DIVIDE,'ordinary portable save accepts river depth');
      gehAscend();check(P.pos.y>DIVIDE&&!P.swim&&!P.swimVol&&P.air===100,'ascend resets swim, volume and air');q.tick(2.3);
      // both editions keep gehenna standing between visits since 3.5 (it is raised at boot with the map), so its river stays registered below the seam
      check(GEH.root&&SWIM_VOLS.some(v=>v.id==='pride-river'),'gehenna stays standing between visits');
      check(swimVolAt(506,663,-272).dry,'removed river cannot catch another realm');return{checks:checks.length,labels:checks};
    })()`));
    if(errors.length)throw Error(errors.join('\n'));
    const report={ok:true,scope:'Focused fixture and real movement/update tests; not a fresh story playthrough. Multiplayer coverage exercises real packet serialization and remote-avatar application, not a peer connection.',input,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),results,errors};
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
