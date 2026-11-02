import { T, ms } from "../util";

// туурга: a curved felt panel
export const buildFelt = () => {
  const g = new T.Group();
  ms(new T.CylinderGeometry(1.8, 1.8, 2, 32, 1, true, 0, 2.6), 0xb0a488, g, 0, 0, 0, 1);
  ms(new T.CylinderGeometry(1.82, 1.82, .18, 32, 1, true, 0, 2.6), 0x6e3b25, g, 0, 0, 0, 1);
  return g;
};
