// Open Silicon SG colour schemes, built from In the Ether 3.
//
//   paper   — ITE3 "Printed pathways": paper ground, silver traces, one plum
//             signal; navy and orange as chapter colours. Light, and the
//             site default.
//   imagery — the ITE3 exhibition imagery (deep navy, electric blue, gold).
//             Dark mode, and posters and social cards.
//   night   — the ITE3 companion's dark mode (warm charcoal, pink-plum).
//             Considered and not used; kept so the colour study can show it.
// Chosen by QZ on 30 October 2026: Paper for light, Imagery for dark.
//
// Every colour on the page and inside the figures is one of these tokens, so
// a scheme is changed here and nowhere else.

const ITE3 = {
  paper: "#f5f4f0", panel: "#e9e8ef", pewter: "#b4b1aa", plum: "#843b70", navy: "#243b59", orange: "#a44723", ink: "#202123", muted: "#66616a", line: "#cdc9ce",
};

const paper = {
  plate: "#eeebe5", // fixed light ground for exhibit photographs and cutouts
  "plate-ink": "#5d5862",
  "mote": "rgba(70,60,52,.22)", "mote-blend": "multiply", key: "rgba(255,255,255,.95)", "key-blend": "normal", "grain-blend": "multiply",
  // page
  bg: ITE3.paper, "bg-raised": ITE3.panel, surface: "#ffffff", text: "#2c2c31", "text-strong": ITE3.ink, muted: ITE3.muted, rule: ITE3.line, "rule-strong": ITE3.pewter,
  accent: ITE3.plum, "accent-soft": "#f1e5ee", "on-accent": "#ffffff", energy: ITE3.navy, heat: ITE3.orange, silver: ITE3.pewter, focus: ITE3.plum,
  stage: "#eeebe5", "stage-glow": "rgba(255,255,255,.85)", "stage-edge": "rgba(32,33,35,.06)", "hero-glow-1": "rgba(255,255,255,.9)", "hero-glow-2": "rgba(132,59,112,.07)", beam: "rgba(255,255,255,.55)", grain: ".05", vignette: "rgba(120,112,104,.16)",
  // figure tones (Anatomy)
  "anatomy-page": ITE3.paper, "anatomy-card": "#eeebe5", "anatomy-text": ITE3.muted, "anatomy-strong": ITE3.ink, "anatomy-muted": "#8a858e",
  "anatomy-paper": "#f3f1ec", "anatomy-face": "#ffffff", "anatomy-top": "#ffffff",
  "anatomy-shade-0": "#cbc7cb", "anatomy-shade-1": "#d8d5d8", "anatomy-shade-2": "#e4e2e4", "anatomy-shade-3": "#efedee",
  "anatomy-lit-top": "#f6eaf2", "anatomy-lit-shade": "#e3c9d9",
  "anatomy-hi": ITE3.ink, "anatomy-mid": "#7d7882", "anatomy-lo": ITE3.pewter, "anatomy-faint": "#d6d2d6", "anatomy-lit": ITE3.plum,
  "anatomy-halo": "#6d6862", "anatomy-halo-opacity": ".3", "anatomy-dot": "#2a2a2e", "anatomy-red": ITE3.orange, "anatomy-green": "#286144", "anatomy-blue": ITE3.navy,
  // materials: top, dark side, light side, edge, crease
  "m-gold-top": "#ecdfbd", "m-gold-side": "#c4a76a", "m-gold-side2": "#d9c391", "m-gold-edge": "#7a5c22", "m-gold-crease": "#a1813f",
  "m-die-top": "#ead4e1", "m-die-side": "#b48aa3", "m-die-side2": "#cfaec2", "m-die-edge": ITE3.plum, "m-die-crease": "#a8678f",
  "m-epoxy-top": "#3c3b41", "m-epoxy-side": "#222126", "m-epoxy-side2": "#2d2c32", "m-epoxy-edge": "#111114",
  "m-glass-fill": "rgba(255,255,255,.35)", "m-glass-top": "rgba(214,224,236,.5)", "m-glass-side": "rgba(190,202,218,.45)", "m-glass-edge": "#7f8a99",
  "m-pcb-top": "#dce2ea", "m-pcb-side": "#b3becc", "m-pcb-side2": "#c7d0db",
  "m-silicon-top": "#e2e4e8", "m-silicon-side": "#a6aab3", "m-silicon-side2": "#c3c7ce", "m-silicon-edge": "#3a3d45",
  "m-mirror-top": "#eef1f5", "m-mirror-side": "#b3b8c1", "m-mirror-edge": "#3a3d45",
  "m-hot-top": "#f3c6a3", "m-hot-side": "#c97b50", "m-hot-edge": ITE3.orange,
  "m-quartz-top": "#ffffff", "m-quartz-side": "#c7ced8", "m-quartz-side2": "#dce1e8", "m-quartz-edge": "#4a4f58",
  "m-earth-top": "#e3dcd2", "m-earth-side": "#c3b8aa", "m-earth-side2": "#d3cabe", "m-earth-edge": "#7a6a5a",
  "m-screen-top": "#2a2c33",
  // lines
  "l-copper": ITE3.orange, "l-gold": "#9a7a3a", "l-silver": "#8a8890", "l-energy": ITE3.navy,
  // die floorplans and cells
  "lay-bg": "#f6f0f3", "lay-block": "#eee3ea", "lay-cell": "#dcbfd0", "lay-cell2": "#d2b0c4", "lay-diff": "#dbb7cb", "lay-diff-edge": ITE3.plum, "lay-poly": ITE3.plum,
  "lay-metal": ITE3.navy, "lay-outline": ITE3.plum, "lay-pad": ITE3.pewter, "lay-sheen": "#ffffff", "lay-well": "#f1e6ed", "lay-well-edge": "#caa8bd",
  "lay-li": "rgba(36,59,89,.20)", "lay-li-edge": "rgba(36,59,89,.62)", "lay-met": "rgba(36,59,89,.30)", "lay-cont": ITE3.ink, "lay-cellline": "#d9c7d1", "lay-m2": "rgba(164,71,35,.26)", "lay-sub": "#faf6f8",
  "sch-line": ITE3.ink, "sch-node": ITE3.plum,
  // effects
  "fx-chip": "rgba(132,59,112,.30)", "fx-chip-mid": "rgba(132,59,112,.10)", "fx-blend": "multiply", "sheen-blend": "normal",
  "fx-hot": "rgba(236,140,80,.75)", "fx-hot-mid": "rgba(164,71,35,.25)", "fx-warm": "rgba(236,150,90,.45)", "fx-blue": "rgba(36,59,89,.35)", "fx-blue-mid": "rgba(36,59,89,.12)",
  "fx-beam-top": "rgba(36,59,89,.45)", "fx-beam-bot": "rgba(36,59,89,.06)", "fx-gold": "rgba(132,59,112,.35)",
  "ck-well": "#d9d5d0", "ck-pot": "#ebe7e2", "ck-rice": "rgba(255,255,255,.9)", "ck-seg": ITE3.plum, "ck-wall": "#c9c4be",
  "vein": "#ffffff", "vein-edge": "#6d7480", port: "#f6d9c4", "port-edge": ITE3.orange,
};

