import { T, M, sm } from "./util";
import { B } from "./parts";
import { buildGer, type GerData } from "./ger";
import { addAnimals } from "./animals";
import { D, N } from "../data/parts";

export const px = (z: number) => Math.sin(z * .05) * 8, ZS = 24;
// hero ger site · build site (flat ground on the path just past the last station) · BAZ/BEL: direction the build camera looks from
// HAZE: fog + sky horizon colour · SUN: direction the sunlight comes from
export const HAZE = 0xd9ecf2, SUN = new T.Vector3(4, 6, 6);
export const GX = px(-4) + 9, GZ = -4, HK = 2.3, BZ = -(N + 1) * ZS, BX = px(BZ), BAZ = .5, BEL = .2;
const flat = (x: number, z: number) => sm(8, 13, Math.hypot(x - GX, z - GZ)) * sm(8, 13, Math.hypot(x - BX, z - BZ));
export const hf = (x: number, z: number) => {
  const d = Math.abs(x - px(z));
  return (Math.max(0, d - 10) * .1 * (1 + .6 * Math.sin(x * .07 + z * .05) * Math.cos(z * .09)) + .3 * Math.sin(x * .4) * Math.cos(z * .35) * Math.min(1, d / 10)) * flat(x, z);
};

// ground palette: [grass, lush grass, dry patches, path, rock] · the summer look is the default
export type GroundPal = [number, number, number, number, number];
export const SUMMER_GROUND: GroundPal = [0x547f32, 0x6a8f38, 0x8c8746, 0xa08c66, 0x726d64], SUMMER_GRASS = [0x4f7a2c, 0x5f8a33, 0x6f9a3a, 0x86913f];

export const shade = (o: T.Object3D) => o.traverse(m => { if ((m as T.Mesh).isMesh) m.castShadow = m.receiveShadow = true; });

export interface Station { ring: T.Mesh; pivot: T.Group; hold: T.Group; o: T.Group; k: number; q: T.Sprite; spin: number; pulse: number }

