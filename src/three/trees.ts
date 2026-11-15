import { T, PI, sm } from "./util";
import { Batch } from "./craft";
import type { Season } from "../data/seasons";

// every season has its own tree, standing on the same spots: a white-blossomed tree in spring, golden-green foliage in summer,
// the golden birch in autumn and a snowy, decorated pine in winter. Each kind is drawn once per shape and shared as instances.

// its own seed, so that shaping the trees leaves the rest of the scenery where it is
let sd = 77;
const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
const hash = (a: number) => { const s = Math.sin(a) * 43758.5453; return s - Math.floor(s); };
const K = new T.Color();

// a lumpy ball of leaves or blossom, bright on top and dark underneath. The lumps come from the position, so the facets stay joined
function clump(b: Batch, r: number, x: number, y: number, z: number, col: number, sy = .82, detail = 1) {
  const g = new T.IcosahedronGeometry(r, detail), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const X = p.getX(i), Y = p.getY(i), Z = p.getZ(i), f = 1 + (hash(Math.round(X * 300) + Math.round(Y * 300) * 7.1 + Math.round(Z * 300) * 13.3 + x) - .5) * .34;
    p.setXYZ(i, X * f + x, Y * f * sy + y, Z * f + z);
  }
  g.computeVertexNormals();
  const n = g.attributes.normal, c = new Float32Array(p.count * 3);
  K.set(col);
  for (let i = 0; i < p.count; i++) { const k = .72 + .42 * Math.max(0, n.getY(i)) + .1 * hash(i); c[i * 3] = K.r * k; c[i * 3 + 1] = K.g * k; c[i * 3 + 2] = K.b * k; }
  g.setAttribute("color", new T.BufferAttribute(c, 3));
  b.raw(g);
}

const UP = new T.Vector3(0, 1, 0), Qt = new T.Quaternion(), V = new T.Vector3(), One = new T.Vector3(1, 1, 1);
// a tapered limb from A to E
function limb(b: Batch, A: T.Vector3, E: T.Vector3, ra: number, re: number, c: number) {
  const d = V.copy(E).sub(A), len = d.length();
  Qt.setFromUnitVectors(UP, d.clone().normalize());
  b.add(new T.CylinderGeometry(re, ra, len, 5, 1, true), c, new T.Matrix4().compose(A.clone().lerp(E, .5), Qt, One));
}
// a limb and what grows out of it; `ends` collects the twig tips. snow lays a white line along the upper side
function branch(b: Batch, A: T.Vector3, dir: T.Vector3, len: number, rad: number, depth: number, col: number, ends: T.Vector3[], snow = false) {
  const E = A.clone().addScaledVector(dir, len), re = rad * .68;
  limb(b, A, E, rad, re, col);
  if (snow && dir.y < .86) limb(b, A.clone().setY(A.y + rad * .85), E.clone().setY(E.y + re * .85), rad * .8, re * .8, 0xf4f8fc);
  if (!depth) { ends.push(E); return; }
  const n = rnd() < .35 ? 3 : 2, a0 = rnd() * 7;
  for (let i = 0; i < n; i++) {
    const a = a0 + i / n * 2 * PI, s = .5 + rnd() * .3;
    const d = dir.clone().add(new T.Vector3(Math.cos(a) * s, .06 + rnd() * .14, Math.sin(a) * s)).normalize();
    branch(b, E, d, len * (.68 + rnd() * .14), re, depth - 1, col, ends, snow);
  }
}
const trunkBase = (b: Batch, r: number, c: number) => b.cyl(r, r * 1.5, .34, c, 0, .17, 0, 7);

// a tier of pine boughs, with snow settled across its upper tips
function bough(r: number, h: number, y: number, col: number) {
  const n = 10, a0 = rnd() * 7, ox = (rnd() - .5) * .12, oz = (rnd() - .5) * .12;
  const P: number[] = [], C: number[] = [], tip: number[][] = [], gap: number[][] = [], top = [ox * .3, y + h, oz * .3], core = [ox, y + h * .08, oz];
  for (let i = 0; i < n; i++) {
    const a = a0 + (i + (rnd() - .5) * .35) / n * 2 * PI, R = r * (.86 + rnd() * .24), q = a0 + (i + .5) / n * 2 * PI;
    tip.push([ox + Math.cos(a) * R, y - h * (.04 + rnd() * .12), oz + Math.sin(a) * R]);
    gap.push([ox + Math.cos(q) * r * .56, y + h * .2, oz + Math.sin(q) * r * .56]);
  }
  K.set(col);
  const tri = (a: number[], b: number[], c: number[], ka: number, kb: number, kc: number) => {
    const points = [a, b, c]; P.push(...a, ...b, ...c);
    [ka, kb, kc].forEach((k, i) => {
      const snowCap = points[i][1] > y + h * .55, tone = snowCap ? new T.Color(0xf0f5fa) : K;
      C.push(tone.r * k, tone.g * k, tone.b * k);
    });
  };
  for (let i = 0; i < n; i++) {
    const t = tip[i], g = gap[i], p = gap[(i + n - 1) % n];
    tri(top, t, p, 1.04, 1.14, .7); tri(top, g, t, 1.04, .7, 1.14);
    tri(core, p, t, .42, .5, .62); tri(core, t, g, .42, .62, .5);
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(P, 3));
  geo.setAttribute("color", new T.Float32BufferAttribute(C, 3));
  geo.setAttribute("uv", new T.Float32BufferAttribute(new Array(P.length / 3 * 2).fill(0), 2));
  geo.computeVertexNormals();
  return geo;
}