const night = {
  plate: "#e9e6e0", // fixed light ground for exhibit photographs and cutouts
  "plate-ink": "#5d5862",
  "mote": "rgba(255,232,206,.5)", "mote-blend": "screen", key: "rgba(159,182,214,.13)", "key-blend": "screen", "grain-blend": "overlay",
  bg: "#191817", "bg-raised": "#242220", surface: "#302c2a", text: "#d9d2ca", "text-strong": "#f0ece6", muted: "#b3aba3", rule: "#3a3532", "rule-strong": "#79706b",
  accent: "#e6a2cc", "accent-soft": "#3c2b36", "on-accent": "#2b1823", energy: "#9fb6d6", heat: "#e39a6c", silver: "#8e877f", focus: "#f7d08a",
  stage: "#1e1c1b", "stage-glow": "rgba(159,182,214,.10)", "stage-edge": "rgba(0,0,0,.35)", "hero-glow-1": "rgba(159,182,214,.10)", "hero-glow-2": "rgba(230,162,204,.07)", beam: "rgba(159,182,214,.07)", grain: ".06", vignette: "rgba(0,0,0,.45)",
  "anatomy-page": "#191817", "anatomy-card": "#211f1e", "anatomy-text": "#c7bfb7", "anatomy-strong": "#f0ece6", "anatomy-muted": "#8e837e",
  "anatomy-paper": "#1f1d1c", "anatomy-face": "#2a2725", "anatomy-top": "#36322f",
  "anatomy-shade-0": "#141312", "anatomy-shade-1": "#1a1817", "anatomy-shade-2": "#221f1d", "anatomy-shade-3": "#2b2826",
  "anatomy-lit-top": "#4d3043", "anatomy-lit-shade": "#35212e",
  "anatomy-hi": "#f0ece6", "anatomy-mid": "#9a8f88", "anatomy-lo": "#5f5651", "anatomy-faint": "#3a3431", "anatomy-lit": "#e6a2cc",
  "anatomy-halo": "#000000", "anatomy-halo-opacity": ".9", "anatomy-dot": "#f0ece6", "anatomy-red": "#e39a6c", "anatomy-green": "#9ad4b6", "anatomy-blue": "#9fb6d6",
  "m-gold-top": "#6e5a32", "m-gold-side": "#3d3119", "m-gold-side2": "#54442a", "m-gold-edge": "#f7d08a", "m-gold-crease": "#c9a660",
  "m-die-top": "#5c3049", "m-die-side": "#2e1826", "m-die-side2": "#432538", "m-die-edge": "#e6a2cc", "m-die-crease": "#b5739a",
  "m-epoxy-top": "#1d1c1b", "m-epoxy-side": "#0d0c0c", "m-epoxy-side2": "#151413", "m-epoxy-edge": "#6a615c",
  "m-glass-fill": "rgba(42,39,37,.35)", "m-glass-top": "rgba(159,182,214,.13)", "m-glass-side": "rgba(58,69,82,.3)", "m-glass-edge": "#9fb6d6",
  "m-pcb-top": "#24303d", "m-pcb-side": "#141b23", "m-pcb-side2": "#1b242e",
  "m-silicon-top": "#6b6f78", "m-silicon-side": "#33363c", "m-silicon-side2": "#464a52", "m-silicon-edge": "#e2e4e8",
  "m-mirror-top": "#8d939e", "m-mirror-side": "#3a3e45", "m-mirror-edge": "#e2e4e8",
  "m-hot-top": "#a4562a", "m-hot-side": "#5a2a10", "m-hot-edge": "#f2c27a",
  "m-quartz-top": "#c9cfd8", "m-quartz-side": "#6b727c", "m-quartz-side2": "#8a919b", "m-quartz-edge": "#f0f3f6",
  "m-earth-top": "#2e2925", "m-earth-side": "#1c1916", "m-earth-side2": "#25211d", "m-earth-edge": "#79706b",
  "m-screen-top": "#0b0a0a",
  "l-copper": "#e39a6c", "l-gold": "#f7d08a", "l-silver": "#b9b2aa", "l-energy": "#9fb6d6",
  "lay-bg": "#1c1317", "lay-block": "#24161c", "lay-cell": "#4a2c3c", "lay-cell2": "#5a3549", "lay-diff": "#6a3a55", "lay-diff-edge": "#e6a2cc", "lay-poly": "#e6a2cc",
  "lay-metal": "#c9d2dc", "lay-outline": "#d9c7b0", "lay-pad": "#a9a29a", "lay-sheen": "#ffffff", "lay-well": "#24161c", "lay-well-edge": "#5a3a4a",
  "lay-li": "rgba(159,182,214,.30)", "lay-li-edge": "rgba(205,220,240,.7)", "lay-met": "rgba(201,214,229,.42)", "lay-cont": "#f3eadc", "lay-cellline": "#4c3239", "lay-m2": "rgba(159,182,214,.28)", "lay-sub": "#150e11",
  "sch-line": "#f0ece6", "sch-node": "#f7d08a",
  "fx-chip": "rgba(230,162,204,.55)", "fx-chip-mid": "rgba(230,162,204,.14)", "fx-blend": "screen", "sheen-blend": "screen",
  "fx-hot": "rgba(255,213,154,.95)", "fx-hot-mid": "rgba(226,137,58,.5)", "fx-warm": "rgba(255,207,138,.55)", "fx-blue": "rgba(159,208,255,.7)", "fx-blue-mid": "rgba(159,182,214,.25)",
  "fx-beam-top": "rgba(207,230,255,.8)", "fx-beam-bot": "rgba(159,182,214,.08)", "fx-gold": "rgba(247,208,138,.7)",
  "ck-well": "#0b0a0a", "ck-pot": "#141312", "ck-rice": "rgba(240,236,230,.85)", "ck-seg": "#e6a2cc", "ck-wall": "#2b2826",
  "vein": "#a7b2c0", "vein-edge": "#e6edf5", port: "#3a1c0c", "port-edge": "#f2c27a",
};

