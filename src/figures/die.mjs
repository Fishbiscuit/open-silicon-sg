// The chip, opened. Two stages per object:
//   dieScene  — the package opening, then the die's floorplan, which
//               untilts from the isometric top face into a flat plan view.
//   cellScene — standard-cell rows at true proportion, then one cell and its
//               transistor schematic drawn over the layout it describes.
// Cell proportions follow the open SkyWater SKY130 high-density library
// (rows 2.72 µm, sites 0.46 µm; inv_1 is 3 sites, nand2_1 is 4). Floorplans
// are illustrative, not any product's die.
import { k, scene, r2 } from "../lib.mjs";

const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ---------------------------------------------------------------- die stage
export function dieScene(spec, { W = 900, H = 640 } = {}) {
  const pkg = spec.pkg;
  const BODY = pkg === "flip" ? { x: -96, y: -96, w: 192, d: 192, r: 6 } : pkg === "module" ? { x: -92, y: -64, w: 184, d: 128, r: 6 } : { x: -90, y: -90, w: 180, d: 180, r: 5 };
  const DIE = spec.die; // world plan of the die
  const LIFT = pkg === "flip" ? 34 : 0;
  const BZ = 0;
  const extremes = [...k.boxCorners(BODY, BZ - 10, BZ + 6), ...k.boxCorners(DIE, LIFT, LIFT + 70)];
  const P = k.fitProjection(extremes, W, H, { pad: 70, azimuth: spec.azimuth ?? 45 }); // the object's angle, so the chip doesn't turn between scenes
  const s = scene(P);
  const { at, S, L, D, box, cyl, halo, part, arch } = s;
  const out = [];
  const top = BZ + 4;
  const dieZ = pkg === "flip" ? top + LIFT : top + 0.8;
  const dieTop = dieZ + 3.2;

  out.push(halo(k.insetPlan(BODY, -4), BZ - 6, 1, 16));
  if (pkg === "flip") {
    // Organic substrate with a ball grid underneath and a bump field on top.
    out.push(box(BODY, BZ - 6, 10, { mat: "pcb", tone: "mid" }, 6, 1));
    const balls = [];
    for (let i = 0; i < 12; i++) balls.push([BODY.x + 10 + i * 15.5, BODY.y + BODY.d - 1]);
    for (let i = 0; i < 12; i++) balls.push([BODY.x + BODY.w - 1, BODY.y + 10 + i * 15.5]);
    out.push(D(balls.map(([x, y]) => at([x, y, BZ - 7])), { size: 2.6, tone: "lo" }));
    const bumps = [];
    for (let i = 0; i < 22; i++) for (let j = 0; j < 18; j++) bumps.push(at([DIE.x + 4 + i * ((DIE.w - 8) / 21), DIE.y + 4 + j * ((DIE.d - 8) / 17), top]));
    out.push(D(bumps, { size: 0.9, tone: "hi" }));
    out.push(L(k.planOutline(k.insetPlan(DIE, -3), top, P, 3), { tone: "lo" }));
    // decoupling capacitors around the die
    const caps = [];
    for (let i = 0; i < 6; i++) caps.push(box({ x: BODY.x + 14 + i * 28, y: BODY.y + 10, w: 7, d: 4, r: 0.6 }, top, 2.4, { tone: "mid" }, 2));
    for (let i = 0; i < 6; i++) caps.push(box({ x: BODY.x + 10, y: BODY.y + 24 + i * 26, w: 4, d: 7, r: 0.6 }, top, 2.4, { tone: "mid" }, 2));
    out.push(caps.join(""));
    const traces = [];
    for (let i = 0; i < 9; i++) traces.push(k.onTop([[DIE.x - 3, DIE.y + 8 + i * 10], [BODY.x + 22, DIE.y + 8 + i * 10 - 6]], top, P));
    out.push(L(traces.join(""), { className: "cu", tone: "lo" }));
  } else {
    // Lead frame: a paddle under the die and leads all round, held in mould.
    out.push(box(BODY, BZ - 6, 10, { mat: "epoxy", tone: "mid" }, 6, 1));
    const cavity = k.insetPlan(BODY, 12);
    out.push(L(k.planOutline(cavity, top, P, 6), { tone: "lo" }));
    const paddle = k.insetPlan(DIE, -6);
    out.push(box(paddle, top, 0.8, { mat: "gold", tone: "mid" }, 3));
  }
  // Leads and bond wires.
  const pads = [];
  const wires = [];
  const leads = [];
  if (pkg === "qfn") {
    const n = spec.leads ?? 12;
    const span = BODY.w - 44;
    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < n; i++) {
        const t = -span / 2 + (i + 0.5) * (span / n);
        const dt = (DIE.w - 14) / n;
        const dp = -DIE.w / 2 + 7 + (i + 0.5) * dt;
        let lead, pad, from, to;
        if (side === 0) { lead = { x: t - 2.6, y: BODY.y + 3, w: 5.2, d: 16, r: 0.8 }; from = [dp, DIE.y + 3.5]; to = [t, BODY.y + 15]; }
        if (side === 1) { lead = { x: BODY.x + BODY.w - 19, y: t - 2.6, w: 16, d: 5.2, r: 0.8 }; from = [DIE.x + DIE.w - 3.5, dp]; to = [BODY.x + BODY.w - 15, t]; }
        if (side === 2) { lead = { x: t - 2.6, y: BODY.y + BODY.d - 19, w: 5.2, d: 16, r: 0.8 }; from = [dp, DIE.y + DIE.d - 3.5]; to = [t, BODY.y + BODY.d - 15]; }
        if (side === 3) { lead = { x: BODY.x + 3, y: t - 2.6, w: 16, d: 5.2, r: 0.8 }; from = [DIE.x + 3.5, dp]; to = [BODY.x + 15, t]; }
        leads.push(lead);
        pads.push(from);
        wires.push([from, to]);
      }
    }
  }
  if (pkg === "module") {
    const left = { x: BODY.x + 12, y: BODY.y + 16, w: 46, d: BODY.d - 32, r: 3 };
    const right = { x: BODY.x + BODY.w - 58, y: BODY.y + 16, w: 46, d: BODY.d - 32, r: 3 };
    out.push(box(left, top, 0.8, { mat: "gold", tone: "mid" }, 4), box(right, top, 0.8, { mat: "gold", tone: "mid" }, 4));
    wires.push([[DIE.x + 6, DIE.y + DIE.d / 2], [left.x + 26, DIE.y + DIE.d / 2 - 6]]);
    wires.push([[DIE.x + DIE.w - 6, DIE.y + DIE.d / 2], [right.x + 20, DIE.y + DIE.d / 2 + 6]]);
  }
  const depth = (l) => k.depthOf([l.x + l.w / 2, l.y + l.d / 2, top], P);
  out.push([...leads].sort((a, b) => depth(a) - depth(b)).map((l) => box(l, top, 0.8, { mat: "gold", tone: "mid" }, 2)).join(""));

  // Die body.
  out.push(box(DIE, dieZ, 3.2, { mat: "die", tone: "hi", lit: true }, 2, 0.4));
  if (pkg === "flip") {
    // A few bumps visible in the gap under the lifted die.
    out.push(L(k.sideSeam(DIE, dieZ + 1, P, 2), { tone: "faint" }));
  }
  // Layout: plan units 0..1000 on the die's top face.
  const PU = 1000;
  const sc = DIE.w / PU;
  const o = at([DIE.x, DIE.y, dieTop]);
  const ax = k.axisVector(P, [1, 0, 0]);
  const ay = k.axisVector(P, [0, 1, 0]);
  const isoM = [ax[0] * sc, ax[1] * sc, ay[0] * sc, ay[1] * sc, o[0], o[1]];
  const centre = at([DIE.x + DIE.w / 2, DIE.y + DIE.d / 2, dieTop]);
  const side = Math.hypot(...k.axisVector(P, [DIE.w, -DIE.d, 0])) * 0.9;
  const ps = side / PU;
  const planM = [ps, 0, 0, ps, centre[0] - side / 2, centre[1] - side / 2];
  const plan = floorplan(spec);
  out.push(`<g class="layout" data-iso="${isoM.map(r2).join(" ")}" data-plan="${planM.map(r2).join(" ")}" transform="matrix(${isoM.map(r2).join(" ")})">${plan.svg}</g>`);

  // Bond wires over the layout, gold, in a sheen the runtime can sweep.
  const wireD = wires.map(([a, b]) => arch([a[0], a[1], dieTop], [b[0], b[1], top + 0.8], pkg === "module" ? 10 : 9)).join("");
  if (wireD) out.push(`<g class="wires">${L(wireD, { className: "au" })}${D(wires.map(([a]) => at([a[0], a[1], dieTop])), { size: 0.9, tone: "hi" })}</g>`);

  // The closed top of the package, which lifts away. The card's module is already open.
  if (pkg !== "module") out.push(part("lid", box(BODY, top, 3, { mat: "epoxy", tone: "hi", lit: true }, 6, 0.8), [0, 0, 0], ' data-order="0"'));
  // The focus point in plan view, and in the floorplan's own coordinates.
  const fp = plan.focus;
  const fxy = [planM[4] + fp[0] * ps, planM[5] + fp[1] * ps];
  return {
    id: spec.id,
    P,
    umPerWorld: spec.dieUm / DIE.w,
    W,
    H,
    centre: centre.map(r2),
    // What lines up with the chip in the object scene: the die on the card's module, the whole package otherwise.
    matchW: pkg === "module" ? DIE.w : BODY.w,
    anchor: (pkg === "module" ? centre : at([BODY.x + BODY.w / 2, BODY.y + BODY.d / 2, top])).map(r2),
    focus: fxy.map(r2),
    planSide: r2(side),
    planScale: r2(ps),
    label: spec.label,
    body: `<defs>${plan.defs}</defs><g class="pkg">${out.join("")}</g>`,
  };
}

