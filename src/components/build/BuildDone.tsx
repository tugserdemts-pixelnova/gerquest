import { useGame } from "../../game/store";
import { useT } from "../../game/hooks";
import { minimizeDone, newBuild, stars } from "../../game/build";
import { dom } from "../../game/layout";
import Ornament from "../Ornament";

// finish card with 1–3 stars; "Close" shrinks it to just the "build again" button
export default function BuildDone() {
  const { bm } = useGame();
  const { t } = useT();
  const s = stars(bm.err);
  return (
    <div id="bdn" hidden={!bm.done} className={bm.min ? "min" : ""} ref={el => { dom.bdn = el; }}>
      <Ornament />
      <h2 id="bdt">{t("ready")}</h2>
      <div id="bds">{"★".repeat(s)}<i>{"★".repeat(3 - s)}</i></div>
      <p id="bdp">{t("builtMsg", { n: bm.err })}</p>
      <button type="button" className="btn" id="bag" onClick={newBuild}>{t("again")}</button>
      <button type="button" className="btn o" id="bcl" onClick={minimizeDone}>{t("close")}</button>
    </div>
  );
}
