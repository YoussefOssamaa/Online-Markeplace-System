let productsHTML =``;
const urlParams = new URLSearchParams(window.location.search);
const catId = urlParams.get('cat_id');
let search_text = urlParams.get('search_text');
const base_url = 'http://127.0.0.1:5000/item/search';
let url = base_url;
const input = document.getElementById('searchInput');
const search_button = document.getElementById('searchButton');

// const results = document.getElementById('searchResults');

search_button.addEventListener('click', (e) => {
  search_text = input.value;
  fetch_products(search_text , -1)
  
});
async function fetch_products(search_text , catID) {
  
  if(catId != -1){
    url = base_url +'?category_id=' + catId;
  }
  if(search_text){
    url = base_url +'?search_text=' + search_text;
  }
  productsHTML = ``
  await fetch(url, {
    method: 'GET',
    credentials: "include", 
    headers: {
        'Content-Type': 'application/json'
    }})
    .then(response => response.json())
    .then(products => {
        products.products.forEach((product) => {
            let quantity_html = ``
            quantity_html += `<option selected value="1">1</option>`
            for(let i = 2 ; i <= product.stock ; i++){
              quantity_html += `<option value="${i}">${i}</option>`
            }
            productsHTML += `
              <div class="product-container">
                <div class="product-name limit-text-to-2-lines">
                    ${product.product_name}
                </div>
                <div class="seller-name">
                    Seller: ${product.seller_name}
                </div>
                <div class="product-price">
                  price $${product.price}
                </div>
                <div class="product-price">
                  ${product.category_name}
                </div>
                <div class="product-quantity-container 
                  js-product-quantity-container" product_id="${product.product_id}">
                    <select>
                      ${quantity_html}
                    </select>
                </div>
                <div class="product-spacer"></div>
                <button class="add-to-cart-button button-primary js-add-to-cart"
                product_id="${product.product_id}">
                  buy
                </button>
              </div>
            `
        })
        
        document.querySelector('.js-products-grid').innerHTML = productsHTML;
        document.querySelectorAll('.js-add-to-cart').forEach((button) => {
        button.addEventListener('click', () => {
          const productId = button.getAttribute('product_id');
          const selectElement = document.querySelector(`.js-product-quantity-container[product_id="${productId}"] select`);
          const quantity = Number(selectElement.value);
          purchase(productId , quantity)
        })
    })
    }).catch(error => console.error('Error loading JSON:', error));
}
async function purchase(product_id, quantity){
  fetch('http://127.0.0.1:5000/purchase', {
    method: 'POST',
    credentials: "include", 
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        "product_id" : product_id,
        "stock" : quantity
    }) 
  })
  .then(response => response.json()) 
  .then(data => {
      console.log(data);
      if(data.success) {
          // Store user data from the server response
          setTimeout(()=>{
            window.location.href = '../DashBoard/dashboard.html';
          },2000)
          alert(data.success)
          // Redirect to dashboard on successful login
      } else if(data.err) {  
        alert(data.err);
      }
  })
  .catch(error => {
    alert('An error occurred during purchase. Please try again.');
    console.error('Purchase error:', error);
  });
}
fetch('http://127.0.0.1:5000/dashboard', {
  method: 'GET',
  credentials: "include", 
  headers: {
      'Content-Type': 'application/json'
  }})
  .then(response => response.json())
  .then(data => {
  if (data.err) {
      console.log(data.log)          
      if(data.err == "unauthorized"){
          window.location.href = '../loginpage.html';
      }else{
        window.location.href = '../html/err_page.html';
      }      
  } else {
      console.log(data)
  }
})
.catch(error => {
    window.location.href = '../html/err_page.html';
});


fetch_products("" , catId)
// console.log(catId)

// fetch('/item/search?category_id=1')
// .then(response => response.json())
// .then(products => {
//   products.forEach((product) => {
//   productsHTML += `<div class="product-container">
//             <div class="product-image-container">
//               <img class="category-image"
//                 src="../${product.image}">
//             </div>
  
//             <div class="product-name limit-text-to-2-lines">
//               ${product.name}
//             </div>
  
//             <div class="product-rating-container">
//               <img class="product-rating-stars"
//                 src="../images/ratings/rating-${(product.rating.stars *10)}.png">
//               <div class="product-rating-count link-primary">
//               ${product.rating.count}
//               </div>
//             </div>
  
//             <div class="product-price">
//               $${product.priceCents /100}
//             </div>
  
//             <div class="product-quantity-container 
//             js-product-quantity-container" data-product-id="${product.id}">
//               <select>
//                 <option selected value="1">1</option>
//                 <option value="2">2</option>
//                 <option value="3">3</option>
//                 <option value="4">4</option>
//                 <option value="5">5</option>
//                 <option value="6">6</option>
//                 <option value="7">7</option>
//                 <option value="8">8</option>
//                 <option value="9">9</option>
//                 <option value="10">10</option>
//               </select>
//             </div>
  
//             <div class="product-spacer"></div>
  
//             <div class="added-to-cart js-added-to-cart" data-product-id="${product.id}">
//               <img src="../images/icons/checkmark.png">
//               Added
//             </div>
  
//             <button class="add-to-cart-button button-primary js-add-to-cart"
//             data-product-id="${product.id}">
//               Add to Cart
//             </button>
//           </div>`});
//           document.querySelector('.js-products-grid').innerHTML = productsHTML;
//           const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []; 
//           let cartQuantity = 0;

//             cart.forEach((item) => {
//               cartQuantity += item.quantity;
//             });
//             document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
// document.querySelectorAll('.js-add-to-cart')
//   .forEach((button) => {
//     button.addEventListener('click', () => {
//       const productId = button.dataset.productId;
//       const selectElement = document.querySelector(`.js-product-quantity-container[data-product-id="${productId}"] select`);
//       const quantity = Number(selectElement.value);
//       let matchingItem;

//       cart.forEach((item) => {
//         if (productId === item.productId) {
//           matchingItem = item;
//         }
//       });
//       if (matchingItem) {
//         matchingItem.quantity +=quantity;
        
//       } else {
//         cart.push({
//           productId: productId,
//           quantity: quantity
//         });
//       }
//       cartQuantity += quantity;
      
// localStorage.setItem('cart', JSON.stringify(cart));
//       document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
//         const addedToCart=document.querySelector(`.js-added-to-cart[data-product-id="${productId}"]`)
//         addedToCart.style.opacity = 1;
//         setTimeout(() => {
//           addedToCart.style.opacity = 0;
//         }, 3000);
//       });
//   });

// searchProducts(products);
// })
