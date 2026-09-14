# Changelog

Every change, with the bug it fixes and how. Newest first.

---

## 2.22.1 — Two reported logic defects, both real

Both reported from a code read rather than from play. Both confirmed, and each
turned out to have a consequence the report did not mention.

### Bug 127 — Gehenna's whole narrative clock ran at double speed · FIXED

`window.GEHENNA` and `GEH_SCRIPT` are **the same object** — `window.GEHENNA = api`
at the end of the after-story module. So:

- `updateStory2` called `GEH_SCRIPT.tick(dt)` directly.
- `updateGehenna`, seven hundred lines and one frame-order position later, called
  `gehSay().tick(dt)` — which resolves to `window.GEHENNA`, the same object.

Both run every frame, and the main loop calls both. `tick()` opens with
`if (!GEH.root) return`, so above the seam it was harmless — but **from the moment
Gehenna exists, every automatic beat, every arming distance and the entire
closing sequence advanced twice per frame.**

**And a consequence the report did not name.** `updateGehenna` returns early while
`P.gehDive` is set — deliberately, so the after-story does not advance during the
six seconds of falling. The `updateStory2` call had no such guard, so **it
advanced the after-story all the way down the shaft**, which is exactly what that
guard exists to prevent. Removing the `updateStory2` call fixes the doubling and
restores the dive guard in one line.

### Bug 128 — A guest could end the host's story, and the host relayed it onward · FIXED

The guard read:

```js
if (NET.role === "guest" && peer && !NET.peers.has(peer.id)) return;
```

It only ever fires **for a receiving guest.** A host ran straight past it, so a
host applied an ending carried in any guest's ordinary half-second progress
snapshot. A friend joining with a finished save **ended the host's unfinished
valley within half a second of connecting** — permanently, since `endTheStory`
rewrites the pool, sets the flag and returns early ever after — and took the
host's choice of ending with it.

**The relay makes it worse than reported.** The `mq` handler is:

```js
if (m.t === "mq") { applyMainProgress(m, peer); if (NET.role === "host") netBroadcast(m, peer.id); return; }
```

The host forwards the guest's message to **every other guest, unchanged**. It
arrives there *from the host*, so it passes their own check. One guest's stale
save ended the story for the entire session.

Two doors, so two fixes. The ending is accepted only by a **guest**, only from a
peer whose id is `"host"` — which a guest's single peer always is, since it is
created as `netPeer("host")`. And the host **strips `ending` from any guest's
snapshot** before applying or relaying it. The host's own ending still travels
normally, because that one is broadcast from `mainProgress` rather than relayed.

The early `return` in the old guard is gone as well: it skipped the "your friend
has moved the story along" notice, which is about the rest of the message and had
nothing to do with the ending.

### Refuted, in passing

The report said `updateGehenna()` "calls the same `tick(dt)` again". It does, but
not by name — there is exactly **one** literal `GEH_SCRIPT.tick` call site in the
file, and the second path is `gehSay()`. The conclusion was right and worth
acting on; anyone grepping for the reported symptom would have found one hit and
stopped.

## 2.22.0 — She stands among the people she is defending

### The Matron's post moves to her cart

In 2.21.0 her post was at `cx + 96` and her cart at `cx + 56`, and since you come
off the hill heading west you crossed 96 first — so **`matronAfter()` was
unreachable for everyone who walked back out**, which is everyone. A written scene
nobody can reach is dead content, and the walk out is the only time the player
sees that place with the machine stopped.

Two shapes were measured rather than argued:

| | **post at her cart** | **post at 96, armed after the cart** |
|---|---|---|
| after-script reachable | yes | yes |
| **engages a player who keeps walking** | **yes — armed at dx 48.6** | **no — closest 40.27 m, never closes** |
| refusal still works | yes, 0 hits | yes, trivially — she cannot reach you |

**The second is broken.** She arms forty metres behind the player and at a normal
walking pace never closes, so the fight would only ever happen to somebody who
voluntarily stopped and waited for her. That is worse than the problem it solves.

And the first turns out better than the objection to it. With her post at the
cart, her four are chosen nearest **her** — measured at dx 48, 54, 60 and 66, two
either side. **She stands among the people she is defending**, which is what the
design wanted for her last phase anyway, and to wake one you still have to get
past her: the nearest is 9 m east of where she arms. *"The only thing she will not
permit is going back toward the seated"* is the geometry now rather than a line
about the geometry.

Arming is at the cart less five metres, so the whole 4.4 m interact scan around
her is open before she moves. Walking through at pace and pressing E picks up
**three of her six after-script beats**; a player who stops gets all six. The cart
figure is hidden on spawn, so there is one body: **the woman who talks to you is
the woman who stops you.**

### Bug 126 — The Almoner was relieving the four the Matron defends · FIXED

Found only because the variant probe ran both encounters at once, which is
exactly the case nobody tests.

`gehAlmonerNext` excluded `calm`, `seat` and `sat` — **but not `seated` or
`grieve`.** So the Almoner walked over on his rounds and unburdened the four the
Matron is protecting, silently removing them from the pool the player can wake
and **capping her tier below 4 with nothing on screen to say why.** Only two of
her four survived the first run. Four survive now.

### A standing note for anyone measuring an attack

**Hitstop makes every attack span read long, for every enemy in this game.**

The frame loop sets `dt = 0` for the whole of a hitstop while the game clock keeps
running. Enemy state timers advance on `dt`; anything measured in wall clock or
`time` does not. **So any span containing a landed blow reads long by exactly the
hitstop inside it.** `damageEnemy` sets 0.06, or 0.1 on a `big` hit;
`enemyStrike` sets 0.08 on a block or a flurry; the dive sets 0.1.

Measured on the Matron: bar windup **0.611 s** and strike **0.272 s** against
specs of 0.55 and 0.22. Hold `P.inv` high so `hurtPlayer` returns before setting
a hitstop and the same timers read **0.555 and 0.223**. They were always right.

The same applies to `P.flurry`, which sets the time scale to 0.18 — a span
measured across a flurry reads about five and a half times long.

**If you are checking a windup against a specification, suppress the hit or read
`e.t` directly.** A 10–25% overshoot on a state that lands a blow is the engine,
not the boss.

### Two numbers corrected from 2.21.0

Both were the probe's own sampling interval fighting the thing it measured, and
neither was ever wrong in the engine: **set-down is 8.000 m toward the water**
(spec 8), and **regen at post is 12.000 hp/s exactly** (spec 12), with her in
`post` for 97.9% of 193 samples.

## 2.21.0 — The Matron, and all three of Gehenna's bosses are standing

### She is the woman who was already there

Another agent had built a Matron as a **speaker** — nine beats mid-rows with a
cart, Bel on the kerb, *"I put myself at the bottom of it every morning."* That is
the same person the combat design describes, so the fight is wired to **her**
rather than to a second body with the same name. Her speaker drops out of the
interact scan when she arms, the way the Kindly One's does when she dies, so the
after-story can never hold a conversation with a boss mid-swing.

### The lever she tells you about herself

You cannot hurt her while her charges are settled. Waking one is permanent, they
never stop grieving, and **she heals when you leave the corridor and they do
not.** Guard by tier: **0.200 / 0.340 / 0.520 / 0.760 / 1.000**, verified by
landing a ten-damage blow at each and measuring 2.000, 3.400 and 10.000. Waking a
fifth does nothing.

**The leash is the point of the whole boss, and it measures exactly as intended.**
Step out of the corridor: regen **12.000 hp/s**, her health back to full — and
`woken` **stays at 4**. Four still standing, still grieving. Her health comes
back and the people do not.

**The Bar at tier 0 does no damage at all** — raw 0.000, and it imparts
**28.099 m/s**, which throws you clean out of the row without chipping you. And
the woken never reach `killEnemy`: `gkills 0`, still alive, hp restored, and a
second blow does nothing.

**Refusal works completely.** Walked from dx 90 to the dish: 0 hits, 8.000 hp
unchanged, nobody woken, all four still seated, and she returns to post at full
health. Her room stays shut and there is no heart.

### An instrument fault worth writing down

The first timing pass read long — bar windup 0.615 s against a specified 0.55.
**That is not the boss.** `dt` is zero for the whole of a hitstop while the game
clock keeps running, so **any span containing a landed blow reads long, for every
attack in this game.** Holding `P.inv` high so `hurtPlayer` returns before setting
one gives the true figures: **bar windup 0.551, strike 0.226, recover 0.911**
against a specified 0.55, 0.22 and 0.9.

Three of the five other first-run "failures" were probe faults of the same family
as the ones earlier tonight — measuring a span by awaiting the next state catches
leftovers and misses single-frame passes.

### Two defects the agent found in its own diff

- **Two of her four seats sat out on the swept ash.** The filter used her
  corridor rather than the design's seat band, and measured them at dx 98 and 99,
  outside the rows entirely. They land at 72 and 78 on both sides now.
- **A one-frame window where `guard` lagged.** Recomputing it at the top of the
  next frame meant the best damage window in the fight — hitting her while she
  kneels, or while she is holding you — **still paid tier rates for one frame**.
  Measured at 3.400 instead of 10.000. It is set on entry now.

### Her death opens her room

`maxHp` 8 → 9, `gkills 0`, and **the room with the twenty-eight names opens on
her death**, taking over from the temporary `gehDone` opener exactly as the
comment on it promised. The grant is guarded on `FOUND`, so clearing `GRANTED`
and re-running it leaves maxHp at 9.

### One decision left standing

Her post is at `cx + 96` and her cart at `cx + 56`. Coming off the hill you cross
96 first, so **`matronAfter()` — "Nobody's come down the road… I'd got used to
afterwards" — is unreachable for anyone who walks back out, which is everyone.**
It is one constant. The design names 96 twice, so it was built as written and
flagged rather than quietly changed.

### Also checked, and needing no change

The design asked for an edit to stop the exit being gated during her fight.
Measured: `GEH_SCRIPT.fight` is **false throughout**, because that flag belongs to
the Kindly One's dialogue. The exit was never gated on her. No edit made.

## 2.20.0 — The Unclaimed, a room behind the water, and three things that were never there

### The Unclaimed

Gehenna's second boss. Eight hundred years of surrendered property, heaped behind
the yard — rooted, silent, faceless. **Its entire behaviour is a function of the
damage taken in the last second.** Inert below about 3.5 dps; at the top tier it
answers with a copy of your own last blow, at your own weapon's windup and reach.
The Flurry rush is a trap and the optimal play is ninety seconds of deliberately
playing badly.

Every number in the design was measured rather than assumed. Regen exactly
**0.500 hp/s**. Sustained damage of 1, 4, 8 and 14 dps produces heat 1.590,
6.399, 12.936 and 22.504 — tiers 0 to 3, with boundaries crossed at 5.21, 11.49
and 21.06 against a specified 5, 11 and 20, and hysteresis down at 14.96, 8.23
and 3.74 against 15, 8.25 and 3.75. Stop hitting it and it is back to tier 0 in
**2.566 s**.

The sweep beats a stage-2 spear — **hit at 10.2 m, missed at 11.5** — which is
the entire point of that reach. The echo copies the axe at dmg 6.000, wind 0.804
and reach 4.052, and the spear at 6.000, 0.487 and 5.710: faster, lighter and
longer, exactly as written. **Refusal works completely** — twenty seconds four
metres away and a walk from dx 60 to 132 produced 0 hits, 8.000 hp, tier 0
throughout.

**`e.noBar` ships with it and only it.** Its premise is that its tier *is* its
health bar, and a live 220-hp readout would hand the player the mechanic.

**The reward is `P.bonus.run`,** the only bonus field nothing else writes — the
third jump, the guard, the dash and the dash cost are all taken, so the design's
original choice would have been a silent no-op for anyone with fifteen fairies.
The reward for the one fight you never had to have is that you leave faster, and
the grant text refuses to say why: *"…and eight hundred years of nothing you
recognise. You walk quicker afterwards."*

### Bug 125 — The first shield raise froze the heap for the rest of the descent · FIXED

Found by the agent re-reading its own diff. `enemyStrike`'s block branch sets
`e.state = "stun"` **from inside the heap's own update**, while it is resolving a
hit — so the end-of-frame shadow latched "stun" and the restore fed it back to
itself. **The first time anybody raised a shield, it stopped moving permanently.**
Verified after: blocked a sweep, state `recover`, and five of five attack cycles
completed afterwards.

### Sixty meshes became twelve

Sixty individual meshes cost about **1.2 ms of median frame time** for one prop —
unacceptable in a file that had just spent a version reclaiming 11% of the frame.
Rebuilt as twelve `InstancedMesh`es, one per material per shape, keeping all
sixty pieces and the colour variety, with the spill animated through instance
matrices. **Node delta +70 → +18**, and frame time now disagrees in direction
between samples, which is to say it is inside the noise.

### The waterfalls, and the seat behind one

**Two causes, not one.** The boulder scatter was blind — a radius starting at
4.2 m against a ribbon 3.4–3.8 m wide, and it ran over the fall's own mid-air
chain points, putting rocks on the cliff face **inside the sheet**. But the
throw was also wrong: a flat 4.2 m for every fall, so a 12.9 m drop came down
almost vertically and the dry strip behind it was under two metres. **No room
could ever have fitted there.**

The scatter proposes and then measures now — every candidate tested in 3D against
every ribbon in the valley, chain points skipped outright, and any stone more
than 5 m from its own water surface rejected so nothing perches on a cliff.

**Measured on the same seed: intersections 4 → 0, worst penetration 2.98 m →
0.00.**

Behind the deepest fall there is a room. Four worn steps up out of the plunge
pool, 2.8 × 2.0 m inside with 3.2 m of headroom, a seat worn into the rock, a
bowl with rain in it, seven small stones, and a clue in two hands that names
nothing. It is a discovery — *The Seat Behind the Water*.

**It touches the heightfield nowhere.** Carving was tried first and cannot be
made safe: a flat wide enough to stand in reaches either the lip, leaving the top
of the fall in mid-air, or the channel below, damming the river. The pocket under
the arc is already real ground. Every collider is a **disc**, because the room
points wherever its waterfall points and `resolveStructs` has no rotation field.

**And a Heart Piece was inside solid rock.** Fall 0's existing pickup sat 4 m
behind the foot — several metres inside the cliff, unreachable. It is at 2.2 m
now, in the dry pocket.

### Picked-up things come to you

`launchPickupFlight`: 0.32 s, accelerating, a hop on the way, shrinking to
nothing. The target is read **fresh each frame**, so walking away cannot strand
an item, and the parametric clock lands it inside 0.32 s however far it has to
come. Herbs fly too. Cleared in `die()` and at the top of `applySave`, outside
its `try`.

Measured: 50 concurrent flights all settle with nothing left in the scene, at
**0.40 ms for 50 flights across 20 frames**.

### The hanged

Five trees, gated at `dread() >= 0.75` — **the same band the dialogue already
claimed**, so the comment in the line pools stops being a lie.

Silhouettes high under the canopy on a rope that disappears into the leaves. No
faces, nothing to study, a slow turn and nothing else. **No dialogue was added
anywhere**, which is the point: nobody in the valley remarks on it.

Placement is lazy so it can read villager homes: 11–30 m from a road, at least
132 m from the town and 147 m from any village, **at least 55 m from any adult's
door and 140 m from any child's.** Built once, then only added to and removed
from the scene — absent at dread 0, present at 0.80, absent again at 0.70 and
after the ending, with the node count back to baseline.

### Pickup ids

The implicit block is byte-identical before and after. The one new pickup carries
an **explicit** `falls:seat` id and sits after every implicit one, where the
church's own comment says new pickups must go.

## 2.19.0 — The purple is gone

**Reported twice:** the satchel and the quest log are too purple.

The Words page built in 2.14.0 was the worked example, and the rest of the
interface is rebuilt to its logic rather than swapped for one new colour: a
near-black ground, bone blocks with near-black bold type, gold tabs, bronze
rules, and about a degree of shear.

- **At the root**, `--box` goes from a purple gradient to near-black ink and
  `--edge`/`--hi` from lilac to bronze. `--muted` was a **dead token** — declared
  and never used — and instead of deleting it, it was given a job: a warm grey
  that now replaces nine hard-coded lavenders.
- **Headings became bone tabs** — near-black 900-weight on a gold spine, the same
  parallelogram as a speaker tab in the log. Explicitly reset on the intro brand
  lockup, which reads as a signature rather than a tab.
- **The satchel's grid is a sunken near-black tray with quiet cells**, so the
  twenty-nine hand-drawn icons carry all the colour in the panel. Selection is a
  gold ring.
- **The quest book is one object again** rather than one good page and two old
  ones.
- Five colour values in the JavaScript: the `!` and `?` markers over NPCs, the
  interact discs, and the minimap's quest target.

### Four phone-width bugs found while photographing it, all pre-existing

- **The satchel, the pause menu and the choice dialog all hung off the right edge
  at 400 px.** `.panel` is a fixed 420, the satchel was `96vw` inside an 18 px
  padded flex parent, and the choice dialog's auto grid column left
  `max-width: 100%` nothing to measure against.
- The pause menu kept three columns at phone width, one word per line.
- **The three full-screen overlays had no `z-index`**, so the autosave mark, the
  place name and the subtitles all printed **over** the satchel and the quest
  book.

### Dead CSS

`.qb-line` and `.qb-line b` were genuinely unreferenced — one occurrence in the
file, the definition itself — and are removed. Nine dead `rgba(229, 219, 255, …)`
declarations in the first stylesheet block were replaced rather than deleted, so
the lavender cannot leak back if an override is ever removed.

**Deliberately left:** the stylesheet declares `.btn` three times and eight other
selectors twice each. That is layered base-then-theme on purpose, and flattening
it is a restructure rather than a recolour.

### Three judgement calls, all kept

