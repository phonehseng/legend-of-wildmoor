# Changelog

all notable **Legend of Peanits** changes live here. newest first.

## 2.24.4 — the little river

[screenshots + download](docs/updates/2.24.4.md) · [test notes](docs/QA_2.24.4.md)

- lucifer now has the full robe/cape look, hand glow, and new hand-throw pressure.
- the pride room now has a living, swimmable river and an orphanage that gives the kids a place to move.
- party flow in lucifer’s room now follows the new retry/spectate rules, and stamina is finite in that room.
- camera transition is softer around portals and forced turns have the slower cap.

## 2.24.3 — keep the pages you found

[screenshots + download](docs/updates/2.24.3.md) · [test notes](docs/QA_2.24.3.md)

- reading a long church page could make your save key fail to load. those keys work again, and the save editor keeps the whole page too.
- guests get the same perfect-dodge openings and creature shield rules as the host. the warden's lash keeps its piercing effect. pvp still checks shield facing.
- map and satchel pictures sit above stats, quests and logs in the left-hand controls list.
- huge mouse jumps from pointer locking are ignored, so one bad event cannot whip the camera around.

## 2.24.2 — his hands open

[screenshots + download](docs/updates/2.24.2.md) · [test notes](docs/QA_2.24.2.md)

- lucifer grows beneath the hand, then shrinks through three phases as the children speak. he gives up his plan and survives. stay or move on is still your choice.
- the matron and kindly leave clearer openings in their fights.
- fairy quests, rescues and rose upgrades are personal, even when joining a party already in progress.
- guests who never went below return to solo wildmoor when the host moves on. they keep their own progress without getting the host's gehenna completion.
- the save editor reads current saves and keeps the newer quest, skill and story fields.
- restored the 2.23.0 camera. the see-through character effect stays local to each player.

## 2.24.1 — take the road west

[screenshots + download](docs/updates/2.24.1.md) · [test notes](docs/QA_2.24.1.md)

- more lights along the still kingdom's road and central tower. the kingdom and lucifer's river room are in this build.
- the abandoned church moved far west, with a new hermit errand that opens the black pool fight and more of his history with hale.
- shared story errands, story rewards, quest highlights, and co-op gehenna bosses. the finder returns quest items; optional rewards stay personal. outfit and goblin quest givers swapped.
- one carrier and a visible burial for the whole party. smoother movement updates, 16-player capacity, and optional host-controlled pvp.
- fixed shared clues and missing hearts, guest hit practice, bear wake-ups, swimming targets, forbidden respawn beds, blocked-storage loads, failed joins, old network snapshots, and character cleanup.
- this release kept the existing ending to get the kingdom out sooner. 2.24.2 adds lucifer's surrender and keeps fairy rescues personal.

## 2.24.0 — The Still Kingdom

this release finishes Gehenna and the ending, then cleans up the valley, combat, quests, procession, menus, saves, and multiplayer issues found while testing it. see the [visual update](docs/updates/2.24.0.md) and [measured QA notes](docs/QA_2.24.0.md).

### Gehenna and the ending

- Gehenna now runs through six chapters, with clear boss objectives, shorter conversations, and quiet markers for the next important person. the quest book orders the killings while the characters give them weight.
- The Still Kingdom has a long central road, huge buildings, and eight still residents the player can push aside and speak to. the valley no longer shows through the expanded view, and overlapping pavement no longer flickers.
- Its central portal leads to a white room with children playing beside a living riverbank. Lucifer cares for lost children and talks about Ysolde's absence.
- Lucifer starts at human size. after his invitation, he runs toward God's approaching hand and grows to hold it up. attacks shrink him and lower the hand. his last attempt to shelter the player ends with both of them crushed, then credits and **Stay / Move on**.
- Lucifer uses browser speech with the player's voice setting. other Gehenna conversations stay silent. **Stay** returns the player to Wildmoor as a translucent ghost with their skills, and the pool offers the ending again. **Move on** shows a modern life without Ysolde.
- Added walkable exit stairs, unlimited Gehenna stamina, maximum view distance, and quest/log pages for the current realm. the Almoner has half his previous health.

### Movement, combat, and the valley

- A stable camera arm keeps the chosen angle, with a silhouette when the player is hidden and a distance cap inside Lucifer's room. wall avoidance, shake, and bob no longer steer the view against movement.
- Wraiths and goblins separate from each other, and distant wraiths return near the player. opacity flicker and sky/prompt rendering order were corrected.
- Night slimes respawn from a smaller pool. accepting the three-slime errand creates its targets, and arrows follow the nearest slime or the current outfit errand destination. guests ask the host for slimes with acknowledgements and duplicate protection.
- Ambient goblin and slime spawning stops during the Warden fight. the Warden no longer heals. the finale adds a nearby fairy ring, voiced ascent, and Fairy Queen lines.
- Stamina actually recharged now trains endurance, blocking practice lowers shield cooldown, and Rose Rest gets much stronger as more fairies return.
- The tarnished ring no longer counts as Hale evidence. the third-clue line fires only when crossing the threshold, so later clues do not repeat it.
- Corrected the gathering shawl's bend, reserved Wren's home, and standardized hunter tents. hunters stay awake and return to campfires to cook and sit.
- The Rose Compass gets its own icon, badge, dialogue, and recommendation. map and satchel shortcuts are clearer, and dialogue history is labelled **Logs**.
- Ysolde's grave stays hidden until the Warden falls. carrying her uses the right pose, blocks conflicting actions, and makes the children look away.

