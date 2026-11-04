import { D, N } from "../data/parts";
import { L } from "../data/i18n";
import { getState, setState, setBm, store } from "./store";
import { SC, maxJ, shuffle } from "./layout";
import { cancelBuildTimers } from "./build";
import { bShow, pulseStation } from "../three/engine";
import { thumb } from "../three/thumbs";
import type { Season } from "../data/seasons";

let invTm = 0;

export const setInv = (o: boolean) => setState({ invOpen: o });
export const setSeason = (s: Season) => { setState({ season: s }); store.set("gerSeason", s); };
export const toggleInv = () => { clearTimeout(invTm); setInv(!getState().invOpen); };

// ── info panel ──
export function openPanel(j: number) {
  setState({ cj: j, qi: 0, qo: null, qa: -1, pdone: false, panel: "info", invAway: false, invOpen: false });
}
export function openDone() { openPanel(N); setState({ pdone: true }); }
export function closePanel() { setState({ panel: null, invAway: false }); }
export const backToInfo = () => setState({ panel: "info" });

// ── quiz ──
// question list for station j: [question, options, correct]; the first one comes from the part text, the rest from Q (option 0 correct)
export const qList = (j: number): [string, string[], number][] => {
  const { lang } = getState(), P = L[lang].P[j - 1];
  return [[P[4], P[5], D[j - 1][6]] as [string, string[], number]].concat(L[lang].Q[j - 1].map(q => [q[0], q[1], 0] as [string, string[], number]));
};
function showQ(qi: number) {
  const { cj } = getState();
  setState({ qi, qo: shuffle(qList(cj)[qi][1].map((_, i) => i)), qa: -1 });
}
export function startQuiz() { setState({ panel: "quiz" }); showQ(getState().qi); }
export function pick(i: number) { if (getState().qa < 0) setState({ qa: i }); }
export function nextQ() { const { qi, cj } = getState(); showQ((qi + 1) % qList(cj).length); }

// ── collect: the part flies from its station into the inventory ──
export function collect() {
  const j = getState().cj, first = getState().u == 0, { x: sx, y: sy } = pulseStation(j);
  closePanel();
  setState({ u: j, pendJ: j, popJ: 0 }); store.set("gerU3", j);
  setInv(true); clearTimeout(invTm); invTm = window.setTimeout(() => setInv(false), 3200);
  const im = new Image(); im.src = thumb(j - 1); im.className = "fly"; im.style.left = sx - 55 + "px"; im.style.top = sy - 55 + "px";
  document.body.appendChild(im);
  setTimeout(() => {
    const sl = document.querySelector('.sl[data-j="' + j + '"]');
    if (!sl) { im.remove(); setState({ pendJ: 0 }); return; }
    const a = im.getBoundingClientRect(), b = sl.getBoundingClientRect();
    const an = im.animate([{ transform: "none" }, { transform: `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.55)` }],
      { duration: 800, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" });
    an.onfinish = () => { im.remove(); setState({ pendJ: 0, popJ: j }); };
  }, first ? 560 : 80);
  setTimeout(() => {
    scrollTo({ top: SC(maxJ(getState().u)), behavior: "smooth" });
    if (j == N) setTimeout(() => { const s = getState(); if (!s.panel && !s.bm.on) openDone(); }, 3200);
  }, 900);
}

// inventory slot: jump back to that station
export function goToStation(j: number) {
  const s = getState();
  if (!s.panel && !s.bm.on) scrollTo({ top: SC(j), behavior: "smooth" });
}

export function resetProgress() {
  store.set("gerU3", 0); store.remove("gerB3");
  cancelBuildTimers();
  setState({ u: 0, built: 0, popJ: 0 });
  setBm({ tray: null, done: false });
  bShow(false);
  scrollTo({ top: 0, behavior: "smooth" });
}
