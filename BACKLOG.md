# BACKLOG

Single ordered list of everything outstanding, most important first. Maintained by the
standing backlog manager — this file is the source of truth for what is still open.
File positions refer to `legend_of_peanits_v2.2.0.html` unless noted.

## How this is ordered

Items are sorted into five bands, and the bands are hard — a band-1 item always sits
above a band-4 item, however small the band-4 item is.

1. **Broken in normal play** — softlocks, dead inputs, things that look wrong on screen,
   quests that cannot be completed or that point you the wrong way.
2. **Wastes the player's time** — backtracking, unclear direction, missing prompts,
   progress you can lose. Engine stutter lives here too: a hitching frame is time taken.
3. **Missing feedback** — the player did something and the game did not acknowledge it.
4. **Polish and feel** — animation, colour, UI character.
5. **New content and systems.**

Within a band: smaller and independent beats larger and entangled, so cheap fixes clear
out fast. Dependencies are stated on the item and the blocker is always placed above it.

Source tags: **[user]** = reported from play. **[agent]** = found by a standing agent
(guardian / auditor / critics), not yet seen or requested by the player.

---

## Band 1 — broken in normal play

### 1. Four-option menus are keyboard-dead [agent]
- **Who/when:** standing critics — four found it independently. Carried in.
- **Size:** S · **Deps:** none
- **Where:** line 11431 — `if (n >= 1 && n <= 3)` in the `keydown` handler; `answerChoice`
  and the panel builder live around 12908–12930.
- The choice panel says "Press the number, or click." A four-option menu silently ignores
  `4`. One bound change, clamped to the live option count rather than a literal.

### 2. Outfit-change arrow points at the weaver, not at Wren [user]
- **Who/when:** user, current backlog.
- **Size:** S · **Deps:** none
- **Where:** the side-quest def at line 9087 (`vi: 0`, Highreach weaver) has no `target`,
  so the arrow falls back to `tracked.giver.pos` at 15623–15626. Wren's live NPC handle is
  `custWren` (11806, 11833), only non-null once you are already beside her.
- The quest sends you across to the kingdom and the only direction aid in the game points
  back at the person who sent you. Add a `target:` returning the fitting room's fixed
  position — not `custWren`, which is null until you have arrived.

### 3. `JOB_LINES.wagoner` is declared twice, so `TRADER_LINES` is dead [agent]
- **Who/when:** standing agent, carried in.
- **Size:** S · **Deps:** none
- **Where:** `TRADER_LINES` at 4989, `JOB_LINES` at 4995 with a `wagoner:` key on both
  4996 and 5017 — the later key wins.
- A whole barrel of written wagoner lines never reaches a player. Merge the arrays.

### 4. Subtitles cut off while the NPC is still talking [user]
- **Who/when:** user, current backlog. Named the King specifically, wants it for all NPCs.
- **Size:** M · **Deps:** none — but items 18 and 22 both build on `say()`, so this lands
  first and they inherit the fixed lifetime.
- **Where:** `say()` 13064–13080, `speak()` 13082+, durations in `TUNE.ui` 705–707.
- Long story lines are clamped to `storySubtitle: 8000` no matter how long the synthesized
  voice actually runs. Tie dismissal to the utterance ending, with the timer as a floor.

### 5. Goblins and the Goblin King stop dead at the water's edge [user]
- **Who/when:** user, current backlog.
- **Size:** M–L · **Deps:** none
- **Where:** goblin step-and-block at 10516 and 10540, the shared enemy `step` at 14720,
  `isWater` at 1856. Every enemy mover hard-rejects any candidate step where
  `isWater(nx, nz)` is true, so a pursuit simply halts on the bank.
- Reads as the AI breaking. Cheapest credible fix is path-around — slide along the bank
  toward the target — before attempting the swim version.

### 6. Nim does not path around the river walking home [user]
- **Who/when:** user, current backlog.
- **Size:** M · **Deps:** shares the water-avoidance thinking with item 5; ships alone
- **Where:** the `n.running` branch at 5816–5820; set up at 13376 when the beacon is lit.
- When `step()` fails she is lerped straight toward `runTo` — a slide through whatever is
  in the way — and after 25 s she is snapped home outright. The river is what fails her
  `step()`, so the failure path is what the player watches.

