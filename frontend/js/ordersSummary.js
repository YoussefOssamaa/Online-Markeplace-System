const ctx = document.getElementById('ordersChart').getContext('2d');
const ordersChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'This Year',
      data: [200, 400, 300, 450, 500, 470, 480],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 1)', 
      fill: false
    }, {
      label: 'Last Year',
      data: [300, 350, 320, 280, 250, 230, 200],
      borderColor: 'rgba(255, 159, 64, 1)', 
      backgroundColor: 'rgba(255, 159, 64, 1)', 
      fill: false
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: true }, 
      tooltip: { enabled: true }, 
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Months'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Orders'
        },
        beginAtZero: true
      }
    }
  }
});
const orders = JSON.parse(localStorage.getItem("orders")) || [];
const tableBody = document.getElementById("orders-table-body");
const loadMoreBtn = document.getElementById("load-more");

let displayIndex = 0;
const CHUNK_SIZE = 3; 

function loadOrdersChunk() {
  const chunk = orders.slice(displayIndex, displayIndex + CHUNK_SIZE);
  chunk.forEach(order => {
    const row = document.createElement("tr");
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    row.innerHTML = `
      <td>${order.orderId}</td>
      <td>$${order.totalPrice}</td>
      <td>${formatDate(order.orderDate)}</td>
      <td>${formatDate(order.deliveryDate)}</td>
    `;
    tableBody.appendChild(row);
  });

  displayIndex += CHUNK_SIZE;

  if (displayIndex >= orders.length) {
    loadMoreBtn.style.display = "none"; 
  }
}


loadOrdersChunk();

loadMoreBtn.addEventListener("click", loadOrdersChunk);