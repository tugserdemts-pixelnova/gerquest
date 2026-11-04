import type { Group } from "three";
import { buildWall } from "./wall";
import { buildToono } from "./toono";
import { buildUni } from "./uni";
import { buildBaganaPair } from "./bagana";
import { buildBelt } from "./belt";
import { buildCover } from "./cover";
import { buildFelt } from "./felt";
import { buildDoor } from "./door";
import { buildFloor } from "./floor";

// station / thumbnail model for each part, keyed by D[i][0]
export const B: Record<string, () => Group> = {
  "хана": buildWall,
  "тооно": buildToono,
  "унь": buildUni,
  "багана": buildBaganaPair,
  "бүслүүр": buildBelt,
  "бүрээс": buildCover,
  "туурга": buildFelt,
  "хаалга": buildDoor,
  "шал": buildFloor,
};
