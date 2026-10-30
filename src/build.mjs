// Builds the Open Silicon SG pages from content/, design/ and the figures.
//   node src/build.mjs
//     out/site.html       the hub's home page (artifact source, body only)
//     out/proposal.html   the website proposal
//     out/colours.html    the colour study
//   and a *-preview.html full document of each for local preview.
// Words, events and exhibits come from content/; colours from design/schemes.mjs.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, THEME_CSS, esc, r2, emphasise } from "./lib.mjs";
import { schemeCss, SCHEMES } from "../design/schemes.mjs";
import { PAGE_CSS } from "./styles.mjs";
import { readDoc, check, collection, markdown, inline, ContentError } from "./content.mjs";
import { cardScene } from "./figures/card.mjs";
import { cookerScene } from "./figures/cooker.mjs";
import { phoneScene } from "./figures/phone.mjs";
import { dieScene, cellScene } from "./figures/die.mjs";
import { fabScene } from "./figures/fab.mjs";
import { coloursPage } from "./colours.mjs";
import { markSvg, faviconLink } from "./mark.mjs";
import { endScene } from "./figures/endcard.mjs";
import { openChipScene } from "./figures/openchip.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CONTENT = (p) => join(ROOT, "content", p);
const OUT = (p) => join(ROOT, "out", p);
const ASSET_ROOT = process.env.RELEASE_ASSET_ROOT ? join(process.env.RELEASE_ASSET_ROOT, "assets") : join(ROOT, "assets");
const assetExists = (rel) => existsSync(join(ASSET_ROOT, rel));
const UNIT = Math.sqrt(1.6);
// Events sort into upcoming and past by the Singapore date of the build
// (preview another day with BUILD_DATE=YYYY-MM-DD).
const TODAY = process.env.BUILD_DATE ?? new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });

// ------------------------------------------------------------------ schemas
// "?" marks an optional field. Keep these short: a field becomes required
// only when the page cannot be drawn without it.
const S = {
  site: { name: "string", wordmark: "string", wordmark_suffix: "string?", mark_symbol: "string?", mark_label: "string?", title: "string", nav: "list", footer: "text?", github: "url?", credits: "text", credits_label: "string?" },
  home: {
    hero_eyebrow: "string", hero_title: "string", hero_emphasis: "string?", hero_lede: "text", hero_actions: "list?",
    events_eyebrow: "string?", events_title: "string", events_emphasis: "string?", events_intro: "text?",
    exhibition_title: "string", exhibition_intro: "text?", exhibition_dates: "string?", exhibition_link: "url?", exhibition_link_label: "string?", exhibition_carousel_title: "string?", exhibition_all_label: "string?", exhibition_areas: "list?",
    about_eyebrow: "string?", about_title: "string", about_emphasis: "string?", about_text: "text", audiences: "list?", join_title: "string?", join: "list?",
  },
  hero: { readout: "string?", open_title: "string?", open: "text?", crystal_title: "string?", crystal: "text?", finale_title: "string", finale: "text", end_line: "string?", summary: "text", objects: "list" },
  fab: { eyebrow: "string", title: "string", title_emphasis: "string?", intro: "text", lead_note: "string?", readout: "string?", closing_label: "string", closing_title: "string", closing: "text", stations: "list" },
  proposal: { doc_label: "string", doc_date: "string", guide_title: "string", guide: "list", eyebrow: "string", title: "string", sub: "text", footer: "text" },
  section: { n: "string", id: "string", title: "string", claims: "list?", sitemap: "map?", timeline: "list?" },
  event: { title: "string", kind: "workshop|talk|symposium|showcase|milestone", start: "date", end: "date?", confirmed: "boolean", window: "string?", time: "string?", venue: "string?", with: "list?", audience: "list?", level: "beginner|intermediate|advanced|all?", signup: "url?", summary: "text", public: "boolean?", source: "string?" },
  exhibit: { title: "string", makers: "list", kind: "chip|device|material", invitation: "string?", summary: "text", companion: "url?", source_link: "url?", image: "string?", image_alt: "string?", image_credit: "string?", image_fit: "contain|cover?", public: "boolean?", source: "string?" },
  chip: { title: "string", makers: "list", summary: "text", shuttle: "string", process: "string?", tiles: "number?", status: "designed|submitted|made|tested", source: "url?", workshop: "string?", public: "boolean?" },
  partner: { name: "string", group: "enthusiasts|academia|government|industry|funder|host", role: "text", url: "url?", public: "boolean?" },
};

