fetch('../js/products.json')
.then(response => response.json())
.then(products => {

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const product = products.find(p => p.id === productId);
  const container = document.querySelector('.js-product-container');
  cart = JSON.parse(localStorage.getItem('cart')) || [];
  let cartQuantity=0 ;

  cart.forEach((item) => {
    cartQuantity += item.quantity;
  });
  document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
  function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let starsHtml = '★'.repeat(fullStars);
    if (halfStar) starsHtml += '½';
    starsHtml = starsHtml.padEnd(5, '☆');
    return `<div class="stars">${starsHtml} (${product.rating.count})</div>`;
  }

  if (!product) {
    container.innerHTML = '<p>Product not found.</p>';
  } else {
    container.innerHTML = `
      <div class="product-image">
        <img src="../${product.image}" alt="${product.name}" />
      </div>
      <div class="product-details">
        <h1>${product.name}</h1>
        ${renderStars(product.rating.stars)}
        <p class="status">In Stock</p>
        <div class="price">$${(product.priceCents / 100).toFixed(2)}</div>
        <div class="button-container">
          <button class="add-to-cart-btn button-primary">Add to Cart</button>
          <button class="purchase-btn button-secondary">Purchase Now</button>
        </div>
      </div>
    `;

    document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
      const existing = cart.find(item => item.productId === product.id);
      if (existing) {
        existing.quantity += 1;
        
      } else {
        cart.push({ productId: product.id, quantity: 1 });
      }
      cartQuantity += 1;
      document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));

    });
    
    // Add event listener for the Purchase button
    document.querySelector('.purchase-btn').addEventListener('click', () => {
      purchaseItem(product.id);
    });
  }
  searchProducts(products);
})
.catch(error => console.error('Error loading JSON:', error));

// Function to handle the purchase process
function purchaseItem(productId) {
  if (confirm('Are you sure you want to purchase this item?')) {
    fetch(`/purchase/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Purchase completed successfully!');
        // Redirect to orders page or refresh the current page
        window.location.href = '../html/orders.html';
      } else if (data.err) {
        alert(`Purchase failed: ${data.err}`);
      }
    })
    .catch(error => {
      console.error('Error during purchase:', error);
      alert('An error occurred during the purchase. Please try again.');
    });
  }
}