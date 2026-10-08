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

      copy = copy.toLowerCase();
      label.dataset.handAnimated = "true";
      label.textContent = copy;
      label.classList.add("service-hand-label");
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

  animateHandwrittenLabels();
  observeReveals();
  addCardLight();
})();