The subtitle `dark` class keeps its violet, because it is one of four narrative
voices — content rather than chrome. The minimap's goblin and village dots stay,
because the minimap was rebuilt by another agent between the snapshot and the
live file. And the `!`/`?` markers are 3D billboards rather than interface — but
they were the most visible purple in actual play, so they went too.

## 2.18.0 — The chain is closed, and Gehenna is a journey

**Every one of the eight steps of the 3.0 chain now exists in code.** The Warden,
the hush, the carry, the burial, the King, the sleep, the whirlpool, and — from
this build — **the possessed valley and the descent itself**.

### Step seven: the valley is possessed

From `ysoldeBuried` until `gehDone`, the valley never stops sending things, and
every NPC tells the player to go down.

**Measured, on a fighter:**

| | pre-burial | town, day | town, night | moor, day | moor, night |
|---|---|---|---|---|---|
| XP per minute | 26 | 342 | 548 | 355 | **596** |
| bodies per minute | — | 21.8 | 34.8 | 23.0 | 47.2 |

It is a real faucet and it was not nerfed, because the brief said not to. It is
also bounded: **every fleeing run pins at exactly the cap — 12 by day, 14 by
night — and holds flat for ten simulated minutes.** What punishes running is not
a ramp; it is that the cap fills and follows you.

**Zero site violations in every run**: nothing in water, out of bounds, inside a
house, below `DIVIDE`, or off the ring. Under the seam the siege is **cleared,
not paused**, and re-arms with a 26-second grace on surfacing — and the same
grace after the burial, so the four lines over the grave land first.

**85 authored possessed lines across 8 pools**, 86% of presses possessed,
**18–22 presses before one repeats**, and all eight speaker types reach it,
including Pip and the hall guard.

**Three decisions worth recording.** No new enemy kind, so none of the four
break-points apply and nothing changed on the wire. `updateWraithSpawns` keeps
its `finaleStarted` guard as a documented handover rather than being widened —
two spawners with two budgets would put thirty wraiths on the moor, and the hush
has to be silent. And the cadence is flat: a heat term copied from the pool
**pinned at maximum and never varied**, and had it varied it would have closed
the faucet at exactly the moment the player used it.

### Three defects the siege's own measurements caught

- **A goblin sited inside the kingdom can never reach you** — `move()` refuses
  any step into a building and there is no pathfinding — which took the town's
  night reward to a fifth of the moor's. Inside the walls it is wraiths only.
- **A denless wolf never leaves "idle" beyond 22 m**; two in three never moved.
- The per-press line memory was one shared list, so **the shortest pool trimmed
  the longest pool's history on every press** and the first repeat came at press
  three. It is per-pool now: 18–22.

### Step eight: the descent is a journey

Four new speakers — **the Porter, the Matron, Bel and the Caller** — six edits
each, plus the lodge with a real hatch, the cart, the yard post and board, and a
twenty-figure instanced queue.

The shape is the writer's: every beat before the hill proves the place has
everybody, and then the Clerk says *I do not have her*. And the turn-back is the
Caller offering the exit plainly, with nothing to gain — *"Nobody's ever gone back
up. That's not a warning, that's the number."* — and then asking for ten seconds
of help. **The slip he hands you has your own name on it.** Nothing says so. You
carry your own calling up the hill as a favour to a tired man with bad knees, and
at the very end the Clerk turns it over and writes the Ledger on the back of it.

**Measured:** node delta **+34** against a budget of 500, and teardown returns to
**exactly** the pre-descent count. Reachable from the centre of the road at 3.80,
3.40 and 2.20 m. Presses per script, no dead ends and no early loops: sweeper 11,
porter 25, matron 19, Bel 2, caller 19, clerk 34; on the way out, 25, 5, 7, 6, 2,
9, 4. **Both exit branches** reply correctly and continue to the favour, with
nothing gated. A player who actually leaves and comes back gets a nine-beat
returning script and the exit offer is skipped.

### Four judgement calls made against the script, and all four are right

- **The Matron's z.** The script's table says 5.4 m and its own build note says
  everyone must be within 4.4 m of the road. Those contradict; 5.4 is genuinely
  unreachable. Built to the note.
- **Register order — the script's reasoning was backwards.** `interactGeh` keeps
  the **first** strictly-closer candidate, so an exact tie goes to the *earlier*
  registration. The Matron is registered first. *(And a comment in `bossDown`
  claiming the scan keeps the last candidate on a tie is wrong — its conclusion
  survives only because `leaving` is what actually drops her.)*
- **The lodge moved 1.5 m**, because at its scripted x its roof corner overlapped
  the first house's roof by about two centimetres: textbook z-fighting.
- **The queue's arc was measured rather than chosen** — any wider and its ends
  come inside the kerb, any tighter and its south end lands on a seated figure.

### The room behind the door

One of Gehenna's twenty-two houses is hollow and enterable now. Five wall solids
with a 1.6 m gap, a roof at the same height every other roof gives, a door that
opens once. Inside: a chair, a window bricked up **from the inside** with the
chisel still on the sill, and **twenty-eight rows of small even cuts** — 324 flat
quads in one instanced mesh rather than a canvas texture, because a material
`dispose()` does not take its map with it and a texture would leak on every
descent.

`insideInterior` was not touched: its table is keyed on x and z with no depth
routing, so an interior at Gehenna's coordinates would also be a hole in the moor.
Measured: `groundAt` at the room's 2D coordinates equals `terrainH` exactly.

**One new primitive, `s.gone`**, honoured by `resolveStructs` and `gehGroundAt`.
The structure grid has never had a removal path — fine for a valley built once,
not fine for a door. It is `undefined` on every other solid in both worlds.

**The hollowed house is zero-scaled, not skipped.** An instance whose matrix is
never written keeps the identity matrix, and skipping it would have drawn a brick
box, a roof and a door **at the world origin, in the middle of the valley** — the
same class of bug as Nim's mother, caught before it shipped this time.

### The insert-anchor check is now the standard

The Almoner's agent hardened its applier to refuse, before writing anything, an
insert whose replacement does not contain its own anchor verbatim. **It
immediately rejected three of its own eleven records**, two of which would have
silently deleted the line they promised to keep — the exact failure that broke a
build earlier tonight and took a whole `function updateGoblins(dt) {` header with
it. Mechanical beats careful.

### Known, and not fixed here

- **The exit-choice buttons render label-only.** Every other `askChoice` in the
  game carries a short player line under the label; the script supplies only the
  two bracketed labels.
- **`makePrompt()` leaks a `SpriteMaterial` per speaker per descent** — `reset()`
  removes the sprite without disposing it. Pre-existing at 5 a descent, now 9.
- **Two carts on one short road**: the Almoner's hand-cart sits 11 m from the
  Matron's. No collision and no code conflict, but somebody should decide whether
  it reads.
- **Knights cannot reach any dread band until `metKing`**, because the "go and see
  the king" branch above returns unconditionally. Harmless today, and exactly the
  shape of the bug that once made eleven written lines unreachable.

## 2.17.0 — The arrest happens where you can see it

### Maren is freed and Hale is walked to the stocks, on screen

**Reported:** *"make the animation where the knights free maren and drag hale to
the stocks instead"*, and before that, that the arrest dialogue should be
shortened with two knight animations.

It was a paragraph and a cut: `freeMaren()` teleported both of them and printed
ninety words at fifteen seconds while nothing moved. The most important reversal
in Act II happened off screen.

Now three knights do it. The one nearest the board frees Maren; the two nearest
Hale take him. **The knights arrive while he is still confessing and his
remaining lines are dropped on the floor**, which is the point of them arriving.
Maren's arms come down off the board and **she walks to her own door under her
own power**.

**Hale does not resist**, because the church writings make him a patient man who
believes he was right. He lunges once — **at Maren**, as the board comes up — and
the knights pull him back. That is the only violence in the scene and it is not
about himself. Then he is walked **past his own pyre**, where he stops for five
seconds, and put in the stocks.

The dialogue is short breaths paced by the walk: *"Inquisitor. On the king's
word. Step back from the board."* / *"You are making a mistake. You will not see
it today."* / Maren: *"Oh. Oh, I can move my hands."* / Hale: *"No. Not her."* /
Maren: *"Don't let them hurt him. I mean that."* / at the pyre, *"Somebody will
have to take that down now."* Then from the stocks: *"One life against all of
them. I did the sum twice."* and **"And I was not finished. Remember that I said
so."**

Up to seven villagers stop, turn and speak once each. Nothing states the second
sacrifice, and there is a comment above those lines saying so.

**Measured.** The scene runs 27.5–36 s. Hale's route sampled 133–142 times: **0
in water, 0 inside a building, 0 structure overlap**. Closest pass to the pyre
3.65 m against a 2.7 m clearance. He ends at the stocks with a **mesh distance of
0**. Maren ends about a metre from her door, working. The crowd restores 6 of 6
and **10 of 10 knights**, the three lent ones walking back rather than blinking.

**The five ways a player breaks it were each driven**, not imagined: walking away
trips a watchdog at 90 m that resolves the whole scene in 1.2 s; loading an old
key mid-walk resolves the scene into its finished world first and then applies
the key's flags on top; the map pauses it solo and mutes it online; dying lets it
finish or trips the watchdog.

### Bug 123 — The four children who watch the Warden die never work again, and live at the black pool afterwards · FIXED

**The 2.12.0 mourner bug, still present in its twin**, and worse — found by the
agent building the arrest, in code that was not theirs.

`gatherWatchers` sets `stay`, `post`, `watching`, `job = "idle"`, `target`, and
**`n.home.copy(n.pos)`**. `releaseWatchers` restored three of those six. So the
four village children who come to beg you not to kill her were left with no job
for the rest of the game — and with **their home permanently moved to the black
pool**, which is where a villager walks back to when it has nothing else to do.

Both scenes share one stash now. The arrest extracted the procession's
stash-and-restore into `holdForScene` / `releaseSceneHold`, so a third scene
cannot reintroduce the bug by writing its own half of it, and the watchers use it
plus one field the others do not touch: home.

### Bug 124 — Hale drifted off the stocks · FIXED

Latent in the shipped game and only made reproducible by the scene. `claim()`
scores him as the person with the least right to the spot, so any neighbour
passing within 0.95 m walked him off his own mark and nothing ever put him back.
`HALE.post = true`.

### Two found by measurement inside the scene itself

- **The crowd never spoke** — zero lines across a 31-second scene. A flat 3.6 s
  gap gave *"No. Not her."* the same air as a full sentence and the queue never
  emptied. The gap scales with the line now, and the march waits for the release
  script so the walk opens on a clear channel.
- **Hale stopped 4.75 m from the pyre**, across the square from the one thing he
  had been walked there to look at.

### Open

The scene is 27.5–36 s. It reads as a procession rather than a cutscene, because
the player keeps full control throughout and can walk away from it — but it is
long, and `ARREST_MARCH`, `ARREST_LEG_R` and the five-second pyre dwell are the
knobs if it drags.

## 2.16.0 — Eleven per cent of the frame back, and Nim's mother was standing in the middle of the kingdom

### Bug 122 — Nim's mother has been standing at the centre of the kingdom all game · FIXED

Found while verifying a performance change, and worth more than the performance.

When her body is swapped for the one that matches her — the fix that gave her a
female voice — the code removes the old mesh, adds the new one, and sets
`g.pos` to her hut. **It never writes `g.mesh.position`.** Normally the villager
tick would catch that on the next frame, except her hut is in Thornback, **644 m
from where she is built**, and `updateNPCs` gives up on anybody past 420 m.

So the only thing that would ever have moved her mesh never ran. Her new body
stood at **world origin — the middle of the kingdom** — for the entire game,
unless the player happened to walk to Thornback and wake her tick up.

One line, matching what `syncNPCMesh` does for every other hand-moved villager.
It cannot call `syncNPCMesh` itself, because that is a `const` declared four and a
half thousand lines further down and would throw.

### 165 people were being drawn whether or not they were in the world

**−2.0 ms off a 17.6 ms frame. An 11.4% saving, reproduced at −2.2, −2.2, −2.1
and −2.0 across four independent A/B runs.**

Each villager is about **38 meshes**, so the valley's cast is **6,347 scene nodes,
every one of them `visible`, always** — walked and frustum-tested **twice a
frame**, once for the near pass and once for the far. three.js skips a hidden
object's whole subtree, so one flag on the root buys all thirty-eight.

Frame 17.6 → **15.6 ms** median, p90 19.9 → 17.5, render 14.2 → 12.8. Visible NPC
nodes **6,347 → about 1,600**. `update()` did not move at 1.3 ms — the 165 extra
writes cost nothing measurable.

The gate follows `camera.far` rather than a constant, so it adjusts itself if the
draw distance ever changes, and cross-realm distance is already `1e5` — standing
in Gehenna hides the entire valley for free.

**Proved rather than assumed:** the real frustum was instrumented and every hidden
NPC mesh checked every frame. **Zero wrongly-hidden meshes across 566,832
hidden-root-frames and 15.1 million sphere tests.**

### Three allocation removals, and they are below the noise floor

Real work removed; no measurable frame-time effect, and saying so is the result.

- **The clouds.** The only quality profile sets `clouds: 0`, so all 22 are
  permanently invisible — and both per-frame cloud loops ran anyway. The tint
  allocated **three `THREE.Color` per cloud per frame, 66 a frame**, to compute
  one value and write it 22 times.
- **`updateLightPool`** allocated a fresh array every frame via `filter`. It
  refills one scratch array now. The predicate is deliberately
  `!(v.intensity > 0.001)` rather than `<=`, because `<=` admits NaN where the
  original `filter` excluded it — the agent's own first draft had that bug and
  its self-review caught it.
- **The villager step fan** built a fresh array literal per call and then spliced
  it, for every villager on every tick.

`performance.memory` reports a frozen 159.3 MB for whole sessions in headless
Edge, so GC pressure could not be measured at all. These rest on counted
allocations, not on a measured win.

### Investigated and left alone — which is as useful as the fixes

- **`anyInteractableNear()`: the scan is real, the cost is not.** It does walk 83
  pickups, 14 herbs and 165 NPCs every rendered frame with `Math.hypot`
  throughout — and it benches at **8.45–9.05 µs a call**, about **0.13% of a 15 ms
  frame**. Rewriting it to squared distances would save roughly 4 µs and would
  replace the shared `near()` helper with inline arithmetic. Left alone.
- **`vlights` does not grow.** The structure is exactly as reported — one push
  site, no removal path — and the consequence is not. **Measured 273 at boot, 275
  after the game starts, 275 at ten minutes.** Every call site is worldgen or a
  one-shot builder; the two that look runtime-reachable are misattributions. The
  sort is over the live subset and the whole function benches at 9.5–10 µs.
- **Culling room interiors was measured, had no effect, and was nearly a
  disaster.** The first attempt hid `it.group` beyond 55 m and measured exactly
  zero change. Finding out why is what saved it: **`it.group` is the whole house,
  walls and roof**, not its contents — shipping it would have deleted the village
  from the horizon.
- The HUD and minimap are already right: 30–48 µs a frame amortised. The burial
  chain is clean. `allEnemies()` already memoises.

### The two big ones, sized but not taken

- **`scene.updateMatrixWorld()` costs 3.1–3.9 ms of a 15–18 ms frame** — three
  times all game logic put together. three.js recomposes the local matrix of all
  **15,800 nodes** every frame whether they moved or not. Measured: **541 nodes
  actually move per frame (3.4%)**, and only 863 distinct nodes over forty
  seconds. An experimental static-marking pass was worth **−1.7 ms**, and was
  deliberately not shipped: the static set included far villagers' limbs, which
  are not static — merely not being animated yet — and freezing them leaves a
  T-posed villager the moment you walk up. Worth 1–1.5 ms if somebody marks
  scenery static at build time. A dirty-guard inside `updateMatrix` is **not** the
  answer: the guard benches at 2.4 ms against the 2.9 ms it would save.
- **581 of the frame's 1,485 draw calls are houses, for 1.4% of its triangles.**
  Seventy-five buildings at about 26 one-box meshes each, every one with its own
  material. The 15 instanced meshes draw **1,458,048 triangles in 14 calls** — the
  foliage is exactly as efficient as its comment claims, and the village is the
  opposite. Gehenna already solved this for its own houses. Doing the same for
  the village is the largest remaining win in the renderer.

### Ten minutes of running

Scene nodes 15,793 → 15,829. Geometries 11,905 → 11,928. Materials 4,381 →
4,398. Pickups 81 → 83. **No unbounded growth** — everything rises by a few dozen
in the first minute as prompts, quest marks and attack tells are lazily built,
then is flat for the remaining nine.

### A note on the instrument

Timer resolution in headless Edge is clamped to 100 µs, so per-call medians read
zero and are worthless. Every figure above comes from accumulated sums or from
**in-page A/B** — the change flipping on and off every two seconds inside one
session, so both halves meet identical machine load. That mattered: other agents
were running Edge concurrently and cross-run frame times drifted from 14.8 to
22.3 ms **for the same build**.

## 2.15.0 — The Queen's Thorn, and why the pool wakes

### The fourth relic is not a tear any more

**Reported:** *"change the fairy queen tear item to something else, as she has no
attachments to have tears."*

Which is right, and it was the loudest contradiction left in the fiction. The
Fairy Queen is the one being in this game who has it right — she is not attached
to her children, she is not looking for them, and her lines were rewritten in
2.9.2 to say so plainly: *"If not one of them came back I should sit here exactly
like this."* A tear is the single thing she would never produce, and it sat in
the player's satchel for the whole back half of the game.

It is **The Queen's Thorn** now: a black thorn as long as a finger, older than the
kingdom. A thorn is what a rose grows to hold things off, and she stopped growing
them. Her gift line needed no change and now means something better — *"This came
off me a long time ago, when I still did that."* Her follow-up is new: *"Keep it
close. It is the only part of me that ever wanted to keep anything."*

