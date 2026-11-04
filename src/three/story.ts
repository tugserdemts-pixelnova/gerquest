import { T, PI, bx, ms } from "./util";
import { HOST_SEAT, SEAT, TABLE, furnish } from "./interior";
import { dog } from "./animals";

// the guest visit: furniture, the host family and a guest's-eye camera, staged inside the build ger.
// All positions are in ger units (floor at y 0, radius about 2, door at +z facing south, west = -x)

type P2 = [number, number];
type Pose = [number, number, number, number, number, number]; // camera x y z, look-at x y z
// one person's direction for a beat: walk through `to`, then face heading h. r / l raise the right / left arm
interface Act { to?: P2[]; h: number; sit?: boolean; r?: number; l?: number; wait?: number }
// one beat's direction; a field left out keeps its value from the beat before
interface Stage {
  cam: Pose[]; host?: Act; wife?: Act; dog?: [number, number, number, boolean];
  door?: boolean; bowl?: "hand" | "table"; plate?: boolean; bottle?: boolean;
}

const heading = (fx: number, fz: number, tx: number, tz: number) => Math.atan2(tx - fx, tz - fz);
const WIFE_HOME: P2 = [.72, .78], TEA_SPOT: P2 = [-.42, .92];
const EYE_SIT = .55, EYE_STAND = .7;
const AT_GUEST = heading(HOST_SEAT[0], HOST_SEAT[1], SEAT[0], SEAT[1]);

// lines up with STORY[lang][i] in data/story.ts
const STAGE: Stage[] = [
  // 0 arriving: the dog barks at the closed door
  { cam: [[1.1, .78, 7.2, 0, .55, 2]], host: { to: [[0, 1.05]], h: 0 }, wife: { to: [WIFE_HOME], h: -2.4 }, dog: [.62, 3.5, .35, true], door: false },
  // 1 the host comes out and holds the dog
  { cam: [[.6, .78, 6, 0, .62, 2.6]], door: true, dog: [1.05, 3.1, -.5, false], host: { to: [[0, 2.3], [-.32, 2.8]], h: .15, l: .7, wait: .5 } },
  // 2 greeting with the season
  { cam: [[.12, .78, 5, -.2, .7, 2.8]], host: { h: .1, r: .5 } },
  // 3 invited to the door: the threshold fills the view
  { cam: [[0, .72, 3.6, 0, .42, 1.5]], host: { to: [[-.72, 2.6]], h: .9, r: 1.05 } },
  // 4 inside: the host leads, the guest stops and looks left
  {
    cam: [[0, .66, 2.5, 0, .55, .6], [0, .66, 1.45, -.4, .55, .3], [-.05, .66, 1.42, -.95, .5, .35]],
    host: { to: [[-.1, 2.35], [0, 1.6], [-1.05, .95], [-1.2, -.55], HOST_SEAT], h: AT_GUEST },
    wife: { h: -2.5, r: .35 },
  },
  // 5 seated on the west side
  { cam: [[-.9, .64, 1.28, -.7, .5, .5], [SEAT[0], EYE_SIT, SEAT[1], -.15, .5, -1.05]], host: { h: AT_GUEST, sit: true } },
  // 6 snuff bottles
  { cam: [[-1.36, EYE_SIT, .22, -.3, .52, -1.05]], host: { h: AT_GUEST, sit: true, r: 1.3 }, bottle: true },
  // 7 tea: the hostess brings the bowl
  {
    cam: [[SEAT[0], EYE_SIT, SEAT[1], -.5, .76, .9]], host: { h: AT_GUEST, sit: true }, bottle: false, bowl: "hand",
    wife: { to: [[.05, .9], TEA_SPOT], h: heading(TEA_SPOT[0], TEA_SPOT[1], SEAT[0], SEAT[1]), r: 1.32, l: 1.15 },
  },
  // 8 the dairy plate on the table
  { cam: [[SEAT[0], EYE_SIT, SEAT[1], -.72, .26, -.3]], bowl: "table", plate: true, wife: { h: heading(TEA_SPOT[0], TEA_SPOT[1], SEAT[0], SEAT[1]) } },
  // 9 standing up to leave
  { cam: [[SEAT[0], EYE_STAND, SEAT[1], .1, .62, 1.7]], host: { h: AT_GUEST } },
  // 10 out of the door, backing away, and the family follows to wave
  {
    cam: [[-.75, EYE_STAND, 1.25, 0, .6, -.4], [0, EYE_STAND, 1.5, 0, .6, -.4], [0, EYE_STAND, 2.6, 0, .6, -.4], [.28, .8, 5.3, 0, .6, 2.4]],
    host: { to: [[-1.2, -.45], [-1.1, .8], [0, 1.45], [0, 2.4], [-.46, 2.82]], h: .12, r: 1.45, wait: 4.2 },
    wife: { to: [[0, 1.45], [0, 2.4], [.42, 2.8]], h: -.12, l: 1.45, wait: 5 },
    dog: [1.15, 3.3, -.4, false],
  },
  // 11 the last look: the whole ger on the steppe
  { cam: [[1.9, 1.5, 7.6, 0, .7, 1.4]] },
];

