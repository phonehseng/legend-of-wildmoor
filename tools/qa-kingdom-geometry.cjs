const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const html = fs.readFileSync(process.argv[2] || 'legend_of_peanits_v2.24.2.html', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
const context = vm.createContext({ console });
vm.runInContext(scripts.find(s => s.includes('REVISION') && s.length > 500000), context);
const THREE = context.THREE;
const checks = [];
const check = (ok, label) => { assert(ok, label); checks.push(label); };
Object.assign(context, {
  GEH: { root: new THREE.Group(), cx: 600, cz: 600, floor: -280, seed: 1, mats: [], lampPos: [], structs: new Map(), M: { cloth: new THREE.MeshBasicMaterial(), skin: new THREE.MeshBasicMaterial() } },
  V3: (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z),
  toLin: x => new THREE.Color(x).convertSRGBToLinear(),
  skey: (i, j) => (i + 2000) * 8192 + j + 2000,
  SCELL: 32, _nostruct: [], DIVIDE: -200, GEH_VOID: -1400,
  GEH_L: { dishR: 17, dishD: 1.35, yardX: 104, yardR: 11, hillX: 136, hillR: 20, hillH: 9 },
  fbm: () => 0.5, lerp: (a, b, t) => a + (b - a) * t,
  smooth: t => t * t * (3 - 2 * t), clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
  dist2D: (a, b) => Math.hypot(a.x - b.x, a.z - b.z),
  P: { pos: new THREE.Vector3(736, -271, 600), vel: new THREE.Vector3(), gehDive: null },
  WORLDSTATE: { gehDone: false }, visY: -271, lastSafePos: new THREE.Vector3(),
  afterlifeLocked: () => false, SFX: { tone() {} }, showPlace() {},
  document: { createElement: () => ({ style: {}, remove() {} }), body: { appendChild() {} } }
});
function extract(start, end) { return html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start))); }
vm.runInContext(extract('  function gehH(', '  // the cheap heightfield'), context);
vm.runInContext(extract('  function gehAddStruct(', '  // ---- the one room'), context);
vm.runInContext(extract('  function resolveStructs(', '  // villages on the peaks'), context);
vm.runInContext(extract('  function gehBuildKingdom(', '  function gehBuildFinale('), context);
context.gehBuildKingdom();
const { GEH, P, WORLDSTATE } = context;
check(GEH.kingdomResidents.length === 8, 'Eight sparse static residents');
let routeSamples = 0;
const route = [[136, 0], [136, 34], [104, 34], [104, 78], [48, 78]];
for (let k = 1; k < route.length; k++) {
  const [ax, az] = route[k - 1], [bx, bz] = route[k], count = Math.ceil(Math.hypot(bx - ax, bz - az));
  for (let i = 0; i <= count; i++) {
    const p = new THREE.Vector3(GEH.cx + ax + (bx - ax) * i / count, GEH.floor + 9, GEH.cz + az + (bz - az) * i / count);
    assert(Math.abs(context.gehH(p.x, p.z) - p.y) < 0.001, `Level street at ${p.x}, ${p.z}`);
    const before = p.clone(); context.resolveStructs(p, 0.52);
    assert(p.distanceTo(before) < 0.001, `Street collision at ${p.x}, ${p.z}`);
    routeSamples++;
  }
}
checks.push(`Clerk-to-portal street: ${routeSamples} level, unobstructed samples`);
GEH.root.updateMatrixWorld(true);
let maxRadius = 0, maxY = -Infinity, vertices = 0;
const p = new THREE.Vector3(), instance = new THREE.Matrix4(), world = new THREE.Matrix4();
GEH.root.traverse(o => {
  if (!o.geometry || !o.geometry.attributes.position) return;
  const attr = o.geometry.attributes.position, count = o.isInstancedMesh ? o.count : 1;
  for (let i = 0; i < count; i++) {
    if (o.isInstancedMesh) { o.getMatrixAt(i, instance); world.multiplyMatrices(o.matrixWorld, instance); }
    else world.copy(o.matrixWorld);
    for (let j = 0; j < attr.count; j++) {
      p.fromBufferAttribute(attr, j).applyMatrix4(world);
      maxRadius = Math.max(maxRadius, Math.hypot(p.x - GEH.cx, p.z - GEH.cz)); maxY = Math.max(maxY, p.y); vertices++;
    }
  }
});
check(maxRadius <= 170 && maxY < -200, `${vertices} vertices remain within realm: radius ${maxRadius.toFixed(2)}, top ${maxY.toFixed(2)}`);
const resident = GEH.kingdomResidents[1], origin = resident.pos.clone();
P.pos.set(GEH.cx + 60, GEH.floor + 9, GEH.cz + 78);
context.gehUpdateKingdom(20);
check(resident.pos.equals(origin), 'Residents remain still without contact');
P.pos.copy(origin); P.pos.x -= 0.5; context.gehUpdateKingdom(0.016);
check(resident.pos.distanceTo(origin) > 0.4, 'Player contact pushes the resident');
const pushed = resident.pos.clone(); P.pos.set(GEH.cx + 60, GEH.floor + 9, GEH.cz + 78); context.gehUpdateKingdom(20);
check(resident.pos.equals(pushed), 'Pushed resident does not walk back');
P.pos.copy(GEH.kingdom.portal); context.gehUpdateKingdom(2);
check(!GEH.kingdom.transit && !GEH.inPride, 'Portal respects Gehenna completion');
WORLDSTATE.gehDone = true; context.gehUpdateKingdom(0.25);
check(GEH.inPride && Math.abs(P.pos.x - 515) < 0.01 && Math.abs(P.pos.z - 642) < 0.01 && P.pos.y < -200, 'Portal enters the white pocket without crossing realms');
context.gehUpdateKingdom(2); context.gehUpdateKingdom(2);
P.pos.set(515, -270.95, 640.5); context.gehUpdateKingdom(0.25);
check(!GEH.inPride && Math.abs(P.pos.x - 651.5) < 0.01, 'Unarmed return portal returns to the central road');
console.log(JSON.stringify({ checks, maxRadius, maxY }, null, 2));
