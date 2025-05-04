let categoriesHTML = ``;
fetch('../js/categories.json')
.then(response => response.json())
.then(categories => {
  categories.forEach((category) => {
    categoriesHTML += `<div class="category-container">
        <div class="category-image-container">
            <img class="category-image"
              src="${category.image}">
        </div>

        <div class="category-name">
          ${category.name}
        </div>

        <button class="go-to-categ-button button-primary js-go-to-categ-button" 
        data-category-id="${category.id}">
          Go to Category
        </button>
      </div>`
  });
  document.querySelector('.js-Category-grid').innerHTML = categoriesHTML;
document.querySelectorAll('.js-go-to-categ-button').forEach((button) => {
    button.addEventListener('click', () => {
      const categoryId = button.getAttribute('data-category-id');
      window.location.href = `items.html`;
    });
  })
  searchProducts(categories);
})
.catch(error => console.error('Error loading JSON:', error));