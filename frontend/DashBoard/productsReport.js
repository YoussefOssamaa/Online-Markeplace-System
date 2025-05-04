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
  