# Changelog

all notable **Legend of Peanits** changes live here. newest first.

## 3.4 — the pause menu, and a third playthrough's worth of fixes

[screenshots](docs/updates/3.4.md) · [test notes](docs/QA_3.4.md)

`legend_of_peanits_v3.4.html` and `legend_of_peanits_v3.4_retro.html`. everything here is in both.

### the pause menu
- **rebuilt.** one wide panel of every setting at once has become a menu: a slam-in title, six tabs down the side cut on the diagonal — play, skills, sound, picture, save, friends — and a card that slides its contents in one line at a time, the way the logs do. every control keeps its id and its behaviour; the retro edition's dials land in the picture tab. it opens on play every time, and esc still resumes.
- **tab for the stats no longer stops the world.** the stats panel counted as an overlay, which froze the clock and the input; it is a side panel and reads as one now.

### the story
- **the game could soft-lock after the burial.** the objective sent you to rest, and rest only opens the pool once the king has heard it from you — so a player who went to bed first rested for ever with the errand still up. the king comes first in the objective now, then the bed. (guests take their access from the host and were never gated on the king.)
- **nim's mother has her errand from the first day.** she was gated on nim already being found, and her not-yet line named the pool, which had nothing to do with it. "find nim" is offered from the start with the arrow on nim; nim will not come home until the beacon is lit (she says so herself); found before her mother is ever asked, it simply completes.
- **the herb errands counted the hermit's herbs.** the four moor-herbs the hermit is shown stay in the bag, so the miller's and the healer's errands were complete before they had been spoken. each now counts only the herbs picked after it was asked for (the save keeps the tally and the two baselines).
- **the beacon is lit from the top.** the flint worked from the foot of the tower; it wants the lamp now, and at the foot it tells you the ledges climb to it.
- **endurance grows with time spent recovering**, not with how much came back: every second the bar is filling counts, and a bar that is never emptied still levels.
- **dying to the goblin king starts his lull, the same as killing him.** killing him set a five-minute lull before he could rise again; dying to him set nothing, so you woke by the nearest bed with him still on the moor. the blow that killed you is remembered now, and a death to him — or to his pack with him beside you — starts the same lull and sends him back into the earth.

### the quest audit
five reviewers read every errand and story gate after the nim's-mother report, and three refuters tried each finding; forty-five survived, collapsing to these. all fixed here.

