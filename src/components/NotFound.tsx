import { useEffect } from "react";
import Link from "next/link";
import { useT } from "../game/hooks";
import Ornament from "./Ornament";
import Settings from "./Settings";
import Logo from "./Logo";
import Steppe from "./Steppe";

// 404 card over the steppe, in the visitor's language
export default function NotFound() {
  const { t, lang } = useT();
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t("nfT") + " · HOTOL";
  }, [lang]);
  return (
    <main id="login">
      <Steppe />
      <Settings seasons={false} />
      <div className="lc nf">
        <Ornament />
        <Logo size={96} />
        <span className="no">404</span>
        <h2>{t("nfT")}</h2>
        <p>{t("nfSub")}</p>
        <Link className="btn" href="/">{t("home")}</Link>
      </div>
    </main>
  );
}
