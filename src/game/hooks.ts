import { useEffect, useState } from "react";
import { useGame } from "./store";
import { L, nm, t, type TextKey } from "../data/i18n";

// text helpers bound to the current language
export function useT() {
  const { lang } = useGame();
  return {
    lang,
    S: L[lang],
    t: (k: TextKey, v?: Record<string, string | number>) => t(lang, k, v),
    nm: (k: string, short?: boolean) => nm(lang, k, short),
  };
}

// window size, re-rendered on resize
export function useViewport() {
  const [vp, setVp] = useState({ w: innerWidth, h: innerHeight });
  useEffect(() => {
    const on = () => setVp({ w: innerWidth, h: innerHeight });
    addEventListener("resize", on);
    return () => removeEventListener("resize", on);
  }, []);
  return vp;
}