- **the beacon could become impossible to light, and with it the whole ending.** the king took the murder report at any time — before the beacon — and the report wakes the pool; once the pool had woken, the hermit's act-three lines all returned before the branch that offers his beacon errand, so the flint's trick could never be learned, nim never had a light to steer by, the seal could never be granted and the finale could never start. the beacon errand comes first in the hermit's talk now whatever act the valley is in, and the king takes the report only once the beacon has made you champion. a save already in the dead state recovers on the next visit to the hermit.
- **handing a herb to the miller un-gathered the hermit's four.** the objective and the hermit's gate both counted herbs held; they count herbs picked now.
- **maren's heal ate the herbs the story still wanted**, three a press with no way to refuse, out of a moor that grows fourteen and never grew them back. she heals from the surplus over what the hermit and any open errand still want, and the moor grows its herbs back four minutes after they are picked, out of sight.
- **a hosted game's errands froze when the party ended.** the party's count replaced your own and nothing wrote to it offline, so an errand taken while hosting could never be handed in from that save. the higher of the two counts stands.
- **the ashfall smith promised the pool too.** the not-yet line was picked by village number and named the pool for two villages whose real gate is the hermit's warning; it names the hermit now.
- **the hermit and the king wore no mark at the visits where they had something new to say** — the hermit through the whole of act three, the king at the murder report, the seal and the mourning. both marks follow the story's flags now.
- **the weaver's arrow turned round the moment you opened wren's mirror**, changed or not; it follows the errand's own target.
- **ysolde's father's errand could be left open behind a man nobody can speak to**; it is paid or closed when he is hidden.
- **nim's homecoming did not cross the wire**: a guest could finish her errand while she still stood in the host's wood with a mark over her head. it travels with the story now, both ways.
- **the rose queen's errand said a reward was waiting for ever**; the rescue is the reward, and it says so.
- a guest's own slime kills count toward the hermit's six; the hud's arrow note agrees with the arrow; a tick over a villager means the errand can be handed in to them here; the root word's arrow points at nim while she is being looked for and at her mother otherwise; a dead branch in the party merge is gone.
- **known, deferred:** the four kingdom errands (the woodpile, sir corrin, the miller's herb, the weaver) still ride the party wire though they are personal, so a host can see a guest's count for one they must finish themselves; the ashfall smith's quest slimes still land downhill of the village; a guest re-completing an errand already paid solo hears the thanks with nothing granted. all three are multiplayer only and wait for a session to test them in.

### scenes
- **the arrest of hale wheeled round the fountain.** three faults. the two knights closing on his shoulders pressed to a mark inside the crowding radius and shoved him a tenth of a metre a tick, walking him backwards across the square at a steady pace while the scene said he stood; his lunge at maren ended only when the speaking channel drained, a dozen seconds, so he chased her to her own door; and while "standing" he faced the first knight, whose mark is at his shoulder, so his turning moved the mark, the knight stepped, he turned again — a slow circle. the arrest party no longer shove one another, the lunge is a second and a half on its own clock, he faces the board once they have closed, and everyone walking in faces the way they walk. measured: the escorts' movement in the held phase fell from 104 samples to 10, and hale walks backwards in none.
- **ysolde spun into the ground.** her turn onto her back was lerped from the carrier's live heading, the long way round; the start point and the turn are fixed at the start of the lowering now, by the short way.
- **the castle hid its houses but not the people in them.** when the throne hall swells over the houses beside it, the houses go; a villager's mesh is the scene's, so a sleeper lay on the hall floor in full view. anyone inside a hidden house is hidden with it.
- **the hall floor slid as the hall grew.** the flagstone repeat scaled with the room from the slab's corner, so the pattern flowed across the floor during the growth; an offset holds it still in world space.
- **the hall floor's edge, and a band of street inside the doorway** (3.3.3's slab stopped short of the walls): the slab reaches under the walls and through the doorway now, and the room's walkable floor is padded to match, so walking out does not put the slab over your boots.
- **the player lay under the blanket beside a villager who did not** — the same bed-height bug 3.3.3 fixed for villagers, on the player's own line.
- **hale's note sank into the raised hall floor** (fixed in 3.3.2, here for the record).

### drawing
- **the streets flickered where they crossed.** the slabs cycled through seven heights, so the west side street and the north cross street shared one and their two cobble textures fought for the pixel in a sawtooth. every slab has its own step now.
- **the retro edition smooths its textures by default.** unfiltered texels at full detail shimmer at every grazing angle; the pixel-texture toggle is still there, under a new preference name so a saved old value does not come back.
- **pale trees are pale.** they were the oak's bark, lines and all, under a whitening tint. they have a trunk mesh of their own on a birch-white bark with a handful of dark lenticels, and the fallen copy is built from it.
- **the axe is carried, not dragged.** its haft is a metre and a half, and hanging straight down from the hand it dragged its head along the ground; it is carried the way the drawn sword is, and the hand turns only for the swing.
- **the satchel's discoveries list showed `<br>`.** one of its two renderers un-escaped `&lt;br>` without the closing entity, which never matched.

## 3.3.3 — beds and the hall's edge

- **children sank into their beds when asleep.** a sleeper's height was deliberately left unscaled when a house grows around the player, but the bed is a child of the room and rises with it — one and a half times taller inside — so every sleeper sat twenty centimetres deeper in a grown bed than authored. an adult still showed a chest; a child at two-thirds size showed only hair. the sleeper's height follows the bed's top through the stretch now (the lie height itself is not stretched), so the body sits on the blanket at any room scale: measured in a grown house, a sleeping child shows thirty-nine centimetres above the blanket.
- **the hall floor's edge, and a band of street inside the doorway.** the flagstone slab stopped forty-five centimetres short of the walls and eighty short of the door line, so a strip of the avenue showed inside the doorway (over a metre, grown) and the slab's edge could be seen from the door. the slab reaches under the walls and out through the doorway now — twenty centimetres past the wall centre lines, inside the thirty-five the walls are thick — so there is no exposed edge and no band of street anywhere inside the hall.

## 3.3.2 — hale's note

- **hale's note sank into the raised hall floor.** it is the one pickup laid by hand at the old floor height, two centimetres up, and the 3.3.1 slab passes over it when the hall is grown: the book spent most of its bob half-buried in the flagstones. it is placed from the room's own floor height at full growth now, with the book's half-height on top, so it cannot go stale with the floor again. found in review before anyone saw it.

## 3.3.1 — the hall floor

