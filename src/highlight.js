// Heading highlights and the About traces play when they come into view, so the
// ones further down the page aren't spent before anyone reaches them.
(() => {
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("seen"); seen.unobserve(e.target); }
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.6 });
  document.querySelectorAll(".hero-emphasis,.aud-network").forEach((el) => seen.observe(el));
})();
