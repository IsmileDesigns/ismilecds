(function () {
  function closeMenu(navLinks, button) {
    navLinks.classList.remove("open");
    document.body.classList.remove("theme-menu-open");
    button.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open menu");
    navLinks.querySelectorAll(".nav-dropdown.open").forEach(function (dropdown) {
      dropdown.classList.remove("open");
    });
    navLinks.querySelectorAll(".nav-dropdown-toggle.open").forEach(function (toggle) {
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  function enhanceMenu() {
    var nav = document.getElementById("nav");
    var navLinks = document.getElementById("navLinks");
    var button = document.getElementById("navHamburger");
    if (!nav || !navLinks || !button || navLinks.classList.contains("is-enhanced")) return;

    var originalItems = Array.prototype.slice.call(navLinks.children);
    var visual = document.createElement("li");
    var content = document.createElement("li");
    var primary = document.createElement("ul");
    var footer = document.createElement("div");

    visual.className = "theme-menu-visual";
    visual.setAttribute("aria-hidden", "true");
    visual.innerHTML = '<img src="./menutype.jpg" alt="" width="2752" height="1536" />';

    content.className = "theme-menu-content";
    primary.className = "theme-menu-primary";

    originalItems.forEach(function (item) {
      var directLink = item.querySelector(":scope > a");
      if (directLink && directLink.textContent.trim() === "Portfolio") directLink.textContent = "Works";
      primary.appendChild(item);
    });

    var servicesToggle = primary.querySelector(".nav-dropdown-toggle");
    if (servicesToggle) {
      servicesToggle.innerHTML = '<span class="theme-menu-plus" aria-hidden="true">+</span>';
      servicesToggle.setAttribute("aria-label", "Show service pages");
    }

    footer.className = "theme-menu-footer";
    footer.innerHTML =
      '<div><p class="theme-menu-label">Follow us</p><div class="theme-menu-socials">' +
      '<a href="https://www.instagram.com/ismilecds">Instagram</a>' +
      '<a href="https://www.behance.net/IsmileDesigns">Behance</a></div></div>' +
      '<div><p class="theme-menu-label">Reach out</p>' +
      '<a class="theme-menu-email" href="mailto:hello@byismile.com">hello@byismile.com</a></div>';

    content.appendChild(primary);
    content.appendChild(footer);
    navLinks.appendChild(visual);
    navLinks.appendChild(content);
    navLinks.classList.add("is-enhanced");
    navLinks.setAttribute("aria-label", "Site menu");

    /* Keep the inner-page drawer identical to the homepage even when an older
       cached stylesheet is still present. The phone drawer remains full width. */
    var phoneMenu = window.matchMedia("(max-width: 760px)");
    function syncDrawerSize() {
      if (phoneMenu.matches) {
        navLinks.style.removeProperty("width");
        navLinks.style.removeProperty("grid-template-columns");
      } else {
        navLinks.style.setProperty("width", "calc(50vw - 20px)");
        navLinks.style.setProperty("grid-template-columns", "36% 64%");
      }
    }
    syncDrawerSize();
    if (phoneMenu.addEventListener) phoneMenu.addEventListener("change", syncDrawerSize);
    else phoneMenu.addListener(syncDrawerSize);

    button.addEventListener("click", function () {
      window.requestAnimationFrame(function () {
        var isOpen = navLinks.classList.contains("open");
        document.body.classList.toggle("theme-menu-open", isOpen);
        button.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      });
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { closeMenu(navLinks, button); });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navLinks.classList.contains("open")) closeMenu(navLinks, button);
    });

    document.addEventListener("pointerdown", function (event) {
      if (!navLinks.classList.contains("open")) return;
      if (!navLinks.contains(event.target) && !button.contains(event.target)) closeMenu(navLinks, button);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceMenu);
  } else {
    enhanceMenu();
  }
})();
