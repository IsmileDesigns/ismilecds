/* Ismile amber stepped page transition. Include once in each page <head>. */
(function () {
  if (window.__ismileTransitionInit) return;
  window.__ismileTransitionInit = true;

  var AMBER = "#FBA92C";
  var PANEL_COUNT = 5;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isNavigating = false;

  var css = document.createElement("style");
  css.textContent = [
    "#ismile-transition{position:fixed;inset:0;z-index:100000;display:grid;",
    "grid-template-columns:repeat(" + PANEL_COUNT + ",1fr);overflow:hidden;pointer-events:all;}",
    ".ismile-transition-panel{position:relative;width:100%;height:105%;background:" + AMBER + ";",
    "transform:translate3d(0,0,0);will-change:transform;",
    "transition:transform .62s cubic-bezier(.76,0,.24,1);}",
    "#ismile-transition.is-entering .ismile-transition-panel{transform:translate3d(0,105%,0);}",
    "#ismile-transition.is-leaving .ismile-transition-panel{transform:translate3d(0,-105%,0);}",
    "#ismile-transition-logo{position:absolute;z-index:2;left:50%;top:50%;",
    "width:clamp(180px,22vw,360px);height:auto;transform:translate(-50%,-50%) scale(.94);",
    "filter:brightness(0);opacity:0;will-change:transform,opacity;",
    "transition:opacity .24s ease,transform .52s cubic-bezier(.2,.75,.25,1);}",
    "#ismile-transition.logo-visible #ismile-transition-logo{opacity:1;transform:translate(-50%,-50%) scale(1);}",
    "#ismile-transition.logo-exiting #ismile-transition-logo{opacity:0;transform:translate(-50%,-54%) scale(.97);}",
    "#ismile-transition::after{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.08;",
    "background-image:url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E\");",
    "mix-blend-mode:multiply;}",
    "@media(max-width:640px){#ismile-transition-logo{width:min(58vw,250px);}}",
    "@media(prefers-reduced-motion:reduce){.ismile-transition-panel,#ismile-transition-logo{transition-duration:.01ms!important;}}"
  ].join("");
  document.head.appendChild(css);

  var hideStyle = document.createElement("style");
  hideStyle.id = "ismile-transition-hide";
  hideStyle.textContent = "body > *:not(#ismile-transition){opacity:0!important;}";
  document.head.appendChild(hideStyle);

  function buildTransition(mode) {
    var previous = document.getElementById("ismile-transition");
    if (previous) previous.remove();

    var root = document.createElement("div");
    root.id = "ismile-transition";
    root.setAttribute("aria-hidden", "true");
    if (mode === "enter") root.classList.add("is-entering");

    for (var i = 0; i < PANEL_COUNT; i += 1) {
      var panel = document.createElement("div");
      panel.className = "ismile-transition-panel";
      panel.style.transitionDelay = (i * 70) + "ms";
      root.appendChild(panel);
    }

    var logo = document.createElement("img");
    logo.id = "ismile-transition-logo";
    logo.src = "./logo-white-new.png";
    logo.alt = "";
    logo.width = 713;
    logo.height = 395;
    root.appendChild(logo);
    document.body.appendChild(root);
    return root;
  }

  function revealPage() {
    var root = buildTransition("covered");
    var pageHide = document.getElementById("ismile-transition-hide");

    window.requestAnimationFrame(function () {
      root.classList.add("logo-visible");
    });

    window.setTimeout(function () {
      if (pageHide) pageHide.remove();
      root.classList.add("logo-exiting");
      root.classList.add("is-leaving");
    }, reducedMotion ? 40 : 620);

    window.setTimeout(function () {
      root.remove();
    }, reducedMotion ? 80 : 1320);
  }

  function transitionTo(url) {
    if (isNavigating) return;
    isNavigating = true;
    var root = buildTransition("enter");
    var panels = root.querySelectorAll(".ismile-transition-panel");

    panels.forEach(function (panel, index) {
      panel.style.transitionDelay = ((PANEL_COUNT - index - 1) * 70) + "ms";
    });

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        root.classList.remove("is-entering");
      });
    });

    window.setTimeout(function () {
      root.classList.add("logo-visible");
    }, reducedMotion ? 10 : 540);

    window.setTimeout(function () {
      window.location.href = url;
    }, reducedMotion ? 40 : 940);
  }

  function eligibleLink(event, anchor) {
    if (!anchor || event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (anchor.target && anchor.target !== "_self") return false;
    if (anchor.hasAttribute("download")) return false;

    var rawHref = anchor.getAttribute("href");
    if (!rawHref || rawHref.charAt(0) === "#") return false;
    if (/^(mailto:|tel:|javascript:)/i.test(rawHref)) return false;

    var destination;
    try { destination = new URL(anchor.href, window.location.href); } catch (error) { return false; }
    if (destination.origin !== window.location.origin) return false;
    if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return false;
    return destination.href;
  }

  document.addEventListener("click", function (event) {
    var anchor = event.target.closest("a");
    var destination = eligibleLink(event, anchor);
    if (!destination) return;
    event.preventDefault();
    transitionTo(destination);
  });

  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    isNavigating = false;
    var existing = document.getElementById("ismile-transition");
    if (existing) existing.remove();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", revealPage, { once: true });
  } else {
    revealPage();
  }
})();
