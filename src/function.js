// ================================================
// 1. GLOBAL STATE & CONSTANTS
// ================================================
let currentOrderPage = Number(sessionStorage.getItem("orderPage")) || 1;
const ORDERS_PER_PAGE = 5;

const DEFAULT_ORDER_STATUS = 'Pending';

const ORDER_STATUSES = [
  { label: 'Pending',    class: 'bg-warning text-dark' },
  { label: 'Confirmed',  class: 'bg-info text-dark' },
  { label: 'Shipped',    class: 'bg-primary' },
  { label: 'Delivered',  class: 'bg-success' }
];

let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let currentUser = localStorage.getItem('currentUser') || null;

const users = { admin: '12345', chester: 'kickbarks', test: '123456' };

// Auto-login if "Remember Me" was checked
(function autoLoginIfRemembered() {
  if (isLoggedIn) return;

  const remembered = localStorage.getItem('rememberedCredentials');
  if (remembered) {
    try {
      const { username, password } = JSON.parse(remembered);
      if (users[username] && users[username] === password) {
        isLoggedIn = true;
        currentUser = username.charAt(0).toUpperCase() + username.slice(1);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', currentUser);
      }
    } catch (e) {
      console.warn("Failed to restore login");
    }
  }
})();

const products = [
  { id: 1, name: 'CWORKS TOYOTA TSUSHO CLUTCH BELL WITH GROOVE', price: 1199, brand: 'CWORKS', img: './image/cworksbell.png', motorcycles: ['NMAX', 'Aerox', 'Click125'], category: 'Clutch', badge: 'hot' },
  { id: 2, name: 'CWORKS TOYOTA TSUSHO CLUTCH LINING', price: 1499, brand: 'CWORKS', img: './image/cworksclutchlining.png', motorcycles: ['NMAX', 'Aerox', 'Click125'], category: 'Clutch', badge: 'hot' },
  { id: 3, name: 'JVT CENTER SPRING FOR NMAX/AEROX', price: 499, brand: 'JVT', img: './image/jvtcenterspring.png', motorcycles: ['NMAX', 'Aerox'], category: 'Suspension', badge: 'new' },
  { id: 4, name: 'JVT PULLEY SET FOR NMAX 155, AEROX 155 V1/V2', price: 2299, brand: 'JVT', img: './image/jvtpulley.png', motorcycles: ['NMAX', 'Aerox'], category: 'Suspension' },
  { id: 5, name: 'RCB E2 BRAKE LEVER FOR BEAT F.I, CLICK 125/150 V1,V2, SNIPER 150,NMAX V1,V2', price: 999, brand: 'Racing Boy', img: './image/rcbbrakelever.png', motorcycles: ['NMAX', 'Aerox', 'Click125'], category: 'Brakes' },
  { id: 6, name: 'RACING BOY (RCB) SHOCK A2 Series 295mm/330mm', price: 1399, brand: 'Racing Boy', img: './image/rcbshock.png', motorcycles: ['Click125', 'Beat'], category: 'Suspension' },
  { id: 7, name: 'RS8 CVT CLEANER SPRAY DEGREASER 450ML ORIGINAL', price: 119, brand: 'RS8', img: './image/rs8cvtcleaner.png', motorcycles: [], category: 'Oil', badge: 'sale' },
  { id: 8, name: 'RS8 ECO SCOOTER 10W-40 API SL SYNTHETIC MOTORCYCLE ENGINE OIL', price: 249, brand: 'RS8', img: './image/rs8ecoscooter.png', motorcycles: [], category: 'Oil', badge: 'sale' },
];

const brands = [...new Set(products.map(p => p.brand))].sort();

let brandContainer = null;
let productContainer = null;
let searchInput = null;
let clearFilterBtn = null;


// ================================================
// 2. UTILITY FUNCTIONS
// ================================================
function generateOrderRef() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `KB-${y}${m}${day}-${rand}`;
}

const getCart = () => JSON.parse(localStorage.getItem('cart')) || [];
const saveCart = (newCart) => localStorage.setItem('cart', JSON.stringify(newCart));
const calculateTotal = () => getCart().reduce((sum, item) => sum + item.price * item.qty, 0);


