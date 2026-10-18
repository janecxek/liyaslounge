/* Liyas Lounge Olten – Interaktionen (Lenis für Smooth-Scroll, sonst ohne Abhängigkeiten)
   Jede Sprache hat eigene Seiten (DE unter /, EN unter /en/); der Sprachumschalter ist ein normaler Link
   auf die Gegenstück-Seite. Komponenten werden pro Inhaltsebene (.lp) initialisiert. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  /* ---------- Smooth Scroll (Lenis) ---------- */
  var lenis = null;
  if (!reduceMotion && typeof window.Lenis === 'function') {
    try {
      lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }
  function stopScroll() { if (lenis) lenis.stop(); doc.body.classList.add('menu-open'); }
  function startScroll() { if (lenis) lenis.start(); doc.body.classList.remove('menu-open'); }

  /* ---------- Sprachebenen ---------- */
  var paneEls = $$('.lp');
  if (!paneEls.length) paneEls = [doc.body];
  var lang = function () { return root.classList.contains('lang-en') ? 'en' : 'de'; };
  var panes = {};
  function activePane() { return panes[lang()] || panes.de || panes[Object.keys(panes)[0]]; }

  function headerOffset() {
    var P = activePane().el;
    return (($('.hdr', P) || {}).offsetHeight || 0) + 16;
  }
  function scrollToEl(el) {
    if (lenis) lenis.scrollTo(el, { offset: -headerOffset(), duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - headerOffset(), behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function initPane(P, key) {
    var api = { el: P };
    var hdr = $('.hdr', P);
    var mbar = $('.mbar', P);
    var cfab = $('.cfab', P);
    var heroPar = $('[data-hero-parallax]', P);
    var hero = $('.hero', P);
    var bands = $$('[data-parallax]', P);
    var lastY = window.pageYOffset;

    api.frame = function () {
      var y = window.pageYOffset || root.scrollTop;
      var vh = window.innerHeight;
      var hasHero = doc.body.classList.contains('has-hero');
      if (hdr) {
        hdr.classList.toggle('is-solid', !hasHero || y > 40);
        var hide = y > vh && y > lastY + 2 && !doc.body.classList.contains('menu-open');
        if (y < lastY - 2 || y < vh) hide = false;
        if (Math.abs(y - lastY) > 2) hdr.classList.toggle('is-hidden', hide);
      }
      if (mbar) mbar.classList.toggle('is-visible', y > vh * 0.6);
      // am Seitenende ausblenden, damit die Links im Footer frei bleiben
      if (cfab) cfab.classList.toggle('is-visible', y > vh * 0.6 && y + vh < doc.documentElement.scrollHeight - 160);
      if (!reduceMotion) {
        if (heroPar && hero && y < hero.offsetHeight) heroPar.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0)';
        for (var i = 0; i < bands.length; i++) {
          var r = bands[i].parentNode.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) continue;
          var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
          bands[i].style.transform = 'translate3d(0,' + (p * -18).toFixed(2) + '%,0)';
        }
      }
      lastY = y;
      api.words();
    };

    /* Wort-für-Wort */
    var wordEls = $$('[data-words]', P);
    wordEls.forEach(function (el) {
      if (reduceMotion) return;
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = doc.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); return; }
              var s = doc.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(el);
      el._w = $$('.w', el);
    });
    api.words = function () {
      var vh = window.innerHeight;
      wordEls.forEach(function (el) {
        if (!el._w) return;
        var r = el.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (vh * 0.88 - r.top) / (r.height + vh * 0.35)));
        var n = Math.round(p * el._w.length);
        for (var i = 0; i < el._w.length; i++) el._w[i].classList.toggle('on', i < n);
      });
    };

    /* Mobile Navigation */
    var burger = $('.burger', P);
    var mnav = $('.mnav', P);
    api.setMenu = function (open) {
      if (!burger || !mnav) return;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', burger.getAttribute(open ? 'data-label-close' : 'data-label-open') || '');
      if (open) {
        mnav.hidden = false;
        stopScroll();
        if (hdr) hdr.classList.remove('is-hidden');
        requestAnimationFrame(function () { requestAnimationFrame(function () { mnav.classList.add('is-open'); }); });
      } else {
        mnav.classList.remove('is-open');
        startScroll();
        setTimeout(function () { if (!mnav.classList.contains('is-open')) mnav.hidden = true; }, reduceMotion ? 0 : 700);
      }
    };
    api.menuOpen = function () { return !!burger && burger.getAttribute('aria-expanded') === 'true'; };
    if (burger) {
      burger.addEventListener('click', function () { api.setMenu(!api.menuOpen()); });
      $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { api.setMenu(false); }); });
    }

    /* Mega-Menü */
    $$('.has-mega', P).forEach(function (item) {
      var link = $('.nav__link', item);
      var state = function (open) { link.setAttribute('aria-expanded', String(open)); };
      item.addEventListener('mouseenter', function () { item.classList.remove('is-closed'); state(true); });
      item.addEventListener('mouseleave', function () { state(false); });
      item.addEventListener('focusin', function () { item.classList.remove('is-closed'); state(true); });
      item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) state(false); });
      item.addEventListener('keydown', function (e) { if (e.key === 'Escape') { item.classList.add('is-closed'); state(false); link.focus(); } });
    });

    /* Kategorien: aufklappen (immer nur eine offen) */
    $$('[data-cats]', P).forEach(function (wrap) {
      // Miniaturen in geschlossenen Kategorien vorladen, sobald der Bereich in die Nähe kommt
      var warm = function () { $$('img[loading="lazy"]', wrap).forEach(function (im) { im.loading = 'eager'; }); };
      var watch = function () {
        if (!('IntersectionObserver' in window)) return warm();
        var wio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { warm(); wio.disconnect(); } }, { rootMargin: '800px 0px' });
        wio.observe(wrap);
      };
      // erst nach dem Laden der Seite – damit das Hero-Bild Vorrang hat
      if (doc.readyState === 'complete') watch(); else window.addEventListener('load', watch);
      var cats = $$('.cat', wrap);
      var set = function (cat, open) {
        cat.classList.toggle('is-open', open);
        $('.cat__btn', cat).setAttribute('aria-expanded', String(open));
      };
      cats.forEach(function (cat) {
        var btn = $('.cat__btn', cat);
        var panel = $('.cat__panel', cat);
        btn.addEventListener('click', function () {
          var open = !cat.classList.contains('is-open');
          var before = btn.getBoundingClientRect().top;
          cats.forEach(function (c) { if (c !== cat) set(c, false); });
          set(cat, open);
          panel.addEventListener('transitionend', function done(e) {
            if (e.target !== panel) return;
            panel.removeEventListener('transitionend', done);
            if (lenis) lenis.resize();
          });
          // Wenn eine Kategorie darüber zuklappt, Position halten bzw. sanft nachführen
          if (open) setTimeout(function () {
            var top = btn.getBoundingClientRect().top;
            if (top < headerOffset() || top > window.innerHeight * .6) scrollToEl(cat);
          }, before < headerOffset() ? 0 : 720);
        });
      });
    });

    /* Studio: Hintergrundbilder überblenden */
    $$('[data-studio]', P).forEach(function (sec) {
      var slides = $$('[data-slide]', sec), dots = $$('[data-dot]', sec);
      var i = 0, timer = null, visible = false, T = 6000;
      sec.style.setProperty('--studio-t', T + 'ms');
      var go = function (n) {
        slides[i].classList.remove('is-active'); dots[i].classList.remove('is-active'); dots[i].setAttribute('aria-pressed', 'false');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('is-active'); dots[i].classList.add('is-active'); dots[i].setAttribute('aria-pressed', 'true');
        // Fortschrittsbalken neu starten
        var bar = $('i', dots[i]); bar.style.display = 'none'; void bar.offsetWidth; bar.style.display = '';
      };
      var stop = function () { clearInterval(timer); timer = null; sec.classList.add('is-paused'); };
      var start = function () {
        if (reduceMotion || timer || !visible) return;
        sec.classList.remove('is-paused');
        timer = setInterval(function () { go(i + 1); }, T);
      };
      dots.forEach(function (d, k) { d.addEventListener('click', function () { stop(); go(k); start(); }); });
      if (reduceMotion) sec.classList.add('is-paused');
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          visible = es[0].isIntersecting;
          if (visible) { go(i); start(); } else stop();
        }, { threshold: 0.25 }).observe(sec);
      } else { visible = true; start(); }
    });

    /* Bewertungs-Slider */
    $$('[data-slider]', P).forEach(function (slider) {
      var slides = $$('.review', slider);
      var cur = $('[data-current]', slider);
      var i = 0, timer = null;
      if (slides.length < 2) return;
      var go = function (n) {
        slides[i].classList.remove('is-active'); slides[i].setAttribute('aria-hidden', 'true');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('is-active'); slides[i].setAttribute('aria-hidden', 'false');
        if (cur) cur.textContent = i + 1;
      };
      var auto = function () { if (reduceMotion) return; clearInterval(timer); timer = setInterval(function () { if (lang() === key) go(i + 1); }, 9000); };
      $('[data-next]', slider).addEventListener('click', function () { go(i + 1); auto(); });
      $('[data-prev]', slider).addEventListener('click', function () { go(i - 1); auto(); });
      slider.addEventListener('mouseenter', function () { clearInterval(timer); });
      slider.addEventListener('mouseleave', auto);
      var x0 = null;
      slider.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      slider.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 50) { go(dx < 0 ? i + 1 : i - 1); auto(); }
        x0 = null;
      });
      auto();
    });

    /* FAQ */
    $$('.faq__item', P).forEach(function (det) {
      var sum = $('summary', det), body = $('.faq__a', det), anim = null;
      if (!sum || !body || reduceMotion || !body.animate) return;
      sum.addEventListener('click', function (e) {
        e.preventDefault();
        if (anim) anim.cancel();
        if (det.open) {
          anim = body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.22,.61,.36,1)' });
          anim.onfinish = function () { det.open = false; anim = null; if (lenis) lenis.resize(); };
        } else {
          det.open = true;
          anim = body.animate([{ height: '0px', opacity: 0 }, { height: body.offsetHeight + 'px', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' });
          anim.onfinish = function () { anim = null; if (lenis) lenis.resize(); };
        }
      });
    });

    /* Kontakt-Pop-up */
    var sheet = $('.csheet', P);
    var sheetFocus = null;
    api.contactOpen = function () { return !!sheet && !sheet.hidden; };
    api.openContact = function (from) {
      if (!sheet) return false;
      sheetFocus = from || doc.activeElement;
      // Beratungs-Modus: WhatsApp zuerst, mit passender Nachricht
      var consult = !!(from && from.getAttribute && from.getAttribute('data-intent') === 'consult');
      var wa = $('.channel--wa', sheet), txt = $('.csheet__text', sheet);
      if (wa) {
        if (!wa.getAttribute('data-wa-default')) wa.setAttribute('data-wa-default', wa.getAttribute('href'));
        wa.setAttribute('href', wa.getAttribute(consult ? 'data-wa-consult' : 'data-wa-default'));
      }
      if (txt) {
        if (!txt.getAttribute('data-default-text')) txt.setAttribute('data-default-text', txt.textContent);
        txt.textContent = txt.getAttribute(consult ? 'data-consult-text' : 'data-default-text');
      }
      sheet.classList.toggle('is-consult', consult);
      sheet.hidden = false;
      requestAnimationFrame(function () { sheet.classList.add('is-open'); });
      $$('[data-contact]', P).forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
      setTimeout(function () { var f = consult ? $('.channel--wa', sheet) : $('.channel', sheet); if (f) f.focus(); }, 60);
      return true;
    };
    api.closeContact = function (restore) {
      if (!sheet || sheet.hidden) return;
      sheet.classList.remove('is-open');
      $$('[data-contact]', P).forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      setTimeout(function () { sheet.hidden = true; }, reduceMotion ? 0 : 320);
      if (restore !== false && sheetFocus && sheetFocus.focus) sheetFocus.focus();
    };

    /* Buchungs-Modal */
    var modal = $('.modal', P);
    var lastFocus = null;
    api.openBooking = function () {
      if (!modal) return false;
      var frame = $('iframe', modal);
      var loader = $('.modal__loader', modal);
      if (frame && !frame.getAttribute('src')) {
        frame.addEventListener('load', function () { if (loader) loader.hidden = true; }, { once: true });
        frame.setAttribute('src', frame.getAttribute('data-src'));
      }
      api.closeContact(false);
      lastFocus = doc.activeElement;
      modal.hidden = false;
      stopScroll();
      setTimeout(function () { var c = $('.modal__close', modal); if (c) c.focus(); }, 30);
      return true;
    };
    api.closeBooking = function () {
      if (!modal || modal.hidden) return;
      modal.hidden = true;
      if (!api.menuOpen()) startScroll();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    api.keydown = function (e) {
      if (e.key === 'Escape') {
        if (modal && !modal.hidden) api.closeBooking();
        else if (api.contactOpen()) api.closeContact();
        else if (api.menuOpen()) { api.setMenu(false); burger.focus(); }
      }
      if (e.key === 'Tab' && api.contactOpen()) {
        var c = $$('a[href], button', sheet);
        if (c.length) {
          if (e.shiftKey && doc.activeElement === c[0]) { e.preventDefault(); c[c.length - 1].focus(); }
          else if (!e.shiftKey && doc.activeElement === c[c.length - 1]) { e.preventDefault(); c[0].focus(); }
        }
      }
      if (e.key === 'Tab' && modal && !modal.hidden) {
        var f = $$('a[href], button, iframe', modal).filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    /* Google Maps erst nach Klick */
    $$('[data-map]', P).forEach(function (box) {
      var btn = $('[data-map-load]', box);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var f = doc.createElement('iframe');
        f.src = box.getAttribute('data-map');
        f.title = box.getAttribute('data-map-title') || 'Google Maps';
        f.loading = 'lazy';
        f.referrerPolicy = 'no-referrer-when-downgrade';
        f.setAttribute('allowfullscreen', '');
        f.setAttribute('data-lenis-prevent', '');
        box.appendChild(f);
        var ph = $('.map__ph', box);
        if (ph) ph.remove();
      });
    });

    return api;
  }

  paneEls.forEach(function (el) { panes[el.getAttribute('data-pane') || 'de'] = initPane(el, el.getAttribute('data-pane') || 'de'); });

  /* ---------- Globale Ereignisse → sichtbare Ebene ---------- */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { activePane().frame(); ticking = false; }); }
  }, { passive: true });
  window.addEventListener('resize', function () {
    activePane().frame();
    if (window.innerWidth > 1024) Object.keys(panes).forEach(function (k) { if (panes[k].menuOpen()) panes[k].setMenu(false); });
  });
  doc.addEventListener('keydown', function (e) { activePane().keydown(e); });

  /* Unterseiten beim Hover/Touch vorladen (Safari/Firefox – Chrome nutzt Speculation Rules) */
  if (!(HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules'))) {
    var fetched = {};
    var pre = function (e) {
      var a = e.target.closest && e.target.closest('a[href^="/"]');
      if (!a || a.target || a.hasAttribute('data-book')) return;
      var url = a.getAttribute('href').split('#')[0];
      if (!url || fetched[url] || url === location.pathname) return;
      fetched[url] = 1;
      var l = doc.createElement('link'); l.rel = 'prefetch'; l.href = url; doc.head.appendChild(l);
    };
    doc.addEventListener('mouseover', pre, { passive: true });
    doc.addEventListener('touchstart', pre, { passive: true });
  }

  /* Datenschutz-Hinweis: einmal bestätigen, danach nicht mehr anzeigen */
  var noticeSeen = false;
  try { noticeSeen = localStorage.getItem('ll-notice') === '1'; } catch (err) {}
  if (!noticeSeen) $$('[data-notice]').forEach(function (n) { n.hidden = false; requestAnimationFrame(function () { n.classList.add('is-in'); }); });

  doc.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var lpEl = e.target.closest('.lp');
    var pane = (lpEl && panes[lpEl.getAttribute('data-pane')]) || activePane();
    // Buchung
    var trigger = e.target.closest('[data-book]');
    if (trigger) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      if (pane.menuOpen()) pane.setMenu(false);
      if (pane.openBooking()) e.preventDefault();
      return;
    }
    if (e.target.closest('[data-close]')) { pane.closeBooking(); return; }
    if (e.target.closest('[data-notice-ok]')) {
      try { localStorage.setItem('ll-notice', '1'); } catch (err) {}
      $$('[data-notice]').forEach(function (n) { n.classList.remove('is-in'); setTimeout(function () { n.hidden = true; }, 350); });
      return;
    }
    // Kontakt-Pop-up
    var ct = e.target.closest('[data-contact]');
    if (ct) { e.preventDefault(); if (pane.contactOpen()) pane.closeContact(); else pane.openContact(ct); return; }
    if (e.target.closest('[data-cclose]')) { pane.closeContact(); return; }
    // Logo → nach oben
    var top = e.target.closest('[data-top]');
    if (top && !(e.metaKey || e.ctrlKey || e.shiftKey)) {
      var target = top.pathname.replace(/\/$/, '') || '/';
      var here = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';
      if (target === here) {
        e.preventDefault();
        if (pane.menuOpen()) pane.setMenu(false);
        if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      return;
    }
    // Anker
    var a = e.target.closest('a[href^="#"]');
    if (a) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = doc.getElementById(decodeURIComponent(id.slice(1)));
      if (!el) return;
      e.preventDefault();
      scrollToEl(el);
    }
  });

  /* ---------- Behandlungs-Karten (Startseite, je Kategorie): Pfeile, Ziehen mit der Maus ---------- */
  $$('[data-rail]').forEach(function (rail) {
    var section = rail.closest('[data-rail-wrap]') || doc;
    var cards = $$('.trail__track > li', rail);
    var bar = $('[data-progress]', section);
    var prev = $('[data-dir="-1"]', section), next = $('[data-dir="1"]', section);
    var gap = 16;
    var step = function () { var c = cards[0]; return c ? c.getBoundingClientRect().width + gap : 300; };
    var update = function () {
      var max = rail.scrollWidth - rail.clientWidth;
      var w = max > 0 ? Math.max(12, rail.clientWidth / rail.scrollWidth * 100) : 100;
      if (bar) { bar.style.width = w + '%'; bar.style.left = (max > 0 ? rail.scrollLeft / max : 0) * (100 - w) + '%'; }
      if (prev) prev.disabled = rail.scrollLeft < 4;
      if (next) next.disabled = rail.scrollLeft > max - 4;
    };
    [prev, next].forEach(function (b) {
      if (b) b.addEventListener('click', function () { rail.scrollBy({ left: Number(b.getAttribute('data-dir')) * step() * (window.innerWidth > 1000 ? 2 : 1), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    });
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
      if (!moved) return;
      var w = step();
      rail.classList.remove('is-drag');
      rail.scrollTo({ left: Math.round(rail.scrollLeft / w) * w, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    // nach dem Ziehen keinen Klick auf die Karte auslösen
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Reveal beim Scrollen ---------- */
  var revealEls = $$('[data-reveal]');
  var io = null;
  var reveal = function (el) { el.classList.add('is-in'); if (io) io.unobserve(el); };
  if ('IntersectionObserver' in window && !reduceMotion) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) reveal(en.target); });
    }, { rootMargin: '0px 0px -2% 0px', threshold: 0.01 });
    revealEls.forEach(function (el) { io.observe(el); });
    var pending = false;
    var sweep = function () {
      pending = false;
      var vh = window.innerHeight;
      revealEls = revealEls.filter(function (el) {
        if (el.classList.contains('is-in')) return false;
        var r = el.getBoundingClientRect();
        if (r.height === 0 && r.width === 0) return true; // in verborgener Sprachebene
        if (r.top < vh * 0.92) { reveal(el); return false; }
        return true;
      });
      if (!revealEls.length) window.removeEventListener('scroll', onSweep);
    };
    var onSweep = function () { if (!pending) { pending = true; setTimeout(sweep, 150); } };
    window.addEventListener('scroll', onSweep, { passive: true });
    window.addEventListener('load', sweep);
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Anker beim Laden ---------- */
  if (location.hash && location.hash.length > 1) {
    window.addEventListener('load', function () {
      var id = decodeURIComponent(location.hash.slice(1));
      var el = doc.getElementById(id);
      if (el) setTimeout(function () { scrollToEl(el); }, 60);
    });
  }

  activePane().frame();
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
