import { T, PI, cvs2, lerp, tx } from "./util";
import { Batch, keyBand, paintM, place, ulzii } from "./craft";

// the people of the guest story, in ger units. A standing host is about .87 tall with his hat on,
// so he has to bow to pass under the lintel at .88, the way people do at a real ger door.
const SKIN = 0xc98f62, HAIR = 0x1c1410, GOLD = 0xf2c35b, CORAL = 0xc9344a;
const WAIST = .43, WAIST_SIT = .29, HEM = .085;
const hex = (c: number) => "#" + c.toString(16).padStart(6, "0");
type Ctx = CanvasRenderingContext2D;

// silk brocade: the knot woven one tone lighter, with soft vertical folds
const silk = (x: Ctx, w: number, h: number, c: number) => {
  x.fillStyle = hex(c); x.fillRect(0, 0, w, h);
  x.globalAlpha = .13;
  for (let j = 0; j < h / 42 + 1; j++) for (let i = 0; i < w / 42 + 1; i++) ulzii(x, i * 42 + (j % 2) * 21, j * 42 + 12, 26, "#fff");
  x.globalAlpha = 1;
  for (let i = 0; i < 26; i++) { x.fillStyle = i % 2 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.08)"; x.fillRect(Math.random() * w, 0, 6 + Math.random() * 16, h); }
};
// the skirt, front at the middle of the canvas: flap seam on the wearer's right, a trimmed hem at the bottom
const skirtTex = (deel: number, trim: number) => tx("skirt" + deel, () => new T.CanvasTexture(cvs2(512, 256, (x, w, h) => {
  silk(x, w, h, deel);
  x.strokeStyle = hex(GOLD); x.lineWidth = 13; x.beginPath(); x.moveTo(w * .4, 0); x.lineTo(w * .32, h); x.stroke();
  x.strokeStyle = hex(trim); x.lineWidth = 9; x.stroke();
  x.fillStyle = hex(trim); x.fillRect(0, h - 40, w, 40); x.fillStyle = hex(GOLD); x.fillRect(0, h - 44, w, 4);
  keyBand(x, h - 34, 26, 24, w, hex(deel));
})));
// the chest: the flap sweeps from the neck to under the wearer's right arm
const torsoTex = (deel: number, trim: number) => tx("torso" + deel, () => new T.CanvasTexture(cvs2(256, 256, (x, w, h) => {
  silk(x, w, h, deel);
  x.beginPath(); x.moveTo(w * .5, 0); x.quadraticCurveTo(w * .44, h * .3, w * .27, h * .44); x.lineTo(w * .29, h);
  x.lineJoin = "round"; x.strokeStyle = hex(GOLD); x.lineWidth = 14; x.stroke(); x.strokeStyle = hex(trim); x.lineWidth = 10; x.stroke();
})));

// the robe from the waist down, with its seated shape as a morph target: over the knees in front, hanging behind the stool
function skirtGeo() {
  const nu = 36, nv = 12, P: number[] = [], S: number[] = [], U: number[] = [], I: number[] = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const t = j / nv, u = i / nu, a = PI + u * 2 * PI, sx = Math.sin(a), cz = Math.cos(a), fold = .005 * Math.sin(9 * a + 1) * t;
    const r = .095 + .075 * Math.pow(t, .8) + fold;
    P.push(sx * r, lerp(WAIST, HEM, t), cz * r * .92);
    const f = (cz + 1) / 2, kn = t < .5, q = kn ? t / .5 : (t - .5) / .5;
    const fz = kn ? lerp(.08, .27, q) : lerp(.27, .29, q), fy = kn ? lerp(WAIST_SIT, .275, q) : lerp(.275, .1, q);
    S.push(sx * (lerp(.095, .16, Math.min(1, t * 1.4)) + fold), lerp(lerp(WAIST_SIT, .11, t), fy, f), lerp(lerp(-.08, -.15, t), fz, f));
    U.push(u, 1 - t);
  }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, c = a + nu + 1; I.push(a, c, a + 1, a + 1, c, c + 1); }
  const mk = (p: number[]) => {
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(p, 3)); g.setAttribute("uv", new T.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals();
    return g;
  };
  const g = mk(P), s = mk(S);
  g.morphAttributes.position = [s.attributes.position as T.BufferAttribute]; g.morphAttributes.normal = [s.attributes.normal as T.BufferAttribute];
  return g;
}

