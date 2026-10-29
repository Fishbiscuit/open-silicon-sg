// The open chip: a shared-run die in plan view, the way Tiny Tapeout builds
// one. A spine of multiplexing logic runs down the middle; projects from many
// designers fill a grid of tiles either side, some taking two or four tiles.
// One project is signed with the hub's tile in the top metal, the way
// designers sign their dies. Layout is illustrative, not a specific shuttle.
import { tileBody } from "../mark.mjs";

const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

export function openChipScene({ site, W = 900, H = 640 }) {
  const R = rand(29);
  const COLS = 12, ROWS = 14, TW = 66, TH = 44, GAP = 4, SPINE = 46;
  const half = (COLS / 2) * (TW + GAP);
  const DW = half * 2 + SPINE + 120, DH = ROWS * (TH + GAP) + 120;
  const x0 = 60, y0 = 60;
  const colX = (c) => x0 + (c < COLS / 2 ? c * (TW + GAP) : half + SPINE + (c - COLS / 2) * (TW + GAP));
  const rowY = (r) => y0 + r * (TH + GAP);
  const used = new Set();
  const out = [];
  out.push(`<rect width="${DW}" height="${DH}" fill="var(--lay-bg)"/>`);
  out.push(`<rect x="8" y="8" width="${DW - 16}" height="${DH - 16}" fill="none" stroke="var(--lay-metal)" stroke-opacity=".55"/><rect x="16" y="16" width="${DW - 32}" height="${DH - 32}" fill="none" stroke="var(--lay-poly)" stroke-opacity=".45"/>`);
  // pads round the edge
  for (let i = 0; i < 18; i++) {
    const t = 70 + i * ((DW - 140) / 17);
    out.push(`<rect x="${t - 9}" y="24" width="18" height="18" fill="var(--lay-pad)"/><rect x="${t - 9}" y="${DH - 42}" width="18" height="18" fill="var(--lay-pad)"/>`);
  }
  // the spine: shared multiplexing logic and power straps
  const sx = x0 + half + 4;
  out.push(`<rect x="${sx}" y="${y0}" width="${SPINE - 8}" height="${ROWS * (TH + GAP) - GAP}" fill="var(--lay-cell)"/>`);
  for (let r = 0; r < ROWS; r++) out.push(`<rect x="${sx + 6}" y="${rowY(r) + 6}" width="${SPINE - 20}" height="${TH - 12}" fill="var(--lay-cell2)"/>`);
  // the signed project: four tiles, left of the spine, a little below centre
  const art = { c: 3, r: 7, w: 2, h: 2 };
  for (let dc = 0; dc < art.w; dc++) for (let dr = 0; dr < art.h; dr++) used.add(`${art.c + dc},${art.r + dr}`);
  // other projects: mostly single tiles, some double or quadruple
  const project = (c, r, w, h) => {
    const x = colX(c), y = rowY(r), ww = w * TW + (w - 1) * GAP, hh = h * TH + (h - 1) * GAP;
    const kind = R();
    const fill = kind < 0.45 ? "var(--lay-cell)" : kind < 0.75 ? "var(--lay-diff)" : "var(--lay-block)";
    let s = `<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="${fill}"/>`;
    const rows = Math.floor(hh / 6);
    for (let k = 1; k < rows; k++) if (R() < 0.8) s += `<rect x="${x + 3}" y="${y + k * 6}" width="${ww * (0.4 + R() * 0.55)}" height="1.2" fill="var(--lay-poly)" fill-opacity=".55"/>`;
    if (R() < 0.3) s += `<rect x="${x + ww * 0.55}" y="${y + 4}" width="${ww * 0.38}" height="${hh * 0.5}" fill="var(--lay-metal)" fill-opacity=".35"/>`;
    s += `<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="none" stroke="var(--lay-outline)" stroke-opacity=".55"/>`;
    return `<g class="proj">${s}</g>`;
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
  // the signed project, with the tile in top metal
  const ax = colX(art.c), ay = rowY(art.r), aw = art.w * TW + GAP, ah = art.h * TH + GAP;
  const ts = (ah - 10) / 40;
  const tx = ax + (aw - 40 * ts) / 2, ty = ay + 5;
  out.push(`<g class="art-proj"><rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="var(--lay-sub)"/><rect class="art-ring" x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="none" stroke="var(--lay-poly)"/><g class="chip-art" transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${ts.toFixed(4)})">${tileBody(site)}</g></g>`);
  // fit the die to the stage
  const fit = Math.min(W / DW, H / DH) * 0.94;
  const ox = (W - DW * fit) / 2, oy = (H - DH * fit) / 2;
  const artC = [ax + aw / 2, ay + ah / 2];
  const zoom = Math.min(W / aw, H / ah) * 0.62 / fit;
  const body = `<g class="open-die" transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${fit.toFixed(5)})">${out.join("")}</g>`;
  return {
    W, H, body,
    label: "An open chip seen from above: a spine of shared logic down the middle and a grid of projects from many designers either side, one of them signed with the Open Silicon SG tile.",
    data: { fit, origin: [ox, oy], artC, zoom, umPerUnit: 2.5 },
  };
}
