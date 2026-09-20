const fs = require('fs');
const path = require('path');
function loadPlaywright() {
  // playwright is not a dependency of this project; QA_PLAYWRIGHT points at the node_modules folder holding it
  // when the machine keeps its copy somewhere node would not look on its own.
  try { return require('playwright'); }
  catch (_) {
    if (!process.env.QA_PLAYWRIGHT) throw new Error('playwright not found. install it, or set QA_PLAYWRIGHT to the node_modules folder holding it.');
    return require(path.join(process.env.QA_PLAYWRIGHT, 'playwright'));
  }
}
const { chromium } = loadPlaywright();

async function main() {
  const source = fs.readFileSync(path.resolve(process.argv[2] || 'legend_of_peanits_v3.3.1.html'), 'utf8');
  const scripts = [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  scripts.forEach(script => new Function(script));
  const start = source.indexOf('  function gehBuildFinale() {');
  const end = source.indexOf('  function gehInteractLucifer()', start);
  if (start < 0 || end < 0) throw new Error('Lucifer build function missing');
  const build = source.slice(start, end);
  const updateStart = source.indexOf('  function gehUpdateFinale(dt) {');
  const updateEnd = source.indexOf('  function gehLuciferDown()', updateStart);
  if (updateStart < 0 || updateEnd < 0) throw new Error('Finale visual update missing');
  const update = source.slice(updateStart, updateEnd);
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
    await page.setContent('<html><body style="margin:0"></body></html>');
    await page.addScriptTag({ content: scripts[0] });
    await page.addScriptTag({ content: `
      const scene = new THREE.Scene(); scene.background = new THREE.Color(0xffffff);
      const GEH = { root: new THREE.Group(), cx: 600, cz: 600, floor: -280, inPride: true, enemies: [] };
      scene.add(GEH.root);
      const WORLDSTATE = {}, EXTRA = [], structs = []; let ENEMY_NID = 0, time = 0;
      const V3 = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
      const P = {pos:V3(527,-271,654)};
      const dist2D = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
      const gehAscend = () => {throw new Error('Art QA unexpectedly triggered ascent');};
      const toLin = c => new THREE.Color(c).convertSRGBToLinear();
      const makeHealthBar = () => null, makePrompt = () => new THREE.Group();
      const gehAddStruct = s => structs.push(s);
      ${build}
      ${update}
      gehBuildFinale();
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(1280,900); renderer.outputEncoding = THREE.sRGBEncoding;
      document.body.appendChild(renderer.domElement);
      const camera = new THREE.PerspectiveCamera(45,1280/900,0.05,150);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c6, 0.9));
      const sun = new THREE.DirectionalLight(0xffffff, 0.85);
      sun.position.set(510,-248,643); sun.target.position.set(518,-269,668);
      scene.add(sun, sun.target);
      const renders = (view) => {
        if (view === 'children') { camera.position.set(527,-268.8,659); camera.lookAt(527,-269.8,654); }
        else if (view === 'run') { camera.position.set(530,-268.5,658); camera.lookAt(527,-269.8,654); }
        else if (view === 'face') { camera.position.set(518,-267.8,663.8); camera.lookAt(518,-268.1,668); }
        else if (view === 'garden') { camera.position.set(517,-262,642); camera.lookAt(510,-269.5,660); }
        else if (view === 'entry') { camera.position.set(515,-267.5,643); camera.lookAt(518,-267,668); }
        else { camera.position.set(506,-262,652); camera.lookAt(518,-265,668); }
        renderer.render(scene,camera);
      };
      window.artQa = {GEH,structs,scene,renderer,camera,renders,pose:gehPoseLucifer,step:seconds=>{time=seconds;gehUpdateFinale(1/60);}};
      renders('room');
    ` });
    const metrics = await page.evaluate(() => {
      const {GEH,structs,scene,renderer} = window.artQa;
      let meshes=0,instances=0,invalid=0;
      scene.traverse(o => { if(o.isMesh) {meshes++;if(o.isInstancedMesh){instances += o.count;invalid += [...o.instanceMatrix.array].some(v=>!Number.isFinite(v))?1:0;}} });
      if (invalid) throw new Error('Nonfinite instance transforms');
      if(GEH.lucifer.mesh.parent!==GEH.prideRoom||GEH.godHand.parent!==GEH.prideRoom) throw new Error('Room body ownership broken');
      if(GEH.luciferPrompt.parent!==GEH.prideRoom) throw new Error('Prompt outside room');
      if(GEH.prideChildren.length!==3) throw new Error('Missing children');
      const p=GEH.lucifer.pos;if(p.x!==527||p.z!==654||p.y!==-271) throw new Error('Child-side starting position mismatch');
      if(GEH.godHand.visible) throw new Error('God hand visible before confrontation');
      if(GEH.lucifer.bodyScale!==0.62) throw new Error('Lucifer not initially human-sized');
      const rig=GEH.lucifer.luciferRig;
      if(!rig||rig.arms.length!==2||rig.legs.length!==2) throw new Error('Incomplete Lucifer rig');
      for(const mode of ['children','run','hold']) for(const scale of [0.62,1.2,2.4]) {
        window.artQa.pose(GEH.lucifer,mode,scale,2.25);
        GEH.lucifer.mesh.updateMatrixWorld(true);
        GEH.lucifer.mesh.traverse(o=>{if([...o.matrixWorld.elements].some(n=>!Number.isFinite(n))) throw new Error('Invalid '+mode+' transform');});
        if(mode==='hold'&&Math.abs(rig.arms[0].palm.position.y+0.14-GEH.lucifer.holdPalmHeight)>0.001) throw new Error('Palm support height mismatch');
        if([...rig.robe.geometry.attributes.normal.array].some(n=>!Number.isFinite(n))) throw new Error('Invalid robe normals');
        if(rig.robe.geometry.attributes.normal.array[0]<=0) throw new Error('Robe exterior points inward');
      }
      const waterBefore=[...GEH.prideWater.flow.instanceMatrix.array];
      window.artQa.step(4);
      const waterAfter=[...GEH.prideWater.flow.instanceMatrix.array];
      if(waterAfter.some(n=>!Number.isFinite(n))) throw new Error('Invalid river flow transforms');
      if(waterBefore.every((n,i)=>n===waterAfter[i])) throw new Error('River current did not animate');
      window.artQa.pose(GEH.lucifer,'children',0.62,0);
      if(structs.filter(s=>s.cz===600).length!==80) throw new Error('Return staircase incomplete');
      const gl=renderer.getContext(), debug=gl.getExtension('WEBGL_debug_renderer_info');
      return {meshes,instances,structs:structs.length,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,gpu:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'unknown'};
    });
    const output = file => path.resolve('artifacts/lucifer',file);
    fs.mkdirSync(path.resolve('artifacts/lucifer'),{recursive:true});
    await page.evaluate(()=>window.artQa.renders('children'));
    await page.screenshot({path:output('children.png')});
    await page.evaluate(()=>{const a=window.artQa;a.pose(a.GEH.lucifer,'run',0.62,2.25);a.renders('run');});
    await page.screenshot({path:output('run.png')});
    await page.evaluate(()=>{const a=window.artQa;a.pose(a.GEH.lucifer,'children',0.62,0);a.renders('garden');});
    await page.screenshot({path:output('garden.png')});
    await page.evaluate(()=>{const a=window.artQa;a.GEH.lucifer.mesh.position.set(518,-271,668);a.GEH.lucifer.mesh.rotation.y=Math.PI;a.pose(a.GEH.lucifer,'hold',1,0);a.GEH.godHand.visible=true;a.GEH.godHand.position.set(518,-265.7,668);a.renders('room');});
    await page.screenshot({path:output('room.png')});
    await page.evaluate(()=>window.artQa.renders('entry'));
    await page.screenshot({path:output('entry.png')});
    await page.evaluate(()=>window.artQa.renders('face'));
    await page.screenshot({path:output('face.png')});
    if(errors.length) throw new Error(errors.join('\n'));
    console.log(JSON.stringify({ok:true,metrics,screenshots:['garden.png','children.png','run.png','room.png','face.png'].map(output)},null,2));
  } finally { await browser.close(); }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
