// The open chip: a shared-run die in plan view, the way Tiny Tapeout builds
// one. A spine of multiplexing logic runs down the middle; projects from many
// designers fill a grid of tiles either side, some taking two or four tiles.
// Each project is drawn as a small layout of its own kind (logic, memory,
// analog, datapath, or mostly empty), so no two tiles read alike.
// One project is signed with the hub's tile in the top metal, the way
// designers sign their dies. It is drawn as four sheets (silicon, gates,
// wiring, top metal) that the runtime can lift apart. Layout is illustrative,
// not a specific shuttle.
import { tileBody } from "../mark.mjs";
import { esc } from "../lib.mjs";

const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const n1 = (v) => Math.round(v * 10) / 10;
const box = (x, y, w, h, fill, extra = "") => `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" fill="${fill}"${extra}/>`;

const ROW = 5.5; // one standard-cell row, in die units

// Two rows of standard cells of mixed widths, with gates and power rails.
function stdPattern(id, seed) {
  const R = rand(seed);
  const W = 46, s = [];
  for (let row = 0; row < 2; row++) {
    let x = 0;
    while (x < W) {
      const w = Math.min(W - x, 2.5 + Math.floor(R() * 6));
      s.push(box(x + 0.25, row * ROW + 0.9, w - 0.5, 3.9, "var(--lay-cell)"));
      for (let g = 1; g < w - 0.6; g += 1.5) s.push(box(x + g, row * ROW + 1.2, 0.26, 3.3, "var(--lay-poly)", ' fill-opacity=".55"'));
      x += w;
    }
    s.push(box(0, row * ROW, W, 0.5, "var(--lay-metal)", ' fill-opacity=".38"'));
  }
  return `<pattern id="${id}" width="${W}" height="${ROW * 2}" patternUnits="userSpaceOnUse">${box(0, 0, W, ROW * 2, "var(--lay-block)")}${s.join("")}</pattern>`;
}

