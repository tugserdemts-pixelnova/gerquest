import { T, bx, ms } from "../util";

// унь: five painted roof poles
export const buildUni = () => {
  const g = new T.Group(), C = [0x2f7bd6, 0x35a853, 0xe86a9a];
  for (let i = 0; i < 5; i++) {
    const p = new T.Group(), r = (y: number) => .24 - .16 * y / 4;
    const m = ms(new T.CylinderGeometry(.08, .24, 4, 4).rotateY(Math.PI / 4), 0xe8661a, p, 0, 2, 0); m.scale.z = .3;
    ([[.3, 0xffffff], [.42, 0x35a853], [.54, 0xd2332e]] as const).forEach(([y, c]) => bx(1.414 * r(y) + .02, .09, 1.414 * r(y) * .3 + .02, c, 0, y, 0, p));
    for (let k = 0; k < 9; k++) { const y = 1 + k * .32; ms(new T.TorusGeometry(.05, .016, 5, 10), C[k % 3], p, Math.sin(k * 1.6) * .04, y, 1.414 * r(y) * .3 / 2 + .01); }
    p.position.x = (i - 2) * .62; p.rotation.z = (i - 2) * -.04; g.add(p);
  }
  return g;
};
