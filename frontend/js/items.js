let productsHTML =``;
fetch('../js/products.json')
.then(response => response.json())
.then(products => {
  products.forEach((product) => {
  productsHTML += `<div class="product-container">
            <div class="product-image-container">
              <img class="category-image"
                src="../${product.image}">
            </div>
  
            <div class="product-name limit-text-to-2-lines">
              ${product.name}
            </div>
  
            <div class="product-rating-container">
              <img class="product-rating-stars"
                src="../images/ratings/rating-${(product.rating.stars *10)}.png">
              <div class="product-rating-count link-primary">
              ${product.rating.count}
              </div>
            </div>
  
            <div class="product-price">
              $${product.priceCents /100}
            </div>
  
            <div class="product-quantity-container 
            js-product-quantity-container" data-product-id="${product.id}">
              <select>
                <option selected value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
  
            <div class="product-spacer"></div>
  
            <div class="added-to-cart js-added-to-cart" data-product-id="${product.id}">
              <img src="../images/icons/checkmark.png">
              Added
            </div>
  
            <button class="add-to-cart-button button-primary js-add-to-cart"
            data-product-id="${product.id}">
              Add to Cart
            </button>
          </div>`});
          document.querySelector('.js-products-grid').innerHTML = productsHTML;
          const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []; 
          let cartQuantity = 0;

            cart.forEach((item) => {
              cartQuantity += item.quantity;
            });
            document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
document.querySelectorAll('.js-add-to-cart')
  .forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const selectElement = document.querySelector(`.js-product-quantity-container[data-product-id="${productId}"] select`);
      const quantity = Number(selectElement.value);
      let matchingItem;

      cart.forEach((item) => {
        if (productId === item.productId) {
          matchingItem = item;
        }
      });
      if (matchingItem) {
        matchingItem.quantity +=quantity;
        
      } else {
        cart.push({
          productId: productId,
          quantity: quantity
        });
      }
      cartQuantity += quantity;
      
localStorage.setItem('cart', JSON.stringify(cart));
      document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
        const addedToCart=document.querySelector(`.js-added-to-cart[data-product-id="${productId}"]`)
        addedToCart.style.opacity = 1;
        setTimeout(() => {
          addedToCart.style.opacity = 0;
        }, 3000);
      });
  });

searchProducts(products);
})
.catch(error => console.error('Error loading JSON:', error));