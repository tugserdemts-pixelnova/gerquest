import { T, PI } from "./util";
import { Batch, chestTex, hangingTex, paintM, photoTex, place, quiltBedTex, shirdegTex } from "./craft";

// the inside of the ger, in ger units: door at +z (south), west = -x, the place of honour (хоймор) at -z (north)
export const SEAT: [number, number] = [-1.42, .42], HOST_SEAT: [number, number] = [-.15, -1.2], TABLE: [number, number] = [-.78, -.52];

const OR = 0xd8571c, DEEP = 0xa83a14, GOLD = 0xf2c35b, NAVY = 0x23419e, GREEN = 0x2f8f63, ROSE = 0xc9344a, IRON = 0x2a2725, STEEL = 0x9ea3a9, HIDE = 0x4a3020, WOOD = 0x7a3f1c;

const stool = (b: Batch, x: number, z: number) => {
  b.cyl(.14, .14, .03, OR, x, .19, z, 14).cyl(.145, .145, .012, GOLD, x, .17, z, 14);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([i, j]) => b.box(.03, .17, .03, DEEP, x + i * .085, .085, z + j * .085));
};

function stove(root: T.Group) {
  const b = new Batch();
  b.box(.36, .24, .36, IRON, 0, .21, 0).box(.4, .025, .4, 0x3a3634, 0, .34, 0).box(.38, .02, .38, 0x3a3634, 0, .085, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([i, j]) => b.box(.04, .08, .04, IRON, i * .16, .04, j * .16));
  // fire door with its bars, and the ash drawer under it
  b.box(.2, .13, .012, 0x3a3634, 0, .235, .184);
  [-.05, 0, .05].forEach(x => b.box(.012, .1, .012, IRON, x, .235, .196));
  b.box(.13, .02, .02, GOLD, 0, .305, .19).box(.2, .045, .012, 0x3a3634, 0, .125, .184).ball(.012, STEEL, 0, .125, .196);
  // top plate rings
  b.torus(.075, .008, 0x4a4542, .09, .356, .09).torus(.05, .007, 0x4a4542, .09, .356, .09);
  // the pipe, its damper, and the cap above the toono
  b.cyl(.042, .042, 1.78, 0x35312f, 0, 1.24, -.08, 12).cyl(.052, .052, .03, GOLD, 0, .46, -.08, 12).cyl(.05, .05, .018, 0x4a4542, 0, 1.2, -.08, 12);
  b.add(new T.ConeGeometry(.09, .06, 12), 0x35312f, place(0, 2.17, -.08));
  // tea kettle
  b.lathe([[.06, 0], [.1, .025], [.11, .07], [.09, .125], [.058, .15], [.06, .168], [.03, .178], [.001, .18]], STEEL, .09, .35, .09);
  b.cyl(.012, .022, .1, STEEL, .2, .46, .09, 8, 0, -.9);
  b.torus(.08, .007, IRON, .09, .535, .09, 0, 0, PI);
  b.ball(.014, GOLD, .09, .53, .09);
  // fuel box of dried dung (аргал) and the tongs
  b.box(.28, .02, .24, WOOD, .44, .01, .54);
  [[-.14, 0, .02, .24], [.14, 0, .02, .24], [0, -.12, .28, .02], [0, .12, .28, .02]].forEach(([x, z, w, d]) => b.box(w, .13, d, WOOD, .44 + x, .07, .54 + z));
  for (let i = 0; i < 11; i++) b.ball(.052, i % 2 ? 0x6e5238 : 0x7f6244, .35 + (i % 4) * .06, .13 + (i % 3) * .022, .47 + (i % 3) * .07, 1, .55, 1);
  b.box(.012, .012, .34, STEEL, .28, .04, .66, .5, 0, .1);
  root.add(b.mesh(paintM(undefined, true)));
  const glow = new T.Mesh(new T.BoxGeometry(.15, .09, .006), new T.MeshBasicMaterial({ color: 0xff8a2a })); glow.position.set(0, .235, .192); root.add(glow);
}

// a painted chest: the knot panel on its front, gold corners
function chest(root: T.Group, x: number, z: number, ry: number) {
  const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
  const wd = new T.MeshLambertMaterial({ color: OR }), fc = new T.MeshLambertMaterial({ map: chestTex() });
  const m = new T.Mesh(new T.BoxGeometry(.88, .42, .36), [wd, wd, wd, wd, fc, wd]); m.position.y = .29; g.add(m);
  const b = new Batch();
  b.box(.92, .08, .38, DEEP, 0, .04, 0).box(.92, .02, .38, GOLD, 0, .51, 0);
  [[-1], [1]].forEach(([s]) => { b.box(.03, .42, .372, GOLD, s * .44, .29, 0); });
  b.box(.06, .08, .012, GOLD, 0, .4, .186);
  g.add(b.mesh(paintM()));
}