export function createWorld(S: T.Scene) {
  let sd = 11;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  // ground: steppe greens, dry patches and a sandy path, with small-scale mottling so it doesn't read as one flat colour
  // the mix factors per vertex are fixed; paintGround turns them into colours for one season palette
  const ZO = -140, gg = new T.PlaneGeometry(500, 700, 150, 210).rotateX(-Math.PI / 2), gp = gg.attributes.position, nv = gp.count;
  const fMot = new Float32Array(nv), fDry = new Float32Array(nv), fRock = new Float32Array(nv), fPath = new Float32Array(nv), fSite = new Float32Array(nv);
  for (let i = 0; i < nv; i++) {
    const x = gp.getX(i), z = gp.getZ(i) + ZO, d = Math.abs(x - px(z)), h = hf(x, z);
    gp.setY(i, h);
    fMot[i] = (.5 + .5 * Math.sin(x * .9 + Math.cos(z * .7) * 2) * Math.cos(z * .8 - x * .3)) * .7;
    fDry[i] = sm(.15, .95, .5 + .5 * Math.sin(x * .11) * Math.cos(z * .13)) * .75;
    fRock[i] = sm(6, 14, h); fPath[i] = 1 - sm(2.4, 4.6, d); fSite[i] = .85 * (1 - sm(5, 9, Math.hypot(x - BX, z - BZ)));
  }
  const tc = new T.Color(), gc0 = new T.Color(), gc1 = new T.Color(), gc2 = new T.Color(), gc3 = new T.Color(), gc4 = new T.Color();
  const paintGround = (pal: GroundPal, out = new Float32Array(nv * 3)) => {
    gc0.set(pal[0]); gc1.set(pal[1]); gc2.set(pal[2]); gc3.set(pal[3]); gc4.set(pal[4]);
    for (let i = 0; i < nv; i++) {
      tc.copy(gc0).lerp(gc1, fMot[i]).lerp(gc2, fDry[i]).lerp(gc4, fRock[i]).lerp(gc3, fPath[i]).lerp(gc3, fSite[i]);
      out[i * 3] = tc.r; out[i * 3 + 1] = tc.g; out[i * 3 + 2] = tc.b;
    }
    return out;
  };
  gg.setAttribute("color", new T.BufferAttribute(paintGround(SUMMER_GROUND), 3)); gg.computeVertexNormals();
  const gm = new T.Mesh(gg, new T.MeshLambertMaterial({ vertexColors: true })); gm.position.z = ZO; gm.receiveShadow = true; S.add(gm);

  // sky dome: horizon haze (= fog colour) up to deep blue, with a soft glow around the sun; follows the camera
  const sky = new T.Mesh(new T.SphereGeometry(800, 32, 16), new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false, fog: false,
    uniforms: { hz: { value: new T.Color(HAZE) }, zen: { value: new T.Color(0x3f8fd8) }, glow: { value: new T.Color(0xffeec7) }, sun: { value: SUN.clone().normalize() } },
    vertexShader: "varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
    fragmentShader: "uniform vec3 hz, zen, glow, sun; varying vec3 vD; void main(){ vec3 d = normalize(vD); float h = max(d.y, 0.);"
      + " vec3 c = mix(hz, zen, pow(smoothstep(0., .6, h), .75)); float s = max(dot(d, sun), 0.);"
      + " c += glow * (pow(s, 6.) * .1 + pow(s, 300.) * .5); gl_FragColor = vec4(c, 1.); }",
  }));
  sky.renderOrder = -1; sky.frustumCulled = false; S.add(sky);

  // scenery (kept clear of the hero ger, the build site and the build camera's line of sight)
  const nearB = (x: number, z: number) => {
    const q = Math.max(0, Math.min(46, (x - BX) * Math.sin(BAZ) + (z - BZ) * Math.cos(BAZ)));
    return Math.hypot(x - BX - Math.sin(BAZ) * q, z - BZ - Math.cos(BAZ) * q) < 11;
  };
  const blocked = (x: number, z: number) => Math.hypot(x - GX, z - GZ) < 10 || (Math.abs(x - GX) < 8 && z > GZ && z < GZ + 32);
  // things standing on the ground (no y given) cast and catch shadows; mountains and clouds do not
  const at = (o: T.Object3D, x: number, z: number, y?: number) => {
    if (blocked(x, z) || (y === undefined && nearB(x, z))) return o;
    o.position.set(x, y === undefined ? hf(x, z) : y, z); S.add(o); if (y === undefined) shade(o); return o;
  };
  const side = () => rnd() < .5 ? -1 : 1;
  // pines: trunk + three tiers in one of three palettes (the seasons recolour these materials)
  const gT = new T.CylinderGeometry(.18, .3, 1.8, 6), tiers = [[1.75, 2.5, 2.1], [1.35, 2.2, 3.2], [.92, 2, 4.3]].map(([r, h, y]) => [new T.ConeGeometry(r, h, 8), y] as const);
  const mT = M(0x5e4026), pal = [[0x2f6332, 0x3b7438, 0x478540], [0x3a6e36, 0x467f3d, 0x549046], [0x2c5a35, 0x376b3c, 0x427a44]].map(p => p.map(c => M(c)));
  for (let k = 0; k < 140; k++) {
    const z = 40 - rnd() * 330, x = px(z) + side() * (9 + rnd() * 80), g = new T.Group(), p = pal[Math.floor(rnd() * 3)];
    const tr = new T.Mesh(gT, mT); tr.position.y = .9; g.add(tr);
    tiers.forEach(([ge, y], i) => { const m = new T.Mesh(ge, p[i]); m.position.y = y; m.rotation.y = rnd() * 3; g.add(m); });
    g.scale.setScalar(.8 + rnd() * 1.1); g.rotation.z = (rnd() - .5) * .06; at(g, x, z);
  }
  const gR = new T.DodecahedronGeometry(1), mR = M(0x8a857c), mR2 = M(0x77736c);
  for (let k = 0; k < 70; k++) {
    const z = 30 - rnd() * 320, x = px(z) + side() * (5 + rnd() * 45), m = new T.Mesh(gR, k % 3 ? mR : mR2);
    m.scale.set(.6 + rnd() * 1.4, .4 + rnd() * .7, .6 + rnd() * 1.4); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); at(m, x, z);
  }
  // the five snouts (horses, camels, yaks, sheep, goats), marmots and golden eagles
  const animals = addAnimals(S, at, rnd, side);
  // grass tufts (3 tilted blades each) and wildflowers, instanced; kept off the path and the ger sites
  const spots = (n: number, f: (x: number, z: number, d: number) => boolean) => {
    const out: [number, number][] = [];
    while (out.length < n) {
      const z = 36 - rnd() * 360, x = px(z) + side() * (2.6 + Math.pow(rnd(), 1.6) * 70), d = Math.abs(x - px(z));
      if (!blocked(x, z) && Math.hypot(x - BX, z - BZ) > 8 && f(x, z, d)) out.push([x, z]);
    }
    return out;
  };
  const mx = new T.Matrix4(), qt = new T.Quaternion(), eu = new T.Euler(), V = new T.Vector3(), Sc = new T.Vector3(), cl = new T.Color();
  const tufts = spots(2600, (_x, _z, d) => d > 3.2 || rnd() < .15), nb = tufts.length * 3, gSlot = new Uint8Array(nb), gLit = new Float32Array(nb);
  const grass = new T.InstancedMesh(new T.ConeGeometry(.075, .62, 3).translate(0, .3, 0), new T.MeshLambertMaterial(), nb);
  tufts.forEach(([x, z], i) => {
    const s = .6 + rnd() * .7, slot = Math.floor(rnd() * 4);
    for (let b = 0; b < 3; b++) {
      const a = b * 2.1 + rnd(), r = .12 * s;
      V.set(x + Math.cos(a) * r, hf(x, z) - .03, z + Math.sin(a) * r); qt.setFromEuler(eu.set(Math.sin(a) * .35, rnd() * 3, -Math.cos(a) * .35)); Sc.set(s, s * (.8 + rnd() * .6), s);
      grass.setMatrixAt(i * 3 + b, mx.compose(V, qt, Sc)); grass.setColorAt(i * 3 + b, cl); gSlot[i * 3 + b] = slot; gLit[i * 3 + b] = (rnd() - .5) * .06;
    }
  });
  const paintGrass = (pal: number[], out = new Float32Array(nb * 3)) => {
    for (let i = 0; i < nb; i++) { cl.set(pal[gSlot[i]]).offsetHSL(0, 0, gLit[i]); out[i * 3] = cl.r; out[i * 3 + 1] = cl.g; out[i * 3 + 2] = cl.b; }
    return out;
  };
  (grass.instanceColor as T.InstancedBufferAttribute).copyArray(paintGrass(SUMMER_GRASS));
  grass.receiveShadow = true; S.add(grass);
  const flowerC = [0xffffff, 0xfff3c4, 0xffd23f, 0xb48ae6, 0xf28cb8], blooms = spots(900, (x, z, d) => d > 3.6 && Math.sin(x * .05) * Math.cos(z * .04) > -.2);
  const flowers = new T.InstancedMesh(new T.IcosahedronGeometry(.11, 0), new T.MeshLambertMaterial(), blooms.length);
  blooms.forEach(([x, z], i) => {
    flowers.setMatrixAt(i, mx.compose(V.set(x, hf(x, z) + .28 + rnd() * .2, z), qt.identity(), Sc.setScalar(.8 + rnd() * .7)));
    flowers.setColorAt(i, cl.set(flowerC[Math.floor(rnd() * flowerC.length)]));
  });
  S.add(flowers);
  // mountains: jittered low-poly peaks, snow on the upper faces; haze is baked into the colours (they skip the fog)
  const hash = (a: number) => { const s = Math.sin(a) * 43758.5453; return s - Math.floor(s); };
  const mtnGeo = (seed: number, hz: number) => {
    const g = new T.ConeGeometry(55, 90, 11, 6).toNonIndexed(), p = g.attributes.position, haze = new T.Color(HAZE);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = (y + 45) / 90, k = hash(x * .37 + y * 1.13 + z * .71 + seed);
      if (t > .01 && t < .99) { const f = 1 + (k - .5) * .34; p.setXYZ(i, x * f, y + (hash(k * 91 + seed) - .5) * 7, z * f); }
    }
    const col = new Float32Array(p.count * 3), rock = [new T.Color(0x5a6577), new T.Color(0x6b768a), new T.Color(0x7c8598)], foot = new T.Color(0x6d7a5a), c = new T.Color();
    for (let i = 0; i < p.count; i += 3) {
      const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, t = (y + 45) / 90, k = hash(i * 1.7 + seed);
      if (t > .66 + (k - .5) * .14) c.set(0xf6f9fc).offsetHSL(0, 0, -k * .05);
      else c.copy(rock[Math.floor(k * 3)]).lerp(foot, 1 - sm(.05, .3, t));
      c.lerp(haze, hz);
      for (let q = 0; q < 3; q++) col.set([c.r, c.g, c.b], (i + q) * 3);
    }
    g.setAttribute("color", new T.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
  };
  // mtnM: shared by all peaks; the engine pushes it toward the haze in build mode
  const mtnM = new T.MeshLambertMaterial({ vertexColors: true, fog: false });
  const mGeo = [.58, .46].map(hz => [1, 2, 3].map(s => mtnGeo(s * 17.3, hz)));
  const mtn = (x: number, z: number, y: number, s: number, far: number) => {
    const m = new T.Mesh(mGeo[far][Math.floor(rnd() * 3)], mtnM); m.scale.set(s * (.9 + rnd() * .3), s, s * (.9 + rnd() * .3)); m.rotation.y = rnd() * 6;
    at(m, x, z, y + 45 * s);
  };
  for (let k = 0; k < 13; k++) mtn(-300 + k * 50, -440 - rnd() * 30, 0, .48 + rnd() * .32, 0);
  // side peaks, except where one would loom behind the build ger in the build camera's view
  const behindBuild = (x: number, z: number) => { const dx = x - BX, dz = z - BZ; return -(dx * Math.sin(BAZ) + dz * Math.cos(BAZ)) > .5 * Math.hypot(dx, dz); };
  for (let k = 0; k < 6; k++) {
    const z = -60 - k * 55, s = side(), x = px(z) + s * (190 + rnd() * 30);
    if (!behindBuild(x, z)) mtn(x, z, hf(px(z) + s * 200, z) - 6, .42 + rnd() * .3, 1);
  }
  // clouds: clusters of faceted puffs, lit from above with a soft blue underside
  const gCl = new T.IcosahedronGeometry(5, 1), mCl = new T.MeshLambertMaterial({ color: 0xffffff, emissive: 0x4a5868 });
  for (let k = 0; k < 18; k++) {
    const g = new T.Group(), n = 4 + Math.floor(rnd() * 3);
    for (let q = 0; q < n; q++) {
      const m = new T.Mesh(gCl, mCl), s = .6 + rnd() * .6 + (q > 0 && q < n - 1 ? .35 : 0);
      m.position.set((q - (n - 1) / 2) * 5.2, (rnd() - .3) * 2.5 + s * 1.5, (rnd() - .5) * 4); m.scale.set(1.25 * s, .7 * s, s); g.add(m);
    }
    at(g, (rnd() - .5) * 400, -rnd() * 380 + 40, 45 + rnd() * 25);
  }

  // hero ger (full Mongol ger on the cover) + a second ger at the build site
  const mkGer = (x: number, z: number) => {
    const o = buildGer(), h = new T.Group(); h.add(o); h.scale.setScalar(HK); h.position.set(x, hf(x, z) + .2, z); S.add(h);
    shade(o); (o.userData as GerData).G.Sh.traverse(m => { m.castShadow = m.receiveShadow = false; }); return h;
  };
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
    shade(ped); shade(ring); shade(o);
    ST[j] = { ring, pivot, hold, o, k, q, spin: 0, pulse: 0 };
  }
  // camera path (cC) and look-at path (lC) through the stations
  const cp = [new T.Vector3(px(14), 5, 14)], lp = [new T.Vector3(px(-10), 2.6, -10)];
  for (let j = 1; j <= N; j++) { const z = -j * ZS; cp.push(new T.Vector3(px(z), 4.0, z + 10)); lp.push(new T.Vector3(px(z), 3.0, z)); }
  const cC = new T.CatmullRomCurve3(cp), lC = new T.CatmullRomCurve3(lp);

  // what the seasons repaint
  const look = { sky: sky.material as T.ShaderMaterial, ground: gg.attributes.color as T.BufferAttribute, paintGround, grass, paintGrass, flowers, pines: pal, rocks: [mR, mR2], clouds: mCl };
  return { sky, mtnM, look, animals, heroGer, heroO, heroD: heroO.userData as GerData, bGer, bO, bD: bO.userData as GerData, bRing, ST, hits, cC, lC };
}
