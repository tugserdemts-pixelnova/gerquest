import { T, PI, lerp, sm } from "./util";
import { createWorld, GX, GZ, HK, BX, BZ, BAZ, BEL, HAZE, SUN, hf } from "./world";
import { LP, labelLayer } from "./labels";
import { createSeasons } from "./seasons";
import { createStage } from "./story";
import type { Season } from "../data/seasons";
import type { GerGroup } from "./ger";
import { N, ORDER } from "../data/parts";
import { getState, setState } from "../game/store";
import { HS, SP, maxJ, dom } from "../game/layout";
import { openDone, openPanel } from "../game/actions";
import { dragRef } from "../game/build";

type World = ReturnType<typeof createWorld>;
let R: T.WebGLRenderer, S: T.Scene, cam: T.PerspectiveCamera, w: World, cv: HTMLCanvasElement, sun: T.DirectionalLight, sea: ReturnType<typeof createSeasons>;
let started = false;

// screen-space ellipse around the build ger, used to test drops
export const buildTarget = { gcx: 0, gcy: 0, grx: 1, gry: 1 };

const hP = new T.Vector3(), hL = new T.Vector3(), bP = new T.Vector3(), bL = new T.Vector3(), v1 = new T.Vector3(), v2 = new T.Vector3(), V3 = new T.Vector3();
let hy = -.35, hv = 0, evS = 0, evT = 0, lblA = 0, lblT = -1e5, dragHero = false;
let dwell = 0, opened = -1, sv = 0, jc = 0, zm = 0, lw = 0, lh = 0, last = performance.now(), nearJ = -1;
let bt = 0, bd = 22, boY = 0, by = BAZ - .35, bv = 0, ringA = 0, bSnap = false;
let dg = false, dx0 = 0, dy0 = 0, mv = 0;
// guest story: sk = blend from the build camera to the guest's eye
let stage: ReturnType<typeof createStage> | null = null, sk = 0;
const sP = new T.Vector3(), sL = new T.Vector3();
let soY = 0;

// build ger part animations (0 drop in · 1 fall + fade in · 2 belt tightens · 3 shadow grows)
interface Anim { o: T.Object3D; ty: number; t0: number }
let anims: Anim[] = [];
// what each part reveals on the build ger: [group, animation type, delay s]
const BSTEP: Record<string, [GerGroup, number, number][]> = {
  "шал": [["Sh", 3, 0], ["F", 0, 0]], "хана": [["Lat", 0, 0]], "хаалга": [["Dr", 0, 0]], "багана": [["Cl", 0, 0]],
  "тооно": [["Tn", 0, 0]], "унь": [["Un", 0, 0]], "туурга": [["FW", 1, 0], ["FR", 1, .2]], "бүрээс": [["W", 1, 0], ["Rf", 1, .25]], "бүслүүр": [["Bs", 2, 0]],
};

// fade: drives transparent / opacity / depthWrite on every material under q
function fadeG(q: T.Object3D, a: number) {
  q.traverse(o => {
    const m = (o as T.Mesh).material;
    if (m) (Array.isArray(m) ? m : [m]).forEach(mt => {
      const f = mt.userData.f0 || (mt.userData.f0 = [mt.transparent, mt.opacity, mt.depthWrite]);
      mt.transparent = a < 1 || f[0]; mt.opacity = a * f[1]; mt.depthWrite = a > .95 && f[2];
    });
  });
}
export function bShow(on: boolean) {
  anims = [];
  const G = w.bD.G;
  for (const k in G) { const g = G[k as GerGroup]; g.visible = on; g.position.set(0, 0, 0); g.scale.set(1, 1, 1); }
  w.bD.fade.forEach(q => fadeG(q, 1));
}
export function queueStep(k: string) {
  const now = performance.now();
  BSTEP[k].forEach(([g, ty, dl]) => anims.push({ o: w.bD.G[g], ty, t0: now + dl * 1000 }));
}
export const snapBuildCam = () => { bSnap = true; };
export const setJc = (j: number) => { jc = j; };
// pulse station j and return its screen position (for the collect fly-in)
export function pulseStation(j: number) {
  const s = w.ST[j]; s.pulse = 1;
  const v = new T.Vector3(); s.pivot.getWorldPosition(v).project(cam);
  return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
}

