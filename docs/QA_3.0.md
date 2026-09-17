# test notes — 3.0

what was run against `legend_of_peanits_v3.0.html`, on the machine the game is built on: an RTX 5080, real WebGL2, edge and chrome. no software rasteriser was used for any of it — under swiftshader the world build stalls part way through and reports success, so every number here would have been a lie.

## automated

| suite | result |
|---|---|
| headless load (edge, real gpu) | clean: no syntax, type, reference or shader errors, world built to completion |
| `qa-kingdom-geometry` | 13 checks, including two new ones written for this release |
| `qa-lucifer-ending` | both endings, the finale clock and the title card |
| `qa-pride-river` | 26 + 9 checks over the river, swimming and save round-trips |
| `qa-postgame-peace` | unit and live browser passes |
| `qa-lucifer-visuals` | 134 checks, 33 meshes / 53 draw calls / 11,758 triangles |
| `qa-party-load` | one host and fifteen clients over local webrtc |
| `qa-network-live` | 18 / 18 |
| `qa-multiplayer-soak --minutes 2` | 15 / 15 combat checks; see below |

two checks added to the kingdom suite this release, both of which fail on 2.24.6 and pass on 3.0:

- **standing where the tear puts you does not drag you back in.** the exit used to land inside the entry trigger.
- **the tear waits for the host as well as the guests.** one guest at the tear used to pull the host through from anywhere in gehenna.

## known open

`qa-multiplayer-soak` fails its `PvP still damages a rear-facing shield` check, and reports zero events for every activity counter in the same run. it fails identically on a build taken from before any of this release's changes, so it is not a regression from them; whether the fault is in the game's pvp facing test or in the harness's own setup is still open.

## performance

measured with the game's own state-test harness inside the running closure, at the south gate where the player starts.

| | 2.24.6 | 3.0 |
|---|---|---|
| rooms drawn | 75 | 2 |
| meshes in drawn rooms | 1,687 | 80 |
| median frame at the spawn | 19.1 ms | 14.6 ms |

the same A/B on a colder run measured 21.6 ms against 13.1 ms. the win is the same either way: the inside of every house in the valley was being drawn through the back of its own walls, from anywhere on the map.

## not covered

no start-to-finish playthrough. no wan latency or packet loss — every multiplayer test is local webrtc on one machine. voice quality depends on installed browser voices. the performance numbers are one gpu at one canvas size.
