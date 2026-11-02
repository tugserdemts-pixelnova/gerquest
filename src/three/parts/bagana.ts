import { T, bx, ms } from "../util";

// багана: painted pillar with its curved capital
export const buildBagana = () => {
  const g = new T.Group(), OR = 0xe0601f, col = [0xe86a9a, 0x2f7bd6, 0x35a853, 0xf2c35b], n = 14;
  bx(.2, 4, .16, OR, 0, 0, 0, g);
  const cp: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const x = -.8 + 1.6 * i / n; cp.push([x, .15 * (x / .8) * (x / .8)]); }
  const sh = new T.Shape();
  cp.forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y));
  for (let i = n; i >= 0; i--) sh.lineTo(cp[i][0], cp[i][1] - .14);
  sh.closePath();
  ms(new T.ExtrudeGeometry(sh, { depth: .36, bevelEnabled: false }).translate(0, 2.0, -.18), OR, g);
  for (let i = 0; i < 12; i++) { const x = -.7 + i * .127; bx(.08, .07, .02, col[i % 4], x, 2.0 + .15 * (x / .8) * (x / .8) - .05, .19, g); }
  [-1, 1].forEach(s => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([s * (.06 + .58 * Math.pow(u, 1.4)), 1.0 + .95 * u]); }
    const a = new T.Shape();
    pts.forEach(([x, y], i) => i ? a.lineTo(x - .07, y) : a.moveTo(x - .07, y));
    for (let i = 10; i >= 0; i--) a.lineTo(pts[i][0] + .07, pts[i][1]);
    a.closePath();
    ms(new T.ExtrudeGeometry(a, { depth: .12, bevelEnabled: false }).translate(0, 0, -.06), OR, g);
    pts.forEach(([x, y], i) => { if (i % 2) ms(new T.SphereGeometry(.032, 6, 6), col[i % 4], g, x, y, .07); });
  });
  ([[0xffffff, .95], [0x2f7bd6, 1.06], [0xf2c35b, 1.17]] as const).forEach(([c, y]) => bx(.2, .09, .17, c, 0, y, 0, g));
  for (let k = 0; k < 8; k++) ms(new T.SphereGeometry(.036, 6, 6), col[k % 4], g, 0, 1.3 + k * .08, .09);
  return g;
};
