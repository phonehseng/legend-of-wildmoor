const fs = require("fs");
const http = require("http");
const path = require("path");

const RUNTIME_MODULES = path.join(require("os").homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function parseArgs(argv) {
  const options = {
    html: "legend_of_peanits_v2.24.2.html",
    browser: "edge",
    timeout: 90000,
    headed: false,
    start: true,
    screenshot: null,
    stateTests: [],
    steps: []
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--html") options.html = argv[++i];
    else if (arg === "--browser") options.browser = argv[++i];
    else if (arg === "--timeout") options.timeout = Number(argv[++i]);
    else if (arg === "--headed") options.headed = true;
    else if (arg === "--no-start") options.start = false;
    else if (arg === "--screenshot") options.screenshot = argv[++i];
    else if (arg === "--state-test") { const file = argv[++i]; options.stateTests.push(file); options.steps.push({ test: file }); }
    else if (arg === "--checkpoint") options.steps.push({ screenshot: argv[++i] });
    else if (arg === "--help") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isFinite(options.timeout) || options.timeout < 1000) throw new Error("--timeout must be at least 1000 ms");
  return options;
}

function usage() {
  return [
    "Usage: node tools/qa-game.cjs [options]",
    "  --html FILE          game HTML (default: legend_of_peanits_v2.24.2.html)",
    "  --browser edge|chrome|PATH",
    "  --timeout MS         real wall-clock timeout (default: 90000)",
    "  --headed             show the browser window",
    "  --no-start            stop after title-screen world initialization",
    "  --screenshot FILE     capture the final browser frame",
    "  --state-test FILE    evaluate a JS expression inside the game closure; repeatable",
    "  --checkpoint FILE    capture a frame at this point in the state-test sequence",
    "",
    "A state test should evaluate to a JSON-serializable value or throw. It can read",
    "closure variables such as P, WORLDSTATE, STORY, renderer, slimes and interiors."
  ].join("\n");
}

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (_) {
    return require(path.join(RUNTIME_MODULES, "playwright"));
  }
}

function browserPath(selection) {
  if (selection === "edge") return EDGE;
  if (selection === "chrome") return CHROME;
  return path.resolve(selection);
}

function instrument(html) {
  const marker = "})();\nwindow.__boot = __boot;";
  const close = html.lastIndexOf(marker);
  if (close < 0) throw new Error("Game boot closure anchor was not found");
  const bridge = String.raw`
  ;(() => {
    const qaSnapshot = () => {
      const gl = renderer.getContext();
      const debug = gl.getExtension("WEBGL_debug_renderer_info");
      const gpu = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      return {
        started,
        titleMode,
        player: { x: P.pos.x, y: P.pos.y, z: P.pos.z, hp: P.hp, maxHp: P.maxHp },
        counts: { npcs: npcs.length, slimes: slimes.length, interiors: interiors.length },
        renderer: { gpu: String(gpu || "unknown"), webgl2: gl instanceof WebGL2RenderingContext },
        version: document.querySelector(".quest-version")?.textContent || ""
      };
    };
    const qaRun = source => eval(source);
    Object.defineProperty(window, "__gameQa", {
      configurable: true,
      value: Object.freeze({ snapshot: qaSnapshot, run: qaRun })
    });
  })();
`;
  return html.slice(0, close) + bridge + html.slice(close);
}

function serve(html) {
  const server = http.createServer((request, response) => {
    if (request.url === "/favicon.ico") {
      response.writeHead(204);
      response.end();
      return;
    }
    if (request.url !== "/" && request.url !== "/index.html") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end(html);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const htmlPath = path.resolve(options.html);
  const executablePath = browserPath(options.browser);
  if (!fs.existsSync(htmlPath)) throw new Error(`HTML not found: ${htmlPath}`);
  if (!fs.existsSync(executablePath)) throw new Error(`Browser not found: ${executablePath}`);
  for (const test of options.stateTests) if (!fs.existsSync(path.resolve(test))) throw new Error(`State test not found: ${test}`);

  const html = instrument(fs.readFileSync(htmlPath, "utf8").replace(/\r\n/g, "\n"));
  const server = await serve(html);
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}/`;
  const { chromium } = loadPlaywright();
  let browser;
  const failures = [];
  const consoleErrors = new Map();
  try {
    browser = await chromium.launch({ executablePath, headless: !options.headed, timeout: options.timeout });
    const page = await browser.newPage();
    page.setDefaultTimeout(options.timeout);
    page.on("pageerror", error => failures.push(`pageerror: ${error.stack || error.message}`));
    page.on("console", message => {
      if (message.type() !== "error") return;
      const normalized = message.text().replace(/^frame(?: \d+)? /, "frame # ");
      consoleErrors.set(normalized, (consoleErrors.get(normalized) || 0) + 1);
    });
    page.on("requestfailed", request => failures.push(`requestfailed: ${request.url()} (${request.failure()?.errorText || "unknown"})`));

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: options.timeout });
    await page.waitForFunction(() => !document.body.classList.contains("loading") && window.__gameQa, null, { timeout: options.timeout });
    let snapshot = await page.evaluate(() => window.__gameQa.snapshot());
    const softwareGpu = /swiftshader|llvmpipe|software rasterizer|microsoft basic render/i.test(snapshot.renderer.gpu);
    if (softwareGpu) failures.push(`software WebGL renderer detected: ${snapshot.renderer.gpu}`);

    if (options.start) {
      await page.locator("#play").click();
      await page.locator("#start").click();
      await page.waitForFunction(() => window.__gameQa.snapshot().started, null, { timeout: options.timeout });
      await page.waitForTimeout(2000);
      snapshot = await page.evaluate(() => window.__gameQa.snapshot());
    }

    const stateTests = [];
    for (const step of options.steps) {
      if (step.screenshot) {
        const target = path.resolve(step.screenshot);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        await page.screenshot({ path: target, fullPage: true });
        continue;
      }
      const fullPath = path.resolve(step.test);
      const source = fs.readFileSync(fullPath, "utf8");
      const value = await page.evaluate(async sourceText => await window.__gameQa.run(sourceText), source);
      stateTests.push({ file: fullPath, value });
    }

    if (options.screenshot) {
      const screenshotPath = path.resolve(options.screenshot);
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    for (const [message, count] of consoleErrors) failures.push(`console.error (${count} occurrence${count === 1 ? "" : "s"}): ${message}`);
    if (failures.length) {
      throw new Error(`QA snapshot before failure:\n${JSON.stringify(snapshot, null, 2)}\n\n${failures.join("\n\n")}`);
    }
    console.log(JSON.stringify({ ok: true, browser: executablePath, url, snapshot, screenshot: options.screenshot ? path.resolve(options.screenshot) : null, stateTests }, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

module.exports = { instrument, serve, loadPlaywright, browserPath };

if (require.main === module) main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
