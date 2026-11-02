import { useGame } from "../../game/store";
import { useT } from "../../game/hooks";
import { trayHandlers } from "../../game/build";
import { dom } from "../../game/layout";
import { IX, ORDER } from "../../data/parts";
import { thumb } from "../../three/thumbs";

// shuffled part cards: drag one onto the ger, tap it, or press Enter on it
export default function BuildTray() {
  const { bm } = useGame();
  const { t, nm } = useT();
  return (
    <div id="btr" role="group" aria-label={t("invT")} hidden={bm.n >= ORDER.length} ref={el => { dom.btr = el; }} {...trayHandlers}>
      {bm.tray?.map(k => {
        const i = ORDER.indexOf(k);
        const cls = "bc" + (i < bm.n ? " done" : "") + (bm.hint && i == bm.n ? " next" : "") + (bm.dragK == k ? " drag" : "") + (bm.shakeK == k ? " bad" : "");
        return (
          <button key={k} type="button" className={cls} data-k={k} title={nm(k)}>
            <img src={thumb(IX[k])} alt="" draggable={false} />
            <small>{nm(k, true)}</small>
          </button>
        );
      })}
    </div>
  );
}