// Floorplans in plan units (0..1000). Blocks carry a texture by kind.
function floorplan(spec) {
  const id = spec.id;
  const R = rand(spec.seed ?? 7);
  const defs = [];
  const svg = [];
  // Textures.
  const std = [];
  for (let row = 0; row < 2; row++) {
    let x = 0;
    while (x < 40) {
      const w = Math.min(40 - x, 2 + Math.floor(R() * 7));
      std.push(`<rect x="${x + 0.25}" y="${row * 8 + 1.2}" width="${w - 0.5}" height="5.6" fill="var(--lay-cell)"/>`);
      for (let g = 1; g < w; g += 1.6) std.push(`<rect x="${(x + g).toFixed(2)}" y="${row * 8 + 1.6}" width="0.28" height="4.8" fill="var(--lay-poly)" fill-opacity=".55"/>`);
      x += w;
    }
  }
  defs.push(`<pattern id="${id}-std" width="40" height="16" patternUnits="userSpaceOnUse"><rect width="40" height="16" fill="var(--lay-block)"/>${std.join("")}<rect y="0" width="40" height="0.9" fill="var(--lay-metal)" fill-opacity=".38"/><rect y="7.55" width="40" height="0.9" fill="var(--lay-metal)" fill-opacity=".38"/></pattern>`);
  defs.push(`<pattern id="${id}-sram" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="var(--lay-block)"/><rect x=".5" y=".5" width="4" height="4" fill="var(--lay-diff)"/><rect x="2.2" y=".5" width=".5" height="4" fill="var(--lay-poly)" fill-opacity=".6"/></pattern>`);
  defs.push(`<pattern id="${id}-flash" width="9" height="4" patternUnits="userSpaceOnUse"><rect width="9" height="4" fill="var(--lay-block)"/><rect x=".4" y=".6" width="8.2" height="1.2" fill="var(--lay-cell2)"/><rect x="2" y="0" width=".6" height="4" fill="var(--lay-metal)" fill-opacity=".35"/><rect x="6.4" y="0" width=".6" height="4" fill="var(--lay-metal)" fill-opacity=".35"/></pattern>`);
  defs.push(`<pattern id="${id}-phy" width="6" height="40" patternUnits="userSpaceOnUse"><rect width="6" height="40" fill="var(--lay-block)"/><rect x="1" width="2.2" height="40" fill="var(--lay-metal)" fill-opacity=".42"/><rect x="4" y="4" width=".8" height="32" fill="var(--lay-poly)" fill-opacity=".5"/></pattern>`);
  defs.push(`<linearGradient id="${id}-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--lay-sheen)" stop-opacity="0"/><stop offset=".48" stop-color="var(--lay-sheen)" stop-opacity=".0"/><stop offset=".5" stop-color="var(--lay-sheen)" stop-opacity=".09"/><stop offset=".52" stop-color="var(--lay-sheen)" stop-opacity="0"/><stop offset="1" stop-color="var(--lay-sheen)" stop-opacity="0"/></linearGradient>`);

  svg.push(`<rect width="1000" height="1000" fill="var(--lay-bg)"/>`);
  // Seal ring.
  svg.push(`<rect x="8" y="8" width="984" height="984" fill="none" stroke="var(--lay-metal)" stroke-opacity=".55" stroke-width="1"/><rect x="16" y="16" width="968" height="968" fill="none" stroke="var(--lay-poly)" stroke-opacity=".45" stroke-width="1"/>`);
  const block = (b) => {
    const { x, y, w, h, kind } = b;
    const parts = [];
    if (kind === "analog") {
      parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--lay-block)"/>`);
      // capacitor arrays and finger transistors
      const n = Math.max(2, Math.floor(w / 60));
      for (let i = 0; i < n; i++) {
        const cx = x + 12 + i * ((w - 24) / n);
        const cw = (w - 24) / n - 10;
        parts.push(`<rect x="${cx}" y="${y + 12}" width="${cw}" height="${h * 0.42}" fill="url(#${id}-sram)" opacity=".7"/>`);
        for (let f = 0; f < 7; f++) parts.push(`<rect x="${cx + 4 + f * (cw / 7)}" y="${y + h * 0.6}" width="${cw / 16}" height="${h * 0.3}" fill="var(--lay-poly)" fill-opacity=".6"/>`);
        parts.push(`<rect x="${cx}" y="${y + h * 0.56}" width="${cw}" height="${h * 0.38}" fill="none" stroke="var(--lay-metal)" stroke-opacity=".4"/>`);
      }
      parts.push(`<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="none" stroke="var(--lay-metal)" stroke-opacity=".35"/>`);
    } else if (kind === "sram" || kind === "flash") {
      parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--lay-block)"/>`);
      const bx = w > h ? 2 : 1;
      const by = h > w * 0.7 ? 2 : 1;
      const gw = (w - 18 - (bx - 1) * 10) / bx;
      const gh = (h - 18 - (by - 1) * 10) / by;
      for (let i = 0; i < bx; i++) for (let j = 0; j < by; j++) {
        const xx = x + 9 + i * (gw + 10);
        const yy = y + 9 + j * (gh + 10);
        parts.push(`<rect x="${xx}" y="${yy}" width="${gw}" height="${gh}" fill="url(#${id}-${kind})"/>`);
        parts.push(`<rect x="${xx}" y="${yy + gh - 7}" width="${gw}" height="7" fill="var(--lay-cell)"/><rect x="${xx + gw - 7}" y="${yy}" width="7" height="${gh}" fill="var(--lay-cell)"/>`);
      }
    } else if (kind === "phy") {
      parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-phy)"/>`);
    } else {
      parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-std)"/>`);
      // power straps across standard-cell areas
      for (let sx = x + 24; sx < x + w - 8; sx += 48) parts.push(`<rect x="${sx}" y="${y}" width="3" height="${h}" fill="var(--lay-metal)" fill-opacity=".26"/>`);
      if (b.cores) {
        const cw = (w - 30) / b.cores;
        for (let i = 0; i < b.cores; i++) parts.push(`<rect x="${x + 10 + i * (cw + 10 / b.cores * 1)}" y="${y + 10}" width="${cw - 6}" height="${h * 0.32}" fill="url(#${id}-sram)" opacity=".85"/>`);
      }
    }
    parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="var(--lay-outline)" stroke-opacity=".5" stroke-width="1"/>`);
    return parts.join("");
  };
  for (const b of spec.blocks) svg.push(block(b));
  // Pads.
  if (spec.pads) {
    const n = spec.pads;
    const step = (1000 - 120) / n;
    const pad = (x, y) => `<rect x="${x}" y="${y}" width="34" height="34" fill="var(--lay-pad)" fill-opacity=".85"/><rect x="${x + 5}" y="${y + 5}" width="24" height="24" fill="none" stroke="var(--lay-poly)" stroke-opacity=".7"/>`;
    for (let i = 0; i < n; i++) {
      const t = 60 + i * step + step / 2 - 17;
      svg.push(pad(t, 26), pad(t, 1000 - 60), pad(26, t), pad(1000 - 60, t));
    }
  }
  for (const p of spec.bigPads ?? []) svg.push(`<rect x="${p[0]}" y="${p[1]}" width="${p[2]}" height="${p[3]}" fill="var(--lay-pad)" fill-opacity=".85"/><rect x="${p[0] + 10}" y="${p[1] + 10}" width="${p[2] - 20}" height="${p[3] - 20}" fill="none" stroke="var(--lay-poly)" stroke-opacity=".7"/>`);
  if (spec.bumps) {
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) svg.push(`<circle cx="${50 + i * 60}" cy="${50 + j * 60}" r="9" fill="none" stroke="var(--lay-metal)" stroke-opacity=".28"/>`);
  }
  // A slow sheen across the whole die.
  svg.push(`<rect class="sheen" width="1000" height="1000" fill="url(#${id}-sheen)"/>`);
  // Focus marker (where the next stage lands).
  const [fx, fy] = spec.focus;
  svg.push(`<rect class="focus-mark" x="${fx - 14}" y="${fy - 9}" width="28" height="18" fill="none" stroke="var(--lay-poly)" stroke-width="1.2"/>`);
  return { defs: defs.join(""), svg: svg.join(""), focus: spec.focus };
}

// --------------------------------------------------------------- cell stage
// Units are 1/100 µm. Row height 272, site 46 (SKY130 HD).
const ROW = 272;
const SITE = 46;
const C = {
  sub: "var(--lay-sub)",
  well: "var(--lay-well)",
  wellEdge: "var(--lay-well-edge)",
  diff: "var(--lay-diff)",
  diffEdge: "var(--lay-diff-edge)",
  poly: "var(--lay-poly)",
  li: "var(--lay-li)",
  liEdge: "var(--lay-li-edge)",
  met: "var(--lay-met)",
  cont: "var(--lay-cont)",
};

const rect = (x, y, w, h, fill, extra = "") => `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" fill="${fill}"${extra}/>`;
const cont = (x, y) => rect(x - 8.5, y - 8.5, 17, 17, C.cont);

