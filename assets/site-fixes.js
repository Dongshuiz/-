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
      // 挂在 body 上，避免 header 的 transform 让 fixed 定位短暂失效
      document.body.appendChild(buildHeroExtra());
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
    setupPublish();

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

  /* ---------- 发布到 GitHub ---------- */
  var GH_REPO = "Dongshuiz/-";
  var GH_PATH = "content.json";

  function b64utf8(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function setupPublish() {
    var existing = document.getElementById("publish-btn");
    if (!isAdmin()) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    var btn = document.createElement("button");
    btn.id = "publish-btn";
    btn.type = "button";
    btn.textContent = "发布到线上";
    btn.title = "把当前内容提交到 GitHub；访客约 1 分钟后看到";
    btn.addEventListener("click", function () { publish(btn); });
    document.body.appendChild(btn);
  }

  async function publish(btn) {
    var raw = localStorage.getItem("zjw-orbit-site-v2");
    if (!raw) {
      alert("没有可发布的内容。先在控制舱里改点什么。");
      return;
    }
    var data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      alert("内容解析失败。");
      return;
    }

    // 后台表单没有 story / note，发布时从当前构建内容里补齐，避免丢字段
    var base = window.SITE_CONTENT || {};
    (data.works || []).forEach(function (w) {
      var s = (base.works || []).filter(function (x) {
        return x.id === w.id || x.name === w.name;
      })[0];
      if (s) {
        ["story", "note", "role", "period", "detail"].forEach(function (k) {
          if (!w[k] && s[k]) w[k] = s[k];
        });
      }
    });

    var token = localStorage.getItem("zjw-gh-token");
    if (!token) {
      token = prompt("填一次 GitHub token（fine-grained，只勾这个仓库的 Contents: Read and write）：");
      if (!token) return;
      localStorage.setItem("zjw-gh-token", token.trim());
    }

    var version = new Date().toISOString();
    data.version = version;
    var api = "https://api.github.com/repos/" + GH_REPO + "/contents/" + GH_PATH;
    btn.disabled = true;
    btn.textContent = "发布中…";

    try {
      var headers = {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github+json"
      };
      var get = await fetch(api, { headers: headers });
      var sha = null;
      if (get.status === 404) {
        sha = null;
      } else if (get.ok) {
        sha = (await get.json()).sha;
      } else {
        throw new Error(get.status === 401 ? "token 无效或没有权限" : "读取 content.json 失败：" + get.status);
      }

      var body = {
        message: "content: publish " + version,
        content: b64utf8(JSON.stringify(data, null, 2)),
        branch: "main"
      };
      if (sha) body.sha = sha;

      var put = await fetch(api, {
        method: "PUT",
        headers: Object.assign({ "Content-Type": "application/json" }, headers),
        body: JSON.stringify(body)
      });
      if (put.status === 401 || put.status === 403) {
        localStorage.removeItem("zjw-gh-token");
        throw new Error("token 无效或没有权限，请重新填");
      }
      if (!put.ok) throw new Error("提交失败：" + put.status);

      localStorage.setItem("zjw-remote-version", version);
      btn.textContent = "已发布";
      alert("已提交到 GitHub。等 Pages 构建完（约 1 分钟），访客刷新就能看到。");
      window.setTimeout(function () {
        btn.disabled = false;
        btn.textContent = "发布到线上";
      }, 2600);
    } catch (e) {
      btn.disabled = false;
      btn.textContent = "发布到线上";
      alert("发布失败：" + e.message);
    }
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
