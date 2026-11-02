import { T, bx, ms } from "../util";

// тооно: roof ring with the cross-shaped centre
export const buildToono = () => {
  const g = new T.Group(), sh = new T.Shape();
  sh.absarc(0, 0, 1.6, 0, Math.PI * 2, false);
  const h = new T.Path(); h.absarc(0, 0, 1.32, 0, Math.PI * 2, true); sh.holes.push(h);
  ms(new T.ExtrudeGeometry(sh, { depth: .3, bevelEnabled: false, curveSegments: 40 }).translate(0, 0, -.15).rotateX(Math.PI / 2), 0xd2552e, g);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, m = bx(1.1, .16, .2, 0xb9824a, 0, 0, 0, g);
    m.position.set(Math.cos(a) * .9, 0, -Math.sin(a) * .9); m.rotation.y = a;
  }
  ms(new T.CylinderGeometry(.4, .4, .36, 20), 0xb9824a, g);
  ms(new T.TorusGeometry(.4, .05, 6, 20).rotateX(Math.PI / 2), 0xe8b84a, g, 0, .18, 0);
  return g;
};
