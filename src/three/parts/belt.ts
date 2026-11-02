import { T, bx, ms } from "../util";

// бүслүүр: two belts wrapped round a cloth drum
export const buildBelt = () => {
  const g = new T.Group(), R = 1.4;
  ms(new T.CylinderGeometry(R, R, 1.5, 48, 1, true), 0xf6f6f2, g, 0, 0, 0, 1);
  ms(new T.CylinderGeometry(R + .03, R + .03, .28, 48, 1, true), 0x7a7442, g, 0, -.62, 0, 1);
  ms(new T.CylinderGeometry(R + .16, R + .16, .12, 48), 0xb98b5a, g, 0, -.82, 0);
  [.4, -.2].forEach(y => {
    ms(new T.CylinderGeometry(R + .04, R + .04, .12, 48, 1, true), 0x6e3b25, g, 0, y, 0, 1);
    [.06, -.06].forEach(d => ms(new T.TorusGeometry(R + .04, .012, 5, 48).rotateX(Math.PI / 2), 0xb9824a, g, 0, y + d, 0));
    bx(.12, .2, .12, 0x3b2a20, R + .06, y, 0, g);
    ms(new T.ConeGeometry(.07, .4, 8).rotateZ(-Math.PI / 2), 0x6e3b25, g, R + .3, y, 0);
  });
  return g;
};
