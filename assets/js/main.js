/* Liyas Lounge – shared script (DE + EN)
   The initial theme is set by a small inline script in <head> (no flash).
   Priority: ?theme=light|dark  >  saved choice  >  system preference. */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "ll-theme";
  root.classList.remove("no-js");

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
      var clean = base.split("?")[0];
      a.setAttribute("href", clean + "?theme=" + theme);
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

  /* Mobile menu */
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
    window.addEventListener("resize", function () { if (window.innerWidth > 960) closeMenu(); });
  }

  /* Header border on scroll */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Subtle reveal on scroll */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