// One cell, drawn upright (VPWR at top, y = 0..ROW with y down from VPWR).
// Returns { svg, pins } where pins hold transistor positions for schematics.
function cellLayout(type, sites) {
  const w = sites * SITE;
  const out = [];
  const pTop = 34, pBot = 104; // PMOS diffusion (near VPWR)
  const nTop = 176, nBot = 236; // NMOS diffusion (near VGND)
  out.push(rect(0, -24, w, 136, C.well, ` stroke="${C.wellEdge}" stroke-width=".6"`));
  const pins = { gates: [], out: null, inp: [] };
  const gate = (x) => {
    out.push(rect(x - 7.5, 18, 15, 236, C.poly));
    pins.gates.push(x);
  };
  const diffs = (x0, x1) => {
    out.push(rect(x0, pTop, x1 - x0, pBot - pTop, C.diff, ` stroke="${C.diffEdge}" stroke-width=".6"`));
    out.push(rect(x0, nTop, x1 - x0, nBot - nTop, C.diff, ` stroke="${C.diffEdge}" stroke-width=".6"`));
  };
  const li = (x, y, ww, hh) => out.push(rect(x, y, ww, hh, C.li, ` stroke="${C.liEdge}" stroke-width=".6"`));
  if (type === "fill" || type === "tap") {
    if (type === "tap") { out.push(cont(w / 2, 12), cont(w / 2, 260)); li(w / 2 - 10, -12, 20, 40); li(w / 2 - 10, 244, 20, 40); }
    return { svg: out.join(""), pins, w };
  }
  if (type === "inv") {
    diffs(22, w - 22);
    gate(w / 2);
    out.push(rect(w / 2 - 30, 126, 36, 22, C.poly));
    out.push(cont(w / 2 - 18, 137));
    li(w / 2 - 34, 118, 30, 38);
    pins.inp.push([w / 2 - 22, 137]);
    out.push(cont(36, 69), cont(36, 206));
    li(26, -12, 20, 90);
    li(26, 196, 20, 88);
    out.push(cont(w - 36, 69), cont(w - 36, 206));
    li(w - 46, 58, 20, 158);
    pins.out = [w - 36, 137];
  } else if (type === "nand2") {
    diffs(20, w - 20);
    gate(w * 0.35);
    gate(w * 0.65);
    out.push(rect(w * 0.35 - 34, 124, 34, 22, C.poly), rect(w * 0.65, 140, 34, 22, C.poly));
    out.push(cont(w * 0.35 - 20, 135), cont(w * 0.65 + 20, 151));
    pins.inp.push([w * 0.35 - 20, 135], [w * 0.65 + 20, 151]);
    out.push(cont(32, 69), cont(w - 32, 69), cont(w / 2, 69), cont(32, 206), cont(w - 32, 206));
    li(22, -12, 20, 90); li(w - 42, -12, 20, 90); li(22, 196, 20, 88);
    li(w / 2 - 10, 58, 20, 30); li(w / 2 - 10, 70, w / 2 - 22, 20); li(w - 42, 70, 20, 146);
    pins.out = [w - 32, 120];
  } else if (type === "nor2") {
    diffs(20, w - 20);
    gate(w * 0.35);
    gate(w * 0.65);
    out.push(cont(32, 69), cont(w - 32, 69), cont(32, 206), cont(w / 2, 206), cont(w - 32, 206));
    li(22, -12, 20, 90); li(w / 2 - 10, 196, 20, 88); li(w - 42, 58, 20, 158);
    pins.out = [w - 32, 140];
  } else if (type === "sram") {
    // Illustrative 6T bit cell: two cross-coupled inverters and two pass gates.
    out.push(rect(20, pTop + 10, w - 40, 50, C.diff, ` stroke="${C.diffEdge}" stroke-width=".6"`));
    out.push(rect(20, nTop - 6, 48, 66, C.diff, ` stroke="${C.diffEdge}" stroke-width=".6"`));
    out.push(rect(w - 68, nTop - 6, 48, 66, C.diff, ` stroke="${C.diffEdge}" stroke-width=".6"`));
    gate(w * 0.32);
    gate(w * 0.68);
    out.push(rect(6, 150, w - 12, 15, C.poly)); // word line
    pins.gates.push(w * 0.15, w * 0.85);
    out.push(cont(w / 2, 79), cont(44, 206), cont(w - 44, 206), cont(w * 0.32 + 28, 120), cont(w * 0.68 - 28, 120));
    li(w / 2 - 10, -12, 20, 96); li(34, 196, 20, 88); li(w - 54, 196, 20, 88);
    li(w * 0.32 + 18, 100, 20, 40); li(w * 0.68 - 38, 100, 20, 40);
    pins.out = [w / 2, 120];
  } else {
    // A generic multi-gate cell (buffers, flip-flops): gates, straps, contacts.
    diffs(18, w - 18);
    const n = Math.max(2, Math.round(sites / 2));
    for (let i = 0; i < n; i++) gate(18 + (i + 0.5) * ((w - 36) / n));
    for (let i = 0; i <= n; i++) {
      const x = 18 + i * ((w - 36) / n);
      if (x < 26 || x > w - 26) continue;
      out.push(cont(x, 69), cont(x, 206));
      if (i % 2) li(x - 10, -12, 20, 90); else li(x - 10, 58, 20, 158);
    }
  }
  return { svg: out.join(""), pins, w };
}

