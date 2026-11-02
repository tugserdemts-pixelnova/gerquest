import * as T from "three";

export { T };
export const PI = Math.PI;
type Col = T.Color | string | number;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const sm = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const M = (c: Col, d?: unknown) =>
  new T.MeshLambertMaterial({ color: c, flatShading: true, side: d ? T.DoubleSide : T.FrontSide } as T.MeshLambertMaterialParameters);
export const bx = (w: number, h: number, d: number, c: Col, x: number, y: number, z: number, g: T.Object3D) => {
  const m = new T.Mesh(new T.BoxGeometry(w, h, d), M(c));
  m.position.set(x, y, z);
  g.add(m);
  return m;
};
export const ms = (geo: T.BufferGeometry, c: Col, g: T.Object3D, x?: number, y?: number, z?: number, d?: unknown) => {
  const m = new T.Mesh(geo, M(c, d));
  m.position.set(x || 0, y || 0, z || 0);
  g.add(m);
  return m;
};

// canvas helper: f draws into a w×h 2D canvas
export const cvs2 = (w: number, h: number, f: (x: CanvasRenderingContext2D, w: number, h: number) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  f(c.getContext("2d")!, w, h);
  return c;
};
export const aniso = <X extends T.Texture>(t: X) => {
  t.anisotropy = 4;
  return t;
};
// TX: textures generated once and shared
const TX: Record<string, unknown> = {};
export const tx = <X>(k: string, f: () => X): X => (TX[k] as X) || (TX[k] = f()) as X;