**`WORLDSTATE.relics.tear` keeps its name**, because that string is a save key,
and so do the four `["seal", "root", "warden", "tear"]` arrays, the `rb`
whitelist and `WS_SHARED`. A key written before the rename loads, relabels
itself, and shows the thorn.

### Why the pool wakes — planted on five surfaces, stated on none

**The pool wanted a second sacrifice and did not get it.** Ysolde was the first;
Maren was meant to be the second. So **saving Maren is what makes the pool
misbehave** — the player does the decent thing and takes away the payment that
was holding the door, and the whole back half of the game is the bill for one
good deed.

Nobody says it:

- **Hale in the stocks** reasons rather than raves, across seven beats — *"I was
  never out of my wits. I did the arithmetic, and then I did what it said."* /
  *"You found out who. You never once asked what for."* / *"It was not a
  witch-burning. I'll not say the rest of it in a street full of people."*
- **An eighth church page**, beside the sheep line: **THE WATER IS RISING AGAIN.
  ONE WAS NEVER GOING TO BE ENOUGH EITHER.**
- **The hermit** knows the shape and not the names — *"He fed it the miller's girl
  and it went quiet, and quiet is not the same as paid."*
- **Maren never suspects**, which is the knife: *"Every morning I get now is one I
  wasn't going to get. I'll not spend any of them frightened."*
- **The souring lines drift toward it and stop** — *"The pyre came down and the
  water came up, the same week. I'm not saying that's anything."* and a child's
  *"Da says we all did a good thing and this is the thanks."*

### Hale and the hermit, five sideways things

They were mentor and student, and nearly father and son. Nothing says so.

1. **The ledger has two hands**, one stopping mid-line and never coming back; the
   last dozen pages are the other name.
2. **A second hand in the margin** of Hale's third page: *"Then stop keeping them.
   There is a way to live with this that does not need anybody at all."* Nothing
   is written under it.
3. **A goat's bell on a nail** in the church, clapper tied off. *"Nobody in this
   parish ever kept goats."* The hermit talks to his goats.
4. **The same phrase in two mouths.** Hale's sixth page: *"I still say the hours.
   I say them walking, in the dark, on the road."* The hermit, unprompted: *"I
   still say the hours, walking. It's only a habit now."*
5. **Hale recognises something and says nothing about it** — but only after the
   hermit has given his four-relic speech: *"That is not something a stranger
   works out."* / *"He remembered it, then. Good."*

And the hermit's own ambiguity is never resolved, in his own voice: *"Letting a
thing go and turning your back on it look the same from outside."* / *"I've had
years to learn the difference and I haven't managed it."* He calls Hale *"never a
liar and never a fool."*

### Bug 121 — Every possessive item drew a packing crate after a reload · FIXED