- **the throne hall's floor broke into patches of street when the hall grew.** the hall's flagstones are a two-centimetre slab; the avenue and the cross streets around the keep are slabs with tops at eight to ten centimetres. when the hall swells around you — one and a half times wider, two and a half times taller — its floor spreads out over those streets, and at five centimetres (grown) they came up through it in rectangular patches, each with its own cobble scale. the floor sits at six centimetres now, fifteen grown, which covers them; the carpet lies on top of it; and the standing height inside follows the slab as it always did. the flagstones also have a texture of their own now whose repeat follows the growth, so the stones stay the size they were laid at instead of swelling with the room.
- a first cut of this put the base repeat on the texture's `userData`, which a texture in this three does not have; the world build threw and the game never left the loading screen. it lives on the room record instead. caught before release.

## 3.3 — the second playthrough

[screenshots + download](docs/updates/3.3.md) · [test notes](docs/QA_3.3.md)

from here the main build and the retro edition share a version: `legend_of_peanits_v3.3.html` is the game, and `legend_of_peanits_v3.3_retro.html` is made from it by `tools/make-retro.cjs`. everything below is in both.

- **hitting the clerk's sister lit every lamp post in gehenna.** the kindly one's body was built from her own materials, as every gehenna boss is, but her shears were the shared iron — the same material as the ten lamp posts down the avenue, the matron's cart axle and the bar on her window — and the hit flash writes emissive into every material on a struck body. her shears are her own iron now, and the flash pass skips any shared material as well, so the class of mistake cannot come back.
- **the clerk goes quiet once she has called her sister, and her sister answers.** the clerk stayed interactable for ever, two metres from the woman she had just summoned, so the player at the desk kept re-hearing her last line instead of reaching the kindly one. once called she has no prompt and nothing to say until gehenna is done and the ledger is hers to hand over; and the kindly one's first line is delivered on the dialogue chain straight out of the clerk's last sentence, broadcast to the whole party as every gehenna line is. the second line, the one that opens the fight, still waits for the player.
- **the clerk's line about the fairy queen is gone.** "The Fairy Queen does not hold you, oddly enough." set no flag; her sister is still called on her last line.
- **the matron takes any blow on her ward personally.** only the first waking used to move her, and only if it was the first. now every blow on anyone she is minding — a seated one, a grieving one, whoever struck it — stops her being careful with you at once (the same phase two her own wounds bring on) and sends her running to the one you struck at her next safe pause.
- **the fairy queen's tree was the colour of old moss, and she is painted now.** the canopy tinted the green leaf painting pink, and a tint multiplies: pink through green is mud. the canopy has its own blossom painting. and she and her children are drawn the way a handheld drew things: a face painted once on the front of the head instead of eight cubes a centimetre across fighting for the same pixel, cutout wings with an ink rim instead of translucent slabs punching through each other, five flat colours doing the work of nine, and one shared palette for the whole court instead of five hundred materials.
- **lucifer says "my father".** the one line where he named his father said "God".
- **the abandoned church stands in the east now**, in the band x 550..650 that the siting search used to pin to the west, with the hermit's directions, the journal hint and the church test following it. and it is drawn from as far as the fog allows instead of appearing thirty metres out: it was a room like any other under the room-draw rule, and rooms carry their own draw radius now. the network protocol is 5, so a host and a guest on different builds refuse each other instead of building the church in two places.
- **the castle no longer vanishes from across the square.** the keep was hidden past thirty metres like any other room; it is drawn from anywhere now. (the retro edition had this since 3.2.)
- **the map arrow is two and a half times bigger**, on the minimap and the big map, and still turns with you.
- **staying is a shade, and a shade does not tire.** a player who chose to stay at the end is in ghost mode, and their stamina never drains: the one predicate that already made gehenna's ash free now counts staying too, so the bar, the drains that bypass it and the save all follow.
- **the elder tree's trunk is solid from the roots up, and its bark is the rail on the inner edge of the stair.** the trunk was two solids whose collision windows began at 102 m and 16 m, so the bark was open at the roots and open again from 55 m to 102 m — most of the climb — which read as the collision being raised. it is banded now, every band under the window's height, and each band a wall rather than a floor so a climber never steps onto an invisible disc inside the tree. the stair's inner lip is at exactly the trunk's radius, so the same wall stops you stepping left into the bark.
- **ysolde's father's door hung sideways in the street.** the closed leaf's width and thickness were swapped against the wall it closes (the collision box beside it had them right), so it stood across the doorway like a fin; and it was placed at the villagers' waiting spot a metre and a half out from the wall. it lies in its own frame now, and the block moves with it.

