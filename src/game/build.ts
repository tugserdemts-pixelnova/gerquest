import type { PointerEvent as RPointerEvent, MouseEvent as RMouseEvent } from "react";
import { IX, N, ORDER } from "../data/parts";
import { getState, setState, setBm, store } from "./store";
import { shuffle } from "./layout";
import { closePanel, setInv } from "./actions";
import { bShow, buildTarget, queueStep, setJc, snapBuildCam } from "../three/engine";
import { thumb } from "../three/thumbs";

let fbTm = 0, finTm = 0, shakeTm = 0;
export const stars = (e: number) => e == 0 ? 3 : e < 4 ? 2 : 1;
export const cancelBuildTimers = () => { clearTimeout(fbTm); clearTimeout(finTm); };
const cardOf = (k: string) => document.querySelector<HTMLElement>('#btr .bc[data-k="' + k + '"]');

export function newBuild() {
  cancelBuildTimers();
  let tray: string[];
  do tray = shuffle(ORDER.slice()); while (tray.every((k, i) => k == ORDER[i]));
  setBm({ n: 0, err: 0, done: false, min: false, hint: false, fb: { ty: "tip" }, tray });
  bShow(false);
  fbTm = window.setTimeout(hideFb, 5000);
}
function hideFb() { const { fb } = getState().bm; if (fb && fb.ty != "bad") setBm({ fb: null }); }
export const dismissFb = () => setBm({ fb: null });
export const minimizeDone = () => setBm({ min: true });

export function enterBuild() {
  const s = getState();
  if (s.u < N || s.bm.on) return;
  if (s.panel) closePanel();
  setBm({ inv: getState().invOpen, on: true });
  snapBuildCam();
  setInv(false); setState({ invAway: true });
  if (s.bm.done || !s.bm.tray) newBuild();
}
export function exitBuild() {
  const { bm, built } = getState();
  if (!bm.on) return;
  killDrag();
  setBm({ on: false });
  setState({ invAway: false });
  setInv(bm.inv);
  // with the ger built the game is over: back to the title and the whole ger, not down at the last station
  if (built) { scrollTo(0, 0); setJc(0); }
}

// ghost image that follows the pointer (same look as the inventory fly-in)
const mkGhost = (k: string) => {
  const im = new Image(); im.src = thumb(IX[k]); im.alt = ""; im.className = "fly gh"; document.body.appendChild(im); return im;
};
const posGhost = (g: HTMLElement, x: number, y: number) => { const s = g.offsetWidth || 96; g.style.left = x - s / 2 + "px"; g.style.top = y - s / 2 + "px"; };
const flyTo = (g: HTMLElement, x: number, y: number, sc: number) => {
  const a = g.getBoundingClientRect();
  g.animate([{ transform: "none", opacity: 1 }, { transform: `translate(${x - a.left - a.width / 2}px,${y - a.top - a.height / 2}px) scale(${sc})`, opacity: sc < .5 ? 0 : 1 }],
    { duration: 380, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" });
  setTimeout(() => g.remove(), 390);
};
const overGer = (x: number, y: number) => {
  const { gcx, gcy, grx, gry } = buildTarget;
  return Math.pow((x - gcx) / grx, 2) + Math.pow((y - gcy) / gry, 2) < 1;
};

// the card being dragged; the render loop reads .over to light up the drop ring
interface Drag { k: string; c: HTMLElement; id: number; x: number; y: number; mv: number; over: boolean; gh: HTMLImageElement }
export const dragRef: { cur: Drag | null } = { cur: null };
export function killDrag() {
  if (dragRef.cur) { dragRef.cur.gh.remove(); dragRef.cur = null; setBm({ dragK: null }); }
}

// one attempt to place part k (drop on the ger, tap/click, or Enter on a card)
export function attempt(k: string, gh?: HTMLImageElement) {
  const { bm } = getState();
  if (!bm.on || bm.done || bm.n >= ORDER.length) return;
  clearTimeout(fbTm);
  const c = cardOf(k), kb = !gh;
  if (!gh) { gh = mkGhost(k); const r = c!.getBoundingClientRect(); posGhost(gh, r.left + r.width / 2, r.top + r.height / 2); }
  if (k == ORDER[bm.n]) {
    queueStep(k);
    const n = bm.n + 1;
    setBm({ n, hint: false, fb: { ty: "ok", k } });
    flyTo(gh, buildTarget.gcx, buildTarget.gcy, .3);
    if (n == ORDER.length) finTm = window.setTimeout(() => {
      const s = getState(), built = Math.max(s.built, stars(s.bm.err));
      store.set("gerB3", built);
      setState({ built });
      setBm({ done: true, fb: null });
    }, 2300);
    else fbTm = window.setTimeout(hideFb, 3800);
  } else {
    setBm({ err: bm.err + 1, hint: true, fb: { ty: "bad", k }, shakeK: k });
    clearTimeout(shakeTm); shakeTm = window.setTimeout(() => setBm({ shakeK: null }), 600);
    const r = c!.getBoundingClientRect(); flyTo(gh, r.left + r.width / 2, r.top + r.height / 2, .6);
  }
  // keyboard: keep focus on the card, or move it to the next card still in the tray
  if (kb) requestAnimationFrame(() => {
    const f = cardOf(k), q = f && !f.classList.contains("done") ? f : document.querySelector<HTMLElement>("#btr .bc:not(.done)");
    if (q) q.focus();
  });
}

// tray pointer handlers (delegated from the tray, like the cards' pointer capture expects)
export const trayHandlers = {
  onPointerDown(e: RPointerEvent<HTMLElement>) {
    const c = (e.target as HTMLElement).closest<HTMLElement>(".bc");
    if (!c || dragRef.cur || e.button > 0 || getState().bm.n >= ORDER.length) return;
    const k = c.dataset.k!;
    dragRef.cur = { k, c, id: e.pointerId, x: e.clientX, y: e.clientY, mv: 0, over: false, gh: mkGhost(k) };
    posGhost(dragRef.cur.gh, e.clientX, e.clientY);
    setBm({ dragK: k });
    try { c.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
  },
  onPointerMove(e: RPointerEvent<HTMLElement>) {
    const d = dragRef.cur;
    if (!d || e.pointerId != d.id) return;
    d.mv += Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y); d.x = e.clientX; d.y = e.clientY;
    posGhost(d.gh, d.x, d.y); d.over = d.mv >= 8 && overGer(d.x, d.y);
  },
  onPointerUp(e: RPointerEvent<HTMLElement>) { endDrag(e); },
  onPointerCancel(e: RPointerEvent<HTMLElement>) { endDrag(e, true); },
  // keyboard (Enter / Space); pointer taps are handled in pointerup
  onClick(e: RMouseEvent<HTMLElement>) {
    const c = (e.target as HTMLElement).closest<HTMLElement>(".bc");
    if (c && e.detail === 0) attempt(c.dataset.k!);
  },
};
function endDrag(e: RPointerEvent<HTMLElement>, cancel?: boolean) {
  const d = dragRef.cur;
  if (!d || e.pointerId != d.id) return;
  dragRef.cur = null; setBm({ dragK: null });
  if (!cancel && (d.mv < 8 || overGer(e.clientX, e.clientY))) attempt(d.k, d.gh);
  else { const r = d.c.getBoundingClientRect(); flyTo(d.gh, r.left + r.width / 2, r.top + r.height / 2, .6); }
}
