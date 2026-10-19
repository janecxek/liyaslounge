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

  /* ---------- FAQ: nur eine offen ---------- */
  $$('.acc details').forEach(function (d, _, all) {
    d.addEventListener('toggle', function () { if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; }); });
  });
})();
