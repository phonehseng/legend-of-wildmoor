const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const htmlPath = path.resolve(process.argv[2] || path.join(__dirname, '..', 'legend_of_peanits_v3.3.2.html'));
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('Testing ' + path.basename(htmlPath) + ' post-game peaceful state...');

// 1. Check settleWorldAfterGame body
const start = html.indexOf('function settleWorldAfterGame() {');
const end = html.indexOf('  // a decision put to the player', start);
assert(start !== -1 && end !== -1, 'settleWorldAfterGame must exist');
const settleBody = html.slice(start, end);

assert(settleBody.includes('_dreadV = 0'), 'settleWorldAfterGame must reset _dreadV = 0');
assert(settleBody.includes('clearSiege()'), 'settleWorldAfterGame must call clearSiege()');
assert(settleBody.includes('withdrawSiege'), 'settleWorldAfterGame must withdraw active wraiths');
assert(settleBody.includes('POOL_DARK.visible = false'), 'settleWorldAfterGame must hide POOL_DARK');
assert(settleBody.includes('POOL_WHIRL.visible = false'), 'settleWorldAfterGame must hide POOL_WHIRL');
assert(settleBody.includes('updateHanged()'), 'settleWorldAfterGame must call updateHanged()');
assert(settleBody.includes('POOL_STONE.prompt.visible = false'), 'settleWorldAfterGame must hide POOL_STONE prompt');
assert(settleBody.includes('POOL_WATER_MESH.material.color.set(0xc8d8e8)'), 'settleWorldAfterGame must restore clear water');

// 2. Functional testing of logic in VM
const ctx = vm.createContext({
  console,
  WORLDSTATE: {
    blackPoolAwake: false,
    ysoldeBuried: false,
    gehDone: false,
    ending: null,
    luciferDefeated: false,
    afterlife: null,
    relics: { seal: true, root: true, warden: true, tear: true }
  },
  SIDE: [],
  FAIRY: { found: 0 },
  STORY: { evidence: [] },
  talkedKing: false,
  Math,
  clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
  time: 100
});

// Extract isGameBeaten, dread, updateDread, siegeOn, awakenPool
function extractFn(fnName, endMarker) {
  const s = html.indexOf(fnName);
  const e = html.indexOf(endMarker, s);
  return html.slice(s, e);
}

vm.runInContext(`
let _dreadV = 0.85, _dreadT = 0;
const relicCount = () => 4;
const villagesDone = () => 8;
const STORY_ACT = { ARRIVAL: 0, CHAMPION: 1, BLACK_POOL: 2, AWAKENING: 3, VALLEY: 4, FINALE: 5, COMPLETE: 6 };
let talkedKing = true, metKing = true;
` + extractFn('const isGameBeaten = () =>', 'const rootReadable')
  + extractFn('const siegeOn = () =>', 'const THORN_LABEL')
  + extractFn('const dread = () =>', 'function storyAct()')
  + extractFn('function storyAct()', 'const repTags =')
  + `
let darkVisible = false, runeIntensity = 0, pyreDismantled = false, dreadPlayed = false;
const POOL_DARK = { visible: false };
const POOL_RUNE = { material: { emissiveIntensity: 0 } };
const SFX = { dread: () => { dreadPlayed = true; } };
const say = () => {};
const dismantlePyre = () => { pyreDismantled = true; };
` + extractFn('function awakenPool() {', 'let HOME_SHELF = null;')
  + `
globalThis.isGameBeaten = isGameBeaten;
globalThis.dread = dread;
globalThis.updateDread = updateDread;
globalThis.siegeOn = siegeOn;
globalThis.storyAct = storyAct;
globalThis.STORY_ACT = STORY_ACT;
globalThis.awakenPool = awakenPool;
`, ctx);

// Test 1: Active horror state before game beaten
console.log('Testing Act III horror state...');
assert.strictEqual(ctx.isGameBeaten(), false, 'isGameBeaten should be false initially');
assert.strictEqual(ctx.dread(), 0.85, 'dread should return current _dreadV when game not beaten');

ctx.WORLDSTATE.ysoldeBuried = true;
assert.strictEqual(ctx.siegeOn(), true, 'siegeOn should be true when ysoldeBuried and not beaten');

// Test 2: Game beaten via luciferDefeated
console.log('Testing game beaten via luciferDefeated...');
ctx.WORLDSTATE.luciferDefeated = true;
assert.strictEqual(ctx.isGameBeaten(), true, 'isGameBeaten should be true when luciferDefeated');
assert.strictEqual(ctx.dread(), 0, 'dread() must be 0 when game is beaten');
assert.strictEqual(ctx.siegeOn(), false, 'siegeOn() must be false when game is beaten');
assert.strictEqual(ctx.storyAct(), ctx.STORY_ACT.COMPLETE, 'storyAct must be COMPLETE when game is beaten');

// Test 3: Game beaten via afterlife = 'stay'
console.log('Testing game beaten via afterlife === "stay"...');
ctx.WORLDSTATE.luciferDefeated = false;
ctx.WORLDSTATE.afterlife = 'stay';
assert.strictEqual(ctx.isGameBeaten(), true, 'isGameBeaten should be true when afterlife is stay');
assert.strictEqual(ctx.dread(), 0, 'dread() must be 0 when afterlife is stay');
assert.strictEqual(ctx.siegeOn(), false, 'siegeOn() must be false when afterlife is stay');

// Test 4: updateDread() resets _dreadV to 0
ctx.updateDread(0.1);
assert.strictEqual(vm.runInContext('_dreadV', ctx), 0, '_dreadV must be reset to 0 by updateDread() when game is beaten');

