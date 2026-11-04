import { useEffect, useRef } from "react";
import { useGame } from "../game/store";
import { useT } from "../game/hooks";
import { endStory, nextBeat, pickOption, skipStory } from "../game/story";
import { STORY, STORY_UI, fillSeason } from "../data/story";

// dialogue card over the 3D scene while the guest visits the ger
export default function Story() {
  const { story, season } = useGame();
  const { lang, t } = useT();
  const nextRef = useRef<HTMLButtonElement>(null);
  const ui = STORY_UI[lang], beats = STORY[lang], b = beats[story.i];
  const ch = b.choice, answered = story.qa >= 0, last = story.i == beats.length - 1;

  useEffect(() => {
    if (!story.on) return;
    const on = (e: KeyboardEvent) => { if (e.key == "Escape") skipStory(); };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, [story.on]);

  // keep keyboard focus moving with the story
  useEffect(() => { if (story.on) nextRef.current?.focus(); }, [story.on, story.i, story.qa]);

  if (!story.on) return null;
  return (
    <div id="st">
      <span className="no" id="stp">{`${story.i + 1} / ${beats.length}`}</span>
      <button type="button" className="btn o" id="stx" onClick={skipStory}>{ui.skip}</button>
      <section id="stc" aria-live="polite">
        <span className={"stw " + b.who}>{ui.who[b.who]}</span>
        <p className="stt">{fillSeason(b.text, lang, season)}</p>
        {b.note && <p className="stn">{b.note}</p>}
        {ch && <h3>{ch.q}</h3>}
        {ch && story.qo && story.qo.map(k => (
          <button key={k} type="button" disabled={answered}
            className={"opt" + (answered ? (k == 0 ? " ok" : k == story.qa ? " bad" : "") : "")} onClick={() => pickOption(k)}>
            {ch.opts[k]}
          </button>
        ))}
        {ch && answered && <p className="stf">{story.qa == 0 ? ch.ok : ch.bad}</p>}
        {(!ch || answered) && (
          <button type="button" className="btn" ref={nextRef} onClick={last ? endStory : nextBeat}>{last ? ui.finish : t("next")}</button>
        )}
      </section>
    </div>
  );
}