### 7. Cave site selector has no water test and picks a marsh lip [agent]
- **Who/when:** standing agent, carried in.
- **Size:** M · **Deps:** item 8 lands first or alongside
- **Where:** the `CAVE` IIFE at 2491–2521. Candidates are rejected on bounds, height,
  slope, and distance to elder tree / villages / river / path, then ranked **only** on
  `rough`. Of 34 survivors exactly one is fully dry.
- Wanted: a wetness penalty folded into the score, **not** a hard reject — a hard reject
  relocates the bear's den a long way and drags the trapper's camp (8898) with it.

### 8. `riverAt`'s width argument is shadowed by each segment's own width [agent]
- **Who/when:** standing agent, carried in.
- **Size:** S · **Deps:** none; blocker for item 7
- **Where:** line 1822 — `if (d < (sg.w || w) …)`. Every segment carries `sg.w`, so the
  caller's `w` is never consulted. `riverDist` (1839) asks for 40 and silently gets ~4.
- Not biting on this seed. It means every `riverDist(x, z) < N` guard in worldgen — the
  cave's `< 45`, the clearing's `< 8`, the checks at 2752 and 3440 — is far weaker than it
  reads, and on another seed the cave lands in a river.

---

## Band 2 — wastes the player's time

### 9. No auto-save and no Continue button [agent]
- **Who/when:** standing multiplayer/save auditor, carried in.
- **Size:** M · **Deps:** none
- Progress is only as safe as the player's habits. Three rotating localStorage slots and a
  Continue button on the intro panel. The highest-value item the auditor raised — losing a
  session is the most expensive waste of a player's time there is.

### 10. Hoist the seven per-villager closures and the `offs` literal out of the NPC loop [agent]
- **Who/when:** standing performance guardian, carried in.
- **Size:** M · **Deps:** none
- **Where:** the villager update loop, roughly 5400–6100 (`step`, home/stuck logic at 5545).
- ~360 closures allocated per frame — the single largest garbage source in the game.

### 11. Direct-mapped memo for `terrainH` [agent]
- **Who/when:** standing performance guardian.
- **Size:** S–M · **Deps:** none
- **Where:** `terrainH` at 1735; its own comment at 1739 already calls it the hottest
  function in the game. ~75% of its calls inside one `step()` are exact duplicates.

### 12. Share unit geometries in `boxM` / `cyl` / `sphere` [agent]
- **Who/when:** standing performance guardian.
- **Size:** M · **Deps:** none — **but this blocks item 32 (Gehenna) and the church**
- **Where:** `boxM` at 2911 and its neighbours; ~4,000 one-off geometries today.
- The guardian is explicit that this lands **before** the church and Gehenna, not after.
  Building a cathedral on the current allocation pattern bakes the cost in permanently.

### 13. Skip the cloud passes when `graphics.clouds === 0` [agent]
- **Size:** S · **Deps:** none
- 66 `Color` allocations per frame for geometry nobody can see.

### 14. Throttle `anyInteractableNear` [agent]
- **Size:** S · **Deps:** none
- **Where:** `anyInteractableNear` at 8747, called every frame at 15618 for one boolean —
  ~200 hypots per frame. A 100–150 ms tick is indistinguishable in play.

### 15. Pool goblins, wolves and wraiths instead of allocating per spawn [agent]
- **Size:** M–L · **Deps:** best after item 10 — same allocation work, same code paths
- **Where:** spawners at 10367, 10464, 12841 (goblins), 14749 (wolves), 14758 (wraiths).

### 16. The hermit should speak plainly right after the Black Pool wakes [user]
- **Who/when:** user, current backlog. Named the hermit; wants the rule applied to all
  important exposition.
- **Size:** S–M · **Deps:** none; reads far better once item 4 stops cutting him off
- **Where:** hermit content around 8056–8058 and the `hermitWarned` / `blackPoolAwake`
  beats (775, 789).
- The rule: short sentences, common words, one idea per line, for the beats the plot
  depends on. Flavour chatter can stay as ornate as it likes.

### 17. Shorten Hale's dialogue at the moment you catch him [user]
- **Size:** S · **Deps:** none
- **Where:** 13199 and 13209 (Hale on being accused), the King's verdict at 13152.
- This is the climax of the main quest and it currently stalls in text.

### 18. Dialogue log on `L` [user]
- **Who/when:** user, current backlog.
- **Size:** M–L · **Deps:** item 4 (fix the lifetime before building the archive of it);
  reuse item 22's palette rather than inventing a second one
- **Where:** new side panel alongside the existing ones; `say()`/`speak()` at 13064–13098
  are the capture point; key handler at 11427 (`L` is currently unbound); the tag strip at
  402 and the help line at 425 both need the new key listed.
