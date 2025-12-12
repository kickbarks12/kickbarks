// src/function.js - FINAL VERSION (Login + Cart + Brand Filter + Search + Dynamic Products)

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
let currentUser = localStorage.getItem("currentUser") || null;

// Fake user database
const users = {
  "admin": "12345",
  "chester": "kickbarks",
  "test": "123456"
  // Add more users here
};

// ==================== YOUR REAL PRODUCTS ====================
const products = [
  { id: 1, name: "CWORKS TOYOTA TSUSHO CLUTCH BELL WITH GROOVE", price: 1199, brand: "CWORKS", img: "./image/cworksbell.png", motorcycles: ["NMAX", "Aerox", "Click125"] },
  { id: 2, name: "CWORKS TOYOTA TSUSHO CLUTCH LINING", price: 1499, brand: "CWORKS", img: "./image/cworksclutchlining.png", motorcycles: ["NMAX", "Aerox", "Click125"] },
  { id: 3, name: "JVT CENTER SPRING FOR NMAX/AEROX", price: 499, brand: "JVT", img: "./image/jvtcenterspring.png", motorcycles: ["NMAX", "Aerox"] },
  { id: 4, name: "JVT PULLEY SET FOR NMAX 155, AEROX 155 V1/V2", price: 2299, brand: "JVT", img: "./image/jvtpulley.png", motorcycles: ["NMAX", "Aerox"] },
  { id: 5, name: "RCB E2 BRAKE LEVER FOR BEAT F.I, CLICK 125/150 V1,V2, SNIPER 150,NMAX V1,V2", price: 999, brand: "Racing Boy", img: "./image/rcbbrakelever.png", motorcycles: ["NMAX", "Aerox", "Click125"] },
  { id: 6, name: "RACING BOY (RCB) SHOCK A2 Series 295mm/330mm", price: 1399, brand: "Racing Boy", img: "./image/rcbshock.png", motorcycles: ["Click125", "Beat"] },
  { id: 7, name: "RS8 CVT CLEANER SPRAY DEGREASER 450ML ORIGINAL", price: 119, brand: "RS8", img: "./image/rs8cvtcleaner.png", motorcycles: [] },
  { id: 8, name: "RS8 ECO SCOOTER 10W-40 API SL SYNTHETIC MOTORCYCLE ENGINE OIL", price: 249, brand: "RS8", img: "./image/rs8ecoscooter.png", motorcycles: [] },
  // Add more products here...
];

// Extract unique brands for "Shop by Brand" section
const brands = [...new Set(products.map(p => p.brand))].sort();

// DOM Elements (will be available after components.html loads)
let brandContainer, productContainer, searchInput, clearFilterBtn;

// ==================== RENDER BRANDS ====================
function renderBrands() {
  if (!brandContainer) return;
  brandContainer.innerHTML = "";
  brands.forEach(brand => {
    const col = document.createElement("div");
    col.className = "col text-center brand-card";
    col.innerHTML = `
      <a href="#" class="text-decoration-none" data-brand="${brand}">
        <img src="./image/brands/${brand.toLowerCase().replace(/\s+/g, '-')}.png" 
             onerror="this.src='https://via.placeholder.com/150?text=${brand}'"
             class="img-fluid rounded-circle mb-3" alt="${brand}" style="width:120px;height:120px;object-fit:contain;">
        <h6 class="fw-bold text-dark">${brand}</h6>
      </a>`;
    brandContainer.appendChild(col);
  });
}

