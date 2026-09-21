// builds the retro edition of the game from the main build.
//
// the retro build is the same game drawn the way a 1998 console drew it: a 240-line picture scaled up without
// smoothing, 64-pixel textures with no filtering, lighting worked out per vertex, vertices snapped to the pixel
// grid, affine texture warp and 15-bit dithered colour. none of that touches gameplay, so rather than fork twenty
// seven thousand lines and maintain them twice, the edition is produced from the main file by a fixed list of
// anchored edits. every anchor must match exactly once; a main-build change that moves one fails loudly here
// instead of silently shipping half a renderer.
//
//   node tools/make-retro.cjs [source.html] [target.html]
//
// defaults: legend_of_wildmoor_v3.8.2.html -> legend_of_wildmoor_v3.8.2_retro.html
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(process.argv[2] || "legend_of_wildmoor_v3.8.2.html");
const OUT = path.resolve(process.argv[3] || "legend_of_wildmoor_v3.8.2_retro.html");
const VERSION = "3.8.2";

let html = fs.readFileSync(SRC, "utf8").replace(/\r\n/g, "\n");
const edits = [];

// replace exactly one occurrence, or refuse to build
function edit(name, anchor, replacement) {
  const first = html.indexOf(anchor);
  if (first < 0) throw new Error(`${name}: anchor not found:\n${anchor.slice(0, 200)}`);
  if (html.indexOf(anchor, first + 1) >= 0) throw new Error(`${name}: anchor is not unique:\n${anchor.slice(0, 200)}`);
  html = html.slice(0, first) + replacement + html.slice(first + anchor.length);
  edits.push(name);
}
const after = (name, anchor, insert) => edit(name, anchor, anchor + insert);
const before = (name, anchor, insert) => edit(name, anchor, insert + anchor);
// replace every occurrence, and refuse unless there are exactly as many as expected
function editAll(name, anchor, replacement, count) {
  const parts = html.split(anchor);
  if (parts.length - 1 !== count) throw new Error(`${name}: expected ${count} occurrences, found ${parts.length - 1}:\n${anchor.slice(0, 200)}`);
  html = parts.join(replacement);
  edits.push(name);
}

// ------------------------------------------------------------------ page
edit(
  "header comment",
  "a single-file 3d rpg built on three r128 (bundled below for offline play)",
  "a single-file 3d rpg built on three r128 (bundled below for offline play)\n" +
    "this is the retro edition: the valley is drawn the way a 1998 console drew it. a 240-line picture scaled up without smoothing, 64-pixel textures with no\n" +
    "filtering, lighting worked out per vertex, vertices snapped to the pixel grid, affine texture warp and 15-bit dithered colour. gameplay, saves and\n" +
    "multiplayer are the main build's, untouched; look for \"the 1998 renderer\" in the script. built from the main file by tools/make-retro.cjs"
);
edit("title", `<title>Legend of Wildmoor ${VERSION}</title>`, `<title>Legend of Wildmoor ${VERSION} Retro</title>`);
edit(
  "canvas css",
  "canvas#game { display: block; width: 100vw; height: 100vh; cursor: none; }",
  "canvas#game { display: block; width: 100vw; height: 100vh; cursor: none; image-rendering: pixelated; image-rendering: crisp-edges; }"
);
edit("hud version", `<span class="quest-version">${VERSION}</span>`, `<span class="quest-version">${VERSION}r</span>`);
edit("pause edition", `<div class="edition">LEGEND OF WILDMOOR ${VERSION}</div>`, `<div class="edition">LEGEND OF WILDMOOR ${VERSION} RETRO</div>`);
after(
  "settings controls",
  '      <p id="graphics-status" role="status" aria-live="polite"></p>\n',
  `      <!-- the 1998 renderer. each of these is a machine preference (PREF_IDS), saved and restored with the sound sliders -->
      <label>Picture <span id="r-res-val" style="opacity:.7;font-variant-numeric:tabular-nums">native</span></label><input type="range" id="r-picture" min="0" max="4" step="1" value="4">
      <label>Vertex wobble <span id="r-wobble-val" style="opacity:.7;font-variant-numeric:tabular-nums">1</span></label><input type="range" id="r-wobble" min="0" max="3" step="1" value="1">
      <label>Texture detail <span id="r-tex-val" style="opacity:.7;font-variant-numeric:tabular-nums">native</span></label><input type="range" id="r-tex" min="0" max="2" step="1" value="2">
      <label>Texture warp <span id="r-affine-val" style="opacity:.7;font-variant-numeric:tabular-nums">0.0</span></label><input type="range" id="r-affine" min="0" max="1" step=".1" value="0">
      <div class="row"><input type="checkbox" id="r-nearest"><label for="r-nearest" style="margin:0">Pixel textures, no smoothing</label></div>
      <div class="row"><input type="checkbox" id="r-dither" checked><label for="r-dither" style="margin:0">15-bit colour, dithered</label></div>
      <div class="row"><input type="checkbox" id="r-scan"><label for="r-scan" style="margin:0">Scanlines</label></div>
      <p id="r-status" role="status" aria-live="polite"></p>
`
);

