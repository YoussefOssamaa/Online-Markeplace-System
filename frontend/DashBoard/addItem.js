// Retrieve stored items or initialize an empty array
check_login()
let categories = []
const category_Select = document.getElementById("category_Select"); 
fetch('http://127.0.0.1:5000/category', {
  method: 'GET',
  credentials: "include", 
  headers: {
      'Content-Type': 'application/json'
  }})
  .then(response => response.json())
  .then(data => {
  if (data.err) {
      console.log(data.err)          
      if(data.err == "unauthorized"){
          window.location.href = '../loginpage.html';
      }else{
        window.location.href = '../html/err_page.html';
      }      
  } else {
    categories = data.categories
    console.log(categories)
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.category_id;
      option.textContent = category.name;
      category_Select.appendChild(option);
    });
  }
})
.catch(error => {
    // console.log("a7ten");
    window.location.href = '../html/err_page.html';
});

// Handle form submission
itemForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  
  // Get form values
  const name = document.getElementById("itemName").value.trim();
  const desc = document.getElementById("description").value.trim();
  const priceInput = document.getElementById("price").value.trim();
  const Stock = document.getElementById("Stock").value.trim();
  const SKW = document.getElementById("SKW").value.trim();
  const price = parseFloat(priceInput).toFixed(2);
  const selectedValue = category_Select.value;
  
  // Fixed validation logic - checking each field properly
  if (!name || !desc || isNaN(parseFloat(priceInput)) || isNaN(parseFloat(Stock)) || !SKW || !selectedValue) {
    alert("Please fill all fields correctly.");
    return;
  }
  
  // Create new item object
  const newItem =  {
        "product_name" : name,
        "category_id": selectedValue,
        "SKU":  SKW,
        "description" :desc,
        "price": price, 
        "stock" : Stock
    }
    fetch('http://127.0.0.1:5000/item/add', {
      method: 'POST', 
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newItem)  
    })
    .then(response => {
      if (response.status === 402) {
        window.location.href = '../loginpage.html';
      }
      return response.json();  
  }) 
    .then(data => {
      if(data.err){
        console.log(data.err)
      } else {
        alert("Your product was added successfully")
        setTimeout(()=>{
          window.location.href = '../DashBoard/myProducts.html'; // Redirect to products page instead
        },2000)
      }
      console.log('Success:', data); 
    })
 
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

async function get_categories() {
  fetch('http://127.0.0.1:5000/category', {
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
      
    }
  })
  .catch(error => {
      window.location.href = '../html/err_page.html';
  });
}

// Function to render an item card
// function renderItem(item) {
//   const card = document.createElement("div");
//   card.className = "item-card";

//   card.innerHTML = `
//     <h4>${item.name}</h4>
//     <p>${item.desc}</p>
//     <p class='price'>$${item.price}</p>
//     <button class='edit-btn'>Edit</button>
//     <button class='remove-btn'>Remove</button>`;

//   // Edit button functionality using window.open
//   card.querySelector(".edit-btn").addEventListener("click", () => {
//     const index = items.findIndex(i =>
//       i.name === item.name &&
//       i.desc === item.desc &&
//       i.price === item.price
//     );

//     if (index !== -1) {
//       window.open(`editItem.html?index=${index}`, "_blank");
//     } else {
//       alert("Item not found");
//     }
//   });

//   // Remove button functionality
//   card.querySelector(".remove-btn").addEventListener("click", () => {
//     card.remove();
//     items = items.filter(i => !(i.name === item.name && i.desc === item.desc && i.price === item.price));
//     localStorage.setItem("products", JSON.stringify(items));
//   });

//   itemList.appendChild(card);
// };

// window.addEventListener("storage", (event) => {
//   if (event.key === "products") {
//     location.reload(); // Reload the page when products are updated
//   }
// });
