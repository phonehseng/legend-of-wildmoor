The Gehenna sections of CHANGELOG.md and the game code were checked for this design. The hermit's "paying its rent in blood… we forgot the tenant" line is present, and the second-stone/goodbye claims check out.

---

# THE FINAL DESIGN — "The Round Comes Up The Road"

Foundation: **The Ledger Is The Door** (24.0). Grafted: the doom-is-a-mercy from *the-almshouse-expands*, the intake inversion from *the-leak*, the goodbye-set/second-stone from *the-king-returns*, and the whole surface staging and half the mouths from *the-second-payment*.

---

## 1 · THE WHY

**He came down to fetch one girl, did not find her, and helped everyone else instead. That is his whole life, compressed into one night, and it is also exactly how the valley ends up in danger.**

Five stages. Not one of them is addressed to him.

**Stage one — he already has a reason and it is wrong.** He buried Ysolde with his hands and the water opened the next morning. A decent, ignorant man draws the obvious line: *the door opened because she is down there.* He is not going to hell to be brave. He is going to fetch a girl home. Nobody plants this. The burial chain already did.

**Stage two — the Porter, at the hatch, doing stock control.** Three lines added to `buildPorter`, straight after his existing forecast, in the same bored voice:

> "It builds up in the meantime, mind. It doesn't go anywhere."
> "One of these days somebody'll have to go and fetch it."
> "Not me. I'm intake. I stop at the hatch."

His shipped lines already do the rest — *"Nothing off Wildmoor in years. That's good news, that. Means they're all still up there."* / *"It stops, mind. Every place stops. I'll get the lot of you in one bad year and then never again."* The player hears a man complaining about shelving. He has just been given the entire doom, its cause, and its timetable, by somebody with no reason to be wrong. **The cause is the player: Wildmoor stopped dying because he made it safe.**

**Stage three — the Almoner, and it is a reflex, not a reason.** A man kneels over one of the Attached, the Attached says no, and there is nobody else on that road. He swings. No XP, no kill line, no reward, and nothing on screen says he did right. He is not conducting a campaign. He is failing to walk past things. *This stays unreasoned and it must.* What it does instead is teach the player the grammar of the round, three hours before the round comes up the road with names in it.

**Stage four — the Clerk, on the hill.** *"I do not have her. There's no page. There isn't a blank page."* The reason he came dies eighty metres from the only door out. And a decent ignorant man with no reason left does the only thing he has ever done: he stays, and he helps whoever is in front of him, and he carries a tired man's slip up a hill.

**Stage five — the Caller's board, on the walk out.** This is where the why becomes a thing he will die for, and it is a man delighted about a workload. `callerAfter()` is a five-element array; replace it:

