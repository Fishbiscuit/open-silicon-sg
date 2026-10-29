// The short mark: an element tile. The label (SG) sits in the corner where a
// periodic table puts the atomic number, in the signal colour; the symbol (Si)
// is laid out as rows of cells of mixed widths, the way standard cells sit in
// rows on a die and the way Vensa builds its wordmark. Letters without a cell
// drawing fall back to the display face. Used by the header, footer, favicon
// and the end card of the opening sequence.
import { esc } from "./lib.mjs";

const CELL_GLYPHS = { S: ["11111", "11000", "11111", "00011", "11111"], i: ["11", "00", "11", "11", "11"] };
const CELL_WIDTHS = [2, 1, 1, 2, 1, 3, 1, 1, 2, 1];

// Returns one <rect> per cell, centred in a 40-unit tile, or null.
export function cellSymbol(symbol, { unit = 3, row = 3, gap = 0.65, cut = 0.45, y0 = 12.4, attrs = () => "" } = {}) {
  const glyphs = [...(symbol ?? "")].map((c) => CELL_GLYPHS[c]);
  if (!glyphs.length || glyphs.some((g) => !g)) return null;
  const width = glyphs.reduce((w, g) => w + g[0].length, 0) + glyphs.length - 1;
  let x = 20 - (width * unit) / 2;
  const out = [];
  glyphs.forEach((g, gi) => {
    g.forEach((bits, r) => {
      let c = 0;
      while (c < bits.length) {
        if (bits[c] !== "1") { c++; continue; }
        let end = c;
        while (end < bits.length && bits[end] === "1") end++;
        while (c < end) {
          const w = Math.min(CELL_WIDTHS[(r * (3 + gi * 2) + c + gi) % CELL_WIDTHS.length], end - c);
          out.push(`<rect x="${(x + c * unit + cut / 2).toFixed(2)}" y="${(y0 + r * (row + gap)).toFixed(2)}" width="${(w * unit - cut).toFixed(2)}" height="${row}"${attrs(r)}/>`);
          c += w;
        }
      }
    });
    x += (g[0].length + 1) * unit;
  });
  return out.join("");
}

// The tile's contents in a 40 x 40 box, coloured by CSS (.frame, .cells, .g, .s).
export function tileBody(site, { cellAttrs } = {}) {
  const cells = cellSymbol(site.mark_symbol, { attrs: cellAttrs });
  return `<rect class="frame" x="1" y="1" width="38" height="38" rx="1.5"/>${site.mark_label ? `<text class="g" x="5.2" y="10">${esc(site.mark_label)}</text>` : ""}${cells ? `<g class="cells">${cells}</g>` : `<text class="s" x="20" y="27" text-anchor="middle">${esc(site.mark_symbol)}</text>`}`;
}

export const markSvg = (site, size = 40) => site.mark_symbol ? `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true">${tileBody(site)}</svg>` : "";

// The same tile with fixed ITE3 paper colours, for the browser tab.
export function faviconLink(site) {
  if (!site.mark_symbol) return "";
  const cells = cellSymbol(site.mark_symbol);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="1" y="1" width="38" height="38" rx="2" fill="#f5f4f0" stroke="#202123" stroke-width="1.8"/>${site.mark_label ? `<text x="5" y="11" font-family="Helvetica,Arial,sans-serif" font-weight="700" font-size="8" fill="#843b70">${esc(site.mark_label)}</text>` : ""}${cells ? `<g fill="#202123">${cells}</g>` : `<text x="20" y="27" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="700" font-size="17" fill="#202123">${esc(site.mark_symbol)}</text>`}</svg>`;
  return `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}">`;
}
