import { T, PI } from "../util";
import { Batch, paintM, uniTex } from "../craft";

// a tapered four-sided pole from A (thin) to B (thick); the texture runs along it, its bands at the thick end
const pole = (A: T.Vector3, B: T.Vector3, r0: number, r1: number, b: Batch) => {
  const L = A.distanceTo(B), m = new T.Matrix4();
  m.compose(A.clone().lerp(B, .5), new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), A.clone().sub(B).normalize()), new T.Vector3(1, 1, 1));
  b.add(new T.CylinderGeometry(r0, r1, L, 4, 1).rotateY(PI / 4), 0xffffff, m);
};

// the ring of poles inside the ger, as one mesh
export const uniRing = (n: number, g: T.Object3D, rIn: number, yIn: number, rOut: number, yOut: number) => {
  const b = new Batch();
  for (let i = 0; i < n; i++) {
    const a = i / n * PI * 2, c = Math.cos(a), s = Math.sin(a);
    pole(new T.Vector3(c * rIn, yIn, s * rIn), new T.Vector3(c * rOut, yOut, s * rOut), .016, .032, b);
  }
  g.add(b.mesh(paintM(uniTex())));
};

// унь: a fan of loose poles, each with the rope loop that hooks it to the wall
export const buildUni = () => {
  const g = new T.Group(), b = new Batch(), hub = new Batch(), N = 7, CY = 2.55;
  for (let i = 0; i < N; i++) {
    const a = (i - (N - 1) / 2) * .17, A = new T.Vector3(Math.sin(a) * .98, CY + Math.cos(a) * .98, 0), Bt = new T.Vector3(Math.sin(a) * 4.1, -.2 + Math.abs(a) * .6, 0);
    pole(A, Bt, .055, .13, b);
    hub.add(new T.TorusGeometry(.13, .026, 6, 14), 0x3b2a20, new T.Matrix4().makeTranslation(Bt.x, Bt.y - .16, 0));
  }
  g.add(b.mesh(paintM(uniTex())));
  g.add(hub.mesh(paintM()));
  return g;
};
