# old 3.0 plan: gehenna

historical and mostly superseded by releases 2.2.0–2.24.0. it is kept as a short record of the build order and rules. [the changelog](CHANGELOG.md) says what shipped.

## shape

gehenna was added under the valley instead of rebuilding it. `DIVIDE = -200` separates the realms. each realm owns its heightfield, structures, floor and safe position. gehenna builds on unlock and tears down on exit.

the valley terrain bottoms near -26 m, leaving more than 100 m above the seam. boot checks sampled the drawn terrain so that margin could not quietly disappear.

## phases

1. **seam:** route `groundAt`, `stepH`, movement, falls, safe positions, particles, structures and enemy spawns by depth. keep `terrainH` valley-only.
2. **water volumes:** make the black pool and lakes true volumes with a top, floor, rise, dive and breath.
3. **burial:** carry ysolde from the pool and bury her to open the way down.
4. **descent:** steer through a six-second drop shaft while gehenna builds. a failed build returns the player to the rim.
5. **gehenna:** one deterministic, budgeted world root; dark streets, residents, bosses, teardown, and the clerk reading back the human result of completed errands.
6. **church:** add a real enterable abandoned church outside the kingdom.
7. **horror:** drive red skies, shorter days, slower music and harsher village behavior from one dread value.
8. **save + multiplayer:** persist the unlock and seed, restore deep saves safely at the pool rim, and keep enemy/avatar traffic in the right realm.

the original multiplayer plan gave each descending player their own Gehenna. only the unlock was shared; fighting together below was explicitly left for a separate update.

## rules that still matter

- ship working builds and run the edge/webgl check.
- version and rename each release.
- changelog bugs with the cause and fix.
- add persistent state to payload, validator, load reconstruction and multiplayer sharing where needed.
- quest titles are permanent save keys.
- keep dialogue short: one thought per message.
- keep `terrainH` valley-only.
