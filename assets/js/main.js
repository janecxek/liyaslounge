/* Liyas Lounge – shared script (DE + EN)
   The initial theme and colour variant are set by a small inline script in <head> (no flash).
   Theme priority:   ?theme=light|dark       >  saved choice  >  light (default).
   Palette priority: ?palette=noir|espresso|gold|rose >  saved choice  >  noir (default, client's logo colours). */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "ll-theme";
  var PALETTE_KEY = "ll-palette";
  var SHOW_PALETTE_PICKER = true; // preview tool for the client – set to false before launch
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  // keep an existing ?key= in the address bar in sync, so a reload keeps the choice
  function syncUrlParam(key, value) {
    try {
      var url = new URL(window.location.href);
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, value);
        history.replaceState(null, "", url.toString());
      }
    } catch (e) { /* ignore */ }
  }

  /* ---------- Theme & colour variant ---------- */
  function currentTheme() {
    // light is the default; dark only when chosen via the toggle (or ?theme=dark)
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function currentPalette() {
    return root.getAttribute("data-palette") || "espresso";
  }

  /* Language links always carry the active theme and colour variant, so switching DE <-> EN keeps them
     (also works when localStorage is blocked, e.g. private mode or file://). */
  function syncLangLinks() {
    var query = "?theme=" + currentTheme() + "&palette=" + currentPalette();
    document.querySelectorAll("[data-lang-link]").forEach(function (a) {
      var base = a.getAttribute("data-href") || a.getAttribute("href");
      a.setAttribute("data-href", base);
      a.setAttribute("href", base.split("?")[0] + query);
    });
  }

  function setTheme(t) {
    root.setAttribute("data-theme", t);
    store(STORAGE_KEY, t);
    syncUrlParam("theme", t);
    syncLangLinks();
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    });
    refreshPicker();
  }

  function setPalette(p) {
    if (p === "espresso") root.removeAttribute("data-palette");
    else root.setAttribute("data-palette", p);
    store(PALETTE_KEY, p);
    syncUrlParam("palette", p);
    syncLangLinks();
    refreshPicker();
  }

  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.setAttribute("aria-pressed", currentTheme() === "dark" ? "true" : "false");
    btn.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });

  /* ---------- Colour picker (lets the client compare variants live) ---------- */
  var isEn = (root.getAttribute("lang") || "").indexOf("en") === 0;
  var VARIANTS = [
    { id: "noir", de: "Schwarz & Gold (Logo)", en: "Black & gold (logo)", dots: ["#ffffff", "#141414", "#c5a467"] },
    { id: "espresso", de: "Espresso (Template)", en: "Espresso (template)", dots: ["#ffffff", "#5b3a28", "#19154e"] },
    { id: "gold", de: "Gold & Creme", en: "Gold & cream", dots: ["#f8f4ee", "#b08d57", "#2e2621"] },
    { id: "rose", de: "Nude & Rosé", en: "Nude & rosé", dots: ["#fcf7f4", "#8c5d56", "#c9a27e"] },
    { id: "dark", de: "Dunkel", en: "Dark", dots: ["#120e0b", "#3a2519", "#e8cfb6"] }
  ];
  var picker = null;

  function dotsHtml(colors) {
    return '<span class="palette-picker__dots" aria-hidden="true">' +
      colors.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + "</span>";
  }

  function activeVariant() {
    return currentTheme() === "dark" ? "dark" : currentPalette();
  }

  function refreshPicker() {
    if (!picker) return;
    var active = activeVariant();
    picker.querySelectorAll(".palette-picker__option").forEach(function (opt) {
      opt.setAttribute("aria-checked", opt.getAttribute("data-variant") === active ? "true" : "false");
    });
    var v = VARIANTS.filter(function (x) { return x.id === active; })[0] || VARIANTS[0];
    picker.querySelector(".palette-picker__toggle").innerHTML = dotsHtml(v.dots) + "<span>" + (isEn ? v.en : v.de) + "</span>";
  }

  function buildPicker() {
    picker = document.createElement("div");
    picker.className = "palette-picker";
    picker.innerHTML =
      '<div class="palette-picker__panel" id="palette-panel" role="radiogroup" aria-label="' + (isEn ? "Colour scheme" : "Farbvariante") + '">' +
        '<p class="palette-picker__title">' + (isEn ? "Colour scheme" : "Farbvariante") + "</p>" +
        '<p class="palette-picker__hint">' + (isEn ? "Preview – compare the variants" : "Vorschau – Varianten vergleichen") + "</p>" +
        VARIANTS.map(function (v) {
          return '<button type="button" class="palette-picker__option" role="radio" data-variant="' + v.id + '">' +
            dotsHtml(v.dots) + "<span>" + (isEn ? v.en : v.de) + "</span></button>";
        }).join("") +
      "</div>" +
      '<button type="button" class="palette-picker__toggle" aria-expanded="false" aria-controls="palette-panel"></button>';
    document.body.appendChild(picker);

    var toggle = picker.querySelector(".palette-picker__toggle");
    toggle.addEventListener("click", function () {
      var open = !picker.classList.contains("is-open");
      picker.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    picker.querySelectorAll(".palette-picker__option").forEach(function (opt) {
      opt.addEventListener("click", function () {
        var id = opt.getAttribute("data-variant");
        if (id === "dark") { setTheme("dark"); return; }
        setPalette(id);
        if (currentTheme() === "dark") setTheme("light");
      });
    });
    document.addEventListener("click", function (e) {
      if (!picker.contains(e.target)) { picker.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
    refreshPicker();
  }

  if (SHOW_PALETTE_PICKER) buildPicker();
  syncLangLinks();

  /* ---------- Mobile menu ---------- */
  var body = document.body;
  var menuBtn = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  function closeMenu() {
    body.classList.remove("menu-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    if (menu) menu.setAttribute("aria-hidden", "true");
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var open = !body.classList.contains("menu-open");
      body.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1020) closeMenu(); });
  }

  /* ---------- Scroll reveal ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Scroll-driven effects: header, parallax, timeline ---------- */
  var header = document.querySelector(".site-header");
  var parallaxImgs = Array.prototype.slice.call(document.querySelectorAll(".parallax img"));
  var timelines = Array.prototype.slice.call(document.querySelectorAll(".timeline"));
  var lastY = window.scrollY;
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;

    if (header) {
      header.classList.toggle("is-scrolled", y > 10);
      // hide while scrolling down past the hero, show again when scrolling up
      var hide = y > lastY && y > vh * 0.9 && !body.classList.contains("menu-open");
      header.classList.toggle("is-hidden", hide);
    }
    lastY = y;

    if (reduceMotion) return;

    parallaxImgs.forEach(function (img) {
      var frame = img.parentElement.getBoundingClientRect();
      if (frame.bottom < -100 || frame.top > vh + 100) return;
      // -1 (frame below viewport) .. 1 (frame above viewport)
      var progress = (vh / 2 - (frame.top + frame.height / 2)) / (vh / 2 + frame.height / 2);
      img.style.transform = "translate3d(0," + (progress * frame.height * 0.1).toFixed(1) + "px,0)";
    });

    timelines.forEach(function (tl) {
      var fill = tl.querySelector(".timeline-fill");
      if (!fill) return;
      var r = tl.getBoundingClientRect();
      var p = (vh * 0.6 - r.top) / r.height;
      fill.style.transform = "scaleY(" + Math.max(0, Math.min(1, p)).toFixed(3) + ")";
    });
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