### found in review and fixed before release
- **the matron's new rule was an exploit.** as first written, every blow on a seated one zeroed her round cooldown, so a player could tap one every few seconds and keep her kneeling at guard one — five times the damage — for as long as they liked; and it recorded the seated one as the person to kneel with, someone who had not been woken. she now runs to a struck ward at most once in twelve seconds (the anger is not on the clock), and only to someone who is grieving.
- **her "stops being careful" line was local.** a guest whose blow provoked her saw her change gait with no word said. the line goes over the wire now, from one place, whether her own wounds or a blow on her ward brought it on.
- **the rose court's ten shared materials now say they are shared**, as gehenna's do, so a future teardown or hit flash steps over them. nothing disposes a fairy today; this is the shape of the shears bug, closed before it can happen.
- **the church test now checks the direction the hint gives**, not just its wording.

### refuted / known
- `qa-gehenna-choice` is stale past its matron section on every build, 3.0 included: its lucifer half sets a field that does not exist. its matron checks pass with the new rule.
- the retro edition draws the church to its own view distance (240 m) rather than the 4000 m radius the main build gives it; both are far past where it used to appear.

## 3.2 retro — what a first playthrough found

the retro file is `legend_of_peanits_v3.2_retro.html`; the main 3.0 file is still untouched. everything here came from playing the 3.1.1 build.

- **the knights' armour was flat grey.** the physical material's metalness meant nothing to the lambert stand-in, so plate, crown, gold and gehenna's black water were drawn as matte paint. a metal (metalness past a half) is now built as a phong material — specular colour and shininess worked out from the roughness, base colour darkened the way a metal's diffuse is — so it catches the light again. the constructor under the old name is a plain function that hands back whichever of the two classes fits; each instance's own constructor is still its class, so clone() is unchanged.
- **floors warped, inside houses and across the whole valley.** the affine swim is right on a wall a few metres wide and wrong on a floor that is one polygon forty metres across, which is most of this game's floors, and the distance fade of 3.1 did not reach a keep floor that spans from your feet to the far wall. the warp is off by default now. the dial stays for anyone who wants it, under a new preference name so a saved half does not come straight back.
- **textures are native by default.** the 64-texel shrink is a dial now — 64, 128 or the texture as painted — and the painting is kept for every texture, clones included, so the dial can remake them at any time without a reload.
- **the castle vanished from across the square, and the king sat on the grass.** rooms are drawn only within thirty metres so the valley is not drawn through the backs of seventy-five houses, and the keep was a room like any other. the keep is the castle; it is drawn from anywhere now. the main build has the same rule and the same disappearance.
- **houses arrived at the last second, and popped in and out.** inside the walls the world draws only sixty metres until the beacon is lit, and the fog took the rest; in this edition that is a hundred and ten, and the valley's own draw distance goes from 185 to 240. and every room's inside was drawn only within thirty metres, so a house arrived with its inside missing and lost it again on the way out; rooms are now drawn as far as the view reaches — the same distance the fog and the far plane use — so nothing pops that the fog has not already taken.
- **the picture is the window's own by default.** 240 lines is still on the dial, with 200, 320 and 480 beside it.
- **gehenna is raised at boot and kept.** the main build builds it during the fall and takes it down two seconds after you climb out, so every visit began with the build. this edition raises it in the background at the first frame — the same guarded kickoff the main build runs when the whirlpool wakes — keeps it hidden while nobody is under the seam, and never tears it down for being away. the after-story's own fourteen-second grace still takes it down, so its closing beat can be the valley heard from outside as it was written, and it is raised again at once. the seed it is raised on is provisional: held on the world, never written into the save, because a player who has never been below is known by having no seed there; the world adopts it the moment it wants one of its own. a build asked for on another seed — a loaded save, a shared visit, a test — takes the standing one down first instead of returning as if the work were done. a guest never builds their own: the provisional one comes down when they join, and the host's arrives over the wire as before.

## 3.1.1 retro — the standing review

the retro file is `legend_of_peanits_v3.1.1_retro.html` now; the main 3.0 file is still untouched. a second, closer review of the 3.1 fixes found five things, all in the retro layer:

