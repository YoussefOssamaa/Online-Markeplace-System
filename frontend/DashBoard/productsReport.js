document.addEventListener("DOMContentLoaded", () => {
    const products = JSON.parse(localStorage.getItem("products")) || [];
  
    const soldItemsCount = products.length;
    const categoryCounts = {};
    const tableBody = document.querySelector("tbody");

    document.getElementById("totalSold").innerHTML = ' ' + products.length;
  
    // Count categories and populate table
    products.forEach(product => {
      // Count category
      const category = product.category || "Unknown";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  
      // Add product row to the table
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.userId || "N/A"}</td>
        <td>${product.productId || "N/A"}</td>
        <td>${category}</td>
        <td>${product.purchaseDate || "N/A"}</td>
      `;
      tableBody.appendChild(row);
    });
  
    // Update report statistics
    document.querySelector(".main-container").innerHTML = `
      <h2>Total Sold Items: ${soldItemsCount}</h2>
      <h2>Top Category: ${getTopCategory(categoryCounts)}</h2>
    `;
  
    function getTopCategory(counts) {
      let max = 0;
      let topCategory = "None";
      for (const [category, count] of Object.entries(counts)) {
        if (count > max) {
          max = count;
          topCategory = category;
        }
      }
      return topCategory;
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === "products") {
      location.reload(); // Reload the page when products are updated
    }
  });

  function fetchPayments(type) {
    return fetch(`http://127.0.0.1:5000/payment?type=${type}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => data.payments || []);
  }

  function fetchItems(type) {
    return fetch(`http://127.0.0.1:5000/item?type=${type}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => data.products || []);
  }

  window.showReport = async function(type) {
    let html = "";
    if (type === "deposit" || type === "withdraw") {
      const payments = await fetchPayments(type);
      html = `
        <table class="report-table">
          <thead><tr><th>Amount</th><th>Card Number</th><th>Date</th></tr></thead>
          <tbody>
            ${payments.map(r => `<tr><td>${r.amount}</td><td>${r.card_number}</td><td>${r.date}</td></tr>`).join("")}
          </tbody>
        </table>
      `;
    } else if (type === "purchase") {
      const items = await fetchItems("purchased");
      html = `
        <table class="report-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Purchased From</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(r => `
              <tr>
                <td>${r.product_name}</td>
                <td>${r.price}</td>
                <td>${r.stock || r.sold_quantity || r.total_quantity}</td>
                <td>${r.seller_name || ""}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else if (type === "sales") {
      const items = await fetchItems("sold");
      html = `
        <table class="report-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Sold To</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(r => `
              <tr>
                <td>${r.product_name}</td>
                <td>${r.price}</td>
                <td>${r.stock || r.sold_quantity || r.total_quantity}</td>
                <td>${r.order_date || r.date || ""}</td>
                <td>${r.buyer_name || ""}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }
    document.getElementById("report-content").innerHTML = html;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + type).classList.add('active');
  };

  document.addEventListener("DOMContentLoaded", () => {
    showReport('deposit');
  });
  