/* =====================================================
   GLOBAL STATE & CONSTANTS
===================================================== */
const ORDERS_PER_PAGE = 10;
let currentOrderPage = Number(sessionStorage.getItem("orderPage")) || 1;

let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
let currentUser = localStorage.getItem("currentUser");

const users = {
  admin: "12345",
  chester: "kickbarks",
  test: "123456",
};

/* =====================================================
   EMAILJS INIT
===================================================== */
(function initEmailJS() {
  if (window.emailjs) {
    emailjs.init("qFyIf-WQG3wo4lvW-");
  }
})();

/* =====================================================
   PRODUCTS & BRANDS
===================================================== */
const products = [
  { id: 1, name: "CWORKS TOYOTA TSUSHO CLUTCH BELL WITH GROOVE", price: 1199, brand: "CWORKS", img: "./image/cworksbell.png", motorcycles: ["NMAX", "Aerox", "Click125"], category: "Clutch", badge: "hot" },
  { id: 2, name: "CWORKS TOYOTA TSUSHO CLUTCH LINING", price: 1499, brand: "CWORKS", img: "./image/cworksclutchlining.png", motorcycles: ["NMAX", "Aerox", "Click125"], category: "Clutch", badge: "hot" },
  { id: 3, name: "JVT CENTER SPRING FOR NMAX/AEROX", price: 499, brand: "JVT", img: "./image/jvtcenterspring.png", motorcycles: ["NMAX", "Aerox"], category: "Suspension", badge: "new" },
  { id: 4, name: "JVT PULLEY SET FOR NMAX 155, AEROX 155 V1/V2", price: 2299, brand: "JVT", img: "./image/jvtpulley.png", motorcycles: ["NMAX", "Aerox"], category: "Suspension" },
  { id: 5, name: "RCB E2 BRAKE LEVER", price: 999, brand: "Racing Boy", img: "./image/rcbbrakelever.png", motorcycles: ["NMAX", "Aerox", "Click125"], category: "Brakes" },
  { id: 6, name: "RCB A2 SHOCK", price: 1399, brand: "Racing Boy", img: "./image/rcbshock.png", motorcycles: ["Click125", "Beat"], category: "Suspension" },
  { id: 7, name: "RS8 CVT CLEANER", price: 119, brand: "RS8", img: "./image/rs8cvtcleaner.png", motorcycles: [], category: "Oil", badge: "sale" },
  { id: 8, name: "RS8 ECO SCOOTER OIL", price: 249, brand: "RS8", img: "./image/rs8ecoscooter.png", motorcycles: [], category: "Oil", badge: "sale" },
];

const brands = [...new Set(products.map(p => p.brand))].sort();

/* =====================================================
   CART HELPERS (SINGLE SOURCE)
===================================================== */
const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];
const saveCart = cart => localStorage.setItem("cart", JSON.stringify(cart));

function calculateCheckout() {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 5000 ? 0 : 150;
  return { cart, subtotal, shipping, total: subtotal + shipping };
}

/* =====================================================
   ORDER UTILITIES
===================================================== */
function generateOrderRef() {
  const d = new Date();
  return `KB-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.floor(100000+Math.random()*900000)}`;
}

/* =====================================================
   UI UPDATE
===================================================== */
function updateUI() {
  const cart = getCart();

  document.getElementById("cartCount")?.textContent = cart.length;

  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = "";
  let total = 0;

  if (!cart.length) {
    cartItems.innerHTML = "<p class='text-muted'>Your cart is empty.</p>";
  } else {
    cart.forEach((item, i) => {
      total += item.price * item.qty;
      const div = document.createElement("div");
      div.className = "d-flex justify-content-between border-bottom mb-2 pb-2";
      div.innerHTML = `
        <div>
          <strong>${item.name}</strong><br>
          <small class="text-success">${item.motorcycle || "Universal"}</small>
          <div class="mt-1">
            <button onclick="decreaseQty(${i})">➖</button>
            <span>${item.qty}</span>
            <button onclick="increaseQty(${i})">➕</button>
          </div>
        </div>
        <div>
          ₱${(item.price * item.qty).toLocaleString()}
          <button onclick="removeFromCart(${i})" class="btn btn-sm btn-danger">Remove</button>
        </div>
      `;
      cartItems.appendChild(div);
      enableLongPressDelete(div, i);
    });
  }

  cartTotal.textContent = total.toLocaleString("en-PH");
}

/* =====================================================
   CART ACTIONS
===================================================== */
window.addToCart = function(id, name, price, qty, motorcycle) {
  if (!isLoggedIn) {
    alert("Please login first");
    return;
  }

  const cart = getCart();
  const existing = cart.find(i => i.id === id && i.motorcycle === motorcycle);

  if (existing) existing.qty += Number(qty);
  else cart.push({ id, name, price, qty: Number(qty), motorcycle });

  saveCart(cart);
  updateUI();
};

window.removeFromCart = i => {
  const cart = getCart();
  cart.splice(i, 1);
  saveCart(cart);
  updateUI();
};

window.increaseQty = i => {
  const cart = getCart();
  cart[i].qty++;
  saveCart(cart);
  updateUI();
};

window.decreaseQty = i => {
  const cart = getCart();
  cart[i].qty > 1 ? cart[i].qty-- : cart.splice(i,1);
  saveCart(cart);
  updateUI();
};

/* =====================================================
   LONG PRESS DELETE
===================================================== */
function enableLongPressDelete(el, index) {
  let timer;
  el.addEventListener("mousedown", () => {
    timer = setTimeout(() => {
      if (confirm("Remove item?")) removeFromCart(index);
    }, 1500);
  });
  ["mouseup","mouseleave","touchend"].forEach(e =>
    el.addEventListener(e, () => clearTimeout(timer))
  );
}

/* =====================================================
   ORDER HISTORY (USER)
===================================================== */
function renderOrderHistory() {
  const tbody = document.getElementById("orderHistoryBody");
  if (!tbody || !isLoggedIn) return;

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const reversed = orders.slice().reverse();

  const totalPages = Math.max(1, Math.ceil(reversed.length / ORDERS_PER_PAGE));
  currentOrderPage = Math.min(currentOrderPage, totalPages);
  sessionStorage.setItem("orderPage", currentOrderPage);

  tbody.innerHTML = "";

  reversed
    .slice((currentOrderPage-1)*ORDERS_PER_PAGE, currentOrderPage*ORDERS_PER_PAGE)
    .forEach(order => {
      const total = order.items.reduce((s,i)=>s+i.price*i.qty,0);
      tbody.innerHTML += `
        <tr>
          <td>${order.reference}</td>
          <td>${new Date(order.date).toLocaleString("en-PH")}</td>
          <td>₱${total.toLocaleString()}</td>
          <td><span class="badge bg-secondary">${order.status}</span></td>
        </tr>`;
    });
}

/* =====================================================
   DOM READY
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  updateUI();
  renderOrderHistory();
});


// document.addEventListener("click", e => {
//   if (e.target.id === "clearOrdersBtn") {
//     if (!confirm("Are you sure you want to clear all order history?")) return;

//     localStorage.removeItem("orders");
//     renderOrderHistory();

//     alert("All orders have been cleared.");
//   }
// });

// localStorage.removeItem("orders");
