import { useEffect, useRef, useState } from "react";
import { useT } from "../../game/hooks";
import type { LabelKey } from "../../data/i18n";
import type { Callout } from "../../three/showcase";

// labels are named here too, so the page does not wait for the 3D code just to lay them out
const KEYS: { k: LabelKey; c: string }[] = [
  { k: "toono", c: "#be6a40" }, { k: "roof", c: "#f0dca8" }, { k: "uni", c: "#dd7a00" }, { k: "cover", c: "#f0c4b8" }, { k: "bagana", c: "#c8552e" },
  { k: "belt", c: "#6e3b25" }, { k: "felt", c: "#b0a488" }, { k: "wall", c: "#a0692d" }, { k: "floor", c: "#bdbdbd" }, { k: "door", c: "#74685a" },
];

// the turning ger beside the sign-in card. The 3D code loads after the page, so the form never waits for it.
// Without WebGL the page just shows the steppe
export default function GerSpin() {
  const { S } = useT();
  const canvas = useRef<HTMLCanvasElement>(null);
  const els = useRef<Partial<Record<LabelKey, HTMLElement>>>({}), lns = useRef<Partial<Record<LabelKey, SVGLineElement>>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stop: (() => void) | undefined, gone = false;
    import("../../three/showcase").then(({ startShowcase }) => {
      const cv = canvas.current, card = document.querySelector<HTMLElement>("#auth .ac");
      if (gone || !cv || !card) return;
      const labels: Partial<Record<LabelKey, Callout>> = {};
      KEYS.forEach(({ k }) => { const el = els.current[k], ln = lns.current[k]; if (el && ln) labels[k] = { el, ln }; });
      try { stop = startShowcase(cv, card, labels); setReady(true); } catch { /* no WebGL */ }
    });
    return () => { gone = true; stop?.(); };
  }, []);

  return (
    <div id="gs" className={ready ? "on" : ""}>
      <canvas ref={canvas} aria-hidden="true" />
      <svg aria-hidden="true">
        <defs>
          <marker id="gsa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0L10 5L0 10z" style={{ fill: "var(--ink)" }} />
          </marker>
        </defs>
        {KEYS.map(({ k }) => <line key={k} markerEnd="url(#gsa)" ref={el => { if (el) lns.current[k] = el; }} />)}
      </svg>
      {KEYS.map(({ k, c }) => (
        <div key={k} className="t" aria-hidden="true" style={{ borderColor: c }} ref={el => { if (el) els.current[k] = el; }}>{S.lb[k]}</div>
      ))}
    </div>
  );
}
