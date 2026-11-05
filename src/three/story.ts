import { T, PI, bx, ms, sm } from "./util";
import { HOST_SEAT, SEAT, TABLE, furnish } from "./interior";
import { dog } from "./animals";
import { person } from "./people";
import { STORY } from "../data/story";

// the guest visit: furniture, the host family and a guest's-eye camera, staged inside the build ger.
// All positions are in ger units (floor at y 0, radius about 2, door at +z facing south, west = -x)

type P2 = [number, number];
type Pose = [number, number, number, number, number, number]; // camera x y z, look-at x y z
// one person's direction for a beat: walk through `to`, then face heading h. r / l raise the right / left arm
// (carry: already while walking), lean bends forward, wave waves the raised right arm
interface Act { to?: P2[]; h: number; sit?: boolean; r?: number; l?: number; wait?: number; lean?: number; carry?: boolean; wave?: boolean }
// one beat's direction; a field left out keeps its value from the beat before. A number in cam is a pause.
// lay: the hostess puts the tea and the food on the table when she gets there
interface Stage {
  cam: (Pose | number)[]; host?: Act; wife?: Act; dog?: [number, number, number, boolean];
  door?: boolean; bowl?: boolean; lay?: boolean; bottle?: boolean;
}

const heading = (fx: number, fz: number, tx: number, tz: number) => Math.atan2(tx - fx, tz - fz);
const WIFE_HOME: P2 = [.78, .86], TEA_SPOT: P2 = [-.86, .78], TABLE_SPOT: P2 = [-.38, -.68];
const EYE_SIT = .55, EYE_STAND = .7;
const AT_GUEST = heading(HOST_SEAT[0], HOST_SEAT[1], SEAT[0], SEAT[1]), REST = .42; // REST: hands on the knees
const DOG_HELD: [number, number, number, boolean] = [-1.02, 3.12, .7, false], HOLD_SPOT: P2 = [-.62, 2.95];
// sunwise up the west side, then behind the west pillar and round the table: never between the pillars.
// The way out is the same path backwards
const TO_HOIMOR: P2[] = [[-.72, .92], [-1, .2], [-.95, -.28], [-.42, -.29], [-.36, -.62], [-.22, -.95]], FROM_HOIMOR = [...TO_HOIMOR].reverse();

// lines up with STORY[lang][i] in data/story.ts
const STAGE: Stage[] = [
  // 0 arriving: the dog barks at the closed door
  { cam: [[1.1, .78, 7.2, 0, .55, 2]], host: { to: [[0, 1.05]], h: 0 }, wife: { to: [WIFE_HOME], h: -2.4 }, dog: [.62, 3.5, .35, true], door: false },
  // 1 the host comes out and holds the dog
  { cam: [[.6, .78, 6, 0, .62, 2.6]], door: true, dog: DOG_HELD, host: { to: [[0, 2.3], HOLD_SPOT], h: heading(HOLD_SPOT[0], HOLD_SPOT[1], DOG_HELD[0], DOG_HELD[1]), l: .45, lean: .32, wait: .5 } },
  // 2 greeting with the season
  { cam: [[.12, .78, 5, -.2, .7, 2.8]], host: { h: .1, r: .5 } },
  // 3 invited to the door: the threshold fills the view
  { cam: [[0, .72, 3.6, 0, .42, 1.5]], host: { to: [[-.6, 2.62]], h: 1.9, r: .75 } },
  // 4 inside: the host leads, the guest stops and looks left
  {
    cam: [.7, [0, .66, 2.5, 0, .55, .6], [0, .66, 1.45, -.4, .55, .3], [-.05, .66, 1.42, -.95, .5, .35]],
    host: { to: [[-.1, 2.35], [0, 1.6], ...TO_HOIMOR, HOST_SEAT], h: AT_GUEST },
    wife: { h: -2.5, r: .35 },
  },
  // 5 seated on the west side
  { cam: [[-.62, .64, 1.02, -.7, .5, .5], [SEAT[0], EYE_SIT, SEAT[1], -.15, .5, -1.05]], host: { h: AT_GUEST, sit: true, r: REST, l: REST } },
  // 6 snuff bottles
  { cam: [[-1.36, EYE_SIT, .22, -.3, .52, -1.05]], host: { h: AT_GUEST, sit: true, r: .9, l: REST }, bottle: true },
  // 7 tea: the hostess brings the bowl
  {
    cam: [[SEAT[0], EYE_SIT, SEAT[1], -.86, .56, .78]], host: { h: AT_GUEST, sit: true, r: REST, l: REST }, bottle: false, bowl: true,
    wife: { to: [[.05, .92], TEA_SPOT], h: heading(TEA_SPOT[0], TEA_SPOT[1], SEAT[0], SEAT[1]), r: .9, l: .9, carry: true },
  },
  // 8 the dairy plate on the table
  {
    cam: [[SEAT[0], EYE_SIT, SEAT[1], -.72, .34, -.66]], lay: true,
    wife: { to: [[-1, .2], [-.95, -.28], [-.42, -.29], TABLE_SPOT], h: heading(TABLE_SPOT[0], TABLE_SPOT[1], SEAT[0], SEAT[1]), r: .9, l: .9, carry: true },
  },
  // 9 standing up to leave
  { cam: [[SEAT[0], EYE_STAND, SEAT[1], .1, .62, 1.7]], host: { h: AT_GUEST } },
  // 10 out of the door, backing away, and the family follows to wave
  {
    cam: [[-.55, EYE_STAND, 1.12, 0, .6, -.4], [0, EYE_STAND, 1.5, 0, .6, -.4], [0, EYE_STAND, 2.6, 0, .6, -.4], [.28, .8, 5.3, 0, .6, 2.4]],
    host: { to: [...FROM_HOIMOR, [0, 1.45], [0, 2.4], [-.42, 2.9]], h: .12, r: 2.3, wave: true, wait: 4.4 },
    wife: { to: [...FROM_HOIMOR.slice(2), [0, 1.45], [0, 2.4], [.3, 2.92]], h: -.12, r: 2.3, wave: true, wait: 3.2 },
  },
  // 11 the last look: the whole ger on the steppe
  { cam: [[1.9, 1.5, 7.6, 0, .7, 1.4]] },
];

