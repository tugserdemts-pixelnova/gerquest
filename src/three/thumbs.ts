import { T } from "./util";
import { B } from "./parts";
import { D } from "../data/parts";

// thumbnails (2D icons) rendered once per part with a small offscreen renderer
let rr: T.WebGLRenderer | null = null;
const TS = new T.Scene(), tcam = new T.PerspectiveCamera(30, 1, .1, 50), thumbs: Record<number, string> = {};
tcam.position.set(0, 0, 10);
TS.add(new T.HemisphereLight(0xffffff, 0x998877, 1.1));
{ const dl = new T.DirectionalLight(0xffffff, .8); dl.position.set(4, 6, 6); TS.add(dl); }

export function thumb(i: number) {
  if (thumbs[i]) return thumbs[i];
  if (!rr) { rr = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); rr.setPixelRatio(1); rr.setSize(192, 192, false); }
  const o = B[D[i][0]](), bx3 = new T.Box3().setFromObject(o), c = bx3.getCenter(new T.Vector3()), sz = bx3.getSize(new T.Vector3());
  o.position.sub(c);
  const g = new T.Group(), h = new T.Group();
  h.add(o); h.scale.setScalar(3.9 / Math.max(sz.x, sz.y, sz.z)); g.add(h); g.rotation.set(.45, .7, 0);
  TS.add(g); rr.render(TS, tcam); TS.remove(g);
  return thumbs[i] = rr.domElement.toDataURL("image/png");
}