// ================================================
// 3. RENDERING FUNCTIONS
// ================================================
function renderBrands() {
  if (!brandContainer) return;
  brandContainer.innerHTML = '';
  const brandLogos = { 'CWORKS': 'cworkslogo.png', 'JVT': 'jvtlogo.png', 'Racing Boy': 'rcb.png', 'RS8': 'rs8.png' };

  brands.forEach(brand => {
    const col = document.createElement('div');
    col.className = 'col text-center brand-card';
    const logoFile = brandLogos[brand] || `${brand.toLowerCase().replace(/\s+/g, '-')}.png`;
    const imgSrc = `./image/brands/${logoFile}`;

    col.innerHTML = `
      <a href="#" class="text-decoration-none d-block" data-brand="${brand}">
        <img src="${imgSrc}" onerror="this.src='https://via.placeholder.com/150/333333/FFFFFF?text=${brand}'"
             class="img-fluid rounded mb-3 shadow-sm" alt="${brand}"
             style="width:140px; height:140px; object-fit:contain; background:#fff; padding:10px; border-radius:12px;">
        <h6 class="fw-bold text-dark mt-2">${brand}</h6>
      </a>`;
    brandContainer.appendChild(col);
  });
}

function renderProducts(filtered = products) {
  if (!productContainer) return;
  productContainer.innerHTML = '';

  if (filtered.length === 0) {
    productContainer.innerHTML = '<p class="text-center text-muted col-12">No products found.</p>';
    return;
  }

  filtered.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-md-3 mb-4 product-card';
    col.setAttribute('data-category', p.category || 'all');
    col.setAttribute('data-id', p.id);

    let badge = '';
    if (p.badge === 'new') badge = '<span class="product-badge new">NEW</span>';
    if (p.badge === 'hot') badge = '<span class="product-badge hot">HOT</span>';
    if (p.badge === 'sale') badge = '<span class="product-badge sale">SALE</span>';

    col.innerHTML = `
      <div class="card h-100 shadow-sm position-relative">
        ${badge}
        <img src="${p.img}" class="card-img-top" alt="${p.name}" style="height:200px;object-fit:cover;">
        <div class="card-body text-center">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text text-muted small">${p.brand}</p>
          <p class="card-text fw-bold text-primary">₱${p.price.toLocaleString()}</p>
          ${p.motorcycles.length > 0 ? 
            `<select class="form-select mb-2 motorcycle-select">
               <option value="">-- Select Motorcycle --</option>
               ${p.motorcycles.map(m => `<option value="${m}">${m}</option>`).join('')}
             </select>
             <small class="text-danger d-none select-warning">Please select motorcycle</small>` 
            : ''}
          <input type="number" class="form-control mb-2 product-qty" min="1" value="1">
          <button class="btn btn-primary add-to-cart">Add to Cart</button>
        </div>
      </div>`;
    productContainer.appendChild(col);
  });

  attachAddToCartButtons();
}

function filterByBrand(brandName) {
  const filtered = products.filter(p => p.brand === brandName);
  renderProducts(filtered);
}

