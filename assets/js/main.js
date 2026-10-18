/* Liyas Lounge Olten – Interaktionen (Lenis für Smooth-Scroll, sonst ohne Abhängigkeiten)
   Navigation, Menü, Behandlungs-Slider mit Filter, Seitenpanels, Scroll-Effekte, Karte. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var body = doc.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  /* ---------- Smooth Scroll ---------- */
  var lenis = null;
  if (!reduceMotion && typeof window.Lenis === 'function') {
    try {
      lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }
  var lockCount = 0;
  function lock() { if (lockCount++ === 0 && lenis) lenis.stop(); }
  function unlock() { if (lockCount > 0 && --lockCount === 0 && lenis) lenis.start(); }
  function scrollToEl(el) {
    var off = -96;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset + off, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /* ---------- Navigation ---------- */
  var nav = $('[data-nav]');
  var fab = $('[data-fab]');
  var hero = $('.hero');
  var lastY = window.pageYOffset;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) {
      nav.classList.toggle('is-scrolled', y > 40);
      var hide = y > lastY && y > 400 && !body.classList.contains('menu-open');
      nav.classList.toggle('is-hidden', hide);
    }
    if (fab) fab.classList.toggle('is-on', y > (hero ? hero.offsetHeight * 0.7 : 300));
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // aktiver Abschnitt in der Navigation
  var navLinks = $$('.nav__links a');
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { var id = (a.getAttribute('href') || '').split('#')[1]; if (id) byId[id] = a; });
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = byId[en.target.id];
        if (a && en.isIntersecting) { navLinks.forEach(function (l) { l.classList.remove('is-active'); }); a.classList.add('is-active'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = doc.getElementById(id); if (s) secIO.observe(s); });
  }

  /* ---------- Mobiles Menü ---------- */
  var menu = $('[data-menu]');
  var burger = $('.burger');
  function setMenu(open) {
    if (!menu || !burger) return;
    if (open === body.classList.contains('menu-open')) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', burger.getAttribute(open ? 'data-close-label' : 'data-open-label'));
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
      body.classList.add('menu-open'); lock();
    } else {
      menu.classList.remove('is-open');
      body.classList.remove('menu-open'); unlock();
      setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduceMotion ? 0 : 800);
    }
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1180) setMenu(false); });

  /* ---------- Seitenpanels ---------- */
  var current = null, lastFocus = null;
  function openDrawer(id, opener) {
    var d = doc.getElementById(id);
    if (!d || !d.hasAttribute('data-drawer')) return false;
    if (current === d) return true;
    var swap = !!current;
    if (current) closeDrawer(true);
    if (!swap) lastFocus = opener || doc.activeElement;
    setMenu(false);
    d.hidden = false;
    var panel = $('.drawer__panel', d);
    panel.scrollTop = 0;
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('is-open'); }); });
    current = d;
    body.classList.add('drawer-open'); lock();
    setTimeout(function () { panel.focus({ preventScroll: true }); }, 50);
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
    return true;
  }
  function closeDrawer(silent) {
    if (!current) return;
    var d = current;
    current = null;
    d.classList.remove('is-open');
    setTimeout(function () { if (!d.classList.contains('is-open')) d.hidden = true; }, reduceMotion ? 0 : 700);
    unlock();
    if (silent === true) return;
    body.classList.remove('drawer-open');
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (current) closeDrawer(); else setMenu(false); }
    if (e.key === 'Tab' && current) {
      var f = $$('a[href], button:not([disabled]), summary, [tabindex="0"]', current).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (doc.activeElement === first || doc.activeElement === $('.drawer__panel', current))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Klicks ---------- */
  doc.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var op = e.target.closest('[data-open]');
    if (op) { if (openDrawer(op.getAttribute('data-open'), op)) e.preventDefault(); return; }
    if (e.target.closest('[data-close]')) { closeDrawer(); return; }
    if (e.target.closest('[data-map-load]')) { loadMap(e.target.closest('[data-map]')); return; }
    var top = e.target.closest('[data-top]');
    if (top && !(e.metaKey || e.ctrlKey || e.shiftKey)) {
      var target = top.pathname.replace(/\/$/, '') || '/';
      var here = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';
      if (target === here) {
        e.preventDefault(); setMenu(false);
        if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      return;
    }
    var a = e.target.closest('a[href*="#"]');
    if (a && a.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '') && a.hash.length > 1) {
      var el = doc.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      var wasOpen = body.classList.contains('menu-open');
      setMenu(false);
      setTimeout(function () { scrollToEl(el); }, wasOpen ? 350 : 0);
    }
  });

  /* ---------- Behandlungs-Slider ---------- */
  var rail = $('[data-rail]');
  if (rail) {
    var track = $('[data-track]', rail);
    var cards = $$('.card', track);
    var bar = $('[data-progress]');
    var prev = $('.arrow[data-dir="-1"]'), next = $('.arrow[data-dir="1"]');
    var update = function () {
      var max = rail.scrollWidth - rail.clientWidth;
      var p = max > 0 ? rail.scrollLeft / max : 0;
      var w = max > 0 ? Math.max(12, (rail.clientWidth / rail.scrollWidth) * 100) : 100;
      if (bar) { bar.style.width = w + '%'; bar.style.left = (p * (100 - w)) + '%'; }
      if (prev) prev.disabled = rail.scrollLeft < 4;
      if (next) next.disabled = rail.scrollLeft > max - 4;
    };
    var step = function () {
      var c = cards.filter(function (x) { return !x.hidden; })[0];
      return c ? c.getBoundingClientRect().width + 18 : 320;
    };
    $$('.arrow').forEach(function (b) {
      b.addEventListener('click', function () { rail.scrollBy({ left: Number(b.getAttribute('data-dir')) * step() * (window.innerWidth > 1000 ? 2 : 1), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    });
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    // Filter
    $$('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        cards.forEach(function (c) {
          var show = f === 'all' || c.getAttribute('data-cat') === f;
          c.hidden = !show;
          if (show) c.classList.add('is-in');
        });
        rail.scrollTo({ left: 0 });
        update();
      });
    });

    // Ziehen mit der Maus (Touch scrollt nativ)
    var down = false, moved = false, sx = 0, sl = 0;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; rail.classList.add('is-drag'); }
      if (moved) rail.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      if (moved) {
        // nach dem Ziehen sauber auf die nächste Karte einrasten
        var w = step(), target = Math.round(rail.scrollLeft / w) * w;
        rail.classList.remove('is-drag');
        rail.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
    // vertikales Mausrad bleibt Seiten-Scroll; horizontales Trackpad-Wischen scrollt den Slider nativ
  }

  /* ---------- Einblenden beim Scrollen ---------- */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Parallax ---------- */
  var para = $$('[data-parallax]');
  var heroImg = $('[data-hero-img]');
  if (!reduceMotion && (para.length || heroImg)) {
    var ticking = false;
    var frame = function () {
      ticking = false;
      var vh = window.innerHeight;
      para.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.setProperty('--py', (p * -6).toFixed(2) + '%');
      });
      if (heroImg && window.pageYOffset < vh) heroImg.style.transform = 'translateY(' + (window.pageYOffset * 0.08).toFixed(1) + 'px)';
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* ---------- Karte erst nach Klick laden ---------- */
  function loadMap(box) {
    if (!box || box.querySelector('iframe')) return;
    var f = doc.createElement('iframe');
    f.src = box.getAttribute('data-src');
    f.title = box.getAttribute('data-title') || 'Map';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    box.innerHTML = '';
    box.appendChild(f);
  }

  /* ---------- Direktlink auf eine Behandlung (#t-…) bzw. Abschnitt ---------- */
  if (location.hash.length > 1) {
    var id = decodeURIComponent(location.hash.slice(1));
    var target = doc.getElementById(id);
    if (target && target.hasAttribute('data-drawer')) openDrawer(id);
    else if (target) window.addEventListener('load', function () { setTimeout(function () { scrollToEl(target); }, 60); });
  }

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