// гутал: one boot with its turned-up toe
const bootGeo = () => tx("bootG", () => {
  const b = new Batch();
  b.cyl(.036, .03, .08, HAIR, 0, .085, 0, 10).cyl(.037, .037, .01, GOLD, 0, .124, 0, 10).ball(.032, HAIR, 0, .03, .018, 1, .85, 1.9).box(.058, .012, .14, 0x6e3b25, 0, .006, .016);
  return b.add(new T.ConeGeometry(.018, .06, 8), HAIR, place(0, .05, .095, .7)).geo();
});
// a soft dark patch on the floor, so that nobody seems to float
const blobTex = () => tx("blob", () => new T.CanvasTexture(cvs2(64, 64, (x, w) => {
  const q = x.createRadialGradient(32, 32, 4, 32, 32, 32);
  q.addColorStop(0, "rgba(20,14,8,.5)"); q.addColorStop(.6, "rgba(20,14,8,.26)"); q.addColorStop(1, "rgba(20,14,8,0)");
  x.fillStyle = q; x.fillRect(0, 0, w, w);
})));

const HEAD_Y = .058;
function maleHead(b: Batch) {
  const c = HEAD_Y;
  b.add(new T.SphereGeometry(.08, 16, 10, PI, PI, 0, 2).scale(1, 1.05, .97), HAIR, place(0, c, -.002));
  // the hat: a dark blue crown, a fur brim, the red knot on top and two ribbons down the back
  b.lathe([[.086, 0], [.082, .015], [.068, .036], [.04, .052], [.012, .058], [.001, .06]], 0x1f3a7a, 0, c + .05, 0);
  b.lathe([[.079, 0], [.093, .006], [.097, .024], [.093, .036], [.084, .038], [.078, .02]], 0x3a2a1e, 0, c + .03, 0);
  b.ball(.012, CORAL, 0, c + .112, 0).ball(.006, GOLD, 0, c + .124, 0);
  [-1, 1].forEach(s => b.box(.018, .13, .004, CORAL, s * .02, c - .02, -.085, 0, .1, s * .06));
}
function femaleHead(b: Batch) {
  const c = HEAD_Y;
  b.add(new T.SphereGeometry(.081, 18, 8, 0, PI * 2, 0, .95).scale(1, 1.05, .97), HAIR, place(0, c, -.002));
  b.add(new T.SphereGeometry(.081, 16, 10, PI, PI, 0, 2.1).scale(1, 1.05, .97), HAIR, place(0, c, -.002));
  // a gold band set with coral, and coral earrings
  b.add(new T.TorusGeometry(.08, .005, 6, 28), GOLD, place(0, c + .046, -.002, PI / 2 - .26));
  [-2, -1, 0, 1, 2].forEach(i => b.ball(.0075, CORAL, i * .022, c + .06 - Math.abs(i) * .004, .058 - i * i * .004));
  [-1, 1].forEach(s => b.ball(.005, GOLD, s * .08, c - .022, .008).ball(.0075, CORAL, s * .081, c - .036, .008));
}

export type Person = ReturnType<typeof person>;
export interface PersonPose {
  ph: number; mv: number; // walk phase · 0 still, 1 walking
  sit: number; lean: number; duck: number; // seated · leaning forward · bowing under the lintel
  yaw: number; nod: number; r: number; l: number; wave: number; talk: number; // head turn · head tilt · right / left arm raised · waving · speaking
  now: number;
}