// the top of the chests: family photographs, butter lamps, a silver bowl and the blue khadag
function altar(root: T.Group) {
  const b = new Batch();
  [[-.62, .34, .26, 0x8a5a2b, 0], [-.3, .24, .2, GOLD, 1], [.3, .28, .22, 0x8a5a2b, 2], [.62, .22, .18, GOLD, 1]].forEach(([x, h, w, fr, kind]) => {
    const z = -1.72 + Math.abs(x) * .3, ry = x * -.34;
    b.box(w, h, .02, fr, x, .52 + h / 2, z, ry);
    const p = new T.Mesh(new T.PlaneGeometry(w - .05, h - .05), new T.MeshLambertMaterial({ map: photoTex(kind) }));
    p.position.set(x + Math.sin(ry) * .012, .52 + h / 2, z + Math.cos(ry) * .012); p.rotation.y = ry; root.add(p);
  });
  [-.14, .14].forEach(x => {
    b.lathe([[.001, 0], [.035, 0], [.012, .02], [.012, .05], [.042, .08], [.048, .1], [.001, .1]], GOLD, x, .52, -1.5);
  });
  b.lathe([[.001, 0], [.03, 0], [.06, .03], [.07, .06], [.06, .06], [.001, .02]], STEEL, 0, .52, -1.46);
  for (let i = 0; i < 5; i++) b.ball(.016, 0xf3ecd8, (i - 2) * .018, .57 + (i % 2) * .012, -1.46);
  // the khadag, laid over the left chest and falling down its front
  b.box(.17, .008, .3, 0x5aa6dd, -.5, .525, -1.58, .17);
  b.box(.17, .3, .008, 0x5aa6dd, -.54, .375, -1.42, .17);
  b.box(.17, .012, .012, 0x3f8cc4, -.54, .225, -1.42, .17);
  root.add(b.mesh(paintM(undefined, true)));
  const fl = new T.Group();
  [-.14, .14].forEach(x => { const f = new T.Mesh(new T.ConeGeometry(.011, .035, 6), new T.MeshBasicMaterial({ color: 0xffc24a })); f.position.set(x, .64, -1.5); fl.add(f); });
  root.add(fl);
}

function bed(root: T.Group, s: number) {
  const g = new T.Group(); g.position.set(s * 1.6, 0, -.68); g.rotation.y = s * .38; root.add(g);
  const pw = new T.MeshLambertMaterial({ color: OR }), fc = new T.MeshLambertMaterial({ map: chestTex() });
  const head = new T.Mesh(new T.BoxGeometry(.54, .52, .05), [pw, pw, pw, pw, fc, fc]); head.position.set(0, .3, -.56); g.add(head);
  const side = new T.Mesh(new T.BoxGeometry(.54, .22, 1.06), [pw, pw, pw, pw, pw, pw]); side.position.y = .14; g.add(side);
  const quilt = new T.Mesh(new T.BoxGeometry(.52, .07, .86), new T.MeshLambertMaterial({ map: quiltBedTex() })); quilt.position.set(0, .29, .08); g.add(quilt);
  const b = new Batch();
  b.box(.56, .02, 1.08, GOLD, 0, .25, 0).box(.5, .05, .22, 0xefe4cc, 0, .28, -.42);
  b.add(new T.CylinderGeometry(.07, .07, .42, 14), 0xe6dcc4, place(0, .36, -.41, 0, 0, PI / 2));
  [-1, 1].forEach(k => { b.cyl(.072, .072, .006, ROSE, k * .212, .36, -.41, 14, 0, PI / 2); b.cyl(.04, .04, .008, GOLD, k * .216, .36, -.41, 12, 0, PI / 2); });
  g.add(b.mesh(paintM()));
}

// морин хуур: the horse-head fiddle, hung on the wall with a khadag
function morinKhuur(root: T.Group) {
  const g = new T.Group(), x = 1.24, z = -1.26; g.position.set(x, .72, z); g.rotation.y = Math.atan2(-x, -z); root.add(g);
  const b = new Batch();
  const box = new T.Shape(); box.moveTo(-.1, -.18); box.lineTo(.1, -.18); box.lineTo(.135, .1); box.lineTo(-.135, .1); box.closePath();
  b.add(new T.ExtrudeGeometry(box, { depth: .05, bevelEnabled: false }), WOOD, place(0, 0, -.025));
  b.box(.21, .24, .004, 0xc98a4a, 0, -.04, .027);
  b.box(.022, .46, .016, 0x3a2414, 0, .32, 0).box(.11, .012, .02, 0xefe4cc, 0, -.1, .034);
  [-.006, .006].forEach(o => b.box(.003, .6, .003, 0xefe4cc, o, .22, .036));
  [.42, .47].forEach((y, i) => b.box(.09, .012, .012, 0x3a2414, i ? .022 : -.022, y, .012));
  // the carved head
  const h = new T.Shape();
  h.moveTo(-.02, 0); h.lineTo(-.025, .07); h.quadraticCurveTo(-.03, .1, .0, .115); h.lineTo(.012, .14); h.lineTo(.02, .112); h.quadraticCurveTo(.06, .1, .09, .06); h.lineTo(.085, .04); h.quadraticCurveTo(.04, .05, .02, .03); h.lineTo(.02, 0); h.closePath();
  b.add(new T.ExtrudeGeometry(h, { depth: .03, bevelEnabled: false }), GOLD, place(0, .54, -.015));
  // the khadag tied at the neck
  b.box(.06, .012, .03, 0x5aa6dd, 0, .4, .01).box(.03, .18, .006, 0x5aa6dd, .03, .31, .02, 0, 0, -.12);
  g.add(b.mesh(paintM(undefined, true)));
}

