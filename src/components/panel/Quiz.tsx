import { useGame } from "../../game/store";
import { useT } from "../../game/hooks";
import { backToInfo, collect, nextQ, pick, qList } from "../../game/actions";

// one multiple-choice question; a right answer unlocks "Collect", a wrong one offers the next question
export default function Quiz({ hidden }: { hidden: boolean }) {
  const { cj, qi, qo, qa } = useGame();
  const { t } = useT();
  const q = qo ? qList(cj)[qi] : null, ok = !!q && qa >= 0 && qo![qa] == q[2];
  return (
    <div id="pq" hidden={hidden}>
      <h3 id="qh">{t("quiz")}</h3>
      <p><b id="qq">{q?.[0]}</b></p>
      <div id="opts">
        {q && qo!.map((k, i) => (
          <button key={i} className={"opt" + (qa < 0 ? "" : k == q[2] ? " ok" : i == qa ? " bad" : "")} disabled={qa >= 0} onClick={() => pick(i)}>
            {q[1][k]}
          </button>
        ))}
      </div>
      <div className="fb" id="fb">{q && qa >= 0 ? t(ok ? "right" : "wrong") : ""}</div>
      <button className="btn g" id="get" hidden={!ok} onClick={collect}>{t("get")}</button>
      <button className="btn g" id="nq" hidden={qa < 0 || ok} onClick={nextQ}>{t("nq")}</button>
      <button className="btn o" id="back" onClick={backToInfo}>{t("back")}</button>
    </div>
  );
}
