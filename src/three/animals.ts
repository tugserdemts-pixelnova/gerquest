import { T, M, PI } from "./util";
import { px } from "./world";

// low-poly herds of the "five snouts" (horse, camel, yak, sheep, goat), marmots by the path and golden eagles overhead
// every animal faces +x; head = pivot at the shoulder (rotation.z < 0 lowers it to graze), tail = pivot at the rump

type At = (o: T.Object3D, x: number, z: number, y?: number) => T.Object3D;
interface Beast { head: T.Object3D; tail?: T.Object3D; ph: number; sp: number; up: number; down: number }
interface Eagle { g: T.Group; wl: T.Object3D; wr: T.Object3D; cx: number; cz: number; r: number; y: number; a: number; sp: number }
interface Marmot { g: T.Group; ph: number }

const geo = {
  box: new T.BoxGeometry(1, 1, 1),
  leg: new T.CylinderGeometry(.5, .4, 1, 5).translate(0, -.5, 0),
  ball: new T.IcosahedronGeometry(.5, 1),
  horn: new T.ConeGeometry(.5, 1, 5).translate(0, .5, 0),
};
const mats = new Map<number, T.MeshLambertMaterial>();
const mat = (c: number) => mats.get(c) || (mats.set(c, M(c)), mats.get(c)!);
const box = (p: T.Object3D, c: number, w: number, h: number, d: number, x: number, y: number, z: number, rz = 0) => {
  const m = new T.Mesh(geo.box, mat(c)); m.scale.set(w, h, d); m.position.set(x, y, z); m.rotation.z = rz; p.add(m); return m;
};
const ball = (p: T.Object3D, c: number, sx: number, sy: number, sz: number, x: number, y: number, z: number) => {
  const m = new T.Mesh(geo.ball, mat(c)); m.scale.set(sx, sy, sz); m.position.set(x, y, z); p.add(m); return m;
};
const legs = (g: T.Object3D, c: number, r: number, h: number, fx: number, bx: number, w: number, hoof?: number) => {
  [[fx, w], [fx, -w], [bx, w], [bx, -w]].forEach(([x, z]) => {
    const l = new T.Mesh(geo.leg, mat(c)); l.scale.set(r, h, r); l.position.set(x, h, z); g.add(l);
    if (hoof) box(g, hoof, r * 1.6, h * .1, r * 1.6, x, h * .05, z);
  });
};
const pivot = (g: T.Object3D, x: number, y: number) => { const p = new T.Group(); p.position.set(x, y, 0); g.add(p); return p; };

function horse(rnd: () => number) {
  const coats = [[0x8a4b2a, 0x2a1e16], [0x5e3420, 0x1f1712], [0x2b2420, 0x161210], [0xd8d2c8, 0xb8b0a4], [0xb08a55, 0x3a2a1c], [0x7d6a5c, 0x2a221c]];
  const [c, m] = coats[Math.floor(rnd() * coats.length)], g = new T.Group();
  box(g, c, 1.9, .78, .68, 0, 1.3, 0);
  ball(g, c, .8, .78, .7, .7, 1.33, 0); ball(g, c, .78, .76, .7, -.72, 1.3, 0);
  legs(g, c, .17, 1.0, .72, -.72, .22, 0x2a2018);
  const head = pivot(g, .95, 1.5);
  box(head, c, .42, 1.0, .36, .3, .3, 0, -.6);
  box(head, m, .16, .95, .12, .17, .38, 0, -.6);
  box(head, c, .7, .3, .28, .72, .62, 0, -.25);
  box(head, m, .1, .16, .06, .58, .86, .08); box(head, m, .1, .16, .06, .58, .86, -.08);
  const tail = pivot(g, -1.0, 1.55); box(tail, m, .16, .95, .16, -.08, -.45, 0, -.2);
  return { g, head, tail, up: .05, down: -1.05 };
}

function camel(rnd: () => number) {
  const c = [0xb08850, 0xa07a46, 0xc29a62][Math.floor(rnd() * 3)], d = 0x8a6a3e, g = new T.Group();
  box(g, c, 1.9, .9, .8, 0, 1.85, 0);
  ball(g, d, .62, .72, .55, .42, 2.45, 0); ball(g, d, .6, .7, .55, -.42, 2.45, 0);
  ball(g, d, .55, .55, .55, .02, 2.2, 0);
  legs(g, c, .19, 1.45, .7, -.7, .26, 0x5a4a36);
  const head = pivot(g, .95, 1.95);
  box(head, c, .4, .95, .34, .35, -.05, 0, -1.0);
  box(head, d, .3, .6, .4, .3, -.15, 0, -1.0);
  box(head, c, .32, .8, .3, .8, .45, 0, -.15);
  box(head, c, .6, .3, .3, 1.05, .85, 0, -.1);
  box(head, d, .08, .14, .06, .86, 1.03, .09); box(head, d, .08, .14, .06, .86, 1.03, -.09);
  const tail = pivot(g, -.98, 1.95); box(tail, d, .1, .65, .1, -.05, -.32, 0, -.15);
  return { g, head, tail, up: .1, down: -.7 };
}

