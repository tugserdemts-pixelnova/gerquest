import { T, PI, aniso, cvs2, tx } from "./util";

// ── batching: many small pieces, one mesh and one draw call. Each piece keeps its own colour ──
const mergeGeos = (list: T.BufferGeometry[]) => {
  let n = 0;
  list.forEach(g => { n += g.attributes.position.count; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3);
  let o = 0;
  list.forEach(g => {
    pos.set(g.attributes.position.array as Float32Array, o * 3); nor.set(g.attributes.normal.array as Float32Array, o * 3);
    uv.set(g.attributes.uv.array as Float32Array, o * 2); col.set(g.attributes.color.array as Float32Array, o * 3);
    o += g.attributes.position.count; g.dispose();
  });
  const m = new T.BufferGeometry();
  m.setAttribute("position", new T.BufferAttribute(pos, 3)); m.setAttribute("normal", new T.BufferAttribute(nor, 3));
  m.setAttribute("uv", new T.BufferAttribute(uv, 2)); m.setAttribute("color", new T.BufferAttribute(col, 3));
  return m;
};

const E = new T.Euler(), Q = new T.Quaternion(), P = new T.Vector3(), SC = new T.Vector3();
export const place = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) =>
  new T.Matrix4().compose(P.set(x, y, z), Q.setFromEuler(E.set(rx, ry, rz)), SC.set(sx, sy, sz));

export class Batch {
  private list: T.BufferGeometry[] = [];
  add(geo: T.BufferGeometry, c: number, m?: T.Matrix4) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (m) g.applyMatrix4(m);
    const col = new Float32Array(g.attributes.position.count * 3), k = new T.Color(c);
    for (let i = 0; i < col.length; i += 3) { col[i] = k.r; col[i + 1] = k.g; col[i + 2] = k.b; }
    g.setAttribute("color", new T.BufferAttribute(col, 3));
    this.list.push(g);
    return this;
  }
  box(w: number, h: number, d: number, c: number, x: number, y: number, z: number, ry = 0, rx = 0, rz = 0) {
    return this.add(new T.BoxGeometry(w, h, d), c, place(x, y, z, rx, ry, rz));
  }
  cyl(rt: number, rb: number, h: number, c: number, x: number, y: number, z: number, seg = 10, rx = 0, rz = 0) {
    return this.add(new T.CylinderGeometry(rt, rb, h, seg), c, place(x, y, z, rx, 0, rz));
  }
  ball(r: number, c: number, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) {
    return this.add(new T.SphereGeometry(r, 10, 8), c, place(x, y, z, 0, 0, 0, sx, sy, sz));
  }
  // a finer sphere, for anything large enough to show its facets
  orb(r: number, c: number, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) {
    return this.add(new T.SphereGeometry(r, 22, 16), c, place(x, y, z, 0, 0, 0, sx, sy, sz));
  }
  torus(r: number, t: number, c: number, x: number, y: number, z: number, rx = PI / 2, ry = 0, arc = PI * 2) {
    return this.add(new T.TorusGeometry(r, t, 6, 24, arc), c, place(x, y, z, rx, ry));
  }
  // a turned shape: profile = [radius, height] pairs from bottom to top
  lathe(profile: [number, number][], c: number, x: number, y: number, z: number, seg = 24) {
    const pts = new T.SplineCurve(profile.map(([r, h]) => new T.Vector2(r, h))).getPoints(profile.length * 5).map(p => new T.Vector2(Math.max(.001, p.x), p.y));
    return this.add(new T.LatheGeometry(pts, seg), c, place(x, y, z));
  }
  // a beam between two points. w across, d deep; `up` keeps the flat side facing a chosen way
  beam(A: T.Vector3, B: T.Vector3, w: number, d: number, c: number, up?: T.Vector3) {
    const L = A.distanceTo(B), m = new T.Matrix4().lookAt(A, B, up || new T.Vector3(0, 1, 0));
    m.setPosition(A.clone().lerp(B, .5));
    return this.add(new T.BoxGeometry(w, d, L), c, m);
  }
  raw(geo: T.BufferGeometry) { this.list.push(geo); return this; }
  geo() { return mergeGeos(this.list); }
  mesh(mat: T.Material) { return new T.Mesh(this.geo(), mat); }
}

