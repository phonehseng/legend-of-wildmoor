# old ending plan: the round comes up the road

historical. the game ships a different ending; [2.24.2](docs/updates/2.24.2.md) has the current version. this draft stays here because several story ideas may still be useful later.

## why he goes down

he buries ysolde, sees the water open, and assumes she went below. the porter treats arrivals like stock and warns that wildmoor's long pause in deaths must end. the almoner teaches the player to hit a hand reaching for somebody else. the clerk finally says there is no page for ysolde, or even a blank page. with his reason gone, the player keeps helping whoever is in front of him.

on the walk out, the caller's board fills with the people in the player's ledger. someone has gone to collect them before they die. the player made the valley safer, then dismantled the staff that handled arrivals slowly. the board and ledger use the same list, but nobody explains the connection.

## the old spine

the fights built up the cost of continuing:

1. the attached would let go after four seconds. fighting it was free, pointless, and unrewarded.
2. the almoner tended four strangers. he was invulnerable while healing the player and vulnerable over someone else. defeating him stopped the rounds and left those four holding on.
3. the unclaimed held eight hundred years of removed grief. breaking it let the porter return small lost things, but made the coming round heavier. refusing it kept the round smaller and left the porter unable to help. neither choice got a score or announcement.
4. the kindly one cut the player's ties. fighting her meant keeping the names, and her failure revealed that the people above had never let go. defeating her left nobody to cut the threads.
5. the matron came last, after the ledger, on the walk out. waking her four charges permanently returned their grief. she healed when the player left; they did not. her death opened the room of twenty-eight names.

gehenna offered the valley relief, and tired people could say yes. most would forget what hurt. the people holding hardest could become rooted like the attached. hale was never vindicated: he correctly saw that nobody was holding the door, then chose a smaller person to pay for it. the player taking the thing back down had to expose that choice, without calling his own death another payment.

## planned ending beats

- **below:** the machine has stopped and the board fills. the clerk cannot read the date on the player's calling, so she sends him up without filing him.
- **surface:** the water is lower. grateful dialogue begins on existing villagers before the threat arrives; their thanks echo the ledger's threads.
- **arrival:** the round offers relief and the valley queues. the miller forgets why an empty room hurts.
- **three witnesses:** the king offers his crown and the player refuses it. the hermit has no third answer, and hale sees the valley consent to something he never asked permission for.
- **goodbyes:** every npc the player speaks to after the round starts quietly enters a set. there is no counter.
- **road fight:** the player drives the round backward along the burial route while villagers walk with him. it reaches for the ledger's top four names. if the almoner died, another man wears his coat; the game never explains the replacement. anyone reached by it forgets, without a score screen.
- **cord fight:** at the hollow, the coat falls and what was inside comes out of the cart in cords. each cord carries a name from the player's ledger. heavy hits break cords, say "That one is off you," and shorten the ledger. the player is cutting his own ties to survive.
- **down:** after ninety seconds or when a third of the ledger remains, the stair opens. the player gives the ledger to the miller and takes the thing below. maren objects, then lets him go. hale finally sees the choice he could have made himself.
- **answer:** the king orders everyone to kneel. the valley keeps a beacon pointed at the water. rosabel remains in her forest and speaks to nobody about what happened.
- **clerk:** below, the clerk writes the player's page from memory. she has a place for him, but still none for ysolde.
- **stone:** months later, an empty second grave bears every name from the goodbye set, in conversation order. the letters get smaller as the mason runs out of room. the last line appears, then credits.

## last-line idea

the draft specified **HE WOULD NOT SET ANY OF US DOWN**, carved below the names before credits.

the village means it as praise. it also echoes the player's promise to set everything down after the valley is settled, and the clerk's warning that everyone says "afterwards." the line needed to carry both readings without a speech explaining them.

## old build order

1. add dialogue for the reason and the coming round.
2. add homecoming gratitude on existing characters.
3. add a new `road` ending key, accepted by both save and network validators. keep old `bind`, `break`, and `fairy` keys readable, rebuild the finished world, and skip the usual heart reward because the player is dead.
4. show the coming danger in the valley.
5. track the goodbye set and put its names on the final stone.
6. build the road fight along the reversed burial route, using the arrest walker because procession mourners do not walk. prototype a body-blocking wave fallback if the full almoner port is too costly.
7. build the cord fight with separate hittable cords and a changing ledger. use instancing from the start.
8. handle dying without the normal `die()`/respawn path. hold input until fade owns the screen.
9. add a plain full-screen credits overlay.

multiplayer would keep the round and cords host-owned, send the outcome to guests, and reuse the burial authority pattern. guests could fight the existing shared waves. the plan assumed no new cutscene, camera or timeline system: every beat had to fit an existing procession, fight, dialogue chain or choice. the separate planned epilogue stayed outside this build.

## ideas cut from that draft

- a three-option turn where every answer did the same thing.
- a late-arriving master who explained the doctrine.
- calling the player's death a second payment; that would make hale's sum look correct.
- bringing the fairy queen to deliver the theme at the water.
- flooding gehenna and making the player walk it twice.
- a miller line that required him to remember after the round had taken that memory.
- adding more to the already-finished matron room.
- any visible tally for the round, goodbyes, or spared heap.