### Procession, menus, and saves

- The procession guide now follows rear gate, Hale, grave, bed, then black pool, saving each step. Wick and the hermit have lines along the way.
- Hale's arrest gives lines time to finish. after the Warden, the slower overworld music returns and Ysolde's father's house closes. his bed orientation/height and the player's bed height were corrected.
- Solo menus pause the game and share one angular style.
- Saves cover the new progression and **Blocking** practice. older Gehenna rewards regain their canonical labels and completed stages, so sanitized apostrophes cannot reopen finished objectives.

## 2.23.0 — Three save breaks

three single-player progress bugs were confirmed during the save audit. the measured results are below.

### Bug 129 — sleeping killed the Goblin King and finished Tobias's errand · FIXED

sleep cleanup sent the King and camp goblins through the normal credited kill path. it now leaves them alone and quietly removes only ordinary goblins. the check kept both special groups alive, `campLeft` at three, and credited goblin kills at zero.

### Bug 130 — every reload brought back the Grove's Heart · FIXED

the grove was built after save restoration, so the restore had no Heart pickup to mark as taken. delayed pickup creation now checks the remembered saved ids, leaving one Heart record that is already taken and preventing max health from rising on every reload.

### Bug 131 — a cleared wolf den refilled on load · FIXED

loading restored `wolfDone` without restoring the den's cleared state, so wolves returned and the quest could never finish again. the load now restores both states; the measured save has a cleared den and zero wolves.

## 2.22.1 — two reported logic bugs

both came from source review and were confirmed before the fixes.

### Bug 127 — Gehenna's story clock ran twice as fast · FIXED

the main loop ticked the same Gehenna object through two names, doubling every timer and bypassing the descent guard on one path. the duplicate call is gone, so one clock runs and the dive guard works.

### Bug 128 — a guest could end the host's story · FIXED

the host accepted and relayed a guest's ending data, so stale or crafted guest state could finish the session for everyone. guests now take ending state only from the host, and the host strips it from guest saves before applying or relaying them while keeping normal sync alive.

the double-tick report had the right result but only one literal `GEH_SCRIPT.tick` call existed; the second path used `gehSay()`.

## 2.22.0 — The Matron at her cart

- Moved the Matron's post to her cart, where players leaving the hill actually meet her and her four protected residents surround her as intended.
- Bug 126 · **FIXED:** the Almoner treated `seated` and `grieve` residents as available, removing the Matron's charges and capping her tier. those states are excluded now, so all four survive.
- Attack timing checks now account for hitstop; direct state timers confirmed the written windups, set-down distance, and 12 hp/s regeneration.

## 2.21.0 — The Matron

- The existing cart speaker becomes the boss. waking her four charges permanently moves the fight through five tiers, raising the damage she takes. leaving the corridor heals her, while refusal lets the player walk through safely.
- Her tier-0 **Bar** attack throws without damage, her reward grants one max heart, and her death opens the room of twenty-eight names.
- Fixed two misplaced seats and a one-frame guard delay during vulnerable moves. the exit was tested and was never gated by this fight.

## 2.20.0 — The Unclaimed and the room behind the water

- Added the Unclaimed, a boss whose heat and attacks answer the player's recent damage. slow, restrained attacks cool it; heavy pressure makes it copy the player's weapon, while refusal remains safe.
- It has no health bar. its reward raises running speed, so it still helps players who already earned the fairies' dash upgrades.
- Bug 125 · **FIXED:** blocking during the heap's update fed `stun` back into its saved state and froze it forever. state restoration now returns it to recovery and later attacks continue.
- Rebuilt its sixty pieces as twelve instanced meshes, cutting its scene-node cost without changing the pile.
- Cleared rocks out of waterfall sheets, gave deep falls enough throw to make dry space, and added the Seat Behind the Water with an explicit pickup id. a buried Heart Piece was moved into reach.
- Pickups and herbs now fly to the moving player and clean themselves up. five distant hanged silhouettes appear only at high dread, away from homes and children.

## 2.19.0 — The purple is gone

- Reworked the satchel, quest book, pause and choice panels around black, bone, gold, and bronze. icons carry the color, headings use tabs, and 3D quest markers match.
- Fixed phone-width overflow, the three-column pause layout, and overlays drawing above open menus. removed dead lavender rules while keeping intentional layered theme rules.

