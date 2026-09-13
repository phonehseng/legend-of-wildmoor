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

### Bug 33 — My own clearance solve splayed the player's legs while standing · FIXED

Caught by the reviewer. The solve ran in every grounded state, not just slides.
Standing: hip = 1.05, leg = 1.133, so `1.133 · cos(total) <= hip` is
**unsatisfiable at total = 0** — `need` came out 0.384 rad and both legs were
forced 22 degrees the *same* way, permanently, with no way to resolve. Walking
was clamped twice per stride too. The rest pose has always had ~8 cm of boot
below the ground plane by design; the solve was "correcting" that everywhere.
Now gated to `P.sliding`, the one state that genuinely drops the hip far enough
to bury a leg, and ties break per side so legs oppose rather than splay together.

### Bug 34 — Leg overrides damped twice per frame · FIXED

airSlash, dive and climb damped the already-damped leg value toward their own
target, composing two exponential steps in one frame and landing on a blend
rather than the override. They are targets now, like every other state, so there
is exactly one leg write per frame.

### Bug 35 — The pose helper ignored seated and stocks poses · FIXED

A seated villager who saw the body had their legs damped straight over the 2.6 s
shock, then folded back. The helper now honours the same `sit`/`stocks` targets
the main path uses.

### Bug 36 — The bow line re-opened the double-write · FIXED

Structurally the same defect the `armT` refactor had just removed: the sit,
kneel and stocks target was computed, written, then discarded on the next line
for any bow carrier. Folded into `armT`.

### Bug 37 — The wraith's two largest opacity pops were the ones left · FIXED

`recover` was excluded from the damp *and* hard-set opacity to 1 every frame, so
strike→recover (0.85→1.0) and recover→drift (1.0→0.55) still jumped in a single
frame — the biggest two of the four.

### Bug 38 — The fault give-up was silent · FIXED

Latching `loopFaulted` meant the final give-up happened with the overlay already
hidden and nothing rendered, and a pointer-lock-shaped first error — which
`showFault` deliberately ignores — silenced the entire session. The branch runs
at most six times, so it now shows every storm.

### Bug 39 — A blocked wolf held a static splay · FIXED

`walkAmp` was driven by state, but `anim` only advances on a *successful* step.
A wolf circling against a cliff had full stride amplitude with a frozen phase.
Now gated on real motion.

### Also hardened

Cape and hair damping used `8 - i` / `9 - i` as the rate — one segment away from
zero (frozen) and two from negative, where `e^(-λdt) > 1` and the rotation
diverges to NaN. Floored at 2.

---

## Hunters keep the night watch

**Requested:** "hunters don't have to necessarily sleep at night but they can
disappear into their tent to take short naps here and there, but 95% of the time
they should be out and about, and even come out at night."

Tents already existed for the five forest hunters but were never recorded on the
NPC. Every other hunter now gets one pitched at worldgen, with a struct probe so
it is never driven through somebody's wall. The tent is a solid 1.6 m collider,
so "disappear into the tent" means reaching its mouth and going out of sight —
and only while the player is far enough away not to watch it happen.

Naps are a countdown, not a per-frame chance, re-rolled every time so they never
land on the same hour twice: a mean 21 s nap in a mean 420 s cycle, about 5%.
Three things end one — the timer, which nothing holds up so a nap has a hard
ceiling; a goblin inside 40 m, which is *wider* than the hunter's own shooting
range so he is up before it is in his; and failing to reach the tent at all.

**Deliberately not `n.asleep`.** That branch `continue`s before anything can wake
the sleeper and has no exit written anywhere in the file — the miller has been in
it since 2.0 and is never getting up.

### Bug 40 — An abandoned deer was removed from the game permanently · FIXED

Worse than a stale claim. An abandoned carcass never gets a `respawnT`, so the
only thing that could bring it back is `updateDeer`'s `deadT > 180` fallback —
and `updateDeer` skips any deer more than 170 m from a player *before* `deadT` is
incremented. A kill dropped out in the wood was gone from the pool for the rest
of the game. Every path that throws away a fetch or a haul now goes through
`releasePrey()`, which sets the respawn itself, plus a 90-second watchdog for
every case the per-branch stuck timers miss.

### Bug 41 — `fetch` and `haul` were missing from the nightfall conversion · FIXED

The dusk "put your work down" list covered `go` and `work` only, so a hunter who
downed a deer at dusk stayed in fetch or haul all night with the carcass still
claimed.

### Bug 42 — Hunters fought with their arms swinging idly · FIXED