function schematic(type, ox, oy, cell) {
  // Drawn over the cell it describes. Lines get pathLength=1 so the runtime
  // can draw them on.
  const p = [];
  const g = cell.pins.gates;
  const line = (d, extra = "") => p.push(`<path class="sch" pathLength="1" d="${d}"${extra}/>`);
  const label = (x, y, t, anchor = "middle") => p.push(`<text class="sch-t" x="${r2(x)}" y="${r2(y)}" text-anchor="${anchor}">${t}</text>`);
  const node = (x, y) => p.push(`<circle class="sch-n" cx="${r2(x)}" cy="${r2(y)}" r="5.5"/>`);
  const fet = (x, y, pmos) => {
    // channel, gate plate, and the source/drain stubs
    line(`M${x + 9} ${y - 26}V${y + 26}M${x - 1} ${y - 20}V${y + 20}M${x + 9} ${y - 26}H${x + 30}M${x + 9} ${y + 26}H${x + 30}`);
    if (pmos) p.push(`<circle class="sch-b" cx="${x - 9}" cy="${y}" r="7"/>`);
    line(`M${pmos ? x - 16 : x - 1} ${y}H${x - 36}`);
  };
  const X = (v) => ox + v;
  const Y = (v) => oy + v;
  if (type === "inv" || type === "nand2" || type === "sram") {
    const pY = Y(69), nY = Y(206);
    const gates = type === "nand2" ? [g[0], g[1]] : type === "sram" ? [g[0], g[1]] : [g[0]];
    gates.forEach((gx, i) => {
      fet(X(gx), pY, true);
      fet(X(gx), nY, false);
      // gate line joining the pair, the input
      line(`M${X(gx) - 36} ${pY}V${nY}`);
      node(X(gx) - 36, Y(137 + i * 14));
      if (type !== "sram") label(X(gx) - 52, Y(137 + i * 14) + 4, i ? "B" : "A", "end");
    });
    if (type === "sram") {
      line(`M${X(g[0]) + 30} ${pY + 26}V${nY - 26}M${X(g[1]) + 30} ${pY + 26}V${nY - 26}`);
      line(`M${X(g[0]) + 30} ${Y(120)}H${X(g[1]) - 36}M${X(g[1]) + 30} ${Y(150)}H${X(g[0]) - 36}`);
      node(X(g[0]) + 30, Y(120)); node(X(g[1]) + 30, Y(150));
      fet(X(cell.w * 0.08), Y(137), false);
      fet(X(cell.w * 0.92) - 40, Y(137), false);
      label(X(0) - 8, Y(141), "BL", "end");
      label(X(cell.w) + 8, Y(141), "BL̅", "start");
      label(X(cell.w / 2), Y(296), "WL");
    } else {
      // Output: drains to the output node.
      const last = gates[gates.length - 1];
      line(`M${X(last) + 30} ${pY + 26}V${nY - 26}M${X(last) + 30} ${Y(137)}H${X(cell.w) + 34}`);
      node(X(last) + 30, Y(137));
      label(X(cell.w) + 44, Y(141), "Y", "start");
      if (type === "inv") {
        // The rails, and the paths the runtime lights: in from A, down from power, out to ground.
        const x = X(last), mid = Y(137), railUp = Y(0), railDown = Y(ROW);
        line(`M${x + 30} ${railUp}V${pY - 26}M${x + 30} ${nY + 26}V${railDown}`);
        const flip = (name, d) => p.push(`<path class="flip ${name}" pathLength="1" d="${d}"/>`);
        flip("flip-in", `M${x - 36} ${mid}V${pY}H${x - 16}`);
        flip("flip-in", `M${x - 36} ${mid}V${nY}H${x - 1}`);
        flip("flip-up", `M${x + 30} ${railUp}V${pY - 26}H${x + 9}V${pY + 26}H${x + 30}V${mid}H${X(cell.w) + 34}`);
        flip("flip-down", `M${x + 30} ${mid}V${nY - 26}H${x + 9}V${nY + 26}H${x + 30}V${railDown}`);
        const bit = (cx, name) => p.push(`<g class="bit" data-bit="${name}" transform="translate(${r2(cx)} ${mid})"><g class="bit-face">${[1, 0].map((v) => `<g class="bit-${v}"><rect x="-22" y="-22" width="44" height="44" rx="5"/><text y="10">${v}</text></g>`).join("")}</g></g>`);
        bit(x - 98, "a");
        bit(X(cell.w) + 90, "y");
      }
      if (type === "nand2") {
        // PMOS in parallel (both drains to Y), NMOS in series.
        line(`M${X(g[0]) + 30} ${pY + 26}V${Y(112)}H${X(last) + 30}`);
        line(`M${X(g[0]) + 30} ${nY - 26}V${nY - 40}H${X(g[1]) + 30}`);
      }
    }
    label(X(-14), Y(-16), "VPWR", "end");
    label(X(-14), Y(ROW + 26), "VGND", "end");
  }
  return `<g class="schematic">${p.join("")}</g>`;
}

