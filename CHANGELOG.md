# Changelog

Every change, with the bug it fixes and how. Newest first.

---

## Unreleased — NPC behaviour and ground cover

### Ground cover removed

All scattered ground cover is switched off by request: tall grass, flowers,
ferns, reeds and mushrooms. Bushes and trees stay.

Everything is **commented out, not deleted**, so any one layer comes back by
uncommenting its block. `grassOn` is now a `const false`; `grassMesh` and
`flowerMesh` became inert stand-in objects so the scattered
`mesh.visible = …` lines stay harmless instead of throwing on `null`;
`placeGround` returns immediately. The settings checkbox and its handler are
gone, and `initGraphics` no longer restores a stored grass preference (which
would have thrown, since `grassOn` is now a constant).

---

### Bug 1 — A cross floated above the tall grass · FIXED

**Reported:** "there's a little bit of a cross above the tall grass textures."

**Cause.** Two independent faults, each sufficient on its own.

*Texture wrap bleed.* `makeTex` set `wrapS = wrapT = RepeatWrapping` on **every**
texture, including the five alpha cutouts. `TEX.blade` draws blades whose opaque
bases fill 56% of the bottom row and whose tips taper to nothing at the top row.
`crossGeo` gives both quads identical 0..1 UVs, and with r128's default `flipY`
the canvas bottom row lands at `v = 0`, the quad base. Sampling at `v → 1.0`
wrapped back to texel row 0 — the opaque bases — at 50/50 weight, giving
alpha ≈ 0.5, over the 0.4 `alphaTest`. The fragments passed and drew a solid bar
across the top of each quad. Two perpendicular quads made an X, sitting above
where the real blades had thinned to points, so it read as detached and floating.

*Reeds.* `reedMesh` uses the same `TEX.blade`, stands 2.8–4.8 m tall against
grass at ~1.5 m, and spawns in the terrain band immediately adjacent to grass —
so its crosses hovered highest of all.

**Fix.** `makeTex` now clamps wrap mode for `alpha` cutouts and keeps
`RepeatWrapping` only for tiling surfaces. Verified safe: `cloneTex` inherits
wrap mode via `t.clone()` but is only ever called on `cobble`, `bark` and `rock`,
and no cutout texture has a `repeat.set` anywhere. The foliage is also now
commented out, so the artifact cannot reappear either way.

**Ruled out:** wind shear (both quads are displaced by the identical vector, so
the cross can shear but never split), shadow acne, floating placement.

---

### Bug 2 — Decorative plants all popped in and out together · FIXED

r128's `InstancedMesh` never recomputes its bounding sphere, so frustum culling
tested a ~1–2 unit sphere at the **world origin**. Every decorative mesh
appeared and disappeared together depending on whether the camera happened to
contain the origin. Latent for a long time; newly visible once the plants
defaulted to on. `bush.frustumCulled = false`.

---

### Bug 3 — One hunter froze the entire town · FIXED *(critical)*

**Reported:** "a lot of NPCs getting stuck", "NPCs getting stuck in limbo."

**Cause.** In the hunter's shoot-at-goblin branch, the tick ended in `break`.
There is no enclosing `switch` or inner loop — the nearest breakable construct
is `for (const n of npcs)` itself. So **any hunter with a live goblin within
34 m aborted the whole villager update for that tick**: every NPC later in the
array got no movement, no timers, no animation, no mesh write, no separation.
Goblins spawn nightly and the hunters sit early in the array, so most of the
town locked up after dark.

**Fix.** `break` → `continue`, plus a `groundAt` snap before the mesh write so
the hunter does not also skip its own ground placement.

---

### Bug 4 — Villagers stood rooted all day · FIXED

The wander was the `else` of "is it daytime", so it could only ever run at
night. Any villager whose `pickWork` returned null in daylight — a woodcutter
with no tree within 140 m, a washer with no reachable shore, or any job with no
`pickWork` case at all — stood still for 8 s, retried, stood still again, all
day. They now wander while they wait.