// ------------------------------------------------------------------ the renderer prologue: runs before any texture, geometry or material is made
const SNAP = `
	// the 1998 renderer: every vertex lands on a pixel of the small picture, which is where the wobble comes from.
	// uRetroSnap holds half the picture size in cells (zero turns it off); the same value in both stages is what
	// makes the affine warp below line up with the snapped corners.
	if ( uRetroSnap.x > 0.0 ) {
		vec2 rp = gl_Position.xy / gl_Position.w;
		rp = floor( rp * uRetroSnap + 0.5 ) / uRetroSnap;
		gl_Position.xy = rp * gl_Position.w;
	}
#if defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY )
	// the affine warp: a uv scaled by w in the vertex and divided by w again in the fragment is interpolated the way
	// a console with no perspective divide interpolated it. how much of that reaches the screen is uRetroWarp.
	vUvA = vec3( vUvP * gl_Position.w, gl_Position.w );
#endif
`;
before(
  "renderer prologue",
  "  // ============================================================ procedural textures\n  function makeTex(size, draw, repeat = 1, alpha = false) {",
  `  // ============================================================ the 1998 renderer
  // the retro edition draws the same world through a different eye. everything here is arranged before a single
  // texture, geometry or material exists, because most of it works by changing what those constructors hand back:
  //   - the picture is rendered into a 240-line target and scaled up to the window without smoothing (retroBegin/End)
  //   - textures are painted at their old size, then shrunk to 64 pixels, cut to 16 shades a channel and shown unfiltered
  //   - every lit material becomes a lambert one, so light is worked out at the vertices and smeared across the face
  //   - the round geometries lose half their segments
  //   - a chunk patch snaps every vertex to the picture grid and lets the texture mapping ignore perspective
  //   - the screen pass cuts the colour to five bits a channel through a 4x4 ordered dither
  // none of this touches gameplay, collision or saves; the settings below are machine preferences like the sound sliders
  // the warp is off by default: the affine swim is right on a wall a few metres wide, and wrong on a floor that is
  // one polygon forty metres across, which is most of this game's floors. the dial is still there.
  const RETRO = { res: 4, wobble: 1, warp: 0, pixel: false, dither: true, scan: false, tex: 2 }; // the picture and the textures are the window's own by default since 3.2, and since 3.3.4 the textures are smoothed: unfiltered texels at full detail shimmer at every grazing angle
  const RETRO_RES = [200, 240, 320, 480, 0]; // picture height in lines; 0 is the window's own
  const RETRO_TEX_SIZES = [64, 128, 0]; // texture side in texels for the detail dial; 0 keeps the texture as painted
  const RETRO_U = { snap: { value: new THREE.Vector2(0, 0) }, warp: { value: 0 } }; // shared by every program, so a change reaches all of them without a recompile
  const RETRO_TEXTURES = [];
  const RETRO_SOURCES = new Map(); // texture -> { c, alpha }: the canvas it was painted on, kept so the detail dial can shrink it again
  let retroTexApplied = 2; // the detail the textures on the list were last made at
  const RETRO_POINTS = [], RETRO_POINT_SCALE = { value: 1 }; // every points material and the picture-to-window ratio its size is scaled by
  let RETRO_BLOBS = []; // the discs under villagers, checked each frame for a group that has been laid flat
  let retroReady = false; // the render target exists once the renderer does; until then the controls only write RETRO
  {
    // gouraud: what the main build draws with the physical material is drawn per vertex here. the physical class is
    // kept under a second name for the one material whose shader hook reads per-pixel normals (lucifer's hand).
    const Physical = THREE.MeshStandardMaterial;
    THREE.MeshStandardMaterialPBR = Physical;
    const DROP = ["roughness", "metalness", "roughnessMap", "metalnessMap", "envMapIntensity", "normalMap", "normalScale", "displacementMap", "displacementScale", "displacementBias", "flatShading"];
    class MeshStandardMaterialFlat extends THREE.MeshLambertMaterial {
      constructor(p) {
        let q = p;
        if (p) {
          q = Object.assign({}, p);
          for (const k of DROP) delete q[k]; // lambert would warn about each of these and ignore it
        }
        super(q);
        // kept as plain numbers so code that tunes them after construction still runs and still means nothing
        this.roughness = p && p.roughness !== undefined ? p.roughness : 1;
        this.metalness = p && p.metalness !== undefined ? p.metalness : 0;
        this.flatShading = !!(p && p.flatShading);
      }
    }
    // what shone in the main build shines here too. a metal — metalness past a half: the knights' plate, the crown,
    // the gold, gehenna's black water — is built as a phong material with a specular colour and a shininess worked
    // out from the roughness, its base colour darkened the way a metal's diffuse is. the highlight is per pixel
    // rather than per vertex, which is near enough what a console's environment map gave a breastplate.
    class MeshStandardMaterialShiny extends THREE.MeshPhongMaterial {
      constructor(p) {
        let q = p;
        if (p) {
          q = Object.assign({}, p);
          for (const k of DROP) if (k !== "flatShading") delete q[k];
          const m = p.metalness !== undefined ? p.metalness : 0,
            r = p.roughness !== undefined ? p.roughness : 1,
            base = new THREE.Color(q.color !== undefined ? q.color : 0xffffff);
          q.specular = base.clone().multiplyScalar(0.3 + 0.7 * m);
          q.shininess = 8 + 92 * (1 - r) * (1 - r);
          q.color = base.multiplyScalar(1 - 0.42 * m);
        }
        super(q);
        this.roughness = p && p.roughness !== undefined ? p.roughness : 1;
        this.metalness = p && p.metalness !== undefined ? p.metalness : 0;
      }
    }
    // a plain function under the old name: \`new\` on it hands back whichever of the two it returns, and each
    // instance's own constructor is the class it was built from, so clone() keeps working
    THREE.MeshStandardMaterial = function MeshStandardMaterial(p) { return p && p.metalness >= 0.5 ? new MeshStandardMaterialShiny(p) : new MeshStandardMaterialFlat(p); };
    // fewer sides on everything round. anything already at or under the floor keeps its count: the limbs are built
    // from six-sided cylinders and would fold flat at three
    const fewer = (n, floor) => (n === undefined || n <= floor ? n : Math.max(floor, Math.round(n * 0.5)));
    const S0 = THREE.SphereGeometry;
    THREE.SphereGeometry = class SphereGeometry extends S0 { constructor(r, ws, hs, ...a) { super(r, fewer(ws, 8), fewer(hs, 6), ...a); } };
    const C0 = THREE.CylinderGeometry;
    THREE.CylinderGeometry = class CylinderGeometry extends C0 { constructor(rt, rb, h, rs, ...a) { super(rt, rb, h, fewer(rs, 8), ...a); } };
    const K0 = THREE.ConeGeometry; // cone was declared on the original cylinder class, so it is wrapped on its own
    THREE.ConeGeometry = class ConeGeometry extends K0 { constructor(r, h, rs, ...a) { super(r, h, fewer(rs, 8), ...a); } };
    const T0 = THREE.TorusGeometry;
    THREE.TorusGeometry = class TorusGeometry extends T0 { constructor(r, t, rs, ts, ...a) { super(r, t, rs, fewer(ts, 12), ...a); } };
    const D0 = THREE.CircleGeometry;
    THREE.CircleGeometry = class CircleGeometry extends D0 { constructor(r, s, ...a) { super(r, fewer(s, 8), ...a); } };
    const R0 = THREE.RingGeometry;
    THREE.RingGeometry = class RingGeometry extends R0 { constructor(ri, ro, ts, ...a) { super(ri, ro, fewer(ts, 8), ...a); } };
    const L0 = THREE.LatheGeometry;
    THREE.LatheGeometry = class LatheGeometry extends L0 { constructor(p, s, ...a) { super(p, fewer(s, 8), ...a); } };
    // r128 sizes a point against the window's height, never the bound target's, so a size-attenuated mote drawn into
    // a 240-line picture came out four and a half times too big. every points material remembers the size it was
    // given and is rescaled with the picture (retroFit). the stars are not attenuated and stay in picture pixels.
    const P0 = THREE.PointsMaterial;
    THREE.PointsMaterial = class PointsMaterial extends P0 {
      constructor(p) {
        super(p);
        this.userData.retroSize = this.size;
        RETRO_POINTS.push(this);
        if (this.sizeAttenuation) this.size = this.userData.retroSize * RETRO_POINT_SCALE.value;
      }
      copy(src) {
        super.copy(src);
        this.userData.retroSize = src.userData && src.userData.retroSize !== undefined ? src.userData.retroSize : src.size;
        this.size = this.sizeAttenuation ? this.userData.retroSize * RETRO_POINT_SCALE.value : this.userData.retroSize;
        return this;
      }
    };
    // any clone of a retro texture is a retro texture. the rivers clone TEX.water directly rather than through cloneTex,
    // and the next texture someone clones will not go through it either
    const clone0 = THREE.Texture.prototype.clone;
    THREE.Texture.prototype.clone = function () {
      const c = clone0.call(this);
      if (RETRO_TEXTURES.indexOf(this) >= 0) retroTexture(c);
      const src = RETRO_SOURCES.get(this);
      if (src) RETRO_SOURCES.set(c, src); // the clone shares the painting, so the detail dial reaches it too
      return c;
    };
    // the chunk patches. these are the strings every built-in program is assembled from, so changing them here
    // changes every material at once, the game's own shader hooks included: those replace begin_vertex, common and
    // emissivemap_fragment and never touch the three chunks edited below.
    const CH = THREE.ShaderChunk;
    CH.common += "\\nuniform vec2 uRetroSnap;";
    // the vertex stage keeps its perspective-correct uv under a new name and adds the affine one beside it
    CH.uv_pars_vertex = CH.uv_pars_vertex.replace("varying vec2 vUv;", "varying vec2 vUvP; varying vec3 vUvA;\\n\\t\\t#define vUv vUvP");
    if (CH.uv_pars_vertex.indexOf("vUvA") < 0) throw new Error("retro: uv_pars_vertex did not take the patch");
    // uv_vertex is the first line of every built-in main(), so this seeds the affine uv with the plain one. the snap
    // block after projection overwrites it wherever there is a projection; a shader that has uvs but never reaches
    // project_vertex (the sprite) would otherwise read a varying nobody wrote and sample a quarter of its texture
    CH.uv_vertex = CH.uv_vertex.replace("vUv = ( uvTransform * vec3( uv, 1 ) ).xy;", "vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\\n\\t#ifndef UVS_VERTEX_ONLY\\n\\t\\tvUvA = vec3( vUvP, 1.0 );\\n\\t#endif");
    if (CH.uv_vertex.indexOf("vUvA") < 0) throw new Error("retro: uv_vertex did not take the patch");
    CH.project_vertex += SNAP_PLACEHOLDER;
    // the warp fades in with distance: the affine error is worst on the big triangles nearest the camera — a room's
    // floor and walls, the road at the bottom of the screen — and a console hid exactly that by cutting its near
    // geometry into pieces. this keeps the swim on everything past a dozen metres and takes it off what you stand on.
    // vUvA.z is the clip-space w, which is the view depth in metres.
    CH.uv_pars_fragment = \`#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
	varying vec2 vUvP; varying vec3 vUvA; uniform float uRetroWarp;
	vec2 retroUv() { return mix( vUvP, vUvA.xy / max( vUvA.z, 1e-4 ), uRetroWarp * smoothstep( 1.5, 12.0, vUvA.z ) ); }
	#define vUv retroUv()
#endif\`;
    // sprites build gl_Position in their own shader rather than through project_vertex, so they take the same block
    // by hand: the snap, and the affine uv (a billboard's four corners share one w, so for it the warp is exactly nothing)
    THREE.ShaderLib.sprite.vertexShader = THREE.ShaderLib.sprite.vertexShader.replace("gl_Position = projectionMatrix * mvPosition;", "gl_Position = projectionMatrix * mvPosition;" + SNAP_PLACEHOLDER);
    if (THREE.ShaderLib.sprite.vertexShader.indexOf("uRetroSnap") < 0 || THREE.ShaderLib.sprite.vertexShader.indexOf("vUvA =") < 0) throw new Error("retro: sprite shader did not take the patch");
    // the two uniforms above have to be registered on every program. materials reach the compiler through
    // onBeforeCompile, and five of the game's own materials set their own; so the prototype slot becomes an accessor
    // that keeps the material's hook aside and runs it first. the program cache key is rebuilt to carry the kept
    // hook's text, since the wrapper's own text is the same for every material and would otherwise merge programs
    // that must stay apart.
    const wrap = function (shader, renderer) {
      if (this._retroHook) this._retroHook.call(this, shader, renderer);
      shader.uniforms.uRetroSnap = RETRO_U.snap;
      shader.uniforms.uRetroWarp = RETRO_U.warp;
    };
    Object.defineProperty(THREE.Material.prototype, "onBeforeCompile", {
      configurable: true,
      get() { return wrap; },
      set(fn) { this._retroHook = fn; }
    });
    THREE.Material.prototype.customProgramCacheKey = function () { return (this._retroHook ? this._retroHook.toString() : "") + "|retro"; };
  }
  // textures: painted at the size the main build paints them, then shrunk to the cartridge budget and cut to
  // sixteen shades a channel, which is the banding a palette texture had
  function retroTexel(c, alpha) {
    const want = RETRO_TEX_SIZES[RETRO.tex];
    if (!want) return c; // native: the painting itself, untouched, so the dial can always come back to it
    const size = Math.min(want, c.width);
    // always a fresh canvas, even at the same size: the painting is kept for the dial and must not be cut in place
    const d = document.createElement("canvas");
    d.width = d.height = size;
    {
      const g = d.getContext("2d");
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = "high";
      g.drawImage(c, 0, 0, size, size);
    }
    const g = d.getContext("2d"),
      id = g.getImageData(0, 0, d.width, d.height),
      p = id.data;
    for (let i = 0; i < p.length; i += 4) {
      p[i] = Math.round(p[i] / 17) * 17;
      p[i + 1] = Math.round(p[i + 1] / 17) * 17;
      p[i + 2] = Math.round(p[i + 2] / 17) * 17;
      if (alpha) p[i + 3] = Math.round(p[i + 3] / 17) * 17; // alpha keeps its ramp in the same sixteen steps: the glow's soft edge shares this path with the leaf cutouts, and a cutout's own alphaTest already decides where it ends
    }
    g.putImageData(id, 0, 0);
    return d;
  }
  // unfiltered up close, the mip chain still there so the far ground does not boil; the smooth setting is the n64's
  // mips = false is for a transparent canvas drawn afresh all the time (the name tags): a mip chain averages the
  // clear pixels into the glyphs and goes muddy at a distance, and would be rebuilt on every change of health
  function retroTexture(t, register = true, mips = true) {
    if (register && RETRO_TEXTURES.indexOf(t) < 0) RETRO_TEXTURES.push(t); // a texture made afresh every few seconds (the name tags) is filtered but never listed, or the list would only grow
    const mag = RETRO.pixel ? THREE.NearestFilter : THREE.LinearFilter,
      min = !mips ? mag : RETRO.pixel ? THREE.NearestMipmapLinearFilter : THREE.LinearMipmapLinearFilter,
      aniso = RETRO.pixel ? 1 : 4; // smoothed textures get the main build's anisotropy back; unfiltered ones have none, as the console had none
    if (!mips) t.generateMipmaps = false;
    if (t.magFilter === mag && t.minFilter === min && t.anisotropy === aniso) return;
    t.magFilter = mag;
    t.minFilter = min;
    t.anisotropy = aniso;
    t.needsUpdate = true;
  }
  // the round shadow that stood in for a real one on every 1998 machine: a soft dark disc painted on a quad, sat just
  // above the ground. it was a circle geometry, which the halving above cut to eight sides — a hard grey octagon under
  // every villager. a radial gradient on a small texture is what the consoles actually drew, and it has no sides to lose
  const retroBlobGeo = new THREE.PlaneGeometry(2.6, 2.6),
    retroBlobTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d"), rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      rg.addColorStop(0, "rgba(0,0,0,1)"); rg.addColorStop(0.5, "rgba(0,0,0,0.92)"); rg.addColorStop(0.8, "rgba(0,0,0,0.3)"); rg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = rg;
      g.fillRect(0, 0, 64, 64);
      const t = new THREE.CanvasTexture(c);
      t.minFilter = t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      return t;
    })(),
    retroBlobMat = new THREE.MeshBasicMaterial({ color: 0x000000, map: retroBlobTex, transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  retroBlobGeo.userData.shared = retroBlobMat.userData.shared = true; // shared by every villager; disposeTree and disposeCharacter are taught below to step over shared geometry as they already do shared materials
  function retroBlob(r, mat = retroBlobMat, track = false) {
    const m = new THREE.Mesh(retroBlobGeo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.08; // over the feet by more than any street slab's top is over the plateau (four centimetres at most since 3.5)
    m.scale.setScalar(r);
    m.renderOrder = 1;
    if (track) RETRO_BLOBS.push(m); // a villager's disc: watched for the group being laid flat
    return m;
  }
  // the controls. they are read here so the values are known before the renderer exists, and again by loadPrefs
  // once the saved machine preferences come back
  function readRetroControls() {
    const num = (id, d) => { const el = document.getElementById(id), v = el ? +el.value : NaN; return Number.isFinite(v) ? v : d; };
    const on = (id, d) => { const el = document.getElementById(id); return el ? !!el.checked : d; };
    RETRO.res = clamp(Math.round(num("r-picture", 4)), 0, RETRO_RES.length - 1);
    RETRO.wobble = clamp(Math.round(num("r-wobble", 1)), 0, 3);
    RETRO.warp = clamp(num("r-affine", 0), 0, 1);
    RETRO.tex = clamp(Math.round(num("r-tex", 2)), 0, RETRO_TEX_SIZES.length - 1);
    RETRO.pixel = on("r-nearest", false);
    RETRO.dither = on("r-dither", true);
    RETRO.scan = on("r-scan", false);
    if (retroReady) applyRetro();
  }
  for (const id of ["r-picture", "r-wobble", "r-affine", "r-tex", "r-nearest", "r-dither", "r-scan"]) {
    const el = document.getElementById(id);
    if (el) el.oninput = el.onchange = readRetroControls;
  }
  readRetroControls();

`.replace(/SNAP_PLACEHOLDER/g, "`" + SNAP.replace(/`/g, "\\`") + "`")
);
// the chunk text goes through a template literal inside the generated file; make sure the GLSL survived the escaping
if (html.indexOf("rp = floor( rp * uRetroSnap + 0.5 ) / uRetroSnap;") < 0) throw new Error("retro: snap code lost in escaping");

// ------------------------------------------------------------------ textures
edit(
  "makeTex canvas",
  "    draw(g, size);\n    const t = new THREE.CanvasTexture(c);",
  "    draw(g, size);\n    const t = new THREE.CanvasTexture(retroTexel(c, alpha)); // painted at full size, shown at the detail dial's\n    RETRO_SOURCES.set(t, { c, alpha }); // the painting is kept, so the dial can make it again at another size"
);
edit(
  "makeTex filters",
  "    t.anisotropy = 4;\n    return t;\n  }",
  "    retroTexture(t); // no anisotropy, no smoothing: the texel is the unit\n    return t;\n  }"
);
edit(
  "cloneTex",
  "    const c = t.clone();\n    c.needsUpdate = true;\n    c.repeat.set(rx, ry);\n    return c;",
  "    const c = t.clone();\n    c.needsUpdate = true;\n    c.repeat.set(rx, ry);\n    retroTexture(c); // the clone copied the filters, but it has to be on the list so a filter change reaches it\n    return c;"
);

// ------------------------------------------------------------------ the profile and the renderer
edit(
  "quality profile",
  '{ id: "very-low", name: "Very low", pixel: 0.75, far: 185, shadow: 0, textures: false, grass: false, particles: 0.12, clouds: 0, hud: 0.12 }',
  '{ id: "very-low", name: "Very low", pixel: 1, far: 240, shadow: 0, textures: true, grass: false, particles: 0.12, clouds: 0, hud: 0.12 } // textures stay on and the world draws further: at 240 lines the fill rate is nothing, and a house that arrives at the edge of the fog arrives late'
);
edit(
  "renderer construction",
  "  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });\n  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 0.75)); // the profile the game runs at; nothing larger is ever allocated",
  "  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false }); // no smoothing anywhere: the picture is small on purpose\n  renderer.setPixelRatio(1); // the canvas is the window's own size; the world is drawn into the small target and scaled up in retroEnd"
);
edit(
  "shadow map",
  "  renderer.shadowMap.enabled = true;\n  renderer.shadowMap.type = THREE.PCFSoftShadowMap;",
  "  renderer.shadowMap.enabled = false; // 1998 had no shadow maps; the blob under each character is the shadow\n  renderer.shadowMap.type = THREE.PCFSoftShadowMap;"
);
edit(
  "tone mapping",
  "  renderer.toneMapping = THREE.ACESFilmicToneMapping;\n  renderer.toneMappingExposure = 1.22;",
  "  renderer.toneMapping = THREE.CineonToneMapping; // the aces curve made the meadow pale; a plain linear one clipped it to neon. cineon keeps the saturated 1998 green and still rolls the sun off\n  renderer.toneMappingExposure = 1.0;"
);
after(
  "retro pipeline",
  "  const scene = new THREE.Scene();\n  scene.fog = new THREE.Fog(toLin(0xc7dcef), 160, 700);\n",
  `  // ---- the 1998 renderer: the picture. the world is drawn into a small target and copied to the window by one
  // full-screen pass that cuts the colour depth and scales without smoothing
  // stencil on: without it r128 backs the target with a 16-bit depth buffer, 1/256 of what the window had, and the
  // town's cobbles z-fight past a few metres. with it the target gets the window's 24 bits, for two bytes a pixel.
  const retroRT = new THREE.WebGLRenderTarget(320, 240, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, stencilBuffer: true });
  retroRT.texture.encoding = THREE.sRGBEncoding; // every material writes finished srgb bytes into it, as it would to the screen, so the copy is a copy
  retroRT.texture.generateMipmaps = false;
  const retroPost = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: retroRT.texture }, uRes: { value: new THREE.Vector2(320, 240) }, uScreen: { value: new THREE.Vector2(1, 1) }, uDither: { value: 1 }, uScan: { value: 0 } },
    vertexShader: \`varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }\`,
    fragmentShader: \`uniform sampler2D tDiffuse; uniform vec2 uRes, uScreen; uniform float uDither, uScan; varying vec2 vUv;
    float m2( vec2 p ) { return 2.0 * p.x + 3.0 * p.y - 4.0 * p.x * p.y; } // the 2x2 bayer cell, 0 2 / 3 1
    void main() {
      vec3 c = texture2D( tDiffuse, vUv ).rgb;
      vec2 px = floor( vUv * uRes ); // the small picture's own pixel, so the pattern is one cell per texel however far it is scaled
      if ( uDither > 0.5 ) {
        float d = ( 4.0 * m2( mod( px, 2.0 ) ) + m2( mod( floor( px * 0.5 ), 2.0 ) ) ) / 16.0 - 0.5; // 4x4 ordered dither
        c = floor( c * 31.0 + d + 0.5 ) / 31.0; // five bits a channel: the 15-bit frame buffer
      }
      // one dark line per picture row, and never finer than every other window line: at the window's own size a
      // picture row is one line, and darkening the whole of it would only dim the screen
      if ( uScan > 0.5 ) { float period = max( 2.0, uScreen.y / uRes.y ); c *= 1.0 - 0.22 * step( 0.5, mod( gl_FragCoord.y, period ) / period ); }
      gl_FragColor = vec4( c, 1.0 );
    }\`,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  });
  const retroScreen = new THREE.Scene(),
    retroCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  {
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), retroPost);
    q.frustumCulled = false;
    retroScreen.add(q);
  }
  const RETRO_NOCLIP = [];
  // size the target to the chosen line count at the window's shape; called every frame and does nothing until either changes
  function retroFit() {
    const wantH = RETRO_RES[RETRO.res] || Math.max(1, Math.round(innerHeight)),
      h = Math.max(1, Math.min(wantH, Math.round(innerHeight) || wantH)),
      w = Math.max(1, Math.round((h * (innerWidth || 1)) / (innerHeight || 1)));
    retroPost.uniforms.uScreen.value.set(Math.max(1, innerWidth || 1), Math.max(1, innerHeight || 1));
    // the point scale is set before the size test, not after: a 4:3 window asks for exactly the 320×240 the target
    // was born at, and the early return below would otherwise leave every attenuated point at the window's size
    RETRO_POINT_SCALE.value = h / Math.max(1, innerHeight || h);
    for (const m of RETRO_POINTS) if (m.sizeAttenuation) m.size = m.userData.retroSize * RETRO_POINT_SCALE.value;
    if (retroRT.width === w && retroRT.height === h) return;
    retroRT.setSize(w, h);
    retroPost.uniforms.uRes.value.set(w, h);
    const k = RETRO.wobble;
    RETRO_U.snap.value.set(k > 0 ? w / (2 * k) : 0, k > 0 ? h / (2 * k) : 0);
    retroStatus();
  }
  function retroBegin() {
    retroFit();
    renderer.setRenderTarget(retroRT);
  }
  // the copy to the window. the world's clipping planes are global to the renderer and would cut the quad too
  function retroEnd() {
    renderer.setRenderTarget(null);
    const clip = renderer.clippingPlanes;
    renderer.clippingPlanes = RETRO_NOCLIP;
    renderer.render(retroScreen, retroCam);
    renderer.clippingPlanes = clip;
  }
  function applyRetro() {
    retroFit();
    const k = RETRO.wobble;
    RETRO_U.snap.value.set(k > 0 ? retroRT.width / (2 * k) : 0, k > 0 ? retroRT.height / (2 * k) : 0);
    RETRO_U.warp.value = RETRO.warp;
    retroPost.uniforms.uDither.value = RETRO.dither ? 1 : 0;
    retroPost.uniforms.uScan.value = RETRO.scan ? 1 : 0;
    for (const t of RETRO_TEXTURES) retroTexture(t);
    if (retroTexApplied !== RETRO.tex) {
      // every painting is shrunk again at the new detail, clones included: they share the painting through the map
      retroTexApplied = RETRO.tex;
      for (const [t, src] of RETRO_SOURCES) {
        t.image = retroTexel(src.c, src.alpha);
        t.needsUpdate = true;
      }
    }
    retroStatus();
  }
  const retroTexName = () => (RETRO_TEX_SIZES[RETRO.tex] ? RETRO_TEX_SIZES[RETRO.tex] + "-texel" : "native");
  function retroStatus() {
    const el = document.getElementById("r-status");
    if (el) el.textContent = \`\${retroRT.width}×\${retroRT.height} picture · wobble \${RETRO.wobble} · warp \${RETRO.warp.toFixed(1)} · \${retroTexName()} \${RETRO.pixel ? "pixel" : "smooth"} textures · \${RETRO.dither ? "15-bit dithered" : "24-bit"} colour\${RETRO.scan ? " · scanlines" : ""}.\`;
    const put = (id, s) => { const e = document.getElementById(id); if (e) e.textContent = s; };
    put("r-res-val", RETRO_RES[RETRO.res] ? RETRO_RES[RETRO.res] + "p" : "native");
    put("r-wobble-val", String(RETRO.wobble));
    put("r-affine-val", RETRO.warp.toFixed(1));
    put("r-tex-val", retroTexName());
  }
  // the hero's blob shadow lives in the scene rather than under the model, because the model rises with a jump and
  // the shadow has to stay on the ground and shrink. other players get the same treatment, one pooled disc each,
  // for the same reason. villagers get theirs from makePerson, carried by the group.
  let retroHeroBlob = null, retroBlobFrame = 0;
  const retroAvatarBlobs = new Map(), retroEnemyBlobs = new Map(); // one pooled disc per other player, and per wolf or wraith
  // put a scene-level disc on the ground under a character, shrinking and fading with height; hidden when swimming,
  // when there is no ground to speak of, or when they are more than seven metres above it
  function retroPlaceBlob(b, x, y, z, hide) {
    if (hide) { b.visible = false; return; }
    const g = groundAt(x, z, y + 0.4),
      lift = y - g;
    if (!Number.isFinite(g) || !(lift < 7)) { b.visible = false; return; }
    const k = clamp(1 - lift / 7, 0, 1);
    b.visible = true;
    b.position.set(x, g + 0.08, z);
    b.scale.setScalar(0.55 + 0.45 * k);
    b.material.opacity = 0.5 * (0.4 + 0.6 * k);
  }
  function retroBlobUpdate() {
    retroBlobFrame++;
    // a villager laid flat — a body, the burial carry, a sleeper in a bed — turns the disc under them on its edge.
    // the group's up axis is read out of last frame's world matrix (column two, scaled by the group's own scale) and
    // the disc is hidden whenever it is not roughly upright
    for (let i = 0; i < RETRO_BLOBS.length; i++) {
      const m = RETRO_BLOBS[i], p = m.parent;
      if (!p) continue;
      const e = p.matrixWorld.elements;
      m.visible = e[5] > 0.7 * Math.hypot(e[4], e[5], e[6]);
    }
    if ((retroBlobFrame & 255) === 0) RETRO_BLOBS = RETRO_BLOBS.filter(m => { let o = m; while (o.parent) o = o.parent; return o === scene; }); // goblins come and go; do not keep their groups alive through their discs
    if (!retroHeroBlob) {
      retroHeroBlob = retroBlob(1, retroBlobMat.clone());
      retroHeroBlob.material.userData.shared = true;
      retroHeroBlob.position.y = 0;
      scene.add(retroHeroBlob);
    }
    retroPlaceBlob(retroHeroBlob, P.pos.x, P.pos.y, P.pos.z, !started || titleMode || !hero || hero.visible === false || P.swim || P.lying); // lying in a bed, like a villager laid flat, is no time for a disc
    // the other players, if any: a disc per avatar, made when they arrive and dropped when they leave
    const avatars = typeof NET === "object" && NET && NET.avatars instanceof Map ? NET.avatars : null;
    if (avatars) {
      for (const [id, a] of avatars) {
        let b = retroAvatarBlobs.get(id);
        if (!b) { b = retroBlob(1, retroBlobMat.clone()); b.material.userData.shared = true; b.position.y = 0; scene.add(b); retroAvatarBlobs.set(id, b); }
        const m = a && a.mesh, s = a && a.state;
        retroPlaceBlob(b, m ? m.position.x : 0, m ? m.position.y : 0, m ? m.position.z : 0, !m || m.visible === false || !s || s.dead || s.swim || s.lying);
      }
      // the disc's material is its own (it fades on its own); the geometry is the shared one and stays
      for (const [id, b] of retroAvatarBlobs) if (!avatars.has(id)) { scene.remove(b); b.material.dispose(); retroAvatarBlobs.delete(id); }
    } else if (retroAvatarBlobs.size) {
      for (const b of retroAvatarBlobs.values()) { scene.remove(b); b.material.dispose(); }
      retroAvatarBlobs.clear();
    }
    // wolves and bog wraiths are not made by makePerson and carried no disc at all: one pooled disc each, laid on the
    // ground under them like the hero's, so the wraith's rise shrinks and fades it the way a jump does
    if (typeof allEnemies === "function") {
      const seen = new Set();
      for (const e of allEnemies()) {
        if (!e || !e.alive || !e.mesh || !e.pos || !(e.kind === "wolf" || e.kind === "wraith")) continue;
        seen.add(e);
        let b = retroEnemyBlobs.get(e);
        if (!b) { b = retroBlob(e.kind === "wolf" ? 1.05 : 0.8, retroBlobMat.clone()); b.material.userData.shared = true; b.position.y = 0; scene.add(b); retroEnemyBlobs.set(e, b); }
        retroPlaceBlob(b, e.pos.x, e.pos.y, e.pos.z, e.mesh.visible === false || !!e.hidden);
      }
      for (const [e, b] of retroEnemyBlobs) if (!seen.has(e)) { scene.remove(b); b.material.dispose(); retroEnemyBlobs.delete(e); }
    }
  }
  retroReady = true;
  applyRetro();
`
);
edit(
  "loading draw",
  "    renderer.setSize(innerWidth, innerHeight, false);\n    renderer.render(scene, camera);\n  }; // while the world is built it is drawn as it stands",
  "    renderer.setSize(innerWidth, innerHeight, false);\n    retroBegin();\n    renderer.render(scene, camera);\n    retroEnd();\n  }; // while the world is built it is drawn as it stands"
);