function load() {
  const site = check(readDoc(CONTENT("site.md")), S.site).data;
  const home = check(readDoc(CONTENT("home.md")), S.home).data;
  const hero = check(readDoc(CONTENT("hero.md")), S.hero).data;
  hero.objects.forEach((o, i) => {
    const where = `content/hero.md, object ${i + 1}`;
    if (!FIGURES[o.figure]) throw new ContentError(`${where}: figure "${o.figure}" is not drawn yet (use ${Object.keys(FIGURES).join(", ")})`);
    for (const f of ["label", "object", "chip", "cell"]) if (!o[f]) throw new ContentError(`${where}: missing "${f}"`);
    if (!Array.isArray(o.titles) || o.titles.length !== 3) throw new ContentError(`${where}: "titles" needs three entries [object, chip, cell]`);
  });
  const fab = check(readDoc(CONTENT("fab.md")), S.fab).data;
  fab.stations.forEach((st, i) => { if (!st.name || !st.fact) throw new ContentError(`content/fab.md, step ${i + 1}: needs name and fact`); });
  const events = collection(CONTENT("events"), S.event).filter((d) => d.data.public !== false);
  events.forEach((e) => {
    if (e.data.end && e.data.end < e.data.start) throw new ContentError(`${e.file}: "end" is before "start"`);
    if (!e.data.confirmed && !e.data.window) throw new ContentError(`${e.file}: unconfirmed events need a "window", such as "Late November 2026"`);
  });
  const exhibits = collection(CONTENT("exhibits"), S.exhibit).filter((d) => d.data.public !== false);
  const chips = collection(CONTENT("chips"), S.chip).filter((d) => d.data.public === true);
  const partners = collection(CONTENT("partners"), S.partner).filter((d) => d.data.public === true);
  return { site, home, hero, fab, events, exhibits, chips, partners };
}

// ------------------------------------------------------------------ figures
// The drawings, keyed by the "figure" name used in content/hero.md.
const FIGURES = {
  card: {
    scene: cardScene,
    die: {
      id: "card-die", pkg: "module", seed: 3, dieUm: 700,
      die: { x: -26, y: -26, w: 52, d: 52, r: 0.6 },
      bigPads: [[36, 400, 160, 200], [804, 400, 160, 200]],
      blocks: [{ x: 220, y: 60, w: 250, h: 880, kind: "analog" }, { x: 490, y: 60, w: 290, h: 330, kind: "flash" }, { x: 490, y: 410, w: 290, h: 530, kind: "std" }],
      focus: [640, 700],
    },
    cell: { id: "card", cell: "inv", seed: 21 },
  },
  cooker: {
    scene: cookerScene,
    die: {
      id: "mcu-die", pkg: "qfn", leads: 10, seed: 5, dieUm: 2000, pads: 10,
      die: { x: -38, y: -38, w: 76, d: 76, r: 0.6 },
      blocks: [
        { x: 100, y: 100, w: 430, h: 330, kind: "flash" }, { x: 550, y: 100, w: 350, h: 210, kind: "sram" }, { x: 550, y: 330, w: 350, h: 300, kind: "std" },
        { x: 100, y: 450, w: 430, h: 260, kind: "std" }, { x: 100, y: 730, w: 280, h: 170, kind: "analog" }, { x: 400, y: 730, w: 500, h: 170, kind: "analog" }, { x: 550, y: 650, w: 350, h: 60, kind: "phy" },
      ],
      focus: [300, 590],
    },
    cell: { id: "mcu", cell: "nand2", seed: 9 },
  },
  phone: {
    scene: phoneScene,
    die: {
      id: "soc-die", pkg: "flip", seed: 13, dieUm: 10000, bumps: true,
      die: { x: -50, y: -50, w: 100, d: 100, r: 0.6 },
      blocks: [
        { x: 60, y: 60, w: 880, h: 70, kind: "phy" }, { x: 60, y: 870, w: 880, h: 70, kind: "phy" }, { x: 60, y: 150, w: 200, h: 340, kind: "std", cores: 1 }, { x: 280, y: 150, w: 200, h: 340, kind: "std", cores: 1 },
        { x: 500, y: 150, w: 440, h: 200, kind: "std", cores: 4 }, { x: 500, y: 370, w: 440, h: 120, kind: "sram" }, { x: 60, y: 510, w: 420, h: 340, kind: "std", cores: 4 }, { x: 500, y: 510, w: 220, h: 340, kind: "std", cores: 2 },
        { x: 740, y: 510, w: 200, h: 200, kind: "std" }, { x: 740, y: 730, w: 200, h: 120, kind: "analog" },
      ],
      focus: [700, 430],
    },
    cell: { id: "soc", cell: "sram", seed: 4 },
  },
};