- **on a 4:3 window every ember and mote was still four and a half times too big.** the picture target is born at 320×240, and a 4:3 window asks for exactly that, so the size test returned before the point scale was ever set. it is set before the test now.
- **a frame that threw after the picture was begun froze the screen.** the error handler rescheduled the loop but never copied the picture to the window, so a throw on every frame showed the last good frame forever while the game ran on underneath. the copy is made on the way into the handler.
- **name tags got a mip chain.** the main build kept them un-mipmapped on purpose: the canvas is transparent around the glyphs, a mip chain averages the clear pixels into the text and a distant tag goes muddy, and the tag is redrawn on every change of health. they are filtered without mips again.
- **your disc stayed under the bed.** a villager laid flat loses their disc; the player asleep in a bed, and another player asleep or carried, did not. lying hides it for both.
- **another player's disc leaked its material when they left.** each is its own so it can fade on its own; it is disposed with the disc now.

also: the disc geometry is written as sixteen segments, because the renderer's own geometry goes through the same halving as everything else and comes out eight — the old twelve came out eight too and said otherwise. accepted as is: the hero's disc asks the ground height once a frame, which the movement code has already worked out; not worth a plumbing change. worth knowing: because the point scale is now applied every frame rather than on a size change, any future per-frame animation of a points material's `size` would be overwritten — none of the three points materials in the game is animated today.

the re-review of these six edits found them clean; they were rebuilt from the generator and the output matched the committed file byte for byte.

## 3.1 retro — the way it would have looked in 1998

[screenshots + download](docs/updates/3.1_retro.md) · [test notes](docs/QA_3.1_retro.md)

a second build of the same game, `legend_of_peanits_v3.1_retro.html`. the main 3.0 file is untouched. the retro file is produced from it by `tools/make-retro.cjs`: twenty-five anchored edits that only touch drawing, each of which must match exactly once or the build refuses. saves, quests, the world and multiplayer are the main build's, and the two share the same browser save.

- the picture is 240 lines tall (427×240 at a 16:9 window) and scaled to the window without smoothing. the pause menu offers 200p, 240p, 320p, 480p and the window's own size.
- every texture is painted at its old size, shrunk to 64 texels, cut to sixteen shades a channel and shown with no filtering. the "pixel textures" toggle off gives the n64's bilinear instead. alpha is cut to the same sixteen steps, so the glow's soft edge survives and a leaf cutout still ends where its own alpha test says.
- lighting is worked out at the vertices: every physically-based material is built as a lambert one, so light smears across each face the way a 1998 console's did. roughness and metalness are kept as plain numbers so the code that tunes them still runs and still means nothing. the exception is lucifer's hand, whose rim-light shader hook reads per-pixel normals and keeps the physical material under a second name.
- vertices snap to the picture grid (the playstation wobble, 0–3 in the menu), and the texture mapping can ignore perspective (the affine warp slider, half on by default). both are one patch to three's shader chunks, applied before any material exists, so the game's own shader hooks — the triplanar ground, the water, the swaying leaves and grass, the hand — are untouched and still work. the warp fades in with distance: it is off on whatever is within a couple of metres and full past a dozen, because the affine error is worst on the big triangles nearest the camera — a room's floor and walls, the road at the bottom of the screen — and a console hid exactly that by cutting its near geometry into pieces.
- the screen pass cuts colour to five bits a channel through a 4×4 ordered dither, one cell per picture pixel however far it is scaled. scanlines are optional.
- round geometry has half its sides: 8-sided cylinders, 8×6 spheres, 9-segment robes. anything already at or under the floor keeps its count, because the limbs are six-sided cylinders and would fold flat at three.
- no shadow maps. a dark disc sits under the hero and under every villager, shrinking and fading as you jump. the hero's lives in the scene and follows the ground under you (structures and gehenna included) rather than the model, which rises with a jump.
- the sky has two-tone clouds cut from value noise, drifting. their colour follows the horizon's, so night keeps them dark and the white room keeps them gone.
- tone mapping is cineon at 1.0: the main build's aces curve at 1.22 made the meadow pale, and a plain linear one clipped it to neon.
- the six new controls are machine preferences like the sound sliders, saved and restored through the same list.