// ------------------------------------------------------------------ the sky: two-tone clouds cut from value noise, drifting
edit(
  "sky uniforms",
  "        sunCol: { value: new THREE.Color() }\n      },\n      side: THREE.BackSide,",
  "        sunCol: { value: new THREE.Color() },\n        uTime: { value: 0 }\n      },\n      side: THREE.BackSide,"
);
edit(
  "sky fragment",
  "fragmentShader: `uniform vec3 top, horizon, sunDir, sunCol; varying vec3 vDir; void main(){ float h = clamp(vDir.y, 0., 1.); vec3 col = mix(horizon, top, pow(h, .55)); float s = max(dot(normalize(vDir), sunDir), 0.); col += sunCol * (pow(s, 90.) * 2.0 + pow(s, 6.) * .12); gl_FragColor = vec4(col, 1.0);",
  "fragmentShader: `uniform vec3 top, horizon, sunDir, sunCol; uniform float uTime; varying vec3 vDir;\n" +
    "    float rhash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\n" +
    "    float rnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(rhash(i), rhash(i + vec2(1.0, 0.0)), f.x), mix(rhash(i + vec2(0.0, 1.0)), rhash(i + vec2(1.0, 1.0)), f.x), f.y); }\n" +
    "    void main(){ float h = clamp(vDir.y, 0., 1.); vec3 col = mix(horizon, top, pow(h, .55)); float s = max(dot(normalize(vDir), sunDir), 0.); col += sunCol * (pow(s, 90.) * 2.0 + pow(s, 6.) * .12);\n" +
    "    // the clouds: two octaves of value noise on the sky's flat projection, cut to two tones. a console had no room for a soft edge,\n" +
    "    // and at 240 lines the cut reads as the chunky cloud every 1998 skybox had. their colour follows the horizon so night keeps them dark.\n" +
    "    if (h > 0.02) { vec2 cp = vDir.xz / (vDir.y + 0.25) * 2.2 + vec2(uTime * 0.012, uTime * 0.004); float n = rnoise(cp) * 0.62 + rnoise(cp * 2.7 + 13.1) * 0.38; float body = step(0.56, n), lit = step(0.66, n); float lum = dot(horizon, vec3(0.3, 0.59, 0.11)); vec3 cc = horizon + (1.0 - horizon) * clamp(lum * 1.25, 0.0, 1.0); float fade = smoothstep(0.02, 0.14, h) * 0.9; col = mix(col, mix(cc * 0.78, cc, lit), body * fade); }\n" +
    "    gl_FragColor = vec4(col, 1.0);"
);

