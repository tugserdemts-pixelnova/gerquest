import { T, ms } from "../util";

// lattice wall; gap=[i0,i1] (in node units) leaves the doorway open and trims the bars to clean ends
export const wallLat = (g: T.Object3D, r: number, H: number, N: number, knobs: boolean, gap?: [number, number]) => {
  const P = Math.PI, pt = (i: number, y: number) => new T.Vector3(Math.cos(i / N * P * 2) * r, y, Math.sin(i / N * P * 2) * r);
  const seg = (A: T.Vector3, B2: T.Vector3) => {
    const L = A.distanceTo(B2), m = ms(new T.CylinderGeometry(.04, .04, L, 5).rotateX(P / 2), 0xc8884a, g, (A.x + B2.x) / 2, (A.y + B2.y) / 2, (A.z + B2.z) / 2);
    m.lookAt(B2);
  };
  const bar = (s: number, e: number) => {
    const A = pt(s, 0), B2 = pt(e, H);
    if (!gap) return seg(A, B2);
    const u0 = (gap[0] - s) / (e - s), u1 = (gap[1] - s) / (e - s);
    [[0, Math.min(1, u0, u1)], [Math.max(0, u0, u1), 1]].forEach(([a, b]) => { if (b - a > .1) seg(A.clone().lerp(B2, a), A.clone().lerp(B2, b)); });
  };
  for (let i = 0; i < N; i++) { bar(i, i + 2); bar(i + 2, i); }
  if (knobs) for (let i = 0; i < N; i += 2) { const q = pt(i, 0); ms(new T.SphereGeometry(.06, 6, 6), 0xe8b84a, g, q.x, 0, q.z); }
};

// хана
export const buildWall = () => { const g = new T.Group(); wallLat(g, 1.9, 1.3, 28, true); return g; };
