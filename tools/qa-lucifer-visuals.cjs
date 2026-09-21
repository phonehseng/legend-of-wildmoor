const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {loadPlaywright,browserPath}=require('./qa-game.cjs');
async function main(){
 const file=path.resolve(process.argv[2]||'legend_of_wildmoor_v3.6.3.html'),out=path.resolve(process.argv[3]||'artifacts/lucifer-visuals');
 const source=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),scripts=[...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);scripts.forEach(s=>new Function(s));
 const start=source.indexOf('  function gehBuildFinale() {'),end=source.indexOf('  function gehInteractLucifer(',start);assert.ok(start>0&&end>start);
 const beginPose=source.indexOf('  function gehPoseLuciferThrow('),endPose=source.indexOf('  function gehPoseLucifer(',beginPose);
 const throwHelper=beginPose>0&&beginPose<start?source.slice(beginPose,endPose):'';
 const divineStart=source.indexOf('  function gehLuciferStrain('),divineEnd=source.indexOf('  function gehUpdateFinale(',divineStart);
 const divineHelper=divineStart>0?source.slice(divineStart,divineEnd):'';
 const riverStart=source.indexOf('  function gehPrideRiverAt(x, z) {'),riverEnd=source.indexOf('  function gehH(x, z) {',riverStart);
 const riverHelper=riverStart>0?source.slice(riverStart,riverEnd):'';
 const browser=await loadPlaywright().chromium.launch({executablePath:browserPath('edge'),headless:true});const checks=[],errors=[];fs.mkdirSync(out,{recursive:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.setContent('<html><body style="margin:0"></body></html>');await page.addScriptTag({content:scripts[0]});
  await page.addScriptTag({content:`
const scene=new THREE.Scene();scene.background=new THREE.Color(0xe9e5df);
const GEH={root:new THREE.Group(),cx:600,cz:600,floor:-280,inPride:true,enemies:[]};scene.add(GEH.root);
const WORLDSTATE={},EXTRA=[],structs=[],SWIM_VOLS=[];let ENEMY_NID=0,time=0,shake=0;
const GEH_PRIDE_X=-800,GEH_PRIDE_Z=800;const damp=(a,b,k,dt)=>b+(a-b)*Math.exp(-k*dt);const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const P={pos:V3(527,-271,654)},dist2D=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
const toLin=c=>new THREE.Color(c).convertSRGBToLinear(),makeHealthBar=()=>null,makePrompt=()=>new THREE.Group(),gehAddStruct=s=>structs.push(s);
${riverHelper}
${source.slice(start,end)}
${throwHelper}
${divineHelper}
gehBuildFinale();
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1280,900);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;document.body.appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(42,1280/900,.05,200);scene.add(new THREE.HemisphereLight(0xffffff,0x8992a0,.9));const sun=new THREE.DirectionalLight(0xfff6e8,1.6);sun.position.set(530,-260,661);scene.add(sun);
const e=GEH.lucifer;e.mesh.position.set(527,-271,654);e.pos.copy(e.mesh.position);
function render(mode='children',scale=.62,t=0,angle=0){time=t;gehPoseLucifer(e,mode,scale,t);e.mesh.rotation.y=angle;const h=3.5*scale;camera.position.set(527+2.3*scale,-271+h*.66,654+6.8*scale);camera.lookAt(527,-271+h*.51,654);renderer.render(scene,camera);}
window.artQa={GEH,scene,renderer,camera,render,pose:gehPoseLucifer,throwPose:typeof gehPoseLuciferThrow==='function'?gehPoseLuciferThrow:null,divineStep:typeof gehUpdateDivineHand==='function'?(t)=>{time=t;gehUpdateDivineHand(1/60)}:null};render();
`});
  const result=await page.evaluate(()=>{
   const a=window.artQa,e=a.GEH.lucifer,r=e.luciferRig,checks=[];const check=(ok,n)=>{if(!ok)throw Error(n);checks.push(n);};
   check(!!r.cloak&&r.robePositions.length===33*8*3,'full skirt and separate draped cloak are built');
   check(r.arms.length===2&&r.arms.every(x=>['side','upper','lower','elbow','palm'].every(k=>k in x))&&!!r.up,'existing throw/hold arm contract preserved');
   let minHem=Infinity,maxHem=-Infinity;
   for(const mode of ['children','run','hold','release'])for(const scale of [.62,1.2,2.4])for(const t of [0,.14,.39]){
    a.pose(e,mode,scale,t);e.mesh.updateMatrixWorld(true);let bad=false;e.mesh.traverse(o=>{if([...o.matrixWorld.elements].some(n=>!Number.isFinite(n)))bad=true;});
    check(!bad,mode+' at '+scale+' / '+t+' keeps finite rig transforms');
    for(const mesh of [r.robe,r.cloak])check([...mesh.geometry.attributes.position.array,...mesh.geometry.attributes.normal.array].every(Number.isFinite),mode+' cloth vertices and normals remain finite');
    for(let i=7*33*3+1;i<r.robePositions.length;i+=3){minHem=Math.min(minHem,r.robePositions[i]);maxHem=Math.max(maxHem,r.robePositions[i]);}
    if(mode==='hold')check(Math.abs(r.arms[0].palm.position.y+.14-e.holdPalmHeight)<.001,'holding palms retain exact support height');
   }
   check(minHem>=.05&&maxHem<.14,'skirt hem remains at the feet through motion and growth');
   a.pose(e,'run',.62,0);const feet0=r.legs.map(l=>l.foot.position.toArray());a.pose(e,'run',.62,.14);check(r.legs.some((l,i)=>l.foot.position.toArray().some((n,j)=>n!==feet0[i][j])),'walking foot animation remains active beneath the skirt');
   if(a.throwPose){a.pose(e,'hold',2.4,0);e.scenePhase='hold';const other=r.arms[1].palm.position.clone();e.throwPose={side:r.arms[0].side,t:.6,target:'qa'};a.throwPose(e);check(r.arms[1].palm.position.equals(other),'throw leaves the supporting arm untouched');check(r.arms[0].palm.position.y<3,'actual throw helper visibly lowers only the throwing hand');e.throwPose=null;}
   if(a.divineStep){
    const h=a.GEH.godHand,f=h.userData.fingers;check(f.length===5&&new Set(f.map(x=>x.name)).size===5,'divine hand has four different fingers and an opposed thumb');
    check(f.every(f=>f.joints.length===4&&f.joints.flat().every(Number.isFinite))&&f[1].length>f[0].length&&f[0].length>f[3].length,'three phalange segments retain distinct finger proportions');
    check(f[4].joints[2][0]<f[4].joints[3][0]&&f[4].joints[0][2]<0,'thumb branches from the palm heel and curls inward');
    check(h.userData.palmBottom===-1.15,'divine palm contact-height contract is unchanged');
    check(!a.GEH.divineAperture.visible,'overhead distortion begins hidden');h.visible=true;h.position.set(515,-260,668);a.divineStep(1);check(a.GEH.divineAperture.visible&&a.GEH.divineAperture.material.uniforms.uOpen.value===1,'hand presence opens the overhead distortion');
    check(a.GEH.divineAperture.position.y+.065<a.GEH.floor+30.5,'all overhead distortion vertices stay below the opaque ceiling underside');
    const before=a.GEH.divineAperture.material.uniforms.uTime.value;a.divineStep(2);check(a.GEH.divineAperture.material.uniforms.uTime.value>before,'overhead shader animates from the real scene clock');h.position.y=-240;a.divineStep(3);check(a.GEH.divineAperture.material.uniforms.uOpen.value===0,'overhead distortion fades as the hand withdraws');h.visible=false;a.divineStep(4);check(!a.GEH.divineAperture.visible,'distortion hides with the absent hand');
   }
   const faceMaterials=[];r.torso.traverse(o=>{if(o.isMesh)faceMaterials.push(o.material);});check(faceMaterials.some(m=>m.isMeshBasicMaterial&&m.color.getHex()===0x020202),'simple dark eyes remain on the original face');
   a.render();const gl=a.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');let meshes=0;e.mesh.traverse(o=>{if(o.isMesh)meshes++;});
   return {checks,minHem,maxHem,meshes,throwHelperTested:!!a.throwPose,divineTested:!!a.divineStep,drawCalls:a.renderer.info.render.calls,triangles:a.renderer.info.render.triangles,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):''};
  });checks.push(...result.checks);
  for(const [name,mode,scale,t,angle]of [['standing','children',.62,0,0],['back','children',.62,0,Math.PI],['run','run',.62,.14,0],['hold','hold',2.4,0,0],['release','release',.62,0,0]]){
   await page.evaluate(([m,s,t,a])=>window.artQa.render(m,s,t,a),[mode,scale,t,angle]);await page.screenshot({path:path.join(out,name+'.png')});
  }
  if(result.divineTested){
   for(const view of ['palm','overhead']){
    await page.evaluate(view=>{const a=window.artQa,e=a.GEH.lucifer,h=a.GEH.godHand;e.pos.set(515,-271,668);e.mesh.position.copy(e.pos);e.mesh.rotation.y=Math.PI;a.pose(e,'hold',2.4,0);h.visible=true;h.position.set(515,-271+1.15+e.holdPalmHeight*2.4,668);a.divineStep(2.3);if(view==='palm'){a.camera.position.set(503,-266,657);a.camera.lookAt(515,-259,666);}else{a.camera.position.set(504,-267,655);a.camera.lookAt(515,-253,669);}a.renderer.render(a.scene,a.camera);},view);
    await page.screenshot({path:path.join(out,view+'.png')});
   }
  }
  assert.equal(errors.length,0,errors.join('\n'));const report={ok:true,file,total:checks.length,checks,metrics:result,errors};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({ok:true,total:checks.length,out,metrics:{meshes:result.meshes,drawCalls:result.drawCalls,triangles:result.triangles}},null,2));
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
