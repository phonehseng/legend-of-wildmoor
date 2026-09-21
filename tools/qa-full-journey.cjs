const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { instrument, serve, loadPlaywright, browserPath } = require('./qa-game.cjs');

async function main() {
  const args = process.argv.slice(2);
  const htmlFile = path.resolve(args.includes('--html') ? args[args.indexOf('--html') + 1] : 'legend_of_wildmoor_v3.8.html');
  const out = path.resolve(args.includes('--out') ? args[args.indexOf('--out') + 1] : 'artifacts/full-journey');
  fs.mkdirSync(out, {recursive: true});
  let html = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n');
  const originalSha256=crypto.createHash('sha256').update(html).digest('hex');
  const parserHotfix=args.includes('--parser-hotfix');
  if(parserHotfix)html=html.replace('!strs(d.found)','!strs(d.found, 2000)').replace('d.found.map(t => clean(t, 200))','d.found.map(t => clean(t, 2000))');
  const server = await serve(instrument(html));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await loadPlaywright().chromium.launch({executablePath: browserPath('edge'), headless: true});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors = [], commands = [], results = [];
  const meta = {htmlFile, originalSha256,parserHotfix,sourceSha256:crypto.createHash('sha256').update(html).digest('hex'), startedAt:new Date().toISOString(), scope:'Fresh-save assisted journey, or an explicit continuation of its own earned checkpoint. Scripted travel skips terrain/navigation. Combat and time may be advanced through real game functions. No story-completion flags or midgame presets are assigned.'};
  page.on('pageerror', e => errors.push(String(e.stack || e)));
  const safeStringify=value=>{const seen=new WeakSet();return JSON.stringify(value,(k,v)=>{if(v&&typeof v==='object'){if(v.isObject3D||v.isMaterial||v.isBufferGeometry||v.isTexture)return '[Three.js scene object]';if(seen.has(v))return '[Repeated reference]';seen.add(v);}return v;},2);};
  const persist = () => {fs.writeFileSync(path.join(out,'report.json'), safeStringify({meta,results,errors}));fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(commands,null,2));};
  const evaluate = source => page.evaluate(async s => await window.__gameQa.run(s), source);
  async function run(command) {
    const record = {name:command.name || `step-${results.length+1}`, at:new Date().toISOString()};
    try {
      if(command.eval) record.value = await evaluate(command.eval);
      if(command.checkpoint) {
        const key = await evaluate('makeSaveKey()');
        fs.writeFileSync(path.join(out,command.checkpoint+'.save.txt'),key);
        record.saveBytes=key.length;
        if(command.reload) {
          await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded',timeout:90000}),evaluate(`loadSaveKey(${JSON.stringify(key)})`)]);
          await page.waitForFunction(()=>window.__gameQa && !document.body.classList.contains('loading') && window.__gameQa.snapshot().started,null,{timeout:90000});
          await evaluate('paused=true; Voice.on=false; Voice.stop();');
          if(fs.existsSync(path.join(__dirname,'qa-full-journey.js'))) await evaluate(fs.readFileSync(path.join(__dirname,'qa-full-journey.js'),'utf8'));
          record.reloaded=true;
        }
      }
      if(command.screenshot) await page.screenshot({path:path.join(out,command.screenshot+'.png'),fullPage:true});
      record.state=await evaluate('({stage:stage(),objective:priorityQuest()?.text || objectives[stage()]?.text,player:{hp:P.hp,maxHp:P.maxHp,level:heroLevel(),kills:P.kills,gkills:P.gkills,herbs:P.herbs,logs:P.logs,pos:P.pos},story:{...STORY},world:{...WORLDSTATE},villages:villagesDone(),fairies:FAIRY.found})');
      record.ok=true;commands.push(command);
    } catch(e) {record.ok=false;record.error=String(e.stack||e);}
    results.push(record);persist();console.log(safeStringify(record));
    return record;
  }
  try {
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__gameQa && !document.body.classList.contains('loading'),null,{timeout:90000});
    await page.locator('#play').click();await page.locator('#start').click();
    if(args.includes('--resume')) {
      meta.resumedFrom=path.resolve(args[args.indexOf('--resume')+1]);
      const key=fs.readFileSync(meta.resumedFrom,'utf8').trim();
      if(!await evaluate(`!!parseSaveKey(${JSON.stringify(key)})`))throw Error('Earned checkpoint rejected by parseSaveKey: '+meta.resumedFrom);
      await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded',timeout:90000}),evaluate(`loadSaveKey(${JSON.stringify(key)})`)]);
      await page.waitForFunction(()=>window.__gameQa && !document.body.classList.contains('loading') && window.__gameQa.snapshot().started,null,{timeout:90000});
    }
    await evaluate('paused=true; Voice.on=false; Voice.stop();');
    await evaluate(fs.readFileSync(path.join(__dirname,'qa-full-journey.js'),'utf8'));
    console.log(JSON.stringify({ready:true,...meta}));
    if(args.includes('--replay')) {
      const replay=JSON.parse(fs.readFileSync(args[args.indexOf('--replay')+1],'utf8'));
      for(const command of replay) {const r=await run(command);if(!r.ok)throw Error(r.error);}
    } else {
      const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
      for await(const line of rl) {if(line==='exit')break;try {await run(JSON.parse(line));}catch(e){console.log(JSON.stringify({inputError:String(e)}));}}
    }
  } finally {meta.finishedAt=new Date().toISOString();try{persist();}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}}
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
