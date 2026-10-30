// Fig 1 — a contactless transit card resting on a reader pad.
// ID-1 card: 85.60 x 53.98 mm, corner radius 3.18 mm (ISO/IEC 7810), drawn at
// 2.2 units per mm. Layer thickness is exaggerated so each sheet reads.
import { k, scene, r2, restFraming } from "../lib.mjs";

const MM = 2.2;
const CARD = { x: -42.8 * MM, y: -27 * MM, w: 85.6 * MM, d: 54 * MM, r: 3.18 * MM };
const READER = { x: -118, y: -84, w: 236, d: 168, r: 16 };
const RZ = 0; // reader top
const Z0 = 16; // card underside, hovering as it taps
const MOD = [50, -24]; // module centre on the card
const LIFT = { back: 0, inlay: 46, module: 92, cap: 112, front: 150 };

export function cardScene({ W = 900, H = 640 } = {}) {
  const extremes = [
    ...k.boxCorners(READER, RZ - 26, RZ),
    ...k.boxCorners(CARD, Z0, Z0 + LIFT.front + 4),
  ];
  const P = k.fitProjection(extremes, W, H, { pad: 46, azimuth: 36 });
  const s = scene(P);
  const { at, S, L, D, box, cyl, halo, ring, top, part, arch } = s;

  // Reader pad: a heavy base on four feet, a recessed top with its own
  // antenna loops, a status window and a cable gland at the back.
  const reader = [];
  reader.push(halo(k.insetPlan(READER, -6), RZ - 26, 1, 14));
  for (const [x, y] of s.byDepth(k.corners(READER, 20), RZ - 26)) {
    reader.push(cyl(x, y, 8, RZ - 26, 2, { tone: "lo" }, 24));
    reader.push(cyl(x, y, 6, RZ - 24, 4, { tone: "mid" }, 24));
  }
  reader.push(box(READER, RZ - 20, 14, { tone: "mid" }, 8, 1.4));
  const deck = k.insetPlan(READER, 9);
  reader.push(box(deck, RZ - 6, 6, { tone: "mid" }, 8, 0.8));
  reader.push(L(k.planOutline(k.insetPlan(deck, 4), RZ, P), { tone: "lo" }));
  for (let i = 0; i < 4; i++) reader.push(L(k.planOutline(k.insetPlan(deck, 14 + i * 5), RZ, P), { tone: i === 0 ? "lo" : "faint" }));
  const screws = k.corners(READER, 8);
  reader.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, RZ - 6, P, 16)).join(""), { tone: "lo" }));
  reader.push(D(screws.map(([x, y]) => at([x, y, RZ - 6])), { size: 0.6 }));
  // status window on the front face, a lit blue strip
  const win = { x: READER.x + 70, y: READER.y + READER.d - 0.4, w: 96, d: 0.8, r: 0.4 };
  reader.push(L(k.segment([win.x, win.y + 0.6, RZ - 10], [win.x + win.w, win.y + 0.6, RZ - 10], P), { tone: "blue", className: "rf-led" }));
  reader.push(L(k.sideSeam({ ...READER }, RZ - 13, P, 8), { tone: "faint" }));
  // label plate on the deck
  const plate = { x: deck.x + 8, y: deck.y + deck.d - 22, w: 40, d: 13, r: 1.5 };
  reader.push(box(plate, RZ, 0.8, { tone: "lo", crease: "none" }, 3));
  [30, 22, 26].forEach((len, i) => reader.push(L(k.lineOnTop([plate.x + 4, plate.y + 3.5 + i * 3], [plate.x + 4 + len, plate.y + 3.5 + i * 3], RZ + 0.8, P), { tone: "lo", free: true })));

  // The field: loops that rise from the reader; the runtime pulses them.
  const field = [];
  for (let i = 0; i < 4; i++) {
    const z = RZ + 6 + i * 9;
    field.push(`<path class="iso-line rf" data-tone="blue" style="--i:${i}" d="${k.planOutline(k.insetPlan(deck, 18 - i * 4), z, P, 10)}"/>`);
  }

  // Card layers.
  const back = [halo(k.insetPlan(CARD, 4), Z0, 1, 7), box(CARD, Z0, 1, { tone: "mid" }, 8, 0.6)];
  back.push(L(k.planOutline(k.insetPlan(CARD, 3), Z0 + 1, P), { tone: "faint" }));
  // printed back: magnetic-stripe-free, a signature-style ruled block
  const ruled = { x: CARD.x + 14, y: CARD.y + 16, w: 110, d: 26, r: 2 };
  back.push(L(k.planOutline(ruled, Z0 + 1, P, 3), { tone: "lo" }));
  for (let i = 1; i < 4; i++) back.push(L(k.lineOnTop([ruled.x + 3, ruled.y + i * 6.5], [ruled.x + ruled.w - 3, ruled.y + i * 6.5], Z0 + 1, P), { tone: "faint" }));

  const IZ = Z0 + 1;
  const inlay = [box(CARD, IZ, 1.2, { tone: "mid" }, 8)];
  const cavity = { x: MOD[0] - 12, y: MOD[1] - 8, w: 24, d: 16, r: 1.5 };
  inlay.push(box(cavity, IZ + 1.2, 0.01, { tone: "lo", crease: "none", flat: true }, 3));
  inlay.push(L(k.planOutline(cavity, IZ + 1.2, P, 3), { tone: "lo" }));
  // Antenna: five turns of copper wire laid into the inlay.
  const turns = [];
  for (let i = 0; i < 5; i++) turns.push(k.planOutline(k.insetPlan(CARD, 5 + i * 3), IZ + 1.2, P, 8));
  inlay.push(L(turns.join(""), { className: "cu" }));
  const outerLead = [CARD.x + CARD.w - 5, MOD[1]];
  const innerLead = [CARD.x + CARD.w - 5 - 4 * 3, MOD[1] + 4];
  inlay.push(L(k.onTop([outerLead, [MOD[0] + 9, MOD[1]]], IZ + 1.2, P), { className: "cu" }));
  inlay.push(L(k.onTop([innerLead, [MOD[0] + 9, MOD[1] + 4]], IZ + 1.2, P), { className: "cu" }));
  inlay.push(D([at([MOD[0] + 9, MOD[1], IZ + 1.2]), at([MOD[0] + 9, MOD[1] + 4, IZ + 1.2])], { size: 0.9, tone: "hi" }));

  // Module: a gold lead frame, the die, two bond wires, a glob of epoxy.
  const MZ = IZ;
  const frame = { x: MOD[0] - 10, y: MOD[1] - 6.5, w: 20, d: 13, r: 1.2 };
  const module = [halo(frame, MZ, 0.5, 4), box(frame, MZ, 0.7, { mat: "gold", tone: "hi" }, 3)];
  for (const x of [-3.2, 3.2]) module.push(L(k.lineOnTop([MOD[0] + x, frame.y], [MOD[0] + x, frame.y + frame.d], MZ + 0.7, P), { tone: "lo" }));
  const die = { x: MOD[0] - 2.6, y: MOD[1] - 2.6, w: 5.2, d: 5.2, r: 0.3 };
  module.push(box(die, MZ + 0.7, 0.9, { mat: "die", tone: "hi", lit: true }, 2));
  module.push(L(arch([die.x + 0.6, MOD[1], MZ + 1.6], [MOD[0] - 5.4, MOD[1] - 0.6, MZ + 0.7], 1) + arch([die.x + die.w - 0.6, MOD[1], MZ + 1.6], [MOD[0] + 5.4, MOD[1] + 0.6, MZ + 0.7], 1), { className: "au" }));
  const cap = [box({ x: MOD[0] - 6.7, y: MOD[1] - 5.2, w: 13.4, d: 10.4, r: 3 }, MZ + 0.7, 2.6, { mat: "epoxy", tone: "mid" }, 6, 0.5)];

  const FZ = IZ + 1.2;
  const front = [box(CARD, FZ, 1, { tone: "hi" }, 8, 0.8)];
  // Neutral print: a band of waves running edge to edge, a ruled number field.
  const waves = [];
  for (let j = 0; j < 7; j++) {
    const pts = [];
    for (let x = CARD.x + 0.4; x <= CARD.x + CARD.w - 0.4; x += 3) pts.push([x, CARD.y + 30 + j * 4.2 + Math.sin((x - CARD.x) / 22 + j * 0.35) * 5]);
    pts.push([CARD.x + CARD.w - 0.4, CARD.y + 30 + j * 4.2 + Math.sin((CARD.w - 0.4) / 22 + j * 0.35) * 5]);
    waves.push(k.onTop(pts, FZ + 1, P));
  }
  front.push(L(waves.join(""), { tone: "lo" }));
  const numbers = { x: CARD.x + 12, y: CARD.y + CARD.d - 26, w: 74, d: 14, r: 1.5 };
  front.push(L(k.planOutline(numbers, FZ + 1, P, 3), { tone: "faint" }));
  [62, 40].forEach((len, i) => front.push(L(k.lineOnTop([numbers.x + 4, numbers.y + 4.5 + i * 5], [numbers.x + 4 + len, numbers.y + 4.5 + i * 5], FZ + 1, P), { tone: "mid", free: true })));
  // a small wave mark in the corner: four arcs on the face
  const mark = [CARD.x + CARD.w - 26, CARD.y + 14];
  const arcs = [];
  for (let i = 0; i < 3; i++) {
    const pts = [];
    for (let a = -0.9; a <= 0.9; a += 0.15) pts.push([mark[0] + Math.cos(a) * (4 + i * 3.4), mark[1] + Math.sin(a) * (4 + i * 3.4)]);
    arcs.push(k.onTop(pts, FZ + 1, P));
  }
  front.push(L(arcs.join(""), { tone: "mid", free: true }));
  front.push(D([at([mark[0], mark[1], FZ + 1])], { size: 1, tone: "mid" }));

  const focusWorld = [MOD[0], MOD[1], MZ + 1.6 + LIFT.module];
  const [fx, fy] = at(focusWorld);
  const body = [
    `<g class="reader">${reader.join("")}</g>`,
    `<g class="field">${field.join("")}</g>`,
    part("back", back, [0, 0, LIFT.back]),
    part("inlay", inlay, [0, 0, LIFT.inlay], ' data-order="1"'),
    part("module", module, [0, 0, LIFT.module], ' data-order="2" data-keep=""'),
    part("cap", cap, [0, 0, LIFT.cap], ' data-order="2" data-keep=""'),
    part("front", front, [0, 0, LIFT.front], ' data-order="3"'),
  ];
  return {
    id: "card",
    P,
    ...restFraming(P, [...k.boxCorners(READER, RZ - 26, RZ), ...k.boxCorners(CARD, Z0, Z0 + 4)], W, H, 0.7),
    umPerUnit: 1000 / MM,
    W,
    H,
    focus: [r2(fx), r2(fy)],
    zoom: 9,
    chipW: die.w,
    label:
      "A contactless transit card hovering over a reader pad. It comes apart into its printed sheets, an inlay carrying five turns of copper antenna, and a tiny module where one chip sits on a gold lead frame under a drop of epoxy.",
    body: body.join(""),
  };
}
