import { useGame } from "../game/store";
import { useT, useViewport } from "../game/hooks";
import { setSeason } from "../game/actions";
import { SEASONS } from "../data/seasons";

const ICON = { spring: "🌸", summer: "☀️", autumn: "🍂", winter: "❄️" };

// four-season picker next to the language switch; the active season shows its name.
// On phones it steps aside while the inventory drawer or build mode needs the top bar.
export default function SeasonSwitch() {
  const { season, invOpen, bm } = useGame();
  const { t } = useT();
  const { w } = useViewport();
  if (w <= 800 && (invOpen || bm.on)) return null;
  return (
    <div id="ssn" role="group" aria-label={t("season")}>
      {SEASONS.map(s => (
        <button key={s} type="button" data-s={s} aria-pressed={s == season} aria-label={t(s)} title={t(s)}
          onClick={() => { if (s != season) setSeason(s); }}>
          <span aria-hidden="true">{ICON[s]}</span>
          {s == season && <b>{t(s)}</b>}
        </button>
      ))}
    </div>
  );
}
