// Atmosphere for the motion stages: drifting dust in the light, drawn on a
// canvas over the scene. Colour comes from the scheme (--mote, --mote-blend),
// so it reads as dust in a beam on Night and as fine specks on Paper.
// Runs only while the stage is on screen; one still frame under reduced motion.
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const sprite = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.35, "rgba(255,255,255,.55)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
    return c;
  })();
  document.querySelectorAll("[data-atmo]").forEach((stage, si) => {
    const cv = stage.querySelector("canvas.motes");
    if (!cv) return;
    const g = cv.getContext("2d");
    let seed = 97 + si * 31;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const N = Number(stage.dataset.atmo) || 46;
    const motes = Array.from({ length: N }, () => ({ x: rnd(), y: rnd(), z: 0.25 + rnd() * 0.75, ph: rnd() * 6.28, sp: 0.4 + rnd() * 0.6 }));
    let w = 0, h = 0, dpr = 1, tint = "", frame = 0, visible = false, t = 0, last = 0;
    const tinted = document.createElement("canvas");
    tinted.width = tinted.height = 64;
    function retint() {
      const css = getComputedStyle(stage);
      const col = css.getPropertyValue("--mote").trim() || "rgba(255,255,255,.4)";
      cv.style.mixBlendMode = css.getPropertyValue("--mote-blend").trim() || "normal";
      if (col === tint) return;
      tint = col;
      const tg = tinted.getContext("2d");
      tg.clearRect(0, 0, 64, 64);
      tg.globalCompositeOperation = "source-over";
      tg.drawImage(sprite, 0, 0);
      tg.globalCompositeOperation = "source-in";
      tg.fillStyle = col;
      tg.fillRect(0, 0, 64, 64);
    }
    function size() {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(1.5, devicePixelRatio || 1);
      w = Math.max(1, Math.round(r.width * dpr));
      h = Math.max(1, Math.round(r.height * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }
    function draw() {
      g.clearRect(0, 0, w, h);
      const scale = w / 900;
      for (const m of motes) {
        const drift = t * 0.012 * m.sp;
        const x = ((m.x + Math.sin(t * 0.13 * m.sp + m.ph) * 0.02 + drift * 0.3) % 1 + 1) % 1;
        const y = ((m.y - drift * (0.6 + m.z) + Math.cos(t * 0.11 + m.ph) * 0.01) % 1 + 1) % 1;
        const s = (2 + m.z * m.z * 9) * scale * dpr;
        g.globalAlpha = (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 0.4 * m.sp + m.ph))) * (m.z > 0.8 ? 0.55 : 1);
        g.drawImage(tinted, x * w - s, y * h - s, s * 2, s * 2);
      }
      g.globalAlpha = 1;
    }
    function tick(now) {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      t += dt;
      if (Math.floor(t * 2) !== Math.floor((t - dt) * 2)) retint();
      draw();
      frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
    }
    const start = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } };
    new ResizeObserver(() => { size(); draw(); }).observe(cv);
    new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; start(); }, { threshold: 0.05 }).observe(stage);
    document.addEventListener("visibilitychange", () => { if (document.hidden) visible = false; });
    document.addEventListener("click", (e) => { if (e.target.closest("[data-set-scheme]")) setTimeout(() => { retint(); draw(); }, 50); });
    size();
    retint();
    draw();
  });
})();
