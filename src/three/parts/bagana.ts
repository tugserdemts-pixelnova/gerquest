import { T, PI } from "../util";
import { Batch, baganaTex, paintM, place } from "../craft";

const OR = 0xd8571c, GOLD = 0xf2c35b, NAVY = 0x23419e, GREEN = 0x2f8f63, ROSE = 0xc9344a;

// багана: one painted pillar, about 4 tall, centred on y = 0, with its carved forked head
export const buildBagana = () => {
  const g = new T.Group();
  g.add(new T.Mesh(new T.CylinderGeometry(.15, .19, 3.05, 4, 1).rotateY(PI / 4).translate(0, -.32, 0), new T.MeshLambertMaterial({ map: baganaTex() })));
  const b = new Batch();
  // stepped foot
  b.box(.44, .1, .44, 0xa83a14, 0, -1.96, 0).box(.36, .08, .36, GOLD, 0, -1.87, 0);
  // collars where the shaft meets the head
  ([[.27, .06, GOLD, 1.22], [.3, .09, NAVY, 1.29], [.32, .07, GOLD, 1.37]] as const).forEach(([w, h, c, y]) => b.box(w, h, w, c, 0, y, 0));
  // the fork: two curved arms and the saddle that carries the toono
  const arm = new T.Shape(), pts: [number, number][] = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([.06 + .62 * Math.pow(u, 1.5), 1.38 + .56 * u]); }
  pts.forEach(([x, y], i) => { if (i) arm.lineTo(x + .09, y); else arm.moveTo(x + .09, y); });
  for (let i = 12; i >= 0; i--) arm.lineTo(pts[i][0] - .09 * (1 - i / 16), pts[i][1] - .02);
  arm.closePath();
  [1, -1].forEach(s => {
    b.add(new T.ExtrudeGeometry(arm, { depth: .16, bevelEnabled: false }).translate(0, 0, -.08), OR, place(0, 0, 0, 0, s < 0 ? PI : 0));
    pts.forEach(([x, y], i) => { if (i % 3 == 1) b.ball(.036, [ROSE, GOLD, GREEN, NAVY][(i - 1) / 3 % 4], s * x, y, .088); });
  });
  const seat = new T.Shape(), n = 16;
  for (let i = 0; i <= n; i++) { const x = -.84 + 1.68 * i / n, y = 1.94 + .13 * (x / .84) ** 2; if (i) seat.lineTo(x, y); else seat.moveTo(x, y); }
  for (let i = n; i >= 0; i--) { const x = -.84 + 1.68 * i / n; seat.lineTo(x, 1.84 + .13 * (x / .84) ** 2); }
  seat.closePath();
  b.add(new T.ExtrudeGeometry(seat, { depth: .3, bevelEnabled: false }), OR, place(0, 0, -.15));
  for (let i = 0; i < 11; i++) { const x = -.72 + i * .144; b.box(.09, .05, .012, [GOLD, NAVY, ROSE, GREEN][i % 4], x, 1.89 + .13 * (x / .84) ** 2, .155); }
  g.add(b.mesh(paintM()));
  return g;
};

// the pair, standing apart and turned 45 degrees
export const buildBaganaPair = () => {
  const g = new T.Group();
  [-1.05, 1.05].forEach(x => { const c = buildBagana(); c.position.x = x; c.rotation.y = PI / 4; g.add(c); });
  return g;
};
