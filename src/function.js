
// ================= EMAILJS INIT (GLOBAL) =================
(function () {
  if (typeof emailjs !== "undefined") {
    emailjs.init("qFyIf-WQG3wo4lvW-"); // ✅ your public key
    console.log("EmailJS initialized");
  } else {
    console.error("EmailJS not loaded");
  }
})();



let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let currentUser = localStorage.getItem('currentUser') || null;

const users = { admin: '12345', chester: 'kickbarks', test: '123456' };

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

// === ORDER REFERENCE GENERATOR ===
function generateOrderRef() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `KB-${y}${m}${day}-${rand}`;
}

// === DEFAULT ORDER STATUS ===
const DEFAULT_ORDER_STATUS = 'Pending';


// === CART HELPERS ===
const getCart = () => JSON.parse(localStorage.getItem('cart')) || [];
const saveCart = (newCart) => localStorage.setItem('cart', JSON.stringify(newCart));
const calculateTotal = () => getCart().reduce((sum, item) => sum + item.price * item.qty, 0);

let brandContainer = null, productContainer = null, searchInput = null, clearFilterBtn = null;

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
        <img src="${imgSrc}" onerror="this.src='https://via.placeholder.com/150/333333/FFFFFF?text=${brand}'" class="img-fluid rounded mb-3 shadow-sm" alt="${brand}" style="width:140px; height:140px; object-fit:contain; background:#fff; padding:10px; border-radius:12px;">
        <h6 class="fw-bold text-dark mt-2">${brand}</h6>
      </a>
    `;
    brandContainer.appendChild(col);
  });
}

// === ORDER STATUS FLOW ===
const ORDER_STATUSES = [
  { label: 'Pending', class: 'bg-warning text-dark' },
  { label: 'Confirmed', class: 'bg-info text-dark' },
  { label: 'Shipped', class: 'bg-primary' },
  { label: 'Delivered', class: 'bg-success' }
];

function autoUpdateOrderStatus() {
  const statusEl = document.getElementById('orderStatusText');
  if (!statusEl) return;

  let index = 0;

  function updateStatus() {
    if (index >= ORDER_STATUSES.length) return;

    statusEl.textContent = ORDER_STATUSES[index].label;
    statusEl.className = `badge ${ORDER_STATUSES[index].class}`;

    index++;

    // Delay before next status
    if (index < ORDER_STATUSES.length) {
      setTimeout(updateStatus, 3000); // ⏱ 3 seconds per stage
    }
  }

  updateStatus();
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
          ${p.motorcycles.length > 0 ? `<select class="form-select mb-2 motorcycle-select"><option value="">-- Select Motorcycle --</option>${p.motorcycles.map(m => `<option value="${m}">${m}</option>`).join('')}</select><small class="text-danger d-none select-warning">Please select motorcycle</small>` : ''}
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

  // === ACCOUNT UI ===
  if (accountDropdown) {
    if (isLoggedIn) {
      loginItem.style.display = 'none';
      signupItem.style.display = 'none';
      logoutBtn.style.display = 'block';
      accountDropdown.innerHTML = `Hello, ${currentUser}`;

      if (cartBtn) cartBtn.style.display = 'inline-block';
      if (orderHistoryLink) orderHistoryLink.style.display = 'block';
    } else {
      loginItem.style.display = 'block';
      signupItem.style.display = 'block';
      logoutBtn.style.display = 'none';
      accountDropdown.textContent = 'Account';

      if (cartBtn) cartBtn.style.display = 'none';
      if (orderHistoryLink) orderHistoryLink.style.display = 'none';
    }
  }

  // === CART COUNT ===
  if (cartCount) cartCount.textContent = currentCart.length;

  // === CART MODAL ===
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
            ${
              item.motorcycle && item.motorcycle !== 'Universal'
                ? `<small class="text-success">→ ${item.motorcycle}</small><br>`
                : ''
            }
            <small>× ${item.qty}</small>
          </div>
          <div class="text-end">
            <strong>₱${(item.price * item.qty).toLocaleString()}</strong><br>
            <button class="btn btn-sm btn-danger mt-1" onclick="removeFromCart(${i})">
              Remove
            </button>
          </div>
        `;

        cartItemsDiv.appendChild(div);
        total += item.price * item.qty;
      });
    }

    cartTotalSpan.textContent = total.toLocaleString();
  }
}


