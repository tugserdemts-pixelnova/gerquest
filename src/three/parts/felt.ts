import { T, PI } from "../util";
import { Batch, paintM, quiltTex } from "../craft";

// a sheet of felt bent round the wall, sagging a little between its ties
const sheet = (r: number, h: number, arc: number) => {
  const geo = new T.PlaneGeometry(1, 1, 48, 10), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) + .5, v = p.getY(i) + .5, a = (u - .5) * arc, w = .022 * Math.sin(u * 19) * Math.sin(v * 7 + u * 5) + .05 * Math.pow(Math.abs(v - .5) * 2, 3);
    p.setXYZ(i, Math.sin(a) * (r + w), v * h, Math.cos(a) * (r + w));
  }
  geo.computeVertexNormals();
  return geo;
};

// туурга: a quilted wall felt with its ties, and a roll of the next one
export const buildFelt = () => {
  const g = new T.Group(), M = new T.MeshLambertMaterial({ map: quiltTex(), side: T.DoubleSide });
  g.add(new T.Mesh(sheet(1.9, 2.1, 2.6), M));
  const roll = new T.Mesh(new T.CylinderGeometry(.42, .42, 2.4, 24).rotateZ(PI / 2), new T.MeshLambertMaterial({ map: quiltTex() }));
  roll.position.set(.1, .42, 2.5); roll.rotation.y = .06; g.add(roll);
  const b = new Batch();
  [-.72, .86].forEach(x => { b.add(new T.TorusGeometry(.435, .026, 6, 28), 0x3b2a20, new T.Matrix4().makeRotationY(PI / 2 + .06).setPosition(x + .1, .42, 2.5)); });
  // ties along the top edge
  for (let i = 0; i < 5; i++) { const a = -1 + i * .5, x = Math.sin(a) * 1.92, z = Math.cos(a) * 1.92; b.box(.03, .2, .03, 0x3b2a20, x, 2.18, z, a); b.ball(.03, 0x3b2a20, x, 2.08, z); }
  g.add(b.mesh(paintM()));
  return g;
};
