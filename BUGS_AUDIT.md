# old 2.22.1 bug audit

historical source review. line numbers pointed at `legend_of_peanits_v2.22.1.html`; they are stale now. none of these were live-play verified in this audit. later fixes are recorded in [the changelog](CHANGELOG.md), so the labels below describe audit-time severity, not current 2.24.0 status.

two reports were already fixed when this was written: relayed guest `ending` values were stripped, and the after-story was not double-ticked.

## progress/world corruption

- **A1: sleeping killed the goblin king and tobias's camp.** accept the camp branch or leave a living goblin king, then sleep in any bed. the sleep purge called `killEnemy` on story enemies. proposed fix: skip king/camp bodies and make other sleep removals quiet; guard story effects behind credited kills.
- **A2: a cleared wolf den refilled after load.** finish tobias's branch, save, load, then wait for restock. `wolfDone` loaded but `den.cleared` did not. proposed fix: rebuild the cleared den in `applySave` and quietly remove its generated wolves.
- **A3: grove heart returned after every load.** rescue 20 fairies, take it, save/load, and return. grove pickups were built after save application. this audit proposed moving the build earlier; the shipped fix instead remembers saved pickup ids and applies them when delayed pickups are created.
- **A4: a guest's old warden state could raise a living warden already marked dead.** join an early host with a post-warden save. proposed fix: fold the whole snapshot before transition side effects, and keep the host authoritative.
- **A5: peers could forge `ek:warden` or `finale`.** this could skip the boss or start it without relics. proposed fix: accept kill credit host→guest only and recheck the host's finale predicate.
- **A6: in-process load while carrying ysolde broke the world.** force browser storage failure, carry her, then paste a pre-warden key. proposed fix: clear carry, mourners and watchers before load, then rebuild the body/grave from final flags. the neighboring reconstructions also needed a backward-load check because several only handled flags turning on.

## visible problems

- **B1:** almoner death released the four people used by the matron fight. keep those groups separate.
- **B2:** multiplayer pause could leave held movement running. release inputs and stop local movement while overlays are open.
- **B3:** network enemy strikes skipped pierce, flurry and block stagger. send enough attack data and resolve it through one combat path.
- **B4:** mirrored wolves, wraiths and the warden could stay invisible after leaving/re-entering a snapshot. restore visibility on a living return.
- **B5:** the guest's distant-boss safety check kept moving the mirrored goblin king, then network interpolation pulled him back. exclude mirrors from that local relocation check.
- **B6:** ids were not tied to channels, so one guest could impersonate or remove another. bind the hello id to its peer and validate later messages.
- **B7:** pvp sent knockback and a big-hit flag that the receiver ignored. the proposed fix passes bounded knockback to `hurtPlayer`; the unused big-hit flag was also noted.
- **B8:** sleeping children were recruited as watchers, but the bed update kept moving them home. exclude sleeping, in-bed, and already-borrowed children, and respect a failed scene hold.
- **B9:** gehenna ash could trigger valley-water wading. make water/footstep checks realm-aware.
- **B10:** black-pool ripples were below the bed. draw them at the live surface.
- **B11:** killing a wraith during blink could leave it invisible. death/respawn must reset visibility.
- **B12:** the church plinth had no side collider and the north bay acted like a door. match colliders to the visible stone.
- **B13:** diagonal bridges had walkable air beyond their planks. match deck collision width to the mesh.
- **B14:** loading mid-procession reset the arrow behind the rear gate. the audit proposed seeding the route index from the nearest waypoint after restoring the carry; 2.24.0 later saved the route steps.
- **B15:** teardown cut off the queued second line after an early Gehenna exit. keep that chain alive through teardown or extend its two-second grace long enough for both lines.
- **B16:** rosabel's post-gehenna talk could start halfway through. use the existing keyed `walkLines` cursor.
- **B17:** real resource leaks existed in arrows, hero rebuild/death, peer tags, peer avatars, stumps, roasts and carry props. dispose removed trees/materials/maps; do not rebuild nametag textures for tiny healing changes.

## smaller findings

- **B18:** stale enemy caches could orphan attack rings. invalidate the enemy cache inside `removeEnemy`.
- **B19:** goblins spawned over the valley while the player was below. keep the cull, then return before spawning in gehenna.
- **B20:** `nearestPlayerTo` could return a dead or cross-realm local player. start with no target and seed only a valid player.
- **B21:** small proven cleanup: road-search budget reset per substep; watcher dialogue skipped line 0; sleeping mourners spoke; ledger reward lacked a `FOUND` guard; an enemy branch had identical arms; story validation ran twice; several write-only world flags remained; guest lift refusal was unreachable. the minimap cache also kept a reference to Gehenna's removed root.

## suspicions left open

1. `GEH.failed` may lock descent until reload after one build error. a real thrown build would settle it; clearing the latch on teardown/success is cheap insurance.
2. the goblin king had no switch case for `flee`, but the audit found no reachable way to drop the sunrise condition mid-sink.
3. the reported gehenna-to-valley teleport was still unexplained. `lastSafeGeh = (0,0,0)` was ruled out because the descent seeds it before it can be read.

## runtime work the audit could not replace

- repeat the grove-heart cycle and watch save rejection near the old 60-heart cap.
- join an early host from a post-warden save in two browsers.
- test multiplayer pause/held keys in chrome and firefox.
- inspect gehenna water and church collision across seeds.
- walk diagonal bridge edges.
- measure gpu memory during healing, reconnects, arrows and repeated deaths.

11 other reports were dropped as refuted or duplicates. the important ones: king kill credit did carry the king flag; `lastSafeGeh` was not the realm-teleport cause; and the hostile-guest siege theory contradicted the deliberate `gehDone` sharing rules.
