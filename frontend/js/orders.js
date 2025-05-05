const orders=JSON.parse(localStorage.getItem('orders')) || '[]';
console.log(orders);
fetch('../js/products.json')
.then(response => response.json())
.then(products => {
  let itemImage,itemName,itemId;
  let orederHTML = ``;
orders.forEach((order) => {
  const isAdmin = JSON.parse(localStorage.getItem('isAdmin')) || false;

  orederHTML += `<div class="order-container">
  <div class="order-header">
    <div class="order-header-left-section">
      <div class="order-date">
        <div class="order-header-label">Order Placed:</div>
        <div>${order.orderDate}</div>
      </div>
      <div class="order-total">
        <div class="order-header-label">Total:</div>
        <div>$${order.totalPrice}</div>
      </div>
      <div class="order-status">
        <button class="order-proceed-button button-primary" onclick="location.href='deposit_cash.html'">
            <img class="order-proceed-icon" src="../images/icons/money-hand.png">  
            <span>Proceed to pay</span>
        </button>
        <button class="order-proceed-button button-primary" 
          ${isAdmin ? `onclick="location.href='ordersSummary.html'"` : `onclick="alert('Admins Only')"`}>
            <img class="order-graph-icon" src="../images/icons/graph-icon.png">  
            <span>Orders Summary</span>
        </button>
      </div>
    </div>

    <div class="order-header-right-section">
      <div class="order-header-label">Order ID:</div>
      <div>${order.orderId}</div>
    </div>
  </div>`;
  order.cart.forEach((cartItem) => {
    products.forEach((product) => {
      if (product.id === cartItem.productId) {
        itemImage = product.image;
        itemName = product.name;
        itemId = product.id;
      }
    })
  orederHTML += `<div class="order-details-grid">
            <div class="product-image-container">
              <img src="../${itemImage}">
            </div>

            <div class="product-details">
              <div class="product-name">
                ${itemName}
              </div>
              <div class="product-delivery-date">
                Arriving on: ${order.deliveryDate}
              </div>
              <div class="product-quantity">
                Quantity: ${cartItem.quantity}
              </div>
            </div>

            <div class="product-actions">
            
                <button class="track-package-button button-secondary js-track-package-button"
                data-product-id="${itemId}">
                  Item details
                </button>
              
            </div>
          </div>`;
  })
  orederHTML += `</div>`;
})
  
  document.querySelector('.js-orders-grid').innerHTML = orederHTML;
  document.querySelectorAll('.js-track-package-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const itemId = button.dataset.productId;
      window.location.href = `itemDetails.html?id=${itemId}`;
    });
  });
  searchProducts(products);
}).catch(error => console.error('Error loading JSON:', error));