// Test 5: awakenPool() is blocked
ctx.WORLDSTATE.blackPoolAwake = false;
ctx.awakenPool();
assert.strictEqual(ctx.WORLDSTATE.blackPoolAwake, false, 'awakenPool must NOT set blackPoolAwake when game is beaten');
assert.strictEqual(vm.runInContext('dreadPlayed', ctx), false, 'awakenPool must NOT play dread SFX when game is beaten');

// Test 6: Audio scheduler tempo slow factor
const audioCheck = vm.runInContext(`
const isBeaten = isGameBeaten();
const dr = dread();
const slowBeaten = (typeof isGameBeaten === "function" && isGameBeaten()) ? 1 : (1 + 0.55 * Math.max(dr, 0.7));
slowBeaten;
`, ctx);
assert.strictEqual(audioCheck, 1, 'Audio slow factor must be exactly 1 in post-game');

console.log('ALL FUNCTIONAL UNIT TESTS PASSED SUCCESSFULLY!');

(async () => {
  const { instrument, serve, loadPlaywright, browserPath } = require(path.join(__dirname, 'qa-game.cjs'));
  console.log('Launching browser to test live post-game peaceful state...');
  const server = await serve(instrument(fs.readFileSync(htmlPath, 'utf8').replace(/\r\n/g, '\n')));
  const browser = await loadPlaywright().chromium.launch({ executablePath: browserPath('edge'), headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 550 } });

  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('http://127.0.0.1:' + server.address().port);
  await page.waitForFunction(() => window.__gameQa, null, { timeout: 30000 });

  const run = code => page.evaluate(text => window.__gameQa.run(text), code);

  console.log('Game loaded in browser.');

  // Test 1: Normal beaten state (not ghost)
  const normalBeatenResult = await run(`(() => {
    started = true;
    WORLDSTATE.blackPoolAwake = true;
    WORLDSTATE.ysoldeBuried = true;
    WORLDSTATE.luciferDefeated = true;
    WORLDSTATE.gehFinaleWitnessed = true;
    WORLDSTATE.afterlife = null;
    settleWorldAfterGame();

    let kingText = '';
    const origSpeak = speak;
    speak = (actor, t) => { kingText = t; };
    kingTalk();

    let hermitText = '';
    speak = (actor, t) => { hermitText = t; };
    P.pos.copy(hermitPos);
    interact();

    speak = origSpeak;

    return {
      isBeaten: isGameBeaten(),
      dr: dread(),
      siege: siegeOn(),
      poolDarkVis: POOL_DARK ? POOL_DARK.visible : false,
      poolWhirlVis: POOL_WHIRL ? POOL_WHIRL.visible : false,
      poolStonePromptVis: (POOL_STONE && POOL_STONE.prompt) ? POOL_STONE.prompt.visible : false,
      hangedInScene: hangedGroup ? !!hangedGroup.parent : false,
      kingText,
      hermitText
    };
  })()`);

  console.log('Live browser normal beaten results:', normalBeatenResult);
  assert.strictEqual(normalBeatenResult.isBeaten, true, 'isGameBeaten should be true in browser');
  assert.strictEqual(normalBeatenResult.dr, 0, 'dread should be 0 in browser');
  assert.strictEqual(normalBeatenResult.siege, false, 'siege should be off in browser');
  assert.strictEqual(normalBeatenResult.poolDarkVis, false, 'POOL_DARK should be hidden');
  assert.strictEqual(normalBeatenResult.poolWhirlVis, false, 'POOL_WHIRL should be hidden');
  assert.strictEqual(normalBeatenResult.hangedInScene, false, 'hanged group should not be in scene');
  assert.ok(normalBeatenResult.kingText.includes('The dark beneath has been laid to rest'), 'King should speak peace line');
  assert.ok(normalBeatenResult.hermitText.includes('You put the dark back in the ground') || normalBeatenResult.hermitText.includes('sleep tonight'), 'Hermit should speak peace line');

  // Test 2: Ghost / Stay mode
  const stayResult = await run(`(() => {
    WORLDSTATE.afterlife = 'stay';
    settleWorldAfterGame();
    let kingText = '';
    let kingLines = null;
    const origSpeak = speak;
    const origSpeakLines = speakLines;
    speak = (actor, t) => { kingText = t; };
    speakLines = (actor, who, lines) => { kingLines = lines; };
    kingTalk();

    let hermitText = '';
    speak = (actor, t) => { hermitText = t; };
    P.interactCd = 0;
    P.pos.copy(hermitPos);

    const diag = {
      paused,
      overlay: gameplayOverlayOpen(),
      locked: afterlifeLocked(),
      arrest: ARREST.phase,
      cd: P.interactCd,
      divide: P.pos.y < DIVIDE,
      atGrave: atTheGrave(),
      carry: P.carry,
      nearHermit: near(hermitPos),
      invis: isInvisMode(),
      hermitPos: { x: hermitPos.x, y: hermitPos.y, z: hermitPos.z },
      P_pos: { x: P.pos.x, y: P.pos.y, z: P.pos.z }
    };

    interact();

    speak = origSpeak;
    speakLines = origSpeakLines;

    return {
      kingLines: kingLines ? kingLines.join(' ') : kingText,
      hermitText,
      diag
    };
  })()`);

  console.log('Live browser stay results:', stayResult);
  assert.ok(stayResult.kingLines.includes('enough left of you to catch the light') || stayResult.kingLines.includes('crown'), 'King should recognize shadow king in stay mode');
  assert.ok(stayResult.hermitText.includes('chose to be a shadow'), 'Hermit should react to ghost in stay mode');

  console.log('Page errors:', errors);
  assert.strictEqual(errors.length, 0, 'There should be no page errors');

  await browser.close();
  server.close();
  console.log('ALL LIVE BROWSER POST-GAME PEACE TESTS PASSED!');
  process.exit(0);
})();