## 2.18.0 — The possessed valley and Gehenna journey

- Completed the eight-beat 3.0 chain. after burial the valley keeps sending bounded enemies and possessed dialogue until the player descends; it clears below the seam and returns with a grace period.
- Town spawns use wraiths so enemies cannot be trapped inside buildings. denless wolves move correctly, and dialogue memory is tracked per pool.
- Added the Porter, Matron, Bel, Caller, lodge, hatch, cart, yard, queue, hill crossing, and the quiet room with twenty-eight names. edit scripts now reject insertions that would delete their own anchor lines.
- Known issues at release: exit choices had labels without player lines, prompts leaked a material per speaker per descent, two carts sat close together, and knights' early dialogue gate hid their dread lines.

## 2.17.0 — Hale's arrest on screen

- Knights now free Maren, interrupt Hale, walk him past his pyre, and place him in the stocks while nearby villagers react. leaving trips a watchdog; a load resolves the scene before applying the key. the map pauses it solo and mutes it online.
- Bug 123 · **FIXED:** the four child witnesses kept idle jobs and black-pool homes forever. scene holds now stash and restore every changed field, including home.
- Bug 124 · **FIXED:** crowd separation could push Hale off the stocks. his post is now fixed.
- Adjusted dialogue pacing so the crowd can speak and moved Hale close enough to the pyre for the stop to read clearly.

## 2.16.0 — NPC culling and a misplaced mother

- Bug 122 · **FIXED:** Nim's mother's logical position moved to Thornback but her replacement mesh stayed at world origin because distant NPC ticks never ran. the mesh is synchronized immediately.
- Hiding distant NPC roots cut the measured median frame from 17.6 ms to 15.6 ms without hiding anything visible. cloud tint, light-pool filtering, and step-fan allocations were also removed.
- Tests found no useful win in rewriting the interaction scan, light pool, HUD, minimap, or interior culling. village building draw calls and static scenery matrices remain the largest measured renderer opportunities.
- A ten-minute run found only bounded lazy initialization, with no continuing scene, geometry, material, or pickup growth.

## 2.15.0 — The Queen's Thorn

- Renamed the Fairy Queen's Tear to **The Queen's Thorn** while keeping the old `tear` save key, so existing saves migrate without losing the relic.
- Added quiet evidence that saving Maren denied the pool a second sacrifice, plus linked details between Hale and the hermit. no character states the answer outright.
- Bug 121 · **FIXED:** save sanitizing removes apostrophes, so possessive item names missed their icon rules and showed crates after reload. those rules now accept both spellings.
- `church:hale7` still shows a crate because its carving text does not match the icon rule.

## 2.14.0 — The Almoner and dialogue log

- Added the Almoner: a non-hostile Gehenna boss whose rounds remove burdens from seated residents. the encounter, reward, refusal path, and reset behavior were measured.
- Bug 119 · **FIXED:** the distant-boss relocation used the player's realm and could pull a living Gehenna boss into the valley. relocation now checks the enemy's realm.
- Bug 120 · **FIXED:** guest Gehenna hits were sent to same-numbered host valley enemies while the local boss took no damage. below-seam combat now resolves locally, and boss bars obey realm boundaries.
- Added the dialogue log on `L`, with speaker color, timestamps, choice history, scrolling, and a 400-entry cap. fixed missing choices, duplicate story lines, and absent Gehenna speaker names. the log stays in memory and is not part of pasted saves.

## 2.13.0 — Ring, goblins, and Nim's road home

- Bug 116 · **FIXED:** the ring gem inherited the band's world transform twice and floated above it. its child-space position now rests on the band.
- Bug 117 · **FIXED:** goblins rejected every shallow-water step and froze at brooks. they now wade through shallow water, use bridges, and turn away when deep water defeats the chase.
- Bug 118 · **FIXED:** Nim circled a lake, then teleported home. she now follows a new graph of the existing roads through gates and over bridges. the measured route had no water or sinking frames.
- Kept goblins out of deep water and left villagers on their existing local movement system.

## 2.12.0 — Hush, burial, subtitles, and autosave

- Bug 113 · **FIXED:** the Warden death handler set `wardenDead` before a transition requiring it to be false, so the hush and next story beat never ran. a one-shot now owns the sequence and releases its watchers.
- Bug 114 · **FIXED:** burial restored only two of six fields changed on mourners, retiring workers forever. recruitment now stashes and restores their full job state.
- Bug 115 · **FIXED:** a guest could inherit `ysoldeLifted` without the local carry state, then become solo and lose both lift and burial paths. interaction now follows local carrying and restores the visible body when needed.
- Subtitles follow the browser voice, with a minimum display time and a cap for stuck speech. stopping a voice also cancels its remaining chunks, so they cannot speak over the pause menu.
- Added autosave and **Continue**. saves are checked before replacing the previous key, with writes on safe checkpoints and a three-minute backstop. unsafe moments are blocked with a reason; any session that has been a guest keeps its shared progress out of the player's own autosave.

