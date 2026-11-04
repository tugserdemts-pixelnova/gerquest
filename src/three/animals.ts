import { T, PI } from "./util";
import { px } from "./world";
import { Batch, paintM, place } from "./craft";

// herds of the "five snouts" (horse, camel, yak, sheep, goat), marmots by the path, golden eagles overhead, and the family dog.
// Bodies are smooth shapes swept along a spine. Every animal is three meshes (body, head, tail) and shares its geometry with others
// of the same coat. Every animal faces +x; head = pivot at the shoulder (rotation.z < 0 lowers it to graze), tail = pivot at the rump

type At = (o: T.Object3D, x: number, z: number, y?: number) => T.Object3D;
interface Beast { head: T.Object3D; tail?: T.Object3D; ph: number; sp: number; up: number; down: number }
interface Eagle { g: T.Group; wl: T.Object3D; wr: T.Object3D; cx: number; cz: number; r: number; y: number; a: number; sp: number }
interface Marmot { g: T.Group; ph: number }
// one ring of a swept shape: centre x, y, half height, half width, colour
type Ring = [number, number, number, number, number];
interface Built { body: T.BufferGeometry; head: T.BufferGeometry; tail?: T.BufferGeometry }

const fur = paintM();
const mix = (a: number, b: number, k: number) => new T.Color(a).lerp(new T.Color(b), k).getHex();

// extra rings between the listed ones, so long shapes curve instead of bending at each ring
const refine = (r: Ring[]) => {
  const out: Ring[] = [], at = (i: number) => r[Math.max(0, Math.min(r.length - 1, i))];
  for (let i = 0; i < r.length - 1; i++) {
    out.push(r[i]);
    const a = at(i - 1), q = at(i), e = at(i + 1), f = at(i + 2), mid = (k: number) => (-a[k] + 9 * q[k] + 9 * e[k] - f[k]) / 16;
    out.push([mid(0), mid(1), Math.max(.005, mid(2)), Math.max(.005, mid(3)), mix(q[4], e[4], .5)]);
  }
  out.push(r[r.length - 1]);
  return out;
};

// sweep rings along a path in the x-y plane, offset sideways by z. The underside can fade to `belly`
function sweep(b: Batch, list: Ring[], z = 0, seg = 9, belly?: number) {
  const rings = list.length >= 6 && seg >= 12 ? refine(list) : list, n = rings.length, P: number[] = [], C: number[] = [], I: number[] = [], c = new T.Color(), d = new T.Color();
  rings.forEach((r, i) => {
    const a = rings[Math.max(0, i - 1)], e = rings[Math.min(n - 1, i + 1)];
    let tx = e[0] - a[0], ty = e[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    // ring plane: (-ty, tx) in the path plane, and z sideways
    const nx = -ty, ny = tx;
    for (let k = 0; k < seg; k++) {
      const t = k / seg * PI * 2, s = Math.sin(t), q = Math.cos(t);
      P.push(r[0] + nx * q * r[2], r[1] + ny * q * r[2], z + s * r[3]);
      c.set(r[4]);
      if (belly !== undefined) { d.set(belly); c.lerp(d, Math.max(0, Math.min(1, (-(ny * q) - .1) * 1.7))); }
      C.push(c.r, c.g, c.b);
    }
  });
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < seg; k++) {
    const p = i * seg + k, q = i * seg + (k + 1) % seg, u = p + seg, v = q + seg;
    I.push(p, q, u, q, v, u);
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(P, 3));
  g.setAttribute("color", new T.Float32BufferAttribute(C, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(new Array(P.length / 3 * 2).fill(0), 2));
  g.setIndex(I); g.computeVertexNormals();
  b.raw(g.toNonIndexed());
}

// a leg, mirrored to both sides
const pair = (b: Batch, rings: Ring[], z: number) => [-z, z].forEach(s => sweep(b, rings, s, 5));
const eyes = (b: Batch, x: number, y: number, z: number, r = .026) => [-z, z].forEach(s => b.add(new T.IcosahedronGeometry(r, 1), 0x120c08, place(x, y, s)));
const ear = (b: Batch, x: number, y: number, z: number, len: number, w: number, c: number, tilt = .2) => [-z, z].forEach(s =>
  b.add(new T.ConeGeometry(w, len, 6).scale(1, 1, .55), c, place(x, y, s, s > 0 ? tilt : -tilt, 0, -.15)));
// a curved horn through three points
const horn = (b: Batch, pts: [number, number, number][], r: number, c: number) => {
  const curve = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(p[0], p[1], p[2])));
  b.add(new T.TubeGeometry(curve, 8, r, 5), c);
  b.add(new T.ConeGeometry(r, r * 3, 5), c, place(pts[2][0], pts[2][1], pts[2][2]));
};