const SPEED = .85, CAM_SPEED = 1.15;

// advance `cur` along a queue of way-points and pauses; a long queue speeds up so fast clicks and Skip never leave anyone behind
function advance(cur: number[], q: (number[] | number)[], speed: number, dt: number) {
  const boost = 1 + Math.max(0, q.length - 4) * .6;
  let left = dt * boost;
  while (left > 0 && q.length) {
    const nx = q[0];
    if (typeof nx == "number") { if (nx > left) { q[0] = nx - left; return; } left -= nx; q.shift(); continue; }
    let d = 0; for (let i = 0; i < nx.length; i++) d += (nx[i] - cur[i]) ** 2;
    d = Math.sqrt(d);
    const stepLen = left * speed;
    if (d <= stepLen) { nx.forEach((v, i) => { cur[i] = v; }); left -= d / speed; q.shift(); }
    else { for (let i = 0; i < nx.length; i++) cur[i] += (nx[i] - cur[i]) * stepLen / d; left = 0; }
  }
}

const turn = (a: number, b: number, k: number) => a + (Math.atan2(Math.sin(b - a), Math.cos(b - a))) * k;

const SKIN = 0xc98f62;
function person(deel: number, trim: number, sash: number, female: boolean) {
  const g = new T.Group(), body = new T.Group(); g.add(body);
  ms(new T.CylinderGeometry(.13, .2, .66, 10).translate(0, .42, 0), deel, body);
  ms(new T.CylinderGeometry(.205, .205, .05, 10), trim, body, 0, .1);
  ms(new T.CylinderGeometry(.14, .145, .055, 10), sash, body, 0, .6);
  ms(new T.SphereGeometry(.15, 12, 8).scale(1, .62, .92), deel, body, 0, .76);
  ms(new T.CylinderGeometry(.062, .075, .07, 10), trim, body, 0, .83);
  bx(.038, .19, .01, trim, -.052, .73, .132, body).rotation.z = -.8;
  [[-.1, .69], [-.125, .655]].forEach(([x, y]) => ms(new T.SphereGeometry(.012, 6, 6), trim, body, x, y, .118));
  ms(new T.SphereGeometry(.112, 14, 12), SKIN, body, 0, .95);
  [-1, 1].forEach(s => {
    ms(new T.SphereGeometry(.0135, 6, 6), 0x1c1410, body, s * .042, .965, .103);
    ms(new T.SphereGeometry(.024, 6, 6).scale(1, .7, .4), 0xd9654f, body, s * .066, .925, .094);
    bx(.09, .07, .17, 0x3a2418, s * .09, .05, .03, g);
  });
  bx(.05, .012, .01, 0x8a4630, 0, .905, .109, body);
  if (female) {
    ms(new T.SphereGeometry(.118, 14, 8, 0, PI * 2, 0, 1.3), 0x1c1410, body, 0, .955, -.012);
    ms(new T.TorusGeometry(.108, .018, 6, 18).rotateX(PI / 2 - .25), 0xf4c24d, body, 0, 1.0, 0);
    [-1, 1].forEach(s => ms(new T.CylinderGeometry(.026, .012, .42, 6), 0x1c1410, body, s * .11, .8, -.04));
  } else {
    ms(new T.SphereGeometry(.116, 14, 8, 0, PI * 2, 0, 1.45), 0x1f3a7a, body, 0, 1.0);
    ms(new T.TorusGeometry(.118, .034, 8, 20).rotateX(PI / 2), 0x4a3424, body, 0, 1.012);
    ms(new T.SphereGeometry(.018, 8, 8), 0xf4c24d, body, 0, 1.125);
  }
  const arm = (s: number) => {
    const p = new T.Group(); p.position.set(s * .158, .75, 0); body.add(p);
    ms(new T.CylinderGeometry(.044, .054, .35, 8).translate(0, -.175, 0), deel, p);
    ms(new T.SphereGeometry(.04, 8, 8), SKIN, p, 0, -.38);
    const hand = new T.Group(); hand.position.set(0, -.42, 0); p.add(hand);
    return { p, hand };
  };
  const r = arm(-1), l = arm(1);
  return { g, body, r, l };
}

