# Verification — 2.24.0

The game was loaded in headless Microsoft Edge using hardware WebGL2 on an NVIDIA RTX 5080. The checks started the actual single-file game and exercised its running state. No SwiftShader, disabled GPU, or virtual time was used.

## Checked behavior

- Progression: 37 assertions cover the grave, Hale evidence, Blocking, slime quest targets, saved procession route, Gehenna boss order, the portal, Lucifer's growth/shrink sequence, both characters being crushed, credits, ghost return, and the modern ending.
- Story: 24 assertions cover chapter objectives, important NPCs, resident dialogue and pushable positions, prompt visibility, and Lucifer's text-to-speech requests. Other Gehenna residents remain silent.
- Valley and saves: 14 assertions cover menu pausing, carry restrictions, fairy healing, older-save migration, canonical reward labels, and playable ghost restoration.
- Kingdom geometry: nine checks include 170 unobstructed road samples, portal entry/return, resident behavior, and realm bounds.
- Multiplayer quest messages: 12 simulated host/guest assertions cover summon validation, a single batch per requester, acknowledgement, retry behavior, and suppression during the Warden fight. The host can be underground while a guest accepts the valley quest.
- Lucifer art: normal, running, and holding poses are checked at three sizes, including finite geometry and palm alignment.
- The three environment screenshots use the live game scene, lighting, and camera. The gallery fixture advances directly to the relevant story stages. The separate character preview renders the same model in the art test scene.

No JavaScript runtime or shader errors were reported by these browser runs. These are focused state-transition and visual checks, rather than an uninterrupted beginning-to-end playthrough. Speech requests were verified programmatically; voice quality depends on the browser's installed voices. Live multi-device WebRTC play was not tested.

## Run locally

The game itself needs no Node installation or dependencies. The optional checks require Node, Playwright, and Microsoft Edge (or `--browser` with a browser path). `qa-game.cjs` can also use the bundled Codex Playwright runtime when available.

```powershell
node tools/qa-game.cjs --state-test tools/qa-progression.js
node tools/qa-game.cjs --state-test tools/qa-valley.js
node tools/qa-game.cjs --state-test tools/qa-gehenna-story.js
node tools/qa-game.cjs --state-test tools/qa-quest-multiplayer.js
node tools/qa-kingdom-geometry.cjs
node tools/qa-lucifer-art.cjs
```

To capture the three update screenshots in one browser session:

```powershell
node tools/qa-game.cjs --state-test tools/qa-gehenna-gallery.js --checkpoint docs/updates/2.24.0/kingdom.png --state-test tools/qa-gehenna-gallery.js --checkpoint docs/updates/2.24.0/lucifer-room.png --state-test tools/qa-gehenna-gallery.js --checkpoint docs/updates/2.24.0/lucifer-hand.png
```

The QA bridge is injected only into the test server's in-memory copy. It is not included in the downloadable game.
