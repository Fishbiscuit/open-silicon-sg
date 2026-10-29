// The colour study: the three ITE3-derived schemes side by side on the real
// figures, with roles, figure tones, materials and measured contrast.
import { esc } from "./lib.mjs";
import { SCHEMES, ITE3_SOURCE } from "../design/schemes.mjs";

// ---- contrast (WCAG 2.x)
function rgb(c, over = [255, 255, 255]) {
  let m = c.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  m = c.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const [r, g, b, a = 1] = m[1].split(",").map(Number);
    return [r, g, b].map((v, i) => v * a + over[i] * (1 - a));
  }
  return null;
}
const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
export function contrast(fg, bg) {
  const B = rgb(bg), F = rgb(fg, B);
  const [a, b] = [lum(F), lum(B)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

// Give every id in a copied drawing a suffix, so three copies on one page
// don't share patterns and gradients across schemes.
function uniq(svg, suffix) {
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  let out = svg;
  for (const id of new Set(ids)) {
    const e = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`\\bid="${e}"`, "g"), `id="${id}--${suffix}"`).replace(new RegExp(`url\\(#${e}\\)`, "g"), `url(#${id}--${suffix})`).replace(new RegExp(`href="#${e}"`, "g"), `href="#${id}--${suffix}"`);
  }
  return out;
}
const glow = (id) => `<defs><radialGradient id="glow-${id}" r=".5"><stop offset="0" stop-color="var(--fx-chip)"/><stop offset=".45" stop-color="var(--fx-chip-mid)"/><stop offset="1" stop-color="var(--fx-chip-mid)" stop-opacity="0"/></radialGradient></defs>`;

// Still frames from the motion study: the object opened, the die in plan, the cell with its schematic.
function frames(f) {
  const { obj, die, cells } = f;
  const opened = obj.body.replace(/data-ex="([-\d.]+) ([-\d.]+)"/g, 'data-ex="$1 $2" transform="translate($1 $2)"');
  const objSvg = `<svg class="iso-svg" viewBox="0 0 ${obj.W} ${obj.H}" role="img" aria-label="${esc(obj.label)}">${glow(obj.id)}<g class="cam">${opened}<circle class="chip-glow" cx="${obj.focus[0]}" cy="${obj.focus[1]}" r="70" fill="url(#glow-${obj.id})"/></g></svg>`;
  const plan = die.body.match(/data-plan="([^"]+)"/)[1].split(" ").map(Number);
  const side = plan[0] * 1000;
  const dieSvg = `<svg class="iso-svg" viewBox="${plan[4]} ${plan[5]} ${side} ${side}" role="img" aria-label="The die's floorplan seen flat">${die.body.replace(/(<g class="layout"[^>]*?) transform="[^"]*"/, `$1 transform="matrix(${plan.join(" ")})"`)}</svg>`;
  const S = cells.fit * cells.zoom;
  const cam = `translate(${cells.W / 2 - S * cells.focus[0]} ${cells.H / 2 - S * cells.focus[1]}) scale(${S})`;
  const cellSvg = `<svg class="iso-svg" viewBox="0 0 ${cells.W} ${cells.H}" role="img" aria-label="One cell with its transistor schematic drawn over it"><g class="cam" transform="${cam}">${cells.body}</g></svg>`;
  return { objSvg, dieSvg, cellSvg };
}

