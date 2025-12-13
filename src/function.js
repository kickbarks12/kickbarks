let cart = JSON.parse(localStorage.getItem('cart')) || [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let currentUser = localStorage.getItem('currentUser') || null;

const users = { admin: '12345', chester: 'kickbarks', test: '123456' };

const products = [
  { id: 1, name: 'CWORKS TOYOTA TSUSHO CLUTCH BELL WITH GROOVE', price: 1199, brand: 'CWORKS', img: './image/cworksbell.png', motorcycles: ['NMAX', 'Aerox', 'Click125'] },
  { id: 2, name: 'CWORKS TOYOTA TSUSHO CLUTCH LINING', price: 1499, brand: 'CWORKS', img: './image/cworksclutchlining.png', motorcycles: ['NMAX', 'Aerox', 'Click125'] },
  { id: 3, name: 'JVT CENTER SPRING FOR NMAX/AEROX', price: 499, brand: 'JVT', img: './image/jvtcenterspring.png', motorcycles: ['NMAX', 'Aerox'] },
  { id: 4, name: 'JVT PULLEY SET FOR NMAX 155, AEROX 155 V1/V2', price: 2299, brand: 'JVT', img: './image/jvtpulley.png', motorcycles: ['NMAX', 'Aerox'] },
  { id: 5, name: 'RCB E2 BRAKE LEVER FOR BEAT F.I, CLICK 125/150 V1,V2, SNIPER 150,NMAX V1,V2', price: 999, brand: 'Racing Boy', img: './image/rcbbrakelever.png', motorcycles: ['NMAX', 'Aerox', 'Click125'] },
  { id: 6, name: 'RACING BOY (RCB) SHOCK A2 Series 295mm/330mm', price: 1399, brand: 'Racing Boy', img: './image/rcbshock.png', motorcycles: ['Click125', 'Beat'] },
  { id: 7, name: 'RS8 CVT CLEANER SPRAY DEGREASER 450ML ORIGINAL', price: 119, brand: 'RS8', img: './image/rs8cvtcleaner.png', motorcycles: [] },
  { id: 8, name: 'RS8 ECO SCOOTER 10W-40 API SL SYNTHETIC MOTORCYCLE ENGINE OIL', price: 249, brand: 'RS8', img: './image/rs8ecoscooter.png', motorcycles: [] },
];

const brands = [...new Set(products.map(p => p.brand))].sort();

let brandContainer = null, productContainer = null, searchInput = null, clearFilterBtn = null;

function renderBrands() {
  if (!brandContainer) return;
  brandContainer.innerHTML = '';

  const brandLogos = {
    'CWORKS': 'cworkslogo.png',
    'JVT': 'jvtlogo.png',
    'Racing Boy': 'rcb.png',   // note the space → we handle it
    'RS8': 'rs8.png'
  };

  brands.forEach(brand => {
    const col = document.createElement('div');
    col.className = 'col text-center brand-card';

    // Use real logo if exists, fallback to placeholder
    const logoFile = brandLogos[brand] || `${brand.toLowerCase().replace(/\s+/g, '-')}.png`;
    const imgSrc = `./image/brands/${logoFile}`;

    col.innerHTML = `
      <a href="#" class="text-decoration-none d-block" data-brand="${brand}">
        <img 
          src="${imgSrc}" 
          onerror="this.src='https://via.placeholder.com/150/333333/FFFFFF?text=${brand}'"
          class="img-fluid rounded mb-3 shadow-sm" 
          alt="${brand}" 
          style="width:140px; height:140px; object-fit:contain; background:#fff; padding:10px; border-radius:12px;">
        <h6 class="fw-bold text-dark mt-2">${brand}</h6>
      </a>
    `;

    brandContainer.appendChild(col);
  });
}

function renderProducts(filtered = products) {
  if (!productContainer) return;
  productContainer.innerHTML = '';
  filtered.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-md-3 mb-4 product-card';
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
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
  if (cartCount) cartCount.textContent = cart.length;
  if (cartItemsDiv && cartTotalSpan) {
    cartItemsDiv.innerHTML = '';
    let total = 0;
    if (cart.length === 0) {
      cartItemsDiv.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
    } else {
      cart.forEach((item, i) => {
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
  cart.splice(i, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateUI();
};

window.addToCart = function(name, price, qty = 1, motorcycle = '') {
  if (!isLoggedIn) {
    alert('Please login first!');
    new bootstrap.Modal(document.getElementById('loginModal')).show();
    return;
  }
  cart.push({ name, price, qty: parseInt(qty), motorcycle: motorcycle || 'Universal' });
  localStorage.setItem('cart', JSON.stringify(cart));
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

function loadSavedCredentials() {
  const saved = localStorage.getItem('rememberedCredentials');
  if (saved) {
    const { username, password } = JSON.parse(saved);
    document.getElementById('loginUsername').value = username;
    document.getElementById('loginPassword').value = password;
    document.getElementById('rememberMe').checked = true;
  }
}

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
});

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
  document.addEventListener('click', e => {
  // Logout
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

  // Checkout - Open Payment Choice
  if (e.target.id === 'checkoutBtn') {
    if (cart.length === 0) return alert('Cart is empty!');

    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();

    // Prevent multiple listeners
    const codBtn = document.getElementById('codBtn');
    const onlineBtn = document.getElementById('onlineBtn');
    codBtn.onclick = null;
    onlineBtn.onclick = null;

    codBtn.onclick = () => processOrder('Cash on Delivery (COD)', paymentModal);
    onlineBtn.onclick = () => processOrder('Online Payment (GCash, Maya, Card, etc.)', paymentModal);
  }
});

function processOrder(paymentMethod, paymentModal) {
  let total = 0;
  let orderDetails = `ORDER CONFIRMATION - Kickbarks Motoshop\n\n`;
  orderDetails += `Date: ${new Date().toLocaleDateString('en-PH')}\n`;
  orderDetails += `Customer: ${currentUser}\n\n`;
  orderDetails += `ITEMS:\n`;

  cart.forEach(item => {
    orderDetails += `• ${item.name}\n`;
    if (item.motorcycle && item.motorcycle !== 'Universal') orderDetails += `  → ${item.motorcycle}\n`;
    orderDetails += `  × ${item.qty} = ₱${(item.price * item.qty).toLocaleString()}\n\n`;
    total += item.price * item.qty;
  });

  orderDetails += `TOTAL AMOUNT: ₱${total.toLocaleString()}\n`;
  orderDetails += `PAYMENT METHOD: ${paymentMethod}\n\n`;
  orderDetails += `Thank you for your order! We will contact you soon for delivery.\n`;
  orderDetails += `Kickbarks Motoshop Team`;

  // Show success
  document.getElementById('paymentSummary').textContent = 
    `Total: ₱${total.toLocaleString()} • Payment: ${paymentMethod}`;

  const successModal = new bootstrap.Modal(document.getElementById('successModal'));
  successModal.show();

  paymentModal.hide();

  // Clear cart
  cart = [];
  localStorage.setItem('cart', '[]');
  updateUI();

  // Show "Email Sent" after success modal closes
  document.getElementById('successModal').addEventListener('hidden.bs.modal', function () {
    const emailModal = new bootstrap.Modal(document.getElementById('emailSentModal'));
    emailModal.show();
  }, { once: true });
}

document.addEventListener('shown.bs.modal', e => {
  if (e.target.id === 'loginModal') loadSavedCredentials();
});


updateUI();