// ------------------------------------------------------------------ people: the blob under every villager
after(
  "villager blob",
  "      pants = lam(o.pants || 0x3a2e24);\n",
  "    g.add(retroBlob(0.95, retroBlobMat, true)); // the 1998 shadow: a disc at the feet, carried by the group and hidden whenever the group is laid flat. well wider than the body: from the usual camera height a disc the body's own width hides under the model entirely\n"
);
// the two teardown helpers skip shared materials already; the blob disc is the first shared geometry, so they skip that too
edit(
  "disposeTree shared geometry",
  "if (o.geometry && !o.isSprite) o.geometry.dispose();",
  "if (o.geometry && !o.isSprite && !o.geometry.userData.shared) o.geometry.dispose(); // the blob shadow's disc is one geometry under every villager"
);
edit(
  "disposeCharacter shared geometry",
  "if (o.geometry && !o.isSprite) geometries.add(o.geometry);",
  "if (o.geometry && !o.isSprite && !o.geometry.userData.shared) geometries.add(o.geometry); // the blob shadow's disc is one geometry under every villager"
);
// the multiplayer name tag is redrawn on every change of health; it is filtered like the rest but never listed
edit(
  "name tag filter",
  "tex.minFilter = THREE.LinearFilter; return tex;",
  "retroTexture(tex, false, false); return tex;"
);
// the valley draws further in this edition; the picture is small and the fill is cheap
edit(
  "town draw distance",
  "      townDrawDistance: 60, // metres you can see inside the walls before the beacon is lit",
  "      townDrawDistance: 110, // metres you can see inside the walls before the beacon is lit (sixty in the main build: at 240 lines the fill is cheap, and a house that arrived at sixty arrived late)"
);
// every room is drawn as far as the view reaches (the main build draws a room's inside within thirty metres, the
// keep and the church excepted), so a house does not arrive with its inside missing
edit(
  "rooms to the view distance",
  "      it.group.visible = !it.keepHides && (it.keep || it === roomNow || Math.hypot(it.cx - P.pos.x, it.cz - P.pos.z) < (it.drawR || ROOM_DRAW_R));",
  "      it.group.visible = !it.keepHides && (it.keep || it === roomNow || Math.hypot(it.cx - P.pos.x, it.cz - P.pos.z) < camera.far); // retro: every room is drawn as far as the view reaches, so a house does not arrive with its inside missing"
);
// a frame that throws after retroBegin would otherwise leave the renderer aimed at the small picture with nothing
// copied to the window; if it throws every frame the screen freezes while the game runs on underneath. the copy is
// made on the way into the error handler, so whatever was drawn is shown and the next frame starts clean.
edit(
  "frame error recovery",
  "    } catch (e) {\n      frameErrors++;\n      console.error(\"frame\", frameErrors, e);",
  "    } catch (e) {\n      try { retroEnd(); } catch (_) {}\n      frameErrors++;\n      console.error(\"frame\", frameErrors, e);"
);