---

### Bug 5 — NPCs froze at the water's edge · FIXED

**Reported:** "a lot of NPCs getting stuck especially near water."

**Cause.** The shoreline clause in `step()` was
`gh < 0.8 && nearWater(nx, nz, 1.6)`, where `nx,nz` is the candidate step —
only 0.04–0.22 m from where the NPC already stood, and `nearWater` samples four
cardinal points without using the heading at all. The predicate therefore
returned **the same answer for all nine candidate directions**. An NPC that
ended up on low ground near water was frozen in *every* direction, including
straight inland. `n.wetOK`, the intended escape hatch, is read but never
assigned anywhere — dead code.

**Fix.** The clause is evaluated at the look-ahead point `lx,lz` so it actually
depends on heading, and an `escaping` hatch always permits a step onto drier,
non-water ground when the NPC is already standing somewhere wet. No position is
a dead end now.

---

### Bug 6 — Stuck NPCs adopted the trap as their home · FIXED *(the ratchet)*

**Cause.** The stuck handler's `back → home` transition did
`n.home.set(n.pos.x, n.pos.y, n.pos.z)` — adopting wherever the NPC was standing
as its new permanent home. That is the single worst moment to make that
decision, because they are standing there *precisely because they got stuck*.

A villager blocked at the water's edge became a villager whose **home** was the
water's edge, so every errand afterwards began and ended in the same trap. The
shoreline population only ever grew over a session. The same ratchet turned a
villager caught inside the keep into a permanent resident of the throne room —
which is why blocking entry alone never fixed it.

**Fix.** Recovery now refuses a spot that is in water or inside a building the
NPC is not entitled to, and falls back to their hut.

---

### Bug 7 — The keep had no door recorded · FIXED

**Reported:** "NPCs are still sneaking into the castle."

**Cause.** `KEEP_ROOM` was the only interior built without a `door` property —
permanently `undefined`. Every routine that puts a stray villager back outside
is written as "walk them to the door", so for the throne room **it never ran at
all**. Compounding it, the eviction guard stood down whenever `it.grow > 1.05`,
which is exactly when the player is stood inside looking at the hall.

**Fix.** `KEEP_ROOM` now has a `door` at the gap in the south wall. Eviction
runs while the room is grown; the teleport half is still held back until the
player is more than 60 m away, so nobody sees anyone pop.

---

### Bug 8 — The keep was a roach motel · FIXED

Once inside a building they did not belong to, an NPC was trapped: every
candidate step landed inside it too, so every direction was refused — including
straight out of the door. This matters because the keep physically **grows
around** whoever is standing on the plateau when the player walks in, so NPCs
got in without ever walking in.

**Fix.** The entry guard now allows movement when the destination interior is
the one the NPC is already inside. Wall collision still holds them in.

---

### Bug 9 — `allowInside` was a skeleton key · FIXED

`addNPC` set `allowInside: !!insideInterior(pos.x, pos.z)` — a plain boolean. So
"spawned inside *a* building" was read as "may enter *every* building", the
throne room included.

**Fix.** It holds the specific interior now. The handful of characters genuinely
allowed anywhere still set literal `true`, and both guards test
`!(n.allowInside === true || n.allowInside === it)`.

---

### Bug 10 — Keep exclusion boxes were sized off the ungrown hall · FIXED

`reachable()` and the kid wander both excluded `KEEP.w + 5` × `KEEP.d + 5`
= ±19 × ±17. The grown interior reaches ±21.1 × ±17.9, so wander targets could
legally land **inside** the grown hall. Both boxes now scale by
`TUNE.world.keepGrow`.

---

### Bug 11 — Separation shoved NPCs into water and through walls · FIXED

The personal-space push wrote `n.pos.x/z` directly with no ground, water or
interior test anywhere. A knot of villagers on a bank pushed each other into the
shallows, where the shoreline rule then pinned them. Worse, the push registered
as movement, which suppressed the stuck detector that would otherwise have
rescued them.

