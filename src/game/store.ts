import { useSyncExternalStore } from "react";
import { N } from "../data/parts";
import type { Lang } from "../data/i18n";
import { SEASONS, type Season } from "../data/seasons";

export type PanelMode = null | "info" | "quiz";
export type Feedback = { ty: "tip" } | { ty: "ok" | "bad"; k: string };

// build mode: n parts placed, err mistakes, tray = shuffled card order, fb = banner/toast shown, hint = pulse the right card
export interface BuildState {
  on: boolean; n: number; err: number; tray: string[] | null; fb: Feedback | null;
  hint: boolean; done: boolean; min: boolean; inv: boolean;
  dragK: string | null; shakeK: string | null;
}

// the guest visit after the build: beat i, qo = shuffled option order, qa = option picked (-1 = not answered yet)
export interface StoryState { on: boolean; i: number; qo: number[] | null; qa: number }

export interface GameState {
  lang: Lang;
  season: Season; // "gerSeason"
  u: number; // parts collected ("gerU3")
  built: number; // stars of the best finished build ("gerB3", 0 = not built yet)
  panel: PanelMode; cj: number; pdone: boolean;
  // quiz: qo = shuffled option order, qa = position the user picked (-1 = not answered yet)
  qi: number; qo: number[] | null; qa: number;
  invOpen: boolean; invAway: boolean;
  pendJ: number; popJ: number; // slot waiting for its fly-in · slot that just received it
  hintKey: "hint1" | "hint2"; hintHidden: boolean;
  bm: BuildState;
  story: StoryState;
}

const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const u0 = Math.min(N, +(read("gerU3") || 0) || 0);

let state: GameState = {
  lang: read("gerLang") == "en" ? "en" : "mn",
  season: SEASONS.find(s => s == read("gerSeason")) || "summer",
  u: u0,
  built: u0 == N ? Math.min(3, +(read("gerB3") || 0) || 0) : 0,
  panel: null, cj: 0, pdone: false,
  qi: 0, qo: null, qa: -1,
  invOpen: false, invAway: false,
  pendJ: 0, popJ: 0,
  hintKey: "hint1", hintHidden: false,
  bm: { on: false, n: 0, err: 0, tray: null, fb: null, hint: false, done: false, min: false, inv: false, dragK: null, shakeK: null },
  story: { on: false, i: 0, qo: null, qa: -1 },
};

const listeners = new Set<() => void>();
export const getState = () => state;
export const setState = (p: Partial<GameState>) => { state = { ...state, ...p }; listeners.forEach(l => l()); };
export const setBm = (p: Partial<BuildState>) => setState({ bm: { ...state.bm, ...p } });
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const useGame = () => useSyncExternalStore(subscribe, getState);

export const setSeason = (s: Season) => { setState({ season: s }); store.set("gerSeason", s); };

export const store = {
  set: (k: string, v: string | number) => { try { localStorage.setItem(k, String(v)); } catch { /* storage blocked */ } },
  remove: (k: string) => { try { localStorage.removeItem(k); } catch { /* storage blocked */ } },
};
