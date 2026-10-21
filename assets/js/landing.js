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
  var nav = $('[data-nav]'), fab = $('[data-fab]'), hero = $('.hero'), heroImg = $('[data-hero-img]'), ct = $('#kontakt');
  var lastY = 0, acc = 0, vh = window.innerHeight, vw = window.innerWidth;
  function onScroll(y) {
    // erst alle Masse lesen, dann schreiben – vermeidet erzwungenes Layout pro Frame
    var trTop = tr && !(reduce || vw <= 900) ? tr.getBoundingClientRect().top : null;
    var ctTop = ct ? ct.getBoundingClientRect().top : Infinity;
    var mid = vh * .4, cur = -1;
    for (var k = 0; k < secs.length; k++) if (secs[k] && secs[k].getBoundingClientRect().top < mid) cur = k;
    nav.classList.toggle('is-solid', y > 40);
    var d = y - lastY;
    // kleine Bewegungen sammeln, damit die Leiste nicht flackert
    acc = (d > 0) === (acc > 0) ? acc + d : d;
    if (body.classList.contains('locked') || y < vh * .6) nav.classList.remove('is-hidden');
    else if (acc > 18) nav.classList.add('is-hidden');
    else if (acc < -10) nav.classList.remove('is-hidden');
    lastY = y;
    // nach dem Hero einblenden, beim Kontakt-Bereich (eigener grosser Button) wieder ausblenden
    if (fab) fab.classList.toggle('is-on', y > vh * .8 && ctTop > vh * .85);
    if (heroImg && !reduce && (y < vh || heroY < vh)) { heroY = Math.min(y, vh); heroImg.style.transform = 'translate3d(0,' + (heroY * .18).toFixed(1) + 'px,0)'; }
    pin(trTop);
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
  }
  var heroY = 0;

  /* ---------- Behandlungen: öffnet sich weich beim Hineinscrollen, schliesst beim Zurückscrollen nach oben ---------- */
  var tr = $('[data-pin]');
  function pin(top) {
    if (!tr) return;
    if (top === null) { tr.classList.add('is-open'); return; }
    if (top < vh * .55) tr.classList.add('is-open');
    else if (top > vh * .8) tr.classList.remove('is-open');
  }

  /* ---------- aktiver Menüpunkt ---------- */
  var links = $$('.nav__links a'), secs = links.map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); });

  if (lenis) lenis.on('scroll', function (l) { onScroll(l.scroll); });
  else window.addEventListener('scroll', function () { onScroll(window.pageYOffset); }, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; vw = window.innerWidth; onScroll(window.pageYOffset); });
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
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); setSel(false); } });

  /* ---------- Sprachwahl (Desktop) ---------- */
  var sel = $('[data-lsel]'), selBtn = sel && $('.lsel__btn', sel);
  function setSel(open) { if (!sel) return; sel.classList.toggle('is-open', open); selBtn.setAttribute('aria-expanded', String(open)); }
  if (sel) {
    selBtn.addEventListener('click', function () { setSel(!sel.classList.contains('is-open')); });
    doc.addEventListener('click', function (e) { if (!e.target.closest('[data-lsel]')) setSel(false); });
  }

  /* ---------- Sprachwechsel: Bildschirm verschwimmt, Logo + Ladebalken, dann neue Seite ---------- */
  var lx = $('.lx');
  $$('.lang a[hreflang], .lsel__list a[hreflang]').forEach(function (a) {
    var pre = function () {
      if (a._pre) return; a._pre = true;
      var l = doc.createElement('link'); l.rel = 'prefetch'; l.href = a.href; doc.head.appendChild(l);
    };
    a.addEventListener('pointerenter', pre); a.addEventListener('focus', pre); a.addEventListener('touchstart', pre, { passive: true });
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-current') === 'true') { e.preventDefault(); setSel(false); return; }
      if (reduce || !lx || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); setSel(false);
      try { sessionStorage.setItem('ll-lx', '1'); } catch (err) {}
      lx.classList.add('is-on');
      setTimeout(function () { location.href = a.href; }, 600);
    });
  });
  // neue Seite: Übergang sanft ausblenden, sobald alles geladen ist
  if (root.classList.contains('lx-in')) {
    var done = function () {
      if (done.ran) return; done.ran = true;
      root.classList.add('lx-done');
      setTimeout(function () { root.classList.remove('lx-in', 'lx-done'); }, 260);
    };
    if (doc.readyState === 'complete') setTimeout(done, 120); else window.addEventListener('load', function () { setTimeout(done, 120); });
    setTimeout(done, 2500); // falls ein Bild sehr lange lädt
  }
  // Zurück-Taste (Seite aus dem Cache): Übergang nicht stehen lassen
  window.addEventListener('pageshow', function (e) { if (e.persisted && lx) { lx.classList.remove('is-on'); root.classList.remove('lx-in', 'lx-done'); } });

  /* ---------- Einblenden ---------- */
  var ups = $$('[data-up]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    ups.forEach(function (el) { io.observe(el); });
  } else ups.forEach(function (el) { el.classList.add('is-in'); });

  /* ---------- Animationen nur laufen lassen, wenn sichtbar ---------- */
  if ('IntersectionObserver' in window) {
    var idle = new IntersectionObserver(function (es) { es.forEach(function (en) { en.target.classList.toggle('is-idle', !en.isIntersecting); }); });
    $$('.hero, .foot').forEach(function (el) { idle.observe(el); });
  }

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

  /* ---------- Mini-Check: Anliegen → (Priorität) → Empfehlung → WhatsApp ---------- */
  $$('[data-quiz]').forEach(function (qz) {
    var data; try { data = JSON.parse($('[data-quiz-data]', qz).textContent); } catch (e) { return; }
    var steps = $$('.qz__step', qz), concern = null, res = $('[data-res]', qz), alt = $('[data-alt]', qz);
    var waBtn = $('[data-qz-wa]', qz), viewBtn = $('[data-qz-view]', qz);
    function show(n) { steps.forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-step') === String(n)); }); }
    function esc(t) { var d = doc.createElement('div'); d.textContent = t; return d.innerHTML; }
    function result(prio) {
      var list = concern.tr.slice();
      if (prio === 'noNeedle') list = list.filter(function (x) { return x.nn; }).concat(list.filter(function (x) { return !x.nn; }));
      if (prio === 'noDown') list = list.filter(function (x) { return x.nd; }).concat(list.filter(function (x) { return !x.nd; }));
      var best = list[0], rest = list.slice(1, 3);
      res.innerHTML = '<b>' + esc(best.n) + '</b><p>' + esc(best.c) + '</p>';
      alt.hidden = !rest.length;
      $$('a', alt).forEach(function (a) { a.remove(); });
      rest.forEach(function (x) { var a = doc.createElement('a'); a.href = x.u; a.textContent = x.n; alt.appendChild(a); });
      var msg = (prio ? data.msgP : data.msg0).replace('{c}', concern.label).replace('{p}', prio ? data.prio[prio].charAt(0).toLowerCase() + data.prio[prio].slice(1) : '').replace('{n}', best.n);
      waBtn.href = data.wa + '?text=' + encodeURIComponent(msg);
      viewBtn.href = best.u;
      show(3);
    }
    $$('[data-k]', qz).forEach(function (b) {
      b.addEventListener('click', function () {
        concern = data.concerns.filter(function (c) { return c.k === b.getAttribute('data-k'); })[0];
        if (concern.tr.length < 2) result(null); else show(2);
      });
    });
    $$('[data-p]', qz).forEach(function (b) { b.addEventListener('click', function () { result(b.getAttribute('data-p')); }); });
    $('[data-back]', qz).addEventListener('click', function () { show(1); });
    $('[data-restart]', qz).addEventListener('click', function () { concern = null; show(1); });
  });
})();
