import { T, PI, aniso, cvs2, ms, tx } from "../util";
import { BLUE, OFFW, edgeTex, fabTex, feltTex, ropeTex, spiralTex, topTex, weave } from "../textures";

// soft folded cloth: pillowy rounded edges, wrinkles on top, rippling selvedges
const cloth = (w: number, h: number, d: number, mats: T.Material[], sx: number, sy: number, sz: number, seed: number, amp: number) => {
  const geo = new T.BoxGeometry(w, h, d, sx, sy, sz), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const nx = x / (w / 2), nz = z / (d / 2), ny = y / (h / 2), e = Math.max(Math.abs(nx), Math.abs(nz));
    y *= 1 - .32 * Math.pow(e, 5); x *= 1 - .05 * Math.pow(Math.abs(nz), 4); z *= 1 - .05 * Math.pow(Math.abs(nx), 4);
    if (ny > 0) y += amp * (Math.sin(x * 3.4 + seed) * Math.cos(z * 2.7 + seed * 1.7) + .5 * Math.sin(z * 7.3 + x * 1.9 + seed)) * (1 - .5 * e);
    if (Math.abs(nz) > .96) z += Math.sign(nz) * amp * .8 * Math.sin(x * 8 + y * 5 + seed);
    if (Math.abs(nx) > .96) x += Math.sign(nx) * amp * .8 * Math.sin(z * 8 + y * 5 + seed);
    p.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return new T.Mesh(geo, mats);
};

// бүрээс station model: folded off-white cover with blue trim on a rolled felt bundle tied with rope + a coil of rope
export const buildCover = () => {
  const g = new T.Group(), L = (c: T.MeshLambertMaterialParameters) => new T.MeshLambertMaterial(c);
  const edM = L({ map: edgeTex() }), wM = L({ map: fabTex(3, 2) }), topM = L({ map: topTex() }), feltM = L({ map: feltTex(5, 3) }),
    endM = L({ map: spiralTex() }), rpM = L({ map: tx("rope", ropeTex), color: 0x4a3324 });
  const roll = new T.Mesh(new T.CylinderGeometry(.62, .62, 3.5, 32, 1).rotateZ(PI / 2), [feltM, endM, endM]);
  roll.scale.set(1, .6, 2); roll.position.y = .372; g.add(roll);
  [-1.05, 1.05].forEach(x => {
    const r = new T.Mesh(new T.TorusGeometry(.635, .035, 6, 36).rotateY(PI / 2), rpM);
    r.scale.set(1, .6, 2); r.position.set(x, .372, 0); g.add(r);
    ms(new T.SphereGeometry(.07, 8, 6), 0x4a3324, g, x, .5, 1.2);
  });
  const s1 = cloth(3.0, .46, 1.9, [edM, edM, wM, wM, edM, edM], 22, 3, 14, .7, .03); s1.position.set(.06, .91, 0); s1.rotation.y = .03; g.add(s1);
  const s2 = cloth(2.8, .6, 1.8, [edM, edM, topM, wM, edM, edM], 26, 3, 16, 2.1, .035); s2.position.set(.04, 1.43, 0); s2.rotation.y = -.04; g.add(s2);
  // loose cloth draped over the front edge, with a blue border at its free end
  const dr = new T.PlaneGeometry(1.1, 1, 14, 18), q = dr.attributes.position, a = .75, rr = .1, arc = Math.PI / 2 * rr, top = .3 + .03, zE = .9 + .04;
  for (let i = 0; i < q.count; i++) {
    const u = q.getX(i), sS = (q.getY(i) + .5) * 1.5;
    let y: number, z: number;
    if (sS <= a) { z = zE - a + sS; y = top + .012 * Math.sin(u * 12 + sS * 5); }
    else if (sS <= a + arc) { const an = (sS - a) / rr; z = zE + rr * Math.sin(an); y = top - rr + rr * Math.cos(an); }
    else { const t = sS - a - arc; z = zE + rr + .035 * Math.sin(u * 14 + t * 3) * Math.min(1, t / .3); y = top - rr - t; }
    q.setXYZ(i, u + .32, y, z);
  }
  dr.computeVertexNormals();
  const dt = aniso(new T.CanvasTexture(cvs2(64, 256, (x, w, h) => {
    x.fillStyle = OFFW; x.fillRect(0, 0, w, h); x.fillStyle = BLUE; x.fillRect(0, 18, w, 30); x.fillRect(0, 60, w, 10); weave(x, w, h, .09, 3);
  })));
  s2.add(new T.Mesh(dr, L({ map: dt, side: T.DoubleSide })));
  // coil of rope
  const coil = new T.Group();
  [[.4, .07, 0], [.37, .2, .03], [.4, .33, -.02]].forEach(([r, y, o]) => {
    const geo = new T.TorusGeometry(r, .068, 6, 26).rotateX(PI / 2), uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 14);
    const m = new T.Mesh(geo, rpM); m.position.set(o, y, o); coil.add(m);
  });
  const end = new T.Mesh(new T.CylinderGeometry(.06, .06, .6, 6).rotateZ(PI / 2), rpM);
  end.position.set(-.55, .07, .3); end.rotation.y = .5; coil.add(end);
  coil.position.set(1.15, 0, 1.72); g.add(coil);
  return g;
};
