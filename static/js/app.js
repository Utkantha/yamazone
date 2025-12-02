let products = [];
let cart = [];
let quickViewProduct = null;

async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    products = await res.json();
  } catch (e) {
    console.error("Failed to load products", e);
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 200);
  }, 2200);
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
}

function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
}

function renderCart() {
  const container = document.getElementById("cartItems");
  container.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
        <div style="font-size: 0.75rem; color:#565959;">Qty: ${item.qty}</div>
      </div>
    `;
    container.appendChild(div);
  });

  document.getElementById("cartCount").textContent = cart.reduce(
    (sum, p) => sum + p.qty,
    0
  );
  document.getElementById("cartItemsCount").textContent = cart.reduce(
    (sum, p) => sum + p.qty,
    0
  );
  document.getElementById("cartTotal").textContent = total.toFixed(2);
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  const existing = cart.find((c) => c.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: `/static/${product.image}`,
      qty: 1,
    });
  }
  renderCart();
  showToast(`Added "${product.name}" to your cart`);
}

async function buyNow(productId) {
  try {
    const res = await fetch("/api/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`${data.message} • ${data.estimatedDelivery}`);
    } else {
      showToast("Unable to place order right now.");
    }
  } catch (e) {
    console.error(e);
    showToast("Something went wrong. Please try again.");
  }
}

function openQuickView(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  quickViewProduct = product;
  document.getElementById("modalImg").src = product.image;
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById(
    "modalCategory"
  ).textContent = `Category: ${product.category}`;
  document.getElementById(
    "modalRating"
  ).textContent = `⭐ ${product.rating.toFixed(
    1
  )} • ${product.reviews.toLocaleString()} ratings`;
  document.getElementById(
    "modalPrice"
  ).textContent = `₹${product.price.toFixed(2)}`;
  document.getElementById("modalDesc").textContent = product.description;
  document.getElementById("quickViewModal").classList.remove("hidden");
}

function closeQuickView() {
  document.getElementById("quickViewModal").classList.add("hidden");
  quickViewProduct = null;
}

function applySearchFilter(query) {
  const cards = document.querySelectorAll(".product-card");
  cards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    if (!query || title.includes(query.toLowerCase())) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}

function randomizeDeals() {
  if (!products.length) return;
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  const selection = shuffled.slice(0, 4);
  const container = document.getElementById("personalizedDeals");
  container.innerHTML = "";
  selection.forEach((p) => {
    const article = document.createElement("article");
    article.className = "deal-card";
    article.dataset.id = p.id;
    article.innerHTML = `
      <img src="/static/${p.image}" alt="${p.name}" />
      <div class="deal-info">
        <span class="tag">${p.tag}</span>
        <h3>${p.name}</h3>
        <p class="price">₹${p.price.toFixed(2)}</p>
      </div>
    `;
    article.addEventListener("click", () => openQuickView(p.id));
    container.appendChild(article);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts();

  document.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10);
      addToCart(id);
    });
  });

  document.querySelectorAll(".btn-buy").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10);
      buyNow(id);
    });
  });

  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = parseInt(card.dataset.id, 10);
      openQuickView(id);
    });
  });

  document.getElementById("cartIcon").addEventListener("click", () => {
    openCart();
  });
  document.getElementById("closeCart").addEventListener("click", () => {
    closeCart();
  });

  document
    .getElementById("proceedToCheckout")
    .addEventListener("click", async () => {
      if (!cart.length) {
        showToast("Your cart is empty.");
        return;
      }
      const ids = cart.map((c) => c.id);
      try {
        const res = await fetch("/api/cart/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        const data = await res.json();
        showToast(
          `You are checking out ${data.items.length} items • Total: ₹${data.total.toFixed(
            2
          )}`
        );
      } catch {
        showToast("Unable to preview cart right now.");
      }
    });

  document.getElementById("closeQuickView").addEventListener("click", () => {
    closeQuickView();
  });

  document
    .getElementById("quickViewModal")
    .addEventListener("click", (event) => {
      if (event.target.id === "quickViewModal") {
        closeQuickView();
      }
    });

  document.getElementById("modalAddToCart").addEventListener("click", () => {
    if (quickViewProduct) {
      addToCart(quickViewProduct.id);
    }
  });
  document.getElementById("modalBuyNow").addEventListener("click", () => {
    if (quickViewProduct) {
      buyNow(quickViewProduct.id);
    }
  });

  document.getElementById("searchBtn").addEventListener("click", () => {
    const q = document.getElementById("searchInput").value.trim();
    applySearchFilter(q);
  });
  document
    .getElementById("searchInput")
    .addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        applySearchFilter(event.target.value.trim());
      }
    });

  document
    .getElementById("personalizeBtn")
    .addEventListener("click", randomizeDeals);

  renderCart();
});


