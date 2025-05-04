function renderCart() {
  let orders =[];
cart = JSON.parse(localStorage.getItem('cart'));
fetch('../js/products.json')
.then(response => response.json())
.then(products => {
      let totalPrice = 0;
      let totalQuantity = 0;
  let checkoutHTML = ``;
    cart.forEach((cartItem) => {
      let matchingCartItem; 
      products.forEach((product) => {
        if (product.id === cartItem.productId) {
          matchingCartItem= product;
        }
      })
      totalPrice += cartItem.quantity * matchingCartItem.priceCents ;
      totalQuantity += cartItem.quantity;
      
    checkoutHTML += `<div class="cart-item-container
    js-cart-item-container">
                <div class="delivery-date">
                  Delivery date: Wednesday, June 15
                </div>
    
                <div class="cart-item-details-grid">
                  <img class="product-image"
                    src="../${matchingCartItem.image}">
    
                  <div class="cart-item-details">
                    <div class="product-name">
                      ${matchingCartItem.name}
                    </div>
                    <div class="product-price">
                      $${matchingCartItem.priceCents / 100}
                    </div>
                    <div class="product-quantity">
                      <span>
                        Quantity: <span class="quantity-label">${cartItem.quantity}</span>
                      </span>
                      <span class="update-quantity-link link-primary js-update-quantity-link" 
                      data-product-id="${matchingCartItem.id}">
                        Update
                      </span>
                      <span class="delete-quantity-link link-primary js-delete-quantity-link"
                      data-product-id="${matchingCartItem.id}">
                        Delete
                      </span>
                    </div>
                  </div>
                </div>
              </div>`;
    });
    document.querySelector('.order-summary').innerHTML = checkoutHTML;
 document.querySelectorAll('.js-delete-quantity-link')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const prodId = button.dataset.productId;
        cart.forEach((cartItem,index) => {
          if (cartItem.productId === prodId) {
            cart.splice(index, 1);
            console.log(cart);
            button.closest('.js-cart-item-container').remove();
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
          }
        });
      });
    });
    document.querySelectorAll('.js-update-quantity-link')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const prodId = button.dataset.productId;
        cart.forEach((cartItem) => {
          if (cartItem.productId === prodId) {
            const newQuantity = prompt('Enter new quantity:', cartItem.quantity);
            if (newQuantity !== null && newQuantity !== '') { 
              cartItem.quantity = Number(newQuantity);
              localStorage.setItem('cart', JSON.stringify(cart));
              renderCart();
            }
          }
        });
      });
      });



  const siteFees = Number((Math.random() * 9).toFixed(2));
  document.querySelector('.js-payment-summary').innerHTML=
  `       <div class="payment-summary-title">
            Order Summary
          </div>

          <div class="payment-summary-row">
            <div>Items (${totalQuantity}):</div>
            <div class="payment-summary-money">$${totalPrice/100}</div>
          </div>

          <div class="payment-summary-row">
            <div>Site fees:</div>
            <div class="payment-summary-money">$${siteFees}</div>
          </div>

          <div class="payment-summary-row subtotal-row">
            <div>Total before tax:</div>
            <div class="payment-summary-money">$${(totalPrice/100 + siteFees).toFixed(2)}</div>
          </div>

          <div class="payment-summary-row">
            <div>Estimated tax (14%):</div>
            <div class="payment-summary-money">$${((totalPrice/100 +siteFees) * 0.14).toFixed(2)}</div>
          </div>

          <div class="payment-summary-row total-row">
            <div>Order total:</div>
            <div class="payment-summary-money">$${((totalPrice/100 +siteFees) * 1.14).toFixed(2)}</div>
          </div>

          <button class="place-order-button button-primary js-place-order-button" >
            Place your order
          </button>
          <button class="place-order-button button-primary js-reset-cart-button" >
            Reset cart
          </button>
  `;
    document.querySelector('.js-place-order-button').addEventListener('click', () => {
      let orderId = Number(localStorage.getItem('orderId')) || 1;
      orders.push({
        orderId: orderId,
        cart: cart,
        totalPrice: ((totalPrice / 100 + siteFees) * 1.14).toFixed(2),
        orderDate: new Date().toLocaleDateString(),
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
      localStorage.setItem('orderId', orderId + 1);
      localStorage.setItem('orders', JSON.stringify(orders));
      window.location.href = 'orders.html';
    });
document.querySelector('.js-reset-cart-button').addEventListener('click', () => {
      localStorage.removeItem('cart');
      cart = [];
      document.querySelector('.order-summary').innerHTML = '';
      document.querySelector('.js-payment-summary').innerHTML = '';
      renderCart();
    });
    
}).catch(error => console.error('Error loading JSON:', error));
}
renderCart();