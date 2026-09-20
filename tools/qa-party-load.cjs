// One complete game host under load from fifteen minimal WebRTC clients, plus one rejected capacity probe.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { instrument, serve, loadPlaywright, browserPath } = require('./qa-game.cjs');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const HOST_PEERS = 15;
const ATTEMPTED_PEERS = HOST_PEERS + 1;

async function main() {
  const html = process.argv[2] || 'legend_of_peanits_v3.3.html';
  const source = fs.readFileSync(html, 'utf8').replace(/\r\n/g, '\n');
  const server = await serve(instrument(source));
  const chromium = loadPlaywright().chromium;
  const browser = await chromium.launch({ executablePath: browserPath('edge'), headless: true });
  const host = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const bots = await browser.newPage();
  const errors = [];
  const checks = [];
  const check = (name, value, details = '') => {
    assert.ok(value, details ? `${name}: ${details}` : name);
    checks.push(name);
  };
  const run = sourceText => host.evaluate(code => window.__gameQa.run(code), sourceText);

  for (const [name, page] of [['host', host], ['bots', bots]]) {
    page.on('pageerror', error => errors.push(`${name} pageerror: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`${name} console: ${message.text()}`); });
  }

  try {
    await bots.setContent('<!doctype html><title>RTC load clients</title>');
    await host.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await host.waitForFunction(() => window.__gameQa && !document.body.classList.contains('loading'), null, { timeout: 90000 });
    await host.locator('#play').click();
    await host.locator('#start').click();
    await host.waitForFunction(() => window.__gameQa.snapshot().started, null, { timeout: 90000 });
    await run("NET.myId='load-host';NET.role='host';P.pos.set(0,20,0);P.vel.set(0,0,0);P.hp=P.maxHp=20;");
    console.log('full game host ready');

    await bots.evaluate(protocol => {
      window.__loadBots = [];
      window.__acceptOffers = async offers => {
        const gathered = pc => new Promise(resolve => {
          if (pc.iceGatheringState === 'complete') return resolve();
          const done = () => { if (pc.iceGatheringState === 'complete') { pc.removeEventListener('icegatheringstatechange', done); resolve(); } };
          pc.addEventListener('icegatheringstatechange', done);
          setTimeout(resolve, 4000);
        });
        return Promise.all(offers.map(async (offer, index) => {
          const id = `load-bot-${String(index).padStart(2, '0')}`;
          const bot = { id, pc: new RTCPeerConnection({ iceServers: [] }), game: null, motion: null, seq: 0, timer: null, batches: 0, maxBatch: 0, lastBatchIds: [], reliable: [], labels: [] };
          window.__loadBots.push(bot);
          bot.pc.ondatachannel = event => {
            const channel = event.channel;
            if (channel.label === 'game') bot.game = channel;
            else if (channel.label === 'motion') bot.motion = channel;
            else { channel.close(); return; }
            channel.onmessage = message => {
              let data;
              try { data = JSON.parse(message.data); } catch (_) { return; }
              bot.labels.push([channel.label, data.t]);
              if (channel.label === 'game') bot.reliable.push(data.t);
              if (data.t === 'states' && Array.isArray(data.s)) {
                bot.batches++;
                bot.maxBatch = Math.max(bot.maxBatch, data.s.length);
                bot.lastBatchIds = data.s.map(state => state.id);
              }
            };
            if (channel.label === 'game') channel.onopen = () => channel.send(JSON.stringify({
              t: 'hello', v: protocol, id,
              look: { name: `Load ${index + 1}`, skin: 0xf0cdb0, hair: 0x5a2f16, style: 'short', tunic: 0xc9ccd4, cape: 0x6d7280 },
              hp: 4, maxHp: 4, progress: {}, items: []
            }));
            if (channel.label === 'motion') channel.onopen = () => {
              if (index >= 15) return;
              const start = performance.now();
              bot.timer = setInterval(() => {
                if (channel.readyState !== 'open') return;
                const elapsed = (performance.now() - start) / 1000;
                channel.send(JSON.stringify({ t: 's', id, seq: ++bot.seq, x: index * 2 + elapsed * 2, y: 20, z: index, h: 0.4, vx: 2, vy: 0, vz: 0, f: 9, w: 'sword', a: -1, at: 0, hp: 4, mh: 4 }));
              }, 50);
            };
          };
          await bot.pc.setRemoteDescription(offer);
          await bot.pc.setLocalDescription(await bot.pc.createAnswer());
          await gathered(bot.pc);
          return bot.pc.localDescription.toJSON();
        }));
      };
    }, await run('NET_PROTOCOL'));

    const offers = await run(`(async()=>Promise.all(Array.from({length:${ATTEMPTED_PEERS}},async(_,i)=>{const p=netPeer('load-peer-'+i);p.pc.setConfiguration({iceServers:[]});netCreateChannels(p);await p.pc.setLocalDescription(await p.pc.createOffer());await netGathered(p.pc);return p.pc.localDescription.toJSON();})))()`);
    console.log(`${ATTEMPTED_PEERS} local offers gathered`);
    const answers = await bots.evaluate(async offers => window.__acceptOffers(offers), offers);
    await run(`Promise.all(${JSON.stringify(answers)}.map((answer,i)=>NET.peers.get('load-peer-'+i).pc.setRemoteDescription(answer)))`);
    await host.waitForFunction(() => window.__gameQa.run('NET.avatars.size') === 15, null, { timeout: 30000 });
    await bots.waitForFunction(() => window.__loadBots.slice(0, 15).every(bot => bot.game?.readyState === 'open' && bot.motion?.readyState === 'open'), null, { timeout: 30000 });
    console.log('fifteen clients connected; capacity probe rejected');

    await wait(3000);
    const hostState = await run(`({
      avatars:NET.avatars.size,
      peers:NET.peers.size,
      ids:[...NET.avatars.keys()],
      rendered:[...NET.avatars.values()].filter(a=>a.mesh.parent===scene&&a.mesh.visible).length,
      seqs:[...NET.peers.values()].filter(p=>p.playerId).map(p=>p.lastState&&p.lastState.seq||0),
      channels:[...NET.peers.values()].slice(0,15).map(p=>({game:p.ch&&p.ch.readyState,gameOrdered:p.ch&&p.ch.ordered,motion:p.motion&&p.motion.readyState,motionOrdered:p.motion&&p.motion.ordered,retries:p.motion&&p.motion.maxRetransmits}))
    })`);
    const botState = await bots.evaluate(() => window.__loadBots.slice(0, 15).map(bot => ({ batches: bot.batches, maxBatch: bot.maxBatch, ids: bot.lastBatchIds, reliable: bot.reliable, labels: bot.labels })));
    check('host renders fifteen remote avatars', hostState.avatars === 15 && hostState.rendered === 15, JSON.stringify(hostState));
    check('seventeenth player is rejected at the sixteen-player cap', hostState.peers === 16 && !hostState.ids.includes('load-bot-15'));
    check('all admitted motion channels deliver near 20 Hz', hostState.seqs.length === 15 && Math.min(...hostState.seqs) >= 40, JSON.stringify(hostState.seqs));
    check('reliable and disposable channels use their intended SCTP modes', hostState.channels.every(c => c.game === 'open' && c.gameOrdered === true && c.motion === 'open' && c.motionOrdered === false && c.retries === 0));
    const expectedIds = ['load-host', ...Array.from({ length: 15 }, (_, i) => `load-bot-${String(i).padStart(2, '0')}`)].sort();
    check('every client receives sixteen-state host batches', botState.every(bot => bot.maxBatch === 16 && JSON.stringify([...new Set(bot.ids)].sort()) === JSON.stringify(expectedIds)), JSON.stringify(botState.map(b => [b.batches, b.maxBatch])));
    check('host relay cadence remains near 20 Hz', Math.min(...botState.map(bot => bot.batches)) >= 40, JSON.stringify(botState.map(b => b.batches)));
    check('motion batches travel on the disposable channel', botState.every(bot => bot.labels.some(([label, type]) => label === 'motion' && type === 'states')));

    await run("netBroadcast({t:'rules',pvp:true})");
    await bots.waitForFunction(() => window.__loadBots.slice(0, 15).every(bot => bot.labels.some(([label, type]) => label === 'game' && type === 'rules')), null, { timeout: 5000 });
    check('reliable events remain on the ordered game channel', true);

    const rulesBeforeCongestion = await bots.evaluate(() => window.__loadBots.slice(0, 15).map(bot => bot.labels.filter(([label, type]) => label === 'game' && type === 'rules').length));
    const congestion = await run(`(()=>{const p=NET.peers.get('load-peer-0'),payload=JSON.stringify({t:'states',s:[],pad:'x'.repeat(60000)});let writes=0;while(p.motion.bufferedAmount<=262144&&writes<64){p.motion.send(payload);writes++;}const before=p.motion.bufferedAmount;netSend(p,{t:'states',s:[netMyState()]});const after=p.motion.bufferedAmount;netBroadcast({t:'rules',pvp:false});return{writes,before,after};})()`);
    check('congested disposable motion is skipped by backpressure', congestion.before > 262144 && congestion.after === congestion.before, JSON.stringify(congestion));
    await bots.waitForFunction(before => window.__loadBots.slice(0, 15).every((bot, i) => bot.labels.filter(([label, type]) => label === 'game' && type === 'rules').length > before[i]), rulesBeforeCongestion, { timeout: 5000 });
    check('reliable event path remains usable while motion is congested', true);

    await bots.evaluate(() => { clearInterval(window.__loadBots[0].timer); window.__loadBots[0].timer = null; });
    await wait(550);
    const stoppedA = await run("(()=>{const a=NET.avatars.get('load-bot-00');return{x:a.state.pos.x,seq:a.seq};})()");
    await wait(450);
    const stoppedB = await run("(()=>{const a=NET.avatars.get('load-bot-00');return{x:a.state.pos.x,seq:a.seq};})()");
    check('packet loss stops dead reckoning after the 100 ms cap', stoppedA.seq === stoppedB.seq && Math.abs(stoppedA.x - stoppedB.x) < 0.01, JSON.stringify({ stoppedA, stoppedB }));

    const frame = await host.evaluate(() => new Promise(resolve => {
      const samples = [], begin = performance.now(); let previous = begin;
      const tick = now => { samples.push(now - previous); previous = now; if (now - begin < 2000) requestAnimationFrame(tick); else { samples.sort((a,b)=>a-b); resolve({ frames:samples.length, mean:samples.reduce((a,b)=>a+b,0)/samples.length, p95:samples[Math.floor(samples.length*0.95)] }); } };
      requestAnimationFrame(tick);
    }));
    const render = await run("({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries})");
    check('hardware browser keeps producing frames under local party load', frame.frames >= 60, JSON.stringify(frame));
    check('no JavaScript or shader errors', errors.length === 0, errors.join('\n'));

    const result = {
      ok: true,
      checks,
      clients: HOST_PEERS,
      attemptedCapacityProbe: 1,
      motion: { intervalMs: 50, hostSequences: hostState.seqs, receivedBatches: botState.map(bot => bot.batches) },
      backpressure: congestion,
      packetLossStop: { first: stoppedA, later: stoppedB },
      performance: { frameWindowMs: 2000, ...frame, render },
      errors,
      scope: 'one full game host and fifteen lightweight clients over local hardware WebRTC; this does not measure WAN latency or loss'
    };
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await bots.evaluate(() => { for (const bot of window.__loadBots || []) { clearInterval(bot.timer); bot.pc.close(); } }).catch(() => {});
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