**Fix.** All three push branches go through a new `shoveNPC()` that drops any
shove landing in water or inside a forbidden interior.

---

### Bug 12 — The right-of-way rule was inert · FIXED

`n.wantedMove = n.wantMove` ran twice per tick — once correctly, then again at
the end of the tick *after* `wantMove` had already been cleared. So by the time
a neighbour read it, it was always `false`. The whole priority system
(`claim()`) therefore always tied: a walking NPC and a standing NPC split the
push 50/50, and the bonus for someone stepping into their own doorway was dead
code. This is why villagers barged each other in doorways.

**Fix.** Deleted the second assignment.

---

### Bug 13 — The town's adults had nowhere to sleep · FIXED

The 20 working adults of the town were the only villagers never assigned a
`hut`. Both night-home branches require one, so both were permanently
unreachable for them: at dusk they walked back to an outdoor spawn spot and
milled about in the street until dawn. They now get the nearest house with a
door and a bed — the same search the town's children already used.

---

### Bug 14 — `stay` did not make anyone stay · FIXED

`n.stay` was read in exactly two places, neither of which gated a movement
branch. The eight village quest givers are all set `stay: true` **with a radius
of 8**, so they wandered off their markers day and night — and combined with
Bug 6, their home then drifted too, silently moving the quest. `stay` now gates
both wander branches, and the idle wander validates its target with
`reachable()` (it previously skipped the water and slope checks entirely).

---

## Earlier this session — 2.0.2 stabilisation

### Bug 15 — Hollowmere fairy quest could softlock the finale · FIXED

The ferryman recorded `FAIRY.found` on acceptance and required two *more*
children afterwards — but there are only 25 in the world. A player who had
already found 24 or 25 could never complete it, and since all eight village
errands gate the finale, that blocked the ending permanently. `ferryBase` now
clamps the starting tally to at most `total - 2`, and clamps on read as well, so
a save already carrying a bad baseline repairs itself.

### Bug 16 — The Safari shader fallback could never fire · FIXED

`renderer.debug.onShaderError` does not exist until three.js **r136**; this
build bundles **r128**. The handler was dead code, so a machine that refused the
textured terrain program had no way back. The handler is kept for newer builds,
and alongside it `watchTerrainShader()` polls `renderer.info.programs` for the
`terrain-textured` program reporting `diagnostics.runnable === false` — which is
how r128 actually reports a failed link. On failure it drops to flat colours,
tells the player, and writes the choice to storage so the next boot does not
retry.

### Textured ground on by default

`hqShaders` now starts `true`. Because the textured program is compiled on every
machine rather than only on request, the working fallback above was a
prerequisite, not a nicety.

### Graphics preferences re-evaluated

Storage key moved to `wildmoor.graphics.v3` and saves carry `gfx: 3`, so a
preference written back when the ground defaulted to flat cannot hold the new
default off. Older saves fall through to the local preference.

---

## Review claims that did NOT hold

Checked and rejected, so they are not "fixed" and should not be re-reported:

- **"`resize()` has a duplicated `camera.updateProjectionMatrix()`."** False — it
  has one. The second call in `applyGraphics` is *required*, because `resize()`
  runs before `camera.far` is assigned.
- **"Remove the unused `renderer.debug.onShaderError`."** Keep it. Dead under
  r128, correct for r136+, and commented as such.
- **"No player home exists."** False. `grantHome()` / `buildHomeShelf()`, a
  five-slot trophy shelf, granted by the King after the beacon, saves correctly.
  The greps that missed it were searching for "cottage" and "trophy"; the code
  says "the champion's house" and "a shelf".
- **"`STORY.clues` validator caps at 3, invalidating 4–5 clue saves."** Already
  fixed in an earlier pass — it accepts 0..5.
- **"The Warden is not respawned on load."** Already fixed — `applySave`
  respawns it when `finaleStarted && !wardenDead && !ending && !netGuest()`.
