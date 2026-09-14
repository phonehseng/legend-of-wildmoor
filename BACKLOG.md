# old backlog

historical only. this list was written against `legend_of_peanits_v2.9.0.html`; line numbers and open/closed status are stale. some items shipped in later releases. use [the changelog](CHANGELOG.md) for what actually landed.

the old order was: broken play, wasted time, missing feedback, polish, then new content. `[user]` meant a play report; `[agent]` meant a code-review finding.

## broken play

1. four-option menus ignored key 4 `[agent]` — fixed by checking the live option count.
2. the weaver quest arrow pointed back at her `[user]` — it needed wren's fixed fitting-room position.
3. duplicate `JOB_LINES.wagoner` keys hid `TRADER_LINES` `[agent]` — merge the arrays.
4. subtitles ended before speech `[user]` — dismissal needed to wait for the utterance, with the timer as a floor.
5. goblins stopped at water `[user]` — bank pathing was the first useful fix; swimming enemies were larger work.
6. nim slid through the river on her walk home `[user]` — her failed-step path needed the same route logic.
7. cave selection favored a wet marsh lip `[agent]` — score wetness instead of hard-rejecting it.
8. `riverAt` ignored its width argument `[agent]` — segment width shadowed the caller's value.

## wasted time

9. no autosave or continue button `[agent]` — three rotating browser slots were proposed.
10. the villager loop allocated about 360 closures per frame `[agent]` — hoist helpers and literals.
11. repeated `terrainH` calls needed a small direct cache `[agent]`.
12. primitive meshes needed shared unit geometry `[agent]`.
13. cloud work still ran when clouds were off `[agent]`.
14. `anyInteractableNear` did about 200 distance checks every frame `[agent]` — a 100–150 ms tick was enough.
15. enemy respawns allocated new meshes `[agent]` — pool goblins, wolves and wraiths.
16. the hermit needed plain language after the pool wakes `[user]`.
17. hale's caught-in-the-act speech was too long `[user]`.
18. recent dialogue needed an `L` log `[user]`, using the same timing and color rules as live subtitles.

## missing feedback

19. gifts needed an icon flight from giver to player `[user]`.
20. maren's release and hale's arrest needed to happen on screen `[user]`.

## polish

21. remove the found strip from tab stats `[user]`.
22. give story, errands, discoveries and other text their own colors `[user]`.
23. make the satchel look like leather/canvas instead of a purple panel `[user]`.
24. make the quest book read like an adventure log `[user]`.
25. replace the loose save number with `SAVE_V` and real migrations `[agent]`.
26. tighten `P.bonus` save ranges `[agent]`.
27. bound save arrays `[agent]`.
28. validate avatar numbers `[agent]`.
29. bind player ids to their connection `[agent]`.

## content

30. give swimming a place only swimming can reach `[user]`.
32. build gehenna `[user]` — tracked in the now-superseded [3.0 plan](PLAN_3.0.md).
