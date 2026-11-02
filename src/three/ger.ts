import { T, PI, lerp, sm, ms, tx } from "./util";
import { OFFW, clothM, fabTex, feltTex, ropeTex, weave } from "./textures";
import { plankFloor } from "./parts/floor";
import { wallLat } from "./parts/wall";
import { buildBagana } from "./parts/bagana";
import { buildToono } from "./parts/toono";

// surface grid: f(u 0..1, row) -> [x,y,z,u,v,shade]; closed=true welds the normals across the seam
type GridPt = [number, number, number, number, number, number?];
const grid = (nu: number, rows: number, f: (u: number, j: number) => GridPt, closed?: boolean) => {
  const P: number[] = [], U: number[] = [], C: number[] = [], I: number[] = [], w = nu + 1;
  for (let j = 0; j < rows; j++) for (let i = 0; i <= nu; i++) {
    const q = f(i / nu, j), c = q[5] === undefined ? 1 : q[5];
    P.push(q[0], q[1], q[2]); U.push(q[3], q[4]); C.push(c, c, c);
  }
  for (let j = 0; j < rows - 1; j++) for (let i = 0; i < nu; i++) { const a = j * w + i; I.push(a, a + w, a + 1, a + 1, a + w, a + w + 1); }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new T.Float32BufferAttribute(U, 2));
  g.setAttribute("color", new T.Float32BufferAttribute(C, 3)); g.setIndex(I); g.computeVertexNormals();
  if (closed) {
    const n = g.attributes.normal;
    for (let j = 0; j < rows; j++) {
      const a = j * w, b = a + nu, x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), l = Math.hypot(x, y, z) || 1;
      n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l);
    }
  }
  return g;
};