const LEAF = [[0x718c27, 0x9da92e], [0x829632, 0xb3ad35], [0x6f8427, 0x9ea332]],
  BLOSSOM = [[0xf3f0dc, 0xfff9ec], [0xf5f2e3, 0xfffdf2], [0xe9edda, 0xfaf6e8]],
  GOLD = [[0xe8a92e, 0xf4c648], [0xdc8a26, 0xeeab38], [0xefb935, 0xf8d65a]],
  PINE = [[0x2f6332, 0x3b7438, 0x478540], [0x3a6e36, 0x467f3d, 0x549046], [0x2c5a35, 0x376b3c, 0x427a44]],
  PINE_LAYERS: [number, number, number, number][] = [[1.9, 1.7, 1.25, 0], [1.62, 1.6, 2, 0], [1.3, 1.5, 2.75, 1], [.95, 1.4, 3.5, 1], [.58, 1.5, 4.2, 2]];

const SHAPE: Record<Season, (v: number) => T.BufferGeometry> = {
  summer(v) {
    const b = new Batch(), ends: T.Vector3[] = [], [c0, c1] = LEAF[v];
    // Upright deciduous tree with a visible branching trunk and a rounded, golden-green crown.
    b.cyl(.055, .2, 4.15, 0x66503a, 0, 2.075, 0, 7); trunkBase(b, .2, 0x574331);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * 2 * PI + .2, y = 1.8 + (i % 3) * .48;
      branch(b, new T.Vector3(0, y, 0), new T.Vector3(Math.cos(a) * .78, .62, Math.sin(a) * .78).normalize(), 1.28 - (i % 2) * .12, .095, 1, 0x66503a, ends);
    }
    // Layered leaf masses keep the crown full while leaving hints of the branch structure visible.
    for (let i = 0; i < 23; i++) {
      const t = i / 22, a = i * 2.4, y = 2.45 + t * 2.15 + (rnd() - .5) * .32,
        r = .46 + rnd() * .2, spread = .42 + Math.sin(t * PI) * .92;
      clump(b, r, Math.cos(a) * spread, y, Math.sin(a) * spread, i % 3 ? c0 : c1, .9, 1);
    }
    ends.forEach((e, i) => clump(b, .43 + rnd() * .13, e.x, e.y + .12, e.z, i % 2 ? c1 : c0, .9, 1));
    return b.geo();
  },
  spring(v) {
    const b = new Batch(), ends: T.Vector3[] = [], [c0, c1] = BLOSSOM[v];
    trunkBase(b, .24, 0x3f2c22);
    branch(b, new T.Vector3(0, 0, 0), new T.Vector3((rnd() - .5) * .2, 1, (rnd() - .5) * .2).normalize(), 1.9, .25, 3, 0x4a3428, ends);
    // Broad, airy sprays of white blossom with a little green foliage between the blooms.
    ends.forEach((e, i) => {
      clump(b, .52 + rnd() * .2, e.x, e.y + .12, e.z, i % 2 ? c1 : c0);
      clump(b, .36 + rnd() * .12, e.x + (rnd() - .5) * 1.05, e.y + (rnd() - .4) * .6, e.z + (rnd() - .5) * 1.05, i % 2 ? c0 : c1, .82, 0);
      if (i % 3 == 0) clump(b, .23, e.x + (rnd() - .5) * .8, e.y - .15, e.z + (rnd() - .5) * .8, 0x6f8239, .9, 0);
    });
    clump(b, .62, 0, 3.35, 0, c1);
    return b.geo();
  },
  autumn(v) {
    const b = new Batch(), ends: T.Vector3[] = [], [c0, c1] = GOLD[v];
    // the white bark with its black marks
    b.cyl(.075, .17, 4.3, 0xe9e4d6, 0, 2.15, 0, 7); trunkBase(b, .17, 0x8a8478);
    for (let i = 0; i < 9; i++) { const a = rnd() * 7, y = .35 + i * .42, r = .165 - y * .022; b.box(.09 + rnd() * .06, .03, .03, 0x2a2622, Math.cos(a) * r, y, Math.sin(a) * r, -a + PI / 2); }
    for (let i = 0; i < 4; i++) {
      const a = rnd() * 7, y = 2.2 + i * .55;
      branch(b, new T.Vector3(0, y, 0), new T.Vector3(Math.cos(a) * .8, .75, Math.sin(a) * .8).normalize(), .95 - i * .1, .05, 0, 0x4a4238, ends);
    }
    // a tall, narrow crown of small clumps
    for (let i = 0; i < 10; i++) {
      const t = i / 9, y = 2.4 + t * 3.1, R = (1 - t * .8) * .78, a = rnd() * 7;
      clump(b, .78 - t * .3 + rnd() * .1, Math.cos(a) * R, y, Math.sin(a) * R, i % 2 ? c1 : c0, 1);
    }
    return b.geo();
  },
  winter(v) {
    const b = new Batch();
    b.cyl(.04, .27, 4.7, 0x5e4026, 0, 2.35, 0, 7); trunkBase(b, .27, 0x4a3220);
    PINE_LAYERS.forEach(([r, h, y, s]) => {
      b.raw(bough(r, h, y, PINE[v][s]));
      // soft snow patches rest on the upper faces of each evergreen tier
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * 2 * PI + .35 * s, R = r * .48;
        b.ball(.13, 0xf2f6fb, Math.cos(a) * R, y + h * .3, Math.sin(a) * R, 1.35, .32, .85);
      }
      // red and gold baubles blend Christmas lights with Lunar New Year lantern colours
      for (let i = 0; i < 3; i++) {
        const a = i / 3 * 2 * PI + s * .65, R = r * .72, x = Math.cos(a) * R, z = Math.sin(a) * R, oy = y + h * .12;
        const lantern = i == 0 && s > 0;
        b.ball(lantern ? .105 : .072, lantern ? 0xc9343a : (i % 2 ? 0xf2c35b : 0xd7463d), x, oy, z, .88, lantern ? 1.25 : 1, .88);
        if (lantern) {
          b.torus(.085, .012, 0xf2c35b, x, oy, z, 0);
          b.cyl(.012, .012, .1, 0xf2c35b, x, oy - .16, z, 5);
        }
      }
    });
    // snow gathered around the roots
    clump(b, .85, 0, .03, 0, 0xf2f6fa, .2);
    return b.geo();
  },
};

