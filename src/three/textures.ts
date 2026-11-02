import { T, aniso, cvs2, tx } from "./util";

type Ctx = CanvasRenderingContext2D;
export const BLUE = "#2b4fc4";
export const OFFW = "#f3efe4";

// Mongolian ornament (khee): nested squares, cross bars and corner knots – mirror symmetric
export const khee = (x: Ctx, cx: number, cy: number, sz: number) => {
  const a = sz / 2, lw = sz * .075;
  x.save(); x.translate(cx, cy); x.strokeStyle = BLUE; x.fillStyle = BLUE; x.lineWidth = lw; x.lineJoin = "miter";
  x.strokeRect(-a, -a, 2 * a, 2 * a); x.strokeRect(-a * .56, -a * .56, a * 1.12, a * 1.12);
  x.beginPath(); [[0, 1], [1, 0]].forEach(([p, q]) => { x.moveTo(-p * a, -q * a); x.lineTo(p * a, q * a); }); x.stroke();
  const c = a * .78, k = a * .2;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([i, j]) => x.fillRect(i * c - k / 2, j * c - k / 2, k, k));
  x.fillRect(-a * .16, -a * .16, a * .32, a * .32); x.restore();
};

export const weave = (x: Ctx, w: number, h: number, a: number, st: number) => {
  x.save(); x.fillStyle = "rgba(90,90,110," + a + ")";
  for (let i = 0; i < w; i += st) x.fillRect(i, 0, 1, h);
  for (let j = 0; j < h; j += st) x.fillRect(0, j, w, 1);
  x.fillStyle = "rgba(80,80,90,.05)";
  for (let k = 0; k < w * h / 50; k++) x.fillRect(Math.random() * w, Math.random() * h, 2, 1);
  x.restore();
};

export const topTex = () => aniso(new T.CanvasTexture(cvs2(512, 330, (x, w, h) => {
  x.fillStyle = OFFW; x.fillRect(0, 0, w, h); x.fillStyle = BLUE; x.fillRect(0, 38, w, 46); x.fillRect(0, h - 84, w, 46);
  khee(x, w / 2, h / 2, 150); weave(x, w, h, .08, 3);
})));

export const fabTex = (rx: number, ry: number, col?: string) => {
  const t = aniso(new T.CanvasTexture(cvs2(128, 128, (x, w, h) => { x.fillStyle = col || OFFW; x.fillRect(0, 0, w, h); weave(x, w, h, .08, 4); })));
  t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); return t;
};

// folded edge: stacked cloth layers with shadow lines, blue trim showing on two of them
export const edgeTex = () => aniso(new T.CanvasTexture(cvs2(256, 64, (x, w, h) => {
  x.fillStyle = OFFW; x.fillRect(0, 0, w, h); const n = 5, lh = h / n;
  for (let i = 0; i < n; i++) {
    const y = i * lh;
    if (i == 1 || i == 3) { x.fillStyle = BLUE; x.fillRect(0, y + 3.5, w, lh - 7); }
    x.fillStyle = "rgba(60,50,40,.6)"; x.fillRect(0, y, w, 1.6); x.fillStyle = "rgba(60,50,40,.16)"; x.fillRect(0, y + 1.6, w, 3);
    x.fillStyle = "rgba(255,255,255,.55)"; x.fillRect(0, y + lh - 2, w, 1.6);
  }
  weave(x, w, h, .09, 3);
})));

export const feltTex = (rx: number, ry: number) => {
  const t = new T.CanvasTexture(cvs2(128, 128, (x, w, h) => {
    x.fillStyle = "#b0a488"; x.fillRect(0, 0, w, h); x.lineWidth = 1;
    for (let k = 0; k < 1100; k++) {
      x.strokeStyle = k % 2 ? "rgba(255,250,235,.14)" : "rgba(70,60,45,.14)";
      const X = Math.random() * w, Y = Math.random() * h, a = Math.random() * 7;
      x.beginPath(); x.moveTo(X, Y); x.lineTo(X + Math.cos(a) * 5, Y + Math.sin(a) * 5); x.stroke();
    }
  }));
  t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); return t;
};

