import { useRef } from "react";
import { useGame } from "../../game/store";
import Ornament from "../Ornament";
import PartInfo from "./PartInfo";
import Quiz from "./Quiz";

// side card (bottom sheet on mobile) for the current station: info first, then its quiz
export default function InfoPanel() {
  const { panel, cj } = useGame();
  // keep showing the last view while the card fades out
  const view = useRef<"info" | "quiz">("info");
  if (panel) view.current = panel;
  return (
    <div id="pn" className={panel ? "on" : ""}>
      <Ornament />
      {cj > 0 && (
        <>
          <PartInfo hidden={view.current != "info"} />
          <Quiz hidden={view.current != "quiz"} />
        </>
      )}
    </div>
  );
}