export const paintM = (map?: T.Texture, double?: boolean) =>
  new T.MeshLambertMaterial({ map: map || null, vertexColors: true, side: double ? T.DoubleSide : T.FrontSide });

// ── palette and ornaments: the painted wood of Mongolian furniture ──
export const ORANGE = "#d8571c", DEEP = "#a83a14", GOLD = "#f2c35b", NAVY = "#23419e", GREEN = "#2f8f63", ROSE = "#c9344a", CREAM = "#f6ecd6";
type Ctx = CanvasRenderingContext2D;

// painted wood: flat colour with faint brush grain and worn edges
export const paintBase = (x: Ctx, w: number, h: number, col: string) => {
  x.fillStyle = col; x.fillRect(0, 0, w, h);
  for (let i = 0; i < w * h / 500; i++) {
    x.fillStyle = i % 2 ? "rgba(255,225,180,.05)" : "rgba(70,25,5,.06)";
    x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 8 + Math.random() * 40);
  }
};

// өлзий: the endless knot
export const ulzii = (x: Ctx, cx: number, cy: number, s: number, col: string) => {
  const a = s * .26, r = a / 2;
  x.save(); x.translate(cx, cy); x.rotate(PI / 4); x.strokeStyle = col; x.lineWidth = s * .085; x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath();
  [-a, 0, a].forEach(k => { x.moveTo(-a, k); x.lineTo(a, k); x.moveTo(k, -a); x.lineTo(k, a); });
  x.stroke();
  [[-a, -r, PI / 2, PI * 1.5], [a, r, -PI / 2, PI / 2]].forEach(([cxx, cyy, s0, s1]) => { x.beginPath(); x.arc(cxx, cyy, r, s0, s1); x.stroke(); });
  [[-r, -a, PI, 0], [r, a, 0, PI]].forEach(([cxx, cyy, s0, s1]) => { x.beginPath(); x.arc(cxx, cyy, r, s0, s1); x.stroke(); });
  [[a + r * .6, -a - r * .6], [-a - r * .6, a + r * .6]].forEach(([cxx, cyy]) => { x.beginPath(); x.arc(cxx, cyy, r * 1.05, 0, PI * 2); x.stroke(); });
  x.restore();
};

// үүлэн хээ: a cloud scroll
export const cloud = (x: Ctx, cx: number, cy: number, s: number, col: string, flip = 1) => {
  x.save(); x.translate(cx, cy); x.scale(flip, 1); x.strokeStyle = col; x.lineWidth = s * .13; x.lineCap = "round";
  x.beginPath();
  for (let a = 0; a < 9.5; a += .25) { const r = s * .05 + a * s * .035; x[a ? "lineTo" : "moveTo"](Math.cos(a) * r - s * .12, Math.sin(a) * r); }
  x.stroke();
  x.beginPath(); x.arc(s * .3, s * .08, s * .2, PI, PI * 2.3); x.stroke();
  x.restore();
};

// бадам: a lotus, seen from the side
export const lotus = (x: Ctx, cx: number, cy: number, s: number, c1: string, c2: string) => {
  x.save(); x.translate(cx, cy);
  [-2, -1, 1, 2, 0].forEach(i => {
    x.save(); x.rotate(i * .42); x.fillStyle = i % 2 ? c2 : c1;
    x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-s * .24, -s * .45, 0, -s * .86); x.quadraticCurveTo(s * .24, -s * .45, 0, 0); x.fill();
    x.restore();
  });
  x.restore();
};

// the key pattern as a running border; y0 is the top of the band
export const keyBand = (x: Ctx, y0: number, bh: number, n: number, W: number, col: string) => {
  const s = bh / 32, mw = W / n, k = mw / 32;
  x.strokeStyle = col; x.fillStyle = col; x.lineJoin = "miter"; x.lineWidth = 3.4 * Math.min(s, k);
  x.fillRect(0, y0, W, 3 * s); x.fillRect(0, y0 + bh - 3 * s, W, 3 * s);
  for (let i = 0; i < n; i++) {
    x.beginPath();
    [[4, 26], [4, 8], [24, 8], [24, 22], [12, 22], [12, 15]].forEach(([a, b], q) => x[q ? "lineTo" : "moveTo"](i * mw + a * k, y0 + b * s));
    x.stroke();
  }
};

const CT = (c: HTMLCanvasElement, rx = 1, ry = 1) => {
  const t = aniso(new T.CanvasTexture(c)); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); return t;
};

