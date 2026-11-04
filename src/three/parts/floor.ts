import { T } from "../util";
import { woodTex } from "../textures";
import { Batch, paintM, place } from "../craft";

const tone = () => { const v = .8 + Math.random() * .2; return new T.Color(v, v * .9, v * .74).getHex(); };

// planks (banz) cut to the circle and laid in crossing layers, all one mesh
export const plankFloor = (R: number, full: boolean) => {
  const g = new T.Group(), b = new Batch(), th = full ? .1 : .14, L = full ? 3 : 1, bw = .34;
  for (let l = 0; l < L; l++) {
    const rad = R * (1 - .035 * l), y = -th * (l + .5), ry = l % 2 ? Math.PI / 2 : 0, n = Math.ceil(2 * rad / bw);
    for (let i = 0; i < n; i++) {
      const c = -rad + (i + .5) * (2 * rad / n), h = Math.sqrt(Math.max(0, rad * rad - c * c)), len = 2 * h - .02;
      if (len < .3) continue;
      const turn = new T.Matrix4().makeRotationY(ry);
      b.add(new T.BoxGeometry(len, th - .004, 2 * rad / n - .022), tone(), turn.clone().multiply(place(0, y, c)));
      // nail heads at each end of the board
      if (l == 0) [-1, 1].forEach(s => b.add(new T.CylinderGeometry(.012, .012, .006, 6), 0x4a3a2a, turn.clone().multiply(place(s * (h - .1), y + th / 2, c))));
    }
  }
  if (full) ([[-.9, .04, R + .5, .12], [.15, .04, R + .55, -.08], [1.05, .04, R + .45, .22], [-.3, .12, R + .52, .05]] as const)
    .forEach(([x, y, z, ry]) => b.box(1.9, .08, .3, tone(), x, y - .01, z, ry));
  g.add(b.mesh(paintM(woodTex())));
  return g;
};

// шал
export const buildFloor = () => plankFloor(2.0, true);
