import { useT, useViewport } from "../game/hooks";
import { LP, labelLayer } from "../three/labels";

// callout labels around the exploded hero ger; positions are written by the render loop every frame
export default function Labels() {
  const { S } = useT();
  const { w } = useViewport();
  const q = (w < 600 && S.lbS) || S.lb;
  return (
    <div id="lbl" ref={el => { labelLayer.root = el; }}>
      <svg>
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0L10 5L0 10z" style={{ fill: "var(--ink)" }} />
          </marker>
        </defs>
        {LP.map(p => <line key={p.k} markerEnd="url(#ah)" ref={el => { p.ln = el; }} />)}
      </svg>
      {LP.map(p => (
        <div key={p.k} className="t" style={{ borderColor: p.c }} ref={el => { p.el = el; }}>{q[p.k]}</div>
      ))}
    </div>
  );
}