// a curtain of hair hanging all the way round a body, from y0 down to a ragged hem near y1
function skirt(b: Batch, rx: number, rz: number, cx: number, y0: number, y1: number, top: number, hem: number) {
  const N = 32, R = 4, P: number[] = [], C: number[] = [], I: number[] = [], c = new T.Color();
  for (let j = 0; j < R; j++) for (let i = 0; i < N; i++) {
    const a = i / N * PI * 2, v = j / (R - 1), rag = .07 * Math.sin(a * 13) + .05 * Math.sin(a * 23 + 1) + .03 * Math.sin(a * 41), flare = 1 + .1 * v + rag * v * .7;
    P.push(cx + Math.cos(a) * rx * flare, y0 + (y1 - y0 + rag * 1.1 * v) * v, Math.sin(a) * rz * flare);
    c.set(mix(top, hem, v)); C.push(c.r, c.g, c.b);
  }
  for (let j = 0; j < R - 1; j++) for (let i = 0; i < N; i++) {
    const p = j * N + i, q = j * N + (i + 1) % N, u = p + N, v = q + N;
    I.push(p, u, q, q, u, v);
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(P, 3)); g.setAttribute("color", new T.Float32BufferAttribute(C, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(new Array(P.length / 3 * 2).fill(0), 2)); g.setIndex(I); g.computeVertexNormals();
  b.raw(g.toNonIndexed());
}

const cache = new Map<string, Built>();
const cached = (k: string, make: () => Built) => cache.get(k) || (cache.set(k, make()), cache.get(k)!);

function assemble(s: Built, hx: number, hy: number, tx: number, ty: number) {
  const g = new T.Group(); g.add(new T.Mesh(s.body, fur));
  const head = new T.Group(); head.position.set(hx, hy, 0); g.add(head); head.add(new T.Mesh(s.head, fur));
  let tail: T.Group | undefined;
  if (s.tail) { tail = new T.Group(); tail.position.set(tx, ty, 0); g.add(tail); tail.add(new T.Mesh(s.tail, fur)); }
  return { g, head, tail };
}

// адуу: a stocky Mongolian horse: short legs, heavy neck, big head, thick mane and tail. [coat, mane, belly, blaze?]
const HORSE: [number, number, number, boolean][] = [
  [0x8a4b2a, 0x2a1e16, 0xa8704c, false], [0x5e3420, 0x1f1712, 0x7c5238, true], [0x2b2420, 0x161210, 0x40362f, false],
  [0xd8d2c8, 0xa89f94, 0xeae5dc, false], [0xb88f58, 0x3a2a1c, 0xd2b482, true], [0x7d6a5c, 0x2a221c, 0x9a8878, false],
];
function horse(rnd: () => number) {
  const i = Math.floor(rnd() * HORSE.length), [c, m, bl, blaze] = HORSE[i], hoof = 0x2a2018;
  const s = cached("horse" + i, () => {
    const body = new Batch(), head = new Batch(), tail = new Batch();
    sweep(body, [[-1.02, 1.3, .03, .03, c], [-.98, 1.3, .2, .2, c], [-.82, 1.3, .35, .3, c], [-.58, 1.28, .41, .35, c], [-.24, 1.22, .42, .36, c],
      [.1, 1.2, .43, .37, c], [.42, 1.23, .44, .37, c], [.68, 1.28, .41, .32, c], [.86, 1.32, .27, .22, c], [.94, 1.34, .03, .03, c]], 0, 12, bl);
    // legs: forearm, knee, cannon, fetlock, hoof
    const socks = mix(c, 0xe8e2d6, blaze ? .75 : 0);
    pair(body, [[.66, 1.06, .17, .13, c], [.68, .78, .1, .09, c], [.7, .62, .082, .078, c], [.69, .52, .06, .06, c], [.7, .24, .052, .052, socks], [.72, .15, .068, .064, socks], [.74, .08, .075, .07, hoof], [.75, 0, .095, .085, hoof]], .21);
    pair(body, [[-.68, 1.1, .24, .15, c], [-.8, .78, .13, .1, c], [-.9, .6, .08, .07, c], [-.86, .5, .062, .06, c], [-.82, .24, .052, .052, socks], [-.8, .15, .068, .064, socks], [-.78, .08, .075, .07, hoof], [-.77, 0, .095, .085, hoof]], .22);
    // neck, poll to muzzle; the head pivot is at the base of the neck
    sweep(head, [[-.14, -.2, .32, .22, c], [.0, .06, .3, .19, c], [.14, .3, .25, .15, c], [.27, .52, .18, .115, c], [.36, .66, .13, .1, c]], 0, 10, bl);
    const face = blaze ? 0xe8e2d6 : c;
    sweep(head, [[.28, .7, .06, .06, c], [.38, .66, .15, .105, c], [.52, .54, .155, .1, c], [.66, .42, .115, .085, c], [.8, .3, .095, .075, c], [.88, .23, .085, .068, mix(c, 0x1a1412, .35)], [.92, .19, .02, .02, mix(c, 0x1a1412, .5)]], 0, 10);
    if (blaze) sweep(head, [[.42, .71, .012, .03, face], [.56, .6, .012, .04, face], [.72, .46, .012, .03, face], [.84, .33, .01, .02, face]], 0, 6);
    eyes(head, .5, .62, .1); ear(head, .32, .84, .06, .15, .035, c);
    [-.03, .03].forEach(z => head.ball(.012, 0x120c08, .9, .22, z));
    // mane along the crest and the forelock
    sweep(head, [[-.28, .04, .02, .02, m], [-.2, .16, .11, .045, m], [-.06, .4, .12, .05, m], [.08, .6, .1, .045, m], [.22, .76, .08, .04, m], [.3, .8, .07, .04, m], [.42, .68, .02, .02, m]], 0, 7);
    // tail: thick at the dock, flowing out to a point
    sweep(tail, [[.02, 0, .05, .05, m], [-.1, -.08, .1, .09, m], [-.18, -.34, .13, .11, m], [-.2, -.68, .13, .11, m], [-.18, -.98, .08, .07, m], [-.14, -1.14, .01, .01, m]], 0, 8);
    return { body: body.geo(), head: head.geo(), tail: tail.geo() };
  });
  return { ...assemble(s, .82, 1.46, -.98, 1.42), up: .08, down: -1.5 };
}

// тэмээ: the Bactrian camel, two soft humps, a long dipping neck and shaggy dark hair at the throat and humps. [coat, hair]
const CAMEL: [number, number][] = [[0xb08850, 0x7a5a34], [0xa07a46, 0x6a4c2c], [0xc29a62, 0x8a6a42]];
function camel(rnd: () => number) {
  const i = Math.floor(rnd() * CAMEL.length), [c, d] = CAMEL[i], foot = mix(c, 0x3a2a1c, .5);
  const s = cached("camel" + i, () => {
    const body = new Batch(), head = new Batch(), tail = new Batch();
    sweep(body, [[-1.08, 1.86, .03, .03, c], [-1.02, 1.86, .24, .22, c], [-.74, 1.84, .43, .4, c], [-.3, 1.8, .47, .43, c], [.1, 1.8, .47, .43, c], [.5, 1.86, .46, .41, c], [.82, 1.9, .34, .3, c], [.98, 1.92, .03, .03, c]], 0, 12, mix(c, 0xe0ccaa, .4));
    // humps rise out of the back, tipped with dark hair
    [-.46, .4].forEach(x => {
      sweep(body, [[x, 2.0, .46, .38, c], [x, 2.22, .42, .35, c], [x + .01, 2.4, .35, .3, c], [x + .02, 2.52, .25, .22, mix(c, d, .35)], [x + .03, 2.59, .13, .12, mix(c, d, .8)], [x + .03, 2.61, .01, .01, d]], 0, 11);
    });
    pair(body, [[.72, 1.6, .2, .14, c], [.74, 1.2, .1, .09, c], [.74, .86, .095, .09, foot], [.74, .76, .075, .07, c], [.74, .22, .058, .055, c], [.76, .1, .1, .1, foot], [.8, 0, .14, .13, foot]], .26);
    pair(body, [[-.74, 1.6, .24, .15, c], [-.86, 1.12, .11, .09, c], [-.94, .86, .085, .08, foot], [-.88, .7, .07, .065, c], [-.8, .22, .058, .055, c], [-.78, .1, .1, .1, foot], [-.74, 0, .14, .13, foot]], .27);
    // the neck dips down, then rises in an S to a small head
    sweep(head, [[-.2, .02, .34, .24, c], [.1, -.12, .26, .18, c], [.4, -.14, .19, .13, c], [.64, .02, .15, .11, c], [.76, .3, .125, .095, c], [.8, .6, .115, .09, c], [.84, .8, .1, .08, c]], 0, 10);
    // throat hair
    sweep(head, [[.12, -.36, .05, .06, d], [.3, -.44, .12, .11, d], [.5, -.3, .11, .1, d], [.62, -.1, .07, .08, d], [.68, .12, .02, .03, d]], 0, 7);
    sweep(head, [[.74, .86, .1, .085, c], [.88, .92, .11, .085, c], [1.02, .88, .085, .07, c], [1.14, .84, .075, .06, mix(c, 0x3a2a1c, .25)], [1.2, .82, .02, .02, mix(c, 0x3a2a1c, .4)]], 0, 9);
    eyes(head, .92, .97, .085); ear(head, .78, 1, .07, .09, .03, d, .4);
    sweep(head, [[.68, .9, .03, .04, d], [.76, 1.03, .05, .07, d], [.86, 1.05, .03, .04, d]], 0, 6);
    sweep(tail, [[0, 0, .05, .05, c], [-.07, -.25, .05, .05, c], [-.1, -.56, .05, .045, d], [-.1, -.8, .08, .07, d], [-.08, -.92, .01, .01, d]], 0, 7);
    return { body: body.geo(), head: head.geo(), tail: tail.geo() };
  });
  return { ...assemble(s, .92, 1.98, -1.02, 1.98), up: .1, down: -.85 };
}

// сарлаг: the yak, a great shoulder hump and a long skirt of hair nearly to the ground. [coat, skirt, white face?]
const YAK: [number, number, boolean][] = [[0x2b2522, 0x1c1816, false], [0x2b2522, 0x1c1816, true], [0x5a4434, 0x3c2c20, false], [0x2b2522, 0xd8d0c4, true]];
function yak(rnd: () => number) {
  const i = Math.floor(rnd() * YAK.length), [c, sk, white] = YAK[i], foot = 0x1a1614;
  const s = cached("yak" + i, () => {
    const body = new Batch(), head = new Batch(), tail = new Batch();
    sweep(body, [[-1.0, 1.12, .03, .03, c], [-.94, 1.12, .3, .3, c], [-.62, 1.14, .5, .48, c], [-.2, 1.14, .54, .52, c], [.22, 1.22, .62, .52, c], [.58, 1.3, .62, .47, c], [.84, 1.24, .42, .34, c], [.96, 1.2, .03, .03, c]], 0, 12);
    // the skirt of long hair, nearly to the ground
    skirt(body, .98, .54, -.03, 1.02, .34, c, sk);
    pair(body, [[.56, .9, .16, .13, c], [.56, .5, .09, .085, c], [.56, .2, .075, .07, c], [.56, .08, .085, .08, foot], [.56, 0, .1, .09, foot]], .27);
    pair(body, [[-.62, .9, .17, .13, c], [-.66, .52, .09, .085, c], [-.7, .36, .075, .07, c], [-.64, .2, .07, .065, c], [-.62, .08, .085, .08, foot], [-.62, 0, .1, .09, foot]], .28);
    const face = white ? 0xe8e2d6 : c;
    sweep(head, [[-.14, .34, .34, .3, c], [.06, .2, .3, .26, c], [.22, .08, .25, .22, c], [.34, .0, .2, .19, c]], 0, 10);
    sweep(head, [[.26, .05, .05, .06, c], [.34, .02, .19, .17, c], [.48, -.06, .17, .15, face], [.6, -.13, .12, .115, face], [.68, -.17, .1, .095, mix(face, 0x1a1412, .45)], [.72, -.19, .02, .02, 0x1a1412]], 0, 10);
    sweep(head, [[.24, .22, .04, .06, c], [.34, .24, .1, .14, c], [.44, .16, .08, .12, c], [.5, .06, .02, .03, c]], 0, 7);
    eyes(head, .5, .03, .13);
    ear(head, .32, .14, .19, .13, .04, c, 1.1);
    [-1, 1].forEach(z => horn(head, [[.33, .2, z * .13], [.3, .3, z * .34], [.42, .52, z * .36]], .032, 0xd9d0bc));
    sweep(tail, [[0, 0, .05, .05, c], [-.08, -.24, .07, .07, c], [-.12, -.52, .13, .12, sk], [-.11, -.82, .13, .12, sk], [-.08, -.98, .01, .01, sk]], 0, 8);
    return { body: body.geo(), head: head.geo(), tail: tail.geo() };
  });
  return { ...assemble(s, .78, 1.24, -.98, 1.34), up: .1, down: -.75 };
}

// хонь: the fat-tailed Mongolian sheep: a mound of curly wool, dark head and legs
function sheep(rnd: () => number) {
  const i = Math.floor(rnd() * 2), wool = i ? 0xeee8da : 0xf4f0e6, dk = 0x2e2a28;
  const s = cached("sheep" + i, () => {
    const body = new Batch(), head = new Batch(), tail = new Batch(), wv = (a: number, b: number) => (Math.sin(a * 91.7 + b * 37.3) + 1) / 2;
    sweep(body, [[-.56, .66, .03, .03, wool], [-.5, .66, .24, .24, wool], [-.26, .66, .35, .33, wool], [.1, .66, .36, .33, wool], [.36, .68, .32, .28, wool], [.5, .7, .03, .03, wool]], 0, 10);
    // curls over the back and flanks
    for (let k = 0; k < 9; k++) {
      const a = k / 9 * PI * 2.4, x = -.46 + (k * .618 % 1) * .9, q = (k * .382 % 1) * PI - PI / 2, r = .13 + wv(k, 2) * .05, sh = .9 + wv(k, 3) * .18;
      body.add(new T.IcosahedronGeometry(r, 1), mix(wool, 0xcfc6b0, wv(k, 5) * .28), place(x, .66 + Math.cos(q) * .3, Math.sin(q) * .3, a, a, 0, sh, 1, sh));
    }
    pair(body, [[.28, .42, .08, .07, dk], [.3, .22, .045, .042, dk], [.3, 0, .05, .045, 0x161412]], .15);
    pair(body, [[-.3, .42, .09, .08, dk], [-.34, .26, .05, .045, dk], [-.32, 0, .05, .045, 0x161412]], .16);
    sweep(head, [[-.1, -.04, .15, .15, wool], [.02, .02, .14, .13, wool], [.12, .06, .1, .1, dk], [.26, .03, .12, .1, dk], [.38, -.04, .085, .075, dk], [.45, -.08, .02, .02, dk]], 0, 9);
    head.ball(.08, wool, .1, .15, 0, 1, .7, 1.2);
    eyes(head, .26, .1, .085, .018);
    [-1, 1].forEach(z => head.add(new T.ConeGeometry(.04, .17, 6).scale(1, 1, .4), dk, place(.12, .05, z * .14, z * 1.7, 0, 0)));
    // the fat tail
    sweep(tail, [[.02, .02, .08, .1, wool], [-.06, -.1, .13, .14, wool], [-.08, -.24, .11, .12, wool], [-.06, -.34, .01, .01, wool]], 0, 8);
    return { body: body.geo(), head: head.geo(), tail: tail.geo() };
  });
  return { ...assemble(s, .5, .78, -.5, .74), up: .1, down: -.7 };
}

// ямаа: lean and alert, swept-back horns, a beard and a short tail held up. [coat, horn]
const GOAT: [number, number][] = [[0xece7dc, 0xc9bfa8], [0x7a5236, 0x3a2a1e], [0x2b2622, 0x5a4c3e], [0xb08a62, 0x3a2a1e]];
function goat(rnd: () => number) {
  const i = Math.floor(rnd() * GOAT.length), [c, h] = GOAT[i], foot = 0x2a2018;
  const s = cached("goat" + i, () => {
    const body = new Batch(), head = new Batch(), tail = new Batch();
    sweep(body, [[-.56, .82, .03, .03, c], [-.5, .82, .16, .15, c], [-.26, .78, .25, .2, c], [.06, .76, .26, .21, c], [.32, .8, .26, .19, c], [.48, .84, .17, .13, c], [.54, .86, .03, .03, c]], 0, 10, mix(c, 0xffffff, .2));
    pair(body, [[.36, .62, .08, .06, c], [.38, .34, .04, .036, c], [.38, .12, .032, .03, c], [.39, 0, .042, .038, foot]], .11);
    pair(body, [[-.34, .66, .11, .07, c], [-.42, .4, .05, .04, c], [-.44, .3, .036, .033, c], [-.38, .12, .032, .03, c], [-.37, 0, .042, .038, foot]], .12);
    sweep(head, [[-.1, -.1, .14, .12, c], [.0, .08, .12, .1, c], [.08, .24, .09, .08, c], [.14, .34, .08, .07, c]], 0, 8);
    sweep(head, [[.08, .38, .05, .05, c], [.18, .36, .09, .07, c], [.3, .29, .07, .056, c], [.4, .22, .05, .042, c], [.45, .19, .012, .012, mix(c, 0x1a1412, .4)]], 0, 8);
    eyes(head, .22, .4, .062, .016);
    [-1, 1].forEach(z => {
      horn(head, [[.14, .44, z * .04], [.04, .62, z * .08], [-.18, .66, z * .13]], .018, h);
      head.add(new T.ConeGeometry(.03, .14, 6).scale(1, 1, .4), c, place(.1, .36, z * .09, z * 1.5, 0, -.2));
    });
    sweep(head, [[.32, .24, .025, .02, mix(c, 0x2a2018, .4)], [.31, .14, .03, .022, mix(c, 0x2a2018, .4)], [.3, .04, .01, .01, mix(c, 0x2a2018, .4)]], 0, 6);
    sweep(tail, [[0, 0, .03, .04, c], [-.04, .1, .035, .04, c], [-.08, .19, .008, .01, c]], 0, 6);
    return { body: body.geo(), head: head.geo(), tail: tail.geo() };
  });
  return { ...assemble(s, .48, .92, -.54, .88), up: .1, down: -.95 };
}

// тарвага: the marmot sitting up on its haunches
function marmot() {
  const s = cached("marmot", () => {
    const b = new Batch(), c = 0x9a7448, bl = 0xc8aa80, dk = 0x4a3524;
    sweep(b, [[0, 0, .03, .03, c], [0, .08, .27, .24, c], [.01, .26, .3, .27, c], [.03, .48, .23, .21, c], [.05, .64, .17, .16, c], [.06, .72, .03, .03, c]], 0, 11, bl);
    sweep(b, [[-.18, .1, .05, .05, c], [-.34, .06, .06, .05, c], [-.46, .04, .05, .04, dk], [-.52, .04, .01, .01, dk]], 0, 6);
    b.orb(.135, c, .06, .78, 0, 1.08, .92, 1); b.ball(.075, bl, .17, .74, 0, 1, .75, 1); b.ball(.016, dk, .23, .76, 0);
    eyes(b, .14, .83, .085, .018);
    [-1, 1].forEach(z => {
      b.ball(.03, dk, .04, .88, z * .1);
      sweep(b, [[.14, .5, .05, .045, c], [.22, .42, .04, .035, c], [.25, .34, .03, .03, dk]], z * .1, 6);
      sweep(b, [[.08, .06, .07, .06, c], [.22, .03, .05, .05, c], [.3, .02, .03, .04, dk]], z * .15, 6);
    });
    return { body: b.geo(), head: new T.BufferGeometry() };
  });
  const g = new T.Group(); g.add(new T.Mesh(s.body, fur));
  return g;
}

// бүргэд: the golden eagle, fingered wing tips, a fanned tail, a golden nape
function eagle() {
  const s = cached("eagle", () => {
    const body = new Batch(), dk = 0x3a2618, br = 0x5a3c26, gold = 0xc89a4a, wing = new Batch();
    sweep(body, [[-.56, .0, .02, .02, br], [-.4, .02, .09, .1, br], [-.05, .04, .15, .17, br], [.28, .06, .13, .14, br], [.46, .09, .1, .1, gold], [.62, .1, .09, .085, gold], [.72, .08, .05, .05, gold], [.76, .06, .01, .01, gold]], 0, 9, dk);
    body.add(new T.ConeGeometry(.04, .13, 6), 0xe8b23a, place(.8, .04, 0, 0, 0, -1.9));
    eyes(body, .64, .13, .065, .014);
    // tail fan
    for (let k = -3; k <= 3; k++) body.add(new T.BoxGeometry(.5, .012, .09), k % 2 ? dk : br, place(-.74, .0, k * .055, 0, k * .1, 0));
    // one wing, drawn for +z; the other is its mirror
    for (let k = 0; k < 5; k++) { const z = .18 + k * .26, w = .62 - k * .03; wing.add(new T.BoxGeometry(w, .03, .3), k % 2 ? br : dk, place(-.04 - k * .012, 0, z)); }
    for (let k = 0; k < 7; k++) wing.add(new T.BoxGeometry(.11, .018, .54 - Math.abs(k - 3) * .05), k % 2 ? 0x241810 : dk, place(.2 - k * .075, -.01, 1.5, 0, (3 - k) * .1, 0));
    return { body: body.geo(), head: wing.geo() };
  });
  const g = new T.Group(); g.add(new T.Mesh(s.body, fur));
  const wingAt = (sd: number) => {
    const p = new T.Group(); p.position.set(.05, .05, sd * .08); g.add(p);
    const m = new T.Mesh(s.head, fur); m.scale.z = sd; p.add(m);
    return p;
  };
  return { g, wl: wingAt(1), wr: wingAt(-1) };
}

// банхар: the family herd dog, deep-coated, black with tan points and a curled tail
export function dog() {
  const s = cached("dog", () => {
    const body = new Batch(), head = new Batch(), tail = new Batch(), c = 0x1f1a18, tan = 0x8a5a30;
    sweep(body, [[-.42, .4, .03, .03, c], [-.38, .4, .17, .16, c], [-.16, .4, .22, .2, c], [.1, .42, .24, .21, c], [.3, .46, .24, .2, c], [.42, .5, .03, .03, c]], 0, 10, mix(c, tan, .4));
    pair(body, [[.26, .3, .08, .07, c], [.27, .14, .05, .05, tan], [.28, 0, .055, .06, tan]], .11);
    pair(body, [[-.26, .32, .1, .07, c], [-.34, .18, .052, .05, tan], [-.3, 0, .055, .06, tan]], .12);
    sweep(head, [[-.14, -.1, .2, .2, c], [.0, .0, .19, .17, c], [.08, .04, .15, .14, c], [.2, .04, .13, .12, c], [.3, .0, .085, .085, tan], [.38, -.03, .065, .065, tan], [.42, -.04, .012, .012, 0x120c08]], 0, 9);
    head.ball(.024, 0x120c08, .42, -.03, 0); eyes(head, .22, .09, .078, .017);
    [-1, 1].forEach(z => { head.ball(.022, tan, .22, .13, z * .05); head.add(new T.ConeGeometry(.05, .13, 6).scale(1, 1, .5), c, place(.08, .13, z * .1, z * 1.2, 0, .2)); });
    sweep(tail, [[0, 0, .05, .05, c], [-.09, .1, .08, .08, c], [-.08, .24, .08, .07, c], [.03, .3, .06, .055, tan], [.1, .24, .01, .01, tan]], 0, 8);
    return { body: body.geo(), head: head.geo(), tail: tail.geo() };
  });
  const a = assemble(s, .34, .56, -.38, .5);
  return { g: a.g, head: a.head, tail: a.tail! };
}

export const SPECIES = { horse, camel, yak, sheep, goat, marmot, eagle };

export function addAnimals(S: T.Scene, at: At, rnd: () => number, side: () => number) {
  const beasts: Beast[] = [], eagles: Eagle[] = [], marmots: Marmot[] = [];
  const put = (b: { g: T.Group; head: T.Object3D; tail?: T.Object3D; up: number; down: number }, x: number, z: number, s: number) => {
    b.g.scale.setScalar(s); b.g.rotation.y = rnd() * PI * 2;
    if (at(b.g, x, z).parent) beasts.push({ head: b.head, tail: b.tail, ph: rnd() * 100, sp: .6 + rnd() * .5, up: b.up, down: b.down });
  };
  const herd = (n: number, z: number, lat: number, spread: number, make: () => Parameters<typeof put>[0], s: number) => {
    const cx = px(z) + side() * lat;
    for (let k = 0; k < n; k++) put(make(), cx + (rnd() - .5) * spread, z + (rnd() - .5) * spread, s * (.9 + rnd() * .2));
  };
  // sheep flocks with a few goats mixed in, as herders keep them
  for (let f = 0; f < 6; f++) {
    const z = -10 - f * 45 - rnd() * 20, cx = px(z) + side() * (11 + rnd() * 6);
    for (let k = 0; k < 7; k++) put(sheep(rnd), cx + (rnd() - .5) * 7, z + (rnd() - .5) * 7, .95 + rnd() * .15);
    for (let k = 0; k < 3; k++) put(goat(rnd), cx + (rnd() - .5) * 8, z + (rnd() - .5) * 8, .95);
  }
  for (let f = 0; f < 5; f++) herd(5 + Math.floor(rnd() * 3), 20 - f * 62 - rnd() * 20, 16 + rnd() * 14, 11, () => horse(rnd), .95);
  for (let f = 0; f < 3; f++) herd(3 + Math.floor(rnd() * 2), -90 - f * 75 - rnd() * 20, 20 + rnd() * 10, 10, () => camel(rnd), 1);
  for (let f = 0; f < 3; f++) herd(4 + Math.floor(rnd() * 2), -40 - f * 90 - rnd() * 20, 26 + rnd() * 14, 9, () => yak(rnd), 1);
  for (let k = 0; k < 12; k++) {
    const z = 10 - rnd() * 300, g = marmot(); g.scale.setScalar(.9 + rnd() * .3); g.rotation.y = rnd() * 6;
    if (at(g, px(z) + side() * (6 + rnd() * 9), z).parent) marmots.push({ g, ph: rnd() * 100 });
  }
  for (let k = 0; k < 4; k++) {
    const e = eagle(), z = -20 - k * 75 - rnd() * 30; e.g.scale.setScalar(1.7); S.add(e.g);
    eagles.push({ ...e, cx: px(z) + (rnd() - .5) * 30, cz: z, r: 18 + rnd() * 16, y: 24 + rnd() * 12, a: rnd() * 6, sp: (.16 + rnd() * .08) * (rnd() < .5 ? -1 : 1) });
  }

  // slow grazing cycles, tail flicks, marmots turning to look around, eagles circling on thermals
  return function tick(t: number, dt: number) {
    for (const b of beasts) {
      const c = Math.sin(t * .00035 * b.sp + b.ph), k = Math.min(1, Math.max(0, c * 1.6 + .3));
      b.head.rotation.z = b.up + (b.down - b.up) * k * k * (3 - 2 * k) + Math.sin(t * .004 + b.ph) * .03 * k;
      if (b.tail) b.tail.rotation.x = Math.sin(t * .003 * b.sp + b.ph) * .28;
    }
    for (const m of marmots) m.g.rotation.y += Math.sin(t * .0007 + m.ph) > .985 ? dt * 3 : 0;
    for (const e of eagles) {
      e.a += e.sp * dt;
      const s = Math.sign(e.sp), flap = Math.max(0, Math.sin(t * .0011 + e.cx)) > .9 ? Math.sin(t * .012) * .45 : .06;
      e.g.position.set(e.cx + Math.cos(e.a) * e.r, e.y + Math.sin(e.a * 2) * 1.5, e.cz + Math.sin(e.a) * e.r);
      e.g.rotation.set(s * .35, -e.a - s * PI / 2, 0, "YXZ");
      e.wl.rotation.x = -flap; e.wr.rotation.x = flap;
    }
  };
}