const imagery = {
  plate: "#e6e8ec", // fixed light ground for exhibit photographs and cutouts
  "plate-ink": "#5d5862",
  "mote": "rgba(170,210,255,.55)", "mote-blend": "screen", key: "rgba(40,124,195,.24)", "key-blend": "screen", "grain-blend": "overlay",
  bg: "#07111D", "bg-raised": "#081a30", surface: "#0A2B52", text: "#c4cfdd", "text-strong": "#F5F5F3", muted: "#8094ae", rule: "#183454", "rule-strong": "#2a4d78",
  accent: "#E2B968", "accent-soft": "#2a2414", "on-accent": "#1b130a", energy: "#287CC3", heat: "#e2893a", silver: "#c9d2dc", focus: "#E2B968",
  stage: "#081a30", "stage-glow": "rgba(20,86,155,.28)", "stage-edge": "rgba(0,0,0,.4)", "hero-glow-1": "rgba(12,47,90,1)", "hero-glow-2": "rgba(20,86,155,.28)", beam: "rgba(40,124,195,.10)", grain: ".06", vignette: "rgba(2,6,12,.55)",
  "anatomy-page": "#07111D", "anatomy-card": "#081a30", "anatomy-text": "#9fb0c6", "anatomy-strong": "#F5F5F3", "anatomy-muted": "#62799a",
  "anatomy-paper": "#0c1f38", "anatomy-face": "#15304f", "anatomy-top": "#1b3b63",
  "anatomy-shade-0": "#08172a", "anatomy-shade-1": "#0c1e37", "anatomy-shade-2": "#102644", "anatomy-shade-3": "#152f53",
  "anatomy-lit-top": "#3a2a17", "anatomy-lit-shade": "#24190f",
  "anatomy-hi": "#dbe6f2", "anatomy-mid": "#6c8cb3", "anatomy-lo": "#34557e", "anatomy-faint": "#1f3b60", "anatomy-lit": "#E2B968",
  "anatomy-halo": "#01050a", "anatomy-halo-opacity": ".95", "anatomy-dot": "#dfe8f3", "anatomy-red": "#c97a80", "anatomy-green": "#9ad4b6", "anatomy-blue": "#287CC3",
  "m-gold-top": "#a57d40", "m-gold-side": "#3d2b14", "m-gold-side2": "#664821", "m-gold-edge": "#E2B968", "m-gold-crease": "#c49a55",
  "m-die-top": "#7D4548", "m-die-side": "#3a1f22", "m-die-side2": "#4d2a2d", "m-die-edge": "#E2B968", "m-die-crease": "#c08a7a",
  "m-epoxy-top": "#0c1420", "m-epoxy-side": "#070c14", "m-epoxy-side2": "#0a111b", "m-epoxy-edge": "#34557e",
  "m-glass-fill": "rgba(14,42,77,.35)", "m-glass-top": "rgba(42,111,176,.16)", "m-glass-side": "rgba(18,58,102,.3)", "m-glass-edge": "#8fb8e0",
  "m-pcb-top": "#0d2c52", "m-pcb-side": "#071a33", "m-pcb-side2": "#0a2342",
  "m-silicon-top": "#5f7895", "m-silicon-side": "#22324a", "m-silicon-side2": "#384d6b", "m-silicon-edge": "#c9d6e6",
  "m-mirror-top": "#9fb3cc", "m-mirror-side": "#2b3d57", "m-mirror-edge": "#dfe8f3",
  "m-hot-top": "#a4561f", "m-hot-side": "#5a2a10", "m-hot-edge": "#f2c27a",
  "m-quartz-top": "#b9c3cf", "m-quartz-side": "#5d6a7c", "m-quartz-side2": "#8693a6", "m-quartz-edge": "#e6edf5",
  "m-earth-top": "#2a2420", "m-earth-side": "#1a1614", "m-earth-side2": "#221d19", "m-earth-edge": "#5d473f",
  "m-screen-top": "#050a12",
  "l-copper": "#b07a3e", "l-gold": "#E2B968", "l-silver": "#c9d2dc", "l-energy": "#287CC3",
  "lay-bg": "#1d0e13", "lay-block": "#2a1418", "lay-cell": "#6b383d", "lay-cell2": "#8a4e52", "lay-diff": "#7D4548", "lay-diff-edge": "#b06a6f", "lay-poly": "#E2B968",
  "lay-metal": "#c9d2dc", "lay-outline": "#d9c7b0", "lay-pad": "#b9c3cf", "lay-sheen": "#ffe7b8", "lay-well": "#2a141a", "lay-well-edge": "#5a3239",
  "lay-li": "rgba(176,192,212,.40)", "lay-li-edge": "rgba(222,232,244,.75)", "lay-met": "rgba(201,214,229,.55)", "lay-cont": "#f3eadc", "lay-cellline": "#4c3239", "lay-m2": "rgba(120,160,210,.35)", "lay-sub": "#140a0d",
  "sch-line": "#e8f0fa", "sch-node": "#E2B968",
  "fx-chip": "rgba(226,185,104,.55)", "fx-chip-mid": "rgba(184,138,66,.16)", "fx-blend": "screen", "sheen-blend": "screen",
  "fx-hot": "rgba(255,213,154,.95)", "fx-hot-mid": "rgba(226,137,58,.55)", "fx-warm": "rgba(255,207,138,.55)", "fx-blue": "rgba(159,208,255,.75)", "fx-blue-mid": "rgba(40,124,195,.3)",
  "fx-beam-top": "rgba(207,230,255,.85)", "fx-beam-bot": "rgba(40,124,195,.1)", "fx-gold": "rgba(226,185,104,.7)",
  "ck-well": "#040a13", "ck-pot": "#0a1626", "ck-rice": "rgba(207,214,223,.9)", "ck-seg": "#6fb0ea", "ck-wall": "#0f2340",
  "vein": "#a7b2c0", "vein-edge": "#e6edf5", port: "#3a1c0c", "port-edge": "#f2c27a",
};

