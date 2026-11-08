/* 档案版：从 content.json 取最新内容，覆盖静态段落。没有 content.json 就保留静态内容。 */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function bar(v) {
    var n = Math.round(Math.max(0, Math.min(100, v)) / 100 * 24);
    var out = "";
    for (var i = 0; i < 24; i++) out += i < n ? '<i class="on"></i>' : "<i></i>";
    return out;
  }

  function render(data) {
    var works = data.works || [];
    var awards = data.awards || [];
    var meters = data.meters || [];
    var timeline = data.timeline || [];
    var hobbies = data.hobbies || [];
    var links = data.links || [];
    var profile = data.profile || {};

    /* 首屏成绩 */
    var proof = document.querySelector(".hero .proof");
    if (proof) {
      proof.innerHTML =
        "<li>GPA 3.7 / 4.0</li><li>校程序赛三等奖</li><li>CET-6 528</li><li>" +
        works.length + " 个上线作品</li>";
    }
    var lede = document.querySelector(".hero .lede");
    if (lede && profile.oneLiner) lede.textContent = profile.oneLiner;

    /* 作品 */
    var worksSec = document.getElementById("works");
    if (worksSec) {
      var note = worksSec.querySelector(".section-note");
      worksSec.querySelectorAll(".work").forEach(function (n) { n.remove(); });
      var html = works.map(function (w, i) {
        var no = String(i + 1).padStart(2, "0");
        var href = w.tool ? "./#/s/works/" + encodeURIComponent(w.tool) : "./";
        var label = w.tool ? "打开工具" : "打开星系";
        return (
          '<article class="work">' +
            '<figure><span class="idx">' + no + " / " + String(works.length).padStart(2, "0") + "</span>" +
              '<img src="' + esc(w.img) + '" width="640" height="420" decoding="async" alt="' + esc(w.name) + ' 的界面示意图"></figure>' +
            '<div class="work-body">' +
              "<h3>" + esc(w.name) + "</h3>" +
              '<p class="meta"><span>' + esc(w.role || "设计 / 前端") + "</span><span>" + esc(w.period || "2026") + "</span><span>" + esc(w.stack) + "</span></p>" +
              (w.story ? '<div class="work-story"><p>' + esc(w.story) + "</p></div>" : "") +
              '<div class="links"><a href="' + href + '">' + label + " ↗</a>" +
              '<a href="https://github.com/Dongshuiz/-" target="_blank" rel="noopener">看仓库 ↗</a></div>' +
            "</div>" +
          "</article>"
        );
      }).join("");
      if (note) note.insertAdjacentHTML("afterend", html);
      var meta = worksSec.querySelector(".section-head .meta");
      if (meta) meta.textContent = works.length + " 个 · 全上线";
    }

    /* 能力 */
    var awardsEl = document.querySelector("#skills .awards");
    if (awardsEl) {
      awardsEl.innerHTML = awards.map(function (a) {
        return '<li><span class="yr">' + esc(a.year) + '</span><div><h3>' + esc(a.name) + "</h3><p>" + esc(a.line) + "</p></div></li>";
      }).join("");
    }
    var metersEl = document.querySelector("#skills .meters");
    if (metersEl) {
      metersEl.innerHTML = meters.map(function (m) {
        return '<li><div class="row"><span class="name">' + esc(m.name) + '</span><span class="val">' + m.v + "</span></div>" +
          '<div class="bar" aria-hidden="true">' + bar(m.v) + "</div>" +
          (m.proof ? '<p class="proof">' + esc(m.proof) + "</p>" : "") + "</li>";
      }).join("");
    }

    /* 经历 */
    var tEl = document.querySelector("#study .timeline");
    if (tEl) {
      tEl.innerHTML = timeline.map(function (t) {
        return '<li><p class="period">' + esc(t.period) + "</p><h3>" + esc(t.title) + "</h3><p>" + esc(t.line) + "</p></li>";
      }).join("");
    }

    /* 爱好 */
    var hSec = document.getElementById("hobbies");
    if (hSec) {
      hSec.querySelectorAll(".hobby").forEach(function (n) { n.remove(); });
      var hNote = hSec.querySelector(".section-note");
      var hHtml = hobbies.map(function (h) {
        return '<article class="hobby"><figure><img src="' + esc(h.img) + '" width="760" height="556" decoding="async" alt="' + esc(h.name) + '"></figure>' +
          '<div class="hobby-body"><h3>' + esc(h.name) + "</h3><p>" + esc(h.line) + "</p></div></article>";
      }).join("");
      if (hNote) hNote.insertAdjacentHTML("afterend", hHtml);
    }

    /* 联系 */
    var mail = links.filter(function (l) { return l.label === "邮箱"; })[0];
    var big = document.querySelector("#contact .big");
    if (big && mail) {
      big.textContent = mail.value;
      big.href = mail.href;
    }
    var side = document.querySelector("#contact .side");
    if (side) {
      side.innerHTML = "<p>想聊项目？想看代码？都行。</p>" +
        links.filter(function (l) { return l.label !== "邮箱"; }).map(function (l) {
          return '<a href="' + esc(l.href) + '">' + esc(l.label) + " · " + esc(l.value) + " ↗</a>";
        }).join("");
    }
  }

  fetch("./content.json?ts=" + Date.now(), { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (d && d.works) render(d); })
    .catch(function () {});
})();
