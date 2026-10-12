/* ==========================================================================
   Guide site for all — app.js (file 3 of 3)
   Vanilla JS: reading settings, hash router, saved step ticks, TOC tracking,
   reading progress, copy-links, toasts, print helpers. No dependencies.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var SETTINGS_KEY = "gsfa.settings.v1";
  var STEPS_KEY = "gsfa.steps.v1";
  var SIZES = ["s", "m", "l", "xl"];

  var GUIDES = {
    "ae2-1710": { viewId: "view-guide-ae2-1710", title: "Applied Energistics 2 for 1.7.10" },
    "ae2-modern": { viewId: "view-guide-ae2-modern", title: "Applied Energistics 2 for modern Minecraft" }
  };

  /* ---------------- storage helpers ---------------- */
  function readStore(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  /* ---------------- toast ---------------- */
  var toastEl = doc.getElementById("toast");
  var toastTimer = null;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2600);
  }

  /* ---------------- reading settings ---------------- */
  var settings = readStore(SETTINGS_KEY, {});
  var fontToggle = doc.getElementById("font-toggle");
  var themeToggle = doc.getElementById("theme-toggle");
  var motionToggle = doc.getElementById("motion-toggle");

  function currentSizeIndex() {
    var i = SIZES.indexOf(root.dataset.size);
    return i === -1 ? 1 : i;
  }
  function applySetting(key, value) {
    root.dataset[key] = value;
    settings[key] = value;
    writeStore(SETTINGS_KEY, settings);
    syncSettingButtons();
  }
  function syncSettingButtons() {
    if (themeToggle) themeToggle.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
    if (fontToggle) fontToggle.setAttribute("aria-pressed", String(root.dataset.font === "hyper"));
    if (motionToggle) motionToggle.setAttribute("aria-pressed", String(root.dataset.motion === "off"));
  }

  Array.prototype.forEach.call(doc.querySelectorAll("[data-size-action]"), function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.getAttribute("data-size-action");
      var i = currentSizeIndex();
      if (action === "inc" && i < SIZES.length - 1) i++;
      if (action === "dec" && i > 0) i--;
      if (action === "reset") i = 1;
      applySetting("size", SIZES[i]);
      toast("Text size: " + { s: "small", m: "medium", l: "large", xl: "extra large" }[SIZES[i]]);
    });
  });

  if (fontToggle) fontToggle.addEventListener("click", function () {
    var on = root.dataset.font !== "hyper";
    applySetting("font", on ? "hyper" : "lexend");
    toast(on ? "Easy-reading font on" : "Easy-reading font off");
  });
  if (themeToggle) themeToggle.addEventListener("click", function () {
    var dark = root.dataset.theme !== "dark";
    applySetting("theme", dark ? "dark" : "light");
    toast(dark ? "Dark mode on" : "Dark mode off");
  });
  if (motionToggle) motionToggle.addEventListener("click", function () {
    var calm = root.dataset.motion !== "off";
    applySetting("motion", calm ? "off" : "on");
    toast(calm ? "Calm mode on — animations off" : "Animations back on");
  });
  syncSettingButtons();

  /* ---------------- hash router ---------------- */
  var views = Array.prototype.slice.call(doc.querySelectorAll(".view"));
  var routeLive = doc.getElementById("route-live");

  function parseHash() {
    var raw = location.hash || "";
    if (raw.indexOf("#/") === 0) {
      var parts = raw.slice(2).split("/").filter(Boolean);
      if (parts[0] === "guide" && GUIDES[parts[1]]) {
        return { view: parts[1], section: parts[2] || null, anchor: null };
      }
      return { view: "home", section: null, anchor: null };
    }
    if (raw.length > 1) {
      var id = raw.slice(1);
      if (doc.getElementById(id)) return { view: null, section: null, anchor: id };
    }
    return { view: "home", section: null, anchor: null };
  }

  function instantScrollTo(el) {
    if (!el) { window.scrollTo(0, 0); return; }
    el.scrollIntoView({ block: "start", behavior: "auto" });
  }

  function applyRoute() {
    var route = parseHash();
    if (route.anchor && !route.view) {
      instantScrollTo(doc.getElementById(route.anchor));
      return;
    }
    var targetId = route.view === "home" ? "view-home" : GUIDES[route.view].viewId;
    var changed = false;
    views.forEach(function (view) {
      var active = view.id === targetId;
      if (active && !view.classList.contains("is-active")) changed = true;
      view.classList.toggle("is-active", active);
    });
    doc.body.dataset.view = route.view === "home" ? "home" : "guide";

    if (route.view === "home") {
      doc.title = "Guide site for all — plain guides for everyone";
    } else {
      doc.title = GUIDES[route.view].title + " — Guide site for all";
    }

    if (changed && routeLive) {
      routeLive.textContent = route.view === "home"
        ? "Home — guide library"
        : GUIDES[route.view].title + " guide opened";
    }

    if (route.section) {
      var el = doc.getElementById(route.section);
      if (el) {
        requestAnimationFrame(function () { instantScrollTo(el); });
        return;
      }
    }
    if (changed) window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", applyRoute);

  /* ---------------- tables of contents ---------------- */
  function buildTocFor(article, slug) {
    var chapters = article.querySelectorAll(".chapter");
    var side = article.querySelector("[data-toc]");
    var mobile = article.querySelector("[data-toc-mobile]");
    var makeLink = function (chapter, index) {
      var a = doc.createElement("a");
      a.href = "#/guide/" + slug + "/" + chapter.id;
      var num = doc.createElement("span");
      num.className = "toc-num";
      num.textContent = "Chapter " + (index + 1);
      var label = doc.createElement("span");
      var h2 = chapter.querySelector("h2");
      label.textContent = h2 ? h2.textContent : chapter.id;
      a.appendChild(num);
      a.appendChild(label);
      a.setAttribute("data-toc-link", chapter.id);
      return a;
    };
    Array.prototype.forEach.call(chapters, function (chapter, index) {
      if (side) side.appendChild(makeLink(chapter, index));
      if (mobile) mobile.appendChild(makeLink(chapter, index));
    });
  }

  Object.keys(GUIDES).forEach(function (slug) {
    var article = doc.getElementById(GUIDES[slug].viewId);
    if (article) buildTocFor(article, slug);
  });

  // Close the mobile "On this page" box after picking a chapter.
  doc.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest("[data-toc-mobile] a") : null;
    if (!link) return;
    var details = link.closest("details");
    if (details) details.removeAttribute("open");
  });

  // Highlight the chapter currently on screen.
  var visibleChapters = new Map();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visibleChapters.set(entry.target.id, entry.intersectionRatio);
        else visibleChapters.delete(entry.target.id);
      });
      var top = null;
      visibleChapters.forEach(function (ratio, id) {
        var el = doc.getElementById(id);
        if (!el) return;
        if (!top || el.getBoundingClientRect().top < top.getBoundingClientRect().top) top = el;
      });
      if (!top) return;
      var article = top.closest(".guide");
      if (!article) return;
      Array.prototype.forEach.call(article.querySelectorAll("[data-toc-link]"), function (link) {
        var match = link.getAttribute("data-toc-link") === top.id;
        if (match) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-90px 0px -55% 0px", threshold: [0, 0.1, 0.5] });

    Array.prototype.forEach.call(doc.querySelectorAll(".guide .chapter"), function (chapter) {
      io.observe(chapter);
    });
  }

  /* ---------------- copy section links ---------------- */
  var copyIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  Object.keys(GUIDES).forEach(function (slug) {
    var article = doc.getElementById(GUIDES[slug].viewId);
    if (!article) return;
    Array.prototype.forEach.call(article.querySelectorAll(".chapter h2"), function (h2) {
      var section = h2.closest(".chapter");
      if (!section) return;
      var btn = doc.createElement("button");
      btn.type = "button";
      btn.className = "copy-link";
      btn.setAttribute("aria-label", "Copy a link to the section: " + h2.textContent);
      btn.title = "Copy link to this section";
      btn.innerHTML = copyIconSvg;
      btn.addEventListener("click", function () {
        var url = location.origin + location.pathname + "#/guide/" + slug + "/" + section.id;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            toast("Link copied to clipboard");
          }, function () { toast("Could not copy — you can copy the address bar instead"); });
        } else {
          toast("Copy the address bar to share this section");
        }
      });
      h2.appendChild(btn);
    });
  });

  /* ---------------- step ticks & progress ---------------- */
  var steps = readStore(STEPS_KEY, {});

  function guideStats(article) {
    var boxes = article.querySelectorAll(".step input[data-step]");
    var done = 0;
    Array.prototype.forEach.call(boxes, function (box) { if (box.checked) done++; });
    return { total: boxes.length, done: done };
  }

  function renderProgress() {
    Object.keys(GUIDES).forEach(function (slug) {
      var article = doc.getElementById(GUIDES[slug].viewId);
      if (!article) return;
      var stats = guideStats(article);

      var totalEl = article.querySelector("[data-steps-total]");
      if (totalEl) totalEl.textContent = String(stats.total);

      var bar = article.querySelector("[data-progress-bar]");
      var text = article.querySelector("[data-progress-text]");
      var pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
      if (bar) bar.style.width = pct + "%";
      if (text) {
        if (stats.done === 0) {
          text.textContent = "0 of " + stats.total + " steps ticked. Start when you are ready — your ticks save on this device.";
        } else if (stats.done === stats.total) {
          text.innerHTML = 'All ' + stats.total + ' steps ticked. <span class="all-done">You finished this guide — well done!</span>';
        } else {
          text.textContent = stats.done + " of " + stats.total + " steps ticked (" + pct + "%). Keep going — you are doing great.";
        }
      }

      var mini = doc.querySelector('[data-steps-mini="' + slug + '"]');
      if (mini) {
        mini.textContent = stats.done === stats.total
          ? "Finished — every step ticked"
          : stats.done + " / " + stats.total + " steps done";
      }
    });
  }

  // Restore ticks, then listen for new ones.
  Array.prototype.forEach.call(doc.querySelectorAll(".step input[data-step]"), function (box) {
    var id = box.getAttribute("data-step");
    if (steps[id]) box.checked = true;
  });
  doc.addEventListener("change", function (e) {
    var box = e.target && e.target.matches ? e.target : null;
    if (!box || !box.matches("input[data-step]")) return;
    var id = box.getAttribute("data-step");
    if (box.checked) steps[id] = true; else delete steps[id];
    writeStore(STEPS_KEY, steps);
    renderProgress();
  });

  // Reset + print buttons.
  Object.keys(GUIDES).forEach(function (slug) {
    var article = doc.getElementById(GUIDES[slug].viewId);
    if (!article) return;
    var reset = article.querySelector("[data-reset-steps]");
    if (reset) reset.addEventListener("click", function () {
      var boxes = article.querySelectorAll(".step input[data-step]");
      Array.prototype.forEach.call(boxes, function (box) {
        box.checked = false;
        delete steps[box.getAttribute("data-step")];
      });
      writeStore(STEPS_KEY, steps);
      renderProgress();
      toast("Every step in this guide was unticked");
    });
    var printBtn = article.querySelector("[data-print]");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
  });
  renderProgress();

  /* ---------------- print: open the folded answers ---------------- */
  var reopenAfterPrint = [];
  window.addEventListener("beforeprint", function () {
    reopenAfterPrint = [];
    var active = doc.querySelector(".view.is-active");
    if (!active) return;
    Array.prototype.forEach.call(active.querySelectorAll("details:not([open])"), function (d) {
      d.setAttribute("open", "");
      reopenAfterPrint.push(d);
    });
  });
  window.addEventListener("afterprint", function () {
    reopenAfterPrint.forEach(function (d) { d.removeAttribute("open"); });
    reopenAfterPrint = [];
  });

  /* ---------------- reading progress + to top ---------------- */
  var progressBar = doc.getElementById("read-progress-bar");
  var toTop = doc.getElementById("to-top");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
      if (progressBar) progressBar.style.width = pct + "%";
      if (toTop) toTop.hidden = window.scrollY < 600;
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener("click", function () {
    var smooth = root.dataset.motion !== "off";
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  });

  /* ---------------- icons + initial route ---------------- */
  // Point a few older Lucide icon names at their current names so icons
  // render on any recent Lucide build.
  var ICON_ALIASES = {
    "alert-triangle": "triangle-alert",
    "check-circle-2": "circle-check-big",
    "help-circle": "circle-help"
  };
  Array.prototype.forEach.call(doc.querySelectorAll("[data-lucide]"), function (el) {
    var name = el.getAttribute("data-lucide");
    if (ICON_ALIASES[name]) el.setAttribute("data-lucide", ICON_ALIASES[name]);
  });
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
  // Enabling view-routing styles here (not in the inline head script) means:
  // if this file ever fails to load, every guide stays visible and readable.
  root.dataset.js = "1";
  applyRoute();
})();