export const SCHEMES = {
  paper: { name: "Paper", role: "Light · default", note: "ITE3 Printed pathways. What most visitors see.", dark: false, offered: true, tokens: paper },
  imagery: { name: "Imagery", role: "Dark", note: "ITE3 exhibition imagery. For devices in dark mode, posters and social cards.", dark: true, offered: true, tokens: imagery },
  night: { name: "Night", role: "Not used", note: "ITE3 companion dark mode. Considered for dark mode; Imagery chosen instead.", dark: true, offered: false, tokens: night },
};

export const ITE3_SOURCE = ITE3;

const decl = (t) => Object.entries(t).map(([k, v]) => `--${k}:${v}`).join(";");

// Paper by default, Imagery when the device asks for dark, either when the
// host sets data-theme, and any scheme on demand with data-scheme on a wrapper.
export function schemeCss({ lightOnly = false } = {}) {
  if (lightOnly) return `:root{${decl(paper)};color-scheme:light}`;
  return [
    `:root{${decl(paper)};color-scheme:light}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${decl(imagery)};color-scheme:dark}}`,
    `:root[data-theme="dark"]{${decl(imagery)};color-scheme:dark}`,
    `:root[data-theme="light"]{${decl(paper)};color-scheme:light}`,
    ...Object.entries(SCHEMES).map(([id, s]) => `[data-scheme="${id}"]{${decl(s.tokens)};color-scheme:${s.dark ? "dark" : "light"}}`),
  ].join("\n");
}
