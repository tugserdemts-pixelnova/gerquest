import { T, M, sm } from "./util";
import { B } from "./parts";
import { buildGer, type GerData } from "./ger";
import { D, N } from "../data/parts";

export const px = (z: number) => Math.sin(z * .05) * 8, ZS = 24;
// hero ger site · build site (flat ground on the path just past the last station) · BAZ/BEL: direction the build camera looks from
export const GX = px(-4) + 9, GZ = -4, HK = 2.3, BZ = -(N + 1) * ZS, BX = px(BZ), BAZ = .5, BEL = .2;
const flat = (x: number, z: number) => sm(8, 13, Math.hypot(x - GX, z - GZ)) * sm(8, 13, Math.hypot(x - BX, z - BZ));
export const hf = (x: number, z: number) => {
  const d = Math.abs(x - px(z));
  return (Math.max(0, d - 10) * .1 * (1 + .6 * Math.sin(x * .07 + z * .05) * Math.cos(z * .09)) + .3 * Math.sin(x * .4) * Math.cos(z * .35) * Math.min(1, d / 10)) * flat(x, z);
};

export interface Station { ring: T.Mesh; pivot: T.Group; hold: T.Group; o: T.Group; k: number; q: T.Sprite; spin: number; pulse: number }

export function createWorld(S: T.Scene) {
  let sd = 11;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  // ground
  const ZO = -140, gg = new T.PlaneGeometry(500, 700, 150, 210).rotateX(-Math.PI / 2), gp = gg.attributes.position, gc = new Float32Array(gp.count * 3);
  const cA = new T.Color(0x8fbf5a), cB = new T.Color(0xcdbf6c), cP = new T.Color(0xdcc590), cR = new T.Color(0x9b9082), tc = new T.Color();
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i) + ZO, d = Math.abs(x - px(z)), h = hf(x, z);
    gp.setY(i, h);
    tc.copy(cA).lerp(cB, .5 + .5 * Math.sin(x * .11) * Math.cos(z * .13)).lerp(cR, sm(6, 14, h)).lerp(cP, 1 - sm(2.4, 4.6, d)).lerp(cP, .85 * (1 - sm(5, 9, Math.hypot(x - BX, z - BZ))));
    gc.set([tc.r, tc.g, tc.b], i * 3);
  }
  gg.setAttribute("color", new T.BufferAttribute(gc, 3)); gg.computeVertexNormals();
  const gm = new T.Mesh(gg, new T.MeshLambertMaterial({ vertexColors: true })); gm.position.z = ZO; S.add(gm);

  // scenery (kept clear of the hero ger, the build site and the build camera's line of sight)
  const gT = new T.CylinderGeometry(.2, .3, 1.6, 6), gC1 = new T.ConeGeometry(1.5, 3.2, 7), gC2 = new T.ConeGeometry(1.1, 2.6, 7), mT = M(0x6b4a2b), mG = M(0x3f7a3a), mG2 = M(0x4f8f45);
  const nearB = (x: number, z: number) => {
    const q = Math.max(0, Math.min(46, (x - BX) * Math.sin(BAZ) + (z - BZ) * Math.cos(BAZ)));
    return Math.hypot(x - BX - Math.sin(BAZ) * q, z - BZ - Math.cos(BAZ) * q) < 11;
  };
  const at = (o: T.Object3D, x: number, z: number, y?: number) => {
    if (Math.hypot(x - GX, z - GZ) < 10 || (Math.abs(x - GX) < 8 && z > GZ && z < GZ + 32) || (y === undefined && nearB(x, z))) return o;
    o.position.set(x, y === undefined ? hf(x, z) : y, z); S.add(o); return o;
  };
  const side = () => rnd() < .5 ? -1 : 1;
  for (let k = 0; k < 120; k++) {
    const z = 40 - rnd() * 330, x = px(z) + side() * (9 + rnd() * 80), g = new T.Group();
    ([[gT, mT, .8], [gC1, mG, 2.9], [gC2, mG2, 4.3]] as const).forEach(([ge, ma, y]) => { const m = new T.Mesh(ge, ma); m.position.y = y; g.add(m); });
    g.scale.setScalar(.8 + rnd() * 1.1); at(g, x, z);
  }
  const gR = new T.DodecahedronGeometry(1), mR = M(0x8d867b);
  for (let k = 0; k < 55; k++) {
    const z = 30 - rnd() * 320, x = px(z) + side() * (5 + rnd() * 45), m = new T.Mesh(gR, mR);
    m.scale.set(.6 + rnd() * 1.4, .4 + rnd() * .7, .6 + rnd() * 1.4); at(m, x, z);
  }
  // sheep
  const gS = new T.SphereGeometry(.5, 8, 6), mW = M(0xf4f1ea), mD = M(0x2e2a28);
  for (let f = 0; f < 6; f++) {
    const z = -10 - f * 45 - rnd() * 20, cx = px(z) + side() * (11 + rnd() * 6);
    for (let k = 0; k < 7; k++) {
      const g = new T.Group(), b = new T.Mesh(gS, mW); b.scale.set(1.3, .9, .9); b.position.y = .5;
      const h = new T.Mesh(gS, mD); h.scale.setScalar(.45); h.position.set(.6, .65, 0);
      g.add(b, h); g.rotation.y = rnd() * 6; at(g, cx + (rnd() - .5) * 7, z + (rnd() - .5) * 7);
    }
  }
  // mountains
  const gM = new T.ConeGeometry(55, 90, 6), gMc = new T.ConeGeometry(19, 31.5, 6), mM = M(0x7f8794), mSn = M(0xffffff);
  const mtn = (x: number, z: number, y: number, s: number) => {
    const g = new T.Group(), a = new T.Mesh(gM, mM), b = new T.Mesh(gMc, mSn);
    a.position.y = 45; b.position.y = 74.2; g.add(a, b); g.scale.setScalar(s); at(g, x, z, y);
  };
  for (let k = 0; k < 9; k++) mtn(-230 + k * 58, -430, 0, .9 + rnd() * .6);
  for (let k = 0; k < 6; k++) { const z = -60 - k * 55, s = side(); mtn(px(z) + s * (190 + rnd() * 30), z, hf(px(z) + s * 200, z) - 6, .6 + rnd() * .5); }
  // clouds
  const gCl = new T.SphereGeometry(5, 8, 6), mCl = new T.MeshLambertMaterial({ color: 0xffffff });
  for (let k = 0; k < 18; k++) {
    const g = new T.Group();
    for (let q = 0; q < 4; q++) { const m = new T.Mesh(gCl, mCl); m.position.set(q * 5 - 8, rnd() * 2, rnd() * 3); m.scale.set(1.3, .6, 1); g.add(m); }
    at(g, (rnd() - .5) * 400, -rnd() * 380 + 40, 45 + rnd() * 25);
  }

  // hero ger (full Mongol ger on the cover) + a second ger at the build site
  const mkGer = (x: number, z: number) => { const o = buildGer(), h = new T.Group(); h.add(o); h.scale.setScalar(HK); h.position.set(x, hf(x, z) + .2, z); S.add(h); return h; };
  const heroGer = mkGer(GX, GZ), heroO = heroGer.children[0], bGer = mkGer(BX, BZ), bO = bGer.children[0];
  const bRing = new T.Mesh(new T.RingGeometry(HK * 2.5, HK * 2.78, 72).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0xf2c35b, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  bRing.position.set(BX, .07, BZ); bRing.visible = false; S.add(bRing);

  // stations
  const qc = document.createElement("canvas"); qc.width = qc.height = 128;
  {
    const x = qc.getContext("2d")!;
    x.fillStyle = "#ffd54a"; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.fill(); x.strokeStyle = "#5a3a1a"; x.lineWidth = 6; x.stroke();
    x.fillStyle = "#5a3a1a"; x.font = "bold 80px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("?", 64, 70);
  }
  const qMat = new T.SpriteMaterial({ map: new T.CanvasTexture(qc) }), ST: Station[] = [], hits: T.Mesh[] = [];
  for (let j = 1; j <= N; j++) {
    const z = -j * ZS, g = new T.Group(), pr = 2.1; g.position.set(px(z), 0, z); S.add(g);
    const ped = new T.Mesh(new T.CylinderGeometry(pr * .86, pr, .6, 32), M(0x6b3f1f)); ped.position.y = .3; g.add(ped);
    const ring = new T.Mesh(new T.TorusGeometry(pr * .8, .1, 8, 40).rotateX(Math.PI / 2), new T.MeshLambertMaterial({ color: 0xe8b84a })); ring.position.y = .62; g.add(ring);
    const o = B[D[j - 1][0]](), box = new T.Box3().setFromObject(o), c = box.getCenter(new T.Vector3()), sz = box.getSize(new T.Vector3());
    o.position.sub(c);
    const k = 3.4 / Math.max(sz.x, sz.y, sz.z), hold = new T.Group(); hold.add(o); hold.scale.setScalar(k);
    const pivot = new T.Group(); pivot.add(hold); pivot.position.y = .9 + .225 * Math.max(sz.x, sz.z) * k + sz.y * k / 2; pivot.rotation.x = .12; g.add(pivot);
    const hit = new T.Mesh(new T.SphereGeometry(2.4, 8, 8), new T.MeshBasicMaterial({ visible: false })); hit.position.y = pivot.position.y; hit.userData.j = j; g.add(hit); hits.push(hit);
    const q = new T.Sprite(qMat); q.scale.set(2.2, 2.2, 1); g.add(q);
    ST[j] = { ring, pivot, hold, o, k, q, spin: 0, pulse: 0 };
  }
  // camera path (cC) and look-at path (lC) through the stations
  const cp = [new T.Vector3(px(14), 5, 14)], lp = [new T.Vector3(px(-10), 2.6, -10)];
  for (let j = 1; j <= N; j++) { const z = -j * ZS; cp.push(new T.Vector3(px(z), 4.0, z + 10)); lp.push(new T.Vector3(px(z), 3.0, z)); }
  const cC = new T.CatmullRomCurve3(cp), lC = new T.CatmullRomCurve3(lp);

  return { heroGer, heroO, heroD: heroO.userData as GerData, bGer, bO, bD: bO.userData as GerData, bRing, ST, hits, cC, lC };
}
