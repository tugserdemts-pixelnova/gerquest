import { setState, store } from "../game/store";
import { useT } from "../game/hooks";
import type { Lang } from "../data/i18n";

const LANGS: Lang[] = ["mn", "en"];

export default function LangSwitch() {
  const { lang, t } = useT();
  return (
    <div id="lg" role="group" aria-label={t("lang")}>
      {LANGS.map(l => (
        <button key={l} type="button" aria-pressed={l == lang} onClick={() => { if (l != lang) { setState({ lang: l }); store.set("gerLang", l); } }}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