`parseSaveKey`'s sanitiser strips `'` out of every string it loads. So the moment
a satchel has been through a save and back, its labels read *"The Kings Seal"* and
*"The Bears Heart"* — and **every one of those missed its own icon rule and fell
through to the crate.**

It was invisible in a fresh session and appeared only after a reload, which is
why it survived this long. Found because the same defect silently killed the
Thorn's own migration on its first attempt, and the probe caught it. Every
apostrophe in the icon table is optional now.

### Measured

Pickup ids **81 → 83**, and the diff is exactly the two new church props — so
nothing renumbered and every existing `picked` list is unaffected. Line
reachability driven through the real code paths rather than read: Hale 7 distinct
before a repeat and 9 once the hermit has spoken, Maren 5, the hermit's 7 musings
alternating with his relic count, and the souring pools **7/7, 8/8, 8/8** over
forty thousand calls per band. A key written with the old label parses,
`relics.tear` is still true, and the satchel shows the Thorn.

### Still open, pre-existing

`church:hale7` draws a crate. Its text says *"Scratched into the back of the
altar"* and the carving rule lists "scratched in the stone", "cut in the stone",
"carved into" and "scratched on the wall". The new eighth page is worded to hit
the rule; the seventh still is not.

## 2.14.0 — A boss with no attack, and a log worth reading back

### The Almoner

The first of Gehenna's three bosses, and the first fight in the game that cannot
hit you. He is the almshouse's relief officer, doing his rounds.

**He has no attack state at all.** Measured across a whole fight: **zero calls to
`hurtPlayer` and zero to `enemyStrike`**, both wrapped and counted. He is
invulnerable while he is healing *you* — 25 ordinary blows and 25 heavy ones
during `mend` moved him from 300.000 hp to 300.000 — and vulnerable only while he
kneels over one of the Attached to unburden them. Every blow you land is struck
into a hand reaching for somebody else.

Phase 2 at two thirds puts his cart between you and him, and the roofs become the
only answer. Phase 3 at a third: he kneels and does not get up again, and the
last seventeen seconds of the fight have no combat in them at all.

**Standing still does not kill you. It costs you all four people.** Fifty seconds
of refusing: hp 8.000 to a minimum of 8.000, no damage taken, all four still
seated — and then he follows you up the road, healing you, and never blocks it.

Measured: phase 2 fired at hp 196.300 of 300, phase 3 at 95.9–97.5. The heavy
interrupt stuns for a measured 1.457–1.484 s against a specified 1.4. The reward
survives being re-granted twice. **+12 scene nodes** against a 500 budget, and
frame time indistinguishable from the build without him — 10.5 ms median against
10.6, p95 12.6 against 14.2.

### Bug 119 — A living Gehenna boss could be teleported into the valley · FIXED

`updateEnemyTells` relocates a distant boss to a ring around the player, and its
depth guard is on **the player's** height rather than the enemy's. In the couple
of seconds between surfacing and teardown, a living Gehenna boss therefore scores
as "more than 55 m away", gets moved to a valley position computed from
`terrainH`, and is set to `state = "chase"` — a state its switch has no case for,
which is the exact freeze that stranded the Drowned Warden in a hillside in 2.5.0.

**This is a live candidate for the unexplained "glitched from Gehenna back to the
overworld" report, approached from the other side** — not the player being moved
up, but the world below being moved up around them.

### Bug 120 — A guest could not hurt anything in its own Gehenna, and its blows landed in the host's valley · FIXED

Since 2.11.0 a guest simulates its own Gehenna. But `damageEnemy`'s guest branch
still reported **every** blow upward by `e.nid` — and nid sequences are assigned
per peer, so the host matched the number against whatever valley body happened to
share it, while the guest's own Gehenna took no damage at all. The Kindly One was
**unkillable from the guest side**, and a guest swinging underground was quietly
damaging something on the moor.

It now resolves locally below the seam and reports nothing, which is the same
realm rule `netEnemySnapshot` and `nearestPlayerTo` already carry. The HUD boss
bar got the same test, because it was chosen on 2D distance alone — a player
standing at (600, 600) on the moor could read a Gehenna boss's name and health.

### The dialogue log, on `L`, and worth opening

**Reported:** *"in case the player misses a beat of dialogue and wants to listen
to it back or read what was said."*

`L` opens the log alone, full width. `J` still opens the whole book. Pressing the
other key switches rather than closing; pressing the same key closes. Escape and
P close the book instead of pausing behind it, and there is a `LOG` button beside
`MAP` on touch.

It does not look like the rest of the book any more: bone blocks with near-black
bold type, gold name tabs welded above each line and skewed with the letters
counter-skewed upright, panels set a degree off square with alternating insets so
they overlap, the world's narration as dark bronze-ruled slabs, a diagonal stripe
field in the header, and a staggered slide-in on the first fourteen entries.
**No purple** — bone, gold, bronze and ink. Reduced motion is honoured.

The cap is 400 now rather than 200, dropping the oldest, and every entry carries
the in-world clock with a real-time "ago" tooltip. **400 entries render in 11 ms.**

**It stays runtime-only and the code says why:** four edits to carry it, and a few
hundred lines of prose would dwarf a key that people paste by hand.

### Three logging bugs found while building it

- **Every story line by a named speaker was logged twice** — once attributed by
  `speak()` and once as narration, because `say(story = true)` logged it again
  reading `"Name: line"`. That hit the King, Hale in the stocks, and every story
  NPC.
- **Gehenna had no attribution at all.** `gsay` passed `"Name: line"` as a single
  string, so the entire after-story landed under a blank speaker.
- **Choices were invisible.** The question and the player's answer both go in
  now, the answer tabbed as *You*.

Also: the HUD painted over the book at phone width, and the three-page view showed
three unreadable slivers instead of stacking.

### Claims from the boss design that did not hold, checked in the code

- *"No boss in this game has ever had a health bar."* **Wrong.** `updateHealthBar`
  hides the floating over-head bar for bosses, but there is a separate **HUD boss
  bar** that shows for any living boss within 60 m. The Warden and the Kindly One
  both have one. It matters most for the Unclaimed, whose whole premise is that
  its tier *is* its health bar and that no subtitle ever names the rule — a live
  220-hp bar undercuts that, and it is a decision still to be made.
- *"`netApplyEnemies` has no EXTRA reconstruction path whatsoever."* The
  conclusion was right and the reason was wrong: there is an EXTRA loop, and it
  carries an explicit whitelist of wolf, wraith and warden. Unknown kinds are
  dropped rather than mirrored.
- *"`dashCost` is never written by anything."* The Great Fairy's Petal Step
  already writes it, so the Unclaimed's reward is a **no-op for any player with
  fifteen fairies** — still safe, still idempotent, and worth less than intended.

### Known, and needing a decision

**Gehenna's houses have no interiors.** They are three `InstancedMesh`es plus one
solid box each. The Almoner's design calls for the door of his house standing
open with a bed, a chair and a comb inside — and the Matron's design puts her
room, with twenty-eight names cut into the wall, in one of those same houses.
That room is the strongest single piece of writing available down there and it
currently has nowhere to be.

`insideInterior` cannot be reused: its table is keyed on x and z with no depth
routing, so an interior registered at Gehenna's coordinates would also be a hole
in the moor at (646, 610). The answer is four thin wall structs with a doorway
gap — all axis-aligned, so `resolveStructs` having no rotation field does not
matter — and the contents as plain meshes. Contained work, but arena building
rather than combat, so it was correctly left rather than half-built.

## 2.13.0 — Goblins wade, Nim walks the roads, and the gem is on the ring

### Bug 116 — The gem was floating above the ring · FIXED

**Reported:** *"fix the ring texture so the gem is actually on the ring."*

A parenting mistake. The bezel and the stone are added as **children of the
band**, so their positions are in the band's own frame — and they were being
given the band's world height *and* its tilt a second time. The torus lies in its
local xy plane with radius 0.17, so the top of the band is at y 0.17 and
everything should sit on that with no z offset and no rotation of its own.

**Measured**, with the band's own base as the datum, since it does not move:
the stone's centre was **0.212 m above the top of the band** and is now **0.001 m
above it** — resting on the band rather than hovering a ring's diameter over it.

*A note on how that was measured, because the first attempt was wrong.* The
probe used `Box3.setFromObject(torus)`, which **traverses children** — and the
stone is a child of the band, so it was always inside the band's own box and the
check said "set" in both builds. The band's *bottom* is unaffected by its
children, which is why the comparison above uses that instead.

### Bug 117 — A goblin met by an ankle-deep brook froze forever · FIXED

**Reported from play**, and worse than reported. `move()` rejected every step
where `isWater()` was true, and the valley's channels are about **3.4 m wide and
0.3 m deep**. Measured on the shipped build: a goblin starting 15 m away across a
brook spent **385 of 400 frames completely motionless**, and never got closer
than 10.3 m.

Now it wades. `goblinFooting` accepts dry ground, bridge decks — resolved through
`groundAt` rather than `terrainH`, so a goblin stepping onto a deck is not
dropped into the river — and water up to 1.2 m, carrying the footing height
forward. A deflection fan with hysteresis opens only once a goblin has been
getting nowhere for a moment, so an ordinary chase is still a straight line. A
goblin genuinely beaten by deep water now **balks**: it turns round and walks off
rather than grinding against the bank forever.

| | before | after |
|---|---|---|
| Goblin across a river, bridge 84 m off | frozen 385/400 frames, closest 10.3 m | wades in, closest **2.6 m**, attacks, 0 frames above the waist |
| Bridge 164 m off | frozen 399/400, closest 8.7 m | closest **2.8 m**, attacks |
| On dry ground (control) | closest 2.7 m | **closest 2.7 m**, unchanged |
| Deep water, no bridge in reach | slid sideways forever, 72 m walked, no progress | **3 balks**, longest stall 0.65 s |
| Goblin King across a channel | — | closest **3.3 m**, reaches windup |

### Bug 118 — Nim never reached the river to cross it · FIXED

The report was that she walks through water. What she actually did was **circle
in a 13 m loop at her spawn for twenty-five seconds and then teleport 703 m in a
single frame.** The lerp fallback everyone suspected was never reached: `step()`
was succeeding every frame while she orbited a lake shore that sits directly
between her and Thornback.

She follows a road graph now — `ROADNET`, built over the existing `polylines` at
the same worldgen stage that already says "Learning the roads…". Every bridge in
the valley was built under a road, so a road route crosses water dry.

**Measured: 2,037 m walked home in about 400 s, 0 frames in water, 0 frames sunk,
and 606 frames standing on bridge decks.** Her route is the one a person would
walk: out of the wood, west to the elder lane, up through the south gate, across
the kingdom, out the north gate, round the ring road, over two bridges, and up
the spiral into Thornback. All 165 villagers were re-measured over a day and a
night and match the baseline exactly.

### Two things deliberately not done

**`riverAt`, `riverDist` and `isWater` are untouched**, and no worldgen placement
moved — so no `addPickup` id shifted and every existing save key still loads.
Bug 100 stands as written.

**`roadNetBlocked` leaves the graph in five connected pieces rather than one.**
The ring road is drawn as a straight line between two mountain villages and
**runs clean through the kingdom's curtain wall**, and the elder-tree lane is a
stub whose only connection to the valley is through the town's two gates. Nodes
standing in a wall away from its gates are dropped, which fragments the graph.
Nim's route resolves and every village spiral tested resolves, but **a route to
all eight villages was not verified.** Dropping *every* blocked node instead
shatters it into nine pieces and leaves Nim no route at all, which is why the
test is narrowed to walls, and the code says so where somebody will find it.

### A patch-format trap worth recording

Three of the ten blocks in this patch were headed *"insert the replacement
immediately BEFORE this line"* and *"new text, then the anchor line unchanged"* —
and **none of the three actually repeated the anchor line.** Applied literally,
each one deleted the line it promised to keep, including the whole
`function updateGoblins(dt) {` header. The build failed with
`Unexpected token 'const'` **five hundred lines further down**, which is where the
parser finally gave up rather than where the damage was.

It was found by comparing running brace depth against the unpatched file at a
shared landmark: depth 2 before, depth 1 after. That check costs nothing and
points at the right region immediately, where the error message does not.

## 2.12.0 — The hush never happened, the mourners never went home, and subtitles wait for the voice

### Bug 113 — Beat two of the 3.0 chain was dead code · FIXED

**The Warden dies and nothing happens.** No "She goes under. Not onward — under",
no `Music.silence`, no crickets, none of the three hush lines, no accelerated
daybreak, and the pool stone never relit.

`killEnemy` sets `e.alive = false` and `WORLDSTATE.wardenDead = true` **in the
same synchronous call**, and the transition that owns the whole of beat two tests
`finaleStarted && !WORLDSTATE.wardenDead && WARDEN && !WARDEN.alive`. That
condition could never be true. It has never run once.

And because that line is the **only call site of `releaseWatchers()` in the
file**, it took the children with it: `gatherWatchers()` does run, so the four
village kids really are moved to the pool with their homes overwritten, `stay`
and `post` set and `job = "idle"` — and then nothing ever released them. They
stood at the black pool with no jobs for the rest of the session.

A runtime one-shot owns the presentation now. The flag keeps being set exactly
where it always was, so nothing that reads it changes behaviour.

### Bug 114 — The burial retired every villager who mourned · FIXED

**Reported by four independent sweeps, and confirmed by reading both ends.**

Recruiting a mourner writes **six** fields: `mourning`, `stay`, `post`,
`job = "idle"`, `target` and `work`. Releasing them cleared **two**, under a
comment that said in so many words *"the two flags this clears are the only two
it ever set."* It was wrong by four.

With `job` left at `"idle"` the villager work state machine is unreachable —
`} else if (!n.fight && n.job !== "idle" && n.kind === "villager") {` — and **no
line anywhere else in the file assigns a job after worldgen.** So every villager
the player passed within 16 m during the carry stopped working permanently:
washers, gatherers, woodcutters, water carriers, wagoners left standing in the
street with their carts, and the two town hunters who shoot goblins at night.

**Maren is genuinely caught.** `freeMaren` gives her `job = "gatherer"` and a
home 13.6 m from waypoint seven of the procession route.

`mourning` was never cleared either, so nobody could be recruited a second time.
The state is stashed on recruit and restored in full on release.

### Bug 115 — A guest could be left permanently unable to lift or bury her · FIXED

`ysoldeLifted` travels over the wire; `P.carry` deliberately does not. So a guest
takes the flag off a peer, their copy of the body is hidden where it lies, and
they are not carrying anything — which is correct while the host is there.

If that host then quits, `netDrop` makes the ex-guest a solo player, and **both
doors are already shut**: the lift refused because the flag was set, and the
burial refused because `P.carry` was false. The main quest sticks on "Carry her
through the kingdom" for the rest of the session, and Gehenna with it.

The gate tests `P.carry` now instead of the flag. She is also made visible again
for anybody left holding that flag alone, because otherwise they would have been
standing over an invisible body with no reason to press anything.

### Subtitles wait for the voice

Reported from play: a slow speaker outlasts their own subtitle.

`say()` returns a handle with three hands — a **floor** (the character-count
estimate, which is also the whole clock when there is no voice), a **hold** the
utterance takes until the browser fires `end` or `error`, and a **cap** so a
stuck speech queue cannot pin a line on screen.

**Measured in a real browser voice at rate 0.6: the utterance ended at 7,178 ms
and the subtitle now lives 7,217 ms. The old estimate pulled it at 4,730 ms** —
two and a half seconds of someone talking to an empty screen.

**A pre-existing bug fell out of it.** `Voice.stop()` called a bare `cancel()`
without bumping the generation, so the chain stayed alive: pausing mid-line
silenced the current chunk and then **spoke the next one over the pause menu**.

### Autosave, done honestly

No new save state. It stores the existing `makeSaveKey()` output verbatim in
`wildmoor.auto`, so the four-edit rule has nothing to catch, and **every write is
proved through `parseSaveKey` before it commits** — a key that will not read back
leaves the previous autosave standing.

It fires on waking from a sleep, an errand completing, opening the pause menu,
leaving the page, and a three-minute backstop. It **refuses**, and the pause menu
says which, during the Gehenna descent (the `P.gehDive.rim` precedent), during
death, during sleep, with a choice open, under `inputLock`, during the Warden
fight — because that fight pins `dayT` to 0.75 and the key would record a time
the clock never reached — and for any session that has ever been a guest.

The title screen gets **Continue**, with the save's age and the reason it was
taken, and disabled with the reason written underneath when there is nothing.

**A real multiplayer bug came out of that guest rule.** `applyMainProgress` folds
the host's story into the guest's own globals, and when a host drops `NET.role`
goes null — so the next write would have put a run the player never played over
their own. The guest state is latched now and never cleared.

### Housekeeping

Three mid-line `//` comments that landed in 2.11.0 are moved onto their own
lines. They swallowed nothing, and the rule exists because the ones that do look
exactly like the ones that do not.

### Refuted, and worth recording

A reviewer reported that the debug save key stopped loading in this build. **It
loads.** The Continue button moved `<body>` nine lines down the file, and the
test harness injected its localStorage stub at a hardcoded line number that now
lands inside a `<style>` block. The harness reads the `<body>` line out of the
file now rather than assuming it.

## 2.11.0 — The descent was impossible, the glitch is found, and Gehenna has a map

### Bug 108 — The whirlpool could never pull you down · FIXED

**The blocker, and it was arithmetic rather than tuning.**

The swim volume lerps you back to its rest height at **six times the remaining
gap** every frame. The whirlpool pulls down at a flat **1.9 m/s**. Those two
balance at `rest − 1.9/6 = rest − 0.317`, which at the black pool is **y 3.53** —
and the dive trigger needs `bed + 0.9`, a further 0.33 m below that.

Measured on the shipped build: **the body sat at y 3.6 for eleven seconds and
then drowned, every time,** unless the player also held the sink key. The
descent was not finnicky. It was unreachable, and it had been since 2.8.1.

A current now suppresses the float target for the frame it has hold of you.

### Bug 109 — "I glitched from Gehenna back to the overworld" · FOUND AND FIXED

Reported from play with no idea of the cause, and none of the suspects was it.

`swimVolAt` falls through to `SEA` for anything it does not recognise, and `SEA`
is **a fact about the valley**: its deep test reads `terrainH` — the ground two
hundred and eighty metres overhead — and its rest height is −0.8. About **0.4% of
Gehenna's walkable footprint lies under a valley lake bed**, and standing on one
of those patches put the player in the valley's water.

Reproduced at (576, 510): standing on Gehenna's floor, the body went **−279 to
−197 in half a second**, at which point `guardPlayerPosition` did exactly its job
and "recovered" the player to the valley spawn. The guard was the symptom, not
the fault. A dry sentinel below the seam closes it.

### Gehenna has a minimap, and it is a different world

2.9.2's stopgap was `mm.style.opacity = 0` — it hid the map, so you navigated a
strange town with nothing. There is a real second sheet now, painted from `gehH`,
centred on the middle of the street (Gehenna is a **street**, not a disc), with
the houses, the road, the yard and the hill read out of `GEH_L`, and the way up
marked. It swaps on depth, swaps back cleanly, blacks out during the shaft, and
builds in **3.7 ms**.

**Peer arrows are drawn for the first time** — they were never on the minimap in
either world. The realm test is deliberately **three-way**: `-1` below, `0` in
the shaft, `1` above. A two-way test calls a player mid-descent a valley player
standing at (600, 600), which puts their arrow in the bottom-right corner of the
valley map — **the exact thing that was reported**, for the three seconds the
shaft spends between −200 and −60.

### Gehenna is lit, properly

The shipped lighting measured **5.5 out of 255** in the worst direction, darker
than the placeholder it replaced. `GEH_HEMI_SKY` was near-black, and a
hemisphere's **sky** half is what lights upward-facing surfaces; `ambient.color`
was still the water's dark mauve, so raising ambient intensity alone did nothing
at all. Four constants. The street now reads **36–48 whole-frame with a 43–56
ground band**, strongly red — valley daylight is about 216 for scale.

Worth writing down for whoever tunes it next: the ground is
`MeshBasicMaterial({ vertexColors: true })` with its shading baked in, so
**ambient and hemisphere light cannot touch the floor at all.** The arrival dish
stays dark because `DEEPC` is baked into it. The lever is the bake, not the light.

### Bug 110 — A guest got no Gehenna at all · FIXED

`updateExtraEnemies` returned unconditionally for a guest after mirroring the
host's enemies. Nothing below the seam is ever broadcast — deliberately, because
`gehSeed` is not shared and a guest who dives is standing in **a different
Gehenna that the host has never built**. So a guest got no AI down there
whatsoever: the Attached frozen where they spawned, and the Kindly One's body
standing still while her entire after-story ran on around her.

A guest now falls through and simulates its own Gehenna, and skips anything above
the seam so it can never fight the host's positions.

### Bug 111 — Enemies chased players in the other world · FIXED

`nearestPlayerTo` compares with `dist2D`, which knows nothing about depth. Gehenna
sits at (600, 600) **inside the valley's own bounds**, so a friend standing in the
valley can be closer in x and z to a Gehenna enemy than the person actually down
there — and that enemy walks off after somebody 280 metres above its ceiling. The
same two-realm test the enemy snapshot already used, applied where the chasing is
decided.

### Bug 112 — Every guest was told there were two players · FIXED

A guest's `NET.peers` only ever holds **one** entry — the host, keyed `"host"` —
so counting peers and adding one reported **"2 players"** to every guest in every
session, regardless of how many were actually in it. Three status lines said it.

**This is almost certainly why the game reads as two-player from the outside.**
It is a display bug and it never was a limit: the only numeric cap on players
anywhere in the file is `NET.avatars.size >= 8`, and the local player is excluded
one line above it — so the real ceiling is **eight guests plus a host, nine
people.** That 8 is not a design decision either; the comment above it says what
it is, which is a flood defence against one peer spamming `hello` and building a
character mesh and a canvas nametag every time.

### What is still true about multiplayer, and is not fixed here

- **Gehenna is not co-op at any player count.** Nothing below `DIVIDE` is
  broadcast, by design. Two people under the seam see each other's avatars over
  **different worlds built from different seeds**. Nine in the valley, one below.
- **STUN only, no TURN.** A guest behind symmetric NAT cannot connect at all and
  gets no fallback, and that is an independent chance of failure per guest.
- **The join race.** One retained offer and one `NET.pending` slot: a second
  answer to the same offer is discarded silently, and `NET.joining` is only ever
  cleared by pressing Join again — so the loser of the race sees nothing at all,
  not even the eight-second failure notice, which is itself gated on that flag.
  Left alone deliberately: it cannot be tested here without two browsers and a
  live signalling board, and a wrong fix breaks joining for everybody.

### A process note

One verifier in this investigation **refuted the existence of PvP** on the
grounds that `grep` found no `t: "hit"` message. It is there, at one site, and it
is reachable from the ordinary weapon swing, the dive and the air slash. The line
is over four hundred characters long, and the `awk -F: 'length($0)<400'` filter
this project mandates — to keep the bundled three.js line out of a grep — **had
deleted the evidence.** Two other verifiers caught it and one did not.

The filter is still right, and it now needs a caveat: a negative grep result
under it is not proof of absence. Re-run without the filter, on a named line
range, before concluding that something does not exist.

## 2.10.0 — She goes in the ground, and 3.0 is reachable

**This is the build where the update stops being unreachable.** `ysoldeBuried`
has been read in three places and set in none since 2.8.1, so on a fresh save the
main quest stopped dead the moment the Warden died and the whirlpool never
appeared for anyone who had not hand-edited a key.

### The chain, in eight beats

1. **The hush.** Her death pulls every music channel to zero and pushes the
   schedulers forward so nothing bursts back in. Crickets every half second to
   one and a half. Three lines, at 4.5, 9 and 13.5 seconds. Nothing hurries you.
2. **The lift.** E within 4.4 m of her body, which has been face down in that
   water since Act II.
3. **The carry, and it is visible.** She lies across the shoulders, face down,
   arms hanging. She is **not parented** to the hero, because `rebuildHero()`
   would take her with it; she is driven from the player transform each frame
   after it resolves. Carrying is 4.03 m/s against a 6.5 walk, and running,
   jumping, dashing, sliding and every swing are refused. Blocking is left to
   you. Goblin spawns are suppressed while you are carrying her, and beds refuse
   you.
4. **The procession.** Eleven waypoints through `routeGuide` — the rear gate, the
   north avenue, the east street past her father's door, the plaza, the stocks,
   the great avenue, the front gate, the grave. Villagers within 16 m stop, turn
   and speak, drawn without replacement so nobody repeats. Hale's five lines arm
   at 18 m; the miller's four at 16.
5. **The grave**, already dug, outside the south gate on ground that is exactly
   `PLATEAU`. A banked pit, a spoil heap, a spade, a blank headstone. Only the
   headstone is a collider: `addStruct` has no removal, so a pit-sized one would
   have been an invisible step in the grass after the mound closed.
6. **The burial.** E at the graveside. `ysoldeBuried`.
7. **The King**, who asks you to rest.
8. **The sleep**, which sets `gehUnlocked` and turns the pool.

### Bug 102 — The main quest dead-ended the instant the Warden died · FIXED

The last objective was *"Decide, at the stone by the pool, what becomes of the
valley"*, completing on `WORLDSTATE.ending`. `ending` is set only by
`endTheStory()`, called only by `chooseEnding()` — **which had no callers at
all**, because the three-option ending was removed at the author's request and
the objective was left behind. The tracked objective and the guide arrow pointed
at the pool for ever. The chooser and the objective are gone; `applyEndingWorld`
and the `ending` guards stay for saves that already carry one.

### Bug 103 — The E prompt would have been lit permanently for the whole carry · FIXED

`anyInteractableNear` matched the `"body"` NPC in its generic loop. `BODY.pos`
follows the player during the carry, so the prompt would have sat on screen from
the pool to the grave. `interact()` already excluded her; the prompt did not.

### Bug 104 — Daybreak started on the frame she died · FIXED

`dayBreak = 22` was set in the death handler, so the sun began running up through
the one moment in the game built to hold still. It is set at the end of the hush.

### Bug 105 — The Warden's throw never reached the player · FIXED

`enemyStrike(e, dmg, tgt, kb, pierce)` computed both and then called
`hurtPlayer(dmg, e.pos)` with two arguments. The **networked** branch forwarded
`kb` faithfully, so her 2.1× launch reached a friend across the wire and never
once reached the player standing in front of her.

### Bug 106 — The lash a dodge cannot answer could be dodged perfectly · FIXED

A pierce blow skips the Flurry branch and lands in `hurtPlayer`, whose first line
returns on any invulnerability at all. So rolling through a pierce blow took
**zero damage** — it removed the Flurry reward and left the immunity, which is
the exact opposite of what it was for. Pierce now ignores the 0.32 s a roll
grants and still respects the 0.9 s after an ordinary hit, so it cannot
chain-stun.

### Bug 107 — Hunter arrows flew nose-down, and 2.8.2 is what broke them · FIXED

2.8.2 added one `rotateX` to both projectile systems. The goblin's arrow is a
bare cylinder mesh, `lookAt` genuinely throws its turn away, and it needed the
line. **The hunter's arrow is a Group whose two children already carry the
turn** — the shaft at `rotation.x = π/2` and the head at `(0, 0, 0.55)` — so the
group points along its own +Z and `lookAt` was already the whole answer. The
added line maps +Z to −Y and flew every hunter's arrow broadside to its own
flight. Two different shapes, two different answers, and the same-looking line.

### Save and multiplayer

Three new flags with all four edits each. **Saving mid-carry restores the
carry** — leaving her at the pool with the flag set strands the chain, and
clearing the flag hands back a body that has already been lifted. The lift and
the burial are **host-only**, like the finale; a guest is told what happened and
their copy of the body is hidden, which is why a guest can never end up holding a
second one.

### Measured, not assumed

Ground at the grave 8.000 against a `PLATEAU` of 8.000. Route 351 m, about 87
seconds at carry pace, no waypoint off the ground. The arrow's waypoint index
across a walked route: 1,2,3,4,5,6,7,8,9,10,10 — one advance per leg, ending on
the grave. Nearest approach to Hale 2.5 m and to the miller 7.8 m, both armed.
Carry offset x −1.61, y +2.20, z +0.30 against a body 3.45 m across the
shoulders. Twenty-four draws from a pool of eleven gave eleven distinct lines
before any repeat. Stage progression 19 → 20 → 21 → 22 → 23 → 24, where it used
to stick at 19 for ever.

### Not measured

**How it looks.** Headless has no eyes. The carry pose, the pit reading as a
hole rather than a bank, and the mound are geometry placed from measured bounding
boxes and not from a screenshot. One visual pass is wanted.

## 2.9.3 — A church you can see from the road, and a save structure nobody was checking

### The abandoned church is rebuilt

**Reported twice**, the second time as "it is clear the church changes have not
been implemented yet either" — because they had not been.

- **Bigger.** Interior 10.4 × 19.2 m becomes **14.8 × 28.8 m**; the wall head
  goes 6.2 → **13.2 m**; the volume is 4.5 times what it was. An arcade of eight
  free-standing piers with walkable bands, seven pilaster buttresses, a chancel
  raised on three steps behind a 7 m arch, a west gallery, crow-stepped gables.
- **Every rung of the climb is one base jump.** Ramp → gallery at 5.70 → band at
  8.40 → beams at 11.07 → wall head at 13.20 → lead flat at 15.40 → gable at
  19.50: the largest single step is **2.70 m against a 2.75 m standing jump at
  agility zero**, probe-confirmed rather than eyeballed.
- **A cross, twice.** A 7.4 m relief cross in dark stone on the west front, and a
  free-standing finial cross on the gable apex topping out **26.1 m above grade**.
  A cross-shaped *plan* was considered and rejected in the code: `interiors`
  holds exactly one rectangle per room, so a transept either swells the room box
  out over open grass or splits the church into two rooms — and a plan cross only
  reads from above, which is the one place the player never is.
- **Further out**, r 102 → **132**, on the same bearing, which is found by
  re-running the old search verbatim and then confining the real search to a 24°
  wedge around its answer — so it stays seed-general instead of being pinned to
  this world's numbers.
- **The chancel sill that blocked by eleven millimetres in 2.5.0 is gone for
  structural reasons rather than by adjustment.** The rule now is that no fabric
  is shorter than 2.0 m above its floor and every collider top matches its own
  stone's top. That sill is 4.8 m of real masonry with a 2.71 m margin.
- Hale's seven pages, which landed from another agent while this was being
  built, are preserved with their ids and re-placed along the longer nave —
  `±4.3` put four of them inside arcade piers. All eleven readable pages in the
  building are reachable, checked by probe.
- **Save-safe, proven rather than asserted:** the pickup id list is byte-identical
  before and after, 74 ids diffed.

### Bug 100 — `riverDist` has never been a distance function · DOCUMENTED, NOT YET FIXED

Found independently twice today, from two directions, with the same conclusion.

`riverAt(x, z, w)` gates on `d < (sg.w || w)`, and **every segment
`riverRegister` writes carries its own `w`** — 3.4 or 4. So the caller's width is
dead. `riverDist` asks for 40 and gets 4. It returns either a number under 4 or
`1e9`, which means **`riverDist(x, z) < 26` has always been an exact synonym for
`isWater(x, z)`**, and so has `< 45`, and so has `< 8`. The single-cell grid
lookup caps the true reach at about 24 m in any case.

Four worldgen call sites read it — the terrain paint at 2654 and 2673, the
scatter at 3606, and the footstep material at 10131 — and every one of them has
been running with a keep-clear radius of four metres where it asked for
twenty-six or forty-five.

**It is deliberately not fixed in this build.** Those four sites decide *where
things are placed*, and `addPickup` numbers implicit ids by array position, so
correcting the radius moves the scatter, renumbers the ids and **invalidates
every save key in existence**. It is a major-version change with a migration,
not a one-line fix at one in the morning. The church's own siting test does not
use it: it scans every chain segment exactly and sweeps its footprint, and
measured its site at **587 m from the nearest centreline**.

### Bug 101 — `STORY` went into the game unchecked · FIXED

`parseSaveKey` walks `ws`, `owned`, `fairy`, `custom`, `found`, `items`, the
discovery ids and the pickup ids. It did not walk `story`, and `applySave` does a
bare `Object.assign(STORY, d.story)` — so a key could put a string where a
counter goes, an object where a boolean goes, or any number of fabricated keys
onto the object, and the first code to read one would throw mid-frame.

It is validated like `ws` now, including the five runtime fields that hold
baselines captured when a village errand is taken. Those needed reading rather
than guessing: `wager0` is a two-element array and `weaver0` is a **JSON string**,
either of which a blanket numeric guard would have rejected — turning a hostile
key into a rejected legitimate one.

### The debug key is consistent now

The bundled `DEBUG_SAVE.txt` was internally contradictory: `gehUnlocked` true but
`ysoldeBuried` absent, so the whirlpool it promised stayed shut, and
`bearDefeated` true with `bearDead` false, so the Old Bear was marked killed and
still standing in his cave.

It is replaced by a key generated from the save editor's own endgame preset and
verified by loading it: **14 hearts, every skill at 30, all four relics, 25
fairies, 14/14 errands, 13 discoveries, `ysoldeBuried` and `gehUnlocked` both
true**, arriving at the foot of the elder tree with no console warning. It is
tracked in the repository now rather than ignored.

### The changelog had a six-version hole

2.7.0, 2.7.1, 2.8.0, 2.8.1, 2.8.2 and 2.9.0 were written as commit messages and
never reached `CHANGELOG.md`, which ended at 2.6.0 while the build called itself
2.9.2. Backfilled from the commits themselves.

---

## 2.9.2 — The story, written to the theme

Twenty-seven edits. Dialogue only; no system changes, no save-format changes.

### Ysolde is gone from Gehenna

She was on a bench down there, wearing the Warden's bob, and she told you her
name. That is the opposite of what the theme says happened to her: killing her
did not send her onward, it unmade her, and **her absence is the horror**.

The bench slot survives, because the machinery expects a speaker registered as
`bench` and removing it was far riskier than changing who sits on it. The
occupant is now **a rope seller from three hundred miles away who has never
heard of her**. Every line of hers is gone, along with the `bob` branch, the
`revealed` field, and the stale line about being buried under the elder tree —
stale twice over, since the grave moved to the front of the kingdom.

**The absence is delivered by the Clerk instead, as a filing problem**, which is
the only register in which it could be borne:

> "I have every last person who ever held on to her. They're all here."
> "I do not have her."
> "There's no page. There isn't a blank page. There's no place a page would go."
> "You didn't send her on, love. You put an end to her."
> "I'm not accusing you of a thing. I'm reading you what's on the paper."

### The reveal is aimed at the player, not the character

Per the correction to the brief: the character **has always known** they were a
king who walked away; the player has not. So nobody in Gehenna informs them of
their own past. The rope seller recognises them — *"Ha. It's you. I've had that
face in my hand — the little silver one, from off east."* — and when they flinch,
*"Don't look like that. Half the country had you in a pocket."*

What **is** news is that they are failing, and they do not take it:

> "You'd have got there. You stopped to help. You will not get there now."
> "You're not taking it. I can see you not taking it, and I'll not say it twice."
> "You kill, love. Gently, and for good reasons, and you kill."
> "I've nowhere to file that either. I have decided not to mind."

### Hale's story is in the church, in his own hand

Seven new pages, laid door-to-altar in writing order: the measurements, the
letters to the See that nothing ever answers, the moment the question changes —
*"I asked why He is silent. The answer is that the house is empty… we have all
been keeping the hours for nobody"* — the arithmetic that follows from it, *"If
no one is holding the door, then somebody must pay the rent. I will begin with
the sheep"*, the emptying of the church (*"I emptied the font last. I could not
make myself pour it on the ground, so I drank it."*), and *"This is what faith
turns into if you leave it out in the weather."*

Scratched behind the altar, by somebody lying flat on the flags to reach:
**A SHEEP IS NOT A PRICE. IT WAS NEVER GOING TO BE A SHEEP.**

His one line in the stocks became four states, including the first one after the
burial: *"They put her in the ground. I heard the spades from here, and I was
glad, and I have no right to be."*

### The Fairy Queen is inverted

She used to grieve and count them and call it the price. She is the one being in
the game who has it right, and the game still never says so:

> "No, I am not looking for them. I stopped looking a very long while ago."
> "If not one of them came back I should sit here exactly like this."
> "Why did I ask you, then. Because they are small and the valley is large."
> "There is nothing on me for them to take. Do not admire that."

She names what is wrong with the player exactly once — *"You catch on
everything, dear wanderer. On everyone."* — and refuses to help: *"I am not
telling you to stop. I would not know how to begin."*

### Also

Two reputation pools wired to `bearSlain` and `manyFairies`, which `repTags()`
has been computing since 2.0 and nothing has ever read. Narration for leaving
Gehenna early, which was silent.

**One bug found and fixed inside the patch:** the early-leave beat fired *during
the descent*, because the dive spends six seconds above `DIVIDE` with Gehenna
already built underneath, so a bare `y > DIVIDE` test spoke over the arrival.

### Still true, and it is the one thing in the way

**Gehenna is unreachable in normal play.** `ysoldeBuried` and `gehUnlocked` have
readers and no writers: the burial chain does not exist in code yet. Everything
above the seam — the church, Hale, the Queen, the reputation pools — is live
today. Everything below it lights up the moment those two booleans get set.

## 2.9.1 — A save key can name a place, and the Ledger can be reached

### Bug 98 — A hand-made save key teleported you to the opening moor · FIXED

The save editor writes an x and a z you clicked and a y it has to guess. The
game took that y literally, and `guardPlayerPosition` treats a body more than
eight metres under the ground it is standing on as a body inside the world: it
warns and puts you back at the last safe spot, which on a fresh load is the moor
you started the game on.

**Measured.** A key that named Highreach — `pos = [-440, 8, -200]` — loaded, and
the player woke at `0, 8, 40`. The ground at Highreach is **113.92 m**, so y = 8
was a hundred and six metres inside a mountain. The key was not corrupt: decoded
side by side with a key the game wrote itself, both carry `v = 4` and the
identical thirty-four field names, and the editor's payload held exactly what was
clicked. The position was right the whole way down the pipe and then thrown away
on the last frame.

**Fix, on the loader.** A restored position that lands more than eight metres
under its own ground is lifted on top of it, using the guard's own eight metres
and the guard's own cave exemption so it can only ever fire where the guard was
going to fire anyway. It asks `groundAt` about **the height the save names**
rather than about the top of the world — with `1e9` the first version of this
lifted a body standing at the foot of the elder tree **127 m up onto the
canopy deck**, which is how that hint got fixed before it shipped.

Measured after: Highreach loads at `-440, 114, -200` with the snap logged and no
recovery; the foot of the elder tree loads at `0, 14, -175` with the snap silent;
a key the game wrote itself is byte-for-byte unaffected.

### Bug 99 — The Ledger, the payoff of the whole after-story, was unreachable · FIXED

`summonKindly` registers the Kindly One at **exactly** the Clerk's position.
2.9.0 fixed the original dead end — the Clerk won every tie, so the Kindly One
could never be spoken to — by making the nearest-speaker scan keep the **last**
candidate on an exact tie. That fix created its mirror image: after the fight she
**still won the tie for ever**, so the Clerk could never be selected again, and
`clerkAfter()` is where the names are read back and where The Ledger is granted.

Measured on a full headless playthrough: the story's own closing line prints —
*"The Clerk is waiting at her desk with a blank page."* — and then **sixty-one
presses at that desk returned "The Kindly One: …" and nothing else.**

`bossDown` now sets `leaving` on her, the flag the module already carries for a
speaker who is not there any more; it drops her from the interact scan and hides
her prompt in one move. The `tick` snap branch that also declares the story
finished gets the identical clause, because those two loops are the two places
that say "the after-story is over" and they have to agree. After the fix: **the
Ledger is granted after eight presses**, which is exactly the eight beats of
`clerkAfter`.

### The save key editor ships

`save_editor.html` is in the repository. A checkbox for every flag the save
format carries, every skill and bonus as a number, and a clickable minimap that
writes the position. It borrows its height from the nearest landmark within 90 m
and **says so in the status line when it cannot** — and with Bug 98 fixed, a key
that guesses wrong now lands on the ground instead of back on the moor.

Verified end to end rather than by inspection: its "endgame" preset generated a
3,948-character key that loads into the game with 14 hearts, every skill at 30,
all four relics, 25 fairies, 14/14 errands, 13 discoveries, `ysoldeBuried` and
`gehUnlocked` both true, arriving at the foot of the elder tree with no console
warning of any kind.

### Verified elsewhere, by the agent that built Gehenna

Five descent cycles: the world builds in **246–805 ms** of the six-second fall,
the player lands within **0.039 m** of the ground, and teardown returns `EXTRA`,
`vlights`, `npcs` and the scene node count to their exact baseline every cycle,
with geometry creation flat by cycle five — so the early rise is one-time lazy
pooling and not a per-descent leak.

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

---

## 2.1.2 — Performance, a likely Safari fix, and behaviour

### Bug 58 — Culled enemies leaked their whole body · FIXED *(likely the Safari crash)*

three.js never frees a geometry or material on its own — `scene.remove` unhooks
the node and the buffers stay on the card until `dispose()` fires. A grep for
`.dispose()` across the entire file returned **five hits**, none of them on an
enemy. Every culled goblin leaked **~54 geometries and ~54 materials**; goblins
spawn every 4 s at night and cull past 320 m, so a 30-minute session leaks
roughly **3,300 geometries and 6,600 orphaned WebGL buffers**.

The render profile was crushed to 0.75 pixel ratio and 185 m draw distance
because Safari was crashing. **This leak is a strong candidate for why.** Added a
`disposeTree` helper and wired it into all three cull paths. If
`renderer.info.memory.geometries` now holds flat across a few nights, there may
be render headroom to give back.

### `terrainH` is a third cheaper

The hottest function in the game: **72 `hash()` evaluations per call**, and every
spatial predicate bottoms out in it. A villager step samples it up to 190 times.
Two of its terms are multiplied by a factor that is zero over most of the map,
and the `fbm` inside each costs 12 hashes. Skipping the multiply-by-zero cases
cuts **24 of 72** for byte-identical output.

Also: `nearWater` allocated five arrays per call and sits inside that same step
search (~100 allocations per step); `structsAt` allocated on every miss, which is
the common path across a mostly-empty map; and the overlay render pass walked all
~10,000 matrices a second time when the first pass had already updated them.

### Bug 59 — Villagers stranded on peninsulas · FIXED

The step fan reaches ±126°, enough to slide along a wall but **not enough to walk
back down a spit of land**. Cornered by water on three sides, every heading was
wet and the villager stood there for good. After 0.8 s blocked the fan opens to a
full circle — and because the last successful offset is tried first, they keep
turning the same way and follow the shoreline round instead of dithering.

### Bug 60 — Slimes woke on a wall clock · FIXED

They ignored the player entirely for the first 60 real-time seconds, then aggroed
on a timer with no relation to the story. Now tied to meeting the hermit: the
moor is quiet until he tells you about it, then they hunt on sight at 30 m.

### Bug 61 — Sleepers stayed behind when the hall pushed their house · FIXED

The great hall shoves nearby houses aside as it grows, which moves their meshes
but not `it.cx/cz` — so the cached bed position went stale and the bed slid out
from under the sleeping villager.

### Bug 62 — The beacon had no prompt · FIXED

It has always had something to say, with or without the flint, but it was never
listed in `anyInteractableNear`, so no E ever appeared and the tower read as
scenery.

### The evidence is no longer in one heap

Cloth, ring and the ritual site all sat within ~20 m of the pool, so one walk
round the water solved the murder. Only the ring stays. The cloth is now snagged
partway along the road between the mill and the water — the way she was actually
taken — and the ritual site has moved well back from the shore, because it is a
thing done in private. The investigation is a route now, not a place.

### Hunter tents, fires, bows, level-up box

See 2.1.1; the tent placement fix landed there.

---

## 2.1.3 — One waterline, and a regression of mine

### Bug 63 — The player floated above the bed · FIXED *(my regression)*

A design pass argued that a grown room lifts the mattress by its vertical scale
and the player was therefore sleeping 20 cm *inside* the bed, so I multiplied the
lie height by `ky`. In play the unscaled height had been correct all along and
scaling it left the player hovering. The bed geometry does not take the stretch
the way that reasoning assumed. Reverted for the player **and** for sleeping
villagers, which had the same mistake.

### Bug 64 — Land in front of the cave behaved as lake · FIXED

Diagnosed by running the game's own worldgen: the cave sits at
`(39.13, 297.44)`, and **the rendered water plane was at y = 0.1 while every
predicate tested 0.3**. Ground between those two numbers draws as sand, sits
visibly above the water, and is classified as lake by everything.

On a normal steep shore that band is ~2 m wide. In front of the den, where the
marsh falls at 2-5 cm per metre, it is **10-15 m wide** — **872 m² of visible,
standable beach in 195 patches**, the largest a 15×13 m sandbar. Villagers,
hunters, goblins, wraiths and plants all refuse to enter it, so the approach to
the Old Bear is a permanent dead zone that looks like ordinary ground.

There is now a single `WATER_Y` constant. What you see and what the game tests
are the same number, everywhere on the map.

*(Root cause noted for later: the cave selector ranks candidates purely on
flatness with no water test at all, and a lake-edge shelf is the flattest thing
in the search annulus — so it chose the marsh lip deliberately. Of 34 candidates
exactly one is fully dry. Worth a scoring penalty rather than a hard reject, or
the den moves a long way.)*

### Bug 65 — Wraith health bars vanished in the mist · FIXED

Not a contrast problem. The bar is a `MeshBasicMaterial`, which scene fog still
tints, so at the Black Pool — thickest mist, and where the wraiths live — the red
was washed toward the fog colour until it disappeared. `fog: false`, plus a
render order that puts it after the wraith's additive glow. *(I had added a
backing plate first; removed, on the report that fog was the cause.)*