// === UPDATED renderOrderHistory WITH CANCEL BUTTON ===
function renderOrderHistory() {
  const tbody = document.getElementById("orderHistoryBody");
  const noOrdersMessage = document.getElementById("noOrdersMessage");
  const pageNumbers = document.getElementById("pageNumbers");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");

  if (!tbody || !noOrdersMessage) return;

  noOrdersMessage.classList.add("d-none");
  tbody.innerHTML = "";
  if (pageNumbers) pageNumbers.innerHTML = "";

  if (!isLoggedIn) {
    noOrdersMessage.textContent = "Please log in to view your order history.";
    noOrdersMessage.classList.remove("d-none");
    return;
  }

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const userOrders = orders.filter(order => order.user === currentUser);
  const reversed = userOrders.slice().reverse();

  if (reversed.length === 0) {
    noOrdersMessage.textContent = "No orders yet.";
    noOrdersMessage.classList.remove("d-none");
    return;
  }

  noOrdersMessage.classList.add("d-none");

  const totalPages = Math.ceil(reversed.length / ORDERS_PER_PAGE);
  currentOrderPage = Math.max(1, Math.min(currentOrderPage, totalPages));
  sessionStorage.setItem("orderPage", currentOrderPage);

  const start = (currentOrderPage - 1) * ORDERS_PER_PAGE;
  const pageOrders = reversed.slice(start, start + ORDERS_PER_PAGE);

  pageOrders.forEach((order, indexInPage) => {
    const globalIndex = orders.findIndex(o => o.reference === order.reference); // Find actual index in full array

    const tr = document.createElement("tr");
    const date = new Date(order.date).toLocaleString("en-PH");

    let statusClass = "bg-secondary";
    if (order.status === "Pending") statusClass = "bg-warning text-dark";
    if (order.status === "Confirmed") statusClass = "bg-info text-dark";
    if (order.status === "Shipped") statusClass = "bg-primary";
    if (order.status === "Delivered") statusClass = "bg-success";

    const itemsHtml = order.items.map(i =>
      `<div class="small">• ${i.name} ${i.motorcycle && i.motorcycle !== 'Universal' ? `(${i.motorcycle})` : ''} × ${i.qty}</div>`
    ).join("");

    // Calculate total paid
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = subtotal >= 5000 ? 0 : 150;
    const totalPaid = subtotal + shipping;

    // Cancel button only for Pending orders
    const cancelButton = order.status === "Pending"
      ? `<button class="btn btn-sm btn-outline-danger mt-2" onclick="cancelOrder(${globalIndex})">Cancel Order</button>`
      : `<small class="text-muted">Cannot cancel</small>`;

    tr.innerHTML = `
      <td class="fw-bold">${order.reference}</td>
      <td>${date}</td>
      <td>${itemsHtml}</td>
      <td><span class="badge ${statusClass}">${order.status}</span></td>
      <td class="fw-bold text-primary">₱${totalPaid.toLocaleString()}</td>
      <td>${cancelButton}</td>
    `;
    tbody.appendChild(tr);
  });

  // Pagination (unchanged)
  if (pageNumbers) {
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn btn-sm mx-1 ${i === currentOrderPage ? "btn-primary" : "btn-outline-secondary"}`;
      btn.textContent = i;
      btn.addEventListener("click", () => {
        currentOrderPage = i;
        sessionStorage.setItem("orderPage", currentOrderPage);
        renderOrderHistory();
      });
      pageNumbers.appendChild(btn);
    }
  }

  if (prevBtn) {
    prevBtn.disabled = currentOrderPage === 1;
    prevBtn.onclick = () => {
      if (currentOrderPage > 1) {
        currentOrderPage--;
        sessionStorage.setItem("orderPage", currentOrderPage);
        renderOrderHistory();
      }
    };
  }

  if (nextBtn) {
    nextBtn.disabled = currentOrderPage === totalPages;
    nextBtn.onclick = () => {
      if (currentOrderPage < totalPages) {
        currentOrderPage++;
        sessionStorage.setItem("orderPage", currentOrderPage);
        renderOrderHistory();
      }
    };
  }
}

// === NEW: CANCEL ORDER FUNCTION (GLOBAL SO BUTTON CAN CALL IT) ===
window.cancelOrder = function(orderIndex) {
  if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
    return;
  }

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const order = orders[orderIndex];

  if (order.user !== currentUser) {
    alert("You can only cancel your own orders!");
    return;
  }

  if (order.status !== "Pending") {
    alert("Only Pending orders can be cancelled.");
    return;
  }

  // Remove the order
  orders.splice(orderIndex, 1);
  localStorage.setItem("orders", JSON.stringify(orders));

  alert(`Order ${order.reference} has been cancelled.`);

  // Refresh both views
  renderOrderHistory();
  renderAdminOrders(); // So admin sees it disappear immediately
};

function renderAdminOrders() {
  const table = document.getElementById("adminOrderTable");
  const emptyText = document.getElementById("noAdminOrders");

  if (!table) return;

  if (currentUser !== "Admin") {
    alert("Access denied.");
    location.href = "/index.html";
    return;
  }

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  if (orders.length === 0) {
    table.innerHTML = "";
    emptyText?.classList.remove("d-none");
    return;
  }

  emptyText?.classList.add("d-none");
  table.innerHTML = "";

  orders.slice().reverse().forEach((order, index) => {
    const tr = document.createElement("tr");
    const date = new Date(order.date).toLocaleString("en-PH");

    tr.innerHTML = `
      <td class="fw-bold">${order.reference}</td>
      <td>${order.user || "-"}</td>
      <td>${date}</td>
      <td><span class="badge bg-secondary" id="status-${index}">${order.status}</span></td>
      <td>
        <select class="form-select form-select-sm" data-index="${index}">
          <option ${order.status === "Pending" ? "selected" : ""}>Pending</option>
          <option ${order.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
          <option ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
          <option ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
        </select>
      </td>
    `;
    table.appendChild(tr);
  });
}


// ================================================
// 4. UI & CART FUNCTIONS
// ================================================
function updateUI() {
  const currentCart = getCart();

  const cartBtn = document.getElementById('cartBtn');
  const cartCount = document.getElementById('cartCount');
  const cartItemsDiv = document.getElementById('cartItems');
  const cartTotalSpan = document.getElementById('cartTotal');
  const accountDropdown = document.getElementById('accountDropdown');
  const loginItem = document.getElementById('loginItem');
  const signupItem = document.getElementById('signupItem');
  const logoutBtn = document.getElementById('logoutBtn');
  const orderHistoryLink = document.getElementById('orderHistoryLink');

  // Account dropdown & login state
  if (accountDropdown) {
    if (isLoggedIn) {
      loginItem && (loginItem.style.display = 'none');
      signupItem && (signupItem.style.display = 'none');
      logoutBtn && (logoutBtn.style.display = 'block');
      accountDropdown.innerHTML = `Hello, ${currentUser}`;
      cartBtn && (cartBtn.style.display = 'inline-block');
      orderHistoryLink && (orderHistoryLink.style.display = 'block');
    } else {
      loginItem && (loginItem.style.display = 'block');
      signupItem && (signupItem.style.display = 'block');
      logoutBtn && (logoutBtn.style.display = 'none');
      accountDropdown.textContent = 'Account';
      cartBtn && (cartBtn.style.display = 'none');
      orderHistoryLink && (orderHistoryLink.style.display = 'none');
    }
  }

  // Cart count
  if (cartCount) cartCount.textContent = currentCart.length;

  // Cart modal
  if (cartItemsDiv && cartTotalSpan) {
    cartItemsDiv.innerHTML = '';
    let total = 0;

    if (currentCart.length === 0) {
      cartItemsDiv.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
    } else {
      currentCart.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between align-items-center mb-3 pb-2 border-bottom';
        div.innerHTML = `
          <div>
            <strong>${item.name}</strong><br>
            ${item.motorcycle && item.motorcycle !== 'Universal' ? `<small class="text-success">→ ${item.motorcycle}</small><br>` : ''}
            <div class="d-flex align-items-center gap-2 mt-1">
              <button class="btn btn-sm btn-outline-secondary" onclick="decreaseQty(${i})">➖</button>
              <span class="fw-bold">${item.qty}</span>
              <button class="btn btn-sm btn-outline-secondary" onclick="increaseQty(${i})">➕</button>
            </div>
          </div>
          <div class="text-end">
            <strong>₱${(item.price * item.qty).toLocaleString()}</strong><br>
            <button class="btn btn-sm btn-danger mt-1" onclick="removeFromCart(${i})">Remove</button>
          </div>`;
        cartItemsDiv.appendChild(div);
        total += item.price * item.qty;
      });
    }
    cartTotalSpan.textContent = total.toLocaleString();
  }
}

window.addToCart = function(id, name, price, qty = 1, motorcycle = 'Universal') {
  if (!isLoggedIn) {
    alert('Please login first!');
    new bootstrap.Modal(document.getElementById('loginModal')).show();
    return;
  }

  const currentCart = getCart();
  const quantity = parseInt(qty);
  const existingItem = currentCart.find(item => item.id === id && item.motorcycle === motorcycle);

  if (existingItem) {
    existingItem.qty += quantity;
  } else {
    currentCart.push({ id, name, price, qty: quantity, motorcycle });
  }

  saveCart(currentCart);
  updateUI();
  alert('Item added to cart!');
};

window.removeFromCart = function(i) {
  const currentCart = getCart();
  currentCart.splice(i, 1);
  saveCart(currentCart);
  updateUI();
};

function attachAddToCartButtons() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.onclick = function() {
      const card = this.closest('.card');
      const name = card.querySelector('h5').textContent;
      const price = parseInt(card.querySelector('.card-text.fw-bold').textContent.replace(/[^0-9]/g, ''));
      const qty = card.querySelector('.product-qty')?.value || 1;
      const select = card.querySelector('.motorcycle-select');
      const warning = card.querySelector('.select-warning');

      if (select && !select.value) {
        warning?.classList.remove('d-none');
        return;
      }
      warning?.classList.add('d-none');

      const id = parseInt(card.closest('.product-card').dataset.id);
      addToCart(id, name, price, qty, select ? select.value : 'Universal');
    };
  });
}

function autoUpdateOrderStatus() {
  const statusEl = document.getElementById('orderStatusText');
  if (!statusEl) return;

  let index = 0;
  function updateStatus() {
    if (index >= ORDER_STATUSES.length) return;
    statusEl.textContent = ORDER_STATUSES[index].label;
    statusEl.className = `badge ${ORDER_STATUSES[index].class}`;
    index++;
    if (index < ORDER_STATUSES.length) {
      setTimeout(updateStatus, 3000);
    }
  }
  updateStatus();
}


// ================================================
// 5. MAIN INITIALIZATION (DOMContentLoaded)
// ================================================
document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  brandContainer = document.getElementById('brandList');
  productContainer = document.getElementById('productList');
  searchInput = document.getElementById('searchInput');
  clearFilterBtn = document.getElementById('clearFilter');

  // Initial render
  renderBrands();
  renderProducts();
  attachAddToCartButtons();
  renderOrderHistory();

  // UI update after everything is rendered
  updateUI();

  // Brand filter
  brandContainer?.addEventListener('click', e => {
    const link = e.target.closest('[data-brand]');
    if (link) {
      e.preventDefault();
      filterByBrand(link.getAttribute('data-brand'));
      document.querySelectorAll('[data-brand]').forEach(a => a.classList.remove('text-primary'));
      link.classList.add('text-primary');
    }
  });

  // Clear filter
  clearFilterBtn?.addEventListener('click', () => {
    renderProducts();
    document.querySelectorAll('[data-brand]').forEach(a => a.classList.remove('text-primary'));
    if (searchInput) searchInput.value = '';
  });

  // Search
  searchInput?.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term));
    renderProducts(filtered);
  });
});

// === NEW TWO-STEP CHECKOUT FLOW ===
  document.addEventListener('click', e => {
    // Checkout → Open Review Order Modal
    if (e.target.id === 'checkoutBtn') {
      const cart = getCart();
      if (cart.length === 0) {
        alert('Cart is empty!');
        return;
      }

      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const shipping = subtotal >= 5000 ? 0 : 150;
      let grandTotal = subtotal + shipping;

      // Check for saved promo
      const promoCode = localStorage.getItem('appliedPromo') || '';
      const promoApplied = promoCode === 'KICK10';
      let discountAmount = 0;
      if (promoApplied) {
        discountAmount = Math.round(grandTotal * 0.10);
        grandTotal -= discountAmount;
      }

      finalGrandTotal = grandTotal; // Save for payment step

      // Fill review modal
      const reviewList = document.getElementById('reviewItemsList');
      reviewList.innerHTML = '';
      cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between border-bottom py-3';
        div.innerHTML = `
          <div>
            <strong>${item.name}</strong><br>
            ${item.motorcycle && item.motorcycle !== 'Universal' ? `<small class="text-success">→ ${item.motorcycle}</small>` : ''}
          </div>
          <div class="text-end">
            × ${item.qty} = ₱${(item.price * item.qty).toLocaleString('en-PH')}
          </div>
        `;
        reviewList.appendChild(div);
      });

      document.getElementById('reviewSubtotal').textContent = '₱' + subtotal.toLocaleString('en-PH');
      document.getElementById('reviewShipping').textContent = shipping === 0 ? 'FREE!' : '₱150';
      document.getElementById('reviewGrandTotal').textContent = '₱' + grandTotal.toLocaleString('en-PH');

      const discountRow = document.getElementById('reviewDiscountRow');
      const discountAmountEl = document.getElementById('reviewDiscountAmount');
      if (promoApplied && discountAmount > 0) {
        discountAmountEl.textContent = '-₱' + discountAmount.toLocaleString('en-PH');
        discountRow.classList.remove('d-none');
        discountAmountEl.classList.remove('d-none');
      } else {
        discountRow.classList.add('d-none');
        discountAmountEl.classList.add('d-none');
      }

      // Close cart modal and open review modal
      bootstrap.Modal.getInstance(document.getElementById('cartModal'))?.hide();
      new bootstrap.Modal(document.getElementById('reviewOrderModal')).show();
    }

    // Next → Go to Payment Details
    if (e.target.id === 'goToPaymentBtn') {
      bootstrap.Modal.getInstance(document.getElementById('reviewOrderModal')).hide();
      new bootstrap.Modal(document.getElementById('paymentDetailsModal')).show();

      // Show final total in payment modal
      document.getElementById('orderTotalAmount').textContent = finalGrandTotal.toLocaleString('en-PH');
      document.getElementById('grandTotalAmount').textContent = finalGrandTotal.toLocaleString('en-PH');
    }
  });

  // Promo code in Review Modal
  document.getElementById('reviewApplyPromo')?.addEventListener('click', () => {
    const code = document.getElementById('reviewPromoInput').value.trim().toUpperCase();
    const feedback = document.getElementById('reviewPromoFeedback');

    if (code === 'KICK10') {
      localStorage.setItem('appliedPromo', 'KICK10');
      feedback.textContent = '✓ KICK10 applied! 10% off';
      feedback.className = 'text-success fw-bold';
    } else {
      localStorage.removeItem('appliedPromo');
      feedback.textContent = code ? '✗ Invalid promo code' : '';
      feedback.className = code ? 'text-danger fw-bold' : '';
    }

    // Refresh review modal to update totals
    document.querySelector('#checkoutBtn').click();
  });

  // Order submission (unchanged — uses finalGrandTotal from review step)
  document.addEventListener('submit', e => {
    if (e.target.id === 'paymentDetailsForm') {
      e.preventDefault();

      const form = e.target;
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const orderRef = generateOrderRef();
      const orderStatus = DEFAULT_ORDER_STATUS;

      const name = document.getElementById('payerName').value.trim();
      const email = document.getElementById('payerEmail').value.trim();
      const address = document.getElementById('payerAddress').value.trim();
      const paymentMethod = document.getElementById('paymentMethod').value;

      emailjs.send('service_438wssi', 'template_j27m6cr', {
        order_ref: orderRef,
        to_name: name,
        to_email: email,
        total: '₱' + finalGrandTotal.toLocaleString('en-PH'),
        payment_method: paymentMethod,
        order_items: getCart().map(item =>
          `${item.name} ${item.motorcycle && item.motorcycle !== 'Universal' ? `(${item.motorcycle})` : ''} × ${item.qty}`
        ).join('\n'),
        delivery_address: address
      })
      .then(() => console.log('Order email sent successfully!'))
      .catch(err => {
        console.error('EmailJS error:', err);
        alert('Order placed! (Email notification may be delayed)');
      });
    }

//  // === PAYMENT MODAL LOGIC - SIMPLE & 100% WORKING FIX ===
// const checkoutBtn = document.getElementById('checkoutBtn');

// if (checkoutBtn) {
//   checkoutBtn.addEventListener('click', () => {
//     // Run AFTER the modal is open (when user clicks Checkout)
//     setTimeout(() => {
//       const cart = getCart();
//       if (cart.length === 0) return;

//       const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
//       const shipping = subtotal >= 5000 ? 0 : 150;
//       let grandTotal = subtotal + shipping;

//       // Update all totals
//       document.getElementById('subtotalAmount').textContent = subtotal.toLocaleString('en-PH');
//       document.getElementById('orderTotalAmount').textContent = grandTotal.toLocaleString('en-PH');
//       document.getElementById('grandTotalAmount').textContent = grandTotal.toLocaleString('en-PH');
//       document.getElementById('shippingFee').textContent = shipping === 0 ? 'FREE!' : '₱150';

//       // Update cart count and items
//       document.getElementById('cartItemsCount').textContent = cart.length;
//       const summaryList = document.getElementById('cartSummaryList');
//       summaryList.innerHTML = '';
//       cart.forEach(item => {
//         const p = document.createElement('p');
//         p.className = 'mb-1 small';
//         p.innerHTML = `<strong>${item.name}</strong><br>
//                        ${item.motorcycle && item.motorcycle !== 'Universal' ? `<small class="text-success">→ ${item.motorcycle}</small><br>` : ''}
//                        <small>× ${item.qty} = ₱${(item.price * item.qty).toLocaleString('en-PH')}</small>`;
//         summaryList.appendChild(p);
//       });

//       // Promo code
//       const applyBtn = document.getElementById('applyPromoBtn');
//       const promoInput = document.getElementById('promoCodeInput');
//       const promoFeedback = document.getElementById('promoFeedback');

//       if (applyBtn) {
//         applyBtn.onclick = () => {
//           const code = promoInput.value.trim().toUpperCase();
//           const isKick10 = code === 'KICK10';
//           const discount = isKick10 ? Math.round(grandTotal * 0.10) : 0;
//           grandTotal = isKick10 ? grandTotal - discount : subtotal + shipping;

//           document.getElementById('grandTotalAmount').textContent = grandTotal.toLocaleString('en-PH');
//           document.getElementById('orderTotalAmount').textContent = grandTotal.toLocaleString('en-PH');

//           promoFeedback.textContent = isKick10 ? '✓ KICK10 applied! 10% off' : (code ? '✗ Invalid promo code' : '');
//           promoFeedback.className = isKick10 ? 'text-success fw-bold mt-2' : (code ? 'text-danger fw-bold mt-2' : '');

//           // Update QR if visible
//           const qrInstruction = document.getElementById('qrInstructionText');
//           const selected = document.getElementById('paymentMethod').value;
//           const ewallet = ['QRPH', 'GCash', 'Maya', 'ShopeePay'];
//           if (qrInstruction && ewallet.includes(selected)) {
//             qrInstruction.textContent = `Scan to pay ₱${grandTotal.toLocaleString('en-PH')} using ${selected}`;
//           }
//         };
//       }

//       // QR toggle
//       const paymentMethodSelect = document.getElementById('paymentMethod');
//       const qrContainer = document.getElementById('qrCodeContainer');
//       const qrImage = document.getElementById('qrCodeImage');
//       const receiptSection = document.getElementById('receiptSection');
//       const receiptUpload = document.getElementById('receiptUpload');
//       const submitBtn = document.getElementById('submitOrderBtn');
//       const receiptRequired = document.getElementById('receiptRequired');

//       const toggleQR = () => {
//         const selected = paymentMethodSelect.value;
//         const ewallet = ['QRPH', 'GCash', 'Maya', 'ShopeePay'];
//         if (ewallet.includes(selected)) {
//           qrContainer.classList.remove('d-none');
//           qrImage.src = paymentMethodSelect.selectedOptions[0]?.dataset.qr || './image/QR.png';
//           receiptSection.classList.remove('d-none');
//           receiptUpload.required = true;
//           receiptUpload.onchange = () => {
//             const hasFile = receiptUpload.files.length > 0;
//             submitBtn.disabled = !hasFile;
//             receiptRequired.classList.toggle('d-none', hasFile);
//           };
//           // Update QR amount
//           const qrInstruction = document.getElementById('qrInstructionText');
//           if (qrInstruction) qrInstruction.textContent = `Scan to pay ₱${grandTotal.toLocaleString('en-PH')} using ${selected}`;
//         } else {
//           qrContainer.classList.add('d-none');
//           receiptSection.classList.add('d-none');
//           receiptUpload.required = false;
//           receiptUpload.value = '';
//           submitBtn.disabled = false;
//           receiptRequired.classList.add('d-none');
//         }
//       };

//       paymentMethodSelect.onchange = toggleQR;
//       toggleQR();

//     }, 500); // 500ms delay - enough for modal to open
//   });
// }

  // Login form
  document.addEventListener('submit', e => {
    if (e.target.id === 'loginForm') {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;
      const remember = document.getElementById('rememberMe').checked;

      if (users[username] && users[username] === password) {
        isLoggedIn = true;
        currentUser = username.charAt(0).toUpperCase() + username.slice(1);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', currentUser);
        if (remember) {
          localStorage.setItem('rememberedCredentials', JSON.stringify({ username, password }));
        } else {
          localStorage.removeItem('rememberedCredentials');
        }
        updateUI();
        renderOrderHistory();
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        alert(`Welcome back, ${currentUser}!`);
      } else {
        alert('Incorrect username or password!');
      }
    }
  });

  // Logout & Checkout
  document.addEventListener('click', e => {
    if (e.target.id === 'logoutBtn') {
      if (confirm('Log out?')) {
        isLoggedIn = false;
        currentUser = null;
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberedCredentials');
        updateUI();
        alert('Logged out. Your cart is saved!');
      }
    }

    if (e.target.id === 'checkoutBtn') {
      const currentCart = getCart();
      if (currentCart.length === 0) {
        alert('Cart is empty!');
        return;
      }
      bootstrap.Modal.getInstance(document.getElementById('cartModal'))?.hide();
      new bootstrap.Modal(document.getElementById('paymentDetailsModal')).show();
    }
  });

  // Order submission
  document.addEventListener('submit', e => {
    if (e.target.id === 'paymentDetailsForm') {
      e.preventDefault();

      const form = e.target;
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const orderRef = generateOrderRef();
      const orderStatus = DEFAULT_ORDER_STATUS;

      const name = document.getElementById('payerName').value.trim();
      const email = document.getElementById('payerEmail').value.trim();
      const address = document.getElementById('payerAddress').value.trim();
      const paymentMethod = document.getElementById('paymentMethod').value;

      const subtotal = calculateTotal();
      const shipping = subtotal >= 5000 ? 0 : 150;
      let grandTotal = subtotal + shipping;
      const displayedGrand = parseInt(document.getElementById('grandTotalAmount').textContent.replace(/[^0-9]/g, '')) || grandTotal;
      grandTotal = displayedGrand;

      emailjs.send('service_438wssi', 'template_j27m6cr', {
        order_ref: orderRef,
        to_name: name,
        to_email: email,
        total: '₱' + grandTotal.toLocaleString('en-PH'),
        payment_method: paymentMethod,
        order_items: getCart().map(item =>
          `${item.name} ${item.motorcycle && item.motorcycle !== 'Universal' ? `(${item.motorcycle})` : ''} × ${item.qty}`
        ).join('\n'),
        delivery_address: address
      })
      .then(() => console.log('Order email sent successfully!'))
      .catch(err => {
        console.error('EmailJS error:', err);
        alert('Order placed! (Email notification may be delayed)');
      });

      document.getElementById('paymentSummary').textContent =
        `Total: ₱${grandTotal.toLocaleString('en-PH')} • Payment: ${paymentMethod}`;

      const statusEl = document.getElementById('orderStatusText');
      if (statusEl) {
        statusEl.textContent = orderStatus;
        statusEl.className = 'badge bg-warning text-dark';
      }

      const refEl = document.getElementById('orderRefText');
      if (refEl) refEl.textContent = `Order Reference: ${orderRef}`;

      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      orders.push({
        reference: orderRef,
        user: currentUser,
        status: orderStatus,
        date: new Date().toISOString(),
        items: getCart().map(item => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          motorcycle: item.motorcycle || 'Universal'
        }))
      });
      localStorage.setItem('orders', JSON.stringify(orders));

      bootstrap.Modal.getInstance(document.getElementById('paymentDetailsModal')).hide();
      new bootstrap.Modal(document.getElementById('successModal')).show();
      autoUpdateOrderStatus();

      saveCart([]);
      updateUI();

      document.getElementById('successModal').addEventListener('hidden.bs.modal', () => {
        new bootstrap.Modal(document.getElementById('emailSentModal')).show();
      }, { once: true });
    }
  });

  // Admin features
  document.addEventListener("change", e => {
    if (e.target.matches("select[data-index]")) {
      const index = e.target.dataset.index;
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      orders[orders.length - 1 - index].status = e.target.value;
      localStorage.setItem("orders", JSON.stringify(orders));
      renderAdminOrders();
    }
  });

  document.addEventListener("click", e => {
    if (e.target.id === "clearAllOrdersBtn") {
      if (!confirm("Clear ALL orders? This cannot be undone.")) return;
      localStorage.removeItem("orders");
      renderAdminOrders();
    }
  });

  const adminLink = document.getElementById("adminOrdersLink");
  if (adminLink) {
    adminLink.style.display = currentUser === "Admin" ? "block" : "none";
  }
});


// ================================================
// 6. EMAILJS INITIALIZATION
// ================================================
(function () {
  if (typeof emailjs !== "undefined") {
    emailjs.init("qFyIf-WQG3wo4lvW-");
    console.log("EmailJS initialized");
  } else {
    console.error("EmailJS not loaded");
  }
})();

// document.addEventListener("click", e => {
//   if (e.target.id === "clearOrdersBtn") {
//     if (!confirm("Are you sure you want to clear all order history?")) return;

//     localStorage.removeItem("orders");
//     renderOrderHistory();

//     alert("All orders have been cleared.");
//   }
// });

// localStorage.removeItem("orders");