const BELT = [.3, .65, .95], DH = .47; // outer belt heights · half width of the doorway
// wall cloth: pinched in under each belt, bulging between, irregular vertical folds. k = fold strength (1 cover, .5 felt), off = radial inset
const wallPt = (a: number, y: number, k: number, off: number): [number, number, number] => {
  let pin = 0;
  BELT.forEach(b => { const d = (y - b) / .055; pin += Math.exp(-d * d); });
  pin = Math.min(1, pin);
  const fold = (.011 * Math.sin(13 * a + 1.3) * Math.sin(3.1 * a + .4) + .007 * Math.sin(29 * a + 2.1 * Math.sin(5 * a)) + .004 * Math.sin(47 * a + y * 3 + 1)) * (1 - .75 * pin) * (1.15 - .5 * y / 1.15);
  return [2.1 - .1 * y / 1.15 + off + k * (.014 - .036 * pin + fold), pin, fold];
};
// flap: the end of the wrap overlaps the cloth beside the door (overlap seam); head: the strip above the lintel
const wallGeo = (k: number, off: number, flap?: number, head?: number) => grid(head ? 10 : 150, head ? 5 : 27, (u, j) => {
  const y = head ? .96 + .19 * j / 4 : 1.15 * j / 26, ph = Math.asin(DH / (2.1 - .1 * y / 1.15)),
    a = head ? PI / 2 - ph + u * 2 * ph : PI / 2 + ph + u * (2 * PI - 2 * ph);
  let [r, pin, fold] = wallPt(a, y, k, off), c = 1 - .1 * pin + fold * 3;
  if (flap) { const d = a - PI / 2 - ph; if (d < .42) r += .012; else c -= .22 * Math.max(0, 1 - (d - .42) / .09); }
  return [Math.cos(a) * r, y, Math.sin(a) * r, a / (2 * PI) * 4, y / 1.15, c];
});
// roof cloth: slightly convex, faint ridges over the 20 унь with sag between, hem hanging over the wall as a short wavy skirt
const RN = [.376, .926], ridge = (a: number) => Math.pow(.5 + .5 * Math.cos(20 * a), 4) * .02;
const roofPt = (a: number, t: number, off: number) => {
  const d = .055 * Math.sin(PI * t) + (1 - .8 * t) * (ridge(a) - .007) + .004 * Math.sin(7 * a + t * 15) * Math.sin(11 * t + a * 3) + off;
  return [2.15 - 1.6 * t + RN[0] * d, 1.15 + .65 * t + RN[1] * d];
};
const roofY = (r: number, a: number) => roofPt(a, Math.min(1, Math.max(0, (2.15 - r) / 1.6)), 0)[1];
const roofGeo = (felt: number) => {
  const R: [number, number][] = (felt ? [1, .5] : [1, .7, .4, .12]).map(s => [s, 0]);
  for (let i = 0; i <= 16; i++) R.push([0, i ? i / 16 : .012]);
  return grid(160, R.length, (u, j) => {
    const a = u * 2 * PI, s = R[j][0], tt = R[j][1];
    let r: number, y: number, v: number, c: number;
    if (s > 0) {
      const e = roofPt(a, 0, felt ? -.03 : 0), wv = felt ? 0 : .012 * Math.sin(31 * a + 1.1 * Math.sin(4 * a)) + .008 * Math.sin(17 * a + 2),
        len = felt ? .04 : .13 + .012 * Math.sin(9 * a + .5) + .008 * Math.sin(23 * a + 2);
      r = e[0] + ((felt ? 2.09 : 2.075) - e[0]) * Math.pow(s, .8) + wv * s; y = e[1] - len * s; v = .09 * (1 - s); c = 1 - .1 * s;
    } else {
      const q = roofPt(a, tt, felt ? -.03 * (1 - .6 * tt * tt * tt) : 0);
      r = q[0]; y = q[1]; v = .09 + .91 * tt; c = .96 + 2.2 * (1 - .8 * tt) * ridge(a);
    }
    return [Math.cos(a) * r, y, Math.sin(a) * r, u * 4, v, c];
  }, true);
};
// өрх: square flap over the toono, front corner folded back
const urkhGeo = () => grid(14, 15, (u, j) => {
  const p = u * 2 - 1, q = j / 7 - 1, X = (p - q) * .438;
  let Z = (p + q) * .438, up = 0;
  if (Z > .1) { up = .022 * Math.min(1, (Z - .1) / .05); Z = .2 - Z; }
  const r = Math.hypot(X, Z), w = 1 - sm(.5, .74, r);
  return [X, roofY(Math.max(r, .55), Math.atan2(Z, X)) + .02 + .08 * w + up + .005 * Math.sin(X * 9 + 1) * Math.sin(Z * 7), Z, u, j / 14, up ? .92 : 1];
});
const tube = (pts: number[][], r: number, mat: T.Material, g: T.Object3D) => {
  const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p => new T.Vector3(p[0], p[1], p[2]))), pts.length * 3, r, 5), mat);
  g.add(m); return m;
};
// twisted rope around the wall from one door post to the other (y, radius R, thickness tr); knot + loose end beside the door
const rope = (Q: T.Object3D, R: number, y: number, tr: number, col: number, tail?: number) => {
  const ph = Math.asin(DH / R), geo = new T.TorusGeometry(R, tr, 6, 120, 2 * PI - 2 * ph).rotateX(PI / 2).rotateY(-PI / 2 - ph), uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * R * 75);
  const mat = new T.MeshLambertMaterial({ map: tx("rope", ropeTex), color: col }), m = new T.Mesh(geo, mat);
  m.position.y = y; Q.add(m);
  [-1, 1].forEach(s => {
    const k = new T.Mesh(new T.IcosahedronGeometry(tr * 2.1, 0), mat);
    k.position.set(s * DH, y, R * Math.cos(ph)); k.scale.set(1, 1.2, 1); Q.add(k);
    if (tail && s > 0) {
      const e = new T.Mesh(new T.CylinderGeometry(tr * .7, tr * .5, .15, 5), mat);
      e.position.set(s * DH + .012, y - .09, R * Math.cos(ph) + .008); e.rotation.z = .12; Q.add(e);
    }
  });
};

