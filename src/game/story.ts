import { STORY } from "../data/story";
import { getState, setState } from "./store";
import { shuffle } from "./layout";

const BEATS = STORY.mn.length;
// beats before this one happen outside, so leaving early needs no walk back through the door
const FIRST_INSIDE = 4;

// shuffled option order for beat i (null when the beat has no question)
const orderFor = (i: number) => {
  const c = STORY.mn[i].choice;
  return c ? shuffle(c.opts.map((_, k) => k)) : null;
};

export const startStory = () => setState({ story: { on: true, i: 0, qo: orderFor(0), qa: -1 } });
export const endStory = () => setState({ story: { on: false, i: 0, qo: null, qa: -1 } });
export const pickOption = (k: number) => { const { story } = getState(); if (story.qa < 0) setState({ story: { ...story, qa: k } }); };

export function nextBeat() {
  const { story } = getState();
  if (story.i + 1 >= BEATS) endStory();
  else setState({ story: { on: true, i: story.i + 1, qo: orderFor(story.i + 1), qa: -1 } });
}

// inside the ger, skipping still walks the guest out through the door, to the last beat
export function skipStory() {
  const { story } = getState();
  if (story.i < FIRST_INSIDE || story.i >= BEATS - 1) endStory();
  else setState({ story: { on: true, i: BEATS - 1, qo: null, qa: -1 } });
}
