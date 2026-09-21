# test notes — 3.5

what was run against `legend_of_peanits_v3.5.html` and `legend_of_peanits_v3.5_retro.html`, on the machine the game is built on: an RTX 5080, real WebGL2, edge, headless. no software rasteriser was used for any of it. the retro file is regenerated from the main one (31 anchored edits, down from 36: gehenna-at-boot moved into the main build), so every suite was run on both.

## automated, both builds

| suite | main 3.5 | retro 3.5 |
|---|---|---|
| `qa-game` (headless edge, real gpu) | clean, world built, game started | same |
| `qa-east-church` | passes | passes |
| `qa-repair-reload` | all checks | all checks |
| `qa-kingdom-geometry` | passes | passes |
| `qa-lucifer-ending` | both endings; the blow assertions rewritten to the new rule (half, unrounded; lethal at one heart) | same |
| `qa-lucifer-visuals` | passes | passes |
| `qa-network-live` | three clients, no errors | same |
| `qa-bystander-live` | four clients, host move-on, no errors | same |
| `qa-personal-fairies-live` | two clients, no errors | same |
| `qa-postgame-peace` | passes | passes |
| `qa-pride-river` | passes (it expects gehenna to stay standing between visits on both builds now) | passes |
| `qa-multiplayer-soak --minutes 2` | green: 15 / 15 combat, 152 checks, 0 errors | green: 15 / 15 combat, 152 checks, 0 errors |

`qa-gehenna-choice` is stale past its matron section on every build back to 3.0 and is not counted.

## measured

- trees: six trees spread over the map, base points at the trunk (not at the origin), a probe twenty centimetres from the axis pushed out to the trunk's radius on every one. before: every tree's base and mid points read (0, 0).
- a berry bush of size 0.833: solid radius 1.041 (1.25 s0), top 1.083 (1.3 s0); the gatherer's spot at 1.3 s0 + 0.7.
- the elder tree's bark: a lathe of 25 profile points on the stair's own radius, 28 sides (14 retro).
- the struct grid registers with a metre of margin in the valley and in gehenna.
- the streets: thirteen slab tops from 8.025 to 8.037, the plaza's at 8.045 (before: 8.080 to 8.116 and 8.130); villagers' feet at 8.000; retro discs at 8.080 over the feet, above every slab. the cross streets' north edge at z = -1.5, under the wall whose face is at -1.3.
- the throne hall from the square: the doorway curtain at 0.96, the four torches and the lamp at 0; inside at full growth: the curtain at 0.01, torches 1.6 at y = 20.18 (riding the walls), lamp 0.8, the south wall's collider 1.12 thick (was 1.4 at any size) with its top at 39.66, the six pushed props 16 m out with their colliders switched off; back on the square: growth 1, props at 0.000 from their places, colliders on.
- pale trees: 106 trees, 530 branch slots on the pale mesh, none of the oak's on it.
- the rose queen's cape: 16 sides (8 retro).
- lucifer's resting scale 0.88 from one constant; the ending suite's halving sequence 20-10, 10-5, 5-2.5, 2.5-1.25, 1.25-0.625, 0.625-0.625.
- gehenna at boot in the main build: built, on a provisional seed, hidden while nobody is under the seam.
- the pause menu opens on Controls; pressing Play hides it.
- "the wraith comes apart like breath." said twice within a second: one box.
- the harness: pointer lock stubbed, `document.pointerLockElement` null after start.
- retro: wolves and wraiths carry a disc each (6 of 6 alive at boot); the disc is a painted quad, not a circle geometry.

## multiplayer soak

two minutes, four clients, each build, run last against the released files: green on both, 15 of 15 combat checks, 152 checks, 22 pvp, 44 quest and 3 pressure events with a reconnect, no runtime or shader errors.
