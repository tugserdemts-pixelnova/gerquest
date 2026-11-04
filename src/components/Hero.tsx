import { useT } from "../game/hooks";
import { dom } from "../game/layout";
import Logo from "./Logo";

// title over the hero ger; the render loop fades it out as you scroll
export default function Hero() {
  const { t } = useT();
  return (
    <div className="hud" id="hero" ref={el => { dom.hero = el; }}>
      <h1 id="h1"><Logo size={190} /></h1>
      <p id="tag">{t("tag")}</p>
    </div>
  );
}
