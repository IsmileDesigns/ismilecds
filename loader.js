/* ismile loader — drop <script src="loader.js"></script> in every page <head> */
(function () {
  /* ── inject styles ── */
  var css = document.createElement('style');
  css.textContent = [
    '#isl{position:fixed;inset:0;z-index:99999;background:#1A1410;overflow:hidden;',
    'transition:opacity 0.6s cubic-bezier(0.4,0,0.2,1);}',

    '#isl-label{position:absolute;top:32px;left:32px;',
    'font-family:"Assistant",sans-serif;font-size:11px;font-weight:400;',
    'letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.4);',
    'opacity:0;transform:translateY(-20px);',
    'transition:opacity 0.6s ease 0.1s,transform 0.6s ease 0.1s;}',

    '@media(min-width:768px){#isl-label{top:48px;left:48px;font-size:12px;}}',

    '#isl-word-wrap{position:absolute;inset:0;display:flex;align-items:center;',
    'justify-content:center;pointer-events:none;}',

    '#isl-word{font-family:"Bebas Neue",sans-serif;font-size:clamp(48px,9vw,96px);',
    'letter-spacing:0.04em;color:rgba(255,255,255,0.8);',
    'opacity:0;transform:translateY(20px);',
    'transition:opacity 0.4s cubic-bezier(0.4,0,0.2,1),',
    'transform 0.4s cubic-bezier(0.4,0,0.2,1);}',

    '#isl-counter{position:absolute;bottom:32px;right:32px;',
    'font-family:"Bebas Neue",sans-serif;font-size:clamp(72px,12vw,120px);',
    'letter-spacing:0.02em;color:#FFFFFF;line-height:1;',
    'opacity:0;transform:translateY(20px);',
    'transition:opacity 0.6s ease 0.1s,transform 0.6s ease 0.1s;}',

    '@media(min-width:768px){#isl-counter{bottom:48px;right:48px;}}',

    '#isl-bar-track{position:absolute;bottom:0;left:0;right:0;height:3px;',
    'background:rgba(255,255,255,0.06);}',

    '#isl-bar-fill{height:100%;width:0%;transform-origin:left;',
    'background:linear-gradient(90deg,#FBA92C 0%,#ffc04d 100%);',
    'box-shadow:0 0 8px rgba(251,169,44,0.4);',
    'transition:width 0.1s linear;}',
  ].join('');
  document.head.appendChild(css);

  /* ── build DOM ── */
  var root = document.createElement('div');
  root.id = 'isl';

  var label = document.createElement('div');
  label.id = 'isl-label';
  label.textContent = 'ismile.';

  var wordWrap = document.createElement('div');
  wordWrap.id = 'isl-word-wrap';
  var word = document.createElement('span');
  word.id = 'isl-word';
  wordWrap.appendChild(word);

  var counter = document.createElement('div');
  counter.id = 'isl-counter';
  counter.textContent = '000';

  var barTrack = document.createElement('div');
  barTrack.id = 'isl-bar-track';
  var barFill = document.createElement('div');
  barFill.id = 'isl-bar-fill';
  barTrack.appendChild(barFill);

  root.appendChild(label);
  root.appendChild(wordWrap);
  root.appendChild(counter);
  root.appendChild(barTrack);

  /* ── hide page content immediately ── */
  var bodyStyle = document.createElement('style');
  bodyStyle.id = 'isl-body-hide';
  bodyStyle.textContent = 'body > *:not(#isl){opacity:0!important;transition:opacity 0.5s ease-out;}';
  document.head.appendChild(bodyStyle);

  /* ── mount after DOM is ready ── */
  function mount() {
    document.body.insertBefore(root, document.body.firstChild);

    /* entrance animations — next frame so transitions fire */
    requestAnimationFrame(function () {
      label.style.opacity = '1';
      label.style.transform = 'translateY(0)';
      counter.style.opacity = '1';
      counter.style.transform = 'translateY(0)';
    });

    /* cycling words */
    var words = ['DESIGN', 'CREATE', 'INSPIRE'];
    var wordIndex = 0;

    function showWord(idx) {
      /* exit current */
      word.style.opacity = '0';
      word.style.transform = 'translateY(-20px)';
      setTimeout(function () {
        word.textContent = words[idx];
        /* enter next */
        requestAnimationFrame(function () {
          word.style.opacity = '1';
          word.style.transform = 'translateY(0)';
        });
      }, 400);
    }

    showWord(0);

    var wordTimer = setInterval(function () {
      wordIndex += 1;
      if (wordIndex >= words.length) {
        clearInterval(wordTimer);
        return;
      }
      showWord(wordIndex);
    }, 900);

    /* progress counter — 2700ms duration */
    var DURATION = 2700;
    var startTime = null;

    function tick(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var pct = Math.min(elapsed / DURATION * 100, 100);

      counter.textContent = Math.round(pct).toString().padStart(3, '0');
      barFill.style.width = pct + '%';

      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        /* done — wait 400ms then dismiss */
        setTimeout(dismiss, 400);
      }
    }

    requestAnimationFrame(tick);
  }

  function dismiss() {
    /* fade loader out */
    root.style.opacity = '0';
    root.style.pointerEvents = 'none';

    /* reveal page content */
    var hideStyle = document.getElementById('isl-body-hide');
    if (hideStyle) hideStyle.parentNode.removeChild(hideStyle);

    setTimeout(function () {
      if (root.parentNode) root.parentNode.removeChild(root);
    }, 650);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
