import { T } from "../util";
import { woodTex } from "../textures";

// planks (banz) laid as circular floor: boards cut to the circle, stacked in layers + loose boards
export const plankFloor = (R: number, full: boolean) => {
  const g = new T.Group(), tx = woodTex(), th = full ? .1 : .14, L = full ? 3 : 1, bw = .34;
  const board = (len: number, t: number, w: number, x: number, y: number, z: number, ry: number, v: number) => {
    const m = new T.Mesh(new T.BoxGeometry(len, t, w), new T.MeshLambertMaterial({ map: tx, color: new T.Color(v, v * .99, v * .96) }));
    m.position.set(x, y, z); m.rotation.y = ry || 0; g.add(m); return m;
  };
  for (let l = 0; l < L; l++) {
    const lay = new T.Group(), rad = R * (1 - .035 * l), y = -th * (l + .5);
    lay.rotation.y = l % 2 ? Math.PI / 2 : 0; g.add(lay);
    const n = Math.ceil(2 * rad / bw);
    for (let i = 0; i < n; i++) {
      const c = -rad + (i + .5) * (2 * rad / n), h = Math.sqrt(Math.max(0, rad * rad - c * c)), len = 2 * h - .02;
      if (len < .3) continue;
      const m = new T.Mesh(new T.BoxGeometry(len, th - .004, 2 * rad / n - .025),
        new T.MeshLambertMaterial({ map: tx, color: new T.Color(.86 + Math.random() * .2, .85 + Math.random() * .2, .82 + Math.random() * .18) }));
      m.position.set(0, y, c); lay.add(m);
    }
  }
  if (full) [[-.9, .04, R + .5, .12, .98], [.15, .04, R + .55, -.08, 1.04], [1.05, .04, R + .45, .22, .92], [-.3, .12, R + .52, .05, 1.0]]
    .forEach(([x, y, z, ry, v]) => board(1.9, .08, .3, x, y - .01, z, ry, v));
  return g;
};

// шал
export const buildFloor = () => plankFloor(2.0, true);
