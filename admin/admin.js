let ordersChart = null;
let revenueChart = null;
// ================= ADMIN CREDENTIALS =================
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// ================= AUTO DELETE CANCELLED ORDERS =================
function purgeCancelledOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const activeOrders = orders.filter(order => order.status !== "Cancelled");

  if (activeOrders.length !== orders.length) {
    localStorage.setItem("orders", JSON.stringify(activeOrders));
  }

  return activeOrders;
}

// ================= ELEMENTS =================
const loginBox = document.getElementById("adminLoginBox");
const ordersBox = document.getElementById("adminOrdersBox");
const loginBtn = document.getElementById("adminLoginBtn");
const logoutBtn = document.getElementById("adminLogoutBtn");
const loginMsg = document.getElementById("loginMsg");

// ================= STATUS COLORS =================
const STATUS_COLORS = {
  Pending: "bg-warning text-dark",
  Confirmed: "bg-info text-dark",
  Shipped: "bg-primary",
  Delivered: "bg-success"
};

// ================= AUTH CHECK =================
function checkAdminAuth() {
  const loggedIn = localStorage.getItem("adminLoggedIn") === "true";
  loginBox.classList.toggle("d-none", loggedIn);
  ordersBox.classList.toggle("d-none", !loggedIn);

  if (loggedIn) {
  loadOrders();
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  renderCharts(orders);
}
}

// ================= LOGIN =================
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

// ================= LOGOUT =================
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("adminLoggedIn");
  checkAdminAuth();
});

// ================= LOAD ORDERS =================
function loadOrders() {
  const orders = purgeCancelledOrders();
  const tbody = document.getElementById("orderTableBody");
  tbody.innerHTML = "";

  updateAnalytics(orders);
  renderCharts(orders);
  renderOrdersPerDayTable(orders);



  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3">No orders found</td></tr>`;
    return;
  }

orders.forEach((order, index) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `...`;
    tbody.appendChild(tr);

  const formattedDate = order.date
    ? new Date(order.date).toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

  tr.innerHTML = `
  <td class="fw-bold">${order.reference}</td>
  <td>${order.user || "Guest"}</td>
  <td>${formattedDate}</td>
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
            `<option value="${s}" ${
              order.status === s ? "selected" : ""
            }>${s}</option>`
        )
        .join("")}
    </select>
  </td>
`;



    tbody.appendChild(tr);
  });

  // Status change
  document.querySelectorAll(".statusSelect").forEach(select => {
    select.addEventListener("change", function () {
      const idx = this.dataset.index;
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      orders[idx].status = this.value;
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders();
      renderCharts(orders);

      

      


    });
  });
}

// ================= INIT =================
checkAdminAuth();

function updateAnalytics(orders) {
  const totalOrdersEl = document.getElementById("totalOrders");
  const totalRevenueEl = document.getElementById("totalRevenue");
  const todayOrdersEl = document.getElementById("todayOrders");
  const pendingOrdersEl = document.getElementById("pendingOrders");
  const completedOrdersEl = document.getElementById("completedOrders");

  if (!totalOrdersEl) return;

  const today = new Date().toDateString();

  let revenue = 0;
  let todayCount = 0;
  let pendingCount = 0;
  let completedCount = 0;

  orders.forEach(order => {
    // Revenue
    if (order.items) {
      order.items.forEach(item => {
        revenue += item.price * item.qty;
      });
    }

    // Today's orders
    if (new Date(order.date).toDateString() === today) {
      todayCount++;
    }

    // Pending
    if (order.status === "Pending") pendingCount++;

    // Completed (Delivered)
    if (order.status === "Delivered") completedCount++;
  });

  totalOrdersEl.textContent = orders.length;
  totalRevenueEl.textContent = revenue.toLocaleString("en-PH");
  todayOrdersEl.textContent = todayCount;
  pendingOrdersEl.textContent = pendingCount;
  completedOrdersEl.textContent = completedCount;
}


function buildDailyStats(orders) {
  const dailyOrders = {};
  const dailyRevenue = {};

  orders.forEach(order => {
    if (!order.date) return;

    const key = new Date(order.date).toLocaleDateString("en-PH");

    dailyOrders[key] = (dailyOrders[key] || 0) + 1;

    if (order.items) {
      order.items.forEach(item => {
        dailyRevenue[key] =
          (dailyRevenue[key] || 0) + item.price * item.qty;
      });
    }
  });

  return { dailyOrders, dailyRevenue };
}
 function renderCharts(orders) {
  const ordersCanvas = document.getElementById("ordersChart");
  const revenueCanvas = document.getElementById("revenueChart");

  if (!ordersCanvas || !revenueCanvas) return;

  const { dailyOrders, dailyRevenue } = buildDailyStats(orders);
  const labels = Object.keys(dailyOrders);

  // Destroy old charts
  if (ordersChart) ordersChart.destroy();
  if (revenueChart) revenueChart.destroy();

  // Orders Chart
  ordersChart = new Chart(ordersCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Orders",
        data: labels.map(l => dailyOrders[l]),
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  // Revenue Chart
  revenueChart = new Chart(revenueCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue (₱)",
        data: labels.map(l => dailyRevenue[l] || 0),
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}




window.addEventListener("storage", e => {
  if (e.key === "orders") {
    loadOrders();
  }
});


function renderOrdersPerDayTable(orders) {
  const tbody = document.getElementById("ordersPerDayBody");
  if (!tbody) return;

  const daily = {};

  orders.forEach(order => {
    if (!order.date) return;
    const key = new Date(order.date).toLocaleDateString("en-PH");

    if (!daily[key]) {
      daily[key] = { count: 0, revenue: 0 };
    }

    daily[key].count++;

    if (order.items) {
      order.items.forEach(item => {
        daily[key].revenue += item.price * item.qty;
      });
    }
  });

  tbody.innerHTML = "";

  Object.keys(daily).forEach(date => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${date}</td>
      <td>${daily[date].count}</td>
      <td>₱${daily[date].revenue.toLocaleString("en-PH")}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportOrdersCSV(orders) {
  let csv = "Order Ref,Customer,Date,Status,Items,Total\n";

  orders.forEach(order => {
    let items = "";
    let total = 0;

    if (order.items) {
      order.items.forEach(i => {
        items += `${i.name} x${i.qty} | `;
        total += i.price * i.qty;
      });
    }

    csv += `"${order.reference}","${order.user || "Guest"}","${new Date(order.date).toLocaleString()}","${order.status}","${items.trim()}","${total}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "orders.csv";
  link.click();
}

function exportOrdersExcel() {
  exportOrdersCSV(JSON.parse(localStorage.getItem("orders")) || []);
}
 
document.getElementById("exportCSV")?.addEventListener("click", () => {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  exportOrdersCSV(orders);
});

document.getElementById("exportExcel")?.addEventListener("click", () => {
  exportOrdersExcel();
});