### found in review and fixed before release
- **every sprite showed a quarter of its texture.** the E prompt, the quest marks, the sleeping zzz, the fairy glow and the name tags all read as one blown-up corner. the affine uv is written in the block appended to three's projection chunk, and the sprite is the one built-in shader that builds its own position and never runs that chunk — so its fragment mixed the real uv with a varying nobody had written. sprites now take the same block by hand, and every shader seeds the affine uv with the plain one first so nothing can read it unwritten again.
- **textures swam too much indoors and at the bottom of the screen.** the warp was applied at full strength everywhere, and the affine error grows with a triangle's size on screen. it now fades in with distance (see above).
- **the small picture had a 16-bit depth buffer.** r128 gives a render target without a stencil a 16-bit depth renderbuffer, 1/256 of what the window had, and the town's cobbles started to z-fight past a few metres. the target asks for the stencil and gets the window's 24 bits.
- **size-attenuated points were four and a half times too big.** r128 sizes a point against the window's height, never the bound target's, so gehenna's embers and lucifer's radiance drawn into 240 lines would have filled the screen. every points material keeps the size it was given and is rescaled with the picture; the stars are not attenuated and stay in picture pixels.
- **the glow was a hard disc.** the cutout alpha threshold ran on every alpha texture, including the one soft radial gradient every glow sprite and particle uses. alpha is banded to sixteen steps instead.
- **the rivers ignored the pixel-textures toggle.** they clone the water texture directly rather than through the helper the build patched. any clone of a retro texture is now a retro texture, at the clone method itself.
- **the disc under a villager stood on its edge when they were laid flat.** bodies, the burial carry and sleepers are rotated as a group, and the disc rotated with them. each disc is checked against its group's up axis every frame and hidden when the group is not upright.
- **other players cast no shadow.** villagers had a disc and so did you, but a remote player's model is built by neither route. each avatar gets a pooled scene-level disc placed by the ground under them, dropped when they leave.
- **removing a goblin disposed the disc geometry under every villager.** the two teardown helpers skipped shared materials but disposed every geometry; the disc is the first shared geometry, and they skip it now. three re-uploaded the buffer on the next draw, so this was a stall each time rather than a missing disc.
- **the multiplayer name tag was the one texture the layer never touched.** it is redrawn on every change of health, so it is filtered like the rest but never listed; listing it would have grown the list forever.

### refuted in review
- the vertex snap divides by w with no guard: vertices behind the camera are clipped by the unchanged w, and the quantised value is re-multiplied by the same w; nothing reaches the screen.
- the sixteen pooled point lights become per-vertex on the lowest-poly surfaces and caves lose their light pools: that is gouraud lighting, which is the point of the build.
- retroFit divides by an innerHeight of zero: it is guarded on both sides.
- the discs are sliced by the ground on any slope past a few degrees: they sit five centimetres up with a polygon offset, and a disc cut by a slope is what every 1998 game did.

### refuted while testing
- **the blob shadows were "not rendering".** they were: an isolated disc at the same height drew fine, and tinting them showed every one in place. they were narrower than the bodies over them, so from the usual camera height the model covered them entirely. they are now a metre wide.
- **`qa-lucifer-visuals` broke on the retro build.** the suite stubs the finale out of the source text without the retro prologue, so the hand material's reference to the second-name physical class was undefined in its sandbox. the reference now falls back to `THREE.MeshStandardMaterial` when the alias is missing; the suite passes its 134 checks again. the game itself was never affected.

## 3.0 — the still kingdom

[test notes](docs/QA_3.0.md)

this release is the 2.24.6 build reviewed end to end — correctness, multiplayer and save, performance — and then cleaned up. everything below was found in that build and is fixed here unless it says otherwise.

### the road into the still kingdom

