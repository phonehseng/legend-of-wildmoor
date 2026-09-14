# 2.24.4 test notes

quick summary: 2.24.4 adds the divine hand rebuild, river room fixups, camera comfort, and lucifer retry/spectator behavior as a single pack.

## checks run

- `node tools/qa-multiplayer-soak.cjs legend_of_peanits_v2.24.4.html --combat-only`
  - protocol 4 smoke coverage, no network regressions in solo/guest combat lanes.
- `node tools/qa-pride-river.cjs legend_of_peanits_v2.24.4.html`
  - 26 checks, 0 errors
- `node tools/qa-lucifer-fight.js`
  - 32 checks, 0 errors
- `node tools/qa-lucifer-visuals.cjs legend_of_peanits_v2.24.4.html docs/updates/2.24.4`
  - 134 checks, 0 errors
- `node tools/qa-game.cjs --state-test tools/qa-lucifer-fight.js --html legend_of_peanits_v2.24.4.html`
  - 32 checks (lucifer encounter state) + 0 errors
- `node tools/qa-game.cjs --state-test tools/qa-pride-river.js --html legend_of_peanits_v2.24.4.html`
  - river coverage and teardown checks, 0 errors

Note: the release candidate is now `legend_of_peanits_v2.24.4.html`.
