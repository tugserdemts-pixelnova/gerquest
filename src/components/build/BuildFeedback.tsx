import { useRef } from "react";
import { useGame, type Feedback } from "../../game/store";
import { useT } from "../../game/hooks";
import { dismissFb } from "../../game/build";
import { dom } from "../../game/layout";
import { ORDER } from "../../data/parts";

// banner under the pill: the tip, a "✓ placed" note, or why a part can't go on yet
export default function BuildFeedback() {
  const { bm } = useGame();
  const { t, nm, S } = useT();
  // keep the last message while the banner fades out
  const last = useRef<Feedback | null>(null);
  if (bm.fb) last.current = bm.fb;
  const f = last.current;
  return (
    <div id="bfb" aria-live="polite" className={bm.fb ? "on " + bm.fb.ty : ""} ref={el => { dom.bfb = el; }}>
      {f && (f.ty == "bad" ? (
        <>
          <b>{t("notYet", { part: nm(f.k) })}</b>
          <p>{S.B[f.k][1]}</p>
          {bm.n < ORDER.length && <p className="nx">{t("placeNext", { part: nm(ORDER[bm.n]) })}</p>}
          <button type="button" className="btn g" id="bok" onClick={dismissFb}>{t("gotIt")}</button>
        </>
      ) : (
        <b>{f.ty == "ok" ? "✓ " + S.B[f.k][0] : t("tip")}</b>
      ))}
    </div>
  );
}
