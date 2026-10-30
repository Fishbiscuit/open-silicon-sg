// Shared helpers for the Open Silicon SG motion study.
// Geometry comes from the vendored Anatomy kit (MIT); this file adds the ITE3
// palette, materials, and a small scene builder whose parts can explode apart.
import * as k from "./kit/iso-kit.mjs";

export { k };

// Round to 0.01 for attributes.
export const r2 = (v) => Math.round(v * 100) / 100;

export function scene(P) {
  const at = (p) => k.iso(p, P);
  const S = (paths, style = {}) => k.solidSvg(paths, { crease: "faint", ...style, className: style.mat ? `m-${style.mat}` : style.className });
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const box = (plan, z, h, style = {}, steps = 4, bevel = 0) => S(k.slabOf(plan, z, h, P, steps, bevel), style);
  const cyl = (cx, cy, r, z, h, style = {}, steps = 40, bevel = 0) => S(k.cylinder(cx, cy, r, z, h, P, steps, bevel), style);
  const halo = (plan, z, h = 1, blur = 9) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}" style="filter:blur(${blur}px)"/>`;
  const ring = (cx, cy, r, z, style, steps = 48) => L(k.ring(cx, cy, r, z, P, steps), style);
  const top = (pts, z, style, closed = false) => L(k.onTop(pts, z, P, closed), style);
  const seg = (a, b, style) => L(k.segment(a, b, P), style);
  const poly3 = (pts, style) => L(k.pathOf(pts.map(at)), style);
  const byDepth = (pts, z = 0) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], z], P) - k.depthOf([b[0], b[1], z], P));
  // A part that moves apart by a world offset; the runtime eases it in and out.
  const part = (name, body, by = [0, 0, 0], extra = "") => {
    const [dx, dy] = k.axisVector(P, by);
    return `<g data-part="${name}" data-ex="${r2(dx)} ${r2(dy)}"${extra}>${Array.isArray(body) ? body.join("") : body}</g>`;
  };
  // An arched wire through 3D, sampled as a polyline (bond wires, cables).
  const arch = (a, b, lift, n = 14) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const h = Math.sin(Math.PI * Math.pow(t, 0.75)) * lift;
      pts.push(at([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t + h]));
    }
    return k.pathOf(pts);
  };
  return { P, at, S, L, D, box, cyl, halo, ring, top, seg, poly3, byDepth, part, arch };
}

// ITE3 palette, mapped onto the Anatomy tone system. Blue is atmosphere and
// energy, gold is the one lit accent (the chip), burgundy is silicon.
export const PALETTE = {
  ink: "#07111D", // deep blue-black
  night: "#06172B", // midnight navy
  air: "#0A2B52", // atmospheric navy
  blue: "#14569B", // electric blue
  glow: "#287CC3", // luminous blue
  gold: "#B88A42", // metallic gold
  warm: "#E2B968", // warm highlight
  die: "#7D4548", // chip burgundy
  white: "#F5F5F3", // soft white
};

// Materials read their colours from the active scheme (design/schemes.mjs).
// Shades 0-1 face away from the light, 2-3 toward it.
const mat = (m, { side2 = true, crease = false, fill = "side" } = {}) => {
  const S = `.iso-solid.m-${m}`;
  return [
    `${S}>.iso-top{fill:var(--m-${m}-top)}`,
    `${S}>.iso-fill{fill:var(--m-${m}-${fill})}`,
    `${S}>.iso-shade{fill:var(--m-${m}-side)}`,
    side2 ? `${S}>.iso-shade[data-shade="2"],${S}>.iso-shade[data-shade="3"]{fill:var(--m-${m}-side2)}` : "",
    `${S}>.iso-edge{stroke:var(--m-${m}-edge, var(--anatomy-hi))}`,
    crease ? `${S}>.iso-crease,${S}>.iso-bevel{stroke:var(--m-${m}-crease)}` : "",
  ].join("");
};

export const THEME_CSS = `
${mat("gold", { crease: true })}
${mat("die", { crease: true })}
${mat("epoxy")}
${mat("silicon")}
${mat("quartz")}
${mat("earth")}
${mat("pcb")}
${mat("mirror", { side2: false })}
${mat("hot", { side2: false })}
.iso-solid.m-glass>.iso-fill{fill:var(--m-glass-fill)}.iso-solid.m-glass>.iso-top{fill:var(--m-glass-top)}.iso-solid.m-glass>.iso-shade{fill:var(--m-glass-side)}.iso-solid.m-glass>.iso-edge{stroke:var(--m-glass-edge)}
.iso-solid.m-screen>.iso-top{fill:var(--m-screen-top)}
.iso-solid.iso-solid[data-lit]>.iso-edge{stroke:var(--anatomy-lit)}
.iso-solid[data-lit]>.iso-crease,.iso-solid[data-lit]>.iso-bevel{stroke:var(--anatomy-lit);stroke-opacity:.6}
.cu{stroke:var(--l-copper)!important}
.au{stroke:var(--l-gold)!important}
.ag{stroke:var(--l-silver)!important}
.iso-line[data-tone="blue"]{stroke:var(--l-energy)}
.rice circle{fill:var(--ck-rice);opacity:1}
`;

// Where the assembled object sits on screen, and how far to push in on it
// before it comes apart (the camera pulls back as the parts separate).
export function restFraming(P, points, W, H, fill = 0.62, most = 2.2) {
  const flat = points.map((p) => k.iso(p, P));
  const xs = flat.map((p) => p[0]), ys = flat.map((p) => p[1]);
  const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  return {
    restC: [r2((Math.max(...xs) + Math.min(...xs)) / 2), r2((Math.max(...ys) + Math.min(...ys)) / 2)],
    restZ: r2(Math.min(most, (W * fill) / bw, (H * fill) / bh)),
  };
}

export const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Highlights the first whole-word match, so "on" never lights up inside "Long".
export function emphasise(title, word) {
  const letter = /[\p{L}\p{N}]/u;
  let index = word ? title.indexOf(word) : -1;
  while (index >= 0 && (letter.test(title[index - 1] ?? "") || letter.test(title[index + word.length] ?? ""))) index = title.indexOf(word, index + 1);
  return index < 0 ? esc(title) : `${esc(title.slice(0, index))}<span class="hero-emphasis">${esc(word)}</span>${esc(title.slice(index + word.length))}`;
}
