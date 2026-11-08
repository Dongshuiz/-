/* 档案版头图：p5.js 画的五条轨道。桌面端按需加载，手机端不下载。 */
(function () {
  var host = document.getElementById("orbit-canvas");
  if (!host) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 901px)").matches;
  if (!desktop || reduce) return;

  function init() {
    if (!window.p5) return;
    new p5(function (p) {
      var W = 0, H = 0, cx = 0, cy = 0;
      var planets = [
        { r: 0.30, sp: 0.20,  a: 0.4, col: [255, 106, 26], size: 9 },
        { r: 0.20, sp: -0.32, a: 2.1, col: [36, 224, 176], size: 6 },
        { r: 0.42, sp: 0.13,  a: 3.6, col: [255, 194, 75], size: 7 },
        { r: 0.50, sp: -0.09, a: 5.0, col: [255, 91, 114], size: 5 },
        { r: 0.57, sp: 0.07,  a: 0.9, col: [232, 226, 212], size: 4 }
      ];
      var RY = 0.46;

      function dims() {
        var b = host.getBoundingClientRect();
        W = Math.max(300, Math.round(b.width));
        H = Math.max(260, Math.round(b.height));
        cx = W * 0.5;
        cy = H * 0.52;
      }

      p.setup = function () {
        dims();
        var c = p.createCanvas(W, H);
        if (host.parentElement) host.parentElement.classList.add('has-p5');
        c.parent(host);
        p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
        p.noStroke();
      };

      p.windowResized = function () {
        dims();
        p.resizeCanvas(W, H);
      };

      p.draw = function () {
        p.clear();
        var ctx = p.drawingContext;

        var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.42);
        glow.addColorStop(0, "rgba(255,106,26,0.22)");
        glow.addColorStop(0.55, "rgba(255,106,26,0.06)");
        glow.addColorStop(1, "rgba(255,106,26,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        p.noFill();
        p.strokeWeight(1);
        for (var i = 0; i < planets.length; i++) {
          var o = planets[i];
          p.stroke(232, 226, 212, 26);
          p.ellipse(cx, cy, W * o.r * 2, W * o.r * 2 * RY);
        }

        var sunR = Math.max(18, W * 0.075);
        var sun = ctx.createRadialGradient(cx - sunR * 0.3, cy - sunR * 0.35, 1, cx, cy, sunR);
        sun.addColorStop(0, "#ffe0c4");
        sun.addColorStop(0.45, "#ff6a1a");
        sun.addColorStop(1, "#5c1c00");
        p.noStroke();
        p.fill(255, 106, 26, 30);
        p.circle(cx, cy, sunR * 3.2);
        ctx.fillStyle = sun;
        ctx.beginPath();
        ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
        ctx.fill();

        p.noStroke();
        for (var j = 0; j < planets.length; j++) {
          var pl = planets[j];
          pl.a += pl.sp * (p.deltaTime / 1000);
          var x = cx + Math.cos(pl.a) * W * pl.r;
          var y = cy + Math.sin(pl.a) * W * pl.r * RY;
          var col = pl.col;
          ctx.fillStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + ",0.16)";
          ctx.beginPath();
          ctx.arc(x, y, pl.size * 3.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgb(" + col[0] + "," + col[1] + "," + col[2] + ")";
          ctx.beginPath();
          ctx.arc(x, y, pl.size, 0, Math.PI * 2);
          ctx.fill();
        }
      };
    }, host);
  }

  var s = document.createElement("script");
  s.src = "./assets/vendor/p5.min.js";
  s.async = true;
  s.onload = init;
  document.head.appendChild(s);
})();
