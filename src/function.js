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

  if (accountDropdown) {
    if (isLoggedIn) {
      loginItem.style.display = 'none';
      signupItem.style.display = 'none';
      logoutBtn.style.display = 'block';
      accountDropdown.innerHTML = `Hello, ${currentUser}`;
      if (cartBtn) cartBtn.style.display = 'inline-block';
    } else {
      loginItem.style.display = 'block';
      signupItem.style.display = 'block';
      logoutBtn.style.display = 'none';
      accountDropdown.textContent = 'Account';
      if (cartBtn) cartBtn.style.display = 'none';
    }
  }

  if (cartCount) cartCount.textContent = currentCart.length;

  if (cartItemsDiv && cartTotalSpan) {
    cartItemsDiv.innerHTML = '';
    let total = 0;
    if (currentCart.length === 0) {
      cartItemsDiv.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
    } else {
      currentCart.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between align-items-center mb-3 pb-2 border-bottom';
        div.innerHTML = `<div><strong>${item.name}</strong><br>${item.motorcycle && item.motorcycle !== 'Universal' ? `<small class="text-success">→ ${item.motorcycle}</small><br>` : ''}<small>× ${item.qty}</small></div>
          <div class="text-end"><strong>₱${(item.price * item.qty).toLocaleString()}</strong><br><button class="btn btn-sm btn-danger mt-1" onclick="removeFromCart(${i})">Remove</button></div>`;
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
    let qrContainer, qrImage, receiptUpload, submitBtn, receiptRequired, instructionText;
    let promoApplied = false; // Track if promo is applied

    const ewalletMethods = ['QRPH', 'GCash', 'Maya', 'ShopeePay'];

    const resetPaymentExtras = () => {
      if (qrContainer) qrContainer.classList.add('d-none');
      if (qrImage) qrImage.src = '';
      if (receiptUpload) {
        receiptUpload.value = '';
        receiptUpload.required = false;
      }
      if (submitBtn) submitBtn.disabled = false;
      if (receiptRequired) receiptRequired.classList.add('d-none');
      if (instructionText) instructionText.textContent = 'Scan to Pay with QRPH';
    };

    const showQRAndRequireReceipt = (qrSrc, methodName, grandTotal) => {
      qrContainer.classList.remove('d-none');
      qrImage.src = qrSrc || './image/QR.png';
      instructionText.textContent = `Scan to pay ₱${grandTotal.toLocaleString('en-PH')} using ${methodName}`;

      receiptUpload.required = true;
      submitBtn.disabled = true;
      receiptRequired.classList.remove('d-none');
    };

    const handlePaymentChange = () => {
      resetPaymentExtras();

      const selectedValue = paymentMethodSelect.value;
      const selectedOption = paymentMethodSelect.selectedOptions[0];

      if (!selectedValue) return;

      const subtotal = calculateTotal();
      const shipping = subtotal >= 5000 ? 0 : 150;
      let grandTotal = subtotal + shipping;

      if (promoApplied) {
        grandTotal = Math.round(grandTotal * 0.90); // 10% off
      }

      if (ewalletMethods.includes(selectedValue)) {
        let qrSrc = selectedOption?.dataset.qr || './image/QR.png';
        showQRAndRequireReceipt(qrSrc, selectedValue, grandTotal);
        return;
      }

      if (['BDO', 'BPI', 'Metrobank'].includes(selectedValue)) {
        const url = selectedOption?.dataset.url;
        if (url) window.open(url, '_blank');
      }
    };

    const handleReceiptChange = () => {
      if (ewalletMethods.includes(paymentMethodSelect.value)) {
        const hasFile = receiptUpload.files && receiptUpload.files.length > 0;
        submitBtn.disabled = !hasFile;
        receiptRequired.classList.toggle('d-none', hasFile);
      }
    };

    paymentModal.addEventListener('show.bs.modal', () => {
      setTimeout(() => {
        qrContainer = document.getElementById('qrCodeContainer');
        qrImage = document.getElementById('qrCodeImage');
        receiptUpload = document.getElementById('receiptUpload');
        submitBtn = document.getElementById('submitOrderBtn');
        receiptRequired = document.getElementById('receiptRequired');
        instructionText = qrContainer?.querySelector('p.fw-bold');

        resetPaymentExtras();

        const subtotal = calculateTotal();
        const cart = getCart();

        // Update prominent total
        const totalElement = document.getElementById('orderTotalAmount');
        if (totalElement) {
          totalElement.textContent = subtotal > 0 ? subtotal.toLocaleString('en-PH') : '0';
        }

        // Cart summary
        const itemsCount = document.getElementById('cartItemsCount');
        const summaryList = document.getElementById('cartSummaryList');
        if (itemsCount) itemsCount.textContent = cart.length;
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

        // Shipping & grand total
        const shipping = subtotal >= 5000 ? 0 : 150;
        let grandTotal = subtotal + shipping;

        document.getElementById('subtotalAmount').textContent = subtotal.toLocaleString('en-PH');
        document.getElementById('shippingFee').textContent = shipping === 0 ? 'FREE!' : '₱150';
        document.getElementById('grandTotalAmount').textContent = grandTotal.toLocaleString('en-PH');

        // Promo code - attach only once
        const applyBtn = document.getElementById('applyPromoBtn');
        const promoInput = document.getElementById('promoCodeInput');
        const promoFeedback = document.getElementById('promoFeedback');

        if (applyBtn && promoInput && promoFeedback) {
          // Remove any previous listener to prevent duplicates
          applyBtn.replaceWith(applyBtn.cloneNode(true));
          const newApplyBtn = document.getElementById('applyPromoBtn');

          newApplyBtn.onclick = () => {
            const code = promoInput.value.trim().toUpperCase();
            promoApplied = false;

            if (code === 'KICK10') {
              const discount = Math.round(grandTotal * 0.10);
              grandTotal -= discount;
              promoApplied = true;
              promoFeedback.textContent = `Applied KICK10! ₱${discount} off`;
              promoFeedback.className = 'text-success mt-1 d-block';
            } else if (code === '') {
              promoFeedback.textContent = '';
            } else {
              promoFeedback.textContent = 'Invalid promo code';
              promoFeedback.className = 'text-danger mt-1 d-block';
            }

            document.getElementById('grandTotalAmount').textContent = grandTotal.toLocaleString('en-PH');
            handlePaymentChange(); // Update QR if needed
          };
        }

        // Update QR instruction
        if (instructionText && grandTotal > 0) {
          instructionText.textContent = `Scan to pay ₱${grandTotal.toLocaleString('en-PH')} using selected method`;
        }

        // Re-attach listeners
        paymentMethodSelect.removeEventListener('change', handlePaymentChange);
        paymentMethodSelect.addEventListener('change', handlePaymentChange);

        if (receiptUpload) {
          receiptUpload.removeEventListener('change', handleReceiptChange);
          receiptUpload.addEventListener('change', handleReceiptChange);
        }

        if (paymentMethodSelect.value) {
          handlePaymentChange();
        }

      }, 150);
    });
  }
});