function drawLabels() {
  const LBL = labelLayer.root;
  if (!LBL) return;
  LBL.style.opacity = String(lblA);
  if (lblA < .02) return;
  const G = w.heroD.G, W = innerWidth, Hh = innerHeight, cs = Math.cos(hy), sn = Math.sin(hy), gy = hf(GX, GZ);
  V3.set(GX, gy + HK * lerp(.9, 2.8, evS), GZ).project(cam);
  const cx = (V3.x + 1) / 2 * W, cy = (1 - V3.y) / 2 * Hh;
  V3.set(GX + HK * 2.2, gy + HK * lerp(.9, 2.8, evS), GZ).project(cam);
  const dist = Math.max(60, Math.min(Math.abs((V3.x + 1) / 2 * W - cx) + 26, W / 2 - 105)), Ll: typeof LP = [], Rr: typeof LP = [];
  LP.forEach(p => {
    let a: number[];
    if (p.a) a = p.a;
    else { const x = p.s == "L" ? -.85 : .85, z = .53, lx = x * cs - z * sn, lz = x * sn + z * cs; a = [p.r! * lx, p.y!, p.r! * lz]; }
    V3.set(a[0], a[1], a[2]); G[p.g].localToWorld(V3).project(cam);
    p.ax = (V3.x + 1) / 2 * W; p.ay = (1 - V3.y) / 2 * Hh; p.side = p.s ? (p.s == "L" ? -1 : 1) : (p.ax < cx ? -1 : 1);
    (p.side < 0 ? Ll : Rr).push(p);
  });
  const top = Math.max(110, cy - Hh * .36), bot = Math.min(Hh - 70, cy + Hh * .38);
  [Ll, Rr].forEach(arr => {
    arr.sort((a, b) => a.ay! - b.ay!);
    let prev = top;
    arr.forEach(p => { p.ly = Math.max(p.ay!, prev); prev = p.ly + 34; });
    let lim = bot;
    for (let i = arr.length - 1; i >= 0; i--) { if (arr[i].ly! > lim) arr[i].ly = lim; lim = arr[i].ly! - 34; }
    arr.forEach(p => {
      if (!p.el || !p.ln) return;
      const wd = p.el.offsetWidth, x = Math.max(6, Math.min(W - wd - 6, p.side! < 0 ? cx - dist - wd : cx + dist)), xe = p.side! < 0 ? x + wd : x;
      p.el.style.top = p.ly + "px"; p.el.style.left = x + "px";
      p.ln.setAttribute("x1", String(xe)); p.ln.setAttribute("y1", String(p.ly)); p.ln.setAttribute("x2", String(p.ax)); p.ln.setAttribute("y2", String(p.ay));
    });
  });
}