export function openChipScene({ site, layers = [], W = 900, H = 640 }) {
  const R = rand(29);
  const COLS = 12, ROWS = 14, TW = 66, TH = 44, GAP = 4, SPINE = 46;
  const half = (COLS / 2) * (TW + GAP);
  const DW = half * 2 + SPINE + 120, DH = ROWS * (TH + GAP) + 120;
  const x0 = 60, y0 = 60;
  const colX = (c) => x0 + (c < COLS / 2 ? c * (TW + GAP) : half + SPINE + (c - COLS / 2) * (TW + GAP));
  const rowY = (r) => y0 + r * (TH + GAP);
  const used = new Set();
  const out = [];
  const defs = [
    stdPattern("oc-std-a", 41), stdPattern("oc-std-b", 97), stdPattern("oc-std-c", 163),
    `<pattern id="oc-sram" width="3.2" height="3.2" patternUnits="userSpaceOnUse">${box(0, 0, 3.2, 3.2, "var(--lay-block)")}${box(0.3, 0.3, 2.6, 2.6, "var(--lay-diff)")}${box(1.4, 0.3, 0.32, 2.6, "var(--lay-poly)", ' fill-opacity=".6"')}</pattern>`,
    `<pattern id="oc-fill" width="12" height="${ROW}" patternUnits="userSpaceOnUse">${box(0, 0, 12, ROW, "var(--lay-sub)")}${box(0.4, 0.9, 11.2, 3.9, "none", ' stroke="var(--lay-cellline)" stroke-width=".35"')}${box(0, 0, 12, 0.5, "var(--lay-metal)", ' fill-opacity=".2"')}</pattern>`,
    `<pattern id="oc-cap" width="7" height="7" patternUnits="userSpaceOnUse">${box(0, 0, 7, 7, "var(--lay-block)")}${box(0.7, 0.7, 5.6, 5.6, "var(--lay-cell2)")}${box(3, 3, 1, 1, "var(--lay-metal)", ' fill-opacity=".6"')}</pattern>`,
    // wide metal is slotted, so the signature's strokes carry rows of slots
    `<pattern id="oc-slot" width="2.4" height="1" patternUnits="userSpaceOnUse">${box(0, 0, 2.4, 1, "var(--lay-metal)")}${box(0.35, 0.42, 1.7, 0.16, "var(--lay-sub)", ' fill-opacity=".5"')}</pattern>`,
  ];
  const STD = ["oc-std-a", "oc-std-b", "oc-std-c"];
  const std = () => `url(#${STD[Math.floor(R() * STD.length)]})`;

  out.push(`<rect width="${DW}" height="${DH}" fill="var(--lay-bg)"/>`);
  out.push(`<rect x="8" y="8" width="${DW - 16}" height="${DH - 16}" fill="none" stroke="var(--lay-metal)" stroke-opacity=".55"/><rect x="16" y="16" width="${DW - 32}" height="${DH - 32}" fill="none" stroke="var(--lay-poly)" stroke-opacity=".45"/>`);
  // pads round the edge, each with its opening
  for (let i = 0; i < 18; i++) {
    const t = 70 + i * ((DW - 140) / 17);
    for (const y of [24, DH - 42]) out.push(`${box(t - 9, y, 18, 18, "var(--lay-pad)")}${box(t - 6, y + 3, 12, 12, "none", ' stroke="var(--lay-poly)" stroke-opacity=".6" stroke-width=".7"')}`);
  }
  // the spine: shared multiplexing logic and power straps
  const sx = x0 + half + 4;
  out.push(box(sx, y0, SPINE - 8, ROWS * (TH + GAP) - GAP, "url(#oc-std-b)"));
  for (let r = 0; r < ROWS; r++) out.push(box(sx + 6, rowY(r) + 6, SPINE - 20, TH - 12, "var(--lay-cell2)", ' fill-opacity=".8"'));
  out.push(box(sx + 4, y0, 2.4, ROWS * (TH + GAP) - GAP, "var(--lay-metal)", ' fill-opacity=".45"'), box(sx + SPINE - 14.4, y0, 2.4, ROWS * (TH + GAP) - GAP, "var(--lay-metal)", ' fill-opacity=".45"'));

  // Shapes with the same look are drawn as one path, so the die stays light
  // enough to animate: every tile still has its own layout. Rectangles that
  // carry an outline keep a hairline at any zoom, as the <rect>s they replace did.
  const B = new Map();
  const add = (attrs, d) => { if (!B.has(attrs)) B.set(attrs, []); B.get(attrs).push(d); };
  const rp = (x, y, w, h, fill, extra = "") => add(`fill="${fill}"${extra}${extra.includes("stroke=") ? ' vector-effect="non-scaling-stroke"' : ""}`, `M${n1(x)} ${n1(y)}h${n1(w)}v${n1(h)}h${n1(-w)}Z`);
  const flush = () => { const out = [...B].map(([attrs, ds]) => `<path ${attrs} d="${ds.join("")}"/>`).join(""); B.clear(); return out; };
  const WIRE = 'fill="none" stroke="var(--lay-m2)" stroke-width="1.1"';
  // Wiring on the upper metal: right-angled runs that end on vias.
  const routes = (x, y, ww, hh, n) => {
    for (let i = 0; i < n; i++) {
      const ax = x + 3 + R() * (ww - 6), ay = y + 3 + R() * (hh - 6), bx = x + 3 + R() * (ww - 6), by = y + 3 + R() * (hh - 6);
      add(WIRE, `M${n1(ax)} ${n1(ay)}H${n1(bx)}V${n1(by)}`);
      rp(ax - 0.7, ay - 0.7, 1.4, 1.4, "var(--lay-cont)", ' fill-opacity=".7"');
      rp(bx - 0.7, by - 0.7, 1.4, 1.4, "var(--lay-cont)", ' fill-opacity=".7"');
    }
  };
  const straps = (x, y, ww, hh, pitch = 22) => {
    for (let px = x + pitch / 2; px < x + ww - 2; px += pitch) rp(px, y, 1.2, hh, "var(--lay-metal)", ' fill-opacity=".28"');
  };
  // A bank of finger transistors inside a guard ring.
  const fingers = (x, y, ww, hh) => {
    rp(x, y, ww, hh, "var(--lay-diff)", ' stroke="var(--lay-diff-edge)" stroke-opacity=".5" stroke-width=".4"');
    for (let fx = x + 1.6; fx < x + ww - 1; fx += 2.2) rp(fx, y - 1, 0.7, hh + 2, "var(--lay-poly)", ' fill-opacity=".65"');
    rp(x - 2, y - 2.4, ww + 4, hh + 4.8, "none", ' stroke="var(--lay-metal)" stroke-opacity=".4" stroke-width=".6"');
  };

  // the signed project: four tiles, left of the spine, a little below centre
  const art = { c: 3, r: 7, w: 2, h: 2 };
  for (let dc = 0; dc < art.w; dc++) for (let dr = 0; dr < art.h; dr++) used.add(`${art.c + dc},${art.r + dr}`);

  // other projects: mostly single tiles, some double or quadruple
  const project = (c, r, w, h) => {
    const x = colX(c), y = rowY(r), ww = w * TW + (w - 1) * GAP, hh = h * TH + (h - 1) * GAP;
    const kind = R();
    if (kind < 0.34) {
      // logic: rows of standard cells under power straps
      rp(x, y, ww, hh, std()); straps(x, y, ww, hh); routes(x, y, ww, hh, 2 + Math.floor(R() * 4));
    } else if (kind < 0.52) {
      // memory beside its logic: an array with decoders on two edges
      const mw = ww * (0.42 + R() * 0.2), left = R() < 0.5, mx = left ? x + 3 : x + ww - mw - 3;
      rp(x, y, ww, hh, std()); rp(mx - 1.5, y + 1.5, mw + 3, hh - 3, "var(--lay-block)");
      rp(mx, y + 3, mw - 4, hh - 10, "url(#oc-sram)"); rp(mx, y + hh - 6.5, mw - 4, 3.6, "var(--lay-cell)"); rp(mx + mw - 3.4, y + 3, 3.4, hh - 10, "var(--lay-cell)");
      routes(x, y, ww, hh, 2);
    } else if (kind < 0.68) {
      // analog: finger transistors, a capacitor array and a wide bus
      const cw = ww * (0.3 + R() * 0.2);
      rp(x, y, ww, hh, "var(--lay-block)"); rp(x + 4, y + 4, cw, hh - 8, "url(#oc-cap)");
      const fx0 = x + cw + 10, fw = ww - cw - 16;
      fingers(fx0, y + 7, fw, hh * 0.26); fingers(fx0, y + hh * 0.56, fw * (0.5 + R() * 0.5), hh * 0.26);
      rp(x + 3, y + hh / 2 - 1.2, ww - 6, 2.4, "var(--lay-metal)", ' fill-opacity=".34"');
    } else if (kind < 0.82) {
      // a small design in a mostly empty tile
      const iw = ww * (0.35 + R() * 0.25), ih = Math.round((hh * (0.4 + R() * 0.3)) / ROW) * ROW;
      const ix = x + (R() < 0.5 ? 4 : ww - iw - 4), iy = y + Math.round((R() * (hh - ih - 4)) / ROW) * ROW;
      rp(x, y, ww, hh, "url(#oc-fill)"); rp(ix, iy, iw, ih, std()); rp(ix, iy, iw, ih, "none", ' stroke="var(--lay-metal)" stroke-opacity=".4" stroke-width=".5"'); routes(ix, iy, iw, ih, 2);
    } else {
      // datapath: identical bit slices side by side
      rp(x, y, ww, hh, "var(--lay-block)");
      const slice = 5.5;
      for (let bx = x + 3; bx < x + ww - 5; bx += slice) { rp(bx, y + 3, slice - 1.3, hh - 6, bx % 2 < 1 ? "var(--lay-cell)" : "var(--lay-cell2)"); rp(bx + 1.2, y + 3, 0.4, hh - 6, "var(--lay-poly)", ' fill-opacity=".5"'); }
      for (let by = y + 8; by < y + hh - 4; by += 9) rp(x + 2, by, ww - 4, 0.9, "var(--lay-metal)", ' fill-opacity=".34"');
      routes(x, y, ww, hh, 1);
    }
    return `<g class="proj">${flush()}<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="none" stroke="var(--lay-outline)" stroke-opacity=".55"/><rect class="glint" x="${x}" y="${y}" width="${ww}" height="${hh}"/></g>`;
  };
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (used.has(`${c},${r}`)) continue;
    const side = c < COLS / 2 ? 0 : 1;
    const canW = c + 1 < COLS && Math.floor((c + 1) / (COLS / 2)) === side && !used.has(`${c + 1},${r}`);
    const canH = r + 1 < ROWS && !used.has(`${c},${r + 1}`);
    let w = 1, h = 1;
    const roll = R();
    if (roll < 0.12 && canW && canH && !used.has(`${c + 1},${r + 1}`)) { w = 2; h = 2; }
    else if (roll < 0.3 && canW) w = 2;
    for (let dc = 0; dc < w; dc++) for (let dr = 0; dr < h; dr++) used.add(`${c + dc},${r + dr}`);
    out.push(project(c, r, w, h));
  }

  // The signed project, as four sheets from the silicon up.
  const ax = colX(art.c), ay = rowY(art.r), aw = art.w * TW + GAP, ah = art.h * TH + GAP;
  const A = rand(7);
  const rowsN = Math.floor(ah / ROW);
  const cellsAt = [];
  for (let r = 0; r < rowsN; r++) {
    const yy = ay + r * ROW;
    let x = ax + 2;
    while (x < ax + aw - 4) {
      const w = Math.min(ax + aw - 2 - x, 3 + Math.floor(A() * 9));
      if (A() < 0.86) cellsAt.push([x, yy, w]);
      x += w;
    }
  }
  const DIFF = ' stroke="var(--lay-diff-edge)" stroke-opacity=".45" stroke-width=".25"';
  for (const [x, yy, w] of cellsAt) { rp(x + 0.3, yy + 0.9, w - 0.6, 1.7, "var(--lay-diff)", DIFF); rp(x + 0.3, yy + 3.1, w - 0.6, 1.5, "var(--lay-diff)", DIFF); }
  const silicon = flush();
  for (const [x, yy, w] of cellsAt) for (let g = 1.1; g < w - 0.8; g += 1.5) rp(x + g, yy + 0.6, 0.34, 4.3, "var(--lay-poly)");
  const gates = flush();
  for (let r = 0; r < rowsN; r++) rp(ax + 1, ay + r * ROW - 0.3, aw - 2, 0.7, "var(--lay-metal)", ' fill-opacity=".5"');
  for (let i = 0; i < 16; i++) {
    const px = ax + 4 + A() * (aw - 8), py = ay + 4 + A() * (ah - 8), qx = ax + 4 + A() * (aw - 8), qy = ay + 4 + A() * (ah - 8);
    add('fill="none" stroke="var(--lay-m2)" stroke-width="1.2"', `M${n1(px)} ${n1(py)}H${n1(qx)}V${n1(qy)}`);
    rp(px - 0.8, py - 0.8, 1.6, 1.6, "var(--lay-cont)", ' fill-opacity=".75"'); rp(qx - 0.8, qy - 0.8, 1.6, 1.6, "var(--lay-cont)", ' fill-opacity=".75"');
  }
  for (let px = ax + 17; px < ax + aw - 4; px += 34) rp(px, ay + 1, 1.6, ah - 2, "var(--lay-metal)", ' fill-opacity=".34"');
  const wiring = flush();
  const ts = (ah - 10) / 40;
  const tx = ax + (aw - 40 * ts) / 2, ty = ay + 5;
  const place = (cls, dx = 0, dy = 0) => `<g class="${cls}" transform="translate(${(tx + dx).toFixed(2)} ${(ty + dy).toFixed(2)}) scale(${ts.toFixed(4)})">${tileBody(site)}</g>`;
  const metal = `${box(ax + 2, ay + 2, aw - 4, ah - 4, "none", ' stroke="var(--lay-metal)" stroke-opacity=".5" stroke-width="1.3"')}${box(tx + 1.4 * ts, ty + 1.4 * ts, 37.2 * ts, 37.2 * ts, "var(--lay-sub)", ' fill-opacity=".6" rx="3"')}${place("chip-metal-sh", 0.9, 1.1)}${place("chip-metal")}`;
  const back = `<rect class="art-back" x="${ax}" y="${ay}" width="${aw}" height="${ah}"/>`;
  const edge = `<rect class="art-edge" x="${ax}" y="${ay}" width="${aw}" height="${ah}"/>`;
  const sheet = (i, ink, base) => `<g class="art-l" data-l="${i}">${base ? box(ax, ay, aw, ah, "var(--lay-sub)") : back}<g class="art-ink">${ink}</g>${edge}</g>`;
  const labels = layers.slice(0, 4).map((t, i) => `<text class="art-lab" data-l="${i}" x="${n1(ax + aw + 9)}" y="${n1(ay + ah / 2 + 1.8)}">${esc(t)}</text>`).join("");
  out.push(`<g class="art-proj"><rect class="art-scrim" x="${-DW}" y="${-DH}" width="${DW * 3}" height="${DH * 3}"/>${sheet(0, silicon, true)}${sheet(1, gates)}${sheet(2, wiring)}${sheet(3, metal)}<rect class="art-ring" x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="none" stroke="var(--lay-poly)"/>${labels}</g>`);

  // fit the die to the stage
  const fit = Math.min(W / DW, H / DH) * 0.94;
  const ox = (W - DW * fit) / 2, oy = (H - DH * fit) / 2;
  const artC = [ax + aw / 2, ay + ah / 2];
  const zoom = Math.min(W / aw, H / ah) * 0.62 / fit;
  const body = `<defs>${defs.join("")}</defs><g class="open-die" transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${fit.toFixed(5)})">${out.join("")}</g>`;
  return {
    W, H, body,
    label: "An open chip seen from above: a spine of shared logic down the middle and a grid of projects from many designers either side, each a different small layout. One is signed with the Open Silicon SG tile in its top metal, and its layers lift apart.",
    // peel: how the signed project's sheets tilt and separate (shear, squash, spacing in die units, camera pull-back)
    data: { fit, origin: [ox, oy], artC, zoom, umPerUnit: 2.5, peel: { shear: -0.32, squash: 0.42, gap: 27, back: 0.2, rest: [0.5, 0.42, 0.5, 1] } },
  };
}