## 2.11.0 — Gehenna map and realm fixes

- Bug 108 · **FIXED:** swim buoyancy canceled the whirlpool pull above the dive trigger. current frames now suppress the float target, making descent reachable without holding sink.
- Bug 109 · **FIXED:** valley sea detection leaked below the seam and launched players upward across it; recovery then sent them to the valley. Gehenna now returns a dry sentinel for valley water checks.
- Added a separate Gehenna minimap with exit markers, corrected its lighting, and made guidance and peer arrows respect the current realm and descent shaft.
- Bug 110 · **FIXED:** guests returned after mirroring host enemies, so their separate Gehenna had no AI. they now simulate only their own below-seam enemies.
- Bug 111 · **FIXED:** flat distance let enemies chase players in the other realm. target selection now checks depth realm first.
- Bug 112 · **FIXED:** guests always displayed two players because they only store the host peer. session status now uses the shared participant count. the code allowed eight guests plus a host; that was a source finding, not a live nine-player test.
- Gehenna still ran separately for each player. STUN-only connections had no TURN fallback, and competing answers to one join offer could fail silently. those connection issues were left untested and unchanged here.

## 2.10.0 — Burial makes 3.0 reachable

- Built the Warden aftermath through carrying, burial, the King's request to rest, and sleep opening the whirlpool. saves restore the carry; lifting and burial are host-owned. the possessed valley arrived later in 2.18.0.
- Bug 102 · **FIXED:** the final objective waited on an ending chooser with no callers. the dead objective and chooser are gone while old ending saves still load.
- Bug 103 · **FIXED:** the carried body matched the generic nearby-NPC prompt forever. the prompt now excludes it like interaction already did.
- Bug 104 · **FIXED:** daybreak started on the death frame. it now begins after the hush.
- Bug 105 · **FIXED:** local Warden throws dropped knockback arguments while network throws kept them. local strikes now pass the launch strength.
- Bug 106 · **FIXED:** dodge invulnerability canceled pierce attacks. pierce now bypasses roll immunity but respects ordinary post-hit immunity.
- Bug 107 · **FIXED:** the 2.8.2 arrow rotation suited bare goblin arrows but turned grouped hunter arrows nose-down. hunter groups now keep their correct forward axis.

## 2.9.3 — Rebuilt church and safer saves

- Rebuilt the abandoned church as a larger road landmark with an arcade, gallery, chancel, crosses, and a climb reachable with the base jump. Hale's pages remain reachable and pickup ids stay unchanged.
- Bug 100 · **DOCUMENTED, NOT YET FIXED:** `riverDist` honors each registered segment's narrow width instead of the caller's radius, so broad distance checks equal `isWater`. changing it would move seeded pickups and needs a major-version migration.
- Bug 101 · **FIXED:** `STORY` save data was assigned without validation. fields and their real runtime types are now checked, including errand baselines.
- Debug keys and the missing changelog span were restored.

## 2.9.2 — Story pass

- Replaced Ysolde's Gehenna bench figure with a rope seller. the Clerk explains her absence; the rope seller reveals to the player that their character was a king who walked away. the character already knew that past.
- Hale's church pages trace his unanswered faith into the sacrifice. the Fairy Queen helps her children without grieving or trying to keep them.
- Added smaller connective lines and kept the unresolved Gehenna route as the known blocker at that time.

## 2.9.1 — Save editor and reachable Ledger

- Bug 98 · **FIXED:** edited save coordinates used a guessed height that recovery treated as underground and sent players to the opening moor. edited locations now snap to safe ground while game-written keys stay byte-identical.
- Bug 99 · **FIXED:** the Kindly One kept winning an exact speaker tie after her fight, hiding the Clerk forever. finishing now removes her from interaction so the Ledger arrives after the Clerk's eight lines.
- Added the save-key editor and verified the existing Gehenna work around it.

## Unreleased — NPC behavior and ground cover

