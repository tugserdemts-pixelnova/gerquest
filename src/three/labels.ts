import type { LabelKey } from "../data/i18n";
import type { GerGroup } from "./ger";

// hero labels: k = text key in L[lang].lb, g = group in the ger's userData.G
// either r/y (radius and height, on side s) or a fixed anchor a; c = border colour
export interface LabelPoint {
  k: LabelKey; g: GerGroup; r?: number; y?: number; a?: [number, number, number]; s: "L" | "R" | null; c: string;
  el?: HTMLDivElement | null; ln?: SVGLineElement | null;
  ax?: number; ay?: number; ly?: number; side?: number;
}

export const LP: LabelPoint[] = [
  { k: "toono", g: "Tn", r: .5, y: 1.8, s: "L", c: "#be6a40" },
  { k: "roof", g: "Rf", r: 1.35, y: 1.52, s: "R", c: "#f0dca8" },
  { k: "uni", g: "Un", r: 1.3, y: 1.42, s: "L", c: "#dd7a00" },
  { k: "bagana", g: "Cl", a: [.55, .9, 0], s: null, c: "#c8552e" },
  { k: "cover", g: "W", r: 2.07, y: .85, s: "R", c: "#f0c4b8" },
  { k: "felt", g: "FW", r: 2.03, y: .25, s: "R", c: "#b0a488" },
  { k: "wall", g: "Lat", r: 1.9, y: .3, s: "R", c: "#a0692d" },
  { k: "belt", g: "Bs", r: 2.06, y: .65, s: "L", c: "#6e3b25" },
  { k: "door", g: "Dr", a: [0, .5, 2.05], s: null, c: "#74685a" },
  { k: "floor", g: "F", r: 1.8, y: -.07, s: "L", c: "#bdbdbd" },
];

export const labelLayer = { root: null as HTMLDivElement | null };