// a bowl of milk tea, blue rim on white porcelain
const teaBowl = (p: T.Object3D, x: number, y: number, z: number) => {
  const g = new T.Group(); g.position.set(x, y, z); p.add(g);
  ms(new T.CylinderGeometry(.06, .036, .05, 12), 0xf6f2ea, g);
  ms(new T.CylinderGeometry(.056, .056, .004, 12), 0xc9a87a, g, 0, .023);
  ms(new T.TorusGeometry(.059, .004, 6, 16).rotateX(PI / 2), 0x1f4597, g, 0, .025);
  return g;
};

// the tavag: boortsog stacked in a ring, aaruul on top, urum on the side
function dairyPlate(x: number, y: number, z: number, p: T.Object3D) {
  const g = new T.Group(); g.position.set(x, y, z); p.add(g);
  ms(new T.CylinderGeometry(.13, .1, .022, 18), 0xf6f2ea, g);
  ms(new T.TorusGeometry(.128, .005, 6, 22).rotateX(PI / 2), 0x1f4597, g, 0, .011);
  for (let lv = 0; lv < 3; lv++) for (let i = 0; i < 6; i++) {
    const a = i / 6 * PI * 2 + lv * .5;
    const b = bx(.09, .022, .03, 0xb8803c, Math.cos(a) * .05, .024 + lv * .023, Math.sin(a) * .05, g); b.rotation.y = -a;
  }
  for (let i = 0; i < 7; i++) { const a = i / 7 * PI * 2; bx(.022, .022, .022, 0xf3ecd8, Math.cos(a) * .028, .1 + (i % 2) * .012, Math.sin(a) * .028, g); }
  ms(new T.CylinderGeometry(.038, .038, .012, 12), 0xf4dc92, g, .085, .02, .05);
  return g;
}

