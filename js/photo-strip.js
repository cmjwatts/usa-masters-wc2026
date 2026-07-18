// Rotating photo strip. Every <figure> inside #photoStrip is part of the pool;
// the first three stay visible and the rest crossfade through those slots.
// To add a photo: process it with scripts/add-photos.mjs, then add one
// <figure> line inside #photoStrip — no changes needed here.
(function () {
  var strip = document.getElementById('photoStrip');
  if (!strip) return;
  var figures = [].slice.call(strip.querySelectorAll('figure'));
  var pool = figures.map(function (f) {
    var img = f.querySelector('img');
    return { src: img.getAttribute('src'), alt: img.alt, pos: img.style.objectPosition || 'center' };
  });
  figures.slice(3).forEach(function (f) { f.parentNode.removeChild(f); });
  if (pool.length <= 3 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var slots = strip.querySelectorAll('img');
  var next = slots.length, slot = 0;
  setInterval(function () {
    var p = pool[next++ % pool.length];
    var img = slots[slot++ % slots.length];
    var pre = new Image();
    pre.onload = pre.onerror = function () {
      img.style.opacity = 0;
      setTimeout(function () {
        img.src = p.src;
        img.alt = p.alt;
        img.style.objectPosition = p.pos;
        img.style.opacity = 1;
      }, 450);
    };
    pre.src = p.src;
  }, 4000);
})();
