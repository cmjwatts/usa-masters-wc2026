// Auto-hide the sticky nav on mobile: slide away when scrolling down,
// return on the first upward scroll. Desktop keeps the always-visible bar
// (the hide transform only applies inside the mobile media query).
(function () {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  let last = window.scrollY, ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y > last + 8 && y > 140) nav.classList.add("nav-hidden");
      else if (y < last - 8 || y <= 140) nav.classList.remove("nav-hidden");
      last = y;
      ticking = false;
    });
  }, { passive: true });
})();
