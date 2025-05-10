let items = [];
let purchased_items = [];
let sold_items = [];

document.addEventListener("DOMContentLoaded", () => {

    check_login();

    const itemsContainer = document.getElementById("itemsList");
    const sold_itemsContainer = document.getElementById("sold_items_list");
    const purchased_itemsContainer = document.getElementById("purchased_items_list");

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
                    <p class="no-items-msg">No items found. Add some now!.</p>
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
                    <div class="product-actions">
                        <button class="edit-btn" data-id="${item.product_id}">Edit</button>
                    </div>
                `;
                itemsContainer.appendChild(card);
                
                // Add event listener to the edit button
                const editBtn = card.querySelector('.edit-btn');
                editBtn.addEventListener('click', () => openEditModal(item));
            });
        }
    })
    .catch(error => {
        window.location.href = '../html/err_page.html';
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
        window.location.href = '../html/err_page.html';
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
        if (data.err) {
            console.log(data.log);
            if (data.err === "unauthorized") {
                window.location.href = '../loginpage.html';
            } else {
                // Display error instead of redirecting
                alert("Error: " + data.err);
                // window.location.href = '../html/err_page.html';
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
        console.error('Error:', error);
        
        // Check if it's a network-related error
        if (error.message === 'Failed to fetch') {
            alert("Network error: Unable to connect to the server. Please check your internet connection and verify the server is running.");
        } else {
            // Display the original error message
            alert("Error: " + error.message);
        }
        // Only redirect for non-network errors
        if (error.message !== 'Failed to fetch') {
            window.location.href = '../html/err_page.html';
        }
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

// Add these functions at the end of the file

// Function to open edit modal
function openEditModal(item) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'edit-modal-container';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'edit-modal-content';
    
    modalContent.innerHTML = `
        <h3>Edit Product</h3>
        <form id="editItemForm">
            <input type="hidden" id="productId" value="${item.product_id}">
            
            <label for="editName">Product Name:</label>
            <input type="text" id="editName" value="${item.product_name}" required>
            
            <label for="editDescription">Description:</label>
            <textarea id="editDescription" required>${item.description}</textarea>
            
            <label for="editPrice">Price ($):</label>
            <input type="number" id="editPrice" step="0.01" value="${item.price}" required>
            
            <label for="editStock">Quantity:</label>
            <input type="number" id="editStock" value="${item.stock}" required>
            
            <div class="modal-actions">
                <button type="submit" class="save-btn">Save Changes</button>
                <button type="button" class="cancel-btn">Cancel</button>
            </div>
        </form>
    `;
    
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    
    // Add event listener to the form
    const editForm = document.getElementById('editItemForm');
    editForm.addEventListener('submit', (e) => saveItemChanges(e));
    
    // Add event listener to the cancel button
    const cancelBtn = modalContent.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
}

// Function to save item changes
function saveItemChanges(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productName = document.getElementById('editName').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const price = parseFloat(document.getElementById('editPrice').value).toFixed(2);
    const stock = parseInt(document.getElementById('editStock').value);
    
    // Validate inputs
    if (!productName || !description || isNaN(parseFloat(price)) || isNaN(stock)) {
        alert("Please fill all fields correctly.");
        return;
    }
    
    // Create data object
    const updatedItem = {
        product_id: productId,
        product_name: productName,
        description: description,
        price: price,
        stock: stock
    };
    
    // Send update request
    fetch('http://127.0.0.1:5000/item/edit', {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedItem)
    })
    .then(response => {
        if (response.status === 402) {
            window.location.href = '../loginpage.html';
        }
        return response.json();
    })
    .then(data => {
        if (data.err) {
            alert("Error: " + data.err);
        } else {
            alert("Product updated successfully!");
            // Close the modal
            const modalContainer = document.querySelector('.edit-modal-container');
            if (modalContainer) {
                document.body.removeChild(modalContainer);
            }
            // Refresh the page to show updated items
            location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("An error occurred while updating the product.");
    });
}
