/* Liyas Lounge – Design-Vorschau: Auswahl Version 1 / 2, Umschalter, Einblenden, Menüs, Bewertungen */
(function () {
  'use strict';
  var doc = document, body = doc.body;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var pick = doc.getElementById('pick'), sw = doc.getElementById('switch');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = 'IntersectionObserver' in window && !reduce ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;

  function show(v, keepScroll) {
    $$('.v').forEach(function (el) { el.hidden = el.getAttribute('data-v') !== v; });
    $$('#switch [data-pick]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pick') === v)); });
    var cur = doc.querySelector('.v[data-v="' + v + '"]');
    $$('[data-up]', cur).forEach(function (el) { if (io) io.observe(el); else el.classList.add('is-in'); });
    doc.title = (v === '1' ? 'Version 1 · Soft Clinic' : 'Version 2 · Lounge Noir') + ' – Liyas Lounge Olten';
    try { history.replaceState(null, '', location.pathname + '?v=' + v); } catch (e) {}
    if (!keepScroll) window.scrollTo(0, 0);
    pick.classList.add('is-gone'); body.classList.remove('locked');
    setTimeout(function () { pick.hidden = true; }, reduce ? 0 : 700);
    sw.hidden = false;
    onScroll();
  }
  function openPick() { pick.hidden = false; requestAnimationFrame(function () { pick.classList.remove('is-gone'); }); body.classList.add('locked'); }

  doc.addEventListener('click', function (e) {
    var p = e.target.closest('[data-pick]');
    if (p) { show(p.getAttribute('data-pick')); return; }
    if (e.target.closest('[data-open-pick]')) { openPick(); return; }
    var b = e.target.closest('.burger');
    if (b) { toggleMenu(b); return; }
    var a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href').length > 1) {
      var el = doc.getElementById(a.getAttribute('href').slice(1));
      if (!el) return;
      e.preventDefault();
      closeMenus();
      var top = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    }
  });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenus(); });

  function toggleMenu(b) {
    var m = doc.getElementById(b.getAttribute('aria-controls'));
    var open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open));
    m.hidden = !open;
    body.classList.toggle('locked', open);
  }
  function closeMenus() {
    $$('.burger[aria-expanded="true"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); doc.getElementById(b.getAttribute('aria-controls')).hidden = true; });
    if (pick.hidden) body.classList.remove('locked');
  }

  // Version 2: Navigation wird nach dem Hero fest
  var nav2 = doc.querySelector('.v2-nav');
  function onScroll() { if (nav2) nav2.classList.toggle('is-fixed', window.pageYOffset > 120); }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Version 1: Bewertungen wechseln sanft
  $$('[data-quotes]').forEach(function (box) {
    var f = $$('figure', box), i = 0;
    if (f.length < 2 || reduce) return;
    setInterval(function () { f[i].classList.remove('is-on'); i = (i + 1) % f.length; f[i].classList.add('is-on'); }, 6000);
  });

  // Start: ?v=1 / ?v=2 öffnet direkt die Version, sonst die Auswahl
  var q = (location.search.match(/[?&]v=([12])/) || [])[1];
  if (q) { pick.hidden = true; show(q, true); } else { body.classList.add('locked'); }
})();
