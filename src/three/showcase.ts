import { T, PI, sm } from "./util";
import { buildGer, type GerData, type GerGroup } from "./ger";
import type { LabelKey } from "../data/i18n";

// the sign-in page's ger: it opens out into its parts, then keeps turning. Dragging turns it by hand.
// k = text key, g = the group it points at, r / y = where (in ger units, before the opening), s = side of the screen
export const CALLOUTS: { k: LabelKey; g: GerGroup; r: number; y: number; s: -1 | 1; c: string }[] = [
  { k: "toono", g: "Tn", r: .5, y: 1.8, s: 1, c: "#be6a40" },
  { k: "roof", g: "Rf", r: 1.35, y: 1.52, s: 1, c: "#f0dca8" },
  { k: "uni", g: "Un", r: 1.5, y: 1.3, s: 1, c: "#dd7a00" },
  { k: "cover", g: "W", r: 2.07, y: .85, s: 1, c: "#f0c4b8" },
  { k: "bagana", g: "Cl", r: .55, y: .9, s: 1, c: "#c8552e" },
  { k: "belt", g: "Bs", r: 2.06, y: .65, s: -1, c: "#6e3b25" },
  { k: "felt", g: "FW", r: 2.03, y: .25, s: -1, c: "#b0a488" },
  { k: "wall", g: "Lat", r: 1.9, y: .3, s: -1, c: "#a0692d" },
  { k: "floor", g: "F", r: 1.8, y: -.07, s: -1, c: "#bdbdbd" },
  { k: "door", g: "Dr", r: 3, y: .5, s: 1, c: "#74685a" },
];

export interface Callout { el: HTMLElement; ln: SVGLineElement }
const TOP = 5.9, BASE = -.2, MID = (TOP + BASE) / 2, EDGE = 2.3, FOV = 26, ELEV = .13, DOOR: [number, number, number] = [0, .3, .95];
const LABELS_FROM = 1100, GAP = 34;

