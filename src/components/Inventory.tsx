import { useGame } from "../game/store";
import { useT, useViewport } from "../game/hooks";
import { goToStation, resetProgress, toggleInv } from "../game/actions";
import { enterBuild } from "../game/build";
import { D, N } from "../data/parts";
import { thumb } from "../three/thumbs";
import Ornament from "./Ornament";

// collected parts: a slide-in drawer (right side on desktop, top on mobile) + its toggle tab
export default function Inventory() {
  const { u, built, invOpen, invAway, pendJ, popJ } = useGame();
  const { t, nm } = useT();
  const { w } = useViewport();
  const cls = [u > 0 && "on", invOpen && "open", invAway && "away"].filter(Boolean).join(" ");
  return (
    <>
      <aside id="inv" className={cls}>
        <div className="ih">
          <span>{t("inv")}</span>
          <b>{u}/{N}</b>
          {u == N && (
            <button id="hb" title={t("buildT") + (built ? " " + "★".repeat(built) : "")} onClick={enterBuild}>🔨</button>
          )}
          <button id="rs" title={t("reset")} onClick={resetProgress}>↺</button>
        </div>
        <Ornament />
        <div className="ig">
          {D.map((d, i) =>
            i < u ? (
              <button key={i} className={"sl" + (pendJ == i + 1 ? " pend" : "") + (popJ == i + 1 ? " pop" : "")}
                data-j={i + 1} title={nm(d[0])} onClick={() => goToStation(i + 1)}>
                <em>{i + 1}</em>
                <img src={thumb(i)} alt="" />
                <small>{nm(d[0], true)}</small>
              </button>
            ) : (
              <div key={i} className="sl e"><em>{i + 1}</em><span>?</span></div>
            ),
          )}
        </div>
      </aside>
      <button id="invt" hidden={u <= 0 || invAway} className={invOpen ? "open" : ""} title={t("invT")} onClick={toggleInv}>
        {w > 800 ? (invOpen ? "›" : "‹") : (invOpen ? "▴" : "▾")}
      </button>
    </>
  );
}
