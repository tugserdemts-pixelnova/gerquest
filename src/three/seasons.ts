import { T, cvs2, sm } from "./util";
import { SUMMER_GRASS, SUMMER_GROUND, type GroundPal } from "./world";
import type { createWorld } from "./world";

import type { Season } from "../data/seasons";

type Fx = "pollen" | "petals" | "leaves" | "snow";
// one season's look: sky (horizon haze = fog colour, zenith, sun glow), hemisphere + sun light, fog range,
// ground / grass / pine (3 palettes × 3 tiers) / rock / cloud colours, wildflowers on or off, falling weather, extra mountain haze
interface Look {
  haze: number; zen: number; glow: number; hemi: [number, number, number]; sun: [number, number]; fog: [number, number];
  ground: GroundPal; grass: number[]; pines: number[][]; rocks: number[]; cloud: [number, number]; flowers: boolean; fx: Fx; mtn: number;
}

const LOOKS: Record<Season, Look> = {
  spring: {
    haze: 0xdff0ea, zen: 0x5ba7e4, glow: 0xfff4dc, hemi: [0xf4fff6, 0x8a8560, .95], sun: [0xfff8ea, .82], fog: [40, 230],
    ground: [0x5f8f3c, 0x7cab4a, 0x86904c, 0xa69273, 0x77726a], grass: [0x6a9c3c, 0x7fb048, 0x92bf55, 0x6f9440],
    pines: [[0x3a7a3c, 0x4a8e46, 0x5ca452], [0x44843f, 0x55974a, 0x68ab56], [0x356a3c, 0x427d45, 0x52904f]],
    rocks: [0x8a857c, 0x77736c], cloud: [0xffffff, 0x56677a], flowers: true, fx: "petals", mtn: 0,
  },
  summer: {
    haze: 0xd9ecf2, zen: 0x3f8fd8, glow: 0xffeec7, hemi: [0xf2f8ff, 0x8a7a55, .95], sun: [0xfff3dd, .85], fog: [40, 240],
    ground: SUMMER_GROUND, grass: SUMMER_GRASS,
    pines: [[0x2f6332, 0x3b7438, 0x478540], [0x3a6e36, 0x467f3d, 0x549046], [0x2c5a35, 0x376b3c, 0x427a44]],
    rocks: [0x8a857c, 0x77736c], cloud: [0xffffff, 0x4a5868], flowers: true, fx: "pollen", mtn: 0,
  },
  // larches turn gold and rust; the third palette stays evergreen
  autumn: {
    haze: 0xf0e2c8, zen: 0x5f93cc, glow: 0xffd59a, hemi: [0xfff0d8, 0x7a6448, .88], sun: [0xffd8a0, .86], fog: [38, 220],
    ground: [0x857a3c, 0x958844, 0x8c6e36, 0x9a8260, 0x6e665c], grass: [0xa89346, 0xb89c4c, 0x9a7a3a, 0x847238],
    pines: [[0xb8781e, 0xd09030, 0xe2aa3e], [0xc0621e, 0xd67a2a, 0xe8963a], [0x2c5a35, 0x376b3c, 0x427a44]],
    rocks: [0x8a8278, 0x77706a], cloud: [0xfff6ea, 0x5a5460], flowers: false, fx: "leaves", mtn: .08,
  },
  // snow on the ground and on the upper pine tiers, straw-coloured grass poking through, a low pale sun
  winter: {
    haze: 0xe4ebf2, zen: 0x8db2d8, glow: 0xf2f6ff, hemi: [0xeef4ff, 0x9aa6b8, .85], sun: [0xe6eeff, .55], fog: [30, 200],
    ground: [0xd0d8e2, 0xe2e8f0, 0xc4cedb, 0xb3ac9f, 0xa6adb6], grass: [0xc8b98a, 0xb5a676, 0xd6cba4, 0xa89a70],
    pines: [[0x4f6e66, 0x8fa8a2, 0xdfe9ea], [0x557568, 0x98b0a8, 0xe6eeee], [0x46625c, 0x86a09a, 0xd6e2e2]],
    rocks: [0xc2c6cc, 0xaeb3ba], cloud: [0xeef2f6, 0x6a7486], flowers: false, fx: "snow", mtn: .22,
  },
};