const glowDefs = (id) => `<defs><radialGradient id="glow-${id}" r=".5"><stop offset="0" stop-color="var(--fx-chip)"/><stop offset=".45" stop-color="var(--fx-chip-mid)"/><stop offset="1" stop-color="var(--fx-chip-mid)" stop-opacity="0"/></radialGradient></defs>`;
function layer(cls, attrs, sc) {
  return `<div class="layer ${cls}" ${attrs}><svg class="iso-svg" viewBox="0 0 ${sc.W} ${sc.H}" role="img" aria-label="${esc(sc.label ?? "")}" preserveAspectRatio="xMidYMid meet">${glowDefs(sc.id)}<g class="cam">${sc.body}</g></svg></div>`;
}

function buildFigures(hero) {
  return hero.objects.map((o, i) => {
    const F = FIGURES[o.figure];
    const obj = F.scene();
    const die = dieScene({ ...F.die, label: `${o.titles[1]}: the package with its lid lifted, the bond wires, and the die whose floorplan flattens into a plan view.` });
    const cells = cellScene({ ...F.cell, cellLabel: `${o.titles[2]}: rows of standard cells, one highlighted, with its transistor schematic drawn over the layout.` });
    return { o, n: i + 1, obj, die, cells, F };
  });
}

// ------------------------------------------------------------------ sections
const wordmark = (site, size) => `<a class="wordmark" href="#top" aria-label="${esc(site.name)}">${markSvg(site, size)}<span>${esc(site.wordmark)}${site.wordmark_suffix ? ` <b>${esc(site.wordmark_suffix)}</b>` : ""}</span></a>`;
const schemeSwitch = () => `<button type="button" class="schemes" data-current="" aria-label="Colour scheme: Auto. Switch to light mode" title="Colour scheme: Auto"><svg data-scheme-icon="" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg><svg data-scheme-icon="paper" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg><svg data-scheme-icon="imagery" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/></svg></button>`;

function siteHeader(site) {
  return `<header class="site-head gutter" id="top">
  <div class="head-row">${wordmark(site)}<nav class="site-nav" aria-label="Sections">${site.nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("")}</nav></div>
</header>`;
}

