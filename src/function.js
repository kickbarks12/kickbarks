// -------------------- State --------------------
let isLoggedIn = false;
let cart = [];

// -------------------- Demo Users --------------------
const demoUsers = [
  { username: "user1", password: "12345" },
  { username: "admin", password: "admin" }
];

// -------------------- Navbar Elements --------------------
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginItem = document.getElementById('loginItem');
const signupItem = document.getElementById('signupItem');
const logoutBtn = document.getElementById('logoutBtn');
const accountDropdown = document.getElementById('accountDropdown');
const cartBtn = document.getElementById('cartBtn');
const cartItemsDiv = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');

// -------------------- Login Form --------------------
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const user = demoUsers.find(u => u.username === username && u.password === password);
  if (user) {
    loginSuccess(user.username);

    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();
  } else {
    alert("Invalid username or password. Please try again.");
  }
});

// -------------------- Login Success --------------------
function loginSuccess(username) {
  isLoggedIn = true;
  loginItem.style.display = 'none';
  signupItem.style.display = 'none';
  logoutBtn.style.display = 'block';
  cartBtn.style.display = 'inline-block';
  accountDropdown.textContent = `Hello, ${username}`;
}

// -------------------- Logout --------------------
logoutBtn.addEventListener('click', () => {
  isLoggedIn = false;
  cart = [];
  updateCartModal();

  loginItem.style.display = 'block';
  signupItem.style.display = 'block';
  logoutBtn.style.display = 'none';
  cartBtn.style.display = 'none';
  accountDropdown.textContent = 'Account';
});

// -------------------- Add to Cart --------------------
document.querySelectorAll(".add-to-cart").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!isLoggedIn) {
      alert("You must log in to add products to your cart!");
      const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
      loginModal.show();
      return;
    }

    const card = btn.closest(".card");
    const img = card.querySelector("img");
    const title = img ? img.alt : "Product";
    const price = card.querySelector(".card-text")?.innerText || "₱0";

    // Motorcycle selection (optional)
    const motorcycleSelect = card.querySelector(".motorcycle-select");
    const selectWarning = card.querySelector(".select-warning");
    if (motorcycleSelect && motorcycleSelect.value === "") {
      selectWarning.classList.remove("d-none");
      return;
    } else if (selectWarning) {
      selectWarning.classList.add("d-none");
    }

    const qtyInput = card.querySelector(".product-qty");
    const quantity = parseInt(qtyInput?.value) || 1;

    const existing = cart.find(item => item.title === title && item.model === (motorcycleSelect?.value || ""));
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ title, price, model: motorcycleSelect?.value || "", quantity });
    }

    updateCartModal();
  });
});

// -------------------- Update Cart Modal --------------------
function updateCartModal() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    cartItemsDiv.innerHTML = "";
    let totalAmount = 0;

    cart.forEach((item, index) => {
      const priceNumber = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
      totalAmount += priceNumber * item.quantity;

      const div = document.createElement("div");
      div.className = "d-flex justify-content-between align-items-center mb-2";
      div.innerHTML = `
        <span>${item.title} (${item.model}) - ${item.price} x ${item.quantity}</span>
        <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">Remove</button>
      `;
      cartItemsDiv.appendChild(div);
    });

    const totalDiv = document.createElement("div");
    totalDiv.className = "mt-3 fw-bold text-end";
    totalDiv.textContent = `Total: ₱${totalAmount.toFixed(2)}`;
    cartItemsDiv.appendChild(totalDiv);
  }
}

// -------------------- Remove from Cart --------------------
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartModal();
}

// -------------------- Product Search --------------------
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();

  document.querySelectorAll("#productList .col-md-3").forEach(card => {
    const img = card.querySelector("img");
    const title = img ? img.alt.toLowerCase() : "";

    if (title.includes(filter)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});