> "Board's empty. Look at it."
> "I've nothing to do. I don't know the word for what that is."
> "…hold on."
> "It's filling."
> *[the names, read out — `buildThreads()`, the player's own save]*
> "That's a place. That's a whole place at once."
> "I've had that twice in eight hundred years. Both times it was a war."
> "They're not dead, mind. I don't get them till they're dead."
> "Somebody's gone out early."
> "Well. Good. It's work."
> "Go on up. Tell them I'll do it properly."

The board and the Ledger are generated from the same array. **The list of people he is about to die for and the list of people who bind him are one document, in two mouths, and nothing anywhere remarks on it.**

What the player at the keyboard assembles and the character never will: every mercy he performed down there took a working part out of the only thing that was doing the job slowly. The Almoner was the rounds. The Unclaimed was the weight. The Kindly One was the instrument. The Matron was the hands. He took all four apart out of kindness, and now there is only one way left to settle an eight-hundred-year account, and it is to go where the other ends are.

---

## 2 · THE SPINE

Built order, which is the order the code enforces — `gehMatronWatch` is gated on `gehDone`, so **the Matron is last, on the walk out.** That is better than the brief's order and this is built to it.

**The engine: every officer he puts down is a withdrawal, and the house makes it up in bulk. Nothing tells him. The Porter's shelf empties and the Caller's board fills, and he walks past both.**

**0 · THE ATTACHED — the reflex, and it is free.**
On the road from arrival. No XP, no kill line, no reward, and it was going to let go by itself in four seconds. *Costs:* nothing, which is the point — the first fight in Gehenna is free and pointless and he does it anyway. *Teaches:* his reflex is running down here and it buys nothing.

**1 · THE ALMONER — the work. Costs four strangers.**
No attack state. Invulnerable while he heals *you*, vulnerable only kneeling over one of the Attached. Every blow lands in a hand reaching for somebody else. Standing still does not kill you; it costs you all four. *Teaches:* helping and harming are the same gesture here and you cannot tell from inside which one you just did. *The withdrawal:* the rounds stop. Four on that road hold on for ever.

**2 · THE UNCLAIMED — the weight. Costs eight hundred years, or nothing.**
Rooted, silent, never initiates, answers only what you give it; at the top tier it copies your own last blow. The optimal play is ninety seconds of deliberately playing badly. **It is the only thing in either world that has actually finished.**

***What refusing it means, and it is two-sided and silent.*** Refusal works completely, exactly as built, and nothing acknowledges it. But it is not neutral, and neither is breaking it:

- **Break it** and `GEH.heapDown` is set — and `porterAfter()` runs as written: *"I'm taking them round. Door by door… Woman at the eleventh house had a wooden bird."* The quietest kind act in the game is only reachable because you smashed the thing that held it. And the weight is loose. **The round comes up one tier heavier.**
- **Refuse it** and `porterAfter()` loses its round entirely. Two lines replace it:
  > "Nothing to take round. It's all still out there in the heap and I can't touch it."
  > "I'd have liked to. Eight hundred years and a set of hands."
  The weight stays in one piece, and **the round comes up one tier smaller.**

Neither is named, neither is scored, and **no player can ever see both.** The cold act unburdens the valley; the kind act re-binds it and buys an old man one good afternoon. That is the only shape this game's morality is allowed to take, and it costs **zero save edits** — `FOUND.some(t => t === UNCLAIMED_GIFT)` already persists (written at 15097, the string at 18614).

**3 · THE KINDLY ONE — the refusal. Costs the last argument.**
He does not start this one; the Clerk cannot finish the reading and calls her sister. He is being *processed*, and he fights her **to keep the names** — thematically the strongest motive in the game and the one place the player's swing means "no." Her shipped death line is the hinge the whole doom hangs on and it currently pays off in nothing:

> "It only ever cut your end. Didn't it."
> "Eight hundred years, and they were all still holding on up there."

**The book has never balanced. Not once.** Eight centuries of relief and not one person up top was ever relieved of anybody. *The withdrawal:* nobody left can cut anything.

**4 · THE MATRON — the fee. Costs four people, permanently.**
Last, on the walk out, standing among the four she defends, with her cart between him and the water. She tells him the lever herself. Waking one is permanent, they never stop grieving, and **she heals when you leave the corridor and they do not.** *Teaches the thesis of the ending:* the one who does the hurting recovers and the hurt do not — and twenty minutes later, above the seam, he will do the exact reverse and nobody will connect them. Her death opens the bricked room: twenty-eight names, cut by the only soul down there who wrote down who anybody was, unasked.

**What escalates is not health. It is how much of the world he has to be willing to break to keep walking**, and it runs: nothing → four strangers → eight hundred years → the only person kind to him → four people who were at peace. Four mercies, four legs kicked out. After the Matron nothing in Gehenna is being counted at all, and the Sweeper still sweeps.

---

## 3 · THE DOOM

**The almshouse is coming up to do Wildmoor's round. Not to invade it. To relieve it. It is free, it works, and the valley will say yes.**

Plainly:

- God left. Nobody holds the door. Hale measured that and was right about it: *"There is nothing above the thing under that water. There is only us… somebody must pay the rent."*
- For eight hundred years the door stayed shut because the work got done — a soul came down, a page was opened, read, cut, closed. **It was never a price. It was a rate.**
- **The valley stopped dying.** Maren lives, the goblin king is dead, the bear is dead, the roads are safe, the children came home. *"Nothing off Wildmoor in years."* The player did every bit of that and it was right every time.
- **Ysolde was not an intake. She is a tear in the paper** — no page, no blank where a page would go. A book with a hole in it cannot be made to balance by any amount of further work.
- **And the staff is dead.** No rounds, no hands, no instrument, no weight.

So there is exactly one way left to settle it, and someone downstairs has finally noticed you do not have to wait for a person to die to take their suffering off them. **The round comes up the road.**

**Nobody is killed. That is the horror.** Wildmoor is not burned; it is *swept*. The miller stops dreaming of her. Maren does not remember being three hours from a fire. Bel's mother becomes one more woman who does not know her. Everyone alive, warm, tidy, content, nobody suffering, ever again — and it is offered, and they are asked, and they queue.

**And it has a second face, for the ones it cannot take gently.** The Attached down there are the doctrine's failures: people who would not let go and calcified around it. The ones in Wildmoor who hold hardest — the miller, Maren, Tobias, whoever *this* save made love him most — do not get relieved. They root where they stand and they hold, for ever. **The people who love him most are the ones it cannot do kindly.** Shown once, on one woman, in two lines of narration, and never explained:

> "There is a woman on her own doorstep who will not put down what she is holding."
> "By the time you come back down the road she has stopped moving."

**Hale is not vindicated by one inch.** He diagnosed an empty universe correctly and then decided he had the right to choose who paid, and he chose in the wrong currency — he thought it wanted a life, and he could have walked into that water on any morning of forty years, and he found somebody smaller. He is about to watch the alternative performed by a better man and it will cost him the only thing he had left, which was the sum.

---

## 4 · THE ENDING

Eleven beats. Every one is a `chainSay`, a procession, a fight, or an `askChoice` — the four things this engine has staged successfully.

---

### A · BELOW — the machine stopped *(exists; one insert)*

The Matron's room. The Porter's shelf. The board filling. Then, inserted into `clerkAfter` between `giveLedger` and the existing *"Go up. The water will let you this time."*:

> Clerk: "One more thing and I'll let you go."
> Clerk: "Your calling. The front of it."
> Clerk: "Eight hundred years, and I have never had one I couldn't read."
> Clerk: "I can't read the date on yours."
> Clerk: "So I'll not write you down as anything. Go up, love."

Then her shipped closer, untouched: *"And the sweeper — don't tell him. Let him sweep."*

She does not know what an unreadable date means. The player works it out in four seconds. He never does.

---

### B · SURFACING *(exists; one line added)*

`gehDone`. The siege ends on its own. Keep both shipped lines and add a third:

> "The valley is black and warm and loud with crickets."
> "Every one of them is still holding on. You can feel it from here."
> "The water you came up through is lower than the water you went down into."

---

### C · THE VALLEY COMES OUT — thanks, not a eulogy

A `GRATEFUL` pool on the possessed-line machinery, keyed on `gehDone && !ending`. **This lands before the doom, so it is gladness and not a wreath.** Every line is one of the Ledger's threads, spoken in the first person by the person inside it — the same facts the Clerk read out as consequences, said as thanks, and the game never chooses between the two readings.

> Potter: "I kept one back for you. It's on the shelf. It'll keep."
> Healer: "Eleven fevers off three herbs. Two of them children."
> Lookout: "I watch the valley now. I used to watch the sky."
> Ferryman: "I row in the dark by feel now. It's better."
> Washerwoman: "My linen's out at night again. That's not nothing."
> Smith: "Nine years and nothing worth sharpening. Nine."
> Sir Corrin: "The spear is still better. Take the sword anyway."
> Weaver: "The colours are still wrong. Come back and I'll fix you."
> Gate guard: "We've four names for you and we've stopped arguing."
> Tobias: "I've not forgiven you. I'm here, though."
> Wick: "I went back to that shore. Stood in it. Once."
> Maren: "I've never said your name out loud. I say it inside my door."
> Nim: "I'm not lost. I want that written down."
> A child: "Da says we all did a good thing and this is the thanks."

---

### D · THE DOOM ARRIVES, AND THE VALLEY SAYS YES

The pool drops over a day. `POOL_HOLLOW` is already built and hidden.

> "The pool is going down."
> "By noon it is a hollow of wet stones with a stair in the floor of it."
> "The stair has been there since before there was a kingdom. It is open."
> "A cart comes up out of the stones, and nobody is pushing it."
> "Behind it, in no hurry at all, a queue."

And Wildmoor thanks him for opening the way:

> Villager: "You went down and you came back up. Nobody's ever done that."
> Villager: "They came up after you. They've been ever so patient with us."
> Villager: "They asked. That's the thing. They asked first."
> Maren: "I've had nothing to treat since noon. Nothing at all."
> Maren: "I keep going round asking. Everyone's fine. Everyone is just fine."

**And the miller, who has already had his round done**, because the house is kind and goes to the worst case first — and the worst case in this valley is a father who cannot sleep:

> Miller: "I slept. Straight through."
> Miller: "First time since she went in the water."
> Miller: "I can't bring her face up any more. That's all right, isn't it?"
> Miller: "I'd ask you her name, only I don't suppose you'd know it either."

He is asking the one man alive who has it. The Clerk has no page for her. **He is the last place she exists**, and he does not know that either.

---

### E · THREE MEN WHO KNOW THE SHAPE AND CANNOT HELP

**The King**, who has never had an answer:

> "They queued. I watched my own people queue."
> "I could not think of a reason to stop them."
> "My steward thanked me on his way past."
> "I have not got an argument. Have you?"

Then he does the one thing that makes this ending hurt, without knowing:

> "Sit down. No — sit there. In it."
> "I am too old to dress it up, so I shan't."
> "You have never once told me your name and I am asking you anyway."

`askChoice`, two options, both wrong:
- **"There is something at the water"** → *"Then go to the water. I will still be sitting here."*
- **"I am no good at sitting still"** → *"…that is a strange way to refuse a man."*

A king who left a crown on a chair, refusing a throne on his way to dying for the kingdom attached to it. The character says nothing about that. The player at the keyboard says it for him.

**The hermit**, sideways, and the game never settles him:

> "He measured it. So did I."
> "We both got to the same place. Somebody has to hold it down."
> "He decided which somebody. I decided to walk."
> "Thirty years I've had to find a third answer. I have not got one."

**Hale in the stocks**, watching the queue go past:

> "They asked them. Do you hear what I am telling you."
> "They asked, and they said yes."
> "I never asked. I never once thought to."
> "Go and take it off them. Be quick, and be worse than me."

---

### F · THE GOODBYE — and this is the player's, not the game's

The round walks. It is not fast and it never hurries. One narration line, once:

> "It is not hurrying. It has never once had to hurry."

Objective text: **"Go down and meet it."** No timer, no gate, no marker on anybody.

**Every NPC he speaks to from this moment goes into a Set.** Nothing acknowledges it. No counter, no tally, no line. He thinks he is saying goodbye. He is doing the only thing he has ever done, one last time, and the longer he takes the more of the valley is holding him when he goes into the water — which is the thing that makes him the right shape for the door, and nobody will ever say so. It is cut into a stone at the very end.

---

### G · THE LAST FIGHT, WHICH IS THE DYING

**Phase one — the round, on the road.** It is the Almoner's fight, unchanged, with the stakes swapped: the four he kneels over are the top four names off the Ledger. Every blow still lands in a hand reaching for somebody else, and now the somebody has been in the player's save for thirty hours.

If the Almoner lives, it is him, and he is glad to see you:

> "Oh — it's you. I'm glad. I'd hoped it would be you."
> "I'm not going to fight you. I've a round to finish."
> *(kneeling)* "There now. All of it. You'll not want it back."
> "You could have this. You, above anybody."
> "Look at the state of you. You're carrying about twenty."
> *(down)* "…the round doesn't stop. I was only the one walking it."

If the player killed him in Gehenna, it is a man in his coat and it is not his face, and nobody up here would know the difference. **The game does not remark on it.** He was never a person. He was a post.

**He fights a retreat.** The round walks toward the gate; he drives it back down the burial route, reversed, with the village walking with him. Whoever he does not reach in time is relieved, permanently, **and the game never tells him the number.**

**Phase two — at the hollow, it stops being a man.**

> "The coat goes down and what was in it does not."
> "It comes out of the cart in lengths."

Cords. His weapon does nothing to the mass. Each cord that lands prints a name off his own Ledger:

> "It has hold of you by the woodcutter."
> "It has hold of you by the potter."
> "It has hold of you by the ferryman at Hollowmere."
> "It has hold of you by Nim."
> "It has hold of you by the miller."

**A heavy blow breaks a cord. Six flat words, every time:**

> "That one is off you."

**And the Ledger in his satchel gets one name shorter.** The item string rewrites. Nothing ever remarks on it.

He is performing the Kindly One's entire profession, with a sword, on the people who love him, in self-defence, and he thinks he is surviving. His last act is killing — which is exactly why he fails. No line explains it.

Halfway, the only clue he gets, and he misreads it:

> "There are more of them than you have breath for."
> "It is not getting smaller."

The crowd on the rim does not run. They came for him.

---

### H · DOWN

At a third of the Ledger or ninety seconds, whichever is first, the stair lights its prompt: **GO DOWN.** The failsafe is not optional — it is the only thing between this ending and a player quitting at the last fight of a forty-hour game.

He puts the Ledger into the miller's hands, because the miller is nearest and the miller is the calmest man in the valley now.

> Miller: "What's this, then."
> *"Everyone in the valley still holding on to you. Your own name is on the back of it."*

He reads it. He stops in the middle, at a gap he cannot account for, and he has no way on earth to know why he stopped. He says nothing about it. He folds it.

> Miller: "Right."
> Miller: "Right. Go on, then."

Maren, who is the only person here who understands, because she was to be the second:

> Maren: "Don't."
> Maren: "It was meant to be me. You took that off me and now you're—"
> Maren: "…all right. All right."

And Hale, as he passes the stocks — his last two lines in the game, and he never speaks again:

> Hale: "…that was allowed?"
> Hale: "That was allowed the whole time."

He could have walked into that water on any morning of forty years. He put a girl in instead. The player proves it was possible by doing it, which does not make Hale right — it makes him unforgiven, at the exact volume of a man working it out in public.

Then the stair. He never speaks and must not start now.

> "The stair is narrow and the cords go down it ahead of you."
> "The door at the bottom is heavier than the gate of the kingdom."
> "It comes down anyway."

---

### I · THE VALLEY'S ANSWER

> King: "Kneel. All of you."
> King: "That is my last order and I will be obeyed."

> *"The knights kneel first, because knights kneel professionally."*
> *"Then everybody else, badly, and late."*
> *"Nobody cheers."*

> Nim: "Is he coming for supper?"
> Maren: "Yes, love."

Then `BEACON_THREAD`, the one asset the cut "bind" ending left behind, doing the right thing at last:

> "The stones go dark and the ground closes over them like something healed."
> "On the mountain somebody turns the beacon until the light lies along the valley to the water."
> "They will keep it lit. In four generations nobody will be able to say why, and they will keep it lit."

And in the forest, to nobody, from the only being in the world who understands the rules:

> Queen Rosabel: "Oh. He has put something down."
> Queen Rosabel: "No. He has been put down. That is not the same."
> Queen Rosabel: "I would have liked him to get there."

She does not get up. She is not indifferent, and she does not get up. He never heard it. The player does.

---

### J · BELOW. THE CLERK, ALONE

Bodiless voice over `#fade` — no geometry, because `gehTeardown` disposed the whole tree on ascent. Empty road. The Sweeper still sweeping, because nobody told him.

> Clerk: "Oh."
> Clerk: "Oh, you great fool."
> Clerk: "…"
> Clerk: "Right. I'll want a name and a hand and I've neither."
> Clerk: "I'll do it from memory. I have all of it."
> Clerk: "Every last person still holding on to him. It's a long page."
> Clerk: "Longer than when he sat here. They've had a night to think about him."
> Clerk: "There."
> Clerk: "Everybody is somewhere."

She said that once already, in the worst scene in the game, three lines before *"I do not have her."* Said here, over his page, it means **she has him** — filed, which is the definition of not having got out — and the girl still is not anywhere, and he died without ever learning he was the reason.

---

### K · THE STONE

Fade. `dayBreak`. The front of the kingdom, months later.

> "At the front of the kingdom there are two graves."
> "One of them he dug himself. The other has nothing in it."
> "By autumn the second stone is cut."
> "There is no name at the top of it. Nobody in the valley ever thought to ask for one."
> "Small even letters, floor to the height of a hand."

*[every name from the goodbye Set, in the order he spoke to them]*

> "The letters get smaller toward the bottom. The mason ran out of room and kept going."

Then the last line. Then credits.

*(The small even letters, floor to the height of a hand, are the Matron's wall. The one good habit in the almshouse came up into the world. Nobody says so.)*

---

## 5 · THE LAST LINE

> ## HE WOULD NOT SET ANY OF US DOWN

Cut at the bottom of the second stone, under the list of names, in letters smaller than the rest.

It is the village's highest praise and they are not wrong: he never once walked past anybody, for forty hours, and it killed them nothing and killed him.

It is also the verdict, in words the player may have typed himself. One of the two answers the Clerk offers at the desk, shipped in the file today, is ***"The valley is nearly settled. When it is, I will set all of it down and go on."*** And she answers: *"Afterwards. Everybody says afterwards. There are a hundred of them on that road who said afterwards."*

So the last thing on screen is Wildmoor carving his failure into rock as a tribute, in his own borrowed phrase, and getting it exactly right for entirely the wrong reason. Nobody in the valley will ever know that is what it says. **Only the person at the keyboard reads it twice.**

---

## 6 · BUILD ORDER

Nine pieces. The first three close the hole on their own and ship independently.

**1 · THE WHY AND THE DOOM — dialogue only, zero new systems. Ship alone.**
`buildPorter` +3 lines; `porterAfter` split on `GEH.heapDown` (set at 15088, already read by `sweeperAfter`); `callerAfter()` replaced and fed by `buildThreads()` (16195, exported as `GEHENNA.threads` at 17192); five lines into `clerkAfter` after `giveLedger` (16942); one line into the `state.surfaced` chainSay (17104). Every one is a `b.push({t})` into an array rebuilt on each descent. **No save keys. No flags. No risk.** Fire the board beat on approach by copying the `state.roadSeen` x-gate at 17136 — the player is emotionally finished after the Ledger and will walk past a prompt.

**2 · THE HOMECOMING — `GRATEFUL` on the possessed machinery. Ship alone.**
`POSSESSED` (5669) is a dict of arrays; `pickPossessed` (5793) does draw-without-replacement with per-pool history; `npcLineRaw` (5824) dispatches on `siegeOn()`. A ninth pool keyed on `gehDone && !ending` is one branch and ~60 lines of writing. Add the ending's rumour branch at 5904–5906 or every villager in a finished save says nothing about it.

**3 · THE ENDING KEY — this is the hole, and it closes here.**
`endTheStory(key)` (19497) is fully built and has exactly one caller, the multiplayer receive path. Add `"road"` and a single-player caller. **Five precise edits, and this file has been burned by exactly this before:**
- `spec.ending` at **14190** — `["bind","break","fairy"]`, widen.
- The guest gate at **15671** — same array, same widening, or a finished friend's ending is refused on the wire.
- The `lines` map inside `endTheStory` or it says `undefined`.
- `applyEndingWorld` (19515) — a `"road"` branch: pool hollow, stair shut, beacon thread. Reuse the `"break"` clause for `POOL_HOLLOW` (built at 8944) and the `"bind"` clause for `BEACON_THREAD`.
- **Branch around the `grant("Champion's Rest…")` at the end of `endTheStory`.** He does not get a heart back. He is dead.

Keep `bind`/`break`/`fairy` accepted in both validators so old pasted keys still load; just never write them again. `WORLDSTATE.ending` is a string riding `mainProgress`, not a `WS_SHARED` boolean — **verify the `rb` whitelist before shipping**, because two of the four edits are already paid for and the third is the one that silently drops.

`storyAct()` (1010) returns `COMPLETE` the instant the flag is a string. Free. `siegeOn()` (961) goes false and `clearSiege()` (22331) runs on the next frame. Free. `dread()` zeroes at line 999. Free. The dead final objective at ~13423 (`done: () => false`) is the slot — replace with three objectives ending on `WORLDSTATE.ending`; the objectives array is display-only and `title` immutability binds `sideDone()` side quests, not this list.

**4 · THE DOOM ON SCREEN — moderate.**
The pool drop is a lerp on one stored clock against `POOL_WATER_MESH` and `POOL_HOLLOW`. The stair is one prop plus `addRect`. Hale's beats go on `stepLines`/`HALE_SEQ` (19386), the King's on `askChoice` (19524), the Queen's on `QUEEN_AFTER` (21162, already gated on `gehDone` at 21207), the miller's on `MILLER_SEQ` (19398). The queue is the twenty-figure instanced queue Gehenna already builds, restaged, with real bodies only for the five who speak.

**5 · THE GOODBYE SET AND THE SECOND STONE — cheap, and the best payoff in the design.**
A runtime `Set` of NPCs spoken to after the round starts, read once at the carving, built into a string on the `wall`-reader pattern (the Matron's room at 16371 is literally an array of `{t}` lines). The stone lands on `atTheGrave()`'s existing blank-headstone branch (~20494: *"The headstone is blank. Nobody could agree what to put on it"*) — a one-line branch that has been waiting for an answer. **No new pickup**, because `addPickup` renumbers by array position.

**6 · THE ROUND ON THE ROAD — the one real engineering job. Budget it as its own version.**
The Almoner is sited in Gehenna's coordinate space (`GEH.almSeats`, `ALM_POSTS`, `gehGroundAt`, `GEH.enemies`) and his charges must be `attached`-kind enemy objects while villagers are `npcs` on a separate tick. A surface round needs valley siting on `groundAt`, an `EXTRA` entry, four named decoys off `buildThreads()`, and a hard guard against **Bug 119's family** — `updateEnemyTells` relocates a "distant" boss using `terrainH` and its depth guard reads the *player's* height.

The retreat walks on `routeGuide(BURIAL_ROUTE)` (9460/19258) reversed. **Do not use `updateProcession` (19429) — mourners only turn to face, they do not walk.** The walker is `ARREST`'s: `arrestTick` (20327), legs, `ARREST_MAX = 70`, `ARREST_GIVEUP_R = 90`, and `holdForScene`/`releaseSceneHold` (19411/19421) which restores **five** fields and has a scar comment about a scene that gave back four.

**Named fallback if the port is too dear:** the round is a walking prop that cannot be hit, the pressure is a wave off `siegeArrival`/`siegeSend` (22377/22386) with its own gate since `siegeOn()` is false once `gehDone`, and the player's job is to body-block it off the villagers. Cheaper, and strictly worse — you lose the rhyme and the empty coat. **Prototype the fallback first; if it plays, the port is a luxury.**

**7 · THE CORD FIGHT — genuinely new, but it is a shipped loop run backwards.**
`threadHit`/`cutOne` (16861–16880) already hooks `hurtPlayer`, walks a cursor through `state.threads`, names one per cut and rations the line against a read timer. Invert the polarity. **Make the cords the hit-things, not the mass** — that is what solves the design's own stated legibility problem: a boss whose health does not move reads as a bug, but four named things stuck to you that break when you hit them is a verb a player already knows. `e.noBar` (18702) is real precedent from the Unclaimed. The Ledger rewrite is one string in `ITEMS` written by `giveLedger`. Build the cords as `InstancedMesh`es from the start, animated through instance matrices — the Unclaimed's lesson is on the record at 1.2 ms for sixty loose meshes.

**8 · DYING WITHOUT `die()`.** Do not route through `death` (it explodes the body and respawns). Use the `P.gehDive` precedent (15933): a flag that freezes input, takes the body, and is explicitly exempted from both clauses of `guardPlayerPosition` (15912–15916). **Hold the flag until `#fade` owns the screen**, or the guard yanks him the moment it clears below `floorY`. The carry already refuses running, jumping, dashing, sliding and every swing — precedent, not a system.

**9 · CREDITS.** No credits system exists. A fixed dark overlay with a CSS scroll, ~60 lines. Three full-screen DOM overlays already ship; 2.19.0 documented their one gotcha (no `z-index`, printed over the satchel).

**MULTIPLAYER, honestly.** `netApplyEnemies`' EXTRA loop whitelists wolf, wraith and warden and drops unknown kinds. The round and the cords are **host-only, and the guest is told what happened** — the burial's precedent, documented. The guest fights the same whitelisted waves and receives `ending` as a string. Bug 128's two doors stay shut: only a guest accepts an ending, only from peer id `"host"`.

**NEEDS A SYSTEM THAT DOES NOT EXIST — and is therefore not attempted.** No cutscene system, no timeline, no camera rig. Every beat above is a procession, a fight, a `chainSay` or an `askChoice`. **Any beat requiring two independent clocks and a camera should be cut before it is written.** The watercolour epilogue is LOCKED; this design ends on the stone and the credits and is built so the epilogue drops in behind it without moving a line.

---

## 7 · WHAT I CUT, AND WHY

**The three-option choice at the turn.** The winner's `askChoice` where both answers do the same thing — a fake choice at the exact moment agency matters most, in a game that just spent forty hours making choices matter. It is replaced by the Goodbye Set, which is a real unbounded player action that the game silently scores and pays off on a stone. Nobody re-propose the choice.

**The Master.** *The-king-returns'* founder who appears only in the final fight and monologues, in a cast built entirely out of staff with jobs and grievances. *"I read the same book you did. I simply believed it."* is doctrine-as-text and *"You are choosing this for them. Do you know that you are choosing it?"* is the game stating its own indictment three minutes before the credits. Its own designer offered the cut. Taken.

**"The pool wanted paying twice, and he is the second payment."** The single most dangerous idea in the field. If the player pays the coin Hale paid, Hale's method is vindicated and only his invoice was wrong, and the locked epilogue forbids exactly that twice. **Nobody in this ending uses the word price, and the character never frames it as one.** He goes down because the thing is coming up along him and he is the only one who can take it back. Hale, who framed everything as arithmetic, watches a man do a thing that was never arithmetic at all, and it destroys him: *"That was allowed the whole time."* Hale's diagnosis stands. His sum is never declared correct.

**The Fairy Queen at the water.** She does not travel to death scenes and she does not deliver verdicts to people's faces. She is in the forest, sitting exactly as she was, speaking to nobody. And her second sentence at the rim — *"There is a difference, and you will not find it tonight"* — is cut on the theme judge's instruction: it is the one place she was being used as a theme-delivery device instead of a person.

**Flooding Gehenna, and the second descent.** *The-leak's* waterline is the cheapest connective tissue anybody proposed, and it belongs to a different doom. Walking that street again with the content switched off is powerful for thirty metres and tedious for the rest, and the failure mode is boredom in the last twenty minutes, which is the one failure this game cannot afford.

**"There. Now neither of you is going anywhere."** The kindest sentence anybody wrote, and it requires a miller who remembers. I spent him instead — relieved, sleeping through the night, asking a stranger his daughter's name. The locked epilogue already describes exactly that man: *"an absence he cannot account for — an empty chair, a room nobody uses."* The beat is worth more than the line.

**Adding anything to the Matron's room.** Twenty-eight rows of small even cuts and *"Nobody asked her to keep one."* is finished writing. It gets an echo at the very end, in the mason's letters, and not one word inside the room.

**A counter on anything.** No tally of who the round reached, no score on the goodbye, no line when the heap is spared, no acknowledgement anywhere that a choice was made. Four separate designers proposed a readout and all four were wrong for the same reason: **the second layer of this ending only exists in the gap, and a number closes the gap.**