// falling weather: [particles, colours, size, fall speed (negative = drifts up), sway, texture]
const FX: Record<Fx, [number, number[], number, number, number, "dot" | "leaf"]> = {
  pollen: [220, [0xfffbe0, 0xffffff], .13, -.15, .4, "dot"],
  petals: [520, [0xffc6dc, 0xffe4ee, 0xffffff], .2, .45, .9, "dot"],
  leaves: [620, [0xe8a23a, 0xd9782a, 0xc2502a, 0xf0c048], .32, .9, 1.4, "leaf"],
  snow: [1700, [0xffffff, 0xeef4ff], .22, 1.5, .5, "dot"],
};
const MAXP = 1700, HX = 40, HY = 18, HZ = 40;

const tex = (k: "dot" | "leaf") => new T.CanvasTexture(cvs2(64, 64, (x, w, h) => {
  if (k == "dot") {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.45, "rgba(255,255,255,.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  } else {
    x.fillStyle = "#fff"; x.beginPath(); x.moveTo(32, 4); x.quadraticCurveTo(58, 30, 32, 60); x.quadraticCurveTo(6, 30, 32, 4); x.fill();
    x.strokeStyle = "rgba(0,0,0,.25)"; x.lineWidth = 2; x.beginPath(); x.moveTo(32, 8); x.lineTo(32, 56); x.stroke();
  }
}));

type World = ReturnType<typeof createWorld>;

