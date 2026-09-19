# test notes — 3.1 retro

what was run against `legend_of_peanits_v3.1_retro.html`, on the machine the game is built on: an RTX 5080, real WebGL2, edge. no software rasteriser was used for any of it — under swiftshader the world build stalls part way through and reports success.

the retro build is the 3.0 build plus the renderer layer described in the [changelog](../CHANGELOG.md); gameplay code is identical, so the suites below are the same suites that passed on 3.0, rerun on the retro file to prove the drawing changes did not reach the game.

## automated

| suite | result |
|---|---|
| `qa-game` (headless edge, real gpu) | clean: no syntax, type, reference or shader errors; world built; game started; 165 npcs, 31 slimes, 75 interiors |
| `qa-repair-reload` | all reload and repair checks pass |
| `qa-postgame-peace` | unit and live browser passes |
| `qa-kingdom-geometry` | 13 checks |
| `qa-personal-fairies-live` | two local webrtc clients, all checks, no errors |
| `qa-bystander-live` | four local webrtc clients, host move-on, all checks, no errors |
| `qa-lucifer-visuals` | 134 checks, 33 meshes / 53 draw calls / 11,758 triangles (after the sandbox fallback fix) |
| `qa-network-live` | three local webrtc instances, all checks, no runtime or shader errors |
| `qa-lucifer-ending` | both endings, the finale clock and the title card, no errors |
| `qa-pride-river` | river, swimming and save round-trips, no errors |
| `qa-multiplayer-soak --minutes 2` | green: 152 checks, 15 / 15 combat, 22 pvp / 44 quest / 3 pressure / 1 reconnect events, 0 errors |
| `qa-game --browser chrome` | clean on chrome as well as edge |

## measured

- picture: 427×240 at a 1280×720 window; 853×480 when the picture dial is set to 480p; the target follows the window's aspect on resize.
- vertex snap grid: 213.5 × 120 cells (half the picture) at wobble 1.
- frame rate in headless edge at 240p: 68 fps over three seconds (the machine's own cap, not the renderer's).
- preferences: setting the picture to 480p and turning pixel textures off through the pause controls changed the render target to 480 lines and every registered texture to linear filtering, and both values came back from `wildmoor.prefs`; setting them back restored 240 lines and nearest filtering.
- the pause menu opens on escape with the six controls and the status line "427×240 picture · wobble 1 · warp 0.5 · pixel textures · 15-bit dithered colour."
- blob shadows: 167 discs in the scene at start (one per villager plus the hero's), 49 under visible villagers; the hero's disc sits at the ground height under the player and hides while swimming or more than seven metres up.

## reviewed

six independent reviews of the retro layer (shaders, class substitutions, pipeline, textures, gameplay and state, the build script), each finding then put to three refuters; 15 findings survived, 4 were refuted. they collapse to the nine defects listed under "found in review and fixed" in the changelog, every one fixed in `tools/make-retro.cjs` and the build regenerated. the sprite defect was the same one seen in play as an illegible E prompt.

after the fixes, on the regenerated file: the E and ? prompts draw whole at warp 0.5; a person group laid flat hides its disc and an upright one at half scale keeps it; the render target reports depth and stencil; 106 textures are on the retro list including both river clones of the water; the stars' points material keeps its 2.2 picture pixels while the picture-to-window ratio for attenuated points is 0.333 at 240p in a 720-line window; the interior of a house shows planks and plaster with no swim up close.

## looked at

screenshots in [the update page](updates/3.1_retro.md): the south gate, the meadow with the clouds, looking up at the sky, the square, the title flight, night on the water. tone mapping was chosen by screenshot: aces 1.22 (the main build's) left the meadow pale, linear 0.7–1.0 clipped it to neon green, reinhard washed it, cineon 1.0 kept the saturated green with the sun still rolling off.
