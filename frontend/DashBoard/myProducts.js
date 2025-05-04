// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const itemsContainer = document.getElementById("itemsList");

  // Get items from localStorage
  const items = JSON.parse(localStorage.getItem("products")) || [];

  // Update items count
  document.getElementById("items-for-sale").innerHTML = ' ' + items.length;

  // If there are no items
  if (items.length === 0) {
    itemsContainer.innerHTML = `
          <p class="no-items-msg">No items found. Add some now!.</p>
    `;
    return;
  }

  // Render each item
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <h4>${item.name}</h4>
      <p>${item.desc}</p>
      <p class="price">$${item.price}</p>
    `;

    itemsContainer.appendChild(card);
  });
});

window.addEventListener("storage", (event) => {
  if (event.key === "products") {
    location.reload(); // Reload the page when products are updated
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === "products") {
    // Re-render product list since it was updated in another tab
    const items = JSON.parse(event.newValue);
    renderItems(items); // Your function to update the UI
  }
});