- the avenue now ends in a walled circular city with a ring road, radial towers and one central gate.
- the stepped staircase down off the hill is gone. it was a straight linear drop over a fixed nine metres laid on top of a hill whose real height comes out of noise, so its slabs either floated clear of the ground or punched into it depending on where you stood. the hill's own slope is the ramp now.
- **fixed: the gate you could see and could not reach.** the tower ring's one gap faced east while the avenue arrives from the west, and one tower stood solid on the avenue's centre line with 2.3 m slits either side of it. towers in the approach are skipped now, and the gateposts and the plaza floor are no longer solid.
- **fixed: entering the white room put you under its floor.** the arrival used the kingdom's height, which is 7.95 m below the white room's own ground — beneath an opaque white plane, inside white fog, with nothing to walk to and no error. the fall-through net only fires 8 m under the ground, so it missed by five centimetres and nothing ever recovered you. the height is read off the room now, and the room has a net of its own.
- **fixed: leaving the white room dropped you back inside the doorway.** the entry trigger was widened to ±8 m to cover the whole gate, but the exit was placed 3.5 m from the portal — inside it. only the 1.6 second cooldown separated them, so standing still, opening the map or turning to look at the city pulled you straight back through. the exit is twelve metres clear now.
- **fixed: one step backwards threw you out of the room again.** you arrived a metre and a half from the exit test; it is four metres now, facing the bridge with the tear behind you.
- **fixed: a second visit to gehenna in one session killed the portal.** teardown left the hill portal's root pointer set, so the next build returned early — before assigning the descriptor that every portal update reads. no transit, no room, no city, for the rest of the session.
- **fixed: two invisible gateposts left standing in the road.** when the still kingdom replaces the hill portal its meshes are detached, but the collision records had no removal path, and on roughly half of all seeds the ground at the crest is high enough for them to be solid — flanking the centre line of the only road out of gehenna.
- **fixed: the village and the road never actually grew as the demons fell.** the two functions that re-lay them were declared inside the world build, so at all five call sites the name was not in scope — and every call was written `typeof fn === "function"`, which turns an out-of-scope name into silence instead of an error. the minimap read the live numbers and moved the rows; the houses, their colliders and the road never did.
- the avenue's towers no longer widen per boss, which had turned the approach into an open plain. that opening belongs to the starter village at the top of gehenna.
- the white expanse is built as four strips with a hole for the garden: one 500 m sheet lay over the river and drew it as a white band.
- gehenna's rim is capped so it can never reach the seam, the realm's bounds follow the new corridor, the fall is 8.5 seconds, and the world starts building the morning the whirlpool wakes rather than when you dive.

### the valley

- **fixed: the king never got to mourn her.** the burial itself set the flag that means "the king has heard it from you", so "tell the king it is done" ticked off in the same frame as the burial, his four-line scene was unreachable in every run, and sleeping straight afterwards opened the way down without ever speaking to him. talking to him is the only thing that sets it now, and the prompt after the burial names him.
- **fixed: a child standing near you could make E do nothing.** the post-burial gate returned out of the whole interact handler instead of skipping that one villager, so the herbs, the flint, the beacon and the examine lines all went dead, silently, whenever a child was within three and a half metres.
- **fixed: a dive attack hit wildlife once per frame.** the player and enemy paths both end the dive on a hit; the wildlife path had no such gate, so a dive through a boar was one attack per frame for the whole fall.
- **fixed: the abandoned church was being built in the east.** the siting band lost its minus signs — the comment above it still said "between x -650 and -550" while the code read 550 to 650 — so the hermit's voiceline and the quest hint sent you west while the gold arrow pointed east. it is back on the west apron, and it draws on the map now.
- the church also has two last-resort sites. on a seed where the apron has nothing legal it used to be skipped entirely, with only a console warning.

### playing together

- **fixed: a player who left lucifer's room was frozen on the host for the rest of the session.** a client that has torn its own gehenna down reports no fight epoch, and the host read that as a mismatch and dropped every position packet from them, permanently. they stood still in gehenna on everyone else's screen, every co-operative gate that tests where they are refused them, and because the fight roster only ever grew they still counted as alive — so after a real party kill the wipe never fired and the retry menu never appeared. the roster lets people go now when they leave gehenna.
- **fixed: one guest at the tear pulled the host through from anywhere.** the wait-for-everyone rule only looked at the other players. that is enough on the local path, which only runs when you are standing in the gate, but a request relayed from a guest was checked against the guest's position and then took everybody.
- **fixed: re-joining left the last session's players in the room.** a guest always reconnects under the same peer name, and the old connection's players were only cleaned up by a callback that arrives too late to recognise them. they looked alive to everything, including the rule that holds the tear shut until everyone is present.
- **fixed: the save key button wrote the host's story over yours.** joining someone rolls your own shared errands and burial back on purpose, and the autosave refuses to write that down — but the save key button next to it wrote it anyway, silently, under a note explaining that nothing was being saved. it says so plainly now.
- lucifer's arm takes everyone standing in its arc rather than only the nearest, and his shove no longer switches itself off as you level: its cooldown only ticked while he was not speaking, and damage is blocked for that whole pause, so anyone doing more than about seven a second reached the next phase inside it and was never thrown once.
- the shove's replay guard is kept per fight, so a guest who changes host is not silently immune to the first dozen shoves, and the host's ten-a-second snapshots no longer reset it.
- mirrored goblins are validated like every other kind; the king's line to a shade survives a reload; a guest's quest-slimes are released when they leave, which used to lock the ninth guest of a session out of that errand.