### The Goblin King waits until you can fight him

He could turn up on your first night, which is an unwinnable fight and a wall
across the story. He now needs hero level 3 — and when you ask the King for the
seal before then, he tells you why: *"he will not show himself to a beginner."*

### Nim's mother

The elder tree is where Nim always went, and her mother says so now.

---

## 2.1.4 — Nim's quest, the miller, and three long-standing oddities

### The Nim quest is two conversations, not three

It used to be: climb the mountain, be told your daughter is missing, walk down to
find her, walk back up to report. **The marker is on Nim now**, and it only
appears once the beacon is lit — because the beacon is the light she steers home
by, and without it she genuinely cannot find her way. Talk to her, she goes home,
and only then does her mother have anything to say. The guide arrow points at Nim
while she is lost and at her mother afterwards.

Her line before the beacon is the hint: *"If the old beacon were lit I could see
it from here."*

### Bug 66 — Ysolde's father slept through his own house · FIXED

Two independent faults, both predating the bed system, which merely left him as
the last NPC on the ad-hoc path.

**His yaw was inverted.** His bespoke bed's bolster is at local **+1.1** — the
mirror of the stock house bed's −0.8 — but he kept the stock bed's `yaw = +π/2`,
which points his head at **−X**. Head centre landed ~2.4 m *outside the house*,
with the pillow behind his feet. Hence "sleeping through the house" and "his
pillow is facing away from the door".

**His mesh was parented into `it.dec`.** Those children are counter-scaled when
the room grows but their *positions* are not compensated, so when you step in and
the hall swells to 1.75 he slid 0.74 m off the foot of the bed, floated 0.28 m
above the blanket, and — being a 90°-rotated child under a non-uniform scale —
was stretched 1.21× along his length and squashed 0.82× through his depth.

He is on the real bed system now: the bed goes into `it.group` like every other
bed, bed 0 is retargeted onto it, and he uses the same lie-down maths as everyone
else. At full growth the head lands on the bolster exactly. He does not get up at
dawn, because he is not getting up.

### Bug 67 — The Old Bear could freeze mid-flash · FIXED

The dead branch `return`s before the hit-flash decays and before the emissive is
rewritten, so a bear killed on the frame it lit up stayed glowing white for the
rest of the game. Cleared once, on the first dead tick.

### Bug 68 — Wolves were built sideways · FIXED

The body sphere was scaled 2.2× along **X** while the head, tail and all four
legs run along **Z**. The wolf was as wide as it was meant to be long.

### Levelling up is announced

The hero level is the lowest of your six skills — it is what the Goblin King now
waits for — and it used to pass in complete silence while a single skill got all
the fanfare.

---

## 2.1.5 — Top of the backlog

A `BACKLOG.md` now holds every outstanding request, ordered most to least
important, maintained by a standing agent.

### The champion's house is gone

Removed by request — the shelf, the sign, the grant and the announcement. The
`WORLDSTATE.home` flag stays in place so existing save keys still validate
against the whitelist; nothing reads it.

### Bug 69 — Four-option menus ignored the fourth key · FIXED

The choice handler capped at `n <= 3` while the panel told you to press the
number. Any menu with a fourth option was mouse-only. **Four separate reviewers
found this independently.** Now bounded by the menu's actual length.

### Bug 70 — A whole pool of wagoner lines was unreachable · FIXED

`JOB_LINES.wagoner` was declared twice; the second won, so every line in
`TRADER_LINES` was dead content nobody could hear. Merged.

### Bug 71 — The beacon strobed · FIXED

**Reported as physically unpleasant.** It had a 2%-per-frame chance of dropping
to a third brightness — a hard random flash, sixty times a second. It breathes on
two slow sine waves now, like a lamp.

### Bug 72 — Knights charged ghosts · FIXED

A knight drawing on a wraith reads as a bug, and losing to one nightly reads as
worse. `nearestEnemy` takes a `skipWraith` flag, and any knight already latched
onto one drops it. Hunters only ever targeted goblins, so knights were the only
ones — nobody but the player fights the dead now.

### The weaver's arrow points at Wren

She sends you to the fitting room, so the arrow goes there rather than back at
the woman who asked.

---

