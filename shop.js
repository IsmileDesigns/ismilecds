(function () {
  "use strict";

  const state = {
    products: [],
    filter: "All",
    cart: loadCart(),
    selected: null
  };
  const previewProducts = [
    { id: "brand-foundation-workbook", name: "Brand Foundation Workbook", eyebrow: "Strategy tool", description: "A focused workbook for defining your audience, position, brand promise, voice, and next best moves.", price_cents: 3900, compare_at_cents: 0, category: "Brand", image_url: "shop-assets/brand-foundation.webp", image_alt: "Black Ismile brand strategy workbook with ivory worksheets" },
    { id: "client-onboarding-os", name: "Client Onboarding OS", eyebrow: "Systems kit", description: "A clean client journey with intake prompts, kickoff checklists, handoff templates, and automation maps.", price_cents: 5900, compare_at_cents: 0, category: "Systems", image_url: "shop-assets/client-onboarding.webp", image_alt: "Ismile client onboarding process cards and black folder" },
    { id: "website-copy-prompt-deck", name: "Website Copy Prompt Deck", eyebrow: "Copy resource", description: "Sharp prompts and page-by-page guidance for writing a website that sounds human and moves people to act.", price_cents: 2900, compare_at_cents: 0, category: "Web", image_url: "shop-assets/copy-prompt-deck.webp", image_alt: "Ivory website copy prompt cards on a dark studio table" },
    { id: "content-planning-system", name: "No-Fluff Content Planner", eyebrow: "Marketing template", description: "A practical content system for turning one strong idea into a month of useful, on-brand marketing.", price_cents: 2400, compare_at_cents: 0, category: "Marketing", image_url: "shop-assets/content-planner.webp", image_alt: "Open ring-bound content planner with amber tabs" }
  ];
  const starterArtwork = {
    "brand-foundation-workbook": { old: ["branding.webp", "/branding.webp"], url: "/shop-assets/brand-foundation.webp", alt: "Black Ismile brand strategy workbook with ivory worksheets" },
    "client-onboarding-os": { old: ["systems.webp", "/systems.webp"], url: "/shop-assets/client-onboarding.webp", alt: "Ismile client onboarding process cards and black folder" },
    "website-copy-prompt-deck": { old: ["WebDesign.png", "/WebDesign.png"], url: "/shop-assets/copy-prompt-deck.webp", alt: "Ivory website copy prompt cards on a dark studio table" },
    "content-planning-system": { old: ["digitalmarketing.png", "/digitalmarketing.png"], url: "/shop-assets/content-planner.webp", alt: "Open ring-bound content planner with amber tabs" }
  };
  const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });
  const grid = document.getElementById("productGrid");
  const status = document.getElementById("catalogStatus");
  const template = document.getElementById("productTemplate");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartBackdrop = document.getElementById("cartBackdrop");
  const modal = document.getElementById("productModal");

  function loadCart() {
    try { return JSON.parse(localStorage.getItem("ismileShopCart")) || []; } catch { return []; }
  }

  function saveCart() {
    localStorage.setItem("ismileShopCart", JSON.stringify(state.cart));
    renderCart();
  }

  function formatPrice(cents) { return money.format((Number(cents) || 0) / 100); }

  function productById(id) { return state.products.find((product) => product.id === id); }

  function renderFilters() {
    const filters = document.getElementById("filters");
    const categories = ["All", ...new Set(state.products.map((product) => product.category).filter(Boolean))];
    filters.replaceChildren(...categories.map((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = category;
      button.setAttribute("aria-pressed", String(category === state.filter));
      button.addEventListener("click", () => { state.filter = category; renderFilters(); renderProducts(); });
      return button;
    }));
  }

  function renderProducts() {
    const products = state.filter === "All" ? state.products : state.products.filter((product) => product.category === state.filter);
    grid.replaceChildren(...products.map((product, index) => {
      const node = template.content.firstElementChild.cloneNode(true);
      const image = node.querySelector("img");
      image.src = product.image_url || "Ismile-bunny-branding.png";
      image.alt = product.image_alt || product.name;
      node.querySelector(".product-index").textContent = String(index + 1).padStart(2, "0");
      node.querySelector(".product-eyebrow").textContent = product.eyebrow || product.category;
      node.querySelector("h3").textContent = product.name;
      node.querySelector(".product-price").innerHTML = product.compare_at_cents > product.price_cents
        ? `<s>${formatPrice(product.compare_at_cents)}</s>${formatPrice(product.price_cents)}`
        : formatPrice(product.price_cents);
      node.querySelector(".product-visual").addEventListener("click", () => openProduct(product));
      node.querySelector(".product-add").addEventListener("click", () => addToCart(product.id));
      return node;
    }));
    status.textContent = products.length ? `${products.length} digital ${products.length === 1 ? "resource" : "resources"}` : "No products in this category yet.";
  }

  function addToCart(id) {
    const existing = state.cart.find((item) => item.id === id);
    if (existing) existing.quantity = Math.min(10, existing.quantity + 1);
    else state.cart.push({ id, quantity: 1 });
    saveCart();
    if (modal.open) modal.close();
    openCart();
  }

  function updateQuantity(id, change) {
    const item = state.cart.find((entry) => entry.id === id);
    if (!item) return;
    item.quantity = Math.max(0, Math.min(10, item.quantity + change));
    if (item.quantity === 0) state.cart = state.cart.filter((entry) => entry.id !== id);
    saveCart();
  }

  function renderCart() {
    state.cart = state.cart.filter((item) => productById(item.id));
    const count = state.cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById("cartCount").textContent = count;
    const items = document.getElementById("cartItems");
    items.replaceChildren(...state.cart.map((item) => {
      const product = productById(item.id);
      const row = document.createElement("article");
      row.className = "cart-item";
      row.innerHTML = `<img src="${escapeAttribute(product.image_url || "Ismile-bunny-branding.png")}" alt="" /><div><h3></h3><p>${formatPrice(product.price_cents)}</p><div class="cart-item-actions"><button type="button" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" aria-label="Increase quantity">+</button></div></div><button class="cart-remove" type="button" aria-label="Remove ${escapeAttribute(product.name)}">×</button>`;
      row.querySelector("h3").textContent = product.name;
      const quantityButtons = row.querySelectorAll(".cart-item-actions button");
      quantityButtons[0].addEventListener("click", () => updateQuantity(item.id, -1));
      quantityButtons[1].addEventListener("click", () => updateQuantity(item.id, 1));
      row.querySelector(".cart-remove").addEventListener("click", () => { state.cart = state.cart.filter((entry) => entry.id !== item.id); saveCart(); });
      return row;
    }));
    const hasItems = state.cart.length > 0;
    document.getElementById("cartEmpty").hidden = hasItems;
    document.getElementById("cartSummary").hidden = !hasItems;
    document.getElementById("cartTotal").textContent = `${formatPrice(state.cart.reduce((total, item) => total + productById(item.id).price_cents * item.quantity, 0))} CAD`;
  }

  function escapeAttribute(value) {
    return String(value || "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
  }

  function openCart() {
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.getElementById("cartTrigger").setAttribute("aria-expanded", "true");
    cartBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("cartClose").focus();
  }

  function closeCart() {
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.getElementById("cartTrigger").setAttribute("aria-expanded", "false");
    cartBackdrop.hidden = true;
    document.body.style.removeProperty("overflow");
  }

  function openProduct(product) {
    state.selected = product;
    const image = document.getElementById("modalImage");
    image.src = product.image_url || "Ismile-bunny-branding.png";
    image.alt = product.image_alt || product.name;
    document.getElementById("modalEyebrow").textContent = product.eyebrow || product.category;
    document.getElementById("modalName").textContent = product.name;
    document.getElementById("modalDescription").textContent = product.description;
    document.getElementById("modalPrice").textContent = formatPrice(product.price_cents);
    modal.showModal();
  }

  async function checkout() {
    const button = document.getElementById("checkoutButton");
    const output = document.getElementById("checkoutStatus");
    button.disabled = true;
    button.firstChild.textContent = "Opening checkout… ";
    output.textContent = "";
    try {
      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: state.cart })
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.message || "Checkout is unavailable.");
      window.location.assign(data.url);
    } catch (error) {
      output.textContent = error.message;
      button.disabled = false;
      button.firstChild.textContent = "Secure checkout ";
    }
  }

  async function loadProducts() {
    try {
      const response = await fetch("/api/shop/products", { headers: { Accept: "application/json" } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Products could not be loaded.");
      state.products = (Array.isArray(data.products) ? data.products : []).map((product) => {
        const artwork = starterArtwork[product.id];
        return artwork && artwork.old.includes(product.image_url)
          ? { ...product, image_url: artwork.url, image_alt: artwork.alt }
          : product;
      });
      renderFilters();
      renderProducts();
      renderCart();
    } catch (error) {
      state.products = previewProducts;
      renderFilters();
      renderProducts();
      renderCart();
      status.textContent = "Preview catalog · connect Cloudflare to publish live products";
    }
  }

  document.getElementById("cartTrigger").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("cartShopButton").addEventListener("click", () => { closeCart(); document.getElementById("products").scrollIntoView(); });
  cartBackdrop.addEventListener("click", closeCart);
  document.getElementById("checkoutButton").addEventListener("click", checkout);
  document.getElementById("modalClose").addEventListener("click", () => modal.close());
  document.getElementById("modalAdd").addEventListener("click", () => state.selected && addToCart(state.selected.id));
  modal.addEventListener("click", (event) => { if (event.target === modal) modal.close(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart(); });
  if (new URLSearchParams(location.search).get("checkout") === "cancelled") {
    history.replaceState({}, "", "shop.html");
    setTimeout(openCart, 400);
  }
  loadProducts();
}());
