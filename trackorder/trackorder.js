document.getElementById('trackBtn').addEventListener('click', () => {
  const ref = document.getElementById('trackRef').value.trim();
  const orders = JSON.parse(localStorage.getItem('orders')) || [];

  const result = orders.find(o => o.reference === ref);

  const resultBox = document.getElementById('trackingResult');
  const statusEl = document.getElementById('trackingStatus');
  const dateEl = document.getElementById('trackingDate');
  const notFound = document.getElementById('notFound');

  if (!result) {
    resultBox.classList.add('d-none');
    notFound.classList.remove('d-none');
    return;
  }

  notFound.classList.add('d-none');
  resultBox.classList.remove('d-none');

  statusEl.textContent = result.status;

  // Status color
  const statusColors = {
    Pending: 'bg-warning text-dark',
    Confirmed: 'bg-info text-dark',
    Shipped: 'bg-primary',
    Delivered: 'bg-success'
  };

  statusEl.className = `badge ${statusColors[result.status] || 'bg-secondary'}`;

  const date = new Date(result.date);
  dateEl.textContent = `Order placed on ${date.toLocaleString()}`;
});
