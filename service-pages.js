(function () {
  "use strict";

  var page = document.querySelector(".service-page");
  if (!page) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.documentElement.classList.add("service-motion");

  function animateHandwrittenLabels() {
    var labels = document.querySelectorAll(
      ".svc-tag, .svc-label, .svc-faq-eyebrow, .svc-cta-label, .svc-switcher-label"
    );

    labels.forEach(function (label) {
      if (label.dataset.handAnimated === "true") return;
      var copy = label.textContent.trim();
      if (!copy) return;

      label.dataset.handAnimated = "true";
      label.setAttribute("aria-label", copy);
      label.textContent = "";

      Array.from(copy).forEach(function (character, index) {
        if (character === " ") {
          label.appendChild(document.createTextNode(" "));
          return;
        }

        var letter = document.createElement("span");
        letter.className = "service-hand-char";
        letter.setAttribute("aria-hidden", "true");
        letter.style.setProperty("--char-index", index);
        letter.textContent = character;
        label.appendChild(letter);
      });
    });
  }

  function observeReveals() {
    var items = document.querySelectorAll(".svc-stat, .svc-switcher");
    if (!("IntersectionObserver" in window) || reduceMotion.matches) {
      items.forEach(function (item) { item.classList.add("is-in-view"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in-view");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -5%" });

    items.forEach(function (item) { observer.observe(item); });
  }

  function addCardLight() {
    if (reduceMotion.matches || window.matchMedia("(pointer: coarse)").matches) return;

    document.querySelectorAll(".svc-card").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--pointer-x", (event.clientX - rect.left) + "px");
        card.style.setProperty("--pointer-y", (event.clientY - rect.top) + "px");
      });
    });
  }

  function addHeroParallax() {
    if (reduceMotion.matches) return;

    var hero = document.querySelector(".svc-hero");
    var art = document.querySelector(".svc-hero-art");
    var word = document.querySelector(".svc-art-word");
    var orbit = document.querySelector(".svc-art-orbit");
    if (!hero || !art || !word || !orbit) return;

    var pointerX = 0;
    var pointerY = 0;
    var currentX = 0;
    var currentY = 0;
    var scrollProgress = 0;
    var frameRequested = false;

    function paint() {
      frameRequested = false;
      currentX += (pointerX - currentX) * 0.075;
      currentY += (pointerY - currentY) * 0.075;
      word.style.setProperty("--art-x", (currentX * -18).toFixed(2) + "px");
      word.style.setProperty("--art-y", ((currentY * -12) + (scrollProgress * 44)).toFixed(2) + "px");
      orbit.style.setProperty("--orbit-turn", ((currentX * 7) + (scrollProgress * 42)).toFixed(2) + "deg");

      if (Math.abs(pointerX - currentX) > 0.002 || Math.abs(pointerY - currentY) > 0.002) {
        requestFrame();
      }
    }

    function requestFrame() {
      if (frameRequested) return;
      frameRequested = true;
      window.requestAnimationFrame(paint);
    }

    art.addEventListener("pointermove", function (event) {
      var rect = art.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - 0.5;
      pointerY = (event.clientY - rect.top) / rect.height - 0.5;
      requestFrame();
    });

    art.addEventListener("pointerleave", function () {
      pointerX = 0;
      pointerY = 0;
      requestFrame();
    });

    window.addEventListener("scroll", function () {
      var rect = hero.getBoundingClientRect();
      scrollProgress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
      requestFrame();
    }, { passive: true });
  }

  animateHandwrittenLabels();
  observeReveals();
  addCardLight();
  addHeroParallax();
})();