- Disabled scattered grass, flowers, ferns, reeds, and mushrooms at the player's request. the code remains commented out; bushes and trees stay.
- Bug 1 · **FIXED:** repeated alpha textures wrapped opaque blade bases onto the tips, making a floating cross; tall reeds made it stand out. alpha cutouts now clamp instead. mismatched quads and wind shear were ruled out.
- Bug 2 · **FIXED:** plant instances used a tiny stale bounding sphere at world origin and popped together. frustum culling is disabled for that batch.
- Bug 3 · **FIXED, critical:** a hunter's `break` exited the entire NPC loop and froze everyone after him. it now continues only that hunter and still snaps him to ground.
- Bug 4 · **FIXED:** unemployed villagers wandered only at night. they now move while waiting for daytime work.
- Bug 5 · **FIXED:** shoreline avoidance tested too close to the NPC to distinguish directions. it now looks ahead and always allows a drier escape step.
- Bug 6 · **FIXED:** stuck recovery adopted the trap as a new home. unsafe recovery points are rejected and the original hut remains the fallback.
- Bug 7 · **FIXED:** the keep had no recorded door, so eviction had nowhere to send intruders. its south opening is now registered.
- Bug 8 · **FIXED:** an NPC already inside a building could not take a step toward its exit. movement within the same interior is allowed while walls still collide.
- Bug 9 · **FIXED:** a boolean `allowInside` let an NPC spawned in one room enter every room. it now records the specific allowed interior.
- Bug 10 · **FIXED:** keep exclusion used ungrown dimensions, placing targets inside the expanded hall. the checks now scale with the hall.
- Bug 11 · **FIXED:** personal-space pushes ignored water and walls. every shove now validates its destination.
- Bug 12 · **FIXED:** the right-of-way flag was cleared before neighbors read it. the extra assignment is gone, restoring doorway priority.
- Bug 13 · **FIXED:** town workers had no huts and stayed outdoors overnight. they now receive the nearest usable house and bed.
- Bug 14 · **FIXED:** `stay` never gated wandering, so quest givers left their markers. it now holds both wander branches and validates idle targets.

## 2.0.2 — stabilization

- Bug 15 · **FIXED:** accepting the Hollowmere fairy errand after finding 24 or 25 fairies made its two-new-fairies target impossible and blocked the finale. its baseline clamps and repairs old saves.
- Bug 16 · **FIXED:** the Safari shader callback exists only in newer three.js. r128's real diagnostics now trigger the flat-color fallback and remember it.
- Textured terrain now defaults to on. the graphics preference version changed so older flat-ground defaults do not silently override it.

### reviewer regressions fixed

- Bug 17 · **FIXED:** the keep door did not move with the grown hall and landed inside it. it now scales with the room.
- Bug 18 · **FIXED:** adding that door made the keep a valid panic shelter. hide searches now exclude it explicitly.
- Bug 19 · **FIXED:** the new shove water check blocked any NPC already in shallows. it rejects only moves that make their footing wetter.
- Bug 20 · **FIXED:** escaping NPCs could move sideways through shallow water forever. escape now requires genuinely dry ground.
- Bug 21 · **FIXED:** thirty frame errors stopped the loop permanently and hid saving. the loop now backs off for two seconds and resumes; Bug 32 later limits those retries.

### animation pass

- Added a shared damped-motion helper and changed player legs, NPC limbs, enemies, opacity, headings, and attack tells to continuous targets.
- Bug 22 · **FIXED:** sixteen hard leg-rotation writes made the player's pose snap at state changes. one eased write now blends every state.
- Bug 23 · **FIXED:** slide entry teleported the hip 0.65 m. it now eases.
- Bug 24 · **FIXED:** a slide leg pierced the ground during the hip transition. its angle now solves against current hip height.
- Bug 25 · **FIXED:** walk phases froze mid-stride. phase continues and amplitude eases into idle.
- Bug 26 · **FIXED:** the sitting pose set both arms, then overwrote one. both now remain posed.
- Bug 27 · **FIXED:** wolves, wraiths, and the Warden snapped headings. rotations now ease.
- Bug 28 · **FIXED:** goblin arms/body and the bear head popped through attack phases. telegraphs now ease while staying readable.
- Bug 29 · **FIXED:** wraith opacity jumped between four values and terrain following lagged. both transitions are smoothed.
- Bug 30 · **FIXED:** the early NPC pose advanced phase without applying limbs. it now poses fleeing, seated, and elevated villagers correctly.
- Bug 31 · **FIXED:** waterside workers lost their shore-rescue exemption when turning home. rescue now follows both job and phase.
- Bug 32 · **FIXED:** fault retries reopened the overlay forever and still blocked saving. recovery hides it, guards position, and stops after five retries.
- Bug 33 · **FIXED:** slide clearance ran while standing and splayed both legs. it now runs only during slides and resolves sides independently.
- Bug 34 · **FIXED:** air slash, dive, and climb damped legs twice. they now contribute targets to the single write.
- Bug 35 · **FIXED:** early posing ignored seats and stocks. it now honors those poses.
- Bug 36 · **FIXED:** bow posing overwrote seated and kneeling arm targets. it now joins the same target calculation.
- Bug 37 · **FIXED:** recovery still hard-set wraith opacity, leaving the largest jumps. recovery is damped too.
- Bug 38 · **FIXED:** the final fault retry could fail silently. bounded storms always show their last error.
- Bug 39 · **FIXED:** blocked wolves held a full frozen stride. stride amplitude now follows actual movement.

### hunters keep the night watch

