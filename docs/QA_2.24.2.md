# 2.24.2 test notes

checked in edge with hardware webgl2 on an rtx 5080. this is focused testing of the real game, not a full start-to-finish playthrough.

- lucifer: 58 encounter checks and 59 story-scope checks. three phases, time for the children's lines, surrender, continued life in the room, personal ending choices, and saved progress.
- co-op: 48 boss and ending checks, 26 guest handoff checks, and 12 checks that old snapshots cannot rewind the world.
- fairies: 21 checks for personal rescues, rewards, quest progress and saves. another 17 cover shared story errands, optional rewards and finder-only returns.
- camera: 18 checks and 480 frame samples. the controller matches 2.23.0; controls, speed zoom and both portal directions passed. only the local hero uses the see-through render layer; remote characters do not.
- save editor: 44 browser checks. all presets, v3/v4 upgrades, current v5 round trips, paid and unpaid rewards, personal fairy counts, burial/church fields and ending choices passed the game's real key parser and save loader. the existing debug save was left unchanged.

real local webrtc runs used four complete game clients for the ending handoff, three for quest items and pvp, and two for personal fairy rescues. they passed 14, 18 and 8 checks respectively. these runs do not measure internet latency or a long play session.

the published build also passed 13 capacity/load checks with one full host and 15 lightweight webrtc clients. motion stayed near 20 hz, an extra player was rejected, and reliable events survived motion backpressure. the short local frame sample averaged 11.67 ms, with 12.6 ms at the 95th percentile. that is not 16 full game clients or an internet test.

everyone in a party needs this build. older clients cannot honor the new personal progress rules, so the version handshake rejects them. portable save keys remain compatible with formats 3, 4 and 5.

screenshots use the actual game scene and restored camera. longer playthrough and multiplayer testing are still underway.

```powershell
node tools/qa-game.cjs --state-test tools/qa-gehenna-choice.js --state-test tools/qa-gehenna-world-choice.js --state-test tools/qa-coop-bosses.js
node tools/qa-game.cjs --state-test tools/qa-personal-fairies.js --state-test tools/qa-party-quests.js
node tools/qa-bystander-live.cjs
node tools/qa-network-live.cjs
node tools/qa-personal-fairies-live.cjs
node tools/qa-save-generator.cjs
node tools/qa-game.cjs --state-test tools/qa-camera-rollback.js
```
