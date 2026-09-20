const fs = require("fs"), path = require("path");
const { instrument, serve, loadPlaywright, browserPath } = require("./qa-game.cjs");

(async () => {
  const html = path.resolve(process.argv[2] || "legend_of_peanits_v3.3.html");
  const server = await serve(instrument(fs.readFileSync(html, "utf8").replace(/\r\n/g, "\n")));
  const { chromium } = loadPlaywright(), errors = [];
  let browser;
  try {
    browser = await chromium.launch({ executablePath: browserPath("edge"), headless: true });
    const page = await browser.newPage(); page.setDefaultTimeout(90000);
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.addInitScript(() => {
      for (const method of ["getItem", "setItem", "removeItem"]) Storage.prototype[method] = function () { throw Error("storage denied for QA"); };
      window.__reloadQaBoot = Math.random().toString(36);
    });
    const url = "http://127.0.0.1:" + server.address().port + "/";
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__gameQa && !document.body.classList.contains("loading"));
    await page.locator("#play").click(); await page.locator("#start").click();
    await page.waitForFunction(() => window.__gameQa.snapshot().started);
    const before = await page.evaluate(() => window.__gameQa.run(`(() => {
      paused = true; const p = pickups.find(p => p.id === "clue:cloth");
      const key = makeSaveKey(), initial = { kind: MAREN.kind, hp: P.hp, maxHp: P.maxHp, boot: window.__reloadQaBoot };
      p.taken = true; p.mesh.visible = false; PICKED_IDS.add(p.id); STORY.solved = true; freeMaren(true);
      return { key, initial, mutated: p.taken && STORY.solved && WORLDSTATE.marenFreed };
    })()`));
    if (!before.mutated) throw Error("The old-world mutation precondition failed");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.evaluate(key => window.__gameQa.run("loadSaveKey(" + JSON.stringify(key) + ")"), before.key)
    ]);
    await page.waitForFunction(() => window.__gameQa && window.__gameQa.snapshot().started);
    const after = await page.evaluate(() => window.__gameQa.run(`(() => {
      paused = true; const p = pickups.find(p => p.id === "clue:cloth");
      return { boot: window.__reloadQaBoot, taken: p.taken, visible: p.mesh.visible, picked: PICKED_IDS.has(p.id), solved: STORY.solved, freed: !!WORLDSTATE.marenFreed, kind: MAREN.kind, hp: P.hp, maxHp: P.maxHp, relay: window.name, renderer: window.__gameQa.snapshot().renderer };
    })()`));
    if (after.boot === before.initial.boot) throw Error("Load did not construct a new document");
    if (after.taken || !after.visible || after.picked || after.solved || after.freed || after.kind !== before.initial.kind) throw Error("An old-world mutation leaked into the storage-denied reload: " + JSON.stringify(after));
    if (after.hp !== before.initial.hp || after.maxHp !== before.initial.maxHp || after.relay.startsWith("wildmoor.pending:")) throw Error("Reload did not restore health or consume the relay");
    if (errors.length) throw Error(errors.join("\n"));
    console.log(JSON.stringify({ ok: true, html, total: 4, checks: ["real manual load works with all localStorage access denied", "load creates a fresh document", "collected clue and solved NPC world mutations are reversed by the older save", "saved health is restored and the fallback relay is consumed"], renderer: after.renderer }, null, 2));
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
