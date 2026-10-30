// Heading highlights sweep in when they come into view, so the ones further
// down the page aren't spent before anyone reaches them.
(() => {
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("seen"); seen.unobserve(e.target); }
  }, { rootMargin: "0px 0px -12% 0px", threshold: 1 });
  document.querySelectorAll(".hero-emphasis").forEach((word) => seen.observe(word));
})();
