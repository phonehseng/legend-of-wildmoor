# 2.24.0 test notes

these checks loaded the real one-file game in headless edge with hardware webgl2 on an nvidia rtx 5080. no swiftshader, disabled gpu, or fake clock.

## what was checked

- 37 progression checks: the grave, hale evidence, blocking, slime targets, saved procession route, gehenna boss order, portal, lucifer fight, crushing scene, credits, ghost return, and ending.
- 24 story checks: chapter goals, npcs, resident lines and positions, prompts, and lucifer speech requests. other gehenna residents stay silent.
- 14 valley/save checks: pause, carry rules, fairy healing, old-save migration, reward labels, and ghost restoration.
- 9 kingdom checks, including 170 clear road samples, portal travel, residents, and realm bounds.
- 12 simulated host/guest slime-quest checks: validation, one batch per player, ack/retry, warden suppression, and a valley guest with the host underground.
- lucifer's normal, running, and holding poses at three sizes, including geometry and palm alignment.
- the three environment screenshots use the live scene, lights, and camera, with a fixture that jumps to each story stage. the separate character preview uses the same model in the art test scene.

the browser runs reported no javascript or shader errors. these are focused state and visual checks, not a full start-to-finish playthrough. the tests checked speech requests; voice quality depends on installed browser voices. live multi-device webrtc was not tested.

## run them

the game needs nothing installed. the optional checks need node, playwright, and edge (or `--browser` plus a browser path). `qa-game.cjs` can use the bundled playwright runtime too.

```powershell
node tools/qa-game.cjs --state-test tools/qa-progression.js
node tools/qa-game.cjs --state-test tools/qa-valley.js
node tools/qa-game.cjs --state-test tools/qa-gehenna-story.js
node tools/qa-game.cjs --state-test tools/qa-quest-multiplayer.js
node tools/qa-kingdom-geometry.cjs
node tools/qa-lucifer-art.cjs
```

capture the three update screenshots in one session:

```powershell
node tools/qa-game.cjs --state-test tools/qa-gehenna-gallery.js --checkpoint docs/updates/2.24.0/kingdom.png --state-test tools/qa-gehenna-gallery.js --checkpoint docs/updates/2.24.0/lucifer-room.png --state-test tools/qa-gehenna-gallery.js --checkpoint docs/updates/2.24.0/lucifer-hand.png
```

the qa bridge only touches the test server's in-memory copy. it is not in the download.
