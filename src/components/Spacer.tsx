import { useGame } from "../game/store";
import { useViewport } from "../game/hooks";
import { SC, maxJ } from "../game/layout";

// invisible block that gives the page its scroll length: hero + one step per reachable station
export default function Spacer() {
  const { u } = useGame();
  const { h } = useViewport();
  return <div id="sp" style={{ height: h + SC(maxJ(u)) }} />;
}