- **"The goblin camp is not reconstructed on load."** Already fixed —
  `makeGoblinCamp()` rebuilds it from `STORY.campLeft`.

---

## Verification

No Node, Python or npm on this machine, so there is no linter. Every change
above was verified by loading the file in headless Edge — which parses it,
builds the world and compiles every shader — and grepping the debug log for
`SyntaxError|Uncaught|TypeError|ReferenceError|shader error`. All runs clean,
with WebGL activity confirming the world actually rendered.

**Still requires real play-testing**, which static checks cannot cover: the NPC
fixes over a full day/night cycle, a save key made before these changes still
loading, Safari's terrain fallback, and the Drowned Warden's difficulty (which
is deliberately untouched and still unvalidated).

---

## Regressions caught by the standing reviewer, and fixed

Four of these were introduced by the NPC fixes above. Catching them is exactly
what the reviewer is for.

### Bug 17 — The keep's door sat inside the grown hall · FIXED

Giving `KEEP_ROOM` a door (Bug 7) fixed eviction at rest but broke it while the
hall is grown. The door is at `z = -0.4`; at rest the room spans
`z ∈ [-25.2, -2.8]`, so the door is 2.4 m outside — correct. Grown by `keepGrow`
1.6 the room spans `z ∈ [-31.9, +3.9]`, putting the door **13.5 m inside the
room**. The round-hut door rescale only runs for `it.baseRound`, and the keep is
rectangular, so its door never moved. "Walk the stray villager to the door" then
walked them into the middle of the throne room, in front of the player.

**Fix.** The keep's door now scales with `grow` alongside the round-hut case.

### Bug 18 — The throne room became a goblin-panic shelter · FIXED

`if (!it.door) continue;` in the hide-target search was the *only* thing
excluding the keep — by accident, because it had no door. Once it had one, the
keep became the nearest door in the world for most of the town, so a goblin raid
sent villagers sprinting into the king's hall. Hiding exempts them from both
interior guards, so nothing could evict them. The sleeping search already
excluded the keep explicitly; the hide search now does too.

### Bug 19 — `shoveNPC` deadlocked NPCs already in water · FIXED

The new water test was unconditional, so an NPC already standing in the shallows
failed it at their own position too — every shove was dropped and they
interpenetrated forever. Affects bathers, washers and water carriers sharing a
waterside work spot. It now refuses only a shove that makes things *worse*.

### Bug 20 — The `escaping` hatch let NPCs paddle about the shallows · FIXED

`escaping` suppressed all three water clauses in *every* direction, and its only
constraint was `!wetBlockAt`, which ignores water shallower than 0.25 m. Flat
sideways steps across shallows and mudflats therefore qualified, so instead of
being pushed inland the villager wandered the shallows indefinitely. The
look-ahead must now be real dry land (`!isWater`). Deep water was never
reachable either way — that gate is separate.

### Bug 21 — A frame-error storm killed the game permanently · FIXED

After 30 errors the loop returned **without rescheduling**, and nothing ever
re-armed it. The fault overlay covers the pause menu, so the player could not
reach "Save key" — everything since their last manual save was lost. Worse,
`showFault` stays silent for pointer-lock-shaped messages, so an unlucky storm
froze the screen with no explanation at all. The loop now backs off for two
seconds and resumes.

---

## Animation pass — one continuous motion instead of state switching

### New — damp(a, b, lambda, dt)

The codebase had no exponential-decay helper; everything used
lerp(x, target, dt * k). That drifts with frame rate and overshoots once
dt * k passes 1 — which the player's arms did on any frame slower than 45 fps
(dt * 22). damp converges at the same real-world rate whatever the frame rate
and can never overshoot.

### Bug 22 — The player's legs never blended · FIXED

Sixteen hard leg.rotation.x assignments across five branches, against twelve
properly eased writes for the arms, hand, shield, head, cape and hair. The legs
were 100% snap, so every state change popped them to a new pose in one frame
while the arms eased. That split is the "changing states rather than one
animation" feeling. Legs are chosen as targets now and written once through the
same easing the arms use, including the airSlash, dive and climb overrides.

