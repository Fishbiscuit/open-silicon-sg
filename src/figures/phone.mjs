// Fig 3 — a generic phone, screen up. 1 unit = 1 mm (150 x 72 x 8).
// It comes apart as a stack: back glass with its charging coil, the
// internals (battery, logic board, cameras, speaker), the shield cans
// lifting off the board, the frame, the display panel and the cover glass.
import { k, scene, r2, restFraming } from "../lib.mjs";

const PH = { x: -75, y: -36, w: 150, d: 72, r: 10 };
const LIFT = { back: 0, inside: 52, shields: 86, frame: 128, display: 168, cover: 204 };

export function phoneScene({ W = 900, H = 640 } = {}) {
  const extremes = [...k.boxCorners(PH, 0, 9), ...k.boxCorners(PH, LIFT.cover, LIFT.cover + 9)];
  const P = k.fitProjection(extremes, W, H, { pad: 50, azimuth: 34 });
  const s = scene(P);
  const { at, S, L, D, box, cyl, halo, part } = s;
  const byPlan = (list) => list.sort((a, b) => k.depthOf([a.p.x + a.p.w / 2, a.p.y + a.p.d / 2, 0], P) - k.depthOf([b.p.x + b.p.w / 2, b.p.y + b.p.d / 2, 0], P));

  // ---- back glass, camera plateau, coil.
  const back = [halo(k.insetPlan(PH, 3), 0, 1, 10), box(PH, 0, 0.9, { mat: "glass", tone: "mid" }, 10, 0.6)];
  back.push(box(k.insetPlan(PH, 0.6), 0.9, 0.01, { tone: "lo", crease: "none", flat: true }, 10));
  const bump = { x: 40, y: 8, w: 30, d: 24, r: 7 };
  back.push(box(bump, 0.9, 1.2, { mat: "glass", tone: "mid" }, 8, 0.4));
  const coil = [];
  for (let i = 0; i < 9; i++) coil.push(k.ring(-14, 0, 9 + i * 2, 1.0, P, 72));
  back.push(S(k.cylinder(-14, 0, 29, 0.9, 0.3, P, 72), { mat: "epoxy", tone: "lo" }));
  back.push(L(coil.join(""), { className: "cu" }));
  back.push(L(k.onTop([[-14 + 29, 0], [8, -6], [12, -6]], 1.3, P), { className: "cu" }));

  // ---- internals: battery, board, cameras, speaker, motor, port.
  const IZ = 1.2;
  const inside = [];
  const items = [];
  const bat = { x: -68, y: -31, w: 74, d: 62, r: 3 };
  items.push({ p: bat, f: () => {
    let o = box(bat, IZ, 4.6, { tone: "mid" }, 3, 0.8);
    o += L(k.planOutline(k.insetPlan(bat, 3), IZ + 4.6, P, 3), { tone: "faint" });
    const lab = { x: bat.x + 10, y: bat.y + 10, w: 34, d: 18, r: 1 };
    o += L(k.planOutline(lab, IZ + 4.6, P, 2), { tone: "lo" });
    [24, 16, 20].forEach((len, i) => (o += L(k.lineOnTop([lab.x + 3, lab.y + 4 + i * 4.5], [lab.x + 3 + len, lab.y + 4 + i * 4.5], IZ + 4.6, P), { tone: "lo", free: true })));
    o += box({ x: bat.x + bat.w - 2, y: -6, w: 8, d: 12, r: 1 }, IZ + 3, 0.6, { tone: "lo", crease: "none" }, 2);
    return o;
  } });
  const spk = { x: -73, y: -20, w: 8, d: 26, r: 2 };
  items.push({ p: spk, f: () => box(spk, IZ, 5, { tone: "mid" }, 3, 0.4) + D(Array.from({ length: 6 }, (_, i) => at([-69, -16 + i * 3.6, IZ + 5])), { size: 0.7, tone: "lo" }) });
  const tap = { x: -73, y: 10, w: 8, d: 20, r: 1.5 };
  items.push({ p: tap, f: () => box(tap, IZ, 4, { tone: "mid" }, 3, 0.4) });
  const port = { x: -75.5, y: -5, w: 5, d: 10, r: 2.5 };
  items.push({ p: port, f: () => box(port, IZ + 0.6, 3.2, { tone: "hi" }, 4) });
  // logic board
  const PCB = { x: 10, y: -32, w: 60, d: 38, r: 2 };
  const BT = IZ + 0.8;
  items.push({ p: PCB, f: () => {
    let o = box(PCB, IZ, 0.8, { mat: "pcb", tone: "mid" }, 3);
    const trace = [];
    for (let i = 0; i < 8; i++) trace.push(k.onTop([[PCB.x + 4, PCB.y + 4 + i * 4], [PCB.x + 14, PCB.y + 4 + i * 4]], BT, P));
    o += L(trace.join(""), { className: "cu", tone: "lo" });
    return o;
  } });
  // chips on the board; the SoC is the lit one
  const SOC = { x: 30, y: -24, w: 15, d: 15, r: 0.8 };
  const chips = [
    { p: { x: 49, y: -28, w: 13, d: 11, r: 0.6 }, h: 1.1 },
    { p: { x: 49, y: -14, w: 10, d: 10, r: 0.6 }, h: 1.0 },
    { p: { x: 14, y: -28, w: 9, d: 9, r: 0.6 }, h: 0.9 },
    { p: { x: 14, y: -16, w: 7, d: 7, r: 0.5 }, h: 0.9 },
    { p: { x: 63, y: -28, w: 5, d: 6, r: 0.4 }, h: 0.8 },
    { p: { x: 63, y: -19, w: 5, d: 6, r: 0.4 }, h: 0.8 },
    { p: { x: 24, y: -6, w: 6, d: 6, r: 0.4 }, h: 0.8 },
    { p: { x: 34, y: -6, w: 4, d: 4, r: 0.4 }, h: 0.7 },
  ];
  chips.forEach((c) => items.push({ p: c.p, f: () => box(c.p, BT, c.h, { mat: "epoxy", tone: "hi" }, 2, 0.3) + D([at([c.p.x + 1.2, c.p.y + 1.2, BT + c.h])], { size: 0.45, tone: "mid" }) }));
  items.push({ p: SOC, f: () => box(SOC, BT, 1.2, { mat: "epoxy", tone: "hi", lit: true }, 2, 0.4) + box(k.insetPlan(SOC, 1.6), BT + 1.2, 0.8, { mat: "epoxy", tone: "hi", lit: true }, 2, 0.3) + L(k.ring(SOC.x + 3.4, SOC.y + 3.4, 0.7, BT + 2, P, 12), { tone: "lit" }) });
  // passives: a scatter of tiny capacitors round the SoC
  const pas = [];
  for (let i = 0; i < 16; i++) pas.push({ x: SOC.x - 3 + (i % 8) * 2.4, y: SOC.y + SOC.d + 1.4 + Math.floor(i / 8) * 1.8, w: 1.2, d: 0.8, r: 0.1 });
  for (let i = 0; i < 10; i++) pas.push({ x: SOC.x + SOC.w + 1.2, y: SOC.y + 1 + i * 1.5, w: 0.8, d: 1, r: 0.1 });
  pas.forEach((p) => items.push({ p, f: () => box(p, BT, 0.5, { tone: "mid", crease: "none" }, 1) }));
  // board-to-board connectors
  [{ x: 12, y: 0, w: 10, d: 4, r: 0.5 }, { x: 52, y: -2, w: 12, d: 4, r: 0.5 }].forEach((p) => items.push({ p, f: () => box(p, BT, 1.2, { tone: "mid" }, 2) + L(Array.from({ length: 6 }, (_, i) => k.lineOnTop([p.x + 1.4 + i * (p.w - 2.8) / 5, p.y + 0.8], [p.x + 1.4 + i * (p.w - 2.8) / 5, p.y + p.d - 0.8], BT + 1.2, P)).join(""), { tone: "lo" }) }));
  // cameras: two lens modules under the plateau
  for (const [cx, cy] of [[48, 20], [62, 20]]) {
    const base = { x: cx - 6, y: cy - 6, w: 12, d: 12, r: 1.5 };
    items.push({ p: base, f: () => box(base, IZ, 4, { tone: "mid" }, 3, 0.4) + cyl(cx, cy, 4.4, IZ + 4, 2.2, { tone: "hi" }, 36) + L(k.ring(cx, cy, 3, IZ + 6.2, P, 32), { tone: "lo" }) + cyl(cx, cy, 2, IZ + 6.2, 0.01, { mat: "glass", tone: "lo", crease: "none" }, 24) });
  }
  byPlan(items).forEach((it) => inside.push(it.f()));
  // flex cable from the board to the display connector
  inside.push(L(k.onTop([[PCB.x + 20, PCB.y + PCB.d], [PCB.x + 20, 28], [-30, 28]], IZ + 0.3, P), { tone: "mid" }));

  // ---- shield cans: perforated metal lids over the chips.
  const shields = [];
  const cans = [{ x: 27, y: -27, w: 22, d: 21, r: 1 }, { x: 47, y: -30, w: 21, d: 27, r: 1 }];
  for (const c of cans.sort((a, b) => k.depthOf([a.x, a.y, 0], P) - k.depthOf([b.x, b.y, 0], P))) {
    shields.push(box(c, BT, 2.4, { mat: "silicon", tone: "hi" }, 2, 0.4));
    const holes = [];
    for (let i = 0; i < Math.floor(c.w / 3); i++) for (let j = 0; j < Math.floor(c.d / 3); j++) holes.push(at([c.x + 2 + i * 3, c.y + 2 + j * 3, BT + 2.4]));
    shields.push(D(holes, { size: 0.35, tone: "lo" }));
  }

  // ---- frame: four rails round a thin mid-plate, buttons on the side.
  const frame = [];
  const FZ = 0;
  frame.push(box(k.insetPlan(PH, 2), FZ + 1.2, 0.6, { tone: "lo" }, 8));
  const cut = { x: -66, y: -28, w: 74, d: 56, r: 3 };
  frame.push(L(k.planOutline(cut, FZ + 1.8, P, 3), { tone: "mid" }));
  const rail = 2.2;
  const rails = [
    { x: PH.x, y: PH.y, w: PH.w, d: rail + 1, r: 1 },
    { x: PH.x, y: PH.y, w: rail + 1, d: PH.d, r: 1 },
    { x: PH.x + PH.w - rail - 1, y: PH.y, w: rail + 1, d: PH.d, r: 1 },
    { x: PH.x, y: PH.y + PH.d - rail - 1, w: PH.w, d: rail + 1, r: 1 },
  ];
  rails.forEach((r) => frame.push(box(r, FZ, 7.8, { tone: "hi" }, 3, 0.3)));
  frame.push(L(k.sideSeam(PH, FZ + 3.9, P, 8), { tone: "faint" }));
  for (const [x, w] of [[10, 16], [32, 10]]) frame.push(box({ x, y: PH.y + PH.d - 0.4, w, d: 1.2, r: 0.6 }, FZ + 2.6, 2.6, { tone: "mid" }, 3));
  
  // ---- display panel and cover glass.
  const DZ = 6.6, CZ = 7.8;
  const display = [box(k.insetPlan(PH, 1.4), DZ, 1.1, { mat: "screen", tone: "mid" }, 9, 0.3)];
  display.push(L(k.planOutline(k.insetPlan(PH, 4.5), DZ + 1.1, P, 8), { tone: "lo" }));
  display.push(box({ x: -62, y: 26, w: 24, d: 8, r: 1 }, DZ - 0.6, 0.6, { tone: "mid", crease: "none" }, 2));
  const cover = [box(PH, CZ, 0.9, { mat: "glass", tone: "hi" }, 10, 0.8)];
  cover.push(L(k.ring(PH.x + PH.w - 8, 0, 1.8, CZ + 0.9, P, 20), { tone: "mid" }));
  cover.push(L(k.lineOnTop([PH.x + PH.w - 3.4, -7], [PH.x + PH.w - 3.4, 7], CZ + 0.9, P), { tone: "mid" }));
  cover.push(L(k.planOutline(k.insetPlan(PH, 3.4), CZ + 0.9, P, 8), { tone: "faint" }));

  const focusW = [SOC.x + SOC.w / 2, SOC.y + SOC.d / 2, BT + 2 + LIFT.inside];
  const f = at(focusW);
  return {
    id: "phone",
    P,
    ...restFraming(P, k.boxCorners(PH, 0, 9), W, H, 0.7),
    umPerUnit: 1000,
    W,
    H,
    focus: [r2(f[0]), r2(f[1])],
    zoom: 6.2,
    label: "A phone comes apart as a stack: back glass with a charging coil, then the battery, cameras and logic board, the metal shields lifting off its chips, the frame, the display panel and the cover glass. The main processor on the board is lit.",
    body: [
      part("back", back, [0, 0, LIFT.back]),
      part("inside", inside, [0, 0, LIFT.inside], ' data-order="0" data-keep=""'),
      part("shields", shields, [0, 0, LIFT.shields], ' data-order="1"'),
      part("frame", frame, [0, 0, LIFT.frame], ' data-order="2"'),
      part("display", display, [0, 0, LIFT.display - DZ], ' data-order="3"'),
      part("cover", cover, [0, 0, LIFT.cover - CZ], ' data-order="4"'),
    ].join(""),
  };
}
