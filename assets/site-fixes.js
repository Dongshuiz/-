/* ------------------------------------------------------------------
   站点修订层 — 首屏信息、导航、焦点与快捷键
   只做增强，不改动原 React 的数据与渲染逻辑。
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var data = window.SITE_CONTENT || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.__RM = reduce;

  var SECTIONS = {
    works: "作品",
    skills: "能力",
    study: "经历",
    hobbies: "爱好",
    contact: "找我"
  };
  var KEYS = { "1": "works", "2": "skills", "3": "study", "4": "hobbies", "5": "contact" };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function sectionKey() {
    var m = /^#\/s\/([a-z]+)/.exec(location.hash || "");
    return m && SECTIONS[m[1]] ? m[1] : null;
  }

  function isAdmin() { return location.hash === "#/admin"; }

  var lastPlanet = null;
  var wasFocused = false;

  /* ---------- 首屏信息层 ---------- */
  function buildHeroExtra() {
    var works = (data.works || []).length;
    var meters = (data.meters || []).length;
    var timeline = (data.timeline || []).length;
    var hobbies = (data.hobbies || []).length;
    var box = document.createElement("div");
    box.id = "hero-extra";
    box.innerHTML =
      '<p class="hx-proof">' +
        '<span><b>GPA 3.7</b> / 4.0</span>' +
        '<span class="hx-dot" aria-hidden="true"></span>' +
        '<span><b>校程序赛</b> 三等奖</span>' +
        '<span class="hx-dot" aria-hidden="true"></span>' +
        '<span><b>CET-6</b> 528</span>' +
        '<span class="hx-dot" aria-hidden="true"></span>' +
        '<span><b>' + works + '</b> 个上线作品</span>' +
      '</p>' +
      '<nav class="hx-nav" aria-label="板块快捷导航">' +
        '<a href="#/s/works"><i>01</i>作品<b>' + works + '</b></a>' +
        '<a href="#/s/skills"><i>02</i>能力<b>' + meters + '</b></a>' +
        '<a href="#/s/study"><i>03</i>经历<b>' + timeline + '</b></a>' +
        '<a href="#/s/hobbies"><i>04</i>爱好<b>' + hobbies + '</b></a>' +
        '<a href="#/s/contact"><i>05</i>找我<b>↗</b></a>' +
        '<a class="hx-archive" href="./archive.html"><i>06</i>档案<b>一页</b></a>' +
      '</nav>';
    return box;
  }

  function ensureHeroExtra() {
    var header = $("header");
    if (!header) return;
    var fb = document.getElementById("static-fallback");
    if (fb) fb.remove();
    var existing = $all("#hero-extra");
    if (existing.length > 1) {
      for (var i = 1; i < existing.length; i++) existing[i].remove();
    }
    if (!$("#hero-extra")) {
      header.insertBefore(buildHeroExtra(), header.lastElementChild);
    }
  }

  /* ---------- 作品：为什么做 / 卡在哪（直接展示，不折叠） ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function enhanceWorks() {
    var dock = $(".dock");
    if (!dock) return;
    var works = data.works || [];
    $all(".wrow", dock).forEach(function (row) {
      if (row.querySelector(".wrow-note")) return;
      var title = row.querySelector("h3");
      if (!title) return;
      var work = works.filter(function (w) { return w.name === title.textContent.trim(); })[0];
      if (!work || !work.note) return;
      var body = row.lastElementChild;
      if (!body) return;
      var p = document.createElement("p");
      p.className = "wrow-note";
      p.textContent = work.note;
      body.appendChild(p);
    });
  }

  /* ---------- 焦点与状态 ---------- */
  function setState() {
    var key = sectionKey();
    var focused = !!key;
    document.body.classList.toggle("is-focused", focused);
    document.body.classList.toggle("is-admin", isAdmin());

    if (focused && !lastPlanet) {
      lastPlanet = $all(".planet").filter(function (p) {
        return (p.getAttribute("aria-label") || "").indexOf(SECTIONS[key]) === 0;
      })[0] || null;
    }

    var dock = $(".dock");
    if (dock) {
      dock.setAttribute("tabindex", "-1");
      dock.setAttribute("role", "dialog");
      dock.setAttribute("aria-modal", "false");
      if (key) dock.setAttribute("aria-label", SECTIONS[key] + "面板");
      $all("button", dock).forEach(function (b) {
        if (!b.getAttribute("aria-label") && !(b.textContent || "").trim()) {
          b.setAttribute("aria-label", "关闭面板");
        }
      });
    }

    $all(".planet").forEach(function (p) {
      p.tabIndex = focused ? -1 : 0;
      var on = focused && p === lastPlanet;
      p.setAttribute("aria-expanded", on ? "true" : "false");
    });

    if (focused) {
      document.title = SECTIONS[key] + " · 张镓文";
      var target = dock;
      if (target) {
        window.setTimeout(function () {
          if (sectionKey()) target.focus({ preventScroll: true });
        }, reduce ? 0 : 480);
      }
    } else {
      document.title = "张镓文 · 星系";
      if (wasFocused && lastPlanet && !isAdmin()) {
        lastPlanet.focus({ preventScroll: true });
      }
    }
    wasFocused = focused;
  }

  /* ---------- 事件 ---------- */
  document.addEventListener("pointerdown", function (e) {
    var p = e.target.closest && e.target.closest(".planet");
    if (p) lastPlanet = p;
  }, true);

  document.addEventListener("focusin", function (e) {
    var p = e.target.closest && e.target.closest(".planet");
    if (p) lastPlanet = p;
  }, true);

  document.addEventListener("click", function (e) {
    var p = e.target.closest && e.target.closest(".planet");
    if (p) lastPlanet = p;
  }, true);

  window.addEventListener("hashchange", function () {
    setState();
    window.setTimeout(enhanceWorks, 80);
  });

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

    if (KEYS[e.key] && !sectionKey() && !isAdmin()) {
      location.hash = "#/s/" + KEYS[e.key];
      e.preventDefault();
    }
    if (e.key === "0" && !sectionKey() && !isAdmin()) {
      location.href = "./archive.html";
      e.preventDefault();
    }
  });

  /* ---------- 启动 ---------- */
  function boot() {
    ensureHeroExtra();
    setState();
    enhanceWorks();
    var fb = document.getElementById("static-fallback");
    if (fb && $("header")) fb.remove();

    // React 重渲染后补回首屏信息层（去重，防循环）
    if (window.MutationObserver) {
      var pending = false;
      var mo = new MutationObserver(function () {
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(function () {
          pending = false;
          ensureHeroExtra();
          enhanceWorks();
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // React 挂载可能晚于 DOMContentLoaded，轮询几次
  var tries = 0;
  var timer = window.setInterval(function () {
    tries++;
    ensureHeroExtra();
    enhanceWorks();
    if (sectionKey() && !$(".dock")) setState();
    var ready = $("header") && (!sectionKey() || $(".dock"));
    if (ready || tries > 40) window.clearInterval(timer);
  }, 120);
})();