function loop(now: number) {
  requestAnimationFrame(loop);
  const st = getState(), panel = st.panel, bm = st.bm, cj = st.cj, mj = maxJ(st.u), ST = w.ST;
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  const W = cv.clientWidth, Hh = cv.clientHeight;
  if (W !== lw || Hh !== lh) { lw = W; lh = Hh; R.setSize(W, Hh, false); cam.aspect = W / Hh; }
  const jt = panel ? cj : Math.min(mj, Math.max(0, (scrollY - HS()) / SP()));
  jc += (jt - jc) * Math.min(1, dt * 6); zm += ((panel ? 1 : 0) - zm) * Math.min(1, dt * 6);
  w.cC.getPoint(jc / N, v1); w.lC.getPoint(jc / N, v2);
  const hp = Math.min(1, Math.max(0, scrollY / HS())), bl = sm(0, .6, jc), gy = hf(GX, GZ), dd = 22 * Math.max(1, .95 / (W / Hh));
  evT = sm(.05, .8, hp); evS += (evT - evS) * Math.min(1, dt * 6);
  hP.set(GX, gy + HK * lerp(2.6, 4.6, evS), GZ + dd).lerp(v1, bl); hL.set(GX, gy + HK * lerp(.95, 2.75, evS), GZ).lerp(v2, bl);
  let fov = lerp(50, 34, zm), ox = W > 800 ? -W * .18 * zm : 0, oy = W > 800 ? 0 : Hh * .2 * zm;
  // build mode: fit the ger between the banner zone and the tray, then fly the camera over
  bt = Math.max(0, Math.min(1, bt + (bm.on ? dt : -dt) / 1.3));
  if (bt > 0) {
    const f = dom.bfb, be = bm.done ? dom.bdn : dom.btr;
    if (bm.on && f && be) {
      const top = Math.max(f.offsetTop + (W > 800 ? 70 : 92), f.classList.contains("on") ? f.getBoundingClientRect().bottom + 8 : 0),
        bot = be.hidden ? Hh - 24 : be.getBoundingClientRect().top - 8, rh = Math.max(110, bot - top);
      const d = Math.max(14, Math.min(44, Math.max(HK * 2.5 / (W * .47), HK * 1.5 / (rh * .47)) * (Hh / 2) / .384)), o = Hh / 2 - (top + bot) / 2;
      if (bSnap) { bd = d; boY = o; bSnap = false; } else { bd += (d - bd) * Math.min(1, dt * 4); boY += (o - boY) * Math.min(1, dt * 4); }
    }
    const e = bt * bt * (3 - 2 * bt);
    bP.set(BX + Math.sin(BAZ) * Math.cos(BEL) * bd, .2 + HK * .95 + Math.sin(BEL) * bd, BZ + Math.cos(BAZ) * Math.cos(BEL) * bd); bL.set(BX, .2 + HK * .95, BZ);
    const far = hP.distanceTo(bP); hP.lerp(bP, e); hP.y += Math.sin(PI * e) * Math.min(45, far * .16); hL.lerp(bL, e);
    fov = lerp(fov, 42, e); ox *= 1 - e; oy = lerp(oy, boY, e);
  }
  // guest story: the camera becomes the visitor's eye; the stage exists only once somebody has built the ger and stepped in
  sk = Math.max(0, Math.min(1, sk + (st.story.on ? dt : -dt) / 1.4));
  if (sk > 0) {
    const s = stage || (stage = createStage(w.bO, w.bD.door));
    s.root.visible = true;
    const c = s.tick(st.story.i, dt, now), e = sk * sk * (3 - 2 * sk);
    w.bGer.updateMatrixWorld();
    sP.set(c[0], c[1], c[2]); sL.set(c[3], c[4], c[5]); w.bGer.localToWorld(sP); w.bGer.localToWorld(sL);
    // lift the view so the dialogue card does not cover what it is talking about
    const card = st.story.on ? document.getElementById("stc") : null;
    soY += ((card ? card.offsetHeight * .42 : 0) - soY) * Math.min(1, dt * 3);
    hP.lerp(sP, e); hL.lerp(sL, e); fov = lerp(fov, W < Hh ? 70 : 54, e); ox *= 1 - e; oy = lerp(oy, soY, e);
  } else if (stage && stage.root.visible) { stage.root.visible = false; stage.reset(); }
  // build mode looks down at the site, so the far peaks would crowd the top of the view: fade them into the haze
  // (winter and autumn add a little haze of their own)
  const mf = 1 - (1 - .6 * bt * bt * (3 - 2 * bt) * (1 - sk)) * (1 - sea.mtn());
  w.mtnM.color.setScalar(1 - mf); w.mtnM.emissive.copy(w.look.sky.uniforms.hz.value).multiplyScalar(mf);
  cam.position.copy(hP); cam.lookAt(hL); cam.fov = fov; cam.setViewOffset(W, Hh, ox, oy, W, Hh);
  // the shadow box rides along with whatever the camera looks at; the sky stays centred on the camera
  sun.target.position.copy(hL); sun.position.copy(hL).addScaledVector(SUN, 9); sun.target.updateMatrixWorld();
  w.sky.position.copy(cam.position);
  for (let j = 1; j <= N; j++) {
    const s = ST[j]; s.q.position.y = 3 + Math.sin(now / 400 + j) * .2;
    if (!s.hold.visible) continue;
    if (!dg || j != cj) s.spin += dt * .5 + (j == cj && panel ? sv : 0);
    s.pivot.rotation.y = s.spin;
    s.pulse = Math.max(0, s.pulse - dt / .8); s.hold.scale.setScalar(s.k * (1 + .3 * Math.sin(s.pulse * Math.PI)));
  }
  const heroOn = !panel && !bm.on && jc < .45;
  if (!(dg && dragHero)) { hy += dt * (hv + .2 - .12 * lblA); hv *= Math.exp(-dt * 2.5); }
  w.heroGer.rotation.y = hy; w.heroD.ex.forEach(([m, x, y, z]) => m.position.set(x * evS, y * evS, z * evS));
  const touched = (dg && dragHero) || now - lblT < 2800, tg = heroOn ? Math.max(sm(.2, .55, evS), touched ? 1 : 0) * (1 - sm(.1, .45, jc)) : 0;
  lblA += (tg - lblA) * Math.min(1, dt * 6);
  if (dom.hero) dom.hero.style.opacity = String(Math.max(0, 1 - hp * 3) * (1 - bt));
  if (!bm.on) {
    const nj = Math.round(jc), nr = (nj >= 1 && nj <= mj && Math.abs(jc - nj) < .12) ? nj : -1;
    if (nr !== nearJ) { nearJ = nr; dwell = 0; } else dwell += dt;
    if (nr < 0) opened = -1;
    else if (dwell > .35 && nr !== opened) {
      opened = nr;
      // every part collected and the ger not built yet: the last station offers the build, it has nothing else left to ask
      if (!panel) { if (nr == N && st.u == N && !st.built) openDone(); else openPanel(nr); }
    }
  }
  const hintHidden = !!panel || bm.on || jc > N - .4, hintKey = hp < .98 ? "hint1" : "hint2";
  if (hintHidden !== st.hintHidden || hintKey !== st.hintKey) setState({ hintHidden, hintKey });
  sv *= Math.exp(-dt * 5);
  // build ger: turning, part animations, drop ring
  // during the story the door turns to face the visitor and stays there
  if (sk > 0) { by += (BAZ + Math.round((by - BAZ) / (2 * PI)) * 2 * PI - by) * Math.min(1, dt * 3); bv = 0; }
  else if (!(dg && bm.on)) { by += dt * (bv + (bm.on && bm.n >= ORDER.length ? .25 : 0)); bv *= Math.exp(-dt * 2.5); }
  w.bGer.rotation.y = by;
  if (anims.length) anims = anims.filter(A => {
    const k = (now - A.t0) / (A.ty == 1 ? 700 : 600);
    if (k < 0) return true;
    const o = A.o, q = Math.min(1, k), e = 1 + 2.2 * Math.pow(q - 1, 3) + 1.2 * Math.pow(q - 1, 2);
    o.visible = true;
    if (A.ty == 0) o.position.y = (1 - e) * 2.2;
    else if (A.ty == 1) { o.position.y = (1 - e) * 1.8; fadeG(o, Math.min(1, q * 2.5)); }
    else { const s = A.ty == 2 ? 1 + .4 * Math.pow(1 - q, 3) + .012 * Math.sin(q * PI * 3) * (1 - q) : .5 + .5 * q; o.scale.set(s, 1, s); }
    return k < 1;
  });
  const hot = !!(dragRef.cur && dragRef.cur.over), rm = w.bRing.material as T.MeshBasicMaterial;
  ringA += ((bm.on && bm.n < ORDER.length ? (hot ? 1 : .3) : 0) - ringA) * Math.min(1, dt * 8);
  w.bRing.visible = ringA > .01; rm.opacity = ringA * (hot ? .8 + .2 * Math.sin(now / 80) : 1); w.bRing.scale.setScalar(hot ? 1.03 + .02 * Math.sin(now / 120) : 1);
  sea.tick(dt, now, cam.position); w.animals(now, dt);
  R.render(S, cam); drawLabels();
  if (bt > 0) {
    V3.set(BX, .2 + HK * .95, BZ).project(cam);
    buildTarget.gcx = (V3.x + 1) / 2 * W; buildTarget.gcy = (1 - V3.y) / 2 * Hh;
    const ppu = (Hh / 2) / (bd * Math.tan(fov * PI / 360));
    buildTarget.grx = HK * 2.7 * ppu; buildTarget.gry = HK * 1.8 * ppu;
  }
}

