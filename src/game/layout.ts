import { N } from "../data/parts";

// scroll layout: hero section height, then one SP-tall step per station
export const SP = () => Math.max(520, innerHeight * .65);
export const HS = () => Math.max(700, innerHeight * 1.1);
export const SC = (j: number) => HS() + j * SP();
export const maxJ = (u: number) => Math.min(N, u + 1);

// elements the render loop measures or styles every frame
export const dom = {
  hero: null as HTMLElement | null,
  bfb: null as HTMLElement | null,
  btr: null as HTMLElement | null,
  bdn: null as HTMLElement | null,
};

export const shuffle = <X>(a: X[]) => {
  for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; }
  return a;
};
