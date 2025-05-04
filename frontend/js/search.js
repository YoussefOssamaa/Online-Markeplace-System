function searchProducts(products) {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    results.innerHTML = '';

    if (query === '') return;

    const matches = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.keywords.some(kw => kw.toLowerCase().includes(query))
    );

    matches.slice(0, 5).forEach(product => {
      const item = document.createElement('div');
      item.className = 'search-item';
      item.innerHTML = `
        <img src="../${product.image}" alt="${product.name}">
        <span>${product.name}</span>
      `;
      item.addEventListener('click', () => {
        window.location.href = `itemDetails.html?id=${product.id}`;
      });
      results.appendChild(item);
    });

    if (matches.length === 0) {
      results.innerHTML = '<div class="search-item">No products found</div>';
    }
  });

 
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.innerHTML = '';
    }
  });
}