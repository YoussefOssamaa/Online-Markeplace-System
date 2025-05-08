let items = [];
// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  
  const itemsContainer = document.getElementById("itemsList");
  check_login()
  fetch('http://127.0.0.1:5000/item', {
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
          // console.log(data.err)
          window.location.href = '../html/err_page.html';
        }      
    } else {
      items = data.products
      console.log(data.products)
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
          <h4>${item.product_name}</h4>
          <p>${item.description
          }</p>
          <p class="price">$${"price : " + item.price}</p>
          <p class="price">${"quantity : " + item.stock}</p>
        `;

        itemsContainer.appendChild(card);
      });
    }
  })
  .catch(error => {
      window.location.href = '../html/err_page.html';
  });
  // Get items from localStorage
  // Update items count
  
});


function check_login(){
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

      }
    })
    .catch(error => {
        window.location.href = '../html/err_page.html';
    });
}

// async function get_items(){
//   fetch('http://127.0.0.1:5000/item', {
//       method: 'GET',
//       credentials: "include", 
//       headers: {
//           'Content-Type': 'application/json'
//       }})
//       .then(response => response.json())
//       .then(data => {
//       if (data.err) {
//           console.log(data.log)          
//           if(data.err == "unauthorized"){
//               window.location.href = '../loginpage.html';
//           }else{
//             // console.log(data.err)
//             window.location.href = '../html/err_page.html';
//           }      
//       } else {
//         items = data.products
//         console.log(data.products)
//       }
//     })
//     .catch(error => {
//         window.location.href = '../html/err_page.html';
//     });
// }
// window.addEventListener("storage", (event) => {
//   if (event.key === "products") {
//     location.reload(); // Reload the page when products are updated
//   }
// });

// window.addEventListener("storage", (event) => {
//   if (event.key === "products") {
//     // Re-render product list since it was updated in another tab
//     const items = JSON.parse(event.newValue);
//     renderItems(items); // Your function to update the UI
//   }
// });

