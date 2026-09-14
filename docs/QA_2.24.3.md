# 2.24.3 test notes

tested in edge with hardware webgl2.

- the real church-page pickup passes 10 checks through saving, loading and saving again. the 201-character page keeps its complete normalized text and stable pickup id. entries above 2000 characters are still rejected.
- the save editor passes 55 checks, including the earned journey checkpoint through editor → game → editor → game. the original checkpoint stays unchanged.
- actual local webrtc combat passes 15 cases plus 7 setup/pvp checks: host and guest dodge openings, warden pierce, creature shields and directional pvp shields.
- mouse input passes 6 checks for normal sensitivity, large pointer-lock jumps, nonfinite events and high sensitivity.
- older burial saves pass 41 checks through loading, resting and opening the pool. this path was already working; no story progression change was needed.

the preceding published 2.24.2 build also ran four complete game clients for 610 seconds: 53 cycles, 641 assertions, pvp, shared errands, real motion backpressure and a disconnect/reconnect. no runtime errors. it reproduced seven combat differences covered by the fixes above. this was local webrtc, not an internet latency test or a human play session.

an assisted fresh-start journey also reached both endings with one earned character: the investigation, all village errands, church, relics, warden, burial, gehenna and lucifer. stay and move on both survived actual reloads. it began on 2.24.2 and continued with only the church-save fix after a real warden death exposed that bug. travel was teleported; several later bosses used the normal damage path with earned weapon formulas and real stamina costs. no story completion flags or invulnerability were granted. this checks progression, not manual navigation, combat balance or camera comfort.

the screenshot is the actual 2.24.3 game. the long robe, swimmable room river and new lucifer retry flow are not in this patch.

```powershell
node tools/qa-game.cjs --state-test tools/qa-full-journey-church-save.js --state-test tools/qa-camera-input.js
node tools/qa-game.cjs --state-test tools/qa-legacy-burial-guidance.js
node tools/qa-save-generator.cjs
node tools/qa-multiplayer-soak.cjs legend_of_peanits_v2.24.3.html --combat-only
```
