import { useT } from "../game/hooks";
import { dom } from "../game/layout";

// title over the hero ger; the render loop fades it out as you scroll
export default function Hero() {
  const { t } = useT();
  return (
    <div className="hud" id="hero" ref={el => { dom.hero = el; }}>
      <h1 id="h1">{t("h1")}</h1>
    </div>
  );
}
