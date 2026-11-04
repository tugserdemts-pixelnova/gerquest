import { useGame } from "../../game/store";
import { useT } from "../../game/hooks";
import { exitBuild } from "../../game/build";
import { ORDER } from "../../data/parts";
import BuildFeedback from "./BuildFeedback";
import BuildTray from "./BuildTray";
import BuildDone from "./BuildDone";

// "build your own ger" overlay: progress pill, exit, feedback banner, part tray, finish card
export default function BuildMode() {
  const { bm, story } = useGame();
  const { t } = useT();
  return (
    <div id="bd" className={story.on ? "st" : ""} hidden={!bm.on}>
      <span className="no" id="bpill">{`🔨 ${bm.n} / ${ORDER.length}`}</span>
      <button type="button" className="btn o" id="bxt" onClick={exitBuild}>{t("exit")}</button>
      <BuildFeedback />
      <BuildTray />
      <BuildDone />
    </div>
  );
}