The bow-draw pose is gated on phase `work`, but a hunter shooting goblins leaves
the tick through the early-exit branch and never reaches it. He drew no bow all
night. The pose is now applied at that exit too.

### Bug 43 — Two night-home pulls, and only one was obvious · FIXED

The chain branch catches phase `home` or job `idle`; a hunter back from an errand
landed in the *other* one inside `case "home"`. Both now exempt hunters.

### Also

`pickWork` gained a night branch — a beat around the hunter's own fire, inside
the 22 m ring a hearth keeps goblins from spawning in, so nothing erupts under
him. The daylight-only gate on picking work at all was blocking the one job with
a night errand. At night he stands watch, facing away from his fire and sweeping
slowly, half of them each way. Engagement is 34 m / 1.4 s by day and 22 m / 2.6 s
by night — that split is the whole night balance.

**Balance note:** villagers have no `hp` field at all, and goblins only ever
target the player, so a night hunter cannot be hurt. The risk is entirely
one-sided — ten-odd bowmen at two damage a hit against 4 HP goblins and a spawn
cap of 7 would trivialise the night. Hence the shorter night range and slower
cadence. Arrow damage is the next lever if it is still too easy.

---

### Bug 44 — The deer fix missed the commonest path, and the last commit said otherwise · FIXED

The previous entry claimed "every path that throws away a fetch or a haul comes
through `releasePrey`". That was **wrong**. The fetch-stuck path — a hunter
blocked for four seconds on his way to a carcass, which is the ordinary way a
fetch dies — still nulled the claim without setting a respawn, orphaning the deer
exactly as before. The 90-second watchdog could not catch it either, because that
path nulls `n.prey` itself, so the watchdog's `if (n.prey)` never fires.

All four paths now route through `releasePrey`, which takes an optional delay so
the successful-haul case keeps its longer timer. Two of them were also leaving
`claimed` set for the whole respawn window, so no other hunter could take the
carcass.

### Bug 45 — The respawn clock only ran within 170 m of the player · FIXED

`updateDeer`'s distance cull sits above the `dead` block, so it gated the
`respawnT` countdown as well as the animation. A deer abandoned in a far corner
kept its timer frozen until the player happened to walk back to it — on a
900-unit map, potentially never. The countdown is now hoisted above the cull;
respawning picks a fresh random position anyway, so doing it off-screen is
correct.

### Bug 46 — Night patrol points could land inside buildings · FIXED

`findSpot` tests height, slope and trees only. A town hunter's fire falls back to
his own doorstep, so his beat circles inside the walls — and `findSpot` would
happily return a point inside a neighbour's front room, which `step`'s interior
guard then refuses to walk to. He would grind at the wall every night.

### Bug 47 — Tents could be pitched across roads · FIXED

The probe rejected interiors and structs but not paths, and a tent is a solid
1.6 m collider placed 5.5 m from a door that is often beside the road.

### Bug 48 — `n.aiming` could latch the bow drawn · FIXED

The flag was cleared inside the same branch that sets it, so any tick where an
earlier ladder arm won skipped the reset. Cleared once per tick now.

### Tuning — `napReach` 90 → 25

The nap clock runs while the hunter walks to his tent, so 30 seconds of nap buys
at most 72 m of walking. A hunter 72-90 m out would drop his work, walk, time out
en route, and walk back having gained nothing.

---

## 2.1.0 — Villagers sleep in beds

**Requested:** "at night, the villagers that sleep at night should go to a hut at
night and sleep in a bed, and the player shouldn't be able to sleep in it. quest
givers don't sleep. there should be enough beds for each villager in a kingdom or
town, if not a second bed can be added to a hut."

**The count, before any furniture was placed:** the kingdom had 21 usable beds
for 26 sleepers; each village was short 3-4; **16 village children had no hut
assigned at all** and wandered every night; and ~18 huts were already
double-booked, with a child and an adult sharing one bed. So ~30 second beds, not
one per hut.

**Quest givers already never slept** — `post: true` excludes them from all three
night branches. No new flag was needed, only leaving them out of the sleeper pool.

Beds are now records rather than a bare Vector3, and `beds[0].pos` **is** the old
`it.bed` object, so the respawn search, the lore books, the hiding places and
`millerToBed` all kept reading the field they always read and needed no changes.
A second bed goes into `it.group`, never `it.dec`, because `dec` children are
counter-scaled when a room swells and bed 0 is not — the wrong parent and the two
beds drift apart as the player walks in.