// card = the sign-in card, which the ger keeps clear of
export function startShowcase(canvas: HTMLCanvasElement, card: HTMLElement, labels: Partial<Record<LabelKey, Callout>>) {
  const R = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
  R.setPixelRatio(Math.min(devicePixelRatio, 2));
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  const S = new T.Scene(), cam = new T.PerspectiveCamera(FOV, 1, 1, 80);
  S.add(new T.HemisphereLight(0xf2f8ff, 0x8a7a55, .95));
  const sun = new T.DirectionalLight(0xfff3dd, .85); sun.position.set(16, 24, 24); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.normalBias = .03;
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 8, bottom: -6, near: 1, far: 60 }); S.add(sun);
  const ger = buildGer(), data = ger.userData as GerData; S.add(ger);
  ger.traverse(m => { if ((m as T.Mesh).isMesh) m.castShadow = m.receiveShadow = true; });
  data.G.Sh.traverse(m => { m.castShadow = m.receiveShadow = false; });
  const ex = data.ex.map(([o, x, y, z]) => (o == data.G.Dr ? [o, ...DOOR] : [o, x, y, z]) as [T.Object3D, number, number, number]);
  const offset = (g: GerGroup) => ex.find(e => e[0] == data.G[g]) || [null, 0, 0, 0];

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, ppu = 100, cx = 0, cy = 0, yaw = -.35, push = 0, dragging = false, lastX = 0, raf = 0, last = performance.now();
  const t0 = last, v = new T.Vector3();

  // fit the ger into the space left of the card, or above it on a phone
  function fit() {
    const w = canvas.clientWidth, h = canvas.clientHeight, c = card.getBoundingClientRect();
    W = w; H = h; R.setSize(w, h, false);
    const beside = w > 860, room = beside ? c.left : c.top, labelled = w >= LABELS_FROM;
    if (beside) {
      cx = room * .54;
      ppu = Math.min(h * .76 / (TOP - BASE), (room - cx - (labelled ? 150 : 24)) / EDGE, (cx - 20) / EDGE);
      cy = h * .9 - (MID - BASE) * ppu;
    } else {
      const top = 64, tall = room - top - 8;
      cx = w / 2; ppu = Math.min(tall / (TOP - BASE + .3), (w - 24) / (EDGE * 2)); cy = top + tall / 2;
    }
    const dist = h / ppu / (2 * Math.tan(FOV * PI / 360));
    cam.aspect = w / h; cam.position.set(0, MID + Math.sin(ELEV) * dist, Math.cos(ELEV) * dist); cam.lookAt(0, MID, 0);
    cam.setViewOffset(w, h, w / 2 - cx, h / 2 - cy, w, h);
    cam.updateMatrixWorld();
  }

  const toScreen = (x: number, y: number, z: number) => { v.set(x, y, z).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };

  function drawLabels(k: number) {
    const on = W >= LABELS_FROM && k > .92, a = on ? sm(.92, 1, k) : 0;
    const placed: Record<string, { side: number; ax: number; ay: number; y: number; c: Callout }[]> = { "-1": [], "1": [] };
    for (const p of CALLOUTS) {
      const c = labels[p.k];
      if (!c) continue;
      c.el.style.opacity = c.ln.style.opacity = String(a);
      if (!on) continue;
      const o = offset(p.g);
      let px = p.s * p.r, pz = 0, f = 1;
      // the door travels round with the ger, so its label follows it and fades while it passes behind
      if (p.k == "door") {
        px = Math.sin(yaw) * p.r; pz = Math.cos(yaw) * p.r; f = sm(.1, .7, Math.cos(yaw));
        c.el.style.opacity = c.ln.style.opacity = String(a * f);
      }
      const [ax, ay] = toScreen(px, p.y + o[2] * k, pz);
      placed[p.s].push({ side: p.s, ax, ay, y: ay, c });
    }
    if (!on) return;
    const edgeX = (EDGE * ppu) + 26;
    [placed["-1"], placed["1"]].forEach(list => {
      list.sort((a, b) => a.ay - b.ay);
      let prev = 70;
      list.forEach(l => { l.y = Math.max(l.ay, prev); prev = l.y + GAP; });
      let lim = H - 30;
      for (let i = list.length - 1; i >= 0; i--) { if (list[i].y > lim) list[i].y = lim; lim = list[i].y - GAP; }
      list.forEach(l => {
        const wd = l.c.el.offsetWidth, left = l.side < 0 ? cx - edgeX - wd : cx + edgeX, near = l.side < 0 ? left + wd : left;
        l.c.el.style.transform = `translate(${left}px,${l.y}px) translateY(-50%)`;
        l.c.ln.setAttribute("x1", String(near)); l.c.ln.setAttribute("y1", String(l.y)); l.c.ln.setAttribute("x2", String(l.ax)); l.c.ln.setAttribute("y2", String(l.ay));
      });
    });
  }

  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (canvas.clientWidth != W || canvas.clientHeight != H) fit();
    const k = still ? 1 : sm(.5, 2.3, (now - t0) / 1000);
    ex.forEach(([o, x, y, z]) => o.position.set(x * k, y * k, z * k));
    if (!dragging) { yaw += dt * ((still ? 0 : .22) + push); push *= Math.exp(-dt * 2.5); }
    ger.rotation.y = yaw;
    R.render(S, cam);
    drawLabels(k);
  }

  canvas.onpointerdown = e => { dragging = true; lastX = e.clientX; push = 0; canvas.setPointerCapture(e.pointerId); };
  canvas.onpointermove = e => { if (!dragging) return; const d = (e.clientX - lastX) * .01; yaw += d; push = Math.max(-5, Math.min(5, d * 60)); lastX = e.clientX; };
  canvas.onpointerup = canvas.onpointercancel = () => { dragging = false; };

  fit(); raf = requestAnimationFrame(loop);
  addEventListener("resize", fit);
  return () => { cancelAnimationFrame(raf); removeEventListener("resize", fit); R.dispose(); };
}
