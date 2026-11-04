import { T, PI } from "../util";
import { Batch, hairRopeTex, paintM } from "../craft";

// a twisted hair rope round the lattice, tied off with a knot and a tasselled tail
const rope = (g: T.Object3D, R: number, y: number, tr: number, b: Batch) => {
  const geo = new T.TorusGeometry(R, tr, 8, 90).rotateX(PI / 2), uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * R * 28);
  const m = new T.Mesh(geo, new T.MeshLambertMaterial({ map: hairRopeTex() })); m.position.y = y; g.add(m);
  b.ball(tr * 2.1, 0x2a1f18, R + tr, y, 0, 1, 1.2, 1.2);
  b.add(new T.CylinderGeometry(tr * .9, tr * .9, .36, 6), 0x2a1f18, new T.Matrix4().makeRotationZ(-.28).setPosition(R + .1, y - .2, 0));
  b.add(new T.ConeGeometry(tr * 1.5, .16, 8), 0xcdbb9c, new T.Matrix4().makeRotationZ(-.28).setPosition(R + .16, y - .4, 0));
};

// бүслүүр: two twisted hair ropes, tied off, with a spare coil at their foot
export const buildBelt = () => {
  const g = new T.Group(), b = new Batch(), R = 1.4;
  [.42, 1.06].forEach(y => rope(g, R, y, .075, b));
  [0, 1, 2].forEach(i => {
    const r = .44 - (i % 2) * .05, geo = new T.TorusGeometry(r, .05, 8, 40).rotateX(PI / 2), uv = geo.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setX(k, uv.getX(k) * 11);
    const m = new T.Mesh(geo, new T.MeshLambertMaterial({ map: hairRopeTex() })); m.position.set(.8, .06 + i * .095, R + .55); g.add(m);
  });
  g.add(b.mesh(paintM()));
  return g;
};
