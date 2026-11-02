import { useGame } from "../game/store";
import { useT } from "../game/hooks";

// bobbing "scroll down" hint; the render loop decides when it shows and which text
export default function Hint() {
  const { hintKey, hintHidden } = useGame();
  const { t } = useT();
  return <div className="hud" id="hint" hidden={hintHidden}>{t(hintKey)}</div>;
}
