import { useEffect } from "react";
import { getState, useGame } from "./game/store";
import { SC, maxJ } from "./game/layout";
import { killDrag } from "./game/build";
import { t } from "./data/i18n";
import { applySeason, refreshStations, setJc } from "./three/engine";
import Scene from "./components/Scene";
import Spacer from "./components/Spacer";
import Settings from "./components/Settings";
import Hero from "./components/Hero";
import Hint from "./components/Hint";
import Labels from "./components/Labels";
import Inventory from "./components/Inventory";
import InfoPanel from "./components/panel/InfoPanel";
import BuildMode from "./components/build/BuildMode";
import Story from "./components/Story";
import SignOut from "./components/auth/SignOut";

export default function App() {
  const { lang, u, panel, bm, season } = useGame();
  const lock = !!panel || bm.on;

  // language: page title + <html lang>
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t(lang, "title");
    killDrag();
  }, [lang]);

  // while a card or build mode is open the page stops scrolling and the canvas takes every drag
  useEffect(() => {
    document.documentElement.style.overflow = lock ? "hidden" : "";
    const cv = document.getElementById("c");
    if (cv) cv.style.touchAction = lock ? "none" : "pan-y";
  }, [lock]);

  useEffect(() => refreshStations(u), [u]);

  // the scene blends to the new season; the UI picks up its accent colour
  useEffect(() => { applySeason(season); document.documentElement.dataset.season = season; }, [season]);

  // start where the visitor left off; someone who has finished starts from the top
  useEffect(() => {
    const { u, built } = getState();
    if (u > 0 && !built) { scrollTo(0, SC(maxJ(u))); setJc(maxJ(u)); }
  }, []);

  return (
    <>
      <Spacer />
      <Scene />
      <Settings />
      <SignOut />
      <Hero />
      <Hint />
      <Labels />
      <Inventory />
      <InfoPanel />
      <BuildMode />
      <Story />
    </>
  );
}
