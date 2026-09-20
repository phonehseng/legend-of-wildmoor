# test notes — 3.3

what was run against `legend_of_peanits_v3.3.html` and `legend_of_peanits_v3.3_retro.html`, on the machine the game is built on: an RTX 5080, real WebGL2, edge. no software rasteriser was used for any of it.

from 3.3 the two builds share a version; the retro file is regenerated from the main one by `tools/make-retro.cjs` (36 anchored edits), so every suite below was run on both.

## automated, both builds

| suite | main 3.3 | retro 3.3 |
|---|---|---|
| `qa-game` (headless edge, real gpu) | clean, world built, game started | clean, world built, game started |
| `qa-east-church` (state test; was `qa-west-church`) | church at x 584, in the east band, drawn from 90 m | same |
| `qa-gehenna-choice` | passes with the matron's new rule (see below) | same |
| `qa-repair-reload` | all checks | all checks |
| `qa-lucifer-ending` | both endings | both endings |
| `qa-lucifer-visuals` | 134 checks | 134 checks |
| `qa-kingdom-geometry` | 13 checks | 13 checks |
| `qa-network-live` | three clients, no errors | same |
| `qa-bystander-live` | four clients, host move-on, no errors | same |
| `qa-personal-fairies-live` | two clients, no errors | same |
| `qa-postgame-peace` | passes | passes |
| `qa-pride-river` | passes | passes (keeps gehenna standing after an ascent, as the edition does) |
| `qa-multiplayer-soak --minutes 2` | green: 15 / 15 combat, 0 errors, protocol 5 | green: 15 / 15 combat, 0 errors, protocol 5 |

three assertions changed with the design: `qa-east-church` asserts the east band instead of the west and that the journal hint says "far east"; `qa-gehenna-choice` keeps its check that a second wake inside twelve seconds leaves the comfort cadence alone, and adds one that a blow on a grieving one after the cooldown sends her to them with her phase at two — the new rule, with the cooldown the review asked for; and `qa-multiplayer-soak` expects protocol 5. `qa-gehenna-choice` is stale past its matron section on every build: its lucifer half sets `GEH.prideRoom.visible`, a field that does not exist, and fails there on the pristine 3.0 file exactly as on 3.3, so its matron checks (which now pass with the new rule) are the part of it that counts.

## measured on 3.3 main, in one session

- the abandoned church: x 584.6, z 41.0; its room record carries drawR 4000; its group is visible from 90 m away (it was hidden past 30 m before).
- the keep's room group is visible from the south gate.
- `gehMatronProvoke` and `stayShadeFree` exist; `gehFreeStamina()` is false in the valley and true the moment `WORLDSTATE.afterlife` is "stay".
- the fairy queen: 22 meshes (was ~30 with the eight face cubes), the head's material slot 4 carries the painted face, the wings are alpha-tested cutouts, ten materials shared by the whole court, `TEX.blossom` exists and is the canopy's map.
- the elder tree's trunk, probed by pushing a body out from half a metre inside the axis at ten heights from 14 m to 135 m: the body lands at the trunk's tapered radius every time (14.2 m at the roots down to 8.8 m near the crown), with no gap — before, the probes between 55 m and 102 m and below 16 m were not pushed out at all.
- ysolde's father's door after the warden: the leaf is 0.3 wide and 2.7 deep (thin across its +x wall, wide along it) at local x 3.736, which is the wall plane (baseW 3.536 + 0.2); the villagers' waiting spot it used to stand on is at 5.336.
- the big map opens on M and the arrow is 2.5× the old size; the minimap's is scaled the same.
- text: "My father will return soon" present once; "The Fairy Queen does not hold you" gone; `NET_PROTOCOL = 5`.

## looked at

screenshots of the queen's court (painted face, cutout wings, blossom canopy), ysolde's father's closed door in its frame, the church across the water from the road, the big map with the larger arrow, and the retro edition's start at the native picture with the knights' plate shining.
