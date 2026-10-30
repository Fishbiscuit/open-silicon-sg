// Fig 4 — from sand to phone. One long bench, thirteen stations. A carrier
// rides the conveyor and its load changes at every station: quartz, silicon,
// a crystal, wafers, a printed wafer, dies, packages, a board, a phone. At the
// end the camera pulls back to show the whole chain, and a line runs back
// from the phone to the design desk: with an open design, anyone can check.
// The hub's tile turns up from Design onwards: on the designer's screen, on
// the mask, printed on the packages, and where the check lands.
import { k, scene, r2, esc, emphasise } from "../lib.mjs";
import * as G from "../kit/lathe.mjs";
import { tileBody } from "../mark.mjs";

const SP = 300; // station spacing
const CY = 70; // conveyor centre line
const CZ = 7; // conveyor deck height
const N = 13;
const XS = Array.from({ length: N }, (_, i) => i * SP);



export function fabScene({ W = 1200, H = 560, copy, site }) {
  // The first five machines (quartz to wafer) play as one quick step; the
  // hub's part of the story, from Design onwards, gets a step per machine.
  const STEPS = [{ m0: 0, m1: 4 }, ...XS.slice(5).map((_, k) => ({ m0: k + 5, m1: k + 5 }))];
  const STATIONS = copy.stations;
  if (STATIONS.length !== STEPS.length) throw new Error(`content/fab.md: expected ${STEPS.length} steps (sand to wafer, then design to use), found ${STATIONS.length}`);
  const P = { origin: [0, 0], scale: 1.22, azimuth: 62, elevation: 30 };
  const s = scene(P);
  const { at, S, L, D, box, cyl, halo } = s;
  const up = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const alongY = (x, y, z) => G.frameOf([x, y, z], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
  const alongX = (x, y, z) => G.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const Ls = (pts, style) => L(k.pathOf(pts.map(at)), style);
  // the hub's tile laid flat on a top face, size units across
  const tileOnTop = (cls, x, y, z, size) => `<g class="fab-tile ${cls}" transform="${k.topMatrix([x, y], z, P)}"><g transform="scale(${r2(size / 40)})">${tileBody(site)}</g></g>`;
  const fx = [];
  const back = [];
  const front = [];
  const peds = [];

  // ---------------------------------------------------------- bench and line
  const X0 = -170, X1 = XS[N - 1] + 190;
  const bench = { x: X0 + 300, y: -150, w: X1 - X0 - 300, d: 300, r: 10 };
  const ground = [];
  ground.push(halo({ x: X0, y: -150, w: X1 - X0, d: 300, r: 10 }, -20, 1, 18));
  // the earth: a cut block of strata, quartz veins exposed on its face
  const earth = { x: X0, y: -150, w: 300, d: 300, r: 6 };
  ground.push(box(earth, -96, 96, { mat: "earth", tone: "mid" }, 4, 1));
  const strata = [];
  for (const z of [-22, -40, -61, -79]) strata.push(k.sideSeam(earth, z + Math.sin(z) * 2, P, 4));
  ground.push(L(strata.join(""), { tone: "faint", className: "strata" }));
  const veins = [];
  const R = mulberry(7);
  for (let i = 0; i < 9; i++) {
    const vx = X0 + 30 + R() * 240, vz = -14 - R() * 70;
    const face = R() > 0.45 ? "front" : "side";
    const pts = [];
    for (let j = 0; j < 6; j++) {
      const a = (j / 6) * Math.PI * 2, rr = 3 + R() * 5;
      if (face === "front") pts.push(at([vx + Math.cos(a) * rr * 1.6, earth.y + earth.d, vz + Math.sin(a) * rr]));
      else pts.push(at([earth.x + earth.w, -140 + ((vx - X0) / 300) * 280 + Math.cos(a) * rr * 1.6, vz + Math.sin(a) * rr]));
    }
    veins.push(`<path d="${k.pathOf(pts, true)}" fill="var(--vein)" fill-opacity=".85" stroke="var(--vein-edge)" stroke-width=".6"/>`);
  }
  ground.push(veins.join(""));
  ground.push(box(bench, -18, 18, { tone: "mid" }, 6, 1.2));
  ground.push(L(k.planOutline(k.insetPlan(bench, 6), 0, P, 4), { tone: "lo" }));
  // ruler along the front edge, one major tick per station
  const strip = { x: bench.x + 10, y: bench.y + bench.d - 12, w: bench.w - 20, d: 7, r: 1 };
  ground.push(box(strip, 0, 0.6, { tone: "lo", crease: "none" }, 3));
  const ticks = k.topTicks(strip.x + 6, strip.x + strip.w - 6, 10, 10, strip.y + 0.8, 0.6, [2.4, 5], P);
  ground.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const screws = [];
  for (let x = bench.x + 40; x < bench.x + bench.w; x += 300) screws.push(at([x, bench.y + 10, 0]), at([x, bench.y + bench.d - 22, 0]));
  ground.push(D(screws, { size: 0.7 }));
  // conveyor: two rails on posts with ties between them
  const rail = (y) => box({ x: X0 + 40, y, w: X1 - X0 - 60, d: 5, r: 1.5 }, CZ - 2, 3, { tone: "hi" }, 3, 0.4);
  const ties = [];
  for (let x = X0 + 52; x < X1 - 20; x += 22) ties.push(k.lineOnTop([x, CY - 20], [x, CY + 20], CZ, P));
  const posts = [];
  for (let x = X0 + 80; x < X1 - 20; x += 150) posts.push(box({ x: x - 3, y: CY + 22, w: 6, d: 6, r: 1 }, 0, CZ - 2, { tone: "mid" }, 2));
  const conveyor = [rail(CY - 26), L(ties.join(""), { tone: "faint" }), ...posts, rail(CY + 21)];

  // ---------------------------------------------------------- loads
  // Each load is drawn around a world origin o = [x, y, z] (its base centre).
  const LOADS = [
    (o) => rocks(o, "quartz", 11),
    (o) => rocks(o, "silicon", 5),
    (o) => {
      let out = "";
      for (const [dx, dy] of [[-14, -6], [2, 8], [14, -6]].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) out += S(G.disc(0, 30, 5.4, up(o[0] + dx, o[1] + dy, o[2]), P), { mat: "silicon", tone: "hi" }) + L(k.ring(o[0] + dx, o[1] + dy, 3, o[2] + 30, P, 16), { tone: "lo" });
      return out;
    },
    (o) => S(G.solidOf([[-34, 0], [-30, 12, 1], [-24, 15, 1], [26, 15, 1], [32, 10, 1], [36, 0]], alongX(o[0], o[1], o[2] + 16), P, { smooth: true }), { mat: "silicon", tone: "hi" }),
    (o) => {
      let out = "";
      for (let i = 0; i < 4; i++) out += S(G.disc(i * 3.2, i * 3.2 + 1.2, 26, up(o[0], o[1], o[2]), P), { mat: "mirror", tone: "hi" });
      return out;
    },
    (o) => wafer(o, "plain"),
    (o) => wafer(o, "print"),
    (o) => wafer(o, "layers"),
    (o) => wafer(o, "tested"),
    (o) => {
      let out = L(k.ring(o[0], o[1], 30, o[2] + 0.6, P, 64) + k.ring(o[0], o[1], 27, o[2] + 0.6, P, 64), { tone: "mid" });
      const dies = [];
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) if (i * i + j * j <= 9) dies.push([o[0] + i * 6.6, o[1] + j * 6.6]);
      s.byDepth(dies).forEach(([x, y]) => (out += box({ x: x - 2.5, y: y - 2.5, w: 5, d: 5, r: 0.2 }, o[2], 1.2, { mat: "die", tone: "hi" }, 1)));
      return out;
    },
    (o) => {
      let out = "";
      s.byDepth([[-12, -12], [12, -12], [-12, 12], [12, 12]]).forEach(([dx, dy]) => {
        const p = { x: o[0] + dx - 8, y: o[1] + dy - 8, w: 16, d: 16, r: 0.6 };
        out += box(p, o[2], 3.2, { mat: "epoxy", tone: "hi" }, 2, 0.4);
        const legs = [];
        for (let i = 0; i < 5; i++) {
          const t = p.x + 2.4 + i * 2.8;
          legs.push(k.onTop([[t, p.y + p.d], [t, p.y + p.d + 1.6]], o[2] + 0.3, P), k.onTop([[p.x + p.w, p.y + 2.4 + i * 2.8], [p.x + p.w + 1.6, p.y + 2.4 + i * 2.8]], o[2] + 0.3, P));
        }
        out += L(legs.join(""), { className: "au" }) + D([at([p.x + 2.5, p.y + 2.5, o[2] + 3.2])], { size: 0.6, tone: "mid" });
        out += tileOnTop("marking", p.x + 4, p.y + 4, o[2] + 3.2, 9);
      });
      return out;
    },
    (o) => {
      const b = { x: o[0] - 30, y: o[1] - 22, w: 60, d: 44, r: 2 };
      let out = box(b, o[2], 1.6, { mat: "pcb", tone: "mid" }, 3);
      const tr = [];
      for (let i = 0; i < 5; i++) tr.push(k.onTop([[b.x + 4, b.y + 6 + i * 7], [b.x + 22, b.y + 6 + i * 7]], o[2] + 1.6, P));
      out += L(tr.join(""), { className: "cu", tone: "lo" });
      const parts = [{ x: o[0] - 6, y: o[1] - 8, w: 16, d: 16, h: 2.4, lit: true }, { x: o[0] + 14, y: o[1] - 16, w: 10, d: 9, h: 1.8 }, { x: o[0] + 14, y: o[1] + 2, w: 9, d: 12, h: 2 }, { x: o[0] - 24, y: o[1] + 8, w: 8, d: 8, h: 1.6 }];
      parts.sort((a, b2) => k.depthOf([a.x, a.y, 0], P) - k.depthOf([b2.x, b2.y, 0], P)).forEach((p) => {
        out += box({ ...p, r: 0.6 }, o[2] + 1.6, p.h, { mat: "epoxy", tone: "hi", lit: !!p.lit }, 2, 0.3);
        if (p.lit) out += tileOnTop("marking", p.x + 3.5, p.y + 3.5, o[2] + 1.6 + p.h, 9);
      });
      return out;
    },
    (o) => {
      const ph = { x: o[0] - 34, y: o[1] - 17, w: 68, d: 34, r: 5 };
      return box(ph, o[2], 4, { tone: "hi" }, 8, 0.6) + box(k.insetPlan(ph, 1.8), o[2] + 4, 0.4, { mat: "screen", tone: "mid", crease: "none" }, 8) + L(k.ring(ph.x + ph.w - 5, o[1], 1, o[2] + 4.4, P, 12), { tone: "mid" });
    },
  ];
  function rocks(o, mat, seed) {
    const r = mulberry(seed);
    const list = [];
    for (let i = 0; i < 7; i++) list.push([o[0] + (r() - 0.5) * 44, o[1] + (r() - 0.5) * 30, 5 + r() * 6]);
    return s.byDepth(list).map(([x, y, rr]) => {
      const ring = [];
      const n = 5 + Math.floor(r() * 3);
      for (let j = 0; j < n; j++) {
        const a = (j / n) * Math.PI * 2 + r() * 0.4;
        ring.push([x + Math.cos(a) * rr * (0.75 + r() * 0.4), y + Math.sin(a) * rr * (0.75 + r() * 0.4)]);
      }
      return S(k.extrude(ring, o[2], rr * (0.9 + r() * 0.6), P, { bevel: 0.6 }), { mat, tone: "hi" });
    }).join("");
  }
  function wafer(o, kind) {
    const F = up(o[0], o[1], o[2]);
    let out = S(G.disc(0, 1.4, 30, F, P), { mat: kind === "plain" ? "mirror" : "die", tone: "hi", lit: kind !== "plain" });
    const z = o[2] + 1.4;
    if (kind !== "plain") {
      const lines = [];
      for (let i = -4; i <= 4; i++) {
        const c = i * 6.2;
        const h = Math.sqrt(Math.max(0, 27 * 27 - c * c));
        lines.push(k.lineOnTop([o[0] + c, o[1] - h], [o[0] + c, o[1] + h], z, P), k.lineOnTop([o[0] - h, o[1] + c], [o[0] + h, o[1] + c], z, P));
      }
      out += L(lines.join(""), { className: kind === "layers" ? "au" : "ag", tone: "lo" });
    }
    if (kind === "tested") {
      const dots = [];
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) if (i * i + j * j <= 10) dots.push(at([o[0] + (i + 0.5) * 6.2 - 3.1, o[1] + (j + 0.5) * 6.2 - 3.1, z]));
      out += `<g class="ok-dots">${D(dots, { size: 1.1, tone: "hi" })}</g>`;
    }
    // the flat that marks crystal orientation
    out += L(k.lineOnTop([o[0] - 8, o[1] + 29], [o[0] + 8, o[1] + 29], z, P), { tone: "mid" });
    return out;
  }

  // ---------------------------------------------------------- stations
  const M = []; // { back, front, fx } per station
  const MY = -40; // machine centre line, behind the conveyor
  // 1. Quartz: a sand pile and rocks on the cut ground
  {
    const x = XS[0];
    let b = S(G.solidOf([[0, 52], [6, 46, 1], [20, 30, 1], [32, 10, 1], [36, 0]], up(x - 50, MY - 10, 0), P, { smooth: true }), { mat: "quartz", tone: "hi" });
    b += rocks([x + 40, MY - 30, 0], "quartz", 3) + rocks([x + 20, MY + 34, 0], "quartz", 9);
    const grains = [];
    const r = mulberry(4);
    for (let i = 0; i < 80; i++) {
      const a = r() * Math.PI * 2, rr = 40 + r() * 26;
      grains.push(at([x - 50 + Math.cos(a) * rr, MY - 10 + Math.sin(a) * rr, 0]));
    }
    b += D(grains, { size: 0.7, tone: "mid" });
    M.push({ back: b, front: "", fx: "" });
  }
  // 2. Reduce: an arc furnace with three electrodes on a gantry
  {
    const x = XS[1];
    const F = up(x, MY, 0);
    let b = "";
    for (const px of [x - 86, x + 86]) b += box({ x: px - 6, y: MY - 6, w: 12, d: 12, r: 1 }, 0, 150, { tone: "mid" }, 2, 0.4);
    b += S(G.solidOf([[0, 62], [44, 62], [50, 56], [52, 50]], F, P), { tone: "mid", inner: L(G.arcOf(F, 18, 62, P) + G.arcOf(F, 36, 62, P), { tone: "faint" }) });
    const melt = k.onTop(k.circleRing(x, MY, 47, 64), 52, P, true);
    b += `<path d="${melt}" class="hot"/>`;
    const el = [[x, MY - 22], [x - 19, MY + 11], [x + 19, MY + 11]];
    let f = "";
    s.byDepth(el).forEach(([ex, ey]) => {
      f += S(G.disc(40, 132, 7, up(ex, ey, 0), P), { tone: "hi" }) + S(G.disc(108, 116, 10, up(ex, ey, 0), P), { tone: "mid" });
    });
    f += box({ x: x - 92, y: MY - 8, w: 184, d: 16, r: 2 }, 140, 12, { tone: "mid" }, 3, 0.6);
    f += D([at([x - 80, MY, 152]), at([x + 80, MY, 152])], { size: 0.8 });
    M.push({ back: b, front: f, fx: `<ellipse class="fx-glow" data-fx="1" cx="${r2(at([x, MY, 52])[0])}" cy="${r2(at([x, MY, 52])[1])}" rx="90" ry="46" fill="url(#fab-hot)"/>` });
  }
  // 3. Purify: a bell jar over hairpin rods
  {
    const x = XS[2];
    let b = S(G.disc(0, 12, 66, up(x, MY, 0), P), { tone: "mid" }) + L(k.ring(x, MY, 58, 12, P, 72), { tone: "lo" });
    const rods = [[-24, -10], [0, -24], [24, -10], [-12, 14], [12, 14]];
    let rr = "";
    s.byDepth(rods.map(([a, c]) => [x + a, MY + c])).forEach(([rx, ry]) => (rr += S(G.disc(12, 92, 4.2, up(rx, ry, 0), P), { mat: "silicon", tone: "hi" })));
    b += `<g class="rods">${rr}</g>`;
    b += S(G.solidOf([[12, 56], [60, 56, 1], [88, 46, 1], [106, 26, 1], [114, 0]], up(x, MY, 0), P, { smooth: true }), { mat: "glass", tone: "hi" });
    b += Ls([[x + 60, MY + 30, 6], [x + 92, MY + 30, 6], [x + 92, MY + 30, 40]], { tone: "mid" });
    M.push({ back: b, front: "", fx: `<ellipse class="fx-glow" data-fx="2" cx="${r2(at([x, MY, 56])[0])}" cy="${r2(at([x, MY, 56])[1])}" rx="64" ry="70" fill="url(#fab-warm)"/>` });
  }
  // 4. Grow: a crystal puller, tall and narrow, with a viewport on the melt
  {
    const x = XS[3];
    const F = up(x, MY, 0);
    let b = S(G.solidOf([[0, 52], [64, 52], [72, 46, 1], [82, 30, 1], [88, 16]], F, P, { smooth: true }), { tone: "hi", inner: L(G.arcOf(F, 22, 52, P) + G.arcOf(F, 44, 52, P), { tone: "faint" }) });
    b += S(G.disc(88, 214, 15, F, P), { tone: "hi", inner: L(G.arcOf(F, 140, 15, P) + G.arcOf(F, 180, 15, P), { tone: "faint" }) });
    b += box({ x: x - 22, y: MY - 18, w: 44, d: 36, r: 3 }, 214, 26, { tone: "mid" }, 3, 0.6);
    b += box({ x: x - 74, y: MY - 10, w: 14, d: 20, r: 2 }, 0, 230, { tone: "mid" }, 2, 0.4);
    b += box({ x: x - 62, y: MY - 6, w: 40, d: 12, r: 2 }, 214, 8, { tone: "mid" }, 2);
    const [vx, vy] = k.towardViewer(P);
    const vp = [x + vx * 52, MY + vy * 52, 36];
    b += `<ellipse class="port" cx="${r2(at(vp)[0])}" cy="${r2(at(vp)[1])}" rx="9" ry="7"/>`;
    M.push({ back: b, front: "", fx: `<ellipse class="fx-glow" data-fx="3" cx="${r2(at(vp)[0])}" cy="${r2(at(vp)[1])}" rx="40" ry="34" fill="url(#fab-hot)"/>` });
  }
  // 5. Slice: two rollers carrying a web of wire, an ingot pressed into it
  {
    const x = XS[4];
    let b = box({ x: x - 80, y: MY - 50, w: 160, d: 100, r: 4 }, 0, 34, { tone: "mid" }, 4, 1);
    for (const px of [x - 66, x + 54]) b += box({ x: px, y: MY - 50, w: 12, d: 100, r: 2 }, 34, 50, { tone: "mid" }, 2, 0.4);
    b += S(G.disc(-46, 46, 16, alongY(x - 40, MY, 70), P), { tone: "hi" }) + S(G.disc(-46, 46, 16, alongY(x + 40, MY, 70), P), { tone: "hi" });
    const web = [];
    for (let y = MY - 40; y <= MY + 40; y += 4) web.push(k.segment([x - 40, y, 86], [x + 40, y, 86], P));
    b += `<path class="iso-line web" data-tone="hi" d="${web.join("")}"/>`;
    b += S(G.solidOf([[-44, 0], [-44, 20], [44, 20], [44, 0]], alongY(x, MY, 102), P), { mat: "silicon", tone: "hi" });
    b += box({ x: x - 60, y: MY - 8, w: 120, d: 16, r: 2 }, 124, 10, { tone: "mid" }, 3, 0.5);
    M.push({ back: b, front: "", fx: "" });
  }
  // 6. Design: a desk, a screen with the layout on it, and the mask it becomes
  {
    const x = XS[5];
    const desk = { x: x - 80, y: MY - 46, w: 160, d: 84, r: 3 };
    let b = "";
    for (const [lx, ly] of s.byDepth(k.corners(desk, 6))) b += box({ x: lx - 3, y: ly - 3, w: 6, d: 6, r: 1 }, 0, 64, { tone: "mid" }, 2);
    b += box(desk, 64, 4, { tone: "hi", lit: true }, 3, 0.8);
    // monitor, a plane facing the viewer
    const [vx, vy] = k.towardViewer(P);
    const side = [vy, -vx, 0];
    const mo = [x - vx * 18, MY - vy * 18, 74];
    const MF = G.frameOf(mo, [vx, vy, 0], side, [0, 0, 1]);
    b += S(G.disc(68, 74, 3, up(mo[0], mo[1], 0), P), { tone: "mid" });
    b += S(G.prismOf(MF, [[-50, 0], [50, 0], [50, 62], [-50, 62]], -2, 2, P), { tone: "hi", lit: true });
    // the layout on screen: a mini floorplan in burgundy and gold
    const pt = (u, v) => at([mo[0] + vx * 2.2 + side[0] * u, mo[1] + vy * 2.2 + side[1] * u, mo[2] + v]);
    const quad = (u0, v0, u1, v1) => k.pathOf([pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)], true);
    b += `<path d="${quad(-46, 4, 46, 58)}" fill="var(--lay-bg)"/>`;
    const blocks = [[-42, 8, -8, 30, "var(--lay-diff)"], [-4, 8, 42, 24, "var(--lay-cell)"], [-4, 28, 18, 54, "var(--lay-diff)"], [-42, 34, -8, 54, "var(--lay-cell)"]];
    blocks.forEach(([a, c, d2, e, col]) => (b += `<path d="${quad(a, c, d2, e)}" fill="${col}" stroke="var(--lay-poly)" stroke-opacity=".6" stroke-width=".6"/>`));
    const rows = [];
    for (let v = 10; v < 54; v += 3) rows.push(k.pathOf([pt(-40, v), pt(-10, v)]));
    b += `<path d="${rows.join("")}" stroke="var(--lay-poly)" stroke-opacity=".5" stroke-width=".5" fill="none"/>`;
    // the designer signs the layout with the tile, top right of the screen
    {
      const [u0, u1, v1] = pt(1, 0)[0] > pt(0, 0)[0] ? [21, 22, 54] : [43, 42, 54];
      const o = pt(u0, v1), ex = pt(u1, v1), ey = pt(u0, v1 - 1);
      const m = [ex[0] - o[0], ex[1] - o[1], ey[0] - o[0], ey[1] - o[1], o[0], o[1]].map((n) => Math.round(n * 1000) / 1000);
      b += `<g class="fab-tile on-screen" transform="matrix(${m.join(" ")})"><g transform="scale(${22 / 40})">${tileBody(site)}</g></g>`;
    }
    b += box({ x: x - 26, y: MY + 8, w: 52, d: 18, r: 2 }, 68, 2, { tone: "mid" }, 3, 0.4);
    b += D(Array.from({ length: 24 }, (_, i) => at([x - 22 + (i % 12) * 4, MY + 12 + Math.floor(i / 12) * 6, 70])), { size: 0.6, tone: "lo" });
    // the mask: a glass plate with the pattern in chrome, on a small stand
    const mk = { x: x + 40, y: MY - 30, w: 30, d: 30, r: 1 };
    b += box({ x: mk.x + 9, y: mk.y + 9, w: 12, d: 12, r: 1 }, 68, 10, { tone: "mid" }, 2);
    b += box(mk, 78, 2, { mat: "glass", tone: "hi" }, 2, 0.3);
    b += tileOnTop("on-mask", mk.x + 4, mk.y + 4, 80, 22);
    M.push({ back: b, front: "", fx: `<ellipse class="fx-glow" data-fx="5" cx="${r2(pt(0, 30)[0])}" cy="${r2(pt(0, 30)[1])}" rx="80" ry="60" fill="url(#fab-gold)"/>` });
  }
  // 7. Print: a scanner housing with an arm over the line, a lens column
  {
    const x = XS[6];
    let b = box({ x: x - 80, y: MY - 66, w: 160, d: 110, r: 4 }, 0, 156, { tone: "hi" }, 4, 1);
    b += L(k.sideSeam({ x: x - 80, y: MY - 66, w: 160, d: 110, r: 4 }, 60, P, 4) + k.sideSeam({ x: x - 80, y: MY - 66, w: 160, d: 110, r: 4 }, 120, P, 4), { tone: "faint" });
    b += D(k.dotGrid(x - 70, MY + 44, 10, 1, 6, 30, P).map((p) => p), { size: 0.6, tone: "lo" });
    let f = box({ x: x - 34, y: MY + 30, w: 68, d: CY - MY + 10, r: 4 }, 126, 30, { tone: "hi" }, 4, 0.8);
    f += box({ x: x - 22, y: CY - 22, w: 44, d: 44, r: 2 }, 120, 6, { mat: "glass", tone: "hi" }, 2, 0.3);
    const F = up(x, CY, 0);
    f += S(G.solidOf([[56, 10], [64, 13, 1], [100, 16, 1], [120, 18]], F, P, { smooth: true }), { tone: "hi", inner: L(G.arcOf(F, 76, 14.2, P) + G.arcOf(F, 92, 15.5, P), { tone: "faint" }) });
    const lo = at([x, CY, 56]);
    const w0 = at([x - 26, CY, CZ + 10]), w1 = at([x + 26, CY, CZ + 10]);
    const beam = `<path class="fx-beam" data-fx="6" d="M${r2(lo[0] - 7)} ${r2(lo[1])}L${r2(lo[0] + 7)} ${r2(lo[1])}L${r2(w1[0])} ${r2(w1[1])}L${r2(w0[0])} ${r2(w0[1])}Z" fill="url(#fab-beam)"/>`;
    M.push({ back: b, front: f, fx: beam });
  }
  // 8. Build up: a cluster tool — a transfer hub ringed by process chambers
  {
    const x = XS[7];
    let b = "";
    const ch = [[-62, -50], [0, -78], [62, -50]];
    s.byDepth(ch.map(([a, c]) => [x + a, MY + c])).forEach(([cx2, cy2], i) => {
      b += S(G.disc(0, 50, 24, up(cx2, cy2, 0), P), { tone: "hi", inner: L(G.arcOf(up(cx2, cy2, 0), 20, 24, P), { tone: "faint" }) });
      b += S(G.disc(50, 56, 27, up(cx2, cy2, 0), P), { tone: "mid" });
      const [gx, gy] = at([cx2, cy2, 56]);
      b += `<ellipse class="fx-plasma" data-fx="7" style="--d:${i * 0.5}s" cx="${r2(gx)}" cy="${r2(gy)}" rx="26" ry="14" fill="url(#fab-blue)"/>`;
    });
    b += S(G.disc(0, 36, 42, G.frameOf([x, MY, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 6 }), { tone: "hi" });
    b += L(k.ring(x, MY, 30, 36, P, 6), { tone: "lo" });
    b += box({ x: x - 20, y: MY + 30, w: 40, d: CY - MY - 46, r: 2 }, 0, 30, { tone: "mid" }, 2, 0.6);
    M.push({ back: b, front: "", fx: "" });
  }
  // 9. Test: a prober, its head reaching over the line, a ring of needles
  {
    const x = XS[8];
    let b = box({ x: x - 70, y: MY - 56, w: 140, d: 100, r: 4 }, 0, 70, { tone: "hi" }, 4, 0.8);
    b += box({ x: x - 40, y: MY - 40, w: 80, d: 60, r: 3 }, 70, 40, { tone: "mid" }, 3, 0.6);
    let f = box({ x: x - 40, y: MY + 30, w: 80, d: CY - MY + 6, r: 3 }, 54, 14, { tone: "hi" }, 3, 0.6);
    const F = up(x, CY, 0);
    f += S(G.ringBand(40, 46, 16, 30, F, P), { tone: "mid" });
    const needles = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      needles.push(k.segment([x + Math.cos(a) * 18, CY + Math.sin(a) * 18, 40], [x + Math.cos(a) * 4, CY + Math.sin(a) * 4, CZ + 12], P));
    }
    f += L(needles.join(""), { className: "au", tone: "hi" });
    M.push({ back: b, front: f, fx: "" });
  }
  // 10. Cut: a spindle over the line, a thin blade, a water jet
  {
    const x = XS[9];
    let b = box({ x: x - 70, y: MY - 56, w: 140, d: 100, r: 4 }, 0, 60, { tone: "hi" }, 4, 0.8);
    let f = box({ x: x - 16, y: MY, w: 32, d: CY - MY - 4, r: 3 }, 60, 26, { tone: "hi" }, 3, 0.6);
    f += S(G.disc(-6, 6, 13, alongY(x, CY - 6, 50), P), { tone: "mid" });
    f += `<g class="blade">${S(G.disc(6, 8, 30, alongY(x, CY - 6, 50), P), { mat: "silicon", tone: "hi" })}</g>`;
    f += Ls([[x + 30, CY - 4, 66], [x + 30, CY + 6, 66], [x + 16, CY + 6, 36]], { tone: "blue" });
    M.push({ back: b, front: f, fx: `<path class="iso-line fx-spray" data-fx="9" data-tone="blue" d="${k.pathOf([at([x + 16, CY + 6, 36]), at([x + 4, CY + 2, CZ + 12])])}"/>` });
  }
  // 11. Package: a bonder head with its capillary, a magazine of frames
  {
    const x = XS[10];
    let b = box({ x: x - 76, y: MY - 56, w: 152, d: 100, r: 4 }, 0, 64, { tone: "hi" }, 4, 0.8);
    for (let i = 0; i < 6; i++) b += box({ x: x + 30, y: MY - 40, w: 36, d: 50, r: 1 }, 64 + i * 6, 3, { tone: i % 2 ? "mid" : "hi" }, 2);
    b += box({ x: x + 26, y: MY - 44, w: 4, d: 58, r: 1 }, 64, 40, { tone: "mid" }, 2);
    let f = box({ x: x - 50, y: MY - 10, w: 30, d: CY - MY + 12, r: 3 }, 84, 18, { tone: "hi" }, 3, 0.6);
    f += box({ x: x - 12, y: CY - 10, w: 24, d: 20, r: 3 }, 60, 26, { tone: "hi" }, 3, 0.6);
    f += S(G.solidOf([[CZ + 14, 0.6], [CZ + 20, 1.2], [60, 3.4]], up(x, CY, 0), P), { tone: "hi" });
    M.push({ back: b, front: f, fx: `<circle class="fx-spark" data-fx="10" cx="${r2(at([x, CY, CZ + 13])[0])}" cy="${r2(at([x, CY, CZ + 13])[1])}" r="9" fill="url(#fab-gold)"/>` });
  }
  // 12. Place: feeder reels behind, a gantry with a pick-and-place head
  {
    const x = XS[11];
    let b = "";
    for (let i = 0; i < 5; i++) b += S(G.disc(-3, 3, 22, alongY(x - 60 + i * 30, MY - 30, 26), P), { tone: i % 2 ? "mid" : "hi", inner: L(G.arcOf(alongY(x - 60 + i * 30, MY - 30, 26), 3, 8, P), { tone: "lo" }) });
    b += box({ x: x - 80, y: MY - 6, w: 160, d: 30, r: 3 }, 0, 20, { tone: "hi" }, 3, 0.6);
    for (const px of [x - 90, x + 78]) b += box({ x: px, y: MY + 20, w: 12, d: 12, r: 2 }, 0, 112, { tone: "mid" }, 2, 0.4);
    b += box({ x: x - 90, y: MY + 20, w: 180, d: 12, r: 2 }, 112, 14, { tone: "hi" }, 3, 0.6);
    let f = `<g class="pnp" data-fx="11">${box({ x: x - 8, y: MY + 30, w: 16, d: CY - MY - 26, r: 2 }, 100, 14, { tone: "hi" }, 2, 0.4)}${box({ x: x - 10, y: CY - 12, w: 20, d: 18, r: 2 }, 70, 30, { tone: "hi" }, 2, 0.5)}${S(G.disc(CZ + 26, 70, 2.2, up(x, CY - 3, 0), P), { tone: "hi" })}</g>`;
    M.push({ back: b, front: f, fx: "" });
  }
  // 13. Use: a soft lit plinth where the finished phone is shown
  {
    const x = XS[12];
    let b = S(G.disc(0, 30, 50, up(x, MY - 10, 0), P), { tone: "hi", inner: L(G.arcOf(up(x, MY - 10, 0), 22, 50, P), { tone: "faint" }) });
    b += LOADS[12]([x, MY - 10, 30]);
    M.push({ back: b, front: "", fx: `<ellipse class="fx-glow" data-fx="12" cx="${r2(at([x, MY - 10, 34])[0])}" cy="${r2(at([x, MY - 10, 34])[1])}" rx="80" ry="40" fill="url(#fab-blue)"/>` });
  }

  // Pedestals beside the line: the output of each station stays behind.
  XS.forEach((x, i) => {
    const px = x + 130, py = CY + 50;
    let p = box({ x: px - 34, y: py - 22, w: 68, d: 44, r: 3 }, 0, 10, { tone: "mid" }, 3, 0.6);
    p += LOADS[i]([px, py, 10]);
    peds.push(`<g class="ped" data-ped="${i}">${p}</g>`);
  });

  // The carrier: a sled on the rails, one load per station, swapped live.
  const sled = { x: -34, y: CY - 26, w: 68, d: 52, r: 3 };
  let carrier = box(sled, CZ + 3, 4, { tone: "hi" }, 3, 0.6) + D(k.corners(sled, 6).map(([a, c]) => at([a, c, CZ + 7])), { size: 0.6 });
  carrier += LOADS.map((f, i) => `<g class="load" data-load="${i}"${i ? ' style="opacity:0"' : ""}>${f([0, CY, CZ + 7])}</g>`).join("");
  const [ux, uy] = k.axisVector(P, [1, 0, 0]);

  // The loop back: from the phone to the design desk, over the line.
  const from = at([XS[12], MY - 10, 60]);
  const to = at([XS[5], MY, 205]);
  const mid = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 130];

  const stationSvg = M.map((m, i) => `<g class="station" data-st="${i}">${m.back}</g>`).join("");
  const frontSvg = M.map((m, i) => `<g class="station-f" data-st="${i}">${m.front}</g>`).join("");
  const fxSvg = M.map((m) => m.fx).join("");
  // Camera anchors: the screen point to centre on at each station.
  const anchors = XS.map((x) => at([x + 50, CY - 30, 60]).map(r2));
  // Overview: fit everything.
  const ext = [at([X0, -150, -96]), at([X1, 150, 0]), at([X0, -150, 0]), at([X1, -150, 240]), at([XS[0], 150, -96]), [mid[0], mid[1]]];
  const xs = ext.map((p) => p[0]), ys = ext.map((p) => p[1]);
  const over = { c: [r2((Math.min(...xs) + Math.max(...xs)) / 2), r2((Math.min(...ys) + Math.max(...ys)) / 2)], s: r2(Math.min(W / (Math.max(...xs) - Math.min(...xs)), H / (Math.max(...ys) - Math.min(...ys))) * 0.94) };
  // Then the camera leans in from Design to Use, for the comparison.
  const near = [at([XS[5] - 60, -150, 0]), at([X1, 150, 0]), at([X1, -150, 60]), [mid[0], (mid[1] + Math.min(from[1], to[1])) / 2 - 90], [to[0] - 70, to[1] - 40]];
  const nx = near.map((q) => q[0]), ny = near.map((q) => q[1]);
  const close = { c: [r2((Math.min(...nx) + Math.max(...nx)) / 2), r2((Math.min(...ny) + Math.max(...ny)) / 2)], s: r2(Math.min(W / (Math.max(...nx) - Math.min(...nx)), H / (Math.max(...ny) - Math.min(...ny))) * 0.94) };
  // The drawing on the designer's side, the die on the phone's, and a tick when they match.
  const ts = 78 / close.s;
  const apex = [(from[0] + 2 * mid[0] + to[0]) / 4, (from[1] + 2 * mid[1] + to[1]) / 4];
  const tick = 15 / close.s;
  const compare = `<g class="fab-tile on-screen verify-end" data-at="0.04" transform="translate(${r2(to[0] - ts / 2)} ${r2(to[1] - ts / 2)}) scale(${r2(ts / 40)})">${tileBody(site)}</g><g class="fab-tile on-die verify-end" data-at="0.04" transform="translate(${r2(from[0] - ts / 2)} ${r2(from[1] - ts / 2)}) scale(${r2(ts / 40)})">${tileBody(site)}</g><g class="verify-tick verify-end" data-at="0.97" transform="translate(${r2(apex[0])} ${r2(apex[1])}) scale(${r2(tick / 15)})"><circle r="15"/><path d="M-7 0l5 5 9-10"/></g>`;
  const loop = `<path class="verify" pathLength="1" d="M${r2(from[0])} ${r2(from[1])}Q${r2(mid[0])} ${r2(mid[1])} ${r2(to[0])} ${r2(to[1])}"/>${compare}`;
  // Wide view of the five plant machines for the opening run.
  const leadPts = [at([XS[0] - 170, -150, -96]), at([XS[4] + 210, 150, 0]), at([XS[3], MY, 240])];
  const lx = leadPts.map((q) => q[0]), ly = leadPts.map((q) => q[1]);
  const lead = { c: [r2((Math.min(...lx) + Math.max(...lx)) / 2), r2((Math.min(...ly) + Math.max(...ly)) / 2)], s: r2(Math.min(W / (Math.max(...lx) - Math.min(...lx)), H / (Math.max(...ly) - Math.min(...ly))) * 0.92) };

  const defs = `<defs>
<radialGradient id="fab-hot" r=".5"><stop offset="0" stop-color="var(--fx-hot)"/><stop offset=".35" stop-color="var(--fx-hot-mid)"/><stop offset="1" stop-color="var(--fx-hot-mid)" stop-opacity="0"/></radialGradient>
<radialGradient id="fab-warm" r=".5"><stop offset="0" stop-color="var(--fx-warm)"/><stop offset="1" stop-color="var(--fx-warm)" stop-opacity="0"/></radialGradient>
<radialGradient id="fab-gold" r=".5"><stop offset="0" stop-color="var(--fx-gold)"/><stop offset=".5" stop-color="var(--fx-chip-mid)"/><stop offset="1" stop-color="var(--fx-chip-mid)" stop-opacity="0"/></radialGradient>
<radialGradient id="fab-blue" r=".5"><stop offset="0" stop-color="var(--fx-blue)"/><stop offset=".45" stop-color="var(--fx-blue-mid)"/><stop offset="1" stop-color="var(--fx-blue-mid)" stop-opacity="0"/></radialGradient>
<linearGradient id="fab-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--fx-beam-top)"/><stop offset="1" stop-color="var(--fx-beam-bot)"/></linearGradient>
</defs>`;
  const svg = `<svg class="iso-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="A long bench with thirteen stations, from a cut block of quartz-bearing ground to a phone on a lit plinth. A carrier rides the conveyor in front and its load changes at each station; each station's output stays on a pedestal beside the line." preserveAspectRatio="xMidYMid meet">${defs}<g class="cam">${ground.join("")}${stationSvg}${conveyor.join("")}<g class="carrier" data-u="${r2(ux)} ${r2(uy)}">${carrier}</g>${frontSvg}${peds.join("")}<g class="fx">${fxSvg}</g>${loop}</g></svg>`;

  const css = `
.fab{position:relative;padding-block:80px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));border-top:1px solid var(--rule);background:radial-gradient(70% 60% at 50% 40%,var(--stage-glow),transparent 75%),var(--bg)}
.fab-inner{max-width:1280px;margin:0 auto}
.fab-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:16px 56px;align-items:end;margin-bottom:34px}
.fab-head h2{font-family:var(--display);font-weight:500;font-size:clamp(32px,4.2vw,58px);line-height:1;color:var(--text-strong);margin:.35em 0 0;text-wrap:balance}
.fab-head>p{margin:0;max-width:60ch;color:var(--text)}
.fab-stage{position:relative;aspect-ratio:${W}/${H};width:100%;border:1px solid var(--rule);overflow:hidden;background:var(--stage)}
.fab-stage .iso-svg{width:100%;height:100%;overflow:hidden}
.fab .hot{fill:var(--m-hot-top);opacity:.8}
.fab .port{fill:var(--port);stroke:var(--port-edge);stroke-width:.8}
.fab .fx-glow,.fab .fx-plasma,.fab .fx-spark{opacity:0;transition:opacity .9s var(--ease);mix-blend-mode:var(--fx-blend)}
.fab .fx-glow.on{opacity:1}
.fab .fx-plasma.on{animation:plasma 1.5s ease-in-out infinite;animation-delay:var(--d)}
@keyframes plasma{0%,100%{opacity:.15}50%{opacity:1}}
.fab .fx-spark.on{animation:spark .6s steps(2,end) infinite}
@keyframes spark{0%{opacity:1}50%{opacity:.2}}
.fab .fx-beam{opacity:0;mix-blend-mode:var(--fx-blend)}
.fab .fx-beam.on{animation:beam .5s ease-in-out infinite alternate}
@keyframes beam{from{opacity:.25}to{opacity:1}}
.fab .fx-spray{opacity:0;stroke-dasharray:2 4}
.fab .fx-spray.on{opacity:1;animation:iso-flow .6s linear infinite}
.fab .web{stroke-opacity:.55}
.fab .web.on{stroke-dasharray:3 3;animation:iso-flow .5s linear infinite}
.fab .blade.on path{animation:iso-flow .4s linear infinite;stroke-dasharray:4 3}
.fab .pnp{transition:transform .5s var(--ease)}
.fab .pnp.on{animation:pnp 1.2s var(--ease) infinite}
@keyframes pnp{0%,100%{transform:translateY(0)}50%{transform:translateY(14px)}}
.fab .ped{opacity:0;transition:opacity .8s var(--ease)}
.fab .ped.on{opacity:1}
.fab .load{transition:opacity .5s var(--ease)}
.fab .verify{fill:none;stroke:var(--accent);stroke-width:4.5px;stroke-linecap:round;stroke-dasharray:0 1;opacity:0;vector-effect:none}
.fab .verify-end{opacity:0;transition:opacity .6s var(--ease)}
.verify-tick circle{fill:var(--accent);vector-effect:none}
.verify-tick path{fill:none;stroke:var(--bg);stroke-width:3.5px;stroke-linecap:round;stroke-linejoin:round;vector-effect:none}
.fab-tile .frame{stroke-width:1px;vector-effect:non-scaling-stroke}
.fab-tile .g{font:500 6.6px var(--display);letter-spacing:.02em}
.fab-tile.on-screen .frame{fill:var(--lay-bg);stroke:var(--lay-metal)}
.fab-tile.on-screen .cells rect{fill:var(--lay-metal)}
.fab-tile.on-screen .g{fill:var(--lay-poly)}
.fab-tile.on-mask .frame{fill:none;stroke:var(--l-gold)}
.fab-tile.on-mask .cells rect,.fab-tile.on-mask .g{fill:var(--l-gold)}
.fab-tile.marking .frame{fill:none;stroke:var(--l-silver);stroke-width:.6px}
.fab-tile.marking .cells rect,.fab-tile.marking .g{fill:var(--l-silver)}
.fab-tile.verify-end .frame{fill:var(--stage);stroke:var(--text-strong)}
.fab-tile.verify-end .cells rect{fill:var(--text-strong)}
.fab-tile.verify-end .g{fill:var(--accent)}
.fab-tile.verify-end.on-screen .frame{fill:var(--lay-bg);stroke:var(--lay-poly)}
.fab-tile.verify-end.on-screen .cells rect,.fab-tile.verify-end.on-screen .g{fill:var(--lay-poly)}
.fab-tile.verify-end.on-die .frame{fill:var(--sch-line);stroke:var(--sch-line)}
.fab-tile.verify-end.on-die .cells rect,.fab-tile.verify-end.on-die .g{fill:var(--l-silver)}
.fab .ok-dots circle{fill:var(--accent)}
.fab-corners{position:absolute;inset:14px 16px;pointer-events:none;font:11px/1 var(--mono);letter-spacing:.06em;color:var(--muted)}
.fab-corners>span{position:absolute;white-space:nowrap}
.fab-corners [data-fab-fig]{display:none}
.fab-cap{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 18px;align-items:baseline;min-height:5.4em;margin:18px 0 8px;max-width:78ch}
.fab-cap b{font:500 13px/1 var(--mono);color:var(--warm);letter-spacing:.06em}
.fab-cap strong{font-family:var(--display);font-weight:500;font-size:22px;color:var(--white)}
.fab-cap p{grid-column:2;margin:0;color:var(--text-strong);font-size:clamp(15px,1.2vw,17px)}
.ledger{display:grid;grid-template-columns:repeat(var(--steps),minmax(0,1fr));gap:0;border-top:1px solid var(--rule);margin-top:6px}
.ledger button.pre{color:var(--muted);background:var(--bg-raised)}
.ledger button.pre small{display:block;font:10px/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase;margin-top:4px;color:var(--muted)}
.ledger button{position:relative;background:none;border:0;border-right:1px solid var(--rule);text-align:left;padding:10px 8px 12px;min-height:56px;cursor:pointer;color:var(--muted);font-size:12px;line-height:1.25}
.ledger button:last-child{border-right:0}
.ledger button b{display:block;font:500 11px/1 var(--mono);color:var(--muted);margin-bottom:6px}
.ledger button::after{content:"";position:absolute;left:0;top:-1px;height:2px;width:calc(var(--p,0)*100%);background:var(--warm)}
.ledger button[aria-current]{color:var(--white)}
.ledger button[aria-current] b{color:var(--warm)}
.ledger button:hover{color:var(--white)}
.fab-controls{display:flex;justify-content:flex-end;gap:6px;margin-top:14px}
@media (max-width:860px){.fab{padding-block:56px}.fab-head{grid-template-columns:1fr;align-items:start;margin-bottom:26px}.ledger{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:minmax(78px,1fr);overflow-x:auto;scrollbar-width:thin}}
@media (max-width:640px){.fab-stage{aspect-ratio:4/3}.fab-corners>span:not(:first-child){display:none}}
`;

  const html = `
<section class="fab iso" id="why" data-fab aria-labelledby="fab-title">
  <div class="fab-inner">
    <div class="fab-head">
      <div><p class="eyebrow">${esc(copy.eyebrow)}</p><h2 id="fab-title">${emphasise(copy.title, copy.title_emphasis)}</h2></div>
      <p>${esc(copy.intro)}</p>
    </div>
    <div class="fab-stage">
      <div class="keylight" aria-hidden="true"></div>
      ${svg}
      <div class="vignette" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div>
      <div class="fab-corners" aria-hidden="true"><span style="top:0;left:0;color:var(--text)" data-fab-fig>Fig 4 · step 1 of ${STATIONS.length}</span><span style="top:0;right:0;text-transform:uppercase;letter-spacing:.12em" data-fab-title>${esc(STATIONS[0].name)}</span>${copy.readout ? `<span style="bottom:0;right:0">${esc(copy.readout)}</span>` : ""}</div>
    </div>
    <div class="fab-cap"><b data-fab-n>01</b><strong data-fab-name>${esc(STATIONS[0].name)}</strong><p data-fab-fact>${esc(STATIONS[0].fact)}</p></div>
    <div class="ledger" role="group" aria-label="Jump to a step" style="--steps:${STATIONS.length}">
      ${STATIONS.map((st, i) => `<button type="button" data-step="${i}"${i === 0 ? ' class="pre"' : ""}><b>${String(i + 1).padStart(2, "0")}</b>${esc(st.name)}${i === 0 && copy.lead_note ? `<small>${esc(copy.lead_note)}</small>` : ""}</button>`).join("")}
    </div>
    <div class="fab-controls">
      <button type="button" class="btn" data-fab-pause aria-pressed="false"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10"/></svg><span>Pause</span></button>
      <button type="button" class="btn" data-fab-replay><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8a4.8 4.8 0 1 0 1.4-3.4M3 2.6v2.6h2.6"/></svg><span>Replay</span></button>
    </div>
  </div>
  <script type="application/json" id="fab-data">${JSON.stringify({ W, H, anchors, xs: XS, over, close, lead, steps: STEPS, stations: STATIONS, closing: copy.closing, closingLabel: copy.closing_label, closingTitle: copy.closing_title }).replace(/</g, "\\u003c")}</script>
</section>`;
  return { css, html, js: FAB_JS };
}

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FAB_JS = `
(() => {
  const root = document.querySelector("[data-fab]");
  if (!root) return;
  const D = JSON.parse(root.querySelector("#fab-data").textContent);
  const svg = root.querySelector(".fab-stage svg");
  const cam = svg.querySelector(".cam");
  const carrier = svg.querySelector(".carrier");
  const u = carrier.dataset.u.split(" ").map(Number);
  const loads = [...svg.querySelectorAll(".load")];
  const peds = [...svg.querySelectorAll(".ped")];
  const fxs = [...svg.querySelectorAll("[data-fx]")];
  const web = svg.querySelector(".web"), blade = svg.querySelector(".blade");
  const verify = svg.querySelector(".verify"), verifyEnd = svg.querySelectorAll(".verify-end");
  const steps = [...root.querySelectorAll("[data-step]")];
  const nEl = root.querySelector("[data-fab-n]"), nameEl = root.querySelector("[data-fab-name]"), factEl = root.querySelector("[data-fab-fact]");
  const figEl = root.querySelector("[data-fab-fig]"), titleEl = root.querySelector("[data-fab-title]");
  const pauseBtn = root.querySelector("[data-fab-pause]"), replay = root.querySelector("[data-fab-replay]");
  const fabStage = root.querySelector(".fab-stage");
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const ST = D.steps, N = ST.length, DWELL = 3.4, LEAD = 6.6, MOVE = 1.2, OVER = 3.2, LOOP = 2.4;
  // Each step stays up long enough to read its fact, about 200 words a minute after the camera settles.
  const DUR = ST.map((s, i) => Math.max(s.m1 > s.m0 ? LEAD : DWELL, 0.6 + 0.3 * D.stations[i].fact.trim().split(" ").length));
  const T0 = DUR.map((_, i) => DUR.slice(0, i).reduce((a, b) => a + b, 0));
  const END = T0[N - 1] + DUR[N - 1];
  const TOTAL = END + OVER + LOOP;
  const C = [D.W / 2, D.H / 2];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpLog = (a, b, t) => Math.exp(lerp(Math.log(a), Math.log(b), t));
  const f3 = (v) => Math.round(v * 1000) / 1000;
  let t = 0, playing = false, visible = false, frame = 0, last = 0, started = false, shown = -1;

  function text(i) {
    if (shown === i) return;
    shown = i;
    if (i === N) {
      nEl.textContent = "↺"; nameEl.textContent = D.closingLabel; factEl.textContent = D.closing;
      figEl.textContent = "Fig 4 · the whole chain"; titleEl.textContent = D.closingTitle;
    } else {
      const st = D.stations[i];
      nEl.textContent = String(i + 1).padStart(2, "0"); nameEl.textContent = st.name; factEl.textContent = st.fact;
      figEl.textContent = "Fig 4 · step " + (i + 1) + " of " + N; titleEl.textContent = st.name;
      const ledger = steps[i].parentElement;
      if (ledger.scrollWidth > ledger.clientWidth + 2) ledger.scrollTo({ left: steps[i].offsetLeft - ledger.clientWidth / 2 + steps[i].clientWidth / 2, behavior: still.matches ? "auto" : "smooth" });
    }
  }
  const stepAt = (tt) => { let i = 0; while (i < N - 1 && tt >= T0[i + 1]) i++; return i; };
  function render() {
    const i = stepAt(Math.min(t, END - 1e-6));
    const local = t - T0[i];
    const st = ST[i];
    const box = svg.getBoundingClientRect();
    const narrow = box.width < 640;
    svg.setAttribute("preserveAspectRatio", narrow ? "xMidYMid slice" : "xMidYMid meet");
    const BASE = narrow ? 0.95 : 0.82;
    const LEADS = D.lead.s * (narrow ? 1.3 : 1);
    let x, loadIndex, active = -1, reached, p, s;
    if (st.m1 > st.m0) {
      // quartz to wafer in one run: the carrier hops through the plant machines
      const span = st.m1 - st.m0;
      const run = clamp(local / (LEAD - 0.8)) * span;
      const k = Math.min(span - 1, Math.floor(run));
      const f = ease(clamp(run - k));
      x = lerp(D.xs[st.m0 + k], D.xs[st.m0 + k + 1], f);
      loadIndex = st.m0 + Math.min(span, Math.floor(run + 0.35));
      reached = st.m0 + Math.floor(run);
      if (Math.abs(run - Math.round(run)) < 0.35) active = st.m0 + Math.round(run);
      p = D.lead.c; s = LEADS;
    } else {
      const m = st.m0, prev = ST[i - 1].m1;
      const mv = ease(clamp(local / MOVE));
      x = lerp(D.xs[prev], D.xs[m], mv);
      const acting = local > MOVE && t < END;
      loadIndex = local > MOVE + 0.7 ? m : prev;
      reached = m;
      if (acting) active = m;
      const from = i === 1 ? { c: D.lead.c, s: LEADS } : { c: D.anchors[prev], s: BASE };
      p = [lerp(from.c[0], D.anchors[m][0], mv), lerp(from.c[1], D.anchors[m][1], mv)];
      s = lerpLog(from.s, BASE, mv);
    }
    carrier.setAttribute("transform", "translate(" + f3(u[0] * x) + " " + f3(u[1] * x) + ")");
    loads.forEach((el, j) => (el.style.opacity = j === loadIndex ? 1 : 0));
    peds.forEach((el, j) => el.classList.toggle("on", j < reached || t >= END));
    fxs.forEach((el) => el.classList.toggle("on", Number(el.dataset.fx) === active));
    web.classList.toggle("on", active === 4);
    blade.classList.toggle("on", active === 9);
    // after the last step, pull back over the whole line
    const o = ease(clamp((t - END) / OVER));
    // on a narrow stage the view is cropped at the sides, so pull back further
    const OVERS = D.over.s * (narrow ? Math.min(1, box.width / box.height / (D.W / D.H)) : 1);
    if (t > END) { const lastA = D.anchors[ST[N - 1].m0]; p = [lerp(lastA[0], D.over.c[0], o), lerp(lastA[1], D.over.c[1], o)]; s = lerpLog(BASE, OVERS, o); }
    cam.setAttribute("transform", "translate(" + f3(C[0] - s * p[0]) + " " + f3(C[1] - s * p[1]) + ") scale(" + f3(s) + ")");
    const lp = ease(clamp((t - END - OVER * 0.7) / LOOP));
    if (lp > 0) { const nearS = D.close.s * (narrow ? Math.min(1, box.width / box.height / (D.W / D.H)) : 1); p = [lerp(p[0], D.close.c[0], lp), lerp(p[1], D.close.c[1], lp)]; s = lerpLog(s, nearS, lp); cam.setAttribute("transform", "translate(" + f3(C[0] - s * p[0]) + " " + f3(C[1] - s * p[1]) + ") scale(" + f3(s) + ")"); }
    verify.style.opacity = lp > 0 ? 1 : 0;
    verify.style.strokeDashoffset = f3(1 - lp);
    verify.style.strokeDasharray = lp > 0 ? (f3(lp) + " 1") : "0 1";
    verifyEnd.forEach((el) => (el.style.opacity = lp >= Number(el.dataset.at) ? 1 : 0));
    text(t > END + OVER * 0.5 ? N : i);
    steps.forEach((b, j) => { b.style.setProperty("--p", f3(clamp((t - T0[j]) / DUR[j]))); b.toggleAttribute("aria-current", j === i && t < END); });
  }
  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
    last = now;
    if (playing) { t = Math.min(TOTAL, t + dt); render(); if (t >= TOTAL) setPlaying(false); }
    frame = playing && visible ? requestAnimationFrame(tick) : 0;
  }
  const run = () => { if (!frame && playing && visible) { last = 0; frame = requestAnimationFrame(tick); } };
  function setPlaying(on) {
    playing = on;
    fabStage.classList.toggle("paused", !on);
    pauseBtn.setAttribute("aria-pressed", String(!on));
    pauseBtn.querySelector("span").textContent = on ? "Pause" : "Play";
    replay.classList.toggle("prime", !on && t >= TOTAL);
    run();
  }
  steps.forEach((b, j) => b.addEventListener("click", () => { t = T0[j] + (j ? MOVE * 0.98 : 0); started = true; render(); setPlaying(!still.matches); }));
  replay.addEventListener("click", () => { t = 0; started = true; render(); setPlaying(true); });
  pauseBtn.addEventListener("click", () => { if (t >= TOTAL) { replay.click(); return; } started = true; setPlaying(!playing); });
  new IntersectionObserver((es) => {
    visible = es[es.length - 1].isIntersecting;
    if (visible && !started && !still.matches) { started = true; setPlaying(true); }
    run();
  }, { threshold: 0.35 }).observe(fabStage);
  document.addEventListener("visibilitychange", () => { visible = !document.hidden && visible; run(); });
  window.__fab = { seek: (s) => { t = s; render(); }, pause: () => setPlaying(false), T0, END, TOTAL };
  if (still.matches) t = TOTAL;
  render();
})();
`;
