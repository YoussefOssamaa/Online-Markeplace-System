// Retrieve stored items or initialize an empty array
let items = JSON.parse(localStorage.getItem("products")) || [];

// Reference to the form and the item container
const itemForm = document.getElementById("itemForm");
const itemList = document.getElementById("itemList");

// Render all existing items on page load
items.forEach(item => renderItem(item));

// Handle form submission
itemForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form values
  const name = document.getElementById("itemName").value.trim();
  const desc = document.getElementById("description").value.trim();
  const priceInput = document.getElementById("price").value.trim();
  const price = parseFloat(priceInput).toFixed(2);

  if (!name || !desc || isNaN(price)) {
    alert("Please fill all fields correctly.");
    return;
  }

  // Create new item object
  const newItem = {
    name,
    desc,
    price
  };

  // Save to localStorage
  items.push(newItem);
  localStorage.setItem("products", JSON.stringify(items));

  // Add item to the page
  renderItem(newItem);

  // Clear the form
  itemForm.reset();
});


// Function to render an item card
function renderItem(item) {
  const card = document.createElement("div");
  card.className = "item-card";

  card.innerHTML = `
    <h4>${item.name}</h4>
    <p>${item.desc}</p>
    <p class='price'>$${item.price}</p>
    <button class='edit-btn'>Edit</button>
    <button class='remove-btn'>Remove</button>`;

  // Edit button functionality using window.open
  card.querySelector(".edit-btn").addEventListener("click", () => {
    const index = items.findIndex(i =>
      i.name === item.name &&
      i.desc === item.desc &&
      i.price === item.price
    );

    if (index !== -1) {
      window.open(`editItem.html?index=${index}`, "_blank");
    } else {
      alert("Item not found");
    }
  });

  // Remove button functionality
  card.querySelector(".remove-btn").addEventListener("click", () => {
    card.remove();
    items = items.filter(i => !(i.name === item.name && i.desc === item.desc && i.price === item.price));
    localStorage.setItem("products", JSON.stringify(items));
  });

  itemList.appendChild(card);
};

window.addEventListener("storage", (event) => {
  if (event.key === "products") {
    location.reload(); // Reload the page when products are updated
  }
});