Assignment is deterministic — distances and array order, no randomness — so the
layout is identical on every boot and **none of it needs saving**.

### Bug 49 — `asleep` had no exit, anywhere · FIXED

The branch returned early before anything could wake the sleeper. The miller has
been in it since 2.0 and was never getting up. Villagers in beds now lie down
properly and get up at first light; the miller keeps the old behaviour, because
his is intentional.

### Bug 50 — The player slept 20 cm inside their own mattress · FIXED

Pre-existing. A grown room lifts the bed by its vertical scale, but the lie
height used the unscaled value.

### Also

Occupancy is per bed, not per room — a hut with two beds is two separate offers,
so you can still sleep in the free one while somebody snores in the other, and
the refusal line says which. The final stride to a bed is a lerp rather than a
step, because `step()`'s 2.5 m look-ahead is inside the wall that close to one
and every direction gets refused. No E prompt over someone face-down on a bed.

**Versioning:** from here the version bumps and the file is renamed on every
commit. This one takes the accumulated feature work — ground cover removal, NPC
pathing, animation blending, hunters, beds — to **2.1.0**; patch bumps follow.

---

## 2.1.1 — Multiplayer holes, exploits, and things that looked wrong

### Bug 51 — Guest hunters locked up shooting phantoms · FIXED *(my regression)*

On a guest every goblin is a mirror of the host's, and one that leaves the
host's snapshot radius is marked `hidden` but keeps `alive = true` with its
position frozen at last report. None of the four villager-vs-goblin searches
checked `hidden`. So a hunter standing near a phantom entered the engage branch
and **never left it** — firing at empty air forever, never picking work, never
napping, never going home. Guest arrows are discarded by `damageEnemy` anyway,
so it could never resolve. Introduced by the night-watch commit; five tokens.

### Bug 52 — A dropped connection resurrected every goblin · FIXED

The cull loop sat *below* the guest early-return, so a guest accumulated one mesh
per goblin the host had ever spawned and removed none. Then `netDrop` handed them
all back: `mirror = false, hidden = false, visible = true`. **One wifi blip and a
whole session's worth of goblins turned real, visible and hostile at full health
on the guest's screen**, bypassing the spawn cap entirely. The cull now runs for
everyone, phantoms time out after 30 s, and a disconnect deletes mirrors instead
of reviving them.

### Bug 53 — Any peer could end everyone's story permanently · FIXED

`{t:"mq"}` was dispatched to `applyMainProgress` with **no authority check**, and
the host rebroadcast it. `endTheStory` rewrites the pool, sets the flag and
returns early ever after — there is no way back. A single crafted message ended
the story for every player in the session, including ones who had not collected a
relic, and took their choice of ending with it. A guest now only accepts an
ending from the host.

### Bug 54 — Loading a save silently ejected you from multiplayer · FIXED

`loadSaveKey` calls `location.reload()`, which tears down every peer connection
with no goodbye; the reloaded page gets a fresh id and has no reconnect path. It
now asks first.

### Bug 55 — A malicious host could exhaust a guest's memory · FIXED

`netApplyEnemies` iterated the snapshot with no length cap, building a full
character mesh per unseen id. Bounded to 64 goblins and 32 extras, with finite
coordinate checks.

### Bug 56 — A crafted save key could reach `Object.prototype` · FIXED

`REWARDS[e[0]]` and `DISCOVERIES[x]` tested membership by truthiness, so
`"constructor"` and `"__proto__"` passed validation. The reward path then called
`fn()` unguarded — throwing *after* the pickup had already been consumed.
Ownership checks on both, and `grant` now checks `fn` is callable.

### Bug 57 — A guest could permanently lose the finale · FIXED

`NET.finaleAsked` latched forever and was never reset. If the single ask went
unanswered the guest could never raise the Warden again for the rest of the
session. Now a 20-second cooldown.

### Hunter tents are out of the settlements

Requested. The post-pass searched outward from each hunter's home, which for town
and village hunters is inside the settlement. It now starts outside and works
outward, rejecting anything within the town wall or 30 m of a village centre.

### Fires burn

Every hearth in the valley — the elder-tree camps, the villages, the forest
hunters' camps and the hermit's — now has three tapered tongues that writhe on
their own phase, with the light breathing in time with them rather than on its
own clock. They animate only within 90 m, so a valley full of hearths costs
nothing.

### Hunters were holding their bows backwards

The limbs bulged *toward* the archer with the string beyond them. Flipped.

### The level-up notification is gold

The whole box, not just the letters — a bar that only recolours its text reads as
a typo.
