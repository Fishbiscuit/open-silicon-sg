// Fig 2 — a programmable rice cooker. 1 unit = 1 mm.
// The lid lifts, the inner pot rises out, and the control board slides
// forward with its microcontroller lit. Through the open body you see the
// heating plate and the spring-loaded temperature sensor at its centre.
import { k, scene, r2, restFraming } from "../lib.mjs";
import * as G from "../kit/lathe.mjs";

const BODY_TOP = 176;
const LIFT = { lid: 220, pot: 168, board: [118, 118, -70] };

export function cookerScene({ W = 900, H = 640 } = {}) {
  const plan = { x: -132, y: -132, w: 264, d: 264, r: 130 };
  const extremes = [
    ...k.boxCorners(plan, -12, BODY_TOP + LIFT.lid + 70),
    [-60 + LIFT.board[0] + 60, 30 + LIFT.board[1] + 50, 0],
    [130 + LIFT.board[0], 130 + LIFT.board[1], 20],
  ];
  const P = k.fitProjection(extremes, W, H, { pad: 40, azimuth: 45 });
  const s = scene(P);
  const { at, S, L, D, box, cyl, halo, part } = s;
  const up = (cx, cy, z) => G.frameOf([cx, cy, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const F = up(0, 0, 0);
  const [vx, vy] = k.towardViewer(P);

  // ---- body: a softly bulging shell on four feet, with a seam band.
  const body = [halo({ x: -128, y: -128, w: 256, d: 256, r: 128 }, -10, 1, 16)];
  for (const [x, y] of s.byDepth([[-84, -84], [84, -84], [-84, 84], [84, 84]], -10)) body.push(cyl(x, y, 12, -10, 10, { tone: "lo" }, 28));
  const shell = [[0, 112], [8, 120, 1], [60, 127, 1], [120, 127, 1], [168, 121, 1], [BODY_TOP, 116]];
  body.push(S(G.solidOf(shell, F, P, { smooth: true }), { tone: "hi", inner: L(G.arcOf(F, 44, 126.2, P) + G.arcOf(F, 150, 124.4, P), { tone: "faint" }) }));
  // the open top: rim, a dark well, and the heating plate seen through it
  const rimF = up(0, 0, BODY_TOP);
  body.push(L(k.ring(0, 0, 109, BODY_TOP, P, 96), { tone: "mid" }));
  const well = k.onTop(k.circleRing(0, 0, 108.4, 96), BODY_TOP, P, true);
  body.push(`<clipPath id="ck-well"><path d="${well}"/></clipPath><path d="${well}" fill="var(--ck-well)"/>`);
  const inside = [];
  inside.push(S(G.disc(28, 34, 92, up(0, 0, 0), P), { tone: "mid" }));
  const coil = [];
  for (let t = 0; t < Math.PI * 2 * 4.2; t += 0.12) coil.push([Math.cos(t) * (24 + t * 2.4), Math.sin(t) * (24 + t * 2.4)]);
  inside.push(L(k.onTop(coil, 34, P), { className: "cu" }));
  inside.push(S(G.disc(34, 40, 14, up(0, 0, 0), P), { tone: "hi", lit: false }));
  inside.push(S(G.disc(40, 43, 10, up(0, 0, 0), P), { mat: "silicon", tone: "hi" }));
  inside.push(L(k.ring(0, 0, 18, 34, P, 40), { tone: "lo" }));
  // inner wall shading, so the well reads as deep
  inside.push(`<path d="${k.onTop(k.circleRing(0, 0, 108.4, 96), BODY_TOP - 120, P, true)}" fill="none" stroke="var(--ck-wall)" stroke-width="1"/>`);
  body.push(`<g clip-path="url(#ck-well)">${inside.join("")}</g>`);
  body.push(L(k.ring(0, 0, 116, BODY_TOP, P, 96), { tone: "lo" }));

  // control panel, facing the viewer on the front of the shell
  const out = [vx, vy, 0];
  const side = [vy, -vx, 0];
  const panelO = [vx * 118, vy * 118, 98];
  const PF = G.frameOf(panelO, out, side, [0, 0, 1]);
  const panelPoly = (w, h, r = 6) => {
    const pts = [];
    for (const [cx, cy, a0] of [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, Math.PI * 1.5]])
      for (let i = 0; i <= 4; i++) pts.push([cx + Math.cos(a0 + (i / 4) * Math.PI / 2) * r, cy + Math.sin(a0 + (i / 4) * Math.PI / 2) * r]);
    return pts;
  };
  body.push(S(G.prismOf(PF, panelPoly(112, 92, 8), -4, 9.5, P), { tone: "hi" }));
  const onPanel = (x, y, ds = 9.6) => at([panelO[0] + out[0] * ds + side[0] * x, panelO[1] + out[1] * ds + side[1] * x, panelO[2] + y]);
  const panelPath = (pts, closed) => k.pathOf(pts.map(([x, y]) => onPanel(x, y)), closed);
  // display window
  const disp = [[-34, 32], [34, 32], [34, 8], [-34, 8]];
  body.push(`<path d="${panelPath(disp, true)}" fill="var(--m-screen-top)" stroke="var(--anatomy-mid)" stroke-width=".7"/>`);
  // seven-segment style readout "1:25"
  const seg = [];
  const digit = (x0, bits) => {
    const S7 = { a: [[0, 0], [7, 0]], b: [[7, 0], [7, -7]], c: [[7, -7], [7, -14]], d: [[0, -14], [7, -14]], e: [[0, -7], [0, -14]], f: [[0, 0], [0, -7]], g: [[0, -7], [7, -7]] };
    for (const b of bits) seg.push(panelPath(S7[b].map(([x, y]) => [x0 + x, 27 + y])));
  };
  digit(-26, "bc");
  digit(-6, "abged");
  digit(8, "afgcd");
  seg.push(panelPath([[-13, 23], [-13, 22.4]]), panelPath([[-13, 17], [-13, 16.4]]));
  body.push(`<path d="${seg.join("")}" fill="none" stroke="var(--ck-seg)" stroke-width="1.4" stroke-linecap="round" class="ck-seg"/>`);
  // four buttons and two status lamps
  const buttons = [-36, -12, 12, 36];
  buttons.forEach((x) => body.push(S(G.disc(9.5, 12.5, 7, G.frameOf(onPanelWorld(panelO, out, side, x, -18), out, side, [0, 0, 1]), P), { tone: "mid" })));
  body.push(D([onPanel(-36, -32), onPanel(36, -32)], { size: 1.6, tone: "hi" }));
  body.push(`<path d="${panelPath([[-30, -34], [-14, -34]]) + panelPath([[18, -34], [30, -34]])}" class="iso-line" data-tone="lo" data-free=""/>`);

  // ---- heating plate is part of the body; the pot lifts out.
  const pot = [];
  const potF = up(0, 0, 30);
  pot.push(S(G.solidOf([[0, 96], [4, 102, 1], [120, 104, 1], [128, 104]], potF, P, { smooth: true }), { tone: "hi", inner: L(G.arcOf(potF, 96, 104, P), { tone: "faint" }) }));
  pot.push(S(G.ringBand(128, 132, 98, 110, potF, P), { tone: "hi" }));
  const potTop = 30 + 132;
  const riceZ = potTop - 26;
  const potWell = k.onTop(k.circleRing(0, 0, 98, 96), potTop, P, true);
  pot.push(`<path d="${potWell}" fill="var(--ck-pot)"/>`);
  // rice surface, seen through the rim: a field of grains
  const grains = [];
  for (let i = 0; i < 260; i++) {
    const a = i * 2.39996, rr = Math.sqrt(i / 260) * 90;
    grains.push(at([Math.cos(a) * rr, Math.sin(a) * rr, riceZ]));
  }
  pot.push(`<g clip-path="url(#ck-pot)"><clipPath id="ck-pot"><path d="${potWell}"/></clipPath><path d="${k.onTop(k.circleRing(0, 0, 98, 96), riceZ, P, true)}" fill="var(--ck-rice)" fill-opacity=".25"/><g class="rice">${D(grains, { size: 1.1, tone: "hi" })}</g></g>`);
  // water-level marks inside the far wall
  const marks = [];
  for (let i = 0; i < 5; i++) marks.push(k.segment([-64 - i * 2, -70 + i * 2, potTop - 6 - i * 9], [-56 - i * 2, -78 + i * 2, potTop - 6 - i * 9], P));
  pot.push(L(marks.join(""), { tone: "mid", free: true }));
  // two handles on the rim
  for (const sgn of [-1, 1]) pot.push(box({ x: -10, y: sgn > 0 ? 104 : -116, w: 20, d: 12, r: 3 }, potTop - 4, 4, { tone: "mid" }, 3));

  // ---- lid: a dome with a steam vent, a latch and a hinge boss.
  const lid = [];
  const lidF = up(0, 0, BODY_TOP);
  lid.push(S(G.solidOf([[0, 121], [8, 120, 1], [26, 110, 1], [44, 84, 1], [56, 44, 1], [60, 0]], lidF, P, { smooth: true }), { tone: "hi", inner: L(G.arcOf(lidF, 4, 120.6, P), { tone: "faint" }) }));
  const vent = [-38, -38];
  const ventZ = BODY_TOP + 43;
  lid.push(S(G.solidOf([[0, 20], [6, 19, 1], [11, 14, 1], [13, 0]], up(vent[0], vent[1], ventZ), P, { smooth: true }), { tone: "mid" }));
  lid.push(L(k.ring(vent[0], vent[1], 6, ventZ + 12.6, P, 24), { tone: "lo" }));
  lid.push(S(G.prismOf(G.frameOf([vx * 118, vy * 118, BODY_TOP + 2], out, side, [0, 0, 1]), panelPoly(34, 14, 4), -2, 8, P), { tone: "mid" }));

  // ---- control board: slides out flat, components on top.
  const board = [];
  const B = { x: -60, y: -40, w: 120, d: 80, r: 3 };
  const BZ = 60;
  board.push(halo(B, BZ, 1, 6));
  board.push(box(B, BZ, 1.6, { mat: "pcb", tone: "mid" }, 3, 0.4));
  const T = BZ + 1.6;
  // traces fanning from the MCU to the parts
  const mcu = { x: -14, y: -14, w: 28, d: 28, r: 0.8 };
  const tr = [];
  for (let i = 0; i < 6; i++) tr.push(k.onTop([[mcu.x + 4 + i * 4, mcu.y - 4], [mcu.x + 4 + i * 4, B.y + 12], [B.x + 10 + i * 6, B.y + 6]], T, P));
  for (let i = 0; i < 6; i++) tr.push(k.onTop([[mcu.x + mcu.w + 4, mcu.y + 4 + i * 4], [B.x + B.w - 26, mcu.y + 4 + i * 4]], T, P));
  for (let i = 0; i < 5; i++) tr.push(k.onTop([[mcu.x + 4 + i * 5, mcu.y + mcu.d + 4], [mcu.x + 4 + i * 5, B.y + B.d - 6]], T, P));
  board.push(L(tr.join(""), { className: "cu", tone: "lo" }));
  board.push(L(k.planOutline(k.insetPlan(B, 2.5), T, P, 3), { tone: "faint" }));
  const holes = k.corners(B, 5);
  board.push(L(holes.map(([x, y]) => k.ring(x, y, 2, T, P, 16)).join(""), { tone: "mid" }));
  // parts, back to front
  const parts = [];
  parts.push([[B.x + B.w - 22, B.y + 14], () => box({ x: B.x + B.w - 36, y: B.y + 5, w: 28, d: 18, r: 1.5 }, T, 15, { tone: "mid" }, 3, 0.5) + L(k.planOutline({ x: B.x + B.w - 32, y: B.y + 9, w: 20, d: 10, r: 1 }, T + 15, P, 3), { tone: "faint" })]);
  parts.push([[B.x + 16, B.y + 18], () => cyl(B.x + 16, B.y + 18, 6, T, 13, { tone: "mid" }, 28) + L(k.ring(B.x + 16, B.y + 18, 3.5, T + 13, P, 20), { tone: "lo" })]);
  parts.push([[B.x + 30, B.y + 16], () => cyl(B.x + 30, B.y + 16, 5, T, 11, { tone: "mid" }, 24)]);
  parts.push([[B.x + 26, B.y + B.d - 16], () => cyl(B.x + 26, B.y + B.d - 16, 8, T, 6, { tone: "mid" }, 32) + L(k.ring(B.x + 26, B.y + B.d - 16, 2, T + 6, P, 16), { tone: "lo" })]);
  parts.push([[22, 22], () => box({ x: 20, y: 18, w: 9, d: 4, r: 1.8 }, T, 3.5, { tone: "mid" }, 4)]);
  parts.push([[B.x + B.w - 12, B.y + B.d - 20], () => {
    let o = box({ x: B.x + B.w - 16, y: B.y + 40, w: 8, d: 30, r: 1 }, T, 7, { tone: "mid" }, 2, 0.3);
    o += D(Array.from({ length: 5 }, (_, i) => at([B.x + B.w - 12, B.y + 43 + i * 6, T + 7])), { size: 0.8, tone: "hi" });
    return o;
  }]);
  // resistors and small capacitors
  const smd = [];
  for (let i = 0; i < 7; i++) smd.push({ x: B.x + 46 + (i % 4) * 9, y: B.y + 8 + Math.floor(i / 4) * 7, w: 5, d: 2.6, r: 0.4 });
  for (let i = 0; i < 6; i++) smd.push({ x: mcu.x + mcu.w + 6, y: mcu.y + 2 + i * 5, w: 2.6, d: 4, r: 0.4 });
  smd.forEach((p) => parts.push([[p.x + p.w / 2, p.y + p.d / 2], () => box(p, T, 1.4, { tone: "mid", crease: "none" }, 2)]));
  // microcontroller: a quad flat pack with leads on all four sides — the lit part
  parts.push([[0, 0], () => {
    let o = box(mcu, T, 2.8, { mat: "epoxy", tone: "hi", lit: true }, 2, 0.4);
    const legs = [];
    for (let i = 0; i < 9; i++) {
      const t = mcu.x + 3 + i * ((mcu.w - 6) / 8);
      legs.push(k.onTop([[t, mcu.y], [t, mcu.y - 3.4]], T + 0.4, P), k.onTop([[t, mcu.y + mcu.d], [t, mcu.y + mcu.d + 3.4]], T + 0.4, P));
      legs.push(k.onTop([[mcu.x, t], [mcu.x - 3.4, t]], T + 0.4, P), k.onTop([[mcu.x + mcu.w, t], [mcu.x + mcu.w + 3.4, t]], T + 0.4, P));
    }
    o += L(legs.join(""), { className: "au" });
    o += L(k.ring(mcu.x + 4, mcu.y + 4, 1.2, T + 2.8, P, 12), { tone: "lit" });
    return o;
  }]);
  parts.sort((a, b) => k.depthOf([a[0][0], a[0][1], 0], P) - k.depthOf([b[0][0], b[0][1], 0], P)).forEach(([, f]) => board.push(f()));
  // a ribbon of wires back to the shell
  board.push(L(k.onTop([[B.x + 10, B.y + B.d], [B.x + 10, B.y + B.d + 0.1]], T, P), { tone: "lo" }));

  // board sits inside the panel at rest: centre it behind the panel
  const boardRest = [vx * 70, vy * 70, 98 - BZ];
  const boardOut = [boardRest[0] + LIFT.board[0], boardRest[1] + LIFT.board[1], boardRest[2] + LIFT.board[2]];
  const [rx, ry] = k.axisVector(P, boardRest);
  const focus = at([boardOut[0], boardOut[1], T + 1.4 + boardOut[2]]);

  const cord = L(k.pathOf([at([-vx * 120, -vy * 120, 24]), at([-vx * 170, -vy * 150, 4]), at([-vx * 240, -vy * 150, -6])]), { tone: "mid" });
  const bodyG = `<g class="ck-body">${cord}${body.join("")}</g>`;
  return {
    id: "cooker",
    P,
    ...restFraming(P, [...k.boxCorners(plan, -12, BODY_TOP + 60)], W, H, 0.66),
    umPerUnit: 1000,
    W,
    H,
    focus: [r2(focus[0]), r2(focus[1])],
    zoom: 7.5,
    chipW: mcu.w,
    label: "A rice cooker comes apart: the domed lid lifts, the inner pot rises out showing rice inside, and the control board slides forward with its microcontroller lit. Through the open body you can see the heating plate and the temperature sensor at its centre.",
    body: [
      bodyG,
      part("pot", pot, [0, 0, LIFT.pot], ' data-order="1" data-reveal=""'),
      part("lid", lid, [0, 0, LIFT.lid], ' data-order="0"'),
      `<g transform="translate(${r2(rx)} ${r2(ry)})">${part("board", board, LIFT.board, ' data-order="2" data-keep="" data-reveal=""')}</g>`,
    ].join(""),
  };
}

function onPanelWorld(o, out, side, x, y) {
  return [o[0] + side[0] * x, o[1] + side[1] * x, o[2] + y];
}
