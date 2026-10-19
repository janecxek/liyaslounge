/* Liyas Lounge – Startseite: Smooth-Scroll (Lenis), Navigation, Behandlungen-Effekt, Einblenden, Menü */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Smooth Scroll ---------- */
  var lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    try {
      lenis = new window.Lenis({ duration: .85, wheelMultiplier: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }
  var easeInOut = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function goTo(target) {
    var el = typeof target === 'number' ? null : target;
    var off = -64;
    if (lenis) lenis.scrollTo(el || target, { offset: el ? off : 0, duration: 1.4, easing: easeInOut });
    else window.scrollTo({ top: el ? el.getBoundingClientRect().top + window.pageYOffset + off : target, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- Navigation: fest nach dem Hero, weich aus- und einblenden ---------- */
  var nav = $('[data-nav]'), fab = $('[data-fab]'), hero = $('.hero'), heroImg = $('[data-hero-img]');
  var lastY = 0, acc = 0;
  function onScroll(y) {
    var vh = window.innerHeight;
    nav.classList.toggle('is-solid', y > 40);
    var d = y - lastY;
    // kleine Bewegungen sammeln, damit die Leiste nicht flackert
    acc = (d > 0) === (acc > 0) ? acc + d : d;
    if (body.classList.contains('locked') || y < vh * .6) nav.classList.remove('is-hidden');
    else if (acc > 18) nav.classList.add('is-hidden');
    else if (acc < -10) nav.classList.remove('is-hidden');
    lastY = y;
    if (fab) fab.classList.toggle('is-on', y > vh * .8);
    if (heroImg && y < vh && !reduce) heroImg.style.transform = 'translate3d(0,' + (y * .18).toFixed(1) + 'px,0)';
    pin(y);
    spy(y);
  }

  /* ---------- Behandlungen: öffnet sich weich beim Hineinscrollen, schliesst beim Zurückscrollen nach oben ---------- */
  var tr = $('[data-pin]');
  function pin() {
    if (!tr) return;
    if (reduce || window.innerWidth <= 900) { tr.classList.add('is-open'); return; }
    var top = tr.getBoundingClientRect().top, vh = window.innerHeight;
    if (top < vh * .55) tr.classList.add('is-open');
    else if (top > vh * .8) tr.classList.remove('is-open');
  }

  /* ---------- aktiver Menüpunkt ---------- */
  var links = $$('.nav__links a'), secs = links.map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); });
  function spy() {
    var mid = window.innerHeight * .4, cur = -1;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < mid) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
  }

  if (lenis) lenis.on('scroll', function (l) { onScroll(l.scroll); });
  else window.addEventListener('scroll', function () { onScroll(window.pageYOffset); }, { passive: true });
  window.addEventListener('resize', function () { onScroll(window.pageYOffset); });
  onScroll(window.pageYOffset);

  /* ---------- Klicks: Anker, Logo, Menü ---------- */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    if (!burger) return;
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (open) { nav.classList.remove('is-hidden'); menu.scrollTop = 0; }
    body.classList.toggle('locked', open);
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
  }
  doc.addEventListener('click', function (e) {
    if (e.target.closest('.burger')) { setMenu(burger.getAttribute('aria-expanded') !== 'true'); return; }
    var top = e.target.closest('[data-top]');
    if (top && location.pathname.replace(/\/$/, '') === top.getAttribute('href').replace(/\/$/, '')) { e.preventDefault(); setMenu(false); goTo(0); return; }
    var a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href').length > 1) {
      var el = doc.getElementById(a.getAttribute('href').slice(1));
      if (!el) return;
      e.preventDefault();
      var wasOpen = burger && burger.getAttribute('aria-expanded') === 'true';
      setMenu(false);
      // Behandlungen: direkt zum geöffneten Zustand springen
      var target = el;
      if (false) {
        var y = 0;
        setTimeout(function () { if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: easeInOut }); else window.scrollTo({ top: y, behavior: 'smooth' }); }, wasOpen ? 250 : 0);
        return;
      }
      setTimeout(function () { goTo(target); }, wasOpen ? 250 : 0);
    }
  });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Einblenden ---------- */
  var ups = $$('[data-up]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    ups.forEach(function (el) { io.observe(el); });
  } else ups.forEach(function (el) { el.classList.add('is-in'); });

  /* ---------- FAQ: weich auf- und zuklappen, immer nur eine offen ---------- */
  var accs = $$('.acc details');
  function animate(d, open) {
    var body = d.querySelector('div');
    if (reduce || !body.animate) { d.open = open; return; }
    if (d._anim) d._anim.cancel();
    var start = body.offsetHeight;
    if (open) d.open = true;
    var end = open ? body.scrollHeight : 0;
    if (!open) body.style.height = start + 'px';
    d._anim = body.animate([{ height: start + 'px', opacity: open ? 0 : 1 }, { height: end + 'px', opacity: open ? 1 : 0 }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
    d.classList.toggle('is-open', open);
    d._anim.onfinish = function () { d._anim = null; body.style.height = ''; if (!open) d.open = false; };
  }
  accs.forEach(function (d) {
    d.querySelector('div').style.height = d.open ? '' : '0px';
    d.querySelector('summary').addEventListener('click', function (e) {
      e.preventDefault();
      var willOpen = !d.classList.contains('is-open');
      if (willOpen) accs.forEach(function (o) { if (o !== d && o.classList.contains('is-open')) animate(o, false); });
      animate(d, willOpen);
    });
  });

  /* ---------- Bewertungs-Slider (nicht endlos) ---------- */
  $$('[data-slider]').forEach(function (sl) {
    var view = $('.rs__view', sl), track = $('[data-track]', sl), cards = $$('.rs__card', sl);
    var prev = $('[data-prev]', sl), next = $('[data-next]', sl), cur = $('[data-cur]', sl), bar = $('[data-bar]', sl);
    var i = 0, n = cards.length;
    function step() { return cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0); }
    function go(k) {
      i = Math.max(0, Math.min(n - 1, k));
      track.style.setProperty('--x', (-i * step()) + 'px');
      cards.forEach(function (c, j) { c.classList.toggle('is-on', j === i); c.classList.toggle('is-next', j === i + 1); c.classList.toggle('is-prev', j === i - 1); c.setAttribute('aria-hidden', String(j !== i)); });
      prev.disabled = i === 0; next.disabled = i === n - 1;
      cur.textContent = String(i + 1).padStart(2, '0');
      bar.style.setProperty('--p', ((i + 1) / n * 100) + '%');
    }
    prev.addEventListener('click', function () { go(i - 1); });
    next.addEventListener('click', function () { go(i + 1); });
    cards.forEach(function (c, j) { c.addEventListener('click', function () { if (j !== i && !moved) go(j); }); });
    // Wischen / Ziehen
    var sx = 0, sy = 0, dx = 0, down = false, moved = false, base = 0;
    view.addEventListener('pointerdown', function (e) { down = true; moved = false; sx = e.clientX; sy = e.clientY; dx = 0; base = -i * step(); });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - sy)) { moved = true; view.classList.add('is-drag'); }
      if (moved) track.style.setProperty('--x', (base + dx) + 'px');
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false; view.classList.remove('is-drag');
      if (moved) go(i + (dx < -50 ? 1 : dx > 50 ? -1 : 0));
      setTimeout(function () { moved = false; }, 0);
    });
    sl.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
    window.addEventListener('resize', function () { go(i); });
    go(0);
  });
})();
