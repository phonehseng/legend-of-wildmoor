# Legend of Peanits 3.0 — Gehenna

The whole update, in the order it gets built. Every step ends in a build that
loads, runs, and is committed and pushed. Nothing is half-landed across a
commit.

The rule that shapes the order: **each step leaves the valley exactly as it is
today until the step that deliberately changes it.** The engine work goes first
precisely because none of it is visible.

---

## The shape of it

A single-file game gets a second world by adding a seam, not by rewriting the
first one. `DIVIDE = -200` is that seam. Above it, the valley — unchanged,
untouched, every predicate reading the same heightfield it always has. Below
it, Gehenna: its own heightfield, its own structure grid, its own floor, its own
safe position, built on unlock and torn down on leaving.

Terrain bottoms out at −26 m by analytic proof (`fbm ≥ 0`, so the base term
floors at `(0 − 0.42)·40 + (0 − 0.5)·16 = −24.8`, and the deepest carve in the
world is the tarn bed 1.2 m under that). A boot assertion measures the real
minimum over the 130,321 vertices the world is drawn from and screams if the
margin ever drops under 100 m. The proof is a fact every boot, not a memory.

---

## Phase 1 — The seam (invisible)

Nothing on screen changes. Every routed path is unreachable while Gehenna does
not exist.

1. `DIVIDE`, `GEH_VOID`, the `GEH` state object, `TERRAIN_MIN`, and the boot
   assertion over the terrain vertices.
2. `gehH` / `gehGroundAt` / `gehStructsAt`, and `stepH(x, z, y)` — the cheap
   heightfield router. `groundAt(x, z, y)` gets one comparison at the top and
   every existing call site routes itself for free.
3. **`terrainH` is never routed**, and gets a comment saying so and why: the
   terrain mesh is built from it; `isWater`/`isDeep`/`waterSurfaceAt` gate
   villager pathing, enemy siting, plants and footstep material; the minimap
   paints its water band from it; and the boss-relocation routine is harmless
   today only because it compares `terrainH` against the player's own y.
4. The four player-position consumers of `terrainH` that must route: `okMove`
   (without this the player is **frozen** in Gehenna — the single most fatal
   line in the file), the fall-through detector, the safe-position update, and
   the dive-damage test.
5. `guardPlayerPosition` per realm. The `y < -60` clause is **not** a duplicate
   of the fall-through detector — it is the net for when one of that detector's
   three exemptions is true and you are still falling. So it is duplicated per
   realm, never weakened.
6. Five depth gates, two of which are latent overworld bugs in their own right:
   `pushOutOfTrees` (a trunk shoving a body under its own roots — already wrong
   in the bear cave), `resolveStructs` (no lower bound at all), the particle
   ground clamp, the wraith spawner, and the boss-relocation belt-and-braces.

**Ships when:** five minutes of ordinary play is byte-identical, the boot line
prints a margin over 100 m, and `groundAt(0, 0, -300)` returns the void floor.

## Phase 2 — Water you can be inside

The Black Pool becomes swimmable on its own, and the valley's lakes become
divable the same day. This ships and is worth shipping with no Gehenna at all.

Swimming today is a surface float pinned to `y = −0.8` with `P.vel.y` zeroed —
there is no vertical swim in this game, which is why "swim up and down in the
pool" was never a tuning problem. `SWIM_VOLS` makes water a **volume** with a
top and a floor instead of one global waterline, space rises, the sink key
descends, and letting go floats you back up. The lake's behaviour is
byte-identical unless a key is held, because its float target is exactly the old
constant.

Closes the standing "give swimming a purpose" item for free.

## Phase 3 — The burial

The quest that opens the pool. Carry Ysolde from the water's edge to the spot
under the elder tree her mother said was always her favourite, and bury her.
That sets the unlock flag. The ending rework lands here too: the boss wails, the
world goes silent except for crickets, and the two choices stop being inert.

## Phase 4 — The descent

Not a swim, and it will not be described as one. A **drop shaft**: six seconds
of falling through water with the camera still rendering, the input still
steering and the breath bar emptying. Between the pool floor and Gehenna's
ceiling there is nothing to collide with, which is exactly why the Phase 1 depth
gates had to land first. Build runs async through the existing `__stage`
pipeline while you fall, so there is no loading screen; a failed build spits you
back out at the rim rather than dropping you forever.

## Phase 5 — Gehenna

The world: black and dark red, under the map, generated only on unlock. One
root group, a hard node budget with a console assertion, deterministic from a
seed, and a teardown that provably returns the scene to its pre-descent node
count. Houses, inhabitants, and the short after-story — a commentary on
suffering and attachment, not a second act of dungeon crawling.

The Clerk's room reads your threads back to you: not the errands as the game
stated them, but the consequences you never saw. A thread is a person holding
on. The reading is the whole mechanism, and it only works because the player
spent forty hours earning the list.

## Phase 6 — The abandoned church

A real, enterable building outside the kingdom. Empty, stripped, and abandoned
by God rather than merely old. Possibly a boss.

## Phase 7 — The horror layer

The valley getting worse as the pool angers: the sky leaning red, nights redder
still, days running shorter, the music slowing, villagers turning, and — the
irreversible one the user has explicitly approved — the hanged.

Everything reads one dread scalar derived from what the player has actually
done, so the valley at dread 0 looks exactly as it does today.

## Phase 8 — Save and multiplayer

Two persisted fields and no more: the unlock boolean and the seed. Everything
else regenerates. A save taken in Gehenna loads you standing at the pool rim
with the pool still open — deliberate, not accidental, because the position
validator would happily accept −258 into a world where Gehenna does not exist.

Multiplayer: the descending player's scene is their own. The unlock flag
propagates, so the other player can descend into their identical Gehenna. Two
one-line leaks get closed — the enemy broadcast filter is 2D and would mirror a
Gehenna creature into a valley, and the player nametag is depth-test-free and
would float over the grass while its owner is 280 m underground. Shared-realm
co-op down there is a separate epic and is not being promised.

---

## Standing rules for every step

- Only working builds are committed. The headless Edge load is the syntax check,
  the world build and the shader compile all at once.
- Every commit bumps the version and renames the file.
- Every bug gets a `CHANGELOG.md` entry naming the **cause**, not just the fix.
- New persistent state needs four edits or it is silently dropped: payload,
  whitelist, `applySave` reconstruction, `WS_SHARED`.
- Quest `title` strings are immutable save keys.
- Every line of dialogue is one or two short sentences. A longer thought is
  split across consecutive messages, never one block.
- `terrainH` is never routed by depth.
