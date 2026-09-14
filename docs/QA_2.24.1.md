# 2.24.1 test notes

checked in edge with hardware webgl2 on an rtx 5080. these are focused checks of the real game functions, not a complete playthrough.

- 29 repair checks: clues, reward receipts, saves, respawning, guest damage, bear noise, swimming, and gpu cleanup.
- 10 signaling checks with controlled failures and late replies. 4 separate real reload checks with browser storage blocked.
- 17 party quest checks: shared goals and story rewards, personal outfit rewards, item ownership, old activity, and saved progress.
- 37 co-op boss checks: host authority, shared phases and rewards, guest hits, and keeping valley players out of the ending scene.
- burial checks: one carrier, remote poses, four-second animation, save state, and carrier disconnect recovery.
- western church checks: moved items, dry entrance, real pickup and hand-in, saved quest, and black pool gate.
- 12 snapshot ordering checks: old enemy and clock updates cannot rewind the world.

local webrtc was also tested with three complete game clients. a separate load run used one complete host and 15 small webrtc clients: all 16 ids reached each client, the extra player was rejected, and reliable events survived motion backpressure. the measured local host frame sample averaged 12.23 ms, with 14.6 ms at the 95th percentile. that does not measure internet latency or 16 full game clients on different computers.

the kingdom and church screenshots come from the actual game camera and scene. shared fairy rescue is a known follow-up. signaling has no turn relay yet, so some networks may still fail to connect.

run the main checks with node and playwright:

```powershell
node tools/qa-game.cjs --state-test tools/qa-repair-batch.js
node tools/qa-game.cjs --state-test tools/qa-party-quests.js
node tools/qa-game.cjs --state-test tools/qa-coop-bosses.js
node tools/qa-network-live.cjs
node tools/qa-party-load.cjs
```
