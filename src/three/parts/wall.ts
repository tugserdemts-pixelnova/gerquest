import { T } from "../util";
import { Batch, paintM } from "../craft";

const BODY = [0xcf6a2a, 0xc66226, 0xd4722f];

// lattice wall of flat slats riveted with leather where they cross, two layers leaning opposite ways.
// gap = [from, to] in radians leaves an opening and trims the slats to clean ends
export const wallLat = (g: T.Object3D, r: number, H: number, N: number, gap?: [number, number]) => {
  const b = new Batch(), K = 4, g0 = gap ? gap[0] / (2 * Math.PI) * N : 0, g1 = gap ? gap[1] / (2 * Math.PI) * N : 0;
  const ang = (i: number) => i / N * Math.PI * 2;
  const pt = (i: number, y: number, rr: number) => new T.Vector3(Math.cos(ang(i)) * rr, y, Math.sin(ang(i)) * rr);
  const slat = (s: number, e: number, u0: number, u1: number, off: number) => {
    const a = s + (e - s) * u0, c = s + (e - s) * u1, rr = r + off, mid = ang((a + c) / 2);
    b.beam(pt(a, H * u0, rr), pt(c, H * u1, rr), .036, .012, BODY[Math.abs(Math.round(s * 7)) % 3], new T.Vector3(Math.cos(mid), 0, Math.sin(mid)));
  };
  const bar = (s: number, e: number, off: number) => {
    if (!gap) { slat(s, e, 0, 1, off); return; }
    // the same slat seen one full turn later, so a gap past the seam still cuts it
    let cut: number[] = [];
    [0, N].forEach(o => {
      const a = (g0 + o - s) / (e - s), c = (g1 + o - s) / (e - s);
      if (Math.max(a, c) > 0 && Math.min(a, c) < 1) cut = [Math.min(a, c), Math.max(a, c)];
    });
    if (!cut.length) { slat(s, e, 0, 1, off); return; }
    if (cut[0] > .06) slat(s, e, 0, cut[0], off);
    if (cut[1] < .94) slat(s, e, cut[1], 1, off);
  };
  for (let i = 0; i < N; i++) { bar(i, i + K, -.008); bar(i + K, i, .008); }
  // leather rivets at each crossing; gold heads along the top, where the uni hook on
  const open = (i: number) => !!gap && ((i >= g0 && i <= g1) || (i + N >= g0 && i + N <= g1));
  for (let i = 0; i < N; i++) for (let j = 0; j <= K; j++) {
    if (open(i)) continue;
    const q = pt(i, H * j / K, r + .012), m = new T.Matrix4().makeTranslation(q.x, q.y, q.z);
    b.add(new T.OctahedronGeometry(j == K ? .02 : .014), j == K ? 0xf2c35b : 0x3f2616, m);
  }
  g.add(b.mesh(paintM()));
};

// хана: a run of lattice opened out in an arc, and the next panel still folded up beside it
export const buildWall = () => {
  const g = new T.Group(), b = new Batch();
  wallLat(g, 1.9, 1.3, 48, [.75, 2.35]);
  // folded, the two layers close up like scissors
  for (let i = 0; i < 18; i++) {
    const z = i * .03;
    b.beam(new T.Vector3(-.09, 0, z), new T.Vector3(.09, 1.3, z), .05, .02, BODY[i % 3], new T.Vector3(0, 0, 1));
    b.beam(new T.Vector3(.09, 0, z + .015), new T.Vector3(-.09, 1.3, z + .015), .05, .02, BODY[(i + 1) % 3], new T.Vector3(0, 0, 1));
  }
  [.3, 1].forEach(y => b.box(.3, .03, .62, 0x3b2a20, 0, y, .26));
  const m = b.mesh(paintM()); m.rotation.y = -.5; m.position.set(.5, 0, 1.25); g.add(m);
  return g;
};