// drag to turn the hero ger / a station / the build ger · click a station to open it
function bindPointer() {
  const rc = new T.Raycaster(), nd = new T.Vector2();
  cv.onpointerdown = e => {
    const { panel, bm } = getState();
    dg = true; mv = 0; sv = 0; dx0 = e.clientX; dy0 = e.clientY;
    dragHero = !panel && !bm.on && jc < .45;
    if (dragHero) lblT = performance.now();
  };
  cv.onpointerleave = () => { dg = false; };
  cv.onpointercancel = () => { dg = false; };
  cv.onpointermove = e => {
    if (!dg) return;
    const { panel, bm, cj } = getState(), ST = w.ST;
    const dx = e.clientX - dx0, dy = e.clientY - dy0; mv += Math.abs(dx) + Math.abs(dy); dx0 = e.clientX; dy0 = e.clientY;
    if (getState().story.on) return;
    if (bm.on) { by += dx * .012; bv = Math.max(-6, Math.min(6, dx * .012 * 60)); }
    else if (panel && ST[cj]) { ST[cj].spin += dx * .012; sv = dx * .012; ST[cj].pivot.rotation.x = Math.max(-.35, Math.min(.45, ST[cj].pivot.rotation.x + dy * .008)); }
    else if (dragHero) { hy += dx * .012; hv = Math.max(-6, Math.min(6, dx * .012 * 60)); lblT = performance.now(); }
  };
  cv.onpointerup = e => {
    const { panel, bm, u } = getState();
    dg = false;
    if (mv > 6 || panel || bm.on) return;
    nd.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); rc.setFromCamera(nd, cam);
    const h = rc.intersectObjects(w.hits)[0];
    if (h) { const j = h.object.userData.j; if (j <= maxJ(u) && Math.abs(jc - j) < .4) openPanel(j); }
  };
}