export function createStage(ger: T.Object3D, door: T.Object3D) {
  const root = new T.Group(); root.visible = false; ger.add(root);
  furnish(root);
  const host = person(0x1f4597, 0xf4c24d, 0xe2582a, false), wife = person(0xb4323a, 0xf4c24d, 0x4a9ad4, true), pup = dog();
  root.add(host.g, wife.g, pup.g);
  pup.g.scale.setScalar(.75);
  host.g.scale.setScalar(.98); wife.g.scale.setScalar(.92);
  const bowlHand = teaBowl(wife.r.hand, 0, -.05, 0), bowlTable = teaBowl(root, TABLE[0] - .17, .29, TABLE[1] + .08);
  const plate = dairyPlate(TABLE[0] + .08, .277, TABLE[1] - .02, root);
  const bottle = ms(new T.CylinderGeometry(.018, .028, .075, 8), 0x3f9c86, host.r.hand, 0, -.04);

  // the guest's eye, smoothed so the corners of the path stay soft
  const REDUCED = typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mover = (p: { g: T.Group; body: T.Group; r: { p: T.Group }; l: { p: T.Group } }) => ({ p, q: [] as (number[] | number)[], at: [0, 0], h: 0, sit: 0, r: 0, l: 0, act: { h: 0 } as Act, ph: 0 });
  const H = mover(host), W = mover(wife);
  const cam: number[] = [...STAGE[0].cam[0]], eye = [...STAGE[0].cam[0]], camQ: (number[] | number)[] = [];
  let cur = -1, doorOpen = false, doorA = 0, dogBark = false, dogT: [number, number, number] = [.7, 3.2, .2];

  const direct = (m: typeof H, a: Act) => { if (a.wait && !REDUCED) m.q.push(a.wait); (a.to || []).forEach(p => m.q.push([...p])); m.act = a; };

  function enter(i: number) {
    const s = STAGE[i];
    s.cam.forEach(c => camQ.push([...c]));
    if (s.host) direct(H, s.host);
    if (s.wife) direct(W, s.wife);
    if (s.door != null) doorOpen = s.door;
    if (s.dog) { dogT = [s.dog[0], s.dog[1], s.dog[2]]; dogBark = s.dog[3]; }
    if (s.bowl) { bowlHand.visible = s.bowl == "hand"; bowlTable.visible = s.bowl == "table"; }
    if (s.plate != null) plate.visible = s.plate;
    if (s.bottle != null) bottle.visible = s.bottle;
  }

  function reset() {
    cur = -1; doorOpen = false; doorA = 0; door.rotation.y = 0; camQ.length = 0;
    bowlHand.visible = bowlTable.visible = plate.visible = bottle.visible = false;
    STAGE[0].cam[0].forEach((v, i) => { cam[i] = eye[i] = v; });
    [H, W].forEach(m => { m.q.length = 0; m.sit = m.r = m.l = 0; m.act = { h: 0 }; });
    H.at = [...STAGE[0].host!.to![0]]; W.at = [...STAGE[0].wife!.to![0]];
    H.h = 0; W.h = STAGE[0].wife!.h;
    pup.g.position.set(dogT[0] = .7, -.08, dogT[1] = 3.2);
  }
  reset();

  function pose(m: typeof H, dt: number, now: number) {
    const was = m.at.slice();
    advance(m.at, m.q, REDUCED ? 99 : SPEED, dt);
    const dx = m.at[0] - was[0], dz = m.at[1] - was[1], moving = Math.hypot(dx, dz) > 1e-5, k = Math.min(1, dt * 6), a = m.act;
    if (moving) m.ph += dt * 10;
    m.h = turn(m.h, moving ? Math.atan2(dx, dz) : a.h, k);
    const done = !m.q.length;
    m.sit += ((done && a.sit ? 1 : 0) - m.sit) * k;
    m.r += ((done ? a.r || 0 : 0) - m.r) * k;
    m.l += ((done ? a.l || 0 : 0) - m.l) * k;
    const out = m.at[1] > 2.03, p = m.p;
    p.g.position.set(m.at[0], out ? -.08 : 0, m.at[1]); p.g.rotation.y = m.h;
    p.body.position.y = (moving ? Math.abs(Math.sin(m.ph)) * .018 : Math.sin(now * .0016 + m.at[0]) * .003) - m.sit * .2;
    p.body.scale.y = 1 - m.sit * .03;
    const swing = moving ? Math.sin(m.ph) * .3 : 0;
    p.r.p.rotation.x = -m.r + swing; p.l.p.rotation.x = -m.l - swing;
  }

  return {
    root,
    // i = current beat. Returns the camera (x y z, look x y z) in ger units
    tick(i: number, dt: number, now: number) {
      while (cur < i) enter(++cur);
      advance(cam, camQ, REDUCED ? 99 : CAM_SPEED, dt);
      const k = REDUCED ? 1 : 1 - Math.exp(-dt * 4.5);
      for (let c = 0; c < 6; c++) eye[c] += (cam[c] - eye[c]) * k;
      pose(H, dt, now); pose(W, dt, now);
      bowlHand.rotation.x = W.r; // stays level as the arm lifts it
      doorA += ((doorOpen ? 1.95 : 0) - doorA) * Math.min(1, dt * 3.2); door.rotation.y = doorA;
      const g = pup.g;
      g.position.x += (dogT[0] - g.position.x) * Math.min(1, dt * 3); g.position.z += (dogT[1] - g.position.z) * Math.min(1, dt * 3);
      g.rotation.y = dogT[2] - PI / 2;
      pup.tail.rotation.x = Math.sin(now * .012) * .3;
      pup.head.rotation.z = dogBark ? .25 + Math.max(0, Math.sin(now * .014)) * .3 : .05;
      return eye;
    },
    reset,
  };
}
