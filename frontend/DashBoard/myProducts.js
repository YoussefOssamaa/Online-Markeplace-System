let items = [];
let purchased_items = [];
let sold_items = [];

document.addEventListener("DOMContentLoaded", () => {
    check_login();

    const itemsContainer = document.getElementById("itemsList");
    const sold_itemsContainer = document.getElementById("sold_items_list");
    const purchased_itemsContainer = document.getElementById("purchased_items_list");
    
    // Get loading indicator elements
    const itemsLoading = document.getElementById("itemsLoading");
    const purchasedItemsLoading = document.getElementById("purchased_items_loading");
    const soldItemsLoading = document.getElementById("sold_items_loading");

    // Fetch all items
    fetch('http://127.0.0.1:5000/item', {
        method: 'GET',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading indicator
        if (itemsLoading) itemsLoading.style.display = 'none';
        
        if (data.err) {
            console.log(data.log);
            if (data.err === "unauthorized") {
                window.location.href = '../loginpage.html';
            } else {
                window.location.href = '../html/err_page.html';
            }
        } else {
            items = data.products;
            console.log("Items fetched:", items);
            document.getElementById("items-for-sale").innerHTML = ' ' + items.length;

            if (items.length === 0) {
                itemsContainer.innerHTML = `
                    <p class="no-items-msg">No items found. Add some now!</p>
                `;
                return;
            }

            items.forEach(item => {
                const card = document.createElement("div");
                card.className = "product-card";
                card.innerHTML = `
                    <h4>${item.product_name}</h4>
                    <p>${item.description}</p>
                    <p class="price">Price: $${item.price}</p>
                    <p class="price">Quantity: ${item.stock}</p>
                `;
                itemsContainer.appendChild(card);
            });
        }
    })
    .catch(error => {
        if (itemsLoading) itemsLoading.style.display = 'none';
        itemsContainer.innerHTML = `<p class="no-items-msg">Error loading items. Please try again.</p>`;
        console.error("Error fetching items:", error);
    });

    // Fetch sold items
    fetch('http://127.0.0.1:5000/item?type=sold', {
        method: 'GET',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading indicator
        if (soldItemsLoading) soldItemsLoading.style.display = 'none';
        
        if (data.err) {
            console.log(data.log);
            if (data.err === "unauthorized") {
                window.location.href = '../loginpage.html';
            } else {
                window.location.href = '../html/err_page.html';
            }
        } else {
            sold_items = data.products;

            if (sold_items.length === 0) {
                sold_itemsContainer.innerHTML = `
                    <p class="no-items-msg">No sold items found.</p>
                `;
                return;
            }

            sold_items.forEach(item => {
                const card = document.createElement("div");
                card.className = "product-card";
                card.innerHTML = `
                    <h4>${item.product_name}</h4>
                    <p>${item.description}</p>
                    <p class="price">Price: $${item.price}</p>
                    <p class="price">Quantity: ${item.stock}</p>
                `;
                sold_itemsContainer.appendChild(card);
            });
        }
    })
    .catch(error => {
        if (soldItemsLoading) soldItemsLoading.style.display = 'none';
        sold_itemsContainer.innerHTML = `<p class="no-items-msg">Error loading sold items. Please try again.</p>`;
        console.error("Error fetching sold items:", error);
    });

    // Fetch purchased items
    fetch('http://127.0.0.1:5000/item?type=purchased', {
        method: 'GET',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading indicator
        if (purchasedItemsLoading) purchasedItemsLoading.style.display = 'none';
        
        if (data.err) {
            if (data.err === "unauthorized") {
                window.location.href = '../loginpage.html';
            } else {
                window.location.href = '../html/err_page.html';
            }
        } else {
            purchased_items = data.products;

            if (purchased_items.length === 0) {
                purchased_itemsContainer.innerHTML = `
                    <p class="no-items-msg">No purchased items found.</p>
                `;
                return;
            }

            purchased_items.forEach(item => {
                const card = document.createElement("div");
                card.className = "product-card";
                card.innerHTML = `
                    <h4>${item.product_name}</h4>
                    <p>${item.description}</p>
                    <p class="price">Price: $${item.price}</p>
                    <p class="price">Quantity: ${item.stock}</p>
                `;
                purchased_itemsContainer.appendChild(card);
            });
        }
    })
    .catch(error => {
        if (purchasedItemsLoading) purchasedItemsLoading.style.display = 'none';
        purchased_itemsContainer.innerHTML = `<p class="no-items-msg">Error loading purchased items. Please try again.</p>`;
        console.error("Error fetching purchased items:", error);
    });
});

function check_login() {
    fetch('http://127.0.0.1:5000/dashboard', {
        method: 'GET',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.err) {
            console.log(data.log);
            if (data.err === "unauthorized") {
                window.location.href = '../loginpage.html';
            } else {
                window.location.href = '../html/err_page.html';
            }
        }
    })
    .catch(error => {
        window.location.href = '../html/err_page.html';
    });
}