// sky, light, ground, trees and weather blend over to another season
export function applySeason(s: Season) { if (started) sea.set(s); }

// station visibility + ring colour follow the collected count
export function refreshStations(u: number) {
  if (!started) return;
  for (let j = 1; j <= N; j++) {
    const s = w.ST[j];
    s.hold.visible = j - 1 <= u; s.q.visible = j - 1 > u;
    (s.ring.material as T.MeshLambertMaterial).color.set(j - 1 < u ? 0x4caf50 : 0xe8b84a);
  }
}

export function initEngine(canvas: HTMLCanvasElement) {
  if (started) return;
  started = true; cv = canvas;
  R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: "high-performance" }); R.setPixelRatio(Math.min(devicePixelRatio, 2));
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  S = new T.Scene(); cam = new T.PerspectiveCamera(38, 1, .1, 50); cam.position.set(0, 0, 9);
  const hemi = new T.HemisphereLight(0xf2f8ff, 0x8a7a55, .95); S.add(hemi);
  // warm sun with soft shadows over a 90×90 box around the view target
  sun = new T.DirectionalLight(0xfff3dd, .85); sun.position.copy(SUN); sun.castShadow = true;
  const sc = sun.shadow.camera, big = Math.min(innerWidth, innerHeight) > 500;
  sun.shadow.mapSize.set(big ? 2048 : 1536, big ? 2048 : 1536); sc.left = sc.bottom = -45; sc.right = sc.top = 45; sc.near = 1; sc.far = 220;
  sun.shadow.bias = -.0006; sun.shadow.normalBias = .03; sun.shadow.radius = 3; S.add(sun, sun.target);
  S.fog = new T.Fog(HAZE, 40, 240); cam.fov = 50; cam.far = 900; cam.near = .5;
  w = createWorld(S);
  bindPointer();
  const st = getState();
  sea = createSeasons(S, w, hemi, sun); sea.set(st.season, true);
  refreshStations(st.u);
  bShow(st.built > 0);
  requestAnimationFrame(loop);
}