- Every recent line every NPC has said, scrollable, Persona-5 styling. **Not purple** —
  the user called this out alongside the satchel and the quest log. It sits directly under
  item 4 because it is the safety net for anything still missed after that fix.

---

## Band 3 — missing feedback

### 19. Gifted items should fly from the giver to the player [user]
- **Who/when:** user, current backlog.
- **Size:** M · **Deps:** none
- **Where:** `grant()` at 8818 (its `FOUND` write is at 8825), `addPickup` at 8149.
- An icon that grows at the NPC, travels, lands on the player and fades. Today a reward is
  a line of text, and the player does not reliably register that they were given a thing.

### 20. Knights free Maren and haul Hale to the stocks, on screen [user]
- **Who/when:** user, current backlog.
- **Size:** L · **Deps:** none, but pairs naturally with item 17 — same scene, same visit
- **Where:** `freeMaren` called at 11238 and 12615; stocks pose handling at 5335–5337;
  Hale's NPC def at 7557, Maren's at 7563; the King's verdict line at 13152.
- The biggest story beat in the game currently resolves as a state flip. A knight walking
  over, an animation, and Hale marched across is the payoff for the whole investigation.

---

## Band 4 — polish and feel

### 21. Remove the "found" strip from the Tab stats [user]
- **Size:** S · **Deps:** none
- **Where:** `<span id="found">` at 463, written at 8825. Delete both and confirm nothing
  else reads `FOUND` for display.

### 22. Give each text block type its own colour — errands especially [user]
- **Size:** S–M · **Deps:** item 4 (both live in `say()`); do before item 18 so the log
  inherits the palette instead of growing a second one
- **Where:** the `#subs .sub` variants at 96–115 — `.story`, `.fairy`, `.dark`,
  `.discover`, `.level` all exist and are all violet-family; `kind` is threaded through
  `say()` at 13064.
- Errands have no `kind` at all today, which is exactly why everything reads as one voice.

### 23. Re-skin the satchel so it feels like a satchel [user]
- **Size:** M · **Deps:** none
- **Where:** `#inv` markup at 403, `.satchel` / `.satchel-body` CSS at 180–181, and the
  shared purple panel chrome at 248 that it inherits.
- Leather, stitching, canvas — anything but the shared violet panel.

### 24. Re-skin the quest book as an adventure-game quest log [user]
- **Size:** M · **Deps:** none
- **Where:** `#questbook` at 388 (already structured as a two-page book), `.quest-version`
  at 302, `#quest li.tracked` at 53, render at 8724–8742.
- The book structure is already there; only the colour is wrong.

### 25. `SAVE_V` as a named constant with a real migration table [agent]
- **Size:** M · **Deps:** none; preferred before items 26–29
- Unlisted fields are silently dropped on load today. Doing this first gives the validator
  items below somewhere to declare their ranges.

### 26. Tighten the `P.bonus` validator ranges [agent]
- **Size:** S · **Deps:** item 25 preferred
- Currently accepts values the game can never legitimately grant.

### 27. Bound the unbounded save arrays [agent]
- **Size:** S · **Deps:** item 25 preferred

### 28. Validate avatar state numerically [agent]
- **Size:** S · **Deps:** item 25 preferred

### 29. Bind peer ids to their channel [agent]
- **Size:** M · **Deps:** none

---

## Band 5 — new content and systems

### 30. Give swimming a purpose [user]
- **Who/when:** user, current backlog.
- **Size:** L · **Deps:** none mechanically; feels far better once item 5 stops enemies
  treating water as a wall
- A location reachable only by swimming. The mechanic is fully built — `P.swim`, speed and
  breath scaling at 601–606, hero swim pose at 4601–4622 — and rewards nothing.

### 31. Condense `project notes` and fold the 3.0 plan into it [user]
- **Who/when:** user, current backlog.
- **Size:** M · **Deps:** none; **blocker for item 32**
- 2,098 lines today. The 3.0 track works out of this brief, so it is worth condensing
  before Gehenna work goes deep rather than after.

### 32. 3.0 Gehenna — the whole update [user]
- **Who/when:** user, current backlog.
- **Size:** XL (epic) · **Deps:** item 12 (shared geometries, explicitly before the
  church) and item 31 (condensed brief)
- A separate track is already running on this. Kept here as a single line so the backlog
  stays honest about what is outstanding; it is not broken down here.