window.removeFromCart = function(i) {
  const currentCart = getCart();
  currentCart.splice(i, 1);
  saveCart(currentCart);
  updateUI();
};

window.addToCart = function(name, price, qty = 1, motorcycle = '') {
  if (!isLoggedIn) {
    alert('Please login first!');
    new bootstrap.Modal(document.getElementById('loginModal')).show();
    return;
  }
  const currentCart = getCart();
  currentCart.push({ name, price, qty: parseInt(qty), motorcycle: motorcycle || 'Universal' });
  saveCart(currentCart);
  updateUI();
  alert('Added to cart!');
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
        warning.classList.remove('d-none');
        return;
      }
      if (warning) warning.classList.add('d-none');
      addToCart(name, price, qty, select ? select.value : '');
    };
  });
}

// === SINGLE DOMCONTENTLOADED ===
document.addEventListener('DOMContentLoaded', () => {
  brandContainer = document.getElementById('brandList');
  productContainer = document.getElementById('productList');
  searchInput = document.getElementById('searchInput');
  clearFilterBtn = document.getElementById('clearFilter');

  renderBrands();
  renderProducts();
  attachAddToCartButtons();
  renderOrderHistory();


  brandContainer?.addEventListener('click', e => {
    const link = e.target.closest('[data-brand]');
    if (link) {
      e.preventDefault();
      filterByBrand(link.getAttribute('data-brand'));
      document.querySelectorAll('[data-brand]').forEach(a => a.classList.remove('text-primary'));
      link.classList.add('text-primary');
    }
  });

  clearFilterBtn?.addEventListener('click', () => {
    renderProducts();
    document.querySelectorAll('[data-brand]').forEach(a => a.classList.remove('text-primary'));
    if (searchInput) searchInput.value = '';
  });

  searchInput?.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term));
    renderProducts(filtered);
  });

       // === PAYMENT MODAL LOGIC ===
  const paymentMethodSelect = document.getElementById('paymentMethod');
  const paymentModal = document.getElementById('paymentDetailsModal');

  if (paymentMethodSelect && paymentModal) {
    let qrContainer, qrImage, receiptSection, receiptUpload, submitBtn, receiptRequired, instructionText;
    let promoApplied = false;
    const ewalletMethods = ['QRPH', 'GCash', 'Maya', 'ShopeePay'];

    const resetPaymentState = () => {
      if (qrContainer) qrContainer.classList.add('d-none');
      if (receiptSection) receiptSection.classList.add('d-none');
      if (receiptUpload) {
        receiptUpload.required = false;
        receiptUpload.removeAttribute('required');
        receiptUpload.value = '';
      }
      if (submitBtn) submitBtn.disabled = false;
      if (receiptRequired) receiptRequired.classList.add('d-none');
    };

    const updatePaymentUI = () => {
      resetPaymentState();

      const selected = paymentMethodSelect.value;
      if (!selected) return;

      const subtotal = calculateTotal();
      const shipping = subtotal >= 5000 ? 0 : 150;
      let total = subtotal + shipping;
      if (promoApplied) total = Math.round(total * 0.90);

      const displayedTotal = parseInt(document.getElementById('grandTotalAmount').textContent.replace(/[^0-9]/g, '')) || total;

      if (ewalletMethods.includes(selected)) {
        qrContainer.classList.remove('d-none');
        qrImage.src = paymentMethodSelect.selectedOptions[0]?.dataset.qr || './image/QR.png';
        instructionText.textContent = `Scan to pay ₱${displayedTotal.toLocaleString('en-PH')} using ${selected}`;

        receiptSection.classList.remove('d-none');
        receiptUpload.required = true;
        receiptUpload.setAttribute('required', '');

        const hasFile = receiptUpload.files.length > 0;
        submitBtn.disabled = !hasFile;
        receiptRequired.classList.toggle('d-none', hasFile);
      } else {
        submitBtn.disabled = false;
        const bankUrl = paymentMethodSelect.selectedOptions[0]?.dataset.url;
        if (bankUrl) window.open(bankUrl, '_blank');
      }
    };

    paymentModal.addEventListener('show.bs.modal', () => {
      setTimeout(() => {
        qrContainer = document.getElementById('qrCodeContainer');
        qrImage = document.getElementById('qrCodeImage');
        receiptSection = document.getElementById('receiptSection');
        receiptUpload = document.getElementById('receiptUpload');
        submitBtn = document.getElementById('submitOrderBtn');
        receiptRequired = document.getElementById('receiptRequired');
        instructionText = document.getElementById('qrInstructionText');

        resetPaymentState();
        promoApplied = false;

        const subtotal = calculateTotal();
        const shipping = subtotal >= 5000 ? 0 : 150;
        let grandTotal = subtotal + shipping;

        document.getElementById('orderTotalAmount').textContent = subtotal.toLocaleString('en-PH');
        document.getElementById('subtotalAmount').textContent = subtotal.toLocaleString('en-PH');
        document.getElementById('shippingFee').textContent = shipping === 0 ? 'FREE!' : '₱150';
        document.getElementById('grandTotalAmount').textContent = grandTotal.toLocaleString('en-PH');

        // Cart summary
        const cart = getCart();
        const itemsCountEl = document.getElementById('cartItemsCount');
        const summaryList = document.getElementById('cartSummaryList');
        if (itemsCountEl) itemsCountEl.textContent = cart.length;
        if (summaryList) {
          summaryList.innerHTML = '';
          if (cart.length === 0) {
            summaryList.innerHTML = '<p class="text-muted small">Your cart is empty.</p>';
          } else {
            cart.forEach(item => {
              const p = document.createElement('p');
              p.className = 'mb-1 small';
              p.innerHTML = `<strong>${item.name}</strong><br>
                             ${item.motorcycle && item.motorcycle !== 'Universal' ? `<small class="text-success">→ ${item.motorcycle}</small><br>` : ''}
                             <small>× ${item.qty} = ₱${(item.price * item.qty).toLocaleString('en-PH')}</small>`;
              summaryList.appendChild(p);
            });
          }
        }

        // Promo code
        const applyBtn = document.getElementById('applyPromoBtn');
        const promoInput = document.getElementById('promoCodeInput');
        const promoFeedback = document.getElementById('promoFeedback');

        if (applyBtn && promoInput && promoFeedback) {
          const newBtn = applyBtn.cloneNode(true);
          applyBtn.parentNode.replaceChild(newBtn, applyBtn);

          newBtn.onclick = () => {
            const code = promoInput.value.trim().toUpperCase();
            let currentTotal = subtotal + shipping;

            if (code === 'KICK10') {
              const discount = Math.round(currentTotal * 0.10);
              currentTotal -= discount;
              promoApplied = true;
              promoFeedback.textContent = `Applied KICK10! ₱${discount} off`;
              promoFeedback.className = 'text-success mt-1 d-block';
            } else if (code) {
              promoFeedback.textContent = 'Invalid promo code';
              promoFeedback.className = 'text-danger mt-1 d-block';
            } else {
              promoFeedback.textContent = '';
              promoFeedback.className = '';
            }

            document.getElementById('grandTotalAmount').textContent = currentTotal.toLocaleString('en-PH');
            updatePaymentUI();
          };
        }

        // File upload listener
        receiptUpload.onchange = () => {
          const hasFile = receiptUpload.files.length > 0;
          if (ewalletMethods.includes(paymentMethodSelect.value)) {
            submitBtn.disabled = !hasFile;
            receiptRequired.classList.toggle('d-none', hasFile);
          }
        };

        paymentMethodSelect.onchange = updatePaymentUI;

        updatePaymentUI();

      }, 100);
    });
  }

  // === SIMPLIFIED forceDisableReceiptIfNotQR ===
  const forceDisableReceiptIfNotQR = () => {
    const paymentMethod = document.getElementById('paymentMethod')?.value || '';
    const receiptUpload = document.getElementById('receiptUpload');

    if (!receiptUpload) return;

    if (['QRPH', 'GCash', 'Maya', 'ShopeePay'].includes(paymentMethod)) {
      receiptUpload.required = true;
      receiptUpload.setAttribute('required', '');
    } else {
      receiptUpload.required = false;
      receiptUpload.removeAttribute('required');
    }
  };

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
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        alert(`Welcome back, ${currentUser}!`);
      } else {
        alert('Incorrect username or password!');
      }
    }
  });

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

  document.addEventListener('submit', e => {
    if (e.target.id === 'paymentDetailsForm') {
      e.preventDefault();

      forceDisableReceiptIfNotQR();

      const form = e.target;
if (!form.checkValidity()) {
  form.classList.add('was-validated');
  return;
}

const orderRef = generateOrderRef(); // ✅ ADD
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
  order_ref: orderRef, // ✅ ADD
  to_name: name,
  to_email: email,
  total: '₱' + grandTotal.toLocaleString('en-PH'),
  payment_method: paymentMethod,
  order_items: getCart()
    .map(item =>
      `${item.name} ${item.motorcycle && item.motorcycle !== 'Universal'
        ? `(${item.motorcycle})`
        : ''} × ${item.qty}`
    )
    .join('\n'),
  delivery_address: address
})
.then(() => {
  console.log('Order email sent successfully!');
})
.catch(err => {
  console.error('EmailJS error:', err);
  alert('Order placed! (Email notification may be delayed)');
});


      document.getElementById('paymentSummary').textContent =
        `Total: ₱${grandTotal.toLocaleString('en-PH')} • Payment: ${paymentMethod}`;

        const statusEl = document.getElementById('orderStatusText');
if (statusEl) {
  statusEl.textContent = orderStatus;

  // Optional: color based on status
  statusEl.className = 'badge bg-warning text-dark';
}


        const refEl = document.getElementById('orderRefText');
if (refEl) {
  refEl.textContent = `Order Reference: ${orderRef}`;
}


// === SAVE ORDER FOR TRACKING (WITH ITEMS) ===
const orders = JSON.parse(localStorage.getItem('orders')) || [];

orders.push({
  reference: orderRef,
  status: orderStatus,
  date: new Date().toISOString(),
  items: getCart().map(item => ({
    name: item.name,
    qty: item.qty,
    price: item.price,
    motorcycle: item.motorcycle || 'Universal'
  }))
});

localStorage.setItem('orders', JSON.stringify(orders));



      bootstrap.Modal.getInstance(document.getElementById('paymentDetailsModal')).hide();
      new bootstrap.Modal(document.getElementById('successModal')).show();
      autoUpdateOrderStatus(); // 🚀 start automatic status changes


      saveCart([]);
      updateUI();

      document.getElementById('successModal').addEventListener('hidden.bs.modal', () => {
        new bootstrap.Modal(document.getElementById('emailSentModal')).show();
      }, { once: true });
    }
  });
});

