import { T, PI } from "../util";
import { Batch, paintM, place, toonoTex } from "../craft";

const RIM = 1.6, HUB = .46, RIB = 0xd8571c, GOLD = 0xf2c35b;

// тооно: the crown wheel. A rim with sockets for the uni, eight arched ribs rising to the hub, and the cross-bars (чагт) in its centre
export const buildToono = () => {
  const g = new T.Group();
  // the outer wall of the rim carries the painted band and the sockets
  g.add(new T.Mesh(new T.CylinderGeometry(RIM, RIM, .34, 64, 1, true), new T.MeshLambertMaterial({ map: toonoTex() })));
  const b = new Batch();
  const ring = new T.Shape(); ring.absarc(0, 0, RIM, 0, PI * 2, false);
  const hole = new T.Path(); hole.absarc(0, 0, RIM - .24, 0, PI * 2, true); ring.holes.push(hole);
  const flat = new T.ExtrudeGeometry(ring, { depth: .03, bevelEnabled: false, curveSegments: 40 }).rotateX(PI / 2);
  b.add(flat.clone(), RIB, place(0, .2, 0)).add(flat, 0xb9461a, place(0, -.17, 0));
  b.add(new T.CylinderGeometry(RIM - .24, RIM - .24, .34, 48, 1, true), 0xa83a14);
  b.torus(RIM + .012, .02, GOLD, 0, .17, 0).torus(RIM + .012, .02, GOLD, 0, -.17, 0).torus(RIM - .26, .022, GOLD, 0, .18, 0);
  // eight arched ribs, each a little bridge from the rim up to the hub
  const rib = new T.Shape(), R0 = RIM - .2, R1 = HUB, W = .1;
  const top = (t: number) => .16 + .3 * Math.sin(t * PI / 2);
  for (let i = 0; i <= 10; i++) { const t = i / 10, r = R0 + (R1 - R0) * t; if (i) rib.lineTo(r, top(t)); else rib.moveTo(r, top(t)); }
  for (let i = 10; i >= 0; i--) { const t = i / 10, r = R0 + (R1 - R0) * t; rib.lineTo(r, top(t) - .13); }
  rib.closePath();
  for (let i = 0; i < 8; i++) {
    const a = (i + .5) * PI / 4;
    b.add(new T.ExtrudeGeometry(rib, { depth: W, bevelEnabled: false }).translate(0, 0, -W / 2), RIB, place(0, 0, 0, 0, -a));
    b.ball(.045, GOLD, Math.cos(a) * .96, .42, Math.sin(a) * .96);
  }
  // the hub and the cross-bars of the chagt
  b.add(new T.TorusGeometry(HUB, .07, 8, 28), RIB, place(0, .4, 0, PI / 2));
  b.torus(HUB + .002, .026, GOLD, 0, .47, 0);
  [0, PI / 2].forEach(ry => [-.15, .15].forEach(o => {
    const dx = Math.cos(ry), dz = Math.sin(ry);
    b.box(HUB * 2 + .1, .07, .07, 0xa83a14, -dz * o, .41, dx * o, -ry);
  }));
  b.box(.34, .05, .34, GOLD, 0, .455, 0, PI / 4);
  g.add(b.mesh(paintM()));
  return g;
};
