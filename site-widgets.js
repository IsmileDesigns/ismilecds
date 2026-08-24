/* ismile site-widgets.js
   Shared, site-wide script: GA4 (Consent Mode gated), cookie consent banner +
   preferences modal, and the sticky mobile "Book a Call" CTA bar.
   Include once per page: <script defer src="./site-widgets.js"></script>
*/
(function () {
  if (window.__ismileWidgetsInit) return;
  window.__ismileWidgetsInit = true;

  /* ───────────────────────── CONFIG ───────────────────────── */
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // TODO: replace with your real GA4 Measurement ID (analytics.google.com)
  var BOOKING_URL = 'https://calendar.app.google/oDUSa3P32YjHErMW8';
  var CONSENT_KEY = 'ismileCookieConsent';
  var AMBER = '#FBA92C';
  var WARM_BLACK = '#1A1410';

  /* ───────────────────────── GA4 / CONSENT MODE ───────────────────────── */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied' });

  function loadGA4() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  }

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch (e) { return null; }
  }
  function setConsent(analytics) {
    var record = { essential: true, analytics: !!analytics, timestamp: new Date().toISOString() };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(record)); } catch (e) {}
    return record;
  }

  var existingConsent = getConsent();
  if (existingConsent && existingConsent.analytics) loadGA4();

  /* ───────────────────────── SHARED STYLES ───────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '.ismile-sticky-cta{display:none}',
    '@media(max-width:640px){',
    '.ismile-sticky-cta{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:9998;',
    'padding:10px 14px;background:' + WARM_BLACK + ';border-top:1px solid rgba(255,255,255,0.1);',
    'gap:10px;align-items:center;box-shadow:0 -6px 18px rgba(0,0,0,0.35);}',
    '.ismile-sticky-cta a{flex:1;text-align:center;font-family:"Bebas Neue",sans-serif;',
    'font-size:15px;letter-spacing:0.08em;background:' + AMBER + ';color:' + WARM_BLACK + ';',
    'padding:13px 10px;border-radius:4px;text-decoration:none;}',
    '.ismile-sticky-cta a:active{background:#ffc04d}',
    'body.ismile-has-sticky-cta{padding-bottom:62px}',
    '}',

    '.ismile-cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:99997;',
    'background:' + WARM_BLACK + ';border-top:1px solid rgba(255,255,255,0.12);',
    'color:rgba(255,255,255,0.75);font-family:"Assistant",sans-serif;font-weight:300;',
    'padding:18px 24px;display:none;align-items:center;flex-wrap:wrap;gap:14px 20px;',
    'justify-content:space-between;}',
    '.ismile-cc-banner.open{display:flex}',
    '.ismile-cc-text{flex:1 1 320px;font-size:14px;line-height:1.6;margin:0}',
    '.ismile-cc-text a{color:' + AMBER + ';text-decoration:underline}',
    '.ismile-cc-actions{display:flex;gap:10px;flex-wrap:wrap}',
    '.ismile-cc-btn{font-family:"Assistant",sans-serif;font-size:13px;font-weight:600;',
    'letter-spacing:0.04em;padding:11px 18px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);',
    'background:transparent;color:#fff;cursor:pointer;white-space:nowrap;}',
    '.ismile-cc-btn.primary{background:' + AMBER + ';color:' + WARM_BLACK + ';border-color:' + AMBER + '}',
    '.ismile-cc-btn:hover{opacity:0.85}',

    '.ismile-cc-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99998;display:none}',
    '.ismile-cc-overlay.open{display:block}',
    '.ismile-cc-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;',
    'width:min(480px,90vw);max-height:85vh;overflow:auto;background:' + WARM_BLACK + ';',
    'border:1px solid rgba(255,255,255,0.14);border-radius:10px;padding:32px;display:none;',
    'font-family:"Assistant",sans-serif;color:rgba(255,255,255,0.75);}',
    '.ismile-cc-modal.open{display:block}',
    '.ismile-cc-modal h2{font-family:"Bebas Neue",sans-serif;letter-spacing:0.06em;',
    'font-size:24px;color:#fff;margin:0 0 16px}',
    '.ismile-cc-row{display:flex;align-items:center;justify-content:space-between;gap:16px;',
    'padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.08)}',
    '.ismile-cc-row-label{font-size:14px;font-weight:600;color:#fff;margin:0 0 4px}',
    '.ismile-cc-row-desc{font-size:13px;line-height:1.5;color:rgba(255,255,255,0.45);margin:0}',
    '.ismile-cc-switch{position:relative;width:42px;height:24px;flex-shrink:0}',
    '.ismile-cc-switch input{opacity:0;width:0;height:0}',
    '.ismile-cc-slider{position:absolute;inset:0;background:rgba(255,255,255,0.15);',
    'border-radius:24px;cursor:pointer;transition:background 0.2s}',
    '.ismile-cc-slider::before{content:"";position:absolute;width:18px;height:18px;left:3px;top:3px;',
    'background:#fff;border-radius:50%;transition:transform 0.2s}',
    '.ismile-cc-switch input:checked + .ismile-cc-slider{background:' + AMBER + '}',
    '.ismile-cc-switch input:checked + .ismile-cc-slider::before{transform:translateX(18px)}',
    '.ismile-cc-switch input:disabled + .ismile-cc-slider{opacity:0.5;cursor:not-allowed}',
    '.ismile-cc-modal-actions{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap}',
  ].join('');
  document.head.appendChild(style);

  /* ───────────────────────── STICKY MOBILE CTA ───────────────────────── */
  function buildStickyCTA() {
    if (document.querySelector('.ismile-sticky-cta')) return;
    var bar = document.createElement('div');
    bar.className = 'ismile-sticky-cta';
    bar.setAttribute('role', 'complementary');
    bar.setAttribute('aria-label', 'Quick contact');
    bar.innerHTML = '<a href="' + BOOKING_URL + '">BOOK A FREE CALL</a>';
    document.body.appendChild(bar);
    document.body.classList.add('ismile-has-sticky-cta');
  }

  /* ───────────────────────── COOKIE CONSENT UI ───────────────────────── */
  function buildCookieUI() {
    var overlay = document.createElement('div');
    overlay.className = 'ismile-cc-overlay';

    var banner = document.createElement('div');
    banner.className = 'ismile-cc-banner';
    banner.innerHTML =
      '<p class="ismile-cc-text">We use cookies to run this site and, with your permission, to understand traffic with Google Analytics. See our <a href="./cookie-policy.html">Cookie Policy</a> and <a href="./privacy-policy.html">Privacy Policy</a>.</p>' +
      '<div class="ismile-cc-actions">' +
        '<button type="button" class="ismile-cc-btn" data-cc="reject">Reject Non-Essential</button>' +
        '<button type="button" class="ismile-cc-btn" data-cc="prefs">Preferences</button>' +
        '<button type="button" class="ismile-cc-btn primary" data-cc="accept">Accept All</button>' +
      '</div>';

    var modal = document.createElement('div');
    modal.className = 'ismile-cc-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Cookie preferences');
    modal.innerHTML =
      '<h2>Cookie Preferences</h2>' +
      '<div class="ismile-cc-row">' +
        '<div><p class="ismile-cc-row-label">Essential</p><p class="ismile-cc-row-desc">Required for the site to function. Always on.</p></div>' +
        '<label class="ismile-cc-switch"><input type="checkbox" checked disabled/><span class="ismile-cc-slider"></span></label>' +
      '</div>' +
      '<div class="ismile-cc-row" style="border-bottom:none">' +
        '<div><p class="ismile-cc-row-label">Analytics</p><p class="ismile-cc-row-desc">Google Analytics (GA4) — helps us understand how visitors use the site. No data is sold.</p></div>' +
        '<label class="ismile-cc-switch"><input type="checkbox" id="ismileCcAnalytics"/><span class="ismile-cc-slider"></span></label>' +
      '</div>' +
      '<div class="ismile-cc-modal-actions">' +
        '<button type="button" class="ismile-cc-btn" data-cc="reject">Reject Non-Essential</button>' +
        '<button type="button" class="ismile-cc-btn primary" data-cc="save">Save Preferences</button>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(banner);
    document.body.appendChild(modal);

    function closeAll() {
      banner.classList.remove('open');
      modal.classList.remove('open');
      overlay.classList.remove('open');
    }
    function openBanner() { banner.classList.add('open'); }
    function openModal() {
      var current = getConsent();
      document.getElementById('ismileCcAnalytics').checked = !!(current && current.analytics);
      modal.classList.add('open');
      overlay.classList.add('open');
    }

    banner.addEventListener('click', function (e) {
      var action = e.target.getAttribute('data-cc');
      if (!action) return;
      if (action === 'accept') { setConsent(true); loadGA4(); closeAll(); }
      else if (action === 'reject') { setConsent(false); closeAll(); }
      else if (action === 'prefs') { banner.classList.remove('open'); openModal(); }
    });
    modal.addEventListener('click', function (e) {
      var action = e.target.getAttribute('data-cc');
      if (!action) return;
      if (action === 'save') {
        var wantsAnalytics = document.getElementById('ismileCcAnalytics').checked;
        setConsent(wantsAnalytics);
        if (wantsAnalytics) loadGA4();
        closeAll();
      } else if (action === 'reject') {
        setConsent(false);
        closeAll();
      }
    });
    overlay.addEventListener('click', closeAll);

    if (!getConsent()) openBanner();

    // Wire up any "Cookie Preferences" links in page footers.
    document.querySelectorAll('[data-cookie-prefs-trigger]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });

    window.ismileOpenCookiePreferences = openModal;
  }

  function init() {
    buildStickyCTA();
    buildCookieUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
