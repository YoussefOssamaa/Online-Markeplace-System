let categoriesHTML = ``;
let categories = []
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
        window.location.href = '../html/err_page.html';      
    } else {
      categories = data.categories
      categories.forEach((category) => {
        categoriesHTML += `<div class="category-container">
    
            <div class="category-name" cat_id = ${category.category_id}>
              ${category.name}
            </div>

          </div>`
        document.querySelector('.js-Category-grid').innerHTML = categoriesHTML;
        document.querySelectorAll('.category-name').forEach((category) => {
          category.addEventListener('click', () => {
            const catId = category.getAttribute('cat_id')
            window.location.href = `items.html?cat_id=${catId}`;
          // window.location.href = `items.html`;
          });
        
  })
      })
    }
  })
    .catch(error => {
        window.location.href = '../html/err_page.html';
    });