// хөхүүр: the hide bag of airag on its frame by the door, with the wooden stirrer standing in it
function khukhuur(root: T.Group) {
  const b = new Batch(), x = -.96, z = 1.45;
  [-.22, .22].forEach(o => { b.box(.03, .72, .03, WOOD, x + o, .36, z); b.box(.1, .02, .22, WOOD, x + o, .01, z); });
  b.box(.5, .03, .03, WOOD, x, .7, z);
  b.orb(.2, HIDE, x, .3, z, 1, 1.25, 1);
  b.cyl(.075, .11, .1, HIDE, x, .58, z, 10);
  b.torus(.2, .009, 0x2c1c12, x, .3, z).torus(.12, .012, 0xefe4cc, x, .66, z);
  b.cyl(.012, .016, .62, 0xc9a06a, x + .03, .86, z, 8, 0, -.06);
  b.ball(.03, 0xc9a06a, x + .05, 1.16, z);
  root.add(b.mesh(paintM()));
}

// the hostess's side by the door: a painted cupboard with bowls on top, and the water bucket
function kitchen(root: T.Group) {
  const x = 1.16, z = 1.24, ry = Math.atan2(-x, -z), g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
  const wd = new T.MeshLambertMaterial({ color: OR }), fc = new T.MeshLambertMaterial({ map: chestTex() });
  const c = new T.Mesh(new T.BoxGeometry(.62, .46, .28), [wd, wd, wd, wd, fc, wd]); c.position.y = .27; g.add(c);
  const b = new Batch();
  b.box(.66, .04, .3, DEEP, 0, .02, 0).box(.66, .02, .3, GOLD, 0, .51, 0);
  [[-.18, 0xf6f2ea], [-.04, 0xf6f2ea]].forEach(([bx]) => { for (let i = 0; i < 3; i++) b.add(new T.CylinderGeometry(.06, .036, .04, 12), 0xf6f2ea, place(bx, .54 + i * .018, 0)); b.torus(.06, .004, NAVY, bx, .59, 0); });
  b.lathe([[.001, 0], [.1, 0], [.12, .07], [.11, .12], [.1, .12], [.001, .02]], STEEL, .18, .52, 0);
  b.box(.012, .012, .18, GREEN, .18, .62, .08, 0, -.6);
  g.add(b.mesh(paintM(undefined, true)));
  const w = new Batch(), wx = .78, wz = 1.56;
  w.lathe([[.001, 0], [.11, 0], [.13, .26], [.12, .26], [.1, .02], [.001, .02]], 0x9a6a3a, wx, 0, wz);
  [.07, .19].forEach(y => w.torus(.118 + y * .08, .007, 0x3a3634, wx, y, wz));
  w.cyl(.116, .116, .004, 0x7fb3c9, wx, .22, wz, 14);
  root.add(w.mesh(paintM(undefined, true)));
}

// everything inside the ger except the people
export function furnish(root: T.Group) {
  // ширдэг: the quilted felt rug
  const rug = new T.Mesh(new T.CircleGeometry(1.3, 48).rotateX(-PI / 2), new T.MeshLambertMaterial({ map: shirdegTex(), color: 0xc9bda6 }));
  rug.position.y = .012; root.add(rug);
  // the embroidered cloth behind the chests
  const cloth = new T.Mesh(new T.CylinderGeometry(1.82, 1.82, .56, 28, 1, true, PI - .78, 1.56), new T.MeshLambertMaterial({ map: hangingTex(), side: T.BackSide }));
  cloth.position.y = .86; root.add(cloth);
  stove(root);
  chest(root, -.5, -1.68, .17); chest(root, .5, -1.68, -.17);
  altar(root);
  bed(root, -1); bed(root, 1);
  morinKhuur(root); khukhuur(root); kitchen(root);
  // the low table by the guest and the stools around it
  const b = new Batch(), [tx, tz] = TABLE;
  b.box(.58, .03, .4, OR, tx, .25, tz).box(.6, .012, .42, GOLD, tx, .232, tz).box(.5, .05, .32, DEEP, tx, .2, tz);
  [[-.24, -.15], [-.24, .15], [.24, -.15], [.24, .15]].forEach(([x, z]) => b.box(.04, .2, .04, DEEP, tx + x, .1, tz + z));
  stool(b, SEAT[0], SEAT[1]); stool(b, HOST_SEAT[0], HOST_SEAT[1]);
  root.add(b.mesh(paintM()));
}
