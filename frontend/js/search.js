
  const input = document.getElementById('searchInput');
  const search_button = document.getElementById('searchButton');
  // const results = document.getElementById('searchResults');

  search_button.addEventListener('click', (e) => {
    // console.log(input.value)
    window.location.href = `items.html?search_text=${input.value}`;
    
  });

