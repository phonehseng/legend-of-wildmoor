# test notes — 3.4

what was run against `legend_of_peanits_v3.4.html` and `legend_of_peanits_v3.4_retro.html`, on the machine the game is built on: an RTX 5080, real WebGL2, edge. no software rasteriser was used for any of it. the retro file is regenerated from the main one (36 anchored edits), so every suite was run on both.

## automated, both builds

| suite | main 3.4 | retro 3.4 |
|---|---|---|
| `qa-game` (headless edge, real gpu) | clean, world built, game started, pause menu opens on play and switches tabs | same |
| `qa-east-church` | church in the east band; the last watch accepted from the hermit (the test now lights the beacon first, as play must) | same |
| `qa-repair-reload` | all checks | all checks |
| `qa-kingdom-geometry` | 13 checks | 13 checks |
| `qa-lucifer-ending` | both endings | both endings |
| `qa-lucifer-visuals` | 134 checks | 134 checks |
| `qa-network-live` | three clients, no errors | same |
| `qa-bystander-live` | four clients, host move-on, no errors | same |
| `qa-personal-fairies-live` | two clients, no errors | same |
| `qa-postgame-peace` | passes | passes |
| `qa-pride-river` | passes | passes |
| `qa-multiplayer-soak --minutes 2` | green: 15 / 15 combat, 0 errors, protocol 5 | green: 15 / 15 combat, 0 errors, protocol 5 |

`qa-gehenna-choice` is stale past its matron section on every build back to 3.0 and is not counted.

## measured, main 3.4

- the arrest of hale, run by script with the player watching from the square: before, the two escorts moved in 104 of 128 samples of the held phase and hale walked backwards in 105 samples across the scene; after, the escorts moved in 10 and hale walked backwards in none. the scene finishes in a minute with hale in the stocks and maren free.
- the hermit after the pool has woken, with the beacon dark: the first press gives the slimes-and-herbs errand, the second (four herbs picked, six slimes) gives the flint. the king with the murder solved and the beacon dark: no report; lit, the champion beat; then the report.
- the burial objective: "tell the king it is done" before the mourning, "rest in the nearest open bed" after it, "enter the black pool portal" once the whirlpool has woken.
- nim's mother: her errand is available at the start, the arrow is on nim, the ask names the forest; the check is nim being found.
- the herb errands: nothing counts before the errand is asked (0/1, 0/3 with five herbs in the bag), one pick after asking makes 1/1 and 1/3.
- maren's heal: four herbs owed while the hermit's errand is open, none once the beacon is lit; a picked herb regrows after four minutes when the player is more than seventy metres from it.
- the king's mark: tick at the champion beat and at the mourning, none between; the hermit's through act three.
- a hosted errand with a party count of 0 and a local count of 3 is ready, and shows 3.
- the stats panel is not an overlay; endurance gains 0.32 xp over two seconds of recovery.
- 106 pale trees on their own trunk mesh, the oak mesh's slots for them zeroed; the pale mesh carries the pale bark (retro; the main build's profile keeps textures off).
- the hall floor's texture coordinate at a fixed point on the floor is the same before and after the hall grows; four people in the four houses the grown hall hides are hidden with them; the axe hand is carried at -1.0 rad.
- the pause menu: six tabs, opens on play, the picture tab holds the retro dials; screenshots on the update page.

## multiplayer soak

two minutes, four clients, each build, run last against the released files: green on both, 15 of 15 combat checks, no runtime or shader errors.

## 3.4.1

one change: the ground lookup's padded-room fallback (the hall's floor reaching out through the doorway) no longer builds a closure and scans every interior on every miss. run against `legend_of_peanits_v3.4.1.html` and `legend_of_peanits_v3.4.1_retro.html`, same machine, real gpu.

| suite | main 3.4.1 | retro 3.4.1 |
|---|---|---|
| `qa-game` (headless edge, real gpu) | clean, world built, game started | same |
| `qa-repair-reload` | all checks | all checks |
| `qa-kingdom-geometry` | passes | passes |
| `qa-lucifer-visuals` | passes | passes |
| `qa-pride-river` | passes | passes |

measured: ten probe points around the hall — the centre; half a metre inside the pad on the south, north, east and west sides and at a corner; sixty centimetres beyond the pad on each side — return the same heights on 3.4, 3.4.1 and 3.4.1 retro: the floor at 8.06 inside the pad, the ground at 8.00 beyond it (the north side reads 8.60 on all three, a raised structure behind the hall). fifty thousand ground queries at sixty-four points no room contains: 0.694 µs each on 3.4, 0.302 on 3.4.1, 0.294 on 3.4.1 retro, with the same summed result on all three. the multiplayer suites were not rerun: the change touches no packet and no shared state.