// ==================== RENDER PRODUCTS ====================
function renderProducts(filtered = products) {
  if (!productContainer) return;
  productContainer.innerHTML = "";

  filtered.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-md-3 mb-4 product-card";
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${p.img}" class="card-img-top" alt="${p.name}" style="height: 200px; object-fit: cover;">
        <div class="card-body text-center">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text text-muted small">${p.brand}</p>
          <p class="card-text fw-bold text-primary">₱${p.price.toLocaleString()}</p>
          ${p.motorcycles.length > 0 ? `
            <select class="form-select mb-2 motorcycle-select">
              <option value="">-- Select Motorcycle --</option>
              ${p.motorcycles.map(m => `<option value="${m}">${m}</option>`).join("")}
            </select>
            <small class="text-danger d-none select-warning">Please select motorcycle</small>
          ` : ""}
          }
          <input type="number" class="form-control mb-2 product-qty" min="1" value="1">
          <button class="btn btn-primary add-to-cart">Add to Cart</button>
        </div>
      </div>`;
    productContainer.appendChild(col);
  });

  // Re-attach Add to Cart buttons after rendering
  attachAddToCartButtons();
}

// Filter by brand
function filterByBrand(brandName) {
  const filtered = products.filter(p => p.brand === brandName);
  renderProducts(filtered);
}

// Update UI (cart count, login state, etc.)
function updateUI() {
  const cartBtn = document.getElementById("cartBtn");
  const cartCount = document.getElementById("cartCount");
  const cartItemsDiv = document.getElementById("cartItems");
  const cartTotalSpan = document.getElementById("cartTotal");
  const accountDropdown = document.getElementById("accountDropdown");
  const loginItem = document.getElementById("loginItem");
  const signupItem = document.getElementById("signupItem");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!accountDropdown) return;

  if (isLoggedIn) {
    loginItem.style.display = "none";
    signupItem.style.display = "none";
    logoutBtn.style.display = "block";
    accountDropdown.innerHTML = `Hello, ${currentUser}`;
    if (cartBtn) cartBtn.style.display = "inline-block";
  } else {
    loginItem.style.display = "block";
    signupItem.style.display = "block";
    logoutBtn.style.display = "none";
    accountDropdown.textContent = "Account";
    if (cartBtn) cartBtn.style.display = "none";
  }

  // Update cart display
  if (cartCount) cartCount.textContent = cart.length;
  if (cartItemsDiv) {
    cartItemsDiv.innerHTML = "";
    let total = 0;
    if (cart.length === 0) {
      cartItemsDiv.innerHTML = "<p class='text-muted'>Your cart is empty.</p>";
    } else {
      cart.forEach((item, i) => {
        const div = document.createElement("div");
        div.className = "d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom";
        div.innerHTML = `
          <div>
            <strong>${item.name}</strong><br>
            ${item.motorcycle && item.motorcycle !== "Universal" ? `<small class="text-success">→ ${item.motorcycle}</small><br>` : ""}
            <small>× ${item.qty}</small>
          </div>
          <div class="text-end">
            <strong>₱${(item.price * item.qty).toLocaleString()}</strong><br>
            <button class="btn btn-sm btn-danger mt-1" onclick="removeFromCart(${i})">Remove</button>
          </div>
        `;
        cartItemsDiv.appendChild(div);
        total += item.price * item.price;
      });
    }
    if (cartTotalSpan) cartTotalSpan.textContent = total.toLocaleString();
  }
}

window.removeFromCart = function(i) {
  cart.splice(i, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateUI();
};

window.addToCart = function(name, price, qty = 1, motorcycle = "") {
  if (!isLoggedIn) {
    alert("Please login first!");
    new bootstrap.Modal(document.getElementById("loginModal")).show();
    return;
  }
  cart.push({ name, price, qty: parseInt(qty), motorcycle: motorcycle || "Universal" });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateUI();
  alert("Added to cart!");
};

function attachAddToCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.onclick = function() {
      const card = this.closest(".card");
      const name = card.querySelector("h5").textContent;
      const priceText = card.querySelector(".card-text.fw-bold").textContent;
      const price = parseInt(priceText.replace(/[^0-9]/g, ""));
      const qty = card.querySelector(".product-qty")?.value || 1;
      const select = card.querySelector(".motorcycle-select");
      const warning = card.querySelector(".select-warning");

      if (select && !select.value) {
        warning.classList.remove("d-none");
        return;
      }
      if (warning) warning.classList.add("d-none");

      addToCart(name, price, qty, select ? select.value : "");
    };
  });
}

// Load saved credentials
function loadSavedCredentials() {
  const saved = localStorage.getItem("rememberedCredentials");
  if (saved) {
    const { username, password } = JSON.parse(saved);
    document.getElementById("loginUsername").value = username;
    document.getElementById("loginPassword").value = password;
    document.getElementById("rememberMe").checked = true;
  }
}

// ==================== MAIN INIT AFTER COMPONENTS LOAD ====================
document.addEventListener("DOMContentLoaded", () => {
  fetch("components.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("shared-components").innerHTML = html;

      // Re-assign DOM elements after injecting navbar/modal
      brandContainer = document.getElementById("brandList");
      productContainer = document.getElementById("productList");
      searchInput = document.getElementById("searchInput");
      clearFilterBtn = document.getElementById("clearFilter");

      // Now render everything
      renderBrands();
      renderProducts();
      updateUI();
      attachAddToCartButtons();

      // Brand click filter
      if (brandContainer) {
        brandContainer.addEventListener("click", (e) => {
          const link = e.target.closest("[data-brand]");
          if (link) {
            e.preventDefault();
            const brand = link.getAttribute("data-brand");
            filterByBrand(brand);
            document.querySelectorAll("[data-brand]").forEach(a => a.classList.remove("text-primary"));
            link.classList.add("text-primary");
          }
        });
      }

      // Clear filters
      if (clearFilterBtn) {
        clearFilterBtn.addEventListener("click", () => {
          renderProducts();
          document.querySelectorAll("[data-brand]").forEach(a => a.classList.remove("text-primary"));
          if (searchInput) searchInput.value = "";
        });
      }

      // Live search
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          const term = searchInput.value.toLowerCase();
          const filtered = products.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term)
          );
          renderProducts(filtered);
        });
      }

      // Login / Logout / Cart / Modals (your original code)
      const loginModal = document.getElementById("loginModal");
      loginModal?.addEventListener("shown.bs.modal", loadSavedCredentials);

      document.getElementById("loginForm")?.addEventListener("submit", e => {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;
        const remember = document.getElementById("rememberMe").checked;

        if (users[username] && users[username] === password) {
          isLoggedIn = true;
          currentUser = username.charAt(0).toUpperCase() + username.slice(1);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("currentUser", currentUser);
          if (remember) {
            localStorage.setItem("rememberedCredentials", JSON.stringify({ username, password }));
          } else {
            localStorage.removeItem("rememberedCredentials");
          }
          updateUI();
          bootstrap.Modal.getInstance(loginModal).hide();
          alert(`Welcome back, ${currentUser}!`);
        } else {
          alert("Incorrect username or password!");
        }
      });

      // Signup, Logout, Checkout — (keep your existing code below)
      // ... [your signup, logout, checkout code here — unchanged]

      document.getElementById("logoutBtn")?.addEventListener("click", () => {
        if (confirm("Log out?")) {
          isLoggedIn = false;
          currentUser = null;
          localStorage.setItem("isLoggedIn", "false");
          localStorage.removeItem("currentUser");
          updateUI();
          alert("Logged out. Your cart is saved!");
        }
      });

      document.getElementById("checkoutBtn")?.addEventListener("click", () => {
        if (cart.length === 0) return alert("Cart is empty!");
        let msg = "ORDER SUMMARY\n\n";
        let total = 0;
        cart.forEach(item => {
          msg += `• ${item.name} ${item.motorcycle !== "Universal" ? `(${item.motorcycle})` : ""} × ${item.qty} = ₱${(item.price * item.qty).toLocaleString()}\n`;
          total += item.price * item.qty;
        });
        msg += `\nTOTAL: ₱${total.toLocaleString()}\n\nConfirm?`;

        if (confirm(msg)) {
          alert("Order placed successfully!");
          cart = [];
          localStorage.setItem("cart", "[]");
          updateUI();
          bootstrap.Modal.getInstance(document.getElementById("cartModal")).hide();
        }
      });
    });
});