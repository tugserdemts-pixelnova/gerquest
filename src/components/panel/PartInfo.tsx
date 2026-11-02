import { useGame } from "../../game/store";
import { useT } from "../../game/hooks";
import { closePanel, startQuiz } from "../../game/actions";
import { enterBuild } from "../../game/build";
import { D, N } from "../../data/parts";

// the part's name and two paragraphs; after the last part it turns into the "well done" card
export default function PartInfo({ hidden }: { hidden: boolean }) {
  const { cj, pdone, u } = useGame();
  const { t, S } = useT();
  const d = D[cj - 1], P = S.P[cj - 1];
  return (
    <div id="pi" hidden={hidden}>
      <span className="no" id="pno">{pdone ? "🏆" : `${cj} / ${N}`}</span>
      <h2 id="pt">{pdone ? t("h1") : P[0]}</h2>
      <div className="bar" id="pbar" style={{ background: pdone ? "#e8b84a" : d[1] }} />
      <div id="pb">
        {pdone ? <p>{t("congrats", { n: N })}</p> : <><p>{P[2]}</p><p>{P[3]}</p></>}
      </div>
      <button className="btn" id="nx" hidden={pdone || cj - 1 < u} onClick={startQuiz}>{t("next")}</button>
      <button className="btn" id="bld" hidden={!pdone} onClick={enterBuild}>{t("build")}</button>
      <button className="btn o" id="cl" onClick={closePanel}>{t("close")}</button>
    </div>
  );
}