export const GER_GROUPS = ["Sh", "F", "W", "Dr", "Rf", "Tn", "Pp", "Lat", "IB", "Cl", "Un", "FW", "FR", "Bs"] as const;
export type GerGroup = typeof GER_GROUPS[number];
export interface GerData {
  ex: [T.Object3D, number, number, number][]; // exploded view offsets
  fade: T.Object3D[]; // cloth layers that fade in
  G: Record<GerGroup, T.Group>;
}

// гэр: the full Mongol ger, split into groups so it can explode (hero) or be built step by step (build site)
export const buildGer = () => {
  const g = new T.Group(), G = {} as Record<GerGroup, T.Group>;
  GER_GROUPS.forEach(k => { G[k] = new T.Group(); g.add(G[k]); });
  const cvs = (w: number, h: number, f: (x: CanvasRenderingContext2D, w: number, h: number) => void) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d")!, w, h); return c;
  };
  const tex = (c: HTMLCanvasElement, rx?: number, ry?: number) => {
    const q = new T.CanvasTexture(c); q.wrapS = q.wrapT = T.RepeatWrapping; q.repeat.set(rx || 1, ry || 1); return q;
  };
  const key = cvs(256, 32, (x, w, h) => {
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.fillStyle = "#2a2f8f"; x.fillRect(0, 0, w, 4); x.fillRect(0, h - 4, w, 4); x.strokeStyle = "#2a2f8f"; x.lineWidth = 3;
    for (let i = 0; i < w; i += 32) { x.beginPath(); x.moveTo(i + 4, 26); x.lineTo(i + 4, 8); x.lineTo(i + 24, 8); x.lineTo(i + 24, 22); x.lineTo(i + 12, 22); x.lineTo(i + 12, 15); x.stroke(); }
  });
  const keyV = cvs(32, 256, x => { x.translate(32, 0); x.rotate(PI / 2); x.drawImage(key, 0, 0); });
  const r = (y: number) => 2.1 - .1 * y / 1.15;
  // soft blob shadow on the ground
  {
    const m = new T.Mesh(new T.PlaneGeometry(6.6, 6.6).rotateX(-PI / 2), new T.MeshBasicMaterial({
      map: tx("sh", () => new T.CanvasTexture(cvs(128, 128, (x, w) => {
        const q = x.createRadialGradient(64, 64, 8, 64, 64, 64);
        q.addColorStop(0, "rgba(25,35,20,.5)"); q.addColorStop(.62, "rgba(25,35,20,.4)"); q.addColorStop(1, "rgba(25,35,20,0)");
        x.fillStyle = q; x.fillRect(0, 0, w, w);
      }))), transparent: true, depthWrite: false,
    }));
    m.position.y = -.072; G.Sh.add(m);
  }
  // floor planks
  G.F.add(plankFloor(2.1, false));
  // lattice wall, open at the doorway
  wallLat(G.Lat, 1.9, 1.1, 28, false, [5.91, 8.09]);
  // inner belt (дотуур бүслүүр): two ropes at the lattice radius
  [.38, .78].forEach(y => rope(G.IB, 1.955, y, .014, 0x8a5632));
  // columns: stand on the floor and carry the toono
  [-.55, .55].forEach(x => { const c = buildBagana(); c.scale.set(.36, .4375, .36); c.position.set(x, .875, 0); G.Cl.add(c); });
  // uni poles: thin end in the toono ring, other end on the wall heads
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * PI * 2, A = new T.Vector3(Math.cos(a) * .53, 1.755, Math.sin(a) * .53), Bp = new T.Vector3(Math.cos(a) * 1.94, 1.1, Math.sin(a) * 1.94), L = A.distanceTo(Bp);
    const m = ms(new T.CylinderGeometry(.035, .035, L, 5).rotateX(PI / 2), 0xe8661a, G.Un, (A.x + Bp.x) / 2, (A.y + Bp.y) / 2, (A.z + Bp.z) / 2);
    m.lookAt(Bp);
  }
  // toono wheel
  const tn = buildToono(); tn.scale.setScalar(.34); tn.position.y = 1.8; G.Tn.add(tn);
  // felt layer (туурга): wall + roof, just inside the cover
  const fT = tx("felt", () => feltTex(9, 3)), fM = new T.MeshStandardMaterial({ map: fT, bumpMap: fT, bumpScale: .012, roughness: 1, metalness: 0, side: T.DoubleSide, vertexColors: true });
  G.FW.add(new T.Mesh(wallGeo(.5, -.03), fM), new T.Mesh(wallGeo(.5, -.03, 0, 1), fM)); G.FR.add(new T.Mesh(roofGeo(1), fM));
  // cover (бүрээс): wall cloth + bottom skirt (хаяавч)
  const wM = clothM(false), rM = clothM(true);
  G.W.add(new T.Mesh(wallGeo(1, 0, 1), wM), new T.Mesh(wallGeo(1, 0, 0, 1), wM));
  G.W.add(new T.Mesh(grid(120, 4, (u, j) => {
    const ph = Math.asin(DH / 2.16), a = PI / 2 + ph + u * (2 * PI - 2 * ph), rr = [2.2, 2.18, 2.165, 2.15][j] + .006 * Math.sin(23 * a + j) + (j == 3 ? .004 * Math.sin(41 * a) : 0);
    return [Math.cos(a) * rr, [-.085, -.01, .07, .15][j] + (j == 3 ? .012 * Math.sin(15 * a + 1.3 * Math.sin(3 * a)) : 0), Math.sin(a) * rr, a * 4.2, j / 3, j == 3 ? .86 : 1];
  }), new T.MeshStandardMaterial({ map: tx("hem", () => fabTex(1, 1, "#8a8253")), roughness: .95, metalness: 0, side: T.DoubleSide, vertexColors: true })));
  // roof cloth, өрх and its ropes
  G.Rf.add(new T.Mesh(roofGeo(0), rM));
  G.Rf.add(new T.Mesh(urkhGeo(), new T.MeshStandardMaterial({
    map: tx("urkh", () => new T.CanvasTexture(cvs(128, 128, (x, w, h) => {
      x.fillStyle = OFFW; x.fillRect(0, 0, w, h); weave(x, w, h, .08, 3);
      x.strokeStyle = "#2a2f8f"; x.lineWidth = 9; x.strokeRect(6, 6, w - 12, h - 12); x.lineWidth = 2; x.strokeRect(17, 17, w - 34, h - 34);
    }))), roughness: .95, metalness: 0, side: T.DoubleSide, vertexColors: true,
  })));
  const rpM = new T.MeshLambertMaterial({ color: 0x3b2a20 });
  [[0, .86, 0], [PI, .86, PI], [-PI / 2, .86, -PI / 2], [-PI / 2, .64, -PI / 2 + .55]].forEach(([a0, r0, a1], n) => {
    const P: number[][] = [];
    for (let i = 0; i <= 8; i++) { const f = i / 8, a = lerp(a0, a1, f), rr = lerp(r0, 2.14, f); P.push([Math.cos(a) * rr, roofY(rr, a) + (n == 3 && i < 2 ? .05 : .022), Math.sin(a) * rr]); }
    [[2.16, 1.13], [2.125, 1.07], [2.1, 1.02], [2.05, .955]].forEach(([rr, y]) => P.push([Math.cos(a1) * rr, y, Math.sin(a1) * rr]));
    tube(P, .009, rpM, G.Rf);
  });
  const kt = cvs(128, 128, x => {
    x.strokeStyle = "#2a2f8f"; x.lineWidth = 9; x.translate(64, 64); x.rotate(PI / 4); x.strokeRect(-34, -34, 68, 68); x.lineWidth = 7; x.strokeRect(-18, -18, 36, 36);
    x.beginPath(); x.moveTo(-48, 0); x.lineTo(48, 0); x.moveTo(0, -48); x.lineTo(0, 48); x.stroke();
  });
  [[1.22, .36], [1.72, .46]].forEach(([p, sz]) => {
    const m = new T.Mesh(new T.PlaneGeometry(sz, sz), new T.MeshLambertMaterial({ map: tex(kt), transparent: true, alphaTest: .4, side: T.DoubleSide }));
    m.rotation.x = -(PI / 2 - .386); m.position.set(0, roofY(p, PI / 2) + .024, p + .009); G.Rf.add(m);
  });
  // outer belts (гадуур бүслүүр): three twisted horsehair ropes, knotted beside the door
  BELT.forEach(y => rope(G.Bs, r(y) + .002, y, .02, 0x4a352a, 1));
  // door: real frame with thickness (posts, lintel, threshold) + painted leaf
  const wd = new T.MeshLambertMaterial({ color: 0xb5461c });
  const fr = (w: number, h: number, d: number, x: number, y: number, z: number, ft?: T.Texture) => {
    const f = ft ? new T.MeshLambertMaterial({ map: ft }) : wd, m = new T.Mesh(new T.BoxGeometry(w, h, d), [wd, wd, wd, wd, f, ft && d < .1 ? f : wd]);
    m.position.set(x, y, z); G.Dr.add(m);
  };
  [-1, 1].forEach(s => fr(.12, .88, .21, s * .4, .44, 1.945, tex(keyV)));
  fr(.92, .12, .21, 0, .94, 1.945, tex(key)); fr(.68, .04, .21, 0, .02, 1.945);
  const dt = cvs(256, 400, (x, w, h) => {
    x.fillStyle = "#d9531e"; x.fillRect(0, 0, w, h); x.strokeStyle = "#f2c35b"; x.lineWidth = 4; x.strokeRect(8, 8, w - 16, h - 16);
    [[24, 24, 208, 44], [24, 86, 60, 230], [98, 86, 60, 230], [172, 86, 60, 230], [24, 334, 208, 44]].forEach(a => x.strokeRect(a[0], a[1], a[2], a[3]));
    const cl = ["#e86a9a", "#2f7bd6", "#35a853", "#f2c35b"];
    for (let i = 0; i < 7; i++) {
      x.fillStyle = cl[i % 4]; x.beginPath(); x.arc(40 + i * 29, 46, 8, 0, 7); x.fill(); x.beginPath(); x.arc(40 + i * 29, 356, 8, 0, 7); x.fill();
    }
    [54, 128, 202].forEach((cx, k) => { for (let j = 0; j < 6; j++) { x.fillStyle = cl[(j + k) % 4]; x.beginPath(); x.arc(cx, 112 + j * 38, 9, 0, 7); x.fill(); } });
  });
  fr(.68, .84, .05, 0, .46, 1.99, tex(dt));
  // exploded view offsets (hero ger): the stack opens upward from the floor
  const data: GerData = {
    ex: [[G.F, 0, 0, 0], [G.Lat, 0, .65, 0], [G.IB, 0, .65, 0], [G.FW, 0, 1.25, 0], [G.W, 0, 1.8, 0], [G.Bs, 0, 1.8, 0], [G.Dr, 0, 1, 2.1], [G.Cl, 0, 1.1, 0], [G.Un, 0, 2.1, 0], [G.FR, 0, 2.6, 0], [G.Rf, 0, 3.1, 0], [G.Tn, 0, 3.8, 0]],
    fade: [G.FW, G.FR, G.W, G.Rf], G,
  };
  g.userData = data;
  return g;
};