- Hunters patrol around camps, fight goblins, fetch deer, haul them home, sit, cook, and keep bows ready through the night.
- They also take short naps out of sight, waking early if a goblin approaches. their night range and fire rate are lower because villagers cannot be hurt.
- Bug 40 · **FIXED:** abandoned deer never received a respawn timer and could vanish forever. every abandoned fetch or haul now releases prey, with a watchdog.
- Bug 41 · **FIXED:** dusk converted `go` and `work` but missed `fetch` and `haul`. those errands now release cleanly at nightfall.
- Bug 42 · **FIXED:** combat took an early path before applying bow arms. hunters now draw their bows while fighting.
- Bug 43 · **FIXED:** a second home branch still pulled hunters away from watch. both home paths exempt them.
- Bug 44 · **FIXED:** the common fetch-stuck path bypassed the first deer repair and left claims set. all four exits now use `releasePrey` with suitable delays.
- Bug 45 · **FIXED:** deer respawn timers advanced only near the player. countdown now runs before distance culling.
- Bug 46 · **FIXED:** patrol points could land inside buildings. camp searches reject interiors and structures.
- Bug 47 · **FIXED:** tents could block roads. placement now rejects path overlap.
- Bug 48 · **FIXED:** `aiming` could stay latched when another arm pose won. it clears once at the start of each tick.
- Reduced nap reach from 90 to 25 so hunters can reach their tents before the nap timer expires.

## 2.1.0 — Villagers sleep in beds

- Villagers now choose nearby beds, walk inside, lie down, and wake at first light while the miller's permanent sleep stays intentional.
- Bug 49 · **FIXED:** `asleep` returned before any wake transition. ordinary sleepers can now get up.
- Bug 50 · **FIXED:** the player used an unscaled mattress height and slept inside grown beds. lie height now follows the room.

## 2.1.1 — Multiplayer and presentation fixes

- Bug 51 · **FIXED, regression:** guest hunters targeted hidden host mirrors and shot empty space forever. enemy searches now skip hidden mirrors.
- Bug 52 · **FIXED:** guests never culled stale mirrors, and disconnect made all of them live. mirrors expire for everyone and are deleted on drop.
- Bug 53 · **FIXED:** a guest accepted permanent ending state from any peer. guests now accept it only from the host; Bug 128 later closes the host relay path too.
- Bug 54 · **FIXED:** loading reloads the page and drops multiplayer. the game now warns first.
- Bug 55 · **FIXED:** an unbounded enemy snapshot could exhaust a guest. snapshots have finite coordinates and 64-goblin/32-extra caps.
- Bug 56 · **FIXED:** crafted reward or discovery names could reach prototype properties and throw after consuming a pickup. validation uses own properties and callable rewards.
- Bug 57 · **FIXED:** one unanswered finale request latched forever. guests can retry after 20 seconds.
- Moved tents out of settlements, animated the flames and matching light at valley hearths, corrected hunter bow direction, and made level-up notices gold.

## 2.1.2 — Performance and behavior

- Bug 58 · **FIXED:** one enemy cull path removed scene nodes without disposing geometry or materials, likely adding to Safari memory failure. disposal was added there; Bug 73 later finds and closes the dominant death path.
- Made terrain height queries about one-third cheaper without changing results.
- Bug 59 · **FIXED:** the ±126° step fan could not turn villagers off a peninsula. prolonged blocks now open a full-circle escape that remembers direction.
- Bug 60 · **FIXED:** slimes woke after sixty wall-clock seconds. they now activate when the hermit introduces them.
- Bug 61 · **FIXED:** growing the hall moved house meshes but left cached bed positions behind. beds now follow their rooms.
- Bug 62 · **FIXED:** the beacon had interaction text but no nearby prompt entry. it now shows `E`.
- Spread the investigation out: the ring stays at the pool, the cloth sits along the road from the mill, and the ritual site is farther back from shore.

## 2.1.3 — One waterline

- Bug 63 · **FIXED, regression:** scaling bed lie height made players and villagers float. the unscaled geometry height was correct and is restored.
- Bug 64 · **FIXED:** predicates used water y 0.3 while the visible plane was 0.1, classifying dry shore as lake. all systems now share one waterline; the cave's lake-edge siting remains a known placement issue.
- Bug 65 · **FIXED:** fog tinted wraith health bars into invisibility. bars ignore fog and render after the glow.
- The Goblin King waits for hero level three, and Nim's mother's dialogue points to the elder tree.

## 2.1.4 — Nim, the miller, and old oddities

- Nim's quest now uses two conversations. the beacon enables her marker and walk home, then the guide points to her mother.
- Bug 66 · **FIXED:** Ysolde's father used the wrong bed direction and an ad hoc pose that cut through the house. he now uses the shared bed system and stays asleep by design.
- Bug 67 · **FIXED:** a bear killed during hit flash stayed white forever. death clears emissive state once.
- Bug 68 · **FIXED:** wolf bodies were stretched across X while every feature faced Z. the body now follows its actual length.
- Level gains now announce themselves.

## 2.1.5 — Top backlog items

