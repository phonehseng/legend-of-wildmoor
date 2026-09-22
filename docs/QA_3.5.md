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

## 3.5.1

one fix: the subtitle dedupe never joins a box a voice is holding, and extends the reading time of the box it joins. run against `legend_of_peanits_v3.5.1.html` and `legend_of_peanits_v3.5.1_retro.html`: `qa-game` clean on both (world built, game started), and a state test on both builds — a held line said twice makes two boxes; a plain line said twice 400 ms apart makes one box with its floor pushed out and its timer re-armed. the plaza's texture offset and repeat are unchanged by the helper rewrite: (-4.25, -11.75) and (8.5, 8.5), rotation π/2.

## 3.5.2

one fix: the town wall's merlons are solid, on the outer edge of the wall top. run against `legend_of_peanits_v3.5.2.html` and `legend_of_peanits_v3.5.2_retro.html`: `qa-game` clean on both, and a state test on the wall top of segment ten — a probe at a merlon's centre pushed 0.729 m, at its edge 0.542, between two merlons 0.336; the ground under a merlon reads the walkway's 20.0, not a step; a probe on the plank walk is not moved; eighteen merlon colliders in that grid cell. the retro edition rebuilds with the same 31 edits.

## 3.6

the rename to legend of wildmoor: `qa-game` clean on `legend_of_wildmoor_v3.6.html` (version 3.6) and `legend_of_wildmoor_v3.6_retro.html` (3.6r); the retro edition rebuilds with the same 31 edits. no game code changed beyond the name strings and the network topic.

## 3.6.1

the three missed headings renamed; `qa-game` loads `legend_of_wildmoor_v3.6.1.html` and its retro edition clean; a whole-line scan of the game finds no remaining "Legend of Peanits".

## 3.6.2

three fixes (the context-loss reload stages a save; the first slimes wait for the gate knight; the queen's cape is closed). run against `legend_of_wildmoor_v3.6.2.html` and its retro edition: a forced context loss (WEBGL_lose_context, the reload held back) stages a key at the player's position with hp 2.5 on both builds; slimes 0 at the start with the escort present, 0 after 1.5 s, 31 the frame after the knight is back at his post, on both; the queen screenshotted from above and beside with no hollow. suites, run last against these files: network-live, bystander-live, personal-fairies-live, repair-reload and lucifer-ending on main; those plus kingdom-geometry, lucifer-visuals, pride-river and postgame-peace on retro; the two-minute soak green on both (15 / 15 combat, 152 checks, 0 errors).

## 3.6.3

four changes (the hanging axe, tab without the pause, the endurance grant, the silhouette every frame). measured on the retro build at the castle gate: tab opens the stats with `paused` false; the axe's hand at 0 and the axe raised 0.55 in it, head clear of the ground (screenshot); on main, 3.91 endurance points from 1.2 s of recovery at level 1. `qa-game` clean on both; repair-reload, network-live and lucifer-ending green on main.

## 3.7

the dialogue pass, the open errands, the herb tally and the faster regrowth. measured on main: 8 of 14 errands available at the start; the healer's errand taken the plain way stamps its baseline at the picked count (5) and two picks later reads 2/3; an unstamped baseline with one herb in hand reads 1; the deeds line reads "the woman out of the stocks and the beacon lit" with those two flags set. all ten suites, both builds, below.

## 3.8

the kingdom's frame. measured on main in the harness profile: the square's main pass 5.8 ms → 4.4 ms and 916 → 840 draw calls; the moor 3.5 → 3.2 ms; 236 of 346 static groups hidden from the square, 293 from the moor (the first cut hid 413 and took the rose court's children with it — the fairy suite caught it, and every registry that owns its groups' visibility is excluded now); the town seen from the wall walkway with nothing missing inside 260 m (screenshot). the houses batched to one mesh per material each (bed and furnishings kept), the wall to three meshes. all ten suites, both builds.

## 3.8.1

the wall put back. measured on the retro build: one mesh of the wall's stone in the scene, outer reach 63.6 m, top at 20 (3.8: none); screenshot of the wall from outside the ring. the sandbox trio, repair-reload, network-live, personal-fairies-live and lucifer-ending green on both builds.

## 3.8.2

the build audit: 896 materials tracked through the architecture stages, none on nothing, both builds; `window.__lostMaterials` holds the list for a state test. the sandbox trio, repair-reload and network-live green on both builds.

## 3.8.3

the audit's whole net: 1,059 materials tracked (the streets, the plaza, the canopy and mountain huts and the church added), none lost, both builds. the sandbox trio, repair-reload, network-live and personal-fairies-live green on both.

## 3.8.4

the church's audit raise moved onto the church's own group; the audit clean on both builds; the sandbox trio and repair-reload green on both.

## 3.8.5

the silhouette masked by a stencil laid after the world is drawn. measured in the retro picture (the wash set to solid magenta and counted from the render target): open ground 6,246 → 0 pixels; a slab between the camera and the body (no collider, so the camera does not pull in) 3,664, and 0 again once it is removed; the first cut, which marked the stencil during the main pass, gave 0 behind the slab too — the marks survived the cover. eight suites green on both builds.

## 3.8.6

the carried discs held to the ground (retro): a tracked disc on a group lifted 1.5 m stays at ground + 0.08 at scale 0.86, and returns to 0.95 on landing. repair-reload, network-live, lucifer-visuals and personal-fairies-live green on retro; the main build loads clean.