## 2.1.6 — The leak fix that missed the dominant path

### Bug 73 — My own 2.1.2 leak fix caught only the tail path · FIXED

**How it was found.** Two standing agents converged on it independently: the
performance guardian said *"a goblin that gets killed never reaches the path you
fixed — `killEnemy` sets `alive = false` but never sets `gone`"*, and the
reviewer said *"every new cull path leaks `e.tell`, the one child that is not
under `e.mesh`."* Both were right.

**Cause.** 2.1.2 added disposal to the branch that clears goblins already flagged
`gone`. Nothing sets `gone` on death. So the fix covered the rarest exit and
missed the two that actually run in play: the death path (`g.t > 0.4` after the
corpse settles) and the 150 m despawn. `e.bar` and `e.tell` are added to the
scene as siblings of `e.mesh`, not children of it, so disposing the mesh tree
never reached either of them.

**Fix.** One `removeEnemy(e)` helper handles mesh, bar and tell together, and
every cull path routes through it — seven sites. `netDrop` gained an `EXTRA`
sweep that clears `WARDEN` and the `bosses` entry for a departing peer's
mirrors.

**A footgun found on the way.** `disposeTree` walks materials as well as
geometries, and twelve module-scope materials (`timber`, `stoneM`, `plankM`,
`roofRed`, …) are shared by thousands of meshes across the world. Disposing one
enemy that happened to use `timber` would have blanked every wooden object in
the game. Those twelve now carry `userData.shared = true` and `disposeTree`
skips them.

**Honest note on the previous entry.** The 2.1.2 changelog said the enemy leak
was fixed. It was not — only the tail was. The claim in that entry stands
corrected here rather than being edited out of it.

### Bug 74 — My `heroLevel() >= 3` gate could hard-block the main quest · FIXED

The Goblin King timer added in 2.1.5 gated on `heroLevel()`, which is the
**minimum** of five skills — and swimming is one of them. A player who never
swims sits at swimming 1 forever, so `heroLevel()` never reaches 3, the Goblin
King never spawns, the seal is never granted, and the main quest stops dead with
no message explaining why. `heroLevelLand()` takes the minimum of the four
land skills instead; swimming still counts toward the displayed player level, it
just cannot hold the story hostage.

### Bug 75 — `waterSurfaceAt` still carried a hardcoded waterline

2.1.3 unified every waterline on `WATER_Y`. One survivor: `waterSurfaceAt`
compared `terrainH(x, z) < 0.3` directly. Same value today, so no behaviour
change — but it was one edit away from disagreeing with the rendered plane
again, which is exactly the bug 2.1.3 existed to kill.

---

## 2.1.7 — Trees that keep their bark, ghosts that do not give up, and a warden with a name

### Bug 76 — Every felled tree turned bone white · FIXED

**Reported:** "the pale trees cut just turn white when fell."

**Cause.** A standing trunk is the bark texture tinted by a per-instance colour
(`2.1, 2.0, 1.85` for a pale tree, plain white for the rest) and its leaves
carry the tree's own hue. The falling copy built in `fellTree` was a flat
`0xe2d8c6` `MeshStandardMaterial` with **no map at all**, plus three flat
`0x9aa07a` blobs — identical for every tree in the world. So a pale tree went
white, an oak went white, and both lost their leaf colour on the way down.

**Fix.** The copy clones `TREEMESH.trunkM.material` and the tree's own leaf
material and multiplies the same instance colours into them. Cloning the *live*
material also means the copy follows the floor-texture setting: with textures
off it comes out flattened to its average colour, exactly like the trunk it
replaces. The stump gets its own clone, because the falling trunk's material is
faded to nothing and then disposed — a shared one would have taken the stump
with it.

**A leak found on the way.** `updateFalling` did `scene.remove(f.g)` and nothing
else. Four geometries and two materials per felled tree, never freed, on a tree
that regrows every six minutes. It routes through `disposeTree` now.

### Chopping feedback

**Reported:** "give some feedback so the player knows they are cutting the right
tree, like some noise or cracks."

A pale tree takes three swings and each one gave the same small tick, so there
was no way to tell a landed chop from a whiffed one or to know how close the
tree was to going. The axe bites deeper each time — more chips, a lower crack, a
harder screen shake — and the swing that leaves one hit in it groans, which is
the cue to step back.

### Bug 77 — There was no grass footstep, and the town lawns sounded like flagstones · FIXED

**Reported:** "i dont hear grass footsteps either, and sometimes i hear stone
footsteps when on grass in the village."

Two separate faults.

*No grass.* `footingAt` returned only `"stone"`, `"wood"` or `"earth"`, and
`SFX.footstep` had a case for the first two and one `else` for everything else.
So the surface the player spends nearly the entire game on played the same
muffled scuff as bare dirt, quiet enough to vanish under the wind. There are
`"grass"` and `"sand"` footings now, banded off the terrain's own thresholds
(sand at the waterline and along rivers, rock above 60 m or on anything steeper
than 0.75), each with its own sound.

*Stone on the lawn.* The stone test was `Math.hypot(p.x, p.z) < TOWN_R + 2` —
the **whole town disc**, gardens and grass verges included. Every cobbled slab
and the plaza now register their own footprint in `TOWN_STONE` as they are
built, and the test is against the stone that is actually there.

### The ghosts do not lose interest

**Asked for:** "the ghosts that follow you from the pool should still keep
following the player unlimited range, and can go up hills easily, and can move
through water, go path to the player through anything. the more the player
ignores them the more they spawn."

- The `dist < 30` gate is gone. A wraith comes at you from wherever it is.
- `resolveStructs` is gone for wraiths: a wall is not an obstacle to something
  that is only half here.
- It used to hover 0.4 m over the **ground**, so one crossing a river walked
  along the bed with the water over its head. It skims whichever of the ground
  and the water surface is higher now.
- The upward height chase went from λ=14 to λ=22, so one coming up a steep bank
  no longer lags into the slope.
- `wraithHeat`: every spawn interval you leave one walking, the pool sends
  another and sends it sooner (9 s down to 2.6 s, cap +1 each time to +6). Every
  one you put down takes two off the heat. Turn and fight and the night ends
  with two behind you; keep walking and it ends with eight.

### The Drowned Warden is Ysolde

**Asked for:** the warden rises slowly from the ground; it is made clear in lore
and voice that she is Ysolde; she has her bob hair; she is angry out loud; her
attack is longer, hits a player in mid-air, and throws them. And it ties back to
the attachment theme.

- She surfaces over **6 seconds from 9 m down** on an ease-out, so the slowest
  part is the last two metres, with the water breaking over her the whole way
  and three lines landing as she comes up. She used to appear from 2 m down in
  3 seconds, which read as a spawn.
- She wears the bob. Ysolde's body at the pool's edge now wears one too, so the
  two match — nobody has to say why.
- Seven rage lines on a timer, every one of them a thing she is still holding:
  the ring, the walk north, her father's sleep, being owed an apology. The fight
  is not with a monster, it is with a girl who cannot put anything down.
- Reach 6.2 m (was 2.6) and a vertical tolerance of 11 m (was 4). Jumping over a
  boss's swing is the oldest escape there is and against her it does not work.
- `hurtPlayer` takes a `kb` multiplier; she throws at 2.1 and everything else
  stays at exactly 1. The multiplier crosses the wire on `ehit` and is clamped
  on receipt like the damage, so a peer cannot ask to launch you into orbit.

### M works while the stats page is up

**Reported:** "M should work regardless of if stats is up, dont make it toggled
with the regular mini map it feels to the player that it is stuck."

`body.stats-open` hid `#minimap` outright. The stats page takes the map's
corner, so the *small* map has to step aside — but the big map is drawn in the
middle of the screen and owes that corner nothing. Pressing M with stats up did
nothing visible, so the key read as broken. Only `#minimap:not(.big)` hides now.

### The "Found" strip is off the stats page

That list was the satchel's job, and the satchel shows the things themselves.

---

## 2.2.0 — The seam under the world (3.0 phase 1), and three from play

### The depth seam

The foundation the whole Gehenna update sits on. **Nothing on screen changes.**
Every routed path below is unreachable while Gehenna does not exist, which is
the entire point of landing it first and separately.

`DIVIDE = -200` splits the world in two. Above it, the valley, untouched. Below
it, Gehenna: its own heightfield (`gehH`), its own structure grid
(`gehStructsAt`), its own ground (`gehGroundAt`).

- **`groundAt(x, z, y)` routes on its `y`.** One comparison at the top. Every
  existing call site routes itself with no edit — the attack-tell ring already
  passes the enemy's own height, and every NPC ground snap already passes the
  villager's own.
- **`terrainH` is never routed**, and now carries a comment saying so and why.
  Four systems read it as a fact about x and z alone: the terrain mesh is built
  from it; `isWater`/`isDeep`/`waterSurfaceAt` gate villager pathing, enemy
  siting, plants and footstep material; the minimap paints its water band from
  it; and the boss-relocation routine is harmless underground only because it
  compares `terrainH` against the player's own y.
- **`stepH(x, z, y)`** is the cheap heightfield router for the four
  player-position predicates that genuinely need depth. The most important by
  far is `okMove`: with `terrainH` there, a player at −280 compares 300 < 1.6
  against every candidate direction, every one fails, and the movement falls
  through to a velocity bounce. **Frozen solid, in every direction.**
- **A boot assertion.** Terrain is bounded below near −26 analytically (`fbm` is
  a sum of positive amplitudes, flooring the base term at
  `(0 − 0.42)·40 + (0 − 0.5)·16 = −24.8`, and the deepest carve in the world is
  the tarn bed 1.2 m under that). The assertion measures the true minimum over
  all 130,321 vertices the world is drawn from, every boot, and shouts if the
  margin ever falls under 100 m. The proof is a fact each start, not a memory.

### Bug 78 — Two collision primitives had no lower bound · FIXED

Both are **live overworld bugs**, not just Gehenna preparation.

`pushOutOfTrees` bounded the push above (`p.y < t.y + 10 * t.s`) and not at all
below, so a trunk shoved anything beneath its own roots — already wrong today
for a body in the bear cave or inside a house under a canopy tree.

`resolveStructs` skipped a structure you were standing on top of and one you
were under via `s.bottom`, but had no floor either.

Both are bounded now (3 m under a tree's base, 40 m under a structure's top —
below every building, wall and bridge in the valley).

### Bug 79 — Nim's mother had a man's voice · FIXED

**Reported:** "nims mother has a male voice for some reason."

The Thornback quest giver is whichever villager `giverOf(2)` happens to pick,
and for the mother the code swapped her **mesh** for a woman's body and nothing
else. The voice belongs to the NPC record, not to the mesh, so she kept whatever
pitch and voice the picked villager had — a man's on most seeds. `female`,
`pitch`, `rate` and `voice` are rebuilt with the numbers `addNPC` would have
used for a woman.

She is also called **Nim's mother** now rather than "Thornback mother", in all
four places the name appears. Safe to rename: `who` is a runtime display string
and a lookup key, never serialised — only quest `title` is a save key.

### Bug 80 — The berry-pickers came apart · FIXED

**Reported:** "the villagers picking berries at the bushes in the kingdom are
the only ones glitched, their torso is below their head and their head and legs
are way too high."

**Cause.** Head, neck, torso and both arms are five **siblings** on the person
rig, not children of the torso. The kneel pose dropped `u.body.position.y` from
0.98 to 0.35 and moved nothing else — so the head stayed at 2.6 and the
shoulders at 2.05, hanging in the air over a torso at ankle height. And folding
the legs 1.4 radians about a hip at 1.02 swung the feet up off the ground. Both
halves of the report, from one line each.

**Fix.** A kneel is not a pose this rig can hold honestly, and a bend at the
waist is what someone picking from a bush actually does anyway. The torso pivots
at its own origin and the head, neck and both shoulders are swung round that
same point, so the body stays one body. It eases in and out, and the panic
path releases it — nobody keeps picking berries while they run.

This was never only the berry-pickers: every washer at the water kneels through
the same branch.

### Bug 81 — Nim stood on the shore forever after a load · FIXED

**Reported:** "nim respawns at the shore when loading a save, even after her quest
is done."

**Cause, and it is a class of bug rather than one bug.** `applySave` moved her
logical `pos` to Thornback correctly — the flag round-trips fine, and `nimHome`
is a top-level key so `pickObj` never touches it. But **`updateNPCs` is the only
thing in the game that writes an NPC's `mesh.position` after world build**, and
it early-outs at `distToPlayer > 420` — measured from her **new** position. So
her body stayed standing where the world built her, out of the tick's range,
un-talkable and with no prompt over it, until the player happened to walk within
420 m of Thornback.

**Fix.** `syncNPCMesh(n)` places the model whenever an NPC's position is changed
from outside the tick, and Nim's load path calls it — with `groundAt` for her
height rather than the village pad's, and a heading that faces the village.

The same omission exists at three other relocation sites — `freeMaren`,
`stockHale` and `guardsOutside` — and is harmless at each, because all three
move an NPC ten to thirty metres inside the town, where the tick is always
running. They call the helper anyway: the difference between those and Nim's is
distance, and distance is exactly the sort of thing that changes later.

### Bug 82 — A latent crash in the corpse fade · FIXED

`updateExtraEnemies` fades a dead enemy with `else { e.mat.opacity = ... }`. Any
`EXTRA` kind without an `e.mat` would throw a `TypeError` **from inside
`update()`, on every frame of its own corpse** — which takes the whole game
down, not the one enemy. No kind hits it today. Guarded before one does.

---

## 2.3.0 — The valley souring (3.0 phase 7)

"things feel too peaceful." They don't now.

### One number

`dread()` — 0 to 1, a pure function of state that is **already saved**, so it
survives a reload and a rejoin without a byte of new save format. It reads only
`blackPoolAwake`, `relicCount()`, `villagesDone()`, `finaleStarted` and
`ending`.

It is **exactly zero until the pool wakes**, by design: Acts I and II have to
look precisely as they always did, because the whole turn in Act III is that
they did, and then stopped. It returns to zero the moment an ending is chosen —
the valley gets its colour back.

|  | dread |
|---|---|
| Acts I–II | 0.00 |
| pool woken, nothing done | 0.18 |
| 2 relics, 4 villages | 0.54 |
| 4 relics, 8 villages (the finale gate) | 0.90 |
| the warden risen | 1.00 |

Because the finale gate is exactly four relics and eight villages, **dread 0.90
is exactly the moment the player is ready.** The sky is the readiness
indicator. That is free signposting for something big waiting.

It creeps in over ~13 seconds and drains in 4, so picking up a relic never
snaps the sky.

### The sky leans red, and the nights lean harder

Days do **not** go red — that is the annoying-colour failure mode. Days go
hazy, drained and wrong, a sun through smoke: `#86C6F6` → `#A4B3BF`. Nights go
properly red: `#0C1430` → `#2A0806`, with the horizon at `#54100E`.

The highest-leverage change is one line nobody would guess: at night the
directional light **is** the moon, and it is blue. Reddening it
(`#8EA0D8` → `#9A5F5C`) is what makes the *ground* look wrong rather than just
the dome. And because `scene.fog.color` already copies the horizon, the fog
follows for free.

Fog distance also closes in 22% at full dread — the valley gets smaller as it
gets worse, which is a net win on overdraw.

### Days run short

`DAY_LEN` is referenced in exactly one place, which made this clean. The rate is
scaled **per half-cycle** rather than warping `dayT → sun` — so every `dayElev`
test in the game is untouched and the HUD clock still agrees with the sky. The
hours simply hurry.

| dread | daylight | dark |
|---|---|---|
| 0.00 | 300 s | 300 s (*identical to today*) |
| 1.00 | 165 s | 336 s |

Every system keyed on the day was checked rather than assumed. Wraiths need
4 seconds above the dawn threshold and get 157. Goblins need 9 seconds of sun
to burn and get 161. Sleeping still maps dawn↔dusk because the map stayed
linear. The multiplayer day broadcast diverges by 0.0017 against a 0.02 snap
threshold — 12× under. **Nothing needed a fix**, which is the payoff of scaling
the rate instead of warping the map.

### The music slows

One tempo multiplier on every duration in the town and wilderness tracks — a
tempo change, not a stretched tape. 35% slower at full dread. The **tabor goes
first**: a town whose drum has stopped is a town that has stopped dancing. The
harp thins to 45% note density. The boss track is deliberately exempt, because a
slow boss track is a bad boss track, and the gain crossfades are untouched.

### Bug 83 — Eleven villager lines were unreachable for half the game · FIXED

In `npcLineRaw`, every branch of the reputation block has a probability guard
except one: `if (r.poolAwake) return pick([...])`. It returns unconditionally.

`repTags()` sets `poolAwake` from the moment the pool wakes until an ending is
chosen — **the entire back half of the game**. So the `kingSlain`,
`haleExposed` and `champion` pools below it were dead code for most of a
playthrough. Eleven written lines about killing the Goblin King, freeing Maren
and lighting the beacon that nobody could hear.

One word: `&& Math.random() < 0.5`.

### Villagers say worse things

Seven line pools × three bands, for town folk, hill folk, hunters, water
workers, children, knights and the canopy folk. Unease, then fear and
suspicion, then open hostility and religious panic.

The branch sits **above** the knight and kid branches, because both of those
also return unconditionally and would have shadowed it — the same bug as 83,
which is why it carries a comment saying so. At full dread it fires 70% of the
time, so **30% of lines are still the ordinary pools**. The jokes survive.

The connective line is a child's: *"I'm not allowed to look at the big oak. So
I don't. Mostly."* He tells you what is on the road before you see it, and never
says what it is.

---

## 2.3.1 — A sprite for everything in the satchel

### Bug 84 — Four routing traps in `itemIcon`, all of them shipped · FIXED