- Removed the champion's house, shelf, sign, and reward at the player's request, keeping its old save flag readable. the weaver errand arrow now points at Wren.
- Bug 69 · **FIXED:** number-key choices stopped at three. input now follows the actual option count.
- Bug 70 · **FIXED:** a duplicate wagoner line table overwrote the trader pool. the pools are merged.
- Bug 71 · **FIXED:** the beacon randomly dropped to one-third brightness each frame. it now breathes on slow sine waves.
- Bug 72 · **FIXED:** knights targeted wraiths they should not fight. knight searches and existing targets now skip them.

## 2.1.6 — Complete enemy disposal

- Bug 73 · **FIXED:** the earlier leak fix only covered a tail path, missing normal dead enemies and attack tells. every removal now disposes owned resources while preserving shared ones.
- Bug 74 · **FIXED:** the Goblin King required overall level three, so untrained swimming could block the main quest. the gate now uses the four land skills.
- Bug 75 · `waterSurfaceAt` still used a literal waterline. it now reads the shared constant; behavior is unchanged today.

## 2.1.7 — Bark, footsteps, ghosts, and Ysolde

- Bug 76 · **FIXED:** falling trees replaced textured bark with flat white material and leaked their copy. they now clone the right appearance and dispose it after the fall.
- Added stronger chopping feedback as a tree nears falling, plus separate grass and sand footsteps.
- Bug 77 · **FIXED:** no grass surface existed and the whole town disc counted as stone. real paved footprints now choose stone and lawns choose grass.
- Ghosts keep pursuing, the Drowned Warden is revealed as Ysolde, `M` works from stats, and the old Found strip is gone.

## 2.2.0 — The seam under the world

- Added the depth seam, ground and movement routing, separate safe positions, and a terrain-margin check for a world below the valley. `terrainH` stays valley-only.
- Bug 78 · **FIXED:** tree and structure collision had no lower bound and pushed bodies far below them. both now stop beneath a safe depth.
- Bug 79 · **FIXED:** Nim's mother received a woman's mesh but kept a random man's voice. her NPC voice fields and display name now match; quest title save keys stay unchanged.
- Bug 80 · **FIXED:** berry and washer kneels moved the torso without its sibling head and arms. the whole upper body now bends around one pivot and releases during panic.
- Bug 81 · **FIXED:** saves moved Nim's logical position but not her distant mesh, leaving her on the shore. all manual relocations synchronize immediately.
- Bug 82 · **FIXED:** corpse fading assumed every extra enemy had `e.mat` and could crash the frame loop. the write is guarded.

## 2.3.0 — The valley sours

- Added a dread value from saved story progress. it drains daylight color, reddens nights, shortens days, slows music, and changes villager lines as the story worsens.
- Bug 83 · **FIXED:** an unconditional pool-awake dialogue return hid eleven King, Hale, and champion lines for half the game. it now shares the pool probabilistically.

## 2.3.1 — Satchel sprites

- Bug 84 · **FIXED:** broad, badly ordered icon rules misread fairy names, possessives, the woodcutter's drink, and candle clues, while some keepsakes had no rule. specific matches now run before generic fallbacks, and grave matching respects word boundaries.
- Added twenty-nine item sprites, hover descriptions, and a panel close button.
- Bug 85 · **FIXED:** clues lived in both `FOUND` and `ITEMS`, so rendering showed two slots. inventory renders each once without changing saves.

## 2.4.0 — The abandoned church

- The old SwiftShader smoke test parsed the whole file but stalled during worldgen. hardware GPU runs now finish the world build, so later construction is actually exercised.
- Added the first enterable church, with an emptied font, stripped candle sockets, broken roof, rooks, ledger, and raised paths. its four books use explicit pickup ids.

## 2.5.0 — Hunters and a fairer Warden

- Bug 86 · **FIXED:** random lore-book creation changed implicit pickup indexes every boot, marking the wrong items in saves. lore uses stable explicit ids and no longer renumbers permanent upgrades.
- Bug 87 · **FIXED:** the Warden appeared in both `EXTRA` and `bosses`, taking duplicate damage and corrupting spread. she is listed once.
- Bug 88 · **FIXED:** distant-boss relocation put the Warden into unsupported `chase`, freezing her in terrain. wraith bosses are excluded.
- Bug 89 · **FIXED:** her fixed pool height let her attack through raised banks beyond player reach. she now follows the higher of water and terrain.
- Bug 90 · **FIXED:** dread updated twice a second using one frame's `dt`, making it hardware-dependent and about thirty times too slow. it now uses real elapsed time.
- Moved hunters farther into forests and rebuilt their tents with a ridge, open doorway, and fire outside. their night patrols now center on camp, within reach of the nap routine.
- Bug 91 · **FIXED:** Rose Rest's stillness and enemy-distance rules kept resetting its warm-up after the pool woke. it now heals passively while moving or fighting, at one heart per fifty seconds.
- Added finite checks for peer state and hit positions, capped avatar creation, and stopped wraiths spawning inside houses or blinking during the Warden's rise.
- Restored the church rooks' one-shot behavior on load and corrected the chancel sill collider. unknown discovery ids now drop without rejecting the whole save, and item icons check names before body text.

