// ===== ADMIN CREDENTIALS (CHANGE THESE) =====
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// ===== ELEMENTS =====
const loginBox = document.getElementById("adminLoginBox");
const ordersBox = document.getElementById("adminOrdersBox");
const loginBtn = document.getElementById("adminLoginBtn");
const logoutBtn = document.getElementById("adminLogoutBtn");
const loginMsg = document.getElementById("loginMsg");

// ===== CHECK LOGIN STATE =====
function checkAdminAuth() {
  const loggedIn = localStorage.getItem("adminLoggedIn") === "true";
  loginBox.classList.toggle("d-none", loggedIn);
  ordersBox.classList.toggle("d-none", !loggedIn);
  if (loggedIn) loadOrders();
}

// ===== LOGIN =====
loginBtn?.addEventListener("click", () => {
  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value.trim();

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    localStorage.setItem("adminLoggedIn", "true");
    loginMsg.textContent = "";
    checkAdminAuth();
  } else {
    loginMsg.textContent = "Invalid admin credentials.";
  }
});

// ===== LOGOUT =====
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("adminLoggedIn");
  checkAdminAuth();
});

// ===== ORDER MANAGEMENT =====
const STATUS_COLORS = {
  Pending: "bg-warning text-dark",
  Confirmed: "bg-info text-dark",
  Shipped: "bg-primary",
  Delivered: "bg-success"
};

function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const tbody = document.getElementById("orderTableBody");
  tbody.innerHTML = "";

  if (orders.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='3'>No orders found</td></tr>";
    return;
  }

  orders.forEach((order, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${order.reference}</td>
      <td>
        <span class="badge ${STATUS_COLORS[order.status] || "bg-secondary"}">
          ${order.status}
        </span>
      </td>
      <td>
        <select class="form-select form-select-sm statusSelect" data-index="${index}">
          ${Object.keys(STATUS_COLORS)
            .map(
              s =>
                `<option ${order.status === s ? "selected" : ""}>${s}</option>`
            )
            .join("")}
        </select>
      </td>
    `;

    tbody.appendChild(tr);
  });

  document.querySelectorAll(".statusSelect").forEach(select => {
    select.addEventListener("change", function () {
      const idx = this.dataset.index;
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      orders[idx].status = this.value;
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders();
    });
  });
}

// ===== INIT =====
checkAdminAuth();