`itemIcon` was a chain of regex tests, and the order was wrong in four
separate ways. Every one was live.

| Item | Drew | Why |
|---|---|---|
| `A fairy: healed` | a **wind feather** | `/feather\|air\|lung/` matched the **"air" inside "f-air-y"**, and it was tested before `/fairy/` |
| The King's Seal, the Queen's Tear, Goblin King's Tooth, Hunter's Boots, the Root Word, Violet Stone, the Warden's Stone, Tobias's Knife, Milliner's Charm, Windstep, Hunter's Patience, Beacon-keeper's Boots | a **book** | the book rule ends in a bare `'` alternation, which swallows every possessive name |
| `Woodcutter's Draught: +14 stamina` | a **log** | `/log\|wood\|bundle/` matched "**Wood**cutter". It is a drink |
| `Rose Rest` | a generic rose | `/heart/` was tested first, which made the `/rose rest/` branch **dead code** |
| `Burned candle stubs in a ring…` | a **ring** | `/ring/` matched "in a ring" |
| Rose Compass, and 7 village keepsakes | a **crate** | no rule matched at all |

It is an ordered table now, specific before generic, with both catch-alls
demoted to the bottom where they belong. The word boundary on `/\bgrave/`
matters: without it, "engraved H. to Y." draws a headstone.

### Twenty-nine new sprites

Every item that can enter the satchel has its own icon. The Rose Compass is an
actual rose — petals, a stem and two leaves, not a dial. So is the pink guide
arrow that floats over your head: the bud is the nose, five petals ring it and
the stem trails behind, so it still points but it reads as a flower flying
point-first rather than a dart someone painted pink.

They are **inline SVG, not canvas**. The slots are DOM and the CSS that sizes
them targets `.slot-item svg`; a canvas texture is a GPU object a DOM node
cannot sample. Vector also stays crisp under the HUD's 1.15/1.3 zoom and on a
retina screen, where a 64px bitmap would not. Cost: 29 string literals parsed
once at boot, against ~475 KB of bitmaps for the canvas route. The per-slot DOM
is still built lazily, only when the satchel opens.

### Bug 85 — Every clue took two satchel slots · FIXED

`grant()` always pushes to `FOUND`, and the pickup handler **additionally**
pushes clues into `ITEMS`. `renderInv` loops both. So every clue and every one
of the fifteen lore books appeared twice. Rendering only — neither array's
serialisation changes, so old save keys are unaffected.

### Hover reads it

**Reported:** "remove the click this to read what you found just make it hover."

It showed the name and told you to click, which is a step for no reason when
the pane is already open and already big enough. `pointerenter` rather than
`mouseenter`, so a tap does it too. The click still works and now means *pin*:
it holds the text while you look elsewhere, and it is still the Rose Compass's
wake-and-sleep switch.

### The ✕ is on the panel

**Reported:** "put the red x to leave at the top right of the ui not of the
screen."

**Cause.** `.xbtn` was `position: fixed`, anchoring it to the viewport — but it
lives inside `#hud`, which carries `zoom: 1.15` above 1100px and `1.3` above
1700px. Under `zoom` the used offsets scale, so on a wide monitor it drifted off
both the true screen corner *and* the panel. It is `absolute` against the
satchel now. Nothing else moves: `.xbtn` appears exactly once in the file.

---

## 2.4.0 — The abandoned church (3.0 phase 6)

### The smoke test was only checking half the file

**This matters more than the church.** The headless check has run
`--disable-gpu --enable-unsafe-swiftshader` all along, and under SwiftShader
**worldgen stalls at about line 2,825 and never finishes.** It was proved with
two probes: an early one fires, a late one never does, on a build with no new
code in it at all. So every "clean" result this session meant *the file parses
and boots*, not *the world builds*.

The parse half was always real and always covered the whole file — a stray `//`
that swallowed a line's closing braces earlier today was caught exactly that
way. But nothing past the first ~2,800 lines of worldgen had ever been executed.

**Dropping those two flags fixes it.** On the real GPU the world builds to
completion in about ten seconds. The smoke test now runs the whole of worldgen,
which is how the church below could be verified at all.

### The church

Outside the walls, on the apron where the plateau has stopped holding the
ground flat — near enough to see the kingdom's banners from the porch. On the
default seed it lands at **(101, −12), r = 102**, on ground level to within
43 cm, with the door turned a quarter-turn toward the kingdom.

**Nothing here was sacked.** Everything portable was carried out carefully by
people who knew which end was heavy, and then the door was left open. That is
the whole design: a robbed place looks angry, an abandoned one looks tidy.

- The candle sockets are there and the candles are not. There is **no `lamp`**
  on the interior record, so the entry-brightening finds nothing and the church
  never lights, at any hour.
- The font is dry, with no green ring where water stands. It was *emptied*.
- The roof is gone over the nave and still on over the altar — the shelter that
  remains is over the part nobody needs.
- One window still has glass, four metres up where nobody could reach it. The
  only warm colour in the building.
- The slate is dark, not red, so from the wall it is the one black roof.
- The bell is on the floor and the tower it fell from is not in the scene.
- Five rooks sit perfectly still in the rafters until you cross the threshold.
- Hale's name fills the last dozen pages of the visitation ledger, in one hand,
  for years. He kept the hours in an empty church long after everyone else
  stopped — which is most of why a man decides something has to be paid.

**It is a place to fight in, deliberately.** The sill walls are cover, the
fallen rafter is a ramp, the tie beams are high ground, and above 2.2 m the
walls are porous so anything with air under it comes in through a window. The
tie beams are `addDeck`, not `addRect` — the one collider you can stand on and
walk under. Registering them as walls would have put an invisible bar across
the nave at chest height, which is the single easiest way to get this wrong.

**Where it sits in worldgen is load-bearing.** `addPickup` assigns
`id = type + ":" + pickups.length`, and the save stores taken pickups by id. So
inserting a pickup anywhere earlier shifts every later implicit id, and an old
save marks the **wrong** pickups as taken — which, past Hale's ritual site and
his private note, would make the murder investigation uncompletable. The church
goes in after the last implicit id, and its four books carry explicit ids.

Cost: 72 meshes, ~72 draw calls, 26 colliders, one scene child, **zero lights**
and **zero per-frame cost** — nothing in the update loop touches it.

Seven one-line edits support it, each a strict superset of current behaviour:
a `DISCOVERIES` entry, a one-shot `onFound` hook, two `footingAt` lines so
flagstones sound like stone, a `roofless` flag that skips the head-bump clamp
(a nave with no roof has no ceiling to bump), a camera arm long enough for a
19 m room, and a per-room `interiorK` — because the full indoor grade blacks out
the sky, and here you can see it through the rafters.

---

## 2.5.0 — Hunters in the woods, healing that heals, and a Warden who fights fair

### Bug 86 — The lore books reshuffled on every boot, and the save marked the wrong ones · FIXED

**The worst bug found so far, and it was live before 2.4.0 shipped.**

The lore-book scatter gated on `Math.random() < 0.35`. Every book that survived
the draw called `addPickup` with **no explicit id**, and `addPickup` assigns
`id = type + ":" + pickups.length`. So the *number* of books changed every boot
— measured at **68, 67 and 61 pickups across three runs of the identical file**
— and with it the id of every book after the first skipped house.

The consequences were all certain rather than hypothetical. The text is stable
by ordinal, so `clue:37` is always the same passage — but it sat in a different
house each time. Save on a 44-book boot and reload onto a 37-book boot and the
high ids matched nothing and were silently dropped; the other direction marked
books as read that the player had never seen. And `GRANTED` is runtime-only and
never saved, so a book re-taken under a shifted id pushed its label into both
`FOUND` and `ITEMS` again — quietly reopening the duplicate-slot bug that 2.3.1
had just closed, through a different door.

**Fix.** The gate hashes the house's own position, so the same book sits in the
same house on every boot and every machine. The books also carry an explicit
`lore:<n>` id now, so the id does not depend on the pickup count at all.

**A correction to the 2.4.0 entry.** It said an insertion before the church
"would make the murder investigation uncompletable". That was wrong — all five
murder clues carry explicit ids and are immune to renumbering from anywhere.
The real blast radius of an early insertion is the implicit ids below it: four
heart pieces, the Wind Feather, the Lungs of the Lake, three stamina fruit, four
fairies and the Woodcutter's Axe. A shifted id there either re-arms a consumed
permanent upgrade or silently deletes a weapon the player owns.

### Bug 87 — The Drowned Warden was in the enemy list twice · FIXED

`spawnWraith` pushes to `EXTRA`; `spawnWarden` **also** pushed to `bosses`; and
`allEnemies()` concatenates both with no dedupe. So a swing that hit only her
called `damageEnemy` on the same object twice. With the group-spread divisor
that is **1.48x damage**, two knockback impulses and two particle bursts per
hit, and her 120 HP behaving like 81. It also poisoned the spread maths for
everything else — with one real second enemy the summoned wraiths took 0.588x
while she still took 1.18x. The bear is listed once; she was the only one.

### Bug 88 — The Warden could deadlock permanently, buried in a hillside · FIXED

`updateEnemyTells` relocates any distant boss to within 22–30 m of the player
and sets `state = "chase"`. **`updateWraith`'s switch has no `"chase"` case** —
only rise, drift, windup, strike, recover, stun. She fell through it every
frame: stopped moving, stopped attacking, permanently. Meanwhile her height damp
dragged her from the ground she was dropped on down to pool level, so she ended
up around five metres inside the hill — a motionless health bar in the rock. The
only escape was a heavy hit, because the stun assignment in `damageEnemy` is
gated on `!e.boss`.

It fires at 55 m, which is trivial: she moves at 3.2 m/s and the player sprints.
Wraiths are excluded from the relocation now, like the bear.

### Bug 89 — The Warden hit from where you could not hit back · FIXED

Her reach is 7.8 m with an 11 m vertical tolerance. The player's swing is 3 m.
Her height was pinned to `POOL.y` while her chase had no range limit, so she
walked up the bank and stayed at pool level — leaving an **eight-metre band
where she was lethal and untouchable**, on roughly a fifth of the compass from
about thirty metres out. She was not hitting through a wall; the terrain was the
wall. She rides the higher of the waterline and the ground under her now.

### Bug 90 — `dread()` ramped about thirty times slower than written · FIXED

The body is throttled to twice a second but eased by a **frame** `dt`. At 60 fps
the true rate was `0.06/60*2 = 0.002` per second — and faster hardware made it
slower still. "Creeps in over thirteen seconds" was really **seven and a half
minutes**, so the whole souring of the valley arrived minutes after the story
beat that fires it, and choosing an ending took nearly two minutes to give the
colour back instead of four. It eases by the interval that actually elapsed now.

### Hunters live in the woods

**Reported:** "the hunter tents have no reason to be that close to the kingdom
or villages, they should be in forests, thats why they are in tents." And:
"make it obviously a tent that he can go inside, with a fireplace outside, and
make it look like the tent has a door at least."

- They pitched twenty-six metres past the town wall, close enough that walking
  to a real bed would have been quicker than pitching. They start at **95 m past
  the wall** now and widen the ring every eight tries, with a minimum of 70 m
  from the walls and 62 m from any village.
- **A real forest test:** at least seven trunks within 34 m, counted off the
  tree grid. A tent on a bare moor was the bug. If a hunter genuinely has no
  wood near him, the best clear spot is used rather than leaving him tentless —
  a hunter with no tent has no nap branch and keeps the whole night standing up.
- **The tent is a tent.** It was one four-sided cone, which reads as a pyramid.
  It is a ridge tent now: two canvas slopes over a pole that overhangs both
  gables, a closed triangular back, two door poles, and the flap rolled and tied
  back against one of them with three ties. Groundsheet inside, pegs and guys at
  the corners.
- **You can walk in.** Two side walls and a back, and nothing across the mouth.
  The yaw snaps to a quarter turn first, because `resolveStructs` has no rotation
  field and a tent at 37 degrees could only have its walls approximated by boxes
  — you would feel that walking in. The collider tops sit at the ridge, so a hop
  cannot clear them.
- **A campfire outside the door**, in a ring of stones, registered in `hearths`
  so goblins will not rise out of the ground under him.
- His fire *is* his camp now, and that is load-bearing rather than decorative:
  the nap only ever triggers within 25 m of the tent, and his night beat is
  10–20 m around his fire. A hunter whose beat stayed at his village door would
  simply never nap again. His daytime hunting still anchors on his house — he
  walks out to the camp as the light goes.

### Bug 91 — Rose Rest could not fire at all after the pool woke · FIXED

**Reported:** "bugg the fairy reward auto heal thing."

**Cause.** The gate was a **nineteen-term conjunction**, and any single term
failing reset a five-second warm-up to zero. Among the terms: no movement key at
all, speed under 0.15, weapon away, satchel shut — and **no enemy within 22
metres**. That last one is what actually killed it. Once the pool wakes there is
nearly always something walking toward you, and since 2.1.7 wraiths pursue from
*any* distance, so the ring is effectively never empty at night. The heal could
not fire, which is why it read as broken rather than as strict.

**Fix, per the request** — "there should just be passive healing regardless of
in or out of combat, although it shouldnt be that fast, and regardless of
moving": it is unconditional, and slow enough that being unconditional costs
nothing. **0.02 HP/s, one heart every fifty seconds.** The Warden hits for two
about every four seconds; this gives back 0.08 in that time, under five per cent
of one blow, so it cannot win a fight for you. What it does is mean the walk
between two villages puts your hearts back. The petals are much rarer, because
a constant halo would read as a status effect rather than a kindness.

### Six more, from the standing agents

- **A peer could NaN your velocity at will**, two ways. `netApplyState` did no
  validation and `Vector3.set` does not coerce; the `ehit` handler's fallback
  caught strings (NaN is falsy) but not `Infinity` (truthy). Either way
  `hurtPlayer`'s divide guard is `|| 1`, and NaN is falsy, so the guard did
  nothing. `guardPlayerPosition` recovers — but `hurtPlayer` clears `grounded`
  and the safe spot only updates while grounded, so spamming it **pinned you at
  your last footing indefinitely**. Both entry points are finite-checked and
  clamped now. The `kb` multiplier added in 2.1.7 was already correctly clamped.
- **Avatar flood:** `hello` built a full character mesh and a canvas nametag
  every time with no cap — fifty messages made fifty avatars. Capped at 8, with
  an existing id still allowed to rebuild so appearance changes still work.
- **Wraiths could spawn inside houses.** The far-spawn branch checked bounds and
  water but not interiors, and the `!roomNow` guard only covers the case where
  the *player* is indoors.
- **The rooks never flew again after a reload.** `applySave` re-added the
  discovery id without spending its one-shot, so `discover()` short-circuited
  and the effect could never fire. The discovery radius also dropped 26 to 13:
  it was firing sixteen metres before the porch, through a wall.
- **The Warden blinked out during her own entrance.** The wraith blink applies
  to her too and starts at zero, so she vanished for a fifth of a second about
  twice during the six-second surfacing built to be watched.
- **The church's chancel sill blocked by eleven millimetres.** `resolveStructs`
  skips while the body is below `top - 1.0`; the sill's top was `FY + 1.2` and
  the flagstones are at `FY + 0.19`. Blocked at +0.005 above the floor, straight
  through at +0.011 — and only from the inside, which is what marked it as an
  accident rather than a window. Raised to match the long walls.

### Two save-format improvements

- **An unknown discovery id now drops instead of rejecting the whole key.** It
  returned `null`, so a save made after any new discovery was added failed to
  load in an older build with "bad save key" — the player losing everything over
  one unrecognised place name. Unknown `picked` ids already behaved this way.
- **Six more icon mis-routes fixed**, three of them the church's own clues. The
  rules read *body prose* as if it were a name: a lore book quoting the fairy
  queen drew a fairy, and the font's "no green ring where water stands" drew a
  gold ring. `itemIcon` tries the item's **name** first and the full string
  second, and the catch-all's bare apostrophe — which made a book of every
  possessive in the game — is now a colon-quote, which is how the lore books
  actually introduce a quotation.

### Refuted

A standing agent reported a debug-probe block shipping in the 2.4.0 release.
**It is not there** — grep finds zero occurrences in the committed file. Two
agents were auditing the same file concurrently and one saw the other's
temporary instrumentation mid-flight. Noted so it is not re-reported.

---

## 2.5.1 — Settings that survive, and a level swimming cannot hold back

### Bug 92 — Every device setting reset on any reload · FIXED

**Reported as "the camera is way more finnicky and dizzying now", then correctly
self-diagnosed by the player as "probably just the mouse sensitivity default
being too high — since i changed browsers".**

That second diagnosis was right, and it exposed a real gap. Mouse sensitivity,
the three volume sliders, voice and the guide arrow lived **only inside the save
key**. Nothing wrote them to `localStorage` (only the FPS counter did). So they
reset to default on every plain reload, and were simply gone the moment the game
was opened in another browser.

Mouse sensitivity is the one that hurts, because it is genuinely
**device-dependent**: pointer lock does not report `movementX` the same way in
every engine or at every display scaling, so the same hand movement can turn you
half again as far in one browser as in another. A player who dialled it in once
lost it by switching browser and had no way to know why.

**Fix.** Those six settings are now machine preferences stored in
`wildmoor.prefs`, applied at boot and **re-applied after a save key loads** —
so a code pasted from someone else's computer no longer reaches over and changes
your mouse or your volumes. The save key still carries them for backward
compatibility; the local preference simply wins.

Also: the sensitivity slider goes down to 0.1 (was 0.3), steps in 0.05, and
shows its current value, so it can actually be dialled in.

**Investigated and ruled out before the player corrected me.** I diffed the
camera against 2.1.7, the last build they called satisfying:
`camera.position.lerp`, `camera.fov = lerp`, the shake decay, `shk`, both
mouse-look handlers, `hurtPlayer`'s velocity impulse, `hdt`, `dtFrame` and the
hitstop branch are all **byte-identical**. Recorded so nobody re-investigates it.