## 2.5.1 — Persistent settings and fair leveling

- Bug 92 · **FIXED:** sensitivity, volume, voice, and guide settings lived only in save keys and reset on plain reloads. they now persist as local preferences and take priority over settings in pasted keys. the sensitivity slider also reaches lower values.
- Bug 93 · **FIXED:** overall level used the minimum of six skills, letting unused swimming hold the whole character at level one. swimming now adds weight without becoming a hard gate; land-level story checks remain land-only.
- Bug 94 · **FIXED:** the opening knight advanced behind online pause menus and spoke as a silent subtitle. he now waits while menus are open.
- Bug 95 · **FIXED:** hunter fires passed `true` where a light object was required. they now use pooled valley lights.
- Reverted the wraith knockback and spawn-pressure nerfs made while investigating a camera complaint. the camera comparison showed unchanged code; lost sensitivity settings explained the report.

## 2.6.0 — Swimming volumes and descent

- Replaced one waterline with volumes that support surface, depth, current, breathing, drowning, and dry regions below the valley.
- Added the initial descent route and runtime checks that found four internal issues before release.
- Bug 96 · **FIXED:** tent canvas rotations leaned both panels outward and malformed the gable, lines, pegs, and flap. the tent now closes around one ridge with readable supports.
- Bug 97 · **FIXED:** hunter campfires used a boolean instead of a light object. pooled lights now flicker correctly.

## 2.7.0 — After-story

- Save keys made during the first 4.3 seconds of descent used a valley-height body inside a hillside and reloaded at the opening moor. saves now record the pool rim during the full dive.
- Restricted `gehSeed` to generated integers, kept it out of boolean-only `WS_SHARED`, and bounded peer y coordinates so realm checks cannot receive infinite matrices.
- Added the Clerk and Kindly One after-story. the Clerk reads the people still connected to the player; the boss cuts those threads without direct damage, and the player returns with a written list when hundreds of ties make her method fail.
- Dialogue advances one press at a time, unattended beats cannot fire on their summon frame, and fallbacks let the chain finish before the full world or enemy layer exists.

## 2.7.1 — Ysolde and the witnesses

- Rebuilt Ysolde's hair around the real head as the one opaque part of her drowned figure. her dialogue now explains that attachment makes her too heavy to move on, and killing her makes her stop rather than freeing her.
- Up to four real village children stand safely outside the fight, ask the player to stop, and return home afterward. they are witnesses, never combat targets.

## 2.8.0 — A harsher Warden

- Shortened the Warden's windups and recovery. every third lash defeats a dodge but still answers to a shield.
- Her pull phase lifts her out of reach, summons drowned enemies, and restores about a tenth of her health before she claws back down stronger. she stays near the pool, keeps her health if the player runs or dies, and locks the encounter at midnight.
- Wraith pressure now runs by day and scales with finale readiness; daylight still weakens them. after her death the night releases into fast daybreak.
- Softened camera arm and field-of-view changes, and measured all four tent corners so camps cannot float across slopes.

## 2.8.1 — Whirlpool and silent stone

- Removed the old three-option valley ending prompt while keeping its save field for old keys. the stone now asks the player to carry Ysolde out and bury her.
- The opened pool becomes a visible four-cone whirlpool that pulls across the water surface and down toward its eye. rising can still beat the current.

## 2.8.2 — Arrow orientation

- Corrected bare arrow cylinders after `lookAt` replaced their construction turn. the later grouped-hunter regression is recorded as Bug 107.
- The whirlpool now waits for saved, shared `ysoldeBuried` state instead of the earlier unlock flag.

## 2.9.0 — Gehenna becomes a place

- Replaced the black plane with black water, an ash road, twenty-two identical houses, twenty seated Unburdened, a bench, swept yard, hill, and Clerk's desk. Ysolde's matching figure sits where the player can recognize her.
- Lit the world from below with baked ground color. the Attached hold and release the player instead of dealing damage, so fighting them is optional.
- Wired the previously inert Gehenna tick/reset, fixed the Kindly One losing an exact speaker tie, disposed prompt materials safely, and stopped shared Sprite geometry from being destroyed.
- Fixed eleven cross-realm leaks involving valley slopes, caves, wolf dens, discoveries, petals, fairy healing, quest arrows, minimap position, and distant NPC work. two full descents returned node, material, light, enemy, and NPC counts to baseline.

## Between 2.7.1 and 2.8.0 — save regression

- A comment placed midway through the save spec line swallowed the `awokeAt`, `deep`, `ending`, and `wolfChoice` declarations. `pickObj` then silently removed them, so completed saves could reload before the finale with rising dread.
- The four declarations now have separate lines and the file was scanned for the same shape. route guidance was also limited to carrying Ysolde so normal quest arrows stay direct.
