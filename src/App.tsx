import { useEffect } from "react";
import { getState, store, useGame } from "./game/store";
import { SC, maxJ } from "./game/layout";
import { killDrag } from "./game/build";
import { t } from "./data/i18n";
import { refreshStations, setJc } from "./three/engine";
import Scene from "./components/Scene";
import Spacer from "./components/Spacer";
import LangSwitch from "./components/LangSwitch";
import Hero from "./components/Hero";
import Hint from "./components/Hint";
import Labels from "./components/Labels";
import Inventory from "./components/Inventory";
import InfoPanel from "./components/panel/InfoPanel";
import BuildMode from "./components/build/BuildMode";

export default function App() {
  const { lang, u, panel, bm } = useGame();
  const lock = !!panel || bm.on;

  // language: page title + <html lang>, remembered for next visit
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t(lang, "title");
    store.set("gerLang", lang);
    killDrag();
  }, [lang]);

  // while a card or build mode is open the page stops scrolling and the canvas takes every drag
  useEffect(() => {
    document.documentElement.style.overflow = lock ? "hidden" : "";
    const cv = document.getElementById("c");
    if (cv) cv.style.touchAction = lock ? "none" : "pan-y";
  }, [lock]);

  useEffect(() => refreshStations(u), [u]);

  // start where the visitor left off
  useEffect(() => {
    const { u } = getState();
    if (u > 0) { scrollTo(0, SC(maxJ(u))); setJc(maxJ(u)); }
  }, []);

  return (
    <>
      <Spacer />
      <Scene />
      <LangSwitch />
      <Hero />
      <Hint />
      <Labels />
      <Inventory />
      <InfoPanel />
      <BuildMode />
    </>
  );
}