export function cellScene(spec, { W = 900, H = 640 } = {}) {
  const R = rand(spec.seed ?? 11);
  const rows = 5;
  const sites = 96;
  const width = sites * SITE;
  const height = rows * ROW;
  const focusRow = 2; // an upright row, so the schematic reads the right way up
  const focusSite = 40;
  // A memory cell sits in a regular array; logic cells sit in mixed rows.
  const types = spec.cell === "sram" ? [["sram", 6]] : [["inv", 3], ["nand2", 4], ["nor2", 4], ["buf", 4], ["dff", 19], ["buf", 6], ["inv", 3], ["fill", 1], ["tap", 1], ["fill", 2]];
  const out = [];
  let focus = null;
  for (let r = 0; r < rows; r++) {
    const flip = r % 2 === 1;
    const y0 = r * ROW;
    let s = 0;
    const cells = [];
    while (s < sites) {
      let t = types[Math.floor(R() * types.length)];
      let forced = false;
      if (r === focusRow && !focus && s <= focusSite && s + t[1] > focusSite - 1) { t = [spec.cell, spec.cell === "sram" ? 6 : spec.cell === "inv" ? 3 : 4]; forced = true; }
      if (s + t[1] > sites) t = ["fill", sites - s];
      const c = cellLayout(t[0], t[1]);
      const x0 = s * SITE;
      const tf = flip ? `translate(${x0} ${y0 + ROW}) scale(1 -1)` : `translate(${x0} ${y0})`;
      const isFocus = forced;
      cells.push(`<g transform="${tf}"${isFocus ? ' class="focus-cell"' : ""}>${c.svg}<rect width="${c.w}" height="${ROW}" fill="none" stroke="var(--lay-cellline)" stroke-width=".5"/></g>`);
      if (isFocus) focus = { x: x0, y: y0, w: c.w, cell: c, flip };
      s += t[1];
    }
    out.push(`<g class="row">${cells.join("")}</g>`);
  }
  // Power rails (met1) on every row boundary, and a vertical strap.
  for (let r = 0; r <= rows; r++) out.push(rect(-40, r * ROW - 24, width + 80, 48, C.met));
  for (let sx = 900; sx < width; sx += 1600) out.push(rect(sx, 0, 160, height, "var(--lay-met)", ' fill-opacity=".45"'));
  // A little routing on metal 2 over the rows.
  const R2 = rand(5);
  for (let i = 0; i < 18; i++) {
    const y = 60 + Math.floor(R2() * (rows * 4)) * (ROW / 4);
    const x = Math.floor(R2() * sites) * SITE;
    const len = (6 + Math.floor(R2() * 30)) * SITE;
    out.push(rect(x, y - 7, Math.min(len, width - x), 14, "var(--lay-m2)"));
  }
  // The focus cell: halo, then its schematic.
  const f = focus;
  const fy = f.y; // schematic is drawn upright; the focus row is not flipped
  const sch = schematic(spec.cell, f.x, fy, f.cell);
  const pad = 140;
  const vb = { x: -40, y: -60, w: width + 80, h: height + 120 };
  // Fit the full region to the stage, then a close-up on the focus cell.
  const fit = Math.min(W / vb.w, H / vb.h);
  const fcx = f.x + f.w / 2;
  const fcy = fy + ROW / 2;
  const closeW = f.w + pad * 2 + 120;
  const closeScale = Math.min(W / closeW, H / (ROW + pad * 2)) / fit;
  // Standard-cell rows abut mirrored, so a copy above and below fills the frame at the join with the die.
  const rowsId = `${spec.id}-rows`;
  const rows3 = `${rect(-40, -height - 60, width + 80, height * 3 + 120, C.sub)}<g id="${rowsId}">${out.join("")}</g><use href="#${rowsId}" transform="scale(1 -1)"/><use href="#${rowsId}" transform="translate(0 ${height * 2}) scale(1 -1)"/>`;
  return {
    id: `${spec.id}-cells`,
    W,
    H,
    fit: r2(fit),
    origin: [r2((W - vb.w * fit) / 2 - vb.x * fit), r2((H - vb.h * fit) / 2 - vb.y * fit)],
    focus: [r2(fcx), r2(fcy)],
    zoom: r2(closeScale),
    umPerUnit: 0.01,
    flip: spec.cell === "inv",
    body: `<g class="cells">${rows3}</g><rect class="cell-halo" x="${f.x - 6}" y="${fy - 30}" width="${f.w + 12}" height="${ROW + 60}" fill="none" stroke="var(--lay-poly)" stroke-width="1.4"/>${sch}`,
    label: spec.cellLabel,
  };
}
