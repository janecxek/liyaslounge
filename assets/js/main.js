/* Liyas Lounge – shared script (DE + EN)
   The initial theme is set by a small inline script in <head> (no flash).
   Priority: ?theme=light|dark  >  saved choice  >  system preference. */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "ll-theme";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function saveTheme(t) {
    try { localStorage.setItem(STORAGE_KEY, t); } catch (e) { /* storage unavailable */ }
  }

  /* Language links always carry the active theme, so switching DE <-> EN keeps it
     (also works when localStorage is blocked, e.g. private mode or file://). */
  function syncLangLinks() {
    var theme = currentTheme();
    document.querySelectorAll("[data-lang-link]").forEach(function (a) {
      var base = a.getAttribute("data-href") || a.getAttribute("href");
      a.setAttribute("data-href", base);
      a.setAttribute("href", base.split("?")[0] + "?theme=" + theme);
    });
  }

  function setTheme(t) {
    root.setAttribute("data-theme", t);
    saveTheme(t);
    // keep an existing ?theme= in the address bar in sync, so a reload keeps the choice
    try {
      var url = new URL(window.location.href);
      if (url.searchParams.has("theme")) {
        url.searchParams.set("theme", t);
        history.replaceState(null, "", url.toString());
      }
    } catch (e) { /* ignore */ }
    syncLangLinks();
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    });
  }

  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.setAttribute("aria-pressed", currentTheme() === "dark" ? "true" : "false");
    btn.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });
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