### Bug 93 — Swimming held the whole character at level one · FIXED

**Reported:** "make it possible to level up beyond swimming. swimming will just
weigh it harder and make it easier to level up but without holding you back."

Hero level was `Math.min` of six skills, and swimming only rises in water over
your head. A player who kept their feet dry was pinned at **level one for the
entire game** — and hero level is what reduces incoming damage, so the player
who avoided deep water was also the player who took full damage forever.

It is the **average of the five land skills** now, with swimming folded in as a
sixth share **only when that average is higher**. So swimming can lift your
level and can never lower it: it is worth doing rather than something you are
punished for skipping. The two villager lines that taught the old rule — "a
knight is only as good as his weakest skill" — are rewritten to teach the new
one, and so is the stats-panel explanation.

`heroLevelLand()` stays for the Goblin King's gate, on the same principle that
made it necessary in 2.1.6: the finale must never wait on a skill a player can
legitimately never train.

### Bug 94 — The opening knight spoke into the pause menu · FIXED

**Reported:** "the knight randomly says you there the king wants a word with you
when the game is paused at the start."

`update()` returns early while paused **only when you are alone** — with a
friend on the moor the world deliberately keeps turning so the session does not
stall. So the escort knight could walk over and deliver his line while your menu
was open. And `setPaused` cancels speech synthesis, so it arrived as a *silent
subtitle* over the pause screen: the knight talking to nobody. He holds his
tongue while the menu is up now — which also stops the same branch zeroing the
player's velocity behind the menu.

### Bug 95 — The hunter camps had no light · FIXED

`addFire`'s fifth argument is a **light object** — it reads `light.intensity` to
get the flicker base — and 2.5.0 passed `true`. Assigning to `true.intensity` is
a silent no-op outside strict mode, so the new camps had a fire that cast
nothing. They use `vlight` now, the pooled kind every other fire in the valley
uses, so it costs no real three.js light.

### Reverted

The wraith knockback and spawn-pressure nerfs made in the first half of this
version are **reverted**. They were a response to the camera report, and once the
player corrected the diagnosis there was no reason to keep an unrequested combat
change — the escalating pressure is what was asked for in the first place.

---

## 2.6.0 — Water you can be inside, and a way down (3.0 phases 2 and 4)

### Phase 2 — swimming becomes a volume, not a line

Swimming was a **surface float pinned to `y = -0.8` with `P.vel.y` zeroed**. There
was no vertical swim in this game at all — which is why "swim up and down in the
pool" was never a tuning problem and never could have been.

Water is a **body** now, with a top, a floor, and an entry and exit height.
`SEA` is the valley's lakes and rivers; the Black Pool is registered as its own
volume. Space rises, the slide key sinks, and letting go floats you back to the
surface. Every lake in the valley is divable as a side effect.

**The lake is unchanged, and that was proved rather than argued.** The old line
was `lerp(P.pos.y, 0.1 - 0.9, min(1, hdt * 6))`, and `SEA.rest` carries the
expression `0.1 - 0.9` **verbatim** rather than being recomputed — so with no key
held it is the same function, on the same operand, at the same rate. Measured
floating with no input: `y = -0.7999999918`, identical to before, with the
underwater blend at exactly 0. Entry, exit and the deep test are carried across
as literals too.

The sink key is `x` — already the game's "get low" verb, already wired to the
mobile SLIDE button, and **provably inert in water today** because `wantSlide`
requires ground the swimmer does not have.

### Phase 4 — the descent

A **drop shaft**, and the code says so plainly. Not a swim: a swim is something
you can turn around in, and drowning on purpose is not. Six seconds of falling
through black water with the camera still rendering, the input still steering
and the breath bar emptying.

Measured: 47.1 m/s, y from +2.7 to −281.5 over six seconds, arriving **standing
on real ground**, breath 83 → 0, fog closing from 43.8 m to 24.0 m, the sun gone.
The camera trails a constant 11.5 m and its height at arrival is identical to the
frame before — **no swoop**.

The world builds **while you fall**, yielding through the same `__stage` pipeline
the valley is built with, so there is no loading screen: the floor was standing
before the first second of a six-second fall. A failed build spits you back out
at the rim, computed *before* the fall while the body is still beside the pool.

`WORLDSTATE.gehUnlocked` and `WORLDSTATE.gehSeed` persist, with all four edits —
payload, whitelist, `applySave`, and `WS_SHARED` for the boolean only, because
the shared-state merge coerces with `!!` and a numeric seed cannot travel that
pipe. A save taken below the seam wakes you on the pool rim with the pool still
open; the position is deliberately not persisted, because the validator would
happily accept −280 into a world where Gehenna does not exist.

### Four bugs the descent found, all by running rather than reading

1. **Double vertical integration.** `if (!P.swim) P.pos.y += P.vel.y * hdt` was
   applying the fall velocity *on top of* the shaft's own write — measured at
   **83 m/s down a 41.5 m/s shaft**, arriving in three seconds instead of six.
2. **`gehGroundAt` asked about valley coordinates fired the player to y = 971.**
   `gehH` climbs 1.4 m per metre past r = 150, so asked about the pool it answers
   about +1000, and `Math.max` launched the body a kilometre into the air.
   `guardPlayerPosition` caught it on the ceiling clause — the right outcome by
   the wrong route.
3. **Three dead lighting lines.** The star opacity and the sun and moon
   visibility are assigned outright *after* the cave block, so the new underwater
   versions were silently overwritten.
4. **`releaseKeys` did not clear the new mobile rise input**, so a swimmer who
   paused mid-hold would keep rising.

**A hard constraint for the world build, measured:** `inBounds` passes at
600 + 190 and fails at 600 + 196, so Gehenna's radius must stay under 196 m.

### Bug 96 — The hunter tents came apart · FIXED

**Reported with a screenshot**, and the screenshot was unmistakable: the two
canvas slopes splayed outward into a V, like a book stood on its spine, with the
ridge pole hanging in the gap.

**Cause.** A rotation about z tilts local +y toward **−x**, so the panel on the
+x side needs a **positive** angle to lean its top in toward the ridge. The sign
was negated, so both panels leaned outward. With it corrected the top end lands
at (0, TH) and the bottom at (±TW, 0) exactly — the ridge and the two eaves, by
construction rather than by eye.

**And the back gable was invisible**, for a subtler reason: three.js applies
scale **before** rotation, so rotating the flattened cone 45° turned its
flattening axis with it and squashed the triangle along a diagonal instead of
along z. The rotation is gone and the gable is a triangle exactly as wide as the
tent.

Also from the same screenshot: the guy lines were 1.5 m long and nearly upright,
which put four spears against every camp — they are 0.95 m, properly angled, and
tied to visible pegs. The rolled door flap was a dark box that read as a slab
leaning on the tent; a roll is a cylinder.

### Bug 97 — The hunter camps had no light · FIXED

`addFire`'s fifth argument is a **light object** — it reads `light.intensity` to
get the flicker base — and 2.5.0 passed `true`. Assigning to `true.intensity` is
a silent no-op outside strict mode, so the new camps had a fire that lit nothing.
They use `vlight` now, the pooled kind every other fire in the valley uses.

---

## 2.7.0 — The after-story, and a save that could strand you on the opening moor

THE BAD ONE. The pause menu and its Save key button are reachable during the
six-second descent, and for the first 4.3 of those seconds the body sits at a
VALLEY y with Gehenna's horizontal offset - measured at (600, -57, 600), which
is a hundred metres inside a real hillside. That key restored, tripped the
fall-through detector, and put the player on lastSafePos, which on a fresh page
is the opening moor. 72% of the descent window, silent but for one console
warning. The seam correction was on the reader, where it can only see the last
1.7s; it is on the writer now, naming the rim that gehBeginDive already worked
out. That also makes the key correct in every build with no Gehenna in it.

gehSeed's validator accepted 1.5 and ten-digit values while the generator only
ever rolls an integer 1..999999 - and a fractional seed ends up inside fbm.
WS_SHARED now carries a comment explaining why it must stay booleans-only:
mainProgress coerces every shared key with !!, so a seed put in that list would
arrive as `true`, the re-roll would not fire because true is truthy, and
parseSaveKey would then reject every save key that player wrote afterwards.

netApplyState bounded a peer's x and z but not y - and the realm test added for
Gehenna reads y. A mesh parked at 1e300 is a matrix of infinities.

THE AFTER-STORY. Gehenna's writing, as a verified nine-edit patch. The Clerk
reads the threads people still hold you by, and every one states the
consequence the player never saw rather than the errand they remember. The boss
does not deal damage - she cuts threads, and says each name out loud as it
goes. The reveal is that Gehenna only ever severed one end: it worked on
everyone else because nobody up there remembered them, and it fails on you
because hundreds do. You surface to crickets carrying a written list of
everyone still holding on.

Every conversation is one press of E per line, with four unattended sequences
on one tracked chain that cannot fire on the frame that summoned it. It has
fallbacks, so it completes even before the world build and the enemy layer land.

---

## 2.7.1 — Ysolde cannot move on, and the children come to watch

Her hair was transparent with depthWrite off, so it sank into the body behind
it and read as smoke. It is opaque now - deliberately the one solid thing on a
figure that is otherwise a shape in the water at 0.55 alpha, which is what makes
her read as a girl rather than a shroud. It was also seated wrong: the old
cylinder was centred at 2.28 with its top at 2.51, above the crown of a head
whose centre is 2.35, so the hair floated clear of the skull and the cap sat on
nothing. Crown, fall and fringe are now built around the real head sphere.

Her lines are rewritten around attachment. Everything she says is a thing she is
still holding, and holding is the whole of what is wrong: there is somewhere
past this and she is too heavy to reach it. The attachments are to people and to
the world - the children she gave apples to, her father's face, the smell of the
mill at six, the elder tree she liked being up in. The doctrine is never named;
she only ever describes the door and the weight.

And she says plainly what winning does. "You think you are freeing me. You are
not." / "There is no onward for me. If you win, I simply stop." Nothing in the
game calls that a sin. It just is one, and the death line says so by refusing to
comfort: she goes under, not onward, and the children will not look at you.

The children are new. Up to four real village kids come down and stand well
back, facing the pool, and shout at you not to kill her - they knew her, she
walked them home, she gave them apples. They are never in the fight and they go
home when it is over, however it ended. They are the moral witness.

Also in: the save/multiplayer agent's verified fixes, and a stray agent probe
file that got committed by mistake is gone.

---

## 2.8.0 — The warden fight is meant to be miserable now

She does not wind up any more. A wraith telegraphs at 0.8s and she used to take
1.1, which with a 2.6s recovery made a four-second cycle you could read and
stroll away from. Her windup is 0.1-0.28s - the bear's cadence with the charge
taken out - and her recovery is 0.7s, 0.45s in phase three. Every third blow is
a lash with almost no tell that a dodge cannot answer; a raised shield still
stops it, because the point is to remove the move that trivialises a slow boss,
not to remove every move.

THE PULL. Periodically something past this world reaches for her and she fights
it: she floats up out of reach, nothing can touch her, the drowned arrive every
1.1 seconds the whole time, and she claws back down a little stronger for it.
Nine seconds, about a tenth of her health back. It is not a rest phase - it is
the one stretch where you are not fighting her - and it is the fight's whole
argument made mechanical: holding on is what has always kept her here, and she
would rather be in this than let go.

She flickers out constantly now (0.7-1.8s instead of 2-5) and she never leaves
the water: past 34m from the pool she breaks off and returns. You can run, and
dying sends you to a bed, but she is still standing there when you come back
and the fight picks up where it stopped.

The clock locks to midnight while she is up - no dawn to outlast, nothing to do
but fight - and when she goes under the night lets go and runs forty times
normal until the sun is properly up.

WRAITHS no longer keep office hours. They come by day too, and the rate ramps
with how close you are to being able to call her up: readiness is the finale's
own gate, four relics and eight villages, read as a fraction, so the pressure
and the thing it warns about are literally the same number. Daylight still
hurts them, at a third of the old rate, so a noon walk to the pool is a running
fight rather than a stroll.

CAMERA: the arm eases at 4.5 instead of 9 and the field of view swings twelve
degrees at 1.8 instead of eighteen at 6. The speed-driven zoom pumping on every
sprint and stop was most of what read as jarring.

TENTS: flat ground only. findSpot's slope test is a single sample and let a tent
stand across a hillside with a corner in the air; the four corners of the real
footprint are measured now, and 35cm of fall across the pitch is the limit.

---

## 2.8.1 — The pool is a whirlpool, and the stone stops asking

The three-option ending is gone. The stone by the pool no longer asks what
becomes of the valley - there was never a choice to make. You killed a girl who
could not let go, and what is left is to carry her out of the water and put her
in the ground. The stone says so and nothing else. WORLDSTATE.ending and its
validator stay in the save so old keys still load.

The way down was hold-sink-within-45cm-of-the-bed, which is why it read as
finnicky and why the player found it by accident. The open pool is a whirlpool
now: four nested cones turning point-down over a black throat, visible from the
bank, and it takes hold anywhere in the water - dragging you toward the eye,
harder the nearer you get, and downward the whole time. Holding rise still beats
it, so it is a current rather than a trapdoor, and the pool before it opens is
completely unchanged.

---

## 2.8.2 — Every arrow in the game flew sideways

Both projectile systems - the goblin archers' and the hunters' - build their
arrow as a cylinder and lay it along its flight path with a quarter turn at
construction. Then every frame they call lookAt, which REPLACES the quaternion
outright and throws that turn away on the very first frame. A CylinderGeometry
runs along its own Y and lookAt points the object's +Z at the target, so the
shaft ended up perpendicular to its own flight: a stick crossing the sky
broadside instead of a shaft going point first. One rotateX after each lookAt.

The whirlpool now waits for the burial rather than the unlock flag, which is
what was asked for: she has to be in the ground before the water turns. New
WORLDSTATE.ysoldeBuried carries it, wired through all four places a persistent
flag needs - the payload, the rb whitelist, applySave and WS_SHARED - so it
survives a save and reaches a friend. Nothing sets it yet; the burial quest is
the missing link and is being built.

---

## 2.9.0 — Gehenna is a place now

It was a black plane. It is a world: black water where you surface, a swept
road east, twenty-two identical flat-roofed houses in two rows, twenty seated
Unburdened who do not look up, a bench, a swept yard, and one hill with one
desk on it. The houses are identical because everyone here has been relieved of
the need to be told apart - which is also why they are three InstancedMeshes.
The girl on the bench wears the same bob, the same colour and the same
construction as the Drowned Warden, so you recognise Ysolde before anything
names her.

Lit from below: the hemisphere light's ground colour is ember, its sky half is
near-black, the sun is off. Four lines, no second pass. The ground's lighting
is baked into its vertex colours, because a plane whose normals all point up
receives nothing from a world lit from underneath and would read as a hole.

The Attached hold you rather than damage you and let go by themselves. Killing
one is possible precisely because it is never necessary.

THREE BUGS IN THE SHIPPED AFTER-STORY, all measured:
- GEHENNA.tick and GEHENNA.reset were never called from anywhere, so the whole
  after-story was inert: no chains advanced, no prompts appeared, the surfacing
  beat never fired.
- The Kindly One could never be reached. She registers at exactly the Clerk's
  position and the nearest-speaker scan keeps the first strictly-closer
  candidate, so on an exact tie the earlier registration wins forever. The Clerk
  said "I'll have to call my sister" and then nothing happened, at any number of
  presses.
- Its prompt sprites leaked about four SpriteMaterials per descent.

AND ONE THAT WAS WAITING TO TAKE THE WHOLE GAME DOWN: disposeTree disposed
Sprite geometry. Every Sprite in three.js shares one module-level geometry, so
tearing down a single prompt would have deleted the GPU buffer behind every E
bubble, quest mark and nametag in the game. Latent since removeEnemy existed.

Eleven seam bugs, all from Gehenna sitting at (600,600) which is INSIDE the
valley's own bounds: a mountainside's slope was being applied to your movement
on ash; insideCave had only an upper y bound, which also disabled the
fall-through net; wolf dens restocked the valley from below; discoveries
self-triggered; petals drifted through; fairy rings healed; the quest arrow
tipped at valley targets; the minimap painted your arrow onto grass; and
south-east villagers thought at full rate with their quest marks turned toward
a player under the floor.

Measured: +70 nodes on ~15,700. Two full descents leak nothing - nodes 0,
materials 0, vlights 0, EXTRA 0, npcs 0 - and the second teardown returns
exactly to the pre-descent count.

---

## Between 2.7.1 and 2.8.0 — The save regression that hid for three versions

My own trap, the one I have been warning every agent about all session. In
2.6.0 I tightened the gehSeed validator and wrote the explanation as a comment
in the MIDDLE of the line. That line carried four more assignments after it:

  spec.gehSeed = ...; // ...comment... spec.awokeAt = ...; spec.deep = ...;
  spec.ending = ...; spec.wolfChoice = ...;

The comment swallowed all four. pickObj walks `for (const k in spec)` and
silently drops every key the spec does not name, so for three versions a save
key carried no ending and no wolf choice. Finish the game, reload, and the pool
reverts, every closing line reverts, storyAct() falls from COMPLETE back to
FINALE, and dread() starts climbing again. Silent, with no error.

Found by the phase 3 agent while it was building something else. The four
assignments are on their own lines now, with the comment above them saying why
it must stay there. I scanned the whole file for the same shape: no others.

Also scoped routeGuide explicitly to the one objective that will use it —
carrying Ysolde to her grave. Everywhere else the arrow keeps pointing dead at
the goal, because an arrow that suddenly starts steering is a worse arrow.
