// The Still Kingdom, built in a sandbox with no browser: the straight road down to it is level and unobstructed,
// its residents are static until you walk into them, and the tear at the end of it only opens for the whole party.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const html = fs.readFileSync(process.argv[2] || 'legend_of_wildmoor_v3.8.9.html', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
const context = vm.createContext({ console });
vm.runInContext(scripts.find(s => s.includes('REVISION') && s.length > 500000), context);
const THREE = context.THREE;
const checks = [];
const check = (ok, label) => { assert(ok, label); checks.push(label); };
const CX = 600, CZ = 600, FLOOR = -280, PRIDE_X = -800, PRIDE_Z = 800;
Object.assign(context, {
  GEH: { root: new THREE.Group(), cx: CX, cz: CZ, floor: FLOOR, seed: 1, mats: [], lampPos: [], structs: new Map(), M: { cloth: new THREE.MeshBasicMaterial(), skin: new THREE.MeshBasicMaterial() } },
  V3: (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z),
  toLin: x => new THREE.Color(x).convertSRGBToLinear(),
  skey: (i, j) => (i + 2000) * 8192 + j + 2000,
  SCELL: 32, _nostruct: [], DIVIDE: -200, GEH_VOID: -1400,
  GEH_PRIDE_X: PRIDE_X, GEH_PRIDE_Z: PRIDE_Z,
  gehPrideRiverAt: () => ({ bed: 0, depth: 0, wet: false }),
  GEH_L: { dishR: 17, dishD: 1.35, yardX: 104, yardR: 11, hillX: 136, hillR: 20, hillH: 9 },
  fbm: () => 0.5, lerp: (a, b, t) => a + (b - a) * t,
  smooth: t => t * t * (3 - 2 * t), clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
  dist2D: (a, b) => Math.hypot(a.x - b.x, a.z - b.z),
  P: { pos: new THREE.Vector3(CX + 136, FLOOR + 9, CZ), vel: new THREE.Vector3(), gehDive: null },
  CUSTOM: { name: 'Mirabel' },
  WORLDSTATE: { gehDone: false }, visY: FLOOR + 9, lastSafePos: new THREE.Vector3(), lastSafeGeh: new THREE.Vector3(), camYaw: 0, death: null,
  afterlifeLocked: () => false, SFX: { tone() {} }, showPlace() {},
  // the party gate reaches for the network, the clock and the subtitle line; none of them need to be real here.
  NET: { avatars: new Map(), peers: new Map(), role: null, myId: 'qa' },
  netGuest: () => false, netSend: () => {}, netGehennaRequest: () => {}, say: () => null, time: 0,
  netGehennaBelow: p => p.y < -200,
  netGehennaRoom: p => p.y < -200 && Math.abs(p.x - (CX + PRIDE_X)) < 240 && Math.abs(p.z - (CZ + PRIDE_Z)) < 240,
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

// The road is one straight line on the kingdom's own lower level, from the foot of the ramp to the tear.
let roadSamples = 0;
for (let x = 172; x <= 364; x += 0.5) {
  const p = new THREE.Vector3(GEH.cx + x, GEH.floor + 1, GEH.cz);
  assert(Math.abs(context.gehH(p.x, p.z) - p.y) < 0.001, `Level street at ${x}`);
  const before = p.clone(); context.resolveStructs(p, 0.52);
  assert(p.distanceTo(before) < 0.001, `Street collision at ${x}`);
  roadSamples++;
}
checks.push(`Ramp-to-tear street: ${roadSamples} level, unobstructed samples`);
// And the ramp down to it never asks the player to climb: no step is steeper than one metre per metre.
let worstStep = 0;
for (let x = 118; x <= 172; x += 0.5) {
  const a = context.gehH(GEH.cx + x, GEH.cz), b = context.gehH(GEH.cx + x + 0.5, GEH.cz);
  worstStep = Math.max(worstStep, Math.abs(b - a) / 0.5);
}
check(worstStep <= 1, `Ramp down to the kingdom is walkable: steepest grade ${worstStep.toFixed(2)}`);

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
check(maxRadius <= 420 && maxY < -200, `${vertices} vertices remain within realm: radius ${maxRadius.toFixed(2)}, top ${maxY.toFixed(2)}`);

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
WORLDSTATE.gehDone = true;
// A companion still out on the road holds the tear shut, however long the player stands in it.
context.NET.role = 'host';
context.NET.peers.set('p1', { id: 'p1', ready: true });
context.NET.avatars.set('mate', { id: 'mate', via: 'p1', look: { name: 'Mate' }, state: { pos: new THREE.Vector3(GEH.cx + 200, GEH.floor + 1, GEH.cz), dead: false, hp: 20, maxHp: 20 } });
for (let i = 0; i < 12; i++) { context.time += 0.25; context.gehUpdateKingdom(0.25); }
check(!GEH.kingdom.transit && !GEH.inPride && context.gehPrideAway().length === 1, 'The tear will not open while a companion is away');
// and the local player is one of the people it waits for. a guest's request is validated against the GUEST's
// position and then takes everybody, so without this the host could be pulled through from anywhere in Gehenna.
context.NET.avatars.get('mate').state.pos.copy(GEH.kingdom.portal);
const standing = P.pos.clone();
P.pos.set(GEH.cx - 300, GEH.floor + 1, GEH.cz - 300);
check(context.gehPrideAway().length === 1, 'The tear waits for the host as well as the guests');
P.pos.copy(standing);
context.NET.avatars.get('mate').state.pos.set(GEH.cx + 200, GEH.floor + 1, GEH.cz);
context.NET.avatars.get('mate').state.pos.copy(GEH.kingdom.portal);
context.gehUpdateKingdom(0.25);
check(GEH.inPride && Math.abs(P.pos.x - (GEH.cx + PRIDE_X - 14)) < 0.01 && Math.abs(P.pos.z - (GEH.cz + PRIDE_Z - 5)) < 0.01 && P.pos.y < -200, 'The whole party at the tear enters the white pocket without crossing realms');
context.gehUpdateKingdom(2); context.gehUpdateKingdom(2);
P.pos.set(GEH.cx + PRIDE_X - 20, GEH.floor + 9.05, GEH.cz + PRIDE_Z - 5); context.gehUpdateKingdom(0.25);
check(!GEH.inPride && Math.abs(P.pos.x - (GEH.cx + 356)) < 0.01, 'Unarmed return portal returns to the kingdom plaza');
// and it puts you down OUTSIDE the doorway it just brought you out of: the entry trigger is a broad box, so an
// exit inside it pulled the player straight back through the tear as soon as the cooldown lapsed.
for (let i = 0; i < 24; i++) { context.time += 0.25; context.gehUpdateKingdom(0.25); }
check(!GEH.inPride && !GEH.kingdom.transit, 'Standing where the tear put you does not drag you back in');
console.log(JSON.stringify({ checks, maxRadius, maxY }, null, 2));