function yak(rnd: () => number) {
  const c = rnd() < .75 ? 0x2b2522 : 0x5a4434, g = new T.Group();
  box(g, c, 1.8, .95, .95, 0, 1.15, 0);
  ball(g, c, .9, .8, .9, .55, 1.5, 0);
  box(g, c, 1.9, .4, 1.05, 0, .72, 0);
  legs(g, c, .2, .6, .62, -.62, .3, 0x1a1614);
  const head = pivot(g, .95, 1.15);
  box(head, c, .55, .48, .48, .2, -.1, 0);
  if (rnd() < .4) box(head, 0xe8e2d6, .3, .3, .5, .42, -.08, 0);
  [-1, 1].forEach(s => { const h = new T.Mesh(geo.horn, mat(0xe6dfcf)); h.scale.set(.09, .38, .09); h.position.set(.15, .12, s * .24); h.rotation.set(s * -.9, 0, -.3); head.add(h); });
  const tail = pivot(g, -.92, 1.4); box(tail, c, .12, .7, .12, -.05, -.35, 0, -.15); ball(tail, c, .2, .35, .2, -.1, -.75, 0);
  return { g, head, tail, up: .1, down: -.55 };
}

function sheep() {
  const g = new T.Group(), w = 0xf4f1ea, d = 0x2e2a28;
  ball(g, w, 1.3, .9, .9, 0, .62, 0);
  legs(g, d, .09, .34, .34, -.34, .18);
  const head = pivot(g, .55, .7); ball(head, d, .42, .4, .36, .18, -.02, 0);
  return { g, head, up: .1, down: -.5 };
}

function goat(rnd: () => number) {
  const [c, h] = [[0xece7dc, 0xc9bfa8], [0x7a5236, 0x3a2a1e], [0x2b2622, 0x5a4c3e], [0xb08a62, 0x3a2a1e]][Math.floor(rnd() * 4)], g = new T.Group();
  box(g, c, .95, .45, .38, 0, .72, 0);
  legs(g, c, .09, .5, .36, -.36, .13, 0x2a2018);
  const head = pivot(g, .45, .85);
  box(head, c, .2, .4, .18, .08, .1, 0, -.4);
  box(head, c, .36, .22, .2, .26, .3, 0);
  [-1, 1].forEach(s => { const m = new T.Mesh(geo.horn, mat(h)); m.scale.set(.05, .3, .05); m.position.set(.2, .4, s * .06); m.rotation.set(s * -.2, 0, .8); head.add(m); });
  box(head, h, .06, .14, .06, .36, .13, 0);
  const tail = pivot(g, -.48, .9); box(tail, c, .08, .2, .08, -.02, .08, 0, .5);
  return { g, head, tail, up: .1, down: -.75 };
}

function marmot() {
  const g = new T.Group(), c = 0x9a7448;
  ball(g, c, .42, .62, .4, 0, .34, 0);
  ball(g, 0xc8aa80, .3, .4, .3, .08, .3, 0);
  ball(g, c, .3, .28, .28, .02, .74, 0);
  ball(g, 0x2a2018, .06, .06, .06, .16, .78, 0);
  return g;
}

function eagle() {
  const g = new T.Group(), b = 0x4a3020, gold = 0xc89a4a;
  box(g, b, 1.0, .22, .26, 0, 0, 0);
  ball(g, gold, .26, .24, .24, .58, .04, 0);
  box(g, 0xe8b23a, .14, .07, .07, .74, .01, 0);
  box(g, b, .38, .05, .36, -.6, 0, 0);
  const wing = (s: number) => {
    const p = new T.Group(); p.position.set(.05, .04, s * .12); g.add(p);
    const m = box(p, b, .5, .04, 1.5, -.05, 0, s * .75); box(p, 0x2a1a10, .35, .04, .4, -.15, 0, s * 1.62);
    m.rotation.y = s * .12; return p;
  };
  return { g, wl: wing(1), wr: wing(-1) };
}

export function addAnimals(S: T.Scene, at: At, rnd: () => number, side: () => number) {
  const beasts: Beast[] = [], eagles: Eagle[] = [], marmots: Marmot[] = [];
  const place = (b: { g: T.Group; head: T.Object3D; tail?: T.Object3D; up: number; down: number }, x: number, z: number, s: number) => {
    b.g.scale.setScalar(s); b.g.rotation.y = rnd() * PI * 2;
    if (at(b.g, x, z).parent) beasts.push({ head: b.head, tail: b.tail, ph: rnd() * 100, sp: .6 + rnd() * .5, up: b.up, down: b.down });
  };
  const herd = (n: number, z: number, lat: number, spread: number, make: () => Parameters<typeof place>[0], s: number) => {
    const cx = px(z) + side() * lat;
    for (let k = 0; k < n; k++) place(make(), cx + (rnd() - .5) * spread, z + (rnd() - .5) * spread, s * (.9 + rnd() * .2));
  };
  // sheep flocks with a few goats mixed in, as herders keep them
  for (let f = 0; f < 6; f++) {
    const z = -10 - f * 45 - rnd() * 20, cx = px(z) + side() * (11 + rnd() * 6);
    for (let k = 0; k < 7; k++) place(sheep(), cx + (rnd() - .5) * 7, z + (rnd() - .5) * 7, .95 + rnd() * .15);
    for (let k = 0; k < 3; k++) place(goat(rnd), cx + (rnd() - .5) * 8, z + (rnd() - .5) * 8, .95);
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
      if (b.tail) b.tail.rotation.x = Math.sin(t * .003 * b.sp + b.ph) * .35;
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