// === OTHER EVENTS ===
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
      if (remember) localStorage.setItem('rememberedCredentials', JSON.stringify({ username, password }));
      else localStorage.removeItem('rememberedCredentials');
      updateUI();
      bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
      alert(`Welcome back, ${currentUser}!`);
    } else alert('Incorrect username or password!');
  }
});

document.addEventListener('click', e => {
  if (e.target.id === 'logoutBtn') {
    if (confirm('Log out?')) {
      isLoggedIn = false;
      currentUser = null;
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.removeItem('currentUser');
      updateUI();
      alert('Logged out. Your cart is saved!');
    }
  }

  if (e.target.id === 'checkoutBtn') {
    const currentCart = getCart();
    if (currentCart.length === 0) return alert('Cart is empty!');
    bootstrap.Modal.getInstance(document.getElementById('cartModal'))?.hide();
    new bootstrap.Modal(document.getElementById('paymentDetailsModal')).show();
  }
});

document.addEventListener('submit', e => {
  if (e.target.id === 'paymentDetailsForm') {
    e.preventDefault();

    if (!e.target.checkValidity()) {
      e.target.classList.add('was-validated');
      return;
    }

    const name = document.getElementById('payerName').value.trim();
    const email = document.getElementById('payerEmail').value.trim();
    const address = document.getElementById('payerAddress').value.trim();
    const birthday = document.getElementById('payerBirthday').value;
    const age = document.getElementById('payerAge').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    const subtotal = calculateTotal();
    const shipping = subtotal >= 5000 ? 0 : 150;
    let grandTotal = subtotal + shipping;

    // Apply promo if used (we'll use the displayed one)
    const displayedGrand = parseInt(document.getElementById('grandTotalAmount').textContent.replace(/[^0-9]/g, '')) || grandTotal;
    grandTotal = displayedGrand;

    emailjs.send('service_438wssi', 'template_j27m6cr', {
      to_name: name,
      to_email: email,
      total: '₱' + grandTotal.toLocaleString(),
      payment_method: paymentMethod,
      order_items: getCart().map(item => `${item.name} × ${item.qty}`).join('\n'),
      delivery_address: address
    })
    .then(() => console.log('Email sent successfully!'))
    .catch(err => console.error('Email failed:', err));

    document.getElementById('paymentSummary').textContent = 
      `Total: ₱${grandTotal.toLocaleString()} • Payment: ${paymentMethod}`;

    bootstrap.Modal.getInstance(document.getElementById('paymentDetailsModal')).hide();
    new bootstrap.Modal(document.getElementById('successModal')).show();

    saveCart([]);
    updateUI();

    document.getElementById('successModal').addEventListener('hidden.bs.modal', () => {
      new bootstrap.Modal(document.getElementById('emailSentModal')).show();
    }, { once: true });
  }
});

// Initial update
updateUI();