const SPEED = .85, CAM_SPEED = 1.15;

// advance `cur` along a queue of way-points and pauses. keep = how many of them belong to the current beat:
// anything older speeds the walk up, so fast clicks and Skip never leave anyone behind
function advance(cur: number[], q: (number[] | number)[], speed: number, dt: number, keep: number) {
  const boost = 1 + Math.max(0, q.length - keep) * .6;
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

// a bowl of milk tea, blue rim on white porcelain
const teaBowl = (p: T.Object3D, x: number, y: number, z: number) => {
  const g = new T.Group(); g.position.set(x, y, z); g.scale.setScalar(.75); p.add(g);
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
  const host = person(0x1f4597, 0xf4c24d, 0xe2582a, false, 1), wife = person(0xb4323a, 0xf4c24d, 0x4a9ad4, true, .93), pup = dog();
  root.add(host.g, wife.g, pup.g);
  pup.g.scale.setScalar(.75);
  const bowlHand = teaBowl(wife.r.hand, 0, .034, .02), bowlTable = teaBowl(root, TABLE[0] - .17, .279, TABLE[1] + .08);
  const plate = dairyPlate(TABLE[0] + .08, .277, TABLE[1] - .02, root), plateHand = dairyPlate(0, .03, .02, wife.l.hand); plateHand.scale.setScalar(.6);
  const bottle = ms(new T.CylinderGeometry(.012, .018, .05, 8), 0x3f9c86, host.r.hand, 0, .02);

  // the guest's eye, smoothed so the corners of the path stay soft
  const REDUCED = typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mover = (p: typeof host) => ({ p, q: [] as (number[] | number)[], at: [0, 0], h: 0, sit: 0, r: 0, l: 0, lean: 0, wave: 0, mv: 0, yaw: 0, nod: 0, talk: 0, act: { h: 0 } as Act, ph: 0, keep: 0 });
  const H = mover(host), W = mover(wife), START = STAGE[0].cam[0] as Pose;
  const cam: number[] = [...START], eye = [...START], camQ: (number[] | number)[] = [];
  let cur = -1, doorOpen = false, doorA = 0, dogBark = false, dogT: [number, number, number] = [.7, 3.2, .2], dogA = 0, lay = false, beatT = 0, camKeep = 0;

  const direct = (m: typeof H, a: Act) => {
    const was = m.q.length;
    if (a.wait && !REDUCED) m.q.push(a.wait);
    (a.to || []).forEach(p => m.q.push([...p]));
    m.keep = m.q.length - was; m.act = a;
  };

  function enter(i: number) {
    const s = STAGE[i];
    beatT = 0;
    const was = camQ.length;
    s.cam.forEach(c => { if (typeof c != "number") camQ.push([...c]); else if (!REDUCED) camQ.push(c); });
    camKeep = camQ.length - was;
    if (s.host) direct(H, s.host);
    if (s.wife) direct(W, s.wife);
    if (s.door != null) doorOpen = s.door;
    if (s.dog) { dogT = [s.dog[0], s.dog[1], s.dog[2]]; dogBark = s.dog[3]; }
    if (s.bowl) bowlHand.visible = true;
    if (s.lay) lay = plateHand.visible = true;
    if (s.bottle != null) bottle.visible = s.bottle;
  }

  function reset() {
    cur = -1; doorOpen = false; doorA = 0; door.rotation.y = 0; camQ.length = 0; lay = false;
    bowlHand.visible = bowlTable.visible = plate.visible = plateHand.visible = bottle.visible = false;
    START.forEach((v, i) => { cam[i] = eye[i] = v; });
    [H, W].forEach(m => { m.q.length = 0; m.sit = m.r = m.l = m.lean = m.wave = m.mv = m.yaw = m.nod = m.talk = 0; m.act = { h: 0 }; });
    H.at = [...STAGE[0].host!.to![0]]; W.at = [...STAGE[0].wife!.to![0]];
    H.h = 0; W.h = STAGE[0].wife!.h;
    pup.g.position.set(dogT[0] = .7, -.08, dogT[1] = 3.2); dogT[2] = .2; dogA = .2 - PI / 2;
  }
  reset();

  function pose(m: typeof H, dt: number, now: number, speaking: boolean) {
    const was = m.at.slice();
    advance(m.at, m.q, REDUCED ? 99 : SPEED, dt, m.keep);
    const dx = m.at[0] - was[0], dz = m.at[1] - was[1], step = Math.hypot(dx, dz), moving = step > 1e-5, k = Math.min(1, dt * 6), s = Math.min(1, dt * 4), a = m.act, [x, z] = m.at;
    m.ph += step * 24; m.mv += ((moving ? 1 : 0) - m.mv) * k;
    m.h = turn(m.h, moving ? Math.atan2(dx, dz) : a.h, k);
    const done = !m.q.length, up = done || a.carry;
    m.sit += ((done && a.sit ? 1 : 0) - m.sit) * s;
    m.r += ((up ? a.r || 0 : 0) - m.r) * s; m.l += ((up ? a.l || 0 : 0) - m.l) * s;
    m.lean += ((done ? a.lean || 0 : 0) - m.lean) * s; m.wave += ((done && a.wave ? 1 : 0) - m.wave) * s;
    // the feet lift over the threshold and come down to the ground outside, and the back bends under the lintel
    const atDoor = Math.abs(x) < .6, off = Math.abs(z - 1.95);
    m.p.g.position.set(x, -.08 * sm(2.02, 2.16, z) + (atDoor ? .06 * (1 - sm(.02, .16, off)) : 0), z); m.p.g.rotation.y = m.h;
    // the head turns toward the guest, as far as a neck goes
    const dist = Math.hypot(eye[0] - x, eye[2] - z), rel = turn(0, Math.atan2(eye[0] - x, eye[2] - z) - m.h, 1);
    const yaw = Math.abs(rel) < 1.9 ? Math.max(-1, Math.min(1, rel)) * (moving ? .4 : 1) : 0, nod = Math.max(-.3, Math.min(.35, Math.atan2(.75 - m.sit * .14 - eye[1], dist)));
    m.yaw += (yaw - m.yaw) * s; m.nod += (nod - m.nod) * s; m.talk += ((speaking ? 1 : 0) - m.talk) * k;
    m.p.pose({ ph: m.ph, mv: m.mv, sit: m.sit, lean: m.lean, duck: atDoor ? 1 - sm(.3, .56, off) : 0, yaw: m.yaw, nod: m.nod, r: m.r, l: m.l, wave: m.wave, talk: m.talk, now });
  }

  return {
    root,
    // i = current beat. Returns the camera (x y z, look x y z) in ger units
    tick(i: number, dt: number, now: number) {
      while (cur < i) enter(++cur);
      advance(cam, camQ, REDUCED ? 99 : CAM_SPEED, dt, camKeep);
      const k = REDUCED ? 1 : 1 - Math.exp(-dt * 4.5);
      for (let c = 0; c < 6; c++) eye[c] += (cam[c] - eye[c]) * k;
      beatT += dt;
      const who = STORY.mn[Math.max(0, cur)].who, talking = beatT < 2.8;
      pose(H, dt, now, talking && who == "host"); pose(W, dt, now, talking && who == "hostess");
      if (lay && !W.q.length) {
        lay = bowlHand.visible = plateHand.visible = false; bowlTable.visible = plate.visible = true;
        W.act = { ...W.act, r: .3, l: .3 };
      }
      doorA += ((doorOpen ? 1.95 : 0) - doorA) * Math.min(1, dt * 3.2); door.rotation.y = doorA;
      const g = pup.g;
      g.position.x += (dogT[0] - g.position.x) * Math.min(1, dt * 3); g.position.z += (dogT[1] - g.position.z) * Math.min(1, dt * 3);
      dogA = turn(dogA, dogT[2] - PI / 2, Math.min(1, dt * 3)); g.rotation.y = dogA;
      pup.tail.rotation.x = Math.sin(now * .012) * .3;
      pup.head.rotation.z = dogBark ? .25 + Math.max(0, Math.sin(now * .014)) * .3 : .05;
      return eye;
    },
    reset,
  };
}
