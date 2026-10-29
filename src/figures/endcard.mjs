// End card of the opening sequence. The last dive keeps going past the
// transistor into the silicon crystal, one atom becomes the hub's tile, and an
// ITE3 trace brings the signal in to it.
//
// The crystal is silicon's diamond lattice (a = 543.1 pm) seen along [110],
// the view electron microscopes show: atoms in pairs 136 pm apart, bonds
// 235 pm long. Units here are picometres.
import { esc } from "../lib.mjs";
import { tileBody } from "../mark.mjs";

const A = 543.1;
const FCC = [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]];
const BONDS = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];

function lattice(W, H) {
  const pts = new Map();
  const segs = new Map();
  const proj = ([x, y, z]) => [(x - y) / Math.SQRT2, z];
  const key = ([u, v]) => `${Math.round(u)},${Math.round(v)}`;
  const inside = ([u, v], m = 0) => u >= -m && u <= W + m && v >= -m && v <= H + m;
  const nI = Math.ceil((W * Math.SQRT2) / A) + 3;
  const nK = Math.ceil(H / A) + 2;
  for (let i = -nI; i <= nI; i++) for (let j = -nI; j <= nI; j++) {
    const d = i - j, s = i + j;
    if (s < 0 || s > 2 || d < -2 || d * A > W * Math.SQRT2 + 2 * A) continue;
    for (let k = -1; k <= nK; k++) for (const b of FCC) {
      const a3 = [(i + b[0]) * A, (j + b[1]) * A, (k + b[2]) * A];
      const pa = proj(a3);
      if (inside(pa, 120)) pts.set(key(pa), pa);
      for (const o of BONDS) {
        const b3 = [a3[0] + (o[0] * A) / 4, a3[1] + (o[1] * A) / 4, a3[2] + (o[2] * A) / 4];
        const pb = proj(b3);
        if (inside(pb, 120)) pts.set(key(pb), pb);
        if (inside(pa, 300) && inside(pb, 300)) {
          const kk = [key(pa), key(pb)].sort().join("|");
          if (!segs.has(kk) && Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) > 20) segs.set(kk, [pa, pb]);
        }
      }
    }
  }
  return { atoms: [...pts.values()], bonds: [...segs.values()] };
}

export function endScene({ site, hero, W = 900, H = 640 }) {
  const LW = 6400, LH = (LW * H) / W;
  const { atoms, bonds } = lattice(LW, LH);
  const centre = [LW / 2, LH / 2];
  let pick = atoms[0];
  for (const p of atoms) if (Math.hypot(p[0] - centre[0], p[1] - centre[1]) < Math.hypot(pick[0] - centre[0], pick[1] - centre[1])) pick = p;
  const R = 44; // drawn atom radius, pm
  const r1 = (n) => Math.round(n * 10) / 10;
  const bondD = bonds.map(([p, q]) => `M${r1(p[0])} ${r1(p[1])}L${r1(q[0])} ${r1(q[1])}`).join("");
  const atomSvg = atoms.map((p) => `<circle${p === pick ? ' class="pick"' : ""} cx="${r1(p[0])}" cy="${r1(p[1])}" r="${R}"/>`).join("");
  const s0 = W / LW; // whole crystal patch fills the stage
  const s1 = 34 / R; // one atom, 34 px across its radius
  // Final composition, in stage units.
  const T = 190;
  const tile = { x: 330, y: 300 };
  const traces = [
    "M-20 432H95Q120 432 120 407V325Q120 300 145 300H235",
    "M-20 168H40Q65 168 65 193V560Q65 585 90 585H330Q355 585 355 560V395",
    "M420 -20V96Q420 121 395 121H355Q330 121 330 146V205",
  ];
  const nodes = [[120, 432], [65, 168], [355, 585], [420, 121]];
  const traceSvg = `<g class="end-trace">${traces.map((d) => `<path class="tr" pathLength="1" d="${d}"/>`).join("")}<path class="sig" pathLength="1" d="${traces[0]}"/>${nodes.map(([x, y]) => `<circle class="node" cx="${x}" cy="${y}" r="13"/>`).join("")}<rect class="pad" x="174" y="560" width="48" height="48"/><rect class="pad-slot" x="194" y="572" width="8" height="24" rx="4"/></g>`;
  const name = `<g class="end-name"><text class="nm" x="462" y="290">${esc(site.wordmark)}</text>${site.wordmark_suffix ? `<text class="nm acc" x="462" y="340">${esc(site.wordmark_suffix)}</text>` : ""}${hero.end_line ? `<text class="sub" x="464" y="384">${esc(hero.end_line)}</text>` : ""}</g>`;
  const tileSvg = `<g class="end-tile" transform="translate(${W / 2} ${H / 2})"><g transform="translate(-20 -20)">${tileBody(site, { cellAttrs: (r) => ` data-r="${r}"` })}<circle class="end-core" cx="20" cy="20" r="19"/></g></g>`;
  const body = `<g class="lat-cam" transform="translate(0 0) scale(${s0.toFixed(5)})"><g class="lattice"><path class="bonds" d="${bondD}"/><g class="atoms">${atomSvg}</g></g></g>${traceSvg}${tileSvg}${name}`;
  return {
    W, H,
    body,
    label: `Silicon's crystal, atom by atom, then the ${site.name} tile with a circuit trace leading into it.`,
    data: { s0, s1, pick: pick.map(r1), centre: centre.map(r1), R, tile, T },
    atomCount: atoms.length,
  };
}