// унь: a long thin painted strip, thick end at v = 0
export const uniTex = () => tx("uniP", () => CT(cvs2(64, 512, (x, w, h) => {
  paintBase(x, w, h, ORANGE);
  // texture rows run top to bottom, and v = 0 is the bottom row, so the bands go at the bottom of the canvas
  const bands: [number, string][] = [[10, ROSE], [14, GREEN], [8, GOLD], [14, NAVY], [10, CREAM]];
  let y = h - 30;
  bands.forEach(([bh, c]) => { x.fillStyle = c; x.fillRect(0, y - bh, w, bh); y -= bh; });
  for (let i = 0; i < 6; i++) {
    const my = y - 40 - i * 62, c = [NAVY, GREEN, ROSE][i % 3];
    x.fillStyle = c; x.beginPath(); x.moveTo(w / 2, my - 22); x.lineTo(w * .84, my); x.lineTo(w / 2, my + 22); x.lineTo(w * .16, my); x.fill();
    x.fillStyle = GOLD; x.beginPath(); x.arc(w / 2, my, 6, 0, 7); x.fill();
    x.strokeStyle = GOLD; x.lineWidth = 2; x.beginPath(); x.moveTo(0, my + 31); x.lineTo(w, my + 31); x.stroke();
  }
}), 4));

// багана: a tall panel, lotus at the foot, knots and clouds rising up it
export const baganaTex = () => tx("bagP", () => CT(cvs2(128, 1024, (x, w, h) => {
  paintBase(x, w, h, ORANGE);
  x.strokeStyle = GOLD; x.lineWidth = 5; x.strokeRect(8, 8, w - 16, h - 16);
  x.lineWidth = 2; x.strokeRect(16, 16, w - 32, h - 32);
  lotus(x, w / 2, h - 30, 120, ROSE, GOLD);
  for (let i = 0; i < 5; i++) {
    const y = h - 190 - i * 168;
    x.fillStyle = i % 2 ? GREEN : NAVY; x.beginPath(); x.arc(w / 2, y, 44, 0, 7); x.fill();
    x.strokeStyle = GOLD; x.lineWidth = 3; x.beginPath(); x.arc(w / 2, y, 44, 0, 7); x.stroke();
    ulzii(x, w / 2, y, 62, GOLD);
    cloud(x, w / 2 - 26, y + 84, 40, i % 2 ? NAVY : GREEN); cloud(x, w / 2 + 26, y + 84, 40, i % 2 ? NAVY : GREEN, -1);
  }
}), 4));

// тооно: the band around the rim, with the sockets the uni poles slot into
export const toonoTex = () => tx("toonoP", () => CT(cvs2(1024, 64, (x, w, h) => {
  paintBase(x, w, h, ORANGE);
  x.fillStyle = GOLD; x.fillRect(0, 0, w, 6); x.fillRect(0, h - 6, w, 6);
  keyBand(x, 10, 26, 28, w, NAVY);
  x.fillStyle = "#3a1608";
  for (let i = 0; i < 48; i++) { x.beginPath(); x.ellipse((i + .5) * w / 48, 49, 7, 6, 0, 0, 7); x.fill(); }
})));

// хаалга: the painted leaf. Three panels, a knot in the middle, clouds and lotuses around it
export const doorTex = () => tx("doorP", () => CT(cvs2(320, 512, (x, w, h) => {
  paintBase(x, w, h, ORANGE);
  x.strokeStyle = GOLD; x.lineWidth = 6; x.strokeRect(10, 10, w - 20, h - 20); x.lineWidth = 2.5; x.strokeRect(20, 20, w - 40, h - 40);
  const panel = (px: number, py: number, pw: number, ph: number, c: string) => {
    x.fillStyle = c; x.fillRect(px, py, pw, ph); x.strokeStyle = GOLD; x.lineWidth = 3.5; x.strokeRect(px, py, pw, ph);
  };
  panel(32, 32, w - 64, 96, DEEP); panel(32, 142, w - 64, 228, NAVY); panel(32, 384, w - 64, 96, DEEP);
  ulzii(x, w / 2, 256, 150, GOLD);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([i, j]) => cloud(x, w / 2 + i * 92, 256 + j * 84, 44, CREAM, -i));
  lotus(x, w / 2, 118, 78, GOLD, ROSE);
  x.save(); x.translate(w / 2, 394); x.rotate(PI); lotus(x, 0, 0, 78, GOLD, ROSE); x.restore();
  [70, w - 70].forEach(cx => { cloud(x, cx, 80, 40, GOLD, cx < w / 2 ? 1 : -1); cloud(x, cx, 432, 40, GOLD, cx < w / 2 ? 1 : -1); });
})));

