import { T, bx, ms } from "../util";

// хаалга: painted wooden door
export const buildDoor = () => {
  const g = new T.Group();
  bx(1.6, 2.4, .12, 0x5a3416, 0, 0, 0, g); bx(1.25, 2.05, .14, 0xc8552e, 0, 0, .02, g);
  [-.6, 0, .6].forEach(y => bx(1.25, .08, .17, 0xe8b84a, 0, y, .03, g));
  bx(.08, 2.05, .17, 0xe8b84a, 0, 0, .03, g);
  ms(new T.SphereGeometry(.09, 8, 6), 0xe8b84a, g, .45, -.1, .12);
  return g;
};