export function createSeasons(S: T.Scene, w: World, hemi: T.HemisphereLight, sun: T.DirectionalLight) {
  const L = w.look, U = L.sky.uniforms, fog = S.fog as T.Fog, cloud = L.clouds;
  // every colour a season drives, in the same order as cols() lists them
  const targets: T.Color[] = [U.hz.value, U.zen.value, U.glow.value, fog.color, hemi.color, hemi.groundColor, sun.color,
    ...L.pines.flat().map(m => m.color), ...L.rocks.map(m => m.color), cloud.color, cloud.emissive];
  const cols = (l: Look) => [l.haze, l.zen, l.glow, l.haze, l.hemi[0], l.hemi[1], l.sun[0], ...l.pines.flat(), ...l.rocks, ...l.cloud].map(c => new T.Color(c));
  const nums = (l: Look) => [l.hemi[2], l.sun[1], l.fog[0], l.fog[1], l.mtn];
  let cur = nums(LOOKS.summer);
  const writeNums = (n: number[]) => { hemi.intensity = n[0]; sun.intensity = n[1]; fog.near = n[2]; fog.far = n[3]; cur = n; };

  const gArr = L.ground.array as Float32Array, gIC = L.grass.instanceColor as T.InstancedBufferAttribute, sArr = gIC.array as Float32Array;
  const paintCache: Partial<Record<Season, [Float32Array, Float32Array]>> = {};
  const paint = (s: Season) => paintCache[s] || (paintCache[s] = [L.paintGround(LOOKS[s].ground), L.paintGrass(LOOKS[s].grass)]);

  // weather particles live in a box that wraps around the camera
  const pos = new Float32Array(MAXP * 3), col = new Float32Array(MAXP * 3), spd = new Float32Array(MAXP), ph = new Float32Array(MAXP);
  for (let i = 0; i < MAXP; i++) {
    pos.set([(Math.random() * 2 - 1) * HX, (Math.random() * 2 - 1) * HY, (Math.random() * 2 - 1) * HZ], i * 3);
    spd[i] = .7 + Math.random() * .6; ph[i] = Math.random() * 100;
  }
  const pg = new T.BufferGeometry();
  pg.setAttribute("position", new T.BufferAttribute(pos, 3)); pg.setAttribute("color", new T.BufferAttribute(col, 3));
  const maps = { dot: tex("dot"), leaf: tex("leaf") };
  const pm = new T.PointsMaterial({ size: .2, map: maps.dot, vertexColors: true, transparent: true, depthWrite: false, opacity: 0 });
  const pts = new T.Points(pg, pm); pts.frustumCulled = false; S.add(pts);
  let fx: Fx | null = null;
  const useFx = (f: Fx) => {
    const [n, cs, size, , , m] = FX[f], c = new T.Color();
    for (let i = 0; i < n; i++) { c.set(cs[i % cs.length]); col.set([c.r, c.g, c.b], i * 3); }
    pg.setDrawRange(0, n); (pg.attributes.color as T.BufferAttribute).needsUpdate = true;
    pm.size = size; pm.map = maps[m]; pm.needsUpdate = true; fx = f;
  };

  // k = blend progress, timed by the clock (not frames) so slow devices still finish in 1.8 s
  let to: Season = "summer", from: Season = "summer", k = 1, t0 = 0;
  let fromCols = targets.map(c => c.clone()), toCols = cols(LOOKS.summer), fromNums = cur, toNums = cur;
  let fromG = gArr.slice(), fromS = sArr.slice();

  function apply(e: number) {
    targets.forEach((c, i) => c.copy(fromCols[i]).lerp(toCols[i], e));
    writeNums(fromNums.map((v, i) => v + (toNums[i] - v) * e));
    const [tg, ts] = paint(to);
    for (let i = 0; i < gArr.length; i++) gArr[i] = fromG[i] + (tg[i] - fromG[i]) * e;
    for (let i = 0; i < sArr.length; i++) sArr[i] = fromS[i] + (ts[i] - fromS[i]) * e;
    L.ground.needsUpdate = true; gIC.needsUpdate = true;
    L.flowers.visible = e < .5 ? LOOKS[from].flowers : LOOKS[to].flowers;
    // weather: the old kind fades out, then the new one fades in
    const nf = LOOKS[to].fx, swap = LOOKS[from].fx != nf;
    if (fx != nf && (e >= .5 || !swap || fx == null)) useFx(nf);
    pm.opacity = swap ? Math.abs(1 - e * 2) : 1;
  }

  return {
    // switch season; instant skips the blend (first load)
    set(s: Season, instant = false) {
      if (s == to && k >= 1 && fx) return;
      from = k >= 1 ? to : (k < .5 ? from : to);
      fromCols = targets.map(c => c.clone()); fromNums = cur; fromG = gArr.slice(); fromS = sArr.slice();
      to = s; toCols = cols(LOOKS[s]); toNums = nums(LOOKS[s]); k = 0; t0 = performance.now();
      if (instant) { from = s; k = 1; apply(1); }
    },
    // extra haze the mountains get this season (0 = none)
    mtn: () => cur[4],
    tick(dt: number, t: number, cam: T.Vector3) {
      if (k < 1) { k = Math.min(1, (t - t0) / 1800); apply(sm(0, 1, k)); }
      if (!fx || pm.opacity <= 0) return;
      const [n, , , vy, sw] = FX[fx];
      for (let i = 0; i < n; i++) {
        const j = i * 3, q = t * .001 + ph[i];
        pos[j] += Math.sin(q * .9) * sw * dt; pos[j + 1] -= vy * spd[i] * dt; pos[j + 2] += Math.cos(q * .7) * sw * .6 * dt;
        const dx = pos[j] - cam.x, dy = pos[j + 1] - cam.y, dz = pos[j + 2] - cam.z;
        if (dx > HX) pos[j] -= 2 * HX; else if (dx < -HX) pos[j] += 2 * HX;
        if (dy < -HY) pos[j + 1] += 2 * HY; else if (dy > HY) pos[j + 1] -= 2 * HY;
        if (dz > HZ) pos[j + 2] -= 2 * HZ; else if (dz < -HZ) pos[j + 2] += 2 * HZ;
      }
      (pg.attributes.position as T.BufferAttribute).needsUpdate = true;
    },
  };
}