// door frame: the key pattern running up the posts and across the lintel
export const frameTex = (vertical: boolean) => tx(vertical ? "frameV" : "frameH", () => {
  const c = cvs2(256, 40, (x, w, h) => {
    x.fillStyle = CREAM; x.fillRect(0, 0, w, h); x.fillStyle = GOLD; x.fillRect(0, 0, w, 3); x.fillRect(0, h - 3, w, 3);
    keyBand(x, 5, h - 10, 8, w, NAVY);
  });
  if (!vertical) return CT(c);
  return CT(cvs2(40, 256, x => { x.translate(40, 0); x.rotate(PI / 2); x.drawImage(c, 0, 0); }));
});

// шириж оёсон эсгий: thick felt with its rows of quilted stitching
export const quiltTex = () => tx("quilt", () => CT(cvs2(512, 256, (x, w, h) => {
  x.fillStyle = "#e6dcc4"; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 7000; k++) {
    x.strokeStyle = k % 2 ? "rgba(255,252,240,.3)" : "rgba(120,100,70,.16)"; x.lineWidth = 1;
    const X = Math.random() * w, Y = Math.random() * h, a = Math.random() * 7;
    x.beginPath(); x.moveTo(X, Y); x.lineTo(X + Math.cos(a) * 6, Y + Math.sin(a) * 6); x.stroke();
  }
  x.strokeStyle = "rgba(92,66,40,.7)"; x.lineWidth = 2; x.setLineDash([9, 6]);
  for (let y = 16; y < h; y += 26) { x.beginPath(); x.moveTo(0, y); for (let X = 0; X <= w; X += 32) x.lineTo(X, y + Math.sin(X * .049) * 4); x.stroke(); }
  x.setLineDash([]);
  x.fillStyle = "#6e3b25"; x.fillRect(0, 0, w, 10); x.fillRect(0, h - 10, w, 10);
})));

// ширдэг: a round felt rug, quilted with brown and blue
export const shirdegTex = () => tx("shirdeg", () => aniso(new T.CanvasTexture(cvs2(1024, 1024, (x, w) => {
  const c = w / 2, ring = (r: number, col: string, lw: number) => { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.arc(c, c, r, 0, 7); x.stroke(); };
  x.fillStyle = "#efe4cc"; x.fillRect(0, 0, w, w);
  for (let k = 0; k < 16000; k++) {
    x.strokeStyle = k % 2 ? "rgba(255,252,240,.25)" : "rgba(120,100,70,.12)"; x.lineWidth = 1;
    const X = Math.random() * w, Y = Math.random() * w, a = Math.random() * 7;
    x.beginPath(); x.moveTo(X, Y); x.lineTo(X + Math.cos(a) * 6, Y + Math.sin(a) * 6); x.stroke();
  }
  ring(498, "#6e3b25", 26); ring(470, NAVY, 10); ring(330, NAVY, 7); ring(304, "#6e3b25", 14); ring(150, "#6e3b25", 10);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * PI * 2; x.save(); x.translate(c, c); x.rotate(a);
    ulzii(x, 400, 0, 92, "#6e3b25"); cloud(x, 228, -26, 54, NAVY); cloud(x, 228, 26, 54, NAVY, -1);
    x.restore();
  }
  ulzii(x, c, c, 200, NAVY);
  x.strokeStyle = "rgba(92,66,40,.55)"; x.lineWidth = 2; x.setLineDash([8, 6]);
  for (let r = 340; r < 460; r += 16) { x.beginPath(); x.arc(c, c, r, 0, 7); x.stroke(); }
  x.setLineDash([]);
}))));