// Initial UI update
updateUI();

// ================= ORDER HISTORY PAGE =================
function renderOrderHistory() {
  const tbody = document.getElementById("orderHistoryBody");
  const noOrdersMessage = document.getElementById("noOrdersMessage");

  if (!tbody || !noOrdersMessage) return;

  if (!isLoggedIn) {
    alert("Please login to view your order history.");
    location.href = "/index.html";
    return;
  }

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  if (orders.length === 0) {
    noOrdersMessage.classList.remove("d-none");
    return;
  }

  tbody.innerHTML = "";

  orders.slice().reverse().forEach(order => {
    const tr = document.createElement("tr");

    const date = new Date(order.date).toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    let statusClass = "bg-secondary";
    if (order.status === "Pending") statusClass = "bg-warning text-dark";
    if (order.status === "Confirmed") statusClass = "bg-info text-dark";
    if (order.status === "Shipped") statusClass = "bg-primary";
    if (order.status === "Delivered") statusClass = "bg-success";

    const itemsHtml = order.items
      ? order.items.map(item => `
          <div class="small">
            • ${item.name}
            ${item.motorcycle !== 'Universal' ? `(${item.motorcycle})` : ''}
            × ${item.qty}
          </div>
        `).join("")
      : `<div class="text-muted small">No item data</div>`;

    tr.innerHTML = `
      <td class="fw-bold">${order.reference}</td>
      <td>${date}</td>
      <td>${itemsHtml}</td>
      <td>
        <span class="badge ${statusClass}">
          ${order.status}
        </span>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