export function coloursPage({ site, brand, figs, head, css }) {
  const card = figs.find((f) => f.o.figure === "card") ?? figs[0];
  const base = frames(card);
  const order = ["paper", "imagery", "night"];
  const roleRows = [
    ["Page", "bg"], ["Raised surface", "bg-raised"], ["Strong text", "text-strong"], ["Body text", "text"], ["Muted text", "muted"], ["Rule", "rule"],
    ["Signal (the lit part)", "accent"], ["Energy and light", "energy"], ["Heat and copper", "heat"], ["Silver, metal", "silver"], ["Focus ring", "focus"],
  ];
  const checks = [["Body text on page", "text", "bg", 4.5], ["Muted text on page", "muted", "bg", 4.5], ["Signal on page", "accent", "bg", 3], ["Button text on signal", "on-accent", "accent", 4.5], ["Energy on page", "energy", "bg", 3]];
  const chip = (c) => `<span class="cs-chip" style="background:${c}"></span>`;
  const tones = ["anatomy-card", "anatomy-shade-0", "anatomy-shade-1", "anatomy-shade-2", "anatomy-shade-3", "anatomy-top", "anatomy-faint", "anatomy-lo", "anatomy-mid", "anatomy-hi", "anatomy-lit"];
  const mats = [["Gold", "m-gold-top"], ["Silicon die", "m-die-top"], ["Epoxy", "m-epoxy-top"], ["Metal", "m-silicon-top"], ["Board", "m-pcb-top"], ["Quartz", "m-quartz-top"], ["Heat", "m-hot-top"], ["Copper line", "l-copper"], ["Gold line", "l-gold"], ["Energy line", "l-energy"]];
  const layers = [["Substrate", "lay-sub"], ["Diffusion", "lay-diff"], ["Poly gate", "lay-poly"], ["Local metal", "lay-li"], ["Metal rail", "lay-met"], ["Contact", "lay-cont"]];

  const column = (id) => {
    const s = SCHEMES[id];
    const t = s.tokens;
    return `<div class="cs-col" data-scheme="${id}">
  <div class="cs-col-head"><p class="cs-name">${s.name} <span class="cs-rec${s.offered ? "" : " off"}">${esc(s.role)}</span></p><p class="cs-note">${esc(s.note)}</p></div>
  <div class="cs-ui">
    <p class="eyebrow">Open Silicon SG</p>
    <p class="cs-h">Open the chip</p>
    <p class="cs-lede">Anybody should be able to make one, and anybody should be able to check what is inside.</p>
    <div class="cs-btns"><span class="btn prime">Sign up</span><span class="btn">Replay</span><span class="chip" aria-current="true">Transit card<i style="--p:.6"></i></span></div>
  </div>
  <figure class="cs-fig cs-wide iso">${uniq(base.objSvg, id)}<figcaption>Fig 1.a · the card opened, chip lit</figcaption></figure>
  <div class="cs-pair">
    <figure class="cs-fig iso cs-plan">${uniq(base.dieSvg, id)}<figcaption>Fig 1.b · die floorplan</figcaption></figure>
    <figure class="cs-fig iso cs-static">${uniq(base.cellSvg, id)}<figcaption>Fig 1.c · cell and schematic</figcaption></figure>
  </div>
  <div class="cs-strip"><p>Figure tones, paper to ink to signal</p><div>${tones.map((v) => chip(`var(--${v})`)).join("")}</div></div>
  <div class="cs-strip"><p>Materials and lines</p><div class="cs-named">${mats.map(([n, v]) => `<span>${chip(`var(--${v})`)}${n}</span>`).join("")}</div></div>
  <div class="cs-strip"><p>Layout layers</p><div class="cs-named">${layers.map(([n, v]) => `<span>${chip(`var(--${v})`)}${n}</span>`).join("")}</div></div>
  <table class="cs-checks"><tbody>${checks.map(([n, fg, bg, need]) => {
    const r = contrast(t[fg], t[bg]);
    return `<tr><td>${n}</td><td>${r.toFixed(1)}:1</td><td class="${r >= need ? "ok" : "low"}">${r >= need ? "passes" : "below"} ${need}:1</td></tr>`;
  }).join("")}</tbody></table>
</div>`;
  };

  const sources = [
    ["ITE3 companion · Printed pathways", "The exhibition companion site and its design study: paper and metal, silver traces, a plum signal, navy and orange as chapter colours.", [ITE3_SOURCE.paper, ITE3_SOURCE.panel, ITE3_SOURCE.pewter, ITE3_SOURCE.line, ITE3_SOURCE.muted, ITE3_SOURCE.ink, ITE3_SOURCE.plum, ITE3_SOURCE.navy, ITE3_SOURCE.orange]],
    ["ITE3 companion · dark mode", "The same site at night: warm charcoal surfaces, a pink-plum signal and a gold focus ring.", ["#191817", "#242220", "#302c2a", "#79706b", "#c7bfb7", "#f0ece6", "#e6a2cc", "#f7d08a"]],
    ["ITE3 exhibition imagery", "The key-art style guide: deep navy, electric-blue light, gold highlights, chip burgundy. Study v0.1 used this.", ["#07111D", "#06172B", "#0A2B52", "#14569B", "#287CC3", "#B88A42", "#E2B968", "#7D4548", "#F5F5F3"]],
  ];

  const pageCss = `
.cs{max-width:1500px;margin:0 auto;padding-block:48px 72px}
.cs-head{max-width:900px;margin-bottom:40px}
.cs-head h1{font-family:var(--display);font-weight:500;font-size:clamp(36px,5vw,72px);line-height:.98;color:var(--text-strong);margin:.35em 0 .4em;text-wrap:balance}
.cs-head p{max-width:68ch}
.cs-sources{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:0 0 48px}
.cs-sources>div{border:1px solid var(--rule);padding:16px;background:var(--surface)}
.cs-sources b{display:block;color:var(--text-strong);font-weight:500;margin-bottom:6px}
.cs-sources p{margin:0 0 12px;font-size:14px;color:var(--muted)}
.cs-sw{display:flex;flex-wrap:wrap;gap:4px}
.cs-sw span{width:26px;height:26px;border:1px solid rgba(128,128,128,.25)}
h2.cs-h2{font-family:var(--display);font-weight:500;font-size:clamp(22px,2.2vw,30px);color:var(--text-strong);margin:0 0 6px}
.cs-sub{color:var(--muted);margin:0 0 18px;max-width:72ch}
.cs-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.cs-col{min-width:0;background:var(--bg);color:var(--text);border:1px solid var(--rule);padding:18px;display:grid;gap:14px;align-content:start}
.cs-col-head{border-bottom:1px solid var(--rule);padding-bottom:12px}
.cs-name{font-family:var(--display);font-weight:500;font-size:20px;color:var(--text-strong);margin:0 0 4px}
.cs-rec{font:500 10px/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;background:var(--accent);color:var(--on-accent);padding:4px 6px;vertical-align:middle;margin-left:6px}
.cs-note{margin:0;font-size:13px;color:var(--muted)}
.cs-rec.off{background:transparent;color:var(--muted);border:1px solid var(--rule)}
.cs-col[data-scheme="night"]{opacity:.72}
.cs-ui{background:var(--bg-raised);padding:16px;border:1px solid var(--rule)}
.cs-h{font-family:var(--display);font-weight:500;font-size:34px;line-height:1;color:var(--text-strong);margin:10px 0 8px}
.cs-lede{margin:0 0 12px;font-size:14px;color:var(--text)}
.cs-btns{display:flex;flex-wrap:wrap;gap:6px}
.cs-btns .chip{display:inline-flex;align-items:center;cursor:default}
.cs-btns .btn{cursor:default}
.cs-fig{margin:0;background:radial-gradient(55% 55% at 55% 52%,var(--stage-glow),transparent 72%),var(--stage);border:1px solid var(--rule)}
.cs-fig{overflow:hidden}.cs-fig svg{display:block;width:100%;height:auto;aspect-ratio:900/640;overflow:hidden}
.cs-pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cs-pair svg{aspect-ratio:1/1}
.cs-fig figcaption{font:11px/1.3 var(--mono);color:var(--muted);padding:8px 10px;border-top:1px solid var(--rule)}
.cs-static .sch{stroke-dashoffset:0}.cs-static .sch-n,.cs-static .sch-b,.cs-static .sch-t,.cs-static .cell-halo{opacity:1}.cs-static .cells{opacity:.6}
.cs-fig .chip-glow{opacity:1}
.cs-plan .pkg>*:not(.layout){display:none}
.cs-strip p{margin:0 0 6px;font:11px/1.2 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.cs-strip>div{display:flex;flex-wrap:wrap;gap:4px}
.cs-named{gap:6px 12px!important;font-size:12px;color:var(--text)}
.cs-named span{display:inline-flex;align-items:center;gap:6px}
.cs-chip{display:inline-block;width:22px;height:22px;border:1px solid rgba(128,128,128,.3)}
.cs-checks{min-width:0;font-size:13px}
.cs-checks td{padding:6px 4px;border-bottom:1px solid var(--rule)}
.cs-checks td:first-child{color:var(--text);white-space:normal}
.cs-checks td:nth-child(2){font-family:var(--mono);color:var(--text-strong)}
.cs-checks .ok{color:var(--text-strong)}
.cs-checks .low{color:var(--heat)}
.cs-roles{margin:48px 0 0}
.cs-roles table{min-width:640px}
.cs-roles td{vertical-align:middle}
.cs-roles td .cs-chip{vertical-align:middle;margin-right:8px}
.cs-roles code{font-size:12px;color:var(--muted)}
.cs-decide{margin-top:48px;border-top:1px solid var(--rule);padding-top:24px;max-width:80ch}
.cs-decide ol{display:grid;gap:8px;padding-left:20px}
.cs-decide b{color:var(--text-strong);font-weight:500}
@media (max-width:1100px){.cs-grid{grid-template-columns:1fr}.cs-sources{grid-template-columns:1fr}}
`;
  return `${head(`${site.name} Colours`)}
<style>${css}${pageCss}</style>
<header class="topbar gutter">${brand}<span class="doc-meta">Colour study · v0.1<br>${esc(site.doc_date)}</span></header>
<main class="cs gutter">
  <div class="cs-head">
    <p class="eyebrow">Colour scheme · for review</p>
    <h1>Printed pathways, for Open Silicon SG</h1>
    <p>The hub should read as part of the In the Ether 3 family. ITE3 has three colour sources, and they do different jobs. This study turns them into three complete schemes, each covering the page, the drawings, the materials inside a chip and the chip's layout layers, and shows all three on the same frames from the motion study.</p>
    <p><b>Decided 30 October 2026:</b> Paper for light, Imagery for dark. Paper is the ITE3 companion's own identity, so the hub and the exhibition read as related; it is what most visitors see. Visitors whose devices are in dark mode get Imagery, the exhibition's navy and gold, which also serves posters and social cards. Night is shown for comparison and is not used.</p>
  </div>
  <h2 class="cs-h2">Where the colours come from</h2>
  <p class="cs-sub">All three are already in use for In the Ether 3.</p>
  <div class="cs-sources">${sources.map(([t, d, cs]) => `<div><b>${t}</b><p>${d}</p><div class="cs-sw">${cs.map((c) => `<span style="background:${c}" title="${c}"></span>`).join("")}</div></div>`).join("")}</div>
  <h2 class="cs-h2">The schemes on the same frames</h2>
  <p class="cs-sub">Frames from motion study 1, drawn three times. Only the colour tokens change; the drawings are identical. Contrast is measured, not estimated.</p>
  <div class="cs-grid">${order.map(column).join("")}</div>
  <div class="cs-roles">
    <h2 class="cs-h2">Colour has jobs</h2>
    <p class="cs-sub">One signal colour per view, always the thing to look at. Everything else is ground, structure or type.</p>
    <div class="table-wrap"><table><thead><tr><th>Role</th>${order.map((id) => `<th>${SCHEMES[id].name}</th>`).join("")}</tr></thead><tbody>
    ${roleRows.map(([n, v]) => `<tr><td>${n}</td>${order.map((id) => `<td>${chip(SCHEMES[id].tokens[v])}<code>${SCHEMES[id].tokens[v]}</code></td>`).join("")}</tr>`).join("")}
    </tbody></table></div>
  </div>
  <div class="cs-decide">
    <h2 class="cs-h2">How the choice works on the site</h2>
    <ol>
      <li><b>Light devices</b> get Paper, with plum as the signal colour.</li>
      <li><b>Dark devices</b> get Imagery, with gold as the signal colour, the same role plum plays on Paper.</li>
      <li><b>Visitors can switch</b> between the two from the top bar; the choice is remembered in their browser.</li>
    </ol>
  </div>
</main>`;
}
