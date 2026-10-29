// Hero player: each object opens, its chip lifts out, the die's floorplan
// untilts into plan view, and one cell's schematic is drawn over its layout.
// After the last object the dive keeps going into the silicon crystal, one
// atom becomes the hub's tile, and the sequence rests on that end card.
(() => {
  const root = document.querySelector("[data-hero]");
  if (!root) return;
  const DATA = JSON.parse(root.querySelector("#hero-data").textContent);
  const stage = root.querySelector(".stage");
  const capEl = root.querySelector(".caption");
  const figEl = root.querySelector('[data-corner="fig"]');
  const titleEl = root.querySelector('[data-corner="title"]');
  const bar = root.querySelector(".scalebar i");
  const barLabel = root.querySelector(".scalebar span");
  const chips = [...root.querySelectorAll("[data-jump]")];
  const replay = root.querySelector("[data-replay]");
  const pauseBtn = root.querySelector("[data-pause]");
  const still = matchMedia("(prefers-reduced-motion: reduce)");

  // Give each object and its captions more time without changing the end card.
  const OBJECT_SPEED = 0.8;
  const SEG = Object.fromEntries(Object.entries({ in: [0, 0.9], explode: [1.7, 3.5], zoom: [4.3, 6.4], x1: [6.0, 6.7], die: [6.0, 7.8], morph: [7.7, 9.0], plan: [8.9, 10.9], x2: [10.4, 11.0], cell: [10.6, 12.4], sch: [12.2, 13.8], out: [14.8, 15.4] }).map(([name, times]) => [name, times.map(t => t / OBJECT_SPEED)]));
  const BEAT = 15.4 / OBJECT_SPEED;
  // The end card starts once the last object's schematic has been drawn.
  const E = { cellOut: [0, 1.5], latIn: [0.5, 1.5], latZoom: [0.8, 4.2], pick: [3.6, 4.4], morph: [4.3, 5.7], cells: [5.4, 6.8], label: [6.5, 7.1], slide: [7.0, 8.4], trace: [7.3, 9.1], name: [8.1, 9.3] };
  const END_LEN = 10.4;
  // Between the last object and the end card: an open chip, signed in its metal.
  const O = { cellOut: [0, 1.2], in: [0.4, 1.4], spot: [1.2, 3.4], zoom: [3.2, 5.4] };
  const OPEN_LEN = DATA.open ? 6.6 : 0;
  const OPEN_AT = BEAT * (DATA.beats.length - 1) + SEG.sch[1] + 0.6;
  const END_AT = OPEN_AT + OPEN_LEN;
  const TOTAL = END_AT + END_LEN;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (t, [a, b]) => clamp((t - a) / (b - a));
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const fx = (v) => Math.round(v * 1000) / 1000;

  const beats = DATA.beats.map((b) => {
    const q = (sel) => stage.querySelector(sel);
    const obj = q(`[data-layer="${b.id}"]`);
    const die = q(`[data-layer="${b.id}-die"]`);
    const cells = q(`[data-layer="${b.id}-cells"]`);
    return {
      ...b,
      obj,
      die,
      cells,
      objCam: obj.querySelector(".cam"),
      parts: [...obj.querySelectorAll("[data-part]")].map((el) => ({ el, ex: el.dataset.ex.split(" ").map(Number), order: Number(el.dataset.order || 0), reveal: el.hasAttribute("data-reveal") })),
      dims: [...obj.querySelector(".cam").children].filter((el) => !el.matches("[data-keep],.chip-glow,defs") && !el.querySelector("[data-keep]")),
      dieCam: die.querySelector(".cam"),
      layout: die.querySelector(".layout"),
      iso: die.querySelector(".layout").dataset.iso.split(" ").map(Number),
      plan: die.querySelector(".layout").dataset.plan.split(" ").map(Number),
      pkgBits: [...die.querySelectorAll(".pkg > *:not(.layout)")],
      lid: die.querySelector('[data-part="lid"]'),
      mark: die.querySelector(".focus-mark"),
      cellCam: cells.querySelector(".cam"),
      cellBody: cells.querySelector(".cells"),
      cellHalo: cells.querySelector(".cell-halo"),
      sch: [...cells.querySelectorAll(".sch")],
      schDots: [...cells.querySelectorAll(".sch-n,.sch-b,.sch-t")],
    };
  });

  const openLayer = stage.querySelector('[data-layer="open"]');
  const OP = openLayer && { D: DATA.open, cam: openLayer.querySelector(".cam"), die: openLayer.querySelector(".open-die"), ring: openLayer.querySelector(".art-ring") };
  const endLayer = stage.querySelector('[data-layer="end"]');
  const EN = endLayer && {
    D: DATA.end,
    latCam: endLayer.querySelector(".lat-cam"),
    lattice: endLayer.querySelector(".lattice"),
    rest: [endLayer.querySelector(".bonds"), ...endLayer.querySelectorAll(".atoms circle:not(.pick)")],
    pick: endLayer.querySelector(".pick"),
    tile: endLayer.querySelector(".end-tile"),
    frame: endLayer.querySelector(".end-tile .frame"),
    core: endLayer.querySelector(".end-core"),
    rows: [0, 1, 2, 3, 4].map((r) => [...endLayer.querySelectorAll(`.end-tile [data-r="${r}"]`)]),
    label: endLayer.querySelector(".end-tile .g"),
    tracks: [...endLayer.querySelectorAll(".end-trace .tr")],
    sig: endLayer.querySelector(".end-trace .sig"),
    bits: [...endLayer.querySelectorAll(".end-trace .node,.end-trace .pad,.end-trace .pad-slot")],
    name: endLayer.querySelector(".end-name"),
  };

  const camAt = (el, s, p, q) => el.setAttribute("transform", `translate(${fx(q[0] - s * p[0])} ${fx(q[1] - s * p[1])}) scale(${fx(s)})`);
  // Focus pulls: a blur that only touches the style when it changes.
  const blur = (el, px) => {
    const v = px < 0.15 ? "none" : `blur(${(Math.round(px * 4) / 4).toFixed(2)}px)`;
    if (el._f !== v) { el.style.filter = v; el._f = v; }
  };
  const show = (el, o) => {
    const v = o < 0.002 ? 0 : o > 0.998 ? 1 : fx(o);
    if (el._o !== v) { el.style.opacity = v; el.style.visibility = v ? "visible" : "hidden"; el._o = v; }
  };

  // Scale bar: the 1-2-5 length nearest 100 px on screen.
  function scaleBar(pxPerUm) {
    if (!(pxPerUm > 0)) return;
    let best = null;
    for (let e = -5; e <= 6; e++) for (const m of [1, 2, 5]) {
      const um = m * Math.pow(10, e);
      const px = um * pxPerUm;
      if (px >= 40 && px <= 180 && (!best || Math.abs(Math.log(px / 100)) < Math.abs(Math.log(best.px / 100)))) best = { um, px };
    }
    if (!best) return;
    bar.parentElement.style.opacity = "";
    const label = best.um >= 1000 ? `${best.um / 1000} mm` : best.um >= 1 ? `${best.um} µm` : `${Number((best.um * 1000).toPrecision(2))} nm`;
    bar.style.width = `${best.px.toFixed(1)}px`;
    if (barLabel.textContent !== label) barLabel.textContent = label;
  }

  let capIndex = "";
  function caption(key, text) {
    if (capIndex === key) return;
    capIndex = key;
    capEl.classList.remove("on");
    clearTimeout(caption.timer);
    caption.timer = setTimeout(() => { capEl.textContent = text; capEl.classList.add("on"); }, 220);
  }

  function drawBeat(b, t, cssScale) {
    const W = b.W, H = b.H, C = [W / 2, H / 2];
    // Object stage.
    const oIn = ease(seg(t, SEG.in));
    const z = ease(seg(t, SEG.zoom));
    const eE = ease(seg(t, [SEG.explode[0] - 0.2, SEG.explode[1] + 0.4]));
    const push = 1 + 0.035 * ease(seg(t, [0, SEG.zoom[0]])); // a slow dolly-in while we look
    const sObj = lerp(b.restZ, 1, eE) * push * Math.exp(Math.log(b.objZoom) * z);
    const pA = [lerp(b.restC[0], C[0], eE), lerp(b.restC[1], C[1], eE)];
    camAt(b.objCam, sObj, [lerp(pA[0], b.objFocus[0], z), lerp(pA[1], b.objFocus[1], z)], [C[0], C[1] + (1 - oIn) * 14]);
    for (const p of b.parts) {
      const e = ease(clamp((t - SEG.explode[0] - p.order * 0.16) / (SEG.explode[1] - SEG.explode[0])));
      p.el.setAttribute("transform", `translate(${fx(p.ex[0] * e)} ${fx(p.ex[1] * e)})`);
      if (p.reveal) p.el.style.opacity = fx(clamp(e * 2.5));
    }
    for (const el of b.dims) { el.style.opacity = fx(1 - 0.82 * z); if (!still.matches) blur(el, z * 3); }
    b.obj.classList.toggle("lit", t > SEG.explode[0] + 0.6);
    show(b.obj, oIn * (1 - seg(t, SEG.x1)));
    if (!still.matches) blur(b.obj, 9 * ease(seg(t, SEG.x1)));

    // Die stage.
    const xd = seg(t, SEG.x1);
    const d1 = ease(seg(t, SEG.die));
    const m = ease(seg(t, SEG.morph));
    const pz = seg(t, SEG.plan);
    const pe = ease(pz);
    const sDie0 = lerp(0.42, 1.9, d1);
    const sDie = sDie0 * Math.exp(Math.log(b.planZoom) * pe);
    const v = ease(clamp(pz * 1.7));
    const pDie = [lerp(b.dieCentre[0], b.dieFocus[0], v), lerp(b.dieCentre[1], b.dieFocus[1], v)];
    camAt(b.dieCam, sDie, pDie, C);
    const M = b.iso.map((a, i) => lerp(a, b.plan[i], m));
    b.layout.setAttribute("transform", `matrix(${M.map(fx).join(" ")})`);
    const pkgO = 1 - clamp(m * 1.4);
    for (const el of b.pkgBits) el.style.opacity = fx(pkgO);
    if (b.lid) b.lid.setAttribute("transform", `translate(0 ${fx(-60 * d1)})`), (b.lid.style.opacity = fx((1 - d1) * pkgO));
    if (b.mark) b.mark.style.opacity = fx(clamp(pz * 3) * (1 - clamp((pz - 0.7) * 4)));
    show(b.die, xd * (1 - seg(t, SEG.x2)));
    if (!still.matches) blur(b.die, 9 * (1 - ease(xd)) + 9 * ease(seg(t, SEG.x2)));

    // Cell stage.
    const xc = seg(t, SEG.x2);
    const c = ease(seg(t, SEG.cell));
    const settle = 1 + 0.045 * ease(seg(t, [SEG.cell[1], BEAT])); // keep drifting in while the schematic draws
    const sCell = b.cellFit * Math.exp(Math.log(b.cellZoom) * c) * settle;
    const p0 = [(C[0] - b.cellOrigin[0]) / b.cellFit, (C[1] - b.cellOrigin[1]) / b.cellFit];
    const vc = ease(clamp(seg(t, SEG.cell) * 1.4));
    const pc = [lerp(p0[0], b.cellFocus[0], vc), lerp(p0[1], b.cellFocus[1], vc)];
    camAt(b.cellCam, sCell, pc, C);
    const d = ease(seg(t, SEG.sch));
    b.cellBody.style.opacity = fx(1 - 0.5 * d);
    b.cellHalo.style.opacity = fx(clamp(c * 2));
    b.sch.forEach((el, i) => { el.style.strokeDashoffset = fx(1 - clamp(d * 1.3 - i * 0.02)); });
    b.schDots.forEach((el) => (el.style.opacity = fx(clamp(d * 2 - 0.8))));
    const out = b.n === beats.length ? 0 : seg(t, SEG.out); // the last object hands over to the end card instead
    if (b.n === beats.length && t * 1 + BEAT * (b.n - 1) >= OPEN_AT) return; // drawOpen owns the cell layer from here
    show(b.cells, xc * (1 - out));
    if (!still.matches) blur(b.cells, 9 * (1 - ease(xc)) + 6 * ease(out));

    // Corners, caption and scale bar follow the stage that is in front.
    const stageIndex = t < SEG.x1[0] + 0.35 ? 0 : t < SEG.x2[0] + 0.3 ? 1 : 2;
    figEl.textContent = `Fig ${b.n}.${"abc"[stageIndex]}`;
    titleEl.textContent = b.titles[stageIndex];
    const capKey = t < 1.2 ? "" : t < SEG.x1[0] ? 0 : t < SEG.x2[0] ? 1 : 2;
    if (capKey !== "") caption(`${b.id}${capKey}`, b.copy[capKey]);
    let pxPerUm;
    if (stageIndex === 0) pxPerUm = (b.objPx * sObj * cssScale) / b.objUm;
    else if (stageIndex === 1) pxPerUm = m < 0.5 ? (b.diePx * sDie * cssScale) / b.dieUmPerWorld : (b.planPx * sDie * cssScale) / (b.dieUm / 1000);
    else pxPerUm = (sCell * cssScale) / 0.01;
    scaleBar(pxPerUm);
  }

  // The end card: crystal, one atom, the tile, the trace, the name.
  function drawEnd(te, cssScale) {
    if (!EN) return;
    const D = EN.D, C = [DATA.beats[0].W / 2, DATA.beats[0].H / 2];
    const from = openLayer || beats[beats.length - 1].cells; // the view we dive out of
    const co = ease(seg(te, E.cellOut));
    from.style.transform = co > 0.001 ? `scale(${fx(1 + 2.2 * co)})` : "";
    show(from, 1 - co);
    if (!still.matches) blur(from, 10 * co);
    const li = ease(seg(te, E.latIn));
    show(endLayer, li);
    if (!still.matches) blur(endLayer, 8 * (1 - li));
    const z = ease(seg(te, E.latZoom));
    const s = Math.exp(lerp(Math.log(D.s0), Math.log(D.s1), z));
    camAt(EN.latCam, s, [lerp(D.centre[0], D.pick[0], z), lerp(D.centre[1], D.pick[1], z)], C);
    const pk = ease(seg(te, E.pick));
    const m = ease(seg(te, E.morph));
    for (const el of EN.rest) el.style.opacity = fx(1 - 0.88 * pk);
    EN.pick.style.fill = pk > 0.25 ? "var(--accent)" : "";
    EN.lattice.style.opacity = fx(1 - m);
    // the picked atom becomes the tile: a circle that squares off and grows
    const k0 = (D.s1 * D.R) / 19, k1 = D.T / 40;
    const sl = ease(seg(te, E.slide));
    const pos = [lerp(C[0], D.tile.x, sl), lerp(C[1], D.tile.y, sl)];
    EN.tile.style.opacity = te >= E.morph[0] ? 1 : 0;
    EN.tile.setAttribute("transform", `translate(${fx(pos[0])} ${fx(pos[1])}) scale(${fx(lerp(k0, k1, m))})`);
    EN.frame.setAttribute("rx", fx(lerp(19, 1.5, m)));
    EN.core.style.opacity = fx(1 - m);
    const ce = seg(te, E.cells);
    EN.rows.forEach((row, r) => row.forEach((el) => (el.style.opacity = fx(clamp(ce * 5 - r)))));
    if (EN.label) EN.label.style.opacity = fx(seg(te, E.label));
    const tr = seg(te, E.trace);
    EN.tracks.forEach((el, i) => (el.style.strokeDashoffset = fx(1 - ease(clamp(tr * 1.4 - i * 0.15)))));
    EN.sig.style.strokeDashoffset = fx(1 - ease(clamp(tr * 1.5 - 0.5)));
    EN.bits.forEach((el) => (el.style.opacity = fx(clamp(tr * 2 - 0.4))));
    const nm = ease(seg(te, E.name));
    EN.name.style.opacity = fx(nm);
    EN.name.setAttribute("transform", `translate(${fx(12 * (1 - nm))} 0)`);
    // corners, caption, scale bar
    if (te < E.morph[0]) {
      figEl.textContent = `Fig ${beats.length}.d`;
      titleEl.textContent = DATA.crystalTitle;
      scaleBar(s * cssScale * 1e6);
    } else {
      figEl.textContent = "Si";
      titleEl.textContent = DATA.finaleTitle;
      bar.parentElement.style.opacity = "0";
    }
    if (te >= 0.8 && te < E.slide[0] && DATA.crystal) caption("crystal", DATA.crystal);
    else if (te >= E.slide[0]) caption("end", DATA.finale);
  }

  // Open on the assembled card rather than a fade from black, so the first
  // still frame (and any link preview) already shows the object.
  let t = SEG.in[1], playing = !still.matches, visible = true, last = 0, frame = 0, done = false;

  const cssScaleNow = () => stage.querySelector("svg").getBoundingClientRect().width / DATA.beats[0].W;
  // The open chip: the whole shared die, its many projects, then the signed one.
  function drawOpen(to, cssScale) {
    if (!OP) return;
    const D = OP.D, C = [DATA.beats[0].W / 2, DATA.beats[0].H / 2];
    const cells = beats[beats.length - 1].cells;
    const co = ease(seg(to, O.cellOut));
    cells.style.transform = co > 0.001 ? `scale(${fx(1 + 0.8 * co)})` : "";
    show(cells, 1 - co);
    if (!still.matches) blur(cells, 10 * co);
    const oi = ease(seg(to, O.in));
    show(openLayer, oi);
    if (!still.matches) blur(openLayer, 8 * (1 - oi));
    openLayer.style.transform = "";
    OP.die.classList.toggle("spot", to > O.spot[0] && to < O.zoom[1]);
    const z = ease(seg(to, O.zoom));
    const art = [D.origin[0] + D.fit * D.artC[0], D.origin[1] + D.fit * D.artC[1]];
    const s = Math.exp(Math.log(D.zoom) * z) * (1 + 0.03 * ease(seg(to, [0, O.zoom[0]])));
    camAt(OP.cam, s, [lerp(C[0], art[0], z), lerp(C[1], art[1], z)], C);
    OP.ring.style.strokeWidth = fx(1 + 2 * z) + "px";
    figEl.textContent = `Fig ${beats.length + 1}`;
    titleEl.textContent = DATA.openTitle;
    scaleBar((D.fit * s * cssScale) / D.umPerUnit);
    if (to >= 0.6 && DATA.openCopy) caption("open", DATA.openCopy);
  }
  function resetOpen() {
    if (!OP) return;
    show(openLayer, 0);
    openLayer.style.transform = "";
    beats[beats.length - 1].cells.style.transform = "";
  }

  function resetEnd() {
    if (!EN) return;
    show(endLayer, 0);
  }

  function finale(on) {
    stage.classList.toggle("finale", on);
    done = on;
    replay.classList.toggle("prime", on);
    if (on) {
      beats.forEach((b) => { show(b.obj, 0); show(b.die, 0); show(b.cells, 0); blur(b.obj, 0); blur(b.die, 0); blur(b.cells, 0); });
      if (OP) { show(openLayer, 0); blur(openLayer, 0); }
      if (EN) { drawEnd(END_LEN, cssScaleNow()); blur(endLayer, 0); }
      chips.forEach((c) => c.style.setProperty("--p", 1));
    } else { resetOpen(); resetEnd(); }
  }

  function render() {
    const cssScale = cssScaleNow();
    const i = Math.min(DATA.beats.length - 1, Math.floor(t / BEAT));
    const local = t - i * BEAT;
    beats.forEach((b, j) => {
      if (j === i) drawBeat(b, local, cssScale);
      else { show(b.obj, 0); show(b.die, 0); show(b.cells, 0); }
    });
    if (t >= OPEN_AT) drawOpen(t - OPEN_AT, cssScale);
    else resetOpen();
    if (t >= END_AT) drawEnd(t - END_AT, cssScale);
    else resetEnd();
    chips.forEach((c, j) => {
      c.style.setProperty("--p", fx(clamp((t - j * BEAT) / (j === beats.length - 1 ? TOTAL - j * BEAT : BEAT))));
      c.toggleAttribute("aria-current", j === i);
    });
  }

  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
    last = now;
    if (playing && !done) {
      t += dt;
      if (t >= TOTAL) { t = TOTAL; finale(true); }
      else render();
    }
    frame = playing && visible && !done ? requestAnimationFrame(tick) : 0;
  }
  const run = () => { if (!frame && playing && visible && !done) { last = 0; frame = requestAnimationFrame(tick); } };
  const setPlaying = (on) => {
    playing = on;
    pauseBtn.setAttribute("aria-pressed", String(!on));
    pauseBtn.querySelector("span").textContent = on ? "Pause" : "Play";
    run();
  };

  replay.addEventListener("click", () => { finale(false); t = 0; capIndex = ""; render(); setPlaying(true); });
  pauseBtn.addEventListener("click", () => { if (done) { replay.click(); return; } setPlaying(!playing); });
  chips.forEach((c, j) => c.addEventListener("click", () => { finale(false); t = j * BEAT + 0.001; capIndex = ""; render(); setPlaying(true); }));
  new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; run(); }, { threshold: 0.15 }).observe(stage);
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; run(); });

  window.__hero = { seek: (s) => { finale(false); t = s; capIndex = ""; render(); }, pause: () => setPlaying(false), finale: () => finale(true), BEAT, SEG, END_AT, TOTAL };
  if (still.matches) finale(true);
  else { render(); run(); }
})();
