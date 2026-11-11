import { T, PI, sm } from "./util";
import { Batch } from "./craft";
import type { Season } from "../data/seasons";

// every season has its own tree, standing on the same spots: a flowering broad-canopy tree in spring, Mongolian linden in summer,
// the golden birch in autumn and a bare, snow-laden tree in winter. Each kind is a few shapes drawn as instances

// its own seed, so that shaping the trees leaves the rest of the scenery where it is
let sd = 77;
const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
const hash = (a: number) => { const s = Math.sin(a) * 43758.5453; return s - Math.floor(s); };
const K = new T.Color();

// one layer of pine boughs: branches reach out and droop to their tips, lit on the tips, dark in the gaps and underneath
function bough(r: number, h: number, y: number, col: number) {
  const n = 9 + Math.floor(rnd() * 3), a0 = rnd() * 7, ox = (rnd() - .5) * .12, oz = (rnd() - .5) * .12;
  const P: number[] = [], C: number[] = [], tip: number[][] = [], gap: number[][] = [], top = [ox * .3, y + h, oz * .3], core = [ox, y + h * .08, oz];
  for (let i = 0; i < n; i++) {
    const a = a0 + (i + (rnd() - .5) * .35) / n * 2 * PI, R = r * (.86 + rnd() * .24), b = a0 + (i + .5) / n * 2 * PI;
    tip.push([ox + Math.cos(a) * R, y - h * (.04 + rnd() * .12), oz + Math.sin(a) * R]);
    gap.push([ox + Math.cos(b) * r * .56, y + h * .2, oz + Math.sin(b) * r * .56]);
  }
  K.set(col);
  const tri = (a: number[], b: number[], c: number[], ka: number, kb: number, kc: number) => {
    P.push(...a, ...b, ...c);
    [ka, kb, kc].forEach(k => C.push(K.r * k, K.g * k, K.b * k));
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

const LINDEN = [[0x527b36, 0x709746, 0x8cae58], [0x5b843a, 0x7da34c, 0x98b85d], [0x496f34, 0x6b9143, 0x87a950]];
const BLOOM = [[0xe9eee0, 0xfaf8ed, 0xfffdf4], [0xe7eddf, 0xf8f5e8, 0xffffff], [0xdfe8d8, 0xf4f4e8, 0xfdfbf2]];
const GOLD = [[0xe8a92e, 0xf4c648], [0xdc8a26, 0xeeab38], [0xefb935, 0xf8d65a]];

const SHAPE: Record<Season, (v: number) => T.BufferGeometry> = {
  summer(v) {
    const b = new Batch();
    // Mongolian linden: a stout grey-brown trunk and a broad, rounded crown of dense leaves.
    b.cyl(.07, .3, 3.25, 0x665342, 0, 1.62, 0, 8); trunkBase(b, .3, 0x514333);
    const ends: T.Vector3[] = [];
    for (let i = 0; i < 8; i++) {
      const a = i * 2 * PI / 8 + .18, y = 2.05 + (i % 3) * .22;
      const start = new T.Vector3(0, y, 0), end = new T.Vector3(Math.cos(a) * (1.35 + (i % 2) * .25), 3.45 + (i % 3) * .28, Math.sin(a) * (1.35 + (i % 2) * .25));
      branch(b, start, end.clone().sub(start).normalize(), end.distanceTo(start), .105, 1, 0x594838, ends);
    }
    // Overlapping leaf masses make a full, domed silhouette like the supplied summer tree.
    [[0, 4.18, 0, .95], [0, 3.82, 0, 1.12], [-.82, 3.62, .28, .88], [.82, 3.65, -.25, .9], [.28, 3.55, .78, .85], [-.28, 3.6, -.78, .86], [-1.28, 3.25, -.25, .7], [1.25, 3.3, .2, .72], [0, 3.28, 1.28, .68], [0, 3.25, -1.28, .68]].forEach(([x, y, z, r], i) => clump(b, r, x, y, z, LINDEN[v][i % 3], .9, 1));
    return b.geo();
  },
  spring(v) {
    const b = new Batch(), colors = BLOOM[v];
    // A mature, low-spreading flowering tree with visible limbs and a cloud of pale spring blossoms.
    b.cyl(.06, .34, 2.65, 0x70503a, 0, 1.32, 0, 8); trunkBase(b, .34, 0x59402f);
    const ends: T.Vector3[] = [];
    for (let i = 0; i < 9; i++) {
      const a = i * 2 * PI / 9 + .12, y = 1.65 + (i % 3) * .22;
      const start = new T.Vector3(0, y, 0), end = new T.Vector3(Math.cos(a) * (1.75 + (i % 2) * .3), 2.95 + (i % 3) * .22, Math.sin(a) * (1.75 + (i % 2) * .3));
      branch(b, start, end.clone().sub(start).normalize(), end.distanceTo(start), .12, 1, 0x694b38, ends);
    }
    // broad blossom clusters, with a few soft pink notes among the ivory flowers
    [[0, 3.5, 0, .82], [-.8, 3.22, .25, .82], [.78, 3.24, -.25, .86], [.24, 3.18, .8, .78], [-.28, 3.18, -.78, .8], [-1.45, 2.92, -.18, .72], [1.42, 2.94, .2, .76], [0, 2.95, 1.42, .68], [0, 2.92, -1.4, .7], [-.78, 3.72, -.38, .62], [.8, 3.72, .35, .64]].forEach(([x, y, z, r], i) => {
      clump(b, r, x, y, z, colors[i % 3], .82, 1);
      if (i % 2 === 0) clump(b, r * .36, x + .12, y + .1, z + .08, 0xf3c8d0, .9, 0);
    });
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
  winter() {
    const b = new Batch(), ends: T.Vector3[] = [];
    trunkBase(b, .27, 0x33261f);
    branch(b, new T.Vector3(0, 0, 0), new T.Vector3((rnd() - .5) * .16, 1, (rnd() - .5) * .16).normalize(), 1.9, .27, 4, 0x3e2f27, ends, true);
    // snow gathered at the foot, and on the twig ends
    clump(b, .85, 0, .03, 0, 0xf2f6fa, .2);
    ends.forEach((e, i) => { if (i % 2 == 0) b.ball(.1 + rnd() * .06, 0xf4f8fc, e.x, e.y + .03, e.z, 1, .7, 1); });
    return b.geo();
  },
};

export interface TreeSpot { x: number; y: number; z: number; ry: number; rz: number; sx: number; sy: number; v: number }
const KINDS: Season[] = ["spring", "summer", "autumn", "winter"], SHAPES = 3, SWAP = 1500;

// all the trees: one kind grows in on its spots while the last one shrinks away, each tree a little after its neighbours
export function createForest(S: T.Scene, spots: TreeSpot[]) {
  const mat = new T.MeshLambertMaterial({ vertexColors: true }), m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), p = new T.Vector3(), s = new T.Vector3();
  const REDUCED = typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sets = {} as Record<Season, { m: T.InstancedMesh; ids: number[] }[]>, grow = {} as Record<Season, number>;
  KINDS.forEach(k => {
    grow[k] = 0;
    sets[k] = Array.from({ length: SHAPES }, (_, v) => {
      const ids = spots.flatMap((t, i) => t.v == v ? [i] : []), m = new T.InstancedMesh(SHAPE[k](v), mat, ids.length);
      m.castShadow = m.receiveShadow = true; m.frustumCulled = false; m.visible = false; S.add(m);
      return { m, ids };
    });
  });
  const write = (k: Season) => {
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
    snap(k: Season) { KINDS.forEach(o => { grow[o] = o == k ? 1 : 0; write(o); }); },
    // t = clock in ms, so slow devices still finish on time
    tick(k: Season, t: number) {
      const step = REDUCED ? 1 : Math.min(1, (t - last) / SWAP);
      last = t;
      KINDS.forEach(o => {
        const to = o == k ? 1 : 0;
        if (grow[o] == to) return;
        grow[o] = to ? Math.min(1, grow[o] + step) : Math.max(0, grow[o] - step);
        write(o);
      });
    },
  };
}