// авдар and the bed boards: a painted front with a knot in the middle
export const chestTex = () => tx("chest", () => CT(cvs2(512, 256, (x, w, h) => {
  paintBase(x, w, h, ORANGE);
  x.strokeStyle = GOLD; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16);
  [[28, 150], [334, 150]].forEach(([px, pw]) => {
    x.fillStyle = DEEP; x.fillRect(px, 28, pw, h - 56); x.strokeStyle = GOLD; x.lineWidth = 3; x.strokeRect(px, 28, pw, h - 56);
    cloud(x, px + pw * .3, 96, 58, GOLD); cloud(x, px + pw * .7, 158, 58, CREAM, -1);
  });
  x.fillStyle = NAVY; x.beginPath(); x.arc(w / 2, h / 2, 86, 0, 7); x.fill();
  x.strokeStyle = GOLD; x.lineWidth = 4; x.beginPath(); x.arc(w / 2, h / 2, 86, 0, 7); x.stroke();
  ulzii(x, w / 2, h / 2, 120, GOLD);
})));

// хөнжил: a bed quilt with a border
export const quiltBedTex = () => tx("bedQ", () => CT(cvs2(256, 256, (x, w, h) => {
  x.fillStyle = "#a82f33"; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? "#bf3c3c" : "#962a30"; x.fillRect(16 + i * 56, 16 + j * 56, 56, 56); ulzii(x, 44 + i * 56, 44 + j * 56, 34, GOLD); }
  x.strokeStyle = GOLD; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16);
})));

// the embroidered cloth that hangs behind the chests
export const hangingTex = () => tx("hang", () => CT(cvs2(1024, 256, (x, w, h) => {
  x.fillStyle = "#1f3a8a"; x.fillRect(0, 0, w, h);
  keyBand(x, 8, 26, 30, w, GOLD); keyBand(x, h - 34, 26, 30, w, GOLD);
  for (let i = 0; i < 7; i++) {
    const cx = (i + .5) * w / 7, c = [ROSE, GREEN, ORANGE][i % 3];
    x.fillStyle = c; x.beginPath(); x.arc(cx, h / 2, 62, 0, 7); x.fill(); x.strokeStyle = GOLD; x.lineWidth = 4; x.stroke();
    ulzii(x, cx, h / 2, 84, GOLD);
  }
})));

// framed family photographs: sepia prints, simple figures
export const photoTex = (kind: number) => tx("photo" + kind, () => aniso(new T.CanvasTexture(cvs2(128, 160, (x, w, h) => {
  x.fillStyle = kind == 2 ? "#cfd9d6" : "#e4d4b0"; x.fillRect(0, 0, w, h);
  const ink = kind == 2 ? "#4a5a58" : "#5a4228";
  const person = (cx: number, top: number, s: number) => {
    x.fillStyle = ink; x.beginPath(); x.arc(cx, top + 16 * s, 15 * s, 0, 7); x.fill();
    x.beginPath(); x.moveTo(cx - 28 * s, h); x.quadraticCurveTo(cx - 26 * s, top + 34 * s, cx, top + 32 * s); x.quadraticCurveTo(cx + 26 * s, top + 34 * s, cx + 28 * s, h); x.fill();
  };
  if (kind == 0) { person(44, 48, 1); person(86, 40, 1.05); }
  else if (kind == 1) { person(64, 34, 1.5); }
  else { x.fillStyle = ink; x.beginPath(); x.moveTo(0, 104); x.lineTo(44, 58); x.lineTo(78, 92); x.lineTo(104, 70); x.lineTo(w, 104); x.fill(); x.fillRect(0, 104, w, h - 104); x.fillStyle = "#f3efe4"; x.beginPath(); x.ellipse(64, 128, 24, 8, 0, 0, 7); x.fill(); x.fillRect(42, 112, 44, 16); }
  x.strokeStyle = "rgba(255,255,255,.7)"; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6);
}))));

// hair rope: dark and pale strands twisted together
export const hairRopeTex = () => tx("hairRope", () => CT(cvs2(32, 32, x => {
  x.fillStyle = "#2a1f18"; x.fillRect(0, 0, 32, 32); x.strokeStyle = "#cdbb9c"; x.lineWidth = 9;
  for (let k = -1; k < 2; k++) { x.beginPath(); x.moveTo(k * 32 - 8, -8); x.lineTo(k * 32 + 40, 40); x.stroke(); }
  x.strokeStyle = "rgba(0,0,0,.35)"; x.lineWidth = 2;
  for (let k = -1; k < 2; k++) { x.beginPath(); x.moveTo(k * 32 + 8, -8); x.lineTo(k * 32 + 56, 40); x.stroke(); }
})));