// ------------------------------------------------------------------ lucifer's hand keeps the per-pixel material its rim hook reads from
edit(
  "hand material",
  "handWhite = lit(0xf2ead9)",
  "handWhite = remember(new (THREE.MeshStandardMaterialPBR || THREE.MeshStandardMaterial)({ color: toLin(0xf2ead9), roughness: 0.88, metalness: 0, fog: false })) /* its hook reads per-pixel normals, which the lambert stand-in has none of; the fallback is for the sandbox suites, which load this function without the prologue */"
);

// ------------------------------------------------------------------ settings and the frame
edit(
  "pref ids",
  'const PREF_IDS = ["s-sens", "s-sfx", "s-music", "s-amb", "s-voice", "s-arrow"];',
  'const PREF_IDS = ["s-sens", "s-sfx", "s-music", "s-amb", "s-voice", "s-arrow", "r-picture", "r-wobble", "r-affine", "r-tex", "r-nearest", "r-dither", "r-scan"]; // r-affine, r-picture and r-nearest rather than r-warp, r-res and r-pixel: each default changed, and a saved old value would have come straight back'
);
edit(
  "apply pixel ratio",
  "    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, graphics.pixel));",
  "    renderer.setPixelRatio(1); // the picture's size is the retro target's; the canvas stays 1:1 with the window"
);
edit(
  "resize",
  "  function resize() {\n    renderer.setSize(innerWidth, innerHeight, false);\n    camera.aspect = innerWidth / innerHeight;",
  "  function resize() {\n    renderer.setSize(innerWidth, innerHeight, false);\n    retroFit(); // the small picture follows the window's shape, not its size\n    camera.aspect = innerWidth / innerHeight;"
);
edit(
  "frame begin",
  "    gehChildrenHeal(dt);\n    renderer.clippingPlanes = P.pos.y < DIVIDE ? GEH_CLIP : NO_CLIP;\n    renderer.render(scene, camera);",
  "    gehChildrenHeal(dt);\n    sky.material.uniforms.uTime.value = now * 0.001;\n    retroBlobUpdate();\n    retroBegin(); // every pass below lands in the small picture\n    renderer.clippingPlanes = P.pos.y < DIVIDE ? GEH_CLIP : NO_CLIP;\n    renderer.render(scene, camera);"
);
edit(
  "frame end",
  "      scene.background = bgSave;\n      camera.layers.set(0);\n    }\n  }",
  "      scene.background = bgSave;\n      camera.layers.set(0);\n    }\n    retroEnd(); // and the picture goes to the window\n  }"
);

// the qa runner splices its bridge in at this anchor; the retro build has to keep it
if (html.indexOf("})();\nwindow.__boot = __boot;") < 0) throw new Error("retro: boot anchor lost");

fs.writeFileSync(OUT, html);
console.log(`${path.basename(OUT)}: ${edits.length} edits, ${(html.length / 1048576).toFixed(2)} MB`);