export const spiralTex = () => new T.CanvasTexture(cvs2(128, 128, (x, w, h) => {
  x.fillStyle = "#a89b7e"; x.fillRect(0, 0, w, h); x.strokeStyle = "rgba(70,58,40,.75)"; x.lineWidth = 2.5; x.beginPath();
  for (let a = 0; a < 38; a += .1) { const r = 3 + a * 1.5; x[a ? "lineTo" : "moveTo"](64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
  x.stroke();
}));

export const ropeTex = () => {
  const t = new T.CanvasTexture(cvs2(16, 16, x => {
    x.fillStyle = "#8a8a8a"; x.fillRect(0, 0, 16, 16); x.strokeStyle = "#fff"; x.lineWidth = 5;
    for (let k = -1; k < 2; k++) { x.beginPath(); x.moveTo(k * 16 - 4, -4); x.lineTo(k * 16 + 20, 20); x.stroke(); }
  }));
  t.wrapS = t.wrapT = T.RepeatWrapping; return t;
};

export const woodTex = () => {
  const c = cvs2(1024, 64, (x, w, h) => {
    x.fillStyle = "#cdbf9f"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 46; i++) {
      const y = Math.random() * h; x.strokeStyle = "rgba(110,90,60," + (.14 + Math.random() * .2) + ")"; x.lineWidth = .6 + Math.random() * 1.4;
      x.beginPath(); const ph = Math.random() * 6; x.moveTo(0, y);
      for (let X = 0; X <= w; X += 32) x.lineTo(X, y + Math.sin(X * .01 + ph) * 1.6);
      x.stroke();
    }
    for (let k = 0; k < 5; k++) {
      const X = Math.random() * w, Y = 12 + Math.random() * (h - 24);
      x.fillStyle = "rgba(95,72,45,.55)"; x.beginPath(); x.ellipse(X, Y, 10 + Math.random() * 8, 4 + Math.random() * 3, 0, 0, 7); x.fill();
      x.strokeStyle = "rgba(95,72,45,.35)"; x.lineWidth = 1.5; x.beginPath(); x.ellipse(X, Y, 20, 8, 0, 0, 7); x.stroke();
    }
  });
  const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
};

// ── realistic cover cloth (бүрээс): canvas colour map + matching bump map, shared by the hero ger and the build ger ──
const keyRow = (x: Ctx, y0: number, bh: number, n: number, W: number) => {
  const s = bh / 32, mw = W / n, k = mw / 32;
  x.fillStyle = x.strokeStyle = "#2a2f8f"; x.fillRect(0, y0, W, 4 * s); x.fillRect(0, y0 + bh - 4 * s, W, 4 * s);
  x.lineWidth = 3 * Math.min(s, k); x.lineJoin = "miter";
  for (let i = 0; i < n; i++) {
    x.beginPath();
    [[4, 26], [4, 8], [24, 8], [24, 22], [12, 22], [12, 15]].forEach(([a, b], q) => x[q ? "lineTo" : "moveTo"](i * mw + a * k, y0 + b * s));
    x.stroke();
  }
};

const clothTex = (roof: boolean) => {
  const W = 1024, H = 512, seams = [128, 384, 640, 896], bands = roof ? [[474, 32, 28], [85, 28, 10]] : [[394, 71, 16]];
  const map = cvs2(W, H, (x, w, h) => {
    x.fillStyle = OFFW; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 26; k++) {
      const X = Math.random() * w, Y = Math.random() * h, r = 60 + Math.random() * 120;
      [-w, 0, w].forEach(o => {
        const g = x.createRadialGradient(X + o, Y, 0, X + o, Y, r);
        g.addColorStop(0, k % 2 ? "rgba(255,255,250,.10)" : "rgba(170,150,115,.08)"); g.addColorStop(1, "rgba(200,190,170,0)");
        x.fillStyle = g; x.fillRect(X + o - r, Y - r, 2 * r, 2 * r);
      });
    }
    weave(x, w, h, .07, 3);
    for (let k = 0; k < 60; k++) { x.fillStyle = "rgba(120,105,80," + (.02 + Math.random() * .04) + ")"; x.fillRect(Math.random() * w, Math.random() * h * .8, 1 + Math.random() * 2, 40 + Math.random() * 160); }
    seams.forEach(s => {
      x.fillStyle = "rgba(110,98,78,.38)"; x.fillRect(s - 1, 0, 2, h); x.fillStyle = "rgba(255,255,255,.45)"; x.fillRect(s + 1, 0, 1.5, h);
      x.fillStyle = "rgba(95,88,72,.55)"; for (let y = 2; y < h; y += 9) { x.fillRect(s - 7, y, 1.5, 5); x.fillRect(s + 6, y, 1.5, 5); }
    });
    bands.forEach(([y, bh, n]) => keyRow(x, y, bh, n, w));
    const grad = (y0: number, y1: number, st: [number, string][]) => {
      const g = x.createLinearGradient(0, y0, 0, y1); st.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, y0, w, y1 - y0);
    };
    if (roof) { grad(0, h * .3, [[0, "rgba(80,70,60,.2)"], [1, "rgba(80,70,60,0)"]]); grad(h * .6, h, [[0, "rgba(150,125,85,0)"], [1, "rgba(150,125,85,.16)"]]); }
    else { grad(0, h * .24, [[0, "rgba(50,44,40,.5)"], [.5, "rgba(50,44,40,.28)"], [1, "rgba(50,44,40,0)"]]); grad(h * .45, h, [[0, "rgba(150,122,80,0)"], [1, "rgba(150,122,80,.3)"]]); }
  });
  const bump = cvs2(W, H, (x, w, h) => {
    x.fillStyle = "#808080"; x.fillRect(0, 0, w, h);
    x.fillStyle = "rgba(255,255,255,.1)"; for (let i = 0; i < w; i += 3) x.fillRect(i, 0, 1, h);
    x.fillStyle = "rgba(0,0,0,.1)"; for (let j = 0; j < h; j += 3) x.fillRect(0, j, w, 1);
    const wr = (X: number, Y: number, dx: number, dy: number, lw: number, c: string) => {
      x.strokeStyle = c; x.lineCap = "round";
      [-w, 0, w].forEach(o => [1, .6, .3].forEach(f => {
        x.lineWidth = lw * f; x.beginPath(); x.moveTo(X + o, Y); x.quadraticCurveTo(X + o + dx * .5 + dy * .15, Y + dy * .5, X + o + dx, Y + dy); x.stroke();
      }));
    };
    for (let k = 0; k < (roof ? 70 : 110); k++) {
      const l = 50 + Math.random() * (roof ? 120 : 200);
      wr(Math.random() * w, Math.random() * h, (Math.random() - .5) * l * (roof ? .5 : .22), l, 5 + Math.random() * 16, k % 2 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)");
    }
    (roof ? [.93] : [.74, .435, .175]).forEach(v => {
      for (let k = 0; k < 150; k++) {
        const l = 14 + Math.random() * 30;
        wr(Math.random() * w, v * h - l / 2 + (Math.random() - .5) * 8, (Math.random() - .5) * 6, l, 2 + Math.random() * 4, k % 2 ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.16)");
      }
    });
    seams.forEach(s => {
      x.fillStyle = "rgba(255,255,255,.35)"; x.fillRect(s - 6, 0, 12, h); x.fillStyle = "rgba(0,0,0,.55)"; x.fillRect(s - 1, 0, 2, h);
      x.fillStyle = "rgba(0,0,0,.35)"; for (let y = 2; y < h; y += 9) { x.fillRect(s - 7, y, 1.5, 5); x.fillRect(s + 6, y, 1.5, 5); }
    });
    bands.forEach(([y, bh]) => { x.fillStyle = "rgba(255,255,255,.22)"; x.fillRect(0, y, w, bh); x.fillStyle = "rgba(0,0,0,.3)"; x.fillRect(0, y - 1, w, 2); x.fillRect(0, y + bh - 1, w, 2); });
  });
  const mk = (c: HTMLCanvasElement) => { const q = new T.CanvasTexture(c); q.wrapS = T.RepeatWrapping; q.anisotropy = 4; return q; };
  return { map: mk(map), bump: mk(bump) };
};

// MeshStandardMaterial (Lambert ignores bumpMap in r128); plain transparent/opacity/depthWrite still drive the fade
export const clothM = (roof: boolean) => {
  const q = tx(roof ? "roofC" : "wallC", () => clothTex(roof));
  return new T.MeshStandardMaterial({ map: q.map, bumpMap: q.bump, bumpScale: .016, roughness: .95, metalness: 0, side: T.DoubleSide, vertexColors: true });
};