### Bug 23 — The hip teleported 0.65 m on every slide · FIXED

u.rig.position.y jumped 1.2 to 0.55 entering a slide and back on exit in one
frame — the most visible snap in the game, and the only hard write in an
otherwise eased block. It damps now.

### Bug 24 — A leg buried itself half a metre during slides · FIXED

Reported: "one leg should not be clipping through the ground."

The leg reaches 1.133 m below its pivot, which sits 0.15 m under the hip, so the
sole stays on the surface only while 1.133 * cos(rigPitch + legPitch) is within
the hip height. Sliding dropped the hip to 0.55 while the pose left the front leg
nearly straight at 0.2 — total pitch 0.4 against a requirement of 1.098 — putting
the sole 0.528 m below the terrain for the entire slide. Because the hip snapped
instantly while the torso pitch eased over ~0.3 s, the deepest penetration
(-0.62 m) happened on the first frame. The leg angle is now solved against the
hip height as it actually is that frame, so the foot stays planted through the
transition too. Skipped while swimming, airborne or mid-dodge-roll.

### Bug 25 — Walk cycles stopped dead mid-stride · FIXED

Villagers, goblins and the bear advanced their cycle by dt * (moving ? n : 0), so
the phase froze the instant movement stopped. For villagers the pose also swapped
source discontinuously, from a half-radian stride to a four-hundredth-radian idle
sway at a different frequency and phase. Amplitude eases between the two now and
the phase keeps turning slowly while idle. The bear's cycle rate (7 to 16
entering a charge) eases too.

### Bug 26 — Sitting villagers only ever posed one arm · FIXED

The if (n.sit) block set both arms, then the next line overwrote arms[0]
unconditionally.

### Bug 27 — Wolves, wraiths and the Warden had no heading smoothing · FIXED

They wrote mesh.rotation.y = heading raw every frame. Wolves recompute heading
every frame while circling, so they whipped round on the spot.

### Bug 28 — Goblin and bear attack telegraphs popped · FIXED

The goblin's arm jumped ~2.1 rad the frame a windup began and 1.2 rad back on the
swing; its body dropped 0.15 m instantly. The bear's head made three hard jumps
per attack. These ease now, fast enough to still read as a telegraph.

### Bug 29 — Wraith opacity flickered through four values · FIXED

0.55, 0.85, 1.0, 0.55 as hard assignments — four pops per attack. Their
ground-follow also lagged enough to sink through terrain at a cliff edge, so the
climb is now much faster than the settle.

### Bug 30 — The pose helper posed nothing · FIXED (caught by the reviewer)

poseNPCEarly advanced the walk cycle counter, but the code that turns that
counter into limb rotations lives past the early exit. A villager fleeing goblins
ran the full six seconds with completely rigid limbs, frozen in whatever pose the
last full tick left. It now poses the limbs itself, and no longer ground-snaps
someone climbing the elder tree or drops a seated villager 6 cm.

### Bug 31 — Water folk were stranded by a mismatched gate · FIXED

The exemption letting washers, water carriers and bathers stand in the shallows
is granted by job AND phase; the shore rescue was withheld by job ALONE. The
moment one turned for home she was both no longer allowed in the water and no
longer eligible to be pulled out of it.

### Bug 32 — The fault backoff cycled forever and still blocked saving · FIXED

The 2 s retry cleared loopFaulted, so a deterministic error re-showed the fault
overlay every ~2.5 s indefinitely. Nothing ever hid #loading again, so the pause
menu stayed unreachable and the player still could not press "Save key" — the
entire reason for the change. It now hides the overlay on resume, caps at five
retries, and calls guardPlayerPosition() first.

### Also hardened

shoveNPC refuses a jostle that would put someone out of their depth, and exempts
an NPC's own shelter during a raid. The kid sleep search excludes the keep
explicitly rather than relying on noSleep — the same "excluded by accident" shape
that caused the original castle bug.