export function person(deel: number, trim: number, sash: number, female: boolean, scale: number) {
  const g = new T.Group(), body = new T.Group(); body.scale.setScalar(scale); g.add(body);
  const blob = new T.Mesh(new T.PlaneGeometry(.56, .56).rotateX(-PI / 2), new T.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false }));
  blob.position.y = .018; g.add(blob);
  const seed = deel % 977;

  const skirt = new T.Mesh(skirtGeo(), new T.MeshLambertMaterial({ map: skirtTex(deel, trim), side: T.DoubleSide, morphTargets: true, morphNormals: true }));
  body.add(skirt);
  const bootM = paintM(), boots = [-1, 1].map(() => { const m = new T.Mesh(bootGeo(), bootM); body.add(m); return m; });

  // everything above the waist hangs on `upper`, which leans and drops as one
  const upper = new T.Group(); upper.position.y = WAIST; body.add(upper);
  const shape = [[.095, 0], [.105, .05], [.118, .1], [.128, .15], [.128, .19], [.105, .225], [.07, .245], [.05, .26]].map(([r, y]) => new T.Vector2(r, y));
  upper.add(new T.Mesh(new T.LatheGeometry(shape, 22, PI, PI * 2).scale(1, 1, .8), new T.MeshLambertMaterial({ map: torsoTex(deel, trim), side: T.DoubleSide })));
  const b = new Batch();
  b.add(new T.CylinderGeometry(.106, .104, .055, 22).scale(1, 1, .82), sash).add(new T.CylinderGeometry(.1075, .1075, .006, 22).scale(1, 1, .82), GOLD, place(0, .014, 0));
  [0, .03].forEach((o, i) => b.box(.028, .17 - i * .03, .006, sash, .07 + o, -.1 + i * .015, .07 - o * .6, -.5));
  b.cyl(.052, .058, .045, trim, 0, .265, 0, 16).cyl(.0585, .0585, .006, GOLD, 0, .245, 0, 16).cyl(.03, .034, .05, SKIN, 0, .3, 0, 10);
  [[-.018, .228, .062], [-.056, .188, .083], [-.094, .13, .075]].forEach(([x, y, z]) => b.ball(.0075, GOLD, x, y, z));
  if (female) [-1, 1].forEach(s => {
    // the braids, over the shoulders and down the chest, clasped in gold
    for (let i = 0; i < 9; i++) { const t = i / 8; b.ball(.0165 * (1 - .3 * t), HAIR, s * (.072 + .02 * t), .31 - .25 * t, .02 + .065 * Math.sin(t * PI / 2)); }
    b.cyl(.012, .01, .03, GOLD, s * .092, .045, .085, 8);
  });
  upper.add(b.mesh(paintM()));

  const head = new T.Group(); head.position.y = .27; upper.add(head);
  const h = new Batch(), c = HEAD_Y;
  h.orb(.078, SKIN, 0, c, 0, 1, 1.05, .95);
  [-1, 1].forEach(s => {
    h.ball(.016, SKIN, s * .078, c - .004, 0, .5, 1, .8);
    h.ball(.018, 0xd27a5c, s * .046, c - .022, .056, 1, .7, .35);
    h.box(.028, .0055, .006, HAIR, s * .03, c + .024, .068, 0, 0, -s * .1);
  });
  h.ball(.011, 0xbd8056, 0, c - .008, .074, .85, 1, .9);
  (female ? femaleHead : maleHead)(h);
  head.add(h.mesh(paintM()));
  const eyes = new T.Group(); eyes.position.set(0, c + .006, .067); head.add(eyes);
  [-1, 1].forEach(s => {
    eyes.add(new T.Mesh(new T.SphereGeometry(.0095, 8, 6).scale(1.25, 1, .5), new T.MeshLambertMaterial({ color: HAIR }))); eyes.children[eyes.children.length - 1].position.x = s * .03;
    const gl = new T.Mesh(new T.SphereGeometry(.0026, 5, 4), new T.MeshBasicMaterial({ color: 0xffffff })); gl.position.set(s * .03 + .003, .003, .005); eyes.add(gl);
  });
  const mouth = new T.Mesh(new T.SphereGeometry(.01, 8, 6).scale(1.7, .42, .4), new T.MeshLambertMaterial({ color: 0x8a3a2c })); mouth.position.set(0, c - .036, .069); head.add(mouth);

  // shoulder → elbow → hand. `hand` stays level whatever the arm does, so a bowl in it never tips
  const arm = (s: number) => {
    const yaw = new T.Group(); yaw.position.set(s * .122, .205, 0); upper.add(yaw);
    const sh = new T.Group(); sh.rotation.z = s * .09; yaw.add(sh);
    sh.add(new Batch().ball(.042, deel, 0, 0, 0).cyl(.036, .04, .17, deel, 0, -.085, 0, 10).mesh(paintM()));
    const el = new T.Group(); el.position.y = -.17; sh.add(el);
    el.add(new Batch().ball(.037, deel, 0, 0, 0).cyl(.037, .04, .14, deel, 0, -.07, 0, 10).cyl(.041, .041, .022, trim, 0, -.15, 0, 12).cyl(.0415, .0415, .005, GOLD, 0, -.139, 0, 12).ball(.024, SKIN, 0, -.178, 0, .9, 1.1, .9).mesh(paintM()));
    const hand = new T.Group(); hand.position.y = -.185; el.add(hand);
    return { s, yaw, sh, el, hand };
  };
  const R = arm(-1), L = arm(1);
  body.traverse(o => { o.castShadow = o.receiveShadow = true; });

  const pose = (p: PersonPose) => {
    const sw = Math.sin(p.ph) * p.mv, cw = Math.cos(p.ph) * p.mv, st = 1 - p.sit;
    skirt.morphTargetInfluences![0] = p.sit; skirt.rotation.z = cw * .025 * st;
    boots.forEach((m, i) => {
      const k = i ? 1 : -1, f = sw * k;
      m.position.set(k * lerp(.05, .06, p.sit), Math.max(0, cw * k) * .03 * st, lerp(f * .085, .27, p.sit));
      m.rotation.x = -f * .35 * st;
    });
    upper.position.y = lerp(WAIST, WAIST_SIT, p.sit) + Math.abs(cw) * .012 + Math.sin(p.now * .0018 + seed) * .0025;
    upper.rotation.set(p.lean + p.duck * .75 + p.sit * .04, sw * .09, cw * .012);
    // the head stays up while the back bends, and nods along with the talking
    head.rotation.set(p.nod - p.duck * .45 + Math.sin(p.now * .007) * .035 * p.talk, p.yaw, 0);
    eyes.scale.y = (p.now + seed * 900) % 3700 < 120 ? .12 : 1;
    mouth.scale.y = 1 + p.talk * (.5 + .5 * Math.sin(p.now * .017)) * 2.2;
    [[R, p.r, 1], [L, p.l, -1]].forEach(([A, up, d]) => {
      const a = A as typeof R, u = up as number, lift = Math.min(1, u / .4), wv = a == R ? p.wave : 0;
      a.yaw.rotation.y = -a.s * .32 * Math.min(1, Math.max(0, (u - .6) / .3)) * (1 - wv);
      a.sh.rotation.x = -u + sw * (d as number) * .32 * (1 - lift);
      a.sh.rotation.z = a.s * (.09 + wv * (.5 + .22 * Math.sin(p.now * .009)));
      a.el.rotation.x = -lerp(.16 + .58 * u, .3, wv);
      a.hand.rotation.x = -(upper.rotation.x + a.sh.rotation.x + a.el.rotation.x);
    });
  };
  return { g, r: R, l: L, pose };
}
