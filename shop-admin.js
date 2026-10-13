(function () {
  "use strict";
  const state = { products: [], editing: null, imageUploading: false, fileUploading: false };
  const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });
  const loginView = document.getElementById("loginView");
  const dashboard = document.getElementById("dashboard");
  const editor = document.getElementById("productEditor");
  const backdrop = document.getElementById("editorBackdrop");

  async function request(path, options = {}) {
    const response = await fetch(path, { ...options, headers: { Accept: "application/json", ...(options.headers || {}) } });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) {
      if (response.status === 401 && !path.includes("/auth/")) showLogin();
      throw new Error(data.message || "Something went wrong.");
    }
    return data;
  }

  function showLogin() { loginView.hidden = false; dashboard.hidden = true; closeEditor(); }
  function showDashboard(user) {
    loginView.hidden = true;
    dashboard.hidden = false;
    document.getElementById("adminEmail").textContent = user.email;
    loadProducts();
  }

  async function checkSession() {
    try { const data = await request("/api/shop/auth/session"); showDashboard(data.user); }
    catch { showLogin(); }
  }

  async function login(event) {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button[type=submit]");
    const output = document.getElementById("loginStatus");
    button.disabled = true; output.textContent = "Signing in…";
    try {
      const data = await request("/api/shop/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: document.getElementById("loginEmail").value, password: document.getElementById("loginPassword").value })
      });
      document.getElementById("loginPassword").value = "";
      output.textContent = "";
      showDashboard(data.user);
    } catch (error) { output.textContent = error.message; }
    finally { button.disabled = false; }
  }

  async function logout() {
    try { await request("/api/shop/auth/logout", { method: "POST" }); } finally { showLogin(); }
  }

  async function loadProducts() {
    const output = document.getElementById("adminStatus");
    output.textContent = "Loading products…";
    try {
      const data = await request("/api/shop/products/all");
      state.products = data.products || [];
      output.textContent = "";
      updateStats(); renderProducts();
    } catch (error) { output.textContent = error.message; }
  }

  function updateStats() {
    const all = state.products.length;
    const live = state.products.filter((product) => product.active).length;
    document.getElementById("productCount").textContent = all;
    document.getElementById("statAll").textContent = all;
    document.getElementById("statLive").textContent = live;
    document.getElementById("statDraft").textContent = all - live;
    document.getElementById("statFeatured").textContent = state.products.filter((product) => product.featured).length;
  }

  function renderProducts() {
    const query = document.getElementById("productSearch").value.trim().toLowerCase();
    const filter = document.getElementById("productFilter").value;
    const products = state.products.filter((product) => {
      const matchesSearch = !query || `${product.name} ${product.category}`.toLowerCase().includes(query);
      const matchesFilter = filter === "all" || (filter === "live" ? product.active : !product.active);
      return matchesSearch && matchesFilter;
    });
    const template = document.getElementById("adminProductTemplate");
    document.getElementById("productList").replaceChildren(...products.map((product) => {
      const node = template.content.firstElementChild.cloneNode(true);
      const image = node.querySelector("img"); image.src = product.image_url || "Ismile-bunny-branding.png"; image.alt = "";
      node.querySelector(".product-name strong").textContent = product.name;
      node.querySelector(".product-name span").textContent = product.asset_key ? "Download attached" : "No download attached";
      node.querySelector(".product-category").textContent = product.category;
      node.querySelector(".product-admin-price").textContent = money.format(product.price_cents / 100);
      const pill = node.querySelector(".status-pill"); pill.textContent = product.active ? "Live" : "Draft"; pill.classList.toggle("draft", !product.active);
      node.querySelector("button").addEventListener("click", () => openEditor(product));
      return node;
    }));
    document.getElementById("adminStatus").textContent = products.length ? "" : "No matching products.";
  }

  function slugify(value) { return value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80); }

  function setImagePreview(url) {
    const preview = document.getElementById("imagePreview");
    preview.hidden = !url; preview.src = url || "";
    document.getElementById("imagePrompt").hidden = Boolean(url);
  }

  function openEditor(product = null) {
    state.editing = product;
    document.getElementById("editorTitle").textContent = product ? "Edit product" : "New product";
    document.getElementById("productId").value = product?.id || "";
    document.getElementById("productName").value = product?.name || "";
    document.getElementById("productEyebrow").value = product?.eyebrow || "";
    document.getElementById("productCategory").value = product?.category || "";
    document.getElementById("productDescription").value = product?.description || "";
    document.getElementById("productSlug").value = product?.slug || "";
    document.getElementById("productPrice").value = product ? (product.price_cents / 100).toFixed(2) : "";
    document.getElementById("productComparePrice").value = product?.compare_at_cents ? (product.compare_at_cents / 100).toFixed(2) : "";
    document.getElementById("productActive").checked = product ? Boolean(product.active) : true;
    document.getElementById("productFeatured").checked = Boolean(product?.featured);
    document.getElementById("productImageUrl").value = product?.image_url || "";
    document.getElementById("productImageAlt").value = product?.image_alt || "";
    document.getElementById("productAssetKey").value = product?.asset_key || "";
    document.getElementById("productAssetName").value = product?.asset_name || "";
    document.getElementById("downloadFileName").textContent = product?.asset_name || "No file selected";
    document.getElementById("deleteProductButton").hidden = !product;
    document.getElementById("productFormStatus").textContent = "";
    document.getElementById("imageUploadStatus").textContent = "";
    document.getElementById("fileUploadStatus").textContent = "";
    document.getElementById("imageFile").value = ""; document.getElementById("downloadFile").value = "";
    setImagePreview(product?.image_url || "");
    editor.classList.add("open"); editor.setAttribute("aria-hidden", "false"); backdrop.hidden = false; document.body.style.overflow = "hidden";
    setTimeout(() => document.getElementById("productName").focus(), 200);
  }

  function closeEditor() {
    editor.classList.remove("open"); editor.setAttribute("aria-hidden", "true"); backdrop.hidden = true; document.body.style.removeProperty("overflow");
  }

  async function upload(file, kind) {
    const status = document.getElementById(kind === "image" ? "imageUploadStatus" : "fileUploadStatus");
    status.textContent = "Uploading…";
    const form = new FormData(); form.append("file", file); form.append("kind", kind);
    try {
      const data = await request("/api/shop/upload", { method: "POST", body: form });
      if (kind === "image") {
        document.getElementById("productImageUrl").value = data.url;
        if (!document.getElementById("productImageAlt").value) document.getElementById("productImageAlt").value = document.getElementById("productName").value;
        setImagePreview(data.url); status.textContent = "Image uploaded.";
      } else {
        document.getElementById("productAssetKey").value = data.key;
        document.getElementById("productAssetName").value = data.name;
        document.getElementById("downloadFileName").textContent = data.name; status.textContent = "Product file uploaded.";
      }
    } catch (error) { status.textContent = error.message; throw error; }
  }

  function productPayload() {
    return {
      name: document.getElementById("productName").value,
      eyebrow: document.getElementById("productEyebrow").value,
      category: document.getElementById("productCategory").value,
      description: document.getElementById("productDescription").value,
      slug: document.getElementById("productSlug").value || slugify(document.getElementById("productName").value),
      price_cents: Math.round(Number(document.getElementById("productPrice").value) * 100),
      compare_at_cents: Math.round(Number(document.getElementById("productComparePrice").value || 0) * 100),
      active: document.getElementById("productActive").checked,
      featured: document.getElementById("productFeatured").checked,
      image_url: document.getElementById("productImageUrl").value,
      image_alt: document.getElementById("productImageAlt").value,
      asset_key: document.getElementById("productAssetKey").value,
      asset_name: document.getElementById("productAssetName").value
    };
  }

  async function saveProduct(event) {
    event.preventDefault();
    const output = document.getElementById("productFormStatus");
    const button = event.currentTarget.querySelector(".save-button");
    if (state.imageUploading || state.fileUploading) { output.textContent = "Let the upload finish first."; return; }
    button.disabled = true; output.textContent = "Saving…";
    const id = document.getElementById("productId").value;
    try {
      await request(id ? `/api/shop/products/${encodeURIComponent(id)}` : "/api/shop/products", {
        method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(productPayload())
      });
      output.textContent = "Saved."; await loadProducts(); setTimeout(closeEditor, 350);
    } catch (error) { output.textContent = error.message; }
    finally { button.disabled = false; }
  }

  async function deleteProduct() {
    const id = document.getElementById("productId").value;
    if (!id || !window.confirm("Archive this product? It will leave the shop but past customer downloads will keep working.")) return;
    const output = document.getElementById("productFormStatus"); output.textContent = "Archiving…";
    try { await request(`/api/shop/products/${encodeURIComponent(id)}`, { method: "DELETE" }); closeEditor(); await loadProducts(); }
    catch (error) { output.textContent = error.message; }
  }

  document.getElementById("loginForm").addEventListener("submit", login);
  document.getElementById("logoutButton").addEventListener("click", logout);
  document.getElementById("newProductButton").addEventListener("click", () => openEditor());
  document.getElementById("editorClose").addEventListener("click", closeEditor);
  backdrop.addEventListener("click", closeEditor);
  document.getElementById("productForm").addEventListener("submit", saveProduct);
  document.getElementById("deleteProductButton").addEventListener("click", deleteProduct);
  document.getElementById("productSearch").addEventListener("input", renderProducts);
  document.getElementById("productFilter").addEventListener("change", renderProducts);
  document.getElementById("productName").addEventListener("blur", () => { const slug = document.getElementById("productSlug"); if (!slug.value) slug.value = slugify(document.getElementById("productName").value); });
  document.getElementById("imageFile").addEventListener("change", async (event) => { if (!event.target.files[0]) return; state.imageUploading = true; try { await upload(event.target.files[0], "image"); } catch {} finally { state.imageUploading = false; } });
  document.getElementById("downloadFile").addEventListener("change", async (event) => { if (!event.target.files[0]) return; state.fileUploading = true; try { await upload(event.target.files[0], "download"); } catch {} finally { state.fileUploading = false; } });
  const dropBox = document.getElementById("imageUploadBox");
  ["dragenter", "dragover"].forEach((name) => dropBox.addEventListener(name, () => dropBox.classList.add("dragging")));
  ["dragleave", "drop"].forEach((name) => dropBox.addEventListener(name, () => dropBox.classList.remove("dragging")));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && editor.classList.contains("open")) closeEditor(); });
  checkSession();
}());