### speed

the town was the slowest place in the game and it is where everyone starts.

- **the inside of every house was drawn from anywhere in the valley.** 75 interiors, 1,687 meshes — beds, dressers and furniture, drawn straight through the back of their own walls, 867 of them still inside the frustum standing at the south gate. rooms are drawn now only for whoever is in one or near its door. measured at the spawn: 19.1 ms a frame down to 14.6 ms, and 21.6 ms down to 13.1 ms on a colder run.
- the three children's walk out of the white room no longer rebuilds its route table, its closures and its vectors for every child on every frame of the finale.

### refuted

checked and **not** true, so they do not need checking again:

- shadow maps are not costing anything. the 4096 map size and `shadowMap.enabled = true` are both dead — the one surviving quality preset sets `shadow: 0`, and at runtime the map is 512 and disabled. (the 4096 literal is still a trap for anyone who re-adds a shadow preset.)
- `allEnemies()` does not rebuild its list per call. it memoises for the whole of an update tick.
- the new circular city is not a performance problem: it batches into one instanced mesh per material, builds in 2.7 ms, and adds 24 meshes and no new geometry. it is the model the rest of the world should follow.
- `gehUpdateVillage` is not per-frame work. it runs on a boss death, where its cost is hidden by the death sequence.
- the white room's four ground strips cost nothing per frame.
- the gameplay simulation is not the bottleneck anywhere: the whole of `update()` is 1.46 ms of a 17–22 ms frame, and the rest is inside `renderer.render`.
- the pvp shield facing test is not broken. the multiplayer soak accused it of letting a rear-facing shield block, and the fault was in the soak: it slept a fixed 300 ms for the defender to leave gehenna, and state travels on a deliberately unordered channel with no retransmits, so about one run in five the host still had the defender at the old depth, judged the blow to be across the realm seam and never sent it. the suite waits for the host's own view now, and 12 runs in a row are green.

### still open

- measured and not acted on: villagers are about 27 draw calls and 27 materials each (4,349 materials in the scene, which stops three.js batching anything); 56% of drawn meshes sit past 70 m inside 170 m fog; the instanced foliage is never frustum-culled because one instanced mesh spans the whole map; two 1600 m terrain planes are both drawn every frame; the second render pass walks all 15,980 nodes to find the 193 that are birds.

### housekeeping

- the densest lines in the file are broken out into readable blocks with the reasoning written down: the enemy death animation's six near-identical branches are one table now, and the story places, the side-quest wiring, the falling rock, the guest hit handler, the warden's blink and surge, and the wraith spawn all read top to bottom.
- the test tools no longer hardcode a path to a bundled playwright runtime; set `QA_PLAYWRIGHT` to the folder holding it if node cannot find one on its own.

## 2.24.5 — the hand comes down

- lucifer shakes harder the closer he is to losing his hold. the hand he is holding back shakes with him, and the room and the camera shake with both.
- his shove now takes half of whatever health you have left, every time — and at two hearts it takes the rest.
- lucifer's room will not open for one of you. everyone still connected has to be at the tear, and then everyone goes through together.
- the ending is rebuilt. he says nothing over the hand; it comes down through him and through you and lifts away with you both inside it. the white room comes apart behind you until there is nothing left to light, and the screen holds black for five seconds before you are asked anything.
- **both endings were broken and are fixed.** the finale clock kept re-blacking the screen, re-dimming the room and re-asking the question on every frame after you answered — so Stay dropped you back into a black screen that never went away, and Move on had its storybook torn down the frame after it appeared. move on now plays the three slides, rolls the credits, and ends on a title card offering a new game or a return to wildmoor.
- the children in that room have legs that actually walk now.
- **fixed: a shared errand could become impossible to hand in.** if a guest picked up the quest item within about half a second of the errand starting, the host read that as their starting state, never credited the pickup, and nothing anyone did could complete it.
- **fixed: a 2.3 m wall across the road to the still kingdom.** the ramp off the hill started at a fixed height the hill never reached, which also left a six-metre drop off either side of it.
- fixed: building the kingdom the moment lucifer let go briefly declared you outside the white room you were standing in.
- test tools: new ending suite; the kingdom, pride river and lucifer art suites were reading coordinates from before the room moved and now run again.

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