export interface TreeSpot { x: number; y: number; z: number; ry: number; rz: number; sx: number; sy: number; v: number }
const KINDS: Season[] = ["spring", "summer", "autumn", "winter"], SHAPES = 3, SWAP = 1500;

// all the trees: one kind grows in on its spots while the last one shrinks away, each tree a little after its neighbours
export function createForest(S: T.Scene, spots: TreeSpot[]) {
  const mat = new T.MeshLambertMaterial({ vertexColors: true }), m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), p = new T.Vector3(), s = new T.Vector3();
  const REDUCED = typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sets = {} as Record<Season, { m: T.InstancedMesh; ids: number[] }[]>, grow = {} as Record<Season, number>, built = {} as Record<Season, boolean>;
  KINDS.forEach(k => {
    grow[k] = 0;
    sets[k] = [];
    built[k] = false;
  });
  const ensure = (k: Season) => {
    if (built[k]) return;
    sets[k] = Array.from({ length: SHAPES }, (_, v) => {
      const ids = spots.flatMap((t, i) => t.v == v ? [i] : []), m = new T.InstancedMesh(SHAPE[k](v), mat, ids.length);
      m.castShadow = m.receiveShadow = true; m.frustumCulled = false; m.visible = false; S.add(m);
      return { m, ids };
    });
    built[k] = true;
  };
  const write = (k: Season) => {
    if (!built[k]) return;
    const g = grow[k];
    sets[k].forEach(({ m, ids }) => {
      m.visible = g > 0;
      if (!m.visible) return;
      ids.forEach((id, n) => {
        const t = spots[id], d = hash(id + 1.5) * .35, f = Math.max(1e-4, sm(d, d + .65, g));
        m.setMatrixAt(n, m4.compose(p.set(t.x, t.y, t.z), q.setFromEuler(e.set(0, t.ry, t.rz)), s.set(t.sx * f, t.sy * f, t.sx * f)));
      });
      m.instanceMatrix.needsUpdate = true;
    });
  };
  let last = 0;
  return {
    // show one kind straight away
    snap(k: Season) { ensure(k); KINDS.forEach(o => { grow[o] = o == k ? 1 : 0; write(o); }); },
    // t = clock in ms, so slow devices still finish on time
    tick(k: Season, t: number) {
      const step = REDUCED ? 1 : Math.min(1, (t - last) / SWAP);
      last = t;
      KINDS.forEach(o => {
        const to = o == k ? 1 : 0;
        if (grow[o] == to) return;
        if (to) ensure(o);
        grow[o] = to ? Math.min(1, grow[o] + step) : Math.max(0, grow[o] - step);
        write(o);
      });
    },
  };
}
