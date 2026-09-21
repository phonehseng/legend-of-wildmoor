const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { instrument, serve, loadPlaywright, browserPath } = require("./qa-game.cjs");

(async () => {
  const html = path.resolve(process.argv[2] || "legend_of_wildmoor_v3.8.2.html"), editorPath = path.resolve("save_editor.html");
  const source = fs.readFileSync(html, "utf8"), checks = [], errors = [];
  const check = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
  const server = await serve(instrument(source.replace(/\r\n/g, "\n")));
  let browser;
  try {
    browser = await loadPlaywright().chromium.launch({ executablePath: browserPath("edge"), headless: true });
    const editor = await browser.newPage(), game = await browser.newPage();
    for (const page of [editor, game]) { page.setDefaultTimeout(90000); page.on("pageerror", e => errors.push(e.message)); }
    await game.addInitScript(() => { localStorage.clear(); });
    await editor.setContent(fs.readFileSync(editorPath, "utf8"));
    await editor.locator("#expand").click();
    const payload = () => editor.locator("#json").inputValue().then(JSON.parse);
    const key = () => editor.locator("#key").inputValue();
    const editRaw = async d => {
      await editor.locator("#rawjson").fill(JSON.stringify(d));
      await editor.locator("#rawApply").click();
      check((await editor.locator("#status").getAttribute("class")) !== "bad", "editor validates " + (d.testLabel || "imported profile"));
      return key();
    };
    const loadEditor = async k => {
      await editor.locator("#inkey").fill(k); await editor.locator("#load").click();
      check((await editor.locator("#loadStatus").getAttribute("class")) === "ok", "editor accepts game-generated key");
      return payload();
    };
    const openGame = async () => {
      await game.goto("http://127.0.0.1:" + server.address().port + "/", { waitUntil: "domcontentloaded" });
      await game.waitForFunction(() => window.__gameQa && !document.body.classList.contains("loading"));
    };
    const applyGenerated = async (k, label) => {
      await openGame();
      const result = await game.evaluate(k => {
        window.__generatorKey = k;
        return window.__gameQa.run(`(() => {
          paused = true;
          const parsed = parseSaveKey(window.__generatorKey);
          if (!parsed) return { parsed: false };
          const before = structuredClone(parsed), loaded = applySave(parsed);
          updateAfterlife(0);
          return { parsed: true, loaded, before, resaved: makeSaveKey(),
            state: { blocking: [SK.blocking.lvl, SK.blocking.xp], hp: P.hp, maxHp: P.maxHp,
              phase: AFTERLIFE.phase, afterlife: WORLDSTATE.afterlife, witnessed: WORLDSTATE.gehFinaleWitnessed,
              ws: { ...WORLDSTATE }, fairy: { found: FAIRY.found, complete: FAIRY.complete, kids: FAIRY.children.filter(c => c.found).map(c => c.id) },
              clapper: churchClapperFound(), found: FOUND.slice(),
              side: Object.fromEntries(SIDE.map(q => [q.title, [q.taken, q.done, q.rewarded, q.partyProgress || null]])) } };
        })()`);
      }, k);
      check(result.parsed && result.loaded, label + " passes actual parseSaveKey and applySave");
      console.log("PASS: " + label);
      return result;
    };
    const earnedCheckpoint = async () => {
      const fixture = path.resolve('artifacts/full-journey/04-four-relics-eight-villages.save.txt');
      if (!fs.existsSync(fixture)) throw Error('Earned full-journey checkpoint fixture is missing');
      const original = fs.readFileSync(fixture), hash = crypto.createHash('sha256').update(original).digest('hex');
      const rawImported = await loadEditor(original.toString('utf8'));
      const longLore = rawImported.found.filter(s => s.length > 200);
      check(longLore.length > 0 && longLore.every(s => s.length <= 2000), 'actual earned checkpoint exercises bounded long FOUND lore');
      const earned = await applyGenerated(await key(), 'actual earned four-relics/eight-villages checkpoint');
      const normalizedLore = longLore.map(s => s.replace(/[<>&\x22\x27\x60]/g, ''));
      check(JSON.stringify(earned.before.found) === JSON.stringify(rawImported.found.map(s => s.replace(/[<>&\x22\x27\x60]/g, ''))) && normalizedLore.every(s => earned.state.found.includes(s)), 'game retains all long earned lore after its existing character normalization');
      const imported = await loadEditor(earned.resaved);
      check(JSON.stringify(imported.found) === JSON.stringify(earned.state.found), 'editor preserves exact earned FOUND text and order');
      const restored = await applyGenerated(await key(), 'earned lore through game to editor to game');
      check(JSON.stringify(restored.state.found) === JSON.stringify(earned.state.found), 'full long lore survives actual game/editor/game roundtrip');
      const deduped = await game.evaluate(() => window.__gameQa.run(`(() => { const p = pickups.find(p => p.id === 'church:hale2'); if (!p || !p.taken || !PICKED_IDS.has(p.id)) return {same:false}; const clean = s => s.replace(/[<>&\x22\x27\x60]/g, ''), count = () => FOUND.filter(s => clean(s) === clean(p.label)).length, before = count(); P.pos.copy(p.pos);P.vel.set(0,0,0);P.interactCd=0;P.block=false;P.gehDive=null;paused=false;if(gameplayOverlayOpen()||afterlifeLocked()||ARREST.phase)return {same:false};interact();paused=true;return {same:before===1&&count()===1,taken:p.taken}; })()`));
      check(deduped.same && deduped.taken, 'stable picked church id prevents duplicate lore grant after real restored interaction');
      const oversized = structuredClone(imported); oversized.found.push('x'.repeat(2001));
      await editor.locator('#rawjson').fill(JSON.stringify(oversized));await editor.locator('#rawApply').click();
      check((await editor.locator('#status').getAttribute('class')) === 'bad', 'editor still rejects FOUND entries above the bounded 2000-character limit');
      check(crypto.createHash('sha256').update(fs.readFileSync(fixture)).digest('hex') === hash, 'actual earned checkpoint is preserved byte for byte');
    };
    if (process.argv.includes('--earned-only')) {
      await earnedCheckpoint();
      check(errors.length === 0, 'earned generator roundtrip has no uncaught browser errors');
      console.log(JSON.stringify({ok:true,html,editor:editorPath,total:checks.length,checks},null,2));return;
    }
    const presets = {};
    for (const name of ["fresh", "stats", "done", "endgame"]) {
      await editor.locator('[data-preset="' + name + '"]').click();
      check((await payload()).v === 5 && (await editor.locator("#status").getAttribute("class")) !== "bad", name + " preset generates valid v5");
      presets[name] = { data: await payload(), result: await applyGenerated(await key(), name + " preset") };
    }
    check(presets.stats.result.state.blocking[0] === 30, "Max stats includes Blocking");
    check(presets.done.result.state.fairy.found === 25 && presets.done.result.state.fairy.kids.length === 25, "completed profile restores exactly 25 personal fairy rescues");
    check(presets.endgame.result.state.ws.hermitChurchDone && presets.endgame.result.state.ws.ysoldeBuried && presets.endgame.result.state.ws.gehUnlocked, "endgame includes current church and burial prerequisites");
    const current = await loadEditor(presets.endgame.result.resaved);
    check(current.v === 5 && current.sk.blocking[0] === 30 && current.ws.hermitChurchDone, "current game export retains new fields through editor import");

    const custom = structuredClone(presets.fresh.data), titles = Object.keys(custom.side), washing = titles[2], rose = titles[13];
    custom.testLabel = "personal fairies and shared quests";
    custom.sk.blocking = [17, 9]; custom.blocks = 91; custom.story.partySlimes = 4;
    custom.side[washing] = [true, true, false, [4]];
    custom.side[titles[4]] = [true, true, true, [1]];
    custom.side[titles[11]] = [true, false, false, [2]];
    custom.side[rose] = [true, false, false, [25]];
    custom.fairy = { ...custom.fairy, found: 6, hearts: 1, accepted: true, rest: true, kids: [0, 1, 2, 3, 4, 5] };
    custom.ws.processionRear = custom.ws.processionHale = custom.ws.hermitChurchTaken = custom.ws.hermitChurchFound = true;
    custom.ws.gehAlmonerDown = true; custom.ws.gehSeed = 543210;
    custom.picked.push("church:watch-clapper");
    const customKey = await editRaw(custom), imported = await payload();
    check(imported.side[washing][2] === false && imported.side[washing][3][0] === 4 && imported.side[titles[4]][2] === true, "editor preserves paid versus unpaid shared completion and progress");
    check(imported.side[titles[11]][3] === null && imported.side[rose][3] === null && imported.fairy.found === 6, "editor drops shared fairy credit without changing personal rescues");
    const customResult = await applyGenerated(customKey, "personal fairy/shared quest profile");
    check(customResult.state.fairy.found === 6 && customResult.state.fairy.kids.length === 6 && !customResult.state.fairy.complete, "game restores six personal rescues despite shared fairy completion input");
    check(customResult.state.side[washing][2] === false && customResult.state.side[washing][3][0] === 4 && customResult.state.side[rose][3] === null, "game restores unpaid shared completion and keeps fairy quests personal");
    check(customResult.state.blocking[0] === 17 && customResult.state.ws.gehSeed === 543210 && customResult.state.ws.processionHale && customResult.before.story.partySlimes === 4, "new skill, typed seed, procession and shared story fields survive real load");
    check(customResult.state.clapper && customResult.before.picked.includes("church:watch-clapper"), "watch-clapper pickup and church progress survive game load");
    await loadEditor(customResult.resaved);
    await editor.getByLabel(washing + " paid", { exact: true }).check();
    const paid = await payload();
    check(paid.side[washing][2] === true && paid.side[washing][3][0] === 4, "Paid checkbox preserves shared progress");
    await editor.locator('[data-k="all"]').click();
    check((await payload()).fairy.complete && (await payload()).fairy.found === 25, "All 25 control synchronizes personal completion");
    await editor.locator('[data-k="none"]').click();
    check(!(await payload()).fairy.complete && (await payload()).fairy.found === 0 && !(await payload()).side[rose][1], "clearing rescues also clears personal Rose quest completion");

    for (const version of [3, 4]) {
      const legacy = structuredClone(presets.fresh.data); legacy.v = version; legacy.testLabel = "legacy v" + version;
      delete legacy.sk.blocking; legacy.blocks = 60;
      legacy.side[washing] = [true, true]; legacy.ws.luciferDefeated = true;
      delete legacy.ws.gehFinaleWitnessed; delete legacy.ws.gehAlmonerDown; delete legacy.ws.gehMatronDown; delete legacy.ws.gehHeapDown;
      const legacyKey = await editRaw(legacy), converted = await payload();
      check(converted.v === 5 && converted.side[washing][2] && converted.ws.gehFinaleWitnessed, "legacy v" + version + " preserves paid quests and solo epilogue eligibility");
      const restored = await applyGenerated(legacyKey, "upgraded legacy v" + version);
      check(restored.state.blocking[0] > 1 && restored.state.ws.gehAlmonerDown && restored.state.phase === "choice", "legacy v" + version + " restores Blocking practice, prerequisite victories and ending choice");
    }
    const bystander = structuredClone(presets.fresh.data);
    bystander.testLabel = "nonparticipant victory"; bystander.ws.luciferDefeated = true; bystander.ws.gehFinaleWitnessed = false;
    const bystanderResult = await applyGenerated(await editRaw(bystander), "explicit nonparticipant victory");
    check(!bystanderResult.state.witnessed && !bystanderResult.state.phase, "explicit nonparticipant victory does not open the player's ending");
    for (const [option, expected] of [["1", "stay"], ["2", "moveOn"]]) {
      await editor.locator('[data-preset="fresh"]').click();
      await editor.locator(".fld").filter({ hasText: "afterlife" }).locator("select").selectOption(option);
      const ending = await applyGenerated(await key(), expected + " ending control");
      check(ending.state.afterlife === expected && ending.state.witnessed && (expected === "stay" ? !ending.state.phase : ending.state.phase === "modern"), expected + " retains its personal ending behavior");
    }
    if (fs.existsSync("DEBUG_SAVE.txt")) {
      const debug = fs.readFileSync("DEBUG_SAVE.txt", "utf8"), hash = crypto.createHash("sha256").update(debug).digest("hex");
      if (debug.trim().startsWith("WM1-")) {
        await loadEditor(debug);
        await applyGenerated(await key(), "existing DEBUG_SAVE profile through editor");
      }
      check(crypto.createHash("sha256").update(fs.readFileSync("DEBUG_SAVE.txt", "utf8")).digest("hex") === hash, "existing DEBUG_SAVE.txt is preserved byte for byte");
    }
    if (fs.existsSync('artifacts/full-journey/04-four-relics-eight-villages.save.txt')) await earnedCheckpoint();
    check(errors.length === 0, "generator and game produce no uncaught browser errors");
    console.log(JSON.stringify({ ok: true, html, editor: editorPath, gameSha256: crypto.createHash("sha256").update(source).digest("hex"), total: checks.length, checks }, null, 2));
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
