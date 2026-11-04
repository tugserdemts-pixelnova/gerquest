import { T } from "../util";
import { Batch, doorTex, frameTex, paintM, place } from "../craft";

const WOOD = 0xa83a14, GOLD = 0xf2c35b, IRON = 0x2c2a2a, OPEN_W = .68, OPEN_H = .88;

// one door for the ger and the station: frame, threshold and painted leaf, with z = 0 at the outer face of the frame.
// Returns the hinge: rotation.y swings the leaf open, outward
export const doorUnit = (Q: T.Object3D) => {
  const postW = .12, depth = .21, zc = -.045;
  const post = (x: number, y: number, w: number, h: number, ft: T.Texture) => {
    const face = new T.MeshLambertMaterial({ map: ft }), wd = new T.MeshLambertMaterial({ color: WOOD });
    const m = new T.Mesh(new T.BoxGeometry(w, h, depth), [wd, wd, wd, wd, face, wd]); m.position.set(x, y, zc); Q.add(m);
  };
  [-1, 1].forEach(s => post(s * (OPEN_W / 2 + postW / 2), OPEN_H / 2, postW, OPEN_H, frameTex(true)));
  post(0, OPEN_H + .06, OPEN_W + postW * 2, .12, frameTex(false));
  const b = new Batch();
  // the threshold (босго): a raised board you step over
  b.box(OPEN_W + .3, .05, depth + .1, WOOD, 0, .025, zc + .02).box(OPEN_W, .022, depth, 0xd8571c, 0, .058, zc);
  // a little carved crest over the lintel
  const cr = new T.Shape(), hw = OPEN_W / 2 + .1;
  cr.moveTo(-hw, 0); cr.quadraticCurveTo(-hw * .55, .02, -hw * .32, .055); cr.quadraticCurveTo(0, .13, hw * .32, .055); cr.quadraticCurveTo(hw * .55, .02, hw, 0); cr.closePath();
  b.add(new T.ExtrudeGeometry(cr, { depth: .05, bevelEnabled: false }), 0xd8571c, place(0, OPEN_H + .12, zc - .025));
  b.ball(.024, GOLD, 0, OPEN_H + .2, zc);
  Q.add(b.mesh(paintM()));
  // the leaf, hanging on two iron straps
  const hinge = new T.Group(); hinge.position.set(OPEN_W / 2, OPEN_H / 2 + .03, 0); Q.add(hinge);
  const lh = OPEN_H - .06, wd = new T.MeshLambertMaterial({ color: WOOD }), fc = new T.MeshLambertMaterial({ map: doorTex() });
  const leaf = new T.Mesh(new T.BoxGeometry(OPEN_W, lh, .04), [wd, wd, wd, wd, fc, fc]); leaf.position.set(-OPEN_W / 2, 0, 0); hinge.add(leaf);
  const f = new Batch();
  [lh * .34, -lh * .34].forEach(y => { f.box(.16, .022, .046, IRON, -.08, y, 0); f.cyl(.012, .012, .05, IRON, 0, y, .02); });
  f.torus(.032, .007, GOLD, -OPEN_W + .075, -.02, .026, 0).ball(.014, GOLD, -OPEN_W + .075, .012, .026);
  hinge.add(f.mesh(paintM()));
  return hinge;
};

// хаалга: the door standing in its frame, opened a little so the thickness shows
export const buildDoor = () => {
  const g = new T.Group(), s = new T.Group(); s.scale.setScalar(2.4); g.add(s);
  doorUnit(s).rotation.y = .55;
  return g;
};