function heroSection(home, hero, figs, site) {
  const layers = [];
  const beats = figs.map(({ o, n, obj, die, cells, F }) => {
    const glow = `<circle class="chip-glow" cx="${obj.focus[0]}" cy="${obj.focus[1]}" r="70" fill="url(#glow-${obj.id})"/>`;
    layers.push(layer("obj", `data-layer="${obj.id}" data-n="${n}"`, { ...obj, body: obj.body + glow }));
    layers.push(layer("die", `data-layer="${obj.id}-die"`, die));
    layers.push(layer("cells", `data-layer="${obj.id}-cells"`, { ...cells, id: `${obj.id}-cells` }));
    const needed = (die.W * F.die.dieUm) / (die.planSide * 70);
    return {
      id: obj.id, n, W: obj.W, H: obj.H, titles: o.titles, copy: [o.object, o.chip, o.cell],
      objFocus: obj.focus, restC: obj.restC, restZ: obj.restZ, objZoom: obj.zoom, objPx: r2(obj.P.scale * UNIT), objUm: r2(obj.umPerUnit),
      dieCentre: die.centre, dieFocus: die.focus, planZoom: r2(Math.min(36, needed) / 1.9), diePx: r2(die.P.scale * UNIT), dieUmPerWorld: r2(die.umPerWorld), planPx: die.planScale, dieUm: F.die.dieUm,
      cellFit: cells.fit, cellOrigin: cells.origin, cellFocus: cells.focus, cellZoom: cells.zoom,
    };
  });
  const open = openChipScene({ site });
  layers.push(layer("open", 'data-layer="open"', { ...open, id: "open" }));
  const end = endScene({ site, hero });
  layers.push(layer("end", 'data-layer="end"', { ...end, id: "end" }));
  const data = JSON.stringify({ beats, open: open.data, openCopy: hero.open ?? "", openTitle: hero.open_title ?? "", end: end.data, crystal: hero.crystal ?? "", crystalTitle: hero.crystal_title ?? "", finale: hero.finale, finaleTitle: hero.finale_title }).replace(/</g, "\\u003c");
  const actions = (home.hero_actions ?? []).map((a, i) => `<a class="btn${i ? "" : " prime"}" href="${esc(a.href)}">${esc(a.label)}</a>`).join("");
  const headline = emphasise(home.hero_title, home.hero_emphasis);
  return `
<section class="hero iso" data-hero id="study" aria-labelledby="hero-title">
  <div class="hero-grid">
    <div class="hero-copy">
      <h1 id="hero-title">${headline}</h1>
      <p class="lede">${inline(home.hero_lede)}</p>
      ${actions ? `<div class="hero-actions">${actions}</div>` : ""}
    </div>
    <div class="stage-wrap">
      <div class="stage" data-atmo="46">
        <div class="keylight" aria-hidden="true"></div>
        ${layers.join("\n")}
        <canvas class="motes" aria-hidden="true"></canvas><div class="vignette" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div>
        <div class="corners" aria-hidden="true">
          <span data-corner="fig">Fig 1.a</span><span data-corner="title">${esc(figs[0].o.titles[0])}</span>
          <span class="scalebar" data-corner="scale"><i></i><span></span></span>
          ${hero.readout ? `<span data-corner="readout">${esc(hero.readout)}</span>` : ""}
        </div>
      </div>
      <p class="caption" aria-hidden="true"></p>
      <div class="controls">
        <div class="chips" role="group" aria-label="Jump to an object">
          ${figs.map(({ o }, i) => `<button type="button" class="chip" data-jump="${i}"><span>${esc(o.label)}</span><i></i></button>`).join("")}
        </div>
        <div class="buttons">
          <button type="button" class="btn" data-pause aria-pressed="false"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10"/></svg><span>Pause</span></button>
          <button type="button" class="btn" data-replay><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8a4.8 4.8 0 1 0 1.4-3.4M3 2.6v2.6h2.6"/></svg><span>Replay</span></button>
        </div>
      </div>
      <p class="sr-only">${esc(hero.summary)}</p>
    </div>
  </div>
  <script type="application/json" id="hero-data">${data}</script>
</section>`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (iso) => { const [y, m, d] = iso.split("-").map(Number); return { y, m, d, text: `${d} ${MONTHS[m - 1]} ${y}` }; };
function when(e) {
  if (!e.confirmed) return `<span class="ev-when"><span class="ev-tbc">${esc(e.window)}</span><small>Dates to be confirmed</small></span>`;
  const a = day(e.start);
  if (!e.end || e.end === e.start) return `<span class="ev-when">${a.text}${e.time ? `<small>${esc(e.time)}</small>` : ""}</span>`;
  const b = day(e.end);
  const range = a.y === b.y ? (a.m === b.m ? `${a.d}–${b.text}` : `${a.d} ${MONTHS[a.m - 1]} – ${b.text}`) : `${a.text} – ${b.text}`;
  return `<span class="ev-when">${range}${e.time ? `<small>${esc(e.time)}</small>` : ""}</span>`;
}
const sectionHead = (id, eyebrow, title, intro, extra = "", emphasis = "") => `<div class="s-head"><div>${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ""}<h2 id="${id}">${emphasise(title, emphasis)}</h2></div><div class="s-intro">${intro ? `<p>${inline(intro)}</p>` : ""}${extra}</div></div>`;

function eventsSection(home, events) {
  const last = (e) => e.data.end ?? e.data.start;
  const upcoming = events.filter((e) => last(e) >= TODAY).sort((a, b) => a.data.start.localeCompare(b.data.start));
  const past = events.filter((e) => last(e) < TODAY).sort((a, b) => b.data.start.localeCompare(a.data.start));
  const item = ({ data: e, body }) => {
    const meta = [e.venue, e.with?.length ? `with ${e.with.join(", ")}` : "", e.level ? `${e.level} level` : ""].filter(Boolean).join(" · ");
    return `<li class="ev">${when(e)}<div class="ev-main"><h4>${esc(e.title)}</h4><p>${inline(e.summary)}</p>${meta ? `<p class="ev-meta">${esc(meta)}</p>` : ""}${body ? `<div class="ev-body">${markdown(body)}</div>` : ""}${e.signup ? `<a class="btn prime ev-signup" href="${esc(e.signup)}" target="_blank" rel="noopener">Sign up</a>` : ""}</div><span class="ev-kind" data-kind="${e.kind}">${e.kind}</span></li>`;
  };
  const next = upcoming.slice(0, 3);
  const more = upcoming.slice(3);
  const group = (title, contents) => `<div class="ev-group"><h3>${title}</h3><div>${contents}</div></div>`;
  const list = (events) => `<ol class="ev-list">${events.map(item).join("")}</ol>`;
  const disclosure = (label, events) => `<details class="ev-more"><summary>${label}<span aria-hidden="true"></span></summary>${list(events)}</details>`;
  return `
<section class="block events gutter" id="events" aria-labelledby="events-title">
  <div class="wrap">
    ${sectionHead("events-title", home.events_eyebrow, home.events_title, home.events_intro, "", home.events_emphasis)}
    ${group("Upcoming", `${next.length ? list(next) : `<p class="ev-empty">Nothing scheduled yet. New sessions appear here as soon as they are confirmed.</p>`}${more.length ? disclosure("Show more events", more) : ""}`)}
    ${past.length ? group("Past", disclosure("Show past events", past)) : ""}
  </div>
</section>`;
}

// Exhibit pictures come from assets/ and are embedded, so the page stays one file.
const MIME = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", svg: "image/svg+xml" };
function assetUri(rel, where) {
  const file = join(ASSET_ROOT, rel);
  if (!existsSync(file)) throw new ContentError(`${where}: image "${rel}" is not in assets/`);
  const type = MIME[rel.split(".").pop().toLowerCase()];
  if (!type) throw new ContentError(`${where}: image "${rel}" should be .webp, .jpg, .png or .svg`);
  return `data:${type};base64,${readFileSync(file).toString("base64")}`;
}

function exhibitionSection(home, exhibits) {
  if (home.exhibition_areas?.length) {
    const extra = home.exhibition_dates ? `<p class="s-meta">${esc(home.exhibition_dates)}${home.exhibition_link ? `<a class="ex-directions" href="${esc(home.exhibition_link)}">${esc(home.exhibition_link_label ?? "Getting there")} ↗</a>` : ""}</p>` : "";
    const areas = home.exhibition_areas.map(a => `<a class="ex-area" href="${esc(a.href)}">${a.image && assetExists(a.image) ? `<span class="ex-area-image"><img src="${assetUri(a.image, "content/home.md")}" alt="" loading="lazy" decoding="async"></span>` : ""}<span class="ex-area-label"><span><b>${esc(a.label)}</b>${a.text ? `<small>${esc(a.text)}</small>` : ""}</span><span aria-hidden="true">→</span></span></a>`).join("");
    return `<section class="block exhibition gutter" id="exhibition" aria-labelledby="exhibition-title"><div class="wrap">${sectionHead("exhibition-title", "Exhibition", home.exhibition_title, home.exhibition_intro, extra)}<iframe class="ex-carousel" src="/ite3/?embed=carousel" title="${esc(home.exhibition_carousel_title ?? "Exhibition carousel")}" loading="lazy"></iframe><div class="ex-areas">${areas}</div><a class="ex-all" href="/ite3/#find">${esc(home.exhibition_all_label ?? "All exhibits")} <span aria-hidden="true">→</span></a></div></section>`;
  }
  const kinds = { chip: "Chip", device: "Device", material: "Material" };
  const card = ({ data: x, file }) => `<li class="ex" data-kind="${x.kind}">
    ${x.image && assetExists(x.image) ? `<figure class="ex-img" data-fit="${x.image_fit ?? "contain"}"><img src="${assetUri(x.image, file)}" alt="${esc(x.image_alt ?? x.title)}" loading="lazy" decoding="async">${x.image_credit ? `<figcaption>${esc(x.image_credit)}</figcaption>` : ""}</figure>` : `<div class="ex-img ex-blank" aria-hidden="true"></div>`}
    <div class="ex-body"><span class="ex-kind">${kinds[x.kind]}</span><h3>${esc(x.title)}</h3><p class="ex-makers">${esc(x.makers.join(", "))}</p>${x.invitation ? `<p class="ex-inv">${esc(x.invitation)}</p>` : ""}<p class="ex-sum">${inline(x.summary)}</p></div>
    <div class="ex-links">${x.companion ? `<a href="${esc(x.companion)}">In the companion</a>` : ""}${x.source_link ? `<a href="${esc(x.source_link)}" target="_blank" rel="noopener">Original<span aria-hidden="true"> ↗</span></a>` : ""}</div>
  </li>`;
  const extra = `${home.exhibition_dates ? `<p class="s-meta">${esc(home.exhibition_dates)}</p>` : ""}${home.exhibition_link ? `<a class="btn" href="${esc(home.exhibition_link)}">${esc(home.exhibition_link_label ?? "Open the exhibition")}</a>` : ""}`;
  return `
<section class="block exhibition gutter" id="exhibition" aria-labelledby="exhibition-title">
  <div class="wrap">
    ${sectionHead("exhibition-title", "In the Ether 3", home.exhibition_title, home.exhibition_intro, extra)}
    <ul class="ex-grid">${exhibits.map(card).join("")}</ul>
  </div>
</section>`;
}

function aboutSection(home) {
  const aud = (home.audiences ?? []).map((a) => `<li><h3>${esc(a.name)}</h3><p>${inline(a.text)}</p></li>`).join("");
  const join = (home.join ?? []).map((j) => `<li>${j.href ? `<a href="${esc(j.href)}">` : "<div>"}<h4>${esc(j.label)}</h4><p>${inline(j.text ?? "")}</p>${j.href ? "</a>" : "</div>"}</li>`).join("");
  return `
<section class="block about gutter" id="about" aria-labelledby="about-title">
  <div class="wrap">
    ${sectionHead("about-title", home.about_eyebrow, home.about_title, home.about_text, "", home.about_emphasis)}
    ${aud ? `<div class="aud-network"><svg class="aud-traces" viewBox="0 0 200 280" preserveAspectRatio="none" aria-hidden="true"><path d="M0 52 H50 V140 H100 M200 52 H150 V140 H100 M0 228 H50 V140 H100 M200 228 H150 V140 H100"/></svg><span class="aud-dot dot-tl" aria-hidden="true"></span><span class="aud-dot dot-tr" aria-hidden="true"></span><span class="aud-dot dot-bl" aria-hidden="true"></span><span class="aud-dot dot-br" aria-hidden="true"></span><span class="aud-hub" aria-hidden="true">${markSvg(C.site, 96)}</span><ul class="aud">${aud}</ul></div>` : ""}
    ${join ? `<h3 class="join-title">${esc(home.join_title ?? "Get involved")}</h3><ul class="join">${join}</ul>` : ""}
  </div>
</section>`;
}

function siteFooter(site) {
  return `<footer class="site-foot gutter"><div class="wrap"><div>${wordmark(site, 64)}${site.footer ? `<p>${inline(site.footer)}</p>` : ""}</div>${site.github ? `<a class="site-github" href="${esc(site.github)}">GitHub <span aria-hidden="true">↗</span></a>` : ""}</div></footer>`;
}

function proposalSection(p, sections) {
  const shortcodes = {
    claims: ({ data }) => `<div class="claims">${data.claims.map((c) => `<div><p class="eyebrow">${esc(c.label)}</p><p><b>${inline(c.title)}</b> ${inline(c.text)}</p></div>`).join("")}</div>`,
    sitemap: ({ data }) => `<div class="map" role="img" aria-label="The home page's sections: ${data.sitemap.sections.map((x) => x.name).join(", ")}."><div class="map-home"><b>Home</b><span>${esc(data.sitemap.home)}</span></div><div class="map-row">${data.sitemap.sections.map((x) => `<div><b>${esc(x.name)}</b>${x.lines.map((l) => `<span>${esc(l)}</span>`).join("")}</div>`).join("")}</div><div class="map-foot"><b>${esc(data.sitemap.foot_label ?? "Later")}</b><span>${esc(data.sitemap.foot)}</span></div></div>`,
    timeline: ({ data }) => `<ol class="timeline">${data.timeline.map((t) => `<li><span class="when">${esc(t.when)}</span><div><b>${esc(t.what)}</b><p>${inline(t.detail)}</p></div></li>`).join("")}</ol>`,
    swatches: () => {
      const rows = [["paper", "bg", "page"], ["paper", "bg-raised", "raised surfaces"], ["paper", "silver", "traces, metal"], ["paper", "text-strong", "lines, type"], ["paper", "accent", "the signal"], ["paper", "energy", "energy, light"], ["paper", "heat", "heat, copper"], ["imagery", "bg", "dark page"], ["imagery", "accent", "dark signal"]];
      const names = { bg: "Page", "bg-raised": "Panel", silver: "Pewter", "text-strong": "Ink", accent: "Signal", energy: "Navy", heat: "Orange" };
      return `<ul class="swatches">${rows.map(([s, t, role]) => { const hex = SCHEMES[s].tokens[t]; return `<li><span class="sw" style="background:${hex}"></span><b>${SCHEMES[s].name} · ${names[t]}</b><code>${hex}</code><span>${role}</span></li>`; }).join("")}</ul>`;
    },
  };
  const secs = sections.map((d) => `
  <section class="sec" id="${esc(d.data.id)}"><div class="sec-n">${esc(d.data.n)}</div><div class="sec-body"><h3>${inline(d.data.title)}</h3>${markdown(d.body, shortcodes, d)}</div></section>`).join("");
  return `
<section class="guide gutter" aria-label="${esc(p.guide_title)}">
  <div class="guide-inner"><p class="eyebrow">${esc(p.guide_title)}</p><ol>${p.guide.map((g) => `<li>${inline(g)}</li>`).join("")}</ol></div>
</section>
<article class="doc gutter" id="proposal" aria-labelledby="proposal-title">
  <header class="doc-head"><p class="eyebrow">${esc(p.eyebrow)}</p><h2 id="proposal-title">${inline(p.title)}</h2><p class="doc-sub">${inline(p.sub)}</p></header>
  ${secs}
  <footer class="doc-foot"><p>${inline(p.footer)}</p></footer>
</article>`;
}

// ------------------------------------------------------------------ pages
const font = (file, type) => `data:${type};base64,${readFileSync(join(ROOT, file)).toString("base64")}`;
const ISO_CSS = k.ISO_CSS.replace(/\.iso\{[^}]*\}\s*\.iso\[data-theme="light"\]\{[^}]*\}/, ""); // tokens come from design/schemes.mjs
const BASE_CSS = (options = {}) => `${assetExists("ABC-Areal.woff2") ? `@font-face{font-family:"ABC Areal";src:url(data:font/woff2;base64,${readFileSync(join(ASSET_ROOT, "ABC-Areal.woff2")).toString("base64")}) format("woff2");font-weight:100 900;font-display:swap}` : ""}
${schemeCss(options)}
${ISO_CSS}
${THEME_CSS}
${PAGE_CSS}`;
const HEAD = (title) => `<title>${esc(title)}</title>${faviconLink(C.site)}
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600&display=swap">`;
// The scheme switch: Auto follows the device; a choice is remembered per browser.
const SCHEME_JS = `
(() => {
  const btns = [...document.querySelectorAll("button.schemes")];
  const modes = ["", "paper", "imagery"];
  const labels = ["Auto", "Light", "Dark"];
  const set = (id) => {
    if (id) document.body.dataset.scheme = id; else delete document.body.dataset.scheme;
    const index = modes.indexOf(id);
    btns.forEach((button) => {
      button.dataset.current = id;
      button.setAttribute("aria-label", "Colour scheme: " + labels[index] + ". Switch to " + labels[(index + 1) % modes.length].toLowerCase() + " mode");
      button.title = "Colour scheme: " + labels[index];
    });
    try { localStorage.setItem("os-scheme", id); } catch {}
  };
  btns.forEach((b) => b.addEventListener("click", () => set(modes[(modes.indexOf(b.dataset.current) + 1) % modes.length])));
  let saved = ""; try { saved = localStorage.getItem("os-scheme") ?? ""; } catch {}
  if (modes.includes(saved)) set(saved);
})();`;

function write(name, page) {
  writeFileSync(OUT(`${name}.html`), page);
  writeFileSync(OUT(`${name}-preview.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>${page}</body></html>`);
  console.log(`wrote out/${name}.html`, (page.length / 1024).toFixed(0), "KB");
}

let C;
try {
  C = load();
} catch (e) {
  if (e instanceof ContentError) { console.error(`Content problem — nothing was built.\n${e.message}`); process.exit(1); }
  throw e;
}
mkdirSync(OUT(""), { recursive: true });
const figs = buildFigures(C.hero);
const fab = fabScene({ copy: C.fab, site: C.site });

write("site", `${HEAD(C.site.title)}
<style>${BASE_CSS({ lightOnly: true })}${fab.css}</style>
${siteHeader(C.site)}
<main>
${heroSection(C.home, C.hero, figs, C.site)}
${fab.html}
${eventsSection(C.home, C.events)}
${exhibitionSection(C.home, C.exhibits)}
${aboutSection(C.home)}
</main>
${siteFooter(C.site)}
<script type="module">${readFileSync(join(HERE, "hero.js"), "utf8")}
${fab.js}
${readFileSync(join(HERE, "atmosphere.js"), "utf8")}</script>`);

