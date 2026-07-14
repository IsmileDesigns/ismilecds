/* hero-fx.js — amber particle + geometric animation for service hero banners */
(function () {

  /* inject styles immediately (head always exists) */
  var s = document.createElement('style');
  s.textContent =
    '.hfx-c{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;}' +
    '.hfx-bg{position:absolute;inset:-60%;width:220%;height:220%;pointer-events:none;z-index:0;' +
      'background:radial-gradient(ellipse 30% 30% at 50% 50%,rgba(251,169,44,0.09) 0%,rgba(251,169,44,0.03) 40%,transparent 70%);' +
      'animation:hfx-drift 20s ease-in-out infinite alternate;}' +
    '@keyframes hfx-drift{' +
      '0%  {transform:translate(-28%,-18%) scale(1.05);}' +
      '33% {transform:translate(22%,12%)   scale(0.92);}' +
      '66% {transform:translate(-8%,28%)   scale(1.08);}' +
      '100%{transform:translate(18%,-22%)  scale(0.96);}}';
  document.head.appendChild(s);

  /* everything else waits for the DOM to be fully parsed */
  function init() {

    /* ── find hero ─────────────────────────────────────────── */
    function q(sel) { return document.querySelector(sel); }

    var target = (function () {
      var bi = q('.bi-hero');
      if (bi) {
        var r = q('.bi-hero-right');
        if (r) { r.style.position = 'relative'; r.style.overflow = 'hidden'; return r; }
        return bi;
      }
      return q('.dm-hero') || q('.bc-hero') || q('.l-hero') ||
             q('.sa-hero') || q('.wd-hero');
    })();

    if (!target) return;

    /* ── inject glow div + canvas ──────────────────────────── */
    var bg = document.createElement('div');
    bg.className = 'hfx-bg';
    target.insertBefore(bg, target.firstChild);

    var cv = document.createElement('canvas');
    cv.className = 'hfx-c';
    target.insertBefore(cv, target.firstChild);

    /* push all original children above the canvas */
    Array.prototype.slice.call(target.children).forEach(function (el) {
      if (el === cv || el === bg) return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      var zi = parseInt(el.style.zIndex, 10);
      if (isNaN(zi) || zi < 1) el.style.zIndex = '1';
    });

    /* ── animation ─────────────────────────────────────────── */
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, parts = [], shapes = [];

    function rnd(a, b) { return a + Math.random() * (b - a); }

    function resize() {
      W = cv.width  = target.offsetWidth;
      H = cv.height = target.offsetHeight;
      if (W > 0 && H > 0) { spawnParts(); spawnShapes(); }
    }

    function spawnParts() {
      parts = [];
      for (var i = 0; i < 45; i++) {
        parts.push({
          x: rnd(0, W), y: rnd(0, H),
          vx: rnd(-0.22, 0.22), vy: rnd(-0.42, -0.14),
          r: rnd(0.8, 2.4), a: rnd(0.14, 0.52),
          ph: rnd(0, Math.PI * 2),
        });
      }
    }

    function mkShape(type, sz) {
      return {
        type: type, size: sz,
        x: rnd(0, W), y: rnd(0, H),
        angle: rnd(0, Math.PI * 2),
        rot: rnd(0.0006, 0.0028) * (Math.random() > 0.5 ? 1 : -1),
        vx: rnd(-0.14, 0.14), vy: rnd(-0.14, 0.14),
        a: rnd(0.04, 0.12),
      };
    }

    function spawnShapes() {
      shapes = [];
      for (var i = 0; i < 3; i++) shapes.push(mkShape('tri',   rnd(28, 80)));
      for (var i = 0; i < 2; i++) shapes.push(mkShape('dia',   rnd(22, 65)));
      for (var i = 0; i < 3; i++) shapes.push(mkShape('ring',  rnd(50, 130)));
      for (var i = 0; i < 2; i++) shapes.push(mkShape('cross', rnd(18, 42)));
      for (var i = 0; i < 3; i++) shapes.push(mkShape('line',  rnd(40, 100)));
    }

    function wrapXY(o) {
      var m = 180;
      if (o.x < -m) o.x = W + m; if (o.x > W + m) o.x = -m;
      if (o.y < -m) o.y = H + m; if (o.y > H + m) o.y = -m;
    }

    function drawShape(o) {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.rotate(o.angle);
      ctx.strokeStyle = 'rgba(251,169,44,' + o.a + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      var z = o.size;
      switch (o.type) {
        case 'tri':
          ctx.moveTo(0, -z); ctx.lineTo(z * 0.866, z * 0.5); ctx.lineTo(-z * 0.866, z * 0.5);
          ctx.closePath(); break;
        case 'dia':
          ctx.moveTo(0, -z); ctx.lineTo(z * 0.58, 0); ctx.lineTo(0, z); ctx.lineTo(-z * 0.58, 0);
          ctx.closePath(); break;
        case 'ring':
          ctx.arc(0, 0, z, 0, Math.PI * 2); break;
        case 'cross':
          ctx.moveTo(-z, 0); ctx.lineTo(z, 0);
          ctx.moveTo(0, -z); ctx.lineTo(0, z); break;
        case 'line':
          ctx.moveTo(-z, 0); ctx.lineTo(z, 0); break;
      }
      ctx.stroke();
      ctx.restore();
    }

    function frame(ts) {
      ctx.clearRect(0, 0, W, H);

      /* moving radial glow */
      var gx = W * (0.35 + 0.28 * Math.sin(ts * 0.00021));
      var gy = H * (0.50 + 0.22 * Math.cos(ts * 0.00017));
      var gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, W * 0.52);
      gr.addColorStop(0, 'rgba(251,169,44,0.06)');
      gr.addColorStop(1, 'rgba(251,169,44,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);

      /* shapes */
      for (var i = 0; i < shapes.length; i++) {
        var o = shapes[i];
        o.angle += o.rot; o.x += o.vx; o.y += o.vy;
        wrapXY(o); drawShape(o);
      }

      /* particles + connections */
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx + Math.sin(ts * 0.00048 + p.ph) * 0.07;
        p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = rnd(0, W); }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;

        for (var j = i + 1; j < parts.length; j++) {
          var q = parts[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 14400) {
            var d = Math.sqrt(d2);
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(251,169,44,' + (0.08 * (1 - d / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251,169,44,' + p.a + ')';
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    resize();
    if (W > 0 && H > 0) requestAnimationFrame(frame);
  }

  /* wait for full DOM parse before touching hero elements */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
